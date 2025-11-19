// Dados simulados para o dashboard
const dashboardData = {
    users: 200,
    packagesSold: 320,
    monthlyRevenue: 45000,
    clients: 196,
    travelDays: 16,
    positiveFeedbacks: 55,
    growthRate: '12%',
    goal: {
        current: 45000,
        target: 60000
    },
    revenueByMonth: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        data: [32000, 38000, 42000, 35000, 41000, 45000, 52000, 48000, 46000, 51000, 49000, 55000]
    },
    popularDestinations: {
        labels: ['Fernando de Noronha', 'Gramado', 'Bonito', 'Jericoacoara', 'Chapada Diamantina'],
        data: [45, 38, 32, 28, 25]
    },
    topPackages: [
        {
            name: 'Praia & Aventura',
            duration: '7 dias / 6 noites',
            destination: 'Fernando de Noronha',
            sales: 45,
            revenue: 127350,
            occupancy: 85
        },
        {
            name: 'Romance na Serra',
            duration: '5 dias / 4 noites',
            destination: 'Gramado',
            sales: 38,
            revenue: 91200,
            occupancy: 92
        },
        {
            name: 'Ecoturismo Total',
            duration: '6 dias / 5 noites',
            destination: 'Bonito',
            sales: 32,
            revenue: 86400,
            occupancy: 78
        },
        {
            name: 'Paraíso das Dunas',
            duration: '4 dias / 3 noites',
            destination: 'Jericoacoara',
            sales: 28,
            revenue: 67200,
            occupancy: 65
        },
        {
            name: 'Aventura na Chapada',
            duration: '5 dias / 4 noites',
            destination: 'Chapada Diamantina',
            sales: 25,
            revenue: 62500,
            occupancy: 70
        }
    ]
};

// Estado da aplicação
let appState = {
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
    activeDropdown: null,
    chatModalOpen: false,
    searchResults: [],
    // Variáveis para controle de inatividade
    lastActivity: Date.now(),
    inactivityTimer: null,
    warningTimer: null,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos em milissegundos
    warningTime: 5 * 60 * 1000, // 5 minutos de aviso prévio
    isLoggingOut: false
};

// Verificar autenticação
function checkDashboardAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Atualizar nome do usuário
    const adminName = document.getElementById('adminName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    if (adminName) adminName.textContent = user;
    if (dropdownUserName) dropdownUserName.textContent = user;
    
    return true;
}

// Sistema de logout automático por inatividade
function initInactivityTimer() {
    // Resetar timer a qualquer atividade do usuário
    resetInactivityTimer();
    
    // Eventos que resetam o timer
    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Iniciar verificação de inatividade
    startInactivityCheck();
}

function resetInactivityTimer() {
    if (appState.isLoggingOut) return;
    
    appState.lastActivity = Date.now();
    
    // Limpar timers existentes
    if (appState.inactivityTimer) {
        clearTimeout(appState.inactivityTimer);
    }
    if (appState.warningTimer) {
        clearTimeout(appState.warningTimer);
    }
    
    // Esconder aviso se estiver visível
    hideLogoutWarning();
    
    // Reiniciar timers
    startInactivityCheck();
}

function startInactivityCheck() {
    // Timer para mostrar aviso
    appState.warningTimer = setTimeout(showLogoutWarning, appState.sessionTimeout - appState.warningTime);
    
    // Timer para logout automático
    appState.inactivityTimer = setTimeout(autoLogout, appState.sessionTimeout);
}

