const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: [true, 'Please specify service type'],
    enum: [
      'Birth Certificate',
      'Death Certificate',
      'Marriage Certificate',
      'Character Certificate',
      'Address Verification',
      'Land Issues',
      'Community Development',
      'General Inquiry',
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
      'General Administration'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Please specify appointment date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please specify time slot'],
    enum: [
      '09:00 - 09:30',
      '09:30 - 10:00',
      '10:00 - 10:30',
      '10:30 - 11:00',
      '11:00 - 11:30',
      '11:30 - 12:00',
      '13:00 - 13:30',
      '13:30 - 14:00',
      '14:00 - 14:30',
      '14:30 - 15:00',
      '15:00 - 15:30',
      '15:30 - 16:00'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of your appointment purpose'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  attachments: [
    {
      type: String
    }
  ],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent double booking for the same time slot
AppointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);