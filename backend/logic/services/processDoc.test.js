const fs = require('fs');
const path = require('path');
const {
  processDocument,
  parseTextToSections,
  containsKeywords,
  extractEstimatedCost,
  extractDeadline
} = require('./processDoc');

// Mock fs module
jest.mock('fs');
jest.mock('mammoth');

describe('processDoc Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('processDocument', () => {
    it('should process a valid document successfully', async () => {
      // Mock data
      const mockText = '1.1 כותרת\nתוכן\n- דרישה 1\n- דרישה 2';
      const mockResult = { value: mockText };
      
      // Mock mammoth
      require('mammoth').extractRawText.mockResolvedValue(mockResult);
      
      // Mock fs
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});
      
      const result = await processDocument('input.docx', 'output.json');
      
      expect(result).toHaveProperty('sections');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0]).toHaveProperty('id', '1.1');
      expect(result.sections[0]).toHaveProperty('title', 'כותרת');
      expect(result.sections[0].requirements).toHaveLength(2);
    });

    it('should throw error if input file does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      
      await expect(processDocument('nonexistent.docx', 'output.json'))
        .rejects
        .toThrow('הקובץ nonexistent.docx לא נמצא');
    });

    it('should throw error if document is empty', async () => {
      fs.existsSync.mockReturnValue(true);
      require('mammoth').extractRawText.mockResolvedValue({ value: '' });
      
      await expect(processDocument('empty.docx', 'output.json'))
        .rejects
        .toThrow('הקובץ ריק או לא תקין');
    });
  });

  describe('parseTextToSections', () => {
    it('should parse text into sections correctly', () => {
      const text = '1.1 כותרת ראשונה\nתוכן ראשון\n- דרישה 1\n- דרישה 2\n\n1.2 כותרת שנייה\nתוכן שני';
      
      const result = parseTextToSections(text);
      
      expect(result).toHaveProperty('sections');
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0]).toHaveProperty('id', '1.1');
      expect(result.sections[1]).toHaveProperty('id', '1.2');
    });

    it('should throw error for invalid input', () => {
      expect(() => parseTextToSections(null)).toThrow('טקסט לא תקין');
      expect(() => parseTextToSections(123)).toThrow('טקסט לא תקין');
    });
  });

  describe('containsKeywords', () => {
    it('should find keywords in text', () => {
      const text = 'זה טקסט עם מילות מפתח';
      const keywords = ['מילות', 'מפתח'];
      
      expect(containsKeywords(text, keywords)).toBe(true);
    });

    it('should not find keywords if none exist', () => {
      const text = 'זה טקסט רגיל';
      const keywords = ['מילות', 'מפתח'];
      
      expect(containsKeywords(text, keywords)).toBe(false);
    });

    it('should throw error for invalid input', () => {
      expect(() => containsKeywords(null, ['keyword'])).toThrow('פרמטרים לא תקינים');
      expect(() => containsKeywords('text', null)).toThrow('פרמטרים לא תקינים');
      expect(() => containsKeywords('text', 'not an array')).toThrow('פרמטרים לא תקינים');
    });
  });

  describe('extractEstimatedCost', () => {
    it('should extract cost from text', () => {
      expect(extractEstimatedCost('עלות: 1,000 שח')).toBe(1000);
      expect(extractEstimatedCost('עלות: 10,000,000 שח')).toBe(10000000);
    });

    it('should return 0 if no cost found', () => {
      expect(extractEstimatedCost('טקסט ללא עלות')).toBe(0);
      expect(extractEstimatedCost('')).toBe(0);
    });
  });

  describe('extractDeadline', () => {
    it('should extract deadline from text', () => {
      expect(extractDeadline('תאריך יעד: 31/12/2024')).toBe('31/12/2024');
      expect(extractDeadline('יש להגיש עד 01/01/2025')).toBe('01/01/2025');
    });

    it('should return null if no deadline found', () => {
      expect(extractDeadline('טקסט ללא תאריך')).toBe(null);
      expect(extractDeadline('')).toBe(null);
    });
  });
}); 