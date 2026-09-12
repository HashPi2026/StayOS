import { Router } from 'express';
import { restrictionController } from './restriction.controller.js';

export const restrictionRouter = Router();

// Bulk operation (must be defined before /:id)
restrictionRouter.put('/restrictions/bulk', restrictionController.bulk);
restrictionRouter.put('/rate/restrictions/bulk', restrictionController.bulk);
restrictionRouter.put('/bulk', restrictionController.bulk);

// List restrictions
restrictionRouter.get('/restrictions', restrictionController.list);
restrictionRouter.get('/rate/restrictions', restrictionController.list);
restrictionRouter.get('/', restrictionController.list);

// Create single restriction
restrictionRouter.post('/restrictions', restrictionController.create);
restrictionRouter.post('/rate/restrictions', restrictionController.create);
restrictionRouter.post('/', restrictionController.create);

// Individual ID operations
restrictionRouter.get('/restrictions/:id', restrictionController.getById);
restrictionRouter.get('/rate/restrictions/:id', restrictionController.getById);
restrictionRouter.get('/:id', restrictionController.getById);

restrictionRouter.put('/restrictions/:id', restrictionController.update);
restrictionRouter.put('/rate/restrictions/:id', restrictionController.update);
restrictionRouter.put('/:id', restrictionController.update);

restrictionRouter.delete('/restrictions/:id', restrictionController.delete);
restrictionRouter.delete('/rate/restrictions/:id', restrictionController.delete);
restrictionRouter.delete('/:id', restrictionController.delete);
