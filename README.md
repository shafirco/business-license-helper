# מערכת הערכת רישוי עסקים

## תיאור הפרויקט ומטרותיו
מערכת זו נועדה לסייע לבעלי עסקים בישראל להבין את דרישות הרישוי הרלוונטיות לעסק שלהם. המערכת מקבלת מידע בסיסי על העסק באמצעות שאלון דיגיטלי, מפעילה מנוע התאמה לזיהוי סעיפי רגולציה רלוונטיים, ולאחר מכן משתמשת במודל שפה גדול (LLM) כדי ליצור דוח מותאם אישית, ברור ונגיש, המפרט את הדרישות, המלצות וצעדים מעשיים.

המטרה העיקרית היא לתרגם "שפת חוק" מורכבת לשפה עסקית מובנת, ולאפשר לבעלי עסקים לקבל תמונה ברורה של חובותיהם הרגולטוריות.

## ארכיטקטורת המערכת

המערכת בנויה משלושה חלקים עיקריים:
1.  **Frontend (React):** ממשק משתמש אינטראקטיבי המאפשר למשתמשים למלא שאלון ולצפות בדוח המותאם אישית.
2.  **Backend (Node.js + Express):** שרת API המטפל בלוגיקת העסק, כולל טעינת נתוני הרגולציה, הפעלת מנוע ההתאמה, ואינטגרציה עם מודל ה-AI.
3.  **AI Integration (OpenAI GPT-4):** שימוש ב-API של OpenAI ליצירת הדוח החכם, סיכום והמלצות.

נתוני הרגולציה מאוחסנים כרגע בקובץ JSON סטטי.

## הוראות התקנה והרצה

כדי להריץ את המערכת באופן מקומי, בצע את השלבים הבאים:

### דרישות קדם:
*   Node.js (מומלץ v14.x ומעלה)
*   npm (מגיע עם Node.js)
*   מפתח API של OpenAI (יש להשיג מ-OpenAI)

### 1. שיבוט המאגר (Repository)
```bash
git clone https://github.com/shafirco/business-license-helper
cd business-license-helper # או לתיקייה בה שיבטת את הפרויקט
```

### 2. הגדרת משתני סביבה (Environment Variables)
צור קובץ `.env` בתיקיית `backend/` (ליד `server.js`) והוסף בו את מפתח ה-API של OpenAI:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```
**חשוב:** 
- החלף את `your_openai_api_key_here` במפתח ה-API האמיתי שלך
- ניתן לקבל מפתח API ב-[OpenAI Platform](https://platform.openai.com/api-keys)
- וודא שהמפתח חדש ותקף

### 3. התקנה מהירה ל-Windows (PowerShell)
אם אתה משתמש ב-Windows ו-PowerShell, הפעל את הסקריפט המובנה:
```powershell
.\setup-windows.ps1
```
הסקריפט יתקין אוטומטית את כל התלויות ויבדוק שהכל מוכן לפעולה.

### 4. הפעלה מהירה (מהתיקייה הראשית)
לאחר ההתקנה, ניתן להפעיל את השרתים ישירות מהתיקייה הראשית:
```bash
# לפרונט אנד
npm run start:frontend

# לבקאנד
npm run start:backend

# לפיתוח (backend עם nodemon)
npm run start:dev

# להתקנה של כל התלויות
npm run install:all
```

### 5. התקנה ידנית - Backend
נווט לתיקיית `backend` והתקן את התלויות:
```bash
cd backend
npm install
```
לאחר מכן, הפעל את השרת:
```bash
npm start
```
השרת יפעל בכתובת `http://localhost:3001`.

### 6. התקנה ידנית - Frontend
פתח חלון טרמינל חדש. נווט לתיקיית `frontend` והתקן את התלויות:
```bash
cd frontend
npm install
```
לאחר מכן, הפעל את יישום ה-React:
```bash
npm start
```
הפרונט אנד ייפתח אוטומטית בדפדפן בכתובת `http://localhost:3000`.

