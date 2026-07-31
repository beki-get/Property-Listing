
import * as favoriteService from '../services/favoriteService.js';

export const handleAddFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const favorite = await favoriteService.addPropertyToFavorites(userId, propertyId);

    res.status(201).json({
      status: 'success',
      message: 'Property added to favorites',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
};

export const handleRemoveFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const result = await favoriteService.removePropertyFromFavorites(userId, propertyId);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await favoriteService.getUserFavoriteProperties(userId);
    
    res.status(200).json({
      status: 'success',
      results: favorites.length,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
};