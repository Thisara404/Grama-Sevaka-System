const Emergency = require('../models/Emergency');
const mongoose = require('mongoose');

/**
 * @desc    Get emergency reports (GS officers only)
 * @route   GET /api/emergencies
 * @access  Private/GS
 */
exports.getEmergencies = async (req, res) => {
  try {
    const { status, type, severity, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.emergencyType = type;
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get emergencies
    const emergencies = await Emergency.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reporter', 'fullName phoneNumber')
      .populate('assignedTo', 'fullName');
    
    // Get total count
    const total = await Emergency.countDocuments(query);
    
    res.json({
      emergencies,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getEmergencies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Submit emergency report
 * @route   POST /api/emergencies
 * @access  Private
 */
exports.submitEmergency = async (req, res) => {
  try {
    const { emergencyType, title, description, address, coordinates } = req.body;
    
    // Validate coordinates format
    let parsedCoordinates;
    try {
      parsedCoordinates = JSON.parse(coordinates);
      if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
        throw new Error('Invalid coordinates format');
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid coordinates format. Must be [longitude, latitude]' });
    }
    
    // Create emergency report
    const emergency = new Emergency({
      reporter: req.user._id,
      emergencyType,
      title,
      description,
      location: {
        address,
        coordinates: {
          type: 'Point',
          coordinates: parsedCoordinates
        }
      },
      severity: req.body.severity || 'medium',
      status: 'reported'
    });
    
    // Process photos if any
    if (req.files && req.files.length > 0) {
      emergency.photos = req.files.map(file => file.path);
    }
    
    await emergency.save();
    
    res.status(201).json({
      message: 'Emergency report submitted successfully',
      emergencyId: emergency._id
    });
  } catch (error) {
    console.error('Error in submitEmergency:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get emergency report by ID
 * @route   GET /api/emergencies/:id
 * @access  Private
 */
exports.getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('reporter', 'fullName phoneNumber email')
      .populate('assignedTo', 'fullName')
      .populate('notes.addedBy', 'fullName role');
    
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency report not found' });
    }
    
    // Check permissions - only the reporter or GS officers can view details
    if (req.user.role !== 'gs' && emergency.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this emergency report' });
    }
    
    res.json(emergency);
  } catch (error) {
    console.error('Error in getEmergencyById:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid emergency ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update emergency status (GS officers only)
 * @route   PUT /api/emergencies/:id/status
 * @access  Private/GS
 */
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { status, notes, severity, assignedTo, investigationCompleted } = req.body;
    
    // Validate status
    const validStatuses = ['reported', 'in-progress', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const emergency = await Emergency.findById(req.params.id);
    
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency report not found' });
    }
    
    // Update emergency
    emergency.status = status;
    
    if (severity) {
      emergency.severity = severity;
    }
    
    if (assignedTo) {
      emergency.assignedTo = assignedTo;
    }
    
    // Add the investigation completed field if provided
    if (investigationCompleted !== undefined) {
      emergency.investigationCompleted = investigationCompleted;
    }
    
    // If status is changed to resolved, add resolution date
    if (status === 'resolved' && emergency.status !== 'resolved') {
      emergency.resolvedAt = new Date();
    }
    
    // Add note if provided
    if (notes) {
      emergency.notes.push({
        content: notes,
        addedBy: req.user._id
      });
    }
    
    await emergency.save();
    
    res.json({
      message: 'Emergency status updated successfully',
      emergency
    });
  } catch (error) {
    console.error('Error in updateEmergencyStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get emergency types
 * @route   GET /api/emergencies/types
 * @access  Public
 */
exports.getEmergencyTypes = async (req, res) => {
  try {
    const emergencyTypes = [
      { id: 'Natural Disaster', name: 'Natural Disaster' },
      { id: 'Fire', name: 'Fire Emergency' },
      { id: 'Medical Emergency', name: 'Medical Emergency' },
      { id: 'Crime', name: 'Crime/Security Incident' },
      { id: 'Infrastructure Issue', name: 'Infrastructure Issue' },
      { id: 'Public Disturbance', name: 'Public Disturbance' },
      { id: 'Environmental Hazard', name: 'Environmental Hazard' },
      { id: 'Other', name: 'Other Emergency' }
    ];
    
    res.json(emergencyTypes);
  } catch (error) {
    console.error('Error in getEmergencyTypes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get recent emergency reports
 * @route   GET /api/emergencies/recent
 * @access  Private
 */
exports.getRecentEmergencies = async (req, res) => {
  try {
    // Build query based on user role
    const query = { status: { $in: ['reported', 'in-progress'] } };
    
    // If user is citizen, only show public emergencies or their own reports
    if (req.user.role === 'citizen') {
      query.$or = [
        { reporter: req.user._id },
        // Add criteria for public emergencies if you have such a field
      ];
    }
    
    // Get recent emergencies
    const emergencies = await Emergency.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title emergencyType severity status location.address createdAt')
      .populate('reporter', 'fullName');
    
    res.json(emergencies);
  } catch (error) {
    console.error('Error in getRecentEmergencies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};