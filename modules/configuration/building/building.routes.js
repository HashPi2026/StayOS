import { Router } from 'express';
import { buildingController } from './building.controller.js';
import { validate } from '../../../middleware/validate.js';
import { validateCreateBuilding, validateUpdateBuilding } from './building.validation.js';
export const buildingRouter = Router();
// Pattern B: Master list CRUD
buildingRouter.get('/', buildingController.list);
buildingRouter.get('/:id', buildingController.getById);
buildingRouter.post('/', validate(validateCreateBuilding), buildingController.create);
buildingRouter.put('/:id', validate(validateUpdateBuilding), buildingController.update);
buildingRouter.delete('/:id', buildingController.delete);
