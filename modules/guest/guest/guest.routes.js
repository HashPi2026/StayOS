import { Router } from 'express';
import { guestController } from './guest.controller.js';

export const guestRouter = Router();

// Guest Search endpoint (defined BEFORE /:id so /search is not matched as an id)
guestRouter.get('/guests/search', guestController.search);
guestRouter.get('/search', guestController.search);

// Master Guest list & create
guestRouter.get('/guests', guestController.list);
guestRouter.post('/guests', guestController.create);

// Individual Guest endpoints
guestRouter.get('/guests/:id', guestController.getById);
guestRouter.put('/guests/:id', guestController.update);
guestRouter.delete('/guests/:id', guestController.delete);
