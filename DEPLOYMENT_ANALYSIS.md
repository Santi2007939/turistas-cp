# 📊 Análisis de Servicios y Despliegue - Turistas CP

## 📋 Resumen Diagnóstico para IA

### Descripción de la Aplicación
**Turistas CP** es una plataforma web de entrenamiento para programación competitiva construida con MEAN Stack (MongoDB, Express, Angular, Node.js). Está diseñada para equipos pequeños de programación competitiva con funcionalidades de seguimiento de problemas, roadmaps personalizados, calendario de concursos, estadísticas y colaboración.

### Arquitectura Actual

#### Frontend (Cliente)
- **Tecnología:** Angular 19
- **Framework CSS:** Tailwind CSS
- **Tipo:** Single Page Application (SPA)
- **Build:** Genera archivos estáticos en `client/dist/`
- **Configuración de desarrollo:** `http://localhost:4200`
- **Configuración de producción:** Requiere URL de API configurada

#### Backend (Servidor)
- **Tecnología:** Node.js v18+ con Express.js
- **Puerto:** 3000 (configurable)
- **Tipo:** API RESTful
- **Dependencias principales:**
  - Express 4.18.2
  - Mongoose 8.0.3 (ORM para MongoDB)
  - JWT para autenticación
  - bcryptjs para encriptación de contraseñas
  - crypto-js para encriptación adicional
  - axios para llamadas HTTP externas
  - puppeteer-core 24.32.1 (para integración con USACO IDE)

#### Base de Datos
- **Tecnología:** MongoDB
- **Configuración actual:** MongoDB Atlas (cloud)
- **Modelos principales:**
  - User (usuarios con roles admin/user)
  - Problem (problemas de programación)
  - Contest (concursos)
  - Theme (temas/categorías)
  - Achievement (logros)
  - CustomAchievement (logros personalizados)
  - CalendarEvent (eventos del calendario)
  - TeamConfig (configuración del equipo)
  - PersonalNode (nodos personales para roadmaps)

#### Integraciones Externas (APIs de Terceros)
1. **Codeforces API** - Información de usuarios y concursos (GRATIS)
2. **RPC (Red de Programación Competitiva)** - Calendario de concursos (GRATIS)
3. **USACO IDE** - Ejecución de código online (GRATIS, usa puppeteer)
4. **Excalidraw** - Pizarra colaborativa (GRATIS, enlace externo)

### Variables de Entorno Requeridas (.env)

```env
# Configuración del servidor
NODE_ENV=production
PORT=3000

# Base de datos (MongoDB Atlas)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/turistas_cp

# Seguridad JWT
JWT_SECRET=clave-secreta-segura-aqui
JWT_EXPIRES_IN=7d

# Encriptación
ENCRYPTION_KEY=clave-de-32-caracteres-exactos

# CORS - URL del cliente frontend
CLIENT_URL=https://tu-dominio.com

# Integraciones (URLs públicas)
USACO_IDE_URL=https://ide.usaco.guide
EXCALIDRAW_URL=https://excalidraw.com
RPC_SCHEDULE_URL=https://redprogramacioncompetitiva.com/contests

# Configuración del equipo
TEAM_NAME=Team Turistas
TEAM_DESCRIPTION=Equipo oficial de programación competitiva
TEAM_MAX_MEMBERS=50
TEAM_WHATSAPP_GROUP=https://chat.whatsapp.com/tu-enlace
TEAM_DISCORD_SERVER=https://discord.gg/tu-enlace
```

### Requisitos de Infraestructura

#### Capacidad Esperada
- **Usuarios concurrentes:** Máximo 5 personas simultáneamente
- **Tráfico estimado:** Muy bajo (~100-500 req/día)
- **Almacenamiento DB:** < 1 GB (pequeños equipos de programación)
- **Ancho de banda:** Mínimo

#### Requisitos Técnicos
- **Node.js:** v18 o superior
- **Memoria RAM:** 512 MB - 1 GB (backend ligero)
- **CPU:** 1 vCPU suficiente
- **Almacenamiento:** 1-2 GB para aplicación + logs
- **Base de datos:** MongoDB (cloud - Atlas Tier Gratuito viable)

#### Seguridad
- Variables de entorno protegidas (.env NO debe exponerse)
- HTTPS obligatorio en producción
- JWT para autenticación
- Encriptación de contraseñas con bcryptjs
- CORS configurado para permitir solo el dominio del frontend

## 🚀 Servicios Identificados

### Servicios a Desplegar

1. **Servicio Frontend (Angular SPA)**
   - Archivos estáticos HTML/CSS/JS
   - Requiere servidor web estático o CDN
   - Tamaño estimado: ~5-10 MB

