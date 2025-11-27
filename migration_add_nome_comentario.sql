-- Script de migração para adicionar campos nome e comentario
-- Execute este script se você já tem o banco de dados criado

USE nerycare_db;

-- Adicionar campos nome e comentario na tabela relatorios
ALTER TABLE relatorios 
ADD COLUMN nome VARCHAR(255) NULL AFTER observacoes,
ADD COLUMN comentario TEXT NULL AFTER nome;

