<?php
/**
 * API de Gerenciamento de Usuários
 * Endpoints:
 * GET    /api/usuarios.php - Listar todos os usuários (apenas admin)
 * POST   /api/usuarios.php - Criar novo usuário (apenas admin)
 * PUT    /api/usuarios.php?id=X - Atualizar usuário (apenas admin)
 * DELETE /api/usuarios.php?id=X - Deletar usuário (apenas admin)
 */

require_once '../auth-helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Todas as operações requerem autenticação admin
requerAutenticacao(true);

$pdo = getDBConnection();
$usuarioAtual = obterUsuarioAtual();

try {
    switch ($method) {
        case 'GET':
            listarUsuarios($pdo);
            break;
            
        case 'POST':
            criarUsuario($pdo, $usuarioAtual);
            break;
            
        case 'PUT':
            if (!$id) {
                throw new Exception('ID do usuário é obrigatório para atualização');
            }
            atualizarUsuario($pdo, $id, $usuarioAtual);
            break;
            
        case 'DELETE':
            if (!$id) {
                throw new Exception('ID do usuário é obrigatório para exclusão');
            }
            deletarUsuario($pdo, $id, $usuarioAtual);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Listar todos os usuários
 */
function listarUsuarios($pdo) {
    $stmt = $pdo->query("
        SELECT id, login, tipo, ativo, criado_em, atualizado_em, criado_por
        FROM usuarios
        ORDER BY criado_em DESC
    ");
    $usuarios = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $usuarios
    ]);
}

/**
 * Criar novo usuário
 */
function criarUsuario($pdo, $usuarioAtual) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['login']) || !isset($data['senha'])) {
        throw new Exception('Login e senha são obrigatórios');
    }
    
    $login = trim($data['login']);
    $senha = $data['senha'];
    $tipo = isset($data['tipo']) && in_array($data['tipo'], ['admin', 'user']) 
        ? $data['tipo'] 
        : 'user';
    
    // Validação
    if (empty($login)) {
        throw new Exception('Login não pode estar vazio');
    }
    
    if (empty($senha) || strlen($senha) < 4) {
        throw new Exception('Senha deve ter pelo menos 4 caracteres');
    }
    
    // Verificar se login já existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE login = ?");
    $stmt->execute([$login]);
    if ($stmt->fetch()) {
        throw new Exception('Este login já está em uso');
    }
    
    // Criar usuário
    $senhaHash = hashSenha($senha);
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (login, senha, tipo, ativo, criado_por) 
        VALUES (?, ?, ?, 1, ?)
    ");
    $stmt->execute([$login, $senhaHash, $tipo, $usuarioAtual['id']]);
    
    $userId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Usuário criado com sucesso',
        'id' => $userId
    ]);
}

/**
 * Atualizar usuário
 */
function atualizarUsuario($pdo, $id, $usuarioAtual) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Dados inválidos');
    }
    
    // Verificar se usuário existe
    $stmt = $pdo->prepare("SELECT id, tipo FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        throw new Exception('Usuário não encontrado');
    }
    
    // Verificar se é o último admin e está tentando desativar/alterar tipo
    if ($usuario['tipo'] === 'admin') {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE tipo = 'admin' AND ativo = 1");
        $totalAdmins = (int)$stmt->fetch()['total'];
        
        if ($totalAdmins === 1 && isset($data['tipo']) && $data['tipo'] !== 'admin') {
            throw new Exception('Não é possível alterar o tipo do último administrador');
        }
        
        if ($totalAdmins === 1 && isset($data['ativo']) && $data['ativo'] === false) {
            throw new Exception('Não é possível desativar o último administrador');
        }
    }
    
    // Construir query de atualização
    $campos = [];
    $valores = [];
    
    if (isset($data['login'])) {
        $login = trim($data['login']);
        if (empty($login)) {
            throw new Exception('Login não pode estar vazio');
        }
        
        // Verificar se login já existe em outro usuário
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE login = ? AND id != ?");
        $stmt->execute([$login, $id]);
        if ($stmt->fetch()) {
            throw new Exception('Este login já está em uso por outro usuário');
        }
        
        $campos[] = "login = ?";
        $valores[] = $login;
    }
    
    if (isset($data['senha']) && !empty($data['senha'])) {
        if (strlen($data['senha']) < 4) {
            throw new Exception('Senha deve ter pelo menos 4 caracteres');
        }
        $campos[] = "senha = ?";
        $valores[] = hashSenha($data['senha']);
    }
    
    if (isset($data['tipo']) && in_array($data['tipo'], ['admin', 'user'])) {
        $campos[] = "tipo = ?";
        $valores[] = $data['tipo'];
    }
    
    if (isset($data['ativo'])) {
        // Impedir que admin desative a si mesmo
        if ($id == $usuarioAtual['id']) {
            throw new Exception('Você não pode desativar a si mesmo');
        }
        $campos[] = "ativo = ?";
        $valores[] = $data['ativo'] ? 1 : 0;
    }
    
    if (empty($campos)) {
        throw new Exception('Nenhum campo para atualizar');
    }
    
    $valores[] = $id;
    $sql = "UPDATE usuarios SET " . implode(', ', $campos) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    
    echo json_encode([
        'success' => true,
        'message' => 'Usuário atualizado com sucesso'
    ]);
}

/**
 * Deletar usuário
 */
function deletarUsuario($pdo, $id, $usuarioAtual) {
    // Verificar se usuário existe
    $stmt = $pdo->prepare("SELECT id, tipo FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        throw new Exception('Usuário não encontrado');
    }
    
    // Impedir deletar a si mesmo
    if ($id == $usuarioAtual['id']) {
        throw new Exception('Você não pode deletar a si mesmo');
    }
    
    // Verificar se é o último admin
    if ($usuario['tipo'] === 'admin') {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE tipo = 'admin' AND ativo = 1");
        $totalAdmins = (int)$stmt->fetch()['total'];
        
        if ($totalAdmins === 1) {
            throw new Exception('Não é possível deletar o último administrador');
        }
    }
    
    // Deletar usuário
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Usuário deletado com sucesso'
    ]);
}

