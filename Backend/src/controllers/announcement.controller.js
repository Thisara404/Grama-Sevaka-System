const Announcement = require('../models/Announcement');
const mongoose = require('mongoose');
const fs = require('fs');

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Public
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      priority, 
      active, 
      search, 
      audience 
    } = req.query;
    
    // Build query
    const query = {};
    
    // Only show active announcements by default
    if (active !== 'false') {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      
      // Only filter by endDate if isActive is true
      const endDateQuery = { $or: [{ endDate: null }, { endDate: { $gte: new Date() } }] };
      Object.assign(query, endDateQuery);
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (audience) {
      query.targetAudience = { $in: ['all', audience] };
    } else {
      // Default to showing announcements for all audiences
      query.targetAudience = { $in: ['all', 'citizens'] };
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get announcements with pagination
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'fullName')
      .populate('relatedLocation', 'name type')
      .select('-__v')
      .sort({ isPinned: -1, priority: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Announcement.countDocuments(query);
    
    res.json({
      announcements,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAnnouncements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get announcement by ID
 * @route   GET /api/announcements/:id
 * @access  Public
 */
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'fullName')
      .populate('relatedLocation', 'name type coordinates address');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Increment views counter
    await Announcement.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    res.json(announcement);
  } catch (error) {
    console.error('Error in getAnnouncementById:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid announcement ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get announcement categories with counts
 * @route   GET /api/announcements/categories
 * @access  Public
 */
exports.getAnnouncementCategories = async (req, res) => {
  try {
    const categories = await Announcement.aggregate([
      { 
        $match: { 
          isActive: true,
          startDate: { $lte: new Date() },
          $or: [{ endDate: null }, { endDate: { $gte: new Date() } }]
        } 
      },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    console.error('Error in getAnnouncementCategories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a new announcement (GS officers only)
 * @route   POST /api/announcements
 * @access  Private/GS
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      startDate,
      endDate,
      isActive,
      isPinned,
      targetAudience,
      relatedLocation
    } = req.body;
    
    // Create announcement
    const announcement = new Announcement({
      title,
      content,
      category,
      priority: priority || 'medium',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      isActive: isActive !== undefined ? isActive : true,
      isPinned: isPinned || false,
      targetAudience: targetAudience || 'all',
      relatedLocation: relatedLocation || null,
      createdBy: req.user._id
    });
    
    // Handle image upload
    if (req.file) {
      announcement.image = `/uploads/${req.file.filename}`;
    }
    
    await announcement.save();
    
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update an announcement (GS officers only)
 * @route   PUT /api/announcements/:id
 * @access  Private/GS
 */
exports.updateAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      startDate,
      endDate,
      isActive,
      isPinned,
      targetAudience,
      relatedLocation
    } = req.body;
    
    let announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Update announcement fields
    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.category = category || announcement.category;
    announcement.priority = priority || announcement.priority;
    announcement.startDate = startDate || announcement.startDate;
    announcement.endDate = endDate !== undefined ? endDate : announcement.endDate;
    announcement.isActive = isActive !== undefined ? isActive : announcement.isActive;
    announcement.isPinned = isPinned !== undefined ? isPinned : announcement.isPinned;
    announcement.targetAudience = targetAudience || announcement.targetAudience;
    announcement.relatedLocation = relatedLocation || announcement.relatedLocation;
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (announcement.image) {
        const oldImagePath = `${__dirname}/../../uploads/${announcement.image.split('/').pop()}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      announcement.image = `/uploads/${req.file.filename}`;
    }
    
    await announcement.save();
    
    res.json(announcement);
  } catch (error) {
    console.error('Error in updateAnnouncement:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid announcement ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete an announcement (GS officers only)
 * @route   DELETE /api/announcements/:id
 * @access  Private/GS
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Delete image file if exists
    if (announcement.image) {
      const imagePath = `${__dirname}/../../uploads/${announcement.image.split('/').pop()}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete any attachments
    if (announcement.attachments && announcement.attachments.length > 0) {
      announcement.attachments.forEach(attachment => {
        const attachmentPath = `${__dirname}/../../uploads/${attachment.split('/').pop()}`;
        if (fs.existsSync(attachmentPath)) {
          fs.unlinkSync(attachmentPath);
        }
      });
    }
    
    await announcement.remove();
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid announcement ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};