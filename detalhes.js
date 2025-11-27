// Variável global para armazenar o relatório atual
let relatorioAtual = null;

// Função para fechar página de detalhes
function fecharDetalhes() {
    if (window.opener) {
        window.close();
    } else {
        // Se não foi aberto em nova janela, redirecionar para página principal
        window.location.href = 'index.html';
    }
}

// Função para abrir foto em modal
function abrirFotoModal(url) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 90%;">
            <img src="${url}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="position: absolute; top: -40px; right: 0; background: rgba(255,255,255,0.9); color: #333; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora da imagem
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Carregar e exibir relatório completo
document.addEventListener('DOMContentLoaded', function() {
    // Carregar do sessionStorage
    const relatorioData = sessionStorage.getItem('relatorioDetalhes');
    
    if (!relatorioData) {
        mostrarErro();
        return;
    }
    
    try {
        relatorioAtual = JSON.parse(relatorioData);
        exibirRelatorioCompleto(relatorioAtual);
    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        mostrarErro();
    }
});

function mostrarErro(mensagem = 'Não foi possível carregar os detalhes do relatório.') {
    const conteudo = document.getElementById('conteudo-relatorio');
    conteudo.innerHTML = `
        <div class="erro-carregamento">
            <h2>⚠️ Erro ao carregar relatório</h2>
            <p>${mensagem}</p>
            <button onclick="window.close()" class="btn-fechar" style="background: #4A9B8E; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                Fechar
            </button>
        </div>
    `;
}

