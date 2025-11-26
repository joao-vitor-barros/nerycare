// Inicializar data com a data de hoje e configurações
document.addEventListener('DOMContentLoaded', function() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data-relatorio').value = hoje;
    
    // Inicializar contador de caracteres
    const contador = document.getElementById('contador');
    if (contador) {
        contador.textContent = '0';
    }
    
    // Configurar listeners para campos condicionais
    configurarCamposCondicionais();
    
    // Configurar contador de caracteres para observações
    configurarContadorObservacoes();
});

// Configurar campos que aparecem condicionalmente
function configurarCamposCondicionais() {
    // Observação de fralda diferente
    const obsFraldaInputs = document.querySelectorAll('input[name="obs-fralda"]');
    const obsFraldaDetalhes = document.getElementById('obs-fralda-detalhes');
    const fotosFraldaContainer = document.getElementById('fotos-fralda-container');
    const fotosFraldaInput = document.getElementById('fotos-fralda');
    const btnSelecionarFotos = document.getElementById('btn-selecionar-fotos');
    const previewFotos = document.getElementById('preview-fotos');
    
    obsFraldaInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'diferente') {
                obsFraldaDetalhes.style.display = 'block';
                obsFraldaDetalhes.required = true;
                fotosFraldaContainer.style.display = 'block';
            } else {
                obsFraldaDetalhes.style.display = 'none';
                obsFraldaDetalhes.required = false;
                obsFraldaDetalhes.value = '';
                fotosFraldaContainer.style.display = 'none';
                fotosFraldaInput.value = '';
                previewFotos.innerHTML = '';
            }
        });
    });
    
    // Configurar botão de seleção de fotos
    if (btnSelecionarFotos) {
        btnSelecionarFotos.addEventListener('click', () => {
            fotosFraldaInput.click();
        });
    }
    
    // Preview das fotos selecionadas
    if (fotosFraldaInput) {
        fotosFraldaInput.addEventListener('change', function(e) {
            previewFotos.innerHTML = '';
            const files = Array.from(e.target.files);
            
            files.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const div = document.createElement('div');
                        div.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden;';
                        div.innerHTML = `
                            <img src="${e.target.result}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;">
                            <button type="button" class="btn-remover-foto" data-index="${index}" style="position: absolute; top: 5px; right: 5px; background: rgba(201, 122, 111, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">×</button>
                        `;
                        previewFotos.appendChild(div);
                        
                        // Adicionar evento de remoção
                        div.querySelector('.btn-remover-foto').addEventListener('click', function() {
                            removerFoto(index);
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }
    
    // Função para remover foto
    window.removerFoto = function(index) {
        const dt = new DataTransfer();
        const files = Array.from(fotosFraldaInput.files);
        files.splice(index, 1);
        files.forEach(file => dt.items.add(file));
        fotosFraldaInput.files = dt.files;
        
        // Recriar preview
        const event = new Event('change');
        fotosFraldaInput.dispatchEvent(event);
    };

    // Despertares
    const despertaresInputs = document.querySelectorAll('input[name="despertares"]');
    const horariosDespertares = document.getElementById('horarios-despertares');
    
    despertaresInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'sim') {
                horariosDespertares.style.display = 'block';
                horariosDespertares.required = true;
            } else {
                horariosDespertares.style.display = 'none';
                horariosDespertares.required = false;
                horariosDespertares.value = '';
            }
        });
    });

    // Medicamentos
    const medicamentoInputs = document.querySelectorAll('input[name="medicamento"]');
    const medicamentoDetalhes = document.getElementById('medicamento-detalhes');
    
    medicamentoInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'sim') {
                medicamentoDetalhes.style.display = 'block';
                medicamentoDetalhes.required = true;
            } else {
                medicamentoDetalhes.style.display = 'none';
                medicamentoDetalhes.required = false;
                medicamentoDetalhes.value = '';
            }
        });
    });

    // Sintomas outro
    const sintomasInputs = document.querySelectorAll('input[name="sintomas"]');
    const sintomasOutro = document.getElementById('sintomas-outro');
    
    sintomasInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'outro') {
                sintomasOutro.style.display = 'block';
                sintomasOutro.required = true;
            } else {
                sintomasOutro.style.display = 'none';
                sintomasOutro.required = false;
                sintomasOutro.value = '';
            }
        });
    });

    // Repor outro
    const reporOutro = document.getElementById('repor-outro');
    const reporCheckboxes = document.querySelectorAll('input[name="repor"]');
    
    reporCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const outroChecked = Array.from(reporCheckboxes).find(cb => cb.value === 'outro' && cb.checked);
            if (outroChecked) {
                reporOutro.style.display = 'block';
                reporOutro.required = true;
            } else {
                reporOutro.style.display = 'none';
                reporOutro.required = false;
                reporOutro.value = '';
            }
        });
    });
}

