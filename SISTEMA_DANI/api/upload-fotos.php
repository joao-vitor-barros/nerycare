<?php
/**
 * API para upload de fotos
 * Endpoint: POST /api/upload-fotos.php
 */

require_once '../config.php';

// Configurar CORS
setHeaders();

// Apenas POST permitido
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

// Diretório para salvar as fotos
$uploadDir = '../uploads/fotos/';

// Criar diretório se não existir
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Configurações de upload
$maxFileSize = 5 * 1024 * 1024; // 5MB por arquivo
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$uploadedFiles = [];
$errors = [];

// Processar cada arquivo enviado
foreach ($_FILES as $key => $file) {
    if ($file['error'] === UPLOAD_ERR_OK) {
        // Validar tipo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            $errors[] = "Arquivo {$file['name']}: tipo não permitido";
            continue;
        }
        
        // Validar tamanho
        if ($file['size'] > $maxFileSize) {
            $errors[] = "Arquivo {$file['name']}: tamanho excede 5MB";
            continue;
        }
        
        // Gerar nome único
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('foto_', true) . '_' . time() . '.' . $extension;
        $filePath = $uploadDir . $fileName;
        
        // Mover arquivo
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // URL relativa para acesso
            $url = 'uploads/fotos/' . $fileName;
            $uploadedFiles[] = [
                'name' => $file['name'],
                'url' => $url,
                'size' => $file['size']
            ];
        } else {
            $errors[] = "Erro ao salvar arquivo {$file['name']}";
        }
    } else {
        $errors[] = "Erro no upload do arquivo: " . $file['name'];
    }
}

// Retornar resultado
if (count($uploadedFiles) > 0) {
    echo json_encode([
        'success' => true,
        'data' => [
            'urls' => array_column($uploadedFiles, 'url'),
            'files' => $uploadedFiles
        ],
        'errors' => $errors
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => count($errors) > 0 ? implode(', ', $errors) : 'Nenhum arquivo foi enviado com sucesso'
    ]);
}
?>


