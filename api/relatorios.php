<?php
/**
 * API REST para gerenciamento de relatórios
 * Endpoints:
 * GET    /api/relatorios.php - Lista todos os relatórios
 * GET    /api/relatorios.php?id=1 - Busca relatório por ID
 * POST   /api/relatorios.php - Cria novo relatório
 * PUT    /api/relatorios.php?id=1 - Atualiza relatório
 * DELETE /api/relatorios.php?id=1 - Deleta relatório
 */

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// Obter ID se fornecido
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Buscar relatório específico
                getRelatorio($pdo, $id);
            } else {
                // Listar todos os relatórios
                listRelatorios($pdo);
            }
            break;
            
        case 'POST':
            // Criar novo relatório
            createRelatorio($pdo);
            break;
            
        case 'PUT':
            // Atualizar relatório
            if (!$id) {
                throw new Exception('ID do relatório é obrigatório para atualização');
            }
            updateRelatorio($pdo, $id);
            break;
            
        case 'DELETE':
            // Deletar relatório
            if (!$id) {
                throw new Exception('ID do relatório é obrigatório para exclusão');
            }
            deleteRelatorio($pdo, $id);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

/**
 * Listar todos os relatórios
 */
function listRelatorios($pdo) {
    $stmt = $pdo->query("
        SELECT * FROM relatorios 
        ORDER BY data_relatorio DESC, created_at DESC
    ");
    $relatorios = $stmt->fetchAll();
    
    // Converter para formato esperado pelo frontend
    $result = array_map('formatRelatorio', $relatorios);
    
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
}

/**
 * Buscar relatório por ID
 */
function getRelatorio($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM relatorios WHERE id = ?");
    $stmt->execute([$id]);
    $relatorio = $stmt->fetch();
    
    if (!$relatorio) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Relatório não encontrado']);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'data' => formatRelatorio($relatorio)
    ]);
}

/**
 * Criar novo relatório
 */
