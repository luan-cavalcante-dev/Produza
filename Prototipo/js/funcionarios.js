/* ==========================================================
   FUNCIONÁRIOS
   ========================================================== */
const Funcionarios = (() => {

    function listView(container) {
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Funcionários' }])}
            ${renderPageHeader('users', 'Funcionários')}
            <div class="toolbar">
                ${SearchBar('fSearch', 'Pesquisar funcionário...')}
                ${Button({ id: 'fCadastrarBtn', label: 'Cadastrar', icon: 'plus' })}
            </div>
            <div class="card" style="padding:0;overflow:hidden" id="fResultsCard"></div>
        `;
        const resultsCard = container.querySelector('#fResultsCard');
        const input = container.querySelector('#fSearch');
        const clearBtn = container.querySelector('#fSearchClear');

        function renderResults(term) {
            if (!term) {
                resultsCard.innerHTML = PromptState('Digite algum caractere para pesquisar funcionários.');
                return;
            }
            const t = term.trim().toLowerCase();
            const list = DB.get().funcionarios.filter(f => f.nome.toLowerCase().includes(t) || f.cpf.includes(t));
            if (list.length === 0) {
                resultsCard.innerHTML = EmptyState('Nenhum funcionário encontrado.');
                return;
            }
            resultsCard.innerHTML = `
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Nome</th><th>CPF</th><th>Cargo</th><th>Status</th><th></th></tr></thead>
                    <tbody>${list.map(f => `
                        <tr>
                            <td><div class="cell-name"><span class="cell-avatar">${Icon.user}</span><div><div class="cell-main">${f.nome}</div><div class="cell-sub">${f.perfil === 'Nenhum' ? 'Sem acesso ao sistema' : f.perfil}</div></div></div></td>
                            <td>${f.cpf}</td>
                            <td>${f.cargo || '—'}</td>
                            <td>${StatusBadge(f.status || 'Ativo')}</td>
                            <td>${rowActionsMenu(f.id, [
                                { label: 'Visualizar', icon: 'eye', action: 'view' },
                                { label: 'Editar', icon: 'pencil', action: 'edit' },
                                { label: f.status === 'Inativo' ? 'Ativar' : 'Inativar', icon: f.status === 'Inativo' ? 'check' : 'alertTriangle', action: 'toggleStatus', danger: f.status !== 'Inativo' }
                            ])}</td>
                        </tr>`).join('')}</tbody>
                </table></div>
                <div style="padding:0 var(--space-4) var(--space-4)">${tableFooter(list.length)}</div>
            `;
        }

        renderResults('');
        input.addEventListener('input', () => {
            clearBtn.classList.toggle('show', !!input.value);
            renderResults(input.value);
        });
        clearBtn.addEventListener('click', () => { input.value = ''; clearBtn.classList.remove('show'); renderResults(''); input.focus(); });

        container.querySelector('#fCadastrarBtn').addEventListener('click', () => Router.navigate('#/funcionarios/cadastro'));

        resultsCard.addEventListener('click', (e) => {
            const trigger = e.target.closest('.row-menu-trigger');
            if (trigger) { toggleRowMenu(trigger.dataset.menuId, trigger); return; }
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const id = Number(actionBtn.dataset.id);
                const action = actionBtn.dataset.action;
                if (action === 'view') Router.navigate(`#/funcionarios/${id}`);
                if (action === 'edit') Router.navigate(`#/funcionarios/${id}/editar`);
                if (action === 'toggleStatus') {
                    const f = DB.get().funcionarios.find(x => x.id === id);
                    const novoStatus = f.status === 'Inativo' ? 'Ativo' : 'Inativo';
                    f.status = novoStatus;
                    DB.persist();
                    showToast(`Funcionário ${novoStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso.`, 'success');
                    renderResults(input.value);
                }
            }
        });
    }

    const PERFIS = ['Nenhum', 'Gerente', 'Vendedor', 'Produção'];
    const CARGO_SUGESTOES = ['Gerente', 'Vendedor', 'Produção', 'Auxiliar de Produção', 'Costureira', 'Cortador'];
    const ESTADOS = ['GO', 'SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'DF', 'PE'];

    function emptyData() {
        return { nome: '', cpf: '', perfil: '', cargo: '', emailLogin: '', email: '', telefone: '', telefone2: '',
            endereco: '', bairro: '', numero: '', cidade: '', estado: '', cep: '', status: 'Ativo' };
    }

    function cpfDuplicado(digits, excludeId) {
        if (digits.length !== 11) return null;
        return DB.get().funcionarios.find(f => f.id !== excludeId && f.cpf.replace(/\D/g, '') === digits);
    }

    /* ---------- CADASTRO / EDIÇÃO ---------- */
    function formView(container, id) {
        const isEdit = !!id;
        const data = isEdit ? DB.get().funcionarios.find(f => f.id === Number(id)) : emptyData();
        if (isEdit && !data) { container.innerHTML = ErrorState('Funcionário não encontrado.'); return; }

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Funcionários', route: '#/funcionarios' }, { label: isEdit ? 'Editar Funcionário' : 'Cadastro de Funcionários' }])}
            ${renderPageHeader('users', isEdit ? 'Editar Funcionário' : 'Cadastro de Funcionários')}
            <form id="funcForm" novalidate>
                <div class="card">
                    <div class="card-section-title">${Icon.user} Dados Pessoais</div>
                    <div class="form-grid">
                        <div class="form-field span-2">
                            <label for="fNome">Nome completo <span class="req">*</span></label>
                            <input class="input" id="fNome" placeholder="Digite o nome completo do funcionário" value="${data.nome}">
                            <span class="field-error" id="err-fNome">Nome é obrigatório.</span>
                        </div>
                        <div class="form-field">
                            <label for="fCpf">CPF <span class="req">*</span></label>
                            <input class="input" id="fCpf" placeholder="000.000.000-00" maxlength="14" value="${data.cpf}">
                            <span class="field-error" id="err-fCpf">CPF inválido.</span>
                            <span class="field-error" id="err-fCpfDup">Já existe um funcionário cadastrado com este CPF.</span>
                        </div>
                        <div class="form-field">
                            <label for="fPerfil">Perfil de acesso <span class="req">*</span></label>
                            <select class="input" id="fPerfil">
                                <option value="">Selecione o perfil de acesso</option>
                                ${PERFIS.map(p => `<option value="${p}" ${data.perfil === p ? 'selected' : ''}>${p === 'Nenhum' ? 'Nenhum (sem acesso ao sistema)' : p}</option>`).join('')}
                            </select>
                            <span class="field-error" id="err-fPerfil">Selecione um perfil.</span>
                        </div>
                        <div class="form-field">
                            <label for="fCargo">Cargo</label>
                            <input class="input" id="fCargo" list="cargoSugestoes" placeholder="Digite ou selecione o cargo" value="${data.cargo || ''}">
                            <datalist id="cargoSugestoes">${CARGO_SUGESTOES.map(c => `<option value="${c}">`).join('')}</datalist>
                            <span class="field-hint">O cargo é independente do perfil de acesso.</span>
                        </div>
                        <div class="form-field span-3">
                            <div class="info-box">${Icon.info}<span>O perfil de acesso define as funcionalidades e os recursos do sistema que o funcionário poderá utilizar. Use "Nenhum" para funcionários que não acessarão o sistema.</span></div>
                        </div>
                    </div>
                </div>

                <div class="card" id="acessoCard" style="display:none">
                    <div class="card-section-title">${iconEl('gear')} Acesso ao Sistema</div>
                    <div class="form-grid cols-2">
                        <div class="form-field span-2">
                            <label for="fEmailLogin">E-mail para login <span class="req">*</span></label>
                            <input class="input" id="fEmailLogin" type="email" placeholder="email@produza.com" value="${data.emailLogin || ''}">
                            <span class="field-error" id="err-fEmailLogin">Informe um e-mail válido.</span>
                            <span class="field-hint">A redefinição de senha é feita pelo próprio funcionário na tela de login.</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-section-title">${iconEl('doc')} Contato</div>
                    <div class="form-grid cols-2">
                        <div class="form-field">
                            <label for="fTelefone">Telefone <span class="req">*</span></label>
                            <input class="input" id="fTelefone" placeholder="(00) 00000-0000" value="${data.telefone || ''}">
                            <span class="field-error" id="err-fTelefone">Telefone é obrigatório.</span>
                        </div>
                        <div class="form-field">
                            <label for="fTelefone2">Telefone secundário</label>
                            <input class="input" id="fTelefone2" placeholder="(00) 00000-0000" value="${data.telefone2 || ''}">
                        </div>
                        <div class="form-field span-2">
                            <label for="fEmail">E-mail</label>
                            <input class="input" id="fEmail" type="email" placeholder="E-mail de contato (pode ser diferente do login)" value="${data.email || ''}">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-section-title">${iconEl('home')} Endereço</div>
                    <div class="form-grid">
                        <div class="form-field span-2">
                            <label for="fEndereco">Endereço <span class="req">*</span></label>
                            <input class="input" id="fEndereco" placeholder="Digite o endereço completo" value="${data.endereco}">
                            <span class="field-error" id="err-fEndereco">Endereço é obrigatório.</span>
                        </div>
                        <div class="form-field">
                            <label for="fNumero">Número <span class="req">*</span></label>
                            <input class="input" id="fNumero" placeholder="Digite o número" value="${data.numero}">
                            <span class="field-error" id="err-fNumero">Número é obrigatório.</span>
                        </div>
                        <div class="form-field">
                            <label for="fBairro">Bairro <span class="req">*</span></label>
                            <input class="input" id="fBairro" placeholder="Digite o bairro" value="${data.bairro}">
                            <span class="field-error" id="err-fBairro">Bairro é obrigatório.</span>
                        </div>
                        <div class="form-field">
                            <label for="fCidade">Cidade <span class="req">*</span></label>
                            <input class="input" id="fCidade" placeholder="Digite a cidade" value="${data.cidade}">
                            <span class="field-error" id="err-fCidade">Cidade é obrigatória.</span>
                        </div>
                        <div class="form-field">
                            <label for="fEstado">Estado <span class="req">*</span></label>
                            <select class="input" id="fEstado">
                                <option value="">Selecione o estado</option>
                                ${ESTADOS.map(e => `<option value="${e}" ${data.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                            <span class="field-error" id="err-fEstado">Selecione o estado.</span>
                        </div>
                        <div class="form-field">
                            <label for="fCep">CEP <span class="req">*</span></label>
                            <input class="input" id="fCep" placeholder="00000-000" maxlength="9" value="${data.cep}">
                            <span class="field-error" id="err-fCep">CEP inválido.</span>
                        </div>
                    </div>
                </div>

                <p class="form-note">* Campos obrigatórios</p>
                <div class="form-actions">
                    ${Button({ id: 'fCancelBtn', label: 'Cancelar', variant: 'secondary', icon: 'x', type: 'button' })}
                    ${Button({ id: 'fSaveBtn', label: 'Salvar', variant: 'primary', icon: 'check', type: 'submit' })}
                </div>
            </form>
        `;

        applyMask(container.querySelector('#fCpf'), maskCPF);
        applyMask(container.querySelector('#fCep'), maskCEP);
        applyMask(container.querySelector('#fTelefone'), maskPhone);
        applyMask(container.querySelector('#fTelefone2'), maskPhone);

        const cpfInput = container.querySelector('#fCpf');
        const errCpfDup = container.querySelector('#err-fCpfDup');
        function checkCpfDuplicado() {
            const digits = cpfInput.value.replace(/\D/g, '');
            if (digits.length !== 11) { errCpfDup.classList.remove('show'); return true; }
            const dup = cpfDuplicado(digits, isEdit ? data.id : null);
            errCpfDup.classList.toggle('show', !!dup);
            cpfInput.classList.toggle('error', !!dup);
            return !dup;
        }
        cpfInput.addEventListener('input', checkCpfDuplicado);
        cpfInput.addEventListener('blur', checkCpfDuplicado);

        const perfilSel = container.querySelector('#fPerfil');
        const acessoCard = container.querySelector('#acessoCard');
        function syncAcessoCard() {
            acessoCard.style.display = (perfilSel.value && perfilSel.value !== 'Nenhum') ? 'block' : 'none';
        }
        syncAcessoCard();
        perfilSel.addEventListener('change', syncAcessoCard);

        container.querySelector('#fCancelBtn').addEventListener('click', () => Router.navigate('#/funcionarios'));

        container.querySelector('#funcForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const precisaLogin = perfilSel.value && perfilSel.value !== 'Nenhum';
            const fields = {
                fNome: v => v.trim().length > 0,
                fCpf: v => v.replace(/\D/g, '').length === 11,
                fPerfil: v => !!v,
                fTelefone: v => v.replace(/\D/g, '').length >= 10,
                fEndereco: v => v.trim().length > 0,
                fNumero: v => v.trim().length > 0,
                fBairro: v => v.trim().length > 0,
                fCidade: v => v.trim().length > 0,
                fEstado: v => !!v,
                fCep: v => v.replace(/\D/g, '').length === 8
            };
            if (precisaLogin) fields.fEmailLogin = v => /\S+@\S+\.\S+/.test(v);

            let valid = true;
            const values = {};
            Object.keys(fields).forEach(key => {
                const el = container.querySelector('#' + key);
                const ok = fields[key](el.value);
                values[key] = el.value;
                el.classList.toggle('error', !ok);
                const err = container.querySelector('#err-' + key);
                if (err) err.classList.toggle('show', !ok);
                if (!ok) valid = false;
            });
            if (!checkCpfDuplicado()) valid = false;
            if (!valid) { showToast('Verifique os campos destacados.', 'error'); return; }

            const saveBtn = container.querySelector('#fSaveBtn');
            saveBtn.classList.add('loading');
            setTimeout(() => {
                const db = DB.get();
                const record = {
                    nome: values.fNome.trim(), cpf: values.fCpf, perfil: values.fPerfil,
                    cargo: container.querySelector('#fCargo').value.trim(),
                    emailLogin: precisaLogin ? values.fEmailLogin.trim() : '',
                    email: container.querySelector('#fEmail').value.trim(),
                    telefone: values.fTelefone.trim(), telefone2: container.querySelector('#fTelefone2').value.trim(),
                    endereco: values.fEndereco.trim(), numero: values.fNumero.trim(),
                    bairro: values.fBairro.trim(), cidade: values.fCidade.trim(), estado: values.fEstado, cep: values.fCep,
                    status: data.status || 'Ativo'
                };
                if (isEdit) {
                    Object.assign(data, record);
                } else {
                    record.id = DB.nextId('funcionario');
                    db.funcionarios.push(record);
                }
                DB.persist();
                saveBtn.classList.remove('loading');
                showToast(isEdit ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso.', 'success');
                Router.navigate('#/funcionarios');
            }, 400);
        });
    }

    /* ---------- VISUALIZAÇÃO (somente leitura, mesma estrutura do cadastro) ---------- */
    function viewView(container, id) {
        const f = DB.get().funcionarios.find(x => x.id === Number(id));
        if (!f) { container.innerHTML = ErrorState('Funcionário não encontrado.'); return; }
        const temAcesso = f.perfil && f.perfil !== 'Nenhum';

        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Funcionários', route: '#/funcionarios' }, { label: f.nome }])}
            <div class="page-title-row">
                <div class="page-header" style="margin-bottom:0"><span class="page-icon">${Icon.user}</span><h1>${f.nome}</h1></div>
                ${StatusBadge(f.status || 'Ativo')}
            </div>

            <div class="card">
                <div class="card-section-title">${Icon.user} Dados Pessoais</div>
                <div class="form-grid">
                    <div class="form-field span-2"><label>Nome completo</label><input class="input" value="${f.nome}" readonly></div>
                    <div class="form-field"><label>CPF</label><input class="input" value="${f.cpf}" readonly></div>
                    <div class="form-field"><label>Perfil de acesso</label><input class="input" value="${f.perfil === 'Nenhum' || !f.perfil ? 'Nenhum (sem acesso ao sistema)' : f.perfil}" readonly></div>
                    <div class="form-field"><label>Cargo</label><input class="input" value="${f.cargo || 'Não informado'}" readonly></div>
                </div>
            </div>

            ${temAcesso ? `
            <div class="card">
                <div class="card-section-title">${iconEl('gear')} Acesso ao Sistema</div>
                <div class="form-grid cols-2">
                    <div class="form-field span-2"><label>E-mail para login</label><input class="input" value="${f.emailLogin || 'Não informado'}" readonly></div>
                </div>
            </div>` : ''}

            <div class="card">
                <div class="card-section-title">${iconEl('doc')} Contato</div>
                <div class="form-grid cols-2">
                    <div class="form-field"><label>Telefone</label><input class="input" value="${f.telefone || 'Não informado'}" readonly></div>
                    <div class="form-field"><label>Telefone secundário</label><input class="input" value="${f.telefone2 || 'Não informado'}" readonly></div>
                    <div class="form-field span-2"><label>E-mail</label><input class="input" value="${f.email || 'Não informado'}" readonly></div>
                </div>
            </div>

            <div class="card">
                <div class="card-section-title">${iconEl('home')} Endereço</div>
                <div class="form-grid">
                    <div class="form-field span-2"><label>Endereço</label><input class="input" value="${f.endereco}, ${f.numero}" readonly></div>
                    <div class="form-field"><label>Bairro</label><input class="input" value="${f.bairro}" readonly></div>
                    <div class="form-field"><label>Cidade</label><input class="input" value="${f.cidade}" readonly></div>
                    <div class="form-field"><label>Estado</label><input class="input" value="${f.estado}" readonly></div>
                    <div class="form-field"><label>CEP</label><input class="input" value="${f.cep}" readonly></div>
                </div>
            </div>

            <div class="form-actions">
                ${Button({ id: 'fVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
            </div>
        `;
        container.querySelector('#fVoltarBtn').addEventListener('click', () => Router.navigate('#/funcionarios'));
    }

    return { listView, formView, viewView };
})();
