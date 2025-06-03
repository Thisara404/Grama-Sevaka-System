const mongoose = require('mongoose');

const ForumDiscussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'General Discussion',
      'Service Request',
      'Community Issue',
      'Announcement',
      'Emergency',
      'Legal Matter',
      'Infrastructure',
      'Healthcare',
      'Education',
      'Environment',
      'Other'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'locked', 'resolved', 'reported', 'deleted'],
    default: 'active'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
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
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumReply'
    }
  ],
  solutionReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
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
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search functionality
ForumDiscussionSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text',
  category: 'text'
});

// Virtual for reply count
ForumDiscussionSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

module.exports = mongoose.model('ForumDiscussion', ForumDiscussionSchema);