// Configurar contador de caracteres para observações
function configurarContadorObservacoes() {
    const observacoes = document.getElementById('observacoes');
    const contador = document.getElementById('contador');
    const erroObservacoes = document.getElementById('erro-observacoes');
    
    if (!observacoes || !contador || !erroObservacoes) return;
    
    observacoes.addEventListener('input', function() {
        const caracteres = this.value.length;
        contador.textContent = caracteres;
        
        // Atualizar cor do contador
        if (caracteres < 15) {
            contador.style.color = '#C97A6F';
            contador.parentElement.classList.add('insuficiente');
        } else {
            contador.style.color = '#4A9B8E';
            contador.parentElement.classList.remove('insuficiente');
            erroObservacoes.style.display = 'none';
            observacoes.classList.remove('campo-invalido');
        }
    });
    
    // Validação em tempo real
    observacoes.addEventListener('blur', function() {
        if (this.value.length < 15) {
            erroObservacoes.style.display = 'block';
            this.classList.add('campo-invalido');
        } else {
            erroObservacoes.style.display = 'none';
            this.classList.remove('campo-invalido');
        }
    });
}

// Tocar som de confirmação
function tocarSomSucesso() {
    try {
        // Criar contexto de áudio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Criar oscilador para um tom agradável
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Conectar os nós
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar o som (nota musical agradável - Dó maior)
        oscillator.frequency.value = 523.25; // Nota C5
        oscillator.type = 'sine'; // Onda senoidal (som suave)
        
        // Configurar volume (fade in/out suave)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        // Tocar o som
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Adicionar um segundo tom (harmonia)
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.value = 659.25; // Nota E5 (harmonia)
            oscillator2.type = 'sine';
            
            gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
            gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.2);
        }, 100);
    } catch (error) {
        // Se houver erro (navegador não suporta), apenas ignora
        console.log('Áudio não disponível');
    }
}

// Mostrar toast de sucesso
function mostrarToastSucesso() {
    const toast = document.getElementById('toast-sucesso');
    
    // Remover classe anterior se existir
    toast.classList.remove('toast-show', 'toast-hide');
    
    // Forçar reflow para garantir que a animação funcione
    void toast.offsetWidth;
    
    // Mostrar toast
    toast.classList.add('toast-show');
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        
        // Remover classe após animação
        setTimeout(() => {
            toast.classList.remove('toast-hide');
        }, 300);
    }, 3000);
}

// Função para fazer upload de fotos
async function fazerUploadFotos(files) {
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
        formData.append(`foto_${index}`, file);
    });
    
    try {
        const response = await fetch('api/upload-fotos.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Erro ao fazer upload das fotos');
        }
        
        return result.data.urls || [];
    } catch (error) {
        console.error('Erro ao fazer upload das fotos:', error);
        throw error;
    }
}

