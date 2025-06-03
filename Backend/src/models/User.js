const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['citizen', 'gs'],
    default: 'citizen'
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String
  },
  nic: {
    type: String,
    unique: true
  },
  gsId: {
    type: String,
    sparse: true, // Allow null/empty values but ensure uniqueness if provided
    unique: true
  },
  accountStatus: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: function() {
      // Auto-verify citizens, but require approval for GS officers
      return this.role === 'gs' ? 'pending' : 'active';
    }
  },
  profilePicture: {
    type: String
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);