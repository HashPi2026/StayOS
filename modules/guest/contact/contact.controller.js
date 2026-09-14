import { contactService } from './contact.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class ContactController {
  constructor(service = contactService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid contact ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { category_id, search, limit, offset } = req.query;
      const contacts = await this.service.listContacts(clientId, { category_id, search, limit, offset });
      sendSuccess(res, contacts);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const contact = await this.service.getContactById(clientId, id);
      sendSuccess(res, contact);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createContact(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateContact(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteContact(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const contactController = new ContactController();
