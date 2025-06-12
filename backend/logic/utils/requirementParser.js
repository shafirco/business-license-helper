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
    'חובה לוודא', 'חובה לבדוק', 'חובה להקפיד', 'חובה להבטיח', 'חובה להבטיח',
    'חובה להבטיח', 'חובה להבטיח', 'חובה להבטיח', 'חובה להבטיח', 'חובה להבטיח'
  ];
  
  const highKeywords = [
    'יש להקפיד', 'יש לוודא', 'יש לבדוק', 'יש להבטיח', 'דרוש', 'חשוב', 
    'מומלץ בחום', 'חיוני', 'מניעת', 'צמצום', 'בדיקה תקופתית', 'אישור', 
    'תעודה', 'דיווח', 'נדרש', 'חיוני', 'חשוב', 'משמעותי', 'מרכזי',
    'עיקרי', 'בסיסי', 'יסודי', 'קריטי', 'מכריע', 'הכרחי', 'חיוני',
    'נדרש', 'חובה', 'מחייב', 'חייב', 'מחויב', 'נדרש', 'חובה על',
    'חייבים', 'מחויבים', 'נדרשים', 'חובה להבטיח', 'חובה לוודא',
    'חובה לבדוק', 'חובה להקפיד', 'חובה להבטיח'
  ];
  
  const mediumKeywords = [
    'מומלץ', 'רצוי', 'כדאי', 'ניתן', 'אפשרי', 'רצוי ש', 'אפשרות ל',
    'במידת הצורך', 'בין היתר', 'כגון', 'יש לשים לב', 'מומלץ',
    'רצוי', 'כדאי', 'ניתן', 'אפשרי', 'רצוי ש', 'אפשרות ל',
    'במידת הצורך', 'בין היתר', 'כגון', 'יש לשים לב'
  ];

  const safetyHygieneKeywords = [
    'בטיחות', 'היגיינה', 'ניקיון', 'מזון', 'בריאות', 'תברואה', 'סכנה',
    'סיכון', 'חיטוי', 'עיקור', 'מזיקים', 'אש', 'חומרים מסוכנים',
    'כיבוי אש', 'הגשת עזרה ראשונה', 'מנדף', 'אוורור', 'קירור',
    'הקפאה', 'טמפרטורה', 'זיהום', 'חיידקים', 'נגיפים', 'חומרי ניקוי',
    'סטריליזציה', 'מחלות', 'הדבקה', 'זיהום', 'חיידקים', 'נגיפים',
    'חומרים מסוכנים', 'רעלים', 'חומרים רעילים', 'חומרים מסוכנים',
    'חומרים רעילים', 'חומרים מסוכנים', 'חומרים רעילים'
  ];

  const licensingKeywords = [
    'רישוי', 'רישיון', 'אישור', 'היתר', 'תעודה', 'רגולציה', 'תקנות',
    'חוק', 'צו', 'הרשאה', 'פקיד מוסמך', 'רשות', 'משרד', 'ממשלה',
    'רשות מקומית', 'עירייה', 'מועצה', 'רשות מקומית', 'משרד',
    'ממשלה', 'רשות מקומית', 'עירייה', 'מועצה'
  ];

  const infrastructureKeywords = [
    'תשתיות', 'מבנה', 'ציוד', 'מתקן', 'מערכת', 'רצפה', 'קירות', 'תקרה',
    'צנרת', 'ביוב', 'חשמל', 'מים', 'גז', 'אוורור', 'מיזוג', 'תאורה',
    'דלתות', 'חלונות', 'שטחי עבודה', 'מטבח', 'מחסן', 'חדר קירור', 'מקפיא',
    'מערכת חשמל', 'מערכת מים', 'מערכת ביוב', 'מערכת אוורור', 'מערכת מיזוג',
    'מערכת תאורה', 'מערכת כיבוי אש', 'מערכת אבטחה', 'מערכת גז', 'מערכת מים',
    'מערכת ביוב', 'מערכת אוורור', 'מערכת מיזוג', 'מערכת תאורה'
  ];

  const staffKeywords = [
    'עובדים', 'צוות', 'הכשרה', 'הדרכה', 'תעודה', 'בריאות העובדים',
    'היגיינה אישית', 'ביגוד', 'בדיקות רפואיות', 'מחלות', 'מנהל',
    'אחראי', 'הסמכה', 'תעסוקה', 'שכר', 'ביטוח', 'בריאות', 'בטיחות',
    'הדרכה', 'הכשרה', 'תעודה', 'רישיון', 'אישור', 'הסמכה', 'מקצוע',
    'תפקיד', 'אחריות', 'חובות', 'זכויות', 'תנאי עבודה', 'שעות עבודה',
    'מנוחה', 'חופשה', 'מחלה', 'תאונה', 'בריאות', 'בטיחות'
  ];

  const environmentKeywords = [
    'סביבה', 'פסולת', 'שפכים', 'זיהום', 'מיחזור', 'ביוב', 'שמן',
    'הדברה', 'קיימות', 'אקולוגיה', 'מים', 'אוויר', 'קרקע', 'זיהום',
    'מחזור', 'פסולת', 'שפכים', 'ביוב', 'שמן', 'הדברה', 'קיימות',
    'אקולוגיה', 'מים', 'אוויר', 'קרקע', 'זיהום', 'מחזור', 'פסולת',
    'שפכים', 'ביוב', 'שמן', 'הדברה', 'קיימות', 'אקולוגיה'
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

  // Additional context-based priority adjustments
  if (textToAnalyze.includes('חוק') || textToAnalyze.includes('תקנות') || textToAnalyze.includes('צו')) {
    priority = Math.max(priority, 8);
  }
  if (textToAnalyze.includes('רישיון') || textToAnalyze.includes('היתר') || textToAnalyze.includes('אישור')) {
    priority = Math.max(priority, 9);
  }
  if (textToAnalyze.includes('בטיחות') || textToAnalyze.includes('בריאות') || textToAnalyze.includes('היגיינה')) {
    priority = Math.max(priority, 8);
  }

  // Type-based priority adjustments
  if (textToAnalyze.includes('מזון') || textToAnalyze.includes('אוכל') || textToAnalyze.includes('מאכל')) {
    priority = Math.max(priority, 8);
  }
  if (textToAnalyze.includes('היגיינה') || textToAnalyze.includes('ניקיון') || textToAnalyze.includes('תברואה')) {
    priority = Math.max(priority, 8);
  }
  if (textToAnalyze.includes('צוות') || textToAnalyze.includes('עובדים') || textToAnalyze.includes('הכשרה')) {
    priority = Math.max(priority, 6);
  }
  if (textToAnalyze.includes('תשתיות') || textToAnalyze.includes('מבנה') || textToAnalyze.includes('ציוד')) {
    priority = Math.max(priority, 6);
  }
  if (textToAnalyze.includes('רישוי') || textToAnalyze.includes('רישיון') || textToAnalyze.includes('היתר')) {
    priority = Math.max(priority, 9);
  }
  if (textToAnalyze.includes('בטיחות') || textToAnalyze.includes('סיכון') || textToAnalyze.includes('סכנה')) {
    priority = Math.max(priority, 9);
  }
  if (textToAnalyze.includes('סביבה') || textToAnalyze.includes('פסולת') || textToAnalyze.includes('זיהום')) {
    priority = Math.max(priority, 5);
  }

  return priority;
};

