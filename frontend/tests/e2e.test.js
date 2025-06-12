const { test, expect } = require('@playwright/test');

// בדיקות תרחישי משתמש
test.describe('תרחישי משתמש', () => {
  test('יצירת דוח למסעדה', async ({ page }) => {
    // כניסה למערכת
    await page.goto('http://localhost:3000');
    
    // מילוי הטופס
    await page.select('#businessType', 'restaurant');
    await page.fill('#size', '100');
    await page.fill('#seatingCapacity', '50');
    await page.check('#gas');
    await page.check('#delivery');
    
    // שליחת הטופס
    await page.click('button[type="submit"]');
    
    // בדיקת הדוח
    await expect(page.locator('.report')).toBeVisible();
    await expect(page.locator('.summary')).toContainText('מסעדה');
    await expect(page.locator('.requirements')).toContainText('גז');
  });

  test('יצירת דוח לבית קפה', async ({ page }) => {
    // כניסה למערכת
    await page.goto('http://localhost:3000');
    
    // מילוי הטופס
    await page.select('#businessType', 'cafe');
    await page.fill('#size', '80');
    await page.fill('#seatingCapacity', '30');
    await page.check('#alcohol');
    
    // שליחת הטופס
    await page.click('button[type="submit"]');
    
    // בדיקת הדוח
    await expect(page.locator('.report')).toBeVisible();
    await expect(page.locator('.summary')).toContainText('בית קפה');
    await expect(page.locator('.requirements')).toContainText('אלכוהול');
  });

  test('יצירת דוח לחנות', async ({ page }) => {
    // כניסה למערכת
    await page.goto('http://localhost:3000');
    
    // מילוי הטופס
    await page.select('#businessType', 'shop');
    await page.fill('#size', '150');
    await page.fill('#seatingCapacity', '0');
    
    // שליחת הטופס
    await page.click('button[type="submit"]');
    
    // בדיקת הדוח
    await expect(page.locator('.report')).toBeVisible();
    await expect(page.locator('.summary')).toContainText('חנות');
    await expect(page.locator('.requirements')).not.toContainText('ישיבה');
  });
});

// בדיקות UI
test.describe('UI', () => {
  test('תמיכה במובייל', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // בדיקת תצוגה מותאמת
    await expect(page.locator('.questionnaire')).toBeVisible();
    await expect(page.locator('input')).toHaveCSS('font-size', '16px');
  });

  test('נגישות', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // בדיקת תגיות ARIA
    await expect(page.locator('input')).toHaveAttribute('aria-label');
    await expect(page.locator('button')).toHaveAttribute('aria-label');
  });

  test('תמיכה ב-RTL', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // בדיקת כיוון טקסט
    await expect(page.locator('body')).toHaveCSS('direction', 'rtl');
  });
});

// בדיקות תקינות קלט
test.describe('תקינות קלט', () => {
  test('שדות חובה', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // שליחת טופס ריק
    await page.click('button[type="submit"]');
    
    // בדיקת הודעות שגיאה
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('שדה חובה');
  });

  test('ערכים תקינים', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // הזנת ערכים לא תקינים
    await page.fill('#size', '-100');
    await page.fill('#seatingCapacity', 'abc');
    
    await page.click('button[type="submit"]');
    
    // בדיקת הודעות שגיאה
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('ערך לא תקין');
  });
});

// בדיקות ניווט
test.describe('ניווט', () => {
  test('חזרה לדף הבית', async ({ page }) => {
    await page.goto('http://localhost:3000/report/123');
    
    // לחיצה על לוגו
    await page.click('.logo');
    
    // בדיקה שחזרנו לדף הבית
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('שמירת דוח', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // מילוי טופס
    await page.select('#businessType', 'restaurant');
    await page.fill('#size', '100');
    await page.click('button[type="submit"]');
    
    // שמירת דוח
    await page.click('.save-report');
    
    // בדיקת הודעת הצלחה
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('הדוח נשמר בהצלחה');
  });
}); 