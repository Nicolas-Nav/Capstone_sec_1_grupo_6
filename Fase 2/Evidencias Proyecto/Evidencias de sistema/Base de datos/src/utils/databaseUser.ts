import { Transaction } from 'sequelize';
import sequelize from '@/config/database';

/**
 * Establece el usuario responsable (RUT) en la sesión de PostgreSQL
 * dentro del alcance de una transacción. Permite que los triggers
 * de auditoría lean current_setting('app.current_user').
 */
export async function setDatabaseUser(
  rutUsuario: string | null | undefined,
  transaction: Transaction | null | undefined
): Promise<void> {
  if (!rutUsuario) {
    return;
  }

  if (!transaction) {
    return;
  }

  try {
    await sequelize.query(
      'SET LOCAL app.current_user = :rutUsuario',
      {
        transaction,
        replacements: { rutUsuario },
        type: sequelize.QueryTypes.RAW,
      }
    );
  } catch (error) {
    console.error('Error configurando app.current_user:', error);
  }
}
