import { Request, Response } from 'express';
import Region from '../models/Region';
import Comuna from '../models/Comuna';

export class RegionController {
  /**
   * Obtener todas las regiones
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const regiones = await Region.findAll({
        order: [['nombre_region', 'ASC']]
      });

      res.json({
        success: true,
        message: 'Regiones obtenidas exitosamente',
        data: regiones
      });
    } catch (error) {
      console.error('Error getting regions:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export class ComunaController {
  /**
   * Obtener todas las comunas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const comunas = await Comuna.findAll({
        order: [['nombre_comuna', 'ASC']]
      });

      res.json({
        success: true,
        message: 'Comunas obtenidas exitosamente',
        data: comunas
      });
    } catch (error) {
      console.error('Error getting comunas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtener comunas por región
   */
  static async getByRegion(req: Request, res: Response): Promise<void> {
    try {
      const { regionId } = req.params;

      if (!regionId || isNaN(Number(regionId))) {
        res.status(400).json({
          success: false,
          message: 'ID de región inválido'
        });
        return;
      }

      const comunas = await Comuna.findAll({
        where: {
          id_region: Number(regionId)
        },
        order: [['nombre_comuna', 'ASC']]
      });

      res.json({
        success: true,
        message: 'Comunas obtenidas exitosamente',
        data: comunas
      });
    } catch (error) {
      console.error('Error getting comunas by region:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
