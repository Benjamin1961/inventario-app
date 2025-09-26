-- Script para crear el primer usuario administrador
-- Ejecutar este SQL en Supabase SQL Editor

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
  '$2a$10$rOc/HuSEfOJ5DtJYb/R/4.7G8F6uGJHW9Q8xYzR5Xqc3HBnZ6PQAS', -- Contraseña: Admin123!
  'admin',
  true,
  true,
  true
);

-- Nota: El hash corresponde a la contraseña "Admin123!"
-- En el primer logueo deberá cambiarla por seguridad