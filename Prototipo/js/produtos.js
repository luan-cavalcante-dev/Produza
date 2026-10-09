/* ==========================================================
   PRODUTOS
   ========================================================== */
const Produtos = (() => {

    function listView(container) {
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Produtos' }])}
            ${renderPageHeader('box', 'Produtos')}
            <div class="toolbar">
                ${SearchBar('pSearch', 'Pesquisar produto...')}
                ${Button({ id: 'pCadastrarBtn', label: 'Cadastrar produto', icon: 'plus' })}
            </div>
            <div class="card" style="padding:0;overflow:hidden" id="pResultsCard"></div>
        `;
        const resultsCard = container.querySelector('#pResultsCard');
        const input = container.querySelector('#pSearch');
        const clearBtn = container.querySelector('#pSearchClear');

        function renderResults(term) {
            if (!term) { resultsCard.innerHTML = PromptState('Digite algum caractere para pesquisar produtos.'); return; }
            const t = term.trim().toLowerCase();
            const list = DB.get().produtos.filter(p => p.nome.toLowerCase().includes(t));
            if (list.length === 0) { resultsCard.innerHTML = EmptyState('Nenhum produto encontrado.'); return; }
            resultsCard.innerHTML = `
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Produto</th><th>Preço base</th><th>Tamanhos</th><th>Status</th><th></th></tr></thead>
                    <tbody>${list.map(p => `
                        <tr>
                            <td><div class="cell-name"><span class="cell-avatar">${Icon.box}</span><div class="cell-main">${p.nome}</div></div></td>
                            <td>${fmtMoney(p.precoBase)}</td>
                            <td>${p.tamanhos && p.tamanhos.length ? p.tamanhos.map(t => t.tam).join(', ') : 'Único'}</td>
                            <td>${StatusBadge(p.status)}</td>
                            <td>${rowActionsMenu(p.id, [
                                { label: 'Visualizar', icon: 'eye', action: 'view' },
                                { label: 'Editar', icon: 'pencil', action: 'edit' },
                                { label: p.status === 'Inativo' ? 'Ativar' : 'Inativar', icon: p.status === 'Inativo' ? 'check' : 'alertTriangle', action: 'toggleStatus', danger: p.status !== 'Inativo' }
                            ])}</td>
                        </tr>`).join('')}</tbody>
                </table></div>
                <div style="padding:0 var(--space-4) var(--space-4)">${tableFooter(list.length)}</div>
            `;
        }
        renderResults('');
        input.addEventListener('input', () => { clearBtn.classList.toggle('show', !!input.value); renderResults(input.value); });
        clearBtn.addEventListener('click', () => { input.value = ''; clearBtn.classList.remove('show'); renderResults(''); input.focus(); });
        container.querySelector('#pCadastrarBtn').addEventListener('click', () => Router.navigate('#/produtos/cadastro'));

        resultsCard.addEventListener('click', (e) => {
            const trigger = e.target.closest('.row-menu-trigger');
            if (trigger) { toggleRowMenu(trigger.dataset.menuId, trigger); return; }
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const id = Number(actionBtn.dataset.id);
                const action = actionBtn.dataset.action;
                if (action === 'view') Router.navigate(`#/produtos/${id}`);
                if (action === 'edit') Router.navigate(`#/produtos/${id}/editar`);
                if (action === 'toggleStatus') {
                    const p = DB.get().produtos.find(x => x.id === id);
                    const novoStatus = p.status === 'Inativo' ? 'Ativo' : 'Inativo';
                    p.status = novoStatus;
                    DB.persist();
                    showToast(`Produto ${novoStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso.`, 'success');
                    renderResults(input.value);
                }
            }
        });
    }

    const TAMANHOS_PADRAO = ['P', 'M', 'G', 'GG'];

    function emptyData() {
        return { nome: '', descricao: '', precoBase: '', status: 'Ativo', tamanhos: [], descontos: [] };
    }

    function validarOrdemTamanhos(tamanhos) {
        const padronizados = tamanhos
            .map(t => ({ tam: (t.tam || '').trim().toUpperCase(), preco: Number(t.preco) }))
            .filter(t => TAMANHOS_PADRAO.includes(t.tam))
            .sort((a, b) => TAMANHOS_PADRAO.indexOf(a.tam) - TAMANHOS_PADRAO.indexOf(b.tam));
        for (let i = 1; i < padronizados.length; i++) {
            if (padronizados[i].preco < padronizados[i - 1].preco) {
                return `O preço do tamanho "${padronizados[i].tam}" não pode ser menor que o do tamanho "${padronizados[i - 1].tam}".`;
            }
        }
        return null;
    }

    function validarDescontos(descontos) {
        const ordenado = descontos.map(d => ({ qtd: Number(d.qtd), perc: Number(d.perc) })).sort((a, b) => a.qtd - b.qtd);
        for (let i = 1; i < ordenado.length; i++) {
            if (ordenado[i].perc < ordenado[i - 1].perc) {
                return `A regra de ${ordenado[i].qtd} unidades (${ordenado[i].perc}%) não pode ter desconto menor que a regra de ${ordenado[i - 1].qtd} unidades (${ordenado[i - 1].perc}%).`;
            }
        }
        return null;
    }

    // Bloqueia ativamente valores inconsistentes: a % nunca pode ficar menor que a de uma faixa de
    // quantidade menor, nem maior que a de uma faixa de quantidade maior. Retorna true se ajustou.
    // IMPORTANTE: só ajusta a linha informada (index), nunca as demais — a invariante é mantida
    // incrementalmente a cada edição, então não é necessário (nem correto) reprocessar tudo em cascata
    // no momento de salvar, o que faria os valores convergirem todos para o mesmo número.
    function clampDesconto(descontos, index) {
        const atual = descontos[index];
        const qtd = Number(atual.qtd);
        let minPermitido = -Infinity, maxPermitido = Infinity;
        descontos.forEach((d, i) => {
            if (i === index) return;
            const oq = Number(d.qtd), op = Number(d.perc);
            if (oq <= qtd && op > minPermitido) minPermitido = op;
            if (oq >= qtd && op < maxPermitido) maxPermitido = op;
        });
        let perc = Number(atual.perc);
        let ajustado = false;
        if (minPermitido !== -Infinity && perc < minPermitido) { perc = minPermitido; ajustado = true; }
        if (maxPermitido !== Infinity && perc > maxPermitido) { perc = maxPermitido; ajustado = true; }
        if (ajustado) atual.perc = perc;
        return ajustado;
    }

    // Mesma lógica para o preço dos tamanhos padrão (P, M, G, GG): bloqueia ativamente preço menor
    // que o de um tamanho menor, ou maior que o de um tamanho maior. Tamanhos não-padrão (digitados
    // livremente pelo usuário) ficam de fora dessa regra. Ajusta somente a linha editada.
    function clampTamanhoPreco(tamanhos, index) {
        const atual = tamanhos[index];
        const tam = (atual.tam || '').trim().toUpperCase();
        if (!TAMANHOS_PADRAO.includes(tam)) return false;
        const idxPadrao = TAMANHOS_PADRAO.indexOf(tam);
        let minPermitido = -Infinity, maxPermitido = Infinity;
        tamanhos.forEach((t, i) => {
            if (i === index) return;
            const tTam = (t.tam || '').trim().toUpperCase();
            if (!TAMANHOS_PADRAO.includes(tTam)) return;
            const tIdx = TAMANHOS_PADRAO.indexOf(tTam);
            const preco = Number(t.preco);
            if (tIdx < idxPadrao && preco > minPermitido) minPermitido = preco;
            if (tIdx > idxPadrao && preco < maxPermitido) maxPermitido = preco;
        });
        let preco = Number(atual.preco);
        let ajustado = false;
        if (minPermitido !== -Infinity && preco < minPermitido) { preco = minPermitido; ajustado = true; }
        if (maxPermitido !== Infinity && preco > maxPermitido) { preco = maxPermitido; ajustado = true; }
        if (ajustado) atual.preco = preco;
        return ajustado;
    }

    function formView(container, id) {
        const isEdit = !!id;
        const original = isEdit ? DB.get().produtos.find(p => p.id === Number(id)) : null;
        const data = isEdit ? JSON.parse(JSON.stringify(original || {})) : emptyData();
        if (isEdit && !original) { container.innerHTML = ErrorState('Produto não encontrado.'); return; }

        let tamanhos = data.tamanhos && data.tamanhos.length ? data.tamanhos : [];
        let descontos = data.descontos && data.descontos.length ? data.descontos : [];
        let similarConfirmado = false;

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Produtos', route: '#/produtos' }, { label: isEdit ? 'Editar Produto' : 'Cadastro de Produto' }])}
            ${renderPageHeader('box', isEdit ? 'Editar Produto' : 'Cadastro de Produto')}
            <form id="prodForm" novalidate>
                <div class="card">
                    <div class="card-section-title">${Icon.box} Informações</div>
                    <div class="form-grid">
                        <div class="form-field span-2">
                            <label for="pNome">Nome <span class="req">*</span></label>
                            <input class="input" id="pNome" placeholder="Digite o nome do produto" value="${data.nome}" autocomplete="off">
                            <span class="field-error" id="err-pNome">Nome é obrigatório.</span>
                            <span class="field-hint" id="warn-pNome" style="display:none;color:var(--color-warning)"></span>
                        </div>
                        <div class="form-field">
                            <label for="pStatus">Status</label>
                            <select class="input" id="pStatus">
                                <option value="Ativo" ${data.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                                <option value="Inativo" ${data.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                            </select>
                        </div>
                        <div class="form-field span-3">
                            <label for="pDescricao">Descrição</label>
                            <input class="input" id="pDescricao" placeholder="Descrição do produto" value="${data.descricao || ''}">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-section-title">${iconEl('doc')} Preço</div>
                    <div class="form-grid cols-2">
                        <div class="form-field">
                            <label for="pPreco">Preço base <span class="req">*</span></label>
                            <input class="input" id="pPreco" type="number" min="0" step="0.01" placeholder="0,00" value="${data.precoBase}">
                            <span class="field-error" id="err-pPreco">Informe um preço válido.</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-section-title">${iconEl('box')} Tamanhos / Dimensões</div>
                    <p class="form-note" style="margin-bottom:var(--space-3)">Adicione variações de tamanho, cada uma com seu próprio preço. Para tamanhos padrão (P, M, G, GG), o preço não pode diminuir conforme o tamanho aumenta. Se nenhum tamanho for cadastrado, o produto usará o tamanho "Único" com o preço base.</p>
                    <span class="field-error" id="err-tamanhos"></span>
                    <div id="tamanhosList"></div>
                    <div class="item-add-row">${Button({ id: 'addTamanhoBtn', label: 'Adicionar tamanho', icon: 'plus', variant: 'secondary', type: 'button' })}</div>
                </div>

                <div class="card">
                    <div class="card-section-title">${iconEl('chart')} Descontos por quantidade</div>
                    <p class="form-note" style="margin-bottom:var(--space-3)">Configure faixas de desconto por quantidade adquirida. O percentual é ajustado automaticamente para nunca ser menor que o de uma faixa de quantidade inferior.</p>
                    <div id="descontosList"></div>
                    <div class="item-add-row">${Button({ id: 'addDescontoBtn', label: 'Adicionar regra', icon: 'plus', variant: 'secondary', type: 'button' })}</div>
                </div>

                <p class="form-note">* Campos obrigatórios</p>
                <div class="form-actions">
                    ${Button({ id: 'pCancelBtn', label: 'Cancelar', variant: 'secondary', icon: 'x', type: 'button' })}
                    ${Button({ id: 'pSaveBtn', label: 'Salvar', variant: 'primary', icon: 'check', type: 'submit' })}
                </div>
            </form>
        `;

        const nomeInput = container.querySelector('#pNome');
        const nomeWarn = container.querySelector('#warn-pNome');
        function checkNomeSimilaridade() {
            const outros = DB.get().produtos.filter(p => !isEdit || p.id !== Number(id)).map(p => p.nome);
            const exato = findExactName(nomeInput.value, outros);
            if (exato) {
                nomeWarn.style.display = 'block';
                nomeWarn.style.color = 'var(--color-danger)';
                nomeWarn.textContent = `Já existe um produto cadastrado com este nome: "${exato}".`;
                return 'exato';
            }
            const similar = findSimilarName(nomeInput.value, outros);
            if (similar) {
                nomeWarn.style.display = 'block';
                nomeWarn.style.color = 'var(--color-warning)';
                nomeWarn.textContent = `Já existe um produto parecido cadastrado: "${similar}". Verifique se não é duplicado.`;
                return 'similar';
            }
            nomeWarn.style.display = 'none';
            return null;
        }
        nomeInput.addEventListener('input', () => { similarConfirmado = false; checkNomeSimilaridade(); });

        const tamanhosList = container.querySelector('#tamanhosList');
        const descontosList = container.querySelector('#descontosList');
        const errTamanhos = container.querySelector('#err-tamanhos');

        function renderTamanhos() {
            errTamanhos.classList.remove('show');
            if (!tamanhos.length) { tamanhosList.innerHTML = `<p class="form-note" style="margin:0 0 var(--space-2)">Nenhum tamanho cadastrado — será aplicado o tamanho "Único".</p>`; return; }
            tamanhosList.innerHTML = `<div class="form-grid cols-2">` + tamanhos.map((t, i) => `
                <div class="form-field" style="grid-column:span 1;flex-direction:row;align-items:flex-end;gap:8px">
                    <div style="flex:1"><label>Tamanho</label><input class="input tam-tam" data-i="${i}" value="${t.tam}" placeholder="Ex: P, M, G, 38..."></div>
                    <div style="flex:1"><label>Preço</label><input class="input tam-preco" data-i="${i}" type="number" min="0" step="0.01" value="${t.preco}"></div>
                    <button type="button" class="icon-btn item-row-remove tam-remove" data-i="${i}">${Icon.trash}</button>
                </div>
            `).join('') + `</div>`;
        }
        function renderDescontos() {
            if (!descontos.length) { descontosList.innerHTML = `<p class="form-note" style="margin:0 0 var(--space-2)">Nenhuma regra cadastrada.</p>`; return; }
            descontosList.innerHTML = `<div class="form-grid cols-2">` + descontos.map((d, i) => `
                <div class="form-field" style="grid-column:span 1;flex-direction:row;align-items:flex-end;gap:8px">
                    <div style="flex:1"><label>A partir de (unid.)</label><input class="input desc-qtd" data-i="${i}" type="number" min="1" value="${d.qtd}"></div>
                    <div style="flex:1"><label>Desconto (%)</label><input class="input desc-perc" data-i="${i}" type="number" min="0" max="100" value="${d.perc}"></div>
                    <button type="button" class="icon-btn item-row-remove desc-remove" data-i="${i}">${Icon.trash}</button>
                </div>
            `).join('') + `</div>`;
        }
        renderTamanhos(); renderDescontos();

        tamanhosList.addEventListener('input', (e) => {
            const i = Number(e.target.dataset.i);
            if (e.target.classList.contains('tam-tam')) tamanhos[i].tam = e.target.value;
            if (e.target.classList.contains('tam-preco')) tamanhos[i].preco = Number(e.target.value);
        });
        tamanhosList.addEventListener('blur', (e) => {
            const i = Number(e.target.dataset.i);
            if (isNaN(i)) return;
            if (e.target.classList.contains('tam-preco') || e.target.classList.contains('tam-tam')) {
                const ajustado = clampTamanhoPreco(tamanhos, i);
                if (ajustado) {
                    showToast(`Preço do tamanho "${tamanhos[i].tam}" ajustado automaticamente para ${fmtMoney(tamanhos[i].preco)} para respeitar a ordem de tamanhos.`, 'error');
                    renderTamanhos();
                }
            }
        }, true);
        tamanhosList.addEventListener('click', (e) => {
            const btn = e.target.closest('.tam-remove');
            if (btn) { tamanhos.splice(Number(btn.dataset.i), 1); renderTamanhos(); }
        });
        container.querySelector('#addTamanhoBtn').addEventListener('click', () => {
            const next = TAMANHOS_PADRAO.find(t => !tamanhos.some(x => x.tam === t)) || '';
            tamanhos.push({ tam: next, preco: Number(container.querySelector('#pPreco').value) || 0 });
            clampTamanhoPreco(tamanhos, tamanhos.length - 1);
            renderTamanhos();
        });

        descontosList.addEventListener('input', (e) => {
            const i = Number(e.target.dataset.i);
            if (e.target.classList.contains('desc-qtd')) descontos[i].qtd = Number(e.target.value) || 0;
            if (e.target.classList.contains('desc-perc')) descontos[i].perc = Number(e.target.value) || 0;
        });
        descontosList.addEventListener('blur', (e) => {
            const i = Number(e.target.dataset.i);
            if (isNaN(i)) return;
            if (e.target.classList.contains('desc-perc') || e.target.classList.contains('desc-qtd')) {
                const ajustado = clampDesconto(descontos, i);
                if (ajustado) {
                    showToast(`Percentual ajustado automaticamente para ${descontos[i].perc}% para manter o desconto crescente conforme a quantidade.`, 'error');
                    renderDescontos();
                }
            }
        }, true);
        descontosList.addEventListener('click', (e) => {
            const btn = e.target.closest('.desc-remove');
            if (btn) { descontos.splice(Number(btn.dataset.i), 1); renderDescontos(); }
        });
        container.querySelector('#addDescontoBtn').addEventListener('click', () => {
            const maiorQtd = descontos.reduce((m, d) => Math.max(m, Number(d.qtd) || 0), 0);
            const maiorPerc = descontos.reduce((m, d) => Math.max(m, Number(d.perc) || 0), 0);
            descontos.push({ qtd: maiorQtd + 10, perc: maiorPerc + 5 > 100 ? 100 : maiorPerc + 5 });
            renderDescontos();
        });

        container.querySelector('#pCancelBtn').addEventListener('click', () => Router.navigate('#/produtos'));

        function persistirProduto() {
            const nome = container.querySelector('#pNome');
            const saveBtn = container.querySelector('#pSaveBtn');
            saveBtn.classList.add('loading');
            setTimeout(() => {
                const db = DB.get();
                const record = {
                    nome: nome.value.trim(), descricao: container.querySelector('#pDescricao').value.trim(),
                    precoBase: Number(container.querySelector('#pPreco').value), status: container.querySelector('#pStatus').value,
                    tamanhos: tamanhos.filter(t => t.tam), descontos: descontos.filter(d => d.qtd > 0)
                };
                if (isEdit) {
                    Object.assign(original, record);
                } else {
                    record.id = DB.nextId('produto');
                    db.produtos.push(record);
                }
                DB.persist();
                saveBtn.classList.remove('loading');
                showToast(isEdit ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.', 'success');
                Router.navigate('#/produtos');
            }, 400);
        }

        container.querySelector('#prodForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = container.querySelector('#pNome');
            const preco = container.querySelector('#pPreco');
            const nomeOk = nome.value.trim().length > 0;
            const precoOk = preco.value !== '' && Number(preco.value) > 0;
            nome.classList.toggle('error', !nomeOk); container.querySelector('#err-pNome').classList.toggle('show', !nomeOk);
            preco.classList.toggle('error', !precoOk); container.querySelector('#err-pPreco').classList.toggle('show', !precoOk);

            // Os campos de tamanho/preço e quantidade/desconto já são corrigidos ativamente a cada
            // edição (no blur), então aqui fazemos apenas uma checagem final — sem reprocessar/mutar
            // todas as linhas, o que poderia fazer os valores convergirem incorretamente.
            const tamErro = validarOrdemTamanhos(tamanhos);
            errTamanhos.textContent = tamErro || '';
            errTamanhos.classList.toggle('show', !!tamErro);

            const descErro = validarDescontos(descontos);

            if (!nomeOk || !precoOk || tamErro || descErro) {
                if (descErro) showToast(descErro, 'error'); else showToast('Verifique os campos destacados.', 'error');
                return;
            }

            const nomeStatus = checkNomeSimilaridade();
            if (nomeStatus === 'exato') { showToast('Já existe um produto com este nome.', 'error'); return; }
            if (nomeStatus === 'similar' && !similarConfirmado) {
                confirmModal({
                    title: 'Nome semelhante encontrado',
                    body: nomeWarn.textContent + ' Deseja salvar mesmo assim?',
                    confirmLabel: 'Salvar mesmo assim',
                    onConfirm: () => { similarConfirmado = true; persistirProduto(); }
                });
                return;
            }
            persistirProduto();
        });
    }

    /* ---------- VISUALIZAÇÃO (somente leitura, mesma estrutura do cadastro) ---------- */
    function viewView(container, id) {
        const p = DB.get().produtos.find(x => x.id === Number(id));
        if (!p) { container.innerHTML = ErrorState('Produto não encontrado.'); return; }

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Produtos', route: '#/produtos' }, { label: p.nome }])}
            <div class="page-title-row">
                <div class="page-header" style="margin-bottom:0"><span class="page-icon">${Icon.box}</span><h1>${p.nome}</h1></div>
                ${StatusBadge(p.status)}
            </div>

            <div class="card">
                <div class="card-section-title">${Icon.box} Informações</div>
                <div class="form-grid">
                    <div class="form-field span-2"><label>Nome</label><input class="input" value="${p.nome}" readonly></div>
                    <div class="form-field"><label>Status</label><input class="input" value="${p.status}" readonly></div>
                    <div class="form-field span-3"><label>Descrição</label><input class="input" value="${p.descricao || 'Não informado'}" readonly></div>
                </div>
            </div>

            <div class="card">
                <div class="card-section-title">${iconEl('doc')} Preço</div>
                <div class="form-grid cols-2">
                    <div class="form-field"><label>Preço base</label><input class="input" value="${fmtMoney(p.precoBase)}" readonly></div>
                </div>
            </div>

            <div class="card">
                <div class="card-section-title">${iconEl('box')} Tamanhos / Dimensões</div>
                ${p.tamanhos && p.tamanhos.length ? `<div class="form-grid cols-2">${p.tamanhos.map(t => `
                    <div class="form-field" style="grid-column:span 1;flex-direction:row;align-items:flex-end;gap:8px">
                        <div style="flex:1"><label>Tamanho</label><input class="input" value="${t.tam}" readonly></div>
                        <div style="flex:1"><label>Preço</label><input class="input" value="${fmtMoney(t.preco)}" readonly></div>
                    </div>`).join('')}</div>` : `<p class="form-note" style="margin:0">Nenhum tamanho cadastrado — aplica-se o tamanho "Único".</p>`}
            </div>

            <div class="card">
                <div class="card-section-title">${iconEl('chart')} Descontos por quantidade</div>
                ${p.descontos && p.descontos.length ? `<div class="form-grid cols-2">${p.descontos.map(d => `
                    <div class="form-field" style="grid-column:span 1;flex-direction:row;align-items:flex-end;gap:8px">
                        <div style="flex:1"><label>A partir de (unid.)</label><input class="input" value="${d.qtd}" readonly></div>
                        <div style="flex:1"><label>Desconto (%)</label><input class="input" value="${d.perc}%" readonly></div>
                    </div>`).join('')}</div>` : `<p class="form-note" style="margin:0">Nenhuma regra cadastrada.</p>`}
            </div>

            <div class="form-actions">
                ${Button({ id: 'pVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
            </div>
        `;
        container.querySelector('#pVoltarBtn').addEventListener('click', () => Router.navigate('#/produtos'));
    }

    return { listView, formView, viewView, validarOrdemTamanhos, validarDescontos, clampDesconto };
})();
