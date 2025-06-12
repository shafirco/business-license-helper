const {
  generateSmartReport,
  setOpenAIInstance,
  createOpenAI
} = require('./aiService');

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

describe('aiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset OpenAI instance
    setOpenAIInstance(mockOpenAI);
  });

  describe('setOpenAIInstance', () => {
    it('should set valid OpenAI instance', () => {
      const validInstance = {
        chat: {
          completions: {
            create: jest.fn()
          }
        }
      };
      
      expect(() => setOpenAIInstance(validInstance)).not.toThrow();
    });

    it('should throw error for invalid instance', () => {
      expect(() => setOpenAIInstance(null)).toThrow('אינסטנס OpenAI לא תקין');
      expect(() => setOpenAIInstance({})).toThrow('אינסטנס OpenAI לא תקין');
      expect(() => setOpenAIInstance({ chat: {} })).toThrow('אינסטנס OpenAI לא תקין');
    });
  });

  describe('generateSmartReport', () => {
    const mockRequirements = [
      {
        id: '1.1',
        title: 'דרישות בטיחות',
        requirements: ['דרישה 1', 'דרישה 2']
      }
    ];

    const mockBusinessDetails = {
      businessType: 'מסעדה',
      businessSize: 'בינוני',
      hasSeating: true,
      hasGas: true
    };

    it('should generate report successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'סיכום',
              urgentRequirements: ['דרישה 1'],
              recommendations: ['המלצה 1'],
              actionSteps: ['צעד 1'],
              importantNotes: ['הערה 1']
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await generateSmartReport(mockRequirements, mockBusinessDetails);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('urgentRequirements');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('actionSteps');
      expect(result).toHaveProperty('importantNotes');
    });

    it('should throw error for invalid requirements', async () => {
      await expect(generateSmartReport(null, mockBusinessDetails))
        .rejects
        .toThrow('דרישות לא תקינות');
      
      await expect(generateSmartReport('not an array', mockBusinessDetails))
        .rejects
        .toThrow('דרישות לא תקינות');
    });

    it('should throw error for invalid business details', async () => {
      await expect(generateSmartReport(mockRequirements, null))
        .rejects
        .toThrow('פרטי העסק לא תקינים');
      
      await expect(generateSmartReport(mockRequirements, 'not an object'))
        .rejects
        .toThrow('פרטי העסק לא תקינים');
    });

    it('should throw error if OpenAI returns invalid response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: null
          }
        }]
      });

      await expect(generateSmartReport(mockRequirements, mockBusinessDetails))
        .rejects
        .toThrow('לא התקבלה תשובה מ-OpenAI');
    });
  });

  describe('createOpenAI', () => {
    it('should throw error if API key is not set', () => {
      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => createOpenAI()).toThrow('OPENAI_API_KEY לא מוגדר בסביבה');

      process.env.OPENAI_API_KEY = originalEnv;
    });
  });
}); 