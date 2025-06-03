const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      username, 
      password, 
      fullName, 
      email, 
      phoneNumber, 
      nic, 
      role, 
      gsId, 
      address 
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [
        { email }, 
        { username }, 
        { nic },
        ...(gsId ? [{ gsId }] : [])
      ] 
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'User with these credentials already exists' });
    }

    // Validate GS ID if role is gs
    if (role === 'gs' && !gsId) {
      return res.status(400).json({ message: 'GS ID is required for Grama Sevaka officers' });
    }

    // Create user with proper account status
    const user = await User.create({
      username,
      password,
      fullName,
      email,
      phoneNumber,
      nic,
      role,
      gsId: role === 'gs' ? gsId : undefined,
      accountStatus: role === 'gs' ? 'pending' : 'active',
      address
    });

    // If user is a GS officer, return with pending status message
    if (user.role === 'gs') {
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        message: 'Your account has been created and is pending approval by an administrator.'
      });
    }

    // If citizen, return with token for automatic login
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Build query for finding user
    const query = { username };
    
    // Add role to query if specified
    if (role) {
      query.role = role;
    }

    // Check for user
    const user = await User.findOne(query);
    
    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // Check if account is pending approval
      if (user.accountStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Your account is pending approval by an administrator.',
          accountStatus: 'pending'
        });
      }

      // Check if account is suspended
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({ 
          message: 'Your account has been suspended. Please contact the administrator.',
          accountStatus: 'suspended'
        });
      }

      // User is valid and active
      res.json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, profilePicture } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;
      user.profilePicture = profilePicture || user.profilePicture;
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};