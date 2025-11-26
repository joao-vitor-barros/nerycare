/**
 * Serviço de API para comunicação com o backend
 * Substitui o uso direto do localStorage
 */

const API_BASE_URL = 'api/relatorios.php';

/**
 * Função auxiliar para fazer requisições HTTP
 */
async function apiRequest(method, url, data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro na requisição');
        }
        
        return result;
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

/**
 * Listar todos os relatórios
 */
async function listarRelatorios() {
    try {
        const response = await apiRequest('GET', API_BASE_URL);
        return response.data || [];
    } catch (error) {
        console.error('Erro ao listar relatórios:', error);
        // Fallback para localStorage se API falhar
        return getRelatoriosLocalStorage();
    }
}

/**
 * Buscar relatório por ID
 */
async function buscarRelatorio(id) {
    try {
        const response = await apiRequest('GET', `${API_BASE_URL}?id=${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        throw error;
    }
}

/**
 * Criar novo relatório
 */
async function criarRelatorio(dados) {
    try {
        const response = await apiRequest('POST', API_BASE_URL, dados);
        
        // Salvar também no localStorage como backup
        salvarRelatorioLocalStorage(dados);
        
        return response;
    } catch (error) {
        console.error('Erro ao criar relatório:', error);
        // Fallback para localStorage se API falhar
        salvarRelatorioLocalStorage(dados);
        return { success: true, message: 'Salvo localmente (modo offline)' };
    }
}

/**
 * Atualizar relatório
 */
async function atualizarRelatorio(id, dados) {
    try {
        const response = await apiRequest('PUT', `${API_BASE_URL}?id=${id}`, dados);
        return response;
    } catch (error) {
        console.error('Erro ao atualizar relatório:', error);
        throw error;
    }
}

/**
 * Deletar relatório
 */
async function deletarRelatorio(id) {
    try {
        const response = await apiRequest('DELETE', `${API_BASE_URL}?id=${id}`);
        return response;
    } catch (error) {
        console.error('Erro ao deletar relatório:', error);
        throw error;
    }
}

/**
 * Verificar se a API está disponível
 */
async function verificarAPI() {
    try {
        const response = await fetch(API_BASE_URL, { method: 'GET' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// ============================================
// Funções de fallback para localStorage
// ============================================

function salvarRelatorioLocalStorage(dados) {
    try {
        let relatorios = JSON.parse(localStorage.getItem('relatorios') || '[]');
        relatorios.push(dados);
        localStorage.setItem('relatorios', JSON.stringify(relatorios));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

function getRelatoriosLocalStorage() {
    try {
        return JSON.parse(localStorage.getItem('relatorios') || '[]');
    } catch (error) {
        console.error('Erro ao ler localStorage:', error);
        return [];
    }
}

