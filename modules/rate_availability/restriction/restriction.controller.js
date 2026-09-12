import { restrictionService } from './restriction.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class RestrictionController {
  constructor(service = restrictionService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid room_type_restriction ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { from, to, roomTypeId, room_type_id, rateTypeId, rate_type_id } = req.query;

      const records = await this.service.listRestrictions(clientId, {
        from,
        to,
        roomTypeId: roomTypeId || room_type_id,
        rateTypeId: rateTypeId || rate_type_id,
      });
      sendSuccess(res, records);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const record = await this.service.getRestrictionById(clientId, id);
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createRestriction(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateRestriction(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteRestriction(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  bulk = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const result = await this.service.bulkUpdateRestrictions(clientId, req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const restrictionController = new RestrictionController();
