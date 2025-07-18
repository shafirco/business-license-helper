# מבנה הנתונים

תיקייה זו מכילה את כל המידע הסטטי של המערכת.

## מבנה התיקיות

- `raw/` - מכילה את קבצי המקור של המידע (למשל, קבצי Word, PDF)
- `processed/` - מכילה את המידע המעובד בפורמט JSON

## קבצי מידע

### regulations.json
קובץ זה מכיל את כל התקנות והדרישות לעסקי מזון. המבנה שלו הוא:

```json
{
  "sections": [
    {
      "id": "1.1",
      "title": "כותרת הסעיף",
      "content": "תוכן הסעיף",
      "requirements": [
        {
          "text": "טקסט הדרישה",
          "category": "קטגוריה"
        }
      ]
    }
  ]
}
```

## עדכון המידע

1. הוסף את קובץ המקור לתיקיית `raw/`
2. הרץ את סקריפט העיבוד:
   ```bash
   node backend/logic/processDoc.js
   ```
3. המידע המעובד יישמר בתיקיית `processed/` 