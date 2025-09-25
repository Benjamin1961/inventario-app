export interface Producto {
  codigo: string; // Llave de búsqueda principal
  descripcion: string;
  partida: string;
  unidad: string;
  bodega: string;
  existencia: number; // Numérico con decimales
  consumoMensual: number; // Numérico con decimales
  estimadoMeses: number; // Calculado: Math.ceil(existencia / consumoMensual)
  codigoClasificacion: string;
  codigoIdentificacion: string;
  numeroProcedimiento: string; // 24 dígitos alfanumérico
  tipoProcedimiento: string; // Convenio Marco, Licitación Pública, etc.
  imagePath: string; // Ruta de la imagen
  // Campos adicionales para completar los 15 campos mencionados
  categoria?: string;
  proveedor?: string;
}

export interface FiltroReporte {
  tipoFiltro: 'estimadoMeses' | 'categoria' | 'bodega';
  valor: string | number;
  operador: 'igual' | 'menor' | 'mayor' | 'menorIgual' | 'mayorIgual';
}