/* ==========================================================
   RELATÓRIOS
   ========================================================== */
const Relatorios = (() => {

    function centralView(container) {
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Relatórios' }])}
            ${renderPageHeader('chart', 'Relatórios')}
            <div class="report-grid">
                <div class="card report-card">
                    <span class="report-icon">${Icon.doc}</span>
                    <h3>Orçamento em PDF</h3>
                    <p>Gere a visualização em PDF de um orçamento específico, com produtos, valores e descontos.</p>
                    ${Button({ id: 'goOrcamentoPdf', label: 'Selecionar orçamento', icon: 'chevronRight', variant: 'secondary' })}
                </div>
                <div class="card report-card">
                    <span class="report-icon">${Icon.user}</span>
                    <h3>Histórico do cliente</h3>
                    <p>Consulte todos os pedidos de um cliente, com valores, datas e situação, e gere um PDF do histórico.</p>
                    ${Button({ id: 'goHistorico', label: 'Selecionar cliente', icon: 'chevronRight', variant: 'secondary' })}
                </div>
            </div>
            <div class="card" id="pickerCard" style="display:none"></div>
        `;
        const pickerCard = container.querySelector('#pickerCard');

        container.querySelector('#goOrcamentoPdf').addEventListener('click', () => {
            const list = DB.get().orcamentos;
            pickerCard.style.display = 'block';
            pickerCard.innerHTML = `<div class="card-section-title">${Icon.doc} Selecione um orçamento</div>
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Número</th><th>Cliente</th><th>Status</th><th></th></tr></thead>
                    <tbody>${list.map(o => `<tr><td>${o.numero}</td><td>${Orcamentos.clienteNome(o.clienteId)}</td><td>${StatusBadge(o.status)}</td>
                        <td><button class="btn btn-ghost btn-sm" data-go="#/relatorios/orcamento/${o.id}">Gerar PDF</button></td></tr>`).join('')}</tbody>
                </table></div>`;
            pickerCard.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => Router.navigate(b.dataset.go)));
        });

        container.querySelector('#goHistorico').addEventListener('click', () => {
            const list = DB.get().clientes;
            pickerCard.style.display = 'block';
            pickerCard.innerHTML = `<div class="card-section-title">${Icon.user} Selecione um cliente</div>
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Cliente</th><th>Telefone</th><th></th></tr></thead>
                    <tbody>${list.map(c => `<tr><td>${c.nome}</td><td>${c.telefone || '—'}</td>
                        <td><button class="btn btn-ghost btn-sm" data-go="#/relatorios/cliente/${c.id}">Ver histórico</button></td></tr>`).join('')}</tbody>
                </table></div>`;
            pickerCard.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => Router.navigate(b.dataset.go)));
        });
    }

    function orcamentoPdfView(container, id) {
        const o = DB.get().orcamentos.find(x => x.id === Number(id));
        if (!o) { container.innerHTML = ErrorState('Orçamento não encontrado.'); return; }
        const cliente = DB.get().clientes.find(c => c.id === o.clienteId);
        const totais = Orcamentos.calcTotais(o.itens);
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Relatórios', route: '#/relatorios' }, { label: 'Orçamento em PDF' }])}
            ${renderPageHeader('doc', `Orçamento ${o.numero} — Visualização em PDF`)}
            <div class="pdf-sheet">
                <h2>Produza — Gestão de Processos Produtivos em Confecções</h2>
                <div class="pdf-sub">Orçamento ${o.numero} · Emitido em ${fmtDate(todayIso())} · Status: ${o.status}</div>
                <div class="pdf-block"><h4>Cliente</h4>
                    <p>${cliente ? cliente.nome : '—'}${cliente && cliente.telefone ? ' · ' + cliente.telefone : ''}${cliente && cliente.email ? ' · ' + cliente.email : ''}</p>
                </div>
                <div class="pdf-block"><h4>Produtos</h4>
                    <div class="table-wrap"><table class="data-table">
                        <thead><tr><th>Produto</th><th>Tam.</th><th>Qtd.</th><th>Vlr. unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                        <tbody>${o.itens.map(it => { const c = Orcamentos.calcItem(it); return `
                            <tr><td>${Orcamentos.produtoNome(it.produtoId)}</td><td>${it.tamanho || '—'}</td><td>${it.qtd}</td><td>${fmtMoney(it.precoUnit)}</td><td>${it.descontoPerc}%</td><td>${fmtMoney(c.total)}</td></tr>
                        `; }).join('')}</tbody>
                    </table></div>
                </div>
                <div class="totals-box">
                    <div class="totals-row"><span>Subtotal</span><span>${fmtMoney(totais.subtotal)}</span></div>
                    <div class="totals-row"><span>Desconto</span><span>-${fmtMoney(totais.desconto)}</span></div>
                    <div class="totals-row grand"><span>Total</span><span>${fmtMoney(totais.total)}</span></div>
                </div>
            </div>
            <div class="form-actions">
                ${Button({ id: 'pdfVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
                ${Button({ id: 'pdfGerarBtn', label: 'Gerar PDF', icon: 'doc' })}
            </div>
        `;
        container.querySelector('#pdfVoltarBtn').addEventListener('click', () => Router.navigate('#/relatorios'));
        container.querySelector('#pdfGerarBtn').addEventListener('click', () => {
            showToast('PDF gerado com sucesso (simulação de protótipo).', 'success');
            window.print();
        });
    }

    function historicoClienteView(container, id) {
        const cliente = DB.get().clientes.find(c => c.id === Number(id));
        if (!cliente) { container.innerHTML = ErrorState('Cliente não encontrado.'); return; }
        const pedidos = DB.get().orcamentos.filter(o => o.clienteId === cliente.id);
        const totalMovimentado = pedidos.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + Orcamentos.calcTotais(o.itens).total, 0);
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Relatórios', route: '#/relatorios' }, { label: `Histórico — ${cliente.nome}` }])}
            ${renderPageHeader('user', `Histórico do cliente — ${cliente.nome}`)}
            <div class="kpi-grid">
                <div class="card kpi-card"><span class="kpi-icon">${Icon.doc}</span><div><div class="kpi-value">${pedidos.length}</div><div class="kpi-label">Pedidos registrados</div></div></div>
                <div class="card kpi-card"><span class="kpi-icon">${Icon.chart}</span><div><div class="kpi-value">${fmtMoney(totalMovimentado)}</div><div class="kpi-label">Valor total movimentado</div></div></div>
            </div>
            <div class="card" style="padding:0;overflow:hidden">
                ${pedidos.length === 0 ? EmptyState('Nenhum pedido encontrado para este cliente.') : `
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Número</th><th>Data</th><th>Produtos</th><th>Total</th><th>Situação</th><th></th></tr></thead>
                    <tbody>${pedidos.map(o => `
                        <tr>
                            <td><strong>${o.numero}</strong></td>
                            <td>${fmtDate(o.data)}</td>
                            <td>${o.itens.length} item(ns)</td>
                            <td>${fmtMoney(Orcamentos.calcTotais(o.itens).total)}</td>
                            <td>${StatusBadge(o.status)}</td>
                            <td><button class="btn btn-ghost btn-sm" data-go="#/relatorios/pedido/${o.id}">Ver detalhes</button></td>
                        </tr>`).join('')}</tbody>
                </table></div>`}
            </div>
            <div class="form-actions">
                ${Button({ id: 'histVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
                ${Button({ id: 'histPdfBtn', label: 'Gerar PDF do histórico', icon: 'doc' })}
            </div>
        `;
        container.querySelector('#histVoltarBtn').addEventListener('click', () => Router.navigate('#/relatorios'));
        container.querySelector('#histPdfBtn').addEventListener('click', () => { showToast('PDF do histórico gerado com sucesso (simulação de protótipo).', 'success'); window.print(); });
        container.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => Router.navigate(b.dataset.go)));
    }

    function pedidoDetalheView(container, id) {
        const o = DB.get().orcamentos.find(x => x.id === Number(id));
        if (!o) { container.innerHTML = ErrorState('Pedido não encontrado.'); return; }
        const cliente = DB.get().clientes.find(c => c.id === o.clienteId);
        const totais = Orcamentos.calcTotais(o.itens);
        container.innerHTML = `
            ${renderBreadcrumb([{ label: 'Relatórios', route: '#/relatorios' }, { label: 'Detalhes do pedido' }])}
            ${renderPageHeader('doc', `Detalhes do pedido ${o.numero}`)}
            <div class="card">
                <div class="card-section-title">${Icon.user} Cliente</div>
                <div class="detail-row"><span>Nome</span><span>${cliente ? cliente.nome : '—'}</span></div>
                <div class="detail-row"><span>Data</span><span>${fmtDate(o.data)}</span></div>
                <div class="detail-row"><span>Situação</span><span>${StatusBadge(o.status)}</span></div>
            </div>
            <div class="card">
                <div class="card-section-title">${Icon.box} Itens do pedido</div>
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Produto</th><th>Tam.</th><th>Qtd.</th><th>Vlr. unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                    <tbody>${o.itens.map(it => { const c = Orcamentos.calcItem(it); return `
                        <tr><td>${Orcamentos.produtoNome(it.produtoId)}</td><td>${it.tamanho || '—'}</td><td>${it.qtd}</td><td>${fmtMoney(it.precoUnit)}</td><td>${it.descontoPerc}%</td><td>${fmtMoney(c.total)}</td></tr>
                    `; }).join('')}</tbody>
                </table></div>
                <div class="totals-box">
                    <div class="totals-row"><span>Subtotal</span><span>${fmtMoney(totais.subtotal)}</span></div>
                    <div class="totals-row"><span>Desconto</span><span>-${fmtMoney(totais.desconto)}</span></div>
                    <div class="totals-row grand"><span>Total</span><span>${fmtMoney(totais.total)}</span></div>
                </div>
            </div>
            ${Button({ id: 'pedVoltarBtn', label: 'Voltar', variant: 'secondary', type: 'button' })}
        `;
        container.querySelector('#pedVoltarBtn').addEventListener('click', () => history.back());
    }

    return { centralView, orcamentoPdfView, historicoClienteView, pedidoDetalheView };
})();
