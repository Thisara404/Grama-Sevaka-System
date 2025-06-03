const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

dotenv.config();
const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL (Vite default port)
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes - ALL ROUTES SHOULD BE HERE, BEFORE ERROR HANDLER
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/locations', require('./src/routes/location.routes'));
app.use('/api/forums', require('./src/routes/forum.routes'));
app.use('/api/appointments', require('./src/routes/appointment.routes'));
app.use('/api/emergencies', require('./src/routes/emergency.routes'));
app.use('/api/documents', require('./src/routes/document.routes'));
app.use('/api/services', require('./src/routes/service.routes'));
app.use('/api/gs', require('./src/routes/gs.routes'));
app.use('/api/announcements', require('./src/routes/announcement.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/legal-cases', require('./src/routes/legalCase.routes')); // Fixed case sensitivity

// Add error handler - THIS SHOULD BE LAST
app.use(require('./src/middleware/errorHandler'));

// Add Swagger documentation
require('./src/config/swagger')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));