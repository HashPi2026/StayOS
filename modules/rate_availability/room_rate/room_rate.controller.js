import { roomRateService } from './room_rate.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';

export class RoomRateController {
  constructor(service = roomRateService) {
    this.service = service;
  }

  parseId(paramId) {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('Invalid room_rate ID. Must be a positive integer.');
    }
    return id;
  }

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { from, to, roomTypeId, room_type_id, rateTypeId, rate_type_id, occupancyType, occupancy_type } = req.query;

      const rates = await this.service.listRoomRates(clientId, {
        from,
        to,
        roomTypeId: roomTypeId || room_type_id,
        rateTypeId: rateTypeId || rate_type_id,
        occupancyType: occupancyType || occupancy_type,
      });
      sendSuccess(res, rates);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const record = await this.service.getRoomRateById(clientId, id);
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createRoomRate(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateRoomRate(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteRoomRate(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  bulk = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const result = await this.service.bulkUpdateRates(clientId, req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  copyFromRoomType = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const result = await this.service.copyFromRoomType(clientId, req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const roomRateController = new RoomRateController();
