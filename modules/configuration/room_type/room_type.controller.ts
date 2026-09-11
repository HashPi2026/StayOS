import { Request, Response, NextFunction } from 'express';
import { roomTypeService, RoomTypeService } from './room_type.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response';
import { ValidationError } from '../../../utils/errors';

export class RoomTypeController {
  constructor(private service: RoomTypeService = roomTypeService) {}

  private parseId(paramId: string): number {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid room_type ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const roomTypes = await this.service.listRoomTypes(clientId);
      sendSuccess(res, roomTypes);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const roomType = await this.service.getRoomTypeById(clientId, id);
      sendSuccess(res, roomType);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const created = await this.service.createRoomType(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateRoomType(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      await this.service.deleteRoomType(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const roomTypeController = new RoomTypeController();
