import { $ } from '../utils/dom.js';
import { openWizard } from './wizard.js';
import { analisarRepo, proporPR } from '../github/fetch.js';
import { mdToHtml } from '../render/markdown.js';
import { state, setAnalysis, setPR } from '../state/store.js';
import DiffMatchPatch from 'https://esm.sh/diff-match-patch';

export async function handleWizard(
  mdEl: HTMLTextAreaElement,
  update: () => void,
  setStep: (n: number) => void,
  btnPreview: HTMLButtonElement | null,
  toast: (msg: string, type?: string) => void
): Promise<void> {
  try {
    const res = await openWizard();
    if (!res) return;
    const { installation_id, owner, repo, ref, readme_path, readme, base_sha } = res;
    Object.assign(state.inputs, { installation_id, owner, repo, ref, readme_path, base_sha });
    state.original_readme = readme;
    mdEl.value = readme;
    update();
    setStep(2);
    if (btnPreview) btnPreview.disabled = true;
    toast('README carregado ✅', 'ok');
  } catch (err: any) {
    console.error(err);
    const msg = err?.message === 'NETWORK_FAILURE' ? 'Falha de rede ao carregar README' : 'Falha ao carregar README';
    toast(msg, 'warn');
  }
}

export async function analyzeRepository(
  btnAnalisar: HTMLButtonElement,
  btnPreview: HTMLButtonElement | null,
  mdEl: HTMLTextAreaElement,
  toast: (msg: string, type?: string) => void
): Promise<boolean> {
  try {
    const { installation_id, owner, repo, ref, readme_path } = state.inputs;
    if (!installation_id || !owner || !repo) {
      toast('Selecione um repositório primeiro.', 'warn');
      return false;
    }
    btnAnalisar.disabled = true;
    const data = await analisarRepo({ installation_id: Number(installation_id), owner, repo, ref, readme_path });
    setAnalysis(data);
    if (data?.base_sha) state.inputs.base_sha = data.base_sha;

    $('#findings').textContent = JSON.stringify(
      {
        headings: data.findings?.headings,
        toc: data.findings?.toc,
        relative_paths: data.findings?.relative_paths || null,
        issues: (data.findings?.issues || []).slice(0, 10)
      },
      null,
      2
    );

    const preview = data.preview?.new_content_utf8 || '';
    $('#preview-after').innerHTML = mdToHtml(preview);
    toast('Análise concluída ✅', 'ok');
    if (btnPreview) btnPreview.disabled = false;
    return true;
  } catch (e: any) {
    console.error(e);
    if (e.message === 'NETWORK_FAILURE') toast('Falha de rede durante a análise', 'err');
    else toast('Falha na análise: ' + e.message, 'err');
    return false;
  } finally {
    btnAnalisar.disabled = false;
  }
}

export function previewDiff(
  diffView: HTMLElement | null,
  mdEl: HTMLTextAreaElement,
  setStep: (n: number) => void
): void {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(state.original_readme || '', mdEl.value);
  dmp.diff_cleanupSemantic(diff);
  if (diffView) diffView.innerHTML = dmp.diff_prettyHtml(diff);
  setStep(3);
}

export async function confirmPR(
  btnPrConfirm: HTMLButtonElement,
  mdEl: HTMLTextAreaElement,
  setStep: (n: number) => void,
  toast: (msg: string, type?: string) => void
): Promise<void> {
  try {
    const { installation_id, owner, repo, ref, readme_path, message, base_sha } = state.inputs;
    if (!base_sha) {
      toast('Carregue um README primeiro.', 'warn');
      return;
    }
    btnPrConfirm.disabled = true;
    const head = `readme-studio/update-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    const pr = await proporPR({
      installation_id: Number(installation_id),
      owner,
      repo,
      base: ref || 'main',
      head,
      readme_path,
      message,
      base_sha,
      new_content_utf8: mdEl.value
    });
    setPR(pr);
    const link = $('#pr-link');
    link.href = pr.pr_url;
    link.textContent = 'Abrir PR';
    link.target = '_blank';
    toast('PR criado como draft 🚀', 'ok');
  } catch (e: any) {
    console.error(e);
    if (e.message === 'NETWORK_FAILURE') toast('Falha de rede ao criar PR', 'err');
    else toast('Falha ao criar PR: ' + e.message, 'err');
  } finally {
    btnPrConfirm.disabled = false;
    setStep(2);
  }
}
