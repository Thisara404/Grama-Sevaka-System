const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify document type'],
    enum: [
      'Form',
      'Certificate',
      'Guideline',
      'Announcement',
      'Report',
      'Official Notice',
      'Application Form',
      'Other'
    ]
  },
  department: {
    type: String,
    required: [true, 'Please specify department'],
    enum: [
      'Registration',
      'Certification',
      'Land Administration',
      'Community Services',
      'General Administration',
      'All Departments'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  filePath: {
    type: String,
    required: [true, 'Please upload a file']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
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
DocumentSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  type: 'text',
  department: 'text'
});

module.exports = mongoose.model('Document', DocumentSchema);