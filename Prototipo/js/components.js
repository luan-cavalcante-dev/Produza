/* ==========================================================
   COMPONENTS — reusable UI building blocks (returns HTML strings)
   ========================================================== */
const Icon = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><circle cx="17" cy="8.5" r="2.6"/><path d="M15.8 14.7c2.6.3 4.6 2.2 5.2 5.3"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.9-4 3.8-6.2 7.5-6.2s6.6 2.2 7.5 6.2"/></svg>`,
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>`,
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>`,
    factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V11l5 3.5V11l5 3.5V11l5 3.5V21H3Z"/><path d="M9 21v-4h4v4"/><path d="M6 8V5M6 5h2l-2 3"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14 2h-4l-.5 2.5a7.5 7.5 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.8.7 1.6 1.2 2.6 1.5L10 22h4l.5-2.5a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
    dots: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M10 11v6M14 11v6"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8v.01"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>`,
    alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 2.6 18a1 1 0 0 0 .9 1.5h17a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.7 0Z"/><path d="M12 9v4M12 17v.01"/></svg>`,
    inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h4l2 3h4l2-3h4"/><path d="M5.5 5h13l2.5 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7Z"/></svg>`,
    hanger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a2 2 0 0 1 2 2c0 1-.7 1.6-1.6 2.1L12 8.5l-.4-.4C10.7 7.6 10 7 10 6a2 2 0 0 1 2-2Z"/><path d="M12 8.5 2.5 15c-.9.6-.5 2 .6 2H21c1 0 1.5-1.4.6-2L12 8.5Z"/></svg>`,
};

function iconEl(name, cls) { return `<span class="${cls || ''}">${Icon[name] || ''}</span>`; }

/* ---------- TOPBAR ---------- */
function renderTopbar() {
    return `
    <header class="topbar">
        <div class="topbar-brand">
            <span class="brand-icon">${Icon.hanger}</span>
            <div class="topbar-brand-text">
                <div class="brand-name">Produza</div>
                <div class="brand-sub">Gestão de Processos Produtivos em Confecções</div>
            </div>
        </div>
        <div class="topbar-user">
            <button class="topbar-user-trigger" id="userMenuTrigger">
                <span class="avatar">${Icon.user}</span>
                <span>Usuário</span>
                <span class="user-role">| Gerente</span>
                <span style="width:14px;height:14px;display:flex">${Icon.chevronDown}</span>
            </button>
            <div class="topbar-user-menu" id="userMenu">
                <button id="menuPerfil">${iconEl('user', 'icon-inline')} Meu perfil</button>
                <button id="menuSenha">${iconEl('gear', 'icon-inline')} Alterar senha</button>
                <hr>
                <button class="danger" id="menuSair">Sair</button>
            </div>
        </div>
    </header>`;
}

/* ---------- SIDEBAR ---------- */
const NAV_ITEMS = [
    { key: 'inicio', label: 'Início', icon: 'home', route: '#/inicio' },
    { key: 'funcionarios', label: 'Funcionários', icon: 'users', route: '#/funcionarios' },
    { key: 'clientes', label: 'Clientes', icon: 'user', route: '#/clientes' },
    { key: 'produtos', label: 'Produtos', icon: 'box', route: '#/produtos' },
    { key: 'orcamentos', label: 'Orçamentos', icon: 'doc', route: '#/orcamentos' },
    { key: 'producao', label: 'Produção', icon: 'factory', route: '#/producao' },
    { key: 'relatorios', label: 'Relatórios', icon: 'chart', route: '#/relatorios' },
    { key: 'configuracoes', label: 'Configurações', icon: 'gear', route: '#/configuracoes' }
];

