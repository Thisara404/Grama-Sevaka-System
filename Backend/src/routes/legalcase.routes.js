const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  submitLegalCase, 
  getMyCases, 
  getAllCases, 
  updateCaseStatus,
  scheduleAppointment,
  cancelAppointment,
  getLegalCaseAppointments,
  downloadEvidence
} = require('../controllers/legalCase.controller');
const upload = require('../utils/fileUpload');

const router = express.Router();

// Citizen routes
router.post('/', protect, authorize('citizen'), upload.array('evidence', 5), submitLegalCase);
router.get('/my-cases', protect, authorize('citizen'), getMyCases);
router.put('/:id/appointment/cancel', protect, authorize('citizen'), cancelAppointment);

// GS Officer routes  
router.get('/', protect, authorize('gs'), getAllCases);
router.put('/:id/status', protect, authorize('gs'), updateCaseStatus);
router.put('/:id/appointment', protect, authorize('gs'), scheduleAppointment);
router.get('/appointments', protect, authorize('gs'), getLegalCaseAppointments);
router.post('/:id/evidence-download', protect, authorize('gs', 'admin'), downloadEvidence);

module.exports = router;