import axios from 'axios';

// Use HuggingFace Inference API for fast image generation
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const API_URL = "https://api-inference.huggingface.co/models";

// DISABLE HuggingFace for now - the free tier doesn't support image generation anymore
const USE_PLACEHOLDER = true; // Force Unsplash fallback

/**
 * Generate an image from a text prompt using HuggingFace
 * @param {string} prompt - Description of the image to generate
 * @returns {Promise<string>} - URL or base64 data URL of the generated image
 */
async function generateImage(prompt) {
  if (USE_PLACEHOLDER) {
    console.log('⚠️ No HuggingFace API key, using Unsplash placeholder');
    return getUnsplashImage(prompt);
  }

  try {
    console.log(`🎨 Generating image: "${prompt}"`);
    
    const response = await axios.post(
      `${API_URL}/${IMAGE_MODEL}`,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      }
    );

    // Convert to base64
    const base64 = Buffer.from(response.data).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('✅ Image generated successfully');
    return dataUrl;
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    console.log('⚠️ Falling back to Unsplash');
    return getUnsplashImage(prompt);
  }
}

/**
 * Get a relevant Unsplash image as fallback
 * @param {string} prompt - Description to match
 * @returns {string} - Unsplash image URL
 */
function getUnsplashImage(prompt) {
  // Extract keywords from prompt
  const keywords = prompt.toLowerCase();
  
  // Map keywords to relevant Unsplash images with FULL query params and cache busting
  const timestamp = Date.now();
  
  if (keywords.includes('car') || keywords.includes('vehicle') || keywords.includes('automotive')) {
    return `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('headphone') || keywords.includes('audio')) {
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('watch') || keywords.includes('time')) {
    return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('camera') || keywords.includes('photo')) {
    return `https://images.unsplash.com/photo-1520342868574-5fa3804e551c?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('computer') || keywords.includes('laptop')) {
    return `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('phone') || keywords.includes('smartphone') || keywords.includes('iphone')) {
    return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('backpack') || keywords.includes('bag')) {
    return `https://images.unsplash.com/photo-1553062407-98eeb649a4ac?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('coffee') || keywords.includes('drink')) {
    return `https://images.unsplash.com/photo-1561530756-3221b212356c?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('sunglasses') || keywords.includes('glasses')) {
    return `https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80`;
  } else if (keywords.includes('fashion') || keywords.includes('clothing')) {
    return `https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80`;
  }
  
  // Default: random product with better quality
  return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80`;
}

/**
 * Generate multiple images for a component based on context
 * @param {string} componentType - Type of component (e.g., 'ecommerce', 'portfolio', 'blog')
 * @param {number} count - Number of images needed
 * @returns {Promise<string[]>} - Array of image URLs
 */
async function generateImagesForComponent(componentType, count = 6) {
  const prompts = getPromptsForComponentType(componentType, count);
  
  console.log(`🎨 Generating ${count} images for ${componentType} component...`);
  
  // Generate all images in parallel for speed
  const imagePromises = prompts.map(prompt => generateImage(prompt));
  const images = await Promise.all(imagePromises);
  
  console.log(`✅ Generated ${images.length} images`);
  return images;
}

/**
 * Get appropriate prompts based on component type
 */
function getPromptsForComponentType(componentType, count) {
  const type = componentType.toLowerCase();
  
  const promptTemplates = {
    ecommerce: [
      'modern wireless headphones on white background, product photography',
      'sleek smartwatch with digital display, product photo',
      'portable bluetooth speaker, professional product image',
      'gaming mouse with rgb lighting, studio photography',
      'laptop computer on desk, clean product shot',
      'smartphone on gradient background, commercial photography'
    ],
    portfolio: [
      'modern web design project screenshot, ui/ux',
      'mobile app interface design, clean and minimal',
      'creative dashboard design, vibrant colors',
      'e-commerce website mockup, professional',
      'landing page design, modern aesthetic',
      'social media app interface, trendy design'
    ],
    blog: [
      'cozy coffee shop interior with laptop',
      'minimal desk setup with plants',
      'modern workspace with natural lighting',
      'creative studio environment',
      'reading nook with books',
      'inspiring office space design'
    ],
    gallery: [
      'abstract art painting, vibrant colors',
      'modern sculpture in gallery space',
      'contemporary photography, artistic',
      'digital art illustration, creative',
      'minimalist design artwork',
      'colorful mixed media art'
    ]
  };
  
  // Get prompts for the specific type or use ecommerce as default
  const prompts = promptTemplates[type] || promptTemplates.ecommerce;
  
  // Return exactly 'count' prompts, cycling if necessary
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(prompts[i % prompts.length]);
  }
  
  return result;
}

export { generateImage, generateImagesForComponent, getUnsplashImage };
