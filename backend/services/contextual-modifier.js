import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const PRIMARY_MODEL = "gemini-3.1-flash-lite-preview";
const FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
const MODEL_CHAIN = [PRIMARY_MODEL, ...FALLBACK_MODELS];
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.4, // Lower temperature for more predictable modifications
  topK: 32,
  topP: 0.9,
  maxOutputTokens: 16384, // Increased for larger components
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let fallbackContext = {
  componentCode: '',
  userPrompt: ''
};

function applyLocalModificationFallback(componentCode, userPrompt) {
  const lowerPrompt = userPrompt.toLowerCase();

  // Simple no-API fallback: preserve the existing code if the API is unavailable.
  // This avoids failing the user flow when both Gemini models are rate-limited.
  if (lowerPrompt.includes('change the button text to')) {
    const match = userPrompt.match(/change the button text to ['\"]([^'\"]+)['\"]/i);
    if (match) {
      return componentCode.replace(/(>)([^<]{1,80})(<\/button>)/i, `$1${match[1]}$3`);
    }
  }

  if (lowerPrompt.includes('change the heading text to')) {
    const match = userPrompt.match(/change the heading text to ['\"]([^'\"]+)['\"]/i);
    if (match) {
      return componentCode.replace(/(<h[1-6][^>]*>)([^<]{1,120})(<\/h[1-6]>)/i, `$1${match[1]}$3`);
    }
  }

  return componentCode;
}

function isRetryableModelError(error) {
  const message = String(error?.message || '').toLowerCase();
  const status = Number(error?.status || 0);
  return (
    status === 503 ||
    status === 429 ||
    message.includes('overloaded') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('too many requests')
  );
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const retryableError = isRetryableModelError(error);
      
      if (isLastAttempt || !retryableError) {
        throw error;
      }
      
      const delayTime = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ Model temporarily unavailable/rate-limited, retrying in ${delayTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await delay(delayTime);
    }
  }
}

/**
 * Generate content with automatic retry and fallback
 */
async function generateWithFallback(systemPrompt) {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i];
    const isLastModel = i === MODEL_CHAIN.length - 1;

    try {
      console.log(`🤖 Attempting modification with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      return await retryWithBackoff(async () => {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig,
          safetySettings,
        });
        return result.response;
      }, 3, 1000);
    } catch (error) {
      if (!isRetryableModelError(error)) {
        throw error;
      }

      if (!isLastModel) {
        console.log(`⚠️ Model ${modelName} failed (retryable). Trying next fallback model...`);
        continue;
      }
    }
  }

  console.log('🛟 All API models failed, using local modification fallback...');
  return { text: () => applyLocalModificationFallback(fallbackContext.componentCode, fallbackContext.userPrompt) };
}

/**
 * Modifies an existing React component based on a user's prompt.
 * @param {string} componentCode - The original code of the React component.
 * @param {string} userPrompt - The user's instruction for what to change.
 * @param {object} context - Additional context about the component (optional).
 * @param {string} imageDataUrl - Full base64 data URL for image replacement (optional).
 * @returns {Promise<string>} A promise that resolves to the modified component code.
 */
async function modifyComponent(componentCode, userPrompt, context = {}, imageDataUrl = null) {
  try {
    fallbackContext = { componentCode, userPrompt };

    let finalPrompt = userPrompt;
  
  // For image changes, use a placeholder instead of embedding the massive data URL
  const IMAGE_PLACEHOLDER = '__UPLOADED_IMAGE_DATA_URL__';
  let hasImageReplacement = false;
  
  if (imageDataUrl && imageDataUrl.startsWith('data:')) {
    hasImageReplacement = true;
    console.log('🎯 Image replacement mode enabled');
    console.log('📏 Image data URL length:', imageDataUrl.length);
    finalPrompt += `\n\n**IMAGE REPLACEMENT INSTRUCTION:**
Replace the target image src with this exact placeholder text: ${IMAGE_PLACEHOLDER}
(The actual image data will be injected after code generation to avoid syntax errors with large data URLs)`;
  }

  const systemPrompt = `You are an expert React developer specializing in creating beautiful, modern UI components.

**CRITICAL RULES:**
1. You will receive an existing React component and modification instructions.
2. Apply ALL requested changes precisely.
3. Preserve all functionality not mentioned in the modification request.
4. ALWAYS use ONLY inline styles - NO className, NO Tailwind CSS classes.
5. Output ONLY the complete, modified component code - no markdown, no explanations.
6. If the code starts with 'use client';, preserve it.
7. Use modern, beautiful design principles with proper spacing and visual hierarchy.
8. Ensure the component is self-contained and ready to render.
9. **PRESERVE ALL data-element-id ATTRIBUTES** - These are critical for editing/deletion functionality.

**🆔 CRITICAL: UNIQUE ELEMENT IDs**
- Every element MUST keep its existing data-element-id attribute
- When adding new elements, give them unique data-element-id attributes
- Format: data-element-id="type-description-number" (e.g., "img-product-1", "btn-add-cart-2")
- NEVER remove or change existing data-element-id values unless deleting that element
- For mapped elements, use: data-element-id={\`type-\${item.id}\`}

**CRITICAL FOR E-COMMERCE APPLICATIONS:**
- When price/amount is changed in display text, YOU MUST also update it in the products data array
- Example: If you change "₹10,901" to "₹10,900" in JSX, also update the price: 10900 in the products useState array
- Price changes must be synchronized across:
  * Product data array (useState)
  * Product card display
  * Cart calculations
  * Checkout totals
- Similarly, if product name/description changes, update BOTH the data AND the display
- Cart uses the data from products array, so data MUST be kept in sync with display

**For Text/Content Changes:**
- If changing text in a product card (name, price, description), locate and update the source data array
- Search for patterns like: const [products] = useState([...]) and update the matching item
- Ensure the cart displays the updated values by using product.price from the data array
- DO NOT just change the display text - change the underlying data structure

**For Image Changes:**
- If you receive image replacement instructions, use the placeholder text EXACTLY as provided
- The placeholder will be: ${IMAGE_PLACEHOLDER}
- Insert this placeholder as a STRING LITERAL in quotes where the image should be replaced
- Example in JSX: <img src="${IMAGE_PLACEHOLDER}" alt="..." />
- Example in data array: image: "${IMAGE_PLACEHOLDER}"
- CRITICAL: Always wrap the placeholder in quotes like a normal string
- DO NOT modify, truncate, or add any characters to the placeholder
- If the image is in a data array (like products array), update the image property with the placeholder string
- For product/item images in e-commerce apps:
  * Find the correct product by matching context (product name, description, etc.)
  * Update the image property in the useState products array with the placeholder
  * Example: const [products] = useState([{ id: 1, image: "${IMAGE_PLACEHOLDER}", ... }])
- Search for patterns like: const [products] = useState([{ id: 1, image: "..." }])
- Update the matching product's image property with the placeholder string

**For Design Optimization:**
- Improve spacing with proper padding and margins
- Use modern color schemes with good contrast
- Enhance typography with appropriate font sizes and weights
- Add smooth transitions and hover effects
- Create visual hierarchy through size, color, and spacing
- Ensure mobile responsiveness

**Current Component Code:**
\`\`\`typescript
${componentCode}
\`\`\`

**Modification Instructions:**
${finalPrompt}

${context.optimize ? '\n🎨 OPTIMIZE THE ENTIRE DESIGN - Make it look modern, professional, and visually stunning!' : ''}

**REMEMBER: For price/amount/text changes, update BOTH the data source AND the display. The cart reads from the data array, so changes must be in sync!**

Now provide the complete, modified component code:`;

  // Use retry and fallback mechanism
  console.log('🚀 Modifying code with automatic retry and fallback...');
  const response = await generateWithFallback(systemPrompt);
  let modifiedCode = response.text();
  
  // Debug: Save raw AI response if image replacement is happening
  if (hasImageReplacement) {
    console.log('📝 Raw AI response length:', modifiedCode.length);
    console.log('📝 First 200 chars:', modifiedCode.substring(0, 200));
  }
  
  // Clean up the response
  modifiedCode = modifiedCode.replace(/```typescript\n?|```tsx\n?|```javascript\n?|```jsx\n?|```\n?/g, '').trim();
  
  // Remove any explanatory text before the code
  const codeStart = modifiedCode.indexOf('import');
  if (codeStart > 0) {
    modifiedCode = modifiedCode.substring(codeStart);
  }
  
  // CRITICAL: Replace placeholder with actual image data URL after generation
  // This prevents syntax errors from embedding massive base64 strings during AI generation
  if (hasImageReplacement && imageDataUrl) {
    console.log(`🖼️ Injecting image data URL (${imageDataUrl.length} bytes) into generated code...`);
    console.log(`🔍 Looking for placeholder: ${IMAGE_PLACEHOLDER}`);
    
    // Check if placeholder exists in the code
    const placeholderExists = modifiedCode.includes(IMAGE_PLACEHOLDER);
    console.log(`📋 Placeholder found in code: ${placeholderExists}`);
    
    if (!placeholderExists) {
      console.warn('⚠️ WARNING: Placeholder not found in generated code! AI may not have used it correctly.');
      console.log('🔍 First 500 chars of generated code:', modifiedCode.substring(0, 500));
      
      // FALLBACK: Try to find and replace any existing image src
      // Look for the old image URL in the user prompt and replace it
      const oldImageMatch = userPrompt.match(/Current image src: ([^\n]+)/);
      if (oldImageMatch) {
        const oldImageUrl = oldImageMatch[1].trim();
        console.log('🔄 Attempting fallback: replacing old image URL:', oldImageUrl.substring(0, 80));
        
        // Replace the old image URL with the new data URL
        const beforeReplace = modifiedCode.length;
        modifiedCode = modifiedCode.replace(new RegExp(oldImageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), imageDataUrl);
        const afterReplace = modifiedCode.length;
        
        if (afterReplace !== beforeReplace) {
          console.log('✅ Fallback successful: replaced old image URL');
        } else {
          console.error('❌ Fallback failed: could not find old image URL in code');
        }
      }
    } else {
      // Escape special regex characters in the placeholder
      const escapedPlaceholder = IMAGE_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Replace all occurrences of the placeholder with the actual data URL
      const placeholderRegex = new RegExp(escapedPlaceholder, 'g');
      const replacementCount = (modifiedCode.match(placeholderRegex) || []).length;
      
      modifiedCode = modifiedCode.replace(placeholderRegex, imageDataUrl);
      
      console.log(`✅ Replaced ${replacementCount} placeholder(s) with actual image data`);
    }
  }
  
  console.log('✅ Component modified successfully');
  
  // Debug: Write to file if there's an image replacement (for debugging syntax errors)
  if (hasImageReplacement) {
    try {
      const fs = await import('fs');
      await fs.promises.writeFile(
        '/tmp/last-generated-code.txt',
        modifiedCode.substring(0, 1000), // First 1000 chars to check for syntax errors
        'utf-8'
      );
      console.log('💾 Saved first 1000 chars of generated code to /tmp/last-generated-code.txt');
    } catch (err) {
      console.error('Failed to write debug file:', err.message);
    }
  }
  
  return modifiedCode;
  
  } catch (error) {
    console.error('❌ Error in modifyComponent:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

export { modifyComponent };
