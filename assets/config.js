const SUPABASE_CONFIG = {
  URL: 'https://nyxubirmiwuzfhvtmehc.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eHViaXJtaXd1emZodnRtZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDc0MTUsImV4cCI6MjA3ODEyMzQxNX0.y76dAwyLLPPHBH2wP83tOlZ8ut5kQWUHbC8AoKdb2AA',
  
  // URLs das páginas
  PAGES: {
    HOME: '/index.html',
    LOGIN_CLIENTE: '/client/acesso.html',
    LOGIN_ADMIN: '/admin/login.html',
    DASHBOARD_ADMIN: '/admin/dashboard.html',
    CADASTRO: '/client/cadastro.html'
  },
  
};

// Inicializar Supabase com configurações otimizadas
window.supabase = window.supabase.createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'jf-turismo',
        'x-client-info': 'web/1.0'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Helper functions
window.SupabaseHelpers = {
  config: SUPABASE_CONFIG,
  
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('destinos')
        .select('count', { count: 'exact', head: true });
      
      return {
        success: !error,
        message: error ? `Erro: ${error.message}` : 'Conexão OK',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: `Exceção: ${error.message}`
      };
    }
  },
  
  async isAdmin(userId = null) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('administradores')
        .select('id, nome, nivel_acesso')
        .eq('auth_user_id', userId)
        .eq('ativo', true)
        .single();
      
      return { isAdmin: !!data && !error, admin: data };
    } catch {
      return { isAdmin: false, admin: null };
    }
  },
  
  async isCliente(userId = null) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, sobrenome')
        .eq('auth_user_id', userId)
        .single();
      
      return { isCliente: !!data && !error, cliente: data };
    } catch {
      return { isCliente: false, cliente: null };
    }
  },
  
  redirectToLogin(isAdmin = false) {
    if (isAdmin) {
      window.location.href = SUPABASE_CONFIG.PAGES.LOGIN_ADMIN;
    } else {
      window.location.href = SUPABASE_CONFIG.PAGES.LOGIN_CLIENTE;
    }
  },
  
  redirectToDashboard(isAdmin = false) {
    if (isAdmin) {
      window.location.href = SUPABASE_CONFIG.PAGES.DASHBOARD_ADMIN;
    } else {
      window.location.href = SUPABASE_CONFIG.PAGES.HOME;
    }
  }
};
