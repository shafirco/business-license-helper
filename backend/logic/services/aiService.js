const { OpenAI } = require('openai');
require('dotenv').config();

const openaiInstance = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function createPrompt(requirements, businessDetails) {
    // Extract business details efficiently and translate to Hebrew
    let businessType = String(businessDetails.businessType || 'לא צוין');
    
    // Translate common English business types to Hebrew
    const businessTypeMap = {
        'restaurant': 'מסעדה',
        'cafe': 'בית קפה', 
        'shop': 'חנות',
        'store': 'חנות',
        'fish': 'עסק דגים',
        'meat': 'עסק בשר',
        'bakery': 'מאפייה',
        'supermarket': 'סופרמרקט',
        'market': 'שוק',
        'office': 'משרד'
    };
    
    // Convert to Hebrew if it's in English
    businessType = businessTypeMap[businessType.toLowerCase()] || businessType;
    
    const businessSize = String(businessDetails.businessSize || 'לא צוין');
    
    // Create concise features list
    const features = Object.entries(businessDetails)
        .filter(([key, value]) => value === true && key !== 'businessType' && key !== 'businessSize')
        .map(([key]) => {
            // Map technical keys to Hebrew descriptions
            const keyMap = {
                hasSeating: 'מקומות ישיבה',
                hasGas: 'שימוש בגז',
                hasKitchen: 'מטבח',
                hasStorage: 'אחסון',
                hasParking: 'חניה',
                hasRefrigeration: 'קירור',
                hasFreezer: 'הקפאה',
                hasDelivery: 'משלוחים',
                hasFoodTransportation: 'הובלת מזון',
                hasAlcohol: 'אלכוהול',
                handlesRawMeat: 'בשר גולמי',
                handlesDairy: 'מוצרי חלב',
                handlesFish: 'דגים',
                handlesVegetables: 'ירקות ופירות',
                hasTrainedStaff: 'צוות מיומן',
                hasHealthCertificates: 'תעודות בריאות'
            };
            return keyMap[key] || key;
        })
        .join(', ');

    // Flatten all requirements and prioritize
    let allRequirements = [];
    if (Array.isArray(requirements)) {
        requirements.forEach(section => {
            if (section.requirements && Array.isArray(section.requirements)) {
                allRequirements = allRequirements.concat(section.requirements);
            }
        });
    }

    // Calculate business complexity to determine number of requirements
    const complexityFeatures = [
        'hasKitchen', 'hasGas', 'hasRefrigeration', 'hasFreezer', 'handlesRawMeat', 
        'handlesDairy', 'handlesFish', 'hasAlcohol', 'hasDelivery', 'hasFoodTransportation'
    ];
    const businessComplexity = complexityFeatures.filter(feature => businessDetails[feature]).length;
    const businessSizeNum = parseInt(businessSize) || 50;
    
    // Dynamic requirement count based on complexity (5-15 requirements)
    let maxRequirements = 5; // Base
    if (businessComplexity >= 3) maxRequirements += 3;
    if (businessComplexity >= 6) maxRequirements += 3;
    if (businessSizeNum > 100) maxRequirements += 2;
    if (businessSizeNum > 200) maxRequirements += 2;
    maxRequirements = Math.min(maxRequirements, 15); // Cap at 15

    // Filter for highest priority requirements and sort
    const criticalRequirements = allRequirements
        .filter(req => req.priority >= 4) // Lower threshold for more variety
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxRequirements);

    // Create very concise requirements summary
    const requirementsSummary = criticalRequirements
        .map((req, index) => {
            const title = String(req.title || '').substring(0, 40);
            const desc = String(req.description || '').substring(0, 60);
            return `${index + 1}. ${title}${desc ? ' - ' + desc : ''}`;
        })
        .join('\n');

    // Very concise prompt - emphasizing Hebrew only
    return `עסק: ${businessType}, גודל: ${businessSize} מ"ר, תכונות: ${features || 'אין'}

דרישות קריטיות:
${requirementsSummary}

צור דוח קצר עם:
- סיכום: טקסט רציף של 2-3 משפטים בעברית בלבד (ללא מספור, ללא מילים באנגלית, ללא מירכאות, תשתמש רק בשמות העסק בעברית)
- דרישות דחופות: רשימה של 3 פריטים מקסימום עם מספור
- המלצות: רשימה של 3 פריטים מקסימום עם מספור

פורמט: הסיכום ללא מספור, שאר הסעיפים עם 1., 2., וכו'. אל תכלול צעדים מעשיים או הערות חשובות. הכל בעברית בלבד! השתמש רק בשמות עסקים בעברית!`;
}

