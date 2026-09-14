import { Router } from 'express';
import { contactDocumentController } from './contact_document.controller.js';

export const contactDocumentRouter = Router();

// Nested under contact: GET/POST /contacts/:contactId/documents
contactDocumentRouter.get('/contacts/:contactId/documents', contactDocumentController.listByContact);
contactDocumentRouter.post('/contacts/:contactId/documents', contactDocumentController.createForContact);

// Direct document manipulation: PUT/DELETE /contact-documents/:id
contactDocumentRouter.put('/contact-documents/:id', contactDocumentController.update);
contactDocumentRouter.delete('/contact-documents/:id', contactDocumentController.delete);
