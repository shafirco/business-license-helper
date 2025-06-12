# תיעוד API - מערכת הערכת רישוי עסקים

## סקירה כללית

ה-API של המערכת מבוסס על REST עם JSON. השרת מחזיר תמיד תשובות בפורמט JSON ותומך ב-CORS לקריאות מ-frontend מקומי.

**Base URL:** `http://localhost:3001/api`

## נקודות קצה (Endpoints)

### 1. יצירת דוח רגולטורי

**Endpoint:** `POST /api/generate-report`

**תיאור:** מקבל פרטי עסק ומייצר דוח רגולטורי מותאם אישית עם שימוש ב-AI.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessDetails": {
    "businessType": "string",           // סוג העסק (נדרש)
    "businessSize": "number",           // גודל העסק במ"ר (נדרש)
    "hasSeating": "boolean",            // האם יש מקומות ישיבה (אופציונלי)
    "hasGas": "boolean",               // האם יש שימוש בגז (אופציונלי)
    "hasKitchen": "boolean",           // האם יש מטבח (אופציונלי)
    "hasStorage": "boolean",           // האם יש אחסון (אופציונלי)
    "hasParking": "boolean",           // האם יש חניה (אופציונלי)
    "hasRefrigeration": "boolean",     // האם יש קירור (אופציונלי)
    "hasFreezer": "boolean",           // האם יש הקפאה (אופציונלי)
    "hasDelivery": "boolean",          // האם יש משלוחים (אופציונלי)
    "hasFoodTransportation": "boolean", // האם יש הובלת מזון (אופציונלי)
    "hasAlcohol": "boolean",           // האם מוגש אלכוהול (אופציונלי)
    "handlesRawMeat": "boolean",       // האם מטפלים בבשר גולמי (אופציונלי)
    "handlesDairy": "boolean",         // האם מטפלים במוצרי חלב (אופציונלי)
    "handlesFish": "boolean",          // האם מטפלים בדגים (אופציונלי)
    "handlesVegetables": "boolean",    // האם מטפלים בירקות ופירות (אופציונלי)
    "hasTrainedStaff": "boolean",      // האם יש צוות מיומן (אופציונלי)
    "hasHealthCertificates": "boolean" // האם יש תעודות בריאות (אופציונלי)
  }
}
```

**Response (200 OK):**
```json
{
  "sections": [
    {
      "title": "דרישות כלליות",
      "requirements": [
        {
          "title": "string",          // כותרת הדרישה
          "description": "string",    // תיאור מפורט (2-3 שורות)
          "priority": "number",       // רמת עדיפות (2-6)
          "notes": "string",          // הערות נוספות (אופציונלי)
          "recommendations": [],      // המלצות (ריק כרגע)
          "hidePriority": "boolean"   // האם להסתיר תווית עדיפות
        }
      ]
    },
    {
      "title": "סיכום והמלצות",
      "requirements": [
        {
          "title": "סיכום",
          "description": "string",    // סיכום כללי של הדרישות
          "priority": null,
          "hidePriority": true
        },
        {
          "title": "דרישות דחופות",
          "description": "string",    // רשימת דרישות דחופות
          "priority": null,
          "hidePriority": true
        },
        {
          "title": "המלצות",
          "description": "string",    // רשימת המלצות
          "priority": null,
          "hidePriority": true
        }
      ]
    }
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing business details",
  "message": "Please provide business details in the request body"
}
```

**Response (404 Not Found):**
```json
{
  "error": "No requirements found",
  "message": "No matching requirements found for the provided business details"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Regulatory data not loaded",
  "message": "Server failed to load regulatory data."
}
```

**דוגמת קריאה:**
```javascript
const response = await fetch('/api/generate-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    businessDetails: {
      businessType: 'מסעדה',
      businessSize: 120,
      hasSeating: true,
      hasGas: true,
      hasKitchen: true,
      handlesDairy: true,
      handlesRawMeat: true
    }
  })
});

const data = await response.json();
```

### 2. בדיקת בריאות השרת

**Endpoint:** `GET /api/health`

**תיאור:** בודק שהשרת פועל כראוי.

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-06-12T10:30:00.000Z",
  "message": "Server is running"
}
```

## מבנה נתונים

### BusinessDetails Object
```javascript
{
  businessType: String,        // סוג העסק (חובה)
  businessSize: Number,        // גודל במ"ר (חובה)
  hasSeating: Boolean,         // מקומות ישיבה
  hasGas: Boolean,            // שימוש בגז
  hasKitchen: Boolean,        // מטבח
  hasStorage: Boolean,        // אחסון
  hasParking: Boolean,        // חניה
  hasRefrigeration: Boolean,  // קירור
  hasFreezer: Boolean,        // הקפאה
  hasDelivery: Boolean,       // משלוחים
  hasFoodTransportation: Boolean, // הובלת מזון
  hasAlcohol: Boolean,        // אלכוהול
  handlesRawMeat: Boolean,    // בשר גולמי
  handlesDairy: Boolean,      // מוצרי חלב
  handlesFish: Boolean,       // דגים
  handlesVegetables: Boolean, // ירקות ופירות
  hasTrainedStaff: Boolean,   // צוות מיומן
  hasHealthCertificates: Boolean // תעודות בריאות
}
```

