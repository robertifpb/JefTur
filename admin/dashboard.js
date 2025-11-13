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
    searchResults: []
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

// Inicialização do dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkDashboardAuth()) return;
    
    initSidebar();
    updateGreeting();
    updateDashboardCards();
    initCharts();
    populateTopPackagesTable();
    setupEventListeners();
    
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

// Atulizar saudação
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

// Preencha a tabela de pacotes principais
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    
    showNotification('Logout realizado com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="material-icons">${type === 'success' ? 'check_circle' : 'info'}</span>
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

