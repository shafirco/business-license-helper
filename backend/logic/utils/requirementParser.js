const calculatePriorityFromContent = (text) => {
  let priority = 1; // Start with lowest priority

  // Combine all relevant text fields for comprehensive keyword check
  const textToAnalyze = text.toLowerCase();

  // Keyword-based priority boosts
  const criticalKeywords = [
    'חובה', 'חייב', 'מחויב', 'אסור', 'נדרש', 'קריטי', 'בכפוף ל', 'על פי דין', 
    'יש לוודא עמידה ב', 'אי עמידה עלולה', 'הפרה', 'עבירה', 'צו', 'פקודה', 'קנס', 
    'הדחת', 'ביטול רישיון', 'חוק', 'תקנות', 'חוקי', 'תקני', 'תקן', 'חוקית',
    'מחייב', 'חובה על', 'חייבים', 'מחויבים', 'נדרשים', 'חובה להבטיח',
    'חובה לוודא', 'חובה לבדוק', 'חובה להקפיד'
  ];
  
  const highKeywords = [
    'יש להקפיד', 'יש לוודא', 'יש לבדוק', 'יש להבטיח', 'דרוש', 'חשוב', 
    'מומלץ בחום', 'חיוני', 'מניעת', 'צמצום', 'בדיקה תקופתית', 'אישור', 
    'תעודה', 'דיווח', 'נדרש', 'חיוני', 'חשוב', 'משמעותי', 'מרכזי',
    'עיקרי', 'בסיסי', 'יסודי', 'קריטי', 'מכריע', 'הכרחי'
  ];
  
  const mediumKeywords = [
    'מומלץ', 'רצוי', 'כדאי', 'ניתן', 'אפשרי', 'רצוי ש', 'אפשרות ל',
    'במידת הצורך', 'בין היתר', 'כגון', 'יש לשים לב'
  ];

  const safetyHygieneKeywords = [
    'בטיחות', 'היגיינה', 'ניקיון', 'מזון', 'בריאות', 'תברואה', 'סכנה',
    'סיכון', 'חיטוי', 'עיקור', 'מזיקים', 'אש', 'חומרים מסוכנים',
    'כיבוי אש', 'הגשת עזרה ראשונה', 'מנדף', 'אוורור', 'קירור',
    'הקפאה', 'טמפרטורה', 'זיהום', 'חיידקים', 'נגיפים', 'חומרי ניקוי',
    'סטריליזציה', 'מחלות', 'הדבקה'
  ];

  const licensingKeywords = [
    'רישוי', 'רישיון', 'אישור', 'היתר', 'תעודה', 'רגולציה', 'תקנות',
    'חוק', 'צו', 'הרשאה', 'פקיד מוסמך', 'רשות', 'משרד', 'ממשלה',
    'רשות מקומית', 'עירייה', 'מועצה'
  ];

  const infrastructureKeywords = [
    'תשתיות', 'מבנה', 'ציוד', 'מתקן', 'מערכת', 'רצפה', 'קירות', 'תקרה',
    'צנרת', 'ביוב', 'חשמל', 'מים', 'גז', 'אוורור', 'מיזוג', 'תאורה',
    'דלתות', 'חלונות', 'שטחי עבודה', 'מטבח', 'מחסן', 'חדר קירור', 'מקפיא'
  ];

  const staffKeywords = [
    'עובדים', 'צוות', 'הכשרה', 'הדרכה', 'תעודה', 'בריאות העובדים',
    'היגיינה אישית', 'ביגוד', 'בדיקות רפואיות', 'מחלות', 'מנהל',
    'אחראי', 'הסמכה', 'תעסוקה', 'שכר', 'ביטוח', 'בריאות', 'בטיחות'
  ];

  const environmentKeywords = [
    'סביבה', 'פסולת', 'שפכים', 'זיהום', 'מיחזור', 'ביוב', 'שמן',
    'הדברה', 'קיימות', 'אקולוגיה', 'מים', 'אוויר', 'קרקע'
  ];

  // Check for critical keywords first
  if (criticalKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 9); // דחוף ביותר
  }
  // Then check for high priority keywords
  if (highKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 7); // דחוף
  }
  // Then check for medium priority keywords
  if (mediumKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 5); // גבוה
  }

  // Category-specific keywords (these should also boost the priority)
  if (safetyHygieneKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 8); // דחוף מאוד
  }
  if (licensingKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 9); // דחוף ביותר
  }
  if (infrastructureKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 6); // גבוה מאוד
  }
  if (staffKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 6); // גבוה מאוד
  }
  if (environmentKeywords.some(keyword => textToAnalyze.includes(keyword))) {
    priority = Math.max(priority, 5); // גבוה
  }

  return priority;
};

