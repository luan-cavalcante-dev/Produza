/* ==========================================================
   DATA LAYER — mock data + localStorage persistence
   ========================================================== */
const DB = (() => {
    const KEY = 'produza_db_v3';

    const seed = {
        funcionarios: [
            { id: 1, nome: 'Ana Clara Souza', cpf: '123.456.789-01', perfil: 'Produção', cargo: 'Costureira', emailLogin: '', email: 'ana.clara@produza.com', telefone: '(62) 99811-0001', telefone2: '', endereco: 'Rua das Flores', bairro: 'Centro', numero: '120', cidade: 'Goianésia', estado: 'GO', cep: '76380-000', status: 'Ativo' },
            { id: 2, nome: 'Ana Maria Oliveira', cpf: '987.654.321-00', perfil: 'Produção', cargo: 'Auxiliar de Produção', emailLogin: '', email: '', telefone: '(62) 99811-0002', telefone2: '', endereco: 'Av. Brasil', bairro: 'Vila Nova', numero: '45', cidade: 'Goianésia', estado: 'GO', cep: '76380-010', status: 'Ativo' },
            { id: 3, nome: 'Ana Claudia Santos', cpf: '456.789.012-34', perfil: 'Gerente', cargo: 'Gerente', emailLogin: 'ana.claudia@produza.com', email: 'ana.claudia@produza.com', telefone: '(62) 99811-0003', telefone2: '(62) 3311-0003', endereco: 'Rua XV de Novembro', bairro: 'Centro', numero: '80', cidade: 'Goianésia', estado: 'GO', cep: '76380-020', status: 'Ativo' },
            { id: 4, nome: 'Carlos Mendes', cpf: '321.654.987-11', perfil: 'Vendedor', cargo: 'Vendedor', emailLogin: 'carlos.mendes@produza.com', email: '', telefone: '(62) 99811-0004', telefone2: '', endereco: 'Rua dos Ipês', bairro: 'Jardim', numero: '12', cidade: 'Goianésia', estado: 'GO', cep: '76380-030', status: 'Ativo' },
            { id: 5, nome: 'João Pedro Lima', cpf: '741.852.963-22', perfil: 'Nenhum', cargo: 'Cortador', emailLogin: '', email: '', telefone: '(62) 99811-0005', telefone2: '', endereco: 'Rua da Paz', bairro: 'Centro', numero: '5', cidade: 'Goianésia', estado: 'GO', cep: '76380-040', status: 'Inativo' }
        ],
        clientes: [
            { id: 1, nome: 'Ana Boutique', cpfCnpj: '12.345.678/0001-90', telefone: '(62) 99811-2233', telefone2: '', email: 'contato@anaboutique.com.br', cep: '76380-000', endereco: 'Av. Central', numero: '210', complemento: '', bairro: 'Centro', cidade: 'Goianésia', estado: 'GO', status: 'Ativo' },
            { id: 2, nome: 'Maria Confecções', cpfCnpj: '98.765.432/0001-11', telefone: '(62) 99700-1010', telefone2: '(62) 3311-0022', email: 'maria@confeccoes.com', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', status: 'Ativo' },
            { id: 3, nome: 'João Silva', cpfCnpj: '', telefone: '(62) 98811-4455', telefone2: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', status: 'Ativo' }
        ],
        produtos: [
            { id: 1, nome: 'Camiseta', descricao: 'Camiseta 100% algodão', precoBase: 35, status: 'Ativo',
                tamanhos: [ { tam: 'P', preco: 35 }, { tam: 'M', preco: 35 }, { tam: 'G', preco: 38 }, { tam: 'GG', preco: 42 } ],
                descontos: [ { qtd: 10, perc: 5 }, { qtd: 20, perc: 10 }, { qtd: 50, perc: 15 } ] },
            { id: 2, nome: 'Calça', descricao: 'Calça sarja profissional', precoBase: 68, status: 'Ativo',
                tamanhos: [ { tam: 'P', preco: 68 }, { tam: 'M', preco: 68 }, { tam: 'G', preco: 72 }, { tam: 'GG', preco: 78 } ],
                descontos: [ { qtd: 10, perc: 5 }, { qtd: 30, perc: 12 } ] },
            { id: 3, nome: 'Uniforme', descricao: 'Conjunto uniforme completo', precoBase: 120, status: 'Ativo',
                tamanhos: [ { tam: 'P', preco: 120 }, { tam: 'M', preco: 120 }, { tam: 'G', preco: 128 } ],
                descontos: [ { qtd: 20, perc: 8 } ] },
            { id: 4, nome: 'Avental', descricao: 'Avental de sarja reforçado', precoBase: 32, status: 'Inativo',
                tamanhos: [], descontos: [] }
        ],
        orcamentos: [
            { id: 1, numero: '#0001', clienteId: 1, data: '2026-09-18', status: 'Pendente',
                itens: [ { produtoId: 1, tamanho: 'M', qtd: 20, precoUnit: 35, descontoPerc: 10 }, { produtoId: 2, tamanho: 'G', qtd: 5, precoUnit: 72, descontoPerc: 0 } ] },
            { id: 2, numero: '#0002', clienteId: 2, data: '2026-09-10', status: 'Aprovado', aprovadoEm: '2026-09-11',
                itens: [ { produtoId: 3, tamanho: 'M', qtd: 25, precoUnit: 120, descontoPerc: 8 } ] },
            { id: 3, numero: '#0003', clienteId: 1, data: '2026-08-28', status: 'Cancelado',
                itens: [ { produtoId: 1, tamanho: 'P', qtd: 8, precoUnit: 35, descontoPerc: 0 } ] }
        ],
        producao: [
            { id: 1, numero: 'OP-0001', origemOrcamentoId: 2, clienteId: 2,
                itens: [ { produtoId: 3, tamanho: 'M', qtd: 25, precoUnit: 120, descontoPerc: 8 } ],
                status: 'Em produção', previsao: '2026-09-30', etapaAtualIdx: 1,
                etapas: ['Corte', 'Costura', 'Acabamento', 'Revisão', 'Finalizado'],
                historico: [ { data: '2026-09-12', status: 'Criada', obs: 'Ordem gerada automaticamente a partir do orçamento #0002 aprovado.' }, { data: '2026-09-13', status: 'Em produção', obs: 'Corte iniciado.' } ] },
            { id: 2, numero: 'OP-0002', origemOrcamentoId: null, clienteId: 3,
                itens: [ { produtoId: 1, tamanho: 'G', qtd: 40, precoUnit: 38, descontoPerc: 10 } ],
                status: 'Criada', previsao: '2026-10-05', etapaAtualIdx: 0,
                etapas: ['Corte', 'Costura', 'Acabamento', 'Revisão', 'Finalizado'],
                historico: [ { data: '2026-09-16', status: 'Criada', obs: 'Ordem criada diretamente.' } ] },
            { id: 3, numero: 'OP-0003', origemOrcamentoId: null, clienteId: 1,
                itens: [ { produtoId: 4, tamanho: '', qtd: 15, precoUnit: 32, descontoPerc: 0 } ],
                status: 'Finalizada', previsao: '2026-09-05', etapaAtualIdx: 4,
                etapas: ['Corte', 'Costura', 'Acabamento', 'Revisão', 'Finalizado'],
                historico: [ { data: '2026-08-20', status: 'Criada', obs: '' }, { data: '2026-09-05', status: 'Finalizada', obs: 'Entregue ao cliente.' } ] }
        ],
        seq: { funcionario: 6, cliente: 4, produto: 5, orcamento: 4, producao: 4 }
    };

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) { save(seed); return JSON.parse(JSON.stringify(seed)); }
            return JSON.parse(raw);
        } catch (e) {
            save(seed);
            return JSON.parse(JSON.stringify(seed));
        }
    }
    function save(db) {
        try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage unavailable */ }
    }

    let db = load();

    return {
        get: () => db,
        persist: () => save(db),
        nextId(entity) { db.seq[entity] = (db.seq[entity] || 1) + 1; return db.seq[entity]; },
        reset() { db = JSON.parse(JSON.stringify(seed)); save(db); }
    };
})();

function fmtMoney(v) {
    return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}
function todayIso() {
    return new Date().toISOString().slice(0, 10);
}
function addDaysIso(iso, days) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
