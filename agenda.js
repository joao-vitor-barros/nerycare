/**
 * Script para página de agenda (users)
 * Carrega e exibe relatórios para visualização somente leitura
 */

const API_BASE_URL = 'api/relatorios.php';

// Variáveis globais
let todosRelatorios = [];
let dataFiltroAtual = null;

/**
 * Carregar relatórios do servidor
 */
async function carregarRelatorios() {
    const lista = document.getElementById('lista-relatorios');
    
    // Mostrar loading
    lista.innerHTML = '<div class="sem-relatorios"><p>⏳ Carregando relatórios...</p></div>';
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar relatórios');
        }
        
        const resultado = await response.json();
        todosRelatorios = resultado.data || [];
        
        if (todosRelatorios.length === 0) {
            lista.innerHTML = '<div class="sem-relatorios"><p>📭 Nenhum relatório salvo ainda.</p></div>';
            document.getElementById('data-atual-filtro').textContent = '';
        } else {
            // Ordenar por data (mais recente primeiro)
            todosRelatorios.sort((a, b) => new Date(b.data) - new Date(a.data));
            dataFiltroAtual = null;
            limparFiltro();
        }
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        lista.innerHTML = '<div class="sem-relatorios"><p>⚠️ Erro ao carregar relatórios. Tente novamente.</p></div>';
    }
}

/**
 * Filtrar relatórios por data
 */
function filtrarPorData() {
    const dataInput = document.getElementById('filtro-data').value;
    
    if (!dataInput) {
        limparFiltro();
        return;
    }
    
    dataFiltroAtual = dataInput;
    const relatoriosFiltrados = todosRelatorios.filter(rel => rel.data === dataInput);
    
    atualizarDataAtual(dataInput);
    exibirRelatorios(relatoriosFiltrados);
}

/**
 * Limpar filtro e mostrar todos
 */
function limparFiltro() {
    document.getElementById('filtro-data').value = '';
    dataFiltroAtual = null;
    atualizarDataAtual(null);
    exibirRelatorios(todosRelatorios);
}

/**
 * Navegar entre datas (anterior/próximo)
 */
function navegarData(direcao) {
    if (todosRelatorios.length === 0) return;
    
    // Obter todas as datas únicas e ordenadas
    const datasUnicas = [...new Set(todosRelatorios.map(r => r.data))].sort();
    
    if (datasUnicas.length === 0) return;
    
    let dataAtual;
    if (dataFiltroAtual) {
        dataAtual = dataFiltroAtual;
    } else {
        // Se não há filtro, usar a data mais recente
        dataAtual = datasUnicas[0];
    }
    
    const indexAtual = datasUnicas.indexOf(dataAtual);
    let novoIndex = indexAtual + direcao;
    
    // Circular: se passar do fim, volta ao início; se passar do início, vai ao fim
    if (novoIndex < 0) novoIndex = datasUnicas.length - 1;
    if (novoIndex >= datasUnicas.length) novoIndex = 0;
    
    const novaData = datasUnicas[novoIndex];
    document.getElementById('filtro-data').value = novaData;
    dataFiltroAtual = novaData;
    
    const relatoriosFiltrados = todosRelatorios.filter(rel => rel.data === novaData);
    atualizarDataAtual(novaData);
    exibirRelatorios(relatoriosFiltrados);
}

/**
 * Atualizar exibição da data atual
 */
function atualizarDataAtual(data) {
    const elemento = document.getElementById('data-atual-filtro');
    if (data) {
        const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        elemento.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
    } else {
        elemento.textContent = 'Todos os relatórios';
    }
}

/**
 * Exibir relatórios na lista
 */
function exibirRelatorios(relatorios) {
    const lista = document.getElementById('lista-relatorios');
    
    if (relatorios.length === 0) {
        lista.innerHTML = '<div class="sem-relatorios"><p>📭 Nenhum relatório encontrado para esta data.</p></div>';
        return;
    }
    
    // Agrupar por data
    const relatoriosPorData = {};
    relatorios.forEach((rel) => {
        const data = rel.data;
        if (!relatoriosPorData[data]) {
            relatoriosPorData[data] = [];
        }
        relatoriosPorData[data].push(rel);
    });
    
    // Ordenar datas (mais recente primeiro)
    const datasOrdenadas = Object.keys(relatoriosPorData).sort((a, b) => new Date(b) - new Date(a));
    
    let html = '';
    datasOrdenadas.forEach(data => {
        const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        html += `
            <div class="agenda-dia">
                <div class="agenda-dia-header">
                    <h3>${dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}</h3>
                    <span class="badge-contador">${relatoriosPorData[data].length} relatório(s)</span>
                </div>
                <div class="agenda-dia-conteudo">
        `;
        
        relatoriosPorData[data].forEach((relatorio) => {
            html += criarHTMLRelatorio(relatorio);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    lista.innerHTML = html;
}

/**
 * Criar HTML do relatório (versão simplificada para visualização)
 */
function criarHTMLRelatorio(rel) {
    const hora = rel.created_at ? new Date(rel.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    
    return `
        <div class="relatorio-item-simples">
            <div class="relatorio-item-header-simples">
                <h3>📋 Relatório</h3>
                ${hora ? `<span class="hora-relatorio">${hora}</span>` : ''}
            </div>
            <div class="relatorio-item-botoes-simples">
                <button onclick="abrirRelatorioDetalhes(${rel.id})" class="btn-ver-detalhes">👁️ Ver Detalhes</button>
            </div>
            <input type="hidden" class="relatorio-id" value="${rel.id}">
        </div>
    `;
}

/**
 * Abrir relatório em página separada (somente leitura)
 */
async function abrirRelatorioDetalhes(id) {
    if (!id) {
        alert('Erro: ID do relatório não encontrado');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}?id=${id}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const resultado = await response.json();
        
        if (resultado.success && resultado.data) {
            // Salvar no sessionStorage e abrir página de detalhes
            sessionStorage.setItem('relatorioDetalhes', JSON.stringify(resultado.data));
            window.open('relatorio-detalhes.html', '_blank');
        } else {
            alert('Erro ao carregar relatório. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        alert('Erro ao carregar relatório. Tente novamente.');
    }
}

// Tornar função global para uso no HTML
window.carregarRelatorios = carregarRelatorios;
window.filtrarPorData = filtrarPorData;
window.limparFiltro = limparFiltro;
window.navegarData = navegarData;
window.abrirRelatorioDetalhes = abrirRelatorioDetalhes;

