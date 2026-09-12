import { Router } from 'express';
import { forecastController } from './forecast.controller.js';

export const forecastRouter = Router();

// By room type (must be registered before /:id or general path)
forecastRouter.get('/forecast/by-room-type', forecastController.getForecastByRoomType);
forecastRouter.get('/rate/forecast/by-room-type', forecastController.getForecastByRoomType);
forecastRouter.get('/by-room-type', forecastController.getForecastByRoomType);

// Recalculate forecast
forecastRouter.post('/forecast/recalculate', forecastController.recalculate);
forecastRouter.post('/rate/forecast/recalculate', forecastController.recalculate);
forecastRouter.post('/recalculate', forecastController.recalculate);

// Property-wide forecast
forecastRouter.get('/forecast', forecastController.getPropertyForecast);
forecastRouter.get('/rate/forecast', forecastController.getPropertyForecast);
forecastRouter.get('/', forecastController.getPropertyForecast);
