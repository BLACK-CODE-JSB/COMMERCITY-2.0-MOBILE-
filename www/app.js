let currentAdminTarget = null;
/* =========================================================
   COMMERCITY — app.js (Complete Rewrite)
   ========================================================= */
/* =========================================================
   COMMERCITY — app.js (Complete Rewrite)
   ========================================================= */

let ipcRenderer;
try { ipcRenderer = require('electron').ipcRenderer; } catch(e) {}

const AUTH_PAGES = ['login','registro','recuperar','restablecer','terminos'];
const APP_PAGES  = ['home','carrito','perfil','tienda','pedidos','historial','ajustes','mensajes','chat','admin','ajustes-admin'];

let PRODUCTS = {
  watch:   { id:'watch', name:'Reloj Elitret Gold',    cat:'Relojes',     price:345000, stock:18, disc:0,  img:'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80', vendor:'Juan_Giraldo', desc:'Elegante reloj dorado de colección limitada. Ideal para ocasiones especiales o como regalo de lujo.' },
  sneaker: { id:'sneaker', name:'Zapatos Deportivos',    cat:'Calzado',     price:79000,  stock:45, disc:20, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',  vendor:'Juan_Giraldo', desc:'Zapatillas de alto rendimiento con amortiguación avanzada, ideales para competencias de media distancia.' },
  earbuds: { id:'earbuds', name:'Auriculares Studio Pro',cat:'Tecnología',  price:388000, stock:12, disc:15, img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',  vendor:'Juan_Giraldo', desc:'Auriculares inalámbricos con cancelación activa de ruido y calidad de sonido studio.' },
  backpack:{ id:'backpack', name:'Mochila City Stealth',  cat:'Accesorios',  price:79000,  stock:30, disc:0,  img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', vendor:'Juan_Giraldo', desc:'Mochila urbana resistente al agua, con compartimentos para laptop y accesorios.' },
  cam1: { id:'cam1', name:'Cámara DSLR Pro', cat:'Tecnología', price:2500000, stock:5, disc:0, img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', vendor:'FotoMundo', desc:'Cámara profesional DSLR para fotografía de alta calidad.' },
  lentes1: { id:'lentes1', name:'Gafas de Sol Clásicas', cat:'Accesorios', price:120000, stock:20, disc:10, img:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', vendor:'StyleCo', desc:'Gafas de sol con protección UV400 y diseño clásico.' },
  reloj2: { id:'reloj2', name:'Smartwatch V2', cat:'Tecnología', price:450000, stock:15, disc:0, img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', vendor:'TechHub', desc:'Reloj inteligente con monitor de ritmo cardíaco y notificaciones.' },
  zapatos2: { id:'zapatos2', name:'Tenis Urbanos', cat:'Calzado', price:180000, stock:35, disc:0, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', vendor:'ZapaTrend', desc:'Tenis cómodos para el uso diario en la ciudad.' },
  bolso2: { id:'bolso2', name:'Bolso de Cuero', cat:'Accesorios', price:350000, stock:8, disc:0, img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', vendor:'LeatherCraft', desc:'Bolso de cuero genuino hecho a mano.' },
  audifonos2: { id:'audifonos2', name:'Auriculares In-Ear', cat:'Tecnología', price:299000, stock:25, disc:10, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', vendor:'AudioMaster', desc:'Auriculares in-ear con sonido estéreo y bajos profundos.' }
};

const ORDER_DATA = [
  { buyer:'Alex Rivera',   ava:'A',  color:'#7c3aed', addr:'Calle 45 # 20-10, Apto 301',             city:'Bogotá, Cundinamarca',     prod:'Macbook Air',        qty:1, total:'$1.299.000', status:'En Camino',  date:'04 enero, 2026' },
  { buyer:'Elena Sanz',    ava:'E',  color:'#0891b2', addr:'Carrera 7 # 12-34, Apartamento 201',     city:'Medellín, Antioquia',      prod:'TV LG 45 pulgadas',  qty:4, total:'$1.900.000', status:'En Camino',  date:'25 diciembre, 2026' },
  { buyer:'Julian Thorne', ava:'J',  color:'#be185d', addr:'Av. El Poblado # 1-40',                  city:'Medellín, Antioquia',      prod:'iPhone 15 Pro',      qty:1, total:'$3.000.000', status:'Entregado',  date:'27 enero, 2026' },
  { buyer:'Marco Rossi',   ava:'MR', color:'#374151', addr:'Cra 10 # 5-30',                          city:'Cali, Valle del Cauca',    prod:'iPad Pro 11"',       qty:1, total:'$2.799.000', status:'Pendiente',  date:'07 diciembre, 2026' },
];

let cart = [];
try {
  const savedCart = localStorage.getItem('commercity_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  } else {
    cart = [
      { key:'sneaker', qty:1 },
      { key:'earbuds', qty:2 },
    ];
  }
} catch (e) {
  cart = [];
}

function saveCart() {
  localStorage.setItem('commercity_cart', JSON.stringify(cart));
}
let pdQty = 1;
let pdKey = null;

let isSeller = false;
let isAdmin = false;

function setRole(seller, admin = false) {
  isSeller = seller;
  isAdmin = admin;
  if (isSeller) {
    document.body.classList.add('role-seller');
  } else {
    document.body.classList.remove('role-seller');
  }
  if (isAdmin) {
    document.body.classList.add('role-admin');
  } else {
    document.body.classList.remove('role-admin');
  }
}

function updateProfileUI() {
  const user = localStorage.getItem('commercity_user');
  if (!user) return;
  const initial = user.charAt(0).toUpperCase();

  const perfilName = document.querySelector('.perfil-name');
  if (perfilName) perfilName.textContent = user;

  const avaText = document.getElementById('perfil-ava-text');
  if (avaText) avaText.textContent = initial;

  const sidebarUser = document.querySelector('.sidebar-username');
  if (sidebarUser) sidebarUser.textContent = user;

  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.textContent = initial;

  const ajUser = document.getElementById('aj-user');
  if (ajUser) ajUser.value = user;
  const ajEmail = document.getElementById('aj-email');
  const savedEmail = localStorage.getItem('commercity_email');
  if (ajEmail && savedEmail) ajEmail.value = savedEmail;

  const serverInput = document.getElementById('aj-server-url');
  if (serverInput && window.CommerCityAPI) {
    serverInput.value = window.CommerCityAPI.getBaseUrl();
  }
}

let introTimer = null;
let introAudioPlayed = false;

function skipIntro() {
  if (introTimer) clearInterval(introTimer);
  const audio = document.getElementById('intro-audio');
  if (audio) { audio.pause(); audio.currentTime = 0; }
  
  const ls = document.getElementById('loading-screen');
  if (ls && ls.style.display !== 'none') {
    ls.classList.add('fade-out');
    setTimeout(() => {
      ls.style.display = 'none';
      finishAppInit();
    }, 400);
  }
}

function finishAppInit() {
  loadCatalog();
  if (localStorage.getItem('commercity_logged_in') === 'true') {
    updateProfileUI();
    const sellerStatus = localStorage.getItem('commercity_is_seller') === 'true';
    const adminStatus = localStorage.getItem('commercity_is_admin') === 'true';
    setRole(sellerStatus, adminStatus);
    if (adminStatus) {
      navigate('admin');
    } else {
      navigate('home');
    }
  } else {
    navigate('login');
  }
}

// RF109: Limpieza de carritos inactivos tras 7 días (604,800,000 ms)
function checkCartExpiration() {
  try {
    const lastTime = localStorage.getItem('commercity_cart_time');
    if (lastTime) {
      const diff = Date.now() - parseInt(lastTime, 10);
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      if (diff > SEVEN_DAYS_MS) {
        cart = [];
        localStorage.removeItem('commercity_cart');
        localStorage.removeItem('commercity_cart_time');
      }
    }
  } catch(e) {}
}

window.addEventListener('load', () => {
  checkCartExpiration();

  const remEmail = localStorage.getItem('commercity_rem_email');
  const remPass = localStorage.getItem('commercity_rem_pass');
  if (remEmail && remPass) {
    const elEmail = document.getElementById('login-email');
    const elPass = document.getElementById('login-password');
    const elRem = document.getElementById('login-remember');
    if (elEmail) elEmail.value = remEmail;
    if (elPass) elPass.value = remPass;
    if (elRem) elRem.checked = true;
  }

  const audio = document.getElementById('intro-audio');
  const progressBar = document.getElementById('intro-progress');
  const label = document.getElementById('intro-label');

  let duration = 3.2; // Duración por defecto si no se leen metadatos de audio

  if (audio) {
    audio.loop = false;
    
    // Al terminar la pista de audio completamente, avanzar suavemente
    audio.onended = () => {
      skipIntro();
    };

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        duration = audio.duration;
      }
    };

    audio.volume = 1.0;
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log('Autoplay handled silently:', err);
    });
  }

  // Actualizador continuo de barra de progreso y etiquetas
  const intervalMs = 50;
  introTimer = setInterval(() => {
    let pct = 0;
    if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      pct = Math.min(100, (audio.currentTime / audio.duration) * 100);
    } else {
      let elapsed = (parseInt(progressBar?.dataset?.elapsed || '0') + intervalMs);
      if (progressBar) progressBar.dataset.elapsed = elapsed;
      pct = Math.min(100, (elapsed / (duration * 1000)) * 100);
    }

    if (progressBar) progressBar.style.width = pct + '%';
    if (label) {
      if (pct < 35) label.textContent = 'Iniciando CommerCity...';
      else if (pct < 75) label.textContent = 'Cargando comunidad y productos...';
      else label.textContent = '¡Bienvenido!';
    }

    if (pct >= 100) {
      clearInterval(introTimer);
      setTimeout(() => skipIntro(), 300);
    }
  }, intervalMs);
});

function navigate(page) {
  if (page === 'admin' && !isAdmin) {
    navigate('home');
    return;
  }
  if (page === 'ajustes-admin' && !isAdmin) {
    navigate('home');
    return;
  }

  const target = document.getElementById('page-' + page);
  const current = document.querySelector('.page.active');

  if (current && current !== target) {
    current.classList.add('page-exit');
    setTimeout(() => {
      current.classList.remove('active', 'page-exit');
    }, 350);
  }

  if (target) {
    if (current && current !== target) {
      target.classList.add('page-enter');
      setTimeout(() => {
        target.classList.remove('page-enter');
      }, 350);
    }
    target.classList.add('active');
    target.scrollTop = 0;
  }

  const isAuth = AUTH_PAGES.includes(page);
  const isAdminPage = (page === 'admin' || page === 'ajustes-admin');
  const isMobile = window.innerWidth <= 860;

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.style.display = (!isAuth && !isMobile && !isAdminPage) ? 'flex' : 'none';
    if (!isAuth && !isMobile && !isAdminPage) sidebar.style.flexDirection = 'column';
  }

  const bnav = document.getElementById('bottom-nav');
  if (bnav) {
    bnav.classList.toggle('hidden', isAuth || page === 'chat' || isAdminPage);
  }

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const sideItem = document.getElementById('nav-' + page);
  if (sideItem) sideItem.classList.add('active');

  document.querySelectorAll('.bnav-item').forEach(i => i.classList.remove('active'));
  const bnavItem = document.getElementById('bnav-' + page);
  if (bnavItem) bnavItem.classList.add('active');

  closeNotifs();
  closeMoreMenu();
  closeCatMenu();
  updateCartBadge();
  if (page === 'home') loadCatalog();
  if (page === 'carrito') renderCart();
  if (page === 'mensajes') loadChatConversaciones();
  if (page !== 'chat' && window.chatPollingTimer) {
    clearInterval(window.chatPollingTimer);
    window.chatPollingTimer = null;
  }
}

async function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  const email = emailInput?.value.trim();
  const pass  = passInput?.value;
  if (!email || !pass) { toast('⚠️ Completa todos los campos'); return; }

  const btn = document.querySelector('#page-login .btn-primary');
  const oldText = btn ? btn.textContent : 'Entrar →';
  if (btn) { btn.disabled = true; btn.textContent = 'Autenticando...'; }

  try {
    let res = null;
    if (window.CommerCityAPI) {
      res = await window.CommerCityAPI.auth.login(email, pass);
    } else {
      const isAndroid = (window.Capacitor && window.Capacitor.getPlatform() === 'android');
      const base = isAndroid ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const r = await fetch(`${base}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      res = await r.json();
      if (!r.ok) throw new Error(res.mensaje || res.error || 'Credenciales inválidas');
    }

    if (!res || !res.token) {
      throw new Error(res?.mensaje || 'No se recibió token de autenticación del servidor');
    }

    // 1. Guardar token JWT y datos de sesión en almacenamiento del cliente
    const token = res.token;
    const usuario = res.usuario || {};
    if (window.CommerCityAPI) {
      window.CommerCityAPI.setSession(token, usuario);
    }
    localStorage.setItem('commercity_auth_token', token);
    localStorage.setItem('commercity_logged_in', 'true');

    // 2. Extraer roles de usuario (normalizado a mayúsculas)
    const rawRoles = usuario.roles || (usuario.rol ? [usuario.rol] : []);
    const roles = Array.isArray(rawRoles) ? rawRoles.map(r => String(r).toUpperCase()) : [];
    const isSeller = roles.includes('VENDEDOR');
    const isAdmin = roles.includes('ADMINISTRADOR') || roles.includes('ADMIN');

    setRole(isSeller, isAdmin);
    localStorage.setItem('commercity_is_seller', isSeller ? 'true' : 'false');
    localStorage.setItem('commercity_is_admin', isAdmin ? 'true' : 'false');
    localStorage.setItem('commercity_user', usuario.nombre || usuario.nombre_completo || email.split('@')[0]);
    localStorage.setItem('commercity_email', usuario.email || email);

    const rem = document.getElementById('login-remember')?.checked;
    if (rem) {
      localStorage.setItem('commercity_rem_email', email);
      localStorage.setItem('commercity_rem_pass', pass);
    } else {
      localStorage.removeItem('commercity_rem_email');
      localStorage.removeItem('commercity_rem_pass');
    }

    updateProfileUI();
    toast(isAdmin ? '🛡️ ¡Bienvenido Administrador!' : '✅ ¡Bienvenido de vuelta!');

    // Refrescar catálogo en vivo
    loadCatalog();

    setTimeout(() => navigate(isAdmin ? 'admin' : 'home'), 800);
  } catch (apiErr) {
    console.error('[Auth] Error al iniciar sesión en API:', apiErr);
    const msg = apiErr.message || 'Error de conexión con el servidor API';
    if (msg.includes('Credenciales') || msg.includes('401') || msg.includes('inválid')) {
      toast('⚠️ Credenciales inválidas. Verifica tu correo y contraseña.');
    } else {
      toast(`⚠️ Conexión rechazada: ${msg}`);
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = oldText; }
  }
}

async function handleRegistro() {
  const u = document.getElementById('reg-username')?.value.trim();
  const e = document.getElementById('reg-email')?.value.trim();
  const p = document.getElementById('reg-password')?.value;
  const wantToSell = document.getElementById('reg-seller')?.checked;
  const acceptedTerms = document.getElementById('reg-terms')?.checked;

  if (!u || !e || !p) { toast('⚠️ Completa todos los campos'); return; }
  if (!acceptedTerms) { toast('⚠️ Debes aceptar los Términos y Condiciones'); return; }

  // 1. Registro vía API
  try {
    if (window.CommerCityAPI) {
      const res = await window.CommerCityAPI.auth.registro({
        nombre: u,
        email: e,
        password: p,
        solicita_vendedor: !!wantToSell
      });
      if (res && res.token) {
        window.CommerCityAPI.setSession(res.token, res.usuario);
        setRole(!!wantToSell, false);
        localStorage.setItem('commercity_user', u);
        localStorage.setItem('commercity_email', e);
        localStorage.setItem('commercity_logged_in', 'true');
        localStorage.setItem('commercity_is_seller', wantToSell ? 'true' : 'false');
        localStorage.setItem('commercity_is_admin', 'false');

        updateProfileUI();
        toast('✅ ¡Cuenta creada exitosamente en servidor!');
        setTimeout(() => navigate('home'), 900);
        return;
      }
    }
  } catch (apiErr) {
    console.warn('API error en registro:', apiErr);
    if (apiErr.message && apiErr.message.includes('registrado')) {
      toast('⚠️ El correo electrónico ya está registrado.');
      return;
    }
  }

  // 2. Fallback
  localStorage.setItem('commercity_user', u);
  localStorage.setItem('commercity_email', e);
  setRole(wantToSell, false);
  localStorage.setItem('commercity_logged_in', 'true');
  localStorage.setItem('commercity_is_seller', wantToSell);
  localStorage.setItem('commercity_is_admin', 'false');

  updateProfileUI();
  toast('✅ ¡Cuenta creada exitosamente!');
  setTimeout(() => navigate('home'), 900);
}

function handleRecuperar() {
  const e = document.getElementById('rec-email')?.value.trim();
  if (!e) { toast('⚠️ Ingresa tu correo electrónico'); return; }
  toast('📧 Enlace enviado a tu correo');
  setTimeout(() => navigate('login'), 1400);
}

function handleRestablecer() {
  const a = document.getElementById('new-pass')?.value;
  const b = document.getElementById('new-pass2')?.value;
  if (!a || !b) { toast('⚠️ Completa todos los campos'); return; }
  if (a !== b) { toast('⚠️ Las contraseñas no coinciden'); return; }
  toast('✅ ¡Contraseña restablecida!');
  setTimeout(() => navigate('login'), 900);
}

function handleLogout() {
  if (window.CommerCityAPI) {
    window.CommerCityAPI.clearSession();
  }
  setRole(false, false);
  localStorage.removeItem('commercity_logged_in');
  localStorage.removeItem('commercity_is_seller');
  localStorage.removeItem('commercity_is_admin');
  toast('👋 Sesión cerrada');
  setTimeout(() => navigate('login'), 700);
}

function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
}

function toggleNotifs(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('notifs-panel');
  const overlay = document.getElementById('notifs-overlay');
  if (panel) { panel.classList.toggle('open'); if (overlay) overlay.classList.toggle('open'); }
}
function closeNotifs() {
  const panel = document.getElementById('notifs-panel');
  const overlay = document.getElementById('notifs-overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}
function clearNotifs(e) {
  if (e) e.stopPropagation();
  document.querySelectorAll('.notif-row').forEach(r => r.remove());
  toast('🗑️ Notificaciones limpiadas');
}

function toggleCatMenu(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('cat-dropdown');
  if (dd) dd.classList.toggle('open');
}
function closeCatMenu() {
  const dd = document.getElementById('cat-dropdown');
  if (dd) dd.classList.remove('open');
}

let currentCatalogCategory = 'todos';
let currentCatalogQuery = '';
let searchDebounceTimer = null;

async function loadCatalog(category = currentCatalogCategory, query = currentCatalogQuery) {
  currentCatalogCategory = category || 'todos';
  currentCatalogQuery = query || '';

  const grid = document.getElementById('home-prod-grid');
  if (grid && (!PRODUCTS || Object.keys(PRODUCTS).length <= 4)) {
    // Solo mostrar spinner si el grid está vacío o no tiene productos
    const loadingHtml = `
      <div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-muted);font-size:14px;">
        <div style="display:inline-block;width:26px;height:26px;border:3px solid rgba(245,166,35,0.2);border-top-color:var(--orange);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:8px;"></div>
        <div>Cargando productos de la API...</div>
      </div>`;
    grid.innerHTML = loadingHtml;
  }

  try {
    let res = null;
    if (window.CommerCityAPI) {
      res = await window.CommerCityAPI.productos.listar(currentCatalogCategory, currentCatalogQuery);
    } else {
      const isAndroid = (window.Capacitor && window.Capacitor.getPlatform() === 'android');
      const base = isAndroid ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const token = localStorage.getItem('commercity_auth_token');
      const params = new URLSearchParams();
      if (currentCatalogCategory && currentCatalogCategory !== 'todos') params.append('categoria', currentCatalogCategory);
      if (currentCatalogQuery) params.append('q', currentCatalogQuery);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const r = await fetch(`${base}/api/productos${queryStr}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      res = await r.json();
    }

    let items = [];
    if (res) {
      if (Array.isArray(res.data)) items = res.data;
      else if (Array.isArray(res.productos)) items = res.productos;
      else if (Array.isArray(res)) items = res;
    }

    if (items && items.length > 0) {
      // Registrar cada producto en el diccionario dinámico PRODUCTS
      items.forEach((p, idx) => {
        const id = String(p.id !== undefined ? p.id : (p.producto_id || `prod_${idx}`));
        const rawImg = p.imagen || p.imagen_url || p.img || '';
        const fullImg = window.CommerCityAPI 
          ? window.CommerCityAPI.getProductImageUrl(rawImg)
          : (rawImg.startsWith('http') || rawImg.startsWith('data:') ? rawImg : `http://10.0.2.2:3000/${String(rawImg).replace(/^\//, '')}`);

        PRODUCTS[id] = {
          id: id,
          name: p.nombre || p.name || 'Producto CommerCity',
          cat: p.categoria || p.cat || 'General',
          price: Number(p.precio !== undefined ? p.precio : (p.price || 0)),
          stock: Number(p.stock !== undefined ? p.stock : 10),
          disc: Number(p.descuento || p.disc || p.descuento_porcentaje || 0),
          img: fullImg,
          vendor: p.vendedor || p.vendor || 'CommerCity Oficial',
          desc: p.descripcion || p.desc || 'Producto verificado disponible en la plataforma.'
        };
      });

      const catalogList = items.map((p, idx) => PRODUCTS[String(p.id !== undefined ? p.id : (p.producto_id || `prod_${idx}`))]);
      renderHomeProducts(catalogList);
    } else {
      if (grid) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--text-muted);font-size:14px;">🛍️ No se encontraron productos para esta búsqueda.</div>';
      }
    }
  } catch (err) {
    console.warn('[Catálogo] Error al obtener catálogo en vivo:', err);
    // Contingencia: Renderizar productos en memoria si la conexión falla temporalmente
    renderHomeProducts(Object.values(PRODUCTS));
  }
}

