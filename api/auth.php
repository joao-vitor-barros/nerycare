<?php
/**
 * API de Autenticação
 * Endpoints:
 * POST /api/auth.php?action=login - Autenticar usuário
 * POST /api/auth.php?action=logout - Encerrar sessão
 * GET  /api/auth.php?action=check - Verificar sessão atual
 * GET  /api/auth.php?action=me - Obter dados do usuário logado
 */

require_once '../auth-helpers.php';

// Configurar headers para JSON e CORS
setHeaders();

// Iniciar sessão
iniciarSessao();

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        case 'check':
            handleCheck();
            break;
            
        case 'me':
            handleMe();
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Ação não especificada ou inválida'
            ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno: ' . $e->getMessage()
    ]);
}

/**
 * Processa login
 */
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método não permitido']);
        return;
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['login']) || !isset($data['senha'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Login e senha são obrigatórios'
        ]);
        return;
    }
    
    $login = trim($data['login']);
    $senha = $data['senha'];
    
    // Validação básica
    if (empty($login) || empty($senha)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Login e senha não podem estar vazios'
        ]);
        return;
    }
    
    $pdo = getDBConnection();
    
    // Verificar se já existem usuários
    $existeUsuarios = existeUsuarios();
    
    if (!$existeUsuarios) {
        // Primeiro login - criar automaticamente como admin
        $senhaHash = hashSenha($senha);
        
        try {
            $stmt = $pdo->prepare("
                INSERT INTO usuarios (login, senha, tipo, ativo, criado_por) 
                VALUES (?, ?, 'admin', 1, NULL)
            ");
            $stmt->execute([$login, $senhaHash]);
            
            $userId = $pdo->lastInsertId();
            
            // Definir sessão
            definirUsuarioSessao([
                'id' => $userId,
                'login' => $login,
                'tipo' => 'admin'
            ]);
            
            // Regenerar ID de sessão após login para segurança
            session_regenerate_id(true);
            
            echo json_encode([
                'success' => true,
                'message' => 'Primeiro usuário criado como administrador',
                'user' => [
                    'id' => $userId,
                    'login' => $login,
                    'tipo' => 'admin'
                ]
            ]);
            return;
            
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Este login já está em uso'
                ]);
            } else {
                throw $e;
            }
            return;
        }
    }
    
    // Login normal - buscar usuário
    $stmt = $pdo->prepare("
        SELECT id, login, senha, tipo, ativo 
        FROM usuarios 
        WHERE login = ? AND ativo = 1
    ");
    $stmt->execute([$login]);
    $usuario = $stmt->fetch();
    
    if (!$usuario || !verificarSenha($senha, $usuario['senha'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Login ou senha incorretos'
        ]);
        return;
    }
    
    // Definir sessão
    definirUsuarioSessao([
        'id' => $usuario['id'],
        'login' => $usuario['login'],
        'tipo' => $usuario['tipo']
    ]);
    
    // Regenerar ID de sessão após login para segurança
    session_regenerate_id(true);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'user' => [
            'id' => $usuario['id'],
            'login' => $usuario['login'],
            'tipo' => $usuario['tipo']
        ]
    ]);
}

/**
 * Processa logout
 */
function handleLogout() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método não permitido']);
        return;
    }
    
    destruirSessao();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout realizado com sucesso'
    ]);
}

/**
 * Verifica sessão atual
 */
function handleCheck() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método não permitido']);
        return;
    }
    
    if (verificarAutenticacao()) {
        $usuario = obterUsuarioAtual();
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user' => $usuario
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'authenticated' => false
        ]);
    }
}

/**
 * Obtém dados do usuário logado
 */
function handleMe() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método não permitido']);
        return;
    }
    
    requerAutenticacao();
    
    $usuario = obterUsuarioAtual();
    
    echo json_encode([
        'success' => true,
        'user' => $usuario
    ]);
}

