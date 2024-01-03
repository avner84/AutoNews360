require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const {
  sendInitialVerificationEmail,
  sendResendVerificationEmail,
} = require("../utils/emailSender");

// Signup Function: Registers a new user with hashed password
exports.signup = async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;

  try {
    // Hashing the password for security
    const hashedPw = await bcrypt.hash(password, 12);

    // Checking if a user with the same email already exists and if their account is not yet verified, in which case the existing account will be overwritten
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = hashedPw;
    } else {
      // Create a new user
      user = new User({
        email,
        password: hashedPw,
        firstName,
        lastName,
      });
    }

    // Saving the user to the database
    const result = await user.save();

    const token = jwt.sign(
      {
        userId: result._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    sendInitialVerificationEmail("avner84@gmail.com", token);

    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Verify Function: Handles user account verification
exports.verify = async (req, res, next) => {
  const token = req.query.token;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/verification-results?status=error`
      );
    }

    user.isActive = true;
    await user.save();

    res.redirect(
      `${process.env.CLIENT_URL}/verification-results?status=success`
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Assume that the user can be found by the token, even if it has expired
      try {
        const decodedToken = jwt.decode(token); // use decode instead of verify
        const user = await User.findById(decodedToken.userId);

        if (user) {
          res.redirect(
            `${process.env.CLIENT_URL}/verification-results?status=expired&email=${user.email}`
          );
        } else {
          res.redirect(
            `${process.env.CLIENT_URL}/verification-results?status=expired`
          );
        }
      } catch (innerErr) {
        res.redirect(
          `${process.env.CLIENT_URL}/verification-results?status=error`
        );
      }
    } else {
      res.redirect(
        `${process.env.CLIENT_URL}/verification-results?status=error`
      );
    }
  }
};

// RequestResendVerification Controller: Sends a new verification email based on email address
exports.requestResendVerification = async (req, res, next) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ redirect: "verification-results?status=error" });
    }

    // Check if the user has already been verified
    if (user.isActive) {
      return res.json({
        redirect: "verification-results?status=already-verified",
      });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    sendResendVerificationEmail(user.email, token);
    return res.json({
      redirect: "verification-results?status=verification-resent",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// UpdateVerification Controller: Updates user verification status based on a new token
exports.updateVerification = async (req, res, next) => {
  const token = req.query.token;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const email = decodedToken.email;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/verification-results?status=error`
      );
    }

    user.isActive = true;
    await user.save();

    res.redirect(
      `${process.env.CLIENT_URL}/verification-results?status=success`
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Decode the token without verification to extract the email
      const decodedToken = jwt.decode(token);
      const email = decodedToken ? decodedToken.email : null;
      res.redirect(
        `${process.env.CLIENT_URL}/verification-results?status=expired&email=${email}`
      );
    } else {
      res.redirect(
        `${process.env.CLIENT_URL}/verification-results?status=error`
      );
    }
  }
};

// Login Function: Authenticates a user and issues a JWT
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Checking if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    // Checking if the user's account is active
    if (!user.isActive) {
      const error = new Error("User account is not active.");
      error.statusCode = 401;
      throw error;
    }

    // Comparing the provided password with the stored hashed password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    // Generating a JWT for the user
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sending the response with token and user details
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

exports.loginByToken = async (req, res, next) => {
  const userId = req.userId;
  try {
    // Fetching the user from the database
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

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

// Change Password Function: Allows a user to change their password
exports.changePassword = async (req, res, next) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    // Fetching the user from the database
    const user = await User.findById(userId);
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
    user.password = hashedPw;
    const result = await user.save();

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
  const userId = req.userId;

  try {
    // Checking if the user exists
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Deleting the user
    const deletedUser = await User.findByIdAndDelete(userId);
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
  const userId = req.userId;
  const { firstName, lastName, email, password } = req.body;

  try {
    // Fetching the user from the database
    const user = await User.findById(userId);
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
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    const result = await user.save();

    // Generating a new JWT for the user
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sending the response with the new token and updated user details
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
