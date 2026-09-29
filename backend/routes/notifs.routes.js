const express = require('express');
const router = express.Router();
const { memoryDb } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/notificaciones
router.get('/', (req, res) => {
  return res.json({ notificaciones: memoryDb.notifications });
});

// PATCH /api/notificaciones/marcar-leidas
router.patch('/marcar-leidas', (req, res) => {
  memoryDb.notifications.forEach(n => n.leida = true);
  return res.json({ mensaje: 'Notificaciones marcadas como leídas' });
});

module.exports = router;
