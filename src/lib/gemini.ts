// import { GoogleGenAI } from '@google/genai';

// export const gemini = new GoogleGenAI({
//     apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
// });

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// Initialize the real Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
});

// Environment flags
enum Mode {
  MOCK = 'mock',
  REAL = 'real',
}

const MODE = process.env.NEXT_PUBLIC_GEMINI_MODE as Mode || Mode.MOCK;
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-turbo';

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
    // Return a simple mock response; adjust as needed per use-case
    return { text: 'row.PriorityLevel >= 1' };
  }

  // Perform real API call
  const response = await ai.models.generateContent({
    model,
    contents: options.contents ?? ['Default content'],
  });
  return { text: response.text ?? '' };
}
