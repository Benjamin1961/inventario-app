import { Producto } from '@/types/producto';

export const productosEjemplo: Producto[] = [
  // Base de datos vacía para comenzar limpio
];

// Función para buscar productos por código
export const buscarPorCodigo = (codigo: string): Producto[] => {
  return productosEjemplo.filter(producto => 
    producto.codigo.toLowerCase().includes(codigo.toLowerCase())
  );
};

// Función para generar reportes por estimado de meses
export const generarReportePorMeses = (meses: number): Producto[] => {
  return productosEjemplo.filter(producto => producto.estimadoMeses <= meses);
};

// Función para obtener todos los productos
export const obtenerTodosLosProductos = (): Producto[] => {
  return productosEjemplo;
};