const express = require('express');
const router = express.Router();
const { memoryDb } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/pedidos/resumen (Cálculo fiscal lado servidor)
router.get('/resumen', (req, res) => {
  const userId = req.user.id;
  const userCart = memoryDb.carts[userId] || [];

  let subtotal = 0;
  userCart.forEach(item => {
    const prod = memoryDb.products.find(p => String(p.id) === String(item.product_id));
    if (prod) {
      const unitPrice = prod.disc ? Math.round(prod.price * (1 - prod.disc / 100)) : prod.price;
      subtotal += unitPrice * item.cantidad;
    }
  });

  // Si el carrito está vacío pero se consulta, monto base 0 o fallback
  const iva = Math.round(subtotal * 0.19); // 19% IVA colombiano
  const comision_plataforma = Math.round(subtotal * 0.10); // 10% Comisión de plataforma retenida al vendedor
  const total = subtotal + iva;

  return res.json({
    subtotal,
    iva,
    comision_plataforma,
    total,
    moneda: 'COP',
    impuesto_tasa: '19%',
    comision_tasa: '10%'
  });
});

// POST /api/pedidos/confirmar-pago
router.post('/confirmar-pago', (req, res) => {
  const userId = req.user.id;
  const { metodo_pago, datos_transaccion, direccion_entrega } = req.body;
  const userCart = memoryDb.carts[userId] || [];

  if (userCart.length === 0) {
    return res.status(400).json({ mensaje: 'No hay productos en el carrito para procesar.' });
  }

  let subtotal = 0;
  const itemsComprados = [];

  userCart.forEach(item => {
    const prod = memoryDb.products.find(p => String(p.id) === String(item.product_id));
    if (prod) {
      const unitPrice = prod.disc ? Math.round(prod.price * (1 - prod.disc / 100)) : prod.price;
      subtotal += unitPrice * item.cantidad;
      // Descontar inventario
      prod.stock = Math.max(0, prod.stock - item.cantidad);
      itemsComprados.push({ name: prod.name, qty: item.cantidad, unitPrice });
    }
  });

  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;
  const orderId = Math.floor(1000 + Math.random() * 9000);

  const newOrder = {
    id: orderId,
    buyer: req.user.nombre || 'Usuario CommerCity',
    prod: itemsComprados.map(i => `${i.name} (x${i.qty})`).join(', ') || 'Productos Varios',
    qty: itemsComprados.reduce((acc, c) => acc + c.qty, 0),
    total,
    status: 'En Camino',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
    metodo_pago: metodo_pago || 'Tarjeta',
    direccion: direccion_entrega || 'Dirección registrada'
  };

  memoryDb.orders.unshift(newOrder);
  // Vaciar carrito
  memoryDb.carts[userId] = [];

  return res.status(201).json({
    mensaje: 'Pago procesado y pedido generado exitosamente',
    pedido_id: orderId,
    comprobante: `REC-${orderId}`,
    estado: 'APROBADO',
    detalles: newOrder
  });
});

module.exports = router;
