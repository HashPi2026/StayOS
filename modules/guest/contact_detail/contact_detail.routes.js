import { Router } from 'express';
import { contactDetailController } from './contact_detail.controller.js';

export const contactDetailRouter = Router();

// Nested under contact: GET/POST /contacts/:contactId/details
contactDetailRouter.get('/contacts/:contactId/details', contactDetailController.listByContact);
contactDetailRouter.post('/contacts/:contactId/details', contactDetailController.createForContact);

// Direct detail manipulation: PUT/DELETE /contact-details/:id
contactDetailRouter.put('/contact-details/:id', contactDetailController.update);
contactDetailRouter.delete('/contact-details/:id', contactDetailController.delete);
