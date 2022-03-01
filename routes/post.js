const express = require('express');
const { requireSignin } = require('../controllers/auth');
const formidable = require('express-formidable');
const {
  getPosts,
  createPost,
  postsByUser,
  postById,
  isPoster,
  deletePost,
  updatePost,
  postImage,
  getSinglePost,
  like,
  unlike,
  comment,
  uncomment,
} = require('../controllers/post');
const { userById } = require('../controllers/user');

const router = express.Router();

// like and unlike
router.put('/post/like', requireSignin, like);
router.put('/post/unlike', requireSignin, unlike);

// comment and delete Comment
router.put('/post/comment', requireSignin, comment);
router.put('/post/uncomment', requireSignin, uncomment);

router.get('/posts', getPosts);
router.get('/post/:postId', getSinglePost);
router.get('/posts/by/:userId', requireSignin, postsByUser);
router.post('/post/new/:userId', requireSignin, formidable(), createPost);
router.put('/post/:postId', requireSignin, isPoster, formidable(), updatePost);
router.delete('/post/:postId', requireSignin, isPoster, deletePost);
router.get('/post/photo/:postId', postImage);

// any route containing :userId , our app will first execute userById()
router.param('userId', userById);
// any route containing :postId , our app will first execute postById()
router.param('postId', postById);

module.exports = router;
