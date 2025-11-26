<?php
/**
 * Funções auxiliares para autenticação e sessão
 */

require_once 'config.php';

/**
 * Inicia sessão PHP segura
 */
function iniciarSessao() {
    if (session_status() === PHP_SESSION_NONE) {
        // Configurações de segurança de sessão (já configuradas no config.php)
        // Usar Lax para permitir cookies em redirecionamentos
        session_start();
        
        // Regenerar ID de sessão periodicamente para segurança
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            // Regenerar a cada 30 minutos
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

/**
 * Verifica se o usuário está autenticado
 * @return bool
 */
function verificarAutenticacao() {
    iniciarSessao();
    return isset($_SESSION['usuario_id']) && isset($_SESSION['usuario_login']);
}

/**
 * Verifica se o usuário é admin
 * @return bool
 */
function verificarAdmin() {
    iniciarSessao();
    return verificarAutenticacao() && isset($_SESSION['usuario_tipo']) && $_SESSION['usuario_tipo'] === 'admin';
}

/**
 * Obtém dados do usuário atual da sessão
 * @return array|null
 */
function obterUsuarioAtual() {
    iniciarSessao();
    
    if (!verificarAutenticacao()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['usuario_id'],
        'login' => $_SESSION['usuario_login'],
        'tipo' => $_SESSION['usuario_tipo'] ?? 'user'
    ];
}

/**
 * Define dados do usuário na sessão
 * @param array $usuario
 */
function definirUsuarioSessao($usuario) {
    iniciarSessao();
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_login'] = $usuario['login'];
    $_SESSION['usuario_tipo'] = $usuario['tipo'];
}

/**
 * Destroi a sessão do usuário
 */
function destruirSessao() {
    iniciarSessao();
    $_SESSION = [];
    
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    session_destroy();
}

/**
 * Gera hash de senha usando bcrypt
 * @param string $senha
 * @return string
 */
function hashSenha($senha) {
    return password_hash($senha, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Verifica se a senha corresponde ao hash
 * @param string $senha
 * @param string $hash
 * @return bool
 */
function verificarSenha($senha, $hash) {
    return password_verify($senha, $hash);
}

/**
 * Verifica autenticação e retorna erro JSON se não autenticado
 * @param bool $requireAdmin Se true, requer que seja admin
 * @return bool Retorna true se autenticado (e admin se requerido)
 */
function requerAutenticacao($requireAdmin = false) {
    iniciarSessao();
    
    if (!verificarAutenticacao()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Não autenticado. Faça login para continuar.'
        ]);
        exit;
    }
    
    if ($requireAdmin && !verificarAdmin()) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Acesso negado. Você precisa ser administrador para esta ação.'
        ]);
        exit;
    }
    
    return true;
}

/**
 * Verifica se existem usuários no banco
 * @return bool
 */
function existeUsuarios() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1");
        $result = $stmt->fetch();
        return (int)$result['total'] > 0;
    } catch (PDOException $e) {
        return false;
    }
}

