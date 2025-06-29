import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// Initialize the real Gemini client with updated configuration
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
});

// const availableModels = await ai.models.list();
// const modelNames = [];
// for await (const model of availableModels) {
//   modelNames.push(model.name);
// }
// console.log(`Available Gemini models: ${modelNames.join(', ')}`);



// Environment flags
enum Mode {
  MOCK = 'mock',
  REAL = 'real',
}

// Get mode from environment or use REAL if API key is present
const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODE = (process.env.NEXT_PUBLIC_GEMINI_MODE as Mode) || (hasApiKey ? Mode.REAL : Mode.MOCK);
// Use a more reliable model name that works with the API
const GEMINI_MODEL = 'gemini-1.0-pro';

console.log(`🔧 Gemini configured with mode: ${MODE}, model: ${GEMINI_MODEL}, API key ${hasApiKey ? 'present' : 'missing'}`)

/**
 * Wrapper to generate content via Gemini API or mock in development.
 * Prevents unintended calls when MODE is not set to 'real'.
 */
export async function generateContent(
  options: Omit<GenerateContentResponse, 'model'> & { model?: string; contents?: string[] }
): Promise<{ text: string }> {
  const model = options.model || GEMINI_MODEL;

  if (MODE !== Mode.REAL) {
    console.log(`⚠️ [Gemini MOCK] Skipping API call; would use model: ${model}`);
    
    // Extract the query from the contents if available
    let mockResponse = 'return row.PriorityLevel >= 1';
    
    if (options.contents && options.contents.length > 0) {
      const content = options.contents[0];
      
      // Try to extract the actual number from a query like "priority >= 3"
      if (content.includes('priority') && content.includes('>=')) {
        const match = content.match(/priority\s*>=\s*(\d+)/i);
        if (match && match[1]) {
          mockResponse = `return row.PriorityLevel >= ${match[1]}`;
        }
      }
    }
    
    console.log(`🔍 [Mock] Generated filter: ${mockResponse}`);
    return { text: mockResponse };
  }

  // Perform real API call with updated format based on the example
  try {
    // Format the contents properly for the API
    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: options.contents?.[0] ?? 'Default content' }]
      }
    ];
    
    console.log(`🔄 Calling Gemini API with model: ${model}`);
    
    const response = await ai.models.generateContent({
      model,
      contents: formattedContents
    });
    
    console.log('✅ Gemini API call successful');
    return { text: response.text ?? '' };
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    // Fall back to mock response in case of API error
    return { 
      text: `return row.PriorityLevel >= 3` 
    };
  }
}
