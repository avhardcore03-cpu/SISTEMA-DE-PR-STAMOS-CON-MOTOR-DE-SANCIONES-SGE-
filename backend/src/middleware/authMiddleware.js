/**
 * Middleware de Autenticación con JWT
 * Verifica que el usuario tenga un token válido para acceder a rutas protegidas
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

/**
 * Middleware para verificar la autenticación con JWT
 * Validaciones:
 * 1. Verifica que exista el header de autorización
 * 2. Verifica que el token sea válido
 * 3. Agrega los datos del usuario al objeto request
 * 
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
export const verificarToken = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const token = req.headers.authorization?.split(' ')[1];
    
    // Validar que el token exista
    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token no proporcionado. Acceso denegado.',
        codigo: 'TOKEN_NO_PROPORCIONADO'
      });
    }
    
    // Verificar y decodificar el token
    const decodificado = jwt.verify(token, config.jwtSecret);
    
    // Adjuntar los datos del usuario decodificados al request
    // Esto permite que los controladores puedan acceder a los datos del usuario autenticado
    req.usuario = decodificado;
    
    // Pasar al siguiente middleware
    next();
    
  } catch (error) {
    // Manejo de errores de token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token expirado. Por favor, inicie sesión nuevamente.',
        codigo: 'TOKEN_EXPIRADO'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido.',
        codigo: 'TOKEN_INVALIDO'
      });
    }
    
    // Error genérico
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al verificar el token',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * Se usa en combinación con verificarToken
 * 
 * @param {string|Array<string>} rolesPermitidos - Rol o array de roles permitidos
 * @returns {Function} Middleware function
 */
export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Convertir a array si es un string
      const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
      
      // Validar que el usuario tenga uno de los roles permitidos
      if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({
          exito: false,
          mensaje: 'No tienes permisos para acceder a este recurso.',
          codigo: 'PERMISOS_INSUFICIENTES'
        });
      }
      
      next();
      
    } catch (error) {
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario no esté suspendido
 * La regla de oro: si el usuario tiene 3 strikes, está suspendido
 * 
 * @param {Object} req - Objeto request de Express (debe tener req.usuario)
 * @param {Object} res - Objeto response de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
export const verificarEstadoUsuario = (req, res, next) => {
  try {
    // Validar que el usuario no esté suspendido
    if (req.usuario && req.usuario.estado === 'SUSPENDIDO') {
      return res.status(403).json({
        exito: false,
        mensaje: 'Tu cuenta ha sido suspendida por exceso de retrasos en devoluciones.',
        codigo: 'USUARIO_SUSPENDIDO',
        datos: {
          strikes: req.usuario.strikes,
          estado: req.usuario.estado
        }
      });
    }
    
    next();
    
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al verificar estado del usuario',
      error: error.message
    });
  }
};
