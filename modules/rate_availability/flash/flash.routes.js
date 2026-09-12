import { Router } from 'express';
import { flashController } from './flash.controller.js';

export const flashRouter = Router();

// Flash view settings
flashRouter.get('/flash-settings', flashController.getSettings);
flashRouter.put('/flash-settings', flashController.updateSettings);
flashRouter.get('/rate/flash-settings', flashController.getSettings);
flashRouter.put('/rate/flash-settings', flashController.updateSettings);

// Flash aggregate view (computed, read-only)
flashRouter.get('/flash', flashController.getFlashGrid);
flashRouter.get('/rate/flash', flashController.getFlashGrid);
