const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Load regulatory data
const regulatoryData = require('./data/processed/regulations.json');

// Generate report endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const businessDetails = req.body;
    
    // Create a prompt for GPT
    const prompt = `תבסס על הפרטים הבאים של העסק, צור דוח דרישות רגולטוריות מפורט:
    
סוג העסק: ${businessDetails.businessType}
גודל העסק: ${businessDetails.businessSize} מ"ר
מקומות ישיבה: ${businessDetails.hasSeating ? businessDetails.seatingCapacity : 'אין'}
שימוש בגז: ${businessDetails.hasGas ? 'כן' : 'לא'}
שירות משלוחים: ${businessDetails.hasDelivery ? 'כן' : 'לא'}
מכירת משקאות אלכוהוליים: ${businessDetails.hasAlcohol ? 'כן' : 'לא'}
מטבח: ${businessDetails.hasKitchen ? 'כן' : 'לא'}
חדר אחסון: ${businessDetails.hasStorage ? 'כן' : 'לא'}
חניה: ${businessDetails.hasParking ? 'כן' : 'לא'}

השתמש במידע הרגולטורי הבא כדי ליצור דוח מפורט:
${JSON.stringify(regulatoryData, null, 2)}

הדוח צריך לכלול:
1. דרישות משרד הבריאות
2. דרישות משטרת ישראל
3. דרישות בטיחות
4. דרישות נגישות
5. דרישות נוספות רלוונטיות

הצג את הדרישות בצורה ברורה ופשוטה, עם הסברים מפורטים.
כלול מועדים אחרונים אם רלוונטי.
הוסף הערות חשובות אם יש.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "אתה מומחה לרגולציה של עסקי מזון בישראל. תפקידך ליצור דוחות דרישות רגולטוריות ברורים ומפורטים."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Parse the response and structure it
    const reportContent = completion.choices[0].message.content;
    
    // Structure the response
    const sections = [
      {
        title: "דרישות משרד הבריאות",
        requirements: extractRequirements(reportContent, "משרד הבריאות")
      },
      {
        title: "דרישות משטרת ישראל",
        requirements: extractRequirements(reportContent, "משטרת ישראל")
      },
      {
        title: "דרישות בטיחות",
        requirements: extractRequirements(reportContent, "בטיחות")
      },
      {
        title: "דרישות נגישות",
        requirements: extractRequirements(reportContent, "נגישות")
      },
      {
        title: "דרישות נוספות",
        requirements: extractRequirements(reportContent, "נוספות")
      }
    ];

    res.json({ sections });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'אירעה שגיאה ביצירת הדוח' });
  }
});

// Helper function to extract requirements from GPT response
function extractRequirements(content, section) {
  // This is a simple implementation - you might want to make it more sophisticated
  const requirements = [];
  const lines = content.split('\n');
  let currentRequirement = null;

  for (const line of lines) {
    if (line.includes(section)) {
      if (currentRequirement) {
        requirements.push(currentRequirement);
      }
      currentRequirement = {
        title: line.trim(),
        description: '',
        deadline: null,
        notes: null
      };
    } else if (currentRequirement) {
      if (line.includes('מועד אחרון:')) {
        currentRequirement.deadline = line.split('מועד אחרון:')[1].trim();
      } else if (line.includes('הערה:')) {
        currentRequirement.notes = line.split('הערה:')[1].trim();
      } else if (line.trim()) {
        currentRequirement.description += line.trim() + ' ';
      }
    }
  }

  if (currentRequirement) {
    requirements.push(currentRequirement);
  }

  return requirements;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
