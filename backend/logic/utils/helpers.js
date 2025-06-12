/**
 * פונקציות עזר כלליות
 */

/**
 * מחלץ עלות משוערת מטקסט
 * @param {string} text
 * @returns {number}
 */
function extractEstimatedCost(text) {
  // דוגמה: "עלות: 1,000 ש"ח" => 1000
  const match = text.match(/עלות[:\s]*([\d,]+)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''));
  }
  return 0;
}

/**
 * מחלץ דדליין מטקסט
 * @param {string} text
 * @returns {string|null}
 */
function extractDeadline(text) {
  // דוגמה: "תאריך יעד: 31/12/2024" => "31/12/2024"
  const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (match) {
    return match[1];
  }
  return null;
}

module.exports = {
  extractEstimatedCost,
  extractDeadline
}; 