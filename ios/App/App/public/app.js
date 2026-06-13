/* =========================================================
   COMMERCITY — app.js (Complete Rewrite)
   ========================================================= */

// ---------- ELECTRON IPC (if running as desktop app) ----------
let ipcRenderer;
try { ipcRenderer = require('electron').ipcRenderer; } catch(e) {}

// ---------- CONSTANTS ----------
const AUTH_PAGES = ['login','registro','recuperar','restablecer','terminos'];
const APP_PAGES  = ['home','carrito','perfil','tienda','pedidos','historial','ajustes','mensajes','chat'];

const PRODUCTS = {
  watch:   { name:'Reloj Elitret Gold',    cat:'Relojes',     price:345000, stock:18, disc:0,  img:'product_watch.png',    vendor:'Juan_Giraldo', desc:'Elegante reloj dorado de colección limitada. Ideal para ocasiones especiales o como regalo de lujo.' },
  sneaker: { name:'Zapatos Deportivos',    cat:'Calzado',     price:79000,  stock:45, disc:20, img:'product_sneaker.png',  vendor:'Juan_Giraldo', desc:'Zapatillas de alto rendimiento con amortiguación avanzada, ideales para competencias de media distancia. Diseño ergonómico y materiales transpirables.' },
  earbuds: { name:'Auriculares Studio Pro',cat:'Tecnología',  price:388000, stock:12, disc:15, img:'product_earbuds.png',  vendor:'Juan_Giraldo', desc:'Auriculares inalámbricos con cancelación activa de ruido y calidad de sonido studio.' },
  backpack:{ name:'Mochila City Stealth',  cat:'Accesorios',  price:79000,  stock:30, disc:0,  img:'product_backpack.png', vendor:'Juan_Giraldo', desc:'Mochila urbana resistente al agua, con compartimentos para laptop y accesorios.' },
  cam1: { name:'Cámara DSLR Pro', cat:'Tecnología', price:2500000, stock:5, disc:0, img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', vendor:'FotoMundo', desc:'Cámara profesional DSLR para fotografía de alta calidad.' },
  lentes1: { name:'Gafas de Sol Clásicas', cat:'Accesorios', price:120000, stock:20, disc:10, img:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', vendor:'StyleCo', desc:'Gafas de sol con protección UV400 y diseño clásico.' },
  reloj2: { name:'Smartwatch V2', cat:'Tecnología', price:450000, stock:15, disc:0, img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', vendor:'TechHub', desc:'Reloj inteligente con monitor de ritmo cardíaco y notificaciones.' },
  zapatos2: { name:'Tenis Urbanos', cat:'Calzado', price:180000, stock:35, disc:0, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', vendor:'ZapaTrend', desc:'Tenis cómodos para el uso diario en la ciudad.' },
  bolso2: { name:'Bolso de Cuero', cat:'Accesorios', price:350000, stock:8, disc:0, img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', vendor:'LeatherCraft', desc:'Bolso de cuero genuino hecho a mano.' },
  audifonos2: { name:'Auriculares In-Ear', cat:'Tecnología', price:299000, stock:25, disc:10, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', vendor:'AudioMaster', desc:'Auriculares in-ear con sonido estéreo y bajos profundos.' }
};

const ORDER_DATA = [
  { buyer:'Alex Rivera',   ava:'A',  color:'#7c3aed', addr:'Calle 45 # 20-10, Apto 301',             city:'Bogotá, Cundinamarca',     prod:'Macbook Air',        qty:1, total:'$1.299.000', status:'En Camino',  date:'04 enero, 2026' },
  { buyer:'Elena Sanz',    ava:'E',  color:'#0891b2', addr:'Carrera 7 # 12-34, Apartamento 201',     city:'Medellín, Antioquia',      prod:'TV LG 45 pulgadas',  qty:4, total:'$1.900.000', status:'En Camino',  date:'25 diciembre, 2026' },
  { buyer:'Julian Thorne', ava:'J',  color:'#be185d', addr:'Av. El Poblado # 1-40',                  city:'Medellín, Antioquia',      prod:'iPhone 15 Pro',      qty:1, total:'$3.000.000', status:'Entregado',  date:'27 enero, 2026' },
  { buyer:'Marco Rossi',   ava:'MR', color:'#374151', addr:'Cra 10 # 5-30',                          city:'Cali, Valle del Cauca',    prod:'iPad Pro 11"',       qty:1, total:'$2.799.000', status:'Pendiente',  date:'07 diciembre, 2026' },
];

// ---------- CART STATE ----------
let cart = [
  { key:'sneaker', qty:1 },
  { key:'earbuds', qty:2 },
];
let pdQty = 1;
let pdKey = null;

// ---------- ROLE STATE ----------
let isSeller = false;

function setRole(seller) {
  isSeller = seller;
  if (isSeller) {
    document.body.classList.add('role-seller');
  } else {
    document.body.classList.remove('role-seller');
  }
}

// =========================================================
// LOADING SCREEN
// =========================================================
window.addEventListener('load', () => {
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

  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) {
      ls.classList.add('fade-out');
      setTimeout(() => { 
        ls.style.display = 'none'; 
        if (localStorage.getItem('commercity_logged_in') === 'true') {
          const sellerStatus = localStorage.getItem('commercity_is_seller') === 'true';
          setRole(sellerStatus);
          navigate('home');
        } else {
          navigate('login'); 
        }
      }, 500);
    } else {
      if (localStorage.getItem('commercity_logged_in') === 'true') {
        setRole(localStorage.getItem('commercity_is_seller') === 'true');
        navigate('home');
      } else {
        navigate('login');
      }
    }
  }, 2400);
});

// =========================================================
// NAVIGATION
// =========================================================
function navigate(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }

  const isAuth = AUTH_PAGES.includes(page);
  const isMobile = window.innerWidth <= 860;

  // Sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.style.display = (!isAuth && !isMobile) ? 'flex' : 'none';
    if (!isAuth && !isMobile) sidebar.style.flexDirection = 'column';
  }

  // Bottom nav - Hide when on auth pages or CHAT page
  const bnav = document.getElementById('bottom-nav');
  if (bnav) {
    bnav.classList.toggle('hidden', isAuth || page === 'chat');
  }

  // Sidebar active item
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const sideItem = document.getElementById('nav-' + page);
  if (sideItem) sideItem.classList.add('active');

  // Bottom nav active item
  document.querySelectorAll('.bnav-item').forEach(i => i.classList.remove('active'));
  const bnavItem = document.getElementById('bnav-' + page);
  if (bnavItem) bnavItem.classList.add('active');

  // Close dropdowns
  closeNotifs();
  closeMoreMenu();
  closeCatMenu();

  // Update cart badge
  updateCartBadge();

  // Render cart if navigating there
  if (page === 'carrito') renderCart();
}

// =========================================================
// AUTH HANDLERS
// =========================================================
function handleLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const pass  = document.getElementById('login-password')?.value;
  if (!email || !pass) { toast('⚠️ Completa todos los campos'); return; }
  
  // Mock logic: if email contains "vendedor", login as seller
  const seller = email.toLowerCase().includes('vendedor');
  setRole(seller);
  
  localStorage.setItem('commercity_logged_in', 'true');
  localStorage.setItem('commercity_is_seller', seller);
  
  const rem = document.getElementById('login-remember')?.checked;
  if (rem) {
    localStorage.setItem('commercity_rem_email', email);
    localStorage.setItem('commercity_rem_pass', pass);
  } else {
    localStorage.removeItem('commercity_rem_email');
    localStorage.removeItem('commercity_rem_pass');
  }
  
  toast('✅ ¡Bienvenido de vuelta!');
  setTimeout(() => navigate('home'), 900);
}

