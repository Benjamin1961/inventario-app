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
    const usuarioGuardado = localStorage.getItem('inventario_usuario');
    if (usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
        localStorage.removeItem('inventario_usuario');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const usuarioAutenticado = await autenticarUsuario(email, password);
      
      if (usuarioAutenticado) {
        // Convertir el usuario completo a la versión simplificada para el contexto
        const usuarioSimplificado: Usuario = {
          id: usuarioAutenticado.id,
          nombre: usuarioAutenticado.nombre,
          email: usuarioAutenticado.email,
          rol: usuarioAutenticado.rol,
          requiere_cambio_password: usuarioAutenticado.debe_cambiar_password
        };
        
        setUsuario(usuarioSimplificado);
        localStorage.setItem('inventario_usuario', JSON.stringify(usuarioSimplificado));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error en autenticación:', error);
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