import { guestService } from './guest.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class GuestController {
  constructor(service = guestService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid guest ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { dnr_status, search, limit, offset } = req.query;
      const guests = await this.service.listGuests(clientId, { dnr_status, search, limit, offset });
      sendSuccess(res, guests);
    } catch (err) {
      next(err);
    }
  };

  search = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const term = req.query.q || req.query.query || req.query.search || req.query.name || req.query.phone || req.query.email || req.query.document_number;
      const results = await this.service.searchGuests(clientId, term);
      sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const guest = await this.service.getGuestById(clientId, id);
      sendSuccess(res, guest);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createGuest(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateGuest(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteGuest(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const guestController = new GuestController();
