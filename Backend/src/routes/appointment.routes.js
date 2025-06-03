const express = require('express');
const router = express.Router();
const { 
  getAppointments, 
  createAppointment, 
  getAvailableSlots, 
  getDepartments, 
  getServiceTypes,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/slots', getAvailableSlots);
router.get('/departments', getDepartments);
router.get('/services', getServiceTypes);

// Protected routes - citizen access
router.get('/', protect, getAppointments);
router.post('/', protect, createAppointment);
router.get('/:id', protect, getAppointmentById);
router.delete('/:id', protect, cancelAppointment);

// GS officer only routes
router.put('/:id/status', protect, authorize('gs'), updateAppointmentStatus);

module.exports = router;