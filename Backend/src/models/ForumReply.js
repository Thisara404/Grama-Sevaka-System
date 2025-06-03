const mongoose = require('mongoose');

const ForumReplySchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumDiscussion',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxlength: [2000, 'Reply cannot be more than 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isSolution: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'reported', 'deleted'],
    default: 'active'
  },
  reports: [
    {
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ForumReply', ForumReplySchema);