import { readFileSync } from 'fs';
import { join } from 'path';
import sequelize from '@/config/database';
import { testConnection } from '@/config/database';

/**
 * Script para instalar los triggers de log de cambios en la base de datos
 * Usa Sequelize para ejecutar el archivo SQL
 */

const TRIGGERS_SQL_PATH = join(
  __dirname,
  '../../database/triggers/log_cambios_triggers_ejemplos.sql'
);

/**
 * Limpia el contenido SQL (opcional, para debugging)
 */
function cleanSQLContent(sqlContent: string): string {
  // PostgreSQL puede ejecutar el SQL completo directamente
  // No necesitamos dividirlo en statements individuales
  return sqlContent.trim();
}

/**
 * Ejecuta los triggers SQL en la base de datos
 */
async function installTriggers(): Promise<void> {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await testConnection();
    
    console.log('📖 Leyendo archivo SQL...');
    const sqlContent = readFileSync(TRIGGERS_SQL_PATH, 'utf-8');
    const cleanedSQL = cleanSQLContent(sqlContent);
    
    console.log('⚙️  Ejecutando triggers SQL...');
    console.log(`   (${cleanedSQL.split('\n').length} líneas de SQL)`);
    
    // Ejecutar todo el contenido SQL de una vez
    // PostgreSQL puede ejecutar múltiples statements separados por punto y coma
    await sequelize.query(cleanedSQL);
    
    console.log('✅ Triggers instalados correctamente');
    
    // Verificar que los triggers fueron creados
    console.log('\n🔍 Verificando triggers creados...');
    const [triggers] = await sequelize.query(`
      SELECT DISTINCT
        trigger_name as nombre_trigger,
        event_object_table as tabla,
        string_agg(DISTINCT event_manipulation, ', ' ORDER BY event_manipulation) as eventos
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND trigger_name LIKE 'trg_log%'
      GROUP BY trigger_name, event_object_table
      ORDER BY event_object_table;
    `);
    
    if (Array.isArray(triggers) && triggers.length > 0) {
      console.log(`\n✅ Se encontraron ${triggers.length} triggers únicos:`);
      triggers.forEach((trigger: any) => {
        console.log(`   - ${trigger.nombre_trigger} en tabla ${trigger.tabla} (eventos: ${trigger.eventos})`);
      });
    } else {
      console.log('⚠️  No se encontraron triggers. Verifica que el script se ejecutó correctamente.');
    }
    
    // Verificar funciones creadas
    const [functions] = await sequelize.query(`
      SELECT 
        routine_name as funcion_trigger
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name LIKE 'trigger_log%'
      ORDER BY routine_name;
    `);
    
    if (Array.isArray(functions) && functions.length > 0) {
      console.log(`\n✅ Se encontraron ${functions.length} funciones:`);
      functions.forEach((func: any) => {
        console.log(`   - ${func.funcion_trigger}`);
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error al instalar triggers:', error.message);
    if (error.original) {
      console.error('   Detalle:', error.original.message);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  installTriggers()
    .then(() => {
      console.log('\n🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export default installTriggers;

