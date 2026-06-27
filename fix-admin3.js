const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// 1. Cambiar el botón "Volver" del panel de administración a solo flecha (icono SVG)
html = html.replace(
  /<button id="btn-admin-volver" class="btn-ghost" style="padding: 4px 12px; color: var\(--text\);" onclick="navigate\('home'\)">← Volver<\/button>/g,
  `<button id="btn-admin-volver" class="icon-btn" style="width:34px;height:34px;" onclick="navigate('home')">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  </button>`
);

// 2. Reorganizar los reportes - usar función para reemplazar cada reporte individualmente
function improveReportCard(match) {
  // Determinar tipo y color del badge
  const isUser = match.includes('Usuario');
  const badgeType = isUser ? 'Usuario' : 'Producto';
  const badgeColor = isUser ? 'badge-red' : '';
  const badgeStyle = isUser ? '' : 'color:#3b82f6;border-color:#3b82f6;';
  
  // Extraer título del reporte
  let title, motive;
  if (isUser) {
    if (match.includes('Julian Guerrero')) {
      title = 'Julian Guerrero';
      motive = 'Comportamiento inusual';
    } else if (match.includes('Mario Alberto')) {
      title = 'Mario Alberto';
      motive = 'El vendedor me trató de forma irrespetuosa...';
    }
  } else {
    title = 'Teclado Gamer Pro';
    motive = 'Producto defectuoso';
  }
  
  // Extraer estado y fecha
  const isResuelto = match.includes('Resuelto');
  const estado = isResuelto ? 'Resuelto' : 'Pendiente';
  const badgeEstado = isResuelto ? 'badge-green' : 'badge-red';
  const btnText = isResuelto ? 'Ver' : 'Responder';
  const btnColor = isResuelto ? '' : '';
  
  return `<div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('${badgeType}', '${title.includes('Mario') ? 'Mario Alberto - Vendedor' : title}', '${isUser ? 'Sistema' : 'Cliente'}', '${match.includes('Comportamiento') ? 'Comportamiento inusual' : match.includes('defectuoso') ? 'Producto defectuoso' : match.includes('irrespetuosa') ? 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación.' : ''}', '${match.includes('24 Oct') ? '24 Oct, 2026' : match.includes('22 Oct') ? '22 Oct, 2026' : '20 Oct, 2026'}', '${estado}')">
              <div class="admin-card-left" style="flex:1; flex-direction:column; align-items:flex-start;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span class="badge ${badgeColor} outline" style="${badgeStyle}">${badgeType}</span>
                  <div class="admin-card-title">${title}</div>
                </div>
                <div class="admin-card-sub" style="max-width:100%;">${motive}</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">${match.includes('24 Oct') ? '24 Oct, 2026' : match.includes('22 Oct') ? '22 Oct, 2026' : '20 Oct, 2026'}</div>
                <span class="badge ${badgeEstado}">${estado}</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('${btnText}', null); openAdminReportDetail('${badgeType}', '${title.includes('Mario') ? 'Mario Alberto - Vendedor' : title}', '${isUser ? 'Sistema' : 'Cliente'}', '${match.includes('Comportamiento') ? 'Comportamiento inusual' : match.includes('defectuoso') ? 'Producto defectuoso' : 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación.'}', '${match.includes('24 Oct') ? '24 Oct, 2026' : match.includes('22 Oct') ? '22 Oct, 2026' : '20 Oct, 2026'}', '${estado}')">${btnText}</button>
              </div>
            </div>`;
}

// Reemplazar cada reporte individualmente con su contenido completo
const reporteJulián = `<div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail\('Usuario', 'Julian Guerrero', 'Sistema', 'Comportamiento inusual', '24 Oct, 2026', 'Pendiente'\)">
              <div class="admin-card-left" style="flex:1;">
                <span class="badge badge-red outline" style="margin-right:12px;">Usuario</span>
                <div class="admin-card-title">Julian Guerrero</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">24 Oct, 2026</div>
                <span class="badge badge-red">Pendiente</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event\.stopPropagation\(\); currentAdminTarget=this\.closest\('.admin-list-card'\); currentAdminTarget=this\.closest\('.admin-list-card'\) \|\| currentAdminTarget; adminAction\('Responder', null\); openAdminReportDetail\('Usuario', 'Julian Guerrero', 'Sistema', 'Comportamiento inusual', '24 Oct, 2026', 'Pendiente'\)">Responder</button>
              </div>
            </div>`;

html = html.replace(reporteJulián, improveReportCard('Julian'));

const reporteTeclado = `<div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail\('Producto', 'Teclado Gamer Pro', 'Cliente', 'Producto defectuoso', '22 Oct, 2026', 'Resuelto'\)">
              <div class="admin-card-left" style="flex:1;">
                <span class="badge outline" style="color:#3b82f6;border-color:#3b82f6;margin-right:12px;">Producto</span>
                <div class="admin-card-title">Teclado Gamer Pro</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">22 Oct, 2026</div>
                <span class="badge badge-green">Resuelto</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event\.stopPropagation\(\); currentAdminTarget=this\.closest\('.admin-list-card'\); currentAdminTarget=this\.closest\('.admin-list-card'\) \|\| currentAdminTarget; adminAction\('Ver', null\); openAdminReportDetail\('Producto', 'Teclado Gamer Pro', 'Cliente', 'Producto defectuoso', '22 Oct, 2026', 'Resuelto'\)">Ver</button>
              </div>
            </div>`;

html = html.replace(reporteTeclado, improveReportCard('Teclado'));

const reporteMario = `<div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail\('Usuario', 'Mario Alberto - Vendedor', 'Alexa Perez - Comprador', 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación\.', '20 Oct, 2026', 'Pendiente'\)">
              <div class="admin-card-left" style="flex:1;">
                <span class="badge badge-red outline" style="margin-right:12px;">Usuario</span>
                <div class="admin-card-title">Mario Alberto</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">20 Oct, 2026</div>
                <span class="badge badge-red">Pendiente</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event\.stopPropagation\(\); currentAdminTarget=this\.closest\('.admin-list-card'\); currentAdminTarget=this\.closest\('.admin-list-card'\) \|\| currentAdminTarget; adminAction\('Responder', null\); openAdminReportDetail\('Usuario', 'Mario Alberto - Vendedor', 'Alexa Perez - Comprador', 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación\.', '20 Oct, 2026', 'Pendiente'\)">Responder</button>
              </div>
            </div>`;

html = html.replace(reporteMario, improveReportCard('Mario'));

fs.writeFileSync(indexFile, html, 'utf8');
console.log('index.html actualizado: botón volver simplificado y reportes reorganizados');