const express = require('express');
const cors = require('cors');
const { generateSmartReport } = require('./logic/services/aiService');
const { matchRequirements } = require('./logic/services/matchRules');
require('dotenv').config();
console.log('OPENAI_API_KEY loaded:', process.env.OPENAI_API_KEY ? '*****' + process.env.OPENAI_API_KEY.slice(-5) : 'Not loaded');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load regulatory data
const regulations = require('../data/processed/regulations.json');

// Generate report endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const businessDetails = req.body;
    
    // Filter relevant regulations based on business type and features
    const relevantRegulations = matchRequirements(businessDetails, regulations);

    // Generate the report using our aiService
    const report = await generateSmartReport(relevantRegulations, businessDetails);
    
    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'אירעה שגיאה ביצירת הדוח' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
