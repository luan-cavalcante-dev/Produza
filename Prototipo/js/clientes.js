/* ==========================================================
   CLIENTES
   ========================================================== */
const Clientes = (() => {

    function listView(container) {
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Clientes' }])}
            ${renderPageHeader('user', 'Clientes')}
            <div class="toolbar">
                ${SearchBar('cSearch', 'Pesquisar cliente...')}
                ${Button({ id: 'cCadastrarBtn', label: 'Cadastrar', icon: 'plus' })}
            </div>
            <div class="card" style="padding:0;overflow:hidden" id="cResultsCard"></div>
        `;
        const resultsCard = container.querySelector('#cResultsCard');
        const input = container.querySelector('#cSearch');
        const clearBtn = container.querySelector('#cSearchClear');

        function renderResults(term) {
            if (!term) { resultsCard.innerHTML = PromptState('Digite algum caractere para pesquisar clientes.'); return; }
            const t = term.trim().toLowerCase();
            const list = DB.get().clientes.filter(c => c.nome.toLowerCase().includes(t) || (c.telefone || '').includes(t));
            if (list.length === 0) { resultsCard.innerHTML = EmptyState('Nenhum cliente encontrado.'); return; }
            resultsCard.innerHTML = `
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Status</th><th></th></tr></thead>
                    <tbody>${list.map(c => `
                        <tr>
                            <td><div class="cell-name"><span class="cell-avatar">${Icon.user}</span><div class="cell-main">${c.nome}</div></div></td>
                            <td>${c.telefone || '—'}</td>
                            <td>${c.email || '<span class="cell-sub">Não informado</span>'}</td>
                            <td>${StatusBadge(c.status || 'Ativo')}</td>
                            <td>${rowActionsMenu(c.id, [
                                { label: 'Visualizar', icon: 'eye', action: 'view' },
                                { label: 'Editar', icon: 'pencil', action: 'edit' },
                                { label: c.status === 'Inativo' ? 'Ativar' : 'Inativar', icon: c.status === 'Inativo' ? 'check' : 'alertTriangle', action: 'toggleStatus', danger: c.status !== 'Inativo' }
                            ])}</td>
                        </tr>`).join('')}</tbody>
                </table></div>
                <div style="padding:0 var(--space-4) var(--space-4)">${tableFooter(list.length)}</div>
            `;
        }
        renderResults('');
        input.addEventListener('input', () => { clearBtn.classList.toggle('show', !!input.value); renderResults(input.value); });
        clearBtn.addEventListener('click', () => { input.value = ''; clearBtn.classList.remove('show'); renderResults(''); input.focus(); });
        container.querySelector('#cCadastrarBtn').addEventListener('click', () => Router.navigate('#/clientes/cadastro'));

        resultsCard.addEventListener('click', (e) => {
            const trigger = e.target.closest('.row-menu-trigger');
            if (trigger) { toggleRowMenu(trigger.dataset.menuId, trigger); return; }
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const id = Number(actionBtn.dataset.id);
                const action = actionBtn.dataset.action;
                if (action === 'view') Router.navigate(`#/clientes/${id}`);
                if (action === 'edit') Router.navigate(`#/clientes/${id}/editar`);
                if (action === 'toggleStatus') {
                    const c = DB.get().clientes.find(x => x.id === id);
                    const novoStatus = c.status === 'Inativo' ? 'Ativo' : 'Inativo';
                    c.status = novoStatus;
                    DB.persist();
                    showToast(`Cliente ${novoStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso.`, 'success');
                    renderResults(input.value);
                }
            }
        });
    }

    const ESTADOS = ['GO', 'SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'DF', 'PE'];

    function emptyData() {
        return { nome: '', cpfCnpj: '', telefone: '', telefone2: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', status: 'Ativo' };
    }

    function docDuplicado(digits, excludeId) {
        if (!digits) return null;
        return DB.get().clientes.find(c => c.id !== excludeId && (c.cpfCnpj || '').replace(/\D/g, '') === digits);
    }

    function formView(container, id) {
        const isEdit = !!id;
        const data = isEdit ? DB.get().clientes.find(c => c.id === Number(id)) : emptyData();
        if (isEdit && !data) { container.innerHTML = ErrorState('Cliente não encontrado.'); return; }

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Clientes', route: '#/clientes' }, { label: isEdit ? 'Editar Cliente' : 'Cadastro de Cliente' }])}
            ${renderPageHeader('user', isEdit ? 'Editar Cliente' : 'Cadastro de Cliente')}
            <form id="clientForm" novalidate>
                <div class="card">
                    <div class="card-section-title">${Icon.user} Dados do Cliente</div>
                    <div class="form-grid">
                        <div class="form-field span-2">
                            <label for="cNome">Nome completo <span class="req">*</span></label>
                            <input class="input" id="cNome" placeholder="Digite o nome do cliente" value="${data.nome}">
                            <span class="field-error" id="err-cNome">Nome é obrigatório.</span>
                        </div>
                        <div class="form-field">
                            <label for="cDoc">CPF/CNPJ</label>
                            <input class="input" id="cDoc" placeholder="Documento (opcional)" value="${data.cpfCnpj}">
                            <span class="field-hint" id="hint-cDoc">Digite os números; o formato (CPF ou CNPJ) é detectado automaticamente.</span>
                            <span class="field-error" id="err-cDoc">Já existe um cliente cadastrado com este documento.</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-section-title">${iconEl('doc')} Contato</div>
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="cTel">Telefone <span class="req">*</span></label>
                            <input class="input" id="cTel" placeholder="(00) 00000-0000" value="${data.telefone}">
                            <span class="field-error" id="err-cTel">Informe pelo menos um telefone.</span>
                        </div>
                        <div class="form-field">
                            <label for="cTel2">Telefone secundário</label>
                            <input class="input" id="cTel2" placeholder="(00) 00000-0000" value="${data.telefone2 || ''}">
                        </div>
                        <div class="form-field">
                            <label for="cEmail">E-mail</label>
                            <input class="input" id="cEmail" type="email" placeholder="cliente@email.com" value="${data.email || ''}">
                        </div>
                        <div class="form-field span-3">
                            <div class="info-box">${Icon.info}<span>Nome e pelo menos um telefone são suficientes para usar o cliente em um orçamento. Os demais dados podem ser completados depois — e serão exigidos quando o orçamento for aprovado.</span></div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-section-title">${iconEl('home')} Endereço</div>
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="cCep">CEP</label>
                            <input class="input" id="cCep" placeholder="00000-000" maxlength="9" value="${data.cep || ''}">
                        </div>
                        <div class="form-field span-2">
                            <label for="cEndereco">Endereço</label>
                            <input class="input" id="cEndereco" placeholder="Digite o endereço" value="${data.endereco || ''}">
                        </div>
                        <div class="form-field">
                            <label for="cNumero">Número</label>
                            <input class="input" id="cNumero" placeholder="Nº" value="${data.numero || ''}">
                        </div>
                        <div class="form-field">
                            <label for="cComplemento">Complemento</label>
                            <input class="input" id="cComplemento" placeholder="Complemento" value="${data.complemento || ''}">
                        </div>
                        <div class="form-field">
                            <label for="cBairro">Bairro</label>
                            <input class="input" id="cBairro" placeholder="Bairro" value="${data.bairro || ''}">
                        </div>
                        <div class="form-field">
                            <label for="cCidade">Cidade</label>
                            <input class="input" id="cCidade" placeholder="Cidade" value="${data.cidade || ''}">
                        </div>
                        <div class="form-field">
                            <label for="cEstado">Estado</label>
                            <select class="input" id="cEstado">
                                <option value="">Selecione</option>
                                ${ESTADOS.map(e => `<option value="${e}" ${data.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <p class="form-note">* Campos obrigatórios</p>
                <div class="form-actions">
                    ${Button({ id: 'cCancelBtn', label: 'Cancelar', variant: 'secondary', icon: 'x', type: 'button' })}
                    ${Button({ id: 'cSaveBtn', label: 'Salvar', variant: 'primary', icon: 'check', type: 'submit' })}
                </div>
            </form>
        `;

        applyMask(container.querySelector('#cCep'), maskCEP);
        applyMask(container.querySelector('#cTel'), maskPhone);
        applyMask(container.querySelector('#cTel2'), maskPhone);

        const docInput = container.querySelector('#cDoc');
        const docHint = container.querySelector('#hint-cDoc');
        const docErr = container.querySelector('#err-cDoc');
        applyMask(docInput, maskCpfCnpj);
        function checkDocDuplicate() {
            const digits = docInput.value.replace(/\D/g, '');
            const kind = docKind(docInput.value);
            docHint.textContent = kind ? `Documento identificado como ${kind}.` : 'Digite os números; o formato (CPF ou CNPJ) é detectado automaticamente.';
            if (digits.length === 11 || digits.length === 14) {
                const dup = docDuplicado(digits, isEdit ? data.id : null);
                docInput.classList.toggle('error', !!dup);
                docErr.classList.toggle('show', !!dup);
                return !dup;
            }
            docInput.classList.remove('error');
            docErr.classList.remove('show');
            return true;
        }
        docInput.addEventListener('input', checkDocDuplicate);
        docInput.addEventListener('blur', checkDocDuplicate);

        container.querySelector('#cCep').addEventListener('blur', (e) => {
            if (e.target.value.replace(/\D/g, '').length !== 8) return;
            const r = lookupCep(e.target.value);
            container.querySelector('#cEndereco').value = r.endereco;
            container.querySelector('#cBairro').value = r.bairro;
            container.querySelector('#cCidade').value = r.cidade;
            container.querySelector('#cEstado').value = r.estado;
        });

        container.querySelector('#cCancelBtn').addEventListener('click', () => Router.navigate('#/clientes'));
        container.querySelector('#clientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = container.querySelector('#cNome');
            const tel = container.querySelector('#cTel');
            let valid = true;
            const nomeOk = nome.value.trim().length > 0;
            const telOk = tel.value.replace(/\D/g, '').length >= 10;
            nome.classList.toggle('error', !nomeOk); container.querySelector('#err-cNome').classList.toggle('show', !nomeOk);
            tel.classList.toggle('error', !telOk); container.querySelector('#err-cTel').classList.toggle('show', !telOk);
            if (!nomeOk || !telOk) valid = false;
            if (!checkDocDuplicate()) valid = false;
            if (!valid) { showToast('Verifique os campos destacados.', 'error'); return; }

            const saveBtn = container.querySelector('#cSaveBtn');
            saveBtn.classList.add('loading');
            setTimeout(() => {
                const db = DB.get();
                const record = {
                    nome: nome.value.trim(), cpfCnpj: docInput.value.trim(),
                    telefone: tel.value.trim(), telefone2: container.querySelector('#cTel2').value.trim(),
                    email: container.querySelector('#cEmail').value.trim(), cep: container.querySelector('#cCep').value.trim(),
                    endereco: container.querySelector('#cEndereco').value.trim(), numero: container.querySelector('#cNumero').value.trim(),
                    complemento: container.querySelector('#cComplemento').value.trim(), bairro: container.querySelector('#cBairro').value.trim(),
                    cidade: container.querySelector('#cCidade').value.trim(), estado: container.querySelector('#cEstado').value,
                    status: data.status || 'Ativo'
                };
                if (isEdit) { Object.assign(data, record); } else { record.id = DB.nextId('cliente'); db.clientes.push(record); }
                DB.persist();
                saveBtn.classList.remove('loading');
                showToast(isEdit ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.', 'success');
                Router.navigate(isEdit ? `#/clientes/${data.id}` : '#/clientes');
            }, 400);
        });
    }

    function isComplete(c) {
        return c.nome && c.telefone && c.cpfCnpj && c.endereco && c.cidade && c.estado && c.cep;
    }

    function viewView(container, id) {
        const c = DB.get().clientes.find(x => x.id === Number(id));
        if (!c) { container.innerHTML = ErrorState('Cliente não encontrado.'); return; }
        const orcamentos = DB.get().orcamentos.filter(o => o.clienteId === c.id);
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Clientes', route: '#/clientes' }, { label: c.nome }])}
            <div class="page-title-row">
                <div class="page-header" style="margin-bottom:0"><span class="page-icon">${Icon.user}</span><h1>${c.nome}</h1></div>
                ${StatusBadge(c.status || 'Ativo')}
            </div>
            <div class="card">
                <div class="card-section-title">${Icon.user} Dados do Cliente</div>
                <div class="form-grid">
                    <div class="form-field span-2"><label>Nome completo</label><input class="input" value="${c.nome}" readonly></div>
                    <div class="form-field"><label>CPF/CNPJ</label><input class="input" value="${c.cpfCnpj || 'Não informado'}" readonly></div>
                </div>
            </div>
            <div class="card">
                <div class="card-section-title">${iconEl('doc')} Contato</div>
                <div class="form-grid">
                    <div class="form-field"><label>Telefone</label><input class="input" value="${c.telefone || 'Não informado'}" readonly></div>
                    <div class="form-field"><label>Telefone secundário</label><input class="input" value="${c.telefone2 || 'Não informado'}" readonly></div>
                    <div class="form-field"><label>E-mail</label><input class="input" value="${c.email || 'Não informado'}" readonly></div>
                </div>
            </div>
            <div class="card">
                <div class="card-section-title">${iconEl('home')} Endereço</div>
                <div class="form-grid">
                    <div class="form-field"><label>CEP</label><input class="input" value="${c.cep || 'Não informado'}" readonly></div>
                    <div class="form-field span-2"><label>Endereço</label><input class="input" value="${c.endereco ? `${c.endereco}, ${c.numero || 's/n'}` : 'Não informado'}" readonly></div>
                    <div class="form-field"><label>Bairro</label><input class="input" value="${c.bairro || 'Não informado'}" readonly></div>
                    <div class="form-field"><label>Cidade</label><input class="input" value="${c.cidade || 'Não informado'}" readonly></div>
                    <div class="form-field"><label>Estado</label><input class="input" value="${c.estado || 'Não informado'}" readonly></div>
                </div>
                ${!isComplete(c) ? `<div class="info-box" style="margin-top:var(--space-4)">${Icon.alertTriangle}<span>Cadastro incompleto. Será necessário completar os dados antes de aprovar orçamentos deste cliente.</span></div>` : ''}
            </div>
            <div class="card">
                <div class="card-section-title">${iconEl('chart')} Histórico relacionado</div>
                ${orcamentos.length ? orcamentos.map(o => `<div class="detail-row"><span>${o.numero}</span><span>${StatusBadge(o.status)}</span></div>`).join('') : '<p class="form-note" style="margin:0">Nenhum orçamento registrado.</p>'}
            </div>
            <div class="form-actions">
                ${Button({ id: 'cVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
            </div>
        `;
        container.querySelector('#cVoltarBtn').addEventListener('click', () => Router.navigate('#/clientes'));
    }

    return { listView, formView, viewView, isComplete };
})();
