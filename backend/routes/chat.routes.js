const express = require('express');
const router = express.Router();
const { getPool, isLiveDb, memoryDb } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// In-memory chat storage for fallback if needed
if (!memoryDb.messages) {
  memoryDb.messages = [
    { id: 1, emisor_id: 2, receptor_id: 3, mensaje: 'Hola, ¿sigue disponible el producto?', enviado_at: new Date().toISOString() },
    { id: 2, emisor_id: 3, receptor_id: 2, mensaje: '¡Hola! Sí, todavía tenemos stock para despacho inmediato.', enviado_at: new Date().toISOString() }
  ];
}

// GET /api/chat/conversaciones
router.get('/conversaciones', async (req, res) => {
  const currentUserId = req.user.id;

  if (isLiveDb()) {
    try {
      const pool = getPool();
      const query = `
        SELECT 
          u.id as partner_id,
          u.nombre_completo as nombre,
          u.email,
          u.foto_perfil,
          COALESCE(last_msg.mensaje, 'Iniciar conversación...') as ultimo_mensaje,
          COALESCE(last_msg.enviado_at, NOW()) as fecha,
          COALESCE(unread_count.total, 0) as no_leidos
        FROM usuarios u
        JOIN (
          SELECT DISTINCT
            CASE WHEN emisor_id = ? THEN receptor_id ELSE emisor_id END as other_id
          FROM mensajes_chat
          WHERE emisor_id = ? OR receptor_id = ?
        ) rel ON rel.other_id = u.id
        LEFT JOIN (
          SELECT m1.emisor_id, m1.receptor_id, m1.mensaje, m1.enviado_at
          FROM mensajes_chat m1
          INNER JOIN (
            SELECT MAX(id) as max_id
            FROM mensajes_chat
            WHERE emisor_id = ? OR receptor_id = ?
            GROUP BY LEAST(emisor_id, receptor_id), GREATEST(emisor_id, receptor_id)
          ) m2 ON m1.id = m2.max_id
        ) last_msg ON (
          (last_msg.emisor_id = currentUserId AND last_msg.receptor_id = u.id) OR
          (last_msg.emisor_id = u.id AND last_msg.receptor_id = currentUserId)
        )
        LEFT JOIN (
          SELECT emisor_id, COUNT(*) as total
          FROM mensajes_chat
          WHERE receptor_id = ? AND leido = 0
          GROUP BY emisor_id
        ) unread_count ON unread_count.emisor_id = u.id
        ORDER BY fecha DESC
      `;
      const [conversaciones] = await pool.query(query, [
        currentUserId, currentUserId, currentUserId,
        currentUserId, currentUserId,
        currentUserId
      ]);

      if (conversaciones.length > 0) {
        return res.json({ conversaciones });
      }

      // Si el usuario aún no tiene mensajes en BD, sugerir usuarios destacados (vendedores / admin)
      const [sugeridos] = await pool.query(`
        SELECT id as partner_id, nombre_completo as nombre, email, foto_perfil,
               'Toca para chatear en tiempo real' as ultimo_mensaje,
               NOW() as fecha, 0 as no_leidos
        FROM usuarios
        WHERE id != ?
        LIMIT 8
      `, [currentUserId]);

      return res.json({ conversaciones: sugeridos });
    } catch (err) {
      console.error('Error al obtener conversaciones MySQL:', err);
    }
  }

  // Fallback memory
  return res.json({
    conversaciones: [
      { partner_id: 3, nombre: 'Alex Rivera (Vendedor)', ultimo_mensaje: 'Sí, aún tenemos disponibilidad', fecha: '10:42', no_leidos: 1 },
      { partner_id: 4, nombre: 'Elena Sanz', ultimo_mensaje: '¿Tiene garantía el producto?', fecha: 'Ayer', no_leidos: 0 },
      { partner_id: 486, nombre: 'Soporte CommerCity', ultimo_mensaje: 'Bienvenido al canal oficial', fecha: 'Lun', no_leidos: 0 }
    ]
  });
});

// GET /api/chat/mensajes/:partnerId
router.get('/mensajes/:partnerId', async (req, res) => {
  const currentUserId = req.user.id;
  const partnerId = Number(req.params.partnerId);

  if (isLiveDb()) {
    try {
      const pool = getPool();
      const [mensajes] = await pool.query(`
        SELECT id, emisor_id, receptor_id, mensaje, enviado_at, leido,
               (emisor_id = ?) as is_mine
        FROM mensajes_chat
        WHERE (emisor_id = ? AND receptor_id = ?)
           OR (emisor_id = ? AND receptor_id = ?)
        ORDER BY id ASC
      `, [currentUserId, currentUserId, partnerId, partnerId, currentUserId]);

      // Marcar como leídos los recibidos
      await pool.query(`
        UPDATE mensajes_chat SET leido = 1
        WHERE receptor_id = ? AND emisor_id = ? AND leido = 0
      `, [currentUserId, partnerId]);

      // Info del interlocutor
      const [userInfo] = await pool.query('SELECT id, nombre_completo as nombre, email FROM usuarios WHERE id = ?', [partnerId]);

      return res.json({
        partner: userInfo[0] || { id: partnerId, nombre: 'Usuario #' + partnerId },
        mensajes
      });
    } catch (err) {
      console.error('Error al cargar mensajes MySQL:', err);
    }
  }

  // Fallback
  const list = memoryDb.messages.filter(m => 
    (m.emisor_id === currentUserId && m.receptor_id === partnerId) ||
    (m.emisor_id === partnerId && m.receptor_id === currentUserId)
  ).map(m => ({ ...m, is_mine: m.emisor_id === currentUserId }));

  return res.json({
    partner: { id: partnerId, nombre: 'Usuario #' + partnerId },
    mensajes: list
  });
});

// POST /api/chat (el id va en el body) & POST /api/chat/mensajes/:partnerId
router.post(['/', '/mensajes/:partnerId'], async (req, res) => {
  const currentUserId = req.user.id;
  const rawPartnerId = req.params.partnerId || req.body.id || req.body.receptor_id || req.body.partnerId;
  const partnerId = Number(rawPartnerId);
  const { mensaje } = req.body;

  if (!partnerId) {
    return res.status(400).json({ mensaje: 'El ID del destinatario es requerido en el body (id o receptor_id).' });
  }

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ mensaje: 'El texto del mensaje no puede estar vacío.' });
  }

  const cleanText = mensaje.trim();
  const now = new Date();

  if (isLiveDb()) {
    try {
      const pool = getPool();
      const [result] = await pool.query(`
        INSERT INTO mensajes_chat (emisor_id, receptor_id, tipo_mensaje, mensaje, enviado_at, leido)
        VALUES (?, ?, 'texto', ?, ?, 0)
      `, [currentUserId, partnerId, cleanText, now]);

      const createdMsg = {
        id: result.insertId,
        emisor_id: currentUserId,
        receptor_id: partnerId,
        mensaje: cleanText,
        enviado_at: now.toISOString(),
        is_mine: true
      };

      return res.status(201).json({ mensaje: 'Mensaje enviado', data: createdMsg });
    } catch (err) {
      console.error('Error al insertar mensaje MySQL:', err);
    }
  }

  // Fallback
  const newMsg = {
    id: Date.now(),
    emisor_id: currentUserId,
    receptor_id: partnerId,
    mensaje: cleanText,
    enviado_at: now.toISOString(),
    is_mine: true
  };
  memoryDb.messages.push(newMsg);

  return res.status(201).json({ mensaje: 'Mensaje enviado', data: newMsg });
});

module.exports = router;
