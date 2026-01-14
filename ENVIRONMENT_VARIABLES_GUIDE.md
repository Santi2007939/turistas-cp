# 🔧 Configuración de Variables de Entorno para Producción

## Variables de Entorno Requeridas

### 1. Variables de Seguridad (SECRETAS)

#### MONGODB_URI
**Descripción:** Connection string de MongoDB Atlas
**Dónde obtenerlo:** MongoDB Atlas Dashboard → Cluster → Connect → Connect your application

**Formato:**
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**Ejemplo:**
```
mongodb+srv://turistascp_user:MySecureP@ssw0rd@cluster0.abc123.mongodb.net/turistas_cp?retryWrites=true&w=majority
```

**Pasos:**
1. Crear cluster en MongoDB Atlas (tier M0 gratuito)
2. Crear usuario de base de datos con permisos de lectura/escritura
3. Permitir acceso desde todas las IPs (0.0.0.0/0) en Network Access
4. Copiar connection string y reemplazar `<password>` con la contraseña real
5. Agregar el nombre de la base de datos (ej: `turistas_cp`)

---

#### JWT_SECRET
**Descripción:** Clave secreta para firmar tokens JWT
**Cómo generarlo:** Usar un generador de claves aleatorias

**Opciones de generación:**

**Opción 1: Online (https://randomkeygen.com)**
- Usar "256-bit WPA Key" o "CodeIgniter Encryption Keys"

**Opción 2: Terminal (Linux/Mac)**
```bash
openssl rand -base64 32
```

**Opción 3: Node.js**
```javascript
require('crypto').randomBytes(32).toString('base64')
```

**Opción 4: Render auto-generate**
- En Render, usar `generateValue: true` (ya configurado en render.yaml)

**Ejemplo de valor:**
```
mK9x2vL3nP8qR5tY7wE1aS4dF6gH8jK0lZ9cV2bN5mQ8pO3iU6yT1rE4wQ7aS0dF
```

---

#### ENCRYPTION_KEY
**Descripción:** Clave de 32 caracteres para encriptación adicional con crypto-js
**Requisito:** DEBE tener exactamente 32 caracteres

**Cómo generarlo:**

**Opción 1: Terminal**
```bash
openssl rand -base64 32 | head -c 32
```

**Opción 2: Online**
- https://www.random.org/strings/
- Configurar: 32 caracteres, letras y números

**Opción 3: Node.js**
```javascript
require('crypto').randomBytes(24).toString('base64').substring(0, 32)
```

**Ejemplo de valor:**
```
a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6
```

**IMPORTANTE:** Debe tener EXACTAMENTE 32 caracteres.

---

#### CLIENT_URL
**Descripción:** URL del frontend para configuración de CORS
**Valor:** La URL donde está desplegado tu frontend

**Ejemplos:**
- Render: `https://turistas-cp.onrender.com`
- Vercel: `https://turistas-cp.vercel.app`
- Custom domain: `https://www.tudominio.com`

**Importante:**
- NO incluir barra final (/)
- Debe ser HTTPS en producción
- Debe coincidir exactamente con la URL del frontend

---

### 2. Variables de Configuración

#### NODE_ENV
**Valor:** `production`
**Descripción:** Indica que la app está en producción

#### PORT
**Valor:** `10000` (Render usa este puerto por defecto)
**Descripción:** Puerto donde corre el backend

#### JWT_EXPIRES_IN
**Valor:** `7d`
**Descripción:** Tiempo de expiración de los tokens JWT
**Opciones:**
- `1d` = 1 día
- `7d` = 7 días (recomendado)
- `30d` = 30 días
- `1h` = 1 hora

---

### 3. Variables de Integración (URLs Públicas)

#### USACO_IDE_URL
**Valor:** `https://ide.usaco.guide`
**Descripción:** URL del IDE de USACO

#### EXCALIDRAW_URL
**Valor:** `https://excalidraw.com`
**Descripción:** URL de Excalidraw para pizarra colaborativa

#### RPC_SCHEDULE_URL
**Valor:** `https://redprogramacioncompetitiva.com/contests`
**Descripción:** URL del calendario de la Red de Programación Competitiva

---

### 4. Variables de Configuración del Equipo

#### TEAM_NAME
**Valor:** `Team Turistas` (o el nombre de tu equipo)
**Descripción:** Nombre del equipo que se mostrará en la aplicación

#### TEAM_DESCRIPTION
**Valor:** `Equipo oficial de programación competitiva Team Turistas`
**Descripción:** Descripción del equipo

#### TEAM_MAX_MEMBERS
**Valor:** `50` (ajustar según necesidad)
**Descripción:** Número máximo de miembros permitidos en el equipo

#### TEAM_WHATSAPP_GROUP (Opcional)
**Valor:** `https://chat.whatsapp.com/tu-link-de-grupo`
**Descripción:** Link del grupo de WhatsApp del equipo

#### TEAM_DISCORD_SERVER (Opcional)
**Valor:** `https://discord.gg/tu-servidor`
**Descripción:** Link del servidor de Discord del equipo

---

## 📋 Checklist de Configuración en Render

### Backend Service

```
✅ NODE_ENV = production
✅ PORT = 10000
✅ MONGODB_URI = mongodb+srv://... (de MongoDB Atlas)
✅ JWT_SECRET = [generado aleatoriamente, 32+ caracteres]
✅ JWT_EXPIRES_IN = 7d
✅ ENCRYPTION_KEY = [exactamente 32 caracteres aleatorios]
✅ CLIENT_URL = https://tu-frontend.onrender.com
✅ USACO_IDE_URL = https://ide.usaco.guide
✅ EXCALIDRAW_URL = https://excalidraw.com
✅ RPC_SCHEDULE_URL = https://redprogramacioncompetitiva.com/contests
✅ TEAM_NAME = Team Turistas
✅ TEAM_DESCRIPTION = Equipo oficial de programación competitiva
✅ TEAM_MAX_MEMBERS = 50
⬜ TEAM_WHATSAPP_GROUP = (opcional)
⬜ TEAM_DISCORD_SERVER = (opcional)
```

---

## 🔐 Mejores Prácticas de Seguridad

### 1. Rotación de Secretos
- **JWT_SECRET:** Rotar cada 6 meses
- **ENCRYPTION_KEY:** Rotar anualmente (requiere migración de datos encriptados)
- **MongoDB password:** Rotar cada 3-6 meses

### 2. Almacenamiento Seguro
- ✅ Nunca commitear archivos `.env` a Git
- ✅ Usar gestores de contraseñas para guardar secrets
- ✅ No compartir secrets por email, Slack, o WhatsApp
- ✅ Dar acceso al Dashboard de Render solo a administradores

### 3. MongoDB Atlas
- ✅ Crear usuario específico para la aplicación (no usar usuario admin)
- ✅ Limitar permisos a solo la base de datos necesaria
- ✅ Habilitar 2FA en la cuenta de MongoDB Atlas
- ⚠️ En producción, considerar whitelist de IPs específicas en lugar de 0.0.0.0/0

### 4. Render Dashboard
- ✅ Habilitar 2FA en la cuenta de Render
- ✅ Limitar acceso al Dashboard a personas autorizadas
- ✅ Revisar logs periódicamente para detectar actividad sospechosa

---

## 🚨 Troubleshooting

### Error: "Invalid JWT Secret"
**Causa:** JWT_SECRET no está configurado o es muy corto
**Solución:** Generar un JWT_SECRET de al menos 32 caracteres

### Error: "MongoDB connection failed"
**Causa:** MONGODB_URI incorrecto o MongoDB Atlas bloqueando conexiones
**Solución:**
1. Verificar que el connection string es correcto
2. Verificar que la contraseña no tiene caracteres especiales sin escapar
3. Verificar Network Access en MongoDB Atlas (permitir 0.0.0.0/0)
4. Verificar que el cluster está activo (no pausado)

### Error: "Encryption key must be 32 characters"
**Causa:** ENCRYPTION_KEY no tiene exactamente 32 caracteres
**Solución:** Generar una clave de exactamente 32 caracteres

### Error: CORS blocked
**Causa:** CLIENT_URL no coincide con la URL del frontend
**Solución:**
1. Verificar que CLIENT_URL esté correctamente configurado
2. Verificar que no tenga barra final (/)
3. Verificar que sea HTTPS en producción

---

## 📝 Template de Variables para Copy-Paste

**Para usar en Render Dashboard:**

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@CLUSTER.mongodb.net/turistas_cp?retryWrites=true&w=majority
JWT_SECRET=GENERAR_32_CARACTERES_ALEATORIOS
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=EXACTAMENTE_32_CARACTERES_AQUI
CLIENT_URL=https://TU-FRONTEND.onrender.com
USACO_IDE_URL=https://ide.usaco.guide
EXCALIDRAW_URL=https://excalidraw.com
RPC_SCHEDULE_URL=https://redprogramacioncompetitiva.com/contests
TEAM_NAME=Team Turistas
TEAM_DESCRIPTION=Equipo oficial de programación competitiva Team Turistas
TEAM_MAX_MEMBERS=50
```

**Reemplazar:**
- `USUARIO`, `PASSWORD`, `CLUSTER` con tus datos de MongoDB Atlas
- `GENERAR_32_CARACTERES_ALEATORIOS` con JWT secret generado
- `EXACTAMENTE_32_CARACTERES_AQUI` con encryption key de 32 chars
- `TU-FRONTEND` con el nombre de tu frontend en Render

---

## ✅ Verificación Post-Despliegue

### 1. Verificar Backend
```bash
curl https://tu-backend.onrender.com/health
```
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Turistas CP API is running",
  "timestamp": "2024-01-14T...",
  "environment": "production"
}
```

### 2. Verificar Frontend
- Abrir `https://tu-frontend.onrender.com` en el navegador
- Verificar que carga correctamente
- Intentar registrar un usuario
- Verificar que el login funciona

### 3. Verificar MongoDB Connection
- Revisar logs del backend en Render
- Buscar mensaje: `✅ MongoDB Connected: cluster0.xxxxx.mongodb.net`

### 4. Verificar CORS
- En la consola del navegador (F12)
- No debe haber errores de CORS
- Las peticiones al backend deben funcionar

---

**Nota:** Guarda este documento como referencia para futuras configuraciones o troubleshooting.
