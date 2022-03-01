const { body } = require('express-validator');

exports.userSignupValidator = [
  body('name').not().isEmpty().withMessage('Name is Required'),
  body('email')
    .not()
    .isEmpty()
    .isEmail()
    .matches(/.+\@.+\..+/)
    .withMessage('Enter a valid Email Address'),
  body('password')
    .isLength({ min: 6, max: 32 })
    .withMessage(
      'Password must be at least 6 character and must contain a number'
    ),
];

exports.userSignInValidator = [
  body('email').isEmail().withMessage('Enter a valid Email Address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character'),
];

exports.passwordResetValidator = [
  body('newPassword')
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character'),
];
