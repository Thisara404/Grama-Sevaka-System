const express = require('express');
const router = express.Router();
const { 
  getServices, 
  getServiceById, 
  applyForService, 
  getServiceCategories, 
  getUserRequests, 
  submitAdditionalInfo 
} = require('../controllers/service.controller');
const { protect } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Public routes
router.get('/', getServices);
router.get('/categories', getServiceCategories);

// Protected routes
// Important: my-requests route MUST come before /:id route
router.get('/my-requests', protect, getUserRequests);
router.post('/apply', protect, upload.array('documents', 5), applyForService);
router.post('/requests/:id/additional-info', protect, upload.array('documents', 5), submitAdditionalInfo);

// This must come AFTER the more specific routes
router.get('/:id', getServiceById);

module.exports = router;