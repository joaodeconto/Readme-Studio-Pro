import { discoverInstallations, discoverRepos, discoverReadme, fetchReadme } from '../github/fetch.js';
import { startAuthFlow } from '../github/auth.js';

interface Installation { installation_id: number; account_login?: string }
interface RepoItem { owner: string; repo: string; full_name: string }
interface InstallationsData { items: Installation[] }
interface ReposData { items: RepoItem[] }
interface ReadmeInfo { ref?: string; readme_path?: string }
interface ReadmeData { text: string; sha: string | null }

export interface WizardResult {
  installation_id: string;
  owner: string;
  repo: string;
  ref: string;
  readme_path: string;
  readme: string;
  base_sha: string | null;
}

export async function openWizard(): Promise<WizardResult | null> {
  await startAuthFlow();
  return new Promise<WizardResult | null>((resolve) => {
    const modal = document.createElement('div') as HTMLDivElement;
    modal.className = 'modal';
    const box = document.createElement('div') as HTMLDivElement;
    box.className = 'box';
    modal.appendChild(box);
    document.body.appendChild(modal);

    let installation_id = '';
    let owner = '';
    let repo = '';
    let ref = 'main';
    let readme_path = 'README.md';

    function showError(msg: string, retryFn: () => void): void {
      box.innerHTML = `<p>${msg}</p><div class="actions"><button class="btn" id="retry">Tentar novamente</button></div>`;
      (box.querySelector('#retry') as HTMLButtonElement).onclick = retryFn;
    }

    async function step1(): Promise<void> {
      box.innerHTML = `
        <div class="progress">1/3</div>
        <h3>Instalação</h3>
        <select id="wiz-inst"></select>
        <div class="actions"><button class="btn" id="next1">Próximo</button></div>`;
      try {
        const inst: InstallationsData = await discoverInstallations();
        const sel = box.querySelector<HTMLSelectElement>('#wiz-inst')!;
        sel.innerHTML = inst.items.map(i => `<option value="${i.installation_id}">${i.account_login}</option>`).join('');
        (box.querySelector('#next1') as HTMLButtonElement).onclick = () => {
          installation_id = sel.value;
          step2();
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert(
          msg === 'NETWORK_FAILURE'
            ? 'Falha de rede ao listar instalações.'
            : 'Erro: ' + msg,
        );
        modal.remove();
        resolve(null);
        showError('Não foi possível carregar instalações', step1);
      }
    }

    async function step2(): Promise<void> {
      box.innerHTML = `
        <div class="progress">2/3</div>
        <h3>Repositório</h3>
        <input type="text" id="wiz-search" placeholder="Buscar..." />
        <ul id="wiz-repos" class="repo-list"></ul>`;
      try {
        const data: ReposData = await discoverRepos(Number(installation_id));
        const repos: RepoItem[] = data.items || [];
        const listEl = box.querySelector<HTMLUListElement>('#wiz-repos')!;
        function render(list: RepoItem[]): void {
          listEl.innerHTML = list.map(r => `<li data-full="${r.owner}/${r.repo}">${r.full_name}</li>`).join('');
        }
        render(repos);
        box.querySelector<HTMLInputElement>('#wiz-search')!.addEventListener('input', e => {
          const target = e.target as HTMLInputElement;
          const q = target.value.toLowerCase();
          render(repos.filter(r => r.full_name.toLowerCase().includes(q)));
        });
        listEl.onclick = e => {
          const li = (e.target as HTMLElement).closest('li');
          if (!li) return;
          [owner, repo] = (li as HTMLLIElement).dataset.full!.split('/');
          step3();
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert(
          msg === 'NETWORK_FAILURE'
            ? 'Falha de rede ao listar repositórios.'
            : 'Erro: ' + msg,
        );
        modal.remove();
        resolve(null);
        showError('Não foi possível carregar repositórios', step2);
      }
    }

    async function step3(): Promise<void> {
      let info: ReadmeInfo;
      try {
        info = await discoverReadme(Number(installation_id), owner, repo);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert(
          msg === 'NETWORK_FAILURE'
            ? 'Falha de rede ao obter README.'
            : 'Erro: ' + msg,
        );
        modal.remove();
        resolve(null);
        return;
      }
      ref = info.ref || 'main';
      readme_path = info.readme_path || 'README.md';
      box.innerHTML = `
        <div class="progress">3/3</div>
        <h3>Ajustes</h3>
        <label>branch <input id="wiz-ref" type="text" value="${ref}" /></label>
        <label>README <input id="wiz-path" type="text" value="${readme_path}" /></label>
        <div class="actions"><button class="btn" id="finish">Concluir</button></div>`;
      (box.querySelector('#finish') as HTMLButtonElement).onclick = async () => {
        ref = (box.querySelector('#wiz-ref') as HTMLInputElement).value.trim() || ref;
        readme_path = (box.querySelector('#wiz-path') as HTMLInputElement).value.trim() || readme_path;
        try {
          const { text: readme, sha }: ReadmeData = await fetchReadme({ owner, repo, branch: ref, path: readme_path });
          modal.remove();
          resolve({ installation_id, owner, repo, ref, readme_path, readme, base_sha: sha });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          alert(
            msg === 'NETWORK_FAILURE'
              ? 'Falha de rede ao baixar README.'
              : 'Erro: ' + msg,
          );
          showError('Não foi possível carregar README', step3);
        }
      };
    }
    step1();
  });
}
