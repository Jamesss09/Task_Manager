import { Router } from 'express';
import { taskController } from '../controllers/taskController';

export const taskRouter = Router();

taskRouter.get('/', taskController.list);
taskRouter.get('/:id', taskController.getById);
taskRouter.post('/', taskController.create);
taskRouter.patch('/:id', taskController.update);
taskRouter.delete('/:id', taskController.remove);