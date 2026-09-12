import { flashService } from './flash.service.js';
import { sendSuccess } from '../../../utils/response.js';

export class FlashController {
  constructor(service = flashService) {
    this.service = service;
  }

  getSettings = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const settings = await this.service.getSettings(clientId);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  };

  updateSettings = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const updated = await this.service.updateSettings(clientId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  getFlashGrid = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const from = req.query.from;
      const to = req.query.to;
      const rateTypeId = req.query.rateTypeId || req.query.rate_type_id;
      const roomTypeId = req.query.roomTypeId || req.query.room_type_id;

      const grid = await this.service.getFlashGrid(clientId, {
        from,
        to,
        rateTypeId,
        roomTypeId,
      });
      sendSuccess(res, grid);
    } catch (err) {
      next(err);
    }
  };
}

export const flashController = new FlashController();
