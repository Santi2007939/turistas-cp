# Guía de Ubicación: Gestión de Sesiones USACO

## 📍 Resumen Ejecutivo

Esta guía proporciona información clara sobre **dónde encontrar** el código y la funcionalidad de gestión de sesiones USACO en el repositorio `Santi2007939/turistas-cp`.

## 🎯 ¿Qué es la Gestión de Sesiones USACO?

El sistema permite a los equipos:
- ✅ **Crear** sesiones de código compartidas con enlaces IDE
- ✅ **Editar** nombres de sesiones
- ✅ **Eliminar** sesiones que ya no se necesitan
- ✅ **Auto-generar** enlaces con plantillas de código del equipo
- ✅ **Compartir** enlaces manuales existentes

## 📂 Ubicaciones del Código

### Backend (Node.js/Express)

#### 1. **Rutas API** 
📁 `server/src/routes/team.routes.js`

**Endpoints de sesiones de código:**
- Línea 465-527: `POST /api/team/:id/code-sessions` - Crear sesión
- Línea 528-584: `PUT /api/team/:id/code-sessions/:sessionId` - Actualizar sesión
- Línea 585-641: `DELETE /api/team/:id/code-sessions/:sessionId` - Eliminar sesión

```javascript
// Ejemplo de uso:
// POST /api/team/673e1234abcd5678ef901234/code-sessions
// Headers: Authorization: Bearer <token>
// Body: { "name": "Sesión de Práctica 1", "link": "https://ide.usaco.guide/abc123" }
```

#### 2. **Modelo de Datos**
📁 `server/src/models/TeamConfig.js`

El esquema `codeSessions` se encuentra en el modelo TeamConfig:
```javascript
codeSessions: [{
  name: String,      // Nombre de la sesión
  link: String,      // URL del IDE USACO
  createdAt: Date,   // Fecha de creación
  _id: ObjectId      // ID único
}]
```

#### 3. **Servicio USACO Permalink**
📁 `server/src/services/usaco-permalink.service.js`

Servicio para generar enlaces automáticos:
- `getPermalink(language, options)` - Genera enlaces USACO
- `getStatus()` - Verifica estado del servicio
- Soporta: C++, Java, Python

#### 4. **Rutas de Integración**
📁 `server/src/routes/integrations.routes.js`

Endpoints para generar enlaces:
- `POST /api/integrations/usaco-ide/permalink` - Generar enlace
- `GET /api/integrations/usaco-ide/status` - Estado del servicio

### Frontend (Angular)

#### 1. **Componente Principal**
📁 `client/src/app/features/team/team-detail.component.ts`

**Métodos clave:**
- Línea 1021: `addSession()` - Crear nueva sesión
- Línea 1087: `renameSession()` - Renombrar sesión
- Línea 1107: `deleteSession(sessionId)` - Eliminar sesión
- Línea 1072: `openAddSessionModal()` - Abrir modal de añadir
- Línea 1081: `openRenameSessionModal(session)` - Abrir modal de renombrar

#### 2. **Template HTML**
📁 `client/src/app/features/team/team-detail.component.html`

**Secciones UI:**
- Líneas ~280-320: Lista de sesiones de código
- Líneas ~580-650: Modal "Añadir Sesión"
- Líneas ~620-645: Modal "Renombrar Sesión"

#### 3. **Servicio de Equipos**
📁 `client/src/app/core/services/team.service.ts`

**Métodos HTTP:**
- `addCodeSession(teamId, name, link)` - POST solicitud
- `updateCodeSession(teamId, sessionId, name)` - PUT solicitud
- `deleteCodeSession(teamId, sessionId)` - DELETE solicitud

#### 4. **Servicio de Integraciones**
📁 `client/src/app/core/services/integrations.service.ts`

**Métodos de integración:**
- `createUsacoPermalink(language, teamId?)` - Generar enlace
- `getCodeTemplate(language, teamId?)` - Obtener plantilla
- `getUsacoPermalinkStatus()` - Estado del servicio

## 🔍 Cómo Verificar la Funcionalidad

### 1. Acceso desde la UI

1. **Navegar a:** Dashboard → Team Turistas → Sección "USACO IDE Sessions"
2. **Botones disponibles:**
   - `Add Session` - Crear nueva sesión
   - `View Templates` - Ver plantillas de código
3. **Acciones por sesión:**
   - `Open IDE` - Abrir en USACO IDE
   - `Rename` - Cambiar nombre
   - `Delete` - Eliminar sesión

### 2. Verificar API Endpoints

#### Listar sesiones de un equipo
```bash
curl -X GET "http://localhost:3000/api/team/TEAM_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Crear sesión
```bash
curl -X POST "http://localhost:3000/api/team/TEAM_ID/code-sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sesión de Práctica",
    "link": "https://ide.usaco.guide/abc123"
  }'
```

#### Actualizar sesión
```bash
curl -X PUT "http://localhost:3000/api/team/TEAM_ID/code-sessions/SESSION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre"}'
```

#### Eliminar sesión
```bash
curl -X DELETE "http://localhost:3000/api/team/TEAM_ID/code-sessions/SESSION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Documentación Relacionada

### Guías Técnicas Disponibles

1. **`USACO_SESSION_MANAGEMENT.md`** 
   - Guía completa de implementación
   - Esquemas de API detallados
   - Ejemplos de uso

