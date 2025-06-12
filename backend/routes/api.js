const express = require('express');
const router = express.Router();
const { matchRequirements } = require('../logic/services/matchRules');
const { generateSmartReport } = require('../logic/services/aiService');
const { parseContentToRequirements, calculatePriorityFromContent } = require('../logic/utils/requirementParser');
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

/**
 * Process requirements to make them short and readable
 */
function processRequirementsForDisplay(matchedRequirements) {
  const processedRequirements = [];
  const seenTitles = new Set(); // For deduplication
  
  matchedRequirements.forEach(section => {
    if (section.requirements && section.requirements.length > 0) {
      // Process explicit requirements
      section.requirements.forEach(req => {
        const content = req.description || req.content || req.text || req.title || '';
        if (content && content.trim()) {
          const processed = createShortRequirement(content, section.title);
          if (processed && !seenTitles.has(processed.title)) {
            processedRequirements.push(processed);
            seenTitles.add(processed.title);
          }
        }
      });
    } else if (section.content && section.content.trim()) {
      // Parse content into requirements
      const parsed = parseContentToRequirements(section.content, section.title);
      parsed.forEach(req => {
        const processed = createShortRequirement(req.description || req.title, section.title);
        if (processed && !seenTitles.has(processed.title)) {
          processedRequirements.push(processed);
          seenTitles.add(processed.title);
        }
      });
    }
  });
  
  // Ensure balanced priority distribution
  const balancedRequirements = balancePriorities(processedRequirements);
  
  return balancedRequirements.slice(0, 30); // Limit to 30 requirements
}

/**
 * Create a smart, logical requirement 
 */
