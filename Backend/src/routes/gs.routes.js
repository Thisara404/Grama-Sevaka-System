const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getPendingApprovals, 
  approveRequest, 
  rejectRequest,
  updateRequestStatus,
  requestAdditionalInfo,
  // Add these for service management
  getServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/gs.controller');
const { protect, authorize, checkActive } = require('../middleware/auth');

// All routes need GS officer role and active status
router.use(protect, authorize('gs'), checkActive);

// Dashboard and approvals
router.get('/dashboard', getDashboardStats);
router.get('/pending-approvals', getPendingApprovals);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);
router.put('/requests/:id/status', updateRequestStatus);
router.put('/requests/:id/request-info', requestAdditionalInfo);

// Service management routes
router.get('/services', getServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

module.exports = router;