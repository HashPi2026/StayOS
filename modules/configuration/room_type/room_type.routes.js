import { Router } from 'express';
import { roomTypeController } from './room_type.controller.js';
import { validate } from '../../../middleware/validate.js';
import { validateCreateRoomType, validateUpdateRoomType } from './room_type.validation.js';
export const roomTypeRouter = Router();
// Pattern B: Master list CRUD
roomTypeRouter.get('/', roomTypeController.list);
roomTypeRouter.get('/:id', roomTypeController.getById);
roomTypeRouter.post('/', validate(validateCreateRoomType), roomTypeController.create);
roomTypeRouter.put('/:id', validate(validateUpdateRoomType), roomTypeController.update);
roomTypeRouter.delete('/:id', roomTypeController.delete);
