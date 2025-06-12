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
    .split(/\n\s*\n|(?:\.\s*){2,}|\n\s*-\s*|\n\s*\d+\.\s*|\.\s*(?=[א-ת])/g)
    .filter(p => p.trim() && p.trim().length > 10)
    .map(p => p.trim())
    .slice(0, 30); // מגביל ל-30 דרישות
  
  paragraphs.forEach((paragraph, index) => {
    const trimmed = paragraph.trim();
    if (!trimmed || trimmed.length < 8) return;
    
    // ניקוי הטקסט
    let cleanText = trimmed
      .replace(/[•\-*●○▪▫]+\s*/g, '')
      .replace(/^\d+[\.\)]\s*/, '')
      .replace(/\s+/g, ' ')
      .replace(/\([^)]*\)/g, '')
      .replace(/["\[\]]/g, '')
      .trim();
    
    if (!cleanText || cleanText.length < 8) return;
    
    // יצירת דרישה ממש קצרה
    const { title, description } = createShortRequirement(cleanText);
    
    // חישוב עדיפות לפי תוכן אמיתי
    const priority = calculateRealPriority(cleanText);
    
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
 * יצירת דרישה ממש קצרה
 */
function createShortRequirement(text) {
  const lowerText = text.toLowerCase();
  
  let title = '';
  let description = '';
  
  // זיהוי דרישות לפי מילות מפתח
  if (lowerText.includes('רישיון') || lowerText.includes('היתר')) {
    title = 'רישיון עסק';
    description = 'קבל רישיון מהעירייה';
  } else if (lowerText.includes('בטיחות') || lowerText.includes('אש')) {
    title = 'בטיחות אש';
    description = 'התקן גלאי עשן';
  } else if (lowerText.includes('בריאות') || lowerText.includes('מזון')) {
    title = 'תקני בריאות';
    description = 'שמור ניקיון';
  } else if (lowerText.includes('עובד') || lowerText.includes('הכשרה')) {
    title = 'הכשרת עובדים';
    description = 'הכשר עובדים';
  } else if (lowerText.includes('פיקוח') || lowerText.includes('בדיקה')) {
    title = 'בדיקות';
    description = 'התכונן לפיקוח';
  } else if (lowerText.includes('ביטוח')) {
    title = 'ביטוח';
    description = 'עשה ביטוח עסק';
  } else if (lowerText.includes('שילוט')) {
    title = 'שילוט';
    description = 'התקן שילוט';
  } else {
    // כללי - קצר מאוד
    const words = text.split(' ').slice(0, 3).join(' ');
    title = words.length > 20 ? words.substring(0, 20) : words;
    description = 'פנה לרשות';
  }
  
  // הגבל אורכים
  if (title.length > 25) title = title.substring(0, 25);
  if (description.length > 35) description = description.substring(0, 35);
  
  return { title, description };
}

/**
 * חישוב עדיפות אמיתי לפי תוכן
 */
function calculateRealPriority(text) {
  const lowerText = text.toLowerCase();
  
  // מילות מפתח לדחיפות גבוהה
  const urgentWords = ['חובה', 'אסור', 'קנס', 'סגירה', 'מיידי', 'חירום', 'סכנה'];
  const highWords = ['רישיון', 'היתר', 'אישור', 'בטיחות', 'אש', 'בריאות'];
  const mediumWords = ['הכשרה', 'תעודה', 'פיקוח', 'בדיקה', 'ביטוח'];
  
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
 * יצירת המלצות פשוטות
 */
function generateSimpleRecommendations(priority) {
  const recommendations = [];
  
  if (priority >= 6) {
    recommendations.push('טפל מיידית!');
  } else if (priority >= 5) {
    recommendations.push('טפל השבוע');
  } else if (priority >= 4) {
    recommendations.push('תכנן לחודש');
  } else {
    recommendations.push('לא דחוף');
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