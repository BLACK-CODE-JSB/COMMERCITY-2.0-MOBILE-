const express = require('express');
const router = express.Router();
const { memoryDb } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('ADMINISTRADOR'));

// GET /api/admin/stats & /api/admin/metricas
router.get(['/stats', '/metricas'], (req, res) => {
  const totalVentas = memoryDb.orders.reduce((acc, curr) => acc + (typeof curr.total === 'number' ? curr.total : 1500000), 0);
  const comisionAcumulada = Math.round(totalVentas * 0.10);

  return res.json({
    usuarios_activos: memoryDb.users.length + 120,
    ventas_totales: totalVentas,
    comision_plataforma: comisionAcumulada,
    pedidos_registrados: memoryDb.orders.length,
    productos_en_catalogo: memoryDb.products.length,
    reportes_pendientes: [
      { id: 1, tipo: 'producto', entidad: 'Smartwatch V2', motivo: 'Precio inconsistente', fecha: '2026-02-18' },
      { id: 2, tipo: 'usuario', entidad: 'StyleCo', motivo: 'Demora en despacho', fecha: '2026-02-20' }
    ]
  });
});

module.exports = router;
