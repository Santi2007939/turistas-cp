<div align="right">
  <a href="#english-version"><img src="https://img.shields.io/badge/Language-English-blue?style=flat-square&logo=google-translate&logoColor=white" alt="English"/></a>
  <a href="#versión-en-español"><img src="https://img.shields.io/badge/Language-Español-lightgrey?style=flat-square&logo=google-translate&logoColor=white" alt="Spanish"/></a>
</div>

# Turistas CP 🏔️
### Competitive Programming Training Platform

Web platform designed to structure and monitor the training of competitive programming teams and individuals, built on the **MEAN** stack (MongoDB, Express, Angular, Node.js).

---

## English Version

### 📋 Description
**Turistas CP** is a central platform designed to organize training routines for competitive programming teams and individuals. It handles roadmaps, contest schedules, personal metrics, and team collaboration natively.

### 🎯 Key Features
* **Custom Roadmaps:** Design and follow visual pathways to master complex algorithmic topics.
* **Statistics & Metrics:** Visual tracking of individual and team analytical growth.
* **Shared Calendar:** Contest tracking and custom simulated sessions.
* **External Integrations:** Built-in hooks and links for Codeforces, RPC, USACO, and collaborative whiteboard integration via Excalidraw.

---

### 🛠️ Architecture & Core Stack

#### **Backend (REST APIs)**
* **Runtime & Framework:** Node.js + Express.js.
* **Database & ODM:** MongoDB Atlas + Mongoose for schema modeling.
* **Security:** Stateless JWT authentication and secure encryption modules.

#### **Frontend (UI Layer)**
* **Framework:** Angular 19+ (Modular core structure, router features, guards, and shared components).
* **Styles:** Utility-first responsive design powered by Tailwind CSS.
* **Languages:** TypeScript.

---

### 🚀 Setup and Installation

#### 1. Clone the project
```bash
git clone https://github.com/Santi2007939/turistas-cp.git
cd turistas-cp
```

#### 2. Backend Setup
```bash
cd server
npm install
```
*Configure your environment by copying `.env.example` to `.env`:*
```env
PORT=3000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-character-key
```
*Run API server:*
```bash
npm run dev
```

#### 3. Frontend Setup
```bash
cd ../client
npm install
```
*Start client development server:*
```bash
npm start
```
* Access Frontend: `http://localhost:4200`
* Access Backend API: `http://localhost:3000`

---

### 📁 Project Directory Layout
```text
turistas-cp/
├── client/                 # Angular Client app
│   ├── src/app/
│   │   ├── core/           # Guards, interceptores, and services
│   │   ├── shared/         # Reusable layouts and pipes
│   │   └── features/       # Feature modules (roadmap, team, stats, calendar)
│
└── server/                 # REST API Server
    ├── src/
    │   ├── config/         # MongoDB Database configurations
    │   ├── models/         # Mongoose models and validation schemas
    │   ├── controllers/    # Controller route handlers
    │   ├── middlewares/    # Session authentication validation
    │   └── services/       # External APIs and utilities handlers
```

---
---

## Versión en Español

### 📋 Descripción
**Turistas CP** centraliza herramientas interactivas y recursos de aprendizaje para potenciar el rendimiento de equipos en concursos lógicos. La plataforma automatiza el seguimiento de problemas y la visualización de métricas de progreso de forma interactiva.

### 🎯 Características Principales
* **Roadmaps de Aprendizaje:** Creación y seguimiento visual de rutas de estudio temáticas y de dificultad incremental.
* **Métricas y Estadísticas:** Gráficos intuitivos del desempeño individual y grupal.
* **Gestión de Calendario:** Programación de concursos simulados y sincronización de eventos de programación competitiva.
* **Integraciones Externas:** Consumo de APIs públicas y enlaces de herramientas como Codeforces, RPC, USACO y Excalidraw para pizarras colaborativas.

---

### 🛠️ Arquitectura & Tecnologías

#### **Backend (Servicios RESTful)**
* **Runtime & Framework:** Node.js + Express.js para una API REST modular.
* **Base de Datos & ODM:** MongoDB Atlas con Mongoose para modelamiento NoSQL.
* **Autenticación:** JSON Web Tokens (JWT) para sesiones sin estado y encriptación de datos sensibles.

#### **Frontend (Interfaz de Usuario)**
* **Framework:** Angular 19+ (Estructura modular orientada a servicios, Core/Guards y Feature modules).
* **Diseño & Estilos:** Tailwind CSS para interfaces responsivas y de carga eficiente.
* **Tipado:** TypeScript estricto.

---

### 🚀 Instalación y Despliegue

#### 1. Clonar el repositorio
```bash
git clone https://github.com/Santi2007939/turistas-cp.git
cd turistas-cp
```

#### 2. Configurar el Backend
```bash
cd server
npm install
```
*Crea un archivo `.env` basado en `.env.example` y define tus variables:*
```env
PORT=3000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-character-key
```
*Iniciar servidor de desarrollo:*
```bash
npm run dev
```

#### 3. Configurar el Frontend
```bash
cd ../client
npm install
```
*Iniciar servidor Angular:*
```bash
npm start
```
* La aplicación estará disponible en: `http://localhost:4200`
* El backend levantará la API en: `http://localhost:3000`

---

### 📁 Estructura del Proyecto
```text
turistas-cp/
├── client/                 # Angular Frontend (Arquitectura por Componentes/Features)
│   ├── src/app/
│   │   ├── core/           # Guards, interceptores y servicios singleton
│   │   ├── shared/         # Componentes y pipes reutilizables
│   │   └── features/       # Módulos encapsulados (auth, roadmap, problems, stats, calendar, team)
│
└── server/                 # Express Backend (Arquitectura MVC/Service Layer)
    ├── src/
    │   ├── config/         # Configuración de base de datos
    │   ├── models/         # Modelos Mongoose
    │   ├── controllers/    # Controladores de endpoints
    │   ├── middlewares/    # Validación y seguridad JWT
    │   └── services/       # Integraciones de API y utilidades externas
```

---

<div align="center">
  "Optimizing what is within control, solving complexity under the absurd." 🚀
</div>
