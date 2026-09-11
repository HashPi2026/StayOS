import { Router } from 'express';
import { propertyController } from './property.controller';
import { validate } from '../../../middleware/validate';
import { validateUpsertProperty } from './property.validation';

export const propertyRouter = Router();

// Pattern A: Singletons expose GET and PUT only
propertyRouter.get('/', propertyController.get);
propertyRouter.put('/', validate(validateUpsertProperty), propertyController.put);