async function generateSmartReport(requirements, businessDetails) {
    try {
        if (!requirements || !Array.isArray(requirements)) {
            throw new Error('דרישות לא תקינות');
        }
        if (!businessDetails || typeof businessDetails !== 'object') {
            throw new Error('פרטי העסק לא תקינים');
        }

        const prompt = createPrompt(requirements, businessDetails);
        
        console.log('AI Prompt:', prompt); // For debugging
        
        const completion = await openaiInstance.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "אתה מומחה ברישוי עסקים בישראל. צור דוח קצר ומדויק בעברית בלבד. הסיכום צריך להיות טקסט רציף ללא מספור ובעברית מלאה. שאר הסעיפים עם רשימה ממוספרת (1., 2., וכו'). היה קצר וברור. אל תשתמש במילים באנגלית או בשמות באנגלית. הכל בעברית!"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3, // Lower temperature for more consistent output
            max_tokens: 1500   // Reduced token limit
        });

        if (!completion.choices?.[0]?.message?.content) {
            throw new Error('לא התקבלה תשובה מ-OpenAI');
        }

        const response = completion.choices[0].message.content;
        console.log('AI Response:', response); // For debugging
        
        return processAIResponse(response);
    } catch (error) {
        console.error('Error generating smart report:', error);
        // Fallback response if AI fails
        return createFallbackResponse(requirements, businessDetails);
    }
}

function processAIResponse(response) {
    const sections = {
        summary: '',
        urgent: [],
        recommendations: [],
        steps: [],
        notes: []
    };

    const lines = response.split('\n').map(line => line.trim()).filter(Boolean);
    let currentSection = null;

    for (const line of lines) {
        // Detect sections
        if (line.includes('סיכום') || line.toLowerCase().includes('summary')) {
            currentSection = 'summary';
            continue;
        } else if (line.includes('דחופות') || line.includes('דחוף') || line.toLowerCase().includes('urgent')) {
            currentSection = 'urgent';
            continue;
        } else if (line.includes('המלצות') || line.toLowerCase().includes('recommendations')) {
            currentSection = 'recommendations';
            continue;
        }

        // Process content
        if (currentSection && line) {
            if (currentSection === 'summary') {
                // For summary, remove any numbering and add as continuous text
                const cleanLine = line.replace(/^\d+\.\s*/, '');
                sections.summary += cleanLine + ' ';
            } else {
                // Extract numbered items
                const match = line.match(/^(\d+)\.\s*(.+)/);
                if (match) {
                    const content = match[2].trim();
                    sections[currentSection].push(content);
                } else if (!line.includes(':') && sections[currentSection].length === 0) {
                    // If no numbered items found, treat as simple text
                    sections[currentSection].push(line);
                }
            }
        }
    }

    // Clean up summary
    sections.summary = sections.summary.trim();
    
    return sections;
}

function createFallbackResponse(requirements, businessDetails) {
    // Create a basic fallback response when AI fails
    const businessType = businessDetails.businessType || 'עסק';
    
    return {
        summary: `דוח דרישות רגולטוריות עבור ${businessType}. הדוח כולל את הדרישות העיקריות בהתאם לסוג העסק וגודלו.`,
        urgent: [
            'השגת רישיון עסק מהרשות המקומית',
            'אישור משרד הבריאות למזון (במידה ונדרש)',
            'ביטוח אחריות כלפי צד שלישי'
        ],
        recommendations: [
            'התייעצות עם יועץ רגולטורי',
            'הכנת תיק מסמכים מקיף',
            'בדיקת דרישות נוספות ספציפיות לעסק'
        ],
        steps: [
            'פנייה לרשות המקומית לקבלת טפסים',
            'איסוף מסמכים נדרשים',
            'הגשת בקשה והמתנה לאישור'
        ],
        notes: [
            'התהליך עלול לקחת מספר שבועות',
            'עלויות משתנות בהתאם לסוג העסק'
        ]
    };
}

module.exports = {
    generateSmartReport
}; 