const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify service category'],
    enum: [
      'Certificates',
      'Verifications',
      'Registration',
      'Permits',
      'Licenses',
      'Community Services',
      'Land Administration',
      'Social Welfare',
      'Other'
    ]
  },
  codePrefix: {
    type: String,
    required: [true, 'Please add a code prefix'],
    trim: true,
    maxlength: [5, 'Code prefix cannot be more than 5 characters']
  },
  processingTime: {
    type: String,
    trim: true
  },
  fees: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    details: {
      type: String
    }
  },
  requiredDocuments: [
    {
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      isRequired: {
        type: Boolean,
        default: true
      }
    }
  ],
  eligibilityCriteria: {
    type: String
  },
  instructions: {
    type: String
  },
  relatedForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  icon: {
    type: String,
    default: 'document-text'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a text index for search functionality
ServiceSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);