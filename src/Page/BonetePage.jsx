// components/bonete/bonete.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Fea from "../components/bonete/bonete"; // ⚠️ Importación circular - revisar
import "../css/header.css"; // Importar los mismos estilos

export default function Bonete() {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <div className="miki-wrapper">
            <div className="miki-card">
                <h1 className="miki-title">🎈 La Bonete es especial y necesitas loquero 🎈</h1>
                <button onClick={handleLogout} className="miki-btn-logout">
                    Cerrar Sesión
                </button>
            </div>
            <div className="doblefea-container">
                <Fea />
            </div>
        </div>
    );
}