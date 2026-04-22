/**
 * components.js - Centralized UI Components for Meraki Prototype
 */

const components = {
    renderNavbar: function() {
        const user = window.mockAPI.getCurrentUser();
        if (!user && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = 'login.html';
            return;
        }

        const isAdmin = user && user.type === 'company';
        const navContainer = document.getElementById('navbar-container');
        if (!navContainer) return;

        const backUrl = navContainer.getAttribute('data-back-url');
        const projectTitle = navContainer.getAttribute('data-project-title');

        const navHtml = `
        <nav class="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Left Side: Logo or Back Button -->
                    <div class="flex items-center gap-4">
                        ${backUrl ? `
                            <button onclick="window.location.href='${backUrl}'" class="w-8 h-8 flex items-center justify-center bg-dark-input border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                            </button>
                            <div class="h-8 w-px bg-dark-border"></div>
                        ` : ''}
                        
                        <div class="flex items-center gap-3 cursor-pointer" onclick="window.location.href='index.html'">
                            <div class="w-8 h-8 bg-brand-500/10 border border-brand-500 flex items-center justify-center">
                                <i data-lucide="terminal-square" class="text-brand-500 w-4 h-4" stroke-width="2"></i>
                            </div>
                            <span class="font-mono font-bold text-white tracking-widest uppercase">Meraki</span>
                        </div>

                        ${projectTitle ? `
                            <div class="h-8 w-px bg-dark-border hidden sm:block"></div>
                            <span class="font-mono text-xs text-zinc-500 hidden sm:block uppercase tracking-wider">${projectTitle}</span>
                        ` : ''}
                    </div>

                    <!-- Nav Links (Desktop) - Only show if not in project context or always show? Let's show always for navigation ease -->
                    <div class="hidden md:flex items-center gap-1">
                        <a href="${isAdmin ? 'dashboard-empresa.html' : 'dashboard-especialista.html'}" class="nav-item px-4 py-2 text-xs font-mono font-bold hover:text-white transition-colors">/HOME</a>
                        <a href="${isAdmin ? 'explorador-talentos.html' : 'portifolio.html'}" class="nav-item px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">/${isAdmin ? 'TALENTOS' : 'PORTFÓLIO'}</a>
                        <a href="kanban.html" class="nav-item px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">/KANBAN</a>
                        <a href="${isAdmin ? 'financeiro.html' : 'ganhos-especialista.html'}" class="nav-item px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">/FINANCEIRO</a>
                    </div>

                    <!-- User Profile & Action -->
                    <div class="flex items-center gap-4">
                        <button onclick="window.location.href='notificacoes.html'" class="text-zinc-400 hover:text-brand-500 transition-colors relative">
                            <i data-lucide="bell" class="w-5 h-5"></i>
                            <span class="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-none border border-dark-bg"></span>
                        </button>
                        <button onclick="window.location.href='inbox.html'" class="text-zinc-400 hover:text-brand-500 transition-colors">
                            <i data-lucide="mail" class="w-5 h-5"></i>
                        </button>
                        <div class="h-8 w-px bg-dark-border"></div>
                        <div class="flex items-center gap-3 cursor-pointer group relative" id="user-menu-trigger">
                            <div class="text-right hidden sm:block">
                                <p class="text-xs font-bold text-white uppercase group-hover:text-brand-500 transition-colors">${user ? user.name : 'Visitante'}</p>
                                <p class="text-[10px] font-mono text-zinc-500">ID: ${user ? user.id : 'N/A'}</p>
                            </div>
                            <div class="w-8 h-8 bg-dark-input border border-dark-border flex items-center justify-center group-hover:border-brand-500 transition-colors">
                                <i data-lucide="${isAdmin ? 'building-2' : 'user'}" class="w-4 h-4 text-zinc-400 group-hover:text-brand-500"></i>
                            </div>
                            
                            <!-- Dropdown -->
                            <div id="user-dropdown" class="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border shadow-2xl hidden py-2 z-50">
                                <a href="settings.html" class="block px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase">Configurações</a>
                                <a href="suporte.html" class="block px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase">Suporte Técnico</a>
                                <div class="border-t border-dark-border my-1"></div>
                                <a href="admin.html" class="block px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase">Admin Panel</a>
                                <button onclick="components.logout()" class="w-full text-left px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-red-500/10 hover:text-red-500 uppercase">Sair / Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        `;

        navContainer.innerHTML = navHtml;
        
        // Highlight active link
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const links = navContainer.querySelectorAll('.nav-item');
        links.forEach(l => {
            if (l.getAttribute('href') === currentPath) {
                l.classList.add('text-brand-500', 'bg-dark-input', 'border-dark-border');
                l.classList.remove('text-zinc-400');
            }
        });

        // Dropdown Toggle
        const trigger = document.getElementById('user-menu-trigger');
        const dropdown = document.getElementById('user-dropdown');
        if (trigger && dropdown) {
            trigger.onclick = (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            };
            window.onclick = () => dropdown.classList.add('hidden');
        }

        lucide.createIcons();
    },

    logout: function() {
        localStorage.removeItem('meraki_active_user');
        window.location.href = 'login.html';
    },

    init: function() {
        window.addEventListener('DOMContentLoaded', () => {
            this.renderNavbar();
            
            // Auto check login (except for auth pages)
            const authPages = ['login.html', 'signup.html', 'password-recovery.html', 'index.html'];
            const isAuthPage = authPages.some(page => window.location.pathname.endsWith(page));
            
            if (!isAuthPage) {
                const user = window.mockAPI.getCurrentUser();
                if (!user) window.location.href = 'login.html';
            }
        });
    }
};

components.init();
