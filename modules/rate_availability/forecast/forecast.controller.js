import { forecastService } from './forecast.service.js';
import { sendSuccess } from '../../../utils/response.js';

export class ForecastController {
  constructor(service = forecastService) {
    this.service = service;
  }

  getPropertyForecast = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { from, to, compareYear, compare_year } = req.query;
      const rows = await this.service.getPropertyForecast(clientId, {
        from,
        to,
        compareYear: compareYear ?? compare_year,
      });
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  };

  getForecastByRoomType = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { from, to, roomTypeId, room_type_id, compareYear, compare_year } = req.query;
      const rows = await this.service.getForecastByRoomType(clientId, {
        from,
        to,
        roomTypeId: roomTypeId || room_type_id,
        compareYear: compareYear ?? compare_year,
      });
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  };

  recalculate = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { from, to } = req.body;
      const result = await this.service.recalculateForecast(clientId, { from, to });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const forecastController = new ForecastController();
