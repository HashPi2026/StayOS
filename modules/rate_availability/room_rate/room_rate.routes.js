import { Router } from 'express';
import { roomRateController } from './room_rate.controller.js';

export const roomRateRouter = Router();

// Bulk range operation
roomRateRouter.put('/room-rates/bulk', roomRateController.bulk);
roomRateRouter.put('/rate/room-rates/bulk', roomRateController.bulk);
roomRateRouter.put('/bulk', roomRateController.bulk);

// Room Type Binding (one-time bulk-copy)
roomRateRouter.post('/room-rates/copy-from-room-type', roomRateController.copyFromRoomType);
roomRateRouter.post('/rate/room-rates/copy-from-room-type', roomRateController.copyFromRoomType);
roomRateRouter.post('/copy-from-room-type', roomRateController.copyFromRoomType);

// List room rates
roomRateRouter.get('/room-rates', roomRateController.list);
roomRateRouter.get('/rate/room-rates', roomRateController.list);
roomRateRouter.get('/', roomRateController.list);

// Create single room rate
roomRateRouter.post('/room-rates', roomRateController.create);
roomRateRouter.post('/rate/room-rates', roomRateController.create);
roomRateRouter.post('/', roomRateController.create);

// Individual ID operations
roomRateRouter.get('/room-rates/:id', roomRateController.getById);
roomRateRouter.get('/rate/room-rates/:id', roomRateController.getById);
roomRateRouter.get('/:id', roomRateController.getById);

roomRateRouter.put('/room-rates/:id', roomRateController.update);
roomRateRouter.put('/rate/room-rates/:id', roomRateController.update);
roomRateRouter.put('/:id', roomRateController.update);

roomRateRouter.delete('/room-rates/:id', roomRateController.delete);
roomRateRouter.delete('/rate/room-rates/:id', roomRateController.delete);
roomRateRouter.delete('/:id', roomRateController.delete);
