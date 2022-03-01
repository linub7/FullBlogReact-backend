const fs = require('fs');
const Post = require('../models/post');
const _ = require('lodash');

exports.postById = async (req, res, next, id) => {
  try {
    const post = await Post.findById(id)
      .populate('postedBy', '_id name')
      .exec();
    if (!post) return res.status(400).json({ error: 'Post not found' });
    req.post = post; // add post object in req with user info
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  console.log('req.post ', req.post);
  console.log('req.auth ', req.auth);
  console.log('req.post.postedBy._id ', req.post.postedBy);
  console.log('req.auth._id', req.auth._id);

  if (!isPoster) {
    return res.status(403).json({ error: 'User is not authorized' });
  }
  next();
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('postedBy', '_id name')
      .populate('likes', '_id name')
      .populate('comments')
      .select('_id title body createdAt likes')
      .sort('-createdAt')
      .exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('postedBy', '_id name')
      .populate('likes', '_id')
      .populate('comments')
      // .populate('comments.commentedBy')
      .select('_id title body createdAt likes')
      .exec();
    if (!post) {
      return res.status(400).json({ error: 'Post not Found' });
    }
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { fields, files } = req;
    let data = { ...fields };
    if (files.photo) {
      let photo = {};
      photo.data = fs.readFileSync(files.photo.path);
      photo.contentType = files.photo.type;
      data.photo = photo;
    }

    let post = new Post(data);
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    post.postedBy = req.profile;

    const result = await post.save();
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.postsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.profile._id })
      .populate('postedBy', '_id name')
      .populate('comments')
      // .populate('comments.commentBy', '_id name')
      .sort('-created')
      .exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { fields, files } = req;

    let data = { ...fields };

    if (files.photo) {
      let image = {};

      image.data = fs.readFileSync(files.photo.path);
      image.contentType = files.photo.type;
      data.photo = image;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, data, {
      new: true,
    }).exec();

    res.json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(400).json({ error: 'Post not Found' });
    }
    await post.remove();
    res.json({ message: 'Post Delete Successfully' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.postImage = async (req, res) => {
  const post = await Post.findById(req.params.postId).exec();
  if (post && !post.photo) {
    return false;
  }
  if (post && post.photo && post.photo.contentType !== null) {
    res.set('Content-Type', post.photo.contentType);
    return res.send(post.photo.data);
  }
};

// like and unlike
exports.like = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { likes: req.body.userId },
      },
      { new: true }
    )
      .populate('postedBy', '_id name')
      .populate('comments')
      // .populate('comments.commentBy', '_id name')
      .populate('likes', '_id');
    res.json(updatedPost);
  } catch (err) {
    console.log(err);
  }
};

exports.unlike = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { likes: req.body.userId },
      },
      { new: true }
    )
      .populate('postedBy', '_id')
      .populate('comments')
      // .populate('comments.commentBy', '_id name')
      .populate('likes', '_id');
    res.json(updatedPost);
  } catch (err) {
    console.log(err);
  }
};

// comment and deleteComment
exports.comment = async (req, res) => {
  try {
    const data = { comment: req.body.comment, commentedBy: req.body.userId };
    const updatedPost = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: {
          comments: data,
        },
      },
      { new: true }
    )
      .populate('postedBy', '_id name')
      .populate('likes', '_id')
      .populate('comments.commentedBy', '_id name');
    res.json(updatedPost);
  } catch (err) {
    console.log(err);
  }
};

exports.uncomment = async (req, res) => {
  try {
    let comment = req.body.comment;

    const updatedPost = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { comments: { _id: comment._id } },
      },
      { new: true }
    )
      .populate('postedBy', '_id name')
      .populate('likes', '_id')
      .populate('comments.commentedBy', '_id name');
    res.json(updatedPost);
  } catch (err) {
    console.log(err);
  }
};
