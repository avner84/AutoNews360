require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {fetchAndSaveNews} = require('./services/newsFetcher')
const FETCH_INTERVAL = 10800000; // 3 hours in milliseconds

const newsRoutes = require('./routes/news')
const authRoutes = require('./routes/auth');

const app = express();

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

app.use(bodyParser.json());


// CORS Middleware: Sets headers to allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRoutes);
app.use('/news', newsRoutes);



// Error Handling Middleware: Handles any errors that occur in the application
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});



// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: {
      w: 'majority',
      j: true
    }
  })
  .then(() => {
      console.log('Connected to MongoDB successfully!');
      app.listen(process.env.PORT || 8080, () => {
        console.log(`Server is running on port ${process.env.PORT || 8080}`);
      });
  
    // Running the fetchAndSaveNews function every 3 hours
     setInterval(fetchAndSaveNews, FETCH_INTERVAL);
      fetchAndSaveNews();
  })
  .catch(err => {
      console.log('Error connecting to MongoDB:', err);
  });