const ForumDiscussion = require('../models/ForumDiscussion');
const ForumReply = require('../models/ForumReply');
const mongoose = require('mongoose');

/**
 * @desc    Get forum discussions
 * @route   GET /api/forums/discussions
 * @access  Public
 */
exports.getDiscussions = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, sort = 'recent' } = req.query;
    
    // Build query
    const query = { status: { $ne: 'deleted' } };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default sort by recent
    
    if (sort === 'popular') {
      sortOption = { views: -1 };
    } else if (sort === 'most-replies') {
      // Sorting by reply count requires aggregation
      const discussionsWithReplyCounts = await ForumDiscussion.aggregate([
        { $match: query },
        { $addFields: { replyCount: { $size: "$replies" } } },
        { $sort: { replyCount: -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      ]);
      
      // Populate the author field
      await ForumDiscussion.populate(discussionsWithReplyCounts, { path: 'author', select: 'fullName' });
      
      const total = await ForumDiscussion.countDocuments(query);
      
      return res.json({
        discussions: discussionsWithReplyCounts,
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page)
      });
    }
    
    // Get discussions with regular sort
    const discussions = await ForumDiscussion.find(query)
      .sort(sortOption)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('title category author status tags views upvotes downvotes createdAt isPinned')
      .populate('author', 'fullName');
    
    // Get total count
    const total = await ForumDiscussion.countDocuments(query);
    
    // Calculate additional metrics
    const enrichedDiscussions = await Promise.all(discussions.map(async (discussion) => {
      const replyCount = await ForumReply.countDocuments({ discussion: discussion._id });
      const latestReply = await ForumReply.findOne({ discussion: discussion._id })
        .sort({ createdAt: -1 })
        .populate('author', 'fullName');
      
      return {
        ...discussion.toObject(),
        replyCount,
        latestReply: latestReply ? {
          author: latestReply.author.fullName,
          date: latestReply.createdAt
        } : null
      };
    }));
    
    res.json({
      discussions: enrichedDiscussions,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getDiscussions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get forum categories
 * @route   GET /api/forums/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    // Aggregate to get categories and their counts
    const categories = await ForumDiscussion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // If no discussions yet, return default categories
    if (categories.length === 0) {
      // These should match the enum values in your ForumDiscussion model
      const defaultCategories = [
        { _id: 'General Discussion', count: 0 },
        { _id: 'Service Request', count: 0 },
        { _id: 'Community Issue', count: 0 },
        { _id: 'Announcement', count: 0 },
        { _id: 'Emergency', count: 0 },
        { _id: 'Legal Matter', count: 0 },
        { _id: 'Infrastructure', count: 0 },
        { _id: 'Healthcare', count: 0 },
        { _id: 'Education', count: 0 },
        { _id: 'Environment', count: 0 }
      ];
      return res.json(defaultCategories);
    }

    res.json(categories);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get discussion by ID
 * @route   GET /api/forums/discussions/:id
 * @access  Public
 */
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await ForumDiscussion.findById(req.params.id)
      .populate('author', 'fullName')
      .populate('solutionReply')
      .populate('pinnedBy', 'fullName');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if discussion is deleted and hide it from regular users
    if (discussion.status === 'deleted' && (!req.user || req.user.role !== 'gs')) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Get replies
    const replies = await ForumReply.find({ 
      discussion: discussion._id,
      status: { $ne: 'deleted' }
    })
      .sort({ createdAt: 1 })
      .populate('author', 'fullName')
      .populate('parentReply');
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.json({
      discussion,
      replies
    });
  } catch (error) {
    console.error('Error in getDiscussionById:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid discussion ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a new discussion
 * @route   POST /api/forums/discussions
 * @access  Private
 */
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Create new discussion
    const discussion = new ForumDiscussion({
      title,
      content,
      category,
      author: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    await discussion.save();
    
    res.status(201).json({
      message: 'Discussion created successfully',
      discussionId: discussion._id
    });
  } catch (error) {
    console.error('Error in createDiscussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Add reply to a discussion
 * @route   POST /api/forums/discussions/:id/replies
 * @access  Private
 */
exports.addReply = async (req, res) => {
  try {
    const { content, parentReplyId } = req.body;
    
    const discussion = await ForumDiscussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if discussion is locked or deleted
    if (discussion.status === 'locked' || discussion.status === 'deleted') {
      return res.status(400).json({ 
        message: `Cannot reply to a ${discussion.status} discussion` 
      });
    }
    
    // Create new reply
    const reply = new ForumReply({
      discussion: discussion._id,
      content,
      author: req.user._id,
      parentReply: parentReplyId
    });
    
    await reply.save();
    
    // Add reply to discussion
    discussion.replies.push(reply._id);
    await discussion.save();
    
    res.status(201).json({
      message: 'Reply added successfully',
      replyId: reply._id
    });
  } catch (error) {
    console.error('Error in addReply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a discussion
 * @route   PUT /api/forums/discussions/:id
 * @access  Private
 */
exports.updateDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags, status, isPinned } = req.body;
    
    const discussion = await ForumDiscussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'gs' && discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this discussion' });
    }
    
    // Regular users can only update content, title, category, and tags
    if (req.user.role !== 'gs') {
      discussion.title = title || discussion.title;
      discussion.content = content || discussion.content;
      discussion.category = category || discussion.category;
      
      if (tags) {
        discussion.tags = tags.split(',').map(tag => tag.trim());
      }
    } else {
      // GS officers can update all fields
      if (title) discussion.title = title;
      if (content) discussion.content = content;
      if (category) discussion.category = category;
      if (tags) discussion.tags = tags.split(',').map(tag => tag.trim());
      
      // Only GS officers can update status and pinned state
      if (status) discussion.status = status;
      
      if (isPinned !== undefined) {
        discussion.isPinned = isPinned;
        discussion.pinnedBy = isPinned ? req.user._id : null;
      }
    }
    
    await discussion.save();
    
    res.json({
      message: 'Discussion updated successfully',
      discussion
    });
  } catch (error) {
    console.error('Error in updateDiscussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a discussion
 * @route   DELETE /api/forums/discussions/:id
 * @access  Private
 */
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await ForumDiscussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'gs' && discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }
    
    // Soft delete - change status to 'deleted'
    discussion.status = 'deleted';
    await discussion.save();
    
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDiscussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Mark a reply as solution
 * @route   PUT /api/forums/discussions/:id/replies/:replyId/solution
 * @access  Private
 */
exports.markSolution = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    
    const discussion = await ForumDiscussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check permissions - only discussion author or GS officers can mark solution
    if (req.user.role !== 'gs' && discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark solution' });
    }
    
    const reply = await ForumReply.findById(replyId);
    
    if (!reply || reply.discussion.toString() !== discussion._id.toString()) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Update discussion with solution reply
    discussion.solutionReply = reply._id;
    discussion.status = 'resolved';
    await discussion.save();
    
    // Update reply as solution
    reply.isSolution = true;
    await reply.save();
    
    res.json({
      message: 'Reply marked as solution',
      discussion,
      reply
    });
  } catch (error) {
    console.error('Error in markSolution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Report a discussion
 * @route   POST /api/forums/discussions/:id/report
 * @access  Private
 */
exports.reportDiscussion = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const discussion = await ForumDiscussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if user already reported this discussion
    const alreadyReported = discussion.reports.some(report => 
      report.reportedBy.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this discussion' });
    }
    
    // Add report
    discussion.reports.push({
      reportedBy: req.user._id,
      reason
    });
    
    // If this is the third report, automatically change status to 'reported'
    if (discussion.reports.length >= 3 && discussion.status !== 'reported') {
      discussion.status = 'reported';
    }
    
    await discussion.save();
    
    res.json({ message: 'Discussion reported successfully' });
  } catch (error) {
    console.error('Error in reportDiscussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Vote on a discussion
 * @route   POST /api/forums/discussions/:id/vote
 * @access  Private
 */
exports.voteOnDiscussion = async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const discussion = await ForumDiscussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const userId = req.user._id;
    
    // Remove previous votes by this user
    discussion.upvotes = discussion.upvotes.filter(id => id.toString() !== userId.toString());
    discussion.downvotes = discussion.downvotes.filter(id => id.toString() !== userId.toString());
    
    // Add new vote
    if (voteType === 'upvote') {
      discussion.upvotes.push(userId);
    } else {
      discussion.downvotes.push(userId);
    }
    
    await discussion.save();
    
    res.json({
      message: 'Vote recorded successfully',
      upvotes: discussion.upvotes.length,
      downvotes: discussion.downvotes.length
    });
  } catch (error) {
    console.error('Error in voteOnDiscussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Vote on a reply
 * @route   POST /api/forums/replies/:id/vote
 * @access  Private
 */
exports.voteOnReply = async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const reply = await ForumReply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    const userId = req.user._id;
    
    // Remove previous votes by this user
    reply.upvotes = reply.upvotes.filter(id => id.toString() !== userId.toString());
    reply.downvotes = reply.downvotes.filter(id => id.toString() !== userId.toString());
    
    // Add new vote
    if (voteType === 'upvote') {
      reply.upvotes.push(userId);
    } else {
      reply.downvotes.push(userId);
    }
    
    await reply.save();
    
    res.json({
      message: 'Vote recorded successfully',
      upvotes: reply.upvotes.length,
      downvotes: reply.downvotes.length
    });
  } catch (error) {
    console.error('Error in voteOnReply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a reply
 * @route   PUT /api/forums/replies/:id
 * @access  Private
 */
exports.updateReply = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const reply = await ForumReply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'gs' && reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this reply' });
    }
    
    reply.content = content;
    reply.isEdited = true;
    reply.editedAt = new Date();
    
    await reply.save();
    
    res.json({
      message: 'Reply updated successfully',
      reply
    });
  } catch (error) {
    console.error('Error in updateReply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a reply
 * @route   DELETE /api/forums/replies/:id
 * @access  Private
 */
exports.deleteReply = async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'gs' && reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }
    
    // Soft delete - change status to 'deleted'
    reply.status = 'deleted';
    await reply.save();
    
    // Remove from discussion replies array
    await ForumDiscussion.findByIdAndUpdate(
      reply.discussion,
      { $pull: { replies: reply._id } }
    );
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Report a reply
 * @route   POST /api/forums/replies/:id/report
 * @access  Private
 */
exports.reportReply = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const reply = await ForumReply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user already reported this reply
    const alreadyReported = reply.reports && reply.reports.some(report => 
      report.reportedBy.toString() === req.user._id.toString()
    );
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this reply' });
    }
    
    // Initialize reports array if it doesn't exist
    if (!reply.reports) {
      reply.reports = [];
    }
    
    // Add report
    reply.reports.push({
      reportedBy: req.user._id,
      reason
    });
    
    // If this is the third report, automatically change status to 'reported'
    if (reply.reports.length >= 3 && reply.status !== 'reported') {
      reply.status = 'reported';
    }
    
    await reply.save();
    
    res.json({ message: 'Reply reported successfully' });
  } catch (error) {
    console.error('Error in reportReply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};