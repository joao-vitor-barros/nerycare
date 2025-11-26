<?php
/**
 * Configuração do Banco de Dados
 * Configure estas variáveis com os dados fornecidos pela Hostoo
 */

// Configurações do banco de dados
define('DB_HOST', 'localhost'); // Geralmente 'localhost' na Hostoo
define('DB_NAME', 'nerycare_db'); // Nome do banco que você criou
define('DB_USER', 'joaozinho2073'); // Seu usuário do banco de dados
define('DB_PASS', 'Clastofo2073*'); // Sua senha do banco de dados
define('DB_CHARSET', 'utf8mb4');

// Configurações de segurança
define('ALLOWED_ORIGINS', '*'); // Para produção, defina o domínio específico
define('ENABLE_CORS', true);

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurações de sessão
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Strict');
// Para HTTPS em produção, descomente a linha abaixo:
// ini_set('session.cookie_secure', 1);
session_start();

/**
 * Conexão com o banco de dados
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao conectar com o banco de dados: ' . $e->getMessage()
        ]);
        exit;
    }
}

/**
 * Headers CORS e JSON
 */
function setHeaders() {
    if (ENABLE_CORS) {
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
    header('Content-Type: application/json; charset=utf-8');
    
    // Responder a requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Configurar headers
setHeaders();

