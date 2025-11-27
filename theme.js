/**
 * Sistema de gerenciamento de tema (claro/escuro)
 * Detecta preferência do sistema e permite alternância manual
 */

(function() {
    'use strict';

    const THEME_STORAGE_KEY = 'nerycare-theme';
    const THEME_ATTRIBUTE = 'data-theme';

    /**
     * Inicializa o sistema de tema
     */
    function initTheme() {
        // Verificar se há preferência salva
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedTheme) {
            // Usar tema salvo
            setTheme(savedTheme);
        } else {
            // Detectar preferência do sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }

        // Escutar mudanças na preferência do sistema (apenas se não houver preferência salva)
        if (!savedTheme) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                setTheme(e.matches ? 'dark' : 'light', false); // false = não salvar, seguir sistema
            });
        }
    }

    /**
     * Define o tema
     * @param {string} theme - 'light' ou 'dark'
     * @param {boolean} save - Se deve salvar a preferência (padrão: true)
     */
    function setTheme(theme, save = true) {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
        
        if (save) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }

        // Atualizar ícone do botão toggle
        updateToggleButton(theme);
    }

    /**
     * Alterna entre tema claro e escuro
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE) || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    /**
     * Atualiza o ícone do botão toggle
     * @param {string} theme - Tema atual
     */
    function updateToggleButton(theme) {
        const toggleButtons = document.querySelectorAll('.theme-toggle');
        toggleButtons.forEach(button => {
            const icon = button.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'dark' ? '☀️' : '🌙';
                icon.setAttribute('aria-label', theme === 'dark' ? 'Modo claro' : 'Modo escuro');
            }
        });
    }

    /**
     * Cria o botão toggle de tema
     * @param {HTMLElement} container - Container onde o botão será inserido
     */
    function createToggleButton(container) {
        const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE) || 'light';
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Alternar tema');
        button.innerHTML = `
            <span class="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
        `;
        button.addEventListener('click', toggleTheme);
        
        // Estilos inline para o botão
        button.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            padding: 10px 14px;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 1002;
            pointer-events: auto;
            -webkit-tap-highlight-color: transparent;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.3)';
            button.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(255, 255, 255, 0.2)';
            button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            button.style.transform = 'translateY(0)';
        });

        container.appendChild(button);
        updateToggleButton(currentTheme);
    }

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // Exportar funções para uso global
    window.themeManager = {
        setTheme,
        toggleTheme,
        createToggleButton
    };
})();

