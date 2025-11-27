/**
 * Sanitizes the raw code output from the AI model.
 * @param {string} rawCode - The raw string returned by the generative model.
 * @returns {string} The cleaned, ready-to-use code.
 */
export function sanitizeGeneratedCode(rawCode) {
  if (!rawCode) {
    return '';
  }

  // Remove markdown wrappers (```jsx, ```typescript, ```, etc.)
  let sanitizedCode = rawCode.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();

  // Remove any leading/trailing whitespace and newlines
  sanitizedCode = sanitizedCode.trim();

  // Ensure 'use client'; is on the first line if present anywhere.
  const useClientDirective = "'use client';";
  if (sanitizedCode.includes(useClientDirective)) {
    sanitizedCode = sanitizedCode.replace(new RegExp(useClientDirective, 'g'), '');
    sanitizedCode = `${useClientDirective}\n${sanitizedCode.trim()}`;
  }

  // Fix common issues
  // 1. Ensure there's an export statement
  if (!sanitizedCode.includes('export default') && 
      !sanitizedCode.includes('export function') && 
      !sanitizedCode.includes('export const')) {
    // Find the component name (look for function ComponentName or const ComponentName)
    const componentMatch = sanitizedCode.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      // Check if export is missing at the end
      if (!sanitizedCode.endsWith(`export default ${componentName};`)) {
        sanitizedCode += `\n\nexport default ${componentName};`;
      }
    } else {
      // Try to find arrow function assignment
      const arrowMatch = sanitizedCode.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=/);
      if (arrowMatch) {
        const componentName = arrowMatch[1];
        if (!sanitizedCode.includes(`export default ${componentName}`)) {
          sanitizedCode += `\n\nexport default ${componentName};`;
        }
      }
    }
  }

  // 2. Fix dangling commas in JSX (common AI mistake)
  sanitizedCode = sanitizedCode.replace(/,\s*}/g, ' }');
  sanitizedCode = sanitizedCode.replace(/,\s*\]/g, ' ]');

  // 3. Remove duplicate imports
  const seenImports = new Set();
  const lines = sanitizedCode.split('\n');
  const filteredLines = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      if (!seenImports.has(line.trim())) {
        seenImports.add(line.trim());
        filteredLines.push(line);
      }
    } else {
      filteredLines.push(line);
    }
  }
  
  sanitizedCode = filteredLines.join('\n');

  return sanitizedCode;
}
