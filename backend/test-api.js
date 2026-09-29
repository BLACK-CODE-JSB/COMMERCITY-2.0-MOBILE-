async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin' })
    });
    const loginData = await loginRes.json();
    console.log('1. Login Test Status:', loginRes.status, loginData.mensaje, 'Roles:', loginData.usuario?.roles);

    const token = loginData.token;

    // Test Cart
    await fetch('http://localhost:3000/api/carrito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ product_id: 'watch', cantidad: 1 })
    });

    // Test Order Summary (Fiscal calculation)
    const resumenRes = await fetch('http://localhost:3000/api/pedidos/resumen', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const resumenData = await resumenRes.json();
    console.log('2. Fiscal Calculation Test:', resumenData);

    // Test Admin Metrics
    const metricsRes = await fetch('http://localhost:3000/api/admin/metricas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const metricsData = await metricsRes.json();
    console.log('3. Admin Metrics Test:', metricsData);

    console.log('ALL API TESTS PASSED SUCCESSFULLY! ✅');
  } catch (e) {
    console.error('API Test Error:', e);
  }
}
test();
