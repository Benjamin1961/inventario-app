'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  obtenerUsuarios, 
  crearUsuario, 
  desactivarUsuario, 
  activarUsuario, 
  resetearPassword,
  type Usuario,
  type CrearUsuarioData 
} from '../data/usuarios';
import { limpiarTodosLosProductos } from '../data/productos';

interface PanelUsuariosProps {
  onClose: () => void;
}

const PanelUsuarios = ({ onClose }: PanelUsuariosProps) => {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'usuario' as 'admin' | 'usuario'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const usuariosData = await obtenerUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      mostrarMensaje('error', 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.email.trim()) {
      mostrarMensaje('error', 'Todos los campos son obligatorios');
      return;
    }

    // Validar que el email termine en @almacen.cr
    if (!formData.email.endsWith('@almacen.cr')) {
      mostrarMensaje('error', 'El email debe terminar en @almacen.cr');
      return;
    }

    try {
      const nuevoUsuarioData: CrearUsuarioData = {
        ...formData,
        creado_por: usuarioActual?.id || ''
      };

      const resultado = await crearUsuario(nuevoUsuarioData);
      
      if (resultado.usuario) {
        mostrarMensaje('success', `Usuario creado. Contraseña temporal: ${resultado.passwordTemporal}`);
        setFormData({ nombre: '', email: '', rol: 'usuario' });
        setMostrarFormulario(false);
        await cargarUsuarios();
      } else {
        mostrarMensaje('error', 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
      mostrarMensaje('error', 'Error al crear usuario');
    }
  };

  const manejarDesactivar = async (userId: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de desactivar a ${nombre}?`)) {
      try {
        const exito = await desactivarUsuario(userId);
        if (exito) {
          mostrarMensaje('success', 'Usuario desactivado');
          await cargarUsuarios();
        } else {
          mostrarMensaje('error', 'Error al desactivar usuario');
        }
      } catch (error) {
        console.error('Error desactivando usuario:', error);
        mostrarMensaje('error', 'Error al desactivar usuario');
      }
    }
  };

  const manejarActivar = async (userId: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de activar a ${nombre}?`)) {
      try {
        const exito = await activarUsuario(userId);
        if (exito) {
          mostrarMensaje('success', 'Usuario activado');
          await cargarUsuarios();
        } else {
          mostrarMensaje('error', 'Error al activar usuario');
        }
      } catch (error) {
        console.error('Error activando usuario:', error);
        mostrarMensaje('error', 'Error al activar usuario');
      }
    }
  };

  const manejarResetearPassword = async (userId: string, nombre: string) => {
    if (window.confirm(`¿Resetear la contraseña de ${nombre}? Se generará una nueva contraseña temporal.`)) {
      try {
        const nuevaPassword = await resetearPassword(userId);
        mostrarMensaje('success', `Nueva contraseña temporal para ${nombre}: ${nuevaPassword}`);
        await cargarUsuarios();
      } catch (error) {
        console.error('Error reseteando contraseña:', error);
        mostrarMensaje('error', 'Error al resetear contraseña');
      }
    }
  };

  const manejarLimpiarProductos = async () => {
    if (window.confirm('⚠️ PELIGRO: ¿Estás seguro de eliminar TODOS los productos y sus imágenes? Esta acción no se puede deshacer.')) {
      if (window.confirm('🚨 CONFIRMACIÓN FINAL: Se eliminarán todos los productos permanentemente. ¿Continuar?')) {
        try {
          const exito = await limpiarTodosLosProductos();
          if (exito) {
            mostrarMensaje('success', '🧹 Todos los productos han sido eliminados exitosamente');
          } else {
            mostrarMensaje('error', 'Error al limpiar productos');
          }
        } catch (error) {
          console.error('Error limpiando productos:', error);
          mostrarMensaje('error', 'Error al limpiar productos');
        }
      }
    }
  };

  // Solo administradores pueden ver este panel
  if (usuarioActual?.rol !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">Solo los administradores pueden acceder a la gestión de usuarios.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
            </button>
            <button
              onClick={manejarLimpiarProductos}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              title="Eliminar todos los productos de prueba"
            >
              🧹 Limpiar Productos
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-4 p-4 rounded ${
            mensaje.tipo === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario para nuevo usuario */}
        {mostrarFormulario && (
          <form onSubmit={manejarSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (@almacen.cr)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@almacen.cr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value as 'admin' | 'usuario' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Crear Usuario
            </button>
          </form>
        )}

        {/* Lista de usuarios */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Rol</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Cambiar Contraseña</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{usuario.nombre}</td>
                    <td className="border border-gray-300 px-4 py-2">{usuario.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.rol === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {usuario.debe_cambiar_password && (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => manejarResetearPassword(usuario.id, usuario.nombre)}
                          className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                          title="Resetear Contraseña"
                        >
                          Reset
                        </button>
                        {usuario.activo ? (
                          <button
                            onClick={() => manejarDesactivar(usuario.id, usuario.nombre)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            disabled={usuario.id === usuarioActual?.id}
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => manejarActivar(usuario.id, usuario.nombre)}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {usuarios.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelUsuarios;