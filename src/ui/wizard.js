import { discoverInstallations, discoverRepos, discoverReadme, fetchReadme } from '../github/fetch.js';

export async function openWizard() {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    const box = document.createElement('div');
    box.className = 'box';
    modal.appendChild(box);
    document.body.appendChild(modal);

    let installation_id = '';
    let owner = '';
    let repo = '';
    let ref = 'main';
    let readme_path = 'README.md';

    async function step1() {
      box.innerHTML = `
        <div class="progress">1/3</div>
        <h3>Instalação</h3>
        <select id="wiz-inst"></select>
        <div class="actions"><button class="btn" id="next1">Próximo</button></div>`;
      const inst = await discoverInstallations();
      const sel = box.querySelector('#wiz-inst');
      sel.innerHTML = inst.items.map(i => `<option value="${i.installation_id}">${i.account_login}</option>`).join('');
      box.querySelector('#next1').onclick = () => {
        installation_id = sel.value;
        step2();
      };
    }

    async function step2() {
      box.innerHTML = `
        <div class="progress">2/3</div>
        <h3>Repositório</h3>
        <input type="text" id="wiz-search" placeholder="Buscar..." />
        <ul id="wiz-repos" class="repo-list"></ul>`;
      const data = await discoverRepos(installation_id);
      const repos = data.items || [];
      const listEl = box.querySelector('#wiz-repos');
      function render(list) {
        listEl.innerHTML = list.map(r => `<li data-full="${r.owner}/${r.repo}">${r.full_name}</li>`).join('');
      }
      render(repos);
      box.querySelector('#wiz-search').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        render(repos.filter(r => r.full_name.toLowerCase().includes(q)));
      });
      listEl.onclick = e => {
        const li = e.target.closest('li');
        if (!li) return;
        [owner, repo] = li.dataset.full.split('/');
        step3();
      };
    }

    async function step3() {
      const info = await discoverReadme(installation_id, owner, repo);
      ref = info.ref || 'main';
      readme_path = info.readme_path || 'README.md';
      box.innerHTML = `
        <div class="progress">3/3</div>
        <h3>Ajustes</h3>
        <label>branch <input id="wiz-ref" type="text" value="${ref}" /></label>
        <label>README <input id="wiz-path" type="text" value="${readme_path}" /></label>
        <div class="actions"><button class="btn" id="finish">Concluir</button></div>`;
      box.querySelector('#finish').onclick = async () => {
        ref = box.querySelector('#wiz-ref').value.trim() || ref;
        readme_path = box.querySelector('#wiz-path').value.trim() || readme_path;
        const readme = await fetchReadme({ owner, repo, branch: ref, path: readme_path });
        modal.remove();
        resolve({ installation_id, owner, repo, ref, readme_path, readme });
      };
    }

    step1();
  });
}
