const User = require("../models/user");

const findUserById = async (userId) => {
  return await User.findById(userId);
};

const updateUserPassword = async (user, newPassword) => {
  user.password = newPassword;
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

const updateUserDetails = async (user, updateFields) => {
  Object.assign(user, updateFields);
  await user.save();
  return user;
};

module.exports = { findUserById, updateUserPassword, deleteUserById, updateUserDetails };

