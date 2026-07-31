import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { getUsers, deleteUser } from '../controllers/userController.js';

const userRouter = Router();


userRouter.use(protect, restrictTo('admin'));

// Admin User Management Routes
userRouter.get('/', getUsers);
userRouter.delete('/:id', deleteUser);

export default userRouter;