import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ragSystem } from '../rag-system/index.js';
import { sanitizeGeneratedCode } from '../services/code-sanitizer.js';
import { validateGeneratedCode } from '../services/code-validator.js';
import { handleGenerationError, handleValidationError } from '../services/error-handler.js';
import { generateImagesForComponent } from '../services/image-generator.js';
import fs from 'fs/promises';
import path from 'path';

const PRIMARY_MODEL = "gemini-3.1-flash-lite-preview";
const FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
const MODEL_CHAIN = [PRIMARY_MODEL, ...FALLBACK_MODELS];
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

let localTemplateCache = null;

async function loadLocalTemplates() {
  if (localTemplateCache) {
    return localTemplateCache;
  }

  try {
    const componentsPath = path.join(process.cwd(), 'backend', 'knowledge-base', 'components.json');
    const fullstackPath = path.join(process.cwd(), 'backend', 'knowledge-base', 'fullstack-templates.json');

    const [componentsRaw, fullstackRaw] = await Promise.all([
      fs.readFile(componentsPath, 'utf-8'),
      fs.readFile(fullstackPath, 'utf-8').catch(() => '[]')
    ]);

    const components = JSON.parse(componentsRaw);
    const fullstack = JSON.parse(fullstackRaw);
    localTemplateCache = [...components, ...fullstack].filter(Boolean);
    return localTemplateCache;
  } catch (error) {
    console.warn('⚠️ Could not load local templates for fallback:', error.message);
    localTemplateCache = [];
    return localTemplateCache;
  }
}

function buildSimpleFallbackComponent(userPrompt) {
  const lowerPrompt = userPrompt.toLowerCase();

  if (lowerPrompt.includes('contact') || lowerPrompt.includes('form')) {
    return `import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px', fontFamily: 'system-ui' }}>
      <h2 data-element-id="heading-contact-title">Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <input data-element-id="input-name" name="name" placeholder="Name" value={formData.name} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '12px' }} />
        <input data-element-id="input-email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '12px' }} />
        <textarea data-element-id="input-message" name="message" placeholder="Message" value={formData.message} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '12px' }} />
        <button data-element-id="btn-send-message" type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default ContactForm;`;
  }

  if (lowerPrompt.includes('navbar') || lowerPrompt.includes('navigation')) {
    return `import React, { useState } from 'react';

const SimpleNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ padding: '16px 24px', background: '#111827', color: '#fff', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div data-element-id="text-logo">YourLogo</div>
        <button data-element-id="btn-menu" onClick={() => setOpen(v => !v)}>Menu</button>
      </div>
      {open && <div data-element-id="menu-items" style={{ marginTop: '12px' }}>Home · About · Contact</div>}
    </nav>
  );
};

export default SimpleNavbar;`;
  }

  if (lowerPrompt.includes('hero')) {
    return `import React from 'react';

const HeroSection = () => {
  return (
    <section style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '48px', fontFamily: 'system-ui', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
      <div>
        <h1 data-element-id="heading-hero-title" style={{ fontSize: '48px', marginBottom: '16px' }}>Build Faster</h1>
        <p data-element-id="text-hero-description" style={{ fontSize: '18px', marginBottom: '24px' }}>A clean hero section generated locally when API limits are reached.</p>
        <button data-element-id="btn-hero-cta" style={{ padding: '12px 20px', borderRadius: '999px', border: 'none' }}>Get Started</button>
      </div>
    </section>
  );
};

export default HeroSection;`;
  }

  if (lowerPrompt.includes('cart') || lowerPrompt.includes('shop') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('store')) {
    const template = `import React, { useState } from 'react';

const FallbackStore = () => {
  const [products] = useState([
    { id: 1, name: 'Sample Product A', price: 499, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
    { id: 2, name: 'Sample Product B', price: 799, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }
  ]);
  const [cart, setCart] = useState([]);
  const addToCart = (product) => setCart(prev => [...prev, { ...product, quantity: 1 }]);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div style={{ padding: '32px', fontFamily: 'system-ui' }}>
      <h1 data-element-id="heading-store-title">Store</h1>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {products.map(product => (
          <div key={product.id} data-element-id={
            'card-product-' + product.id
          } style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px' }}>
            <img data-element-id={
              'img-product-' + product.id
            } src={product.image} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }} />
            <h3 data-element-id={
              'heading-product-' + product.id
            }>{product.name}</h3>
            <p data-element-id={
              'text-price-' + product.id
            }>₹{product.price}</p>
            <button data-element-id={
              'btn-add-' + product.id
            } onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
      <div data-element-id="cart-summary" style={{ marginTop: '24px', fontWeight: 600 }}>Cart Total: ₹{total}</div>
    </div>
  );
};

export default FallbackStore;`;
    return template;
  }

  return `import React from 'react';

const FallbackSection = () => {
  return (
    <div style={{ padding: '32px', fontFamily: 'system-ui' }}>
      <h1 data-element-id="heading-fallback">Generated Locally</h1>
      <p data-element-id="text-fallback">The API quota was exhausted, so a local fallback component was used.</p>
    </div>
  );
};

export default FallbackSection;`;
}