function createShortRequirement(content, sectionTitle = '') {
  if (!content || typeof content !== 'string') {
    return null;
  }
  
  // More comprehensive cleaning of content
  let cleanContent = content
    // Remove legal references and citations
    .replace(/התש[א-ת]\"[א-ת]\s*[-–]\s*\d{4}/g, '') // Hebrew legal years like "התשל\"ב - 1971"
    .replace(/התש[א-ת]\"[א-ת]/g, '') // Hebrew legal notation without years
    .replace(/\([^)]*תש[א-ת]\"[א-ת][^)]*\)/g, '') // Legal notation in parentheses
    .replace(/תשלב\s*\d{4}/g, '') // Remove "תשלב 1971" pattern
    .replace(/שלב\s*\d{4}/g, '') // Remove "שלב 1971" pattern
    .replace(/\([^)]*\d{4}[^)]*\)/g, '') // Remove years in parentheses
    .replace(/ישראלי\s*\d+/g, '') // Remove "ישראלי 1145"
    .replace(/ת\"י\s*\d+/g, '') // Remove "ת\"י 1291"
    .replace(/תקן\s*\d+/g, '') // Remove "תקן 123"
    .replace(/סעיף\s*\d+/g, '') // Remove "סעיף 123"
    .replace(/פרק\s*\d+/g, '') // Remove "פרק 123"
    .replace(/נספח\s*[א-ת]['"]*/g, '') // Remove "נספח א'"
    .replace(/\(\s*[א-ת]\s*\)/g, '') // Remove "(א)" type references
    .replace(/\([^)]*\)/g, '') // Remove remaining parentheses content
    .replace(/["\[\]]/g, '') // Remove quotes and brackets
    // Remove numbering and lettering
    .replace(/^\d+(\.\d+)*[\.\-\s]*/g, '') // Remove numbering
    .replace(/^[א-ת][\.\)\-\s]*/g, '') // Remove Hebrew lettering
    .replace(/^\s*[-–]\s*/g, '') // Remove leading dashes
    // Clean up extra spaces and fix missing letters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Check if we have meaningful content after cleaning
  if (!cleanContent || cleanContent.length < 5) {
    return null;
  }
  
  // Fix common issues that cause missing first letters
  if (cleanContent.match(/^[^\u0590-\u05FF]/)) {
    // If starts with non-Hebrew character, try to find first Hebrew word
    const hebrewMatch = cleanContent.match(/[\u0590-\u05FF][^\s]*/);
    if (hebrewMatch) {
      cleanContent = hebrewMatch[0] + ' ' + cleanContent.substring(hebrewMatch.index + hebrewMatch[0].length);
    }
  }
  
  const lowerText = cleanContent.toLowerCase();
  
  // Smart categorization based on keywords and context
  let requirement = analyzeRequirement(lowerText, cleanContent, sectionTitle);
  
  if (!requirement) {
    return null;
  }
  
  return {
    title: requirement.title,
    description: requirement.description,
    priority: requirement.priority,
    notes: '',
    recommendations: [] // Removed recommendations as requested
  };
}

/**
 * Intelligent requirement analysis
 */
function analyzeRequirement(lowerText, cleanText, sectionTitle = '') {
  // Comprehensive keyword mapping
  const requirementTypes = [
    {
      keywords: ['רישיון', 'היתר', 'אישור', 'רשיון'],
      title: 'רישיון עסק',
      description: 'פנה לרשות המקומית לקבלת רישיון עסק.\nהכן את כל המסמכים הנדרשים.\nוודא שהמקום עומד בתקנות.',
      priority: 6
    },
    {
      keywords: ['בטיחות', 'אש', 'כיבוי', 'מטפה', 'גלאי עשן'],
      title: 'בטיחות אש',
      description: 'התקן מערכת גילוי עשן ומטפי כיבוי.\nוודא יציאות חירום נגישות.\nקיים תוכנית פינוי.',
      priority: 5
    },
    {
      keywords: ['בריאות', 'מזון', 'היגיינה', 'ניקיון', 'סניטציה'],
      title: 'תקני בריאות',
      description: 'שמור על ניקיון והיגיינה במקום העבודה.\nוודא הכשרה בתחום הבריאות.\nבצע בדיקות תקופתיות.',
      priority: 5
    },
    {
      keywords: ['כיור', 'כיורים', 'מים', 'רחצה'],
      title: 'מתקני כיורים',
      description: 'התקן כיורים במקומות הנדרשים.\nוודא זמינות מים חמים וקרים.\nספק סבון ומגבות נייר.',
      priority: 4
    },
    {
      keywords: ['עובד', 'הכשרה', 'תעודה', 'הדרכה'],
      title: 'הכשרת עובדים',
      description: 'הכשר עובדים בנושאי בטיחות ובריאות.\nוודא תעודות הכשרה מעודכנות.\nקיים הדרכות תקופתיות.',
      priority: 4
    },
    {
      keywords: ['ביטוח', 'אחריות', 'פוליסה'],
      title: 'ביטוח עסק',
      description: 'עשה ביטוח אחריות מתאים לעסק.\nוודא כיסוי לכל הסיכונים.\nעדכן ביטוח בכל שינוי.',
      priority: 4
    },
    {
      keywords: ['שילוט', 'שלט', 'סימון', 'תמרור'],
      title: 'שילוט חובה',
      description: 'התקן שילוט בטיחות ברור.\nוודא שילוט יציאות חירום.\nשמור שילוט נקי וקריא.',
      priority: 3
    },
    {
      keywords: ['חניה', 'חנייה', 'מקום', 'רכב'],
      title: 'מקומות חניה',
      description: 'ספק מקומות חניה מספיקים.\nסמן מקומות חניה לנכים.\nוודא נגישות ובטיחות.',
      priority: 3
    },
    {
      keywords: ['נגישות', 'נכים', 'רמפה', 'מעלית'],
      title: 'נגישות לנכים',
      description: 'התאם המקום לנגישות מלאה.\nהתקן רמפות לפי הצורך.\nוודא שירותים נגישים.',
      priority: 4
    },
    {
      keywords: ['פיקוח', 'בדיקה', 'ביקורת', 'בקרה'],
      title: 'בדיקות פיקוח',
      description: 'התכונן לביקורות רשויות.\nשמור תיעוד מסודר.\nתקן ליקויים מיידית.',
      priority: 3
    },
    {
      keywords: ['תאורה', 'אור', 'תאורת', 'מנורה'],
      title: 'תאורה מתאימה',
      description: 'וודא תאורה מספקת בכל אזורי העבודה.\nהתקן תאורת חירום.\nבדוק תקינות התאורה.',
      priority: 3
    },
    {
      keywords: ['אוורור', 'אוויר', 'וונטילציה'],
      title: 'מערכת אוורור',
      description: 'התקן מערכת אוורור מתאימה.\nוודא חידוש אוויר קבוע.\nבדוק פילטרים תקופתית.',
      priority: 3
    },
    {
      keywords: ['טמפרטורה', 'קירור', 'חימום', 'מזגן'],
      title: 'בקרת טמפרטורה',
      description: 'שמור על טמפרטורה מתאימה.\nהתקן מערכות קירור/חימום.\nבדוק טמפרטורות תקופתית.',
      priority: 3
    },
    {
      keywords: ['שירותים', 'אסלה', 'מתקנים'],
      title: 'מתקני שירותים',
      description: 'התקן שירותים מספיקים.\nוודא ניקיון קבוע.\nספק נייר טואלט וסבון.',
      priority: 3
    },
    {
      keywords: ['פסולת', 'זבל', 'אשפה', 'פינוי'],
      title: 'ניהול פסולת',
      description: 'התקן מכלי פסולת מתאימים.\nקבע לוח זמנים לפינוי.\nשמור על ניקיון האזור.',
      priority: 2
    },
    {
      keywords: ['תחזוקה', 'שירות', 'תיקון'],
      title: 'תחזוקה שוטפת',
      description: 'קיים תחזוקה שוטפת של המתקנים.\nתקן תקלות מיידית.\nשמור יומן תחזוקה.',
      priority: 2
    },
    {
      keywords: ['דגים', 'fish', 'דג'],
      title: 'טיפול בדגים',
      description: 'שמור על קירור מתמיד לדגים.\nוודא טריות המוצר.\nקיים בדיקות איכות.',
      priority: 4
    },
    {
      keywords: ['בשר', 'מוצר בשר', 'בקר', 'עוף'],
      title: 'טיפול בבשר',
      description: 'שמור על שרשרת הקור.\nוודא הפרדה מוצרי חלב.\nקיים בדיקות וטרינריות.',
      priority: 5
    },
    {
      keywords: ['חלב', 'גבינה', 'יוגורט', 'חמאה'],
      title: 'מוצרי חלב',
      description: 'שמור על טמפרטורה נמוכה.\nוודא תאריכי תפוגה.\nקיים בדיקות איכות.',
      priority: 4
    }
  ];

  // Find the best match
  for (let type of requirementTypes) {
    if (type.keywords.some(keyword => lowerText.includes(keyword))) {
      return {
        title: type.title,
        description: type.description,
        priority: type.priority
      };
    }
  }

  // If no specific match, try to extract meaningful requirement
  return extractGeneralRequirement(cleanText, sectionTitle);
}

/**
 * Extract general requirement from text
 */
function extractGeneralRequirement(text, sectionTitle) {
  // Look for action verbs to create meaningful titles
  const actionPatterns = [
    { pattern: /יש\s+לוודא\s+([^.]+)/, title: 'וידוא {}' },
    { pattern: /יש\s+להתקין\s+([^.]+)/, title: 'התקנת {}' },
    { pattern: /יש\s+לקיים\s+([^.]+)/, title: 'קיום {}' },
    { pattern: /יש\s+לבצע\s+([^.]+)/, title: 'ביצוע {}' },
    { pattern: /חובה\s+לקיים\s+([^.]+)/, title: 'חובת {}' },
    { pattern: /נדרש\s+לבצע\s+([^.]+)/, title: '{}' },
  ];

  for (let actionPattern of actionPatterns) {
    const match = text.match(actionPattern.pattern);
    if (match && match[1]) {
      const requirement = match[1].trim().slice(0, 30);
      return {
        title: actionPattern.title.replace('{}', requirement),
        description: text.slice(0, 120) + (text.length > 120 ? '...' : ''),
        priority: 3
      };
    }
  }

  // Use section title if available
  if (sectionTitle && sectionTitle.length > 5) {
    return {
      title: sectionTitle.slice(0, 25),
      description: text.slice(0, 120) + (text.length > 120 ? '...' : ''),
      priority: 3
    };
  }

  // Last resort - skip unclear requirements
  return null;
}

/**
 * Extract meaningful title from sentence
 */
function extractTitle(sentence) {
  const words = sentence.split(' ').filter(w => w.length > 2);
  if (words.length >= 2) {
    return words.slice(0, 3).join(' ');
  } else {
    return words.join(' ');
  }
}

/**
 * Generate contextual recommendations
 */
function generateContextualRecommendations(title, content) {
  const recommendations = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('חובה') || lowerContent.includes('חיוב')) {
    recommendations.push('פעולה חובה - בצע מיידית');
  }
  
  if (lowerContent.includes('בדיקה') || lowerContent.includes('בדוק')) {
    recommendations.push('קבע תאריך לבדיקה');
  }
  
  if (lowerContent.includes('רישיון') || lowerContent.includes('אישור')) {
    recommendations.push('פנה לרשות המתאימה');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('קבל ייעוץ מקצועי לביצוע');
  }
  
  return recommendations;
}

/**
 * Calculate priority with proper distribution including low levels
 */
function calculateBalancedPriority(text) {
  const urgentWords = ['חובה', 'אסור', 'קנס', 'סגירה', 'מיידי', 'חירום', 'סכנה', 'פלילי'];
  const highWords = ['רישיון', 'היתר', 'אישור', 'בטיחות', 'אש', 'בריאות', 'מזון'];
  const mediumWords = ['הכשרה', 'תעודה', 'פיקוח', 'בדיקה', 'ביטוח'];
  const lowWords = ['שילוט', 'ניקיון', 'סדר', 'ארגון', 'תחזוקה'];
  
  // Check for matches in priority order
  for (let word of urgentWords) {
    if (text.includes(word)) return 6; // Urgent
  }
  
  for (let word of highWords) {
    if (text.includes(word)) return 5; // High
  }
  
  for (let word of mediumWords) {
    if (text.includes(word)) return 4; // Medium-high
  }
  
  for (let word of lowWords) {
    if (text.includes(word)) return 2; // Low
  }
  
  return 3; // Default medium
}

/**
 * Balance priorities to ensure good distribution
 */
function balancePriorities(requirements) {
  if (!requirements || requirements.length === 0) {
    return requirements;
  }

  // Calculate dynamic target based on business complexity
  const baseRequirements = Math.min(requirements.length, 8); // Start with base
  const maxRequirements = Math.min(requirements.length, 25); // Dynamic cap based on available requirements
  
  // Sort by priority (highest first) to maintain quality
  const sortedRequirements = requirements.sort((a, b) => b.priority - a.priority);
  
  // Take diverse priorities to ensure balance
  const balancedRequirements = [];
  const priorityGroups = {
    6: [], // Urgent
    5: [], // High  
    4: [], // Medium-High
    3: [], // Medium
    2: []  // Low
  };
  
  // Group by priority
  sortedRequirements.forEach(req => {
    const priority = Math.min(Math.max(req.priority, 2), 6);
    if (priorityGroups[priority]) {
      priorityGroups[priority].push(req);
    }
  });
  
  // Ensure we have some from each priority level (when available)
  const minPerPriority = Math.floor(baseRequirements / 5);
  const extraSlots = baseRequirements % 5;
  
  [6, 5, 4, 3, 2].forEach((priority, index) => {
    const group = priorityGroups[priority];
    let targetCount = minPerPriority;
    if (index < extraSlots) targetCount++; // Distribute extra slots to higher priorities
    
    const count = Math.min(targetCount, group.length);
    for (let i = 0; i < count; i++) {
      balancedRequirements.push(group[i]);
    }
  });
  
  // If we haven't reached the target, add more from available requirements
  const remainingRequirements = sortedRequirements.filter(req => 
    !balancedRequirements.includes(req)
  );
  
  while (balancedRequirements.length < maxRequirements && remainingRequirements.length > 0) {
    balancedRequirements.push(remainingRequirements.shift());
  }
  
  return balancedRequirements.slice(0, maxRequirements);
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

    // עיבוד הדרישות לתצוגה קצרה וברורה
    const processedRequirements = processRequirementsForDisplay(matchedRequirements);
    
    // יצירת דוח חכם
    const smartReport = await generateSmartReport(matchedRequirements, businessDetails);
    
    // המרת התשובה לפורמט שהקומפוננטה מצפה לו
    const formattedResponse = {
      sections: [
        {
          title: "דרישות כלליות",
          requirements: processedRequirements
        },
        {
          title: "סיכום והמלצות",
          requirements: [
            {
              title: "סיכום",
              description: smartReport.summary,
              priority: null, // No priority for summary
              hidePriority: true
            },
            {
              title: "דרישות דחופות",
              description: smartReport.urgent.join("\n"),
              priority: null, // No priority for recommendations
              hidePriority: true
            },
            {
              title: "המלצות",
              description: smartReport.recommendations.join("\n"),
              priority: null, // No priority for recommendations  
              hidePriority: true
            }
          ]
        }
      ]
    };
    
    console.log('Processed requirements sent to frontend:', JSON.stringify(formattedResponse, null, 2));
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