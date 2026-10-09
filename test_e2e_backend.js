const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Iniciando pruebas E2E contra Backend Central (' + BASE_URL + ')...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const health = await fetch(`${BASE_URL}/api/health`).then(r => r.json());
    assert(health.status === 'ONLINE', '1. GET /api/health responde ONLINE');
  } catch (e) {
    console.error('Error conectando con el backend:', e.message);
    process.exit(1);
  }

  // 2. Registro (POST /api/usuarios/register)
  let token = null;
  const testEmail = `test_${Date.now()}@commercity.com`;
  try {
    const regRes = await fetch(`${BASE_URL}/api/usuarios/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Usuario Prueba E2E',
        email: testEmail,
        password: 'password123',
        solicita_vendedor: true
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, '2. POST /api/usuarios/register crea usuario y entrega token');
  } catch (e) {
    assert(false, '2. POST /api/usuarios/register: ' + e.message);
  }

  // 3. Login (POST /api/usuarios/login)
  try {
    const loginRes = await fetch(`${BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    assert(loginRes.status === 200 && token, '3. POST /api/usuarios/login autentica y entrega JWT');
  } catch (e) {
    assert(false, '3. POST /api/usuarios/login: ' + e.message);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 4. Perfil del usuario (GET /api/usuarios/me)
  try {
    const meRes = await fetch(`${BASE_URL}/api/usuarios/me`, { headers: authHeaders });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.email === testEmail, '4. GET /api/usuarios/me retorna perfil autenticado');
  } catch (e) {
    assert(false, '4. GET /api/usuarios/me: ' + e.message);
  }

  // 5. Catálogo de productos (GET /api/productos)
  let testProductId = null;
  try {
    const prodRes = await fetch(`${BASE_URL}/api/productos`);
    const prodData = await prodRes.json();
    const prods = prodData.data || prodData.productos || [];
    assert(prodRes.status === 200 && prods.length > 0, `5. GET /api/productos lista catálogo (${prods.length} productos)`);
    if (prods.length > 0) testProductId = prods[0].id;
  } catch (e) {
    assert(false, '5. GET /api/productos: ' + e.message);
  }

  // 6. Carrito: Agregar producto (POST /api/carrito)
  try {
    const addRes = await fetch(`${BASE_URL}/api/carrito`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ product_id: testProductId || 'watch', cantidad: 2 })
    });
    const addData = await addRes.json();
    assert(addRes.status === 200, '6. POST /api/carrito agrega producto al carrito');
  } catch (e) {
    assert(false, '6. POST /api/carrito: ' + e.message);
  }

  // 7. Carrito: Ver contenido (GET /api/carrito)
  try {
    const getCartRes = await fetch(`${BASE_URL}/api/carrito`, { headers: authHeaders });
    const getCartData = await getCartRes.json();
    assert(getCartRes.status === 200 && getCartData.items.length > 0, `7. GET /api/carrito retorna ítems (${getCartData.items.length} ítems)`);
  } catch (e) {
    assert(false, '7. GET /api/carrito: ' + e.message);
  }

  // 8. Resumen fiscal de Checkout (GET /api/pedidos/resumen)
  try {
    const resumenRes = await fetch(`${BASE_URL}/api/pedidos/resumen`, { headers: authHeaders });
    const resumenData = await resumenRes.json();
    assert(resumenRes.status === 200 && resumenData.total > 0 && resumenData.iva > 0, `8. GET /api/pedidos/resumen calcula subtotal=$${resumenData.subtotal}, IVA=$${resumenData.iva}, total=$${resumenData.total}`);
  } catch (e) {
    assert(false, '8. GET /api/pedidos/resumen: ' + e.message);
  }

  // 9. Confirmar Pago de Pedido (POST /api/pedidos/confirmar-pago)
  try {
    const pagoRes = await fetch(`${BASE_URL}/api/pedidos/confirmar-pago`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        metodo_pago: 'tarjeta',
        datos_transaccion: { numero: '4532********1234', franquicia: 'VISA' },
        direccion_entrega: 'Cra 15 # 85-32, Bogotá'
      })
    });
    const pagoData = await pagoRes.json();
    assert((pagoRes.status === 200 || pagoRes.status === 201) && (pagoData.pedido_id || pagoData.exito), `9. POST /api/pedidos/confirmar-pago procesa el pago exitosamente (Pedido #${pagoData.pedido_id})`);
  } catch (e) {
    assert(false, '9. POST /api/pedidos/confirmar-pago: ' + e.message);
  }

  // 10. Recuperación de contraseña RF4 (POST /api/usuarios/recover & POST /api/usuarios/reset-password)
  try {
    const recRes = await fetch(`${BASE_URL}/api/usuarios/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const recData = await recRes.json();
    assert(recRes.status === 200 && recData.token, '10a. POST /api/usuarios/recover genera token temporal de 5 min');

    const resetRes = await fetch(`${BASE_URL}/api/usuarios/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: recData.token, password: 'new_super_password_456' })
    });
    const resetData = await resetRes.json();
    assert(resetRes.status === 200 && resetData.exito, '10b. POST /api/usuarios/reset-password actualiza la clave usando token de 5 min');
  } catch (e) {
    assert(false, '10. Flujo recuperación contraseña: ' + e.message);
  }

  // 11. Métricas Admin (GET /api/admin/stats)
  try {
    // Iniciar sesión con credencial admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;

    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.ventas_totales !== undefined, '11. GET /api/admin/stats retorna métricas administrativas');
  } catch (e) {
    assert(false, '11. GET /api/admin/stats: ' + e.message);
  }

  // 12. Tienda Dashboard Stats & Ventas (GET /api/tienda/dashboard/stats & GET /api/tienda/ventas)
  try {
    const dashRes = await fetch(`${BASE_URL}/api/tienda/dashboard/stats`, { headers: authHeaders });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200 && dashData.ingresos_brutos !== undefined, '12a. GET /api/tienda/dashboard/stats retorna analítica de vendedor');

    const ventasRes = await fetch(`${BASE_URL}/api/tienda/ventas?estado=todos`, { headers: authHeaders });
    const ventasData = await ventasRes.json();
    assert(ventasRes.status === 200 && Array.isArray(ventasData.pedidos || ventasData.ventas), '12b. GET /api/tienda/ventas filtra historial por estado');
  } catch (e) {
    assert(false, '12. Tienda endpoints: ' + e.message);
  }

  // 13. Chat: Enviar mensaje con id en el body (POST /api/chat)
  try {
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ id: 2, mensaje: '¡Hola! Este es un mensaje de prueba con ID en body.' })
    });
    const chatData = await chatRes.json();
    assert(chatRes.status === 201 && chatData.mensaje, '13. POST /api/chat envía mensaje con partner id en body');
  } catch (e) {
    assert(false, '13. POST /api/chat: ' + e.message);
  }

  // 14. Notificaciones: Marcar como leídas (PATCH /api/notificaciones/leidas)
  try {
    const notifsRes = await fetch(`${BASE_URL}/api/notificaciones/leidas`, {
      method: 'PATCH',
      headers: authHeaders
    });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200, '14. PATCH /api/notificaciones/leidas marca notificaciones');
  } catch (e) {
    assert(false, '14. PATCH /api/notificaciones/leidas: ' + e.message);
  }

  console.log(`\n========================================`);
  console.log(`🏁 RESUMEN: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