// Salvar relatório
document.getElementById('formulario-relatorio').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const observacoes = document.getElementById('observacoes');
    const erroObservacoes = document.getElementById('erro-observacoes');
    
    // Validar observações
    if (observacoes.value.trim().length < 15) {
        observacoes.classList.add('campo-invalido');
        erroObservacoes.style.display = 'block';
        observacoes.focus();
        
        // Scroll suave até o campo
        observacoes.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Mostrar alerta
        alert('⚠️ Por favor, escreva pelo menos 15 caracteres no campo de Observações Extras antes de salvar.');
        return;
    }
    
    const dados = coletarDados();
    
    // Desabilitar botão durante salvamento
    const btnSalvar = document.querySelector('.btn-salvar');
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.disabled = true;
    btnSalvar.textContent = '💾 Salvando...';
    
    try {
        // Fazer upload das fotos primeiro, se houver
        const fotosFraldaInput = document.getElementById('fotos-fralda');
        if (fotosFraldaInput && fotosFraldaInput.files.length > 0) {
            btnSalvar.textContent = '📷 Enviando fotos...';
            const fotosUrls = await fazerUploadFotos(fotosFraldaInput.files);
            dados.higiene.fotos = fotosUrls;
        }
        
        btnSalvar.textContent = '💾 Salvando...';
        await salvarRelatorio(dados);
        
        // Tocar som de sucesso
        tocarSomSucesso();
        
        // Mostrar toast de sucesso
        mostrarToastSucesso();
        
        // Limpar formulário após um pequeno delay para melhor UX
        setTimeout(() => {
            limparFormulario();
        }, 500);
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('⚠️ Erro ao salvar relatório. Tente novamente.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = textoOriginal;
    }
});

// Coletar todos os dados do formulário
function coletarDados() {
    const data = document.getElementById('data-relatorio').value;
    
    return {
        data: data,
        resumo: document.querySelector('input[name="resumo"]:checked')?.value || '',
        alimentacao: {
            tipo: document.getElementById('alimentacao-tipo').value,
            horario: document.getElementById('alimentacao-horario').value,
            quantidade: document.getElementById('alimentacao-quantidade').value,
            aceitacao: document.querySelector('input[name="aceitacao"]:checked')?.value || ''
        },
        higiene: {
            banho: document.querySelector('input[name="banho"]:checked')?.value || '',
            trocasFralda: document.getElementById('trocas-fralda').value,
            xixi: document.getElementById('xixi').value,
            coco: document.getElementById('coco').value,
            obsFralda: document.querySelector('input[name="obs-fralda"]:checked')?.value || '',
            obsFraldaDetalhes: document.getElementById('obs-fralda-detalhes').value,
            fotos: [] // Será preenchido após upload
        },
        sono: {
            processoDormir: document.getElementById('processo-dormir').value,
            horarioDormiu: document.getElementById('horario-dormiu').value,
            despertares: document.querySelector('input[name="despertares"]:checked')?.value || '',
            horariosDespertares: document.getElementById('horarios-despertares').value,
            motivoDespertar: document.getElementById('motivo-despertar').value
        },
        comportamento: {
            humor: document.getElementById('humor').value,
            atividade: document.getElementById('atividade').value,
            tempoObjetivo: document.getElementById('tempo-objetivo').value
        },
        saude: {
            medicamento: document.querySelector('input[name="medicamento"]:checked')?.value || '',
            medicamentoDetalhes: document.getElementById('medicamento-detalhes').value,
            sintomas: document.querySelector('input[name="sintomas"]:checked')?.value || '',
            sintomasOutro: document.getElementById('sintomas-outro').value
        },
        repor: Array.from(document.querySelectorAll('input[name="repor"]:checked')).map(cb => cb.value),
        reporOutro: document.getElementById('repor-outro').value,
        observacoes: document.getElementById('observacoes').value
    };
}

// Salvar relatório (usando API com fallback para localStorage)
async function salvarRelatorio(dados) {
    try {
        const response = await criarRelatorio(dados);
        return response;
    } catch (error) {
        console.error('Erro ao salvar via API, usando localStorage:', error);
        // Fallback para localStorage
        let relatorios = JSON.parse(localStorage.getItem('relatorios') || '[]');
        relatorios.push(dados);
        localStorage.setItem('relatorios', JSON.stringify(relatorios));
        return { success: true, message: 'Salvo localmente' };
    }
}

// Limpar formulário
function limparFormulario() {
    document.getElementById('formulario-relatorio').reset();
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data-relatorio').value = hoje;
    
    // Esconder campos condicionais
    document.getElementById('obs-fralda-detalhes').style.display = 'none';
    document.getElementById('fotos-fralda-container').style.display = 'none';
    document.getElementById('horarios-despertares').style.display = 'none';
    document.getElementById('medicamento-detalhes').style.display = 'none';
    document.getElementById('sintomas-outro').style.display = 'none';
    document.getElementById('repor-outro').style.display = 'none';
    
    // Limpar fotos
    const fotosFraldaInput = document.getElementById('fotos-fralda');
    if (fotosFraldaInput) {
        fotosFraldaInput.value = '';
    }
    const previewFotos = document.getElementById('preview-fotos');
    if (previewFotos) {
        previewFotos.innerHTML = '';
    }
    
    // Limpar validação de observações
    const observacoes = document.getElementById('observacoes');
    const contador = document.getElementById('contador');
    const erroObservacoes = document.getElementById('erro-observacoes');
    
    observacoes.classList.remove('campo-invalido');
    contador.textContent = '0';
    contador.style.color = '#4A9B8E';
    erroObservacoes.style.display = 'none';
    contador.parentElement.classList.remove('insuficiente');
}

