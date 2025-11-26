/**
 * Script para página pública de visualização de relatórios compartilhados
 * Carrega relatório via API e exibe sem funcionalidades de edição/exclusão
 */

let relatorioAtual = null;

/**
 * Carregar relatório compartilhado via API
 */
async function carregarRelatorioPublico() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        mostrarErro('ID do relatório não fornecido.');
        return;
    }
    
    try {
        const response = await fetch(`api/relatorios.php?id=${id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            relatorioAtual = result.data;
            exibirRelatorioCompleto(relatorioAtual);
        } else {
            mostrarErro('Relatório não encontrado ou link expirado.');
        }
    } catch (error) {
        console.error('Erro ao carregar relatório compartilhado:', error);
        mostrarErro('Erro ao carregar relatório compartilhado.');
    }
}

/**
 * Exibir erro de carregamento
 */
function mostrarErro(mensagem = 'Não foi possível carregar o relatório compartilhado.') {
    const conteudo = document.getElementById('conteudo-relatorio');
    conteudo.innerHTML = `
        <div class="erro-carregamento" style="text-align: center; padding: 60px 20px;">
            <h2 style="color: var(--text-label); margin-bottom: 20px;">⚠️ Erro ao carregar relatório</h2>
            <p style="color: var(--text-secondary); font-size: 16px; margin-bottom: 30px;">${mensagem}</p>
        </div>
    `;
}

/**
 * Exibir relatório completo
 * Usa as mesmas funções de detalhes.js se disponível
 */
function exibirRelatorioCompleto(rel) {
    // Verificar se as funções de detalhes.js estão disponíveis
    if (typeof criarBarraStatusDetalhes === 'function' && 
        typeof criarSecaoDetalhes === 'function' &&
        typeof criarBadgeAceitacao === 'function' &&
        typeof criarIndicadorDetalhes === 'function' &&
        typeof criarBarraProgressoDetalhes === 'function' &&
        typeof formatarSintomas === 'function') {
        // Usar funções de detalhes.js
        const dataFormatada = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const barraStatus = criarBarraStatusDetalhes(rel.resumo);
        const alimentacaoHTML = criarSecaoDetalhes('🍼', 'Alimentação', `
            <div style="margin-bottom: 15px;">
                <strong>Tipo:</strong> ${rel.alimentacao?.tipo || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Horário:</strong> ${rel.alimentacao?.horario || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Quantidade:</strong> ${rel.alimentacao?.quantidade || 'N/A'}
            </div>
            <div>
                <strong>Aceitação:</strong> ${rel.alimentacao?.aceitacao ? criarBadgeAceitacao(rel.alimentacao.aceitacao) : '<span class="badge badge-azul">N/A</span>'}
            </div>
        `);
        
        const higieneHTML = criarSecaoDetalhes('🧴', 'Higiene e Fraldas', `
            <div style="margin-bottom: 20px;">
                ${criarIndicadorDetalhes('Banho', rel.higiene?.banho)}
            </div>
            ${criarBarraProgressoDetalhes('Trocas de Fralda', parseInt(rel.higiene?.trocasFralda) || 0, 'trocas')}
            ${criarBarraProgressoDetalhes('Xixi', parseInt(rel.higiene?.xixi) || 0, 'xixi')}
            ${criarBarraProgressoDetalhes('Cocô', parseInt(rel.higiene?.coco) || 0, 'coco')}
            ${rel.higiene?.obsFralda === 'diferente' && rel.higiene?.obsFraldaDetalhes ? `
                <div class="obs-fralda-detalhes">
                    <strong>⚠️ Observação sobre Fralda:</strong>
                    ${rel.higiene.obsFraldaDetalhes}
                </div>
            ` : ''}
        `);
        
        const sonoHTML = criarSecaoDetalhes('💤', 'Sono', `
            <div style="margin-bottom: 15px;">
                <strong>Horário que dormiu:</strong> ${rel.sono?.horarioDormiu || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Processo de dormir:</strong> ${rel.sono?.processoDormir || 'N/A'}
            </div>
            ${rel.sono?.despertares === 'sim' ? `
                <div style="margin-top: 15px; padding: 15px; background: rgba(201, 122, 111, 0.1); border-left: 4px solid var(--color-danger); border-radius: 8px;">
                    <strong>⏰ Despertares:</strong> ${rel.sono?.horariosDespertares || 'N/A'}<br>
                    <strong>Motivo:</strong> ${rel.sono?.motivoDespertar || 'N/A'}
                </div>
            ` : '<div style="margin-top: 15px;"><span class="badge badge-verde">Sem despertares</span></div>'}
        `);
        
        const comportamentoHTML = criarSecaoDetalhes('🧸', 'Comportamento e Atividades', `
            <div style="margin-bottom: 15px;">
                <strong>Humor antes de dormir:</strong> ${rel.comportamento?.humor || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Atividade realizada:</strong> ${rel.comportamento?.atividade || 'N/A'}
            </div>
            ${rel.comportamento?.tempoObjetivo ? `
                <div>
                    <strong>Tempo/Objetivo:</strong> ${rel.comportamento.tempoObjetivo}
                </div>
            ` : ''}
        `);
        
        const saudeHTML = criarSecaoDetalhes('💊', 'Saúde e Medicação', `
            ${rel.saude?.medicamento === 'sim' && rel.saude?.medicamentoDetalhes ? `
                <div style="margin-bottom: 15px; padding: 15px; background: var(--bg-hover); border-left: 4px solid var(--border-focus); border-radius: 8px;">
                    <strong>💊 Medicamentos/Vitaminas:</strong><br>
                    ${rel.saude.medicamentoDetalhes}
                </div>
            ` : '<div style="margin-bottom: 15px;"><span class="badge badge-verde">Sem medicamentos</span></div>'}
            ${rel.saude?.sintomas !== 'nenhum' ? `
                <div>
                    <strong>Sintomas:</strong> 
                    <span class="sintoma-badge">${formatarSintomas(rel.saude.sintomas, rel.saude.sintomasOutro)}</span>
                </div>
            ` : '<div><span class="badge badge-verde">Sem sintomas</span></div>'}
        `);
        
        const reporHTML = criarSecaoDetalhes('🛒', 'Precisa Repor (Estoque)', (rel.repor && rel.repor.length > 0) ? `
            <div class="repor-list">
                ${rel.repor.map(item => {
                    const map = {
                        'fraldas': 'Fraldas',
                        'lenços': 'Lenços',
                        'pomada': 'Pomada',
                        'leite': 'Leite/Fórmula',
                        'outro': rel.reporOutro || 'Outro'
                    };
                    return `<span class="repor-item">${map[item] || item}</span>`;
                }).join('')}
            </div>
        ` : '<div><span class="badge badge-verde">Nada a repor</span></div>');
        
        const observacoesHTML = rel.observacoes ? `
            <div class="observacoes-box-detalhes">
                <strong>📝 Observações Extras</strong>
                ${rel.observacoes}
            </div>
        ` : '';
        
        const html = `
            <div class="relatorio-detalhes-completo">
                <div class="relatorio-detalhes-header">
                    <h2>📋 Relatório da Noite</h2>
                    <div class="relatorio-detalhes-data">${dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}</div>
                </div>
                
                ${barraStatus}
                
                ${alimentacaoHTML}
                ${higieneHTML}
                ${sonoHTML}
                ${comportamentoHTML}
                ${saudeHTML}
                ${reporHTML}
                
                ${observacoesHTML}
            </div>
        `;
        
        document.getElementById('conteudo-relatorio').innerHTML = html;
    } else {
        // Fallback: versão simplificada
        const dataFormatada = formatarData(rel.data);
        const conteudo = document.getElementById('conteudo-relatorio');
        conteudo.innerHTML = `
            <div class="relatorio-detalhes-completo">
                <div class="relatorio-detalhes-header">
                    <h2>📋 Relatório da Noite</h2>
                    <div class="relatorio-detalhes-data">${dataFormatada}</div>
                </div>
                
                <div class="secao-detalhes">
                    <div class="secao-detalhes-header">
                        <span>1. Resumo Geral</span>
                    </div>
                    <div class="secao-detalhes-content">
                        <p><strong>Resumo:</strong> ${formatarResumo(rel.resumo)}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Formatar data para exibição
 */
function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formatar resumo
 */
function formatarResumo(resumo) {
    const map = {
        'tranquila': 'Tranquila',
        'agitada': 'Agitada',
        'interrupcoes': 'Com interrupções pontuais'
    };
    return map[resumo] || resumo;
}

// Carregar relatório quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que detalhes.js foi carregado (se estiver na mesma página)
    setTimeout(() => {
        carregarRelatorioPublico();
    }, 100);
});

