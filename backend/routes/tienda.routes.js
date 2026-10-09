const express = require('express');
const router = express.Router();
const { memoryDb } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('VENDEDOR', 'ADMINISTRADOR'));

// GET /api/tienda/dashboard/stats & /api/tienda/resumen
router.get(['/dashboard/stats', '/resumen'], (req, res) => {
  const pedidosVendedor = memoryDb.orders;
  const ingresosBrutos = pedidosVendedor.reduce((acc, c) => acc + (typeof c.total === 'number' ? c.total : 500000), 0);
  const comisionRetenida = Math.round(ingresosBrutos * 0.10);

  return res.json({
    ventas_totales: pedidosVendedor.length,
    ingresos_brutos: ingresosBrutos,
    comision_retenida_10: comisionRetenida,
    balance_neto: ingresosBrutos - comisionRetenida,
    pedidos_pendientes: pedidosVendedor.filter(o => o.status === 'Pendiente' || o.status === 'En Camino').length
  });
});

// GET /api/tienda/ventas & /api/tienda/pedidos (filtra por estado)
router.get(['/ventas', '/pedidos'], (req, res) => {
  const { estado } = req.query;
  let list = memoryDb.orders;
  if (estado && estado !== 'todos') {
    const filter = estado.toLowerCase();
    list = list.filter(o => (o.status && o.status.toLowerCase() === filter) || (o.estado && o.estado.toLowerCase() === filter));
  }
  return res.json({ pedidos: list, ventas: list, total: list.length });
});

module.exports = router;
