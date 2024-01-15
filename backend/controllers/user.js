require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  findUserById,
  updateUserPassword,
  deleteUserById,
  updateUserDetails,
} = require("../data-access/user");

// Change Password Function: Allows a user to change their password
exports.changePassword = async (req, res, next) => {
  const {
    userId,
    body: { currentPassword, newPassword },
  } = req;

  try {
    // Fetching the user from the database
    const user = await findUserById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Verifying the current password
    const isEqual = await bcrypt.compare(currentPassword, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    // Hashing the new password and updating the user
    const hashedPw = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(user, hashedPw);

    // Generating a new JWT for the user
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sending the response with the new token and user details
    res.status(200).json({
      token: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Delete User Function: Deletes a user from the database
exports.deleteUser = async (req, res, next) => {
  const { userId } = req;

  try {
    // Checking if the user exists
    const user = await findUserById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Deleting the user
    const deletedUser = await deleteUserById(userId);
    if (!deletedUser) {
      const error = new Error("User could not be deleted.");
      error.statusCode = 500;
      throw error;
    }

    // Sending a confirmation response
    res.status(200).json({ message: "User has been deleted." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Edit User Function: Allows a user to update their details
exports.userEdit = async (req, res, next) => {
  const {
    userId,
    body: { firstName, lastName, email, password },
  } = req;

  try {
    // Fetching the user from the database
    const user = await findUserById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Verifying the password before updating details
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    // Updating the user details
    const updateFields = { firstName, lastName, email };
    const updatedUser = await updateUserDetails(user, updateFields);

    // Generating a new JWT for the user
    const token = jwt.sign(
      {
        email: updatedUser.email,
        userId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sending the response with the new token and updated user details
    res.status(200).json({
      token,
      user: {
        id: userId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
