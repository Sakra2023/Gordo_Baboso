// backend/endpoint/comentarios.js

const console = require("console");

console.log("Endpoint de comentarios funcionando al 100%");

module.exports = (db) => {

    // =========================
    // AGREGAR COMENTARIO
    // =========================

    const agregarComentario = async (req, res) => {

        try {

            const {
                imagen_id,
                usuario_id,
                comentario
            } = req.body;

            if (!imagen_id || !usuario_id || !comentario) {

                return res.status(400).json({
                    error: 'imagen_id, usuario_id y comentario son requeridos'
                });
            }

            if (comentario.trim().length === 0) {

                return res.status(400).json({
                    error: 'El comentario no puede estar vacío'
                });
            }

            const sql =
                'INSERT INTO comentarios_imagen (imagen_id, usuario_id, comentario) VALUES (?, ?, ?)';

            const [result] = await db.query(
                sql,
                [imagen_id, usuario_id, comentario.trim()]
            );

            res.status(201).json({
                success: true,
                message: 'Comentario agregado',
                comentario_id: result.insertId
            });

        } catch (error) {

            console.error('❌ Error agregarComentario:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // =========================
    // OBTENER COMENTARIOS
    // =========================

    const obtenerComentarios = async (req, res) => {

        try {

            const { imagen_id } = req.params;

            const sql = `
                SELECT 
                    c.id,
                    c.comentario,
                    c.created_at,
                    u.id as usuario_id,
                    u.nombre
                FROM comentarios_imagen c
                JOIN usuarios u
                    ON c.usuario_id = u.id
                WHERE c.imagen_id = ?
                ORDER BY c.created_at DESC
            `;

            const [comentarios] = await db.query(
                sql,
                [imagen_id]
            );

            res.json({
                success: true,
                comentarios
            });

        } catch (error) {

            console.error('❌ Error obtenerComentarios:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // =========================
    // ELIMINAR COMENTARIO
    // =========================

    const eliminarComentario = async (req, res) => {

        try {

            const { id } = req.params;

            const sql =
                'DELETE FROM comentarios_imagen WHERE id = ?';

            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error: 'Comentario no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Comentario eliminado'
            });

        } catch (error) {

            console.error('❌ Error eliminarComentario:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // =========================
    // ACTUALIZAR COMENTARIO
    // =========================

    const actualizarComentario = async (req, res) => {

        try {

            const { id } = req.params;

            const { comentario } = req.body;

            if (!comentario || comentario.trim().length === 0) {

                return res.status(400).json({
                    error: 'El comentario no puede estar vacío'
                });
            }

            const sql =
                'UPDATE comentarios_imagen SET comentario = ? WHERE id = ?';

            const [result] = await db.query(
                sql,
                [comentario.trim(), id]
            );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error: 'Comentario no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Comentario actualizado'
            });

        } catch (error) {

            console.error('❌ Error actualizarComentario:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    return {
        agregarComentario,
        obtenerComentarios,
        eliminarComentario,
        actualizarComentario
    };
};