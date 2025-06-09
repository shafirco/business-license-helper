const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

/**
 * מעבד קובץ Word וממיר אותו ל-JSON
 * @param {string} inputPath - נתיב לקובץ ה-Word
 * @param {string} outputPath - נתיב לקובץ ה-JSON
 */
async function processDocument(inputPath, outputPath) {
  try {
    console.log('מתחיל בעיבוד המסמך...');
    
    // קריאת קובץ ה-Word
    const result = await mammoth.extractRawText({ path: inputPath });
    const text = result.value;
    
    console.log('המסמך נקרא בהצלחה, מתחיל בעיבוד הטקסט...');
    
    // עיבוד הטקסט ל-JSON
    const sections = parseTextToSections(text);
    
    // שמירת התוצאה
    fs.writeFileSync(outputPath, JSON.stringify(sections, null, 2));
    console.log('הקובץ עובד בהצלחה ונשמר ב:', outputPath);
    
    return sections;
  } catch (error) {
    console.error('שגיאה בעיבוד הקובץ:', error);
    throw error;
  }
}

/**
 * מפרק טקסט לסעיפים
 * @param {string} text - הטקסט המלא
 * @returns {Object} - מבנה JSON של הסעיפים
 */
function parseTextToSections(text) {
  const sections = [];
  let currentSection = null;
  let currentRequirement = null;
  
  // פיצול הטקסט לשורות
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  for (const line of lines) {
    // בדיקה אם זו כותרת של סעיף חדש
    if (line.match(/^\d+\.\d+\s+/)) {
      // שמירת הסעיף הקודם אם קיים
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // יצירת סעיף חדש
      const [id, ...titleParts] = line.split(' ');
      currentSection = {
        id: id.replace('.', ''),
        title: titleParts.join(' '),
        content: '',
        requirements: []
      };
    }
    // בדיקה אם זו דרישה חדשה
    else if (line.startsWith('- ')) {
      if (currentSection) {
        currentRequirement = {
          text: line.substring(2),
          category: currentSection.title.split(' ')[0], // לוקח את המילה הראשונה כקטגוריה
          estimatedCost: 0, // ערך ברירת מחדל
          deadline: null, // ערך ברירת מחדל
          notes: '' // ערך ברירת מחדל
        };
        currentSection.requirements.push(currentRequirement);
      }
    }
    // תוכן נוסף לסעיף או לדרישה
    else if (currentSection) {
      if (currentRequirement) {
        currentRequirement.notes += (currentRequirement.notes ? '\n' : '') + line;
      } else {
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
  }
  
  // הוספת הסעיף האחרון
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return { sections };
}

/**
 * מחפש מילות מפתח בטקסט
 * @param {string} text - הטקסט לחיפוש
 * @param {string[]} keywords - מילות המפתח
 * @returns {boolean} - האם נמצאה לפחות מילת מפתח אחת
 */
function containsKeywords(text, keywords) {
  return keywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * מחלץ עלות משוערת מטקסט
 * @param {string} text - הטקסט לחיפוש
 * @returns {number} - העלות המשוערת
 */
function extractEstimatedCost(text) {
  const costMatch = text.match(/(\d+(?:,\d+)*)\s*שח/);
  if (costMatch) {
    return parseInt(costMatch[1].replace(/,/g, ''));
  }
  return 0;
}

/**
 * מחלץ תאריך יעד מטקסט
 * @param {string} text - הטקסט לחיפוש
 * @returns {string|null} - תאריך היעד
 */
function extractDeadline(text) {
  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  return dateMatch ? dateMatch[1] : null;
}

// הרצת הפונקציה
const inputPath = path.join(__dirname, '../../../data/raw/18-07-2022_4.2A.docx');
const outputPath = path.join(__dirname, '../../../data/processed/regulations.json');

processDocument(inputPath, outputPath)
  .then(() => console.log('העיבוד הושלם בהצלחה!'))
  .catch(error => console.error('שגיאה:', error)); 