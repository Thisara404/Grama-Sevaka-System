const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const mongoose = require('mongoose');
const path = require('path');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, active } = req.query;
    
    // Build the query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get services
    const services = await Service.find(query)
      .select('name description category icon processingTime isActive')
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
 * @desc    Get service categories
 * @route   GET /api/services/categories
 * @access  Public
 */
exports.getServiceCategories = async (req, res) => {
  try {
    // Get unique categories and count of services in each
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    console.error('Error in getServiceCategories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('relatedForms');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error in getServiceById:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Apply for a service
 * @route   POST /api/services/apply
 * @access  Private
 */
exports.applyForService = async (req, res) => {
  try {
    const { serviceId, additionalInfo, serviceSpecificData } = req.body;
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Process uploaded documents
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          name: file.originalname,
          path: file.path,
          mimeType: file.mimetype,
          uploadDate: new Date()
        });
      });
    }
    
    // Parse service-specific data if provided
    let parsedServiceData = {};
    if (serviceSpecificData) {
      try {
        // If serviceSpecificData is a string, try to parse it as JSON
        parsedServiceData = typeof serviceSpecificData === 'string' 
          ? JSON.parse(serviceSpecificData)
          : serviceSpecificData;
      } catch (parseError) {
        console.error('Error parsing service-specific data:', parseError);
        return res.status(400).json({ message: 'Invalid service-specific data format' });
      }
    }
    
    // Generate request number (since the pre-save hook is not working)
    const year = new Date().getFullYear().toString().substr(-2);
    const latestRequest = await ServiceRequest.findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    let nextNumber = '0001';
    if (latestRequest && latestRequest.requestNumber) {
      // Extract the numeric part and increment
      const currentNumber = parseInt(latestRequest.requestNumber.substr(-4));
      nextNumber = (currentNumber + 1).toString().padStart(4, '0');
    }
    
    const prefix = service.codePrefix || 'GEN';
    const requestNumber = `GS-${year}-${prefix}-${nextNumber}`;
    
    // Create service request with the manually generated requestNumber
    const serviceRequest = new ServiceRequest({
      user: req.user._id,
      service: serviceId,
      additionalInfo: additionalInfo || '',
      documents,
      serviceSpecificData: parsedServiceData,
      requestNumber // Add the generated request number here
    });
    
    await serviceRequest.save();
    
    res.status(201).json({ 
      message: 'Service request submitted successfully',
      requestNumber: serviceRequest.requestNumber,
      requestId: serviceRequest._id
    });
  } catch (error) {
    console.error('Error in applyForService:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a new service (GS officer only)
 * @route   POST /api/services
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
      codePrefix,
      processingTime,
      fees,
      requiredDocuments,
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a service (GS officer only)
 * @route   PUT /api/services/:id
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
    
    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error in updateService:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user service requests
 * @route   GET /api/services/my-requests
 * @access  Private
 */
exports.getUserRequests = async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    
    // Find all service requests for this user
    const requests = await ServiceRequest.find({ user: userId })
      .populate('service', 'name category icon')
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error in getUserRequests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Submit additional information for a service request
 * @route   POST /api/services/requests/:id/additional-info
 * @access  Private
 */
exports.submitAdditionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalInfo } = req.body;
    
    if (!additionalInfo) {
      return res.status(400).json({ message: 'Additional information is required' });
    }
    
    // Find the service request
    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Check if the request belongs to the user
    if (serviceRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this request' });
    }
    
    // Update request status
    serviceRequest.status = 'in-review';
    
    // Add the additional info as a note
    serviceRequest.notes.push({
      content: additionalInfo,
      addedBy: req.user._id,
      isPublic: true
    });
    
    // Add any uploaded documents
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        serviceRequest.documents.push({
          name: file.originalname,
          path: file.path,
          mimeType: file.mimetype,
          uploadDate: new Date()
        });
      });
    }
    
    await serviceRequest.save();
    
    res.json({
      message: 'Additional information submitted successfully',
      requestId: serviceRequest._id,
      status: serviceRequest.status
    });
  } catch (error) {
    console.error('Error in submitAdditionalInfo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};