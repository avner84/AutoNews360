const { body, validationResult } = require('express-validator');
const User = require('../models/user');


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

// Validation Rule Arrays for User Operations

exports.signupValidations = [
    body('firstName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please enter your first name.'),
    body('lastName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please enter your last name.'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc && userDoc.isActive) { // Check if the user is also active
                    return Promise.reject('E-mail address already exists, please use a different one.');
                }
            });
        }),
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        })
];

exports.loginValidations = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.')
];

exports.changePasswordValidations = [
    body('currentPassword')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
    body('newPassword')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
    body('confirmNewPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match.');
            }
            return true;
        })
];



exports.editUserValidations = [
    body('firstName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please enter your first name.'),
    body('lastName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Please enter your last name.'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findById(req.userId).then(user => {
                if (user.email === value) {
                    // The email is identical to the user's current email, therefore there is no need to throw an error
                    return Promise.resolve();
                } else {
                    // Check if the email already exists in the system
                    return User.findOne({ email: value }).then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('E-mail address already exists, please use a different one.');
                        }
                    });
                }
            });
        }),
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.')
]

exports.createBlogValidations =[
    body('title')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Title must be over 10 chars long.'),
    body('content')
    .trim()
    .isLength({ min: 30 })
    .withMessage('Content must be over 30 chars long.')
]