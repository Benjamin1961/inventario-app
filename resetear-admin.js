// Script para resetear la contraseña del administrador
// Ejecutar cuando se olvide la contraseña

const bcrypt = require('bcryptjs');

const resetearAdminPassword = async () => {
  const nuevaPassword = 'Admin123!'; // Contraseña temporal conocida
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(nuevaPassword, salt);
  
  console.log('=== RESETEAR CONTRASEÑA ADMIN ===');
  console.log('Nueva contraseña temporal:', nuevaPassword);
  console.log('Nuevo hash:', hash);
  
  console.log('\n=== SQL PARA EJECUTAR EN SUPABASE ===');
  console.log(`
UPDATE usuarios 
SET 
  password_hash = '${hash}',
  password_temporal = true,
  debe_cambiar_password = true,
  ultimo_cambio_password = NOW()
WHERE email = 'admin@almacen.cr';
  `);
  
  console.log('\n=== INSTRUCCIONES ===');
  console.log('1. Copia el SQL de arriba');
  console.log('2. Pégalo en Supabase SQL Editor');
  console.log('3. Ejecuta el SQL');
  console.log('4. Usa las credenciales:');
  console.log('   Email: admin@almacen.cr');
  console.log('   Contraseña:', nuevaPassword);
};

resetearAdminPassword();