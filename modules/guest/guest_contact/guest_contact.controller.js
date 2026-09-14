import { guestContactService } from './guest_contact.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class GuestContactController {
  constructor(service = guestContactService) {
    this.service = service;
  }

  parseId(paramId, name = 'ID') {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError(`Invalid ${name}. Must be a positive integer.`);
    }
    return id;
  }

  listByGuest = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const guestId = this.parseId(req.params.guestId, 'guest ID');
      const contacts = await this.service.listByGuestId(clientId, guestId);
      sendSuccess(res, contacts);
    } catch (err) {
      next(err);
    }
  };

  createForGuest = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const guestId = this.parseId(req.params.guestId, 'guest ID');
      const created = await this.service.createContact(clientId, guestId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'guest contact ID');
      const updated = await this.service.updateContact(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'guest contact ID');
      await this.service.deleteContact(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const guestContactController = new GuestContactController();
