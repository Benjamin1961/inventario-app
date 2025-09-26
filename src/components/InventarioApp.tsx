'use client';

import { useState, useEffect } from 'react';
import { Producto } from '@/types/producto';
import { obtenerTodosLosProductos, buscarPorCodigo, generarReportePorMeses, agregarProducto, actualizarProducto, eliminarProducto } from '@/data/productos';
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
  const [cargando, setCargando] = useState(true);
  
  const { usuario, logout } = useAuth();

  // Función para cargar productos desde la base de datos
  const cargarProductos = async () => {
    setCargando(true);
    try {
      const productosIniciales = await obtenerTodosLosProductos();
      setProductos(productosIniciales);
      setProductosOriginales(productosIniciales);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const realizarBusqueda = async () => {
    if (codigoBusqueda.trim()) {
      setCargando(true);
      try {
        const resultados = await buscarPorCodigo(codigoBusqueda);
        setProductos(resultados);
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setCargando(false);
      }
    } else {
      setProductos(productosOriginales);
    }
    setMostrarPopupBusqueda(false);
    setCodigoBusqueda('');
  };

  const aplicarFiltroMeses = async (meses: number) => {
    setCargando(true);
    try {
      const productosFiltrasos = await generarReportePorMeses(meses);
      setProductos(productosFiltrasos);
      setFiltroMeses(meses);
      setMostrarReportes(false);
    } catch (error) {
      console.error('Error aplicando filtro:', error);
    } finally {
      setCargando(false);
    }
  };

  const limpiarFiltros = () => {
    setProductos(productosOriginales);
    setFiltroMeses(null);
  };

  const manejarAgregarProducto = async (nuevoProducto: Omit<Producto, 'id'>) => {
    setCargando(true);
    try {
      const productoAgregado = await agregarProducto(nuevoProducto);
      if (productoAgregado) {
        await cargarProductos(); // Recargar todos los productos
        alert('Producto agregado exitosamente');
      } else {
        alert('Error al agregar el producto');
      }
    } catch (error) {
      console.error('Error agregando producto:', error);
      alert('Error al agregar el producto');
    } finally {
      setCargando(false);
    }
  };

  const manejarEditarProducto = async (productoEditado: Producto) => {
    if (!productoAEditar?.id) return;
    
    setCargando(true);
    try {
      const productoActualizado = await actualizarProducto(productoAEditar.id, productoEditado);
      if (productoActualizado) {
        await cargarProductos(); // Recargar todos los productos
        alert('Producto actualizado exitosamente');
      } else {
        alert('Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar el producto');
    } finally {
      setCargando(false);
    }
  };

  const abrirEditorProducto = (producto: Producto) => {
    setProductoAEditar(producto);
    setMostrarEditarProducto(true);
  };

  const cerrarEditorProducto = () => {
    setMostrarEditarProducto(false);
    setProductoAEditar(null);
  };

  const importarProductos = async (productosImportados: Omit<Producto, 'id'>[]) => {
    setCargando(true);
    let productosAgregados = 0;
    let productosDuplicados = 0;

    try {
      for (const producto of productosImportados) {
        try {
          const productoAgregado = await agregarProducto(producto);
          if (productoAgregado) {
            productosAgregados++;
          } else {
            productosDuplicados++;
          }
        } catch (error) {
          console.error('Error agregando producto:', error);
          productosDuplicados++;
        }
      }

      if (productosAgregados === 0) {
        alert('No se pudo agregar ningún producto. Posiblemente ya existen en el sistema.');
      } else if (productosDuplicados > 0) {
        alert(`Se importaron ${productosAgregados} productos exitosamente. ${productosDuplicados} productos fueron omitidos.`);
      } else {
        alert(`Se importaron ${productosAgregados} productos exitosamente.`);
      }

      // Recargar todos los productos después de la importación
      await cargarProductos();
    } catch (error) {
      console.error('Error en importación:', error);
      alert('Error durante la importación de productos');
    } finally {
      setCargando(false);
    }
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
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando productos...</span>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {productos.map((producto, index) => (
            <div key={`${producto.codigo}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Imagen del producto */}
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
                {producto.imagePath && producto.imagePath.trim() !== '' ? (
                  <img 
                    src={producto.imagePath} 
                    alt={producto.descripcion}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Reemplazar con placeholder si la imagen falla
                      const img = e.currentTarget;
                      const container = img.parentElement;
                      if (container && img) {
                        img.style.display = 'none';
                        const placeholder = container.querySelector('.image-placeholder');
                        if (!placeholder) {
                          const placeholderDiv = document.createElement('div');
                          placeholderDiv.className = 'image-placeholder flex items-center justify-center w-full h-full absolute inset-0';
                          placeholderDiv.innerHTML = `
                            <div class="flex flex-col items-center">
                              <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              <span class="mt-2 text-xs text-gray-500 text-center">Imagen no disponible</span>
                            </div>
                          `;
                          container.appendChild(placeholderDiv);
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Package className="h-16 w-16 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Sin imagen</span>
                  </div>
                )}
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
        )}

        {!cargando && productos.length === 0 && (
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
        onAgregar={manejarAgregarProducto}
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
        onGuardar={manejarEditarProducto}
        onCerrar={cerrarEditorProducto}
        mostrar={mostrarEditarProducto}
      />
    </div>
  );
}