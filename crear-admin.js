// Script temporal para crear el admin inicial
// Ejecutar una sola vez con Node.js

const bcrypt = require('bcryptjs');

const crearAdminHash = async () => {
  const password = 'Admin123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Contraseña:', password);
  console.log('Hash para SQL:', hash);
  
  console.log('\n=== SQL PARA EJECUTAR EN SUPABASE ===');
  console.log(`
INSERT INTO usuarios (
  nombre,
  email,
  password_hash,
  rol,
  activo,
  password_temporal,
  debe_cambiar_password
) VALUES (
  'Administrador Principal',
  'admin@almacen.cr',
  '${hash}',
  'admin',
  true,
  true,
  true
);`);
};

crearAdminHash();