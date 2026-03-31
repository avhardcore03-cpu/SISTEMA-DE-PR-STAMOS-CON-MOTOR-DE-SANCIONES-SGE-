/**
 * Simulador de Base de Datos en Memoria
 * Estructura de datos para usuarios, préstamos y sanciones
 * NOTA: Esta es una implementación en memoria. Cambiar a SQL cuando sea necesario.
 */

/**
 * Array de usuarios - Base de datos en memoria
 *
 * Credenciales de prueba:
 * ADMIN: email = admin@example.com | password = admin
 * ADMIN: email = admin2@example.com | password = admin
 * ESTUDIANTE: email = luis.gonzalez@example.com | password = password123
 * ESTUDIANTE: email = iris.martinez@example.com | password = password123
 * ESTUDIANTE: email = andrea.lopez@example.com | password = password123
 * ESTUDIANTE: email = carlos.ramirez@example.com | password = password123
 * ESTUDIANTE: email = marta.sanchez@example.com | password = password123
 */
export const usuariosDB = [
  //  ADMIN 1
  {
    id: 1,
    nombre: "Admin Sistema",
    email: "admin@example.com",
    tipo_documento: "CC",
    identificacion: "1098765432",
    // Hash bcrypt (cost 10) para "admin"
    password: "$2a$10$CkIYPU1j7HBz7bxVzrFcNuqWxLqBTSQfaFPQSzpcSiX1lJfwNMdEe",
    rol: "ADMIN",
    estado: "ACTIVO",
    strikes: 0,
    fechaCreacion: new Date("2024-01-01"),
  },
  //  ADMIN 2
  {
    id: 2,
    nombre: "Admin Suplente",
    email: "admin2@example.com",
    tipo_documento: "CC",
    identificacion: "1087654321",
    // Hash bcrypt (cost 10) para "admin"
    password: "$2a$10$CkIYPU1j7HBz7bxVzrFcNuqWxLqBTSQfaFPQSzpcSiX1lJfwNMdEe",
    rol: "ADMIN",
    estado: "ACTIVO",
    strikes: 0,
    fechaCreacion: new Date("2024-01-05"),
  },
  //  ESTUDIANTE 1: ACTIVO - 0 Strikes
  {
    id: 3,
    nombre: "Luis González",
    email: "luis.gonzalez@example.com",
    tipo_documento: "CC",
    identificacion: "1001234567",
    // Hash bcrypt (cost 10) para "password123"
    password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a",
    rol: "ESTUDIANTE",
    estado: "ACTIVO",
    strikes: 0,
    fechaCreacion: new Date("2024-02-01"),
  },
  //  ESTUDIANTE 2: ACTIVO - 0 Strikes
  {
    id: 4,
    nombre: "Iris Martínez",
    email: "iris.martinez@example.com",
    tipo_documento: "CC",
    identificacion: "1002345678",
    // Hash bcrypt (cost 10) para "password123"
    password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a",
    rol: "ESTUDIANTE",
    estado: "ACTIVO",
    strikes: 0,
    fechaCreacion: new Date("2024-02-05"),
  },
  //  ESTUDIANTE 3: ACTIVO - 0 Strikes
  {
    id: 5,
    nombre: "Andrea López",
    email: "andrea.lopez@example.com",
    tipo_documento: "TI",
    identificacion: "1003456789",
    // Hash bcrypt (cost 10) para "password123"
    password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a",
    rol: "ESTUDIANTE",
    estado: "ACTIVO",
    strikes: 0,
    fechaCreacion: new Date("2024-02-10"),
  },
  //  ESTUDIANTE 4: OBSERVACIÓN - 1 Strike (para testing de sanciones)
  {
    id: 6,
    nombre: "Carlos Ramírez",
    email: "carlos.ramirez@example.com",
    tipo_documento: "CC",
    identificacion: "1004567890",
    // Hash bcrypt (cost 10) para "password123"
    password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a",
    rol: "ESTUDIANTE",
    estado: "OBSERVACIÓN",
    strikes: 1,
    fechaCreacion: new Date("2024-02-15"),
  },
  //  ESTUDIANTE 5: ADVERTENCIA - 2 Strikes (para testing de sanciones)
  {
    id: 7,
    nombre: "Marta Sánchez",
    email: "marta.sanchez@example.com",
    tipo_documento: "TI",
    identificacion: "1005678901",
    // Hash bcrypt (cost 10) para "password123"
    password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a",
    rol: "ESTUDIANTE",
    estado: "ADVERTENCIA",
    strikes: 2,
    fechaCreacion: new Date("2024-02-20"),
  },
  //  ESTUDIANTE 6: SUSPENDIDO - 3 Strikes (para testing de sanciones)
  {
    id: 8,
    nombre: "Juan Pérez",
    email: "juan.perez@example.com",
    tipo_documento: "CC",
    identificacion: "1006789012",
    // Hash bcrypt (cost 10) para "password123"
    password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a",
    rol: "ESTUDIANTE",
    estado: "SUSPENDIDO",
    strikes: 3,
    fechaCreacion: new Date("2024-02-25"),
  },
];

