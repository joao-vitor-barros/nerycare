<?php
/**
 * Arquivo de versão para cache busting
 * 
 * IMPORTANTE: Atualize este número de versão sempre que fizer deploy de atualizações
 * de CSS, JavaScript ou outros recursos estáticos.
 * 
 * Exemplo: Se você atualizar o style.css, mude de '1.1' para '1.2'
 * 
 * COMO USAR:
 * 1. Sempre que atualizar CSS, JS ou outros arquivos estáticos, incremente a versão aqui
 * 2. Faça upload do arquivo version.php atualizado
 * 3. Os usuários verão automaticamente as mudanças sem precisar limpar cache
 * 
 * NOTA: Se o servidor não processar PHP em arquivos .html, você pode:
 * - Renomear index.html para index.php
 * - Renomear relatorio-detalhes.html para relatorio-detalhes.php
 * - Ou configurar o servidor para processar PHP em arquivos HTML
 */
define('APP_VERSION', '1.1');

