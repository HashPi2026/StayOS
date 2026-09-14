import { contactDetailService } from './contact_detail.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class ContactDetailController {
  constructor(service = contactDetailService) {
    this.service = service;
  }

  parseId(paramId, name = 'ID') {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError(`Invalid ${name}. Must be a positive integer.`);
    }
    return id;
  }

  listByContact = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const contactId = this.parseId(req.params.contactId, 'contact ID');
      const details = await this.service.listByContactId(clientId, contactId);
      sendSuccess(res, details);
    } catch (err) {
      next(err);
    }
  };

  createForContact = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const contactId = this.parseId(req.params.contactId, 'contact ID');
      const created = await this.service.createDetail(clientId, contactId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'contact detail ID');
      const updated = await this.service.updateDetail(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'contact detail ID');
      await this.service.deleteDetail(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const contactDetailController = new ContactDetailController();
