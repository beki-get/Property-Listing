/*
   register
1. Check if user already exists
2. Hash password with bcrypt cost factor of 12
3. Create user record
4. Generate JWT auth token
     login
1. Find user by email
2. Verify password match
3. Generate JWT auth token
*/
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { AppError } from '../error/AppError.js';
import { generateAuthToken } from '../utils/jwtUtils.js';
import { sendEmail } from '../utils/email.js';

export const registerUserAccount = async ({ email, password, role }) => { 
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409); 
  }

  const passwordHashSaltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, passwordHashSaltRounds);

  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const authenticationToken = generateAuthToken({
    userId: createdUser.id,
    role: createdUser.role,
  });

  return {
    user: createdUser,
    token: authenticationToken,
  };
};


export const authenticateUserAccount = async ({ email, password }) => {
  const userRecord = await prisma.user.findUnique({
    where: { email },
  });

  if (!userRecord) {
    throw new AppError('Invalid email or password credentials', 401); 
  }

  const isPasswordValid = await bcrypt.compare(password, userRecord.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password credentials', 401);
  }

  const authenticationToken = generateAuthToken({
    userId: userRecord.id,
    role: userRecord.role,
  });

  const sanitizedUser = {
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role,
    createdAt: userRecord.createdAt,
  };

  return {
    user: sanitizedUser,
    token: authenticationToken,
  };
};


const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = hashToken(resetToken);
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: tokenExpiry,
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const emailMessage = `You requested a password reset. Please click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email. This link will expire in 1 hour.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: emailMessage,
    });
  } catch (error) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    throw new Error('Email could not be sent. Please try again later.');
  }

  return { message: 'If an account with that email exists, a reset link has been sent.' };
};

export const resetPassword = async (token, newPassword) => {
  
  const hashedToken = hashToken(token);
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error('Password reset token is invalid or has expired.');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { message: 'Password has been reset successfully. You can now log in.' };
};