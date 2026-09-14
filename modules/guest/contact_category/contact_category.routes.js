import { Router } from 'express';
import { contactCategoryController } from './contact_category.controller.js';

export const contactCategoryRouter = Router();

contactCategoryRouter.get('/contact-categories', contactCategoryController.list);
contactCategoryRouter.post('/contact-categories', contactCategoryController.create);

contactCategoryRouter.get('/contact-categories/:id', contactCategoryController.getById);
contactCategoryRouter.put('/contact-categories/:id', contactCategoryController.update);
contactCategoryRouter.delete('/contact-categories/:id', contactCategoryController.delete);
