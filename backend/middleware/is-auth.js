require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  // Extract the 'Authorization' header from the incoming request
  const authHeader = req.get('Authorization');

  // Check if the 'Authorization' header is missing
  if (!authHeader) {
    const error = new Error('Authentication header is missing.');
    error.statusCode = 401;
    next(error);
    return;
  }

    // Extract the token from the 'Authorization' header (format: "Bearer [token]")
  const token = authHeader.split(' ')[1];
  if (!token) {
    const error = new Error('Token not found in the authorization header.');
    error.statusCode = 401;
    next(error);
    return;
  }

  let decodedToken;
  try {
     // Verify the token using the secret key and decode it
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Handle any errors during token verification (e.g., token is invalid or expired)
    err.message = 'Token verification failed. Please provide a valid token.';
    err.statusCode = 500;
    next(err);
    return;
  }

  // Check if the token was successfully decoded
  if (!decodedToken) {
    const error = new Error('Token is invalid or has expired.');
    error.statusCode = 401;
    next(error);
    return;
  }

    // Attach the user ID from the decoded token to the request object
  req.userId = decodedToken.userId;

  next();
};