function extractUserRequestText(parts) {
  const joinedText = parts
    .map((part) => part?.text || '')
    .join('\n');

  const userRequestMatch = joinedText.match(/User Request:\s*"([\s\S]*?)"/i);
  if (userRequestMatch?.[1]) {
    return userRequestMatch[1].trim();
  }

  return joinedText;
}

async function getFallbackCode(userPrompt, relevantComponents = [], filePart = null) {
  // Use built-in JS-safe fallback templates to avoid returning TS-only code when API is unavailable.
  return sanitizeGeneratedCode(buildSimpleFallbackComponent(userPrompt));
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
      
      const delayTime = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
      console.log(`⏳ Model temporarily unavailable/rate-limited, retrying in ${delayTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await delay(delayTime);
    }
  }
}

/**
 * Generate content with automatic retry and fallback
 */
async function generateWithFallback(parts) {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i];
    const isLastModel = i === MODEL_CHAIN.length - 1;

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
      if (!isRetryableModelError(error)) {
        throw error;
      }

      if (!isLastModel) {
        console.log(`⚠️ Model ${modelName} failed (retryable). Trying next fallback model...`);
        continue;
      }
    }
  }

  console.log('🛟 All API models failed, switching to local template fallback...');
  const localCode = await getFallbackCode(extractUserRequestText(parts), []);
  return { text: () => localCode };
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
  
  return 'general'; // neutral default
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
      
      6. **REAL WORKING LOGIC** (THIS IS CRITICAL):
         - Cart operations (MUST be actual functions that modify state):
           * addToCart: function that finds existing item and increments OR adds new item
           * removeFromCart: function that filters item out of cart
           * updateQuantity: function that changes item.quantity in cart
         - Filter operations: search products, filter by category
         - Price calculations that update dynamically EVERY time cart changes:
           * subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
           * tax = Math.round(subtotal * 0.18) for e-commerce
           * shipping = subtotal > 5000 ? 0 : 200 (free shipping over 5000)
           * total = subtotal + tax + shipping
         - Payment redirect logic with proper URL formatting (actual links, not fake)
         - State synchronization - cart state must trigger recalcculations
      
      7. **QUANTITY MANAGEMENT** (If you don't include this, the code is incomplete):
         - Each cart item MUST have quantity field
         - Increment button: quantity + 1
         - Decrement button: quantity - 1 (but not below 1)
         - Update cart display: {item.price} × {item.quantity} = {item.price * item.quantity}
      
      8. **DISPLAY ALL CALCULATIONS** (User needs to see these):
         - Show subtotal amount
         - Show tax amount
         - Show shipping cost
         - Show total amount (with color/bold emphasis)
      
      9. **COMMON MISTAKES TO AVOID**:
         ❌ DO NOT: const addToCart = () => alert('Added to cart');
         ✅ DO: const addToCart = (product) => { setCart(prev => [...prev, product]); };
         
         ❌ DO NOT: const total = 9999; (hardcoded)
         ✅ DO: const total = subtotal + tax + shipping; (calculated)
         
         ❌ DO NOT: onClick="handleClick()" (string)
         ✅ DO: onClick={() => handleClick()} (function)
         
         ❌ DO NOT: Fake payment buttons that do nothing
         ✅ DO: Real links like window.open('upi://pay?pa=...')
         
         ❌ DO NOT: Show empty cart view only
         ✅ DO: Show both product listing AND cart together (split screen or modal)
      
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
      📦 DATA REQUIREMENTS (CRITICAL FOR FUNCTIONALITY)
      ════════════════════════════════════════════════════════════════════════════════════════════════
      
      - Include 6-12 realistic sample items/products with:
        * Unique IDs (not just index)
        * Descriptive names (not "Product 1")
        * Real prices (appropriate to context, not $999 for everything)
        * Categories (for filtering)
        * Descriptions
        * Working image URLs (from unsplash.com)
        * Additional properties based on type (e.g., item.quantity for cart)
      
      EXAMPLE DATA STRUCTURE (E-commerce):
      const [products] = useState([
        { 
          id: 1, 
          name: "iPhone 15 Pro", 
          category: "Phones", 
          price: 99999, 
          image: "https://images.unsplash.com/...",
          description: "Latest iPhone with advanced features"
        },
        { 
          id: 2, 
          name: "MacBook Pro", 
          category: "Laptops", 
          price: 149999, 
          image: "https://images.unsplash.com/...",
          description: "Powerful laptop for professionals"
        },
        // ... 10+ more products ...
      ]);
      
      EXPECTED DATA TO BE USED:
      - Product price from data array MUST be used in display
      - Product image from data array MUST be used
      - When filtering by category, MUST filter from products array
      - When adding to cart, MUST push item from products array
      
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

    // 2. Validate the code structure
    if (!sanitizedCode || sanitizedCode.length < 50) {
      throw new Error('Generated code is too short or empty');
    }
    
    if (!sanitizedCode.includes('return') && !sanitizedCode.includes('React.createElement')) {
      throw new Error('Generated code does not contain a return statement');
    }
    
    // Check for basic React component structure
    const hasComponent = sanitizedCode.match(/(?:function|const)\s+[A-Z][a-zA-Z0-9]*/);
    if (!hasComponent) {
      throw new Error('Generated code does not contain a valid React component');
    }
    
    // 2.5 Analyze functional completeness
    const { CodeAnalyzer } = await import('../services/code-analyzer.js');
    const analysis = CodeAnalyzer.analyzeCode(sanitizedCode);
    
    console.log(`📊 Functional Completeness Analysis:`);
    console.log(`   - Syntax Valid: ${analysis.syntaxValid ? '✅' : '❌'}`);
    console.log(`   - State Management: ${analysis.features.hasStateManagement ? '✅' : '❌'}`);
    console.log(`   - Event Handlers: ${analysis.features.hasEventHandlers ? '✅' : '❌'}`);
    console.log(`   - Dynamic Calculations: ${analysis.features.hasDynamicCalculations ? '✅' : '❌'}`);
    console.log(`   - Features Detected:`, analysis.features);
    
    // For e-commerce, ensure we have core functionality
    if (userPrompt.toLowerCase().includes('cart') || 
        userPrompt.toLowerCase().includes('shop') || 
        userPrompt.toLowerCase().includes('shopping') ||
        userPrompt.toLowerCase().includes('ecommerce') ||
        userPrompt.toLowerCase().includes('checkout') ||
        userPrompt.toLowerCase().includes('payment')) {
      
      const ecommerceRequirements = [
        analysis.features.hasStateManagement,
        analysis.features.hasEventHandlers,
        analysis.features.hasCart || analysis.features.hasPricing,
        analysis.features.hasPricing || analysis.features.hasPayment
      ];
      
      const metRequirements = ecommerceRequirements.filter(Boolean).length;
      const completenessPercent = (metRequirements / ecommerceRequirements.length) * 100;
      
      console.log(`🛒 E-commerce Completeness: ${completenessPercent.toFixed(1)}%`);
      
      // If e-commerce code is incomplete, regenerate with stronger prompt
      if (completenessPercent < 80) {
        console.log('⚠️  E-commerce completeness below 80%, regenerating with enhanced prompt...');
        
        const enhancedPrompt = `${contextPrompt}

CRITICAL ADDITION - YOUR PREVIOUS CODE WAS INCOMPLETE:
Your last attempt was missing key e-commerce features. 
This time, you MUST include ALL of these:

✅ ABSOLUTE REQUIREMENTS (DO NOT SKIP):
1. useState for cart: const [cart, setCart] = useState([]);
2. useState for products: const [products] = useState([...]);
3. At least 5 product items in the array
4. addToCart function that ACTUALLY adds items to cart state
5. removeFromCart function that ACTUALLY removes items
6. updateQuantity function that changes item quantities
7. Price calculations:
   - subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
   - tax = Math.round(subtotal * 0.18)
   - shipping = cart.length > 0 ? 200 : 0
   - total = subtotal + tax + shipping
8. All calculations must be LIVE (update when cart changes)
9. onClick handlers for all buttons
10. Working payment links (upi://, razorpay.me, paypal.me)
11. data-element-id on EVERY interactive element

DO NOT generate incomplete or fake code this time.`;

        const enhancedParts = [
          { text: enhancedPrompt },
          { text: examplesPrompt },
          { text: finalUserPrompt }
        ];
        
        const rerryResponse = await generateWithFallback(enhancedParts);
        const retryCode = rerryResponse.text();
        const retryProcessed = sanitizeGeneratedCode(retryCode);
        
        console.log("🔄 Regenerated code with enhanced requirements");
        const codeWithGeneratedImages = replaceImagesWithGenerated(retryProcessed, generatedImages);
        
        return { code: codeWithGeneratedImages, error: null };
      }
    }
    
    console.log("✅ Code validation passed");

    // 3. Replace placeholder images with generated images
    const codeWithGeneratedImages = replaceImagesWithGenerated(sanitizedCode, generatedImages);
    
    console.log("✅ Code enhanced with AI-generated images");
    console.log("📄 Final code length:", codeWithGeneratedImages.length);
    console.log("✅ Returning code to frontend...");

    // 4. Return the enhanced code
    return { code: codeWithGeneratedImages, error: null };

  } catch (error) {
    // Handle errors during the generation process
    return { code: null, error: handleGenerationError(error, userPrompt) };
  }
}
