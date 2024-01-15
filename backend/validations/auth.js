const { body } = require('express-validator');
const {findUser} = require('../data-access/auth')


// Validation Rule Arrays for Authentication Operations

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
            return findUser({ email: value }).then((user) => {
                if (user?.isActive) { // Check if the user is also active
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