function handleRegistro() {
  const u = document.getElementById('reg-username')?.value.trim();
  const e = document.getElementById('reg-email')?.value.trim();
  const p = document.getElementById('reg-password')?.value;
  const wantToSell = document.getElementById('reg-seller')?.checked;
  if (!u || !e || !p) { toast('⚠️ Completa todos los campos'); return; }
  
  setRole(wantToSell);
  
  localStorage.setItem('commercity_logged_in', 'true');
  localStorage.setItem('commercity_is_seller', wantToSell);
  
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
  setRole(false);
  localStorage.removeItem('commercity_logged_in');
  localStorage.removeItem('commercity_is_seller');
  toast('👋 Sesión cerrada');
  setTimeout(() => navigate('login'), 700);
}

function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
}

// =========================================================
// NOTIFICATIONS
// =========================================================
function toggleNotifs(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('notifs-panel');
  if (panel) panel.classList.toggle('open');
}
function closeNotifs() {
  const panel = document.getElementById('notifs-panel');
  if (panel) panel.classList.remove('open');
}
function clearNotifs(e) {
  if (e) e.stopPropagation();
  document.querySelectorAll('.notif-row').forEach(r => r.remove());
  toast('🗑️ Notificaciones limpiadas');
}

// =========================================================
// CATEGORIES
// =========================================================
function toggleCatMenu(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('cat-dropdown');
  if (dd) dd.classList.toggle('open');
}
function closeCatMenu() {
  const dd = document.getElementById('cat-dropdown');
  if (dd) dd.classList.remove('open');
}

