const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

const services = [
  {
    name: 'Birth Certificate',
    description: 'Application for obtaining a certified copy of birth certificate',
    category: 'Certificates',
    processingTime: '5-7 working days',
    fees: {
      amount: 500,
      currency: 'LKR'
    },
    requiredDocuments: [
      {
        name: 'Parent\'s National Identity Card (Copy)',
        description: 'Clear copy of both parents\' NICs',
        required: true
      },
      {
        name: 'Hospital Birth Certificate',
        description: 'Original or certified copy from hospital',
        required: true
      },
      {
        name: 'Marriage Certificate (if applicable)',
        description: 'Parents\' marriage certificate',
        required: false      }
    ],
    instructions: "1. Fill out the application form completely\n2. Attach all required documents\n3. Submit the application with applicable fees\n4. Collect the certificate after processing",
    codePrefix: 'BC',
    isActive: true,
    icon: 'document-text'
  },
  {
    name: 'Death Certificate',
    description: 'Application for obtaining a certified copy of death certificate',
    category: 'Certificates',
    processingTime: '3-5 working days',
    fees: {
      amount: 500,
      currency: 'LKR'
    },
    requiredDocuments: [
      {
        name: 'Deceased Person\'s National Identity Card',
        description: 'Copy of the deceased person\'s NIC',
        required: true
      },
      {
        name: 'Medical Certificate of Death',
        description: 'Original medical certificate from hospital/doctor',
        required: true
      },
      {
        name: 'Informant\'s Identity Document',
        description: 'NIC of the person making the application',
        required: true
      }
    ],    instructions: "1. Application must be made by a family member or authorized person\n2. Provide complete details of the deceased\n3. Submit all required medical documentation\n4. Pay the applicable processing fee",
    codePrefix: 'DC',
    isActive: true,
    icon: 'document-text'
  },
  {
    name: 'Marriage Certificate',
    description: 'Application for obtaining a certified copy of marriage certificate',
    category: 'Certificates',
    processingTime: '5-7 working days',
    fees: {
      amount: 750,
      currency: 'LKR'
    },
    requiredDocuments: [
      {
        name: 'Husband\'s National Identity Card',
        description: 'Copy of husband\'s NIC',
        required: true
      },
      {
        name: 'Wife\'s National Identity Card',
        description: 'Copy of wife\'s NIC',
        required: true
      },
      {
        name: 'Marriage Registration Certificate',
        description: 'Original marriage registration from registrar',
        required: true
      },
      {
        name: 'Witnesses\' Signatures',
        description: 'Signatures of two witnesses present at marriage',
        required: false
      }
    ],    instructions: "1. Application can be made by either spouse\n2. Provide marriage registration details\n3. Include witness information if available\n4. Submit with applicable processing fees",
    codePrefix: 'MC',
    isActive: true,
    icon: 'heart'
  },
  {
    name: 'Character Certificate',
    description: 'Certificate of good conduct and character verification',
    category: 'Certificates',
    processingTime: '7-10 working days',
    fees: {
      amount: 300,
      currency: 'LKR'
    },
    requiredDocuments: [
      {
        name: 'National Identity Card',
        description: 'Copy of applicant\'s NIC',
        required: true
      },
      {
        name: 'Grama Sevaka Recommendation',
        description: 'Letter of recommendation from local Grama Sevaka',
        required: true
      },
      {
        name: 'Police Report',
        description: 'Character certificate from local police station',
        required: true
      },
      {
        name: 'Employment Letter',
        description: 'Letter from current employer (if employed)',
        required: false
      }
    ],    instructions: "1. Obtain police character certificate first\n2. Get recommendation from local Grama Sevaka\n3. Provide employment details if applicable\n4. State the purpose for which certificate is required",
    codePrefix: 'CC',
    isActive: true,
    icon: 'shield-check'
  },
  {
    name: 'Address Verification',
    description: 'Verification of residential address and residence certificate',
    category: 'Verifications',
    processingTime: '3-5 working days',
    fees: {
      amount: 200,
      currency: 'LKR'
    },
    requiredDocuments: [
      {
        name: 'National Identity Card',
        description: 'Copy of applicant\'s NIC',
        required: true
      },
      {
        name: 'Utility Bills',
        description: 'Recent electricity, water, or telephone bills',
        required: true
      },
      {
        name: 'Lease Agreement',
        description: 'Rental agreement or property ownership documents',
        required: false
      },
      {
        name: 'Family Members\' Details',
        description: 'List of family members residing at the address',
        required: true
      }
    ],    instructions: "1. Provide current residential address details\n2. Include recent utility bills as proof\n3. List all family members living at the address\n4. Grama Sevaka will conduct verification visit",
    codePrefix: 'AV',
    isActive: true,
    icon: 'map-pin'
  },
  {
    name: 'Land Registration',
    description: 'Registration and transfer of land ownership documents',
    category: 'Land Administration',
    processingTime: '14-21 working days',
    fees: {
      amount: 2500,
      currency: 'LKR'
    },
    requiredDocuments: [
      {
        name: 'Title Deed',
        description: 'Original title deed or ownership documents',
        required: true
      },
      {
        name: 'Survey Plan',
        description: 'Surveyor\'s plan and measurements',
        required: true
      },
      {
        name: 'National Identity Cards',
        description: 'NICs of all parties involved in transfer',
        required: true
      },
      {
        name: 'Property Valuation',
        description: 'Current market valuation report',
        required: true
      },
      {
        name: 'Tax Clearance',
        description: 'Property tax clearance certificate',
        required: true
      }
    ],    instructions: "1. Obtain proper land survey first\n2. Clear all outstanding property taxes\n3. Get property valuation from certified valuator\n4. All parties must be present for verification\n5. Legal documentation review may take additional time",
    codePrefix: 'LR',
    isActive: true,
    icon: 'map'
  }
];

const seedServices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grama-sevaka', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing services (optional - remove this line if you want to keep existing services)
    // await Service.deleteMany({});
    // console.log('Cleared existing services');
    
    // Insert services
    for (const serviceData of services) {
      const existingService = await Service.findOne({ name: serviceData.name });
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
        console.log(`Created service: ${serviceData.name}`);
      } else {
        console.log(`Service already exists: ${serviceData.name}`);
      }
    }
    
    console.log('Service seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedServices();