### Requirement Object
```javascript
{
  title: String,              // כותרת הדרישה (עד 50 תווים)
  description: String,        // תיאור מפורט (2-3 שורות)
  priority: Number,           // עדיפות: 6=דחוף, 5=גבוה, 4=בינוני-גבוה, 3=בינוני, 2=נמוך
  notes: String,              // הערות נוספות (אופציונלי)
  recommendations: Array,     // המלצות (כרגע ריק)
  hidePriority: Boolean       // האם להסתיר תווית עדיפות (לסיכום והמלצות)
}
```

### Section Object
```javascript
{
  title: String,              // שם הסעיף
  requirements: Array         // מערך של אובייקטי דרישות
}
```

## אלגוריתם עיבוד הדרישות

### 1. שלב ההתאמה
המערכת עוברת על נתוני הרגולציה ומחפשת התאמות על בסיס:
- סוג העסק
- גודל העסק
- מאפיינים ספציפיים (גז, מטבח, וכו')

### 2. שלב הניקוי
כל דרישה עוברת ניקוי מתקדם:
```javascript
// הסרת ציטוטים משפטיים
.replace(/התש[א-ת]\"[א-ת]\s*[-–]\s*\d{4}/g, '')
// הסרת מספרי תקנות
.replace(/ישראלי\s*\d+/g, '')
// הסרת הפניות בסוגריים
.replace(/\([^)]*\)/g, '')
```

### 3. שלב הקטגוריזציה
המערכת מכילה 16+ קטגוריות דרישות:
- רישיון עסק
- בטיחות אש
- תקני בריאות
- מתקני כיורים
- הכשרת עובדים
- ביטוח עסק
- ועוד...

### 4. שלב איזון העדיפויות
המערכת מבטיחה התפלגות מאוזנת של עדיפויות:
- דחוף (6): 10-20%
- גבוה (5): 20-30%
- בינוני-גבוה (4): 25-35%
- בינוני (3): 20-30%
- נמוך (2): 10-15%

### 5. שלב יצירת הדוח החכם
השימוש ב-OpenAI GPT-3.5-turbo עם:
- טמפרטורה נמוכה (0.3) לעקביות
- הגבלת אורך (1500 טוקנים)
- prompts מותאמים לעברית

## טיפול בשגיאות

### שגיאות נפוצות:
1. **400 - Missing business details:** חסרים פרטי עסק בבקשה
2. **404 - No requirements found:** לא נמצאו דרישות מתאימות
3. **500 - Server error:** שגיאה פנימית בשרת
4. **503 - AI service unavailable:** שירות ה-AI לא זמין

### מנגנון Fallback:
אם ה-AI לא זמין, המערכת מחזירה דוח סטטי עם דרישות בסיסיות:
- השגת רישיון עסק
- אישור משרד הבריאות
- ביטוח אחריות

## אבטחה ומגבלות

### CORS:
השרת מוגדר לקבל בקשות מ:
- `http://localhost:3000` (פיתוח)
- ניתן להגדיר דומיינים נוספים ב-environment variables

### Rate Limiting:
כרגע אין הגבלת קצב, אך מומלץ להוסיף במצב production.

### הגבלות:
- מקסימום 30 דרישות בדוח
- מקסימום 1500 טוקנים ל-AI
- טמפרטורה קבועה 0.3 לעקביות

## דוגמאות שימוש

### דוגמה 1: מסעדה קטנה
```javascript
const smallRestaurant = {
  businessType: 'מסעדה',
  businessSize: 50,
  hasSeating: true,
  hasGas: false,
  hasKitchen: true,
  handlesDairy: true
};
```

### דוגמה 2: בית קפה עם משלוחים
```javascript
const cafeWithDelivery = {
  businessType: 'בית קפה',
  businessSize: 80,
  hasSeating: true,
  hasKitchen: true,
  hasDelivery: true,
  handlesDairy: true,
  hasTrainedStaff: true
};
```

### דוגמה 3: חנות דגים
```javascript
const fishShop = {
  businessType: 'חנות',
  businessSize: 40,
  hasRefrigeration: true,
  hasFreezer: true,
  handlesFish: true,
  hasStorage: true
};
```

המערכת מותאמת להחזיר דוחות ספציפיים ומותאמים לכל סוג עסק! 📊 