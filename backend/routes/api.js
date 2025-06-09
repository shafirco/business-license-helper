const express = require('express');
const router = express.Router();
const { matchRequirements } = require('../logic/services/matchRules');
const { generateSmartReport } = require('../logic/services/aiService');
const path = require('path');

// Load regulatory data directly in the API file
const regulatoryDataPath = path.join(__dirname, '..', '..', 'data', 'processed', 'regulations.json');
let regulatoryData;

try {
  regulatoryData = require(regulatoryDataPath);
  console.log('Regulatory data loaded successfully in API route.');
} catch (error) {
  console.error('Error loading regulatory data in API route:', error);
  // We will handle this error in the route handler
}

router.post('/generate-report', async (req, res) => {
  try {
    const { businessDetails } = req.body;

    if (!businessDetails) {
      return res.status(400).json({
        error: 'Missing business details',
        message: 'Please provide business details in the request body'
      });
    }

    if (!regulatoryData) {
       return res.status(500).json({
         error: 'Regulatory data not loaded',
         message: 'Server failed to load regulatory data.'
       });
    }

    // התאמת דרישות רלוונטיות
    const matchedRequirements = matchRequirements(businessDetails, regulatoryData);
    
    if (!matchedRequirements || matchedRequirements.length === 0) {
      return res.status(404).json({
        error: 'No requirements found',
        message: 'No matching requirements found for the provided business details'
      });
    }

    // יצירת דוח חכם
    const smartReport = await generateSmartReport(matchedRequirements, businessDetails);
    
    // המרת התשובה לפורמט שהקומפוננטה מצפה לו
    const formattedResponse = {
      sections: [
        {
          title: "דרישות כלליות",
          requirements: matchedRequirements.map(req => ({
            title: req.title || req.id,
            description: req.text || req.content,
            priority: req.isCritical ? 6 : 3,
            notes: req.notes,
            recommendations: req.recommendations || []
          }))
        },
        {
          title: "סיכום והמלצות",
          requirements: [
            {
              title: "סיכום",
              description: smartReport.summary,
              priority: 4
            },
            {
              title: "דרישות דחופות",
              description: smartReport.urgentRequirements.join("\n"),
              priority: 6
            },
            {
              title: "המלצות",
              description: smartReport.recommendations.join("\n"),
              priority: 3
            },
            {
              title: "צעדים מעשיים",
              description: smartReport.actionSteps.join("\n"),
              priority: 4
            },
            {
              title: "הערות חשובות",
              description: smartReport.importantNotes.join("\n"),
              priority: 5
            }
          ]
        }
      ]
    };
    
    res.json(formattedResponse);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

module.exports = router; 