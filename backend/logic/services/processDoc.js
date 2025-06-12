const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { calculatePriorityFromContent, parseContentToRequirements } = require('../utils/requirementParser');
const { extractEstimatedCost, extractDeadline } = require('../utils/helpers'); // Make sure these are correctly imported

/**
 * מעבד קובץ Word וממיר אותו ל-JSON
 * @param {string} inputPath - נתיב לקובץ ה-Word
 * @param {string} outputPath - נתיב לקובץ ה-JSON
 * @returns {Promise<Object>} - המסמך המעובד בפורמט JSON
 * @throws {Error} - אם יש בעיה בקריאת הקובץ או בעיבודו
 */
async function processDocument(inputPath, outputPath) {
  try {
    // וידוא שהקובץ קיים
    if (!fs.existsSync(inputPath)) {
      throw new Error(`הקובץ ${inputPath} לא נמצא`);
    }

    // וידוא שהתיקיית יעד קיימת
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('מתחיל בעיבוד המסמך...');
    
    // קריאת קובץ ה-Word
    const result = await mammoth.extractRawText({ path: inputPath });
    if (!result.value) {
      throw new Error('הקובץ ריק או לא תקין');
    }
    
    console.log('המסמך נקרא בהצלחה, מתחיל בעיבוד הטקסט...');
    
    // עיבוד הטקסט ל-JSON
    const sections = parseTextToSections(result.value);
    
    // וידוא שיש תוכן
    if (!sections.sections || sections.sections.length === 0) {
      throw new Error('לא נמצאו סעיפים במסמך');
    }
    
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
 * @throws {Error} - אם הטקסט ריק או לא תקין
 */
function parseTextToSections(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('טקסט לא תקין');
  }

  const sections = [];
  let currentSection = null;
  let currentRequirement = null;

  // Helper function to process a block of content and extract potential requirements
  // This function is now imported from requirementParser.js
  const processContentBlock = (blockText, currentSectionId, currentSectionTitle) => {
    // Use the consolidated parsing logic from requirementParser.js
    return parseContentToRequirements(blockText, currentSectionTitle);
  };

  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line);

  for (const line of lines) {
    // 1. Check for a new SECTION (e.g., "1.1. Title")
    if (line.match(/^\d+\.\d+\s+/)) {
      // If there's a current section, finalize it (which also finalizes its last requirement)
      if (currentSection) {
        if (currentRequirement) { // Finalize any active requirement
          currentSection.requirements.push(currentRequirement);
          currentRequirement = null;
        }
        // Process any accumulated general content in the section
        if (currentSection.content.trim()) {
          const processedContent = processContentBlock(currentSection.content, currentSection.id, currentSection.title);
          currentSection.requirements.push(...processedContent);
          currentSection.content = ''; // Clear content after processing
        }
        sections.push(currentSection);
      }

      const [id, ...titleParts] = line.split(' ');
      currentSection = {
        id: id,
        title: titleParts.join(' ').trim(),
        content: '', // Reset content for the new section
        requirements: []
      };
    }
    // 2. Check for a new DASHED REQUIREMENT (starts with "- ")
    else if (currentSection && line.startsWith('- ')) {
      // Finalize the previous requirement if active
      if (currentRequirement) {
        currentSection.requirements.push(currentRequirement);
      }
      // Process any accumulated general content in the section before adding new dashed requirement
      if (currentSection.content.trim()) {
        const processedContent = processContentBlock(currentSection.content, currentSection.id, currentSection.title);
        currentSection.requirements.push(...processedContent);
        currentSection.content = '';
      }

      const requirementText = line.substring(2);
      if (requirementText.includes(':')) {
        const [mainTitle, ...subDescription] = requirementText.split(':');
        currentRequirement = {
          title: mainTitle.trim(),
          description: subDescription.join(':').trim(),
          category: currentSection.title.split(' ')[0],
          estimatedCost: extractEstimatedCost(requirementText),
          deadline: extractDeadline(requirementText),
          priority: calculatePriorityFromContent(requirementText), // Calculate priority for dashed requirements
          notes: ''
        };
      } else {
        currentRequirement = {
          title: requirementText,
          description: requirementText,
          category: currentSection.title.split(' ')[0],
          estimatedCost: extractEstimatedCost(requirementText),
          deadline: extractDeadline(requirementText),
          priority: calculatePriorityFromContent(requirementText), // Calculate priority for dashed requirements
          notes: ''
        };
      }
      currentSection.requirements.push(currentRequirement); // Add the new requirement immediately
      currentRequirement = null; // Reset for next line
    }
    // 3. Check for a new NUMBERED REQUIREMENT (starts with "N. " within a section's content)
    // This case is largely handled by processContentBlock now.
    else if (currentSection && line.match(/^\d+\.\s/) && !currentRequirement) {
      // If there's content in currentSection.content already, process it first
      if (currentSection.content.trim()) {
        const processedContent = processContentBlock(currentSection.content, currentSection.id, currentSection.title);
        currentSection.requirements.push(...processedContent);
        currentSection.content = '';
      }
      // Now, treat the current numbered line as a new requirement
      const [id, ...titleParts] = line.split(' ');
      const fullText = titleParts.join(' ').trim();
      currentRequirement = {
        title: fullText,
        description: '', // Description will be built from subsequent lines
        category: currentSection.title.split(' ')[0],
        estimatedCost: extractEstimatedCost(line),
        deadline: extractDeadline(line),
        priority: calculatePriorityFromContent(fullText), // Calculate priority for numbered requirements
        notes: ''
      };
      currentSection.requirements.push(currentRequirement); // Add immediately
      currentRequirement = null; // Reset for next line
    }
    // 4. Regular content (appends to current requirement's description/notes or section's content)
    else if (currentSection) {
      if (currentRequirement) {
        // If current requirement has no description yet, this line becomes its description
        if (currentRequirement.description === '') {
          currentRequirement.description = line;
          currentRequirement.priority = Math.max(
            currentRequirement.priority,
            calculatePriorityFromContent(line)
          );
        } else {
          // Otherwise, it's a note
          currentRequirement.notes += (currentRequirement.notes ? '\n' : '') + line;
        }
      } else {
        // If no active requirement, this is general section content
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
  }

  // Finalize the last section after the loop
  if (currentSection) {
    if (currentRequirement) {
      currentSection.requirements.push(currentRequirement);
    }
    if (currentSection.content.trim()) {
      const processedContent = processContentBlock(currentSection.content, currentSection.id, currentSection.title);
      currentSection.requirements.push(...processedContent);
    }
    sections.push(currentSection);
  }

  return { sections };
}

/**
 * מחפש מילות מפתח בטקסט
 * @param {string} text - הטקסט לחיפוש
 * @param {string[]} keywords - מילות המפתח
 * @returns {boolean} - האם נמצאה לפחות מילת מפתח אחת
 * @throws {Error} - אם הפרמטרים לא תקינים
 */
function containsKeywords(text, keywords) {
  if (!text || !keywords || !Array.isArray(keywords)) {
    throw new Error('פרמטרים לא תקינים');
  }
  
  return keywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

module.exports = {
  processDocument,
  parseTextToSections,
  containsKeywords,
  extractEstimatedCost,
  extractDeadline
};

// הרצת הפונקציה
const inputPath = path.join(__dirname, '../../../data/raw/18-07-2022_4.2A.docx');
const outputPath = path.join(__dirname, '../../../../data/processed/regulations.json');

processDocument(inputPath, outputPath)
  .then(() => console.log('העיבוד הושלם בהצלחה!'))
  .catch(error => console.error('שגיאה:', error)); 