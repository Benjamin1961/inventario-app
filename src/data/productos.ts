import { Producto } from '@/types/producto';
import { supabase } from '@/lib/supabase';

export const productosEjemplo: Producto[] = [
  // Base de datos vacía para comenzar limpio
];

// Obtener todos los productos desde Supabase
export const obtenerTodosLosProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }

  return data || [];
};

// Agregar un producto a Supabase
export const agregarProducto = async (producto: Omit<Producto, 'id'>): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()
    .single();

  if (error) {
    console.error('Error agregando producto:', error);
    return null;
  }

  return data;
};

// Actualizar un producto en Supabase
export const actualizarProducto = async (id: number, producto: Partial<Producto>): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando producto:', error);
    return null;
  }

  return data;
};

// Eliminar un producto de Supabase
export const eliminarProducto = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando producto:', error);
    return false;
  }

  return true;
};

// Buscar producto por código
export const buscarPorCodigo = async (codigo: string): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .ilike('codigo', `%${codigo}%`);

  if (error) {
    console.error('Error buscando por código:', error);
    return [];
  }

  return data || [];
};

// Generar reporte por meses
export const generarReportePorMeses = async (meses: number): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .lte('estimadoMeses', meses)
    .order('estimadoMeses', { ascending: true });

  if (error) {
    console.error('Error generando reporte:', error);
    return [];
  }

  return data || [];
};

// Funciones para manejo de imágenes
export const subirImagen = async (archivo: File, nombreProducto: string): Promise<string | null> => {
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = archivo.name.split('.').pop();
    const nombreArchivo = `${nombreProducto.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${extension}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('productos-imagenes')
      .upload(nombreArchivo, archivo);

    if (error) {
      console.error('Error subiendo imagen a Supabase:', error);
      return null;
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from('productos-imagenes')
      .getPublicUrl(nombreArchivo);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error en subida de imagen:', error);
    return null;
  }
};

// Eliminar imagen del storage
export const eliminarImagen = async (imagePath: string): Promise<boolean> => {
  try {
    if (!imagePath) return true;

    // Extraer el nombre del archivo de la URL
    const nombreArchivo = imagePath.split('/').pop();
    if (!nombreArchivo) return false;

    const { error } = await supabase.storage
      .from('productos-imagenes')
      .remove([nombreArchivo]);

    if (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en eliminación de imagen:', error);
    return false;
  }
};