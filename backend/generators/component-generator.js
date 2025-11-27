import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ragSystem } from '../rag-system/index.js';
import { sanitizeGeneratedCode } from '../services/code-sanitizer.js';
import { validateGeneratedCode } from '../services/code-validator.js';
import { handleGenerationError, handleValidationError } from '../services/error-handler.js';
import { generateImagesForComponent } from '../services/image-generator.js';

const MODEL_NAME = "gemini-2.5-flash"; // Primary model
const FALLBACK_MODEL = "gemini-1.5-flash"; // Fallback when primary is overloaded
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.6,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 16384, // Increased to prevent code truncation
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isOverloadError = error.status === 503 || error.message?.includes('overloaded');
      
      if (isLastAttempt || !isOverloadError) {
        throw error;
      }
      
      const delayTime = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
      console.log(`⏳ Model overloaded, retrying in ${delayTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await delay(delayTime);
    }
  }
}

/**
 * Generate content with automatic retry and fallback
 */
async function generateWithFallback(parts, modelName = MODEL_NAME) {
  try {
    console.log(`🤖 Attempting generation with model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    return await retryWithBackoff(async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
      });
      return result.response;
    }, 3, 1000);
    
  } catch (error) {
    // If primary model fails after retries, try fallback
    if (modelName === MODEL_NAME && (error.status === 503 || error.message?.includes('overloaded'))) {
      console.log(`⚠️ Primary model (${MODEL_NAME}) failed, trying fallback model (${FALLBACK_MODEL})...`);
      const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      
      return await retryWithBackoff(async () => {
        const result = await fallbackModel.generateContent({
          contents: [{ role: "user", parts }],
          generationConfig,
          safetySettings,
        });
        return result.response;
      }, 2, 2000);
    }
    
    throw error;
  }
}

/**
 * Detect component type from user prompt
 */
function detectComponentType(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Functional E-commerce (shopping cart, add to cart, buy, sell)
  if (lowerPrompt.includes('cart') || lowerPrompt.includes('shopping') || lowerPrompt.includes('buy') || 
      lowerPrompt.includes('sell') || lowerPrompt.includes('checkout') || lowerPrompt.includes('order')) {
    return 'functional-ecommerce';
  }
  
  // Payment related
  if (lowerPrompt.includes('payment') || lowerPrompt.includes('pay') || 
      lowerPrompt.includes('upi') || lowerPrompt.includes('qr code') || lowerPrompt.includes('razorpay') ||
      lowerPrompt.includes('paytm') || lowerPrompt.includes('paypal')) {
    return 'payment';
  }
  
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('product') || lowerPrompt.includes('store')) {
    return 'ecommerce';
  } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('work') || lowerPrompt.includes('project')) {
    return 'portfolio';
  } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('article') || lowerPrompt.includes('post')) {
    return 'blog';
  } else if (lowerPrompt.includes('gallery') || lowerPrompt.includes('photo') || lowerPrompt.includes('image')) {
    return 'gallery';
  }
  
  return 'ecommerce'; // default
}

/**
 * Replace image URLs in code with AI-generated images
 */
function replaceImagesWithGenerated(code, generatedImages) {
  if (!generatedImages || generatedImages.length === 0) {
    console.warn('⚠️ No generated images available, using fallback');
    return enhanceGeneratedCode(code); // Use old Unsplash fallback
  }
  
  let enhancedCode = code;
  let imageIndex = 0;
  
  // Pattern 1: Replace image URLs in src attributes
  enhancedCode = enhancedCode.replace(
    /src=["']https?:\/\/[^"']+["']/gi,
    (match) => {
      if (imageIndex < generatedImages.length) {
        const newImage = generatedImages[imageIndex++];
        return `src="${newImage}"`;
      }
      return match;
    }
  );
  
  // Pattern 2: Replace image URLs in data arrays (like products array)
  enhancedCode = enhancedCode.replace(
    /image:\s*["']https?:\/\/[^"']+["']/gi,
    (match) => {
      if (imageIndex < generatedImages.length) {
        const newImage = generatedImages[imageIndex++];
        return `image: "${newImage}"`;
      }
      return match;
    }
  );
  
  // Pattern 3: Replace background image URLs
  enhancedCode = enhancedCode.replace(
    /backgroundImage:\s*["']url\(["']?https?:\/\/[^"')]+["']?\)["']/gi,
    (match) => {
      if (imageIndex < generatedImages.length) {
        const newImage = generatedImages[imageIndex++];
        return `backgroundImage: "url('${newImage}')"`;
      }
      return match;
    }
  );
  
  console.log(`✅ Replaced ${imageIndex} image URLs with AI-generated images`);
  
  return enhancedCode;
}

