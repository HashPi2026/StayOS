import { Router } from 'express';
import { lostFoundController } from './lost_found.controller.js';

export const lostFoundRouter = Router();

lostFoundRouter.get('/lost-found-items', lostFoundController.list);
lostFoundRouter.post('/lost-found-items', lostFoundController.create);

lostFoundRouter.get('/lost-found-items/:id', lostFoundController.getById);
lostFoundRouter.put('/lost-found-items/:id', lostFoundController.update);
lostFoundRouter.delete('/lost-found-items/:id', lostFoundController.delete);
