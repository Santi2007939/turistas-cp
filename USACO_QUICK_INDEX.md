# 🔍 Índice Rápido: Gestión de Sesiones USACO

> **⚠️ Nota sobre líneas:** Los números de línea mencionados en estos documentos son aproximados (verificados en develop, commit 4961ef145, enero 2026) y pueden cambiar con el tiempo. Use las referencias a nombres de archivos y funciones como guía principal.

> **📌 Branch importante:** La implementación completa está en branch `develop`. Los archivos marcados como "(develop only)" solo existen en ese branch.

## ¿Buscas información sobre sesiones USACO?

Consulta estos documentos en orden:

### 1️⃣ **INICIO RÁPIDO** (¡Empieza aquí!)
📄 **[USACO_SESSION_LOCATION_GUIDE.md](./USACO_SESSION_LOCATION_GUIDE.md)** (Este PR)
- 📍 Dónde encontrar el código
- 🎯 Cómo verificar la funcionalidad  
- 🔧 Troubleshooting común
- 📝 Ejemplos de código

### 2️⃣ **DOCUMENTACIÓN TÉCNICA COMPLETA** (develop only)
📄 **[USACO_SESSION_MANAGEMENT.md](./USACO_SESSION_MANAGEMENT.md)**
- Especificación completa de API
- Esquemas de base de datos
- Diagramas de arquitectura
- Guías de implementación frontend/backend

### 3️⃣ **RESUMEN DE IMPLEMENTACIÓN** (develop only)
📄 **[IMPLEMENTATION_COMPLETE_USACO_SESSIONS.md](./IMPLEMENTATION_COMPLETE_USACO_SESSIONS.md)**
- Checklist de funcionalidades ✅
- Resumen ejecutivo
- Resultados de pruebas
- Métricas de calidad

### 4️⃣ **SEGURIDAD** (develop only)
📄 **[SECURITY_SUMMARY_USACO_SESSIONS.md](./SECURITY_SUMMARY_USACO_SESSIONS.md)**
- Medidas de seguridad implementadas
- Resultados de análisis CodeQL
- Validaciones y autorizaciones
- Mejores prácticas

## 📂 Ubicaciones Clave del Código

### Backend
```
server/
├── src/
│   ├── routes/
│   │   └── team.routes.js          ← Endpoints de sesiones (líneas 465-641)
│   ├── models/
│   │   └── TeamConfig.js            ← Schema codeSessions
│   └── services/
│       └── usaco-permalink.service.js ← Generador de enlaces
```

### Frontend
```
client/src/app/
├── features/team/
│   ├── team-detail.component.ts    ← Lógica de sesiones
│   └── team-detail.component.html  ← UI de sesiones
└── core/services/
    ├── team.service.ts             ← API calls
    └── integrations.service.ts     ← USACO integrations
```

## 🎯 Funcionalidades Implementadas

| Funcionalidad | Estado | Ubicación |
|--------------|--------|-----------|
| ✅ Crear Sesión | Implementado | `team.routes.js:465` |
| ✅ Editar Sesión | Implementado | `team.routes.js:528` |
| ✅ Eliminar Sesión | Implementado | `team.routes.js:585` |
| ✅ Auto-generar Link | Implementado | `usaco-permalink.service.js` |
| ✅ Link Manual | Implementado | `team-detail.component.ts:1021` |
| ✅ Validación | Implementado | Backend + Frontend |
| ✅ Autorización | Implementado | JWT + Roles |
| ✅ Rate Limiting | Implementado | 10 req/min |

## 🚀 Acceso Rápido a la Funcionalidad

### En la Aplicación Web

1. **Login** → Dashboard
2. **Click** en "Team Turistas"
3. **Scroll** a sección "💻 USACO IDE Sessions"
4. **Usar** botones:
   - `Add Session` - Crear nueva
   - `View Templates` - Ver plantillas
   - `Rename` / `Delete` - Por cada sesión

### API Endpoints

```
POST   /api/team/:id/code-sessions              ← Crear
PUT    /api/team/:id/code-sessions/:sessionId    ← Actualizar
DELETE /api/team/:id/code-sessions/:sessionId    ← Eliminar

POST   /api/integrations/usaco-ide/permalink     ← Auto-generar
GET    /api/integrations/usaco-ide/status        ← Estado servicio
```

## 📞 ¿Necesitas Ayuda?

- 🐛 **Bug o error**: Consulta sección Troubleshooting en `USACO_SESSION_LOCATION_GUIDE.md`
- 📖 **Cómo usar**: Lee `USACO_SESSION_MANAGEMENT.md` 
- 🔐 **Permisos**: Verifica `SECURITY_SUMMARY_USACO_SESSIONS.md`
- 💡 **Nueva función**: Revisa arquitectura en `IMPLEMENTATION_COMPLETE_USACO_SESSIONS.md`

## ✨ TL;DR

**¿Dónde está el código de sesiones USACO?**
- Backend: `server/src/routes/team.routes.js` (líneas 465-641)
- Frontend: `client/src/app/features/team/team-detail.component.*`

**¿Funciona?**
✅ Sí, completamente implementado en branch `develop`

**¿Qué puede hacer?**
✅ Crear, editar, eliminar sesiones
✅ Auto-generar enlaces con plantillas
✅ Enlaces manuales
✅ Autorización por roles

**Lee más:** `USACO_SESSION_LOCATION_GUIDE.md`
