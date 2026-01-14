# 🚀 Guía Rápida de Despliegue - Turistas CP

Esta guía proporciona instrucciones paso a paso para desplegar Turistas CP en producción con un presupuesto mínimo.

## 📋 Requisitos Previos

- Cuenta de GitHub (ya la tienes)
- Cuenta de MongoDB Atlas (gratuita)
- Cuenta de Render.com (gratuita)

## 🎯 Opción Recomendada: Render

**Costo:** $0/mes (tier gratuito) o $7/mes (sin suspensión automática)
**Tiempo estimado:** 30-45 minutos

### Paso 1: Configurar MongoDB Atlas (5 minutos)

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Crea un nuevo cluster:
   - Selecciona **M0 Free Tier**
   - Región: Elige la más cercana (ej: Oregon, Iowa)
   - Nombre: `turistas-cp-cluster`
4. Crear usuario de base de datos:
   - Database Access → Add New Database User
   - Usuario: `turistascp_user`
   - Contraseña: Genera una segura (guárdala)
   - Permisos: **Read and write to any database**
5. Configurar acceso de red:
   - Network Access → Add IP Address
   - Selecciona **Allow Access from Anywhere** (0.0.0.0/0)
   - Confirma
6. Obtener connection string:
   - Clusters → Connect → Connect your application
   - Driver: Node.js
   - Copia el string (ej: `mongodb+srv://turistascp_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Reemplaza `<password>` con tu contraseña real
   - Agrega el nombre de la base de datos: `mongodb+srv://turistascp_user:tu-password@cluster0.xxxxx.mongodb.net/turistas_cp?retryWrites=true&w=majority`

### Paso 2: Configurar Render.com (10 minutos)

1. Ve a https://dashboard.render.com/register
2. Regístrate con tu cuenta de GitHub
3. Autoriza a Render para acceder a tu repositorio

### Paso 3: Desplegar el Backend (10 minutos)

1. En el Dashboard de Render, haz clic en **New +** → **Web Service**
2. Conecta tu repositorio: `Santi2007939/turistas-cp`
3. Configuración del servicio:
   - **Name:** `turistas-cp-api`
   - **Region:** Oregon (o la más cercana)
   - **Branch:** `main` (o la rama que quieras desplegar)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (o Starter si quieres evitar suspensión automática - $7/mes)

4. **Variables de entorno** (hacer clic en "Advanced"):
   
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = (pegar tu connection string de MongoDB Atlas)
   JWT_SECRET = (generar con https://randomkeygen.com - 256-bit WPA key)
   JWT_EXPIRES_IN = 7d
   ENCRYPTION_KEY = (generar 32 caracteres aleatorios)
   CLIENT_URL = (dejar vacío por ahora, lo llenaremos después)
   USACO_IDE_URL = https://ide.usaco.guide
   EXCALIDRAW_URL = https://excalidraw.com
   RPC_SCHEDULE_URL = https://redprogramacioncompetitiva.com/contests
   TEAM_NAME = Team Turistas
   TEAM_DESCRIPTION = Equipo oficial de programación competitiva
   TEAM_MAX_MEMBERS = 50
   ```

5. Haz clic en **Create Web Service**
6. Espera a que el deploy termine (~5 minutos)
7. Copia la URL del servicio (ej: `https://turistas-cp-api.onrender.com`)

### Paso 4: Desplegar el Frontend (10 minutos)

1. En el Dashboard de Render, haz clic en **New +** → **Static Site**
2. Conecta el mismo repositorio: `Santi2007939/turistas-cp`
3. Configuración del sitio:
   - **Name:** `turistas-cp-frontend`
   - **Branch:** `main`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist/client/browser`

4. Haz clic en **Create Static Site**
5. Espera a que el build termine (~5-7 minutos)
6. Copia la URL del sitio (ej: `https://turistas-cp.onrender.com`)

### Paso 5: Actualizar Variables de Entorno (5 minutos)

1. **Actualizar CLIENT_URL en el backend:**
   - Ve al servicio `turistas-cp-api` en Render
   - Environment → Edit
   - Actualiza `CLIENT_URL` con la URL del frontend (ej: `https://turistas-cp.onrender.com`)
   - Guarda cambios (se redesplegará automáticamente)

2. **Actualizar apiUrl en el frontend:**
   - Edita el archivo `client/src/environments/environment.prod.ts` en tu repositorio:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://turistas-cp-api.onrender.com', // Tu URL del backend
     teamName: 'Team Turistas'
   };
   ```
   - Commit y push los cambios
   - Render automáticamente redesplegará el frontend

### Paso 6: Verificación (5 minutos)

1. Abre la URL del frontend en tu navegador
2. Intenta registrar un usuario (el primero será admin automáticamente)
3. Verifica que puedas hacer login
4. Navega por las diferentes secciones

**¡Listo!** Tu aplicación está desplegada.

## 🔄 Redepliegues Automáticos

Render automáticamente redesplegará tu aplicación cuando hagas push a la rama configurada en GitHub.

## 💰 Costos

### Opción 1: Tier Gratuito Total ($0/mes)
- **Backend:** Render Free
- **Frontend:** Render Static Site (gratis)
- **Base de datos:** MongoDB Atlas M0 (gratis)
- **Limitación:** El backend se suspende después de 15 min sin uso

### Opción 2: Recomendada ($7/mes = $84/año)
- **Backend:** Render Starter ($7/mes)
- **Frontend:** Render Static Site (gratis)
- **Base de datos:** MongoDB Atlas M0 (gratis)
- **Ventaja:** Sin suspensión automática, disponibilidad 24/7

## 🔧 Mantenimiento

### Ver logs del backend
1. Dashboard de Render → `turistas-cp-api` → Logs

### Ver logs del frontend
1. Dashboard de Render → `turistas-cp-frontend` → Logs

### Actualizar variables de entorno
1. Dashboard de Render → Servicio → Environment
2. Editar → Guardar (se redespliega automáticamente)

### Rollback a versión anterior
1. Dashboard de Render → Servicio → Events
2. Seleccionar deployment anterior → Rollback

## ⚠️ Troubleshooting

### El backend no arranca
- Verifica las variables de entorno, especialmente `MONGODB_URI`
- Revisa los logs para ver el error específico
- Asegúrate de que MongoDB Atlas permite conexiones desde 0.0.0.0/0

### El frontend no conecta al backend
- Verifica que `CLIENT_URL` en el backend coincida con la URL del frontend
- Verifica que `apiUrl` en `environment.prod.ts` apunte al backend correcto
- Revisa la consola del navegador para errores CORS

### Error 404 al recargar páginas del frontend
- Esto ya está configurado en `render.yaml` con las reglas de rewrite
- Si usas la configuración manual, agrega en Render:
  - Redirect/Rewrite Rules → `/*` → `/index.html` → Rewrite

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica la configuración de MongoDB Atlas
3. Consulta la [documentación de Render](https://render.com/docs)
4. Abre un issue en el repositorio

---

**Nota:** Si prefieres usar el archivo `render.yaml` incluido en el repositorio, simplemente:
1. Ve a Render Dashboard → New → Blueprint
2. Conecta el repositorio
3. Render detectará automáticamente `render.yaml` y creará ambos servicios
4. Solo necesitarás configurar las variables secretas (MONGODB_URI, ENCRYPTION_KEY, etc.)