/**
 * Post-process generated code to ensure all images use real CDN URLs
 * and all elements have unique IDs for editing
 */
function enhanceGeneratedCode(code) {
  const IMAGE_URLS = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
  ];

  let enhancedCode = code;
  let imageCounter = 0;

  // Replace ALL image src attributes with real working URLs
  // This handles: placeholder, https://via.placeholder.com, /images/, /assets/, relative paths, etc.
  enhancedCode = enhancedCode.replace(
    /src=["']([^"']+)["']/gi,
    (match, url) => {
      // If it's already a valid Unsplash or Pravatar URL, keep it
      if (url.includes('unsplash.com') || url.includes('pravatar.cc')) {
        return match;
      }
      
      // For any other URL (placeholder, relative path, broken, etc.), replace with real image
      const replacementUrl = IMAGE_URLS[imageCounter % IMAGE_URLS.length];
      imageCounter++;
      return `src="${replacementUrl}"`;
    }
  );

  return enhancedCode;
}

/**
 * Generates Next.js component code, with validation and sanitization.
 * @param {string} userPrompt - The user's request.
 * @param {Part | null} filePart - An optional file part for image-based prompts.
 * @returns {Promise<{code: string | null, error: object | null}>} A promise that resolves to an object containing either the code or an error.
 */
