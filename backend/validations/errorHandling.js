const { validationResult } = require('express-validator');

// Middleware to handle validation errors

exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req); // Extract validation results from the request
     // Check if there are any validation errors
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.'); 
        error.statusCode = 422; 
        error.data = errors.array(); 
        error.message = error.data.map(e => e.msg).join('. '); 
        return next(error); 
    }
    next();  
};

