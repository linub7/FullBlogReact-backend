const mongoose = require('mongoose');
const uuidv1 = require('uuidv1');
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    image: {
      data: Buffer,
      contentType: String,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    updated: Date,
    about: {
      type: String,
      trim: true,
    },
    following: [{ type: ObjectId, ref: 'User' }],
    followers: [{ type: ObjectId, ref: 'User' }],
    resetPasswordLink: {
      data: String,
      default: '',
    },
  },
  { timestamps: true }
);

/**
 * virtual fields are additional fields for a give model
 * their values can be set manually or automatically with defined functionality
 * keep in mind: virtual properties dont get persist in the database
 * they only exist logically and are not written to document's collection
 */

// virtual field
userSchema
  .virtual('password')
  .set(function (password) {
    // create temporary variable called _password
    this._password = password;
    // generate a timestamp
    this.salt = uuidv1();
    // encryptPassword
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// methods
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
};

module.exports = mongoose.model('User', userSchema);
