import { Router } from 'express';
import { roomStatusController } from './room_status.controller';
import { validate } from '../../../middleware/validate';
import { validateCreateRoomStatus, validateUpdateRoomStatus } from './room_status.validation';

export const roomStatusRouter = Router();

roomStatusRouter.get('/', roomStatusController.list);
roomStatusRouter.get('/:id', roomStatusController.getById);
roomStatusRouter.post('/', validate(validateCreateRoomStatus), roomStatusController.create);
roomStatusRouter.put('/:id', validate(validateUpdateRoomStatus), roomStatusController.update);
roomStatusRouter.delete('/:id', roomStatusController.delete);
