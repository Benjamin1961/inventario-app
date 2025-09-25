'use client';

import { useState } from 'react';
import { Producto } from '@/types/producto';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

interface ImportarExcelProps {
  onImportar: (productos: Producto[]) => void;
  onCerrar: () => void;
  mostrar: boolean;
}

export default function ImportarExcel({ onImportar, onCerrar, mostrar }: ImportarExcelProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<'subir' | 'instrucciones'>('subir');

  const calcularEstimadoMeses = (existencia: number, consumoMensual: number): number => {
    if (consumoMensual === 0) return 999;
    return Math.ceil(existencia / consumoMensual);
  };

  const manejarArchivoSeleccionado = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivo(file);
      setError(null);
    }
  };

  const procesarArchivo = async () => {
    if (!archivo) return;

    setProcesando(true);
    setError(null);

    try {
      // Leer el archivo con la codificación correcta para caracteres españoles
      let texto: string;
      
      // Intentar detectar si es UTF-8 o necesita conversión
      const arrayBuffer = await archivo.arrayBuffer();
      
      // Primero intentar UTF-8
      try {
        const decoder = new TextDecoder('utf-8');
        texto = decoder.decode(arrayBuffer);
        
        // Verificar si hay caracteres de reemplazo (indica problema de codificación)
        if (texto.includes('�')) {
          throw new Error('UTF-8 failed, trying Latin-1');
        }
      } catch {
        // Si UTF-8 falla, intentar Latin-1 (Windows-1252) que es común en archivos de Excel/CSV en español
        const decoder = new TextDecoder('windows-1252');
        texto = decoder.decode(arrayBuffer);
      }

      console.log('Archivo leído con codificación correcta');
      
      const lineas = texto.split('\n');
      const productos: Producto[] = [];

      // Detectar el separador y formato
      const primeraLinea = lineas[0];
      const usaPuntoYComa = primeraLinea.includes(';');
      const separador = usaPuntoYComa ? ';' : ',';

      console.log('Separador detectado:', separador);
      console.log('Primera línea:', primeraLinea);

      // Función para convertir números con coma decimal a punto decimal
      const convertirNumero = (valor: string): number => {
        if (!valor || valor.trim() === '') return 0;
        // Reemplazar coma por punto para decimales
        const numeroLimpio = valor.replace(',', '.');
        const numero = parseFloat(numeroLimpio);
        return isNaN(numero) ? 0 : numero;
      };

      // Procesar líneas (saltar encabezado)
      const productosTemporales: Producto[] = [];
      const combinacionesVistas = new Set<string>();

      for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        
        // Saltar líneas vacías o que solo contengan separadores
        if (!linea || linea === separador.repeat(linea.length)) continue;
        
        // Detectar si es una línea de metadatos (como "Generado por el usuario:")
        if (linea.toLowerCase().includes('generado por') || linea.startsWith(';;;')) continue;

        const columnas = linea.split(separador);
        
        // Verificar que tiene suficientes columnas y que al menos codigo existe
        if (columnas.length >= 8 && columnas[0]?.trim()) {
          
          const codigo = columnas[0].trim();
          const descripcion = columnas[7].trim();
          const codigoIdentificacion = columnas[4].trim();
          
          // Crear clave única basada en código + código identificación
          const claveUnica = `${codigo}|${codigoIdentificacion}`;
          
          // Skip if we've already seen this combination or if description is empty
          if (combinacionesVistas.has(claveUnica) || !descripcion) {
            console.log(`Saltando producto duplicado (código + codigoId): ${codigo} - ${codigoIdentificacion}`);
            continue;
          }
          
          // Mapeo según tu formato:
          const existencia = convertirNumero(columnas[9]);
          const consumoMensual = convertirNumero(columnas[3]);

          const producto: Producto = {
            codigo: codigo,
            descripcion: descripcion,
            partida: columnas[1]?.trim() || '',
            unidad: columnas[8]?.trim() || 'UNI',
            bodega: `Bodega ${columnas[2]?.trim()}` || 'Bodega General',
            existencia: existencia,
            consumoMensual: consumoMensual,
            estimadoMeses: calcularEstimadoMeses(existencia, consumoMensual),
            codigoClasificacion: columnas[10]?.trim() || '',
            codigoIdentificacion: codigoIdentificacion,
            numeroProcedimiento: columnas[11]?.trim() || '',
            tipoProcedimiento: columnas[5]?.trim() || 'Convenio Marco',
            imagePath: columnas[12]?.trim() || '',
            categoria: columnas[6]?.trim() || '',
            proveedor: '' // No está en tu formato, se deja vacío
          };

          productosTemporales.push(producto);
          combinacionesVistas.add(claveUnica);
          console.log('Producto agregado:', producto.codigo, '-', producto.descripcion, `(ID: ${codigoIdentificacion})`);
        }
      }

      productos.push(...productosTemporales);

      console.log('Total productos procesados:', productos.length);

      if (productos.length === 0) {
        throw new Error('No se encontraron productos válidos en el archivo. Verifica que el archivo tenga el formato correcto y que las columnas "codigo" y "descripcion" tengan datos.');
      }

      onImportar(productos);
      setArchivo(null);
      onCerrar();
      
    } catch (err: any) {
      console.error('Error procesando archivo:', err);
      setError(err.message || 'Error al procesar el archivo');
    } finally {
      setProcesando(false);
    }
  };

  const descargarPlantilla = () => {
    const encabezados = [
      'codigo','partida','BODEGA','consumoMensual','codigoidentificacion',
      'tipoProcedimiento','categoria','descripcion','unidad','existencia',
      'codigoClasificacion','numeroProcedimiento','imagePath'
    ];

    const ejemplo = [
      'INV001','29903','01','15,50','ID-001-00000001','Convenio Marco',
      'Papelería','Papel Bond Tamaño Carta','RESMA','150,00','PAP001',
      '2024LD-000001-0009100001',''
    ];

    // Crear contenido con BOM para UTF-8 (ayuda con caracteres especiales)
    const BOM = '\uFEFF';
    const csvContent = BOM + [encabezados.join(';'), ejemplo.join(';')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos_formato_fito.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Importar desde Excel/CSV</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setVista(vista === 'subir' ? 'instrucciones' : 'subir')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {vista === 'subir' ? 'Ver instrucciones' : 'Subir archivo'}
            </button>
            <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {vista === 'instrucciones' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div>
                <div>
                  <h4 className="font-semibold text-green-800">🇪🇸 Problema de la ñ SOLUCIONADO:</h4>
                  <p className="text-green-700 text-sm mt-1">
                    El sistema ahora detecta automáticamente la codificación correcta para caracteres especiales como:
                    <strong> ñ, é, í, ó, ú, ç, ü</strong> y otros acentos en español. 
                    Ya no verás símbolos raros como � en lugar de ñ.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Formato compatible con tu PlantillaFito.csv</h3>
              <p className="text-blue-700 text-sm">
                Tu archivo debe ser CSV separado por <strong>punto y coma (;)</strong> con este orden de columnas:
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><strong>1. codigo</strong> - Código único (ej: 02-00548)</div>
                <div><strong>2. partida</strong> - Número de partida (ej: 29903)</div>
                <div><strong>3. BODEGA</strong> - Código de bodega (ej: 02)</div>
                <div><strong>4. consumoMensual</strong> - Con coma decimal (ej: 13,00)</div>
                <div><strong>5. codigoidentificacion</strong> - Código de identificación</div>
                <div><strong>6. tipoProcedimiento</strong> - Tipo de procedimiento</div>
                <div><strong>7. categoria</strong> - Categoría (puede estar vacía)</div>
                <div><strong>8. descripcion</strong> - Descripción del producto</div>
                <div><strong>9. unidad</strong> - Unidad de medida (UNI, RESMA, etc.)</div>
                <div><strong>10. existencia</strong> - Con coma decimal (ej: 150,00)</div>
                <div><strong>11. codigoClasificacion</strong> - Código de clasificación</div>
                <div><strong>12. numeroProcedimiento</strong> - Número de procedimiento</div>
                <div><strong>13. imagePath</strong> - Ruta imagen (opcional)</div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={descargarPlantilla}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Descargar Plantilla CSV
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Importante:</h4>
                  <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                    <li>• Los campos "codigo" y "descripcion" son obligatorios</li>
                    <li>• Usar <strong>punto y coma (;)</strong> como separador</li>
                    <li>• Los números decimales usar <strong>coma (,)</strong> no punto (.)</li>
                    <li>• El "estimadoMeses" se calcula automáticamente</li>
                    <li>• Se ignoran líneas vacías y metadatos</li>
                    <li>• Compatible con tu formato actual de PlantillaFito.csv</li>
                    <li>• <strong>Caracteres españoles (ñ, é, í, ó, ú) son soportados automáticamente</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {vista === 'subir' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {!archivo ? (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-700">
                      Selecciona un archivo CSV o Excel
                    </span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.tsv"
                      onChange={manejarArchivoSeleccionado}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-2">
                    Arrastra el archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-green-600 text-sm mt-2 font-semibold">
                    ✓ Soporte completo para caracteres españoles (ñ, acentos)
                  </p>
                </div>
              ) : (
                <div>
                  <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">{archivo.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(archivo.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={() => setArchivo(null)}
                    className="text-red-600 hover:text-red-800 text-sm mt-2"
                  >
                    Cambiar archivo
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Error:</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <button
                onClick={onCerrar}
                className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={procesarArchivo}
                disabled={!archivo || procesando}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {procesando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar Productos
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}