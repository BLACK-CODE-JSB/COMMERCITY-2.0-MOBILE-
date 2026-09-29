const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');
const tiendaRoutes = require('./routes/tienda.routes');
const notifsRoutes = require('./routes/notifs.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS permitiendo orígenes de Capacitor, Electron y Web
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logger básico de solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint de diagnóstico
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CommerCity REST API',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Mapeo de rutas según SRS
app.use('/api/usuarios', authRoutes);
app.use('/api/productos', productsRoutes);
app.use('/api/carrito', cartRoutes);
app.use('/api/pedidos', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tienda', tiendaRoutes);
app.use('/api/notificaciones', notifsRoutes);
app.use('/api/chat', chatRoutes);

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 CommerCity REST API escuchando en http://localhost:${PORT}`);
  console.log(`📱 En emulador Android usar: http://10.0.2.2:${PORT}`);
  console.log(`====================================================`);
});
