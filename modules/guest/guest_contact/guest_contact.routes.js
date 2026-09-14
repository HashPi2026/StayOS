import { Router } from 'express';
import { guestContactController } from './guest_contact.controller.js';

export const guestContactRouter = Router();

// Nested under guest: GET/POST /guests/:guestId/contacts
guestContactRouter.get('/guests/:guestId/contacts', guestContactController.listByGuest);
guestContactRouter.post('/guests/:guestId/contacts', guestContactController.createForGuest);

// Direct contact manipulation: PUT/DELETE /guest-contacts/:id
guestContactRouter.put('/guest-contacts/:id', guestContactController.update);
guestContactRouter.delete('/guest-contacts/:id', guestContactController.delete);
