/* ==========================================================
   APP — bootstrap, shell, routes
   ========================================================== */

function renderInicio(container) {
    const db = DB.get();
    const pendentes = db.orcamentos.filter(o => o.status === 'Pendente').length;
    const emProducao = db.producao.filter(o => o.status === 'Em produção' || o.status === 'Criada').length;
    const finalizadas = db.producao.filter(o => o.status === 'Finalizada').length;
    container.innerHTML = `
        ${renderPageHeader('home', 'Início')}
        <div class="kpi-grid">
            <div class="card kpi-card"><span class="kpi-icon">${Icon.users}</span><div><div class="kpi-value">${db.funcionarios.length}</div><div class="kpi-label">Funcionários</div></div></div>
            <div class="card kpi-card"><span class="kpi-icon">${Icon.user}</span><div><div class="kpi-value">${db.clientes.length}</div><div class="kpi-label">Clientes</div></div></div>
            <div class="card kpi-card"><span class="kpi-icon">${Icon.doc}</span><div><div class="kpi-value">${pendentes}</div><div class="kpi-label">Orçamentos pendentes</div></div></div>
            <div class="card kpi-card"><span class="kpi-icon">${Icon.factory}</span><div><div class="kpi-value">${emProducao}</div><div class="kpi-label">Ordens em produção</div></div></div>
            <div class="card kpi-card"><span class="kpi-icon">${Icon.check}</span><div><div class="kpi-value">${finalizadas}</div><div class="kpi-label">Ordens finalizadas</div></div></div>
        </div>
        <div class="view-grid">
            <div class="card">
                <div class="card-section-title">${Icon.doc} Orçamentos recentes</div>
                ${db.orcamentos.slice().sort((a, b) => b.id - a.id).slice(0, 5).map(o => `
                    <div class="detail-row"><span>${o.numero} — ${Orcamentos.clienteNome(o.clienteId)}</span><span>${StatusBadge(o.status)}</span></div>
                `).join('')}
            </div>
            <div class="card">
                <div class="card-section-title">${Icon.factory} Produção em andamento</div>
                ${db.producao.filter(o => o.status !== 'Finalizada' && o.status !== 'Cancelada').slice(0, 5).map(o => `
                    <div class="detail-row"><span>${o.numero} — ${o.etapas[o.etapaAtualIdx]}</span><span>${StatusBadge(o.status)}</span></div>
                `).join('') || '<p class="form-note" style="margin:0">Nenhuma ordem em andamento.</p>'}
            </div>
        </div>
    `;
}

function renderConfiguracoes(container) {
    container.innerHTML = `
        ${renderBreadcrumb([{ label: 'Configurações' }])}
        ${renderPageHeader('gear', 'Configurações')}
        <div class="card">
            <div class="card-section-title">${Icon.gear} Preferências do sistema</div>
            <p class="form-note" style="margin-bottom:var(--space-4)">Este é um protótipo front-end. As opções abaixo são apenas ilustrativas.</p>
            <div class="form-grid cols-2">
                <div class="form-field"><label>Nome da empresa</label><input class="input" value="Produza Confecções"></div>
                <div class="form-field"><label>Fuso horário</label><select class="input"><option>América/São Paulo (GMT-3)</option></select></div>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" id="cfgResetBtn">${Icon.trash} Restaurar dados de exemplo</button>
                ${Button({ id: 'cfgSaveBtn', label: 'Salvar preferências', icon: 'check' })}
            </div>
        </div>
    `;
    container.querySelector('#cfgSaveBtn').addEventListener('click', () => showToast('Preferências salvas com sucesso.', 'success'));
    container.querySelector('#cfgResetBtn').addEventListener('click', () => {
        confirmModal({
            title: 'Restaurar dados de exemplo',
            body: 'Isso substituirá todos os dados atuais pelos dados fictícios originais do protótipo.',
            confirmLabel: 'Restaurar', danger: true,
            onConfirm: () => { DB.reset(); showToast('Dados de exemplo restaurados.', 'success'); Router.navigate('#/inicio'); }
        });
    });
}

