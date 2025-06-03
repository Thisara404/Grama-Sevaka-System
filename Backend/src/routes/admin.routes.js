const express = require('express');
const router = express.Router();
const { 
  getPendingAccounts,
  approveAccount, 
  rejectAccount 
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes require GS officer role
router.use(protect, authorize('gs'));

router.get('/pending-accounts', getPendingAccounts);
router.put('/approve-account/:id', approveAccount);
router.put('/reject-account/:id', rejectAccount);

module.exports = router;