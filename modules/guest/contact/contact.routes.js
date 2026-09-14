import { Router } from 'express';
import { contactController } from './contact.controller.js';

export const contactRouter = Router();

contactRouter.get('/contacts', contactController.list);
contactRouter.post('/contacts', contactController.create);

contactRouter.get('/contacts/:id', contactController.getById);
contactRouter.put('/contacts/:id', contactController.update);
contactRouter.delete('/contacts/:id', contactController.delete);