const parseContentToRequirements = (content, sectionTitle = '') => {
  const requirements = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let currentParsedRequirement = null;

  for (const line of lines) {
    // Check for numbered items (e.g., "1. item", "(1) item", "1.1. item", "1.1.1. item")
    if (line.match(/^\d+(\.\d+)*\s+/) || line.match(/^\(\d+\)\s+/)) {
      if (currentParsedRequirement) {
        currentParsedRequirement.recommendations = generateRecommendations(currentParsedRequirement);
        requirements.push(currentParsedRequirement);
      }
      const textParts = line.split(/\s+/).slice(1); // Split by one or more spaces and skip the ID part
      const fullText = textParts.join(' ').trim();
      currentParsedRequirement = {
        title: fullText,
        description: '',
        category: sectionTitle.split(' ')[0], // Infer category from section title
        priority: calculatePriorityFromContent(fullText),
        notes: ''
      };
    } else if (currentParsedRequirement) {
      if (currentParsedRequirement.description === '') {
        currentParsedRequirement.description = line;
        currentParsedRequirement.priority = Math.max(
          currentParsedRequirement.priority,
          calculatePriorityFromContent(line)
        );
      } else {
        currentParsedRequirement.notes += (currentParsedRequirement.notes ? '\n' : '') + line;
      }
    } else {
      // If no active requirement and line doesn't start a new one,
      // it's a general text. Create a new requirement for it.
      const newRequirement = {
        title: line.substring(0, 100) + (line.length > 100 ? '...' : ''), // Take first 100 chars as title
        description: line,
        category: sectionTitle.split(' ')[0], // Infer category from section title
        priority: calculatePriorityFromContent(line),
        notes: ''
      };
      newRequirement.recommendations = generateRecommendations(newRequirement);
      requirements.push(newRequirement);
    }
  }
  if (currentParsedRequirement) {
    currentParsedRequirement.recommendations = generateRecommendations(currentParsedRequirement);
    requirements.push(currentParsedRequirement);
  }
  return requirements;
};

