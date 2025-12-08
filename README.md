# Turistas CP 🏔️

Plataforma de entrenamiento para programación competitiva utilizando MEAN Stack (MongoDB, Express, Angular, Node.js).

## 📋 Descripción

Turistas CP es una plataforma web diseñada para ayudar a equipos de programación competitiva a entrenar de manera organizada y eficiente. Incluye funcionalidades de seguimiento de problemas, roadmaps personalizados, calendario de concursos, estadísticas de progreso, y colaboración en equipo.

### Características Principales

- 🎯 **Roadmaps Personalizados**: Crea y sigue rutas de aprendizaje personalizadas
- 📊 **Estadísticas**: Seguimiento del progreso individual y del equipo
- 📅 **Calendario**: Gestión de concursos y eventos
- 🏆 **Logros**: Sistema de gamificación y motivación
- 👥 **Trabajo en Equipo**: Configuración y colaboración de equipos
- 🔗 **Integraciones**: Codeforces, RPC, USACO IDE, Excalidraw

## 🛠️ Tecnologías

### Backend
- **Node.js** v18+
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación

### Frontend
- **Angular** 17+
- **Tailwind CSS** - Framework de estilos
- **TypeScript**

## 📦 Requisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **MongoDB Atlas** - Cuenta configurada (no se requiere instalación local)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Santi2007939/turistas-cp.git
cd turistas-cp
```

### 2. Configurar el Backend

```bash
cd server
npm install
```

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/turistas_cp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=32-character-key-here
```

### 3. Configurar el Frontend

```bash
cd ../client
npm install
```

### 4. Ejecutar el proyecto

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm start
```

La aplicación estará disponible en:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
turistas-cp/
├── client/                 # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/      # Servicios API y autenticación
│   │   │   │   └── guards/        # Guards de autenticación
│   │   │   ├── shared/
│   │   │   │   └── components/    # Componentes compartidos
│   │   │   ├── features/          # Módulos de funcionalidades
│   │   │   │   ├── auth/          # Autenticación
│   │   │   │   ├── roadmap/       # Roadmaps
│   │   │   │   ├── problems/      # Problemas
│   │   │   │   ├── calendar/      # Calendario
│   │   │   │   ├── stats/         # Estadísticas
│   │   │   │   ├── team/          # Equipo
│   │   │   │   └── achievements/  # Logros
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   └── ...
│   ├── angular.json
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Configuración MongoDB
│   │   ├── models/                # Modelos Mongoose
│   │   ├── routes/                # Rutas de la API
│   │   ├── controllers/           # Controladores
│   │   ├── middlewares/           # Middlewares
│   │   └── services/              # Servicios de integración
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## 🔄 GitFlow - Flujo de Trabajo

Este proyecto utiliza GitFlow para el manejo de ramas:

### Ramas Principales

- **`main`**: Rama de producción, siempre estable
- **`develop`**: Rama de desarrollo, integración de nuevas características

### Ramas de Soporte

- **`feature/*`**: Nuevas funcionalidades
  ```bash
  git checkout develop
  git checkout -b feature/nombre-funcionalidad
  ```

- **`hotfix/*`**: Correcciones urgentes en producción
  ```bash
  git checkout main
  git checkout -b hotfix/nombre-correccion
  ```

### Flujo de Trabajo

1. **Crear una nueva funcionalidad:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mi-funcionalidad
   # Realizar cambios y commits
   git push origin feature/mi-funcionalidad
   # Crear Pull Request a develop
   ```

2. **Corrección urgente (hotfix):**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/correccion-urgente
   # Realizar cambios y commits
   git push origin hotfix/correccion-urgente
   # Crear Pull Request a main y develop
   ```

3. **Finalizar desarrollo (release):**
   ```bash
   # Merge de develop a main
   git checkout main
   git merge develop
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin main --tags
   ```

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📝 Servicios de Integración

### Codeforces API
- Información de usuarios
- Historial de ratings
- Próximos concursos

### Excalidraw
- Salas colaborativas de pizarra
- Trabajo en equipo visual

### RPC (Red de Programación Competitiva)
- Inscripción automática a concursos
- Seguimiento de competencias

### USACO IDE
- Ejecución de código online
- Soporte para C++, Python, Java

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- Santi2007939

## 🆘 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.
