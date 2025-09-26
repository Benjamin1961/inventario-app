'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { autenticarUsuario, type Usuario as UsuarioCompleto } from '../data/usuarios';

// Definir tipos para usuarios y autenticación (versión simplificada para el contexto)
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  requiere_cambio_password?: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar la aplicación
  useEffect(() => {
    console.log('🚀 AuthContext: Verificando sesión guardada...');
    const usuarioGuardado = localStorage.getItem('inventario_usuario');
    console.log('💾 AuthContext: Usuario en localStorage:', usuarioGuardado);
    
    if (usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        console.log('👤 AuthContext: Datos parseados:', usuarioData);
        setUsuario(usuarioData);
        console.log('✅ AuthContext: Usuario restaurado desde localStorage');
      } catch (error) {
        console.error('💥 AuthContext: Error al cargar usuario guardado:', error);
        localStorage.removeItem('inventario_usuario');
      }
    } else {
      console.log('❌ AuthContext: No hay usuario guardado');
    }
    setIsLoading(false);
    console.log('🏁 AuthContext: Inicialización completada');
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔐 AuthContext: Iniciando login para:', email);
    
    try {
      const usuarioAutenticado = await autenticarUsuario(email, password);
      console.log('🔐 AuthContext: Resultado autenticación:', usuarioAutenticado ? 'Exitosa' : 'Falló');
      
      if (usuarioAutenticado) {
        // Convertir el usuario completo a la versión simplificada para el contexto
        const usuarioSimplificado: Usuario = {
          id: usuarioAutenticado.id,
          nombre: usuarioAutenticado.nombre,
          email: usuarioAutenticado.email,
          rol: usuarioAutenticado.rol,
          requiere_cambio_password: usuarioAutenticado.debe_cambiar_password
        };
        
        console.log('👤 AuthContext: Usuario simplificado:', usuarioSimplificado);
        console.log('💾 AuthContext: Guardando en localStorage...');
        
        setUsuario(usuarioSimplificado);
        localStorage.setItem('inventario_usuario', JSON.stringify(usuarioSimplificado));
        
        console.log('✅ AuthContext: Login completado exitosamente');
        setIsLoading(false);
        return true;
      }
      
      console.log('❌ AuthContext: Autenticación falló');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('💥 AuthContext: Error en login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('inventario_usuario');
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};