function createRelatorio($pdo) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Dados JSON inválidos: ' . json_last_error_msg());
    }
    
    // Normalizar dados - garantir que arrays existam
    $alimentacao = isset($data['alimentacao']) && is_array($data['alimentacao']) ? $data['alimentacao'] : [];
    $higiene = isset($data['higiene']) && is_array($data['higiene']) ? $data['higiene'] : [];
    $sono = isset($data['sono']) && is_array($data['sono']) ? $data['sono'] : [];
    $comportamento = isset($data['comportamento']) && is_array($data['comportamento']) ? $data['comportamento'] : [];
    $saude = isset($data['saude']) && is_array($data['saude']) ? $data['saude'] : [];
    
    // Preparar dados para inserção
    $sql = "INSERT INTO relatorios (
        data_relatorio, resumo,
        alimentacao_tipo, alimentacao_horario, alimentacao_quantidade, alimentacao_aceitacao,
        higiene_banho, higiene_trocas_fralda, higiene_xixi, higiene_coco,
        higiene_obs_fralda, higiene_obs_fralda_detalhes, higiene_fotos,
        sono_processo_dormir, sono_horario_dormiu, sono_despertares,
        sono_horarios_despertares, sono_motivo_despertar,
        comportamento_humor, comportamento_atividade, comportamento_tempo_objetivo,
        saude_medicamento, saude_medicamento_detalhes, saude_sintomas, saude_sintomas_outro,
        repor_itens, repor_outro, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    
    // Preparar valores com validação
    $values = [
        isset($data['data']) ? $data['data'] : date('Y-m-d'),
        isset($data['resumo']) ? $data['resumo'] : '',
        isset($alimentacao['tipo']) ? $alimentacao['tipo'] : null,
        isset($alimentacao['horario']) ? $alimentacao['horario'] : null,
        isset($alimentacao['quantidade']) ? $alimentacao['quantidade'] : null,
        isset($alimentacao['aceitacao']) ? $alimentacao['aceitacao'] : null,
        isset($higiene['banho']) ? $higiene['banho'] : null,
        isset($higiene['trocasFralda']) && $higiene['trocasFralda'] !== '' ? (int)$higiene['trocasFralda'] : 0,
        isset($higiene['xixi']) && $higiene['xixi'] !== '' ? (int)$higiene['xixi'] : 0,
        isset($higiene['coco']) && $higiene['coco'] !== '' ? (int)$higiene['coco'] : 0,
        isset($higiene['obsFralda']) ? $higiene['obsFralda'] : null,
        isset($higiene['obsFraldaDetalhes']) ? $higiene['obsFraldaDetalhes'] : null,
        isset($higiene['fotos']) && is_array($higiene['fotos']) && count($higiene['fotos']) > 0 ? json_encode($higiene['fotos']) : null,
        isset($sono['processoDormir']) ? $sono['processoDormir'] : null,
        isset($sono['horarioDormiu']) ? $sono['horarioDormiu'] : null,
        isset($sono['despertares']) ? $sono['despertares'] : null,
        isset($sono['horariosDespertares']) ? $sono['horariosDespertares'] : null,
        isset($sono['motivoDespertar']) ? $sono['motivoDespertar'] : null,
        isset($comportamento['humor']) ? $comportamento['humor'] : null,
        isset($comportamento['atividade']) ? $comportamento['atividade'] : null,
        isset($comportamento['tempoObjetivo']) ? $comportamento['tempoObjetivo'] : null,
        isset($saude['medicamento']) ? $saude['medicamento'] : null,
        isset($saude['medicamentoDetalhes']) ? $saude['medicamentoDetalhes'] : null,
        isset($saude['sintomas']) ? $saude['sintomas'] : null,
        isset($saude['sintomasOutro']) ? $saude['sintomasOutro'] : null,
        isset($data['repor']) && is_array($data['repor']) && count($data['repor']) > 0 ? json_encode($data['repor']) : null,
        isset($data['reporOutro']) ? $data['reporOutro'] : null,
        isset($data['observacoes']) ? $data['observacoes'] : null
    ];
    
    $stmt->execute($values);
    
    $id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Relatório criado com sucesso',
        'id' => $id
    ]);
}

/**
 * Atualizar relatório
 */
