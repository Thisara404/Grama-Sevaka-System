const express = require('express');
const router = express.Router();
const { 
  getAnnouncements, 
  getAnnouncementById, 
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementCategories
} = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Public routes
router.get('/', getAnnouncements);
router.get('/categories', getAnnouncementCategories);
router.get('/:id', getAnnouncementById);

// GS officer only routes
router.post('/', 
  protect, 
  authorize('gs'), 
  upload.single('image'), 
  createAnnouncement
);

router.put('/:id', 
  protect, 
  authorize('gs'), 
  upload.single('image'), 
  updateAnnouncement
);

router.delete('/:id', 
  protect, 
  authorize('gs'), 
  deleteAnnouncement
);

module.exports = router;