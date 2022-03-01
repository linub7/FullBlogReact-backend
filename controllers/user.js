const _ = require('lodash');
const User = require('../models/user');
const fs = require('fs');

exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id)
      .populate('following', '_id name')
      .populate('followers', '_id name')
      .select('-image.data')
      .exec();
    if (!user) return res.status(400).json({ error: 'User not found' });
    req.profile = user; // add profile object in req with user info
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!authorized) {
    return res
      .status(403)
      .json({ error: 'User is not authorized to perform this action' });
  }
  next();
};

exports.allUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id name email created about')
      .exec();
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'There is not any user' });
    }

    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.singleUser = async (req, res) => {
  try {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fields, files } = req;

    let data = { ...fields };

    if (files.profilePhoto) {
      let image = {};

      image.data = fs.readFileSync(files.profilePhoto.path);
      image.contentType = files.profilePhoto.type;
      data.image = image;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, data, {
      new: true,
    })
      .select('-image.data')
      .exec();
    updatedUser.hashed_password = undefined;
    updatedUser.salt = undefined;
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.userImage = async (req, res, next) => {
  const user = await User.findById(req.params.userId).exec();
  if (user && !user.image) {
    return false;
  }
  if (user && user.image && user.image.contentType !== null) {
    res.set('Content-Type', user.image.contentType);
    return res.send(user.image.data);
  }
};

// follow unFollow
exports.addFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { following: req.body.followId },
    });
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.addFollowers = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.body.userId } },
      { new: true }
    )
      .populate('following', '_id name')
      .populate('followers', '_id name');
    updatedUser.hashed_password = undefined;
    updatedUser.salt = undefined;
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.removeFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, {
      $pull: { following: req.body.unfollowId },
    });
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.removeFollowers = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.body.userId } },
      { new: true }
    )
      .populate('following', '_id name')
      .populate('followers', '_id name');
    updatedUser.hashed_password = undefined;
    updatedUser.salt = undefined;
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.findPeople = async (req, res) => {
  try {
    let following = req.profile.following;
    following.push(req.profile._id);
    const users = await User.find({ _id: { $nin: following } }).select('name');
    res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = req.profile;
    user.hashed_password = undefined;
    user.salt = undefined;
    await user.remove();
    return res.json({ message: 'User Deleted Successfully' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};
