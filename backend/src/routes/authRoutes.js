
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { registerSchema, loginSchema,forgotPasswordSchema,resetPasswordSchema } from '../zodValidation/authSchema.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  authController.handleUserRegistration
);

authRouter.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  authController.handleUserLogin
);

authRouter.post('/forgot-password', 
  authLimiter, 
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword);
authRouter.post('/reset-password', 
  authLimiter, 
  validateRequest(resetPasswordSchema), 
  authController.resetPassword);

export default authRouter;