2. **`IMPLEMENTATION_COMPLETE_USACO_SESSIONS.md`**
   - Resumen de implementación
   - Checklist de funcionalidades
   - Resultados de pruebas

3. **`SECURITY_SUMMARY_USACO_SESSIONS.md`**
   - Medidas de seguridad implementadas
   - Resultados de CodeQL
   - Validaciones de entrada

## 🔐 Permisos y Autorización

### Quién Puede Gestionar Sesiones

- ✅ **Líderes de Equipo** (Team Leaders)
- ✅ **Entrenadores** (Coaches)
- ✅ **Administradores** (Admins)
- ❌ **Miembros Regulares** (Solo lectura)

### Verificación de Permisos

El código verifica permisos en:
- **Backend:** `server/src/routes/team.routes.js` (líneas 467-475, 530-538, 587-595)
- **Frontend:** `client/src/app/features/team/team-detail.component.ts` (propiedad `isLeader`)

## 🛠️ Debugging y Troubleshooting

### Problemas Comunes

#### 1. "Sesión no se crea"
**Verificar:**
- Usuario tiene permisos (líder/coach/admin)
- Token JWT es válido
- Nombre y link no están vacíos
- Link tiene formato válido

**Dónde mirar:**
- Console del navegador (Network tab)
- Logs del servidor: `server/src/routes/team.routes.js:467-527`

#### 2. "Auto-generación de enlace falla"
**Verificar:**
- Variable de entorno `CHROME_PATH` configurada
- Servicio USACO está disponible
- Timeout suficiente (30 segundos default)

**Dónde mirar:**
- `server/src/services/usaco-permalink.service.js`
- Endpoint: `GET /api/integrations/usaco-ide/status`

#### 3. "No aparece botón Add Session"
**Verificar:**
- Usuario está autenticado
- Usuario es líder/coach/admin del equipo
- Componente cargado correctamente

**Dónde mirar:**
- `client/src/app/features/team/team-detail.component.html:~600`
- `client/src/app/features/team/team-detail.component.ts:~720` (propiedad `isLeader`)

## 🎓 Ejemplos de Código

### Backend: Crear Sesión Personalizada

```javascript
// server/src/routes/team.routes.js (línea ~467)
router.post('/:id/code-sessions', teamManagementLimiter, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, link } = req.body;
  const userId = req.user.id;
  
  // Validar permisos y datos
  // Crear sesión
  // Retornar equipo actualizado
}));
```

### Frontend: Añadir Sesión

```typescript
// client/src/app/features/team/team-detail.component.ts (línea ~1021)
addSession(): void {
  if (!this.teamId || !this.newSessionName) return;

  let sessionLink = this.manualLink;
  
  // Si auto-generar, llamar servicio permalink
  if (this.sessionLinkType === 'auto' && this.selectedLanguage) {
    this.integrationsService.createUsacoPermalink(this.selectedLanguage, this.teamId)
      .subscribe({
        next: (response) => {
          if (response.ok && response.url) {
            this.createSession(this.newSessionName, response.url);
          }
        }
      });
  } else if (sessionLink) {
    this.createSession(this.newSessionName, sessionLink);
  }
}
```

## 📞 Soporte y Contribuciones

### Para Reportar Problemas

1. **Ubicar el archivo relevante** usando esta guía
2. **Incluir:**
   - Ubicación exacta del código (archivo y línea)
   - Comportamiento esperado vs actual
   - Pasos para reproducir
   - Logs/errores relevantes

### Para Añadir Funcionalidades

**Archivos a modificar:**
1. **Backend:**
   - `server/src/routes/team.routes.js` - Nuevos endpoints
   - `server/src/models/TeamConfig.js` - Cambios de esquema
   - `server/src/services/` - Lógica de negocio

2. **Frontend:**
   - `client/src/app/features/team/team-detail.component.*` - UI y lógica
   - `client/src/app/core/services/team.service.ts` - Llamadas HTTP
   - `client/src/app/core/services/integrations.service.ts` - Integraciones

## ✅ Checklist de Verificación

Para confirmar que la funcionalidad existe y está operativa:

- [ ] **Backend Routes:** Endpoints en `server/src/routes/team.routes.js`
- [ ] **Data Model:** Schema en `server/src/models/TeamConfig.js`
- [ ] **USACO Service:** Servicio en `server/src/services/usaco-permalink.service.js`
- [ ] **Frontend Component:** Métodos en `client/src/app/features/team/team-detail.component.ts`
- [ ] **Frontend Template:** UI en `client/src/app/features/team/team-detail.component.html`
- [ ] **HTTP Service:** Métodos en `client/src/app/core/services/team.service.ts`
- [ ] **Integration Service:** Métodos en `client/src/app/core/services/integrations.service.ts`

## 🏁 Conclusión

La gestión de sesiones USACO está **completamente implementada** en el branch `develop`. Todas las funciones solicitadas (crear, editar, eliminar) están operativas y documentadas.

**Ubicación Principal:** 
- **Backend:** `server/src/routes/team.routes.js` (líneas 465-641)
- **Frontend:** `client/src/app/features/team/team-detail.component.*`
- **Servicio:** `server/src/services/usaco-permalink.service.js`

Para más detalles técnicos, consultar la documentación completa en `USACO_SESSION_MANAGEMENT.md`.
