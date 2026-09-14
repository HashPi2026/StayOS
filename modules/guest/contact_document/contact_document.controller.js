import { contactDocumentService } from './contact_document.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class ContactDocumentController {
  constructor(service = contactDocumentService) {
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
      const docs = await this.service.listByContactId(clientId, contactId);
      sendSuccess(res, docs);
    } catch (err) {
      next(err);
    }
  };

  createForContact = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const contactId = this.parseId(req.params.contactId, 'contact ID');
      const created = await this.service.createDocument(clientId, contactId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'contact document ID');
      const updated = await this.service.updateDocument(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id, 'contact document ID');
      await this.service.deleteDocument(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const contactDocumentController = new ContactDocumentController();
