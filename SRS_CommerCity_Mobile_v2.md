# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## SISTEMA DE MARKETPLACE LOCAL — COMMERCITY MOBILE v2.0

**Documento:** SRS-CCM-2026-V2  
**Estándar de Referencia:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148  
**Proyecto:** CommerCity Mobile (Capacitor / Android & iOS)  
**Organización:** THE BLACK CODE JSB  
**Sprint:** Cierre Sprint 2 (Fase de Especificación e Integración API)  
**Ambiente Backend:** `http://localhost:3000` (Node.js / Express REST API)  
**Base de Datos Central:** MySQL `commercity_v2` (`149.130.178.228:3306`)  
**Responsables de Coordinación:** Yepes (Casos de Uso) / Equipo Móvil & Backend  

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
El presente documento define la Especificación de Requerimientos de Software (SRS) para el aplicativo móvil **CommerCity Mobile v2.0**. Establece los requerimientos funcionales, requerimientos no funcionales, reglas de negocio, modelos de seguridad y la arquitectura de integración con la API REST central (`http://localhost:3000`) y la base de datos relacional MySQL (`commercity_v2`), reemplazando el esquema de datos locales de la fase de prototipado.

### 1.2 Alcance del Sistema
CommerCity es un marketplace móvil diseñado para dinamizar el comercio local mediante la conexión directa entre compradores y vendedores. El sistema móvil permite:
* Exploración de catálogos por categorías, búsqueda y visualización de productos en tiempo real.
* Gestión de carrito de compras persistente con expiración automática.
* Procesamiento de pedidos y checkout con desglose fiscal y comisión calculados por el backend.
* Panel de administración de tienda e inventario para vendedores.
* Módulo de mensajería instantánea y chat entre comprador y comerciante.
* Consola administrativa y moderación de contenidos/usuarios para administradores de plataforma.
* Sistema de notificaciones operacionales y de envíos.

### 1.3 Definiciones, Acrónimos y Abreviaturas
* **SRS:** Software Requirements Specification (Especificación de Requerimientos de Software).
* **JWT:** JSON Web Token (Estándar RFC 7519 para transmisión segura de identidad).
* **REST:** Representational State Transfer.
* **IVA:** Impuesto al Valor Agregado (19% nacional colombiano).
* **Capacitor:** Runtime multiplataforma para empaquetado nativo web en Android e iOS.
* **DBMS:** Database Management System (MySQL 8.0+).

---

## 2. DESCRIPCIÓN GENERAL

### 2.1 Perspectiva del Producto
CommerCity Mobile funciona como cliente desacoplado (frontend híbrido nativo) que consume servicios web expuestos por el backend central. Toda persistencia crítica, validación de stock, cálculo de comisiones e impuestos es responsabilidad exclusiva del servidor.

