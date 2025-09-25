'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Email o contraseña incorrectos');
    }
  };

  const credencialesPrueba = [
    { email: 'admin@inventario.com', password: 'admin123', rol: 'Administrador' },
    { email: 'usuario1@inventario.com', password: 'user123', rol: 'Usuario' },
    { email: 'usuario2@inventario.com', password: 'user123', rol: 'Usuario' },
    { email: 'usuario3@inventario.com', password: 'user123', rol: 'Usuario' },
  ];

  const completarCredenciales = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Inventario</h1>
          <p className="text-gray-600">Iniciar sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="usuario@inventario.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Credenciales de prueba */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">👥 Usuarios de prueba:</h3>
          <div className="space-y-2">
            {credencialesPrueba.map((cred, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => completarCredenciales(cred.email, cred.password)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{cred.rol}</p>
                    <p className="text-xs text-gray-500">{cred.email}</p>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Click para usar</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Haz clic en cualquier usuario para autocompletar las credenciales
          </p>
        </div>
      </div>
    </div>
  );
}