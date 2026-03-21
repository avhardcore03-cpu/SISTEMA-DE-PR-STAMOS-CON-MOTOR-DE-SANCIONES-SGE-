function Login() {
  return (
    <div className="min-h-screen bg-[#e6f4f1] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="bg-[#008c72] w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <span className="text-white text-3xl">🔒</span>
        </div>

        <h2 className="text-[#002b45] text-2xl font-bold mb-1">
          Sistema de Gestión de Préstamos
        </h2>
        <p className="text-gray-500 text-sm mb-10">IU Digital de Antioquia</p>

        <form className="text-left space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Correo Institucional
            </label>
            <input
              type="email"
              placeholder="usuario@iudigital.edu.co"
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
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c72] focus:border-transparent outline-none transition-all"
            />
          </div>

          <button className="w-full bg-[#008c72] hover:bg-[#00705b] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95">
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-10 p-4 bg-gray-50 rounded-xl text-left text-[11px] text-gray-500 border border-gray-100">
          <p className="font-bold text-gray-700 mb-1">
            Credenciales de prueba:
          </p>
          <p>Admin: admin@iudigital.edu.co / admin123</p>
          <p>Estudiante: cualquier correo @iudigital.edu.co</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
