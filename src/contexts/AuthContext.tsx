'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definir tipos para usuarios y autenticación
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
}

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Usuarios predefinidos (en producción esto estaría en una base de datos)
const USUARIOS_PREDEFINIDOS: { email: string; password: string; usuario: Usuario }[] = [
  {
    email: 'admin@inventario.com',
    password: 'admin123',
    usuario: {
      id: '1',
      nombre: 'Administrador',
      email: 'admin@inventario.com',
      rol: 'admin'
    }
  },
  {
    email: 'usuario1@inventario.com',
    password: 'user123',
    usuario: {
      id: '2',
      nombre: 'Usuario Uno',
      email: 'usuario1@inventario.com',
      rol: 'usuario'
    }
  },
  {
    email: 'usuario2@inventario.com',
    password: 'user123',
    usuario: {
      id: '3',
      nombre: 'Usuario Dos',
      email: 'usuario2@inventario.com',
      rol: 'usuario'
    }
  },
  {
    email: 'usuario3@inventario.com',
    password: 'user123',
    usuario: {
      id: '4',
      nombre: 'Usuario Tres',
      email: 'usuario3@inventario.com',
      rol: 'usuario'
    }
  }
];

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
    
    // Simular delay de autenticación (como una API real)
    await new Promise(resolve => setTimeout(resolve, 800));

    const usuarioEncontrado = USUARIOS_PREDEFINIDOS.find(
      u => u.email === email && u.password === password
    );

    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado.usuario);
      localStorage.setItem('inventario_usuario', JSON.stringify(usuarioEncontrado.usuario));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
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