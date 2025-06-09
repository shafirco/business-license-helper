const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * יוצר דוח חכם מותאם אישית
 * @param {Object} requirements - הדרישות הרלוונטיות
 * @param {Object} businessDetails - פרטי העסק
 * @returns {Promise<Object>} - הדוח המעובד
 */
async function generateSmartReport(requirements, businessDetails) {
  try {
    const prompt = createPrompt(requirements, businessDetails);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "אתה מומחה ברישוי עסקים בישראל, במיוחד בתחום המזון. תפקידך ליצור דוח מפורט ומקצועי המפרט את הדרישות וההמלצות הרלוונטיות לעסק."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return processAIResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error generating smart report:', error);
    throw new Error('Failed to generate smart report');
  }
}

/**
 * יוצר פרומפט מותאם ל-AI
 */
function createPrompt(relevantSectionsSimplified, businessDetails) {
  // מצמצמים את הדרישות למינימום ההכרחי
  const sectionsInfo = relevantSectionsSimplified.map(section => {
    let requirement = '';
    if (Array.isArray(section.requirements)) {
      requirement = section.requirements[0] || '';
    } else if (typeof section.requirements === 'string') {
      requirement = section.requirements;
    }
    
    // מצמצמים את הדרישה ל-100 תווים
    if (requirement.length > 100) {
      requirement = requirement.substring(0, 97) + '...';
    }
    
    return `סעיף ${section.id}: ${requirement}`;
  }).join('\n');

  const essentialDetails = {
    סוג: businessDetails.businessType,
    גודל: businessDetails.businessSize,
    ישיבה: businessDetails.hasSeating ? 'כן' : 'לא',
    גז: businessDetails.hasGas ? 'כן' : 'לא'
  };

  return `
פרטי העסק: ${Object.entries(essentialDetails).map(([key, value]) => `${key}: ${value}`).join(', ')}

דרישות רלוונטיות:
${sectionsInfo}

צור דוח קצר וממוקד:
1. סיכום (2-3 משפטים)
2. דרישות דחופות (3-4 נקודות)
3. המלצות (2-3 נקודות)
4. צעדים מעשיים (2-3 נקודות)
5. הערות חשובות (1-2 נקודות)`;
}

/**
 * מעבד את התשובה מה-AI למבנה מובנה
 */
function processAIResponse(response) {
  console.log('Raw AI response:', response);
  try {
    // Try to parse as JSON first
    try {
      return JSON.parse(response);
    } catch (jsonError) {
      // If not JSON, convert the text response to a structured format
      const sections = response.split('\n\n');
      const result = {
        summary: '',
        urgentRequirements: [],
        recommendations: [],
        actionSteps: [],
        importantNotes: []
      };

      sections.forEach(section => {
        if (section.includes('סיכום')) {
          result.summary = section.split('\n').slice(1).join(' ').trim();
        } else if (section.includes('דרישות דחופות')) {
          result.urgentRequirements = section.split('\n')
            .slice(1)
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
        } else if (section.includes('המלצות')) {
          result.recommendations = section.split('\n')
            .slice(1)
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
        } else if (section.includes('צעדים מעשיים')) {
          result.actionSteps = section.split('\n')
            .slice(1)
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
        } else if (section.includes('הערות חשובות')) {
          result.importantNotes = section.split('\n')
            .slice(1)
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
        }
      });

      return result;
    }
  } catch (error) {
    console.error('Error processing AI response:', error);
    throw new Error('Failed to process AI response');
  }
}

module.exports = {
  generateSmartReport
}; 