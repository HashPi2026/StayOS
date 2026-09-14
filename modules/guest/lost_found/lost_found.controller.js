import { lostFoundService } from './lost_found.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class LostFoundController {
  constructor(service = lostFoundService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid lost_found ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { status, record_type, search, limit, offset } = req.query;
      const items = await this.service.listItems(clientId, { status, record_type, search, limit, offset });
      sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const item = await this.service.getItemById(clientId, id);
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createItem(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateItem(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteItem(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const lostFoundController = new LostFoundController();
