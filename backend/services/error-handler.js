/**
 * Handles errors during the code generation process.
 * @param {Error} error - The error object caught.
 * @param {string} prompt - The user prompt that caused the error.
 * @returns {{error: string, message: string, suggestion: string}}
 */
export function handleGenerationError(error, prompt) {
  console.error("Code Generation Error:", error);

  // Log the error for debugging
  // You could expand this to log to a file or a monitoring service
  
  const userMessage = "Sorry, something went wrong while generating the component. Please try refining your prompt.";
  
  // Simple suggestion logic
  let suggestion = "Try being more specific about the component's appearance and functionality.";
  if (prompt.length < 10) {
    suggestion = "Your prompt is very short. Try adding more details about what you want to build.";
  }

  const status = typeof error?.status === 'number' ? error.status : undefined;
  const details = String(error?.message || '').slice(0, 500);

  return {
    error: "Generation Failed",
    message: userMessage,
    suggestion: suggestion,
    status,
    details,
  };
}

/**
 * Handles errors during code validation.
 * @param {Error} error - The validation error.
 * @param {string} code - The code that failed validation.
 * @returns {{error: string, message: string}}
 */
export function handleValidationError(error, code) {
    console.error("Code Validation Error:", error.message);
    return {
        error: "Validation Failed",
        message: `The generated code has syntax errors: ${error.message}`,
    }
}
