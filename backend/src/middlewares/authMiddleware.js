
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { AppError } from '../error/AppError.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to gain access.', 401)
      );
    }

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await prisma.user.findUnique({
      where: { id: decodedPayload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          403 
        )
      );
    }
    next();
  };
};