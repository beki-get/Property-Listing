
import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { favoritePropertySchema } from '../zodValidation/favoriteSchema.js';

const favoriteRouter = Router();

favoriteRouter.use(protect);

favoriteRouter.get('/', 
  favoriteController.handleGetMyFavorites);

favoriteRouter.post(
  '/:propertyId',
  validateRequest(favoritePropertySchema),
  favoriteController.handleAddFavorite
);

favoriteRouter.delete(
  '/:propertyId',
  validateRequest(favoritePropertySchema),
  favoriteController.handleRemoveFavorite
);

export default favoriteRouter;