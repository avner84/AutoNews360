require("dotenv").config();

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI,
    NEWSDATA_API_URL: process.env.NEWSDATA_API_URL,
    D_ID_API_KEY: process.env.D_ID_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
  };
  