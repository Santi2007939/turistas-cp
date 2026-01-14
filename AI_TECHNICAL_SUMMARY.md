# 🤖 Resumen Técnico para IA - Turistas CP

Este documento está optimizado para ser leído por sistemas de IA que necesiten entender rápidamente la arquitectura y requisitos de despliegue de esta aplicación.

## Resumen Ejecutivo

**Aplicación:** Plataforma web de entrenamiento para programación competitiva
**Stack:** MEAN (MongoDB, Express, Angular, Node.js)
**Usuarios objetivo:** Máximo 5 usuarios concurrentes
**Presupuesto:** Máximo $200 USD anuales
**Requisito crítico:** Protección del archivo .env

## Arquitectura Técnica

### Componentes

1. **Frontend (SPA - Static Site)**
   - Framework: Angular 19
   - Build output: Archivos estáticos (HTML, CSS, JS)
   - Tamaño: ~5-10 MB
   - Necesita: Servidor web estático o CDN
   - Configuración: Variable de entorno `apiUrl` apunta al backend

2. **Backend (API RESTful)**
   - Runtime: Node.js 18+
   - Framework: Express.js 4.18.2
   - Puerto: 3000 (configurable)
   - Proceso: Debe ejecutarse permanentemente
   - Dependencias críticas:
     - mongoose: Conexión a MongoDB
     - jsonwebtoken: Autenticación
     - bcryptjs: Hash de contraseñas
     - puppeteer-core: Para integración USACO IDE (requiere Chrome)

3. **Base de Datos**
   - Tipo: MongoDB
   - Configuración actual: MongoDB Atlas (cloud)
   - Tamaño estimado: < 512 MB
   - Conexión: URI de MongoDB Atlas con autenticación

4. **Integraciones Externas (Solo APIs HTTP)**
   - Codeforces API (lectura)
   - RPC - Red de Programación Competitiva (scraping)
   - USACO IDE (uso de puppeteer)
   - Excalidraw (enlaces externos)

### Requisitos de Infraestructura

```yaml
Recursos mínimos:
  CPU: 1 vCPU compartido
  RAM: 512 MB - 1 GB
  Almacenamiento: 1-2 GB
  Ancho de banda: Mínimo (< 10 GB/mes)
  Región: Cualquiera (preferencia: Americas)

Características necesarias:
  - Runtime Node.js 18+
  - Variables de entorno seguras
  - HTTPS/SSL
  - Despliegue desde Git
  - Auto-restart en caso de crash
```

### Variables de Entorno Críticas

```env
# Seguridad (SECRETAS)
MONGODB_URI=mongodb+srv://...              # Connection string completo
JWT_SECRET=string-aleatorio-256-bits        # Para firmar tokens
ENCRYPTION_KEY=string-32-caracteres         # Para encriptación adicional

# Configuración
NODE_ENV=production
PORT=3000
CLIENT_URL=https://frontend-url.com         # URL del frontend para CORS
JWT_EXPIRES_IN=7d

# Integraciones (URLs públicas)
USACO_IDE_URL=https://ide.usaco.guide
EXCALIDRAW_URL=https://excalidraw.com
RPC_SCHEDULE_URL=https://redprogramacioncompetitiva.com/contests

# Configuración del equipo
TEAM_NAME=Team Turistas
TEAM_DESCRIPTION=Descripción del equipo
TEAM_MAX_MEMBERS=50
TEAM_WHATSAPP_GROUP=https://...             # Opcional
TEAM_DISCORD_SERVER=https://...             # Opcional
```

## Análisis de Plataformas de Despliegue

### Compatibilidad con Plataformas

| Plataforma | Frontend | Backend | Costo/año | Recomendada |
|------------|----------|---------|-----------|-------------|
| **Render** | ✅ Static | ✅ Web Service | $0-84 | ⭐⭐⭐⭐⭐ |
| Railway | ✅ Static | ✅ Web Service | $0-120 | ⭐⭐⭐⭐ |
| Vercel | ✅ Excelente | ❌ Serverless* | $0-84 | ⭐⭐⭐ |
| Netlify | ✅ Excelente | ❌ Serverless* | $0-84 | ⭐⭐⭐ |
| DigitalOcean App Platform | ✅ Static | ✅ App | $60 | ⭐⭐⭐ |
| Heroku | ✅ Static | ✅ Dyno | $120+ | ⭐⭐ |
| AWS Amplify | ✅ Static | ✅ Lambda* | Variable | ⭐⭐ |
| Google Cloud Run | ✅ Static | ✅ Container | Variable | ⭐⭐ |
| Azure App Service | ✅ Static | ✅ Web App | $156+ | ⭐ |
| VPS (DigitalOcean, Linode) | ✅ Nginx | ✅ PM2 | $48+ | ⭐⭐ |

