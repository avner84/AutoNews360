const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {JWT_SECRET} = require('../config/vars');
const { origin: CLIENT_URL } = require('../config/default');

const {updateUserActiveStatus,
  createUserOrUpdate,
  findUserById,
  findUser,
} = require("../data-access/auth");
const {
  sendInitialVerificationEmail,
  sendResendVerificationEmail,
} = require("../utils/emailSender");

// Signup Function: Registers a new user with hashed password
exports.signup = async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;

  // Hashing the password for security
  const hashedPw = await bcrypt.hash(password, 12);

  const userData = {
    email,
    password: hashedPw,
    firstName,
    lastName,
  };

  try {
    // Creates or updates a user. If the user already exists (by email) but hasn't verified their account, their details (firstName, lastName, password) are overwritten with the new ones.
    const result = await createUserOrUpdate(userData);

    const token = jwt.sign(
      {
        userId: result._id.toString(),
      },
      JWT_SECRET,
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
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { userId } = decodedToken;

    const updatedUser = await updateUserActiveStatus(userId);
    if (!updatedUser) {
      return res.redirect(
        `${CLIENT_URL}/verification-results?status=error`
      );
    }

    res.redirect(
      `${CLIENT_URL}/verification-results?status=success`
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Assume that the user can be found by the token, even if it has expired
      try {
        const decodedToken = jwt.decode(token); // use decode instead of verify
        const user = await findUserById(decodedToken.userId);

        if (user) {
          res.redirect(
            `${CLIENT_URL}/verification-results?status=expired&email=${user.email}`
          );
        } else {
          res.redirect(
            `${CLIENT_URL}/verification-results?status=expired`
          );
        }
      } catch (innerErr) {
        res.redirect(
          `${CLIENT_URL}/verification-results?status=error`
        );
      }
    } else {
      res.redirect(
        `${CLIENT_URL}/verification-results?status=error`
      );
    }
  }
};

// RequestResendVerification Controller: Sends a new verification email based on email address
exports.requestResendVerification = async (req, res, next) => {
  const { email } = req.query;

  try {
    const user = await findUser({ email });
    if (!user) {
      return res.json({ redirect: "verification-results?status=error" });
    }

    // Check if the user has already been verified
    if (user.isActive) {
      return res.json({
        redirect: "verification-results?status=already-verified",
      });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
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
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const { email } = decodedToken;

    const user = await findUser({ email });
    if (!user) {
      return res.redirect(
        `${CLIENT_URL}/verification-results?status=error`
      );
    }

    user.isActive = true;
    await user.save();

    res.redirect(
      `${CLIENT_URL}/verification-results?status=success`
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Decode the token without verification to extract the email
      const decodedToken = jwt.decode(token);
      const email = decodedToken ? decodedToken.email : null;
      res.redirect(
        `${CLIENT_URL}/verification-results?status=expired&email=${email}`
      );
    } else {
      res.redirect(
        `${CLIENT_URL}/verification-results?status=error`
      );
    }
  }
};

// Login Function: Authenticates a user and issues a JWT
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Checking if user exists
    const user = await findUser({ email });
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
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sending the response with token and user details
    res.status(200).json({
      token,
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
  const { userId } = req;
  try {
    // Fetching the user from the database
    const user = await findUserById(userId);
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
      JWT_SECRET,
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
