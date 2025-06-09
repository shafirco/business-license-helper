import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * בדיקות בסיסיות לקומפוננטת App
 */
describe('App Component', () => {
  // בדיקה שהקומפוננטה נטענת בהצלחה
  test('renders without crashing', () => {
    render(<App />);
  });

  // בדיקה שהכותרת הראשית מוצגת
  test('renders main heading', () => {
    render(<App />);
    const heading = screen.getByText(/מערכת לסיוע בהתאמת דרישות רישוי/i);
    expect(heading).toBeInTheDocument();
  });

  // בדיקה שהתיאור מוצג
  test('renders description', () => {
    render(<App />);
    const description = screen.getByText(/מערכת חכמה לסיוע לבעלי עסקים/i);
    expect(description).toBeInTheDocument();
  });
}); 