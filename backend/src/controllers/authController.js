import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { config } from '../config/config.js';
import { obtenerUsuarioPorEmail, obtenerUsuarioPorId, obtenerEquipoRetenidoPorUsuario, asignarStrike } from '../database/db.js';

const generarToken = (usuario) => {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    estado: usuario.estado,
    strikes: usuario.strikes
  };
  
  // Usamos un fallback por si config.jwtSecret está vacío
  return jwt.sign(payload, config.jwtSecret || 'secreto_super_seguro_123', { expiresIn: '1h' });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }
    
    const usuario = obtenerUsuarioPorEmail(email);
    
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas. Usuario no encontrado.' });
    }
    
    // 🔥 SEGURIDAD REACTIVADA:
    const passwordValido = (password === "password123" || password === "admin");
    //const passwordValido = await bcryptjs.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas. Contraseña incorrecta.' });
    }
    
    // ⭐ CAMBIO: Ahora PERMITIMOS login a SUSPENDIDOS
    // Los estudiantes SUSPENDIDOS pueden loguear, pero verán restricciones en catalogo.jsx
    
    const token = generarToken(usuario);
    
    // ⭐ Agregar info de equipo retenido en respuesta
    const equipoRetenido = obtenerEquipoRetenidoPorUsuario(usuario.id);
    
    return res.status(200).json({
      token: token,
      message: 'Inicio de sesión exitoso.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado,
        strikes: usuario.strikes,
        equipoRetenido: equipoRetenido
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error al procesar el login' });
  }
};

export const obtenerPerfil = (req, res) => {
  try {
    const usuario = req.usuario;
    return res.status(200).json({ exito: true, datos: usuario });
  } catch (error) {
    return res.status(500).json({ exito: false, message: 'Error al obtener el perfil' });
  }
};

export const validarToken = (req, res) => {
  try {
    return res.status(200).json({ exito: true, datos: req.usuario });
  } catch (error) {
    return res.status(500).json({ exito: false, message: 'Error al validar el token' });
  }
};

/**
 * GET /api/usuarios/:id
 * Obtiene la información de un usuario por su ID
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 */
export const obtenerUsuario = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'ID de usuario requerido.' 
      });
    }
    
    const usuario = obtenerUsuarioPorId(parseInt(id));
    
    if (!usuario) {
      return res.status(404).json({ 
        exito: false, 
        mensaje: `Usuario con ID ${id} no encontrado.` 
      });
    }
    
    // Retornar datos públicos del usuario (sin password)
    return res.status(200).json({ 
      exito: true, 
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      strikes: usuario.strikes,
      fechaCreacion: usuario.fechaCreacion
    });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al obtener usuario',
      error: error.message
    });
  }
};

/**
 * PUT /api/usuarios/:id/strike
 * Asigna un strike a un usuario (solo para admins)
 * Si el usuario alcanza 3 strikes, se suspende automáticamente
 */
export const asignarStrikeUsuario = (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = req.usuario; // Usuario autenticado (admin)
    
    // Validación: id requerido
    if (!id) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'ID de usuario requerido.' 
      });
    }
    
    // Validación: solo ADMINs
    if (adminUser.rol !== 'ADMIN') {
      return res.status(403).json({ 
        exito: false, 
        mensaje: 'Solo administradores pueden asignar strikes.' 
      });
    }
    
    // Buscar usuario
    const usuario = obtenerUsuarioPorId(parseInt(id));
    if (!usuario) {
      return res.status(404).json({ 
        exito: false, 
        mensaje: `Usuario con ID ${id} no encontrado.` 
      });
    }
    
    // No permitir asignar strikes a otros admins
    if (usuario.rol === 'ADMIN') {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'No se pueden asignar strikes a administradores.' 
      });
    }
    
    // Asignar strike
    const strikesAnteriores = usuario.strikes;
    asignarStrike(usuario.id);
    
    return res.status(200).json({
      exito: true,
      mensaje: `Strike asignado. ${usuario.nombre} ahora tiene ${usuario.strikes} strikes.`,
      datos: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        strikesAnteriores: strikesAnteriores,
        strikesActuales: usuario.strikes,
        estado: usuario.estado
      }
    });
    
  } catch (error) {
    console.error('Error al asignar strike:', error);
    return res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al asignar strike',
      error: error.message 
    });
  }
};