const parseContentToRequirements = (content, sectionTitle = '') => {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const requirements = [];
  const lines = content.split('\n');
  let currentRequirement = null;
  let buffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // בדיקה אם זו התחלה של דרישה חדשה
    const isNewRequirement = line.match(/^(\d+(\.\d+)*|\([א-ת]\)|\([0-9]+\))\s+/) || 
                           (line.length > 10 && !currentRequirement);

    if (isNewRequirement) {
      // שמירת הדרישה הקודמת אם קיימת
      if (currentRequirement && buffer) {
        currentRequirement.description = buffer.trim();
        requirements.push(currentRequirement);
      }

      // התחלת דרישה חדשה
      const cleanLine = line.replace(/^(\d+(\.\d+)*|\([א-ת]\)|\([0-9]+\))\s+/, '').trim();
      currentRequirement = {
        title: cleanLine,
        description: '',
        priority: calculatePriorityFromContent(cleanLine),
        notes: '',
        recommendations: []
      };
      buffer = '';
    } else if (currentRequirement) {
      // הוספת שורה לתיאור הדרישה הנוכחית
      buffer += (buffer ? ' ' : '') + line;
    } else {
      // אם אין דרישה נוכחית, נתייחס לטקסט כדרישה חדשה
      currentRequirement = {
        title: line,
        description: '',
        priority: calculatePriorityFromContent(line),
        notes: '',
        recommendations: []
      };
    }
  }

  // שמירת הדרישה האחרונה
  if (currentRequirement && buffer) {
    currentRequirement.description = buffer.trim();
    requirements.push(currentRequirement);
  } else if (currentRequirement) {
    requirements.push(currentRequirement);
  }

  // עיבוד סופי של הדרישות
  return requirements.map(req => {
    // אם אין תיאור, נשתמש בכותרת
    if (!req.description) {
      req.description = req.title;
    }

    // הגבלת אורך כותרות ותיאורים
    if (req.title.length > 100) {
      req.title = req.title.substring(0, 97) + '...';
    }
    if (req.description.length > 1000) {
      req.description = req.description.substring(0, 997) + '...';
    }

    // הוספת המלצות
    req.recommendations = generateRecommendations(req);

    return req;
  });
};

const generateRecommendations = (requirement) => {
  const recommendations = [];
  const priority = requirement.priority;

  if (priority >= 9) {
    recommendations.push('טיפול מיידי נדרש - יש לפעול ללא דיחוי');
  } else if (priority >= 7) {
    recommendations.push('טיפול בעדיפות גבוהה מאוד - יש לטפל בהקדם האפשרי');
  } else if (priority >= 5) {
    recommendations.push('טיפול בעדיפות גבוהה - יש לתכנן טיפול בקרוב');
  } else {
    recommendations.push('טיפול בעדיפות רגילה - יש לכלול בתוכנית העבודה');
  }

  return recommendations;
};

/**
 * תיקון מילים חתוכות בתחילת משפט
 */
function fixTruncatedWords(text) {
  // מילון תיקונים נפוצים
  const commonFixes = {
    'ין ': 'אין ',
    'חד ': 'אחד ',
    'זון ': 'מזון ',
    'כל ': 'מאכל ',
    'ישור ': 'אישור ',
    'חסון ': 'אחסון ',
    'בטחה ': 'אבטחה ',
    'חריות ': 'אחריות ',
    'ספקה ': 'אספקה ',
    'רגון ': 'ארגון ',
    'ריזה ': 'אריזה ',
    'ינדיקטורי ': 'אינדיקטורי ',
    'וורור ': 'אוורור ',
    'ישות ': 'נגישות ',
    'יקיון ': 'ניקיון ',
    'יהול ': 'ניהול ',
    'קירה ': 'חקירה ',
    'דרכה ': 'הדרכה ',
    'תקנה ': 'התקנה ',
    'גדים ': 'בגדים ',
    'קפאה': 'הקפאה'
  };

  // בדיקה אם המשפט מתחיל באחת המילים החתוכות
  for (const [truncated, full] of Object.entries(commonFixes)) {
    if (text.startsWith(truncated)) {
      text = full + text.substring(truncated.length);
      break;
    }
  }

  // תיקון מילים חתוכות אחרי נקודה
  const sentences = text.split(/\.\s+/);
  const fixedSentences = sentences.map(sentence => {
    for (const [truncated, full] of Object.entries(commonFixes)) {
      if (sentence.startsWith(truncated)) {
        return full + sentence.substring(truncated.length);
      }
    }
    return sentence;
  });

  return fixedSentences.join('. ');
}

function generateTitle(text) {
  // חילוץ כותרת מהטקסט
  const firstSentence = text.split(/[.!?]|\n/)[0].trim();
  
  if (firstSentence && firstSentence.length > 5 && firstSentence.length <= 50) {
    return firstSentence;
  }
  
  // אם המשפט הראשון ארוך מדי, ניקח רק את החלק הראשון
  return firstSentence.split(' ').slice(0, 5).join(' ');
}

function calculatePriority(text) {
  const lowerText = text.toLowerCase();
  
  // מילות מפתח לדחיפות גבוהה
  const urgentWords = ['חובה', 'אסור', 'קנס', 'סגירה', 'מיידי', 'חירום', 'סכנה'];
  const highWords = ['רישיון', 'היתר', 'אישור', 'בטיחות', 'אש', 'בריאות'];
  const mediumWords = ['הכשרה', 'תעודה', 'פיקוח', 'בדיקה', 'ביטוח'];
  
  if (urgentWords.some(word => lowerText.includes(word))) return 5;
  if (highWords.some(word => lowerText.includes(word))) return 4;
  if (mediumWords.some(word => lowerText.includes(word))) return 3;
  
  return 2;
}

module.exports = {
  parseContentToRequirements,
  calculatePriorityFromContent,
  generateRecommendations,
  calculatePriority,
  generateTitle,
  fixTruncatedWords
}; 