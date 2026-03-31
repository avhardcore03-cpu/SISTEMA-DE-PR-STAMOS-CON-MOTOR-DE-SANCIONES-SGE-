/**
 * Configuración global de la aplicación
 * Importa variables de entorno y define constantes
 */

import dotenv from "dotenv";

// Cargar variables de entorno desde .env
dotenv.config();

export const config = {
  // Configuración del servidor
  puerto: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Configuración de JWT
  jwtSecret: process.env.JWT_SECRET || "clave-secreta-por-defecto",
  jwtExpire: process.env.JWT_EXPIRE || "7d",

  // URL del frontend
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Constantes de negocio
  TACKLES_PARA_SUSPENDER: 3,
  STATES: {
    ACTIVO: "ACTIVO",
    SUSPENDIDO: "SUSPENDIDO",
    INACTIVO: "INACTIVO",
  },

  ROLES: {
    ADMIN: "ADMIN",
    SUPERVISOR: "SUPERVISOR",
    ANALISTA: "ANALISTA",
  },

  ESTADOS_PRESTAMO: {
    PENDIENTE: "PENDIENTE",
    DEVUELTO: "DEVUELTO",
    CANCELADO: "CANCELADO",
  },
};

export default config;
