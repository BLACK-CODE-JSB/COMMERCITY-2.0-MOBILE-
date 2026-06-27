const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('www/index.html', 'utf8');

// For Sidebar Cart
html = html.replace('<span class="nav-icon">🛒</span> Carrito', '<span class="nav-icon" style="position:relative">🛒<span class="cart-dot" id="nav-cart-dot" style="display:none;right:-2px;top:0;"></span></span> Carrito');

// For Bottom Nav Cart
html = html.replace('<span class="bnav-ico">🛒</span><span class="bnav-lbl">Carrito</span>', '<span class="bnav-ico" style="position:relative">🛒<span class="cart-dot" id="bnav-cart-dot" style="display:none;"></span></span><span class="bnav-lbl">Carrito</span>');

fs.writeFileSync('www/index.html', html);

// 2. Update app.js
let js = fs.readFileSync('www/app.js', 'utf8');

const updateCartBadgeReplacement = `function updateCartBadge() {
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
}`;

js = js.replace(/function updateCartBadge\(\) \{[\s\S]*?\n\}/, updateCartBadgeReplacement);

fs.writeFileSync('www/app.js', js);
console.log('Done updating cart dot');
