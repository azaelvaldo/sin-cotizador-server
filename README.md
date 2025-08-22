# Cotizador Server

Servidor backend para sistema de cotizaciones de seguros agrícolas con validación de geocercas y notificaciones en tiempo real.

## 🚀 Stack Tecnológico

### **Backend Framework**
- **Hapi.js** - Framework web para Node.js
- **TypeScript** - Tipado estático para JavaScript
- **Node.js** - Runtime de JavaScript

### **Base de Datos**
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM moderno para TypeScript/Node.js
- **Docker** - Contenedorización de servicios

### **Autenticación & Seguridad**
- **JWT (@hapi/jwt)** - JSON Web Tokens para autenticación
- **bcrypt** - Hashing de contraseñas
- **CORS** - Cross-Origin Resource Sharing

### **Validación & Serialización**
- **Zod** - Validación de esquemas en runtime
- **Hapi Validation Plugin** - Middleware de validación personalizado

### **Mensajería & Notificaciones**
- **RabbitMQ** - Sistema de mensajería asíncrona
- **WebSocket (ws)** - Comunicación en tiempo real
- **AMQP** - Protocolo de mensajería

### **Geolocalización**
- **Turf.js** - Análisis geoespacial y cálculo de áreas
- **GeoJSON** - Formato estándar para datos geográficos

### **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **Docker Compose** - Orquestación de contenedores
- **Adminer** - Interfaz web para PostgreSQL

## 📋 Prerrequisitos

- **Node.js** 18+ 
- **Docker** y **Docker Compose**
- **npm** o **yarn**

## 🛠️ Instalación y Configuración

### 1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cotizador-server
```

### 2. **Configurar variables de entorno**
```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus valores
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hapi_db"
JWT_SECRET="tu_jwt_secret_super_seguro"
JWT_AUDIENCE="cotizador-app"
JWT_ISSUER="cotizador-server"
RABBITMQ_URL="amqp://admin:admin@localhost:5672"
PORT=4000
```

### 3. **Levantar servicios con Docker**
```bash
# Levantar PostgreSQL y RabbitMQ
docker compose up -d

# Verificar que los servicios estén corriendo
docker compose ps
```

**Servicios disponibles:**
- **PostgreSQL**: `localhost:5432`
- **RabbitMQ**: `localhost:5672` (AMQP), `localhost:15672` (Web UI)
- **Adminer**: `localhost:8080` (Gestión de BD)

### 4. **Instalar dependencias**
```bash
npm install
```

### 5. **Configurar Prisma**
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Aplicar migraciones
npm run prisma:migrate

# Ver estado de la base de datos
npm run prisma:studio
```

### 6. **Poblar base de datos**
```bash
# Ejecutar seed con datos iniciales
npm run seed
```

**Datos creados:**
- Usuario admin: `admin@example.com` / `admin123`
- Usuario regular: `user@example.com` / `user123`
- Estados y cultivos de ejemplo

## 🚀 Ejecutar el Proyecto

### **Primera vez (desarrollo)**
```bash
# 1. Asegurar que Docker esté corriendo
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Generar cliente Prisma
npm run prisma:generate

# 4. Aplicar migraciones
npm run prisma:migrate

# 5. Poblar datos
npm run seed

# 6. Iniciar servidor
npm run dev
```

### **Ejecuciones posteriores**
```bash
# Solo levantar servicios si no están corriendo
docker compose up -d

# Iniciar servidor
npm run dev
```

### **Comandos disponibles**
```bash
npm run dev          # Inicia servidor en modo desarrollo
npm run build        # Compila TypeScript
npm run start        # Ejecuta versión compilada
npm run prisma:generate  # Genera cliente Prisma
npm run prisma:migrate   # Aplica migraciones
npm run prisma:studio    # Abre interfaz web de Prisma
npm run seed             # Pobla base de datos
```

## 🌐 Endpoints de la API

### **Autenticación**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión

### **Usuarios**
- `GET /me` - Obtener perfil del usuario autenticado

### **Estados**
- `GET /states` - Listar estados (con paginación y filtros)

### **Cultivos**
- `GET /crops` - Listar cultivos (con paginación y filtros)

### **Cotizaciones**
- `POST /quotations` - Crear cotización
- `GET /quotations` - Listar cotizaciones (con filtros)
- `GET /quotations/{id}` - Obtener cotización específica

## 🔌 WebSocket y Notificaciones

### **Conexión WebSocket**
```javascript
const ws = new WebSocket("ws://localhost:4001");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.text); // Mensaje de notificación
};
```

### **Tipos de Notificaciones**
- **Alerta de área alta**: Cotizaciones con >500 hectáreas
- **Notificación regular**: Todas las cotizaciones creadas

### **Estructura de Mensajes**
```json
{
  "type": "HIGH_AREA_ALERT",
  "text": "⚠️ Se ha registrado una solicitud de cotización con 750.50 hectáreas aseguradas",
  "quotationId": 1,
  "clientName": "Estancia San Miguel",
  "insuredArea": 750.50,
  "insuredAmount": 85000
}
```

## 🗄️ Estructura de la Base de Datos

### **Modelos principales**
- **User** - Usuarios del sistema (ADMIN/USER)
- **UserPassword** - Contraseñas hasheadas
- **Quotation** - Solicitudes de cotización
- **Crop** - Cultivos disponibles
- **State** - Estados/regiones

### **Relaciones**
- User ↔ UserPassword (1:1)
- User ↔ Quotation (1:N)
- Quotation ↔ Crop (N:1)
- Quotation ↔ State (N:1)

## 🔧 Desarrollo

### **Estructura del proyecto**
```
src/
├── lib/           # Utilidades (hash, geofence)
├── plugins/       # Plugins de Hapi (auth, validation)
├── routes/        # Definición de endpoints
├── schemas/       # Esquemas de validación Zod
├── services/      # Lógica de negocio
├── types/         # Tipos TypeScript
└── server.ts      # Punto de entrada
```

### **Validación de datos**
- **Zod** para validación de payloads y queries
- **Middleware personalizado** para integración con Hapi
- **Coerción automática** de tipos (string → number)

### **Autenticación**
- **JWT** en header Authorization: Bearer
- **Scope-based access control** (ADMIN/USER)
- **Protección automática** de rutas

## 🐛 Troubleshooting

### **Problemas comunes**

**1. Error de conexión a PostgreSQL**
```bash
# Verificar que Docker esté corriendo
docker compose ps

# Reiniciar servicios
docker compose restart db
```

**2. Error de migración Prisma**
```bash
# Resetear base de datos
npm run prisma:migrate:reset

# Aplicar migraciones desde cero
npm run prisma:migrate
```

**3. Error de RabbitMQ**
```bash
# Verificar estado del servicio
docker compose logs rabbitmq

# Reiniciar RabbitMQ
docker compose restart rabbitmq
```

**4. Error de validación**
```bash
# Verificar esquemas Zod
npm run build

# Revisar logs del servidor
npm run dev
```

## 📝 Notas de Desarrollo

- **Puerto del servidor**: 4000 (configurable en .env)
- **Puerto WebSocket**: 4001 (separado del servidor HTTP)
- **Validación automática**: Todas las rutas están protegidas por defect excepto login y logout
- **Coerción de tipos**: Los query parameters se convierten automáticamente
- **Reconexión automática**: RabbitMQ se reconecta automáticamente
