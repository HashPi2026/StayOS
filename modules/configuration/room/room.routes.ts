import { Router } from 'express';
import { roomController } from './room.controller';
import { validate } from '../../../middleware/validate';
import { validateCreateRoom, validateUpdateRoom } from './room.validation';

export const roomRouter = Router();

roomRouter.get('/', roomController.list);
roomRouter.get('/:id', roomController.getById);
roomRouter.post('/', validate(validateCreateRoom), roomController.create);
roomRouter.put('/:id', validate(validateUpdateRoom), roomController.update);
roomRouter.delete('/:id', roomController.delete);
