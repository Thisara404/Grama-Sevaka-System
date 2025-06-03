const Location = require('../models/Location');
const mongoose = require('mongoose');
const fs = require('fs');

/**
 * @desc    Get all locations
 * @route   GET /api/locations
 * @access  Public
 */
exports.getLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get locations with pagination
    const locations = await Location.find()
      .select('name type coordinates address.street address.city image isVerified')
      .sort({ name: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Location.countDocuments();
    
    res.json({
      locations,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getLocations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get location by ID
 * @route   GET /api/locations/:id
 * @access  Public
 */
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('createdBy', 'fullName');
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error in getLocationById:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid location ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Filter locations by type
 * @route   GET /api/locations/filter
 * @access  Public
 */
exports.filterLocations = async (req, res) => {
  try {
    const { type, city, search, verified, status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (city) {
      query['address.city'] = city;
    }
    
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get locations
    const locations = await Location.find(query)
      .populate('createdBy', 'fullName')
      .select('name type coordinates address status isResidence image isVerified createdAt numberOfResidents createdBy notes')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Location.countDocuments(query);
    
    res.json({
      locations,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in filterLocations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get location types
 * @route   GET /api/locations/types
 * @access  Public
 */
exports.getLocationTypes = async (req, res) => {
  try {
    // Get unique location types with counts
    const types = await Location.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(types);
  } catch (error) {
    console.error('Error in getLocationTypes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Add a new location (GS officers only)
 * @route   POST /api/locations
 * @access  Private/GS
 */
exports.addLocation = async (req, res) => {
  try {
    const {
      name,
      type,
      coordinates,
      street,
      city,
      district,
      postalCode,
      description,
      contactInfo,
      operatingHours,
      features
    } = req.body;
    
    // Parse coordinates
    let parsedCoordinates;
    try {
      parsedCoordinates = Array.isArray(coordinates) 
        ? coordinates 
        : JSON.parse(coordinates);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid coordinates format' });
    }
    
    // Create location
    const location = new Location({
      name,
      type,
      coordinates: {
        type: 'Point',
        coordinates: parsedCoordinates
      },
      address: {
        street,
        city,
        district,
        postalCode
      },
      description,
      contactInfo: contactInfo ? JSON.parse(contactInfo) : {},
      operatingHours: operatingHours ? JSON.parse(operatingHours) : {},
      features: features ? features.split(',').map(f => f.trim()) : [],
      createdBy: req.user._id,
      isVerified: true // Set to true as a GS officer is creating it
    });
    
    // Handle image upload
    if (req.file) {
      location.image = `/uploads/${req.file.filename}`;
    }
    
    await location.save();
    
    res.status(201).json(location);
  } catch (error) {
    console.error('Error in addLocation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a location (GS officers only)
 * @route   PUT /api/locations/:id
 * @access  Private/GS
 */
exports.updateLocation = async (req, res) => {
  try {
    const {
      name,
      type,
      coordinates,
      street,
      city,
      district,
      postalCode,
      description,
      contactInfo,
      operatingHours,
      features,
      isVerified
    } = req.body;
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Parse coordinates if provided
    if (coordinates) {
      try {
        const parsedCoords = Array.isArray(coordinates) 
          ? coordinates 
          : JSON.parse(coordinates);
          
        location.coordinates = {
          type: 'Point',
          coordinates: parsedCoords
        };
      } catch (error) {
        return res.status(400).json({ message: 'Invalid coordinates format' });
      }
    }
    
    // Update fields
    location.name = name || location.name;
    location.type = type || location.type;
    location.description = description || location.description;
    
    // Update address if any field is provided
    if (street || city || district || postalCode) {
      location.address = {
        street: street || location.address.street,
        city: city || location.address.city,
        district: district || location.address.district,
        postalCode: postalCode || location.address.postalCode
      };
    }
    
    // Update contact info if provided
    if (contactInfo) {
      try {
        location.contactInfo = JSON.parse(contactInfo);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid contact info format' });
      }
    }
    
    // Update operating hours if provided
    if (operatingHours) {
      try {
        location.operatingHours = JSON.parse(operatingHours);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid operating hours format' });
      }
    }
    
    // Update features if provided
    if (features) {
      location.features = features.split(',').map(f => f.trim());
    }
    
    // Update verification status if provided
    if (isVerified !== undefined) {
      location.isVerified = isVerified === 'true';
    }
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (location.image) {
        const oldImagePath = `${__dirname}/../../uploads/${location.image.split('/').pop()}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      location.image = `/uploads/${req.file.filename}`;
    }
    
    await location.save();
    
    res.json(location);
  } catch (error) {
    console.error('Error in updateLocation:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid location ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a location (GS officers only)
 * @route   DELETE /api/locations/:id
 * @access  Private/GS
 */
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Delete image if exists
    if (location.image) {
      const imagePath = `${__dirname}/../../uploads/${location.image.split('/').pop()}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await location.remove();
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid location ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get my locations (Residences only)
 * @route   GET /api/locations/mine
 * @access  Private
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