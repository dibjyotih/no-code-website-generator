import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function reviewCode(code: string): Promise<string> {
  const prompt = `
    You are an expert code reviewer specializing in Next.js and React with TypeScript.
    Review the following code snippet. Provide feedback on the following aspects:
    1.  **Correctness**: Are there any bugs or logical errors?
    2.  **Best Practices**: Does the code follow standard React/Next.js best practices?
    3.  **Readability**: Is the code clean, well-formatted, and easy to understand?
    4.  **Performance**: Are there any potential performance issues?
    5.  **Accessibility**: Are there any obvious accessibility issues?

    Provide your feedback in Markdown format. Be constructive and provide specific examples for improvement where possible.

    Here is the code to review:
    \`\`\`tsx
    ${code}
    \`\`\`
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini API for code review:', error);
    throw new Error('Failed to get code review from AI model.');
  }
}
