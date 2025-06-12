const { calculatePriorityFromContent, parseContentToRequirements, generateRecommendations } = require('../utils/requirementParser');

/**
 * פונקציה שמסננת סעיפי תקנות רלוונטיים לפי התשובות של המשתמש
 * @param {Object} userAnswers - התשובות של המשתמש (פרטי העסק)
 * @param {Object} regulations - התקנות והדרישות
 * @returns {Array<Object>} - רשימה מצומצמת של הסעיפים הרלוונטיים (ID, Title, Requirements)
 */
function matchRequirements(userAnswers, regulations) {
  const relevantSectionsSimplified = [];

  // עובר על כל הסעיפים בתקנות
  regulations.sections.forEach(section => {
    // בודק אם הסעיף רלוונטי לפי סוג העסק ומאפיינים נוספים
    if (isSectionRelevant(section, userAnswers)) {
      let requirementsToProcess = [];

      if (section.requirements && section.requirements.length > 0) {
        // If explicit requirements exist, process them to add priority and recommendations
        requirementsToProcess = section.requirements.map(req => {
          const textToAnalyze = `${req.title || ''} ${req.description || ''} ${req.notes || ''} ${req.content || ''} ${req.text || ''}`;
          const priority = calculatePriorityFromContent(textToAnalyze);
          const recommendations = generateRecommendations({ ...req, priority }); // Pass req with calculated priority
          return { ...req, priority, recommendations };
        });
      } else if (section.content && section.content.trim()) {
        // If no explicit requirements but content exists, parse requirements from content
        // parseContentToRequirements already adds priority and recommendations
        requirementsToProcess = parseContentToRequirements(section.content, section.title);
      }

      const processedRequirements = requirementsToProcess;

      relevantSectionsSimplified.push({
        id: section.id,
        title: section.title,
        content: section.content, // Keep original content for smart report, etc.
        requirements: processedRequirements // Use processed requirements with calculated priority and recommendations
      });
    }
  });

  return relevantSectionsSimplified;
}

/**
 * בודק אם סעיף רלוונטי לפי התשובות של המשתמש
 */
function isSectionRelevant(section, userAnswers) {
  const businessType = userAnswers.businessType || '';
  const sectionTitle = section.title || '';
  const sectionContent = section.content || '';

  // מילות מפתח לפי סוג העסק
  const businessTypeKeywords = {
    'bakery': ['לחם', 'מאפיה', 'אפיה', 'בצק'],
    'restaurant': ['מסעדה', 'אוכל', 'בישול', 'מטבח', 'הסעדה'],
    'cafe': ['קפה', 'קפיטריה', 'משקאות'],
    'grocery': ['מכולת', 'מרכול', 'סופר', 'מזון'],
    'butcher': ['קצב', 'בשר', 'עוף'],
    'dairy': ['חלב', 'גבינה', 'מוצרי חלב'],
    'fish': ['דגים', 'פירות ים'],
    'vegetables': ['ירקות', 'פירות', 'תוצרת טרייה']
  };

  // מילות מפתח לפי מאפיינים
  const featureKeywords = [];
  if (userAnswers.hasFoodTransportation) featureKeywords.push('הובלת מזון', 'רכב');
  if (userAnswers.hasSeating) featureKeywords.push('ישיבה', 'סועדים');
  if (userAnswers.hasGas) featureKeywords.push('גז', 'אש');
  if (userAnswers.hasDelivery) featureKeywords.push('משלוחים', 'שליחת מזון');
  if (userAnswers.hasAlcohol) featureKeywords.push('אלכוהול', 'משקאות חריפים');
  if (userAnswers.hasKitchen) featureKeywords.push('מטבח', 'בישול');
  if (userAnswers.hasStorage) featureKeywords.push('אחסון', 'מחסן');
  if (userAnswers.hasParking) featureKeywords.push('חניה', 'מקום חניה');

  // בדיקת התאמה לפי סוג העסק
  const businessKeywords = businessTypeKeywords[businessType] || [];
  const isRelevantByBusinessType = businessKeywords.some(keyword => 
    sectionTitle.toLowerCase().includes(keyword.toLowerCase()) || 
    sectionContent.toLowerCase().includes(keyword.toLowerCase())
  );

  // בדיקת התאמה לפי מאפיינים
  const isRelevantByFeatures = featureKeywords.some(keyword => 
    sectionTitle.toLowerCase().includes(keyword.toLowerCase()) || 
    sectionContent.toLowerCase().includes(keyword.toLowerCase())
  );

  // בדיקת התאמה לפי גודל העסק
  const isRelevantBySize = !section.minSize || !section.maxSize || 
    (userAnswers.businessSize >= section.minSize && userAnswers.businessSize <= section.maxSize);

  // בדיקת התאמה לפי דרישות ספציפיות
  const isRelevantByRequirements = section.requirements && section.requirements.some(req => 
    isRequirementRelevant(req, userAnswers)
  );

  // סעיף רלוונטי אם הוא מתאים לאחד מהתנאים הבאים:
  // 1. מתאים לסוג העסק
  // 2. מתאים למאפיינים
  // 3. מתאים לדרישות ספציפיות
  // 4. הוא סעיף כללי (לא מכיל מילות מפתח ספציפיות)
  const isGeneralSection = !sectionTitle.toLowerCase().includes('ספציפי') && 
                          !sectionContent.toLowerCase().includes('ספציפי');

  return (isRelevantByBusinessType || isRelevantByFeatures || isRelevantByRequirements || isGeneralSection) && 
         isRelevantBySize;
}

/**
 * בודק אם דרישה רלוונטית לפי התשובות
 */
function isRequirementRelevant(requirement, userAnswers) {
  // בדיקות ספציפיות לפי סוג הדרישה
  if (requirement.type === 'size') {
    return parseInt(userAnswers.businessSize) >= requirement.minSize;
  }

  if (requirement.type === 'seating') {
    return userAnswers.hasSeating && parseInt(userAnswers.seatingCapacity) >= requirement.minSeats;
  }

  if (requirement.type === 'refrigeration') {
    return userAnswers.hasRefrigeration && 
           (requirement.advanced ? userAnswers.refrigerationType === 'advanced' : true);
  }

  if (requirement.type === 'freezer') {
    return userAnswers.hasFreezer && 
           (requirement.advanced ? userAnswers.freezerType === 'advanced' : true);
  }

  if (requirement.type === 'food_handling') {
    return (
      (requirement.foodType === 'meat' && userAnswers.handlesRawMeat) ||
      (requirement.foodType === 'dairy' && userAnswers.handlesDairy) ||
      (requirement.foodType === 'fish' && userAnswers.handlesFish) ||
      (requirement.foodType === 'vegetables' && userAnswers.handlesVegetables)
    );
  }

  if (requirement.type === 'staff') {
    return (
      (requirement.requiresTraining && userAnswers.hasTrainedStaff) ||
      (requirement.requiresCertificates && userAnswers.hasHealthCertificates)
    );
  }

  if (requirement.type === 'delivery') {
    return userAnswers.hasDelivery || userAnswers.hasFoodDelivery;
  }

  if (requirement.type === 'transportation') {
    return userAnswers.hasFoodTransportation;
  }

  // דרישות כלליות
  return true;
}

module.exports = {
  matchRequirements
}; 