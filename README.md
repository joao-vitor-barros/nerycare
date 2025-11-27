# 📋 Sistema de Relatório da Noite - Para Babás

Sistema web mobile-friendly para registro de relatórios noturnos sobre o cuidado da criança.

## 🚀 Como Usar

1. **Abrir o sistema**: Abra o arquivo `index.html` em qualquer navegador (Chrome, Firefox, Safari, Edge, etc.)

2. **Preencher o relatório**:
   - A data será preenchida automaticamente com a data de hoje
   - Preencha todos os campos conforme necessário
   - Alguns campos aparecerão automaticamente quando você selecionar opções específicas

3. **Salvar**: Clique em "💾 Salvar Relatório" para salvar os dados

4. **Ver relatórios**: Clique em "📄 Ver Relatórios" para visualizar todos os relatórios salvos

5. **Limpar**: Use "🗑️ Limpar" para limpar o formulário e começar um novo relatório

## 📱 Funcionalidades

- ✅ Interface responsiva e otimizada para mobile
- ✅ Todos os campos solicitados no CONTEXTO.txt
- ✅ Campos condicionais que aparecem automaticamente
- ✅ Salvamento local (os dados ficam salvos no navegador)
- ✅ Visualização de relatórios anteriores
- ✅ Exclusão de relatórios individuais
- ✅ Design moderno e intuitivo

## 💾 Armazenamento

O sistema agora suporta **dois modos de armazenamento**:

### Modo Online (Recomendado)
- Os relatórios são salvos no **banco de dados MySQL** no servidor
- Dados sincronizados entre todos os dispositivos
- Backup automático no servidor
- Acesse de qualquer lugar

### Modo Offline (Fallback)
- Se a API não estiver disponível, usa **localStorage** automaticamente
- Dados salvos localmente no navegador
- Funciona mesmo sem internet
- Dados são sincronizados quando a conexão for restabelecida

## 🎨 Campos do Formulário

1. **Resumo Geral da Noite** - Tranquila, Agitada ou Com interrupções pontuais
2. **Alimentação** - Tipo, horário, quantidade e aceitação
3. **Higiene e Fraldas** - Banho, trocas, xixi, cocô e observações
4. **Sono** - Processo de dormir, horário e despertares
5. **Comportamento e Atividades** - Humor, atividades realizadas
6. **Saúde e Medicação** - Medicamentos e sintomas
7. **Precisa Repor (Estoque)** - Itens que precisam ser repostos
8. **Observações Extras** - Campo livre para informações adicionais

## 🔧 Tecnologias Utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (design responsivo)
  - JavaScript (Vanilla JS)
  
- **Backend:**
  - PHP 7.4+
  - MySQL/MariaDB
  - API REST
  
- **Armazenamento:**
  - Banco de dados MySQL (principal)
  - LocalStorage (fallback offline)

## 📝 Notas

- O sistema funciona **online** com banco de dados e **offline** como fallback
- Requer hospedagem com PHP e MySQL para modo online
- Compatível com todos os navegadores modernos
- Otimizado para uso em smartphones e tablets
- Dados sincronizados entre dispositivos quando online

## 🚀 Instalação

Para instalar em uma hospedagem (como Hostoo), consulte o arquivo **INSTALACAO.md** para instruções detalhadas.

