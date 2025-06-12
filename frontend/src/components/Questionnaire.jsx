import React, { useState } from 'react';
import './Questionnaire.css';

function Questionnaire({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    businessType: '',
    businessSize: '',
    hasSeating: false,
    seatingCapacity: 0,
    hasGas: false,
    hasDelivery: false,
    hasAlcohol: false,
    hasKitchen: false,
    hasStorage: false,
    hasParking: false,
    hasFoodTransportation: false,
    hasRefrigeration: false,
    hasFreezer: false,
    handlesRawMeat: false,
    handlesDairy: false,
    handlesFish: false,
    handlesVegetables: false,
    hasTrainedStaff: false,
    hasHealthCertificates: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing/selecting
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.businessType) {
      newErrors.businessType = 'נא לבחור סוג עסק';
    }
    
    if (!formData.businessSize || formData.businessSize <= 0) {
      newErrors.businessSize = 'נא להזין גודל עסק תקין';
    }
    
    if (formData.hasSeating && (!formData.seatingCapacity || formData.seatingCapacity <= 0)) {
      newErrors.seatingCapacity = 'נא להזין מספר מקומות ישיבה תקין';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({ businessDetails: formData });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="questionnaire">
      <div className="questionnaire-header">
        <h2>שאלון הערכת רישוי עסק</h2>
        <p>אנא מלא את הפרטים הבאים כדי לקבל הערכה מותאמת אישית של הדרישות הרגולטוריות לעסק שלך</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>פרטים בסיסיים</h3>
          
          <div className="form-group">
            <label htmlFor="businessType">סוג העסק: <span className="required">*</span></label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className={errors.businessType ? 'error' : ''}
            >
              <option value="">בחר סוג עסק</option>
              <option value="restaurant">מסעדה</option>
              <option value="cafe">בית קפה / קפיטריה</option>
              <option value="food_truck">מזנון נייד / פודטרק</option>
              <option value="bakery">מאפייה / בית חרושת ללחם</option>
              <option value="grocery">מכולת / מרכול</option>
              <option value="butcher">קצבייה</option>
              <option value="dairy">חנות מוצרי חלב</option>
              <option value="fish">חנות דגים</option>
              <option value="vegetables">חנות ירקות ופירות</option>
            </select>
            {errors.businessType && <span className="error-text">{errors.businessType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="businessSize">גודל העסק (מ"ר): <span className="required">*</span></label>
            <input
              type="number"
              id="businessSize"
              name="businessSize"
              value={formData.businessSize}
              onChange={handleChange}
              required
              min="1"
              placeholder="לדוגמה: 50"
              className={errors.businessSize ? 'error' : ''}
            />
            {errors.businessSize && <span className="error-text">{errors.businessSize}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>מתקנים ושירותים</h3>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="hasSeating"
                checked={formData.hasSeating}
                onChange={handleChange}
              />
              יש מקומות ישיבה ללקוחות
            </label>
          </div>

          {formData.hasSeating && (
            <div className="form-group">
              <label htmlFor="seatingCapacity">מספר מקומות ישיבה: <span className="required">*</span></label>
              <input
                type="number"
                id="seatingCapacity"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                required
                min="1"
                placeholder="לדוגמה: 30"
                className={errors.seatingCapacity ? 'error' : ''}
              />
              {errors.seatingCapacity && <span className="error-text">{errors.seatingCapacity}</span>}
            </div>
          )}

          <div className="checkbox-grid">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasGas"
                  checked={formData.hasGas}
                  onChange={handleChange}
                />
                שימוש בגז לבישול
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasKitchen"
                  checked={formData.hasKitchen}
                  onChange={handleChange}
                />
                יש מטבח לבישול
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasStorage"
                  checked={formData.hasStorage}
                  onChange={handleChange}
                />
                יש מחסן / אחסון
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasParking"
                  checked={formData.hasParking}
                  onChange={handleChange}
                />
                יש מקומות חניה
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasRefrigeration"
                  checked={formData.hasRefrigeration}
                  onChange={handleChange}
                />
                יש מקרור / מקפיא
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasFreezer"
                  checked={formData.hasFreezer}
                  onChange={handleChange}
                />
                יש הקפאה עמוקה
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>שירותים מיוחדים</h3>
          
          <div className="checkbox-grid">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasDelivery"
                  checked={formData.hasDelivery}
                  onChange={handleChange}
                />
                שירותי משלוחים
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasFoodTransportation"
                  checked={formData.hasFoodTransportation}
                  onChange={handleChange}
                />
                הובלת מזון
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasAlcohol"
                  checked={formData.hasAlcohol}
                  onChange={handleChange}
                />
                מכירת משקאות אלכוהוליים
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>סוגי מזון (בחר רק אם רלוונטי)</h3>
          
          <div className="checkbox-grid">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="handlesRawMeat"
                  checked={formData.handlesRawMeat}
                  onChange={handleChange}
                />
                טיפול בבשר גולמי
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="handlesDairy"
                  checked={formData.handlesDairy}
                  onChange={handleChange}
                />
                עבודה עם מוצרי חלב
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="handlesFish"
                  checked={formData.handlesFish}
                  onChange={handleChange}
                />
                עבודה עם דגים / פירות ים
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="handlesVegetables"
                  checked={formData.handlesVegetables}
                  onChange={handleChange}
                />
                עבודה עם ירקות ופירות טריים
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>צוות ועובדים</h3>
          
          <div className="checkbox-grid">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasTrainedStaff"
                  checked={formData.hasTrainedStaff}
                  onChange={handleChange}
                />
                יש עובדים מוכשרים בתחום
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="hasHealthCertificates"
                  checked={formData.hasHealthCertificates}
                  onChange={handleChange}
                />
                יש תעודות בריאות לעובדים
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                מעבד נתונים...
              </>
            ) : (
              'צור דוח דרישות מותאם אישית'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Questionnaire; 