```
┌─────────────────────────────────────────────────────────────┐
│                 CLIENTE MÓVIL (Capacitor)                   │
│        HTML5 / CSS3 / JavaScript (ES6+) / Web APIs          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND REST (Node.js/Express)               │
│                   http://localhost:3000                     │
│  - Autenticación JWT     - Desglose Fiscal (IVA 19%)        │
│  - Control de Roles      - Liquidación Comisión (10%)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ TCP / 3306 (Connection Pool)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             BASE DE DATOS CENTRAL (MySQL 8.0)               │
│         Host: 149.130.178.228:3306 | BD: commercity_v2      │
│  Tablas: usuarios, roles, usuario_roles, productos,         │
│          pedidos, pedidos_detalle, notificaciones, chat     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Perfiles de Usuario y Roles (RBAC)
La asignación de permisos se gestiona en la tabla `usuario_roles` de la base de datos `commercity_v2`:

| Rol | Identificador BD | Descripción y Permisos |
| :--- | :--- | :--- |
| **Comprador** | `comprador` | Rol base asignado automáticamente en el registro. Permite navegación de catálogo, carrito, compra de productos, historial de pedidos, calificaciones y chat con vendedores. |
| **Vendedor** | `vendedor` | Asignado mediante `PATCH /api/usuarios/me/rol` con `{ rol: "vendedor" }`. Capacidades de comprador + panel de tienda, publicación y edición de productos, control de stock, gestión de envíos y configuración bancaria. |
| **Administrador** | `administrador` | Acceso a métricas globales (`/api/admin/stats`), moderación de reportes, suspensión/reactivación de usuarios y productos bajo `/api/admin/*`. |

---

## 3. REQUERIMIENTOS FUNCIONALES (RF)

### 3.1 Módulo de Autenticación y Cuentas
* **RF01 - Inicio de Sesión Real (JWT):** El sistema autenticará al usuario contra `POST /api/usuarios/login`, validando credenciales y retornando un token JWT firmado junto con el objeto de usuario y array de roles en minúscula (`comprador`, `vendedor`, `administrador`). Se elimina la validación mock de `email.includes('vendedor')` y el login hardcodeado de administrador.
* **RF02 - Registro de Usuario:** El sistema registrará nuevos usuarios mediante `POST /api/usuarios/register` con payload `{ email, password, nombre_completo }`. El sistema siempre asigna el rol base `comprador`. En caso de email duplicado, el backend responde HTTP 400 (Bad Request). Si el usuario requiere rol de comerciante, posteriormente solicita la activación vía `PATCH /api/usuarios/me/rol` con `{ rol: "vendedor" }`.
* **RF03 - Recuperación de Contraseña:** El sistema solicitará token de recuperación mediante `POST /api/usuarios/recover` con `{ email }`. El token generado expira en 5 minutos. El restablecimiento efectivo se ejecuta con `POST /api/usuarios/reset-password` enviando `{ token, nuevaPassword }`.
* **RF04 - Cierre de Sesión Seguro:** Al cerrar sesión, el cliente eliminará el token de autenticación y los datos de perfil locales, redirigiendo a la pantalla de login.
* **RF05 - Perfil y Cuentas Bancarias:** Consulta de perfil autenticado mediante `GET /api/usuarios/me`. Los datos bancarios del vendedor se gestionan exclusivamente mediante `GET/POST/PUT /api/tienda/mi-cuenta-bancaria` y su lectura enmascarada vía `GET /api/tienda/mi-cuenta-bancaria/masked`.

### 3.2 Módulo de Catálogo y Búsqueda
* **RF10 - Consulta de Catálogo:** El sistema obtendrá los productos disponibles mediante `GET /api/productos` utilizando los parámetros query: `page`, `limit`, `nombre`, `categoria` y `vendedor`. La respuesta viene envuelta en `{ success, data }`.
* **RF11 - Detalle de Producto:** Al seleccionar un ítem, el sistema consultará `GET /api/productos/:id` retornando `{ success, data }` para mostrar especificaciones, stock en tiempo real, descuentos aplicables y datos del vendedor.
* **RF22 - Feed Personalizado:** La vista de perfil dispondrá de recomendaciones sincronizadas con la actividad del usuario.
* **RF23 - Mis Productos (Vendedor):** La vista de perfil listará los productos del comerciante filtrando por `vendedor={id}`.

### 3.3 Módulo de Carrito de Compras (Excepción de Autenticación sin JWT)
* **RF30 - Persistencia en Servidor sin JWT:** El carrito de compras no exige cabecera JWT. Se consulta mediante `GET /api/carrito?comprador_id={id}` y se agregan productos mediante `POST /api/carrito` enviando `{ comprador_id, producto_id, cantidad }` respondiendo HTTP 201 Created.
* **RF31 - Control de Cantidades y Stock:** Al modificar la cantidad de un ítem, se envía `PATCH /api/carrito/:productoId?comprador_id={id}` con `{ cantidad }`. El backend valida el inventario antes de autorizar el cambio.
* **RF32 - Eliminación de Ítems:** El sistema permite remover productos del carrito mediante `DELETE /api/carrito/:productoId?comprador_id={id}`.
* **RF109 - Caducidad de Carrito Inactivo:** Los carritos sin actividad durante 7 días (604.800.000 ms) serán purgados automáticamente por el sistema.

### 3.4 Módulo de Pedidos, Checkout y Pagos
* **RF38 - Validación de Dirección:** El sistema exigirá que el comprador ingrese una dirección de envío con una longitud mínima de 5 caracteres en el proceso de pago.
* **RF40 - Resumen Financiero Certificado:** Al abrir la pasarela, la app solicitará `GET /api/pedidos/resumen`. Todos los montos se computarán del lado del servidor:
  * **Subtotal:** Sumatoria de productos según cantidades y descuentos.
  * **IVA (19%):** Impuesto legal calculado por el servidor (`RF134`).
  * **Comisión de Plataforma (10%):** Tarifa de intermediación calculada por el backend sobre la venta para dispersión al vendedor.
  * **Total Definitivo:** Valor exacto a procesar. La app móvil **no realiza cálculos aritméticos de impuestos**.
* **RF41 - Confirmación de Transacción:** El sistema procesará el pago mediante `POST /api/pedidos/confirmar-pago` enviando `{ direccion_envio, metodo_pago: "tarjeta" | "transferencia" | "pse" }`. En caso de elegir `tarjeta`, se envían adicionalmente `{ numero_tarjeta, nombre_tarjeta }` validados mediante algoritmo de Luhn (RF118). El endpoint no requiere `datos_transaccion` ni `direccion_entrega_id`, y responde HTTP 201 Created con `{ pedido_id, estado_pago: "Aprobado", total_neto, iva, total, distribucion_90_10 }`.
* **RF42 - Historial y Seguimiento:** El comprador podrá consultar sus compras en `GET /api/historial/compras` con filtrado por estado (`Pendiente`, `En Camino`, `Entregado`, `Cancelado`).
* **RF43 - Cancelación de Línea de Compra:** El comprador podrá cancelar una compra pendiente ejecutando `POST /api/historial/compras/:id/cancelar`, donde `:id` representa el identificador de la línea del pedido (detalle) en estado Pendiente.

### 3.5 Módulo de Tienda y Ventas (Vendedor)
* **RF50 - Estadísticas y Métricas de Tienda:** El comerciante consultará sus métricas consolidadas en `GET /api/tienda/dashboard/stats`, el historial de órdenes en `GET /api/tienda/ventas`, la liquidación en `GET /api/tienda/ingresos` y su estado de acreditación en `GET /api/tienda/validacion`.
* **RF51 - Publicación de Productos:** El comerciante podrá subir nuevos productos con imagen multipart en `POST /api/productos`.
* **RF52 - Edición y Control de Stock:** El vendedor podrá modificar precio, descuento, stock y descripción en `PUT /api/productos/:id`.
* **RF53 - Actualización de Envíos:** El vendedor avanzará el estado del envío mediante `PATCH /api/pedidos/:id/estado` con `{ estado: "En camino" | "Entregado" }`, notificando al comprador.
* **RF54 - Dispersión Bancaria:** Gestión segura de datos de cuenta para transferencias mediante `/api/tienda/mi-cuenta-bancaria` (GET/POST/PUT) y consulta enmascarada en `/api/tienda/mi-cuenta-bancaria/masked`.

### 3.6 Módulo Social, Calificaciones y Notificaciones
* **RF80 - Notificaciones:** Consulta general en `GET /api/notificaciones`, notificaciones pendientes en `GET /api/notificaciones/no-leidas`, marcado global en `PATCH /api/notificaciones/leidas` y marcado individual en `PATCH /api/notificaciones/:id/leida`.
* **RF84 / RF107 - Calificación de Vendedores:** El comprador registrará la reseña mediante `POST /api/calificaciones/vendedor` enviando `{ pedido_id, vendedor_id, estrellas: 1..5, comentario }` (RF107, máximo una calificación por pedido).
* **RF85 - Mensajería y Chat Directo:** El historial se consulta con `GET /api/chat/conversaciones` y `GET /api/chat/mensajes/:usuarioId`. El envío de mensajes se realiza mediante `POST /api/chat` (multipart con archivo adjunto opcional), y el marcado de lectura individual se efectúa en `PATCH /api/chat/mensajes/:id/leido`.
* **RF86 - Reportes de Contenido:** Envío de reportes vía `POST /api/reportes` con `{ tipo: "Producto" | "Usuario", motivo, producto_id | usuario_reportado_id }` con soporte de archivo de evidencia adjunto opcional en multipart.

### 3.7 Módulo de Administración de Plataforma
* **RF90 - Métricas Centrales y Dashboard:** Dashboard administrativo con ventas globales y estadísticas de plataforma en `GET /api/admin/stats`.
* **RF91 - Moderación de Usuarios, Productos y Reportes:** Gestión integral de usuarios, productos y reportes centralizada bajo rutas dedicadas en `/api/admin/*`.

---

## 4. MATRIZ DE MAPEO: PANTALLAS / MODALES vs ENDPOINTS API

| Pantalla / Modal DOM | Endpoint Backend | Verbo | Cabeceras Requeridas | Payload / Query | Respuesta Backend y Efecto en UI |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page-login` | `/api/usuarios/login` | `POST` | `Content-Type: application/json` | `{ email, password }` | Retorna `{ token, usuario: { id, nombre, email, roles: ["comprador", ...] } }` (roles en minúscula). Guarda JWT, activa roles y navega a `home` o `admin`. |
| `page-registro` | `/api/usuarios/register` | `POST` | `Content-Type: application/json` | `{ email, password, nombre_completo }` | Registra usuario con rol base `comprador`. Retorna 201 o 400 si el email está duplicado. |
| Cambio de Rol | `/api/usuarios/me/rol` | `PATCH` | `Authorization: Bearer <token>` | `{ rol: "vendedor" }` | Actualiza rol a vendedor en BD y activa opciones de comerciante. |
| `page-recuperar` | `/api/usuarios/recover` | `POST` | `Content-Type: application/json` | `{ email }` | Dispara token de recuperación (expira a los 5 minutos) y notifica por toast. |
| `page-restablecer` | `/api/usuarios/reset-password` | `POST` | `Content-Type: application/json` | `{ token, nuevaPassword }` | Actualiza contraseña en BD (válido por 5 minutos) y redirige a login. |
| `page-perfil` | `/api/usuarios/me` | `GET` | `Authorization: Bearer <token>` | — | Retorna información de perfil del usuario autenticado. |
| Datos Bancarios Vendedor | `/api/tienda/mi-cuenta-bancaria` | `GET` / `POST` / `PUT` | `Authorization: Bearer <token>` | POST/PUT: `{ entidad, tipo_cuenta, numero_cuenta, titular }` | Gestiona datos bancarios de liquidación del vendedor. |
| Cuenta Bancaria Enmascarada | `/api/tienda/mi-cuenta-bancaria/masked` | `GET` | `Authorization: Bearer <token>` | — | Retorna número de cuenta bancaria enmascarado para seguridad visual. |
| `page-home` | `/api/productos` | `GET` | — | `?page=1&limit=20&nombre=...&categoria=...&vendedor=...` | Retorna `{ success: true, data: [...] }`. Carga productos en `#home-prod-grid` y carruseles. |
| Modal `#pd-modal` | `/api/productos/:id` | `GET` | — | Parámetro URL: `id` | Retorna `{ success, data }` con detalle completo de producto y vendedor. |
| `page-carrito` | `/api/carrito` | `GET` | — (Sin JWT) | Query: `?comprador_id=...` | Renderiza la lista `#carrito-items` según el `comprador_id`. (Excepción de auth). |
| Modal `#pd-modal` (Agregar) | `/api/carrito` | `POST` | `Content-Type: application/json` (Sin JWT) | `{ comprador_id, producto_id, cantidad }` | Agrega ítem al carrito (201 Created), valida stock y actualiza badges `#sidebar-cart-badge` y `#bnav-cart-dot`. |
| `cartQty` en Carrito | `/api/carrito/:productoId` | `PATCH` | `Content-Type: application/json` (Sin JWT) | Query: `?comprador_id=...` <br/> Body: `{ cantidad }` | Modifica cantidad del producto para el `comprador_id`. |
| `cartRemove` en Carrito | `/api/carrito/:productoId` | `DELETE`| — (Sin JWT) | Query: `?comprador_id=...` | Elimina ítem del carrito para el `comprador_id`. |
| Modal `#pasarela-modal` | `/api/pedidos/resumen` | `GET` | `Authorization: Bearer <token>` | — | Recibe `{ subtotal, iva, comision, total }` calculados por backend. Renderiza `#pas-subtotal`, `#pas-iva`, `#pas-amount`. |
| Proceso Pago (`pasarela`) | `/api/pedidos/confirmar-pago` | `POST` | `Authorization: Bearer <token>` | `{ direccion_envio, metodo_pago, numero_tarjeta?, nombre_tarjeta? }` | Valida `direccion_envio` (mín 5 caracteres), algoritmo Luhn si tarjeta (RF118). Responde 201 con `pedido_id`, `estado_pago: "Aprobado"`, `total_neto`, `iva`, `total`, `distribucion_90_10`. |
| `page-historial` | `/api/historial/compras` | `GET` | `Authorization: Bearer <token>` | `?estado=...` | Renderiza historial de pedidos con líneas de compra y estados actualizados. |
| Cancelar Compra | `/api/historial/compras/:id/cancelar` | `POST` | `Authorization: Bearer <token>` | `:id` = línea del pedido (detalle) en estado `Pendiente` | Cancela la compra de la línea y restituye inventario. |
| `page-tienda` (Stats) | `/api/tienda/dashboard/stats` | `GET` | `Authorization: Bearer <token>` | — | Retorna estadísticas consolidadas del panel de vendedor. |
| `page-pedidos` (Ventas) | `/api/tienda/ventas` | `GET` | `Authorization: Bearer <token>` | — | Lista órdenes y ventas recibidas por la tienda del vendedor. |
| Ingresos Vendedor | `/api/tienda/ingresos` | `GET` | `Authorization: Bearer <token>` | — | Muestra ingresos brutos, comisión de plataforma (10%) y balance neto. |
| Validación de Tienda | `/api/tienda/validacion` | `GET` | `Authorization: Bearer <token>` | — | Consulta estado de acreditación y validación comercial del vendedor. |
| Modal `#od-modal` (Envío) | `/api/pedidos/:id/estado` | `PATCH` | `Authorization: Bearer <token>` | `{ estado: "En camino" \| "Entregado" }` | Vendedor avanza el estado del envío y alerta al comprador. |
| Modal `#add-prod-modal` | `/api/productos` | `POST` | `Authorization: Bearer <token>` | `multipart/form-data` | Guarda nuevo producto en BD con foto y lo muestra en tienda. |
| Modal `#edit-prod-modal` | `/api/productos/:id` | `PUT` | `Authorization: Bearer <token>` | `multipart/form-data` | Actualiza datos de producto e impacta catálogo. |
| Modal `#rating-modal` | `/api/calificaciones/vendedor` | `POST` | `Authorization: Bearer <token>` | `{ pedido_id, vendedor_id, estrellas, comentario }` | Registra calificación (RF107, estrellas 1-5, una por pedido). |
| Panel `#notifs-panel` | `/api/notificaciones` | `GET` | `Authorization: Bearer <token>` | — | Lista todas las notificaciones del usuario. |
| Notificaciones Pendientes | `/api/notificaciones/no-leidas` | `GET` | `Authorization: Bearer <token>` | — | Consulta conteo y alertas no leídas para el badge visual. |
| Marcar Todas Leídas | `/api/notificaciones/leidas` | `PATCH` | `Authorization: Bearer <token>` | — | Marca todas las notificaciones como leídas en BD. |
| Marcar Notificación Leída | `/api/notificaciones/:id/leida` | `PATCH` | `Authorization: Bearer <token>` | — | Marca una notificación específica como leída en BD. |
| `page-mensajes` | `/api/chat/conversaciones` | `GET` | `Authorization: Bearer <token>` | — | Lista conversaciones activas ordenadas cronológicamente. |
| `page-chat` (Historial) | `/api/chat/mensajes/:usuarioId` | `GET` | `Authorization: Bearer <token>` | Parámetro URL: `usuarioId` | Carga historial de mensajes con el usuario interlocutor. |
| `page-chat` (Enviar) | `/api/chat` | `POST` | `Authorization: Bearer <token>` | `multipart/form-data` (texto + archivo opcional) | Envía mensaje con adjunto multimedia opcional. |
| Marcar Mensaje Leído | `/api/chat/mensajes/:id/leido` | `PATCH` | `Authorization: Bearer <token>` | — | Marca mensaje individual como leído en BD. |
| Modal `#report-modal` | `/api/reportes` | `POST` | `Authorization: Bearer <token>` | `multipart/form-data`: `{ tipo, motivo, producto_id \| usuario_reportado_id }` + archivo opcional | Genera ticket de reporte (`tipo: "Producto" \| "Usuario"`). |
| `page-admin` (Dashboard) | `/api/admin/stats` | `GET` | `Authorization: Bearer <token>` (Admin) | — | Muestra dashboard con ingresos globales, usuarios y métricas de plataforma. |
| Moderación y Gestión Admin | `/api/admin/*` | `GET` / `PATCH` | `Authorization: Bearer <token>` (Admin) | Sub-rutas de usuarios, productos y reportes | Gestión administrativa integral bajo el prefijo `/api/admin/*`. |

---

## 5. REQUERIMIENTOS NO FUNCIONALES (RNF)

* **RNF01 - Seguridad:** Transmisión cifrada mediante HTTPS/TLS 1.3. Criptografía de contraseñas con `bcrypt` (factor de costo 10+) en backend. Tokens JWT con algoritmo HMAC-SHA256 y expiración forzada de 24 horas.
* **RNF02 - Rendimiento:** Tiempo de respuesta de endpoints de catálogo inferior a 350 ms bajo cargas estándar. Compresión de imágenes multipart antes del envío.
* **RNF03 - Disponibilidad:** Arquitectura preparada para tolerancia a fallos en BD MySQL con pool de conexiones gestionado (`mysql2` pool con límite de 30 conexiones concurrentes).
* **RNF04 - Usabilidad y Compatibilidad:** Soporte fluido para Android 8.0+ y iOS 13+ empaquetado bajo Ionic Capacitor. Diseño responsive adaptativo (Mobile viewport <= 860px y Desktop).
* **RNF05 - Integridad de Datos:** Aislamiento de transacciones financieras en MySQL con nivel `READ COMMITTED` para evitar compras sobre inventario agotado (*race conditions*).

---

## 6. PARÁMETROS TÉCNICOS Y BASE DE DATOS

```ini
# Configuración del Entorno de Red y Base de Datos Central
API_BASE_URL = "http://localhost:3000"
DB_ENGINE    = "MySQL 8.0"
DB_HOST      = "149.130.178.228"
DB_PORT      = 3306
DB_USER      = "commercity_user"
DB_PASS      = "Thedbcommercity"
DB_NAME      = "commercity_v2"
```

### 6.1 Esquema Relacional Principal (MySQL `commercity_v2`)
* `usuarios`: `id`, `nombre`, `email`, `password_hash`, `telefono`, `direccion`, `estado`, `created_at`.
* `roles`: `id`, `nombre` (`COMPRADOR`, `VENDEDOR`, `ADMINISTRADOR`).
* `usuario_roles`: `usuario_id`, `rol_id` (Clave foránea compuesta, soporte multirrol).
* `productos`: `id`, `vendedor_id`, `nombre`, `descripcion`, `precio`, `descuento`, `stock`, `categoria`, `imagen_url`, `estado`.
* `pedidos`: `id`, `comprador_id`, `subtotal`, `iva`, `comision_plataforma`, `total`, `estado`, `direccion_envio`, `created_at`.
* `pedidos_detalle`: `id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`.
* `notificaciones`: `id`, `usuario_id`, `titulo`, `mensaje`, `leida`, `tipo`, `created_at`.
* `calificaciones`: `id`, `vendedor_id`, `comprador_id`, `puntuacion`, `comentario`, `created_at`.

---

## 7. CRITERIOS DE ACEPTACIÓN PARA CIERRE DE SPRINT 2

1. **Alineación con Casos de Uso:** El documento SRS cubre el 100% de los identificadores de pantallas y modales para que Yepes vincule los diagramas de secuencia y casos de uso.
2. **Cero Cálculos Financieros en Cliente:** La pasarela de pago delega el 100% del cálculo de Subtotal, IVA (19%) y Comisión (10%) al endpoint `/api/pedidos/resumen`.
3. **Control RBAC:** La interfaz móvil responde exclusivamente a los roles autenticados devueltos por la base de datos `commercity_v2`.
4. **Verificación de Conectividad:** Backend validado en `http://localhost:3000` conectado a la base de datos `commercity_v2` en `149.130.178.228:3306`.
