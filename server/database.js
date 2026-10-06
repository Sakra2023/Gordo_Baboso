// server/database.js
const mysql = require('mysql2/promise');

let pool = null;
let retryCount = 0;
const MAX_RETRIES = 10;

function createPool() {
    return mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'sakra2023',
        database: process.env.DB_NAME || 'prueba_docker',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
    });
}

// Inicializar el pool
pool = createPool();

// Verificar conexión con reintentos mejorados
async function conectarDB() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL exitosamente');
        console.log('📊 Host:', process.env.DB_HOST || 'localhost');
        console.log('📊 Database:', process.env.DB_NAME || 'prueba_docker');
        connection.release();
        retryCount = 0; // Resetear contador en caso de éxito
        return true;
    } catch (error) {
        console.error(`❌ Error conectando a MySQL (intento ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = Math.min(5000 * retryCount, 30000); // Espera progresiva: 5s, 10s, 15s...
            console.log(`⏳ Reintentando en ${delay/1000} segundos...`);
            setTimeout(conectarDB, delay);
        } else {
            console.error('❌ No se pudo conectar a MySQL después de múltiples intentos');
            console.error('💡 Verifica que:');
            console.error('   1. MySQL esté corriendo: docker-compose ps');
            console.error('   2. Las credenciales sean correctas');
            console.error('   3. El host sea accesible (usa "mysql" en Docker)');
            process.exit(1); // Salir si no se puede conectar
        }
        return false;
    }
}

// Ejecutar verificación inicial
conectarDB();

// Exportar el pool directamente
module.exports = pool;