# 📝 Notas Técnicas y Aclaraciones

## Configuración de Puertos

### Puerto en Desarrollo vs Producción

**Desarrollo (local):**
- Backend corre en puerto **3000** (configurado en `.env`)
- Frontend corre en puerto **4200** (Angular dev server)
- Acceso: `http://localhost:3000` y `http://localhost:4200`

**Producción (Render):**
- Backend corre en puerto **10000** (estándar de Render para web services)
- El puerto se asigna automáticamente vía variable `PORT` del entorno
- El código en `app.js` usa `process.env.PORT || 3000` para ser flexible
- Frontend se sirve como archivos estáticos (no usa puerto)
- Acceso: URLs de Render con HTTPS (ej: `https://turistas-cp-api.onrender.com`)

**¿Por qué puertos diferentes?**
- Render asigna automáticamente el puerto 10000 a web services
- La aplicación detecta automáticamente el puerto correcto vía `process.env.PORT`
- No requiere cambios en el código, funciona en ambos ambientes

## Estructura de Build de Angular

### Angular 19 - Application Builder

Angular 19 utiliza el nuevo `application builder` que genera una estructura diferente:

**Output del build:**
```
client/
  dist/
    client/
      browser/        ← Archivos servibles del frontend
        index.html
        main-*.js
        polyfills-*.js
        styles-*.css
        assets/
```

**Configuración en angular.json:**
```json
{
  "outputPath": "dist/client",
  "builder": "@angular-devkit/build-angular:application"
}
```

El nuevo builder coloca los archivos en `dist/client/browser/` (antes era solo `dist/client/`).

**Configuración de Render:**
- `staticPublishPath: client/dist/client/browser`
- Esta ruta es relativa a la raíz del repositorio
- Sirve el contenido de la carpeta `browser/` que contiene el app compilado

## Variables de Entorno en Diferentes Contextos

### Desarrollo Local (.env file)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://...
CLIENT_URL=http://localhost:4200
```

### Producción (Render Dashboard)
```env
NODE_ENV=production
PORT=10000  # Asignado automáticamente por Render
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://tu-frontend.onrender.com
```

## Configuración de CORS

El backend tiene CORS configurado para aceptar requests desde `CLIENT_URL`:

**Desarrollo:**
```javascript
origin: process.env.CLIENT_URL || 'http://localhost:4200'
```

**Producción:**
```javascript
origin: process.env.CLIENT_URL // ej: https://turistas-cp.onrender.com
```

Es crítico que `CLIENT_URL` coincida EXACTAMENTE con la URL del frontend, incluyendo:
- Protocolo (http/https)
- Dominio completo
- Sin barra final (/)

## Actualización del Frontend para Producción

### Paso 1: Desplegar el backend primero
1. Deploy backend en Render
2. Obtener URL (ej: `https://turistas-cp-api.onrender.com`)

### Paso 2: Actualizar environment.prod.ts
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://turistas-cp-api.onrender.com', // URL real del backend
  teamName: 'Team Turistas'
};
```

### Paso 3: Commit y push
```bash
git add client/src/environments/environment.prod.ts
git commit -m "Update production API URL"
git push
```

### Paso 4: Desplegar el frontend
- Render detectará el cambio automáticamente
- Rebuild del frontend con la nueva URL
- El frontend ahora apunta al backend correcto

### Paso 5: Actualizar CLIENT_URL en backend
- Ir a Render Dashboard → turistas-cp-api → Environment
- Actualizar `CLIENT_URL` con la URL del frontend
- Render redesplegará automáticamente el backend

## Seguridad de Puppeteer en Producción

### Configuración para USACO IDE

El backend usa `puppeteer-core` para la integración con USACO IDE. En producción:

**Render proporciona automáticamente:**
- Chrome headless instalado
- Dependencias necesarias del sistema
- Sin configuración adicional requerida

**Variables de entorno relacionadas:**
```env
USACO_HEADLESS=true  # Opcional, para debugging local
```

**En local (desarrollo):**
- Si `USACO_HEADLESS=false`, abre Chrome con UI
- Útil para debugging de la integración

**En producción:**
- Siempre se ejecuta en modo headless
- No requiere display server

## MongoDB Atlas - Network Access

### Configuración Recomendada

**Para empezar (más simple):**
- Permitir acceso desde todas las IPs: `0.0.0.0/0`
- Más fácil de configurar
- MongoDB Atlas tiene autenticación por usuario/contraseña

**Para producción mejorada (opcional):**
- Whitelist solo IPs de Render
- Obtener IPs estáticas de Render (puede requerir plan superior)
- Mayor seguridad, pero más complejo

**Recomendación:**
- Empezar con `0.0.0.0/0`
- La seguridad real está en:
  - Contraseña fuerte de MongoDB
  - JWT_SECRET seguro
  - Variables de entorno protegidas
  - HTTPS en todas las comunicaciones

## Troubleshooting Común

### Error: "Port already in use"
**Causa:** Otro proceso usa el puerto 3000
**Solución:**
```bash
# En Linux/Mac
lsof -ti:3000 | xargs kill -9

# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "Cannot GET /some-route" en el frontend
**Causa:** Rutas de Angular no configuradas correctamente en Render
**Solución:** Ya configurado en `render.yaml`:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### Error: "MongoDB connection timeout"
**Causa:** Network Access no configurado en MongoDB Atlas
**Solución:**
1. MongoDB Atlas → Network Access
2. Add IP Address → Allow access from anywhere (0.0.0.0/0)
3. Guardar y esperar ~1-2 minutos

### Frontend no conecta con backend (CORS error)
**Causa:** `CLIENT_URL` no coincide con URL real del frontend
**Solución:**
1. Verificar URL exacta del frontend en Render
2. Actualizar `CLIENT_URL` en backend environment
3. Esperar redespliegue automático

## Checklist de Verificación Post-Despliegue

### Backend
- [ ] Health check responde: `/health`
- [ ] Logs muestran: "MongoDB Connected"
- [ ] Environment muestra: `NODE_ENV=production`
- [ ] No hay errores en logs

### Frontend
- [ ] La URL carga correctamente
- [ ] No hay errores 404 en rutas de Angular
- [ ] Consola del navegador sin errores CORS
- [ ] Assets (imágenes, CSS) cargan correctamente

### Integración
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] JWT se genera correctamente
- [ ] Datos se guardan en MongoDB
- [ ] Navegación entre páginas funciona

### Seguridad
- [ ] HTTPS activo (candado en navegador)
- [ ] Variables de entorno no visibles en código frontend
- [ ] .env no commiteado a Git
- [ ] Headers de seguridad presentes (X-Frame-Options, etc.)

## Mantenimiento y Monitoreo

### Logs
**Backend:**
- Render Dashboard → turistas-cp-api → Logs
- Ver en tiempo real
- Búsqueda por texto

**Frontend:**
- Render Dashboard → turistas-cp-frontend → Logs
- Principalmente logs de build

### Métricas
- Render proporciona métricas básicas gratis:
  - CPU usage
  - Memory usage
  - Request count
  - Response times

### Alertas
**Configuración recomendada:**
- Email cuando el servicio está down
- Email cuando deploy falla
- Configurar en Render Dashboard → Service → Settings → Notifications

## Escalabilidad Futura

### Si el equipo crece (10-20 usuarios)
**Opciones:**
1. Upgrade a Render Standard ($25/mes)
2. Upgrade MongoDB Atlas a M2 ($9/mes)
3. Total: ~$34/mes = $408/año

### Si el equipo crece mucho (50+ usuarios)
**Considerar:**
1. Render Professional ($85/mes)
2. MongoDB Atlas M5 ($24/mes)
3. CDN separado para assets
4. Redis para caché de sesiones
5. Total: ~$100-150/mes

**Por ahora (5 usuarios):** Starter $7/mes es más que suficiente.

## Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Angular Deployment](https://angular.io/guide/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

_Este documento complementa la documentación de despliegue con detalles técnicos específicos._
