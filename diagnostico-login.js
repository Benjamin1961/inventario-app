// Script para diagnosticar problemas de login
const bcrypt = require('bcryptjs');

const diagnosticarLogin = async () => {
  console.log('=== DIAGNÓSTICO DE LOGIN ===\n');
  
  // Probar diferentes contraseñas
  const contraseñasPosibles = [
    'Admin123!',
    'admin123!',
    'Admin123',
    'admin@123!'
  ];
  
  // Hash que debería estar en la BD (del último reseteo)
  const hashActual = '$2b$10$QeIKOKtRvAsJT4kqzR0XWuTZIA2kcDkTO2TYMJgzxpdEbgh7BXa7a';
  
  console.log('Hash en BD:', hashActual);
  console.log('\nProbando contraseñas:');
  
  for (const password of contraseñasPosibles) {
    try {
      const esValida = await bcrypt.compare(password, hashActual);
      console.log(`${password} -> ${esValida ? '✅ VÁLIDA' : '❌ Inválida'}`);
    } catch (error) {
      console.log(`${password} -> ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n=== NUEVO HASH PARA ADMIN123! ===');
  const nuevoHash = await bcrypt.hash('Admin123!', 10);
  console.log('Nuevo hash:', nuevoHash);
  
  console.log('\n=== SQL DE VERIFICACIÓN ===');
  console.log(`
-- Ver el usuario actual
SELECT email, password_hash, activo, debe_cambiar_password 
FROM usuarios 
WHERE email = 'admin@almacen.cr';

-- Actualizar con nuevo hash
UPDATE usuarios 
SET 
  password_hash = '${nuevoHash}',
  password_temporal = true,
  debe_cambiar_password = true,
  activo = true
WHERE email = 'admin@almacen.cr';
  `);
};

diagnosticarLogin().catch(console.error);