*Serverless requiere refactorización del backend (no recomendado)

### Restricciones Importantes

1. **Puppeteer:** Requiere Chrome headless
   - ✅ Funciona: Render, Railway, DigitalOcean, VPS
   - ❌ Problemático: Vercel, Netlify, AWS Lambda (límites de tamaño)

2. **Proceso persistente:** Backend necesita estar siempre activo
   - ✅ Web Services: Render, Railway, DO App Platform
   - ❌ Serverless: Vercel, Netlify Functions (requiere refactorización)

3. **Variables de entorno:**
   - Todas las plataformas las soportan de forma segura
   - Render/Railway: Encriptadas en reposo
   - Vercel/Netlify: Encriptadas en reposo

## Recomendación de IA

### Opción Óptima: Render

**Justificación técnica:**

1. **Compatibilidad completa:**
   - ✅ Node.js nativo (no requiere contenedorización)
   - ✅ Puppeteer funciona out-of-the-box
   - ✅ Despliegue directo desde Git
   - ✅ Variables de entorno seguras

2. **Costo-beneficio:**
   - Tier gratuito disponible (con limitación de sleep)
   - Plan Starter: $7/mes = $84/año (dentro de presupuesto)
   - Frontend static site: Gratis
   - Total: $84/año (42% del presupuesto)

3. **Simplicidad operacional:**
   - Auto-deploy desde GitHub
   - Rollback con un clic
   - Logs integrados
   - Health checks automáticos
   - HTTPS automático con Let's Encrypt

4. **Arquitectura de despliegue:**
   ```
   GitHub Repository
        ↓
   [Render Blueprint: render.yaml]
        ↓
   ┌─────────────────────┬──────────────────────┐
   │  Static Site        │  Web Service         │
   │  (Frontend)         │  (Backend)           │
   │  - Build Angular    │  - npm install       │
   │  - Sirve archivos   │  - npm start         │
   │  - Gratis           │  - $7/mes (Starter)  │
   └─────────────────────┴──────────────────────┘
              ↓                      ↓
   [CDN Cloudflare]      [Conexión a MongoDB Atlas]
   ```

5. **Escalabilidad futura:**
   - Fácil upgrade a planes superiores
   - Auto-scaling disponible en planes mayores
   - Integración con Docker si se necesita

### Configuración de Seguridad

1. **Protección de .env:**
   - ✅ `.env` en `.gitignore` (ya configurado)
   - ✅ Variables en Render Dashboard (encriptadas)
   - ✅ `.env.example` para referencia (sin valores reales)

2. **Secrets management:**
   - MONGODB_URI: Configurado en Render, no en código
   - JWT_SECRET: Auto-generado o manual en Render
   - ENCRYPTION_KEY: Manual en Render (32 chars)

3. **CORS:**
   - Backend solo acepta requests desde CLIENT_URL
   - Configurado en variable de entorno