function showLogoutWarning() {
    if (appState.isLoggingOut) return;
    
    // Criar modal de aviso
    const warningModal = document.createElement('div');
    warningModal.id = 'inactivityWarning';
    warningModal.className = 'inactivity-warning';
    warningModal.innerHTML = `
        <div class="warning-content">
            <div class="warning-header">
                <span class="material-icons">warning</span>
                <h3>Atenção</h3>
            </div>
            <div class="warning-body">
                <p>Sua sessão expirará em <strong id="countdown">5:00</strong> minutos por inatividade.</p>
                <p>Deseja continuar conectado?</p>
            </div>
            <div class="warning-actions">
                <button id="stayLoggedIn" class="btn-primary">Continuar Conectado</button>
                <button id="logoutNow" class="btn-secondary">Sair Agora</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningModal);
    
    // Iniciar contagem regressiva
    let timeLeft = appState.warningTime / 1000; // converter para segundos
    const countdownElement = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Event listeners para os botões
    document.getElementById('stayLoggedIn').addEventListener('click', function() {
        clearInterval(countdownInterval);
        resetInactivityTimer();
        hideLogoutWarning();
    });
    
    document.getElementById('logoutNow').addEventListener('click', function() {
        clearInterval(countdownInterval);
        handleLogout();
    });
    
    // Fechar modal ao clicar fora
    warningModal.addEventListener('click', function(e) {
        if (e.target === warningModal) {
            clearInterval(countdownInterval);
            resetInactivityTimer();
            hideLogoutWarning();
        }
    });
}

function hideLogoutWarning() {
    const warningModal = document.getElementById('inactivityWarning');
    if (warningModal) {
        warningModal.remove();
    }
}

function autoLogout() {
    if (appState.isLoggingOut) return;
    
    appState.isLoggingOut = true;
    showNotification('Sessão expirada por inatividade. Redirecionando para login...', 'warning');
    
    setTimeout(() => {
        handleLogout();
    }, 2000);
}

// Inicialização do dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkDashboardAuth()) return;
    
    initSidebar();
    updateGreeting();
    updateDashboardCards();
    initCharts();
    populateTopPackagesTable();
    setupEventListeners();
    initInactivityTimer(); // Inicializar controle de inatividade
    
    document.body.classList.add('loaded');
});

// Sidebar functions
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    if (appState.sidebarCollapsed) {
        collapseSidebar();
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Menu items click
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function toggleSidebar() {
    if (appState.sidebarCollapsed) {
        expandSidebar();
    } else {
        collapseSidebar();
    }
}

function collapseSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('header');
    
    sidebar.classList.add('collapsed');
    mainContent.style.marginLeft = '70px';
    header.style.left = '70px';
    header.style.width = 'calc(100% - 70px)';
    
    appState.sidebarCollapsed = true;
    localStorage.setItem('sidebarCollapsed', 'true');
}

function expandSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('header');
    
    sidebar.classList.remove('collapsed');
    mainContent.style.marginLeft = '240px';
    header.style.left = '240px';
    header.style.width = 'calc(100% - 240px)';
    
    appState.sidebarCollapsed = false;
    localStorage.setItem('sidebarCollapsed', 'false');
}

// Atualizar saudação
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
        greeting = 'Bom dia';
    } else if (hour < 18) {
        greeting = 'Boa tarde';
    } else {
        greeting = 'Boa noite';
    }
    
    const greetingElement = document.querySelector('.greeting-text');
    if (greetingElement) {
        const adminName = localStorage.getItem('currentUser') || 'Admin';
        greetingElement.innerHTML = `${greeting}, <span class="admin-name">${adminName}</span>!`;
    }
}

// Atualizar os cards do Dashboard
function updateDashboardCards() {
    document.getElementById('usersCount').textContent = dashboardData.users.toLocaleString();
    document.getElementById('packagesSold').textContent = dashboardData.packagesSold.toLocaleString();
    document.getElementById('monthlyRevenue').textContent = `R$ ${dashboardData.monthlyRevenue.toLocaleString()}`;
    document.getElementById('clientsCount').textContent = dashboardData.clients.toLocaleString();
    document.getElementById('travelDays').textContent = dashboardData.travelDays;
    document.getElementById('positiveFeedbacks').textContent = dashboardData.positiveFeedbacks;
    document.getElementById('growthRate').textContent = dashboardData.growthRate;
    
    // Atualizar metas do Dashboard
    const goalPercent = Math.round((dashboardData.goal.current / dashboardData.goal.target) * 100);
    const goalProgress = document.getElementById('goalProgress');
    if (goalProgress) {
        goalProgress.style.width = `${goalPercent}%`;
    }
    document.getElementById('goalPercent').textContent = `${goalPercent}%`;
    document.getElementById('goalText').textContent = 
        `R$ ${dashboardData.goal.current.toLocaleString()} / R$ ${dashboardData.goal.target.toLocaleString()}`;
}

// Inicializar gráficos
function initCharts() {
    // Gráfico de receita
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.revenueByMonth.labels,
                datasets: [{
                    label: 'Receita (R$)',
                    data: dashboardData.revenueByMonth.data,
                    backgroundColor: 'rgba(2, 117, 129, 0.7)',
                    borderColor: 'rgba(2, 117, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Mapa de destinos
    const destinationsCtx = document.getElementById('destinationsChart');
    if (destinationsCtx) {
        new Chart(destinationsCtx, {
            type: 'doughnut',
            data: {
                labels: dashboardData.popularDestinations.labels,
                datasets: [{
                    data: dashboardData.popularDestinations.data,
                    backgroundColor: [
                        'rgba(2, 117, 129, 0.8)',
                        'rgba(1, 90, 99, 0.8)',
                        'rgba(2, 149, 164, 0.8)',
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(243, 156, 18, 0.8)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Preenche a tabela de pacotes principais
function populateTopPackagesTable() {
    const tableBody = document.querySelector('#topPackagesTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    dashboardData.topPackages.forEach(pkg => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>
                <div class="package-info">
                    <div class="package-name">${pkg.name}</div>
                    <small>${pkg.duration}</small>
                </div>
            </td>
            <td>${pkg.destination}</td>
            <td>${pkg.sales}</td>
            <td>R$ ${pkg.revenue.toLocaleString()}</td>
            <td>
                <div class="occupancy-bar">
                    <div class="occupancy-fill" style="width: ${pkg.occupancy}%"></div>
                    <span>${pkg.occupancy}%</span>
                </div>
            </td>
            <td>
                <button class="btn-icon view-package" title="Ver detalhes" data-package="${pkg.name}">
                    <span class="material-icons">visibility</span>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Funcionalidade de pesquisa
function performSearch(query) {
    if (!query.trim()) {
        appState.searchResults = [];
        return;
    }
    
    // Simulação de resultados
    const results = dashboardData.topPackages.filter(pkg => 
        pkg.name.toLowerCase().includes(query.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(query.toLowerCase())
    );
    
    appState.searchResults = results;
    showSearchResults(results, query);
}

function showSearchResults(results, query) {
    if (results.length === 0) {
        showNotification(`Nenhum resultado encontrado para "${query}"`, 'info');
        return;
    }
    
    const resultText = results.length === 1 ? 'resultado' : 'resultados';
    showNotification(`${results.length} ${resultText} encontrados para "${query}"`, 'success');
}

// Gerenciamento de menus suspensos
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    
    if (appState.activeDropdown && appState.activeDropdown !== dropdownId) {
        document.getElementById(appState.activeDropdown).classList.remove('show');
    }
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        appState.activeDropdown = null;
    } else {
        dropdown.classList.add('show');
        appState.activeDropdown = dropdownId;
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.user-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    appState.activeDropdown = null;
}

// Funcionalidade do chat
function toggleChatModal() {
    const chatModal = document.getElementById('chatModal');
    
    if (appState.chatModalOpen) {
        chatModal.classList.remove('show');
        appState.chatModalOpen = false;
    } else {
        chatModal.classList.add('show');
        appState.chatModalOpen = true;
    }
}

function sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const message = input.value.trim();
    
    if (message) {
        const messagesContainer = document.getElementById('chatMessages');
        const newMessage = document.createElement('div');
        newMessage.className = 'message sent';
        newMessage.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
        `;
        messagesContainer.appendChild(newMessage);
        input.value = '';
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Simular sincronização
        setTimeout(() => {
            const autoReply = document.createElement('div');
            autoReply.className = 'message received';
            autoReply.innerHTML = `
                <div class="message-content">
                    <p>Obrigado pela mensagem! Em breve retornaremos com mais informações.</p>
                    <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                </div>
            `;
            messagesContainer.appendChild(autoReply);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 2000);
    }
}

