# מערכת הערכת רישוי עסקים - הגדרת סביבה ל-Windows
# Business License Helper - Windows Setup Script

Write-Host "מתחיל הגדרת המערכת..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js נמצא: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "שגיאה: Node.js לא מותקן. אנא התקן את Node.js מ-https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm נמצא: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "שגיאה: npm לא מותקן" -ForegroundColor Red
    exit 1
}

Write-Host "מתחיל התקנת dependencies ל-backend..." -ForegroundColor Yellow
Set-Location "backend"

# Install backend dependencies
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "שגיאה בהתקנת dependencies של backend" -ForegroundColor Red
    exit 1
}

Write-Host "backend dependencies הותקנו בהצלחה" -ForegroundColor Green

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "יוצר קובץ .env לדוגמה..." -ForegroundColor Yellow
    @"
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "נוצר קובץ .env - אנא עדכן את OPENAI_API_KEY עם המפתח האמיתי שלך" -ForegroundColor Yellow
}

Set-Location ".."
Write-Host "מתחיל התקנת dependencies ל-frontend..." -ForegroundColor Yellow
Set-Location "frontend"

# Install frontend dependencies
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "שגיאה בהתקנת dependencies של frontend" -ForegroundColor Red
    exit 1
}

Write-Host "frontend dependencies הותקנו בהצלחה" -ForegroundColor Green

# Try to fix security vulnerabilities without breaking changes
Write-Host "מתקן בעיות אבטחה..." -ForegroundColor Yellow
npm audit fix

Set-Location ".."

Write-Host @"

✅ ההגדרה הושלמה בהצלחה!

להפעלת המערכת:

1. בטרמינל אחד, הפעל את ה-backend:
   cd backend
   npm start

2. בטרמינל נוסף, הפעל את ה-frontend:
   cd frontend
   npm start

3. פתח דפדפן בכתובת: http://localhost:3000

📋 תיקונים שבוצעו לאחרונה:
✅ התפלגות עדיפויות מאוזנת (דחוף, גבוה, בינוני, נמוך)
✅ דרישות תמציתיות ומובנות
✅ הדפסה מושלמת של כל התוכן
✅ ניווט משופר בין עמודים
✅ כפתורי פעולה מעוצבים

חשוב: וודא שעדכנת את המפתח ב-backend/.env לפני הפעלת הקוד!
"@ -ForegroundColor Green 