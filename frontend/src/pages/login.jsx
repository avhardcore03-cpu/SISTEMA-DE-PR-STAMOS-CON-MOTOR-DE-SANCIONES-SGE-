import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 2. Herramienta para cambiar de página después de entrar
  //const navigate = useNavigate(); estoy moviendo esta línea arriba para que esté junto a los otros useState

  // 3. El motor del botón "Iniciar Sesión"
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token con clave "authToken" para que App.jsx pueda extraer el rol
        localStorage.setItem("authToken", data.token);
        const usuario = data.user || data.usuario;
        if (usuario) {
          localStorage.setItem("user", JSON.stringify(usuario));
        }

        // Redirigir al catálogo (disponible para todos los roles)
        navigate("/catalogo");
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      setError("Error de conexión");
    }
  };
  return (
    <div className="min-h-screen bg-[#e6f4f1] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="bg-[#008c72] w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <span className="text-white text-3xl">🔒</span>
        </div>

        <h2 className="text-[#002b45] text-2xl font-bold mb-1">
          Sistema de Gestión de Préstamos
        </h2>
        <p className="text-gray-500 text-sm mb-6">IU Digital de Antioquia</p>

        <form onSubmit={handleLogin} className="text-left space-y-6">
          {/* Aquí mostramos la alerta roja si algo sale mal */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c72] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c72] focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#008c72] hover:bg-[#00705b] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Textos de ayuda actualizados para el Backend real */}
        <div className="mt-10 p-4 bg-gray-50 rounded-xl text-left text-[11px] text-gray-500 border border-gray-100">
          <p className="font-bold text-gray-700 mb-1">
            Credenciales de prueba del Backend:
          </p>
          <p>Email: juan@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
