const express = require('express');
const router = express.Router();
const { 
  getLocations, 
  getLocationById, 
  filterLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getLocationTypes
} = require('../controllers/location.controller');
const { 
  registerLocation, 
  getMyLocations, 
  getAllResidences, 
  updateResidenceStatus 
} = require('../controllers/citizen.location.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Public routes
router.get('/', getLocations);
router.get('/filter', filterLocations);
router.get('/types', getLocationTypes);

// Citizen routes - these need to come BEFORE the /:id route to avoid conflicts
router.post('/register', 
  protect, 
  upload.single('image'), 
  registerLocation
);

router.get('/my-locations', 
  protect, 
  getMyLocations
);

// GS officer routes
router.get('/residences', 
  protect, 
  authorize('gs'), 
  getAllResidences
);

router.put('/residences/:id/status', 
  protect, 
  authorize('gs'), 
  updateResidenceStatus
);

// This route should come AFTER all specific routes with prefixes
router.get('/:id', getLocationById);

// GS officer only routes
router.post('/', 
  protect, 
  authorize('gs'), 
  upload.single('image'), 
  addLocation
);

router.put('/:id', 
  protect, 
  authorize('gs'), 
  upload.single('image'), 
  updateLocation
);

router.delete('/:id', 
  protect, 
  authorize('gs'), 
  deleteLocation
);

module.exports = router;