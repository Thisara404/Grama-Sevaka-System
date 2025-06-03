const Location = require('../models/Location');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Register a new residence location
 * @route   POST /api/locations/register
 * @access  Private (Citizen)
 */
exports.registerLocation = async (req, res) => {
  try {
    const {
      name,
      numberOfResidents,
      coordinates,
      address
    } = req.body;
    
    // Parse coordinates
    let parsedCoordinates;
    try {
      parsedCoordinates = Array.isArray(coordinates) ? coordinates : JSON.parse(coordinates);
      if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
        throw new Error('Invalid coordinates format');
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid coordinates format. Must be [longitude, latitude]' });
    }
    
    // Create the location
    const location = new Location({
      name,
      // Use an allowed type value from the enum in the model
      type: 'Residential Area', 
      coordinates: {
        type: 'Point',
        coordinates: parsedCoordinates
      },
      address: {
        // Make sure to populate all required address fields
        street: address || 'Street Address',
        city: 'City',
        district: 'District',
        postalCode: ''
      },
      description: `Residence with ${numberOfResidents} resident(s)`,
      numberOfResidents: Number(numberOfResidents) || 1,
      createdBy: req.user._id,
      isResidence: true,
      status: 'pending',
      isVerified: false
    });
    
    // Handle image upload
    if (req.file) {
      location.image = `/uploads/${req.file.filename}`;
    }
    
    await location.save();
    
    res.status(201).json(location);
  } catch (error) {
    console.error('Error in registerLocation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user's registered locations
 * @route   GET /api/locations/my-locations
 * @access  Private (Citizen)
 */
exports.getMyLocations = async (req, res) => {
  try {
    const locations = await Location.find({
      createdBy: req.user._id,
      isResidence: true
    }).sort({ createdAt: -1 });
    
    res.json(locations);
  } catch (error) {
    console.error('Error in getMyLocations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all residence locations (for GS officer)
 * @route   GET /api/locations/residences
 * @access  Private (GS Officer)
 */
exports.getAllResidences = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = { isResidence: true };
    
    if (status && ['pending', 'confirmed', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    const locations = await Location.find(query)
      .populate('createdBy', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json(locations);
  } catch (error) {
    console.error('Error in getAllResidences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update residence status (confirm/reject)
 * @route   PUT /api/locations/residences/:id/status
 * @access  Private (GS Officer)
 */
exports.updateResidenceStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    if (!location.isResidence) {
      return res.status(400).json({ message: 'This is not a residence location' });
    }
    
    location.status = status;
    location.isVerified = status === 'confirmed';
    
    if (notes) {
      location.notes = notes;
    }
    
    await location.save();
    
    res.json(location);
  } catch (error) {
    console.error('Error in updateResidenceStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};