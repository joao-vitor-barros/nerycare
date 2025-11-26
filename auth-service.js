/**
 * Serviço de Autenticação
 * Gerencia login, logout e verificação de sessão
 */

const AUTH_API_BASE = 'api/auth.php';

/**
 * Fazer login
 * @param {string} login
 * @param {string} senha
 * @returns {Promise<Object>}
 */
async function login(login, senha) {
    try {
        const response = await fetch(`${AUTH_API_BASE}?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, senha }),
            credentials: 'include' // Incluir cookies de sessão
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: resultado.error || 'Erro ao fazer login'
            };
        }
        
        return resultado;
    } catch (error) {
        console.error('Erro no login:', error);
        return {
            success: false,
            error: 'Erro ao conectar com o servidor. Verifique sua conexão.'
        };
    }
}

/**
 * Fazer logout
 * @returns {Promise<Object>}
 */
async function logout() {
    try {
        const response = await fetch(`${AUTH_API_BASE}?action=logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const resultado = await response.json();
        
        // Redirecionar para login após logout
        window.location.href = 'login.html';
        
        return resultado;
    } catch (error) {
        console.error('Erro no logout:', error);
        // Mesmo com erro, redirecionar para login
        window.location.href = 'login.html';
        return {
            success: false,
            error: 'Erro ao fazer logout'
        };
    }
}

/**
 * Verificar sessão atual
 * @returns {Promise<Object>}
 */
async function verificarSessao() {
    try {
        const response = await fetch(`${AUTH_API_BASE}?action=check`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            return {
                authenticated: false
            };
        }
        
        return resultado;
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return {
            authenticated: false
        };
    }
}

/**
 * Obter dados do usuário atual
 * @returns {Promise<Object|null>}
 */
async function obterUsuarioAtual() {
    try {
        const response = await fetch(`${AUTH_API_BASE}?action=me`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const resultado = await response.json();
        
        if (!response.ok || !resultado.success) {
            return null;
        }
        
        return resultado.user || null;
    } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
    }
}

/**
 * Verificar se usuário é admin
 * @returns {Promise<boolean>}
 */
async function isAdmin() {
    const usuario = await obterUsuarioAtual();
    return usuario && usuario.tipo === 'admin';
}

/**
 * Redirecionar para login se não autenticado
 */
async function redirecionarSeNaoAutenticado() {
    const sessao = await verificarSessao();
    if (!sessao.authenticated) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Redirecionar para login se não for admin
 */
async function redirecionarSeNaoAdmin() {
    const autenticado = await redirecionarSeNaoAutenticado();
    if (!autenticado) {
        return false;
    }
    
    const admin = await isAdmin();
    if (!admin) {
        alert('Acesso negado. Esta área é apenas para administradores.');
        window.location.href = 'agenda.html';
        return false;
    }
    return true;
}

/**
 * Proteger página - verificar autenticação ao carregar
 * @param {boolean} requireAdmin Se true, requer que seja admin
 */
async function protegerPagina(requireAdmin = false) {
    if (requireAdmin) {
        await redirecionarSeNaoAdmin();
    } else {
        await redirecionarSeNaoAutenticado();
    }
}