// Array que simula la tabla de préstamos en la base de datos
// Incluye préstamos PENDIENTES asignados a estudiantes suspendidos
export const prestamosDB = [
  //  PRÉSTAMO PENDIENTE - Estudiante 1 SUSPENDIDO (Carlos Ramírez, ID 3)
  {
    id_prestamo: 101,
    id_usuario: 3,
    nombre_usuario: "Carlos Ramírez",
    email_usuario: "carlos.ramirez@example.com",
    tipo_documento: "CC",
    identificacion: "1001234567",
    id_equipo: 1,
    nombre_equipo: "Laptop Lenovo ThinkPad",
    fecha_prestamo: new Date("2024-03-01"),
    fecha_devolucion: new Date("2024-03-25"),
    fecha_entrega_real: null,
    estado: "PENDIENTE",
    fecha_sancion: null,
    dias_retraso: 5,
  },
  // PRÉSTAMO PENDIENTE - Estudiante 2 SUSPENDIDO (Marta Sánchez, ID 4)
  {
    id_prestamo: 102,
    id_usuario: 4,
    nombre_usuario: "Marta Sánchez",
    email_usuario: "marta.sanchez@example.com",
    tipo_documento: "TI",
    identificacion: "1002345678",
    id_equipo: 2,
    nombre_equipo: "Videoproyector BenQ",
    fecha_prestamo: new Date("2024-03-02"),
    fecha_devolucion: new Date("2024-03-20"),
    fecha_entrega_real: null,
    estado: "PENDIENTE",
    fecha_sancion: null,
    dias_retraso: 7,
  },
  //  PRÉSTAMO DEVUELTO - Estudiante 3 ACTIVO (Luis González, ID 5)
  {
    id_prestamo: 103,
    id_usuario: 5,
    nombre_usuario: "Luis González",
    email_usuario: "luis.gonzalez@example.com",
    tipo_documento: "CC",
    identificacion: "1003456789",
    id_equipo: 3,
    nombre_equipo: "Tablet Samsung Galaxy Tab",
    fecha_prestamo: new Date("2024-02-20"),
    fecha_devolucion: new Date("2024-03-05"),
    fecha_entrega_real: new Date("2024-03-04"),
    estado: "DEVUELTO",
    fecha_sancion: null,
    dias_retraso: 0,
  },
  //  PRÉSTAMO DEVUELTO - Estudiante 4 ACTIVO (Iris Martínez, ID 6)
  {
    id_prestamo: 104,
    id_usuario: 6,
    nombre_usuario: "Iris Martínez",
    email_usuario: "iris.martinez@example.com",
    tipo_documento: "CC",
    identificacion: "1004567890",
    id_equipo: 4,
    nombre_equipo: "Cámara Canon EOS",
    fecha_prestamo: new Date("2024-02-15"),
    fecha_devolucion: new Date("2024-02-25"),
    fecha_entrega_real: new Date("2024-02-24"),
    estado: "DEVUELTO",
    fecha_sancion: null,
    dias_retraso: 0,
  },
  //  PRÉSTAMO DEVUELTO - Estudiante 5 ACTIVO (Andrea López, ID 7)
  {
    id_prestamo: 105,
    id_usuario: 7,
    nombre_usuario: "Andrea López",
    email_usuario: "andrea.lopez@example.com",
    tipo_documento: "TI",
    identificacion: "1005678901",
    id_equipo: 5,
    nombre_equipo: "Cable HDMI Premium",
    fecha_prestamo: new Date("2024-03-10"),
    fecha_devolucion: new Date("2024-03-25"),
    fecha_entrega_real: new Date("2024-03-19"),
    estado: "DEVUELTO",
    fecha_sancion: null,
    dias_retraso: 0,
  },
];