// =========================================================
// PRODUCT DETAIL
// =========================================================
function openProductDetail(key) {
  const p = PRODUCTS[key];
  if (!p) return;
  pdKey = key; pdQty = 1;

  document.getElementById('pd-img').src = p.img;
  document.getElementById('pd-img').alt = p.name;
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
  closePd();
  updateCartBadge();
  toast('🛒 ¡Producto agregado al carrito!');
}

// =========================================================
// CART
// =========================================================
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
        <img src="${p.img}" alt="${p.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-cat">${p.cat}</div>
          ${damt > 0 ? `<div class="cart-item-old">$${base.toLocaleString('es-CO')}</div>` : ''}
          <div class="cart-item-price">$${final.toLocaleString('es-CO')}</div>
        </div>
        <div class="cart-item-right">
          <button class="qty-btn-sm" onclick="cartQty(${idx},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn-sm" onclick="cartQty(${idx},1)">+</button>
          <button class="trash-btn" onclick="cartRemove(${idx})" title="Eliminar">🗑️</button>
        </div>
      </div>`;
  }).join('');

  updateCartSummary();
}

function cartQty(idx, d) {
  if (cart[idx]) { cart[idx].qty = Math.max(1, cart[idx].qty + d); }
  renderCart(); updateCartBadge();
}

function cartRemove(idx) {
  cart.splice(idx, 1);
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

// =========================================================
// PASARELA DE PAGO
// =========================================================
function openPasarela() {
  if (cart.length === 0) { toast('⚠️ Tu carrito está vacío'); return; }
  const total = getCartTotal();
  const fmt = '$' + total.toLocaleString('es-CO');

  document.getElementById('pas-title').textContent = 'Pasarela de Pago';
  document.getElementById('pas-lbl').textContent = 'Total a pagar';
  document.getElementById('pas-amount').textContent = fmt;
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

function processPago() {
  const num  = document.getElementById('card-num')?.value.replace(/-/g,'');
  const name = document.getElementById('card-holder')?.value.trim();
  if (!num || num.length < 8 || !name) { toast('⚠️ Completa los datos de pago'); return; }

  const btn = document.getElementById('pay-btn');
  btn.textContent = '⏳ Procesando...';
  btn.disabled = true;

  setTimeout(() => {
    const fmt = document.getElementById('pas-amount').textContent;
    document.getElementById('pas-title').textContent = '¡Pago Exitoso! ✅';
    document.getElementById('pas-lbl').textContent = 'Total ya pagado';
    document.getElementById('card-num').readOnly = true;
    document.getElementById('card-holder').readOnly = true;
    document.getElementById('pas-pay-area').style.display = 'none';
    document.getElementById('pas-done-area').style.display = 'block';
    // Clear cart
    cart = [];
    updateCartBadge();
    renderCart();
    toast('✅ ¡Pago realizado con éxito!');
  }, 1600);
}

function downloadReceipt() {
  toast('📄 Comprobante descargado');
  closePas();
}

// =========================================================
// ORDER DETAIL
// =========================================================
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

// =========================================================
// FILTER TABS
// =========================================================
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
  // (historial data is static for now)
}

// =========================================================
// ADD PRODUCT MODAL
// =========================================================
function openAddProductModal() { document.getElementById('add-prod-modal').classList.add('open'); }
function closeAddProd() { document.getElementById('add-prod-modal').classList.remove('open'); }
function closeAddProdOnOverlay(e) { if (e.target === document.getElementById('add-prod-modal')) closeAddProd(); }

function handleAddProduct(e) {
  e.preventDefault();
  const name  = document.getElementById('np-name')?.value.trim();
  const price = document.getElementById('np-price')?.value;
  if (!name || !price) { toast('⚠️ Completa los campos requeridos'); return; }

  const newId = 'prod_' + Date.now();
  const fmt = '$' + parseInt(price).toLocaleString('es-CO');
  const imgInput = document.getElementById('np-image');
  let imgHtml = '<div style="width:100%;aspect-ratio:1;background:var(--bg-input);display:flex;align-items:center;justify-content:center;font-size:48px;">📦</div>';
  let imgUrl = '';
  if (imgInput && imgInput.files && imgInput.files[0]) {
    imgUrl = URL.createObjectURL(imgInput.files[0]);
    imgHtml = `<img src="${imgUrl}" class="prod-img" />`;
  }

  // Add to global PRODUCTS dict so we can view details and add to cart
  PRODUCTS[newId] = {
    name: name,
    price: parseInt(price),
    cat: 'Otros',
    stock: 10,
    disc: 0,
    img: imgUrl,
    vendor: 'Mi Tienda',
    desc: 'Producto añadido recientemente.'
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

// =========================================================
// CHAT
// =========================================================
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

// =========================================================
// AJUSTES
// =========================================================
function savePersonalInfo() {
  const user = document.getElementById('aj-user').value.trim();
  const email = document.getElementById('aj-email').value.trim();
  if (!user || !email) { toast('⚠️ Completa los campos'); return; }
  localStorage.setItem('commercity_user', user);
  localStorage.setItem('commercity_email', email);
  
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

// =========================================================
// MORE MENU (hamburger drawer)
// =========================================================
function toggleMoreMenu() {
  document.getElementById('more-drawer')?.classList.toggle('active');
  document.getElementById('more-overlay')?.classList.toggle('active');
}
function closeMoreMenu() {
  document.getElementById('more-drawer')?.classList.remove('active');
  document.getElementById('more-overlay')?.classList.remove('active');
}

// =========================================================
// TOAST
// =========================================================
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

// =========================================================
// WINDOW CONTROLS
// =========================================================
function minimizeWindow() { if (ipcRenderer) ipcRenderer.send('minimize-window'); }
function maximizeWindow() { if (ipcRenderer) ipcRenderer.send('maximize-window'); }
function closeWindow()    { if (ipcRenderer) ipcRenderer.send('close-window'); }

// =========================================================
// GLOBAL CLICK — close dropdowns on outside click
// =========================================================
document.addEventListener('click', (e) => {
  // Notifications
  const panel = document.getElementById('notifs-panel');
  if (panel?.classList.contains('open')) {
    if (!panel.contains(e.target) && !e.target.closest('#bell-btn')) closeNotifs();
  }
  // Categories
  const catDd = document.getElementById('cat-dropdown');
  if (catDd?.classList.contains('open')) {
    if (!e.target.closest('.cat-wrap')) closeCatMenu();
  }
});

// =========================================================
// RESIZE — show/hide sidebar
// =========================================================
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

// Ensure the profile pic is loaded right away if available
loadProfilePic();

function loadPersonalInfo() {
  const user = localStorage.getItem('commercity_user');
  const email = localStorage.getItem('commercity_email');
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
}
loadPersonalInfo();

function sendChatMessage() {
  const input = document.getElementById('chat-msg-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const body = document.getElementById('chat-body');
  if (body) {
    const html = `
      <div class="msg-wrap outgoing">
        <div class="msg-bubble">${val}</div>
        <div class="msg-time">Ahora</div>
      </div>
    `;
    body.insertAdjacentHTML('beforeend', html);
    body.scrollTop = body.scrollHeight;
  }
  input.value = '';
}

// Infinite scroll simulation for Explorar
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


// =========================================================
// FOLLOWERS / FOLLOWING MODAL
// =========================================================
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
  // Update active tab
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

// =========================================================
// EDIT PRODUCT MODAL (solo perfil vendedor)
// =========================================================
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

  // Reset image preview
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
  const price = parseInt(document.getElementById('ep-price')?.value) || 0;
  const stock = parseInt(document.getElementById('ep-stock')?.value) || 0;
  const disc  = parseInt(document.getElementById('ep-disc')?.value) || 0;
  const cat   = document.getElementById('ep-cat')?.value.trim();

  if (!name || !price) { toast('⚠️ Completa los campos requeridos'); return; }

  // Update the product in memory
  PRODUCTS[editProductKey] = { ...PRODUCTS[editProductKey], name, desc, price, stock, disc, cat };

  // Update the card in the profile grid
  const grid = document.getElementById('perfil-prod-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.prod-card');
    cards.forEach(card => {
      // Find the card that matches (by onclick attribute)
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
