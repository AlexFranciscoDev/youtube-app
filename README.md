# 📦 Estructura de la Aplicación MERN: Modelos y Endpoints

Esta aplicación permite a los usuarios registrarse e ingresar enlaces de videos de YouTube, con título, descripción y categoría. A continuación se detallan los modelos (colecciones) necesarios en MongoDB y los métodos asociados en la API RESTful.

---

## 🧑‍💻 Modelo: User

Representa a los usuarios registrados en la app.

### Campos:
- `_id`: ObjectId
- `username`: String (único)
- `email`: String (único)
- `password`: String (en hash)
- `createdAt`: Date
- `updatedAt`: Date

### Endpoints:
- **POST** `/api/users/register` – Registrar usuario
- **POST** `/api/users/login` – Iniciar sesión (JWT)
- **GET** `/api/users/me` – Obtener datos del usuario autenticado
- **PUT** `/api/users/:id` – Actualizar perfil
- **DELETE** `/api/users/:id` – Eliminar usuario

---

## 🎬 Modelo: Video

Representa un video publicado por un usuario.

### Campos:
- `_id`: ObjectId
- `userId`: ObjectId (referencia al modelo User)
- `title`: String
- `description`: String
- `youtubeUrl`: String
- `categoryId`: ObjectId (referencia a Category)
- `createdAt`: Date
- `updatedAt`: Date

### Endpoints:
- **POST** `/api/videos` – Crear nuevo video
- **GET** `/api/videos` – Obtener todos los videos
- **GET** `/api/videos/:id` – Obtener video por ID
- **GET** `/api/videos/user/:userId` – Videos por usuario
- **GET** `/api/videos/category/:categoryId` – Videos por categoría
- **PUT** `/api/videos/:id` – Editar video
- **DELETE** `/api/videos/:id` – Eliminar video

---

## 📂 Modelo: Category

Categorías para organizar los videos.

### Campos:
- `_id`: ObjectId
- `name`: String (ej: "Música", "Educación")
- `description`: String

### Endpoints:
- **POST** `/api/categories` – Crear nueva categoría
- **GET** `/api/categories` – Listar todas las categorías
- **GET** `/api/categories/:id` – Ver una categoría
- **PUT** `/api/categories/:id` – Editar categoría
- **DELETE** `/api/categories/:id` – Eliminar categoría

---

## ⭐ Modelo (Opcional): Like / Favorite

Permite que los usuarios marquen videos como favoritos o den "me gusta".

### Campos:
- `_id`: ObjectId
- `userId`: ObjectId
- `videoId`: ObjectId
- `createdAt`: Date

### Endpoints:
- **POST** `/api/likes` – Agregar like/favorito
- **DELETE** `/api/likes/:id` – Quitar like/favorito
- **GET** `/api/likes/user/:userId` – Favoritos del usuario
- **GET** `/api/likes/video/:videoId` – Likes por video

---

## 🔐 Autenticación (JWT)

- Utilizar **JSON Web Tokens** para proteger las rutas privadas.
- Incluir middleware que valide el token para:
  - Subida de videos
  - Actualización o eliminación de perfil
  - Eliminación de videos o categorías
  - Gestión de favoritos

---

## ✅ Resumen de funcionalidades

- Registro e inicio de sesión de usuarios con validación.
- Subida de enlaces de videos de YouTube.
- Asociación de videos con categorías.
- Listado y filtrado de videos por usuario o categoría.
- Sistema de favoritos o likes (opcional).
- Interfaz de administración de categorías.
- Seguridad con tokens JWT.

---

## 🚧 Próximos pasos

1. Crear el backend con Express y MongoDB.
2. Configurar los modelos (Mongoose).
3. Implementar controladores y rutas.
4. Integrar JWT y middlewares de autenticación.
5. Diseñar el frontend en React.
6. Conectar el frontend con la API.
7. Agregar validaciones, estilos, y control de errores.

