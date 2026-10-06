// components/miki/miki.jsx
import { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import '../../css/estilos.css';

// ✅ CORREGIDO: Usar ruta relativa vacía
const API_URL = '';  // ← Cambiado: ya no usa variable de entorno

export default function Miki() {
    const { logoutUser, user } = useAuth();
    const navigate = useNavigate();

    const [galeria, setGaleria] = useState([]);
    const [indiceActual, setIndiceActual] = useState(0);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [comentarioModal, setComentarioModal] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    // Cargar imágenes al iniciar
    useEffect(() => {
        if (user?.id) {
            cargarImagenes();
        }
    }, [user?.id]);

    const cargarImagenes = async () => {
        setCargando(true);

        try {
            // ✅ CORREGIDO: Usar ruta relativa
            const response = await fetch(`/api/imagenes/${user.id}`);

            const data = await response.json();

            if (data.success && data.imagenes) {
                const fotosCargadas = [];

                for (const img of data.imagenes) {
                    // ✅ CORREGIDO: Usar ruta relativa
                    const comentariosResponse = await fetch(`/api/comentarios/${img.id}`);
                    const comentariosData = await comentariosResponse.json();

                    try {
                        // ✅ CORREGIDO: Usar ruta relativa
                        const likeResponse = await fetch(`/api/likes/verificar/${img.id}/${user.id}`);
                        const likeData = await likeResponse.json();

                        fotosCargadas.push({
                            id: img.id,
                            url: img.link_imagen,  // ✅ CORREGIDO: usar solo la ruta relativa
                            likes: img.likes || 0,
                            comentarios: comentariosData.comentarios || [],
                            userLiked: likeData.liked || false
                        });

                    } catch (likeError) {
                        console.error('Error al verificar like:', likeError);

                        fotosCargadas.push({
                            id: img.id,
                            url: img.link_imagen,  // ✅ CORREGIDO
                            likes: img.likes || 0,
                            comentarios: comentariosData.comentarios || [],
                            userLiked: false
                        });
                    }
                }

                setGaleria(fotosCargadas);
            }

        } catch (error) {
            console.error('Error al cargar imágenes:', error);

        } finally {
            setCargando(false);
        }
    };

    // Manejar la subida de fotos
    const handleSubirFoto = async (e) => {
        const archivo = e.target.files[0];

        if (!archivo) return;

        const formData = new FormData();
        formData.append('imagen', archivo);
        formData.append('usuario_id', user.id);
        formData.append('frase', '');

        try {
            // ✅ CORREGIDO: Usar ruta relativa
            const response = await fetch(`/api/imagenes`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                await cargarImagenes();
            } else {
                console.error('Error al subir:', data.error);
            }

        } catch (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir la imagen');
        }
    };

    // Manejar likes con endpoint TOGGLE
    const handleLike = async (indice) => {
        const foto = galeria[indice];

        if (!foto) return;

        try {
            // ✅ CORREGIDO: Usar ruta relativa
            const response = await fetch(`/api/likes/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imagen_id: foto.id,
                    usuario_id: user.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                const nuevaGaleria = [...galeria];
                nuevaGaleria[indice].likes = data.likes;
                nuevaGaleria[indice].userLiked = data.liked;
                setGaleria(nuevaGaleria);

            } else {
                console.error('Error al procesar like:', data.error);
                alert('Error al procesar like: ' + (data.error || 'Error desconocido'));
            }

        } catch (error) {
            console.error('Error en la petición de like:', error);
            alert('Error de conexión al servidor');
        }
    };

    // Agregar comentario a la foto actual
    const handleAgregarComentarioModal = async () => {
        if (comentarioModal.trim()) {
            const fotoActual = galeria[indiceActual];

            try {
                // ✅ CORREGIDO: Usar ruta relativa
                const response = await fetch(`/api/comentarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        imagen_id: fotoActual.id,
                        usuario_id: user.id,
                        comentario: comentarioModal
                    })
                });

                if (response.ok) {
                    // ✅ CORREGIDO: Usar ruta relativa
                    const comentariosResponse = await fetch(`/api/comentarios/${fotoActual.id}`);
                    const comentariosData = await comentariosResponse.json();

                    const nuevaGaleria = [...galeria];
                    nuevaGaleria[indiceActual].comentarios = comentariosData.comentarios || [];
                    setGaleria(nuevaGaleria);

                    setComentarioModal("");
                    setModalAbierto(false);
                }

            } catch (error) {
                console.error('Error al agregar comentario:', error);
                alert('Error al agregar comentario');
            }
        }
    };

    // Eliminar comentario
    const handleEliminarComentario = async (comentarioId) => {
        try {
            // ✅ CORREGIDO: Usar ruta relativa
            const response = await fetch(`/api/comentarios/${comentarioId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const fotoActual = galeria[indiceActual];
                // ✅ CORREGIDO: Usar ruta relativa
                const comentariosResponse = await fetch(`/api/comentarios/${fotoActual.id}`);
                const comentariosData = await comentariosResponse.json();

                const nuevaGaleria = [...galeria];
                nuevaGaleria[indiceActual].comentarios = comentariosData.comentarios || [];
                setGaleria(nuevaGaleria);
            }

        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            alert('Error al eliminar comentario');
        }
    };

    // Navegación del carrusel
    const siguienteFoto = () => {
        setIndiceActual((prev) => (prev + 1) % galeria.length);
    };

    const anteriorFoto = () => {
        setIndiceActual((prev) => (prev - 1 + galeria.length) % galeria.length);
    };

    return (
        <div className="miki-container">
            <div className="header">
                <h1>🌸 Perfil de Miki 🌸</h1>
                <p>Bienvenida, {user?.nombre}</p>
            </div>

            <div className="content">
                <div className="mensaje">
                    <h4>💕 ¿Por qué siempre se la pasa sonriendo al celular? 💕</h4>
                </div>

                <div className="galeria-section">
                    <h2>📸 Galería de Fotos</h2>

                    <div className="upload-area">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSubirFoto}
                            id="subirFoto"
                            className="input-file"
                        />
                        <label htmlFor="subirFoto" className="btn-subir">
                            📷 Subir Foto
                        </label>
                    </div>

                    {cargando ? (
                        <div className="sin-fotos">
                            <p>Cargando imágenes...</p>
                        </div>
                    ) : galeria.length > 0 ? (
                        <div className="carrusel-container">
                            <div className="carrusel">
                                <button onClick={anteriorFoto} className="carrusel-btn">❮</button>
                                <div className="carrusel-contenedor">
                                    <img
                                        src={galeria[indiceActual].url}
                                        alt={`Foto ${indiceActual + 1}`}
                                        className="carrusel-imagen"
                                    />
                                    <p className="contador-fotos">
                                        {indiceActual + 1} / {galeria.length}
                                    </p>
                                    <button
                                        onClick={() => handleLike(indiceActual)}
                                        className={`like-btn-foto ${galeria[indiceActual].userLiked ? 'liked' : ''}`}
                                    >
                                        {galeria[indiceActual].userLiked ? '❤️' : '🤍'}
                                    </button>
                                </div>
                                <button onClick={siguienteFoto} className="carrusel-btn">❯</button>
                            </div>

                            <button onClick={() => setModalAbierto(true)} className="btn-comentar-rapido">
                                💬 Agregar Comentario
                            </button>

                            {galeria[indiceActual].comentarios.length > 0 && (
                                <div className="comentarios-foto">
                                    <h3>💬 Comentarios ({galeria[indiceActual].comentarios.length})</h3>
                                    <div className="lista-comentarios-foto">
                                        {galeria[indiceActual].comentarios.map((comentario) => (
                                            <div key={comentario.id} className="comentario-foto">
                                                <div className="comentario-foto-texto">
                                                    💬 {comentario.comentario}
                                                </div>
                                                <div className="comentario-foto-footer">
                                                    <span className="comentario-foto-fecha">
                                                        {comentario.created_at}
                                                    </span>
                                                    {comentario.usuario_id === user?.id && (
                                                        <button
                                                            onClick={() => handleEliminarComentario(comentario.id)}
                                                            className="btn-eliminar-comentario"
                                                            title="Eliminar comentario"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="sin-fotos">
                            <p>📭 No hay fotos aún. Sube tu primera foto!</p>
                        </div>
                    )}
                </div>
            </div>

            {modalAbierto && (
                <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>💬 Comentar foto {indiceActual + 1}</h3>
                        <textarea
                            value={comentarioModal}
                            onChange={(e) => setComentarioModal(e.target.value)}
                            placeholder="Escribe tu comentario sobre esta foto..."
                            rows="4"
                            className="modal-textarea"
                            autoFocus
                        />
                        <div className="modal-buttons">
                            <button onClick={handleAgregarComentarioModal} className="modal-btn-enviar">
                                Enviar Comentario 💌
                            </button>
                            <button onClick={() => setModalAbierto(false)} className="modal-btn-cancelar">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}