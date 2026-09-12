import { userService } from './user.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class UserController {
  constructor(service = userService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid user ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.query.client_id || req.clientId;
      const users = await this.service.getUsers(clientId);
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const user = await this.service.getUserById(clientId, id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const user = await this.service.createUser(clientId, req.body);
      sendCreated(res, user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const user = await this.service.updateUser(clientId, id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  toggleStatus = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const { is_active } = req.body;
      const user = await this.service.toggleUserStatus(clientId, id, Boolean(is_active));
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteUser(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const userController = new UserController();