export async function componentGenerator(userPrompt, filePart = null) {
  try {
    console.log('🎨 Starting component generation with image support...');
    
    // Detect component type for image generation
    const componentType = detectComponentType(userPrompt);
    console.log(`📦 Detected component type: ${componentType}`);
    
    // Generate images in parallel while AI generates code
    const imageGenerationPromise = generateImagesForComponent(componentType, 6);
    
    // 1. Retrieve relevant components from the RAG system
    const relevantComponents = await ragSystem.retrieve(userPrompt, 3);

    // 2. Construct an enhanced prompt for the generative model
    const contextPrompt = `
      You are an EXPERT FULL-STACK React developer who builds COMPLETE, FULLY FUNCTIONAL APPLICATIONS, not just UI templates.
      
      🎯 YOUR MISSION: Generate production-ready, fully functional React applications with real interactivity and state management.
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      ⚡ CRITICAL: FUNCTIONAL APPLICATION REQUIREMENTS
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      When users request e-commerce, shopping, payment, or any complex application:
      
      ✅ MUST INCLUDE:
      1. **FULL STATE MANAGEMENT** with React useState and useEffect hooks
      2. **SHOPPING CART FUNCTIONALITY**:
         - Add to cart function with quantity management
         - Remove from cart functionality
         - Update quantity (increment/decrement) with proper state updates
         - Cart state persists across component renders
         - Show/hide cart sidebar or modal
      
      3. **DYNAMIC CALCULATIONS** (ALL prices must update in real-time):
         - Subtotal = sum of (item.price × item.quantity) for all cart items
         - Shipping cost (e.g., flat rate or free above certain amount)
         - Tax calculation (e.g., 18% GST in India, adapt to context)
         - Grand Total = Subtotal + Shipping + Tax
         - Display item count: cart.reduce((sum, item) => sum + item.quantity, 0)
      
      4. **MULTI-COMPONENT ARCHITECTURE**:
         - Product listing with grid/flexbox layout
         - Shopping cart sidebar/modal with full item management
         - Checkout modal/page with order summary
         - Payment selection interface
         - All components in ONE file but properly organized
      
      5. **INTERACTIVE FEATURES**:
         - Click handlers for add/remove/update actions
         - Search functionality with real filtering
         - Category filtering that actually works
         - Hover effects and transitions
         - Form validation where applicable
      
      6. **REAL WORKING LOGIC**:
         - Cart operations: addToCart, removeFromCart, updateQuantity
         - Filter operations: search products, filter by category
         - Price calculations that update dynamically
         - Payment redirect logic with proper URL formatting
         - State synchronization across all views
      
      ❌ FORBIDDEN - DO NOT CREATE:
      - Simple redirect buttons without cart logic
      - Static templates that don't actually work
      - Fake "Add to Cart" buttons that do nothing
      - Hardcoded prices that don't calculate dynamically
      - Components without proper state management
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      🛒 E-COMMERCE APPLICATION PATTERN (USE THIS AS REFERENCE)
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      For e-commerce requests, follow this structure:
      
      EXAMPLE CODE STRUCTURE:
      
      import React, { useState } from 'react';
      
      const EcommerceApp = () => {
        // STATE MANAGEMENT
        const [products] = useState([...]); // 6+ real products with images
        const [cart, setCart] = useState([]);
        const [showCart, setShowCart] = useState(false);
        const [showCheckout, setShowCheckout] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const [selectedCategory, setSelectedCategory] = useState('All');
        
        // CART OPERATIONS
        const addToCart = (product) => {
          setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            if (existing) {
              return prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              );
            }
            return [...prevCart, { ...product, quantity: 1 }];
          });
        };
        
        const updateQuantity = (id, change) => {
          setCart(prevCart =>
            prevCart.map(item =>
              item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
            )
          );
        };
        
        const removeFromCart = (id) => {
          setCart(prevCart => prevCart.filter(item => item.id !== id));
        };
        
        // DYNAMIC CALCULATIONS
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = cart.length > 0 ? 199 : 0;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shipping + tax;
        
        // FILTERING
        const filteredProducts = products.filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
          return matchesSearch && matchesCategory;
        });
        
        // PAYMENT HANDLER
        const handlePayment = (method) => {
          const paymentLinks = {
            upi: 'upi://pay?pa=merchant@paytm&pn=Store&am=' + total + '&cu=INR',
            razorpay: 'https://razorpay.me/@yourhandle',
            paypal: 'https://paypal.me/yourhandle'
          };
          window.open(paymentLinks[method], '_blank');
        };
        
        return (
          <div>
            {/* Header with cart counter */}
            {/* Product grid with filteredProducts */}
            {/* Cart sidebar with cart.map() */}
            {/* Checkout modal with order summary and payment options */}
          </div>
        );
      };
      
      END EXAMPLE CODE
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      🎨 STYLING RULES - INLINE STYLES ONLY
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      - Use ONLY inline styles with JavaScript objects: style={{ property: 'value' }}
      - NO Tailwind CSS classes (className="...")
      - NO external CSS files or styled-components
      - Make it beautiful with modern design:
        * Proper spacing (padding, margins)
        * Shadow effects: boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        * Border radius for rounded corners
        * Smooth transitions: transition: 'all 0.2s'
        * Hover effects with onMouseEnter/onMouseLeave
        * Professional color schemes (#0071e3, #1d1d1f, #f5f5f7, etc.)
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      🖼️ IMAGE RULES - REAL WORKING URLs ONLY
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      NEVER use fake paths like "/images/product.jpg" - ALWAYS use real URLs:
      - Products: https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400
      - Avatars: https://i.pravatar.cc/150?img=1
      - Logos: https://via.placeholder.com/150x50/6366f1/ffffff?text=LOGO
      - QR Codes: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay...
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      📦 DATA REQUIREMENTS
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      - Include 6+ realistic sample items with:
        * Unique IDs
        * Descriptive names
        * Real prices (appropriate to context)
        * Categories
        * Descriptions
        * Working image URLs
      - Make data relevant to user's request (e.g., Apple products for Apple store)
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      💳 PAYMENT INTEGRATION
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      - UPI links: upi://pay?pa=merchant@paytm&pn=StoreName&am=AMOUNT&cu=INR
      - Razorpay: https://razorpay.me/@yourhandle
      - PayPal: https://paypal.me/yourhandle
      - Use window.open() or window.location.href for redirects
      - Show total amount being paid
      - Include multiple payment options
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      ⚙️ TECHNICAL RULES
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      1. Plain JavaScript React (NO TypeScript)
      2. Simple function components (no React.FC)
      3. Standard imports: import React, { useState } from 'react';
      4. Default export: export default ComponentName;
      5. Only standard HTML tags (div, img, button, input, etc.)
      6. Output ONLY code - no markdown blocks, no explanations
      7. Responsive design using flexbox/grid
      8. Mobile-friendly with proper breakpoints
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      🆔 CRITICAL: UNIQUE ELEMENT IDs FOR EDITING/DELETION
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      **MANDATORY**: Every interactive and editable element MUST have a unique data-element-id attribute.
      
      ✅ MUST ADD data-element-id TO:
      - ALL <img> tags (images)
      - ALL <button> tags (buttons)
      - ALL <h1>, <h2>, <h3>, <h4>, <h5>, <h6> tags (headings)
      - ALL <p> tags (paragraphs)
      - ALL <a> tags (links)
      - Product cards / Item containers
      - Form elements (<input>, <textarea>, <select>)
      - Navigation elements
      - Containers that hold content (divs with meaningful content)
      
      **ID FORMAT**: Use descriptive, unique IDs following these patterns:
      - Images: data-element-id="img-product-1", "img-hero", "img-logo", "img-avatar-1"
      - Buttons: data-element-id="btn-add-cart-1", "btn-checkout", "btn-buy-now"
      - Headings: data-element-id="heading-title", "heading-product-1"
      - Text: data-element-id="text-description-1", "text-price-1"
      - Cards: data-element-id="card-product-1", "card-feature-2"
      - Links: data-element-id="link-home", "link-product-1"
      
      **EXAMPLES OF PROPER USAGE**:
      
      ❌ WRONG (no ID):
      <img src="..." alt="Product" />
      
      ✅ CORRECT:
      <img data-element-id="img-product-1" src="..." alt="Product" />
      
      ❌ WRONG (generic ID):
      <button>Add to Cart</button>
      
      ✅ CORRECT:
      <button data-element-id="btn-add-cart-1">Add to Cart</button>
      
      **IN MAPPED ARRAYS**: Use dynamic IDs with index or item ID:
      {products.map((product, index) => (
        <div key={product.id} data-element-id={\`card-product-\${product.id}\`}>
          <img data-element-id={\`img-product-\${product.id}\`} src={product.image} />
          <h3 data-element-id={\`heading-product-\${product.id}\`}>{product.name}</h3>
          <p data-element-id={\`text-price-\${product.id}\`}>{product.price}</p>
          <button data-element-id={\`btn-add-\${product.id}\`}>Add to Cart</button>
        </div>
      ))}
      
      **WHY THIS MATTERS**: Users need to select, edit, and delete specific elements. Without unique IDs, 
      they cannot distinguish between multiple images, buttons, or text elements.
      
      ════════════════════════════════════════════════════════════════════════════════════════════════
      🧠 INTELLIGENCE CHECK: Before generating, ask yourself:
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      ✓ Does this application actually WORK or is it just a static template?
      ✓ Can users add items to cart and see the cart update?
      ✓ Do prices calculate dynamically when cart changes?
      ✓ Can users remove items or update quantities?
      ✓ Does the checkout show accurate totals?
      ✓ Are payment buttons properly linked?
      ✓ Does search/filter actually work?
      ✓ Is state managed correctly with useState?
      
      If any answer is NO, you've failed. Generate FUNCTIONAL applications, not useless templates.
    `;

    const examplesPrompt = relevantComponents.length > 0
      ? `Here are some examples of high-quality components from our existing codebase. Use them as a reference for style and structure:\n\n${relevantComponents.map((doc, i) => (
          `--- Component Example ${i + 1} ---\n` +
          `Name: ${doc.metadata.name}\n` +
          `Category: ${doc.metadata.category}\n` +
          `Code:\n${doc.pageContent.substring(doc.pageContent.indexOf('Code: ') + 6)}\n` +
          `--- End Example ${i + 1} ---\n`
        )).join('\n')}`
      : "No specific examples found, but please adhere to best practices for React and Tailwind CSS.";

    const finalUserPrompt = `User Request: "${userPrompt}"`;
    
    const parts = [
        { text: contextPrompt },
        { text: examplesPrompt },
        { text: finalUserPrompt },
    ];

    if (filePart) {
        parts.unshift(filePart);
    }

    // Use the new retry and fallback mechanism
    console.log('🚀 Generating code with automatic retry and fallback...');
    const response = await generateWithFallback(parts);
    const rawCode = response.text();
    
    // Wait for images to be generated
    console.log('⏳ Waiting for images to be generated...');
    const generatedImages = await imageGenerationPromise;
    console.log(`✅ Received ${generatedImages.length} generated images`);
    
    // 1. Sanitize the output
    const sanitizedCode = sanitizeGeneratedCode(rawCode);

    console.log("--- Sanitized AI-Generated Code ---");
    console.log(sanitizedCode);
    console.log("------------------------------------");

    // 2. Replace placeholder images with generated images
    const codeWithGeneratedImages = replaceImagesWithGenerated(sanitizedCode, generatedImages);
    
    console.log("✅ Code enhanced with AI-generated images");
    console.log("📄 Final code length:", codeWithGeneratedImages.length);
    console.log("✅ Returning code to frontend...");

    // 3. Return the enhanced code
    return { code: codeWithGeneratedImages, error: null };

  } catch (error) {
    // Handle errors during the generation process
    return { code: null, error: handleGenerationError(error, userPrompt) };
  }
}
