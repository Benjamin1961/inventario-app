'use client';

import { useState } from 'react';
import { Producto } from '@/types/producto';
import { X, Plus } from 'lucide-react';

interface FormularioProductoProps {
  onAgregar: (producto: Producto) => void;
  onCerrar: () => void;
  mostrar: boolean;
}

export default function FormularioProducto({ onAgregar, onCerrar, mostrar }: FormularioProductoProps) {
  const [producto, setProducto] = useState<Partial<Producto>>({
    codigo: '',
    descripcion: '',
    partida: '',
    unidad: '',
    bodega: '',
    existencia: 0,
    consumoMensual: 0,
    codigoClasificacion: '',
    codigoIdentificacion: '',
    numeroProcedimiento: '',
    tipoProcedimiento: 'Licitación Directa',
    imagePath: '',
    categoria: '',
    proveedor: ''
  });

  const calcularEstimadoMeses = (existencia: number, consumoMensual: number): number => {
    if (consumoMensual === 0) return 999;
    return Math.ceil(existencia / consumoMensual);
  };

  const manejarCambio = (campo: keyof Producto, valor: string | number) => {
    setProducto(prev => ({ ...prev, [campo]: valor }));
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!producto.codigo || !producto.descripcion) {
      alert('Código y Descripción son obligatorios');
      return;
    }

    const nuevoProducto: Producto = {
      codigo: producto.codigo!,
      descripcion: producto.descripcion!,
      partida: producto.partida || '',
      unidad: producto.unidad || 'Unidad',
      bodega: producto.bodega || 'Bodega General',
      existencia: Number(producto.existencia) || 0,
      consumoMensual: Number(producto.consumoMensual) || 0,
      estimadoMeses: calcularEstimadoMeses(Number(producto.existencia) || 0, Number(producto.consumoMensual) || 0),
      codigoClasificacion: producto.codigoClasificacion || '',
      codigoIdentificacion: producto.codigoIdentificacion || '',
      numeroProcedimiento: producto.numeroProcedimiento || '',
      tipoProcedimiento: producto.tipoProcedimiento || 'Licitación Directa',
      imagePath: producto.imagePath || '',
      categoria: producto.categoria || '',
      proveedor: producto.proveedor || ''
    };

    onAgregar(nuevoProducto);
    
    // Limpiar formulario
    setProducto({
      codigo: '',
      descripcion: '',
      partida: '',
      unidad: '',
      bodega: '',
      existencia: 0,
      consumoMensual: 0,
      codigoClasificacion: '',
      codigoIdentificacion: '',
      numeroProcedimiento: '',
      tipoProcedimiento: 'Licitación Directa',
      imagePath: '',
      categoria: '',
      proveedor: ''
    });
    
    onCerrar();
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Producto</h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código - REQUERIDO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código * <span className="text-red-500">(Llave de búsqueda)</span>
              </label>
              <input
                type="text"
                value={producto.codigo}
                onChange={(e) => manejarCambio('codigo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: INV001"
                required
              />
            </div>

            {/* Descripción - REQUERIDO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                value={producto.descripcion}
                onChange={(e) => manejarCambio('descripcion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Papel Bond Tamaño Carta"
                required
              />
            </div>

            {/* Partida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partida</label>
              <input
                type="text"
                value={producto.partida}
                onChange={(e) => manejarCambio('partida', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 5111001"
              />
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select
                value={producto.unidad}
                onChange={(e) => manejarCambio('unidad', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unidad">Unidad</option>
                <option value="Caja">Caja</option>
                <option value="Resma">Resma</option>
                <option value="Botella">Botella</option>
                <option value="Paquete">Paquete</option>
                <option value="Litro">Litro</option>
                <option value="Kilogramo">Kilogramo</option>
                <option value="Metro">Metro</option>
              </select>
            </div>

            {/* Bodega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
              <select
                value={producto.bodega}
                onChange={(e) => manejarCambio('bodega', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bodega General">Bodega General</option>
                <option value="Bodega Central">Bodega Central</option>
                <option value="Bodega Tecnología">Bodega Tecnología</option>
                <option value="Bodega Limpieza">Bodega Limpieza</option>
                <option value="Bodega Papelería">Bodega Papelería</option>
              </select>
            </div>

            {/* Existencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Existencia (cantidad actual)
              </label>
              <input
                type="number"
                step="0.01"
                value={producto.existencia}
                onChange={(e) => manejarCambio('existencia', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 150.5"
              />
            </div>

            {/* Consumo Mensual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumo Mensual
              </label>
              <input
                type="number"
                step="0.01"
                value={producto.consumoMensual}
                onChange={(e) => manejarCambio('consumoMensual', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 25.5"
              />
            </div>

            {/* Código Clasificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Clasificación</label>
              <input
                type="text"
                value={producto.codigoClasificacion}
                onChange={(e) => manejarCambio('codigoClasificacion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: PAP001"
              />
            </div>

            {/* Código Identificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Identificación</label>
              <input
                type="text"
                value={producto.codigoIdentificacion}
                onChange={(e) => manejarCambio('codigoIdentificacion', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: ID-PAP-001"
              />
            </div>

            {/* Número Procedimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Procedimiento (24 dígitos)
              </label>
              <input
                type="text"
                maxLength={24}
                value={producto.numeroProcedimiento}
                onChange={(e) => manejarCambio('numeroProcedimiento', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 2024LD-000001-0009100001"
              />
            </div>

            {/* Tipo Procedimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Procedimiento</label>
              <select
                value={producto.tipoProcedimiento}
                onChange={(e) => manejarCambio('tipoProcedimiento', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Licitación Directa">Licitación Directa</option>
                <option value="Licitación Pública">Licitación Pública</option>
                <option value="Convenio Marco">Convenio Marco</option>
                <option value="Compra Menor">Compra Menor</option>
                <option value="Excepción">Excepción</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={producto.categoria}
                onChange={(e) => manejarCambio('categoria', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una categoría</option>
                <option value="Papelería">Papelería</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Oficina">Oficina</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                value={producto.proveedor}
                onChange={(e) => manejarCambio('proveedor', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Distribuidora XYZ SA"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}