/**
 * Script para gerenciamento de usuários (admin)
 * CRUD completo de usuários
 */

const USUARIOS_API_BASE = 'api/usuarios.php';
let usuarios = [];
let usuarioAtual = null;

/**
 * Carregar lista de usuários
 */
async function carregarUsuarios() {
    const container = document.getElementById('lista-usuarios');
    
    try {
        const response = await fetch(USUARIOS_API_BASE, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        
        const resultado = await response.json();
        usuarios = resultado.data || [];
        
        // Obter usuário atual para não permitir edição própria indevida
        usuarioAtual = await obterUsuarioAtual();
        
        exibirUsuarios(usuarios);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--color-danger);">⚠️ Erro ao carregar usuários. Tente novamente.</p>';
    }
}

/**
 * Exibir lista de usuários
 */
function exibirUsuarios(usuariosLista) {
    const container = document.getElementById('lista-usuarios');
    
    if (usuariosLista.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">📭 Nenhum usuário cadastrado.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Login</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    usuariosLista.forEach(usuario => {
        const dataCriacao = usuario.criado_em ? new Date(usuario.criado_em).toLocaleDateString('pt-BR') : '-';
        const isUsuarioAtual = usuarioAtual && usuario.id === usuarioAtual.id;
        
        html += `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.login}</td>
                <td><span class="badge-tipo ${usuario.tipo === 'admin' ? 'badge-admin' : 'badge-user'}">${usuario.tipo === 'admin' ? 'Admin' : 'User'}</span></td>
                <td><span class="${usuario.ativo ? 'badge-ativo' : 'badge-inativo'}">${usuario.ativo ? '✅ Ativo' : '❌ Inativo'}</span></td>
                <td>${dataCriacao}</td>
                <td>
                    <div class="acoes-usuario">
                        <button class="btn-acoes btn-editar" onclick="abrirModalEditarUsuario(${usuario.id})">✏️ Editar</button>
                        <button class="btn-acoes btn-senha" onclick="abrirModalRedefinirSenha(${usuario.id})">🔑 Senha</button>
                        ${usuario.ativo 
                            ? `<button class="btn-acoes btn-desativar" onclick="toggleAtivoUsuario(${usuario.id}, false)">⏸️ Desativar</button>`
                            : `<button class="btn-acoes btn-ativar" onclick="toggleAtivoUsuario(${usuario.id}, true)">▶️ Ativar</button>`
                        }
                        ${!isUsuarioAtual ? `<button class="btn-acoes btn-deletar" onclick="deletarUsuario(${usuario.id})">🗑️ Deletar</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

/**
 * Abrir modal para criar novo usuário
 */
function abrirModalNovoUsuario() {
    document.getElementById('modal-titulo').textContent = 'Novo Usuário';
    document.getElementById('form-usuario').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-senha').required = true;
    document.getElementById('modal-usuario').style.display = 'block';
    document.getElementById('mensagem-modal').classList.remove('show');
}

/**
 * Abrir modal para editar usuário
 */
async function abrirModalEditarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
        mostrarMensagem('Usuário não encontrado', 'erro');
        return;
    }
    
    document.getElementById('modal-titulo').textContent = 'Editar Usuário';
    document.getElementById('usuario-id').value = usuario.id;
    document.getElementById('usuario-login').value = usuario.login;
    document.getElementById('usuario-tipo').value = usuario.tipo;
    document.getElementById('usuario-senha').value = '';
    document.getElementById('usuario-senha').required = false;
    document.getElementById('modal-usuario').style.display = 'block';
    document.getElementById('mensagem-modal').classList.remove('show');
}

/**
 * Abrir modal para redefinir senha
 */
async function redefinirSenhaUsuario(id, novaSenha) {
    if (!novaSenha || novaSenha.length < 4) {
        mostrarMensagemModal('Senha deve ter pelo menos 4 caracteres', 'erro');
        return false;
    }
    
    try {
        const response = await fetch(`${USUARIOS_API_BASE}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                senha: novaSenha
            })
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.error || 'Erro ao redefinir senha');
        }
        
        mostrarMensagem('Senha redefinida com sucesso!', 'sucesso');
        return true;
    } catch (error) {
        mostrarMensagemModal(error.message || 'Erro ao redefinir senha', 'erro');
        return false;
    }
}

/**
 * Abrir modal para redefinir senha (com prompt)
 */
async function abrirModalRedefinirSenha(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
        mostrarMensagem('Usuário não encontrado', 'erro');
        return;
    }
    
    const novaSenha = prompt(`Digite a nova senha para o usuário "${usuario.login}":\n(Mínimo de 4 caracteres)`);
    
    if (!novaSenha) {
        return; // Usuário cancelou
    }
    
    if (novaSenha.length < 4) {
        alert('A senha deve ter pelo menos 4 caracteres');
        return;
    }
    
    const confirmar = prompt(`Confirme a nova senha:`);
    if (confirmar !== novaSenha) {
        alert('As senhas não coincidem');
        return;
    }
    
    await redefinirSenhaUsuario(id, novaSenha);
}

/**
 * Salvar usuário (criar ou editar)
 */
async function salvarUsuario(event) {
    event.preventDefault();
    
    const id = document.getElementById('usuario-id').value;
    const login = document.getElementById('usuario-login').value.trim();
    const senha = document.getElementById('usuario-senha').value;
    const tipo = document.getElementById('usuario-tipo').value;
    
    // Validação
    if (!login) {
        mostrarMensagemModal('Login é obrigatório', 'erro');
        return;
    }
    
    if (!id && !senha) {
        mostrarMensagemModal('Senha é obrigatória para novos usuários', 'erro');
        return;
    }
    
    if (senha && senha.length < 4) {
        mostrarMensagemModal('Senha deve ter pelo menos 4 caracteres', 'erro');
        return;
    }
    
    try {
        const dados = {
            login: login,
            tipo: tipo
        };
        
        if (senha) {
            dados.senha = senha;
        }
        
        let response;
        if (id) {
            // Editar
            response = await fetch(`${USUARIOS_API_BASE}?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            });
        } else {
            // Criar
            response = await fetch(USUARIOS_API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            });
        }
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.error || 'Erro ao salvar usuário');
        }
        
        mostrarMensagemModal(`Usuário ${id ? 'atualizado' : 'criado'} com sucesso!`, 'sucesso');
        
        // Recarregar lista e fechar modal após 1 segundo
        setTimeout(() => {
            fecharModalUsuario();
            carregarUsuarios();
        }, 1000);
        
    } catch (error) {
        mostrarMensagemModal(error.message || 'Erro ao salvar usuário', 'erro');
    }
}

/**
 * Ativar/Desativar usuário
 */
async function toggleAtivoUsuario(id, ativo) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
        mostrarMensagem('Usuário não encontrado', 'erro');
        return;
    }
    
    if (usuario.id === usuarioAtual.id && !ativo) {
        alert('Você não pode desativar a si mesmo');
        return;
    }
    
    if (!confirm(`Deseja realmente ${ativo ? 'ativar' : 'desativar'} o usuário "${usuario.login}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${USUARIOS_API_BASE}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                ativo: ativo
            })
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.error || 'Erro ao atualizar usuário');
        }
        
        mostrarMensagem(`Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso!`, 'sucesso');
        carregarUsuarios();
        
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao atualizar usuário', 'erro');
    }
}

/**
 * Deletar usuário
 */
async function deletarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
        mostrarMensagem('Usuário não encontrado', 'erro');
        return;
    }
    
    if (usuario.id === usuarioAtual.id) {
        alert('Você não pode deletar a si mesmo');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja deletar o usuário "${usuario.login}"?\n\nEsta ação não pode ser desfeita!`)) {
        return;
    }
    
    try {
        const response = await fetch(`${USUARIOS_API_BASE}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.error || 'Erro ao deletar usuário');
        }
        
        mostrarMensagem('Usuário deletado com sucesso!', 'sucesso');
        carregarUsuarios();
        
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao deletar usuário', 'erro');
    }
}

/**
 * Fechar modal
 */
function fecharModalUsuario() {
    document.getElementById('modal-usuario').style.display = 'none';
    document.getElementById('form-usuario').reset();
    document.getElementById('mensagem-modal').classList.remove('show');
}

/**
 * Mostrar mensagem
 */
function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo} show`;
    
    setTimeout(() => {
        mensagem.classList.remove('show');
    }, 5000);
}

/**
 * Mostrar mensagem no modal
 */
function mostrarMensagemModal(texto, tipo) {
    const mensagem = document.getElementById('mensagem-modal');
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo} show`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Formulário de usuário
    document.getElementById('form-usuario').addEventListener('submit', salvarUsuario);
    
    // Fechar modal ao clicar fora
    window.onclick = function(event) {
        const modal = document.getElementById('modal-usuario');
        if (event.target === modal) {
            fecharModalUsuario();
        }
    }
});

// Tornar funções globais
window.carregarUsuarios = carregarUsuarios;
window.abrirModalNovoUsuario = abrirModalNovoUsuario;
window.abrirModalEditarUsuario = abrirModalEditarUsuario;
window.abrirModalRedefinirSenha = abrirModalRedefinirSenha;
window.fecharModalUsuario = fecharModalUsuario;
window.toggleAtivoUsuario = toggleAtivoUsuario;
window.deletarUsuario = deletarUsuario;

