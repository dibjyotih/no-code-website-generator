import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { retrieveRelevantComponents } from '../rag-system/component-retriever.js';

const MODEL_NAME = "gemini-2.5-flash"; // Using a powerful model for better reasoning
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.6,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Generates Next.js component code by augmenting a prompt with relevant examples from the knowledge base.
 * @param {string} userPrompt - The user's request, e.g., "a hero section with a signup form".
 * @param {Part | null} filePart - An optional file part for image-based prompts.
 * @returns {Promise<string>} A promise that resolves to the generated Next.js/React component code as a string.
 */
export const generateEnhancedComponent = async (userPrompt, filePart = null) => {
  try {
    // 1. Retrieve relevant components from the RAG system
    const relevantComponents = await retrieveRelevantComponents(userPrompt, 3);

    // 2. Construct an enhanced prompt for the generative model
    const contextPrompt = `
      You are an expert Next.js developer specializing in creating production-ready React components with Tailwind CSS.
      Your task is to generate a single, complete Next.js component file based on the user's request.
      
      Follow these rules strictly:
      1.  Generate only one single file of code.
      2.  The code must be a valid Next.js/React component using TypeScript.
      3.  Use Tailwind CSS for styling. Do not use any other styling methods like CSS-in-JS or separate CSS files.
      4.  Ensure the component is responsive and accessible.
      5.  The output should be ONLY the code, wrapped in a single markdown block like \`\`\`jsx ... \`\`\`. Do not include any other text, explanation, or preamble.
    `;

    const examplesPrompt = relevantComponents.length > 0
      ? `Here are some examples of high-quality components from our existing codebase. Use them as a reference for style and structure:\n\n${relevantComponents.map((doc, i) => (
          `--- Component Example ${i + 1} ---\n` +
          `Name: ${doc.metadata.name}\n` +
          `Category: ${doc.metadata.category}\n` +
          `Code:\n${doc.pageContent.substring(doc.pageContent.indexOf('Code: ') + 6)}\n` +
          `--- End Example ${i + 1} ---\n`
        )).join('\n')}`
      : "No specific examples found, but please adhere to best practices for Next.js and Tailwind CSS.";

    const finalUserPrompt = `User Request: "${userPrompt}"`;

    // 3. Get the generative model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // 4. Prepare parts for the generative model
    const parts = [
        { text: contextPrompt },
        { text: examplesPrompt },
        { text: finalUserPrompt },
    ];

    if (filePart) {
        parts.unshift(filePart); // Add image at the beginning if it exists
    }

    // 5. Call the generative model
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    // 6. Process and return the response
    const response = result.response;
    const generatedCode = response.text();
    
    // Clean up the response to extract only the code from the markdown block
    const codeBlockMatch = generatedCode.match(/```(?:jsx|javascript|typescript)?\r?\n([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }

    return generatedCode.trim(); // Fallback to returning the whole text

  } catch (error) {
    console.error('Error generating enhanced component:', error);
    throw new Error('Failed to generate component with the enhanced RAG system.');
  }
};