function renderSidebar(currentHash) {
    const items = NAV_ITEMS.map(item => {
        const isParentActive = item.children ? item.children.some(c => c.route === currentHash) : item.route === currentHash;
        if (item.children) {
            const expanded = isParentActive;
            const subLinks = item.children.map(c => `<a class="nav-sublink ${c.route === currentHash ? 'active' : ''}" href="${c.route}">${c.label}</a>`).join('');
            return `
            <li class="nav-item ${expanded ? 'expanded' : ''}" data-key="${item.key}">
                <button class="nav-link ${isParentActive ? 'active' : ''}" data-toggle="${item.key}">
                    <span class="nav-icon">${Icon[item.icon]}</span>
                    <span class="nav-label">${item.label}</span>
                    <span class="nav-caret">${Icon.chevronDown}</span>
                </button>
                <div class="nav-submenu">${subLinks}</div>
            </li>`;
        }
        return `
        <li class="nav-item">
            <a class="nav-link ${isParentActive ? 'active' : ''}" href="${item.route}">
                <span class="nav-icon">${Icon[item.icon]}</span>
                <span class="nav-label">${item.label}</span>
            </a>
        </li>`;
    }).join('');
    return `<aside class="sidebar"><ul>${items}</ul></aside>`;
}

/* ---------- BREADCRUMB ---------- */
function renderBreadcrumb(trail) {
    // trail: array of {label, route?}. Last item has no route (current page).
    const parts = trail.map((t, i) => {
        if (i === trail.length - 1) return `<span class="crumb-current">${t.label}</span>`;
        return `<a href="${t.route}">${t.label}</a><span>${Icon.chevronRight}</span>`;
    }).join('');
    return `<nav class="breadcrumb"><a href="#/inicio">${Icon.home}</a><span>${Icon.chevronRight}</span>${parts}</nav>`;
}

/* ---------- PAGE HEADER ---------- */
function renderPageHeader(icon, title) {
    return `<div class="page-header"><span class="page-icon">${Icon[icon]}</span><h1>${title}</h1></div>`;
}

/* ---------- BUTTON ---------- */
function Button({ id = '', label, variant = 'primary', icon = '', type = 'button', extraClass = '', disabled = false }) {
    return `<button ${id ? `id="${id}"` : ''} type="${type}" class="btn btn-${variant} ${extraClass}" ${disabled ? 'disabled' : ''}>${icon ? `<span style="width:16px;height:16px;display:flex">${Icon[icon] || ''}</span>` : ''}${label}</button>`;
}

/* ---------- SEARCH BAR ---------- */
function SearchBar(id, placeholder) {
    return `
    <div class="search-bar">
        <span class="search-icon">${Icon.search}</span>
        <input type="text" id="${id}" class="input" placeholder="${placeholder}" autocomplete="off">
        <button class="clear-btn" id="${id}Clear" type="button">${Icon.x}</button>
    </div>`;
}

/* ---------- STATUS BADGE ---------- */
function StatusBadge(status) {
    const slug = status
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
        .toLowerCase().replace(/\s+/g, '-');
    return `<span class="status-badge status-${slug}">${status}</span>`;
}

/* ---------- EMPTY / LOADING / ERROR STATES ---------- */
function EmptyState(message) {
    return `<div class="state-block"><span class="state-icon">${Icon.inbox}</span><p>${message}</p></div>`;
}
function PromptState(message) {
    return `<div class="state-block"><span class="state-icon">${Icon.search}</span><p>${message}</p></div>`;
}
function LoadingState(message) {
    return `<div class="state-block"><div class="spinner"></div><p>${message || 'Carregando...'}</p></div>`;
}
function ErrorState(message) {
    return `<div class="state-block error"><span class="state-icon">${Icon.alertTriangle}</span><p>${message}</p></div>`;
}

