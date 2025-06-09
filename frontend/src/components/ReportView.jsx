import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportView.css';

function ReportView({ report, onBack, loading }) {
  const navigate = useNavigate();
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    if (!report) {
      navigate('/');
    }
  }, [navigate, report]);

  const getPriorityLabel = (priority) => {
    if (priority >= 6) return 'דחוף';
    if (priority >= 4) return 'גבוה';
    if (priority >= 2) return 'בינוני';
    return 'נמוך';
  };

  const getPriorityClass = (priority) => {
    if (priority >= 6) return 'priority-urgent';
    if (priority >= 4) return 'priority-high';
    if (priority >= 2) return 'priority-medium';
    return 'priority-low';
  };

  const filterRequirements = (requirements) => {
    if (!requirements) return [];
    if (selectedPriority === 'all') return requirements;
    const priorityValue = parseInt(selectedPriority);
    return requirements.filter(req => req.priority >= priorityValue);
  };

  if (!report || loading) {
    return <div className="loading">טוען...</div>;
  }

  return (
    <div className="report-view">
      <h2>דוח דרישות רגולטוריות</h2>
      
      <div className="report-filters">
        <div className="priority-filter">
          <label>סינון לפי עדיפות:</label>
          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">הכל</option>
            <option value="6">דחוף</option>
            <option value="4">גבוה</option>
            <option value="2">בינוני</option>
            <option value="1">נמוך</option>
          </select>
        </div>
      </div>

      <div className="report-summary">
        <h3>סיכום דרישות</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">סה"כ דרישות:</span>
            <span className="stat-value">{report.sections.reduce((acc, section) => acc + section.requirements.length, 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">דרישות דחופות:</span>
            <span className="stat-value urgent">
              {report.sections.reduce((acc, section) => 
                acc + section.requirements.filter(req => req.priority >= 6).length, 0
              )}
            </span>
          </div>
        </div>
      </div>
      
      <div className="report-content">
        {report.sections.map((section, index) => (
          <div key={index} className="report-section">
            <h3>{section.title}</h3>
            <div className="requirements-list">
              {filterRequirements(section.requirements).map((req, reqIndex) => (
                <div key={reqIndex} className={`requirement-item ${getPriorityClass(req.priority)}`}>
                  <div className="requirement-header">
                    <h4>{req.title}</h4>
                    <span className={`priority-badge ${getPriorityClass(req.priority)}`}>
                      {getPriorityLabel(req.priority)}
                    </span>
                  </div>
                  <p className="requirement-description">{req.description}</p>
                  
                  {req.deadline && (
                    <div className="requirement-details">
                      <p className="deadline">
                        <strong>מועד אחרון:</strong> {req.deadline}
                      </p>
                    </div>
                  )}
                  
                  {req.notes && (
                    <div className="requirement-details">
                      <p className="notes">
                        <strong>הערות:</strong> {req.notes}
                      </p>
                    </div>
                  )}

                  {req.recommendations && req.recommendations.length > 0 && (
                    <div className="requirement-recommendations">
                      <h5>המלצות פעולה:</h5>
                      <ul>
                        {req.recommendations.map((rec, recIndex) => (
                          <li key={recIndex}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {req.relatedRequirements && req.relatedRequirements.length > 0 && (
                    <div className="related-requirements">
                      <h5>דרישות קשורות:</h5>
                      <ul>
                        {req.relatedRequirements.map((rel, relIndex) => (
                          <li key={relIndex}>{rel}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="report-actions">
        <button onClick={onBack} className="back-button">
          חזרה לשאלון
        </button>
        <button onClick={() => window.print()} className="print-button">
          הדפס דוח
        </button>
        <button onClick={() => {
          const element = document.createElement('a');
          const file = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
          element.href = URL.createObjectURL(file);
          element.download = 'דוח_דרישות.json';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }} className="export-button">
          ייצא ל-JSON
        </button>
      </div>
    </div>
  );
}

export default ReportView; 