// Variável global para armazenar todos os relatórios
let todosRelatorios = [];
let dataFiltroAtual = null;

// Ver relatórios salvos
async function verRelatorios() {
    // Mostrar loading
    document.getElementById('lista-relatorios').innerHTML = 
        '<div class="sem-relatorios"><p>⏳ Carregando relatórios...</p></div>';
    document.getElementById('modal-relatorios').style.display = 'block';
    
    try {
        todosRelatorios = await listarRelatorios();
        
        if (todosRelatorios.length === 0) {
            document.getElementById('lista-relatorios').innerHTML = 
                '<div class="sem-relatorios"><p>📭 Nenhum relatório salvo ainda.</p></div>';
            document.getElementById('data-atual-filtro').textContent = '';
        } else {
            // Ordenar por data (mais recente primeiro)
            todosRelatorios.sort((a, b) => new Date(b.data) - new Date(a.data));
            dataFiltroAtual = null;
            limparFiltro();
        }
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        document.getElementById('lista-relatorios').innerHTML = 
            '<div class="sem-relatorios"><p>⚠️ Erro ao carregar relatórios. Tente novamente.</p></div>';
    }
}

// Filtrar relatórios por data
function filtrarPorData() {
    const dataInput = document.getElementById('filtro-data').value;
    const lista = document.getElementById('lista-relatorios');
    
    if (!dataInput) {
        limparFiltro();
        return;
    }
    
    dataFiltroAtual = dataInput;
    const relatoriosFiltrados = todosRelatorios.filter(rel => rel.data === dataInput);
    
    atualizarDataAtual(dataInput);
    exibirRelatorios(relatoriosFiltrados);
}

// Limpar filtro e mostrar todos
function limparFiltro() {
    document.getElementById('filtro-data').value = '';
    dataFiltroAtual = null;
    atualizarDataAtual(null);
    exibirRelatorios(todosRelatorios);
}

// Navegar entre datas (anterior/próximo)
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

// Atualizar exibição da data atual
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

