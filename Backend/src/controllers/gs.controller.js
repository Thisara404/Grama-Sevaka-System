const ServiceRequest = require('../models/ServiceRequest');
const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Announcement = require('../models/Announcement');
const Service = require('../models/Service');

/**
 * @desc    Get dashboard statistics for GS officers
 * @route   GET /api/gs/dashboard
 * @access  Private/GS
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for dashboard
    const pendingRequests = await ServiceRequest.countDocuments({ status: 'pending' });
    const emergencies = await Emergency.countDocuments({ status: 'reported' });
    const todayAppointments = await Appointment.countDocuments({ 
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59))
      }
    });
    const citizenCount = await User.countDocuments({ role: 'citizen' });
    
    // Get recent service requests
    const recentRequests = await ServiceRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName')
      .populate('service', 'name');
    
    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      date: { $gte: new Date() },
      status: 'confirmed'
    })
      .sort({ date: 1 })
      .limit(5)
      .populate('user', 'fullName');
    
    // Get emergency reports
    const emergencyReports = await Emergency.find({ status: { $in: ['reported', 'in-progress'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reporter', 'fullName');

    res.json({
      stats: {
        pendingRequests,
        emergencies,
        todayAppointments,
        citizenCount
      },
      recentRequests,
      upcomingAppointments,
      emergencyReports
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get pending service request approvals
 * @route   GET /api/gs/pending-approvals
 * @access  Private/GS
 */
exports.getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status = 'pending' } = req.query;
    
    // Build query
    const query = { status };
    
    if (search) {
      query.$or = [
        { requestNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get service requests
    const requests = await ServiceRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'fullName nic email phoneNumber')
      .populate('service', 'name category');
    
    // Get total count
    const total = await ServiceRequest.countDocuments(query);
    
    res.json({
      requests,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getPendingApprovals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Approve a service request
 * @route   PUT /api/gs/requests/:id/approve
 * @access  Private/GS
 */
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, completionDate, issueDate } = req.body;
    
    const request = await ServiceRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Update the request
    request.status = 'approved';
    request.assignedTo = req.user._id;
    request.completionDate = completionDate;
    request.issueDate = issueDate;
    
    // Add note if provided
    if (notes) {
      request.notes.push({
        content: notes,
        addedBy: req.user._id,
        isPublic: true
      });
    }
    
    await request.save();
    
    res.json({ message: 'Service request approved successfully', request });
  } catch (error) {
    console.error('Error in approveRequest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Reject a service request
 * @route   PUT /api/gs/requests/:id/reject
 * @access  Private/GS
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const request = await ServiceRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Update the request
    request.status = 'rejected';
    request.assignedTo = req.user._id;
    
    // Add rejection reason as a note
    request.notes.push({
      content: reason,
      addedBy: req.user._id,
      isPublic: true
    });
    
    await request.save();
    
    res.json({ message: 'Service request rejected', request });
  } catch (error) {
    console.error('Error in rejectRequest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Request additional information for a service request
 * @route   PUT /api/gs/requests/:id/request-info
 * @access  Private/GS
 */
exports.requestAdditionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { information } = req.body;
    
    if (!information) {
      return res.status(400).json({ message: 'Information request details are required' });
    }
    
    const request = await ServiceRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Update the request
    request.status = 'additional-info-required';
    request.assignedTo = req.user._id;
    
    // Add information request as a note
    request.notes.push({
      content: information,
      addedBy: req.user._id,
      isPublic: true
    });
    
    await request.save();
    
    res.json({ message: 'Additional information requested', request });
  } catch (error) {
    console.error('Error in requestAdditionalInfo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update service request status
 * @route   PUT /api/gs/requests/:id/status
 * @access  Private/GS
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'in-review', 'approved', 'rejected', 'completed', 'additional-info-required'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    const request = await ServiceRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Update the request status
    request.status = status;
    
    // If not already assigned, assign to current GS officer
    if (!request.assignedTo) {
      request.assignedTo = req.user._id;
    }
    
    await request.save();
    
    res.json({ message: 'Service request status updated successfully', request });
  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all services (GS management view)
 * @route   GET /api/gs/services
 * @access  Private/GS
 */
exports.getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, active, category, search } = req.query;
    
    // Build query
    const query = {};
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get services
    const services = await Service.find(query)
      .sort({ category: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Service.countDocuments(query);
    
    res.json({
      services,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getServices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/gs/services
 * @access  Private/GS
 */
exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      codePrefix,
      processingTime,
      fees,
      requiredDocuments,
      eligibilityCriteria,
      instructions,
      relatedForms,
      icon,
      isActive
    } = req.body;
    
    // Check if service with same name exists
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }
    
    // Create new service
    const service = new Service({
      name,
      description,
      category,
      codePrefix: codePrefix || name.substring(0, 3).toUpperCase(),
      processingTime,
      fees: typeof fees === 'string' ? JSON.parse(fees) : fees,
      requiredDocuments: typeof requiredDocuments === 'string' ? JSON.parse(requiredDocuments) : requiredDocuments,
      eligibilityCriteria,
      instructions,
      relatedForms,
      icon,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await service.save();
    
    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error in createService:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/gs/services/:id
 * @access  Private/GS
 */
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update fields
    const updateFields = [
      'name', 'description', 'category', 'processingTime', 
      'fees', 'requiredDocuments', 'eligibilityCriteria', 
      'instructions', 'relatedForms', 'icon', 'isActive'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });
    
    await service.save();
    
    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Error in updateService:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/gs/services/:id
 * @access  Private/GS
 */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if there are any pending service requests using this service
    const pendingRequests = await ServiceRequest.countDocuments({ 
      service: req.params.id,
      status: { $in: ['pending', 'in-review', 'additional-info-required'] }
    });
    
    if (pendingRequests > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with pending requests. Mark it as inactive instead.' 
      });
    }
    
    await service.remove();
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in deleteService:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};