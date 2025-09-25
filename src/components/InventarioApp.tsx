'use client';

import { useState, useEffect } from 'react';
import { Producto } from '@/types/producto';
import { obtenerTodosLosProductos, buscarPorCodigo, generarReportePorMeses } from '@/data/productos';
import FormularioProducto from './FormularioProducto';
import ImportarExcel from './ImportarExcel';
import EditarProducto from './EditarProducto';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Package, FileText, Filter, Plus, Upload, Edit, LogOut, User } from 'lucide-react';

export default function InventarioApp() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosOriginales, setProductosOriginales] = useState<Producto[]>([]);
  const [mostrarPopupBusqueda, setMostrarPopupBusqueda] = useState(false);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [filtroMeses, setFiltroMeses] = useState<number | null>(null);
  const [mostrarReportes, setMostrarReportes] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarImportarExcel, setMostrarImportarExcel] = useState(false);
  const [mostrarEditarProducto, setMostrarEditarProducto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  
  const { usuario, logout } = useAuth();

  useEffect(() => {
    const productosIniciales = obtenerTodosLosProductos();
    setProductos(productosIniciales);
    setProductosOriginales(productosIniciales);
  }, []);

  const realizarBusqueda = () => {
    if (codigoBusqueda.trim()) {
      const resultados = productosOriginales.filter(producto => 
        producto.codigo.toLowerCase().includes(codigoBusqueda.toLowerCase())
      );
      setProductos(resultados);
    } else {
      setProductos(productosOriginales);
    }
    setMostrarPopupBusqueda(false);
    setCodigoBusqueda('');
  };

  const aplicarFiltroMeses = (meses: number) => {
    const productosFiltrasos = productosOriginales.filter(producto => producto.estimadoMeses <= meses);
    setProductos(productosFiltrasos);
    setFiltroMeses(meses);
    setMostrarReportes(false);
  };

  const limpiarFiltros = () => {
    setProductos(productosOriginales);
    setFiltroMeses(null);
  };

  const agregarProducto = (nuevoProducto: Producto) => {
    // Verificar si la combinación código + codigoIdentificacion ya existe
    const existeCombinacion = productosOriginales.some(p => 
      p.codigo === nuevoProducto.codigo && p.codigoIdentificacion === nuevoProducto.codigoIdentificacion
    );
    
    if (existeCombinacion) {
      alert(`Ya existe un producto con el código ${nuevoProducto.codigo} y código de identificación ${nuevoProducto.codigoIdentificacion}`);
      return;
    }

    const nuevosProductos = [...productosOriginales, nuevoProducto];
    setProductosOriginales(nuevosProductos);
    setProductos(nuevosProductos);
  };

  const editarProducto = (productoEditado: Producto) => {
    const nuevosProductos = productosOriginales.map(p => 
      p.codigo === productoAEditar?.codigo && p.codigoIdentificacion === productoAEditar?.codigoIdentificacion 
        ? productoEditado 
        : p
    );
    setProductosOriginales(nuevosProductos);
    setProductos(nuevosProductos);
    setProductoAEditar(null);
  };

  const abrirEditorProducto = (producto: Producto) => {
    setProductoAEditar(producto);
    setMostrarEditarProducto(true);
  };

  const cerrarEditorProducto = () => {
    setMostrarEditarProducto(false);
    setProductoAEditar(null);
  };

  const importarProductos = (productosImportados: Producto[]) => {
    // Filtrar productos que no tengan combinaciones código+codigoIdentificacion duplicadas
    const productosNuevos = productosImportados.filter(importado => 
      !productosOriginales.some(existente => 
        existente.codigo === importado.codigo && 
        existente.codigoIdentificacion === importado.codigoIdentificacion
      )
    );

    if (productosNuevos.length === 0) {
      alert('Todos los productos ya existen en el sistema');
      return;
    }

    if (productosNuevos.length < productosImportados.length) {
      const duplicados = productosImportados.length - productosNuevos.length;
      alert(`Se importaron ${productosNuevos.length} productos. ${duplicados} productos fueron omitidos por tener combinaciones código+ID duplicadas.`);
    } else {
      alert(`Se importaron ${productosNuevos.length} productos exitosamente.`);
    }

    const nuevosProductos = [...productosOriginales, ...productosNuevos];
    setProductosOriginales(nuevosProductos);
    setProductos(nuevosProductos);
  };

  const obtenerColorEstado = (meses: number) => {
    if (meses <= 1) return 'text-red-600 bg-red-100';
    if (meses <= 2) return 'text-yellow-600 bg-yellow-100';
    if (meses <= 3) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sistema de Gestión de Inventario</h1>
                <p className="text-sm text-gray-600">Bienvenido, {usuario?.nombre}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMostrarPopupBusqueda(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Buscar por Código
                </button>
                
                <button
                  onClick={() => setMostrarReportes(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Reportes
                </button>
                
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </button>

                <button
                  onClick={() => setMostrarImportarExcel(true)}
                  className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Importar Excel
                </button>
                
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Ver Todos
                </button>
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{usuario?.rol === 'admin' ? 'Admin' : 'Usuario'}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </div>
            </div>
          </div>
          
          {filtroMeses && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Filtro activo:</strong> Mostrando productos con existencias para {filtroMeses} mes{filtroMeses > 1 ? 'es' : ''} o menos
                ({productos.length} productos encontrados)
              </p>
            </div>
          )}
        </div>

        {/* Lista de Productos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {productos.map((producto, index) => (
            <div key={`${producto.codigo}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Imagen del producto */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Sin imagen</span>
              </div>
              
              <div className="p-4">
                {/* Código y Descripción */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {producto.codigo}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${obtenerColorEstado(producto.estimadoMeses)}`}>
                      {producto.estimadoMeses} mes{producto.estimadoMeses !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg">{producto.descripcion}</h3>
                </div>

                {/* Información básica */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bodega:</span>
                    <span className="font-medium">{producto.bodega}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Existencia:</span>
                    <span className="font-medium">{producto.existencia} {producto.unidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consumo Mensual:</span>
                    <span className="font-medium">{producto.consumoMensual} {producto.unidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo Procedimiento:</span>
                    <span className="font-medium text-xs">{producto.tipoProcedimiento}</span>
                  </div>
                </div>

                {/* Detalles expandibles */}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    Ver más detalles
                  </summary>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <div><strong>Partida:</strong> {producto.partida}</div>
                    <div><strong>Código Clasificación:</strong> {producto.codigoClasificacion}</div>
                    <div><strong>Código Identificación:</strong> {producto.codigoIdentificacion}</div>
                    <div><strong>N° Procedimiento:</strong> {producto.numeroProcedimiento}</div>
                    {producto.categoria && <div><strong>Categoría:</strong> {producto.categoria}</div>}
                    {producto.proveedor && <div><strong>Proveedor:</strong> {producto.proveedor}</div>}
                  </div>
                </details>

                {/* Botón de Editar */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => abrirEditorProducto(producto)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Producto
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Popup de Búsqueda */}
      {mostrarPopupBusqueda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Buscar Producto</h2>
            <input
              type="text"
              placeholder="Ingrese el código del producto"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && realizarBusqueda()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setMostrarPopupBusqueda(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={realizarBusqueda}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Reportes */}
      {mostrarReportes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Generar Reporte</h2>
            <p className="text-gray-600 mb-4">Seleccione el criterio para el reporte:</p>
            
            <div className="space-y-2">
              <button
                onClick={() => aplicarFiltroMeses(1)}
                className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                <span className="font-medium text-red-800">Productos para 1 mes o menos</span>
                <span className="block text-sm text-red-600">Requieren atención inmediata</span>
              </button>
              
              <button
                onClick={() => aplicarFiltroMeses(2)}
                className="w-full p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors"
              >
                <span className="font-medium text-yellow-800">Productos para 2 meses o menos</span>
                <span className="block text-sm text-yellow-600">Planificar próxima compra</span>
              </button>
              
              <button
                onClick={() => aplicarFiltroMeses(3)}
                className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
              >
                <span className="font-medium text-orange-800">Productos para 3 meses o menos</span>
                <span className="block text-sm text-orange-600">Revisar en próximas semanas</span>
              </button>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setMostrarReportes(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para agregar productos */}
      <FormularioProducto
        onAgregar={agregarProducto}
        onCerrar={() => setMostrarFormulario(false)}
        mostrar={mostrarFormulario}
      />

      {/* Importar desde Excel */}
      <ImportarExcel
        onImportar={importarProductos}
        onCerrar={() => setMostrarImportarExcel(false)}
        mostrar={mostrarImportarExcel}
      />

      {/* Editar Producto */}
      <EditarProducto
        producto={productoAEditar}
        onGuardar={editarProducto}
        onCerrar={cerrarEditorProducto}
        mostrar={mostrarEditarProducto}
      />
    </div>
  );
}