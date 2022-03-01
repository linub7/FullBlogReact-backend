const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 150,
    },
    body: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 2000,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        comment: String,
        created: { type: Date, default: Date.now },
        commentedBy: {
          type: ObjectId,
          ref: 'User',
        },
      },
    ],
    created: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