/* ---------- ROUTES ---------- */
Router.add('/inicio', (c) => renderInicio(c));
Router.add('/funcionarios', (c) => Funcionarios.listView(c));
Router.add('/funcionarios/cadastro', (c) => Funcionarios.formView(c));
Router.add('/funcionarios/:id/editar', (c, p) => Funcionarios.formView(c, p.id));
Router.add('/funcionarios/:id', (c, p) => Funcionarios.viewView(c, p.id));
Router.add('/clientes', (c) => Clientes.listView(c));
Router.add('/clientes/cadastro', (c) => Clientes.formView(c));
Router.add('/clientes/:id/editar', (c, p) => Clientes.formView(c, p.id));
Router.add('/clientes/:id', (c, p) => Clientes.viewView(c, p.id));
Router.add('/produtos', (c) => Produtos.listView(c));
Router.add('/produtos/cadastro', (c) => Produtos.formView(c));
Router.add('/produtos/:id/editar', (c, p) => Produtos.formView(c, p.id));
Router.add('/produtos/:id', (c, p) => Produtos.viewView(c, p.id));
Router.add('/orcamentos', (c) => Orcamentos.listView(c));
Router.add('/orcamentos/novo', (c) => Orcamentos.formView(c));
Router.add('/orcamentos/:id/editar', (c, p) => Orcamentos.formView(c, p.id));
Router.add('/orcamentos/:id', (c, p) => Orcamentos.viewView(c, p.id));
Router.add('/producao', (c) => Producao.listView(c));
Router.add('/producao/nova', (c) => Producao.formView(c));
Router.add('/producao/:id/editar', (c, p) => Producao.formView(c, p.id));
Router.add('/producao/:id', (c, p) => Producao.viewView(c, p.id));
Router.add('/relatorios', (c) => Relatorios.centralView(c));
Router.add('/relatorios/orcamento/:id', (c, p) => Relatorios.orcamentoPdfView(c, p.id));
Router.add('/relatorios/cliente/:id', (c, p) => Relatorios.historicoClienteView(c, p.id));
Router.add('/relatorios/pedido/:id', (c, p) => Relatorios.pedidoDetalheView(c, p.id));
Router.add('/configuracoes', (c) => renderConfiguracoes(c));

/* ---------- APP SHELL ---------- */
const App = (() => {
    let mainEl, sidebarSlot, topbarSlot;

    function renderShell() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div id="topbarSlot"></div>
            <div id="sidebarSlot"></div>
            <main class="main-content" id="mainContent"></main>
        `;
        topbarSlot = document.getElementById('topbarSlot');
        sidebarSlot = document.getElementById('sidebarSlot');
        mainEl = document.getElementById('mainContent');
        topbarSlot.innerHTML = renderTopbar();

        topbarSlot.querySelector('#userMenuTrigger').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userMenu').classList.toggle('open');
        });
        topbarSlot.querySelector('#menuPerfil').addEventListener('click', () => { document.getElementById('userMenu').classList.remove('open'); showToast('Funcionalidade ilustrativa no protótipo.'); });
        topbarSlot.querySelector('#menuSenha').addEventListener('click', () => { document.getElementById('userMenu').classList.remove('open'); showToast('Funcionalidade ilustrativa no protótipo.'); });
        topbarSlot.querySelector('#menuSair').addEventListener('click', () => { document.getElementById('userMenu').classList.remove('open'); showToast('Sessão encerrada (simulação de protótipo).'); });
    }

    function renderRoute() {
        const hash = window.location.hash || '#/inicio';
        const resolved = Router.resolve(hash);

        // sidebar reflects current path
        sidebarSlot.innerHTML = renderSidebar('#' + (resolved ? resolved.path : '/inicio'));
        sidebarSlot.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.nav-item');
                const wasExpanded = item.classList.contains('expanded');
                sidebarSlot.querySelectorAll('.nav-item.expanded').forEach(i => i.classList.remove('expanded'));
                if (!wasExpanded) item.classList.add('expanded');
            });
        });

        mainEl.scrollTo && mainEl.scrollTo(0, 0);
        window.scrollTo(0, 0);

        if (!resolved) {
            mainEl.innerHTML = ErrorState('Página não encontrada.');
            return;
        }
        try {
            resolved.handler(mainEl, resolved.params, resolved.query);
        } catch (err) {
            console.error(err);
            mainEl.innerHTML = ErrorState('Ocorreu um erro ao carregar esta página.');
        }
    }

    function init() {
        renderShell();
        renderRoute();
        window.addEventListener('hashchange', renderRoute);
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
