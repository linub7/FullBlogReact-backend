const { body } = require('express-validator');

exports.createPostValidator = [
  body('title').not().isEmpty().withMessage('title is Required'),
  body('body').not().isEmpty().withMessage('Body is Required'),
];