4. **HTTPS:**
   - Automático en Render (Let's Encrypt)
   - Forzado en producción

### Plan de Despliegue (30 minutos)

```bash
# Fase 1: Preparación (10 min)
1. Crear cuenta MongoDB Atlas → Cluster M0 gratuito
2. Crear cuenta Render.com → Conectar GitHub
3. Generar secrets (JWT_SECRET, ENCRYPTION_KEY)

# Fase 2: Backend (10 min)
1. Render → New Web Service
2. Conectar repositorio, carpeta: server/
3. Configurar variables de entorno
4. Deploy → Obtener URL del backend

# Fase 3: Frontend (10 min)
1. Actualizar environment.prod.ts con URL del backend
2. Render → New Static Site
3. Conectar repositorio, carpeta: client/
4. Build & Deploy → Obtener URL del frontend
5. Actualizar CLIENT_URL en backend

# Fase 4: Verificación (5 min)
1. Acceder a URL del frontend
2. Registrar primer usuario (auto-admin)
3. Verificar funcionalidades básicas
```

### Alternativa Low-Cost (Tier Gratuito Total)

Si el presupuesto es $0:

```yaml
Configuración:
  Frontend: Render Static Site (Gratis, permanente)
  Backend: Render Web Service Free (Gratis, con sleep)
  Database: MongoDB Atlas M0 (Gratis, permanente)

Limitaciones:
  - Backend sleep después de 15 min inactividad
  - Cold start: ~30-60 segundos
  - Aceptable para 5 usuarios ocasionales

Upgrade path:
  - Cuando se necesite: Backend a Starter $7/mes
  - Sin downtime en el cambio de plan
```

## Datos para Toma de Decisión

### Carga Esperada
- 5 usuarios concurrentes máximo
- ~10-50 requests/hora en horas activas
- Tráfico total: < 1000 requests/día
- Bandwidth: < 5 GB/mes
- CPU: < 5% uso promedio
- RAM: ~200-400 MB uso promedio

### Costos Proyectados

```
Escenario Mínimo ($0/año):
  - Render Free (Backend): $0
  - Render Static (Frontend): $0
  - MongoDB Atlas M0: $0
  - Total: $0/año
  - Trade-off: Sleep automático

Escenario Recomendado ($84/año):
  - Render Starter (Backend): $84/año
  - Render Static (Frontend): $0
  - MongoDB Atlas M0: $0
  - Total: $84/año
  - Beneficio: 24/7 availability

Escenario Escalado ($180/año):
  - Render Standard (Backend): $180/año
  - Render Static (Frontend): $0
  - MongoDB Atlas M2: $57/año
  - Total: $237/año
  - Para: 20+ usuarios, mejor performance
```

### Matriz de Decisión

Para **5 usuarios, $200 presupuesto**:

```
Prioridad | Factor                | Render | Railway | VPS
----------|----------------------|--------|---------|-----
1         | Seguridad .env       | ✅     | ✅      | ⚠️
2         | < $200/año          | ✅     | ✅      | ✅
3         | Simplicidad         | ✅     | ✅      | ❌
4         | Puppeteer support   | ✅     | ✅      | ✅
5         | Auto-deploy         | ✅     | ✅      | ❌
6         | HTTPS automático    | ✅     | ✅      | ❌
7         | No requiere DevOps  | ✅     | ✅      | ❌

Puntuación:              7/7      7/7     3/7
```

**Decisión:** Render (empate con Railway, pero mejor documentación y estabilidad)

## Comandos de Verificación

### Backend health check
```bash
curl https://turistas-cp-api.onrender.com/health
# Esperado: {"success":true,"message":"Turistas CP API is running",...}
```

### Frontend accessibility
```bash
curl -I https://turistas-cp.onrender.com
# Esperado: HTTP/2 200
```

### MongoDB connection
```bash
# Desde logs del backend en Render
# Buscar: "✅ MongoDB Connected: cluster0.xxxxx.mongodb.net"
```

## Conclusión para IA

**Para desplegar Turistas CP con 5 usuarios y presupuesto de $200/año:**

1. **Usar Render.com** con configuración:
   - Backend: Web Service Starter ($7/mes)
   - Frontend: Static Site (gratuito)
   - Database: MongoDB Atlas M0 (gratuito)

2. **Costo total:** $84/año (58% de margen en presupuesto)

3. **Tiempo de setup:** 30-45 minutos

4. **Seguridad del .env:** Garantizada (variables en Render Dashboard encriptadas)

5. **Mantenimiento:** Mínimo (auto-deploy, auto-restart, auto-HTTPS)

6. **Escalabilidad:** Fácil upgrade si crece el equipo

**Archivos requeridos en el repo:**
- ✅ `render.yaml` (creado)
- ✅ `.env.example` (ya existe)
- ✅ `.gitignore` con `.env` (ya configurado)
- ✅ `DEPLOYMENT_GUIDE.md` (creado)

**Próximo paso:** Seguir `DEPLOYMENT_GUIDE.md` para el despliegue real.
