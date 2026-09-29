const express = require('express');
const router = express.Router();
const { memoryDb } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('VENDEDOR', 'ADMINISTRADOR'));

// GET /api/tienda/resumen
router.get('/resumen', (req, res) => {
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

// GET /api/tienda/pedidos
router.get('/pedidos', (req, res) => {
  return res.json({ pedidos: memoryDb.orders });
});

module.exports = router;