function renderHomeProducts(productList) {
  const grid = document.getElementById('home-prod-grid');
  if (!grid) return;

  if (!productList || productList.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--text-muted);font-size:14px;">🛍️ Catálogo vacío</div>';
    return;
  }

  const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
  grid.innerHTML = productList.map(p => {
    const fmtPrice = '$' + Number(p.price).toLocaleString('es-CO');
    const hasDisc = p.disc && Number(p.disc) > 0;
    const oldPrice = hasDisc ? Math.round(p.price / (1 - p.disc / 100)) : 0;
    const fmtOld = '$' + oldPrice.toLocaleString('es-CO');
    const imgSrc = p.img || defaultImg;

    return `
      <div class="prod-card" onclick="openProductDetail('${p.id}')">
        ${hasDisc ? `<div class="prod-badge disc-badge">-${p.disc}%</div>` : ''}
        <img src="${imgSrc}" alt="${p.name}" class="prod-img" onerror="this.onerror=null;this.src='${defaultImg}';" />
        <div class="prod-info">
          <div class="prod-name">${p.name}</div>
          ${hasDisc ? `<div class="prod-price-old">${fmtOld}</div>` : ''}
          <div class="prod-price">${fmtPrice}</div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(catName) {
  closeCatMenu();
  const btn = document.querySelector('.cat-btn');
  if (btn) {
    btn.textContent = (catName === 'todos' ? 'Categorías' : catName) + ' ▾';
  }
  loadCatalog(catName, currentCatalogQuery);
}

function handleSearch(val) {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadCatalog(currentCatalogCategory, val ? val.trim() : '');
  }, 300);
}

function openProductDetail(key) {
  const p = PRODUCTS[key];
  if (!p) return;
  pdKey = key; pdQty = 1;

  const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
  const imgEl = document.getElementById('pd-img');
  if (imgEl) {
    imgEl.src = p.img || defaultImg;
    imgEl.alt = p.name;
    imgEl.onerror = () => { imgEl.src = defaultImg; };
  }
  document.getElementById('pd-name').textContent = p.name;
  document.getElementById('pd-cat').textContent = p.cat || 'Categoría';

  const priceEl = document.getElementById('pd-price');
  const oldPriceEl = document.getElementById('pd-price-old');

  priceEl.textContent = '$' + p.price.toLocaleString('es-CO');

  if (p.disc && p.disc > 0) {
    const oldP = Math.round(p.price / (1 - p.disc / 100));
    oldPriceEl.textContent = '$' + oldP.toLocaleString('es-CO');
    oldPriceEl.style.display = 'block';
    document.getElementById('pd-disc').textContent = '-' + p.disc + '%';
  } else {
    oldPriceEl.style.display = 'none';
    document.getElementById('pd-disc').textContent = '—';
  }

  const stockEl = document.getElementById('pd-stock');
  if (stockEl) stockEl.textContent = p.stock || '10';

  document.getElementById('pd-desc').textContent = p.desc || 'Descripción no disponible.';
  document.getElementById('pd-vendor').textContent = p.vendor || 'Vendedor';
  const avaEl = document.getElementById('pd-vendor-ava');
  if (avaEl && p.vendor) {
    avaEl.textContent = p.vendor.charAt(0).toUpperCase();
  }

  document.getElementById('pd-qty').textContent = 1;

  document.getElementById('pd-modal').classList.add('open');
}

function closePd() { document.getElementById('pd-modal').classList.remove('open'); }
function closePdOnOverlay(e) { if (e.target.id === 'pd-modal' || e.target.classList.contains('modal-overlay')) closePd(); }

function changeQty(d) {
  pdQty = Math.max(1, pdQty + d);
  document.getElementById('pd-qty').textContent = pdQty;
}

function addToCart() {
  if (!pdKey) return;
  const existing = cart.find(c => c.key === pdKey);
  if (existing) existing.qty += pdQty;
  else cart.push({ key: pdKey, qty: pdQty });
  saveCart();
  closePd();
  updateCartBadge();
  toast('🛒 ¡Producto agregado al carrito!');
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('sidebar-cart-badge');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
  const dot1 = document.getElementById('nav-cart-dot');
  if (dot1) dot1.style.display = total > 0 ? 'block' : 'none';
  const dot2 = document.getElementById('bnav-cart-dot');
  if (dot2) dot2.style.display = total > 0 ? 'block' : 'none';
}

function renderCart() {
  const container = document.getElementById('carrito-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--text-muted);font-size:15px;">🛒 Tu carrito está vacío</div>';
    setCartSummary(0, 0);
    return;
  }

  container.innerHTML = cart.map((item, idx) => {
    const p = PRODUCTS[item.key];
    if (!p) return '';
    const base  = p.price * item.qty;
    const damt  = p.disc > 0 ? Math.round(base * p.disc / 100) : 0;
    const final = base - damt;
    return `
      <div class="cart-item">
        <div class="cart-item-main">
          <img src="${p.img}" alt="${p.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-cat">${p.cat}</div>
            <div class="cart-item-prices">
              <span class="cart-item-price">$${final.toLocaleString('es-CO')}</span>
              ${damt > 0 ? `<span class="cart-item-old">$${base.toLocaleString('es-CO')}</span>` : ''}
            </div>
          </div>
        </div>
        <button class="trash-btn" onclick="cartRemove(${idx})" title="Eliminar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
        <div class="cart-item-right">
          <span class="qty-label">CANTIDAD</span>
          <button class="qty-btn-sm" onclick="cartQty(${idx},-1)">-</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn-sm" onclick="cartQty(${idx},1)">+</button>
        </div>
      </div>`;
  }).join('');

  updateCartSummary();
}

function cartQty(idx, d) {
  if (cart[idx]) { cart[idx].qty = Math.max(1, cart[idx].qty + d); }
  saveCart();
  renderCart(); updateCartBadge();
}

function cartRemove(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart(); updateCartBadge();
  toast('🗑️ Producto eliminado del carrito');
}

function updateCartSummary() {
  let sumBase = 0, sumDisc = 0;
  cart.forEach(item => {
    const p = PRODUCTS[item.key];
    if (!p) return;
    const b = p.price * item.qty;
    const d = p.disc > 0 ? Math.round(b * p.disc / 100) : 0;
    sumBase += b; sumDisc += d;
  });
  setCartSummary(sumBase, sumDisc);
}

function setCartSummary(base, disc) {
  const fmt = n => '$' + n.toLocaleString('es-CO');
  const ti = document.getElementById('sum-total-items');
  const td = document.getElementById('sum-discount');
  const tt = document.getElementById('sum-total');
  if (ti) ti.textContent = fmt(base);
  if (td) td.textContent = '-' + fmt(disc);
  if (tt) tt.textContent = fmt(base - disc);
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS[item.key];
    if (!p) return sum;
    const b = p.price * item.qty;
    return sum + b - (p.disc > 0 ? Math.round(b * p.disc / 100) : 0);
  }, 0);
}

async function openPasarela() {
  if (cart.length === 0) { toast('⚠️ Tu carrito está vacío'); return; }
  
  // RF38: Verificar que el comprador haya registrado su dirección antes de hacer compras
  const userAddr = localStorage.getItem('commercity_addr');
  if (!userAddr) {
    toast('⚠️ Registra tu dirección en Ajustes antes de comprar');
    setTimeout(() => navigate('ajustes'), 1200);
    return;
  }

  let subtotal = 0;
  let iva = 0;
  let total = 0;

  // 1. Intentar cálculo fiscal oficial desde el Servidor (RF134 / SRS Backend)
  try {
    if (window.CommerCityAPI && window.CommerCityAPI.getToken()) {
      // Sincronizar carrito local con backend antes de pedir resumen
      await window.CommerCityAPI.carrito.vaciar();
      for (const item of cart) {
        await window.CommerCityAPI.carrito.agregar(item.key, item.qty);
      }
      const resumen = await window.CommerCityAPI.pedidos.resumen();
      if (resumen && typeof resumen.subtotal === 'number') {
        subtotal = resumen.subtotal;
        iva = resumen.iva;
        total = resumen.total;
      }
    }
  } catch (err) {
    console.warn('Cálculo fiscal offline/fallback...', err);
  }

  // Fallback si no hay conexión al backend
  if (!total) {
    total = getCartTotal();
    subtotal = Math.round(total / 1.19);
    iva = Math.round(subtotal * 0.19);
  }

  const fmt = '$' + total.toLocaleString('es-CO');
  const fmtSub = '$' + subtotal.toLocaleString('es-CO');
  const fmtIva = '$' + iva.toLocaleString('es-CO');

  document.getElementById('pas-title').textContent = 'Pasarela de Pago';
  document.getElementById('pas-lbl').textContent = 'Total a pagar';
  document.getElementById('pas-amount').textContent = fmt;
  document.getElementById('pas-subtotal').textContent = fmtSub;
  document.getElementById('pas-iva').textContent = fmtIva;
  
  document.getElementById('pas-subtotal-row').style.display = 'flex';
  document.getElementById('pas-iva-row').style.display = 'flex';
  document.getElementById('pas-total-row').style.display = 'none';

  document.getElementById('pay-btn-amt').textContent = fmt;
  document.getElementById('pas-pay-area').style.display = 'block';
  document.getElementById('pas-done-area').style.display = 'none';
  document.getElementById('card-num').readOnly = false;
  document.getElementById('card-holder').readOnly = false;
  document.getElementById('card-num').value = '';
  document.getElementById('card-holder').value = '';

  const btn = document.getElementById('pay-btn');
  btn.textContent = ''; btn.disabled = false;
  btn.innerHTML = 'Pagar <span id="pay-btn-amt">' + fmt + '</span>';

  document.getElementById('pasarela-modal').classList.add('open');
}

function closePas() { document.getElementById('pasarela-modal').classList.remove('open'); }
function closePasOnOverlay(e) { if (e.target === document.getElementById('pasarela-modal')) closePas(); }

function fmtCard(input) {
  let v = input.value.replace(/\D/g,'').slice(0,16);
  input.value = v.match(/.{1,4}/g)?.join('-') || v;
}

async function processPago() {
  const num  = document.getElementById('card-num')?.value.replace(/-/g,'');
  const name = document.getElementById('card-holder')?.value.trim();
  if (!num || num.length < 8 || !name) { toast('⚠️ Completa los datos de pago'); return; }

  const btn = document.getElementById('pay-btn');
  btn.textContent = '⏳ Procesando con Servidor...';
  btn.disabled = true;

  let comprobante = 'REC-' + Math.floor(1000 + Math.random() * 9000);

  // 1. Confirmar pago y asentar pedido en Backend
  try {
    if (window.CommerCityAPI && window.CommerCityAPI.getToken()) {
      const resp = await window.CommerCityAPI.pedidos.confirmarPago({
        metodo_pago: 'Tarjeta Crédito/Débito',
        datos_transaccion: {
          numero_enmascarado: '**** **** **** ' + num.slice(-4),
          titular: name
        },
        direccion_entrega: localStorage.getItem('commercity_addr') || 'Dirección no especificada'
      });
      if (resp && resp.comprobante) {
        comprobante = resp.comprobante;
      }
    }
  } catch (err) {
    console.warn('Aviso: Pago procesado en contingencia local:', err);
  }

  setTimeout(() => {
    document.getElementById('pas-title').textContent = '¡Pago Exitoso! ✅';
    document.getElementById('pas-lbl').textContent = 'Total ya pagado (' + comprobante + ')';
    document.getElementById('pas-subtotal-row').style.display = 'none';
    document.getElementById('pas-iva-row').style.display = 'none';
    document.getElementById('pas-total-row').style.display = 'flex';
    document.getElementById('card-num').readOnly = true;
    document.getElementById('card-holder').readOnly = true;
    document.getElementById('pas-pay-area').style.display = 'none';
    document.getElementById('pas-done-area').style.display = 'block';
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
    toast('✅ ¡Pago realizado con éxito! Comprobante: ' + comprobante);
  }, 1200);
}

function downloadReceipt() {
  toast('📄 Comprobante descargado');
  closePas();
}

function openOrderDetail(idx) {
  const o = ORDER_DATA[idx];
  if (!o) return;
  document.getElementById('od-ava').textContent   = o.ava;
  document.getElementById('od-ava').style.background = o.color;
  document.getElementById('od-buyer').textContent = o.buyer;
  document.getElementById('od-addr').innerHTML    = `${o.addr}<br><span style="color:var(--text-muted);font-size:12px;">${o.city}</span>`;
  document.getElementById('od-prod').textContent  = o.prod;
  document.getElementById('od-qty').textContent   = 'Cantidad: ' + o.qty + ' unidad' + (o.qty !== 1 ? 'es' : '');
  document.getElementById('od-total').textContent = o.total;
  document.getElementById('od-status').textContent = o.status;
  document.getElementById('od-date').textContent  = 'Fecha: ' + o.date;
  document.getElementById('od-modal').classList.add('open');
}
function closeOd() { document.getElementById('od-modal').classList.remove('open'); }
function closeOdOnOverlay(e) { if (e.target === document.getElementById('od-modal')) closeOd(); }

function filterTab(btn, tbodyId, status) {
  btn.closest('.filter-tabs').querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const rows = document.querySelectorAll('#' + tbodyId + ' tr');
  rows.forEach(row => {
    row.style.display = (status === 'todo' || row.dataset.estado === status) ? '' : 'none';
  });
}

function filterHTab(btn, status) {
  btn.closest('.filter-tabs').querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function openAddProductModal() { document.getElementById('add-prod-modal').classList.add('open'); }
function closeAddProd() { document.getElementById('add-prod-modal').classList.remove('open'); }
function closeAddProdOnOverlay(e) { if (e.target === document.getElementById('add-prod-modal')) closeAddProd(); }

function handleAddProduct(e) {
  e.preventDefault();
  const name  = document.getElementById('np-name')?.value.trim();
  const price = document.getElementById('np-price')?.value;
  const stock = document.getElementById('np-stock')?.value;
  const cat   = document.getElementById('np-cat')?.value.trim();
  const desc  = document.getElementById('np-desc')?.value.trim() || '';
  const disc  = parseInt(document.getElementById('np-disc')?.value) || 0;

  if (!name) { toast('⚠️ Ingresa el nombre del producto'); return; }
  if (!price || parseInt(price) <= 0) { toast('⚠️ Ingresa un precio válido'); return; }
  if (!stock || parseInt(stock) < 0) { toast('⚠️ Ingresa el stock del producto'); return; }
  if (!cat) { toast('⚠️ Ingresa la categoría del producto'); return; }

  const newId = 'prod_' + Date.now();
  const fmt = '$' + parseInt(price).toLocaleString('es-CO');
  const imgInput = document.getElementById('np-image');
  let imgHtml = '<div style="width:100%;aspect-ratio:1;background:var(--bg-input);display:flex;align-items:center;justify-content:center;font-size:48px;">📦</div>';
  let imgUrl = '';
  if (imgInput && imgInput.files && imgInput.files[0]) {
    imgUrl = URL.createObjectURL(imgInput.files[0]);
    imgHtml = `<img src="${imgUrl}" class="prod-img" />`;
  }

  PRODUCTS[newId] = {
    name: name,
    price: parseInt(price),
    cat: cat,
    stock: parseInt(stock),
    disc: disc,
    img: imgUrl,
    vendor: 'Mi Tienda',
    desc: desc || 'Producto añadido recientemente.'
  };

  const html = `
    <div class="prod-card" style="animation:fadeIn 0.3s ease;" onclick="openProductDetail('${newId}')">
      ${imgHtml}
      <div class="prod-info">
        <div class="prod-name">${name}</div>
        <div class="prod-price">${fmt}</div>
      </div>
    </div>`;

  const grid = document.getElementById('perfil-prod-grid');
  if (grid) grid.insertAdjacentHTML('afterbegin', html);

  closeAddProd();
  e.target.reset();
  document.getElementById('img-upload-text').textContent = '+ Cargar Imagen';
  const preview = document.getElementById('np-image-preview');
  if (preview) { preview.style.display = 'none'; preview.src = ''; }
  toast('✅ ¡Producto agregado exitosamente!');
}

function previewUpload(input) {
  const text = document.getElementById('img-upload-text');
  const preview = document.getElementById('np-image-preview');
  if (input.files && input.files[0]) {
    text.textContent = '✅ ' + input.files[0].name.substring(0, 15) + '...';
    if (preview) {
      preview.src = URL.createObjectURL(input.files[0]);
      preview.style.display = 'block';
    }
  } else {
    text.textContent = '+ Cargar Imagen';
    if (preview) {
      preview.style.display = 'none';
      preview.src = '';
    }
  }
}

function openChat(name, ava, color) {
  const nameEl = document.getElementById('chat-name');
  const avaEl  = document.getElementById('chat-ava');
  if (nameEl) nameEl.textContent = name;
  if (avaEl) {
    avaEl.textContent = ava || name[0];
    avaEl.style.background = color ? `linear-gradient(135deg, ${color}, ${color}99)` : 'var(--orange)';
  }
  navigate('chat');
}

function sendMsg() {
  const field = document.getElementById('chat-field');
  const msg   = field?.value.trim();
  if (!msg) return;
  const body = document.getElementById('chat-body');
  const div  = document.createElement('div');
  div.className = 'msg-wrap outgoing';
  div.innerHTML = `<div class="msg-bubble">${msg}</div><div class="msg-time">Ahora</div>`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  field.value = '';
}

function savePersonalInfo() {
  const user = document.getElementById('aj-user').value.trim();
  const email = document.getElementById('aj-email').value.trim();
  if (!user || !email) { toast('⚠️ Completa los campos'); return; }
  localStorage.setItem('commercity_user', user);
  localStorage.setItem('commercity_email', email);

  const desc = document.getElementById('aj-desc')?.value.trim();
  if (desc !== undefined) {
    localStorage.setItem('commercity_desc', desc || 'Hola,Soy nuevo');
    const perfilDesc = document.getElementById('perfil-desc');
    if (perfilDesc) perfilDesc.textContent = desc || 'Hola,Soy nuevo';
  }

  const perfilName = document.querySelector('.perfil-name');
  if (perfilName) perfilName.textContent = user;

  toast('✅ Información personal guardada');
}
function saveAddress() {
  const addr = document.getElementById('aj-addr')?.value.trim();
  const city = document.getElementById('aj-city')?.value.trim();
  const dept = document.getElementById('aj-dept')?.value.trim();
  if (!addr || !city || !dept) { toast('⚠️ Completa la dirección'); return; }
  localStorage.setItem('commercity_addr', addr);
  localStorage.setItem('commercity_city', city);
  localStorage.setItem('commercity_dept', dept);
  toast('✅ Dirección de entrega guardada');
}

function saveBankAccount() {
  const name   = document.getElementById('bank-name')?.value.trim();
  const bank   = document.getElementById('bank-select')?.value;
  const type   = document.getElementById('bank-type')?.value;
  const number = document.getElementById('bank-number')?.value.trim();
  if (!name || !bank || !type || !number) { toast('⚠️ Completa todos los campos'); return; }
  localStorage.setItem('commercity_bank_name', name);
  localStorage.setItem('commercity_bank', bank);
  localStorage.setItem('commercity_bank_type', type);
  localStorage.setItem('commercity_bank_num', number);
  toast('✅ Cuenta bancaria guardada exitosamente');
}
function becomeSeller() {
  setRole(true);
  localStorage.setItem('commercity_is_seller', 'true');
  toast('🎉 ¡Felicidades! Ahora eres vendedor');
  setTimeout(() => navigate('tienda'), 500);
}
function confirmDelete() {
  if (confirm('¿Estás seguro de eliminar tu cuenta? Esta acción es irreversible.')) {
    toast('⚠️ Cuenta eliminada');
    setTimeout(() => navigate('login'), 800);
  }
}

function toggleMoreMenu() {
  document.getElementById('more-drawer')?.classList.toggle('active');
  document.getElementById('more-overlay')?.classList.toggle('active');
}
function closeMoreMenu() {
  document.getElementById('more-drawer')?.classList.remove('active');
  document.getElementById('more-overlay')?.classList.remove('active');
}

function toast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function minimizeWindow() { if (ipcRenderer) ipcRenderer.send('minimize-window'); }
function maximizeWindow() { if (ipcRenderer) ipcRenderer.send('maximize-window'); }
function closeWindow()    { if (ipcRenderer) ipcRenderer.send('close-window'); }

document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifs-panel');
  if (panel?.classList.contains('open')) {
    if (!panel.contains(e.target) && !e.target.closest('button[onclick*="toggleNotifs"]')) closeNotifs();
  }
  const catDd = document.getElementById('cat-dropdown');
  if (catDd?.classList.contains('open')) {
    if (!e.target.closest('.cat-wrap')) closeCatMenu();
  }
});

window.addEventListener('resize', () => {
  const active = document.querySelector('.page.active');
  if (!active) return;
  const page = active.id.replace('page-','');
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const isMobile = window.innerWidth <= 860;
  const isAuth   = AUTH_PAGES.includes(page);
  sidebar.style.display = (!isAuth && !isMobile) ? 'flex' : 'none';
  if (!isAuth && !isMobile) sidebar.style.flexDirection = 'column';
});

function changeProfilePic(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const avaText = document.getElementById('perfil-ava-text');
      const avaImg = document.getElementById('perfil-ava-img');
      if (avaText) avaText.style.display = 'none';
      if (avaImg) {
        avaImg.src = e.target.result;
        avaImg.style.display = 'block';
        localStorage.setItem('commercity_profile_pic', e.target.result);
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function loadProfilePic() {
  const pic = localStorage.getItem('commercity_profile_pic');
  if (pic) {
    const avaText = document.getElementById('perfil-ava-text');
    const avaImg = document.getElementById('perfil-ava-img');
    if (avaText) avaText.style.display = 'none';
    if (avaImg) {
      avaImg.src = pic;
      avaImg.style.display = 'block';
    }
  }
}

loadProfilePic();

function loadPersonalInfo() {
  const user = localStorage.getItem('commercity_user');
  const email = localStorage.getItem('commercity_email');
  const desc = localStorage.getItem('commercity_desc');
  if (user) {
    const perfilName = document.querySelector('.perfil-name');
    if (perfilName) perfilName.textContent = user;
    const ajUser = document.getElementById('aj-user');
    if (ajUser) ajUser.value = user;
  }
  if (email) {
    const ajEmail = document.getElementById('aj-email');
    if (ajEmail) ajEmail.value = email;
  }
  if (desc) {
    const ajDesc = document.getElementById('aj-desc');
    if (ajDesc) ajDesc.value = desc;
    const perfilDesc = document.getElementById('perfil-desc');
    if (perfilDesc) perfilDesc.textContent = desc;
  }

  const addr = localStorage.getItem('commercity_addr');
  const city = localStorage.getItem('commercity_city');
  const dept = localStorage.getItem('commercity_dept');
  if (addr) { const e=document.getElementById('aj-addr'); if(e) e.value = addr; }
  if (city) { const e=document.getElementById('aj-city'); if(e) e.value = city; }
  if (dept) { const e=document.getElementById('aj-dept'); if(e) e.value = dept; }

  const bName = localStorage.getItem('commercity_bank_name');
  const bBank = localStorage.getItem('commercity_bank');
  const bType = localStorage.getItem('commercity_bank_type');
  const bNum  = localStorage.getItem('commercity_bank_num');
  if (bName) { const e=document.getElementById('bank-name'); if(e) e.value = bName; }
  if (bBank) { const e=document.getElementById('bank-select'); if(e) e.value = bBank; }
  if (bType) { const e=document.getElementById('bank-type'); if(e) e.value = bType; }
  if (bNum)  { const e=document.getElementById('bank-number'); if(e) e.value = bNum; }

  const serverInput = document.getElementById('aj-server-url');
  if (serverInput && window.CommerCityAPI) {
    serverInput.value = window.CommerCityAPI.getBaseUrl();
  }
}
loadPersonalInfo();

function saveApiServerConfig() {
  const input = document.getElementById('aj-server-url');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    if (window.CommerCityAPI) {
      window.CommerCityAPI.setCustomApiUrl(val);
    } else {
      localStorage.setItem('commercity_custom_api_url', val);
    }
    toast('✅ Conexión actualizada: ' + val);
    loadCatalog();
  } else {
    if (window.CommerCityAPI) {
      window.CommerCityAPI.setCustomApiUrl('');
    } else {
      localStorage.removeItem('commercity_custom_api_url');
    }
    toast('🔄 Modo automático restaurado');
    if (input && window.CommerCityAPI) input.value = window.CommerCityAPI.getBaseUrl();
    loadCatalog();
  }
}

async function testApiServerConnection() {
  const statusEl = document.getElementById('aj-server-status');
  if (statusEl) statusEl.textContent = '⏳ Probando conexión con backend...';
  try {
    const base = window.CommerCityAPI ? window.CommerCityAPI.getBaseUrl() : 'http://10.0.2.2:3000';
    const res = await fetch(`${base}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      toast('🟢 Conexión exitosa con la API CommerCity');
      if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e;">🟢 En línea: ${data.service || 'CommerCity API'} (v${data.version || '2.0'})</span>`;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    toast('🔴 Error de conexión: ' + e.message);
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444;">🔴 Fuera de línea (${e.message})</span>`;
  }
}

