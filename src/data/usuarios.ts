import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Tipos para la gestión de usuarios
export interface Usuario {
  id: string;
  created_at: string;
  updated_at: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
  password_temporal: boolean;
  debe_cambiar_password: boolean;
  ultimo_cambio_password?: string;
  creado_por?: string;
  ultimo_login?: string;
}

export interface CrearUsuarioData {
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  creado_por: string;
}

// Generar contraseña temporal aleatoria
export const generarPasswordTemporal = (): string => {
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const simbolos = '!@#$%&*';
  
  let password = '';
  // Garantizar al menos uno de cada tipo
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
  password += minusculas[Math.floor(Math.random() * minusculas.length)];
  password += numeros[Math.floor(Math.random() * numeros.length)];
  password += simbolos[Math.floor(Math.random() * simbolos.length)];
  
  // Completar hasta 8 caracteres
  const todos = mayusculas + minusculas + numeros + simbolos;
  for (let i = 4; i < 8; i++) {
    password += todos[Math.floor(Math.random() * todos.length)];
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Validar formato de email con dominio @almacen.cr
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@almacen\.cr$/;
  return emailRegex.test(email);
};

// Encriptar contraseña
export const encriptarPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Verificar contraseña
export const verificarPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Crear nuevo usuario (solo admins)
export const crearUsuario = async (data: CrearUsuarioData): Promise<{usuario: Usuario | null, passwordTemporal: string}> => {
  try {
    // Validar email
    if (!validarEmail(data.email)) {
      throw new Error('El email debe usar el dominio @almacen.cr');
    }

    // Generar contraseña temporal
    const passwordTemporal = generarPasswordTemporal();
    const passwordHash = await encriptarPassword(passwordTemporal);

    // Insertar en la base de datos
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: data.nombre,
        email: data.email,
        password_hash: passwordHash,
        rol: data.rol,
        activo: true,
        password_temporal: true,
        debe_cambiar_password: true,
        creado_por: data.creado_por
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando usuario:', error);
      return { usuario: null, passwordTemporal: '' };
    }

    return { usuario, passwordTemporal };
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    return { usuario: null, passwordTemporal: '' };
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }

  return data || [];
};

// Autenticar usuario
export const autenticarUsuario = async (email: string, password: string): Promise<Usuario | null> => {
  try {
    console.log('🔐 Iniciando autenticación para:', email);
    
    // Validar formato de email
    if (!validarEmail(email)) {
      console.log('❌ Email inválido:', email);
      return null;
    }
    console.log('✅ Email válido');

    // Buscar usuario en la base de datos
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error || !usuario) {
      console.log('❌ Usuario no encontrado o inactivo:', error);
      return null;
    }
    console.log('✅ Usuario encontrado:', { id: usuario.id, email: usuario.email, activo: usuario.activo });

    // Verificar contraseña
    console.log('🔍 Verificando contraseña...');
    console.log('Hash en BD:', usuario.password_hash);
    
    const passwordValida = await verificarPassword(password, usuario.password_hash);
    console.log('Resultado verificación:', passwordValida);
    
    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return null;
    }
    console.log('✅ Contraseña correcta');

    // Actualizar último login
    console.log('📝 Actualizando último login...');
    await supabase
      .from('usuarios')
      .update({ ultimo_login: new Date().toISOString() })
      .eq('id', usuario.id);

    console.log('🎉 Autenticación exitosa');
    return usuario;
  } catch (error) {
    console.error('💥 Error en autenticación:', error);
    return null;
  }
};

// Cambiar contraseña
export const cambiarPassword = async (userId: string, nuevaPassword: string): Promise<boolean> => {
  try {
    const passwordHash = await encriptarPassword(nuevaPassword);
    
    const { error } = await supabase
      .from('usuarios')
      .update({
        password_hash: passwordHash,
        password_temporal: false,
        debe_cambiar_password: false,
        ultimo_cambio_password: new Date().toISOString()
      })
      .eq('id', userId);

    return !error;
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return false;
  }
};

// Desactivar usuario
export const desactivarUsuario = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', userId);

  return !error;
};

// Activar usuario
export const activarUsuario = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('usuarios')
    .update({ activo: true })
    .eq('id', userId);

  return !error;
};

// Resetear contraseña (generar nueva temporal)
export const resetearPassword = async (userId: string): Promise<string> => {
  try {
    const passwordTemporal = generarPasswordTemporal();
    const passwordHash = await encriptarPassword(passwordTemporal);

    const { error } = await supabase
      .from('usuarios')
      .update({
        password_hash: passwordHash,
        password_temporal: true,
        debe_cambiar_password: true
      })
      .eq('id', userId);

    if (error) {
      return '';
    }

    return passwordTemporal;
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    return '';
  }
};