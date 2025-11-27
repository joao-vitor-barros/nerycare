-- Banco de dados para Sistema de Relatórios NeryCare
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

CREATE DATABASE IF NOT EXISTS nerycare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nerycare_db;

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_relatorio DATE NOT NULL,
    resumo VARCHAR(50),
    
    -- Alimentação
    alimentacao_tipo VARCHAR(255),
    alimentacao_horario TIME,
    alimentacao_quantidade VARCHAR(255),
    alimentacao_aceitacao VARCHAR(50),
    
    -- Higiene
    higiene_banho VARCHAR(10),
    higiene_trocas_fralda INT DEFAULT 0,
    higiene_xixi INT DEFAULT 0,
    higiene_coco INT DEFAULT 0,
    higiene_obs_fralda VARCHAR(50),
    higiene_obs_fralda_detalhes TEXT,
    
    -- Sono
    sono_processo_dormir VARCHAR(255),
    sono_horario_dormiu TIME,
    sono_despertares VARCHAR(10),
    sono_horarios_despertares VARCHAR(255),
    sono_motivo_despertar VARCHAR(255),
    
    -- Comportamento
    comportamento_humor VARCHAR(255),
    comportamento_atividade VARCHAR(255),
    comportamento_tempo_objetivo VARCHAR(255),
    
    -- Saúde
    saude_medicamento VARCHAR(10),
    saude_medicamento_detalhes TEXT,
    saude_sintomas VARCHAR(50),
    saude_sintomas_outro VARCHAR(255),
    
    -- Reposição
    repor_itens TEXT, -- JSON array
    repor_outro VARCHAR(255),
    
    -- Observações
    observacoes TEXT,
    
    -- Campos da mãe
    nome VARCHAR(255),
    comentario TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_data (data_relatorio),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

