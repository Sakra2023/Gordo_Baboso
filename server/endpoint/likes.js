// backend/endpoint/likes.js

const console = require("console");

console.log("Endpoint de likes funcionando al 100%");

module.exports = (db) => {

    // Alternar like (dar o quitar)
    const toggleLike = async (req, res) => {

        try {

            const { imagen_id, usuario_id } = req.body;

            if (!imagen_id || !usuario_id) {

                return res.status(400).json({
                    error: 'imagen_id y usuario_id son requeridos'
                });
            }

            // Verificar si ya existe el like
            const checkSql =
                'SELECT id FROM likes_control WHERE imagen_id = ? AND usuario_id = ?';

            const [results] = await db.query(
                checkSql,
                [imagen_id, usuario_id]
            );

            // Si ya existe -> quitar like
            if (results.length > 0) {

                const deleteSql =
                    'DELETE FROM likes_control WHERE imagen_id = ? AND usuario_id = ?';

                await db.query(deleteSql, [imagen_id, usuario_id]);

                // Disminuir contador
                const updateSql =
                    'UPDATE imagenes_usuario SET likes = GREATEST(likes - 1, 0) WHERE id = ?';

                await db.query(updateSql, [imagen_id]);

                // Obtener total actualizado
                const getLikesSql =
                    'SELECT likes FROM imagenes_usuario WHERE id = ?';

                const [likesResults] = await db.query(
                    getLikesSql,
                    [imagen_id]
                );

                return res.json({
                    success: true,
                    message: 'Like eliminado',
                    liked: false,
                    likes: likesResults[0].likes
                });

            } else {

                // Si no existe -> agregar like
                const insertSql =
                    'INSERT INTO likes_control (imagen_id, usuario_id) VALUES (?, ?)';

                await db.query(insertSql, [imagen_id, usuario_id]);

                // Aumentar contador
                const updateSql =
                    'UPDATE imagenes_usuario SET likes = likes + 1 WHERE id = ?';

                await db.query(updateSql, [imagen_id]);

                // Obtener total actualizado
                const getLikesSql =
                    'SELECT likes FROM imagenes_usuario WHERE id = ?';

                const [likesResults] = await db.query(
                    getLikesSql,
                    [imagen_id]
                );

                return res.status(201).json({
                    success: true,
                    message: 'Like agregado',
                    liked: true,
                    likes: likesResults[0].likes
                });
            }

        } catch (error) {

            console.error('❌ Error toggleLike:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // Verificar si el usuario dio like
    const verificarLike = async (req, res) => {

        try {

            const { imagen_id, usuario_id } = req.params;

            const sql =
                'SELECT id FROM likes_control WHERE imagen_id = ? AND usuario_id = ?';

            const [results] = await db.query(
                sql,
                [imagen_id, usuario_id]
            );

            res.json({
                liked: results.length > 0
            });

        } catch (error) {

            console.error('❌ Error verificarLike:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // Obtener total de likes
    const totalLikes = async (req, res) => {

        try {

            const { imagen_id } = req.params;

            const sql =
                'SELECT likes FROM imagenes_usuario WHERE id = ?';

            const [results] = await db.query(sql, [imagen_id]);

            if (results.length === 0) {

                return res.status(404).json({
                    error: 'Imagen no encontrada'
                });
            }

            res.json({
                imagen_id: parseInt(imagen_id),
                total_likes: results[0].likes
            });

        } catch (error) {

            console.error('❌ Error totalLikes:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    return {
        toggleLike,
        verificarLike,
        totalLikes
    };
};