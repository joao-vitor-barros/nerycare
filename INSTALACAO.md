# 📦 Guia de Instalação - Sistema NeryCare

Este guia explica como instalar e configurar o sistema na Hostoo ou em qualquer hospedagem com PHP e MySQL.

## 📋 Pré-requisitos

- Hospedagem com suporte a PHP 7.4 ou superior
- Banco de dados MySQL/MariaDB
- Acesso ao phpMyAdmin ou linha de comando MySQL
- FTP ou acesso SSH para upload de arquivos

## 🚀 Passo a Passo

### 1. Preparar o Banco de Dados

1. Acesse o **phpMyAdmin** no painel da Hostoo
2. Crie um novo banco de dados (ex: `nerycare_db`)
3. Selecione o banco criado
4. Vá na aba **SQL**
5. Copie e cole o conteúdo do arquivo `database.sql`
6. Clique em **Executar**

**OU** execute via linha de comando:
```bash
mysql -u seu_usuario -p nome_do_banco < database.sql
```

### 2. Configurar a Conexão

1. Abra o arquivo `config.php`
2. Edite as seguintes linhas com seus dados da Hostoo:

```php
define('DB_HOST', 'localhost'); // Geralmente 'localhost' na Hostoo
define('DB_NAME', 'nerycare_db'); // Nome do banco que você criou
define('DB_USER', 'seu_usuario'); // Seu usuário do banco de dados
define('DB_PASS', 'sua_senha'); // Sua senha do banco de dados
```

**Onde encontrar esses dados:**
- No painel da Hostoo, procure por "Banco de Dados" ou "MySQL"
- Os dados geralmente estão em "Informações do Banco de Dados"

### 3. Upload dos Arquivos

Faça upload de **TODOS** os arquivos para a raiz do seu domínio (pasta `public_html` ou `www`):

```
/
├── index.html
├── relatorio-detalhes.html
├── script.js
├── api-service.js
├── style.css
├── detalhes.css
├── detalhes.js
├── config.php
├── .htaccess
├── database.sql (opcional - já executado)
└── api/
    └── relatorios.php
```

**Importante:**
- Mantenha a estrutura de pastas (pasta `api/` deve existir)
- O arquivo `config.php` deve estar na raiz
- O arquivo `.htaccess` deve estar na raiz

### 4. Configurar Permissões (se necessário)

Alguns servidores podem exigir permissões específicas. Se houver erros, tente:

```bash
chmod 644 config.php
chmod 644 api/relatorios.php
chmod 644 .htaccess
```

### 5. Testar a Instalação

1. Acesse seu site: `https://seudominio.com.br`
2. Tente criar um relatório
3. Verifique se aparece a mensagem de sucesso
4. Tente visualizar os relatórios salvos

## 🔧 Solução de Problemas

### Erro: "Erro ao conectar com o banco de dados"

- Verifique se os dados em `config.php` estão corretos
- Confirme que o banco de dados foi criado
- Verifique se o usuário tem permissões no banco

### Erro: "Método não permitido" ou 405

- Verifique se o arquivo `.htaccess` foi enviado
- Confirme que o servidor suporta mod_rewrite
- Tente acessar diretamente: `api/relatorios.php`

### Relatórios não aparecem

- Abra o Console do navegador (F12) e verifique erros
- Verifique se a pasta `api/` existe e contém `relatorios.php`
- Teste acessando diretamente: `seudominio.com.br/api/relatorios.php`

### Erro de CORS

Se estiver testando localmente antes de subir:

1. Edite `config.php`:
```php
define('ALLOWED_ORIGINS', 'http://localhost:8000'); // Seu domínio local
```

2. Na produção, defina:
```php
define('ALLOWED_ORIGINS', 'https://seudominio.com.br');
```

## 🔒 Segurança

Após a instalação:

1. **Proteja o arquivo `config.php`** - Ele já está protegido pelo `.htaccess`
2. **Não compartilhe** suas credenciais do banco de dados
3. **Faça backup regular** do banco de dados
4. **Mantenha o PHP atualizado**

## 📱 Testando no Mobile

1. Acesse o site pelo celular
2. Teste criar um relatório
3. Verifique se a visualização está responsiva
4. Teste abrir relatórios em nova página

## ✅ Checklist de Instalação

- [ ] Banco de dados criado e tabela `relatorios` existe
- [ ] Arquivo `config.php` configurado com dados corretos
- [ ] Todos os arquivos enviados para o servidor
- [ ] Estrutura de pastas mantida (`api/` existe)
- [ ] Arquivo `.htaccess` na raiz
- [ ] Site acessível e funcionando
- [ ] Teste de criação de relatório funcionando
- [ ] Teste de visualização de relatórios funcionando

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs de erro do PHP (no painel da Hostoo)
2. Abra o Console do navegador (F12) e verifique erros JavaScript
3. Teste a API diretamente: `seudominio.com.br/api/relatorios.php`

## 📝 Notas Importantes

- O sistema funciona **offline** como fallback (usa localStorage se a API falhar)
- Os dados são salvos no **banco de dados** quando a API está disponível
- O **localStorage** é usado como backup automático
- Você pode acessar de **qualquer dispositivo** e os dados estarão sincronizados

---

**Pronto!** Seu sistema está instalado e funcionando! 🎉

