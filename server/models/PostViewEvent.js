const mongoose = require('mongoose');

const PostViewEventSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true
    },
    visitorId: {
      type: String,
      required: true,
      index: true
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

PostViewEventSchema.index({ visitorId: 1, viewedAt: 1 });

module.exports = mongoose.model('PostViewEvent', PostViewEventSchema);
