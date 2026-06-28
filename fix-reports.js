const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const reportesOriginal = `<div class="admin-section" id="admin-sec-reportes">
          <div class="admin-section-header">
            <h3>Gestión de Reportes</h3>
            <div class="tb-search admin-search">
              <span>🔍</span>
              <input type="text" placeholder="Buscar Reportes" id="admin-search-reps" onkeyup="filterAdminList('admin-search-reps', '.admin-rep-card')" />
            </div>
          </div>
          <div class="filter-tabs" style="margin-bottom:16px;">
            <button class="ftab active">Todo</button>
            <button class="ftab">Pendiente</button>
            <button class="ftab">Resuelto</button>
          </div>
          <div class="admin-list">
            <div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('Usuario', 'Julian Guerrero', 'Sistema', 'Comportamiento inusual', '24 Oct, 2026', 'Pendiente')">
              <div class="admin-card-left" style="flex:1;">
                <span class="badge badge-red outline" style="margin-right:12px;">Usuario</span>
                <div class="admin-card-title">Julian Guerrero</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">24 Oct, 2026</div>
                <span class="badge badge-red">Pendiente</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card'); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('Responder', null); openAdminReportDetail('Usuario', 'Julian Guerrero', 'Sistema', 'Comportamiento inusual', '24 Oct, 2026', 'Pendiente')">Responder</button>
              </div>
            </div>

            <div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('Producto', 'Teclado Gamer Pro', 'Cliente', 'Producto defectuoso', '22 Oct, 2026', 'Resuelto')">
              <div class="admin-card-left" style="flex:1;">
                <span class="badge outline" style="color:#3b82f6;border-color:#3b82f6;margin-right:12px;">Producto</span>
                <div class="admin-card-title">Teclado Gamer Pro</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">22 Oct, 2026</div>
                <span class="badge badge-green">Resuelto</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card'); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('Ver', null); openAdminReportDetail('Producto', 'Teclado Gamer Pro', 'Cliente', 'Producto defectuoso', '22 Oct, 2026', 'Resuelto')">Ver</button>
              </div>
            </div>

            <div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('Usuario', 'Mario Alberto - Vendedor', 'Alexa Perez - Comprador', 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación.', '20 Oct, 2026', 'Pendiente')">
              <div class="admin-card-left" style="flex:1;">
                <span class="badge badge-red outline" style="margin-right:12px;">Usuario</span>
                <div class="admin-card-title">Mario Alberto</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">20 Oct, 2026</div>
                <span class="badge badge-red">Pendiente</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card'); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('Responder', null); openAdminReportDetail('Usuario', 'Mario Alberto - Vendedor', 'Alexa Perez - Comprador', 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación.', '20 Oct, 2026', 'Pendiente')">Responder</button>
              </div>
            </div>
          </div>
        </div>`;

const reportesNueva = `<div class="admin-section" id="admin-sec-reportes">
          <div class="admin-section-header">
            <h3>Gestión de Reportes</h3>
            <div class="tb-search admin-search">
              <span>🔍</span>
              <input type="text" placeholder="Buscar Reportes" id="admin-search-reps" onkeyup="filterAdminList('admin-search-reps', '.admin-rep-card')" />
            </div>
          </div>
          <div class="filter-tabs" style="margin-bottom:16px;">
            <button class="ftab active">Todo</button>
            <button class="ftab">Pendiente</button>
            <button class="ftab">Resuelto</button>
          </div>
          <div class="admin-list">
            <div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('Usuario', 'Julian Guerrero', 'Sistema', 'Comportamiento inusual', '24 Oct, 2026', 'Pendiente')">
              <div class="admin-card-left" style="flex:1; flex-direction:column; align-items:flex-start;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span class="badge badge-red outline">Usuario</span>
                  <div class="admin-card-title">Julian Guerrero</div>
                </div>
                <div class="admin-card-sub" style="max-width:100%;">Comportamiento inusual</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">24 Oct, 2026</div>
                <span class="badge badge-red">Pendiente</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('Responder', null); openAdminReportDetail('Usuario', 'Julian Guerrero', 'Sistema', 'Comportamiento inusual', '24 Oct, 2026', 'Pendiente')">Responder</button>
              </div>
            </div>

            <div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('Producto', 'Teclado Gamer Pro', 'Cliente', 'Producto defectuoso', '22 Oct, 2026', 'Resuelto')">
              <div class="admin-card-left" style="flex:1; flex-direction:column; align-items:flex-start;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span class="badge outline" style="color:#3b82f6;border-color:#3b82f6;">Producto</span>
                  <div class="admin-card-title">Teclado Gamer Pro</div>
                </div>
                <div class="admin-card-sub" style="max-width:100%;">Producto defectuoso</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">22 Oct, 2026</div>
                <span class="badge badge-green">Resuelto</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('Ver', null); openAdminReportDetail('Producto', 'Teclado Gamer Pro', 'Cliente', 'Producto defectuoso', '22 Oct, 2026', 'Resuelto')">Ver</button>
              </div>
            </div>

            <div class="admin-list-card admin-rep-card" onclick="currentAdminTarget=this; openAdminReportDetail('Usuario', 'Mario Alberto - Vendedor', 'Alexa Perez - Comprador', 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación.', '20 Oct, 2026', 'Pendiente')">
              <div class="admin-card-left" style="flex:1; flex-direction:column; align-items:flex-start;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span class="badge badge-red outline">Usuario</span>
                  <div class="admin-card-title">Mario Alberto</div>
                </div>
                <div class="admin-card-sub" style="max-width:100%;">El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo...</div>
              </div>
              <div class="admin-card-right">
                <div class="admin-card-sub">20 Oct, 2026</div>
                <span class="badge badge-red">Pendiente</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('Responder', null); openAdminReportDetail('Usuario', 'Mario Alberto - Vendedor', 'Alexa Perez - Comprador', 'El vendedor me trató de forma irrespetuosa y utilizó lenguaje ofensivo durante nuestra conversación.', '20 Oct, 2026', 'Pendiente')">Responder</button>
              </div>
            </div>
          </div>
        </div>`;

html = html.replace(reportesOriginal, reportesNueva);

fs.writeFileSync(indexFile, html, 'utf8');
console.log('index.html actualizado: reportes reorganizados');
