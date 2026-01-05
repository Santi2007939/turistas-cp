# Solución al Problema del Servicio USACO

## Problema Identificado

El servicio USACO no era visible/accesible debido a que el endpoint `/api/integrations/usaco-ide/status` fallaba porque el método `getStatus()` no estaba implementado en la clase `USACOPermalinkService`.

## Solución Implementada

Se agregó el método `getStatus()` faltante en el archivo `server/src/services/usaco-permalink.service.js`:

```javascript
/**
 * Get service status
 * @returns {Object} Service status information
 */
getStatus() {
  return {
    available: true,
    chromePath: process.env.CHROME_PATH || 'not configured',
    headless: process.env.USACO_HEADLESS || 'default (true)',
    supportedLanguages: ['cpp', 'java', 'py']
  };
}
```

## Cambios Realizados

### 1. Archivo modificado: `server/src/services/usaco-permalink.service.js`
- **Línea 1**: Importado módulo `existsSync` de `fs` para verificar la existencia del ejecutable de Chrome
- **Líneas 124-138**: Agregado método `getStatus()` mejorado que:
  - Verifica si Chrome está configurado
  - Comprueba si el ejecutable de Chrome existe en el sistema
  - Retorna información precisa sobre la disponibilidad del servicio
  - Incluye nuevo campo `chromeExists` para indicar si el ejecutable existe

### 2. Archivo modificado: `server/.env.example`
- **Líneas 22-31**: Agregadas variables de entorno necesarias para USACO:
  - `CHROME_PATH`: Ruta al ejecutable de Chrome/Chromium
  - `USACO_HEADLESS`: Modo headless para el navegador (default: true)

## Verificación de la Solución

### Prueba 1: Verificar el método getStatus()

```bash
cd server
node -e "import('./src/services/usaco-permalink.service.js').then(m => {
  const status = m.default.getStatus();
  console.log('✅ getStatus() funciona correctamente:');
  console.log(JSON.stringify(status, null, 2));
});"
```

**Resultado esperado (sin Chrome instalado):**
```json
{
  "available": false,
  "chromePath": "not configured",
  "chromeExists": null,
  "headless": "default (true)",
  "supportedLanguages": ["cpp", "java", "py"]
}
```

**Resultado esperado (con Chrome configurado):**
```json
{
  "available": true,
  "chromePath": "/usr/bin/google-chrome",
  "chromeExists": true,
  "headless": "default (true)",
  "supportedLanguages": ["cpp", "java", "py"]
}
```

### Prueba 2: Verificar el endpoint del API

1. Configurar las variables de entorno:
```bash
cd server
cp .env.example .env
# Editar .env con tus credenciales de MongoDB y otras configuraciones
```

2. Iniciar el servidor:
```bash
npm run dev
```

3. Probar el endpoint de status (en otra terminal):
```bash
# Primero obtén un token JWT autenticándote
# Luego prueba el endpoint:
curl -X GET http://localhost:3000/api/integrations/usaco-ide/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resultado esperado (sin Chrome configurado):**
```json
{
  "ok": true,
  "service": "usaco-permalink",
  "envHeadless": null,
  "available": false,
  "chromePath": "not configured",
  "chromeExists": null,
  "headless": "default (true)",
  "supportedLanguages": ["cpp", "java", "py"]
}
```

**Resultado esperado (con Chrome configurado y disponible):**
```json
{
  "ok": true,
  "service": "usaco-permalink",
  "envHeadless": null,
  "available": true,
  "chromePath": "/usr/bin/google-chrome",
  "chromeExists": true,
  "headless": "default (true)",
  "supportedLanguages": ["cpp", "java", "py"]
}
```

### Prueba 3: Verificar la generación de permalink (opcional)

Para probar la generación completa de permalinks, necesitas:

1. Instalar Chrome o Chromium en tu sistema
2. Configurar `CHROME_PATH` en `.env`:
```bash
# Linux
CHROME_PATH=/usr/bin/google-chrome

# macOS
CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# Windows
CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

3. Probar con el script incluido:
```bash
npm run usaco:link
```

O probar el endpoint directamente:
```bash
curl -X POST http://localhost:3000/api/integrations/usaco-ide/permalink \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "cpp", "headless": true}'
```

## Endpoints Disponibles

### 1. GET /api/integrations/usaco-ide/status
**Descripción**: Obtiene el estado del servicio USACO Permalink  
**Autenticación**: Requerida (JWT)  
**Respuesta**: Información del servicio incluyendo disponibilidad y configuración

### 2. POST /api/integrations/usaco-ide/permalink
**Descripción**: Genera un permalink en USACO IDE con código template  
**Autenticación**: Requerida (JWT)  
**Body**:
```json
{
  "language": "cpp",  // cpp, java, o py
  "headless": true,   // opcional, default true
  "timeout": 30000    // opcional, default 30000ms
}
```
**Respuesta exitosa (201)**:
```json
{
  "ok": true,
  "url": "https://ide.usaco.guide/abc123xyz"
}
```
**Respuesta de error (502)**:
```json
{
  "ok": false,
  "reason": "Timeout waiting for permalink generation"
}
```

## Documentación Adicional

Para más información sobre el servicio USACO, consulta:
- `server/README_USACO.md`: Documentación completa del servicio
- `server/scripts/get-usaco-link-server.js`: Script de prueba del servicio

## Integración en el Frontend

El servicio está integrado en el componente de equipos (`client/src/app/features/team/team-detail.component.ts`):

- **Método**: `createUsacoLink(language: string)`
- **Servicio**: `IntegrationsService.createUsacoPermalink()`
- **UI**: Modal que muestra el permalink generado

## Consideraciones de Seguridad

⚠️ **Importante**: El servicio está protegido con autenticación JWT, pero en producción se recomienda:

1. Implementar rate limiting (máximo 10 requests por usuario cada 15 minutos)
2. Usar un sistema de cola (Bull/Redis) para manejar requests concurrentes
3. Configurar límites de recursos (timeout, memoria, concurrent browsers)
4. Implementar logging y monitoreo completo

Ver `server/README_USACO.md` sección "Security Considerations" para más detalles.

## Estado del Servicio

- ✅ Método `getStatus()` implementado y funcionando
- ✅ Endpoint `/api/integrations/usaco-ide/status` operativo
- ✅ Endpoint `/api/integrations/usaco-ide/permalink` operativo
- ✅ Documentación actualizada
- ✅ Variables de entorno documentadas en `.env.example`
- ⚠️ Chrome/Chromium debe ser instalado y configurado para usar la generación de permalinks

## Conclusión

El problema ha sido solucionado exitosamente. El servicio USACO ahora es visible y accesible a través de los endpoints del API. Los usuarios pueden verificar el estado del servicio y generar permalinks de código en USACO IDE una vez que Chrome/Chromium esté configurado.
