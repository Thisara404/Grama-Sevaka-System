const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Document = require('../models/Document');
const mongoose = require('mongoose');
const fs = require('fs');

/**
 * @desc    Get all users (GS officers only)
 * @route   GET /api/users
 * @access  Private/GS
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user by ID (GS officers only)
 * @route   GET /api/users/:id
 * @access  Private/GS
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update user (GS officers only)
 * @route   PUT /api/users/:id
 * @access  Private/GS
 */
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    
    // Only admins can change roles
    if (role && req.user.role === 'gs') {
      user.role = role;
    }
    
    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      address: user.address,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete user (GS officers only)
 * @route   DELETE /api/users/:id
 * @access  Private/GS
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user is also a GS officer
    if (user.role === 'gs') {
      return res.status(403).json({ message: 'Cannot delete GS officer accounts' });
    }
    
    // Delete profile picture if exists
    if (user.profilePicture) {
      const imagePath = `${__dirname}/../../uploads/${user.profilePicture.split('/').pop()}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await user.remove();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user documents
 * @route   GET /api/users/profile/documents
 * @access  Private
 */
exports.getUserDocuments = async (req, res) => {
  try {
    // Find documents where the user is the owner
    const documents = await Document.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error in getUserDocuments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Upload user document
 * @route   POST /api/users/profile/documents
 * @access  Private
 */
exports.uploadUserDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const {
      title,
      type,
      description,
      isPublic = false
    } = req.body;
    
    // Create document
    const document = new Document({
      title,
      type,
      department: 'General Administration', // Default department for user uploads
      description,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      isPublic: isPublic === 'true',
      uploadedBy: req.user._id
    });
    
    await document.save();
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error in uploadUserDocument:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user service requests
 * @route   GET /api/users/profile/requests
 * @access  Private
 */
exports.getUserRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    // Get requests with pagination
    const requests = await ServiceRequest.find(query)
      .populate('service', 'name category')
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await ServiceRequest.countDocuments(query);
    
    res.json({
      requests,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getUserRequests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user activity history
 * @route   GET /api/users/profile/activity
 * @access  Private
 */
exports.getActivityHistory = async (req, res) => {
  try {
    // Get recent service requests
    const serviceRequests = await ServiceRequest.find({ user: req.user._id })
      .populate('service', 'name category')
      .select('service status createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);
    
    // Get recent document uploads
    const documents = await Document.find({ uploadedBy: req.user._id })
      .select('title type createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Combine and sort activities
    const activities = [
      ...serviceRequests.map(req => ({
        type: 'service_request',
        title: req.service.name,
        category: req.service.category,
        status: req.status,
        date: req.updatedAt || req.createdAt,
        id: req._id
      })),
      ...documents.map(doc => ({
        type: 'document_upload',
        title: doc.title,
        category: doc.type,
        date: doc.createdAt,
        id: doc._id
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 20);
    
    res.json(activities);
  } catch (error) {
    console.error('Error in getActivityHistory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all GS officers
 * @route   GET /api/users/gs-officers
 * @access  Private/GS
 */
exports.getGSOfficers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const officers = await User.find({ 
      role: 'gs',
      accountStatus: 'active'
    })
      .select('-password')
      .sort({ fullName: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await User.countDocuments({ 
      role: 'gs',
      accountStatus: 'active'
    });
    
    res.json({
      officers,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getGSOfficers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Change user status (active, suspended)
 * @route   PUT /api/users/:id/status
 * @access  Private/GS
 */
exports.changeUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent GS officers from changing other GS officer accounts
    if (user.role === 'gs' && req.user.role === 'gs') {
      return res.status(403).json({ message: 'You do not have permission to modify another GS officer account' });
    }
    
    user.accountStatus = status;
    await user.save();
    
    res.json({
      message: `User status changed to ${status} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Error in changeUserStatus:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Verify user's identity (NIC verification)
 * @route   PUT /api/users/:id/verify
 * @access  Private/GS
 */
exports.verifyUserIdentity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'citizen') {
      return res.status(400).json({ message: 'Only citizen accounts can be verified this way' });
    }
    
    user.verificationDate = Date.now();
    user.verifiedBy = req.user._id;
    await user.save();
    
    res.json({
      message: 'User identity verified successfully',
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Error in verifyUserIdentity:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};