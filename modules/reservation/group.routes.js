import { Router } from 'express';
import { groupController } from './group.controller.js';

export const groupSubRouter = Router();

// Master Group Folios
groupSubRouter.get('/', groupController.list);
groupSubRouter.post('/', groupController.create);
groupSubRouter.get('/groups', groupController.list);
groupSubRouter.get('/groups/search', groupController.search);
groupSubRouter.post('/groups', groupController.create);
groupSubRouter.get('/groups/:id', groupController.getById);
groupSubRouter.put('/groups/:id', groupController.update);
groupSubRouter.delete('/groups/:id', groupController.delete);

// Group Contacts
groupSubRouter.get('/groups/:groupId/contacts', groupController.listContacts);
groupSubRouter.post('/groups/:groupId/contacts', groupController.createContact);
groupSubRouter.put('/group-contacts/:id', groupController.updateContact);
groupSubRouter.delete('/group-contacts/:id', groupController.deleteContact);

// Group Documents
groupSubRouter.get('/groups/:groupId/documents', groupController.listDocuments);
groupSubRouter.post('/groups/:groupId/documents', groupController.createDocument);
groupSubRouter.put('/group-documents/:id', groupController.updateDocument);
groupSubRouter.delete('/group-documents/:id', groupController.deleteDocument);
