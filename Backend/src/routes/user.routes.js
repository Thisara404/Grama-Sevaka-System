const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getUserDocuments,
  uploadUserDocument,
  getUserRequests,
  getActivityHistory,
  getGSOfficers,
  changeUserStatus,
  verifyUserIdentity
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// User routes
router.get('/', protect, authorize('admin', 'gs'), getAllUsers);
router.get('/gs-officers', protect, authorize('admin', 'gs'), getGSOfficers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// User document routes
router.get('/profile/documents', protect, getUserDocuments);
router.post('/profile/documents', protect, upload.single('document'), uploadUserDocument);

// User requests
router.get('/profile/requests', protect, getUserRequests);

// Activity history
router.get('/profile/activity', protect, getActivityHistory);

// Change user status
router.put('/:id/status', protect, authorize('admin', 'gs'), changeUserStatus);

// Verify user identity
router.put('/:id/verify', protect, authorize('gs'), verifyUserIdentity);

module.exports = router;