function updateRelatorio($pdo, $id) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Dados inválidos');
    }
    
    // Normalizar dados - garantir que arrays existam
    $alimentacao = $data['alimentacao'] ?? [];
    $higiene = $data['higiene'] ?? [];
    $sono = $data['sono'] ?? [];
    $comportamento = $data['comportamento'] ?? [];
    $saude = $data['saude'] ?? [];
    
    $sql = "UPDATE relatorios SET
        data_relatorio = ?, resumo = ?,
        alimentacao_tipo = ?, alimentacao_horario = ?, alimentacao_quantidade = ?, alimentacao_aceitacao = ?,
        higiene_banho = ?, higiene_trocas_fralda = ?, higiene_xixi = ?, higiene_coco = ?,
        higiene_obs_fralda = ?, higiene_obs_fralda_detalhes = ?, higiene_fotos = ?,
        sono_processo_dormir = ?, sono_horario_dormiu = ?, sono_despertares = ?,
        sono_horarios_despertares = ?, sono_motivo_despertar = ?,
        comportamento_humor = ?, comportamento_atividade = ?, comportamento_tempo_objetivo = ?,
        saude_medicamento = ?, saude_medicamento_detalhes = ?, saude_sintomas = ?, saude_sintomas_outro = ?,
        repor_itens = ?, repor_outro = ?, observacoes = ?
        WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    
    // Preparar valores
    $values = [
        $data['data'] ?? date('Y-m-d'),
        $data['resumo'] ?? '',
        $alimentacao['tipo'] ?? null,
        $alimentacao['horario'] ?? null,
        $alimentacao['quantidade'] ?? null,
        $alimentacao['aceitacao'] ?? null,
        $higiene['banho'] ?? null,
        isset($higiene['trocasFralda']) ? (int)$higiene['trocasFralda'] : 0,
        isset($higiene['xixi']) ? (int)$higiene['xixi'] : 0,
        isset($higiene['coco']) ? (int)$higiene['coco'] : 0,
        $higiene['obsFralda'] ?? null,
        $higiene['obsFraldaDetalhes'] ?? null,
        isset($higiene['fotos']) && is_array($higiene['fotos']) && count($higiene['fotos']) > 0 ? json_encode($higiene['fotos']) : null,
        $sono['processoDormir'] ?? null,
        $sono['horarioDormiu'] ?? null,
        $sono['despertares'] ?? null,
        $sono['horariosDespertares'] ?? null,
        $sono['motivoDespertar'] ?? null,
        $comportamento['humor'] ?? null,
        $comportamento['atividade'] ?? null,
        $comportamento['tempoObjetivo'] ?? null,
        $saude['medicamento'] ?? null,
        $saude['medicamentoDetalhes'] ?? null,
        $saude['sintomas'] ?? null,
        $saude['sintomasOutro'] ?? null,
        isset($data['repor']) && is_array($data['repor']) ? json_encode($data['repor']) : null,
        $data['reporOutro'] ?? null,
        $data['observacoes'] ?? null,
        $id
    ];
    
    $stmt->execute($values);
    
    echo json_encode([
        'success' => true,
        'message' => 'Relatório atualizado com sucesso'
    ]);
}

/**
 * Deletar relatório
 */
function deleteRelatorio($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM relatorios WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Relatório não encontrado']);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Relatório deletado com sucesso'
    ]);
}

/**
 * Formatar relatório para o formato esperado pelo frontend
 */
function formatRelatorio($row) {
    return [
        'id' => (int)$row['id'],
        'data' => $row['data_relatorio'],
        'resumo' => $row['resumo'],
        'alimentacao' => [
            'tipo' => $row['alimentacao_tipo'],
            'horario' => $row['alimentacao_horario'],
            'quantidade' => $row['alimentacao_quantidade'],
            'aceitacao' => $row['alimentacao_aceitacao']
        ],
        'higiene' => [
            'banho' => $row['higiene_banho'],
            'trocasFralda' => (int)$row['higiene_trocas_fralda'],
            'xixi' => (int)$row['higiene_xixi'],
            'coco' => (int)$row['higiene_coco'],
            'obsFralda' => $row['higiene_obs_fralda'],
            'obsFraldaDetalhes' => $row['higiene_obs_fralda_detalhes'],
            'fotos' => isset($row['higiene_fotos']) && $row['higiene_fotos'] ? json_decode($row['higiene_fotos'], true) : []
        ],
        'sono' => [
            'processoDormir' => $row['sono_processo_dormir'],
            'horarioDormiu' => $row['sono_horario_dormiu'],
            'despertares' => $row['sono_despertares'],
            'horariosDespertares' => $row['sono_horarios_despertares'],
            'motivoDespertar' => $row['sono_motivo_despertar']
        ],
        'comportamento' => [
            'humor' => $row['comportamento_humor'],
            'atividade' => $row['comportamento_atividade'],
            'tempoObjetivo' => $row['comportamento_tempo_objetivo']
        ],
        'saude' => [
            'medicamento' => $row['saude_medicamento'],
            'medicamentoDetalhes' => $row['saude_medicamento_detalhes'],
            'sintomas' => $row['saude_sintomas'],
            'sintomasOutro' => $row['saude_sintomas_outro']
        ],
        'repor' => $row['repor_itens'] ? json_decode($row['repor_itens'], true) : [],
        'reporOutro' => $row['repor_outro'],
        'observacoes' => $row['observacoes'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at']
    ];
}

