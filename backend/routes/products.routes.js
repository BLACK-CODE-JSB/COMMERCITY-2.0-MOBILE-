const express = require('express');
const router = express.Router();
const { getPool, isLiveDb, memoryDb } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/productos
router.get('/', async (req, res) => {
  const { categoria, q } = req.query;

  if (isLiveDb()) {
    try {
      const pool = getPool();
      let query = `
        SELECT p.id, p.nombre as name, p.descripcion as 'desc', p.imagen_url as img,
               CAST(p.precio AS SIGNED) as price, p.stock, 
               COALESCE(p.descuento_porcentaje, 0) as disc,
               COALESCE(c.nombre, 'General') as cat,
               COALESCE(u.nombre_completo, 'Vendedor CommerCity') as vendor
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN usuarios u ON p.vendedor_id = u.id
        WHERE p.eliminado_por_admin = 0 OR p.eliminado_por_admin IS NULL
      `;
      const params = [];

      if (categoria && categoria !== 'todos') {
        query += ' AND c.nombre = ?';
        params.push(categoria);
      }
      if (q) {
        query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
      }

      const [rows] = await pool.query(query, params);
      if (rows && rows.length > 0) {
        return res.json({ success: true, data: rows, total: rows.length, productos: rows });
      }
    } catch (err) {
      console.error('Error al listar productos MySQL:', err);
    }
  }

  // Fallback memory
  let prods = [...memoryDb.products];
  if (categoria && categoria !== 'todos') {
    prods = prods.filter(p => p.cat.toLowerCase() === categoria.toLowerCase());
  }
  if (q) {
    const term = q.toLowerCase();
    prods = prods.filter(p => p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term));
  }

  return res.json({ success: true, data: prods, total: prods.length, productos: prods });
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (isLiveDb()) {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
      if (rows.length > 0) return res.json(rows[0]);
    } catch (err) {
      console.error('Error al obtener producto MySQL:', err);
    }
  }

  const prod = memoryDb.products.find(p => String(p.id) === String(id));
  if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  return res.json(prod);
});

// POST /api/productos (Requiere VENDEDOR o ADMINISTRADOR)
router.post('/', verifyToken, requireRole('VENDEDOR', 'ADMINISTRADOR'), async (req, res) => {
  const { name, cat, price, stock, disc, img, desc } = req.body;
  if (!name || !price) {
    return res.status(400).json({ mensaje: 'Nombre y precio son obligatorios.' });
  }

  const newProd = {
    id: 'prod_' + Date.now(),
    name,
    cat: cat || 'General',
    price: Number(price),
    stock: Number(stock) || 1,
    disc: Number(disc) || 0,
    img: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    vendor: req.user.nombre || 'Vendedor CommerCity',
    desc: desc || ''
  };

  if (isLiveDb()) {
    try {
      const pool = getPool();
      await pool.query(
        'INSERT INTO productos (nombre, categoria, precio, stock, descuento, imagen, vendedor, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newProd.name, newProd.cat, newProd.price, newProd.stock, newProd.disc, newProd.img, newProd.vendor, newProd.desc]
      );
    } catch (err) {
      console.error('Error insertando producto MySQL:', err);
    }
  }

  memoryDb.products.unshift(newProd);
  return res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: newProd });
});

// PUT /api/productos/:id
router.put('/:id', verifyToken, requireRole('VENDEDOR', 'ADMINISTRADOR'), async (req, res) => {
  const { id } = req.params;
  const idx = memoryDb.products.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' });

  memoryDb.products[idx] = { ...memoryDb.products[idx], ...req.body };
  return res.json({ mensaje: 'Producto actualizado', producto: memoryDb.products[idx] });
});

// DELETE /api/productos/:id
router.delete('/:id', verifyToken, requireRole('VENDEDOR', 'ADMINISTRADOR'), async (req, res) => {
  const { id } = req.params;
  memoryDb.products = memoryDb.products.filter(p => String(p.id) !== String(id));
  return res.json({ mensaje: 'Producto eliminado exitosamente' });
});

module.exports = router;
