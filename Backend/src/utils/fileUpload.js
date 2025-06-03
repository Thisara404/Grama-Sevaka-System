const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create legal-cases directory
const legalCasesDir = path.join(uploadDir, 'legal-cases');
if (!fs.existsSync(legalCasesDir)) {
  fs.mkdirSync(legalCasesDir, { recursive: true });
}

// Create user-documents directory
const userDocsDir = path.join(uploadDir, 'user-documents');
if (!fs.existsSync(userDocsDir)) {
  fs.mkdirSync(userDocsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine appropriate upload directory based on route or file field
    let uploadPath = uploadDir;
    
    // For legal case evidence
    if (file.fieldname === 'evidence') {
      uploadPath = legalCasesDir;
    } 
    // For user documents
    else if (file.fieldname === 'document') {
      uploadPath = userDocsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on field name
  let allowedTypes;
  
  if (file.fieldname === 'evidence' || file.fieldname === 'document') {
    // For legal evidence and user documents: PDF, images
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  } else if (file.fieldname === 'documents') {
    // For service request documents: PDF, images, doc
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  } else {
    // Default case for other uploads
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  }
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} files are allowed for ${file.fieldname}.`), false);
  }
};

// Create and export the multer instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;