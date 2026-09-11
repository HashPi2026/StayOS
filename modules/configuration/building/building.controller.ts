import { Request, Response, NextFunction } from 'express';
import { buildingService, BuildingService } from './building.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response';
import { ValidationError } from '../../../utils/errors';

export class BuildingController {
  constructor(private service: BuildingService = buildingService) {}

  private parseId(paramId: string): number {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid building ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const buildings = await this.service.listBuildings(clientId);
      sendSuccess(res, buildings);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const building = await this.service.getBuildingById(clientId, id);
      sendSuccess(res, building);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const created = await this.service.createBuilding(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateBuilding(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      await this.service.deleteBuilding(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const buildingController = new BuildingController();