2. **Servicio Backend (Node.js API)**
   - Aplicación Node.js Express
   - Puerto 3000
   - Debe estar siempre en ejecución
   - Requiere PM2 o similar para gestión de procesos

3. **Servicio de Base de Datos (MongoDB)**
   - MongoDB Atlas (ya en la nube)
   - Sin costo adicional en tier gratuito (hasta 512 MB)

### Dependencias de Build
- **Frontend:** Node.js + npm para `ng build`
- **Backend:** Node.js + npm para dependencias
- **No requiere:** Docker (aunque recomendable para facilitar despliegue)

## 💰 Opciones de Despliegue Recomendadas

### Opción 1: Render (RECOMENDADA) - $0-7/mes
**Características:**
- ✅ Tier gratuito disponible para empezar
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS gratuito
- ✅ Variables de entorno seguras
- ✅ Fácil escalabilidad
- ✅ Soporte Node.js nativo

**Costos:**
- Plan Gratuito: $0/mes
  - Backend: Web Service Free (duerme después de 15 min inactividad)
  - Frontend: Static Site Free
  - Limitación: Reinicio automático cada 15 min sin uso
- Plan Starter: $7/mes (POR SERVICIO)
  - Sin suspensión automática
  - 512 MB RAM, compartido
  - Para 5 usuarios: $7/mes backend + Static Site gratis = **$7/mes total**
- MongoDB Atlas: Tier M0 gratuito (512 MB)

**Total estimado:** $0-84/año (dentro del presupuesto)

**Pasos de despliegue:**
1. Crear cuenta en Render.com
2. Conectar repositorio GitHub
3. Crear Static Site para el frontend (build: `cd client && npm install && npm run build`)
4. Crear Web Service para el backend (build: `cd server && npm install`)
5. Configurar variables de entorno en Render
6. MongoDB Atlas tier gratuito

### Opción 2: Railway - $5-10/mes
**Características:**
- ✅ $5 crédito gratuito mensual
- ✅ Despliegue desde GitHub
- ✅ Variables de entorno seguras
- ✅ HTTPS incluido
- ✅ Muy simple de usar

**Costos:**
- Crédito gratuito: $5/mes
- Uso real estimado: ~$5-8/mes para ambos servicios
- MongoDB Atlas: Gratuito

**Total estimado:** $0-96/año

### Opción 3: Vercel (Frontend) + Render/Railway (Backend) - $0-7/mes
**Características:**
- ✅ Vercel excelente para Angular/SPA
- ✅ CDN global incluido
- ✅ Tier gratuito muy generoso

**Costos:**
- Frontend en Vercel: $0/mes (tier gratuito suficiente)
- Backend en Render Free o Railway: $0-7/mes
- MongoDB Atlas: Gratuito

**Total estimado:** $0-84/año

### Opción 4: DigitalOcean App Platform - $5/mes
**Características:**
- ✅ Plataforma confiable
- ✅ $200 crédito inicial (60 días)
- ⚠️ Sin tier gratuito permanente

**Costos:**
- App Platform Basic: $5/mes (1 contenedor)
- Static Site: Gratis
- MongoDB Atlas: Gratuito

**Total estimado:** $60/año

### Opción 5: Netlify (Frontend) + Backend Serverless - Complejo
**No recomendado** para esta aplicación porque:
- El backend no está diseñado para serverless
- Requiere refactorización significativa
- Puppeteer no funciona bien en serverless

## 🎯 Mi Recomendación Final

### OPCIÓN GANADORA: Render (Plan Starter Backend + Static Site Frontend)

**Costo Total: $7/mes = $84/año** ✅ (Dentro del presupuesto de $200)

**Justificación:**

1. **Simplicidad**: Configuración en menos de 30 minutos
2. **Confiabilidad**: Servicio 24/7 sin suspensión
3. **Seguridad**: Variables de entorno protegidas, HTTPS automático
4. **Escalabilidad**: Fácil upgrade si crece el equipo
5. **Despliegue continuo**: Auto-deploy desde GitHub
6. **Soporte**: Node.js nativo, sin contenedores necesarios
7. **Gratuito para frontend**: Static Site no tiene costo

**Por qué NO usar el tier gratuito:**
- El backend free se suspende después de 15 min de inactividad
- Reinicio puede tomar 30-60 segundos (mala UX)
- Para 5 usuarios activos, es mejor $7/mes por disponibilidad constante

### Plan Alternativo de Bajo Costo (Tier Gratuito Total)