function openServerModal() {
  const modal = document.getElementById('server-modal');
  const input = document.getElementById('modal-server-url');
  if (input && window.CommerCityAPI) {
    input.value = window.CommerCityAPI.getBaseUrl();
  }
  const status = document.getElementById('modal-server-status');
  if (status) status.textContent = 'Estado: Listo para conectar';
  if (modal) modal.classList.add('open');
}

function closeServerModal() {
  const modal = document.getElementById('server-modal');
  if (modal) modal.classList.remove('open');
}

function closeServerModalOnOverlay(e) {
  if (e.target.id === 'server-modal' || e.target.classList.contains('modal-overlay')) {
    closeServerModal();
  }
}

function saveModalServerConfig() {
  const input = document.getElementById('modal-server-url');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    if (window.CommerCityAPI) {
      window.CommerCityAPI.setCustomApiUrl(val);
    } else {
      localStorage.setItem('commercity_custom_api_url', val);
    }
    toast('✅ URL del servidor guardada');
  } else {
    if (window.CommerCityAPI) {
      window.CommerCityAPI.setCustomApiUrl('');
    } else {
      localStorage.removeItem('commercity_custom_api_url');
    }
    toast('🔄 Modo automático restaurado');
  }
  loadCatalog();
  closeServerModal();
}

