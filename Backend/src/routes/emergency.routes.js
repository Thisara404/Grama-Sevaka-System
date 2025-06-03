const express = require('express');
const router = express.Router();
const { 
  getEmergencies, 
  submitEmergency, 
  getEmergencyById,
  updateEmergencyStatus,
  getEmergencyTypes,
  getRecentEmergencies
} = require('../controllers/emergency.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Routes accessible to all authenticated users
router.get('/types', getEmergencyTypes);
router.get('/recent', protect, getRecentEmergencies);
router.get('/:id', protect, getEmergencyById);

// Routes for citizens
router.post('/', 
  protect, 
  upload.array('photos', 5), 
  submitEmergency
);

// Routes for GS officers
router.get('/', 
  protect, 
  authorize('gs'), 
  getEmergencies
);

router.put('/:id/status', 
  protect, 
  authorize('gs'), 
  updateEmergencyStatus
);

module.exports = router;