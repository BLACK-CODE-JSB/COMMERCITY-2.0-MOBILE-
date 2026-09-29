/* =========================================================
   COMMERCITY — api.js (Cliente Centralizado REST API)
   ========================================================= */

const CommerCityAPI = (() => {
  const TOKEN_KEY = 'commercity_auth_token';
  const USER_KEY = 'commercity_auth_user';

  // Detección inteligente del host según el entorno de ejecución
  function getBaseUrl() {
    const custom = localStorage.getItem('commercity_custom_api_url') || localStorage.getItem('commercity_server_ip');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
    
    // En emulador Android, 10.0.2.2 accede al localhost de la máquina anfitriona
    const isAndroid = (window.Capacitor && window.Capacitor.getPlatform() === 'android') ||
                      window.location.href.includes('capacitor://') ||
                      (window.location.href.includes('http://localhost') && window.Capacitor?.isNativePlatform());
    
    return isAndroid ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }

  function setCustomApiUrl(url) {
    if (url && url.trim()) {
      let clean = url.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'http://' + clean;
      }
      localStorage.setItem('commercity_custom_api_url', clean);
      return clean;
    } else {
      localStorage.removeItem('commercity_custom_api_url');
      return getBaseUrl();
    }
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, usuario) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (usuario) localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getCurrentUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  // Resuelve la URL completa de una imagen recibida de la API
  function getProductImageUrl(rawImg) {
    if (!rawImg) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
    }
    const str = String(rawImg).trim();
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
      return str;
    }
    const base = getBaseUrl();
    const clean = str.startsWith('/') ? str : `/${str}`;
    return `${base}${clean}`;
  }

  async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      // Manejo de expiración de sesión
      if (res.status === 401 || res.status === 403) {
        clearSession();
        if (typeof showToast === 'function') {
          showToast('Sesión expirada o no autorizada. Inicia sesión nuevamente.', 'error');
        } else if (typeof toast === 'function') {
          toast('⚠️ Sesión expirada. Inicia sesión nuevamente.');
        }
        if (typeof navigate === 'function') {
          navigate('login');
        }
        return null;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || data.error || `Error HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[API] Solicitud a ${url} no completada:`, err.message);
      throw err;
    }
  }

  const apiInstance = {
    getBaseUrl,
    setCustomApiUrl,
    getToken,
    setSession,
    clearSession,
    getCurrentUser,
    getProductImageUrl,
    request,

    // Métodos de conveniencia
    auth: {
      login: (email, password) => request('/api/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
      registro: (datos) => request('/api/usuarios/registro', {
        method: 'POST',
        body: JSON.stringify(datos)
      }),
      perfil: () => request('/api/usuarios/perfil')
    },
    productos: {
      listar: (categoria, q) => {
        const params = new URLSearchParams();
        if (categoria && categoria !== 'todos') params.append('categoria', categoria);
        if (q) params.append('q', q);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        return request(`/api/productos${queryStr}`);
      },
      obtener: (id) => request(`/api/productos/${id}`),
      crear: (datos) => request('/api/productos', { method: 'POST', body: JSON.stringify(datos) })
    },
    carrito: {
      obtener: () => request('/api/carrito'),
      agregar: (product_id, cantidad = 1) => request('/api/carrito', {
        method: 'POST',
        body: JSON.stringify({ product_id, cantidad })
      }),
      actualizar: (id_item, cantidad) => request(`/api/carrito/${id_item}`, {
        method: 'PATCH',
        body: JSON.stringify({ cantidad })
      }),
      eliminar: (id_item) => request(`/api/carrito/${id_item}`, { method: 'DELETE' }),
      vaciar: () => request('/api/carrito', { method: 'DELETE' })
    },
    pedidos: {
      resumen: () => request('/api/pedidos/resumen'),
      confirmarPago: (datos) => request('/api/pedidos/confirmar-pago', {
        method: 'POST',
        body: JSON.stringify(datos)
      })
    },
    admin: {
      metricas: () => request('/api/admin/metricas')
    },
    tienda: {
      resumen: () => request('/api/tienda/resumen'),
      pedidos: () => request('/api/tienda/pedidos')
    },
    chat: {
      conversaciones: () => request('/api/chat/conversaciones'),
      mensajes: (partnerId) => request(`/api/chat/mensajes/${partnerId}`),
      enviar: (partnerId, mensaje) => request(`/api/chat/mensajes/${partnerId}`, {
        method: 'POST',
        body: JSON.stringify({ mensaje })
      })
    },
    notificaciones: {
      listar: () => request('/api/notificaciones'),
      marcarLeidas: () => request('/api/notificaciones/marcar-leidas', { method: 'PATCH' })
    }
  };

  Object.defineProperty(apiInstance, 'BASE_URL', {
    get: () => getBaseUrl(),
    enumerable: true
  });

  return apiInstance;
})();

// Exportar globalmente para WebView
window.CommerCityAPI = CommerCityAPI;
