const LegalCase = require('../models/LegalCase');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs'); // Add this line

/**
 * @desc    Submit a new legal case (Citizens only)
 * @route   POST /api/legal-cases
 * @access  Private/Citizen
 */
exports.submitLegalCase = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    let location = req.body.location;
    
    // Handle location data properly
    if (location) {
      // Check if location is already an object or a JSON string
      if (typeof location === 'string') {
        try {
          location = JSON.parse(location);
        } catch (err) {
          console.log('Error parsing location:', err);
          location = null;
        }
      }
    }
    
    // Process uploaded files if any
    const evidence = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        evidence.push({
          name: file.originalname,
          path: file.path,
          type: file.mimetype,
          uploadedAt: new Date()
        });
      });
    }
    
    // Generate a case number if needed
    const caseCount = await LegalCase.countDocuments();
    const caseNumber = `LC-${new Date().getFullYear()}-${(caseCount + 1).toString().padStart(4, '0')}`;
    
    // Create the legal case
    const newCase = await LegalCase.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      complainant: req.user._id,
      evidence,
      location: location || undefined,
      caseNumber // Add the generated case number
    });
    
    res.status(201).json({
      message: 'Legal case submitted successfully',
      case: newCase
    });
  } catch (error) {
    console.error('Error in submitLegalCase:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get legal cases for citizens (their own cases)
 * @route   GET /api/legal-cases/my-cases
 * @access  Private/Citizen
 */
exports.getMyCases = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { complainant: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const cases = await LegalCase.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('assignedTo', 'fullName')
      .select('-evidence.path'); // Don't expose file paths

    const total = await LegalCase.countDocuments(query);

    res.json({
      cases,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getMyCases:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all legal cases (GS officers only)
 * @route   GET /api/legal-cases
 * @access  Private/GS
 */
exports.getAllCases = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;

    const cases = await LegalCase.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('complainant', 'fullName email phoneNumber')
      .populate('assignedTo', 'fullName');

    const total = await LegalCase.countDocuments(query);

    res.json({
      cases,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAllCases:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update case status (GS officers only)
 * @route   PUT /api/legal-cases/:id/status
 * @access  Private/GS
 */
exports.updateCaseStatus = async (req, res) => {
  try {
    const { status, notes, priority } = req.body;
    
    const validStatuses = ['submitted', 'under-review', 'investigating', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const legalCase = await LegalCase.findById(req.params.id);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Legal case not found' });
    }

    // Update case
    legalCase.status = status;
    if (priority) legalCase.priority = priority;
    if (!legalCase.assignedTo) legalCase.assignedTo = req.user._id;

    // Add note if provided
    if (notes) {
      legalCase.notes.push({
        content: notes,
        addedBy: req.user._id,
        isPublic: true
      });
    }

    // Instead of directly updating the legalCase document, use findByIdAndUpdate
    // This avoids issues with the evidence field validation
    const updatedCase = await LegalCase.findByIdAndUpdate(
      req.params.id,
      {
        status,
        priority: priority || legalCase.priority,
        assignedTo: legalCase.assignedTo || req.user._id,
        $push: notes ? {
          notes: {
            content: notes,
            addedBy: req.user._id,
            isPublic: true
          }
        } : undefined
      },
      { new: true, runValidators: false }
    );

    res.json({
      message: 'Case status updated successfully',
      case: updatedCase
    });
  } catch (error) {
    console.error('Error in updateCaseStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Schedule appointment for a legal case
 * @route   PUT /api/legal-cases/:id/appointment
 * @access  Private/GS
 */
exports.scheduleAppointment = async (req, res) => {
  try {
    const { date, timeSlot, notes } = req.body;
    
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and time slot are required' });
    }

    const legalCase = await LegalCase.findById(req.params.id);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Legal case not found' });
    }

    // Use findByIdAndUpdate instead of direct document update
    const updatedCase = await LegalCase.findByIdAndUpdate(
      req.params.id,
      {
        appointment: {
          date: new Date(date),
          timeSlot,
          status: 'confirmed',
          notes: notes || ''
        },
        $push: {
          notes: {
            content: `Appointment scheduled for ${new Date(date).toLocaleDateString()} at ${timeSlot}. ${notes ? `Notes: ${notes}` : ''}`,
            addedBy: req.user._id,
            isPublic: true
          }
        },
        // Update status to under-review if still in submitted state
        status: legalCase.status === 'submitted' ? 'under-review' : legalCase.status
      },
      { new: true, runValidators: false }
    );

    res.json({
      message: 'Appointment scheduled successfully',
      appointment: updatedCase.appointment
    });
  } catch (error) {
    console.error('Error in scheduleAppointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Cancel appointment for a legal case
 * @route   PUT /api/legal-cases/:id/appointment/cancel
 * @access  Private
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const legalCase = await LegalCase.findById(req.params.id);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Legal case not found' });
    }

    if (!legalCase.appointment || !legalCase.appointment.date) {
      return res.status(400).json({ message: 'No appointment found for this case' });
    }

    // Check permission - only GS or the case owner can cancel
    if (req.user.role !== 'gs' && legalCase.complainant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Use findByIdAndUpdate instead of direct document update
    await LegalCase.findByIdAndUpdate(
      req.params.id,
      {
        'appointment.status': 'cancelled',
        $push: {
          notes: {
            content: `Appointment cancelled. ${reason ? `Reason: ${reason}` : ''}`,
            addedBy: req.user._id,
            isPublic: true
          }
        }
      },
      { runValidators: false }
    );

    res.json({
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all legal case appointments for calendar
 * @route   GET /api/legal-cases/appointments
 * @access  Private/GS
 */
exports.getLegalCaseAppointments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Create a proper query object
    const query = { 'appointment.date': {} };
    
    // Only add date constraints if they're provided
    if (startDate) {
      query['appointment.date'].$gte = new Date(startDate);
    }
    
    if (endDate) {
      query['appointment.date'].$lte = new Date(endDate);
    }
    
    // Only get cases with appointments and with correct status
    query['appointment.status'] = { $in: ['pending', 'confirmed'] };
    
    // This ensures we have both the appointment field and it's populated
    const finalQuery = {
      appointment: { $exists: true, $ne: null }
    };
    
    // Combine with date and status conditions if they exist
    if (startDate || endDate) {
      finalQuery['appointment.date'] = {};
      if (startDate) {
        finalQuery['appointment.date'].$gte = new Date(startDate);
      }
      if (endDate) {
        finalQuery['appointment.date'].$lte = new Date(endDate);
      }
    }
    
    finalQuery['appointment.status'] = { $in: ['pending', 'confirmed'] };
    
    const cases = await LegalCase.find(finalQuery)
      .select('title complainant appointment status priority caseNumber')
      .populate('complainant', 'fullName');
      
    const appointments = cases.map(caseItem => ({
      caseId: caseItem._id,
      caseNumber: caseItem.caseNumber,
      title: caseItem.title,
      complainant: caseItem.complainant ? caseItem.complainant.fullName : 'Unknown',
      date: caseItem.appointment.date,
      timeSlot: caseItem.appointment.timeSlot,
      status: caseItem.appointment.status,
      priority: caseItem.priority,
      caseStatus: caseItem.status
    }));
    
    res.json(appointments);
  } catch (error) {
    console.error('Error in getLegalCaseAppointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Download evidence file
 * @route   POST /api/legal-cases/:id/evidence-download
 * @access  Private/GS/Admin
 */
exports.downloadEvidence = async (req, res) => {
  try {
    const { filePath, evidenceId } = req.body;
    
    // Find the legal case
    const legalCase = await LegalCase.findById(req.params.id);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Legal case not found' });
    }
    
    // Check if the evidence exists on this case
    let evidenceExists = false;
    let evidenceFile = null;
    
    if (evidenceId) {
      // Try to find by ID
      const evidence = legalCase.evidence.find(e => e._id.toString() === evidenceId);
      if (evidence) {
        evidenceExists = true;
        evidenceFile = evidence;
      }
    }
    
    // If no specific evidence ID was provided, or if the ID check failed,
    // We can alternatively check if any evidence paths match
    if (!evidenceExists && filePath) {
      const evidence = legalCase.evidence.find(
        e => e.path === filePath || e.filePath === filePath
      );
      if (evidence) {
        evidenceExists = true;
        evidenceFile = evidence;
      }
    }
    
    if (!evidenceExists) {
      return res.status(404).json({ message: 'Evidence file not found in this case' });
    }
    
    // Determine the actual file path to use
    const actualFilePath = filePath || (evidenceFile && (evidenceFile.path || evidenceFile.filePath));
    
    if (!actualFilePath) {
      return res.status(404).json({ message: 'File path not found' });
    }
    
    // Check if file exists in filesystem
    if (!fs.existsSync(actualFilePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Determine filename for download
    const fileName = evidenceFile.name || evidenceFile.fileName || 'evidence-file';
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send the file
    fs.createReadStream(actualFilePath).pipe(res);
    
  } catch (error) {
    console.error('Error downloading evidence:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};