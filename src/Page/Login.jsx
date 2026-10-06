// Login.jsx - Versión corregida
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta
import '../css/Login.css';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ message: "✨ Ingresa usuario y contraseña", isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // 👈 Cambiado de 'login' a 'loginUser'
  
  // ✅ CORREGIDO: Usar ruta relativa en lugar de hardcodeada
  const API_URL = '/login';  // ← Cambiado de 'http://localhost:3000/login'

  const setStatusMessage = (message, isError = false) => {
    setStatus({ message, isError });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!username || username.trim() === "") {
      setStatusMessage("❌ El usuario/email no puede estar vacío.", true);
      return;
    }
    if (!password || password.trim() === "") {
      setStatusMessage("❌ La contraseña no puede estar vacía.", true);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("🔄 Verificando credenciales...", false);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: username.trim(),
          contraseña: password.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.usuario;
        const token = data.token; // 👈 Recibir el token del backend
        setStatusMessage(`✅ ¡Bienvenido, ${user.nombre}!`, false);
        
        // Guardar usuario y token en el contexto
        loginUser(user, token); // 👈 Cambiado de 'login' a 'loginUser' y agregado token
        
        // Redirigir según el rol
        setTimeout(() => {
          const rol = user.rol;
          switch(rol) {
            case 'miki':
              navigate('/miki');
              break;
            case 'magoli':
              navigate('/magoli');
              break;
            case 'bonete':
              navigate('/bonete');
              break;
            default:
              navigate('/');
          }
          setIsSubmitting(false);
        }, 800);
      } else {
        setStatusMessage(`❌ ${data.error || 'Error de autenticación'}`, true);
        setIsSubmitting(false);
        
        // Efecto de sacudida
        const card = document.querySelector('.login-card');
        if (card) {
          card.style.transform = 'translateX(4px)';
          setTimeout(() => {
            if (card) card.style.transform = '';
          }, 200);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setStatusMessage("❌ Error de conexión con el servidor", true);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    
    if (status.isError) {
      setStatusMessage("✏️ Escribiendo...", false);
      setTimeout(() => {
        if (status.message === "✏️ Escribiendo...") {
          setStatus({ message: "✨ Ingresa usuario y contraseña", isError: false });
        }
      }, 1000);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="titulo">🔐 Acceso Seguro</div>
        <div className="subtitulo-wrapper">
          <div className="subtitulo">Ingresa tus credenciales</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>👤 Usuario o Correo electrónico</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: miki o miki@ejemplo.com"
              value={username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group">
            <label>🔒 Contraseña</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={isSubmitting}>
            {isSubmitting ? "Verificando..." : "Iniciar sesión →"}
          </button>

          <div className={`mensaje-status ${status.isError ? 'error' : 'success'}`}>
            {status.message}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;