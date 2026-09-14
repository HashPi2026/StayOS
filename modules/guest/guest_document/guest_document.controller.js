import { guestDocumentService } from './guest_document.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class GuestDocumentController {
  constructor(service = guestDocumentService) {
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
      const docs = await this.service.listByGuestId(clientId, guestId);
      sendSuccess(res, docs);
    } catch (err) {
      next(err);
    }
  };

  createForGuest = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const guestId = this.parseId(req.params.guestId, 'guest ID');
      const created = await this.service.createDocument(clientId, guestId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'guest document ID');
      const updated = await this.service.updateDocument(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'guest document ID');
      await this.service.deleteDocument(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const guestDocumentController = new GuestDocumentController();
