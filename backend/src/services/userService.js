import prisma from '../config/db.js';
import { AppError } from '../error/AppError.js';

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

export const deleteUserById = async (targetUserId, adminUserId) => {

  if (targetUserId === adminUserId) {
    throw new AppError('You cannot delete your own admin account', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.delete({
    where: { id: targetUserId },
  });

  return true;
};
