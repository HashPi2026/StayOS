import { contactCategoryService } from './contact_category.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class ContactCategoryController {
  constructor(service = contactCategoryService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid contact category ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const categories = await this.service.listCategories(clientId);
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const category = await this.service.getCategoryById(clientId, id);
      sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createCategory(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateCategory(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteCategory(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const contactCategoryController = new ContactCategoryController();