/* ---------- MODAL ---------- */
function ensureModalRoot() {
    let el = document.getElementById('modalRoot');
    if (!el) {
        el = document.createElement('div');
        el.id = 'modalRoot';
        el.className = 'modal-overlay';
        document.body.appendChild(el);
    }
    return el;
}
function openModal({ title, body, actions, wide = false }) {
    const root = ensureModalRoot();
    root.innerHTML = `<div class="modal-box ${wide ? 'wide' : ''}">
        <div class="modal-title">${title}</div>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">${actions}</div>
    </div>`;
    root.classList.add('open');
    root.onclick = (e) => { if (e.target === root) closeModal(); };
}
function closeModal() {
    const root = document.getElementById('modalRoot');
    if (root) root.classList.remove('open');
}
function confirmModal({ title, body, confirmLabel = 'Confirmar', danger = false, onConfirm }) {
    openModal({
        title, body,
        actions: `
            <button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button>
            <button class="btn ${danger ? 'btn-danger solid' : 'btn-primary'}" id="modalConfirmBtn">${confirmLabel}</button>
        `
    });
    document.getElementById('modalCancelBtn').onclick = closeModal;
    document.getElementById('modalConfirmBtn').onclick = () => { closeModal(); onConfirm && onConfirm(); };
}

/* ---------- TOAST ---------- */
function ensureToastRoot() {
    let el = document.getElementById('toastRoot');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toastRoot';
        el.className = 'toast-stack';
        document.body.appendChild(el);
    }
    return el;
}
function showToast(message, type = 'default') {
    const root = ensureToastRoot();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icon = type === 'success' ? Icon.check : (type === 'error' ? Icon.alertTriangle : Icon.info);
    t.innerHTML = `${icon}<span>${message}</span>`;
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .25s'; setTimeout(() => t.remove(), 250); }, 3200);
}

/* ---------- DATA TABLE FOOTER ---------- */
function tableFooter(total) {
    return `<div class="table-footer">
        <span>Exibindo ${total} de ${total} resultado${total === 1 ? '' : 's'}</span>
        <div class="pagination">
            <button disabled>${Icon.chevronRight}</button>
            <button class="page-current">1</button>
            <button>${Icon.chevronRight}</button>
        </div>
    </div>`;
}

/* ---------- ROW ACTION MENU ---------- */
function rowActionsMenu(id, actions) {
    // actions: array of {label, icon, danger, action}
    const btns = actions.map(a => `<button data-action="${a.action}" data-id="${id}" class="${a.danger ? 'danger' : ''}">${iconEl(a.icon, 'icon-inline')} ${a.label}</button>`).join('');
    return `
    <div class="row-actions">
        <button class="icon-btn row-menu-trigger" data-menu-id="${id}">${Icon.dots}</button>
        <div class="action-menu" id="menu-${id}">${btns}</div>
    </div>`;
}

/* ---------- ROW MENU TOGGLE (fixed-position, escapes scroll clipping) ---------- */
function toggleRowMenu(id, triggerEl) {
    const menu = document.getElementById(`menu-${id}`);
    if (!menu) return;
    const wasOpen = menu.classList.contains('open');
    document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open'));
    if (wasOpen) return;
    const rect = triggerEl.getBoundingClientRect();
    menu.style.top = (rect.bottom + 4) + 'px';
    let left = rect.right - 150;
    left = Math.max(8, Math.min(left, window.innerWidth - 158));
    menu.style.left = left + 'px';
    menu.classList.add('open');
}

