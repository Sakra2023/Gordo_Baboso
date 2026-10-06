// login.js - Versión con JWT corregida para mysql2/promise

const jwt = require('jsonwebtoken');

console.log("Codigo del login Funcionando al 100");

module.exports = (pool) => {

    const loginEndpoint = async (req, res) => {

        try {

            const { identifier, contraseña } = req.body;

            // Validar datos
            if (!identifier || !contraseña) {

                return res.status(400).json({
                    error: 'Identificador y contraseña son requeridos'
                });
            }

            // Detectar si es email o nombre usuario
            const isEmail =
                identifier.includes('@') &&
                identifier.includes('.');

            let sql;

            if (isEmail) {

                sql = 'SELECT * FROM usuarios WHERE email = ?';

            } else {

                sql = 'SELECT * FROM usuarios WHERE nombre = ?';
            }

            // Ejecutar consulta
            const [results] = await pool.query(sql, [identifier]);

            // Verificar si existe usuario
            if (results.length === 0) {

                return res.status(401).json({
                    error: isEmail
                        ? 'Email no registrado'
                        : 'Nombre de usuario no registrado'
                });
            }

            const usuario = results[0];

            // Verificar contraseña
            if (contraseña !== usuario.contraseña) {

                return res.status(401).json({
                    error: 'Contraseña incorrecta'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    rol: usuario.rol,
                    email: usuario.email
                },
                'tu-secreto-super-seguro', // En producción usar variable de entorno
                {
                    expiresIn: '8h'
                }
            );

            // Ocultar contraseña
            delete usuario.contraseña;

            // Respuesta exitosa
            res.json({
                success: true,
                usuario,
                token
            });

        } catch (error) {

            console.error('❌ Error en login:', error);

            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    };

    return loginEndpoint;
};