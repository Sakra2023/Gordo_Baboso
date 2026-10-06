// components/miki/miki.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DobleFea from "../components/miki/miki"; // Nota: corregí el nombre (asumo que el componente se llama DobleFea)
import "../css/header.css"; // Importar los estilos

export default function Miki() {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <div className="miki-wrapper">
            <div className="miki-card">
                <h1 className="miki-title">💕 La Miki ama mucho a su novio 💕</h1>
                <button onClick={handleLogout} className="miki-btn-logout">
                    Cerrar Sesión
                </button>

            </div>
            <div className="doblefea-container">
                <DobleFea />
            </div>
        </div>
    );
}