async function testModalServerConnection() {
  const statusEl = document.getElementById('modal-server-status');
  if (statusEl) statusEl.textContent = '⏳ Probando conexión con el backend...';
  try {
    const input = document.getElementById('modal-server-url');
    const targetUrl = (input?.value.trim()) || (window.CommerCityAPI ? window.CommerCityAPI.getBaseUrl() : 'http://10.0.2.2:3000');
    const res = await fetch(`${targetUrl.replace(/\/+$/, '')}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      toast('🟢 Conexión exitosa');
      if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e;">🟢 En línea: ${data.service || 'CommerCity API'}</span>`;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    toast('🔴 Conexión fallida: ' + e.message);
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444;">🔴 Error: ${e.message}</span>`;
  }
}

// =========================================================
// CHAT EN TIEMPO REAL & CONVERSACIONES
// =========================================================
let currentChatPartner = { id: 3, name: 'Alex Rivera', ava: 'A', color: '#7c3aed' };
window.chatPollingTimer = null;
let lastChatMsgCount = 0;
let chatConversationsCache = [];

function getAvatarColor(str) {
  const colors = ['#7c3aed', '#be185d', '#0891b2', '#059669', '#d97706', '#dc2626'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

async function loadChatConversaciones() {
  const container = document.getElementById('chat-list-container');
  if (!container) return;

  try {
    if (window.CommerCityAPI && window.CommerCityAPI.getToken()) {
      const data = await window.CommerCityAPI.chat.conversaciones();
      if (data && data.conversaciones && data.conversaciones.length > 0) {
        chatConversationsCache = data.conversaciones;
        renderConversationsList(data.conversaciones);
        return;
      }
    }
  } catch (err) {
    console.warn('Carga de conversaciones en contingencia local:', err.message);
  }

  // Fallback con datos precargados si no hay respuesta de API
  chatConversationsCache = [
    { partner_id: 3, nombre: 'Alex Rivera (Vendedor)', ultimo_mensaje: 'Sí, aún tenemos disponibilidad para entrega', fecha: '10:42', no_leidos: 1 },
    { partner_id: 4, nombre: 'Elena Sanz (Vendedora)', ultimo_mensaje: 'Garantía oficial de 12 meses por defecto', fecha: 'Ayer', no_leidos: 0 },
    { partner_id: 486, nombre: 'Soporte CommerCity', ultimo_mensaje: 'Tu cuenta ha sido verificada exitosamente', fecha: 'Lun', no_leidos: 0 }
  ];
  renderConversationsList(chatConversationsCache);
}

function renderConversationsList(list) {
  const container = document.getElementById('chat-list-container');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;">No hay conversaciones activas.</div>';
    return;
  }

  container.innerHTML = list.map(c => {
    const initials = (c.nombre || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const color = getAvatarColor(c.nombre);
    const unreadClass = c.no_leidos > 0 ? 'unread' : '';
    const dateFormatted = c.fecha ? (c.fecha.includes('T') ? new Date(c.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : c.fecha) : '';
    return `
      <div class="chat-li ${unreadClass}" onclick="openChat('${c.nombre.replace(/'/g, "\\'")}', '${initials}', '${color}', ${c.partner_id || 3})">
        <div class="chat-li-ava" style="background:${color};">${initials}</div>
        <div class="chat-li-body">
          <div class="chat-li-name">${c.nombre}</div>
          <div class="chat-li-preview">${c.ultimo_mensaje || 'Toca para abrir chat...'}</div>
        </div>
        <div class="chat-li-meta">
          <div class="chat-li-time">${dateFormatted}</div>
          ${c.no_leidos > 0 ? '<div class="unread-dot"></div>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function filterChatConversations(q) {
  const term = (q || '').toLowerCase();
  const filtered = chatConversationsCache.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(term)) ||
    (c.ultimo_mensaje && c.ultimo_mensaje.toLowerCase().includes(term))
  );
  renderConversationsList(filtered);
}

function openChat(name, ava, color, partnerId = 3) {
  currentChatPartner = {
    id: partnerId || 3,
    name: name || 'Usuario CommerCity',
    ava: ava || 'U',
    color: color || '#7c3aed'
  };

  const nameEl = document.getElementById('chat-name');
  const avaEl = document.getElementById('chat-ava');
  if (nameEl) nameEl.textContent = currentChatPartner.name;
  if (avaEl) {
    avaEl.textContent = currentChatPartner.ava;
    avaEl.style.background = currentChatPartner.color;
  }

  navigate('chat');
  lastChatMsgCount = 0;

  // Cargar historial de mensajes de inmediato
  loadChatMessages(currentChatPartner.id, false);

  // Iniciar Polling en tiempo real continuo cada 1.5 segundos
  if (window.chatPollingTimer) clearInterval(window.chatPollingTimer);
  window.chatPollingTimer = setInterval(() => {
    loadChatMessages(currentChatPartner.id, true);
  }, 1500);
}

async function loadChatMessages(partnerId, isPolling = false) {
  const body = document.getElementById('chat-body');
  if (!body) return;

  try {
    if (window.CommerCityAPI && window.CommerCityAPI.getToken()) {
      const res = await window.CommerCityAPI.chat.mensajes(partnerId);
      if (res && res.mensajes) {
        // Evitar refrescar el DOM si no hay mensajes nuevos para evitar parpadeos
        if (isPolling && res.mensajes.length === lastChatMsgCount) {
          return;
        }

        lastChatMsgCount = res.mensajes.length;

        // Mantener la tarjeta de producto de muestra en la cabecera del chat
        let html = `
          <div class="chat-prod-card">
            <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" alt="Bolso" class="chat-prod-img" />
            <div class="chat-prod-info">
              <div class="chat-prod-name">Producto en consulta</div>
              <div class="chat-prod-price">Chat directo seguro con el vendedor</div>
            </div>
          </div>
        `;

        if (res.mensajes.length === 0) {
          html += `
            <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">
              💬 Inicia la conversación con <strong>${currentChatPartner.name}</strong>. Escribe un mensaje abajo.
            </div>
          `;
        } else {
          html += res.mensajes.map(m => {
            const time = m.enviado_at ? (m.enviado_at.includes('T') ? new Date(m.enviado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : m.enviado_at) : 'Ahora';
            const isMine = !!m.is_mine;
            return `
              <div class="msg-wrap ${isMine ? 'outgoing' : 'incoming'}">
                <div class="msg-bubble">${m.mensaje}</div>
                <div class="msg-time">${time}</div>
              </div>
            `;
          }).join('');
        }

        body.innerHTML = html;
        body.scrollTop = body.scrollHeight;
        return;
      }
    }
  } catch (err) {
    if (!isPolling) console.warn('Error al cargar mensajes de chat:', err);
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-msg-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  const partnerId = currentChatPartner.id || 3;
  input.value = '';

  // Inserción optimista inmediata en la UI
  const body = document.getElementById('chat-body');
  if (body) {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bubbleHtml = `
      <div class="msg-wrap outgoing">
        <div class="msg-bubble">${val}</div>
        <div class="msg-time">${timeNow}</div>
      </div>
    `;
    body.insertAdjacentHTML('beforeend', bubbleHtml);
    body.scrollTop = body.scrollHeight;
    lastChatMsgCount++;
  }

  // Envío a la base de datos central a través de la API
  try {
    if (window.CommerCityAPI && window.CommerCityAPI.getToken()) {
      await window.CommerCityAPI.chat.enviar(partnerId, val);
    }
  } catch (err) {
    console.warn('Mensaje enviado en memoria local (servidor no disponible):', err.message);
  }
}

let homePageLoaded = 0;
const EXTRA_PRODUCTS = [
  { id: 'cam1', name: 'Cámara DSLR Pro', price: '$2.500.000', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', badge: 'Nuevo' },
  { id: 'lentes1', name: 'Gafas de Sol Clásicas', price: '$120.000', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', badge: 'Oferta' },
  { id: 'reloj2', name: 'Smartwatch V2', price: '$450.000', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', badge: '' },
  { id: 'zapatos2', name: 'Tenis Urbanos', price: '$180.000', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', badge: 'Nuevo' },
  { id: 'bolso2', name: 'Bolso de Cuero', price: '$350.000', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', badge: '' },
  { id: 'audifonos2', name: 'Auriculares In-Ear', price: '$299.000', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', badge: '10%' }
];

document.getElementById('page-home').addEventListener('scroll', function(e) {
  const el = e.target;
  if (el.scrollHeight - el.scrollTop <= el.clientHeight + 100) {
    if (homePageLoaded < 3) {
      homePageLoaded++;
      const grid = document.getElementById('home-prod-grid');
      if (grid) {
        EXTRA_PRODUCTS.forEach(p => {
          const html = `
            <div class="prod-card" style="animation:fadeIn 0.3s ease;" onclick="openProductDetail('${p.id}')">
              <img src="${p.img}" alt="${p.name}" class="prod-img" style="object-fit:cover;" />
              <div class="prod-info"><div class="prod-name">${p.name}</div><div class="prod-price">${p.price}</div></div>
            </div>
          `;
          grid.insertAdjacentHTML('beforeend', html);
        });
      }
    }
  }
});


const FOLLOWERS_DATA = [
  { name: 'Nath', type: 'Persona', color: '#F5A623', letter: 'N', verified: true },
  { name: 'Andrea Valdiri', type: 'Persona', color: '#be185d', letter: 'A', verified: false },
  { name: 'Paris Accesorios', type: 'Tienda', color: '#7c3aed', letter: '🛍️', verified: false },
  { name: 'MARINO Cosme', type: 'Vendedor', color: '#ef4444', letter: 'M', verified: false },
  { name: 'Alex Castillo', type: 'Persona', color: '#0891b2', letter: 'A', verified: false },
  { name: 'Asadero KIKE BRASAS', type: 'Tienda', color: '#f59e0b', letter: '🍗', verified: false },
  { name: 'Lucas G.', type: 'Persona', color: '#22c55e', letter: 'L', verified: false },
  { name: 'Diana Torres', type: 'Persona', color: '#8b5cf6', letter: 'D', verified: false },
  { name: 'ModaVIP Colombia', type: 'Tienda', color: '#ec4899', letter: 'M', verified: true },
  { name: 'Carlos Mendoza', type: 'Persona', color: '#14b8a6', letter: 'C', verified: false },
];

const FOLLOWING_DATA = [
  { name: 'Nath', type: 'Persona', color: '#F5A623', letter: 'N', verified: true },
  { name: 'Andrea Valdiri', type: 'Persona', color: '#be185d', letter: 'A', verified: false },
  { name: 'Paris Accesorios', type: 'Tienda', color: '#7c3aed', letter: '🛍️', verified: false },
  { name: 'MARINO Cosme', type: 'Vendedor', color: '#ef4444', letter: 'M', verified: false },
  { name: 'Alex Castillo', type: 'Persona', color: '#0891b2', letter: 'A', verified: false },
  { name: 'Asadero KIKE BRASAS', type: 'Tienda', color: '#f59e0b', letter: '🍗', verified: false },
  { name: 'Lucas G.', type: 'Persona', color: '#22c55e', letter: 'L', verified: false },
];

let currentFollowTab = 'seguidores';

function openFollowersModal(tab) {
  currentFollowTab = tab || 'seguidores';
  document.getElementById('followers-modal').classList.add('open');
  renderFollowersList(currentFollowTab);
  document.getElementById('tab-seguidores').classList.toggle('active', currentFollowTab === 'seguidores');
  document.getElementById('tab-siguiendo').classList.toggle('active', currentFollowTab === 'siguiendo');
}

function closeFollowersModal() {
  document.getElementById('followers-modal').classList.remove('open');
}

function closeFollowersOnOverlay(e) {
  if (e.target === document.getElementById('followers-modal')) closeFollowersModal();
}

function switchFollowTab(tab) {
  currentFollowTab = tab;
  document.getElementById('tab-seguidores').classList.toggle('active', tab === 'seguidores');
  document.getElementById('tab-siguiendo').classList.toggle('active', tab === 'siguiendo');
  renderFollowersList(tab);
}

function renderFollowersList(tab) {
  const list = document.getElementById('followers-list');
  if (!list) return;
  const data = tab === 'seguidores' ? FOLLOWERS_DATA : FOLLOWING_DATA;
  list.innerHTML = data.map(u => {
    const letterIsEmoji = u.letter.length > 1;
    const avaStyle = letterIsEmoji
      ? `background:${u.color};`
      : `background:linear-gradient(135deg,${u.color},${u.color}99);`;
    return `
      <div class="follow-item">
        <div class="follow-ava" style="${avaStyle}">${u.letter}</div>
        <div class="follow-info">
          <div class="follow-name">${u.name}${u.verified ? ' <span style="color:var(--orange);font-size:13px;">✓</span>' : ''}</div>
          <div class="follow-type">${u.type}</div>
        </div>
      </div>`;
  }).join('');
}

let editProductKey = null;

function openEditProductModal(key) {
  const p = PRODUCTS[key];
  if (!p) return;
  editProductKey = key;

  document.getElementById('ep-name').value  = p.name || '';
  document.getElementById('ep-desc').value  = p.desc || '';
  document.getElementById('ep-price').value = p.price || '';
  document.getElementById('ep-stock').value = p.stock || '';
  document.getElementById('ep-disc').value  = p.disc || '';
  document.getElementById('ep-cat').value   = p.cat || '';

  const preview = document.getElementById('ep-image-preview');
  if (preview) { preview.style.display = 'none'; preview.src = ''; }
  document.getElementById('ep-img-upload-text').textContent = '+ Cambiar Imagen';

  document.getElementById('edit-prod-modal').classList.add('open');
}

function closeEditProd() {
  document.getElementById('edit-prod-modal').classList.remove('open');
  editProductKey = null;
}

function closeEditProdOnOverlay(e) {
  if (e.target === document.getElementById('edit-prod-modal')) closeEditProd();
}

function handleEditProduct(e) {
  e.preventDefault();
  if (!editProductKey) return;

  const name  = document.getElementById('ep-name')?.value.trim();
  const desc  = document.getElementById('ep-desc')?.value.trim();
  const priceRaw = document.getElementById('ep-price')?.value;
  const stockRaw = document.getElementById('ep-stock')?.value;
  const disc  = parseInt(document.getElementById('ep-disc')?.value) || 0;
  const cat   = document.getElementById('ep-cat')?.value.trim();

  if (!name) { toast('⚠️ Ingresa el nombre del producto'); return; }
  if (!priceRaw || parseInt(priceRaw) <= 0) { toast('⚠️ Ingresa un precio válido'); return; }
  if (stockRaw === '' || stockRaw === null || stockRaw === undefined || parseInt(stockRaw) < 0) { toast('⚠️ Ingresa el stock del producto'); return; }
  if (!cat) { toast('⚠️ Ingresa la categoría del producto'); return; }

  const price = parseInt(priceRaw);
  const stock = parseInt(stockRaw);

  PRODUCTS[editProductKey] = { ...PRODUCTS[editProductKey], name, desc, price, stock, disc, cat };

  const grid = document.getElementById('perfil-prod-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.prod-card');
    cards.forEach(card => {
      if (card.getAttribute('onclick') && card.getAttribute('onclick').includes(editProductKey)) {
        const nameEl = card.querySelector('.prod-name');
        const priceEl = card.querySelector('.prod-price');
        const oldPriceEl = card.querySelector('.prod-price-old');
        const badgeEl = card.querySelector('.prod-badge.disc-badge');
        if (nameEl) nameEl.textContent = name;
        if (priceEl) priceEl.textContent = '$' + price.toLocaleString('es-CO');
        if (disc > 0) {
          const originalPrice = Math.round(price / (1 - disc / 100));
          if (oldPriceEl) {
            oldPriceEl.textContent = '$' + originalPrice.toLocaleString('es-CO');
            oldPriceEl.style.display = '';
          }
          if (badgeEl) badgeEl.textContent = '-' + disc + '%';
        }
      }
    });
  }

  closeEditProd();
  toast('✅ ¡Producto actualizado exitosamente!');
}

function previewEditUpload(input) {
  const text = document.getElementById('ep-img-upload-text');
  const preview = document.getElementById('ep-image-preview');
  if (input.files && input.files[0]) {
    text.textContent = '✅ ' + input.files[0].name.substring(0, 15) + '...';
    if (preview) {
      preview.src = URL.createObjectURL(input.files[0]);
      preview.style.display = 'block';
    }
  } else {
    text.textContent = '+ Cambiar Imagen';
    if (preview) { preview.style.display = 'none'; preview.src = ''; }
  }
}


function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
  const tBtn = document.getElementById('admin-tab-' + tabId);
  const tSec = document.getElementById('admin-sec-' + tabId);
  if(tBtn) tBtn.classList.add('active');
  if(tSec) tSec.classList.add('active');
}

function filterAdminList(inputId, className) {
  const q = document.getElementById(inputId).value.toLowerCase();
  const items = document.querySelectorAll(className);
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function openAdminUserDetail(name, role, status, email, published, reports) {
  document.getElementById('admin-user-name').textContent = name;
  document.getElementById('admin-user-role').textContent = role;
  document.getElementById('admin-user-status').textContent = status;
  document.getElementById('admin-user-email').textContent = email;
  document.getElementById('admin-user-published').textContent = published;
  document.getElementById('admin-user-reports').textContent = reports;
  document.getElementById('admin-user-modal').classList.add('open');
}
function closeAdminUser() { document.getElementById('admin-user-modal').classList.remove('open'); }
function closeAdminUserOnOverlay(e) { if(e.target === document.getElementById('admin-user-modal')) closeAdminUser(); }

function openAdminProductDetail(name, vendor, status, price, reports) {
  document.getElementById('admin-prod-name').textContent = name;
  document.getElementById('admin-prod-vendor').textContent = vendor;
  document.getElementById('admin-prod-status').textContent = status;
  document.getElementById('admin-prod-price').textContent = price;
  document.getElementById('admin-prod-reports').textContent = reports;
  document.getElementById('admin-prod-modal').classList.add('open');
}
function closeAdminProduct() { document.getElementById('admin-prod-modal').classList.remove('open'); }
function closeAdminProductOnOverlay(e) { if(e.target === document.getElementById('admin-prod-modal')) closeAdminProduct(); }

function openAdminReportDetail(type, reported, by, reason, date, status) {
  document.getElementById('admin-rep-type').textContent = type;
  document.getElementById('admin-rep-reported').textContent = reported;
  document.getElementById('admin-rep-by').textContent = by;
  document.getElementById('admin-rep-reason').textContent = reason;
  document.getElementById('admin-rep-date').textContent = date;
  document.getElementById('admin-rep-status').textContent = status;
  document.getElementById('admin-rep-modal').classList.add('open');
}
function closeAdminReport() { document.getElementById('admin-rep-modal').classList.remove('open'); }
function closeAdminReportOnOverlay(e) { if(e.target === document.getElementById('admin-rep-modal')) closeAdminReport(); }

function adminAction(actionName, modalIdToClose) {
  if (confirm(`¿Estás seguro de que deseas ${actionName}?`)) {
    toast(`✅ Acción '${actionName}' ejecutada con éxito`);
    if (modalIdToClose) {
      document.getElementById(modalIdToClose).classList.remove('open');
    }
  }
}

function adminAction(action, modalId) {
  toast(action + " realizado con éxito");

  if (currentAdminTarget) {
     let badge = currentAdminTarget.querySelector('.badge:not(.outline)');
     if (badge) {
        if (action.toLowerCase().includes('eliminar') || action.toLowerCase().includes('banear') || action.toLowerCase().includes('suspender')) {
           badge.textContent = action.toLowerCase().includes('eliminar') ? 'Eliminado' : (action.toLowerCase().includes('banear') ? 'Baneado' : 'Suspendido');
           badge.className = 'badge badge-red';
        } else if (action.toLowerCase().includes('activar')) {
           badge.textContent = 'Activo';
           badge.className = 'badge badge-green';
        } else if (action.toLowerCase().includes('responder') || action.toLowerCase().includes('resolver') || action.toLowerCase().includes('ver')) {
           badge.textContent = 'Resuelto';
           badge.className = 'badge badge-green';
        }
     }
  }

  if (modalId) {
    document.getElementById(modalId).classList.remove('open');
  }
}

function openReportModal() {
  document.getElementById('report-modal').classList.add('open');
}
function closeReportModal() {
  document.getElementById('report-modal').classList.remove('open');
}
function closeReportOnOverlay(e) {
  if (e.target === document.getElementById('report-modal')) closeReportModal();
}
function submitReportModal() {
  const reason = document.getElementById('report-reason')?.value.trim();
  if (!reason) {
    toast('⚠️ Ingresa el motivo del reporte');
    return;
  }
  toast('✅ Reporte enviado exitosamente');
  closeReportModal();
  if (document.getElementById('report-reason')) {
    document.getElementById('report-reason').value = '';
  }
}


// Interactive Stars Logic
function rateProfile(rating) {
  const starsContainer = document.getElementById('perfil-stars');
  if(!starsContainer) return;
  const stars = starsContainer.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if(index < rating) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}

// RF22, RF23: Pestaña Mi Feed en Perfil de Comprador
function switchPerfilTab(tab) {
  const btnMisProd = document.getElementById('tab-mis-prod');
  const btnMiFeed  = document.getElementById('tab-mi-feed');
  const grid = document.getElementById('perfil-prod-grid');
  if (!grid) return;

  if (tab === 'mi-feed') {
    if (btnMisProd) btnMisProd.classList.remove('active');
    if (btnMiFeed) btnMiFeed.classList.add('active');

    // Render feed de productos recomendados
    const feedHtml = Object.keys(PRODUCTS).map(key => {
      const p = PRODUCTS[key];
      const fmtPrice = '$' + p.price.toLocaleString('es-CO');
      return `
        <div class="prod-card" style="animation:fadeIn 0.3s ease;" onclick="openProductDetail('${key}')">
          ${p.disc > 0 ? `<div class="prod-badge disc-badge">-${p.disc}%</div>` : ''}
          <img src="${p.img}" alt="${p.name}" class="prod-img" style="object-fit:cover;" />
          <div class="prod-info">
            <div class="prod-name">${p.name}</div>
            <div class="prod-price">${fmtPrice}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Por ${p.vendor}</div>
          </div>
        </div>
      `;
    }).join('');
    grid.innerHTML = feedHtml;
  } else {
    if (btnMiFeed) btnMiFeed.classList.remove('active');
    if (btnMisProd) btnMisProd.classList.add('active');

    // Render mis productos (vendedor)
    grid.innerHTML = `
      <div class="prod-card" onclick="openProductDetail('backpack')">
        <div class="prod-badge disc-badge">-10%</div>
        <button class="prod-edit-btn seller-only" onclick="event.stopPropagation(); openEditProductModal('backpack')" title="Editar producto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" alt="Bolso Boutique" class="prod-img" />
        <div class="prod-info">
          <div class="prod-name">Bolso Boutique</div>
          <div class="prod-price-old">$138.889</div>
          <div class="prod-price">$125.000</div>
        </div>
      </div>
      <div class="prod-card" onclick="openProductDetail('watch')">
        <button class="prod-edit-btn seller-only" onclick="event.stopPropagation(); openEditProductModal('watch')" title="Editar producto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80" alt="Reloj" class="prod-img" />
        <div class="prod-info">
          <div class="prod-name">Reloj Elitret Gold</div>
          <div class="prod-price">$345.000</div>
        </div>
      </div>
      <div class="prod-card" onclick="openProductDetail('sneaker')">
        <div class="prod-badge disc-badge">-20%</div>
        <button class="prod-edit-btn seller-only" onclick="event.stopPropagation(); openEditProductModal('sneaker')" title="Editar producto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" alt="Zapatos" class="prod-img" />
        <div class="prod-info">
          <div class="prod-name">Zapatos Deportivos</div>
          <div class="prod-price-old">$98.750</div>
          <div class="prod-price">$79.000</div>
        </div>
      </div>
    `;
  }
}

// RF84, RF103: Calificación de Vendedores tras realizar compra
let currentRatingValue = 5;
let currentVendorTarget = 'Alex Rivera';

function openRatingModal(vendorName) {
  currentVendorTarget = vendorName || 'Alex Rivera';
  const nameEl = document.getElementById('rate-vendor-name');
  if (nameEl) nameEl.textContent = currentVendorTarget;
  setVendorRating(5);
  document.getElementById('rating-modal')?.classList.add('open');
}

function closeRatingModal() {
  document.getElementById('rating-modal')?.classList.remove('open');
}

function setVendorRating(val) {
  currentRatingValue = val;
  const stars = document.querySelectorAll('#star-rating-select span');
  stars.forEach((star, idx) => {
    star.style.opacity = idx < val ? '1' : '0.3';
    star.style.transform = idx < val ? 'scale(1.1)' : 'scale(1)';
  });
}

function submitVendorRating() {
  toast(`⭐ ¡Gracias! Has calificado a ${currentVendorTarget} con ${currentRatingValue} estrellas`);
  closeRatingModal();
  if (document.getElementById('rate-comment')) {
    document.getElementById('rate-comment').value = '';
  }
}
