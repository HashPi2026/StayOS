import { Router } from 'express';
import { guestDocumentController } from './guest_document.controller.js';

export const guestDocumentRouter = Router();

// Nested under guest: GET/POST /guests/:guestId/documents
guestDocumentRouter.get('/guests/:guestId/documents', guestDocumentController.listByGuest);
guestDocumentRouter.post('/guests/:guestId/documents', guestDocumentController.createForGuest);

// Direct document manipulation: PUT/DELETE /guest-documents/:id
guestDocumentRouter.put('/guest-documents/:id', guestDocumentController.update);
guestDocumentRouter.delete('/guest-documents/:id', guestDocumentController.delete);
