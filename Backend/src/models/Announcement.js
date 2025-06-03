const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify announcement category'],
    enum: [
      'General Information',
      'Emergency',
      'Community Event',
      'Public Service',
      'Weather Alert',
      'Holiday',
      'Infrastructure',
      'Health',
      'Education',
      'Environment',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  image: {
    type: String
  },
  attachments: [
    {
      type: String
    }
  ],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    type: String,
    enum: ['all', 'citizens', 'gs-officers'],
    default: 'all'
  },
  relatedLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for search functionality
AnnouncementSchema.index({ 
  title: 'text', 
  content: 'text', 
  category: 'text'
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);