// Sair
function handleLogout() {
    console.log('Iniciando logout...');
    
    appState.isLoggingOut = true;
    
    // Limpar todos os timers
    if (appState.inactivityTimer) {
        clearTimeout(appState.inactivityTimer);
        appState.inactivityTimer = null;
    }
    if (appState.warningTimer) {
        clearTimeout(appState.warningTimer);
        appState.warningTimer = null;
    }
    
    // Limpar dados de autenticação COMPLETAMENTE
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    
    // Manter apenas o "Lembrar-me" se estiver marcado
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe !== 'true') {
        localStorage.removeItem('savedUsername');
    }
    
    // Esconder aviso se estiver visível
    hideLogoutWarning();
    
    showNotification('Logout realizado com sucesso! Redirecionando...', 'success');
    
    // Redirecionar após um breve delay
    setTimeout(() => {
        console.log('Redirecionando para login...');
        
        // Tentar diferentes caminhos para garantir que funcione
        const currentPath = window.location.pathname;
        console.log('Caminho atual:', currentPath);
        
        // Se estiver em /admin/dashboard.html, redirecionar para /admin/login.html
        if (currentPath.includes('/admin/')) {
            window.location.href = 'login.html';
        } else {
            // Tentar caminho relativo
            window.location.href = 'login.html';
        }
    }, 1500);
}

// Notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="material-icons">${type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info'}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Eventos
function setupEventListeners() {
    // Pesquisa
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length > 2) {
                    performSearch(this.value);
                }
            }, 500);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    // Filtrar horário
    const timeFilter = document.getElementById('timeFilter');
    if (timeFilter) {
        timeFilter.addEventListener('change', function() {
            showNotification(`Filtro aplicado: ${this.options[this.selectedIndex].text}`, 'info');
        });
    }
    
    // Alerta de ações
    const adjustPriceBtn = document.getElementById('adjustPriceBtn');
    const promotePackageBtn = document.getElementById('promotePackageBtn');
    const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');
    
    if (adjustPriceBtn) {
        adjustPriceBtn.addEventListener('click', () => {
            showNotification('Preço ajustado com sucesso!', 'success');
        });
    }
    
    if (promotePackageBtn) {
        promotePackageBtn.addEventListener('click', () => {
            showNotification('Pacote promovido com sucesso!', 'success');
        });
    }
    
    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener('click', () => {
            showNotification('Disponibilidade verificada!', 'success');
        });
    }
    
    // Aniversário
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-wish')) {
            const button = e.target.closest('.btn-wish');
            const userName = button.getAttribute('data-user');
            const action = button.textContent.trim();
            
            showNotification(`${action} ${userName}`, 'success');
        }
    });
    
    // Ações de visualização do pacote
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-package')) {
            const button = e.target.closest('.view-package');
            const packageName = button.getAttribute('data-package');
            
            showNotification(`Visualizando detalhes de ${packageName}`, 'info');
        }
    });
    
    // Menu suspenso do usuário
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown('userDropdown');
        });
    }
    
    // Link de sair
    const logoutLink = document.getElementById('logoutLink');
    const dropdownLogout = document.getElementById('dropdownLogout');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Funcionalidade do chat
    const chatIcon = document.getElementById('chatIcon');
    const closeChat = document.getElementById('closeChat');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatMessageInput = document.getElementById('chatMessageInput');
    
    if (chatIcon) {
        chatIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleChatModal();
        });
    }
    
    if (closeChat) {
        closeChat.addEventListener('click', toggleChatModal);
    }
    
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (chatMessageInput) {
        chatMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Fechar menu suspenso ao clicar fora
    document.addEventListener('click', function() {
        closeAllDropdowns();
    });
    
    // Impedir que o menu suspenso feche ao clicar dentro dele
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Atualiza a saudação a cada minuto.
    setInterval(updateGreeting, 60000);
}

// Inicializar funcionalidade de pesquisa
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    }
}