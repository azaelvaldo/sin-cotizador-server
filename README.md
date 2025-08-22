# Cotizador Server

Backend para sistema de cotizaciones agrícolas con validación de geocercas y notificaciones en tiempo real.

## �� Stack

- **Backend**: Hapi.js + TypeScript + Node.js
- **Database**: PostgreSQL + Prisma + Docker
- **Auth**: JWT + bcrypt
- **Validation**: Zod + custom Hapi plugin
- **Messaging**: RabbitMQ + WebSocket
- **Geolocation**: Turf.js + GeoJSON

## 📋 Prerrequisitos

- Node.js 18+
- Docker + Docker Compose
- npm

## ��️ Setup Rápido

### 1. **Configurar entorno**
```bash
git clone <repo>
cd cotizador-server
cp .env.example .env
# Editar .env con tus valores
```

### 2. **Levantar servicios**
```bash
docker compose up -d
npm install
```

### 3. **Configurar base de datos**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 4. **Ejecutar**
```bash
npm run dev

o

npm run build
npm start
```

## 🌐 API Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/logout` | Logout | ❌ |
| GET | `/me` | Perfil usuario | ✅ |
| GET | `/states` | Listar estados | ✅ |
| GET | `/crops` | Listar cultivos | ✅ |
| POST | `/quotations` | Crear cotización | ✅ |
| GET | `/quotations` | Listar cotizaciones | ✅ |
| GET | `/quotations/{id}` | Obtener cotización | ✅ |

## �� WebSocket

**Conexión**: `ws://localhost:4001`

**Ejemplo de uso**:
```javascript
const ws = new WebSocket("ws://localhost:4001");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.text); // Mensaje de notificación
};
```

**Tipos de mensajes**:
- `HIGH_AREA_ALERT`: Cotizaciones >500 hectáreas
- `QUOTATION_CREATED`: Todas las cotizaciones

## ��️ Base de Datos

**Modelos**: User, UserPassword, Quotation, Crop, State

**Relaciones**: User ↔ Quotation (1:N), Quotation ↔ Crop/State (N:1)

## 🔧 Comandos Útiles

```bash
npm run dev              # Desarrollo
npm run build            # Compilar
npm run prisma:studio    # Ver BD
npm run prisma:migrate   # Migraciones
npm run seed             # Datos iniciales
```

## �� Troubleshooting

| Problema | Solución |
|----------|----------|
| Error PostgreSQL | `docker compose restart db` |
| Error migración | `npm run prisma:migrate:reset` |
| Error RabbitMQ | `docker compose restart rabbitmq` |

## 📝 Notas

- **Puerto servidor**: 4000
- **Puerto WebSocket**: 4001
- **Auth automático**: Todas las rutas protegidas excepto login/logout
- **Coerción automática**: Query params string → number
- **Reconexión automática**: RabbitMQ

## 🚀 Áreas de Mejora

### **Seguridad**
- **Cookies seguras**: Implementar `httpOnly`, `secure`, `sameSite` para producción
- **Rate limiting**: Proteger endpoints contra ataques de fuerza bruta
- **CORS restrictivo**: Limitar orígenes permitidos en producción

### **Performance & Escalabilidad**
- **Redis Cache**: Cachear consultas frecuentes (estados, cultivos, usuarios)
- **Indexación**: Agregar índices en campos de búsqueda y filtrado

### **Testing**
- **Unit tests**: Jest para servicios y utilidades
- **Integration tests**: Tests de endpoints y base de datos
- **E2E tests**: Tests completos del flujo de usuario
- **Test coverage**: Mínimo 80% de cobertura
- **Mocking**: Mocks para servicios externos (RabbitMQ, DB)

### **API & Documentación**
- **OpenAPI/Swagger**: Documentación automática de endpoints
- **API versioning**: Versionado de endpoints para compatibilidad

### **Autenticación & Autorización**
- **OAuth 2.0**: Integración con proveedores externos
- **Role-based access**: Sistema de permisos granular
- **Session management**: Manejo de sesiones múltiples
- **JWT refresh**: Tokens de refresco para mayor seguridad