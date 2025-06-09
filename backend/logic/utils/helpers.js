/**
 * פונקציות עזר כלליות
 */

/**
 * ממיר תאריך לפורמט עברי
 * @param {Date} date - תאריך להמרה
 * @returns {string} - תאריך בפורמט עברי
 */
function formatHebrewDate(date) {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * ממיר מספר לפורמט כספי
 * @param {number} amount - סכום להמרה
 * @returns {string} - סכום בפורמט כספי
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(amount);
}

/**
 * בודק אם מחרוזת מכילה טקסט בעברית
 * @param {string} text - טקסט לבדיקה
 * @returns {boolean} - האם הטקסט מכיל עברית
 */
function containsHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * מחשב את מספר הימים עד לתאריך מסוים
 * @param {Date} targetDate - התאריך המטרה
 * @returns {number} - מספר הימים שנותרו
 */
function daysUntil(targetDate) {
  const today = new Date();
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * ממיר מספר טלפון לפורמט אחיד
 * @param {string} phone - מספר טלפון
 * @returns {string} - מספר טלפון בפורמט אחיד
 */
function formatPhoneNumber(phone) {
  // מסיר כל תו שאינו ספרה
  const cleaned = phone.replace(/\D/g, '');
  // מוסיף את קידומת 972 אם חסרה
  const withPrefix = cleaned.startsWith('972') ? cleaned : `972${cleaned}`;
  // מחזיר בפורמט +972-XX-XXXXXXX
  return `+${withPrefix.slice(0, 3)}-${withPrefix.slice(3, 5)}-${withPrefix.slice(5)}`;
}

/**
 * בודק אם כתובת אימייל תקינה
 * @param {string} email - כתובת אימייל לבדיקה
 * @returns {boolean} - האם האימייל תקין
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ממיר טקסט לרשימת תגיות
 * @param {string} text - טקסט להמרה
 * @returns {string[]} - מערך של תגיות
 */
function textToTags(text) {
  return text
    .split(/[\s,]+/) // מפצל לפי רווחים ופסיקים
    .filter(tag => tag.length > 0) // מסיר תגיות ריקות
    .map(tag => tag.trim()); // מסיר רווחים מיותרים
}

/**
 * מחשב את העלות המשוערת של דרישות
 * @param {Array} requirements - רשימת דרישות
 * @returns {Object} - פירוט עלויות
 */
function calculateRequirementsCost(requirements) {
  const costs = {
    total: 0,
    byCategory: {}
  };

  requirements.forEach(req => {
    const cost = req.estimatedCost || 0;
    costs.total += cost;
    
    if (!costs.byCategory[req.category]) {
      costs.byCategory[req.category] = 0;
    }
    costs.byCategory[req.category] += cost;
  });

  return costs;
}

/**
 * ממיין דרישות לפי עדיפות
 * @param {Array} requirements - רשימת דרישות
 * @returns {Array} - דרישות ממוינות
 */
function sortRequirementsByPriority(requirements) {
  return requirements.sort((a, b) => {
    // קודם כל לפי קטגוריה
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // אחר כך לפי תאריך יעד
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });
}

module.exports = {
  formatHebrewDate,
  formatCurrency,
  containsHebrew,
  daysUntil,
  formatPhoneNumber,
  isValidEmail,
  textToTags,
  calculateRequirementsCost,
  sortRequirementsByPriority
}; 