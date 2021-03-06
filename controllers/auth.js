const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { sendEmail } = require('../helpers');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
      return res
        .status(403)
        .json({ error: 'Email already is taken.Please write another email' });
    }
    const newUser = await new User({ name, email, password });
    await newUser.save();
    return res.status(200).json({ message: 'Signup success! Please login' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // find the user based on email
    const user = await User.findOne({ email }).exec();
    //if error or no user
    if (!user)
      return res.status(401).json({
        error: 'There is not any account with this email.Please sign up first',
      });
    // if user do not authenticate
    if (!user.authenticate(password))
      return res.status(401).json({ error: 'Credentials not matched' });

    // generate a token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // persist the token as 'token' in cookie with expiry date
    res.cookie('token', token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client

    return res.json({
      user: { _id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.signout = async (req, res) => {
  res.clearCookie('token');

  return res.json({ message: 'signout success!' });
};

exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ message: 'No request body' });
  if (!req.body.email)
    return res.status(400).json({ message: 'No Email in request body' });

  console.log('forgot password finding user with that email');
  const { email } = req.body;
  console.log('signin req.body', email);
  // find the user based on email
  User.findOne({ email }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status('401').json({
        error: 'User with that email does not exist!',
      });

    // generate a token with user id and secret
    const token = jwt.sign(
      { _id: user._id, iss: 'NODEAPI' },
      process.env.JWT_SECRET
    );

    // email data
    const emailData = {
      from: 'noreply@node-react.com',
      to: email,
      subject: 'Password Reset Instructions',
      text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL}/reset-password/${token}</p>`,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ message: err });
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
        });
      }
    });
  });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status('401').json({
        error: 'Invalid Link!',
      });

    const updatedFields = {
      password: newPassword,
      resetPasswordLink: '',
    };

    user = _.extend(user, updatedFields);
    user.updated = Date.now();

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: `Great! Now you can login with your new password.`,
      });
    });
  });
};

// exports.socialLogin = (req, res) => {
//   // try signup by finding user with req.email
//   let user = User.findOne({ email: req.body.email }, (err, user) => {
//     if (err || !user) {
//       // create a new user and login
//       user = new User(req.body);
//       req.profile = user;
//       user.save();
//       // generate a token with user id and secret
//       const token = jwt.sign(
//         { _id: user._id, iss: 'NODEAPI' },
//         process.env.JWT_SECRET
//       );
//       res.cookie('token', token, { expire: new Date() + 9999 });
//       // return response with user and token to frontend client
//       const { _id, name, email } = user;
//       return res.json({ token, user: { _id, name, email } });
//     } else {
//       // update existing user with new social info and login
//       req.profile = user;
//       user = _.extend(user, req.body);
//       user.updated = Date.now();
//       user.save();
//       // generate a token with user id and secret
//       const token = jwt.sign(
//         { _id: user._id, iss: 'NODEAPI' },
//         process.env.JWT_SECRET
//       );
//       res.cookie('token', token, { expire: new Date() + 9999 });
//       // return response with user and token to frontend client
//       const { _id, name, email } = user;
//       return res.json({ token, user: { _id, name, email } });
//     }
//   });
// };

exports.requireSignin = expressJwt({
  // if the token is valid, express jwt appends the verified users id
  // in an auth key to the request object
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'auth',
});
