import { useState, useEffect } from "react";

// Hook personalizado para manejar datos del API
export const useApi = (serviceFunction, trigger = 0) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resultado = await serviceFunction();
        
        // Si la respuesta tiene estructura {exito, cantidad, equipos}, extraer equipos
        if (resultado && resultado.equipos && Array.isArray(resultado.equipos)) {
          setDatos(resultado.equipos);
        } 
        // Si la respuesta tiene estructura {exito, prestamos}, extraer prestamos
        else if (resultado && resultado.prestamos && Array.isArray(resultado.prestamos)) {
          setDatos(resultado.prestamos);
        }
        // Si es un array directo
        else if (Array.isArray(resultado)) {
          setDatos(resultado);
        } 
        // Si es un objeto con datos array
        else if (resultado && resultado.datos && Array.isArray(resultado.datos)) {
          setDatos(resultado.datos);
        }
        // Fallback
        else {
          setDatos(resultado || []);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        setDatos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [trigger]); // ✨ Agregar trigger para refrescar cuando cambie

  return { datos, cargando, error, setDatos };
};
