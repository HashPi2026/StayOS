import { Router } from 'express';
import { propertyController } from './property.controller.js';
import { validate } from '../../../middleware/validate.js';
import { validateUpsertProperty } from './property.validation.js';
export const propertyRouter = Router();
// Pattern A: Singletons expose GET and PUT only
propertyRouter.get('/', propertyController.get);
propertyRouter.put('/', validate(validateUpsertProperty), propertyController.put);
