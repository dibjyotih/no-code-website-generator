/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import express from 'express';
import cors from 'cors';
import { initializeRagSystem, ragSystem } from './rag-system/index.js';
import { componentGenerator } from './generators/component-generator.js';
import { reviewCode } from './services/code-validator.js';
import { modifyComponent } from './services/contextual-modifier.js';
import { generateImage } from './services/image-generator.js';
import multer from 'multer';
import { performanceMonitor } from './services/performance-monitor.js';
import { TestRunner } from './test-suite.js';
import { ProjectWrapper } from './services/project-wrapper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from root directory for dashboard
app.use(express.static(path.join(process.cwd())));

// Track API latency for all requests
const startTime = Date.now();
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    performanceMonitor.trackAPIRequest(req.path, duration);
  });
  next();
});

// ============ METRICS AND TESTING ENDPOINTS ============
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dashboard.html'));
});

app.get('/metrics', (req, res) => {
  const summary = performanceMonitor.getSummary();
  summary.system = {
    uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
    lastUpdate: new Date().toISOString()
  };
  res.json({ summary });
});

app.get('/metrics/detailed', (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json({ metrics });
});

app.post('/metrics/reset', (req, res) => {
  // performanceMonitor.reset(); // Method not implemented yet
  res.json({ message: 'Metrics reset requested (not implemented)' });
});

app.get('/test-results', (req, res) => {
  try {
    const resultsPath = path.join(process.cwd(), 'backend', 'test-results.json');
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      res.json(results);
    } else {
      res.json({ message: 'No test results available. Run tests first.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read test results' });
  }
});

app.post('/run-tests', async (req, res) => {
  try {
    console.log('🧪 Running comprehensive test suite...');
    const testRunner = new TestRunner();
    const results = await testRunner.runAllTests();
    
    console.log('✅ Test suite completed');
    const summary = performanceMonitor.getSummary();
    summary.system = {
      uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
      lastUpdate: new Date().toISOString()
    };
    
    res.json({ 
      message: 'Tests completed successfully',
      summary: {
        ...results,
        metrics: summary
      }
    });
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    res.status(500).json({ error: 'Failed to run tests' });
  }
});

// ============ GENERATION AND MODIFICATION ENDPOINTS ============

app.post('/generate', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  let imagePart = null;
  if (req.file) {
    imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };
  }

  const result = await componentGenerator(prompt, imagePart);

  if (result.error) {
    console.error("❌ Returning error to frontend:", result.error);
    performanceMonitor.trackGeneration(Date.now() - startTime, 'unknown', false, false, false, []);
    return res.status(500).json(result.error);
  }
  
  // Analyze generated code quality
  const { CodeAnalyzer } = await import('./services/code-analyzer.js');
  const analysis = CodeAnalyzer.analyzeCode(result.code);
  
  // Determine complexity from prompt length
  const complexity = prompt.length < 50 ? 'simple' : prompt.length < 150 ? 'medium' : 'complex';
  
  // Track generation metrics
  performanceMonitor.trackGeneration(
    Date.now() - startTime,
    complexity,
    true,
    analysis.syntaxValid,
    analysis.functionalComplete,
    analysis.features
  );
  
  console.log("✅ Sending successful response to frontend with code length:", result.code?.length);
  res.json({ code: result.code });
});

app.post('/review', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required for review' });
  }

  try {
    const review = await reviewCode(code);
    res.json({ review });
  } catch (error) {
    console.error('Error during review:', error);
    res.status(500).json({ error: 'Failed to review code' });
  }
});

