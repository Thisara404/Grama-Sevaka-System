const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-review', 'additional-info-required', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  documents: [
    {
      name: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional information cannot be more than 1000 characters']
  },
  serviceSpecificData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
      },
      isPublic: {
        type: Boolean,
        default: false
      }
    }
  ],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot be more than 500 characters']
    },
    submittedAt: {
      type: Date
    }
  },
  completionDate: {
    type: Date
  },
  issueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique request number before saving
ServiceRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    // Get current year
    const year = new Date().getFullYear().toString().substr(-2);
    
    // Get the latest request to generate the next number
    const latestRequest = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    let nextNumber = '0001';
    
    if (latestRequest && latestRequest.requestNumber) {
      // Extract the numeric part and increment
      const currentNumber = parseInt(latestRequest.requestNumber.substr(-4));
      nextNumber = (currentNumber + 1).toString().padStart(4, '0');
    }
    
    // Generate request number in format GS-YY-SERVICE_PREFIX-NNNN
    const serviceModel = await mongoose.model('Service').findById(this.service);
    const prefix = serviceModel ? serviceModel.codePrefix : 'GEN';
    
    this.requestNumber = `GS-${year}-${prefix}-${nextNumber}`;
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);