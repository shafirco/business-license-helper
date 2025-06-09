import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Questionnaire from './components/Questionnaire';
import ReportView from './components/ReportView';
import './App.css';

function App() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending request to server...');
      const response = await fetch('http://localhost:3001/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      console.log('Received response:', data);
      setReport(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'אירעה שגיאה בתקשורת עם השרת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>מערכת לסיוע בהתאמת רישוי עסק</h1>
        </header>
        <main className="app-main">
          {!report ? (
            <Questionnaire onSubmit={handleSubmit} loading={loading} />
          ) : (
            <ReportView 
              report={report} 
              onBack={() => setReport(null)}
              loading={loading}
            />
          )}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>סגור</button>
            </div>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App; 
