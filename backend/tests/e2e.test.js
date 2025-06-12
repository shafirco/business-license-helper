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

// בדיקות ביצועים
test.describe('ביצועים', () => {
  test('זמן תגובה מהיר', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.select('#businessType', 'restaurant');
    await page.fill('#size', '100');
    await page.click('button[type="submit"]');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(2000);
  });

  test('זמינות גבוהה', async ({ page }) => {
    const requests = Array(100).fill().map(() => 
      fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          businessType: 'restaurant',
          size: 100
        })
      })
    );
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.ok).length;
    
    expect(successCount).toBe(100);
  });
});

// בדיקות אבטחה
test.describe('אבטחה', () => {
  test('Rate Limiting', async ({ page }) => {
    const requests = Array(101).fill().map(() => 
      fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          businessType: 'restaurant',
          size: 100
        })
      })
    );
    
    const responses = await Promise.all(requests);
    const blockedCount = responses.filter(r => r.status === 429).length;
    
    expect(blockedCount).toBeGreaterThan(0);
  });

  test('הגנה מפני XSS', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // ניסיון להזריק סקריפט
    await page.fill('#size', '<script>alert("XSS")</script>');
    await page.click('button[type="submit"]');
    
    // בדיקה שאין התראה
    const alerts = await page.evaluate(() => {
      return window.alert;
    });
    
    expect(alerts).toBeUndefined();
  });

  test('הגנה מפני SQL Injection', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // ניסיון להזריק SQL
    await page.fill('#size', "100'; DROP TABLE users; --");
    await page.click('button[type="submit"]');
    
    // בדיקה שהמערכת עדיין עובדת
    await expect(page.locator('.report')).toBeVisible();
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
}); 