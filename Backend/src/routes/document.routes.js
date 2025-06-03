const express = require('express');
const router = express.Router();
const { 
  getDocuments, 
  getDocumentById, 
  getDocumentTypes, 
  getDepartments,
  searchDocuments,
  uploadNewDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/document.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Public routes for searching and retrieving documents
router.get('/', searchDocuments);
router.get('/types', getDocumentTypes);
router.get('/departments', getDepartments);
router.get('/:id', getDocumentById);

// GS officer only routes
router.post('/', 
  protect, 
  authorize('gs'), 
  upload.single('file'), 
  uploadNewDocument
);

router.put('/:id', 
  protect, 
  authorize('gs'), 
  upload.single('file'), 
  updateDocument
);

router.delete('/:id', 
  protect, 
  authorize('gs'), 
  deleteDocument
);

module.exports = router;