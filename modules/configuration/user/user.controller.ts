import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response';
import { ValidationError } from '../../../utils/errors';

export class UserController {
  constructor(private service: UserService = new UserService()) {}

  private parseId(paramId: string): number {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid user ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = (req.query.client_id as string) || req.clientId!;
      const users = await this.service.getUsers(clientId);
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const user = await this.service.getUserById(clientId, id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const user = await this.service.createUser(clientId, req.body);
      sendCreated(res, user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const user = await this.service.updateUser(clientId, id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      const { is_active } = req.body;
      const user = await this.service.toggleUserStatus(clientId, id, Boolean(is_active));
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.clientId!;
      const id = this.parseId(req.params.id);
      await this.service.deleteUser(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