**הערה ל-Windows:** 
אם אתה משתמש ב-PowerShell ומקבל שגיאה עם `&&`, הפעל את הפקודות בנפרד או השתמש בסקריפט המובנה.

### שימוש במערכת
לאחר שהפרונט אנד נטען, תוכל למלא את השאלון עם פרטי העסק. לאחר לחיצה על "צור דוח", המערכת תשלח בקשה ל-Backend, ה-Backend ישתמש ב-AI ליצירת הדוח, והוא יוצג בממשק המשתמש.

## רשימת Dependencies וגרסאות

### Backend (backend/package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.20.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend (frontend/package.json)
```json
{
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  }
}
```

## תכונות עיקריות

- שאלון אינטראקטיבי לאיסוף פרטי העסק
- מנוע ניתוח חכם של דרישות רגולטוריות עם 16+ קטגוריות
- דוח מפורט עם כותרות לוגיות ומשמעותיות
- דרישות ברורות ב-2-3 שורות ללא המלצות מיותרות
- מערכת עדיפויות מאוזנת: דחוף (אדום), גבוה (כתום), בינוני (כחול), נמוך (אפור)
- חיפוש וסינון מתקדם לפי עדיפות
- פיגינציה חכמה עם ניווט בין עמודים
- הסרת כפילויות וניקוי טקסטים מרשויות
- דוח AI משופר עם סיכום בעברית ללא מספור
- הדפסה נקייה ללא עמודים ריקים
- תמיכה בדרישות משרד הבריאות ומשטרת ישראל
- ממשק משתמש מותאם לעברית עם תמיכה בטקסט רב-שורתי

## שימוש

