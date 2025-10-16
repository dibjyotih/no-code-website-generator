import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates a Next.js component using the Gemini API without any RAG context.
 * This serves as a fallback when the RAG system is not available.
 * @param {string} prompt - The user's description of the component.
 * @returns {Promise<string>} The generated Next.js component code.
 */
export const generateSimpleComponent = async (prompt) => {
  try {
    const model = new GoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    }).getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fullPrompt = `
      You are an expert Next.js developer. Your task is to generate the code for a single, self-contained Next.js component based on the user's request.

      **Rules:**
      1.  **Output ONLY the code** for the Next.js component file.
      2.  Do not include any explanations, comments, or markdown formatting (like \`\`\`jsx\`).
      3.  The component must be a single file, including imports.
      4.  Use TypeScript and functional components.
      5.  Use Tailwind CSS for styling.

      **User Request:**
      "${prompt}"
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('💥 Error in simple generator:', error);
    throw new Error('Failed to generate component with the simple generator.');
  }
};
