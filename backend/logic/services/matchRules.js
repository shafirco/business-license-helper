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
      // מוסיף רק את השדות החיוניים כדי לצמצם את גודל המידע הנשלח ל-AI
      relevantSectionsSimplified.push({
        id: section.id,
        title: section.title,
        requirements: section.requirements // שולחים את מערך הדרישות כפי שהוא (טקסט או אובייקטים)
      });
    }
  });

  return relevantSectionsSimplified;
}

/**
 * בודק אם סעיף רלוונטי לפי התשובות של המשתמש
 * נשאר עם לוגיקת בדיקה פשוטה על סמך סוג העסק ומילות מפתח בכותרת/תוכן הסעיף.
 */
function isSectionRelevant(section, userAnswers) {
  const businessType = userAnswers.businessType || '';
  const sectionTitle = section.title || '';
  const sectionContent = section.content || '';

  // דוגמה לסינון פשוט: אם סוג העסק הוא מסעדה, כל הסעיפים רלוונטיים כרגע.
  // נוכל להוסיף כאן לוגיקה מורכבת יותר בהמשך אם נצטרך.
  if (businessType === 'restaurant') {
    return true; // כרגע כל הסעיפים רלוונטיים למסעדה לצורך הדגמה
  }

  // סינון לפי מילות מפתח בסיסיות ללא תלות במבנה ה requirements בתוך הסעיף
  const keywords = [];

  if (userAnswers.hasFoodTransportation) keywords.push('הובלת מזון', 'רכב');
  if (userAnswers.hasSeating) keywords.push('ישיבה', 'סועדים');
  if (userAnswers.hasGas) keywords.push('גז', 'אש');
  if (userAnswers.hasDelivery) keywords.push('משלוחים', 'שליחת מזון');
  // ניתן להוסיף כאן עוד מילות מפתח לפי מאפיינים נוספים

  const lowerCaseTitle = sectionTitle.toLowerCase();
  const lowerCaseContent = sectionContent.toLowerCase();

  // בדיקה אם כותרת הסעיף או תוכן הסעיף מכילים מילת מפתח רלוונטית
  return keywords.some(keyword => 
    lowerCaseTitle.includes(keyword.toLowerCase()) || 
    lowerCaseContent.includes(keyword.toLowerCase())
  );
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

/**
 * מחשב את העדיפות של דרישה
 */
function calculatePriority(requirement, userAnswers) {
  let priority = 1;

  // העלאת עדיפות לדרישות בטיחות קריטיות
  if (requirement.isCritical) {
    priority += 5;
  }

  // העלאת עדיפות לדרישות הקשורות לבטיחות מזון
  if (requirement.type === 'food_handling') {
    priority += 3;
  }

  // העלאת עדיפות לדרישות הקשורות להיגיינה
  if (requirement.type === 'hygiene') {
    priority += 2;
  }

  // העלאת עדיפות לדרישות הקשורות לצוות
  if (requirement.type === 'staff') {
    priority += 2;
  }

  return priority;
}

module.exports = {
  matchRequirements
}; 