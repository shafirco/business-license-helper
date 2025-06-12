/**
 * פונקציה שמנתחת תוכן טקסט ומחלצת ממנו דרישות קצרות ומעשיות
 * @param {string} content - התוכן לניתוח
 * @param {string} sectionTitle - כותרת הסעיף
 * @returns {Array} - מערך דרישות
 */
export function parseContentToRequirements(content, sectionTitle = '') {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const requirements = [];
  
  // פיצול התוכן לפסקאות קטנות
  const paragraphs = content
    .split(/\n\s*\n|(?:\.\s*){2,}|\n\s*-\s*|\n\s*\d+\.\s*/g)
    .filter(p => p.trim())
    .map(p => p.trim());
  
  paragraphs.forEach((paragraph, index) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;
    
    // ניקוי הטקסט
    let cleanText = trimmed
      .replace(/[•\-*●○▪▫]+\s*/g, '')
      .replace(/^\d+[\.\)]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!cleanText) return;
    
    // תיקון מילים חתוכות בתחילת משפט
    cleanText = fixTruncatedWords(cleanText);
    
    // יצירת דרישה
    const { title, description } = createRequirement(cleanText, sectionTitle);
    
    // חישוב עדיפות לפי תוכן אמיתי
    const priority = calculateRealPriority(cleanText);
    
    // --- סינון דרישות לא הגיוניות ---
    // דרישה לא תוצג אם הכותרת או התיאור קצרים מדי (פחות מ-8 תווים)
    if (!title || title.length < 8) return;
    if (!description || description.length < 30) return;
    
    if (title.split(' ').length < 2 && description.split(' ').length < 8) return;
    // דרישה לא תוצג אם אין כמעט תווים עבריים (פחות מ-3)
    const hebrewCount = (title + description).match(/[\u0590-\u05FF]/g)?.length || 0;
    if (hebrewCount < 3) return;
    // דרישה לא תוצג אם יש בה רק תווים מוזרים
    if (/^[^\w\u0590-\u05FF]+$/.test(title + description)) return;
    // --- סוף סינון ---

    requirements.push({
      title: title,
      description: description,
      priority: priority,
      notes: '',
      recommendations: generateSimpleRecommendations(priority)
    });
  });
  
  return requirements;
}

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

/**
 * יצירת דרישה מלאה
 */
function createRequirement(text, sectionTitle = '') {
  const lowerText = text.toLowerCase();
  
  let title = '';
  let description = text;
  
  // חילוץ כותרת מהטקסט
  const firstSentence = text.split(/[.!?]|\n/)[0].trim();
  if (firstSentence && firstSentence.length > 5) {
    title = firstSentence;
    description = text.substring(firstSentence.length).trim();
    if (description.startsWith('.')) {
      description = description.substring(1).trim();
    }
  }
  
  // אם אין כותרת או שהיא קצרה מדי, נשתמש בזיהוי לפי מילות מפתח
  if (!title || title.length < 10) {
    if (lowerText.includes('רישיון') || lowerText.includes('היתר')) {
      title = 'רישיון עסק';
    } else if (lowerText.includes('בטיחות') || lowerText.includes('אש')) {
      title = 'בטיחות אש';
    } else if (lowerText.includes('בריאות') || lowerText.includes('מזון')) {
      title = 'תקני בריאות';
    } else if (lowerText.includes('עובד') || lowerText.includes('הכשרה')) {
      title = 'הכשרת עובדים';
    } else if (lowerText.includes('פיקוח') || lowerText.includes('בדיקה')) {
      title = 'בדיקות פיקוח';
    } else if (lowerText.includes('ביטוח')) {
      title = 'ביטוח';
    } else if (lowerText.includes('שילוט')) {
      title = 'שילוט';
    } else {
      // אם אין התאמה, נשתמש בחלק הראשון של הטקסט
      title = text.split(' ').slice(0, 5).join(' ');
    }
  }
  
  // וידוא שיש תוכן בתיאור
  if (!description || description.length < 5) {
    description = text;
  }
  
  // תיקון מילים חתוכות בכותרת ובתיאור
  title = fixTruncatedWords(title);
  description = fixTruncatedWords(description);
  
  // הגבלת אורך סבירה
  if (title.length > 50) title = title.substring(0, 50) + '...';
  if (description.length > 500) description = description.substring(0, 500) + '...';
  
  return { title, description };
}

/**
 * חישוב עדיפות אמיתי לפי תוכן
 */
function calculateRealPriority(text) {
  const lowerText = text.toLowerCase();
  
  // מילות מפתח לדחיפות גבוהה
  const urgentWords = ['חובה', 'אסור', 'קנס', 'סגירה', 'מיידי', 'חירום', 'סכנה', 'חוק', 'תקנות', 'צו'];
  const highWords = ['רישיון', 'היתר', 'אישור', 'בטיחות', 'אש', 'בריאות', 'מזון', 'תברואה'];
  const mediumWords = ['הכשרה', 'תעודה', 'פיקוח', 'בדיקה', 'ביטוח', 'שילוט', 'תחזוקה'];
  
  // בדיקת התאמות
  for (let word of urgentWords) {
    if (lowerText.includes(word)) return 6; // דחוף
  }
  
  for (let word of highWords) {
    if (lowerText.includes(word)) return 5; // גבוה
  }
  
  for (let word of mediumWords) {
    if (lowerText.includes(word)) return 4; // בינוני גבוה
  }
  
  // ברירת מחדל
  return 3; // בינוני
}

/**
 * יצירת המלצות מפורטות
 */
function generateSimpleRecommendations(priority) {
  const recommendations = [];
  
  if (priority >= 6) {
    recommendations.push('טיפול מיידי נדרש - יש לפעול ללא דיחוי');
  } else if (priority >= 5) {
    recommendations.push('טיפול בעדיפות גבוהה - יש לטפל בהקדם');
  } else if (priority >= 4) {
    recommendations.push('טיפול בעדיפות בינונית - יש לתכנן טיפול');
  } else {
    recommendations.push('טיפול בעדיפות רגילה - יש לכלול בתוכנית העבודה');
  }
  
  return recommendations;
}

// שמור על הפונקציות הישנות לתאימות לאחור
export function calculatePriorityFromContent(content, index = 0, total = 1) {
  return calculateRealPriority(content);
}

export function generateRecommendations(requirement) {
  return generateSimpleRecommendations(requirement.priority || 3);
} 