function exibirRelatorioCompleto(rel) {
    const dataFormatada = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Barra de Status
    const barraStatus = criarBarraStatusDetalhes(rel.resumo);
    
    // Seção de Alimentação
    const alimentacaoHTML = criarSecaoDetalhes('🍼', 'Alimentação', `
        <div style="margin-bottom: 15px;">
            <strong>Tipo:</strong> ${rel.alimentacao.tipo || 'N/A'}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Horário:</strong> ${rel.alimentacao.horario || 'N/A'}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Quantidade:</strong> ${rel.alimentacao.quantidade || 'N/A'}
        </div>
        <div>
            <strong>Aceitação:</strong> ${rel.alimentacao.aceitacao ? criarBadgeAceitacao(rel.alimentacao.aceitacao) : '<span class="badge badge-azul">N/A</span>'}
        </div>
    `);
    
    // Seção de Higiene
    const higieneHTML = criarSecaoDetalhes('🧴', 'Higiene e Fraldas', `
        <div style="margin-bottom: 20px;">
            ${criarIndicadorDetalhes('Banho', rel.higiene.banho)}
        </div>
        ${criarBarraProgressoDetalhes('Trocas de Fralda', parseInt(rel.higiene.trocasFralda) || 0, 'trocas')}
        ${criarBarraProgressoDetalhes('Xixi', parseInt(rel.higiene.xixi) || 0, 'xixi')}
        ${criarBarraProgressoDetalhes('Cocô', parseInt(rel.higiene.coco) || 0, 'coco')}
        ${rel.higiene.obsFralda === 'diferente' && rel.higiene.obsFraldaDetalhes ? `
            <div class="obs-fralda-detalhes">
                <strong>⚠️ Observação sobre Fralda:</strong>
                ${rel.higiene.obsFraldaDetalhes}
            </div>
        ` : ''}
        ${rel.higiene.fotos && Array.isArray(rel.higiene.fotos) && rel.higiene.fotos.length > 0 ? `
            <div style="margin-top: 20px;">
                <strong style="display: block; margin-bottom: 10px; color: var(--text-label);">📷 Fotos:</strong>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                    ${rel.higiene.fotos.map(url => `
                        <div style="position: relative; border-radius: 8px; overflow: hidden; cursor: pointer;" onclick="abrirFotoModal('${url}')">
                            <img src="${url}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; transition: transform 0.3s;" 
                                 onmouseover="this.style.transform='scale(1.05)'" 
                                 onmouseout="this.style.transform='scale(1)'">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `);
    
    // Seção de Sono
    const sonoHTML = criarSecaoDetalhes('💤', 'Sono', `
        <div style="margin-bottom: 15px;">
            <strong>Horário que dormiu:</strong> ${rel.sono.horarioDormiu || 'N/A'}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Processo de dormir:</strong> ${rel.sono.processoDormir || 'N/A'}
        </div>
        ${rel.sono.despertares === 'sim' ? `
            <div style="margin-top: 15px; padding: 15px; background: #FFF5F4; border-left: 4px solid #C97A6F; border-radius: 8px;">
                <strong>⏰ Despertares:</strong> ${rel.sono.horariosDespertares || 'N/A'}<br>
                <strong>Motivo:</strong> ${rel.sono.motivoDespertar || 'N/A'}
            </div>
        ` : '<div style="margin-top: 15px;"><span class="badge badge-verde">Sem despertares</span></div>'}
    `);
    
    // Seção de Comportamento
    const comportamentoHTML = criarSecaoDetalhes('🧸', 'Comportamento e Atividades', `
        <div style="margin-bottom: 15px;">
            <strong>Humor antes de dormir:</strong> ${rel.comportamento.humor || 'N/A'}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Atividade realizada:</strong> ${rel.comportamento.atividade || 'N/A'}
        </div>
        ${rel.comportamento.tempoObjetivo ? `
            <div>
                <strong>Tempo/Objetivo:</strong> ${rel.comportamento.tempoObjetivo}
            </div>
        ` : ''}
    `);
    
    // Seção de Saúde
    const saudeHTML = criarSecaoDetalhes('💊', 'Saúde e Medicação', `
        ${rel.saude.medicamento === 'sim' && rel.saude.medicamentoDetalhes ? `
            <div style="margin-bottom: 15px; padding: 15px; background: #E8F8F5; border-left: 4px solid #4A9B8E; border-radius: 8px;">
                <strong>💊 Medicamentos/Vitaminas:</strong><br>
                ${rel.saude.medicamentoDetalhes}
            </div>
        ` : '<div style="margin-bottom: 15px;"><span class="badge badge-verde">Sem medicamentos</span></div>'}
        ${rel.saude.sintomas !== 'nenhum' ? `
            <div>
                <strong>Sintomas:</strong> 
                <span class="sintoma-badge">${formatarSintomas(rel.saude.sintomas, rel.saude.sintomasOutro)}</span>
            </div>
        ` : '<div><span class="badge badge-verde">Sem sintomas</span></div>'}
    `);
    
    // Seção de Reposição
    const reporHTML = criarSecaoDetalhes('🛒', 'Precisa Repor (Estoque)', rel.repor.length > 0 ? `
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
    
    // Observações
    const observacoesHTML = rel.observacoes ? `
        <div class="observacoes-box-detalhes">
            <strong>📝 Observações Extras</strong>
            ${rel.observacoes}
        </div>
    ` : '';
    
    // Montar HTML completo
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
    
    // Salvar relatório atual
    relatorioAtual = rel;
}

// Funções auxiliares
function criarBarraStatusDetalhes(resumo) {
    const classes = {
        'tranquila': 'tranquila',
        'agitada': 'agitada',
        'interrupcoes': 'interrupcoes'
    };
    const classe = classes[resumo] || 'interrupcoes';
    const texto = formatarResumo(resumo);
    
    return `
        <div class="status-bar-detalhes">
            <div class="status-bar-indicator-detalhes ${classe}"></div>
            <div class="status-bar-content-detalhes">
                <div class="status-bar-label-detalhes">Resumo da Noite</div>
                <div class="status-bar-value-detalhes">${texto}</div>
            </div>
        </div>
    `;
}

function criarSecaoDetalhes(icone, titulo, conteudo) {
    return `
        <div class="secao-detalhes">
            <div class="secao-detalhes-header">
                <span>${icone}</span>
                <span>${titulo}</span>
            </div>
            <div class="secao-detalhes-content">
                ${conteudo}
            </div>
        </div>
    `;
}

function criarBadgeAceitacao(aceitacao) {
    const badges = {
        'tudo': { classe: 'badge-verde', texto: 'Comeu tudo' },
        'recusou-parte': { classe: 'badge-amarelo', texto: 'Recusou parte' },
        'recusou-tudo': { classe: 'badge-vermelho', texto: 'Recusou tudo' }
    };
    const badge = badges[aceitacao] || { classe: 'badge-azul', texto: formatarAceitacao(aceitacao) };
    return `<span class="badge ${badge.classe}">${badge.texto}</span>`;
}

function criarBarraProgressoDetalhes(label, valor, tipo) {
    const valorNum = parseInt(valor) || 0;
    const porcentagem = valorNum === 0 ? 0 : Math.min(100, (valorNum / 10) * 100);
    const classeTipo = `progress-bar-${tipo}`;
    
    return `
        <div class="progress-container-detalhes">
            <div class="progress-label-detalhes">
                <span>${label}</span>
                <span><strong>${valorNum}</strong></span>
            </div>
            <div class="progress-bar-wrapper-detalhes">
                <div class="progress-bar-detalhes ${classeTipo}" style="width: ${porcentagem}%">
                    ${valorNum > 0 ? valorNum : ''}
                </div>
            </div>
        </div>
    `;
}

function criarIndicadorDetalhes(rotulo, valor) {
    const classe = valor === 'sim' || valor === true ? 'indicator-sim' : 'indicator-nao';
    const texto = valor === 'sim' || valor === true ? 'Sim' : 'Não';
    const icone = valor === 'sim' || valor === true ? '✅' : '❌';
    
    return `
        <span class="indicator ${classe}">
            <span class="indicator-icon">${icone}</span>
            <span>${rotulo}: ${texto}</span>
        </span>
    `;
}

function formatarResumo(resumo) {
    const map = {
        'tranquila': 'Tranquila',
        'agitada': 'Agitada',
        'interrupcoes': 'Com interrupções pontuais'
    };
    return map[resumo] || resumo;
}

function formatarAceitacao(aceitacao) {
    const map = {
        'tudo': 'Comeu tudo',
        'recusou-parte': 'Recusou parte',
        'recusou-tudo': 'Recusou tudo'
    };
    return map[aceitacao] || aceitacao;
}

function formatarSintomas(sintomas, outro) {
    const map = {
        'nenhum': 'Nenhum',
        'febre': 'Febre',
        'tosse': 'Tosse',
        'outro': outro || 'Outro'
    };
    return map[sintomas] || sintomas;
}

