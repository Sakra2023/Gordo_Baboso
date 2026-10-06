// backend/endpoint/imagenes.js

const fs = require('fs');
const path = require('path');
const multer = require('multer');

console.log("Endpoint de imágenes funcionando al 100%");

// Configurar multer para memoria
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },

    fileFilter: (req, file, cb) => {

        const allowed = /jpeg|jpg|png|gif|webp/;

        const ext = allowed.test(
            path.extname(file.originalname).toLowerCase()
        );

        const mime = allowed.test(file.mimetype);

        if (ext && mime) {
            return cb(null, true);
        }

        cb(new Error('Solo imágenes: jpeg, jpg, png, gif, webp'));
    }
});

// Asegurar carpeta imágenes
const carpetaImagenes = path.join(__dirname, '../imagenes_user');

if (!fs.existsSync(carpetaImagenes)) {

    fs.mkdirSync(carpetaImagenes, {
        recursive: true
    });
}

module.exports = (db) => {

    // =========================
    // SUBIR IMAGEN
    // =========================

    const subirImagen = async (req, res) => {

        try {

            const { usuario_id, frase } = req.body;

            if (!req.file) {

                return res.status(400).json({
                    error: 'No se envió imagen'
                });
            }

            if (!usuario_id) {

                return res.status(400).json({
                    error: 'usuario_id requerido'
                });
            }

            const extension =
                path.extname(req.file.originalname);

            const nombreImagen =
                `${Date.now()}_${usuario_id}${extension}`;

            const rutaImagen =
                `/imagenes_user/${nombreImagen}`;

            const rutaCompleta =
                path.join(carpetaImagenes, nombreImagen);

            // Guardar archivo físico
            fs.writeFileSync(
                rutaCompleta,
                req.file.buffer
            );

            // Guardar en BD
            const sql =
                'INSERT INTO imagenes_usuario (usuario_id, link_imagen, frase) VALUES (?, ?, ?)';

            const [result] = await db.query(
                sql,
                [usuario_id, rutaImagen, frase || null]
            );

            res.status(201).json({
                success: true,
                message: 'Imagen guardada',
                imagen_id: result.insertId,
                link_imagen: rutaImagen
            });

        } catch (error) {

            console.error('❌ Error subirImagen:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // =========================
    // OBTENER IMÁGENES
    // =========================

    const obtenerImagenes = async (req, res) => {

        try {

            const { usuario_id } = req.params;

            const sql =
                'SELECT id, link_imagen, frase, likes, comentarios_count, created_at FROM imagenes_usuario WHERE usuario_id = ? ORDER BY created_at DESC';

            const [imagenes] = await db.query(
                sql,
                [usuario_id]
            );

            res.json({
                success: true,
                imagenes
            });

        } catch (error) {

            console.error('❌ Error obtenerImagenes:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    // =========================
    // ELIMINAR IMAGEN
    // =========================

    const eliminarImagen = async (req, res) => {

        try {

            const { id } = req.params;

            const [results] = await db.query(
                'SELECT link_imagen FROM imagenes_usuario WHERE id = ?',
                [id]
            );

            if (results.length === 0) {

                return res.status(404).json({
                    error: 'Imagen no encontrada'
                });
            }

            const rutaImagen = path.join(
                __dirname,
                '../..',
                results[0].link_imagen
            );

            await db.query(
                'DELETE FROM imagenes_usuario WHERE id = ?',
                [id]
            );

            // Eliminar archivo físico
            if (fs.existsSync(rutaImagen)) {

                fs.unlinkSync(rutaImagen);
            }

            res.json({
                success: true,
                message: 'Imagen eliminada'
            });

        } catch (error) {

            console.error('❌ Error eliminarImagen:', error);

            res.status(500).json({
                error: error.message
            });
        }
    };

    return {
        upload,
        subirImagen,
        obtenerImagenes,
        eliminarImagen
    };
};