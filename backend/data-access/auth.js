const User = require("../models/user");

const findUserById = async (userId) => {
  return await User.findById(userId);
};

const findUser = async (query) => {
  return await User.findOne(query);
};


const createUserOrUpdate = async (userData) => {
    const {email} = userData;
  let user = await findUser({email});

   // Checking if a user with the same email already exists and if their account is not yet verified, in which case the existing account will be overwritten
  if (user) {
    // Update existing user
    Object.assign(user, userData);
  } else {
    // Create a new user
    user = new User(userData);
  }
  // Saving the user to the database
  await user.save();
  return user;
};


const updateUserActiveStatus = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {
      return null;
    }
  
    user.isActive = true;
    await user.save();
    return user;
  };
  
  module.exports = { findUserById, findUser, createUserOrUpdate, updateUserActiveStatus };
  