// 1. Creamos la lista de equipos (el inventario) - 10 EQUIPOS DIFERENTES
export const equiposDB = [
  {
    id: 1,
    nombre: "Laptop Lenovo ThinkPad",
    categoria: "Computadoras",
    estado: "Prestado",
    stock_total: 2,
    icono: "💻",
    descripcion: "Laptop de alto rendimiento para desarrollo de software",
  },
  {
    id: 2,
    nombre: "Videoproyector BenQ",
    categoria: "Audio/Video",
    estado: "Prestado",
    stock_total: 1,
    icono: "🎬",
    descripcion: "Proyector Full HD con 3000 lúmenes de brillo",
  },
  {
    id: 3,
    nombre: "Tablet Samsung Galaxy Tab",
    categoria: "Tablets",
    estado: "Prestado",
    stock_total: 2,
    icono: "📱",
    descripcion: "Tablet de 10.1 pulgadas con S Pen incluido",
  },
  {
    id: 4,
    nombre: "Cámara Canon EOS",
    categoria: "Fotografía",
    estado: "Disponible",
    stock_total: 1,
    icono: "📷",
    descripcion: "Cámara DSLR profesional con lentes 18-55mm y 75-300mm",
  },
  {
    id: 5,
    nombre: "Cable HDMI Premium",
    categoria: "Accesorios",
    estado: "Prestado",
    stock_total: 5,
    icono: "🔌",
    descripcion: "Cable HDMI 2.0 de 3 metros con soporte 4K",
  },
  {
    id: 6,
    nombre: "Monitor Dell UltraSharp 27",
    categoria: "Audio/Video",
    estado: "Disponible",
    stock_total: 2,
    icono: "🖥️",
    descripcion: "Monitor 4K con panel IPS y calibración de color",
  },
  {
    id: 7,
    nombre: "Mouse Logitech MX Master",
    categoria: "Computadoras",
    estado: "Disponible",
    stock_total: 4,
    icono: "🖱️",
    descripcion: "Mouse profesional inalámbrico con batería recargable",
  },
  {
    id: 8,
    nombre: "Micrófono Condenser Blue",
    categoria: "Audio/Video",
    estado: "Disponible",
    stock_total: 1,
    icono: "🎤",
    descripcion: "Micrófono de condensador USB para grabación profesional",
  },
  {
    id: 9,
    nombre: "iPad Pro 12.9",
    categoria: "Tablets",
    estado: "Disponible",
    stock_total: 1,
    icono: "📲",
    descripcion: "Tablet de 12.9 pulgadas con Apple Pencil y Magic Keyboard",
  },
  {
    id: 10,
    nombre: "Dron DJI Mini 3",
    categoria: "Fotografía",
    estado: "Disponible",
    stock_total: 1,
    icono: "🚁",
    descripcion: "Dron de 249g con cámara 12MP y batería de 34 min de vuelo",
  },
];
