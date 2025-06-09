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
    hasAlcohol: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ businessDetails: formData });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="questionnaire">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="businessType">סוג העסק:</label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
          >
            <option value="">בחר סוג עסק</option>
            <option value="restaurant">מסעדה</option>
            <option value="cafe">קפה</option>
            <option value="food_truck">מזנון נייד</option>
            <option value="bakery">מאפייה</option>
            <option value="grocery">מכולת</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="businessSize">גודל העסק (מ"ר):</label>
          <input
            type="number"
            id="businessSize"
            name="businessSize"
            value={formData.businessSize}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="hasSeating"
              checked={formData.hasSeating}
              onChange={handleChange}
            />
            יש מקומות ישיבה
          </label>
        </div>

        {formData.hasSeating && (
          <div className="form-group">
            <label htmlFor="seatingCapacity">מספר מקומות ישיבה:</label>
            <input
              type="number"
              id="seatingCapacity"
              name="seatingCapacity"
              value={formData.seatingCapacity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        )}

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="hasGas"
              checked={formData.hasGas}
              onChange={handleChange}
            />
            שימוש בגז
          </label>
        </div>

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
              name="hasAlcohol"
              checked={formData.hasAlcohol}
              onChange={handleChange}
            />
            מכירת משקאות אלכוהוליים
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'מעבד...' : 'צור דוח'}
        </button>
      </form>
    </div>
  );
}

export default Questionnaire; 
