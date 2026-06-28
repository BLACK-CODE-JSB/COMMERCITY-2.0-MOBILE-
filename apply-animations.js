const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
const appFile = path.join(__dirname, 'www', 'app.js');
const styleFile = path.join(__dirname, 'www', 'style.css');

let html = fs.readFileSync(indexFile, 'utf8');
let appJs = fs.readFileSync(appFile, 'utf8');
let css = fs.readFileSync(styleFile, 'utf8');

if (!html.includes('id="notifs-overlay"')) {
  html = html.replace('<div class="notifs-panel"', '<div class="notifs-overlay" id="notifs-overlay" onclick="closeNotifs()"></div>\n<div class="notifs-panel"');
}

css = css.replace(/\.notifs-panel\s*\{[^}]*\}/g, '');
css = css.replace(/\.notifs-panel\.open\s*\{[^}]*\}/g, '');
css = css.replace(/\.notifs-overlay\s*\{[^}]*\}/g, '');
css = css.replace(/\.notifs-overlay\.open\s*\{[^}]*\}/g, '');

css += `
.notifs-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9998; }
.notifs-overlay.open { display: block; animation: fadeIn 0.3s ease forwards; }

.notifs-panel {
  display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 10000;
  background: var(--bg-card); border-top: 1px solid var(--border);
  border-radius: 20px 20px 0 0; box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  max-height: 80vh; overflow-y: auto; padding-bottom: 20px;
}
.notifs-panel.open { display: block; animation: slideUpBottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }

@keyframes slideUpBottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
`;

if (!appJs.includes(`document.getElementById('notifs-overlay').classList`)) {
  appJs = appJs.replace(/const panel = document\.getElementById\('notifs-panel'\);\s*if \(panel\) panel\.classList\.toggle\('open'\);/g, `const panel = document.getElementById('notifs-panel');\n  const overlay = document.getElementById('notifs-overlay');\n  if (panel) { panel.classList.toggle('open'); if (overlay) overlay.classList.toggle('open'); }`);
  appJs = appJs.replace(/const panel = document\.getElementById\('notifs-panel'\);\s*if \(panel\) panel\.classList\.remove\('open'\);/g, `const panel = document.getElementById('notifs-panel');\n  const overlay = document.getElementById('notifs-overlay');\n  if (panel) panel.classList.remove('open');\n  if (overlay) overlay.classList.remove('open');`);
}

if (!css.includes('.page-enter')) {
  css += `
.page { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow-y: auto; overflow-x: hidden; z-index: 1; background: var(--bg); display: none; }
.page.active { display: block; }
.page.page-enter { animation: pageSlideIn 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards; z-index: 5; }
.page.page-exit { display: block; animation: pageSlideOut 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards; z-index: 1; }

@keyframes pageSlideIn {
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes pageSlideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30px); opacity: 0; }
}
`;
}

const navRegex = /function navigate\(page\)\s*\{[\s\S]*?\/\/ Render cart if navigating there\s*if \(page === 'carrito'\) renderCart\(\);\s*\}/;

if (!appJs.includes('page-enter')) {
  appJs = appJs.replace(navRegex, `function navigate(page) {
  if (page === 'admin' && !isAdmin) {
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
  const isMobile = window.innerWidth <= 860;

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.style.display = (!isAuth && !isMobile) ? 'flex' : 'none';
    if (!isAuth && !isMobile) sidebar.style.flexDirection = 'column';
  }

  const bnav = document.getElementById('bottom-nav');
  if (bnav) {
    bnav.classList.toggle('hidden', isAuth || page === 'chat' || page === 'admin');
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
  if (page === 'carrito') renderCart();
}`);
}

fs.writeFileSync(indexFile, html, 'utf8');
fs.writeFileSync(appFile, appJs, 'utf8');
fs.writeFileSync(styleFile, css, 'utf8');

console.log('Animations and notifications bottom sheet fixed!');
