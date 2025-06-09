require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Load regulatory data
const regulatoryDataPath = path.join(__dirname, '..', 'data', 'processed', 'regulations.json');
let regulatoryData;

try {
  regulatoryData = require(regulatoryDataPath);
  console.log('Regulatory data loaded successfully.');
} catch (error) {
  console.error('Error loading regulatory data:', error);
  // Handle error appropriately, maybe exit or serve a minimal response
  process.exit(1); // Exit if data loading fails
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Middleware to attach regulatory data to request object
app.use('/api', (req, res, next) => {
  req.regulations = regulatoryData;
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});