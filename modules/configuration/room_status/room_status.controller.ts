import { Request, Response, NextFunction } from 'express';
import { roomStatusService, RoomStatusService } from './room_status.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response';
import { ValidationError } from '../../../utils/errors';

export class RoomStatusController {
  constructor(private service: RoomStatusService = roomStatusService) {}

  private parseId(paramId: string): number {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid room status ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      let isActive: boolean | undefined = undefined;
      if (req.query.is_active !== undefined) {
        isActive = req.query.is_active === 'true' || req.query.is_active === '1';
      }

      const statuses = await this.service.listRoomStatuses(clientId, isActive);
      sendSuccess(res, statuses);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const status = await this.service.getRoomStatusById(clientId, id);
      sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const created = await this.service.createRoomStatus(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateRoomStatus(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      await this.service.deleteRoomStatus(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const roomStatusController = new RoomStatusController();
