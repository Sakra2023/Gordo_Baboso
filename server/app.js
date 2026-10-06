// server/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require("./database");
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para desarrollo y producción
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? true  // En producción, permite el origen del frontend servido
        : 'http://localhost:5173',  // Desarrollo con Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos (imágenes)
app.use('/imagenes_user', express.static(path.join(__dirname, 'imagenes_user')));

// Ruta principal
app.get("/", (req, res) => {
    res.send("Bienvenido Soy el mejor de los mejores🚀");
});

// Función para iniciar el servidor SOLO cuando la DB esté lista
async function initializeEndpointsAndStart() {
    try {
        // Esperar a que la base de datos esté conectada
        // La función conectarDB() en database.js ya tiene reintentos
        // Solo necesitamos un pequeño delay para asegurar que la primera conexión se complete
        
        console.log('🔄 Esperando conexión a base de datos...');
        
        // Esperar 2 segundos para dar tiempo a la primera conexión
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar si la conexión está activa
        try {
            const testConnection = await db.getConnection();
            testConnection.release();
            console.log('✅ Base de datos lista');
        } catch (err) {
            console.log('⚠️  Conexión aún no lista, esperando reintentos...');
            // Esperar 5 segundos más
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Endpoint login
        const loginEndpoint = require("./endpoint/login")(db);
        app.post("/login", loginEndpoint);
        
        // Endpoint imágenes
        const imagenesEndpoint = require("./endpoint/imagenes")(db);
        app.post("/api/imagenes", imagenesEndpoint.upload.single('imagen'), imagenesEndpoint.subirImagen);
        app.get("/api/imagenes/:usuario_id", imagenesEndpoint.obtenerImagenes);
        app.delete("/api/imagenes/:id", imagenesEndpoint.eliminarImagen);
        
        // Endpoint likes
        const likesEndpoint = require("./endpoint/likes")(db);
        app.post("/api/likes/toggle", likesEndpoint.toggleLike);
        app.get("/api/likes/verificar/:imagen_id/:usuario_id", likesEndpoint.verificarLike);
        app.get("/api/likes/total/:imagen_id", likesEndpoint.totalLikes);
        
        // Endpoint comentarios
        const comentariosEndpoint = require("./endpoint/comentarios")(db);
        app.post("/api/comentarios", comentariosEndpoint.agregarComentario);
        app.get("/api/comentarios/:imagen_id", comentariosEndpoint.obtenerComentarios);
        app.delete("/api/comentarios/:id", comentariosEndpoint.eliminarComentario);
        app.put("/api/comentarios/:id", comentariosEndpoint.actualizarComentario);
        
        // Servir el frontend React en producción
        if (process.env.NODE_ENV === 'production') {
            // Servir archivos estáticos del build de React
            app.use(express.static(path.join(__dirname, '../dist')));
            
            // Para SPA: todas las rutas no API van a index.html
            app.use((req, res, next) => {
                if (req.path.startsWith('/api') || req.path === '/login') {
                    next();
                } else {
                    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
                }
            });
        }
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📦 Modo: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Base de datos: ${process.env.DB_NAME || 'prueba_docker'} en ${process.env.DB_HOST || 'localhost'}`);
            console.log(`📋 Endpoints disponibles:`);
            console.log(`  POST   /api/likes/toggle`);
            console.log(`  GET    /api/likes/verificar/:imagen_id/:usuario_id`);
            console.log(`  GET    /api/likes/total/:imagen_id`);
            console.log(`  POST   /api/comentarios`);
            console.log(`  GET    /api/comentarios/:imagen_id`);
            console.log(`  DELETE /api/comentarios/:id`);
            console.log(`  PUT    /api/comentarios/:id`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Iniciar la aplicación
initializeEndpointsAndStart();