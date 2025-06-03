const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

/**
 * @desc    Search documents
 * @route   GET /api/documents
 * @access  Public
 */
exports.searchDocuments = async (req, res) => {
  try {
    const { search, type, department, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { isPublic: true };
    
    if (type) {
      query.type = type;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get documents
    const documents = await Document.find(query)
      .select('title type department description tags fileType fileSize uploadedBy createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'fullName');
    
    // Get total count
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in searchDocuments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get document types
 * @route   GET /api/documents/types
 * @access  Public
 */
exports.getDocumentTypes = async (req, res) => {
  try {
    // Get unique document types
    const types = await Document.distinct('type');
    res.json(types);
  } catch (error) {
    console.error('Error in getDocumentTypes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get departments
 * @route   GET /api/documents/departments
 * @access  Public
 */
exports.getDepartments = async (req, res) => {
  try {
    // Get unique departments
    const departments = await Document.distinct('department');
    res.json(departments);
  } catch (error) {
    console.error('Error in getDepartments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Public/Private (based on document visibility)
 */
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'fullName');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if document is public or user is authorized
    if (!document.isPublic && (!req.user || req.user.role !== 'gs')) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    // Increment download count
    document.downloads += 1;
    await document.save();
    
    res.json(document);
  } catch (error) {
    console.error('Error in getDocumentById:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Upload new document (GS officers only)
 * @route   POST /api/documents
 * @access  Private/GS
 */
exports.uploadNewDocument = async (req, res) => {
  try {
    const { title, type, department, description, tags, isPublic } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    // Create new document
    const document = new Document({
      title,
      type,
      department,
      description,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      isPublic: isPublic === 'true' || isPublic === true,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user._id
    });
    
    await document.save();
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error in uploadNewDocument:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update document (GS officers only)
 * @route   PUT /api/documents/:id
 * @access  Private/GS
 */
exports.updateDocument = async (req, res) => {
  try {
    const { title, type, department, description, tags, isPublic } = req.body;
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update document details
    document.title = title || document.title;
    document.type = type || document.type;
    document.department = department || document.department;
    document.description = description || document.description;
    document.isPublic = isPublic === 'true' || isPublic === true || document.isPublic;
    
    if (tags) {
      document.tags = tags.split(',').map(tag => tag.trim());
    }
    
    // If new file is uploaded, replace the old one
    if (req.file) {
      // Delete old file
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      
      document.filePath = req.file.path;
      document.fileType = req.file.mimetype;
      document.fileSize = req.file.size;
    }
    
    await document.save();
    
    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Error in updateDocument:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete document (GS officers only)
 * @route   DELETE /api/documents/:id
 * @access  Private/GS
 */
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};