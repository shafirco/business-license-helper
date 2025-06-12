import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportView.css';
// Import the shared parsing logic from utils
import { parseContentToRequirements } from '../utils/requirementParser';

function ReportView({ report, onBack, loading }) {
  const navigate = useNavigate();
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [requirementsPerPage] = useState(5);
  const [currentPages, setCurrentPages] = useState({}); // עמוד נפרד לכל סעיף

  useEffect(() => {
    if (!report) {
      navigate('/');
    }
  }, [navigate, report]);

  const getPriorityLabel = (priority) => {
    if (priority >= 6) return 'דחוף';
    if (priority >= 5) return 'גבוה';
    if (priority >= 3) return 'בינוני';
    return 'נמוך';
  };

  const getPriorityClass = (priority) => {
    if (priority >= 6) return 'priority-urgent';
    if (priority >= 5) return 'priority-high';
    if (priority >= 3) return 'priority-medium';
    return 'priority-low';
  };

  const filterRequirements = (requirements) => {
    if (!requirements) return [];
    if (selectedPriority === 'all') return requirements;
    const priorityValue = parseInt(selectedPriority);
    return requirements.filter(req => req.priority >= priorityValue);
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const paginateRequirements = (requirements, sectionIndex) => {
    const currentPage = currentPages[sectionIndex] || 1;
    const startIndex = (currentPage - 1) * requirementsPerPage;
    return requirements.slice(startIndex, startIndex + requirementsPerPage);
  };

  const setCurrentPageForSection = (sectionIndex, page) => {
    setCurrentPages(prev => ({
      ...prev,
      [sectionIndex]: page
    }));
  };

  const printReport = () => {
    // יצירת חלון חדש להדפסה עם כל התוכן
    const printWindow = window.open('', '_blank');
    const allSections = report?.sections || [];
    
    let printContent = `
      <html dir="rtl">
        <head>
          <title>דוח דרישות רגולטוריות</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            .requirement-item { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .requirement-header { font-weight: bold; margin-bottom: 8px; }
            .priority-badge { 
              display: inline-block; 
              padding: 2px 8px; 
              border-radius: 3px; 
              font-size: 12px; 
              margin-right: 10px;
            }
            .priority-urgent { background-color: #ff4444; color: white; }
            .priority-high { background-color: #ffaa44; color: white; }
            .priority-medium { background-color: #ffff44; color: black; }
            .priority-low { background-color: #cccccc; color: black; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            @media print { 
              body { margin: 10px; } 
              .requirement-item { page-break-inside: avoid; }
              .section { page-break-before: auto; page-break-after: auto; }
              h1, h2 { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>דוח דרישות רגולטוריות</h1>
    `;

    allSections.forEach(section => {
      let requirements = filterRequirements(section?.requirements || []);
      if (requirements.length === 0 && section.content) {
        requirements = parseContentToRequirements(section.content, section.title);
        requirements = filterRequirements(requirements);
      }

      printContent += `
        <div class="section">
          <h2>${section.title}</h2>
      `;

      requirements.forEach(req => {
        printContent += `
          <div class="requirement-item">
            <div class="requirement-header">
              ${!req.hidePriority ? `
              <span class="priority-badge ${getPriorityClass(req.priority)}">
                ${getPriorityLabel(req.priority)}
              </span>` : ''}
              ${req.title}
            </div>
            <div class="requirement-content">
              <p>${req.description}</p>
              ${req.notes ? `<p><strong>הערות:</strong> ${req.notes}</p>` : ''}
            </div>
          </div>
        `;
      });

      printContent += '</div>';
    });

    printContent += '</body></html>';
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToJSON = () => {
    // שיפור הייצוא - יצירת קובץ עם שם משמעותי יותר
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `דוח_דרישות_רגולטוריות_${currentDate}.json`;
    
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const RequirementItem = ({ req, isSubRequirement }) => (
    <div className={`requirement-item ${getPriorityClass(req.priority)} ${isSubRequirement ? 'sub-requirement' : ''}`}>
      <div className="requirement-header">
        <h4>{req.title}</h4>
        {!req.hidePriority && (
          <span className={`priority-badge ${getPriorityClass(req.priority)}`}>
            {getPriorityLabel(req.priority)}
          </span>
        )}
      </div>
      <div className="requirement-content">
        <p>{req.description}</p>
        {req.notes && <p className="requirement-notes"><strong>הערות:</strong> {req.notes}</p>}

      </div>
    </div>
  );

  if (!report || loading) {
    return <div className="loading">טוען...</div>;
  }

  // חישוב סטטיסטיקות כוללות
  const allRequirements = report?.sections?.reduce((acc, section) => {
    let requirements = section.requirements || [];
    if (requirements.length === 0 && section.content) {
      requirements = parseContentToRequirements(section.content, section.title);
    }
    return acc.concat(requirements);
  }, []) || [];

  const filteredRequirements = filterRequirements(allRequirements);
  const urgentCount = filteredRequirements.filter(req => req.priority >= 6).length;

  return (
    <div className="report-view">
      <h2>דוח דרישות רגולטוריות</h2>
      
      <div className="report-filters">
        <div className="priority-filter">
          <label>סינון לפי עדיפות:</label>
          <select 
            value={selectedPriority} 
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPages({}); // איפוס עמודים בעת שינוי סינון
            }}
          >
            <option value="all">הכל</option>
            <option value="6">דחוף</option>
            <option value="5">גבוה</option>
            <option value="3">בינוני</option>
            <option value="2">נמוך</option>
          </select>
        </div>
      </div>

      {/* הסיכום פשוט יותר ללא התפלגות עדיפויות */}
      <div className="report-summary">
        <h3>סיכום דרישות</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">סה"כ דרישות מוצגות:</span>
            <span className="stat-value">{filteredRequirements.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">דרישות דחופות:</span>
            <span className="stat-value urgent">{urgentCount}</span>
          </div>
        </div>
      </div>
      
      <div className="report-content">
        {report?.sections?.map((section, sectionIndex) => {
          let requirementsToDisplay = filterRequirements(section?.requirements || []);

          // If section.requirements is empty but section.content exists, parse content
          if (requirementsToDisplay.length === 0 && section.content) {
            requirementsToDisplay = parseContentToRequirements(section.content, section.title);
            requirementsToDisplay = filterRequirements(requirementsToDisplay);
          }

          const currentPage = currentPages[sectionIndex] || 1;
          const totalPages = Math.ceil(requirementsToDisplay.length / requirementsPerPage);
          const paginatedRequirements = paginateRequirements(requirementsToDisplay, sectionIndex);
          const isExpanded = expandedSections[sectionIndex] !== false;

          return (
            <div key={sectionIndex} className="report-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection(sectionIndex)}
              >
                <h3>{section.title} ({requirementsToDisplay.length} דרישות)</h3>
                <span className="section-toggle">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
              
              {isExpanded && (
                <div className="requirements-list">
                  {paginatedRequirements.map((req, reqIndex) => (
                    <RequirementItem 
                      key={`${sectionIndex}-${reqIndex}`} 
                      req={req} 
                      isSubRequirement={req.isSubRequirement}
                    />
                  ))}

                  {requirementsToDisplay.length > requirementsPerPage && (
                    <div className="pagination-controls">
                      <button 
                        onClick={() => setCurrentPageForSection(sectionIndex, Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        → הקודם
                      </button>
                      <span className="pagination-info">
                        עמוד {currentPage} מתוך {totalPages} 
                        (מציג {((currentPage - 1) * requirementsPerPage) + 1}-{Math.min(currentPage * requirementsPerPage, requirementsToDisplay.length)} מתוך {requirementsToDisplay.length})
                      </span>
                      <button 
                        onClick={() => setCurrentPageForSection(sectionIndex, Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="pagination-btn"
                      >
                        הבא ←
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="report-actions">
        <button onClick={onBack} className="back-button action-btn primary">
          ← חזרה לשאלון
        </button>
        <button onClick={printReport} className="print-button action-btn secondary">
          🖨️ הדפס דוח מלא
        </button>
        <button onClick={exportToJSON} className="export-button action-btn secondary">
          📄 ייצא ל-JSON
        </button>
      </div>
    </div>
  );
}

export default ReportView; 
