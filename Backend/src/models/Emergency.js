const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emergencyType: {
    type: String,
    required: [true, 'Please specify emergency type'],
    enum: [
      'Natural Disaster',
      'Fire',
      'Medical Emergency',
      'Crime',
      'Infrastructure Issue',
      'Public Disturbance',
      'Environmental Hazard',
      'Other'
    ]
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
      }
    }
  },
  photos: [
    {
      type: String
    }
  ],
  status: {
    type: String,
    enum: ['reported', 'in-progress', 'resolved', 'archived'],
    default: 'reported'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [
    {
      content: {
        type: String,
        required: true
      },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  investigationCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Emergency', EmergencySchema);