Si el presupuesto es crítico, puedes empezar con:
- **Render Free** (backend + frontend): $0/mes
- **MongoDB Atlas M0**: $0/mes
- **Total: $0/mes**

**Limitaciones:**
- Backend se suspende tras 15 min sin uso
- Primera carga puede tardar ~30s después de inactividad
- Para 5 usuarios ocasionales, puede ser aceptable

**Upgrade cuando sea necesario** a $7/mes.

## 📝 Pasos para Desplegar en Render

### Preparación del Repositorio

1. **Crear archivo `render.yaml` en la raíz:**

```yaml
services:
  # Backend API
  - type: web
    name: turistas-cp-api
    runtime: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: ENCRYPTION_KEY
        generateValue: true
      - key: CLIENT_URL
        sync: false
      - key: TEAM_NAME
        value: Team Turistas
      - key: TEAM_DESCRIPTION
        value: Equipo oficial de programación competitiva
      - key: TEAM_MAX_MEMBERS
        value: 50
    healthCheckPath: /health

  # Frontend Static Site
  - type: web
    name: turistas-cp-frontend
    runtime: static
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/dist/client/browser
    envVars:
      - key: NODE_ENV
        value: production
```

2. **Actualizar `environment.prod.ts` para usar variable de entorno:**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://turistas-cp-api.onrender.com', // URL de tu backend
  teamName: 'Team Turistas'
};
```

### Despliegue

1. **Conectar Render a GitHub:**
   - Ir a https://dashboard.render.com
   - Sign up / Login con GitHub
   - Autorizar acceso al repositorio

2. **Crear servicios desde el dashboard:**
   - Usar "New → Blueprint" y seleccionar `render.yaml`
   - O crear manualmente cada servicio

3. **Configurar MongoDB Atlas:**
   - Crear cluster gratuito en https://cloud.mongodb.com
   - Crear usuario de base de datos
   - Whitelist IPs de Render (o permitir desde cualquier lugar: 0.0.0.0/0)
   - Copiar connection string

4. **Configurar variables de entorno en Render:**
   - `MONGODB_URI`: Pegar connection string de Atlas
   - `CLIENT_URL`: URL del frontend en Render (ej: https://turistas-cp.onrender.com)
   - Las demás se auto-generan o usan valores por defecto

5. **Deploy:**
   - Render automáticamente hace build y deploy
   - Esperar ~5-10 minutos
   - Verificar en URLs proporcionadas

## 🔒 Seguridad del .env

### Buenas Prácticas Implementadas

1. **Variables de entorno en plataforma:** Render/Railway guardan secretos encriptados
2. **.gitignore:** El archivo `.env` está excluido del repositorio
3. **Ejemplo incluido:** `.env.example` sin valores sensibles
4. **JWT y encriptación:** Usar generadores automáticos de Render
5. **CORS restrictivo:** Solo permite requests desde CLIENT_URL configurado

### Recomendaciones Adicionales

- Rotar JWT_SECRET cada 6 meses
- Usar MongoDB Atlas con autenticación de usuario
- Habilitar IP Whitelist en MongoDB Atlas
- Monitorear logs de acceso en Render
- Implementar rate limiting (ya hay validación con express-validator)

## 📊 Comparación de Costos Anuales

| Plataforma | Costo Mensual | Costo Anual | Tier Gratuito | Recomendación |
|------------|---------------|-------------|---------------|---------------|
| **Render Starter** | $7 | $84 | Sí (limitado) | ⭐ MEJOR OPCIÓN |
| Railway | $5-10 | $60-120 | $5/mes crédito | Buena alternativa |
| Vercel + Render | $0-7 | $0-84 | Sí | Opción económica |
| DigitalOcean | $5 | $60 | No | Viable pero sin free tier |
| Render Free | $0 | $0 | Sí | Solo para pruebas |

Todas las opciones están **DENTRO del presupuesto de $200/año**.

## 🎓 Conclusión

Para un equipo pequeño (≤5 usuarios) con presupuesto limitado ($200/año):

**Recomiendo Render con Plan Starter ($84/año)** porque ofrece:
- ✅ Mejor balance costo/rendimiento
- ✅ Configuración simple sin conocimientos de DevOps
- ✅ Disponibilidad 24/7 sin suspensiones
- ✅ Variables de entorno seguras
- ✅ HTTPS automático
- ✅ Auto-deploy desde GitHub
- ✅ Escalabilidad futura
- ✅ 65% del presupuesto restante como margen

**Plan de contingencia:** Si el presupuesto es muy ajustado, comenzar con Render Free ($0/mes) y actualizar cuando sea necesario.

---

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Angular Production Build](https://angular.io/guide/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
