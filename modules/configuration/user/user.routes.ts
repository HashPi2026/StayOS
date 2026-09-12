import { Router } from 'express';
import { UserController } from './user.controller';

export const userRouter = Router();
const controller = new UserController();

userRouter.get('/', controller.list);
userRouter.get('/:id', controller.getById);
userRouter.post('/', controller.create);
userRouter.put('/:id', controller.update);
userRouter.patch('/:id/status', controller.toggleStatus);
userRouter.delete('/:id', controller.delete);