app.post('/modify', async (req, res) => {
  const startTime = Date.now();
  const { componentCode, prompt, context, imageDataUrl, imagePrompt } = req.body;
  if (!componentCode || !prompt) {
      return res.status(400).json({ error: 'Component code and prompt are required' });
  }

  try {
      console.log('🔄 Modifying component...');
      console.log('📝 Prompt:', prompt.substring(0, 200));
      console.log('📦 Context received:', JSON.stringify(context, null, 2));
      
      // PRIORITY 1: Handle AI image generation if imagePrompt is provided
      if (imagePrompt) {
        console.log(`🎨 AI Image Generation requested: "${imagePrompt}"`);
        const newImage = await generateImage(imagePrompt);
        console.log('✅ New image generated, length:', newImage.length);
        
        // Replace the image in the code
        let modifiedCode = componentCode;
        let replaced = false;
        
        // BEST METHOD: If we have currentImageSrc, find exact image by src
        if (context && context.currentImageSrc) {
          console.log('🎯 Using currentImageSrc to find exact image');
          const currentSrc = context.currentImageSrc;
          
          // Match img tag with this specific src
          const escapedSrc = currentSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const imgWithSrcRegex = new RegExp(`<img([^>]*src=["'])${escapedSrc}(["'][^>]*)>`, 'i');
          const matchedImg = componentCode.match(imgWithSrcRegex);
          
          if (matchedImg) {
            const targetImg = matchedImg[0];
            console.log('✅ Found exact image by src URL');
            const newImg = targetImg.replace(/src="[^"]*"/i, `src="${newImage}"`);
            modifiedCode = componentCode.replace(targetImg, newImg);
            replaced = true;
          } else {
            console.warn('⚠️ Could not find image with exact src, trying simplified match');
            // Try simpler pattern - just replace the src value
            const simpleSrcPattern = new RegExp(`(src=["'])${escapedSrc}(["'])`, 'i');
            if (simpleSrcPattern.test(componentCode)) {
              modifiedCode = componentCode.replace(simpleSrcPattern, `$1${newImage}$2`);
              replaced = true;
              console.log('✅ Replaced using simplified src pattern');
            }
          }
        }
        
        // FALLBACK: Try by data-element-id if currentImageSrc not available
        if (!replaced && context && context.elementId) {
          console.log('📸 Trying to find image by element structure');
          const imgMatches = componentCode.match(/<img[^>]*>/gi) || [];
          console.log(`📸 Found ${imgMatches.length} images in component`);
          
          // Try to find by data-element-id
          const imgWithIdRegex = new RegExp(`<img[^>]*data-element-id="${context.elementId}"[^>]*>`, 'i');
          const matchedImg = componentCode.match(imgWithIdRegex);
          
          if (matchedImg) {
            const targetImg = matchedImg[0];
            const newImg = targetImg.replace(/src="[^"]*"/i, `src="${newImage}"`);
            modifiedCode = componentCode.replace(targetImg, newImg);
            replaced = true;
            console.log('✅ Replaced using data-element-id');
          } else if (imgMatches.length === 1) {
            // If only one image, replace it
            const targetImg = imgMatches[0];
            const newImg = targetImg.replace(/src="[^"]*"/i, `src="${newImage}"`);
            modifiedCode = componentCode.replace(targetImg, newImg);
            replaced = true;
            console.log('✅ Replaced the only image in component');
          }
        }
        
        if (!replaced) {
          console.warn('⚠️ Last resort: Replacing first image');
          modifiedCode = componentCode.replace(/(<img[^>]*src=")([^"]+)(")/i, `$1${newImage}$3`);
        }
        
        // Track modification
        const { CodeAnalyzer } = await import('./services/code-analyzer.js');
        const preservation = CodeAnalyzer.checkModificationPreservation(componentCode, modifiedCode);
        performanceMonitor.trackModification(preservation.preservedFunctionality, preservation.preservedIds);
        
        console.log('📤 Returning modified code, length:', modifiedCode.length);
        return res.json({ code: modifiedCode });
      }
      
      // PRIORITY 2: Handle base64 image upload - Use AI for proper code regeneration
      if (imageDataUrl && imageDataUrl.startsWith('data:')) {
        console.log('📷 Base64 image upload detected, length:', imageDataUrl.length);
        console.log('🤖 Using AI to properly update image in component structure...');
        
        // Use AI to handle the replacement - it understands component structure better
        const modifiedCode = await modifyComponent(componentCode, prompt, context, imageDataUrl);
        
        // Sanitize the modified code
        const { sanitizeGeneratedCode } = await import('./services/code-sanitizer.js');
        const sanitizedCode = sanitizeGeneratedCode(modifiedCode);
        
        // Check if AI returned empty or invalid code
        if (!sanitizedCode || sanitizedCode.length < 100) {
          console.error('❌ AI returned empty/invalid code');
          performanceMonitor.trackModification(false, false);
          return res.status(500).json({ error: 'AI modification failed' });
        }
        
        // Track modification
        const { CodeAnalyzer } = await import('./services/code-analyzer.js');
        const preservation = CodeAnalyzer.checkModificationPreservation(componentCode, sanitizedCode);
        performanceMonitor.trackModification(preservation.preservedFunctionality, preservation.preservedIds);
        
        console.log('✅ Image updated with AI, sanitized code length:', sanitizedCode.length);
        return res.json({ code: sanitizedCode });
      }
      
      // PRIORITY 3: Use AI for other modifications
      console.log('🤖 Using AI for code modification...');
      
      const modifiedCode = await modifyComponent(componentCode, prompt, context, undefined);
      
        // Sanitize the modified code
        const { sanitizeGeneratedCode } = await import('./services/code-sanitizer.js');
        const sanitizedCode = sanitizeGeneratedCode(modifiedCode);
        
        // Check if AI returned empty or invalid code
        if (!sanitizedCode || sanitizedCode.length < 100) {
          console.error('❌ AI returned empty/invalid code');
          performanceMonitor.trackModification(false, false);
          return res.status(500).json({ error: 'AI modification failed' });
        }
        
        // Track modification
        const { CodeAnalyzer } = await import('./services/code-analyzer.js');
        const preservation = CodeAnalyzer.checkModificationPreservation(componentCode, sanitizedCode);
        performanceMonitor.trackModification(preservation.preservedFunctionality, preservation.preservedIds);
      
      console.log('✅ Code sanitized, length:', sanitizedCode.length);
      console.log('✅ Component modification complete');
      res.json({ code: sanitizedCode });
  } catch (error) {
      console.error('❌ Error during modification:', error);
      performanceMonitor.trackModification(false, false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to modify code: ' + errorMessage });
  }
});

app.post('/regenerate-with-image', upload.single('image'), async (req, res) => {
  const { currentCode, elementId, imageData, optimize } = req.body;
  
  if (!currentCode || !imageData) {
    return res.status(400).json({ error: 'Current code and image data are required' });
  }

  try {
    // Create a prompt to regenerate the component with the new image
    let prompt = `I have this existing component. I want to replace the image in element with id "${elementId}" with a new image I'm providing. `;
    
    if (optimize === 'true') {
      prompt += `Also, please optimize and enhance the overall design to make it look modern, professional, and visually appealing. Improve spacing, colors, typography, and layout while keeping the core functionality. `;
    }
    
    prompt += `Keep all other elements and functionality exactly the same. The new image data is: ${imageData.substring(0, 100)}... (base64 data URL). Replace the existing image URL with this data URL.`;

    const modifiedCode = await modifyComponent(currentCode, prompt, { preserveStructure: true });
    
    console.log('✅ Component regenerated with new image');
    res.json({ code: modifiedCode });
  } catch (error) {
    console.error('❌ Error regenerating with image:', error);
    res.status(500).json({ error: 'Failed to regenerate component with image' });
  }
});

// ============ DEPLOYMENT ENDPOINTS ============
// Export endpoint - generates complete Next.js project bundle
app.post('/export', async (req, res) => {
  try {
    const { componentCode, projectName } = req.body;

    if (!componentCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Component code is required' 
      });
    }

    // Generate project name if not provided
    const finalProjectName = projectName || `webweave-${Date.now()}`;

    // Create complete Next.js project
    const project = ProjectWrapper.createDeployableProject(componentCode, finalProjectName);

    // Validate project structure
    if (!ProjectWrapper.validateProject(project)) {
      throw new Error('Invalid project structure generated');
    }

    // Calculate project size
    const sizeKB = ProjectWrapper.estimateSize(project);

    res.json({
      success: true,
      project: project,
      projectName: finalProjectName,
      filesCount: Object.keys(project).length,
      sizeKB: sizeKB
    });

  } catch (error) {
    console.error('❌ Export failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    });
  }
});

// Server Initialization
const startServer = async () => {
  try {
    await initializeRagSystem();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🚀 AI Website Generator Ready`);
      if (ragSystem.isReady()) {
        console.log('RAG system is ready.');
      } else {
        console.log('RAG system is not ready. Running in fallback mode.');
      }
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


