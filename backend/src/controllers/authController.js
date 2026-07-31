
import * as authService from '../services/authService.js';

export const handleUserRegistration = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const registrationResult = await authService.registerUserAccount({
      email,
      password,
      role,
    });

    res.status(201).json({
      status: 'success',
      message: 'User account registered successfully',
      data: registrationResult,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const authenticationResult = await authService.authenticateUserAccount({
      email,
      password,
    });

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: authenticationResult,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await authService.requestPasswordReset(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};