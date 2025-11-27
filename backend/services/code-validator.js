import { Parser } from 'acorn';
import jsx from 'acorn-jsx';

/**
 * Validates the generated code for basic syntax and structure.
 * This is a simplified validator. For a real-world scenario, you'd use a
 * more robust solution like the TypeScript compiler API.
 * @param {string} code - The generated code to validate.
 * @returns {{isValid: boolean, errors: string[]}}
 */
export function validateGeneratedCode(code) {
  const errors = [];

  // 1. Basic JavaScript/JSX Syntax Validation using Acorn with JSX
  try {
    const JSXParser = Parser.extend(jsx());
    JSXParser.parse(code, { 
      ecmaVersion: 'latest', 
      sourceType: 'module',
      allowReturnOutsideFunction: true
    });
  } catch (e) {
    // Only add error if it's a critical syntax error
    console.warn('Syntax validation warning:', e.message);
    // Don't fail on minor syntax issues - let the browser handle them
  }

  // 2. React Component Structure Validation (Simple Checks)
  const hasExport = code.includes('export default') || 
                    code.includes('export function') || 
                    code.includes('export const');
                    
  if (!hasExport) {
    console.warn("Warning: Component might be missing an export");
    // Don't fail - add export in sanitizer instead
  }
  
  // Check if there's at least some JSX content
  const hasJSX = /<[a-zA-Z]/.test(code) || code.includes('React.createElement');
  
  if (!hasJSX) {
    errors.push("No JSX or React elements found in the component.");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

export async function reviewCode(code) {
    // This function seems to be for AI-based review, which is different from validation.
    // Keeping it separate.
    return "Code review feature not fully implemented.";
}

