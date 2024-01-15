const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const connectToDatabase = require('./utils/connect');
const {port: PORT} = require('./config/default');
const { fetchAndSaveNews } = require("./services/newsFetcher");
const FETCH_INTERVAL = 10800000; // 3 hours in milliseconds

const routes = require('./routes/index');

const app = express();

// Middleware for logging requests
app.use((req, res, next) => {
  const { method, url } = req;
  console.log(`Received ${method} request to ${url}`);
  next();
});

app.use(bodyParser.json());

// Configure CORS with an options object
app.use(cors({
  origin: '*', // Allows requests from any origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Specifies the allowed request methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specifies the allowed headers
  credentials: true // Allows the use of credentials like cookies
}));

app.use(routes);

// Error Handling Middleware: Handles any errors that occur in the application
app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});


// Async function to start the server
// This ensures that the server starts listening only after a successful database connection
async function startServer() {
  try {
    await connectToDatabase(); // Attempt to connect to the database
    // Start listening on the specified port only after a successful database connection
    app.listen(PORT || 8080, () => {
      console.log(`Server is running on port ${PORT || 8080}`);
      // Setting an interval for fetching and saving news
      setInterval(fetchAndSaveNews, FETCH_INTERVAL);
      fetchAndSaveNews();
    });
  } catch (error) {
    // Log any errors if the database connection fails
    console.error('Failed to connect to the database:', error);
  }
}

startServer(); // Start the server by calling the function

