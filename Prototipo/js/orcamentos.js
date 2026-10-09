/* ==========================================================
   ORÇAMENTOS
   ========================================================== */
const Orcamentos = (() => {

    const ETAPAS_PADRAO = ['Corte', 'Costura', 'Acabamento', 'Revisão', 'Finalizado'];

    function clienteNome(id) { const c = DB.get().clientes.find(x => x.id === id); return c ? c.nome : '—'; }
    function produtoNome(id) { const p = DB.get().produtos.find(x => x.id === id); return p ? p.nome : '—'; }

    function calcItem(item) {
        const bruto = item.qtd * item.precoUnit;
        const desconto = bruto * (item.descontoPerc / 100);
        return { bruto, desconto, total: bruto - desconto };
    }
    function calcTotais(itens) {
        let subtotal = 0, desconto = 0;
        itens.forEach(i => { const c = calcItem(i); subtotal += c.bruto; desconto += c.desconto; });
        return { subtotal, desconto, total: subtotal - desconto };
    }
    function melhorDesconto(produto, qtd) {
        if (!produto.descontos || !produto.descontos.length) return 0;
        const aplicaveis = produto.descontos.filter(d => qtd >= d.qtd).sort((a, b) => b.perc - a.perc);
        return aplicaveis.length ? aplicaveis[0].perc : 0;
    }

    // O desconto por quantidade considera a soma de TODAS as variações (tamanhos) do mesmo produto
    // na lista, não cada linha isoladamente. Ex.: camiseta P x5 + camiseta M x5 = 10 un. de camiseta,
    // então a regra de desconto para 10 peças vale para as duas linhas.
    function sincronizarDescontoProduto(itens, produtoId) {
        const produto = DB.get().produtos.find(p => p.id === produtoId);
        if (!produto) return;
        const totalQtd = itens.filter(it => it.produtoId === produtoId).reduce((s, it) => s + it.qtd, 0);
        const desconto = melhorDesconto(produto, totalQtd);
        itens.forEach(it => { if (it.produtoId === produtoId) it.descontoPerc = desconto; });
    }

    /* Gera automaticamente a Ordem de Produção a partir de um orçamento aprovado */
    function gerarOrdemAutomatica(o) {
        const db = DB.get();
        const seq = DB.nextId('producao');
        const novo = {
            id: seq, numero: 'OP-' + String(seq).padStart(4, '0'), origemOrcamentoId: o.id, clienteId: o.clienteId,
            itens: JSON.parse(JSON.stringify(o.itens)),
            status: 'Criada', previsao: addDaysIso(todayIso(), 15), etapaAtualIdx: 0,
            etapas: ETAPAS_PADRAO.slice(),
            historico: [{ data: todayIso(), status: 'Criada', obs: `Gerada automaticamente a partir do orçamento ${o.numero} aprovado.` }]
        };
        db.producao.push(novo);
        return novo;
    }

    function aprovarOrcamento(o, onDone) {
        const cliente = DB.get().clientes.find(c => c.id === o.clienteId);
        confirmModal({
            title: 'Aprovar orçamento?',
            body: 'Após a aprovação, o orçamento não poderá mais ser alterado e uma ordem de produção será gerada automaticamente.',
            confirmLabel: 'Aprovar orçamento',
            onConfirm: () => {
                if (!Clientes.isComplete(cliente)) {
                    showToast('Complete o cadastro do cliente antes de aprovar este orçamento.', 'error');
                    Router.navigate(`#/clientes/${cliente.id}/editar`);
                    return;
                }
                o.status = 'Aprovado';
                o.aprovadoEm = todayIso();
                const op = gerarOrdemAutomatica(o);
                DB.persist();
                showToast(`Orçamento aprovado com sucesso. Ordem de produção ${op.numero} criada.`, 'success');
                onDone && onDone();
            }
        });
    }

    function cancelarOrcamento(o, onDone) {
        confirmModal({
            title: 'Cancelar orçamento',
            body: `Deseja realmente cancelar o orçamento ${o.numero}? O histórico será mantido.`,
            confirmLabel: 'Cancelar orçamento', danger: true,
            onConfirm: () => {
                o.status = 'Cancelado';
                DB.persist();
                showToast('Orçamento cancelado.', 'success');
                onDone && onDone();
            }
        });
    }

    function listView(container) {
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Orçamentos' }])}
            ${renderPageHeader('doc', 'Orçamentos')}
            <div class="toolbar">
                ${SearchBar('oSearch', 'Pesquisar por número ou cliente...')}
                <div class="toolbar-filters">
                    <select class="input" id="oStatusFilter" style="width:150px">
                        <option value="">Todos status</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>
                ${Button({ id: 'oNovoBtn', label: 'Novo orçamento', icon: 'plus' })}
            </div>
            <div class="card" style="padding:0;overflow:hidden" id="oResultsCard"></div>
        `;
        const resultsCard = container.querySelector('#oResultsCard');
        const input = container.querySelector('#oSearch');
        const clearBtn = container.querySelector('#oSearchClear');
        const statusFilter = container.querySelector('#oStatusFilter');

        function renderResults() {
            const term = input.value.trim().toLowerCase();
            let list = DB.get().orcamentos.slice().sort((a, b) => b.id - a.id);
            if (statusFilter.value) list = list.filter(o => o.status === statusFilter.value);
            if (term) list = list.filter(o => o.numero.toLowerCase().includes(term) || clienteNome(o.clienteId).toLowerCase().includes(term));
            if (list.length === 0) { resultsCard.innerHTML = EmptyState('Nenhum orçamento encontrado.'); return; }
            resultsCard.innerHTML = `
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Número</th><th>Cliente</th><th>Data</th><th>Valor total</th><th>Status</th><th></th></tr></thead>
                    <tbody>${list.map(o => `
                        <tr>
                            <td><strong>${o.numero}</strong></td>
                            <td>${clienteNome(o.clienteId)}</td>
                            <td>${fmtDate(o.data)}</td>
                            <td>${fmtMoney(calcTotais(o.itens).total)}</td>
                            <td>${StatusBadge(o.status)}</td>
                            <td>${rowActionsMenu(o.id, [
                                { label: 'Visualizar', icon: 'eye', action: 'view' },
                                ...(o.status === 'Pendente' ? [
                                    { label: 'Editar', icon: 'pencil', action: 'edit' },
                                    { label: 'Aprovar', icon: 'check', action: 'approve' },
                                    { label: 'Cancelar', icon: 'x', action: 'cancel', danger: true }
                                ] : [])
                            ])}</td>
                        </tr>`).join('')}</tbody>
                </table></div>
                <div style="padding:0 var(--space-4) var(--space-4)">${tableFooter(list.length)}</div>
            `;
        }
        renderResults();
        input.addEventListener('input', () => { clearBtn.classList.toggle('show', !!input.value); renderResults(); });
        clearBtn.addEventListener('click', () => { input.value = ''; clearBtn.classList.remove('show'); renderResults(); input.focus(); });
        statusFilter.addEventListener('change', renderResults);
        container.querySelector('#oNovoBtn').addEventListener('click', () => Router.navigate('#/orcamentos/novo'));

        resultsCard.addEventListener('click', (e) => {
            const trigger = e.target.closest('.row-menu-trigger');
            if (trigger) { toggleRowMenu(trigger.dataset.menuId, trigger); return; }
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const id = Number(actionBtn.dataset.id);
                const action = actionBtn.dataset.action;
                const o = DB.get().orcamentos.find(x => x.id === id);
                if (action === 'view') Router.navigate(`#/orcamentos/${id}`);
                if (action === 'edit') Router.navigate(`#/orcamentos/${id}/editar`);
                if (action === 'approve') aprovarOrcamento(o, renderResults);
                if (action === 'cancel') cancelarOrcamento(o, renderResults);
            }
        });
    }

    function formView(container, id) {
        const isEdit = !!id;
        const orcamento = isEdit ? DB.get().orcamentos.find(o => o.id === Number(id)) : null;
        if (isEdit && (!orcamento || orcamento.status !== 'Pendente')) {
            container.innerHTML = ErrorState('Este orçamento não pode ser editado.');
            return;
        }
        let itens = isEdit ? JSON.parse(JSON.stringify(orcamento.itens)) : [];
        let clienteId = isEdit ? orcamento.clienteId : null;

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Orçamentos', route: '#/orcamentos' }, { label: isEdit ? `Editar ${orcamento.numero}` : 'Novo Orçamento' }])}
            ${renderPageHeader('doc', isEdit ? `Editar Orçamento ${orcamento.numero}` : 'Novo Orçamento')}
            <div class="card">
                <div class="card-section-title">${Icon.user} Cliente</div>
                <div id="clientPickerContainer"></div>
                <span class="field-error" id="err-cliente">Selecione um cliente.</span>
            </div>
            <div class="card">
                <div class="card-section-title">${Icon.box} Produtos</div>
                <div id="productPickerContainer" style="margin-bottom:var(--space-4)"></div>
                <div class="table-wrap"><table class="data-table" id="itensTable">
                    <thead><tr><th>Produto</th><th>Tamanho</th><th>Qtd.</th><th>Vlr. unit.</th><th>Desc.</th><th>Total</th><th></th></tr></thead>
                    <tbody id="itensBody"></tbody>
                </table></div>
                <div class="totals-box" id="totalsBox"></div>
            </div>
            <div class="form-actions">
                ${Button({ id: 'oCancelBtn', label: 'Cancelar', variant: 'secondary', icon: 'x', type: 'button' })}
                ${Button({ id: 'oSaveBtn', label: 'Salvar orçamento', variant: 'primary', icon: 'check', type: 'button' })}
            </div>
        `;

        const clientPicker = createClientPicker(container.querySelector('#clientPickerContainer'), {
            selectedId: clienteId,
            onSelect: (newId) => { clienteId = newId; container.querySelector('#err-cliente').classList.remove('show'); }
        });

        const itensBody = container.querySelector('#itensBody');
        const totalsBox = container.querySelector('#totalsBox');

        // Tamanhos do produto que ainda não foram usados por OUTRA linha do mesmo produto na lista
        // (excluindo a própria linha, quando informada) — evita duplicar o mesmo produto/tamanho.
        function tamanhosDisponiveis(produto, excludeIndex) {
            if (!produto.tamanhos || !produto.tamanhos.length) return [];
            const usados = itens
                .map((it, i) => ({ it, i }))
                .filter(({ it, i }) => it.produtoId === produto.id && i !== excludeIndex)
                .map(({ it }) => it.tamanho);
            return produto.tamanhos.filter(t => !usados.includes(t.tam));
        }
        function tamanhoOptions(produto, selected, rowIndex) {
            if (!produto.tamanhos || !produto.tamanhos.length) return `<option value="">Único</option>`;
            const disponiveis = tamanhosDisponiveis(produto, rowIndex);
            const opcoes = produto.tamanhos.filter(t => t.tam === selected || disponiveis.some(d => d.tam === t.tam));
            return opcoes.map(t => `<option value="${t.tam}" ${selected === t.tam ? 'selected' : ''}>${t.tam}</option>`).join('');
        }
        function precoFor(produto, tamanho) {
            if (produto.tamanhos && produto.tamanhos.length) {
                const t = produto.tamanhos.find(x => x.tam === tamanho);
                return t ? t.preco : produto.precoBase;
            }
            return produto.precoBase;
        }

        function renderItens() {
            if (!itens.length) {
                itensBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--color-text-secondary);padding:var(--space-5)">Nenhum produto adicionado. Use a busca acima para adicionar.</td></tr>`;
            } else {
                itensBody.innerHTML = itens.map((it, i) => {
                    const produto = DB.get().produtos.find(p => p.id === it.produtoId);
                    const c = calcItem(it);
                    return `<tr>
                        <td>${produto ? produto.nome : '—'}</td>
                        <td><select class="input item-tamanho" data-i="${i}" style="width:80px">${tamanhoOptions(produto, it.tamanho, i)}</select></td>
                        <td><input class="input item-qtd" data-i="${i}" type="number" min="1" value="${it.qtd}" style="width:70px"></td>
                        <td><input class="input" value="${fmtMoney(it.precoUnit)}" readonly style="width:100px"></td>
                        <td>${it.descontoPerc}%</td>
                        <td><strong>${fmtMoney(c.total)}</strong></td>
                        <td><button type="button" class="icon-btn item-row-remove item-remove" data-i="${i}">${Icon.trash}</button></td>
                    </tr>`;
                }).join('');
            }
            const t = calcTotais(itens);
            totalsBox.innerHTML = `
                <div class="totals-row"><span>Subtotal</span><span>${fmtMoney(t.subtotal)}</span></div>
                <div class="totals-row"><span>Desconto</span><span>-${fmtMoney(t.desconto)}</span></div>
                <div class="totals-row grand"><span>Total</span><span>${fmtMoney(t.total)}</span></div>
            `;
        }
        renderItens();

        createProductPicker(container.querySelector('#productPickerContainer'), {
            onSelect: (produtoId) => {
                const produto = DB.get().produtos.find(p => p.id === produtoId);
                if (!produto) return;
                if (!produto.tamanhos || !produto.tamanhos.length) {
                    // tamanho único: não pode duplicar o mesmo produto na lista
                    const jaExiste = itens.some(it => it.produtoId === produto.id);
                    if (jaExiste) { showToast(`"${produto.nome}" já está na lista.`, 'error'); return; }
                    itens.push({ produtoId: produto.id, tamanho: '', qtd: 1, precoUnit: produto.precoBase, descontoPerc: 0 });
                    sincronizarDescontoProduto(itens, produto.id);
                    renderItens();
                    return;
                }
                const disponiveis = tamanhosDisponiveis(produto, null);
                if (!disponiveis.length) { showToast(`Todos os tamanhos de "${produto.nome}" já foram adicionados à lista.`, 'error'); return; }
                const tamanho = disponiveis[0].tam;
                const preco = precoFor(produto, tamanho);
                itens.push({ produtoId: produto.id, tamanho, qtd: 1, precoUnit: preco, descontoPerc: 0 });
                sincronizarDescontoProduto(itens, produto.id);
                renderItens();
            }
        });

        itensBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.item-remove');
            if (btn) {
                const produtoId = itens[Number(btn.dataset.i)].produtoId;
                itens.splice(Number(btn.dataset.i), 1);
                sincronizarDescontoProduto(itens, produtoId);
                renderItens();
            }
        });
        itensBody.addEventListener('change', (e) => {
            const i = Number(e.target.dataset.i);
            if (isNaN(i)) return;
            const it = itens[i];
            if (e.target.classList.contains('item-tamanho')) {
                const produto = DB.get().produtos.find(p => p.id === it.produtoId);
                it.tamanho = e.target.value;
                it.precoUnit = precoFor(produto, it.tamanho);
                renderItens();
            }
            if (e.target.classList.contains('item-qtd')) {
                it.qtd = Math.max(1, Number(e.target.value) || 1);
                sincronizarDescontoProduto(itens, it.produtoId);
                renderItens();
            }
        });

        container.querySelector('#oCancelBtn').addEventListener('click', () => Router.navigate(isEdit ? `#/orcamentos/${id}` : '#/orcamentos'));
        container.querySelector('#oSaveBtn').addEventListener('click', () => {
            const selId = clientPicker.getSelectedId();
            if (!selId) { container.querySelector('#err-cliente').classList.add('show'); showToast('Selecione um cliente.', 'error'); return; }
            if (!itens.length) { showToast('Adicione ao menos um produto ao orçamento.', 'error'); return; }
            const saveBtn = container.querySelector('#oSaveBtn');
            saveBtn.classList.add('loading');
            setTimeout(() => {
                const db = DB.get();
                if (isEdit) {
                    orcamento.clienteId = selId;
                    orcamento.itens = itens;
                } else {
                    const seq = DB.nextId('orcamento');
                    db.orcamentos.push({ id: seq, numero: '#' + String(seq).padStart(4, '0'), clienteId: selId, data: todayIso(), status: 'Pendente', itens });
                }
                DB.persist();
                saveBtn.classList.remove('loading');
                showToast('Orçamento salvo com sucesso.', 'success');
                Router.navigate('#/orcamentos');
            }, 400);
        });
    }

    function viewView(container, id) {
        const o = DB.get().orcamentos.find(x => x.id === Number(id));
        if (!o) { container.innerHTML = ErrorState('Orçamento não encontrado.'); return; }
        const cliente = DB.get().clientes.find(c => c.id === o.clienteId);
        const totais = calcTotais(o.itens);
        const opGerada = DB.get().producao.find(p => p.origemOrcamentoId === o.id);

        function render() {
            container.innerHTML = `
                ${renderBreadcrumb([{ label: 'Orçamentos', route: '#/orcamentos' }, { label: o.numero }])}
                <div class="page-title-row">
                    <div class="page-header" style="margin-bottom:0">
                        <span class="page-icon">${Icon.doc}</span>
                        <h1>Orçamento ${o.numero}</h1>
                    </div>
                    ${StatusBadge(o.status)}
                </div>
                <div class="view-grid">
                    <div>
                        <div class="card">
                            <div class="card-section-title">${Icon.box} Itens</div>
                            <div class="table-wrap"><table class="data-table">
                                <thead><tr><th>Produto</th><th>Tam.</th><th>Qtd.</th><th>Vlr. unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                                <tbody>${o.itens.map(it => { const c = calcItem(it); return `
                                    <tr><td>${produtoNome(it.produtoId)}</td><td>${it.tamanho || 'Único'}</td><td>${it.qtd}</td><td>${fmtMoney(it.precoUnit)}</td><td>${it.descontoPerc}%</td><td><strong>${fmtMoney(c.total)}</strong></td></tr>
                                `; }).join('')}</tbody>
                            </table></div>
                            <div class="totals-box">
                                <div class="totals-row"><span>Subtotal</span><span>${fmtMoney(totais.subtotal)}</span></div>
                                <div class="totals-row"><span>Desconto</span><span>-${fmtMoney(totais.desconto)}</span></div>
                                <div class="totals-row grand"><span>Total</span><span>${fmtMoney(totais.total)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="card">
                            <div class="card-section-title">${Icon.user} Cliente</div>
                            <div class="detail-row"><span>Nome</span><span>${cliente ? cliente.nome : '—'}</span></div>
                            <div class="detail-row"><span>Telefone</span><span>${cliente ? cliente.telefone : '—'}</span></div>
                            <div class="detail-row"><span>Data</span><span>${fmtDate(o.data)}</span></div>
                            ${o.aprovadoEm ? `<div class="detail-row"><span>Aprovado em</span><span>${fmtDate(o.aprovadoEm)}</span></div>` : ''}
                        </div>
                        ${opGerada ? `
                        <div class="card">
                            <div class="card-section-title">${iconEl('factory')} Ordem de produção gerada</div>
                            <div class="detail-row"><span>${opGerada.numero}</span><span>${StatusBadge(opGerada.status)}</span></div>
                            <div class="item-add-row">${Button({ id: 'verOpBtn', label: 'Ver ordem de produção', icon: 'chevronRight', variant: 'secondary' })}</div>
                        </div>` : ''}
                        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-3)">
                            <div class="card-section-title" style="margin-bottom:0">Ações</div>
                            ${o.status === 'Pendente' ? `
                                ${Button({ id: 'oEditActionBtn', label: 'Editar orçamento', icon: 'pencil', variant: 'secondary' })}
                                ${Button({ id: 'oApproveBtn', label: 'Aprovar orçamento', icon: 'check' })}
                                ${Button({ id: 'oCancelActionBtn', label: 'Cancelar orçamento', icon: 'x', variant: 'danger' })}
                            ` : ''}
                            ${o.status !== 'Pendente' ? `<p class="form-note" style="margin:0">${o.status === 'Cancelado' ? 'Este orçamento foi cancelado e não pode mais ser alterado.' : 'Este orçamento já foi aprovado e não pode mais ser alterado.'}</p>` : ''}
                            ${Button({ id: 'oVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
                        </div>
                    </div>
                </div>
            `;

            const editBtn = container.querySelector('#oEditActionBtn');
            if (editBtn) editBtn.addEventListener('click', () => Router.navigate(`#/orcamentos/${o.id}/editar`));
            const approveBtn = container.querySelector('#oApproveBtn');
            if (approveBtn) approveBtn.addEventListener('click', () => aprovarOrcamento(o, render));
            const cancelBtn = container.querySelector('#oCancelActionBtn');
            if (cancelBtn) cancelBtn.addEventListener('click', () => cancelarOrcamento(o, render));
            const verOpBtn = container.querySelector('#verOpBtn');
            if (verOpBtn) verOpBtn.addEventListener('click', () => Router.navigate(`#/producao/${opGerada.id}`));
            container.querySelector('#oVoltarBtn').addEventListener('click', () => Router.navigate('#/orcamentos'));
        }
        render();
    }

    return { listView, formView, viewView, calcTotais, calcItem, clienteNome, produtoNome };
})();
