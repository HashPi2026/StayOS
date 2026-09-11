import { Router } from 'express';
import { floorController } from './floor.controller';
import { validate } from '../../../middleware/validate';
import { validateCreateFloor, validateUpdateFloor } from './floor.validation';

export const floorRouter = Router();

floorRouter.get('/', floorController.list);
floorRouter.get('/:id', floorController.getById);
floorRouter.post('/', validate(validateCreateFloor), floorController.create);
floorRouter.put('/:id', validate(validateUpdateFloor), floorController.update);
floorRouter.delete('/:id', floorController.delete);
