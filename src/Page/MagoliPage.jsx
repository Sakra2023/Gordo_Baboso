// components/magoli/magoli.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Gordis from "../components/magoli/magoli"; // ⚠️ Importación circular - revisar
import "../css/header.css"; // Importar los mismos estilos

export default function Magoli() {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <div className="miki-wrapper">
            <div className="miki-card">
                <h1 className="miki-title">🐻 La Magoli es una gordis muy gordis 🐻</h1>
                <button onClick={handleLogout} className="miki-btn-logout">
                    Cerrar Sesión
                </button>
            </div>
            <div className="doblefea-container">
                <Gordis />
            </div>
        </div>
    );
}