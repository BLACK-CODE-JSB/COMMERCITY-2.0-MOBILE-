import subprocess

# Get the pristine file from git directly in Python to avoid powershell encoding issues
out = subprocess.check_output(['git', 'show', 'HEAD:www/index.html'])
content = out.decode('utf-8')

# 1. Update images to Unsplash URLs
replacements = {
    'hero.png': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    'product_watch.png': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80',
    'product_sneaker.png': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    'product_earbuds.png': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    'product_backpack.png': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    'products_grid.png': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# 2. Add profile description
content = content.replace(
    '<div class="perfil-name">juan_giraldo</div>\n            <div class="perfil-stars">',
    '<div class="perfil-name">juan_giraldo</div>\n            <div class="perfil-desc" id="perfil-desc" style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Hola,Soy nuevo</div>\n            <div class="perfil-stars">'
)

# 3. Add description field to ajustes section
content = content.replace(
    '<p class="aj-section-sub">Actualiza tu usuario y correo electrónico</p>\n          <div class="input-group"><label>Usuario</label><input type="text" value="juan_Giraldo" id="aj-user" /></div>\n          <div class="input-group"><label>Correo electrónico</label><input type="email" value="Juan_commercity@gmail.com" id="aj-email" /></div>\n          <button class="btn-orange" style="width:auto;padding:10px 20px;" onclick="savePersonalInfo()">Guardar Cambios</button>',
    '<p class="aj-section-sub">Actualiza tu usuario, correo electrónico y descripción</p>\n          <div class="input-group"><label>Usuario</label><input type="text" value="juan_Giraldo" id="aj-user" /></div>\n          <div class="input-group"><label>Correo electrónico</label><input type="email" value="Juan_commercity@gmail.com" id="aj-email" /></div>\n          <div class="input-group"><label>Descripción del perfil</label><textarea id="aj-desc" class="textarea-input" style="min-height:60px;">Hola,Soy nuevo</textarea></div>\n          <button class="btn-orange" style="width:auto;padding:10px 20px;" onclick="savePersonalInfo()">Guardar Cambios</button>'
)

# 4. Fix chat Reportar button
content = content.replace(
    '<button class="chat-pill-btn chat-pill-reportar" title="Reportar">',
    '<button class="chat-pill-btn chat-pill-reportar" title="Reportar" onclick="openReportModal()">'
)

# 5. Fix product detail header (remove 3 dots, add Reportar button)
content = content.replace(
    '<button class="btn-back-sm-new" onclick="closePd()">← Volver</button>\n          <button class="icon-btn-tiny-new">⋮</button>',
    '<button class="btn-ghost" style="padding:4px 10px; font-size:11px; border:1px solid rgba(255,255,255,0.2); border-radius:16px; margin-right:8px;" onclick="openReportModal()">Reportar</button>\n          <button class="btn-back-sm-new" onclick="closePd()">← Volver</button>'
)

# 6. Add the Report modal before ADD PRODUCT MODAL
report_modal = '''
  <!-- REPORT MODAL -->
  <div class="modal-overlay" id="report-modal" onclick="closeReportOnOverlay(event)">
    <div class="modal-box" style="padding:20px; max-width:400px; width:90%; background:#1E1E1E; border:1px solid rgba(255,255,255,0.1); border-radius:12px;">
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; font-weight: 600; color: #fff; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">MOTIVO</label>
        <textarea id="report-reason" placeholder="Describe el motivo del reporte..." style="width: 100%; min-height: 80px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; color: #fff; font-family: inherit; font-size: 13px; resize: none;"></textarea>
      </div>
      <div style="margin-bottom: 24px;">
        <label style="font-size: 11px; font-weight: 600; color: #fff; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">EVIDENCIA</label>
        <div style="width: 100%; height: 80px; background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
          <span style="font-size: 16px; margin-bottom: 4px; color: var(--orange);">📤</span>
          <span style="font-size: 12px; color: #aaa;">Haz click para subir tus archivos aquí</span>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn-ghost" style="padding: 8px 16px; font-size: 13px; background: transparent; color: #fff; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;" onclick="closeReportModal()">Cancelar</button>
        <button class="btn-primary" style="padding: 8px 16px; font-size: 13px; background: var(--orange); color: #000; border-radius: 20px; border: none; font-weight: 600;" onclick="submitReportModal()">Enviar reporte</button>
      </div>
    </div>
  </div>

'''

if '<!-- REPORT MODAL -->' not in content:
    content = content.replace('  <!-- ADD PRODUCT MODAL -->', report_modal + '  <!-- ADD PRODUCT MODAL -->')

# 7. Update Carrito de Compras title
old_title = '''        <div class="page-section-title">
          <span style="font-size:22px;">🛒</span>
          <h2>Carrito de Compras</h2>
        </div>'''
new_title = '''        <div class="page-section-title" style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h3l2.5 12h11L21 6H6" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
          </div>
          <h2 style="color:#F5A623; font-weight:800; margin:0; font-size:22px; letter-spacing:-0.5px;">Carrito de Compras</h2>
        </div>'''
if old_title in content:
    content = content.replace(old_title, new_title)

# Write back to www/index.html safely
with open(r'www\index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("Restoration complete.")
