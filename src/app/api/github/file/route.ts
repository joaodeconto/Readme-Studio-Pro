// src/app/api/github/file/route.ts
// Corrige erro de tipo no Next.js build: a resposta de
// GET /repos/{owner}/{repo}/contents/{path} é um *union*.
// Pode ser Array (diretório) **ou** objeto (file/symlink/submodule).
// Precisamos *estreitar* (narrow) antes de acessar `content`.

import { NextResponse } from "next/server";
import { githubApp } from "@/lib/github/app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const path = searchParams.get("path");
  const ref = searchParams.get("ref") || undefined; // opcional (branch/sha)

  if (!owner || !repo || !path) {
    return NextResponse.json(
      { error: "Missing owner|repo|path" },
      { status: 400 }
    );
  }

  const installationId = await findInstallationIdForRepo(owner, repo);
  const octokit = await githubApp.getInstallationOctokit(installationId);

  try {
    // ⚠️ Não use mediaType raw aqui; precisamos da estrutura com `type`
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path, ref }
    );

    // 1) Diretório → retorna Array
    if (Array.isArray(data)) {
      return NextResponse.json({
        type: "dir",
        entries: data.map((e: any) => ({
          name: e.name,
          path: e.path,
          type: e.type,
          size: e.size,
          sha: e.sha,
          download_url: e.download_url ?? null,
        })),
      });
    }

    // 2) Objeto: file/symlink/submodule
    const node: any = data;
    if (node.type === "file") {
      // `content` (base64) só existe em *file*
      return NextResponse.json({
        type: "file",
        path: node.path,
        sha: node.sha,
        size: node.size,
        encoding: node.encoding ?? "base64",
        content: node.content ?? null, // mantenha base64 no wire; decode do lado do cliente
      });
    }

    if (node.type === "symlink") {
      return NextResponse.json({
        type: "symlink",
        path: node.path,
        target: node.target ?? null,
        sha: node.sha,
        size: node.size,
      });
    }

    if (node.type === "submodule") {
      return NextResponse.json({
        type: "submodule",
        path: node.path,
        submodule_git_url: node.submodule_git_url ?? null,
        sha: node.sha,
      });
    }

    return NextResponse.json(
      { error: `Unsupported content type: ${String(node.type)}` },
      { status: 400 }
    );
  } catch (e: any) {
    const status = e.status ?? 500;
    const message = e?.response?.data?.message || e.message || "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}

// TODO: implemente lookup real via DB/webhook `installation.created`.
async function findInstallationIdForRepo(owner: string, repo: string): Promise<number> {
  throw new Error("findInstallationIdForRepo not implemented");
}