/* ---------- CLIENT PICKER (search-as-you-type + quick create) ---------- */
function createClientPicker(container, { selectedId = null, onSelect }) {
    let selectedCliente = selectedId ? DB.get().clientes.find(c => c.id === selectedId) : null;
    container.innerHTML = `
        <div class="autocomplete">
            <div class="search-bar">
                <span class="search-icon">${Icon.search}</span>
                <input type="text" class="input ac-input" placeholder="Pesquisar cliente pelo nome..." autocomplete="off" value="${selectedCliente ? selectedCliente.nome : ''}">
            </div>
            <div class="ac-results" style="display:none"></div>
        </div>
    `;
    const input = container.querySelector('.ac-input');
    const results = container.querySelector('.ac-results');

    function renderResults(term) {
        const t = term.trim().toLowerCase();
        if (!t) { results.style.display = 'none'; results.innerHTML = ''; return; }
        const list = DB.get().clientes.filter(c => c.nome.toLowerCase().includes(t));
        const exact = list.some(c => c.nome.toLowerCase() === t);
        let html = list.map(c => `<button type="button" class="ac-item" data-id="${c.id}"><span class="ac-item-main">${c.nome}</span><span class="ac-item-sub">${c.telefone || 'Sem telefone'}</span></button>`).join('');
        if (!exact) html += `<button type="button" class="ac-item ac-create" data-create="1">${Icon.plus} Cadastrar "${term.trim()}"</button>`;
        results.innerHTML = html || `<div class="ac-empty">Nenhum cliente encontrado.</div>`;
        results.style.display = 'block';
    }

    input.addEventListener('input', () => { selectedCliente = null; renderResults(input.value); });
    input.addEventListener('focus', () => { if (input.value.trim()) renderResults(input.value); });
    document.addEventListener('click', (e) => { if (!container.contains(e.target)) results.style.display = 'none'; });

    results.addEventListener('click', (e) => {
        const item = e.target.closest('.ac-item');
        if (!item) return;
        if (item.dataset.create) {
            const nomeSugerido = input.value.trim();
            openQuickClientModal(nomeSugerido, (novo) => {
                selectedCliente = novo;
                input.value = novo.nome;
                results.style.display = 'none';
                onSelect(novo.id, novo);
            });
            return;
        }
        const id = Number(item.dataset.id);
        selectedCliente = DB.get().clientes.find(c => c.id === id);
        input.value = selectedCliente.nome;
        results.style.display = 'none';
        onSelect(id, selectedCliente);
    });

    return { getSelectedId: () => selectedCliente ? selectedCliente.id : null };
}

