const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

/**
 * @desc    Get appointments for authenticated user or all (for GS)
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Build query based on user role
    const query = {};
    
    // If user is citizen, only show their appointments
    if (req.user.role === 'citizen') {
      query.user = req.user._id;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .sort({ date: 1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'fullName email phoneNumber');
    
    // Get total count
    const total = await Appointment.countDocuments(query);
    
    res.json({
      appointments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAppointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
exports.createAppointment = async (req, res) => {
  try {
    const { serviceType, department, date, timeSlot, description } = req.body;
    
    // Check if the slot is available
    const slotExists = await Appointment.findOne({
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    
    if (slotExists) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Create new appointment
    const appointment = new Appointment({
      user: req.user._id,
      serviceType,
      department,
      date: new Date(date),
      timeSlot,
      description,
      status: 'pending'
    });
    
    // Process attachments if any
    if (req.files && req.files.length > 0) {
      appointment.attachments = req.files.map(file => file.path);
    }
    
    await appointment.save();
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get available time slots for a specific date
 * @route   GET /api/appointments/slots
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    // Define all possible time slots
    const allTimeSlots = [
      '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
      '11:00 - 11:30', '11:30 - 12:00', '13:00 - 13:30', '13:30 - 14:00',
      '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30', '15:30 - 16:00'
    ];
    
    // Convert date string to Date object
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get booked slots for the date
    const bookedAppointments = await Appointment.find({
      date: {
        $gte: targetDate,
        $lte: endDate
      },
      status: { $ne: 'cancelled' }
    }).select('timeSlot');
    
    const bookedSlots = bookedAppointments.map(appointment => appointment.timeSlot);
    
    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({ 
      date: targetDate.toISOString().split('T')[0],
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get appointment departments
 * @route   GET /api/appointments/departments
 * @access  Public
 */
exports.getDepartments = async (req, res) => {
  try {
    // You can define these departmentss in the DB or return a static list
    const departments = [
      { id: 'Registration', name: 'Registration Department' },
      { id: 'Certification', name: 'Certification Department' },
      { id: 'Land Administration', name: 'Land Administration Department' },
      { id: 'Community Services', name: 'Community Services Department' },
      { id: 'General Administration', name: 'General Administration Department' }
    ];
    
    res.json(departments);
  } catch (error) {
    console.error('Error in getDepartments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get appointment service types
 * @route   GET /api/appointments/services
 * @access  Public
 */
exports.getServiceTypes = async (req, res) => {
  try {
    // You can define these service types in the DB or return a static list
    const serviceTypes = [
      { id: 'Birth Certificate', name: 'Birth Certificate' },
      { id: 'Death Certificate', name: 'Death Certificate' },
      { id: 'Marriage Certificate', name: 'Marriage Certificate' },
      { id: 'Character Certificate', name: 'Character Certificate' },
      { id: 'Address Verification', name: 'Address Verification' },
      { id: 'Land Issues', name: 'Land Issues' },
      { id: 'Community Development', name: 'Community Development' },
      { id: 'General Inquiry', name: 'General Inquiry' },
      { id: 'Other', name: 'Other Services' }
    ];
    
    res.json(serviceTypes);
  } catch (error) {
    console.error('Error in getServiceTypes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'fullName email phoneNumber');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check permissions - only the appointment owner or GS officers can view
    if (req.user.role !== 'gs' && appointment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error in getAppointmentById:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update appointment status (for GS officers)
 * @route   PUT /api/appointments/:id/status
 * @access  Private/GS
 */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update the appointment
    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }
    
    await appointment.save();
    
    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Cancel an appointment (for users)
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check permissions - only the appointment owner can cancel
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    
    // Check if appointment date is in the past
    const appointmentDate = new Date(appointment.date);
    if (appointmentDate < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past appointments' });
    }
    
    // Update status to cancelled
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};