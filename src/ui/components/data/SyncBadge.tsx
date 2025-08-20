"use client";

export default function SyncBadge({
  state,
}: {
  state: "idle" | "saving" | "error";
}) {
  const label =
    state === "saving" ? "Salvando…" : state === "error" ? "Erro" : "Sincronizado";
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-subtle">
      {label}
    </span>
  );
}
