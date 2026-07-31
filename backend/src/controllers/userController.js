import * as userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const adminUserId = req.user.id;

    await userService.deleteUserById(targetUserId, adminUserId);

    res.status(200).json({
      status: 'success',
      message: 'User account deleted successfully by admin',
    });
  } catch (error) {
    next(error);
  }
};