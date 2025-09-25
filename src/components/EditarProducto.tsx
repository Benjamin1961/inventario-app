'use client';

import { useState, useEffect } from 'react';
import { Producto } from '@/types/producto';
import { X, Save, AlertCircle } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      onGuardar(formData);
      onCerrar();
    }
  };

  const handleCerrar = () => {
    setErrores({});
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
                  Ruta de Imagen
                </label>
                <input
                  type="text"
                  name="imagePath"
                  value={formData.imagePath}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL o ruta de la imagen (opcional)"
                />
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}