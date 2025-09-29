'use client';

import { useState, useEffect } from 'react';
import { Producto } from '@/types/producto';
import { X, Save, AlertCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { subirImagen, eliminarImagen } from '@/data/productos';

interface EditarProductoProps {
  producto: Producto | null;
  onGuardar: (productoEditado: Producto) => void;
  onCerrar: () => void;
  mostrar: boolean;
}

export default function EditarProducto({ producto, onGuardar, onCerrar, mostrar }: EditarProductoProps) {
  const [formData, setFormData] = useState<Producto>({
    codigo: '',
    descripcion: '',
    partida: '',
    unidad: 'UNI',
    bodega: 'Bodega General',
    existencia: 0,
    consumoMensual: 0,
    estimadoMeses: 0,
    codigoClasificacion: '',
    codigoIdentificacion: '',
    numeroProcedimiento: '',
    tipoProcedimiento: 'Convenio Marco',
    imagePath: '',
    categoria: '',
    proveedor: ''
  });

  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [imagenSeleccionada, setImagenSeleccionada] = useState<File | null>(null);
  const [previsualizacion, setPrevisualizacion] = useState<string>('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Función para calcular estimado de meses
  const calcularEstimadoMeses = (existencia: number, consumoMensual: number): number => {
    if (consumoMensual === 0) return 999;
    return Math.ceil(existencia / consumoMensual);
  };

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (producto && mostrar) {
      setFormData(producto);
      setErrores({});
      setImagenSeleccionada(null);
      setPrevisualizacion('');
    }
  }, [producto, mostrar]);

  // Actualizar estimado cuando cambian existencia o consumo
  useEffect(() => {
    const nuevoEstimado = calcularEstimadoMeses(formData.existencia, formData.consumoMensual);
    setFormData(prev => ({ ...prev, estimadoMeses: nuevoEstimado }));
  }, [formData.existencia, formData.consumoMensual]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convertir a número si es un campo numérico
    const valorFinal = ['existencia', 'consumoMensual'].includes(name) 
      ? parseFloat(value) || 0 
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));

    // Limpiar error si existe
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const manejarSeleccionImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validaciones
    if (!archivo.type.startsWith('image/')) {
      setErrores(prev => ({ ...prev, imagen: 'Por favor selecciona una imagen válida' }));
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) { // 5MB
      setErrores(prev => ({ ...prev, imagen: 'La imagen debe ser menor a 5MB' }));
      return;
    }

    // Limpiar error previo
    setErrores(prev => ({ ...prev, imagen: '' }));
    
    setImagenSeleccionada(archivo);
    
    // Crear previsualización
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPrevisualizacion(e.target.result as string);
      }
    };
    reader.readAsDataURL(archivo);
  };

  const eliminarImagenActual = async () => {
    if (formData.imagePath) {
      try {
        setSubiendoImagen(true);
        await eliminarImagen(formData.imagePath);
        setFormData(prev => ({ ...prev, imagePath: '' }));
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
        setErrores(prev => ({ ...prev, imagen: 'Error al eliminar la imagen actual' }));
      } finally {
        setSubiendoImagen(false);
      }
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!formData.codigo.trim()) {
      nuevosErrores.codigo = 'El código es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (formData.existencia < 0) {
      nuevosErrores.existencia = 'La existencia no puede ser negativa';
    }

    if (formData.consumoMensual < 0) {
      nuevosErrores.consumoMensual = 'El consumo mensual no puede ser negativo';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      try {
        setSubiendoImagen(true);
        let productoFinal = { ...formData };

        // Si hay una nueva imagen seleccionada, subirla
        if (imagenSeleccionada) {
          // Eliminar imagen anterior si existe
          if (formData.imagePath) {
            await eliminarImagen(formData.imagePath);
          }
          
          // Subir nueva imagen
          const rutaImagen = await subirImagen(imagenSeleccionada, formData.codigo);
          if (rutaImagen) {
            productoFinal = { ...productoFinal, imagePath: rutaImagen };
          }
        }

        onGuardar(productoFinal);
        onCerrar();
      } catch (error) {
        console.error('Error al procesar imagen:', error);
        setErrores(prev => ({ ...prev, imagen: 'Error al procesar la imagen' }));
      } finally {
        setSubiendoImagen(false);
      }
    }
  };

  const handleCerrar = () => {
    setErrores({});
    setImagenSeleccionada(null);
    setPrevisualizacion('');
    onCerrar();
  };

  if (!mostrar || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Editar Producto</h2>
          <button onClick={handleCerrar} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-4">📋 Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errores.codigo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 02-00548"
                />
                {errores.codigo && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errores.codigo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Identificación
                </label>
                <input
                  type="text"
                  name="codigoIdentificacion"
                  value={formData.codigoIdentificacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ID único"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errores.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descripción del producto"
                />
                {errores.descripcion && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errores.descripcion}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventario y ubicación */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-4">📦 Inventario y Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existencia
                </label>
                <input
                  type="number"
                  name="existencia"
                  value={formData.existencia}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errores.existencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errores.existencia && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errores.existencia}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumo Mensual
                </label>
                <input
                  type="number"
                  name="consumoMensual"
                  value={formData.consumoMensual}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errores.consumoMensual ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errores.consumoMensual && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errores.consumoMensual}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimado Meses
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.estimadoMeses}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    formData.estimadoMeses <= 1 ? 'bg-red-100 text-red-800' :
                    formData.estimadoMeses <= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {formData.estimadoMeses <= 1 ? 'Crítico' :
                     formData.estimadoMeses <= 3 ? 'Bajo' : 'Normal'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad
                </label>
                <select
                  name="unidad"
                  value={formData.unidad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UNI">UNI</option>
                  <option value="RESMA">RESMA</option>
                  <option value="CAJA">CAJA</option>
                  <option value="PAQUETE">PAQUETE</option>
                  <option value="KG">KG</option>
                  <option value="LITRO">LITRO</option>
                  <option value="METRO">METRO</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bodega
                </label>
                <input
                  type="text"
                  name="bodega"
                  value={formData.bodega}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre de la bodega"
                />
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-4">📄 Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partida
                </label>
                <input
                  type="text"
                  name="partida"
                  value={formData.partida}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 29903"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Clasificación
                </label>
                <input
                  type="text"
                  name="codigoClasificacion"
                  value={formData.codigoClasificacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Código de clasificación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Procedimiento
                </label>
                <select
                  name="tipoProcedimiento"
                  value={formData.tipoProcedimiento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Convenio Marco">Convenio Marco</option>
                  <option value="Licitación">Licitación</option>
                  <option value="Contratación Directa">Contratación Directa</option>
                  <option value="Régimen Especial">Régimen Especial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Categoría del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Procedimiento
                </label>
                <input
                  type="text"
                  name="numeroProcedimiento"
                  value={formData.numeroProcedimiento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número de procedimiento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                
                {/* Imagen actual */}
                {formData.imagePath && !previsualizacion && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                    <div className="relative inline-block">
                      <img 
                        src={formData.imagePath} 
                        alt="Imagen actual del producto"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={eliminarImagenActual}
                        disabled={subiendoImagen}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Eliminar imagen actual"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Nueva imagen seleccionada */}
                {previsualizacion && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Nueva imagen:</p>
                    <img 
                      src={previsualizacion} 
                      alt="Previsualización" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {/* Campo de selección de archivo */}
                <div className="flex items-center gap-4">
                  <label className="flex-1">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {imagenSeleccionada ? imagenSeleccionada.name : 'Seleccionar nueva imagen'}
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF (máx. 5MB)</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarSeleccionImagen}
                      className="hidden"
                      disabled={subiendoImagen}
                    />
                  </label>
                </div>

                {errores.imagen && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errores.imagen}
                  </p>
                )}

                {subiendoImagen && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Procesando imagen...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCerrar}
              className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={subiendoImagen}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subiendoImagen ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}