1. פתח את הדפדפן בכתובת `http://localhost:3000`
2. מלא את פרטי העסק בשאלון:
   - סוג העסק
   - גודל העסק (במ"ר)
   - האם יש מקומות ישיבה
   - האם יש שימוש בגז
   - אפשרויות נוספות (משלוחים, אלכוהול וכו')
3. לחץ על "צור דוח דרישות"
4. קרא את הדוח המפורט שנוצר
5. הדפס את הדוח או שמור אותו

## פיתוח

- Frontend: React עם React Router
- Backend: Node.js עם Express
- עיבוד טקסט: OpenAI GPT-4
- עיבוד מסמכים: Mammoth.js

## פתרון בעיות נפוצות

### שגיאות התקנה
1. **"react-scripts is not recognized"** - וודא שהרצת `npm install` בתיקיית frontend
2. **"Cannot find module"** - נסה למחוק את node_modules ולהריץ `npm install` מחדש
3. **שגיאות אבטחה (npm audit)** - ניתן להתעלם מהן או להריץ `npm audit fix` (ללא --force)

### שגיאות פעולה
1. **שרת לא עונה** - וודא שה-backend רץ על פורט 3001
2. **שגיאת CORS** - בדוק שה-CORS_ORIGIN מוגדר נכון ב-.env
3. **שגיאת OpenAI** - וודא שמפתח ה-API תקף ויש לך זיכוי

### שגיאות Windows/PowerShell
1. **"&& is not a valid statement separator"** - השתמש בסקריפט setup-windows.ps1
2. **Execution Policy errors** - הפעל: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## רישיון

MIT 

## תיעוד API

### נקודות קצה

#### 1. יצירת דוח חכם
```
POST /api/generate-report
```
מקבל פרטי עסק ומייצר דוח מותאם אישית.

**פרמטרים:**
```json
{
  "businessType": "string",     // סוג העסק
  "businessSize": "number",     // גודל העסק במ"ר
  "hasSeating": "boolean",      // האם יש מקום ישיבה
  "hasGas": "boolean"          // האם יש שימוש בגז
}
```

**תשובה:**
```json
{
  "summary": "string",          // סיכום כללי
  "urgentRequirements": [],     // דרישות דחופות
  "recommendations": [],        // המלצות
  "actionSteps": [],           // צעדים מעשיים
  "importantNotes": []         // הערות חשובות
}
```

#### 2. קבלת סעיפי רגולציה רלוונטיים
```
GET /api/regulatory-sections
```
מחזיר את כל סעיפי הרגולציה הרלוונטיים לעסק.

**תשובה:**
```json
[
  {
    "id": "string",            // מספר הסעיף
    "title": "string",         // כותרת הסעיף
    "requirements": [],        // דרישות
    "priority": "number"       // רמת דחיפות (1-10)
  }
]
```

### שימוש ב-AI

המערכת משתמשת ב-OpenAI GPT-4 ליצירת דוחות מותאמים אישית. המודל מקבל את פרטי העסק וסעיפי הרגולציה הרלוונטיים, ומפיק דוח מפורט הכולל:
- סיכום כללי של הדרישות
- רשימת דרישות דחופות
- המלצות לפעולה
- צעדים מעשיים לביצוע
- הערות חשובות

### Prompts

המערכת משתמשת בפרומפטים הבאים:

1. **פרומפט ליצירת דוח:**
```
פרטי העסק:
[פרטי העסק]

דרישות רלוונטיות:
[רשימת דרישות]

צור דוח קצר וממוקד:
1. סיכום (2-3 משפטים)
2. דרישות דחופות (3-4 נקודות)
3. המלצות (2-3 נקודות)
4. צעדים מעשיים (2-3 נקודות)
5. הערות חשובות (1-2 נקודות)
```

## תיעוד מפורט

המערכת כוללת תיעוד מפורט המכסה את כל ההיבטים:

- [תיעוד טכני](docs/TECHNICAL_DOCUMENTATION.md) - פירוט טכני של המערכת, ארכיטקטורה, רכיבים וזרימת נתונים
- [מדריך משתמש](docs/USER_GUIDE.md) - מדריך מפורט למשתמשי המערכת
- [יומן פיתוח](docs/DEVELOPMENT_LOG.md) - תיעוד אתגרים, פתרונות ולקחים מתהליך הפיתוח

## בדיקות

### בדיקות יחידה
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### בדיקות E2E
```bash
# Backend
cd backend
npm run test:e2e

# Frontend
cd frontend
npm run test:e2e
```

### בדיקות UI
```bash
# Backend
cd backend
npm run test:e2e:ui

# Frontend
cd frontend
npm run test:e2e:ui
```

### בדיקות דיבאג
```bash
# Backend
cd backend
npm run test:e2e:debug

# Frontend
cd frontend
npm run test:e2e:debug
```

## תיעוד

- [מדריך משתמש](docs/USER_GUIDE.md)
- [תיעוד טכני](docs/SYSTEM_OVERVIEW.md)
- [דוגמאות הרצה ופלטים](docs/SAMPLE_RUNS.md) - **חדש!**
- [תיעוד API](docs/API_AND_DATA_STRUCTURE.md)
- [תיעוד AI](docs/AI_USAGE.md)
- [תיעוד בדיקות](docs/TESTING.md)

## פיתוח

### מבנה הפרויקט
```
.
├── backend/           # שרת Node.js
├── frontend/          # אפליקציית React
├── data/             # קבצי נתונים
└── docs/             # תיעוד
```

### טכנולוגיות
- Frontend: React, Material-UI
- Backend: Node.js, Express
- AI: OpenAI GPT-4
- בדיקות: Jest, Playwright

### CI/CD
- GitHub Actions
- בדיקות אוטומטיות
- דיפלוי אוטומטי

## תרומה

1. צור fork של הפרויקט
2. צור ענף חדש (`git checkout -b feature/amazing-feature`)
3. בצע commit לשינויים (`git commit -m 'Add amazing feature'`)
4. דחוף לענף (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## רישיון

MIT

## יצירת קשר

- אימייל: support@business-license-helper.com
- טלפון: 03-1234567
