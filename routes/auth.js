const express = require('express');
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');
const { userById } = require('../controllers/user');
const {
  userSignupValidator,
  userSignInValidator,
  passwordResetValidator,
} = require('../validators/auth');
const { runValidation } = require('../validators/index');

const router = express.Router();

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/signin', userSignInValidator, runValidation, signin);
router.get('/signout', signout);

// password forgot and reset routes
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);

// any route containing :userId , our app will first execute userById()
router.param('userId', userById);

module.exports = router;