function openQuickClientModal(nomeSugerido, onCreated) {
    openModal({
        title: 'Cadastrar cliente',
        body: `
            <p style="margin:0 0 var(--space-3);font-size:13px">Cadastro rápido: nome e telefone são suficientes para usar o cliente em um orçamento ou ordem de produção.</p>
            <div class="form-field" style="margin-bottom:var(--space-3)"><label>Nome completo <span class="req">*</span></label><input class="input" id="qcNome" value="${nomeSugerido || ''}"></div>
            <div class="form-field"><label>Telefone <span class="req">*</span></label><input class="input" id="qcTel" placeholder="(00) 00000-0000"></div>
        `,
        actions: `<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalConfirmBtn">Cadastrar</button>`
    });
    applyMask(document.getElementById('qcTel'), maskPhone);
    document.getElementById('modalCancelBtn').onclick = closeModal;
    document.getElementById('modalConfirmBtn').onclick = () => {
        const nome = document.getElementById('qcNome').value.trim();
        const tel = document.getElementById('qcTel').value.trim();
        if (!nome) { showToast('Informe o nome do cliente.', 'error'); return; }
        if (tel.replace(/\D/g, '').length < 10) { showToast('Informe um telefone válido.', 'error'); return; }
        const db = DB.get();
        const novo = { id: DB.nextId('cliente'), nome, cpfCnpj: '', telefone: tel, telefone2: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', status: 'Ativo' };
        db.clientes.push(novo);
        DB.persist();
        closeModal();
        showToast('Cliente cadastrado com sucesso.', 'success');
        onCreated(novo);
    };
}

/* ---------- PRODUCT PICKER (search-as-you-type, adds on click) ---------- */
function createProductPicker(container, { onSelect }) {
    container.innerHTML = `
        <div class="autocomplete">
            <div class="search-bar">
                <span class="search-icon">${Icon.search}</span>
                <input type="text" class="input ac-input" placeholder="Pesquisar produto pelo nome..." autocomplete="off">
            </div>
            <div class="ac-results" style="display:none"></div>
        </div>
    `;
    const input = container.querySelector('.ac-input');
    const results = container.querySelector('.ac-results');

    function renderResults(term) {
        const t = term.trim().toLowerCase();
        if (!t) { results.style.display = 'none'; results.innerHTML = ''; return; }
        const list = DB.get().produtos.filter(p => p.status === 'Ativo' && p.nome.toLowerCase().includes(t));
        results.innerHTML = list.length
            ? list.map(p => `<button type="button" class="ac-item" data-id="${p.id}"><span class="ac-item-main">${p.nome}</span><span class="ac-item-sub">${fmtMoney(p.precoBase)}</span></button>`).join('')
            : `<div class="ac-empty">Nenhum produto encontrado.</div>`;
        results.style.display = 'block';
    }

    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('focus', () => { if (input.value.trim()) renderResults(input.value); });
    document.addEventListener('click', (e) => { if (!container.contains(e.target)) results.style.display = 'none'; });

    results.addEventListener('click', (e) => {
        const item = e.target.closest('.ac-item');
        if (!item) return;
        const id = Number(item.dataset.id);
        onSelect(id);
        input.value = '';
        results.style.display = 'none';
        input.focus();
    });
}

/* ---------- MASKS ---------- */
function maskCPF(v) {
    return v.replace(/\D/g, '').slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCEP(v) {
    return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}
function maskPhone(v) {
    v = v.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
    return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
}
function applyMask(input, maskFn) {
    if (!input) return;
    input.addEventListener('input', () => {
        const pos = input.selectionStart;
        const before = input.value.length;
        input.value = maskFn(input.value);
        const diff = input.value.length - before;
        input.setSelectionRange(pos + diff, pos + diff);
    });
}

function maskCpfCnpj(v) {
    const digits = v.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 11) {
        return digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
function docKind(v) {
    const digits = v.replace(/\D/g, '');
    if (digits.length === 0) return null;
    return digits.length > 11 ? 'CNPJ' : 'CPF';
}

/* ---------- SIMILARITY (Levenshtein distance) — used to flag near-duplicate names ---------- */
function normalizeStr(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function levenshtein(a, b) {
    a = normalizeStr(a); b = normalizeStr(b);
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}
function findSimilarName(name, existingNames, maxDistance = 2) {
    const target = normalizeStr(name);
    if (target.length < 3) return null;
    for (const existing of existingNames) {
        const norm = normalizeStr(existing);
        if (norm === target) continue; // exact match handled separately
        const dist = levenshtein(target, norm);
        const threshold = norm.length <= 4 ? 1 : maxDistance;
        if (dist > 0 && dist <= threshold) return existing;
    }
    return null;
}
function findExactName(name, existingNames) {
    const target = normalizeStr(name);
    return existingNames.find(n => normalizeStr(n) === target) || null;
}

/* ---------- CEP LOOKUP (simulado, sem backend) ---------- */
const CEP_MOCK = {
    '76380000': { endereco: 'Av. Central', bairro: 'Centro', cidade: 'Goianésia', estado: 'GO' },
    '76380010': { endereco: 'Av. Brasil', bairro: 'Vila Nova', cidade: 'Goianésia', estado: 'GO' }
};
function lookupCep(cep) {
    const digits = cep.replace(/\D/g, '');
    return CEP_MOCK[digits] || { endereco: 'Rua Exemplo', bairro: 'Bairro Modelo', cidade: 'Goianésia', estado: 'GO' };
}

window.addEventListener('scroll', () => document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open')), true);
window.addEventListener('resize', () => document.querySelectorAll('.action-menu.open').forEach(m => m.classList.remove('open')));

/* Generic delegated close-on-outside-click for row menus + user menu */
document.addEventListener('click', (e) => {
    document.querySelectorAll('.action-menu.open').forEach(m => {
        if (!m.contains(e.target) && !(e.target.closest && e.target.closest(`[data-menu-id="${m.id.replace('menu-', '')}"]`))) {
            m.classList.remove('open');
        }
    });
    const userMenu = document.getElementById('userMenu');
    if (userMenu && !userMenu.contains(e.target) && e.target.id !== 'userMenuTrigger' && !(e.target.closest && e.target.closest('#userMenuTrigger'))) {
        userMenu.classList.remove('open');
    }
});
