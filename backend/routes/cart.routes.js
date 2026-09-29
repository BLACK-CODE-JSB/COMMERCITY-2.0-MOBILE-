const express = require('express');
const router = express.Router();
const { memoryDb } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Todas las rutas de carrito requieren usuario autenticado
router.use(verifyToken);

// GET /api/carrito
router.get('/', (req, res) => {
  const userId = req.user.id;
  const userCart = memoryDb.carts[userId] || [];

  const items = userCart.map((item, index) => {
    const prod = memoryDb.products.find(p => String(p.id) === String(item.product_id)) || {
      id: item.product_id,
      name: 'Producto',
      price: 50000,
      img: ''
    };
    const finalPrice = prod.disc ? Math.round(prod.price * (1 - prod.disc / 100)) : prod.price;
    return {
      id_item: index + 1,
      product_id: item.product_id,
      name: prod.name,
      price: finalPrice,
      img: prod.img,
      cantidad: item.cantidad,
      subtotal: finalPrice * item.cantidad
    };
  });

  const total = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  return res.json({ items, total, cantidad_total: items.reduce((acc, c) => acc + c.cantidad, 0) });
});

// POST /api/carrito
router.post('/', (req, res) => {
  const userId = req.user.id;
  const { product_id, cantidad } = req.body;

  if (!product_id) return res.status(400).json({ mensaje: 'product_id es requerido' });
  const qty = Number(cantidad) || 1;

  if (!memoryDb.carts[userId]) memoryDb.carts[userId] = [];
  const existing = memoryDb.carts[userId].find(i => String(i.product_id) === String(product_id));

  if (existing) {
    existing.cantidad += qty;
  } else {
    memoryDb.carts[userId].push({ product_id, cantidad: qty });
  }

  return res.json({ mensaje: 'Producto agregado al carrito', cart: memoryDb.carts[userId] });
});

// PATCH /api/carrito/:id_item
router.patch('/:id_item', (req, res) => {
  const userId = req.user.id;
  const { cantidad } = req.body;
  const itemIndex = Number(req.params.id_item) - 1;

  const userCart = memoryDb.carts[userId] || [];
  if (itemIndex < 0 || itemIndex >= userCart.length) {
    return res.status(404).json({ mensaje: 'Item de carrito no encontrado' });
  }

  if (Number(cantidad) <= 0) {
    userCart.splice(itemIndex, 1);
  } else {
    userCart[itemIndex].cantidad = Number(cantidad);
  }

  return res.json({ mensaje: 'Cantidad actualizada', cart: userCart });
});

// DELETE /api/carrito/:id_item
router.delete('/:id_item', (req, res) => {
  const userId = req.user.id;
  const itemIndex = Number(req.params.id_item) - 1;

  const userCart = memoryDb.carts[userId] || [];
  if (itemIndex >= 0 && itemIndex < userCart.length) {
    userCart.splice(itemIndex, 1);
  }

  return res.json({ mensaje: 'Ítem removido del carrito', cart: userCart });
});

// DELETE /api/carrito (Vaciar)
router.delete('/', (req, res) => {
  const userId = req.user.id;
  memoryDb.carts[userId] = [];
  return res.json({ mensaje: 'Carrito vaciado' });
});

module.exports = router;
