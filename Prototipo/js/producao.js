/* ==========================================================
   PRODUÇÃO
   ========================================================== */
const Producao = (() => {

    const ETAPAS_PADRAO = ['Corte', 'Costura', 'Acabamento', 'Revisão', 'Finalizado'];

    function clienteNome(id) { if (!id) return 'Não informado'; const c = DB.get().clientes.find(x => x.id === id); return c ? c.nome : '—'; }
    function produtoResumo(op) {
        return op.itens.map(it => `${Orcamentos.produtoNome(it.produtoId)} (${it.tamanho || 'Único'}) x${it.qtd}`).join(', ');
    }
    function emAberto(op) { return op.status !== 'Finalizada' && op.status !== 'Cancelada'; }

    function avancarEtapa(op, onDone) {
        const nextIdx = Math.min(op.etapaAtualIdx + 1, op.etapas.length - 1);
        openModal({
            title: 'Avançar etapa da produção',
            body: `
                <div class="form-field" style="margin-bottom:var(--space-3)">
                    <label>Nova etapa</label>
                    <select class="input" id="modalEtapaSel">${op.etapas.map((et, i) => `<option value="${i}" ${i === nextIdx ? 'selected' : ''}>${et}</option>`).join('')}</select>
                </div>
                <div class="form-field" style="margin-bottom:var(--space-3)">
                    <label>Previsão de finalização</label>
                    <input class="input" id="modalPrevisao" type="date" value="${op.previsao}">
                </div>
                <div class="form-field">
                    <label>Observação</label>
                    <input class="input" id="modalObs" placeholder="Observação (opcional)">
                </div>
            `,
            actions: `<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalConfirmBtn">Salvar atualização</button>`
        });
        document.getElementById('modalCancelBtn').onclick = closeModal;
        document.getElementById('modalConfirmBtn').onclick = () => {
            const idx = Number(document.getElementById('modalEtapaSel').value);
            const previsao = document.getElementById('modalPrevisao').value;
            const obs = document.getElementById('modalObs').value.trim();
            op.etapaAtualIdx = idx;
            op.previsao = previsao || op.previsao;
            op.status = idx >= op.etapas.length - 1 ? 'Finalizada' : 'Em produção';
            op.historico.push({ data: todayIso(), status: op.status, obs });
            DB.persist();
            closeModal();
            showToast('O status da produção foi atualizado.', 'success');
            onDone && onDone();
        };
    }

    function cancelarOrdem(op, onDone) {
        confirmModal({
            title: 'Cancelar ordem de produção',
            body: `Deseja realmente cancelar a ordem ${op.numero}? O histórico será mantido.`,
            confirmLabel: 'Cancelar ordem', danger: true,
            onConfirm: () => {
                op.status = 'Cancelada';
                op.historico.push({ data: todayIso(), status: 'Cancelada', obs: '' });
                DB.persist();
                showToast('Ordem de produção cancelada.', 'success');
                onDone && onDone();
            }
        });
    }

    function listView(container) {
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Produção' }])}
            ${renderPageHeader('factory', 'Produção')}
            <div class="toolbar">
                ${SearchBar('prSearch', 'Pesquisar por número ou cliente...')}
                <div class="toolbar-filters">
                    <select class="input" id="prStatusFilter" style="width:160px">
                        <option value="">Todos status</option>
                        <option value="Criada">Criada</option>
                        <option value="Em produção">Em produção</option>
                        <option value="Pausada">Pausada</option>
                        <option value="Finalizada">Finalizada</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>
                </div>
                ${Button({ id: 'prNovaBtn', label: 'Nova ordem', icon: 'plus' })}
            </div>
            <div class="card" style="padding:0;overflow:hidden" id="prResultsCard"></div>
        `;
        const resultsCard = container.querySelector('#prResultsCard');
        const input = container.querySelector('#prSearch');
        const clearBtn = container.querySelector('#prSearchClear');
        const statusFilter = container.querySelector('#prStatusFilter');

        function renderResults() {
            const term = input.value.trim().toLowerCase();
            let list = DB.get().producao.slice().sort((a, b) => b.id - a.id);
            if (statusFilter.value) list = list.filter(o => o.status === statusFilter.value);
            if (term) list = list.filter(o => o.numero.toLowerCase().includes(term) || clienteNome(o.clienteId).toLowerCase().includes(term));
            if (list.length === 0) { resultsCard.innerHTML = EmptyState('Nenhuma ordem de produção encontrada.'); return; }
            resultsCard.innerHTML = `
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Número</th><th>Cliente</th><th>Produto</th><th>Status</th><th>Previsão</th><th></th></tr></thead>
                    <tbody>${list.map(o => `
                        <tr>
                            <td><strong>${o.numero}</strong></td>
                            <td>${clienteNome(o.clienteId)}</td>
                            <td>${produtoResumo(o)}</td>
                            <td>${StatusBadge(o.status)}</td>
                            <td>${fmtDate(o.previsao)}</td>
                            <td>${rowActionsMenu(o.id, [
                                { label: 'Visualizar', icon: 'eye', action: 'view' },
                                ...(emAberto(o) ? [
                                    { label: 'Editar', icon: 'pencil', action: 'edit' },
                                    { label: 'Avançar etapa', icon: 'chevronRight', action: 'advance' },
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
        container.querySelector('#prNovaBtn').addEventListener('click', () => Router.navigate('#/producao/nova'));

        resultsCard.addEventListener('click', (e) => {
            const trigger = e.target.closest('.row-menu-trigger');
            if (trigger) { toggleRowMenu(trigger.dataset.menuId, trigger); return; }
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const id = Number(actionBtn.dataset.id);
                const action = actionBtn.dataset.action;
                const op = DB.get().producao.find(x => x.id === id);
                if (action === 'view') Router.navigate(`#/producao/${id}`);
                if (action === 'edit') Router.navigate(`#/producao/${id}/editar`);
                if (action === 'advance') avancarEtapa(op, renderResults);
                if (action === 'cancel') cancelarOrdem(op, renderResults);
            }
        });
    }

    function precoFor(produto, tamanho) {
        if (produto.tamanhos && produto.tamanhos.length) {
            const t = produto.tamanhos.find(x => x.tam === tamanho);
            return t ? t.preco : produto.precoBase;
        }
        return produto.precoBase;
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

    function formView(container, id) {
        const isEdit = !!id;
        const op = isEdit ? DB.get().producao.find(x => x.id === Number(id)) : null;
        if (isEdit && (!op || !emAberto(op))) { container.innerHTML = ErrorState('Esta ordem de produção não pode ser editada.'); return; }

        let itens = isEdit ? JSON.parse(JSON.stringify(op.itens)) : [];
        let clienteId = isEdit ? op.clienteId : null;

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Produção', route: '#/producao' }, { label: isEdit ? `Editar ${op.numero}` : 'Nova Ordem de Produção' }])}
            ${renderPageHeader('factory', isEdit ? `Editar Ordem ${op.numero}` : 'Nova Ordem de Produção')}
            <div class="card">
                <div class="card-section-title">${Icon.user} Cliente</div>
                <p class="form-note" style="margin-bottom:var(--space-3)">Opcional — informe quando a ordem estiver vinculada a um cliente específico.</p>
                <div id="clientPickerContainer"></div>
            </div>
            <div class="card">
                <div class="card-section-title">${Icon.box} Produtos</div>
                <div id="productPickerContainer" style="margin-bottom:var(--space-4)"></div>
                <div class="table-wrap"><table class="data-table" id="itensTable">
                    <thead><tr><th>Produto</th><th>Tamanho</th><th>Qtd.</th><th>Vlr. unit.</th><th>Desc.</th><th></th></tr></thead>
                    <tbody id="itensBody"></tbody>
                </table></div>
                <span class="field-error" id="err-itens">Adicione ao menos um produto.</span>
            </div>
            <div class="card">
                <div class="card-section-title">${iconEl('doc')} Previsão de finalização</div>
                <div class="form-grid cols-2">
                    <div class="form-field"><label for="prPrevisao">Previsão de finalização <span class="req">*</span></label>
                        <input class="input" id="prPrevisao" type="date" value="${op ? op.previsao : ''}">
                        <span class="field-error" id="err-prPrevisao">Informe a previsão de finalização.</span>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                ${Button({ id: 'prCancelBtn', label: 'Cancelar', variant: 'secondary', icon: 'x', type: 'button' })}
                ${Button({ id: 'prSaveBtn', label: isEdit ? 'Salvar alterações' : 'Criar ordem de produção', icon: 'check' })}
            </div>
        `;

        const clientPicker = createClientPicker(container.querySelector('#clientPickerContainer'), {
            selectedId: clienteId,
            onSelect: (newId) => { clienteId = newId; }
        });

        const itensBody = container.querySelector('#itensBody');
        const errItens = container.querySelector('#err-itens');

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

        function renderItens() {
            errItens.classList.remove('show');
            if (!itens.length) {
                itensBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--color-text-secondary);padding:var(--space-5)">Nenhum produto adicionado. Use a busca acima para adicionar.</td></tr>`;
                return;
            }
            itensBody.innerHTML = itens.map((it, i) => {
                const produto = DB.get().produtos.find(p => p.id === it.produtoId);
                return `<tr>
                    <td>${produto ? produto.nome : '—'}</td>
                    <td><select class="input item-tamanho" data-i="${i}" style="width:80px">${tamanhoOptions(produto, it.tamanho, i)}</select></td>
                    <td><input class="input item-qtd" data-i="${i}" type="number" min="1" value="${it.qtd}" style="width:70px"></td>
                    <td>${fmtMoney(it.precoUnit)}</td>
                    <td>${it.descontoPerc}%</td>
                    <td><button type="button" class="icon-btn item-row-remove item-remove" data-i="${i}">${Icon.trash}</button></td>
                </tr>`;
            }).join('');
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

        container.querySelector('#prCancelBtn').addEventListener('click', () => Router.navigate(isEdit ? `#/producao/${id}` : '#/producao'));
        container.querySelector('#prSaveBtn').addEventListener('click', () => {
            const previsaoInput = container.querySelector('#prPrevisao');
            const previsaoOk = !!previsaoInput.value;
            previsaoInput.classList.toggle('error', !previsaoOk);
            container.querySelector('#err-prPrevisao').classList.toggle('show', !previsaoOk);
            errItens.classList.toggle('show', itens.length === 0);
            if (!previsaoOk || itens.length === 0) { showToast('Verifique os campos destacados.', 'error'); return; }

            const saveBtn = container.querySelector('#prSaveBtn');
            saveBtn.classList.add('loading');
            setTimeout(() => {
                const db = DB.get();
                if (isEdit) {
                    op.clienteId = clientPicker.getSelectedId();
                    op.itens = itens;
                    op.previsao = previsaoInput.value;
                } else {
                    const seq = DB.nextId('producao');
                    db.producao.push({
                        id: seq, numero: 'OP-' + String(seq).padStart(4, '0'), origemOrcamentoId: null,
                        clienteId: clientPicker.getSelectedId(), itens, status: 'Criada', previsao: previsaoInput.value,
                        etapaAtualIdx: 0, etapas: ETAPAS_PADRAO.slice(),
                        historico: [{ data: todayIso(), status: 'Criada', obs: 'Ordem criada diretamente.' }]
                    });
                }
                DB.persist();
                saveBtn.classList.remove('loading');
                showToast(isEdit ? 'Ordem de produção atualizada com sucesso.' : 'Ordem de produção criada com sucesso.', 'success');
                Router.navigate('#/producao');
            }, 400);
        });
    }

    function viewView(container, id) {
        const op = DB.get().producao.find(x => x.id === Number(id));
        if (!op) { container.innerHTML = ErrorState('Ordem de produção não encontrada.'); return; }

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Produção', route: '#/producao' }, { label: op.numero }])}
            <div class="page-title-row">
                <div class="page-header" style="margin-bottom:0"><span class="page-icon">${Icon.factory}</span><h1>Ordem ${op.numero}</h1></div>
                ${StatusBadge(op.status)}
            </div>
            <div class="view-grid">
                <div>
                    <div class="card">
                        <div class="card-section-title">${Icon.factory} Etapas de produção</div>
                        <div class="stepper">${op.etapas.map((et, i) => {
                            const cls = i < op.etapaAtualIdx ? 'done' : (i === op.etapaAtualIdx ? 'current' : '');
                            return `<div class="step ${cls}"><div class="step-line"></div><div class="step-dot">${i < op.etapaAtualIdx ? Icon.check : (i + 1)}</div><div class="step-label">${et}</div></div>`;
                        }).join('')}</div>
                    </div>
                    <div class="card">
                        <div class="card-section-title">${Icon.box} Itens</div>
                        <div class="table-wrap"><table class="data-table">
                            <thead><tr><th>Produto</th><th>Tam.</th><th>Qtd.</th><th>Vlr. unit.</th><th>Desc.</th></tr></thead>
                            <tbody>${op.itens.map(it => `
                                <tr><td>${Orcamentos.produtoNome(it.produtoId)}</td><td>${it.tamanho || 'Único'}</td><td>${it.qtd}</td><td>${fmtMoney(it.precoUnit)}</td><td>${it.descontoPerc}%</td></tr>
                            `).join('')}</tbody>
                        </table></div>
                    </div>
                    <div class="card">
                        <div class="card-section-title">${iconEl('doc')} Histórico</div>
                        ${op.historico.slice().reverse().map(h => `
                            <div class="detail-row"><span>${fmtDate(h.data)} — ${h.status}${h.obs ? ' · ' + h.obs : ''}</span><span></span></div>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <div class="card">
                        <div class="card-section-title">${Icon.doc} Dados da ordem</div>
                        <div class="detail-row"><span>Cliente</span><span>${clienteNome(op.clienteId)}</span></div>
                        <div class="detail-row"><span>Previsão</span><span>${fmtDate(op.previsao)}</span></div>
                        ${op.origemOrcamentoId ? `<div class="detail-row"><span>Origem</span><span>Orçamento #${String(op.origemOrcamentoId).padStart(4, '0')}</span></div>` : `<div class="detail-row"><span>Origem</span><span>Direta</span></div>`}
                    </div>
                    <div class="form-actions" style="margin-top:0">
                        ${Button({ id: 'opVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
                    </div>
                </div>
            </div>
        `;
        container.querySelector('#opVoltarBtn').addEventListener('click', () => Router.navigate('#/producao'));
    }

    return { listView, formView, viewView, clienteNome, produtoResumo, avancarEtapa, cancelarOrdem };
})();
