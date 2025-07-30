# Chat Server

Un servidor de chat en tiempo real construido con Node.js, Express, Socket.IO y MongoDB. Permite comunicación instantánea entre usuarios y grupos con autenticación JWT.

## 🚀 Características

- **Autenticación de usuarios** con JWT
- **Chat en tiempo real** usando Socket.IO
- **Mensajería privada** entre usuarios
- **Grupos de chat** con administradores
- **Sistema de amigos** con solicitudes
- **Subida de imágenes** con Cloudinary
- **Búsqueda de mensajes** y usuarios
- **Estado en línea/desconectado** de usuarios
- **Indicador de escritura** en tiempo real
- **Historial de mensajes** con paginación

## 🛠️ Tecnologías

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Socket.IO** - Comunicación en tiempo real
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Cloudinary** - Almacenamiento de imágenes
- **Sharp** - Procesamiento de imágenes
- **Multer** - Manejo de archivos

## 📋 Requisitos previos

- Node.js (v14 o superior)
- MongoDB
- Cuenta de Cloudinary (para imágenes)

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd chat-server
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copia el archivo `.env.example` a `.env` y configura las siguientes variables:
   ```env
   PORT=3000
   DB_URI=mongodb://localhost:27017/chat-db
   JWT_KEY=tu_clave_secreta_jwt
   CLOUD_NAME=tu_cloudinary_cloud_name
   API_KEY_CLOUDINARY=tu_cloudinary_api_key
   API_SECRET_CLOUDINARY=tu_cloudinary_api_secret
   ```

4. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📚 API Endpoints

### Autenticación (`/api/login`)

- `POST /new` - Registrar nuevo usuario
- `POST /` - Iniciar sesión
- `GET /renew` - Renovar token JWT
- `PUT /changeName/:myId` - Cambiar nombre de usuario
- `PUT /changePassword/:myId` - Cambiar contraseña
- `POST /changePerfil/:myId` - Cambiar foto de perfil
- `PUT /update-username` - Actualizar nombre de usuario
- `POST /get-found-users` - Buscar usuarios
- `POST /add-friend` - Agregar amigo
- `POST /friend-request` - Enviar solicitud de amistad
- `GET /get-user` - Obtener información del usuario
- `POST /get-simple-user` - Obtener información básica del usuario

### Mensajes (`/api/messages`)

- `GET /:from` - Obtener mensajes de una conversación
- `GET /find/:from` - Buscar mensajes específicos
- `GET /position/:from` - Obtener posición de un mensaje

### Grupos (`/api/groups`)

- `POST /create` - Crear nuevo grupo
- `POST /group-perfil/:groupId` - Cambiar foto del grupo

## 🔌 Eventos de Socket.IO

### Cliente → Servidor

- `main-connection` - Conectar usuario con token JWT
- `inbox-message` - Enviar mensaje
- `writing` - Indicar que el usuario está escribiendo
- `state` - Solicitar estado de usuarios y grupos
- `user-change` - Notificar cambio de usuario
- `update-users` - Actualizar lista de usuarios
- `connect-to-group` - Conectar a un grupo

### Servidor → Cliente

- `inbox-message` - Recibir nuevo mensaje
- `writing` - Notificación de usuario escribiendo
- `state` - Actualización de estado general
- `user-list` - Lista de usuarios conectados
- `group-list` - Lista de grupos del usuario
- `user-change` - Notificación de cambio de usuario
- `update-users` - Actualización de lista de usuarios

## 📁 Estructura del proyecto

```
chat-server/
├── controllers/          # Controladores de la aplicación
│   ├── auth.js          # Autenticación y usuarios
│   ├── group.js         # Gestión de grupos
│   ├── messages.js      # Gestión de mensajes
│   └── sockets.js       # Eventos de Socket.IO
├── database/            # Configuración de base de datos
│   └── config.js        # Conexión a MongoDB
├── helpers/             # Funciones auxiliares
│   ├── cloudinary.js    # Configuración de Cloudinary
│   └── jwt.js           # Manejo de JWT
├── middlewares/         # Middlewares personalizados
│   ├── fieldValidator.js # Validación de campos
│   └── validateJWT.js   # Validación de JWT
├── models/              # Modelos de datos
│   ├── groupModel.js    # Modelo de grupos
│   ├── messageModel.js  # Modelo de mensajes
│   ├── server.js        # Configuración del servidor
│   ├── sockets.js       # Configuración de sockets
│   └── userModel.js     # Modelo de usuarios
├── public/              # Archivos estáticos
│   └── index.html       # Página de inicio
├── routes/              # Definición de rutas
│   ├── auth.js          # Rutas de autenticación
│   ├── group.js         # Rutas de grupos
│   └── messages.js      # Rutas de mensajes
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore          # Archivos ignorados por Git
├── index.js            # Punto de entrada
└── package.json        # Dependencias y scripts
```

## 🗄️ Modelos de datos

### Usuario
```javascript
{
  name: String,
  email: String (único),
  password: String (encriptado),
  userName: String,
  friends: Array,
  requests: Array,
  requestSended: Array,
  imageUrl: {
    extraSmall: String,
    small: String,
    medium: String
  },
  online: Boolean
}
```

### Mensaje
```javascript
{
  from: ObjectId (ref: User),
  to: ObjectId (ref: User),
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Grupo
```javascript
{
  name: String,
  admin: ObjectId (ref: User),
  imageUrl: {
    extraSmall: String,
    small: String,
    medium: String
  },
  users: Array
}
```

## 🔒 Seguridad

- **Autenticación JWT** para todas las rutas protegidas
- **Encriptación de contraseñas** con bcryptjs
- **Validación de campos** con express-validator
- **CORS** configurado para solicitudes cross-origin
- **Validación de tipos de archivo** para subida de imágenes

## 🚀 Despliegue

1. **Variables de entorno de producción**
   - Configura todas las variables de entorno necesarias
   - Usa una base de datos MongoDB en la nube (MongoDB Atlas)
   - Configura Cloudinary para producción

2. **Construir y ejecutar**
   ```bash
   npm start
   ```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Node.js y Socket.IO**