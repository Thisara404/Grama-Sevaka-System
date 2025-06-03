const express = require('express');
const router = express.Router();
const { 
  getDiscussions, 
  getDiscussionById, 
  createDiscussion, 
  getCategories,
  addReply,
  updateDiscussion,
  deleteDiscussion,
  markSolution,
  reportDiscussion,
  voteOnDiscussion,
  voteOnReply,
  updateReply,
  deleteReply,
  reportReply
} = require('../controllers/forum.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/discussions', getDiscussions);
router.get('/categories', getCategories);
router.get('/discussions/:id', getDiscussionById);

// Protected routes - citizen access
router.post('/discussions', protect, createDiscussion);
router.post('/discussions/:id/replies', protect, addReply);
router.put('/discussions/:id', protect, updateDiscussion);
router.delete('/discussions/:id', protect, deleteDiscussion);
router.put('/discussions/:id/replies/:replyId/solution', protect, markSolution);
router.post('/discussions/:id/report', protect, reportDiscussion);
router.post('/discussions/:id/vote', protect, voteOnDiscussion);
router.post('/replies/:id/vote', protect, voteOnReply);
router.put('/replies/:id', protect, updateReply);
router.delete('/replies/:id', protect, deleteReply);
router.post('/replies/:id/report', protect, reportReply);

// GS officer routes
router.put('/discussions/:id/status', 
  protect, 
  authorize('gs'), 
  updateDiscussion
);

module.exports = router;