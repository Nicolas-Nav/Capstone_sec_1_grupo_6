import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

/**
 * Utilidades para procesar archivos Excel y convertirlos a JSON
 */
export class ExcelProcessor {
  
  /**
   * Convierte un archivo Excel a JSON
   */
  static convertExcelToJson(filePath: string): object {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.readFile(filePath);
      const result: any = {};
      
      // Procesar cada hoja del Excel
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir hoja a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Usar primera fila como headers
          defval: '', // Valor por defecto para celdas vacías
          raw: false // Convertir fechas y números a strings
        });
        
        // Si hay datos, procesarlos
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          // Convertir a array de objetos
          result[sheetName] = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
        } else {
          result[sheetName] = [];
        }
      });
      
      return result;
      
    } catch (error) {
      throw new Error(`Error al procesar archivo Excel: ${error.message}`);
    }
  }
  
  /**
   * Procesa un archivo Excel subido y lo convierte a JSON
   */
  static async processUploadedExcel(file: Express.Multer.File): Promise<object> {
    try {
      // Convertir a JSON
      const jsonData = this.convertExcelToJson(file.path);
      
      // Eliminar archivo temporal
      fs.unlinkSync(file.path);
      
      return jsonData;
      
    } catch (error) {
      // Limpiar archivo en caso de error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
  
  /**
   * Valida que el JSON tenga la estructura esperada
   */
  static validateExcelJson(jsonData: object): boolean {
    try {
      if (!jsonData || typeof jsonData !== 'object') {
        return false;
      }
      
      const data = jsonData as any;
      
      // Verificar que tenga al menos una hoja
      const sheetNames = Object.keys(data);
      if (sheetNames.length === 0) {
        return false;
      }
      
      // Verificar que cada hoja sea un array
      for (const sheetName of sheetNames) {
        if (!Array.isArray(data[sheetName])) {
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Obtiene información del archivo Excel procesado
   */
  static getExcelInfo(jsonData: object): {
    totalHojas: number;
    nombresHojas: string[];
    totalFilas: number;
    estructura: any;
  } {
    const data = jsonData as any;
    const nombresHojas = Object.keys(data);
    const totalHojas = nombresHojas.length;
    
    let totalFilas = 0;
    const estructura: any = {};
    
    nombresHojas.forEach(hoja => {
      const filas = data[hoja].length;
      totalFilas += filas;
      
      if (filas > 0) {
        estructura[hoja] = {
          filas: filas,
          columnas: Object.keys(data[hoja][0] || {}).length,
          headers: Object.keys(data[hoja][0] || {})
        };
      }
    });
    
    return {
      totalHojas,
      nombresHojas,
      totalFilas,
      estructura
    };
  }
}

/**
 * Ejemplo de uso en un controlador
 */
export const ejemploUso = async (req: any, res: any) => {
  try {
    // 1. Procesar archivo Excel subido
    const jsonData = await ExcelProcessor.processUploadedExcel(req.file);
    
    // 2. Validar estructura
    if (!ExcelProcessor.validateExcelJson(jsonData)) {
      return res.status(400).json({ error: 'Estructura de archivo Excel inválida' });
    }
    
    // 3. Obtener información del archivo
    const info = ExcelProcessor.getExcelInfo(jsonData);
    
    // 4. Guardar en la base de datos
    const descripcionCargo = await DescripcionCargo.create({
      descripcion_cargo: 'Desarrollador Full Stack',
      requisitos_y_condiciones: '3+ años de experiencia',
      num_vacante: 2,
      fecha_ingreso: new Date('2024-12-01'),
      datos_excel: jsonData, // ← JSON guardado
      id_cargo: 1,
      id_ciudad: 1
    });
    
    res.json({
      success: true,
      data: descripcionCargo,
      info: info
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
