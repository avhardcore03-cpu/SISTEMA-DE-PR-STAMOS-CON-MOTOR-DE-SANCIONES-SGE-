import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { catalogoService } from "../services/apiService";
import { useNavigate } from "react-router-dom";

const Catalogo = ({ esEstudiante = false }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [estadoUsuario, setEstadoUsuario] = useState("ACTIVO"); //  ESTADO DEL USUARIO
  const [solicitudEnProceso, setSolicitudEnProceso] = useState({});
  const [mensajeSolicitud, setMensajeSolicitud] = useState("");
  const [trigger, setTrigger] = useState(0);

  const { datos: equipos, cargando } = useApi(catalogoService.getAll, trigger);

  const equiposDisponiblesContador = equipos.filter(
    (e) => e.estado === "Disponible",
  ).length;

  const obtenerPayloadJwt = (token) => {
    if (!token || !token.includes(".")) return null;

    const partes = token.split(".");
    if (partes.length < 2) return null;

    try {
      return JSON.parse(atob(partes[1]));
    } catch {
      return null;
    }
  };

  // Extraer ID del usuario del token y obtener su estado
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const usuarioGuardado = JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("usuario") || "null",
    );

    if (token) {
      const payload = obtenerPayloadJwt(token);

      // Token de emergencia o token invalido para JWT: usar fallback local
      if (!payload) {
        if (usuarioGuardado?.id) {
          setUsuarioId(usuarioGuardado.id);
        }
        setEstadoUsuario((usuarioGuardado?.estado || "ACTIVO").toUpperCase());
        return;
      }

      setUsuarioId(payload.id);

      //  OBTENER ESTADO DEL USUARIO
      const cargarEstadoUsuario = async () => {
        try {
          // Asumiendo que existe un endpoint que devuelve el usuario
          // Si no existe, puedes decodificar más datos del token
          const response = await fetch(
            `http://localhost:3001/api/usuarios/${payload.id}`,
          );
          if (response.ok) {
            const data = await response.json();
            setEstadoUsuario((data.estado || "ACTIVO").toUpperCase());
          }
        } catch (error) {
          console.error("Error al obtener estado del usuario:", error);
          // Por defecto usar ACTIVO si hay error
          setEstadoUsuario("ACTIVO");
        }
      };

      cargarEstadoUsuario();
    }
  }, []);
  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const normalizarTexto = (valor) =>
    String(valor ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const busquedaNormalizada = normalizarTexto(busqueda);
  const equiposFiltrados = equipos.filter((equipo) => {
    const coincideBusqueda =
      normalizarTexto(equipo.nombre).includes(busquedaNormalizada) ||
      normalizarTexto(equipo.id).includes(busquedaNormalizada) ||
      normalizarTexto(equipo.categoria).includes(busquedaNormalizada);
    return coincideBusqueda;
  });

  // Función para solicitar un equipo (solo estudiantes)
  const handleSolicitar = async (idEquipo, nombreEquipo) => {
    setSolicitudEnProceso({ ...solicitudEnProceso, [idEquipo]: true });
    setMensajeSolicitud("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/prestamos/solicitar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: usuarioId,
            id_equipo: idEquipo,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMensajeSolicitud(
          `✅ Solicitud de "${nombreEquipo}" enviada correctamente`,
        );

        // ✨ REFRESCAR DATOS DEL CATÁLOGO tras solicitud exitosa
        setTimeout(() => {
          setTrigger((prev) => prev + 1);
        }, 800);

        setTimeout(() => setMensajeSolicitud(""), 3000);
      } else {
        setMensajeSolicitud(
          `❌ Error: ${data.mensaje || "No se pudo procesar la solicitud"}`,
        );
      }
    } catch (error) {
      console.error("Error al solicitar equipo:", error);
      setMensajeSolicitud("❌ Error de conexión al servidor");
    } finally {
      setSolicitudEnProceso({ ...solicitudEnProceso, [idEquipo]: false });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Catálogo de Equipos
          </h1>
          {esEstudiante && (
            <p className="text-sm text-gray-500 mt-2">Rol: Estudiante</p>
          )}
        </div>
        <div className="text-right flex flex-col items-end gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Equipos Disponibles
            </p>
            <p className="text-4xl font-black text-[#008c72]">
              {cargando ? "..." : equiposDisponiblesContador}
            </p>
          </div>
          {esEstudiante && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>

      {/* ⭐ BANNER DE USUARIO SUSPENDIDO */}
      {esEstudiante && estadoUsuario === "SUSPENDIDO" && (
        <div className="mb-6 p-5 bg-red-50 border-2 border-red-400 rounded-lg flex items-start gap-4">
          <span className="text-3xl shrink-0">🚫</span>
          <div>
            <h3 className="font-bold text-red-700 text-lg mb-1">
              Tu cuenta está suspendida
            </h3>
            <p className="text-red-600 text-sm mb-2">
              Por favor devuelve los equipos pendientes o contacta al
              administrador para reactivar tu acceso.
            </p>
            <p className="text-xs text-red-500 italic">
              Se han acumulado múltiples retrasos en devoluciones. Esto ha
              resultado en la suspensión temporal de tu cuenta.
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de solicitud */}
      {mensajeSolicitud && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            mensajeSolicitud.includes("✅")
              ? "bg-green-100 border-green-300 text-green-700"
              : "bg-red-100 border-red-300 text-red-700"
          }`}
        >
          {mensajeSolicitud}
        </div>
      )}

      {/* Buscador */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-75">
          <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008c72]/20"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Dinámico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cargando ? (
          <p className="col-span-3 text-center py-20 text-gray-400 animate-pulse">
            Cargando equipos...
          </p>
        ) : equiposFiltrados.length > 0 ? (
          equiposFiltrados.map((equipo, index) => (
            <div
              key={`${equipo.id}-${index}`}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 group-hover:scale-105 transition-transform shrink-0">
                    {equipo.icono || "📦"}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">
                      {equipo.id}
                    </p>
                    <p className="text-[11px] text-gray-400 font-bold leading-none">
                      {equipo.categoria}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter shrink-0 ${
                    equipo.estado === "Disponible"
                      ? "bg-green-100 text-green-600 border-green-200"
                      : equipo.estado === "En Mantenimiento"
                        ? "bg-gray-100 text-gray-500 border-gray-200"
                        : "bg-orange-100 text-orange-600 border-orange-200"
                  }`}
                >
                  {equipo.estado}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-700 mb-2">
                {equipo.nombre}
              </h3>
              <p className="text-[11px] text-gray-400 mb-6 leading-relaxed line-clamp-2 italic flex-1">
                {equipo.descripcion || "Equipo disponible en el catálogo"}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mb-4">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${equipo.estado === "Disponible" ? "bg-green-400" : "bg-orange-400"}`}
                />
                <p className="text-[11px] text-gray-400 font-bold italic">
                  {equipo.estado === "Disponible"
                    ? "Disponible para préstamo"
                    : "No disponible actualmente"}
                </p>
              </div>

              {/* Botón Solicitar solo para estudiantes */}
              {esEstudiante && (
                <button
                  onClick={() => handleSolicitar(equipo.id, equipo.nombre)}
                  disabled={
                    solicitudEnProceso[equipo.id] ||
                    equipo.estado !== "Disponible" ||
                    estadoUsuario === "SUSPENDIDO" //  BLOQUEAR SI SUSPENDIDO
                  }
                  className={`w-full py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                    estadoUsuario === "SUSPENDIDO"
                      ? "bg-red-100 text-red-500 cursor-not-allowed border border-red-300"
                      : equipo.estado !== "Disponible"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : solicitudEnProceso[equipo.id]
                          ? "bg-blue-400 text-white animate-pulse"
                          : "bg-[#008c72] hover:bg-[#006b56] text-white"
                  }`}
                  title={
                    estadoUsuario === "SUSPENDIDO"
                      ? "Tu cuenta está suspendida"
                      : ""
                  }
                >
                  {estadoUsuario === "SUSPENDIDO"
                    ? "Cuenta Suspendida"
                    : solicitudEnProceso[equipo.id]
                      ? "Solicitando..."
                      : equipo.estado === "Disponible"
                        ? "Solicitar"
                        : "No disponible"}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-medium italic">
              No se encontraron resultados para esta búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
