// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// הגדרות גלובליות לבדיקות
beforeAll(() => {
  // הגדרות שצריכות לרוץ לפני כל הבדיקות
  console.log('Starting tests...');
});

afterAll(() => {
  // ניקוי אחרי כל הבדיקות
  console.log('Tests completed.');
});

// Mock של fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
); 