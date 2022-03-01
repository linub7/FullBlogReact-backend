const express = require('express');
const formidable = require('express-formidable');
const { requireSignin } = require('../controllers/auth');
const {
  allUsers,
  userById,
  singleUser,
  updateUser,
  deleteUser,
  hasAuthorization,
  userImage,
  addFollowing,
  addFollowers,
  removeFollowing,
  removeFollowers,
  findPeople,
} = require('../controllers/user');

const router = express.Router();

// follow and unfollow
router.put('/user/follow', requireSignin, addFollowing, addFollowers);
router.put('/user/unfollow', requireSignin, removeFollowing, removeFollowers);

router.get('/users', allUsers);
router.get('/user/:userId', requireSignin, singleUser);
router.put(
  '/user/:userId',
  requireSignin,
  hasAuthorization,
  formidable(),
  updateUser
);

// who to follow
router.get('/user/findpeople/:userId', requireSignin, findPeople);

router.get('/user/image/:userId', userImage);
router.delete('/user/:userId', requireSignin, hasAuthorization, deleteUser);

// any route containing :userId , our app will first execute userFindById()
router.param('userId', userById);

module.exports = router;