// Exibir relatórios na lista
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
        // Encontrar o índice original no array completo
        // Usar ID se disponível, senão usar comparação completa
        let indexReal = -1;
        if (rel.id !== undefined) {
            // Se tem ID, buscar pelo ID
            indexReal = todosRelatorios.findIndex(r => r.id === rel.id);
        }
        
        if (indexReal === -1) {
            // Se não encontrou pelo ID, buscar por comparação completa
            for (let i = 0; i < todosRelatorios.length; i++) {
                if (todosRelatorios[i].data === rel.data && 
                    JSON.stringify(todosRelatorios[i]) === JSON.stringify(rel)) {
                    indexReal = i;
                    break;
                }
            }
        }
        
        if (indexReal !== -1) {
            relatoriosPorData[data].push({ relatorio: rel, index: indexReal });
        }
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
        
        relatoriosPorData[data].forEach(({ relatorio, index }) => {
            // Usar ID do banco se disponível, senão usar índice
            const identificador = relatorio.id !== undefined ? relatorio.id : index;
            html += criarHTMLRelatorio(relatorio, identificador, index);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    lista.innerHTML = html;
}

// Funções auxiliares para elementos visuais
function criarBarraStatus(resumo) {
    const classes = {
        'tranquila': 'tranquila',
        'agitada': 'agitada',
        'interrupcoes': 'interrupcoes'
    };
    const classe = classes[resumo] || 'interrupcoes';
    const texto = formatarResumo(resumo);
    
    return `
        <div class="status-bar">
            <div class="status-bar-indicator ${classe}"></div>
            <div class="status-bar-content">
                <div class="status-bar-label">Resumo da Noite</div>
                <div class="status-bar-value">${texto}</div>
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

function criarBarraProgresso(label, valor, tipo) {
    const valorNum = parseInt(valor) || 0;
    // Normalizar: máximo de 5 para visualização (se tiver mais que 5, mostra 100%)
    const porcentagem = valorNum === 0 ? 0 : Math.min(100, (valorNum / 5) * 100);
    const classeTipo = `progress-bar-${tipo}`;
    
    return `
        <div class="progress-container">
            <div class="progress-label">
                <span>${label}</span>
                <span><strong>${valorNum}</strong></span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar ${classeTipo}" style="width: ${porcentagem}%">
                    ${valorNum > 0 ? valorNum : ''}
                </div>
            </div>
        </div>
    `;
}

function criarIndicador(rotulo, valor, tipo) {
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

function criarCardSecao(icone, titulo, conteudo) {
    return `
        <div class="relatorio-secao">
            <div class="relatorio-secao-header">
                <span>${icone}</span>
                <span>${titulo}</span>
            </div>
            <div class="relatorio-secao-content">
                ${conteudo}
            </div>
        </div>
    `;
}

// Criar HTML do relatório (versão simplificada para lista)
function criarHTMLRelatorio(rel, id, index) {
    const dataFormatada = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="relatorio-item-simples">
            <div class="relatorio-item-header-simples">
                <h3>📋 ${dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}</h3>
            </div>
            <div class="relatorio-item-botoes-simples">
                <button onclick="abrirRelatorioDetalhes(${index})" class="btn-ver-detalhes">👁️ Ver Detalhes</button>
                <button onclick="excluirRelatorio(${index})" class="btn-excluir-relatorio">🗑️ Excluir</button>
            </div>
            <input type="hidden" class="relatorio-id" value="${id}">
            <input type="hidden" class="relatorio-index" value="${index}">
        </div>
    `;
}

// Funções auxiliares para formatação
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

function formatarRepor(repor, outro) {
    const map = {
        'fraldas': 'Fraldas',
        'lenços': 'Lenços',
        'pomada': 'Pomada',
        'leite': 'Leite/Fórmula',
        'outro': outro || 'Outro'
    };
    return repor.map(item => map[item] || item).join(', ');
}

// Fechar modal
function fecharModal() {
    document.getElementById('modal-relatorios').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal-relatorios');
    if (event.target === modal) {
        fecharModal();
    }
}

// Abrir relatório em página separada
async function abrirRelatorioDetalhes(index) {
    if (index >= 0 && index < todosRelatorios.length) {
        const relatorio = todosRelatorios[index];
        
        // Se o relatório tem ID, buscar do servidor; senão usar o local
        if (relatorio.id) {
            try {
                const relatorioCompleto = await buscarRelatorio(relatorio.id);
                sessionStorage.setItem('relatorioDetalhes', JSON.stringify(relatorioCompleto));
            } catch (error) {
                console.error('Erro ao buscar relatório completo:', error);
                // Usar o relatório local como fallback
                sessionStorage.setItem('relatorioDetalhes', JSON.stringify(relatorio));
            }
        } else {
            sessionStorage.setItem('relatorioDetalhes', JSON.stringify(relatorio));
        }
        
        sessionStorage.setItem('relatorioIndex', index);
        // Abrir nova página
        window.open('relatorio-detalhes.html', '_blank');
    }
}

// Excluir relatório
async function excluirRelatorio(index) {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
        return;
    }
    
    const relatorio = todosRelatorios[index];
    
    // Se tem ID, deletar do servidor
    if (relatorio && relatorio.id) {
        try {
            await deletarRelatorio(relatorio.id);
        } catch (error) {
            console.error('Erro ao deletar do servidor:', error);
            alert('⚠️ Erro ao deletar do servidor. O relatório pode ainda estar disponível.');
        }
    }
    
    // Remover da lista local
    todosRelatorios.splice(index, 1);
    
    // Atualizar localStorage como backup
    try {
        localStorage.setItem('relatorios', JSON.stringify(todosRelatorios));
    } catch (error) {
        console.error('Erro ao atualizar localStorage:', error);
    }
    
    // Atualizar a exibição
    if (dataFiltroAtual) {
        filtrarPorData();
    } else {
        limparFiltro();
    }
}

