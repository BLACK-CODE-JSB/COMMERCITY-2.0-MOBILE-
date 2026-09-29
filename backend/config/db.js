const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isConnected = false;

// Mock in-memory state for resilient fallback if remote DB is unreachable
const memoryDb = {
  users: [
    { id: 1, nombre: 'Juan Giraldo', email: 'juan@gmail.com', password: '123', roles: ['COMPRADOR', 'VENDEDOR'] },
    { id: 2, nombre: 'Admin Master', email: 'admin@gmail.com', password: 'admin', roles: ['ADMINISTRADOR'] },
    { id: 3, nombre: 'Alex Rivera', email: 'alex@gmail.com', password: '123', roles: ['COMPRADOR'] }
  ],
  products: [
    { id: 'watch', name: 'Reloj Elitret Gold', cat: 'Relojes', price: 345000, stock: 18, disc: 0, img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80', vendor: 'Juan_Giraldo', desc: 'Elegante reloj dorado de colección limitada.' },
    { id: 'sneaker', name: 'Zapatos Deportivos', cat: 'Calzado', price: 79000, stock: 45, disc: 20, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', vendor: 'Juan_Giraldo', desc: 'Zapatillas de alto rendimiento con amortiguación avanzada.' },
    { id: 'earbuds', name: 'Auriculares Studio Pro', cat: 'Tecnología', price: 388000, stock: 12, disc: 15, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80', vendor: 'Juan_Giraldo', desc: 'Auriculares inalámbricos con cancelación activa de ruido.' },
    { id: 'backpack', name: 'Mochila City Stealth', cat: 'Accesorios', price: 79000, stock: 30, disc: 0, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', vendor: 'Juan_Giraldo', desc: 'Mochila urbana resistente al agua, con compartimentos.' },
    { id: 'cam1', name: 'Cámara DSLR Pro', cat: 'Tecnología', price: 2500000, stock: 5, disc: 0, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', vendor: 'FotoMundo', desc: 'Cámara profesional DSLR para fotografía de alta calidad.' }
  ],
  carts: {}, // userId -> [{ product_id, cantidad }]
  orders: [
    { id: 8491, buyer: 'Alex Rivera', prod: 'Macbook Air', qty: 1, total: 1299000, status: 'En Camino', date: '2026-01-04' },
    { id: 8492, buyer: 'Elena Sanz', prod: 'TV LG 45 pulgadas', qty: 4, total: 1900000, status: 'En Camino', date: '2026-01-25' }
  ],
  notifications: [
    { id: 1, titulo: '¡Pedido en camino!', mensaje: 'Tu compra #8491 ha sido despachada.', fecha: 'Hace 10 min', leida: false },
    { id: 2, titulo: 'Descuento flash', mensaje: 'Hasta 20% en zapatillas seleccionadas.', fecha: 'Hace 2 horas', leida: true }
  ]
};

async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '149.130.178.228',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'commercity_user',
      password: process.env.DB_PASSWORD || 'commercity_password_2026',
      database: process.env.DB_NAME || 'commercity_v2',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000
    });

    const conn = await pool.getConnection();
    console.log('✅ Conexión establecida exitosamente con MySQL commercity_v2');
    isConnected = true;
    conn.release();
  } catch (err) {
    console.warn('⚠️ No se pudo conectar a MySQL remoto (' + err.message + '). Activando motor de almacenamiento de respaldo.');
    isConnected = false;
  }
}

initDb();

module.exports = {
  getPool: () => pool,
  isLiveDb: () => isConnected,
  memoryDb
};
