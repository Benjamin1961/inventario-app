// Script para verificar qué contraseña corresponde al hash actual
const bcrypt = require('bcryptjs');

const verificarHashActual = async () => {
  console.log('=== VERIFICACIÓN DE HASH ACTUAL ===\n');
  
  // Hash que está actualmente en la BD según el log
  const hashActual = '$2b$10$27xMXmpgEkOTlA.L8TsL7OeefhXcX37PV/7jQSPOV/4deB60S.sN6';
  
  // Contraseñas posibles para probar
  const contraseñasPosibles = [
    'Admin123!',
    'admin123!',
    'Admin123',
    'admin123',
    'password',
    'admin',
    'Admin2024!',
    'Admin1234!',
    // Posibles contraseñas que el usuario pudo haber puesto
    'Admin123.',
    'Admin123#',
    'Admin!123',
    '123Admin!',
  ];
  
  console.log('Hash actual en BD:', hashActual);
  console.log('\nProbando contraseñas:');
  
  for (const password of contraseñasPosibles) {
    try {
      const esValida = await bcrypt.compare(password, hashActual);
      console.log(`${password.padEnd(15)} -> ${esValida ? '✅ VÁLIDA' : '❌ Inválida'}`);
      if (esValida) {
        console.log(`\n🎉 CONTRASEÑA ENCONTRADA: "${password}"`);
        break;
      }
    } catch (error) {
      console.log(`${password.padEnd(15)} -> ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n=== GENERAR NUEVO HASH PARA ADMIN123! ===');
  const nuevoHash = await bcrypt.hash('Admin123!', 10);
  console.log('Nuevo hash para Admin123!:', nuevoHash);
  
  console.log('\n=== SQL PARA ACTUALIZAR ===');
  console.log(`
UPDATE usuarios 
SET 
  password_hash = '${nuevoHash}',
  password_temporal = true,
  debe_cambiar_password = true
WHERE email = 'admin@almacen.cr';
  `);
};

verificarHashActual().catch(console.error);