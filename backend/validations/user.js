const { body } = require('express-validator');
const {findUser, findUserById} = require('../data-access/auth')


// Validation Rule Arrays for User Operations

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
            return findUserById(req.userId).then(user => {
                if (user.email === value) {
                    // The email is identical to the user's current email, therefore there is no need to throw an error
                    return Promise.resolve();
                } else {
                    // Check if the email already exists in the system
                    return findUser({ email: value }).then(userDoc => {
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

