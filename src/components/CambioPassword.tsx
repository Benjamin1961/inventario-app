'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cambiarPassword } from '../data/usuarios';

interface CambioPasswordProps {
  onPasswordCambiada: () => void;
}

const CambioPassword = ({ onPasswordCambiada }: CambioPasswordProps) => {
  const { usuario, logout } = useAuth();
  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validarPassword = (password: string): string[] => {
    const errores: string[] = [];
    
    if (password.length < 8) {
      errores.push('Mínimo 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errores.push('Al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errores.push('Al menos una minúscula');
    }
    
    if (!/\d/.test(password)) {
      errores.push('Al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errores.push('Al menos un símbolo especial');
    }
    
    return errores;
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nuevaPassword || !formData.confirmarPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.nuevaPassword !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const erroresValidacion = validarPassword(formData.nuevaPassword);
    if (erroresValidacion.length > 0) {
      setError('La contraseña debe cumplir: ' + erroresValidacion.join(', '));
      return;
    }

    if (!usuario?.id) {
      setError('Usuario no válido');
      return;
    }

    try {
      setIsLoading(true);
      const exito = await cambiarPassword(usuario.id, formData.nuevaPassword);
      
      if (exito) {
        alert('Contraseña cambiada exitosamente. Deberás iniciar sesión nuevamente.');
        logout(); // Cerrar sesión para que inicie con la nueva contraseña
        onPasswordCambiada();
      } else {
        setError('Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setError('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const manejarCerrarSesion = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión sin cambiar la contraseña? Deberás cambiarla en tu próximo inicio de sesión.')) {
      logout();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cambio de Contraseña Obligatorio</h2>
          <p className="text-gray-600">
            Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={formData.nuevaPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, nuevaPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={formData.confirmarPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmarPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800 font-medium mb-1">Requisitos de la contraseña:</p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos una letra minúscula</li>
              <li>Al menos un número</li>
              <li>Al menos un símbolo especial (!@#$%^&*)</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>

            <button
              type="button"
              onClick={manejarCerrarSesion}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cerrar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambioPassword;