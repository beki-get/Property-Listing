
import prisma from '../config/db.js';
import { AppError } from '../error/AppError.js';

export const addPropertyToFavorites = async (userId, propertyId) => {
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      status: 'published',
      deletedAt: null,
    },
  });

  if (!property) {
    throw new AppError('Property not found or is no longer available', 404);
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingFavorite) {
    throw new AppError('Property is already in your favorites', 400);
  }

  const favorite = await prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          images: true,
        },
      },
    },
  });

  return favorite;
};

export const removePropertyFromFavorites = async (userId, propertyId) => {
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (!existingFavorite) {
    throw new AppError('Property is not in your favorites list', 404);
  }

  await prisma.favorite.delete({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  return { message: 'Property removed from favorites successfully' };
};

export const getUserFavoriteProperties = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      property: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          price: true,
          images: true,
          status: true,
          owner: {
            select: { id: true, email: true },
          },
        },
      },
    },
  });

  const activeFavorites = favorites.filter(
    (favorite) => favorite.property && favorite.property.status === 'published'
  );

  return activeFavorites;
};