const generateRecommendations = (requirement) => {
  const recommendations = [];
  const textToAnalyze = (requirement.title + ' ' + requirement.description + ' ' + requirement.notes).toLowerCase();

  if (requirement.priority >= 9) {
    recommendations.push('בצע הערכת סיכונים מקיפה ופעל מיידית להפחתתם.');
    recommendations.push('היוועץ עם מומחה משפטי/רגולטורי בהקדם.');
  } else if (requirement.priority >= 7) {
    recommendations.push('הגדר תוכנית פעולה מפורטת ולוחות זמנים לביצוע.');
    recommendations.push('בצע מעקב שוטף ודיווח התקדמות.');
  } else if (requirement.priority >= 5) {
    recommendations.push('שלב את הדרישה בתכנית העבודה השוטפת.');
    recommendations.push('ודא הקצאת משאבים מתאימים לביצוע.');
  } else {
    recommendations.push('סקור את הדרישה באופן תקופתי לוודא שהיא עדיין רלוונטית.');
  }

  // Category-specific recommendations
  if (textToAnalyze.includes('בטיחות') || textToAnalyze.includes('היגיינה') || textToAnalyze.includes('מזון')) {
    recommendations.push('בצע הדרכות רענון בטיחות והיגיינה לצוות.');
    recommendations.push('בדוק תקינות ציוד בטיחות ועזרה ראשונה.');
  }
  if (textToAnalyze.includes('רישיון') || textToAnalyze.includes('רגולציה') || textToAnalyze.includes('חוק')) {
    recommendations.push('ודא עמידה בכל דרישות הרישוי והרגולציה הרלוונטיות.');
    recommendations.push('עקוב אחר עדכוני חקיקה ורגולציה.');
  }
  if (textToAnalyze.includes('תשתיות') || textToAnalyze.includes('מבנה')) {
    recommendations.push('בצע בדיקת תחזוקה תקופתית לתשתיות וציוד.');
    recommendations.push('שקול שדרוג תשתיות במידת הצורך.');
  }
  if (textToAnalyze.includes('עובדים') || textToAnalyze.includes('צוות')) {
    recommendations.push('הגדר נהלי עבודה ברורים וודא הטמעתם בקרב העובדים.');
    recommendations.push('בצע סקרי שביעות רצון עובדים באופן תקופתי.');
  }
  if (textToAnalyze.includes('סביבה') || textToAnalyze.includes('פסולת') || textToAnalyze.includes('זיהום')) {
    recommendations.push('בצע בקרת איכות סביבה והפחתת פסולת.');
    recommendations.push('שקול הטמעת פתרונות ירוקים וקיימות.');
  }

  return [...new Set(recommendations)]; // Remove duplicates
};

module.exports = {
  calculatePriorityFromContent,
  parseContentToRequirements,
  generateRecommendations
}; 