const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @desc    Get pending GS officer registrations
 * @route   GET /api/admin/pending-accounts
 * @access  Private/Admin
 */
exports.getPendingAccounts = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      role: 'gs', 
      accountStatus: 'pending' 
    }).select('-password');
    
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error in getPendingAccounts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Approve a GS officer account
 * @route   PUT /api/admin/approve-account/:id
 * @access  Private/Admin
 */
exports.approveAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'gs') {
      return res.status(400).json({ message: 'Only GS officer accounts can be approved' });
    }
    
    if (user.accountStatus !== 'pending') {
      return res.status(400).json({ message: 'This account is not pending approval' });
    }
    
    user.accountStatus = 'active';
    user.verificationDate = Date.now();
    user.verifiedBy = req.user._id;
    
    await user.save();
    
    res.json({ 
      message: 'Account approved successfully',
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Error in approveAccount:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Reject a GS officer account
 * @route   PUT /api/admin/reject-account/:id
 * @access  Private/Admin
 */
exports.rejectAccount = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Please provide a reason for rejection' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'gs') {
      return res.status(400).json({ message: 'Only GS officer accounts can be rejected' });
    }
    
    if (user.accountStatus !== 'pending') {
      return res.status(400).json({ message: 'This account is not pending approval' });
    }
    
    // Delete the user or mark as rejected based on your requirements
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Account rejected successfully',
      reason
    });
  } catch (error) {
    console.error('Error in rejectAccount:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
