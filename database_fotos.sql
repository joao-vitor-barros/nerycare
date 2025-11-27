-- Adicionar coluna para armazenar URLs das fotos na tabela relatorios
-- Execute este script no phpMyAdmin ou via linha de comando MySQL

USE nerycare_db;

ALTER TABLE relatorios
ADD COLUMN IF NOT EXISTS higiene_fotos TEXT NULL COMMENT 'JSON array com URLs das fotos';



