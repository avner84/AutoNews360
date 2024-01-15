const mongoose = require('mongoose');
const {MONGODB_URI} = require('../config/vars'); 

async function connectToDatabase() {
 
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      writeConcern: {
        w: "majority",
        j: true
      }
    });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = connectToDatabase;
