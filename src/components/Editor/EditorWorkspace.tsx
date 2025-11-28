import { useState, useContext, useRef } from 'react';
import { CodeContext } from '../../contexts/CodeContext';
import InteractivePreview, { InteractivePreviewHandle } from './InteractivePreview';
import PropertyPanel from './PropertyPanel';
import CodeView from './CodeView.tsx';

interface EditorWorkspaceProps {
  onBack: () => void;
}

interface SelectedElement {
  id: string;
  type: string;
  styles: CSSStyleDeclaration;
  content: string;
  classes: string;
  element: HTMLElement;
}

const EditorWorkspace = ({ onBack }: EditorWorkspaceProps) => {
  const codeContext = useContext(CodeContext);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const previewRef = useRef<InteractivePreviewHandle>(null);
  const [modificationHistory, setModificationHistory] = useState<Array<{elementId: string, changes: Record<string, unknown>}>>([]);
  const [lastSelectedElementId, setLastSelectedElementId] = useState<string | null>(null);

  const handleElementSelect = (element: HTMLElement, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Get iframe document to update selection styling
    const iframeDoc = (document.querySelector('iframe[title="Interactive Preview"]') as HTMLIFrameElement)?.contentDocument;
    
    // Remove previous selection in iframe
    if (iframeDoc) {
      iframeDoc.querySelectorAll('.selected-element').forEach(el => {
        el.classList.remove('selected-element');
      });
      
      // Add selection to clicked element in iframe
      element.classList.add('selected-element');
    }
    
    const elementData: SelectedElement = {
      id: element.getAttribute('data-element-id') || Date.now().toString(),
      type: element.tagName.toLowerCase(),
      styles: window.getComputedStyle(element),
      content: element.textContent || '',
      classes: element.className,
      element: element
    };
    
    console.log('Element selected:', elementData);
    setSelectedElement(elementData);
    setLastSelectedElementId(elementData.id); // Remember the element ID
  };

  const handleDeleteElement = async () => {
    if (!selectedElement || !codeContext) return;

    console.log('🗑️ Deleting element:', selectedElement.id, 'Type:', selectedElement.type);
    
    // Build a detailed deletion prompt
    const prompt = `DELETE the specific element with data-element-id="${selectedElement.id}" from this component.

IMPORTANT DELETION INSTRUCTIONS:
1. Find and REMOVE the element with data-element-id="${selectedElement.id}"
2. If this element is part of a mapped array:
   - Extract the item ID from the data-element-id (e.g., "img-product-5" → ID is 5)
   - Remove that item from the data array (products, items, etc.)
   - Example: products.filter(p => p.id !== 5)
3. Remove the entire element structure, including:
   - The element itself (${selectedElement.type} tag)
   - Its parent container if it's a card/wrapper
   - Associated buttons and controls
4. Update any counters or totals that reference this element
5. Preserve ALL other elements and functionality
6. Keep ALL other data-element-id attributes unchanged
7. Return the complete, updated component code

Element Details:
- Type: ${selectedElement.type}
- ID: ${selectedElement.id}
- Content preview: "${selectedElement.content.substring(0, 100)}"

Make sure the component still works properly after deletion.`;

    try {
      setIsRegenerating(true);
      
      const response = await fetch('http://localhost:3001/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentCode: codeContext.code,
          prompt: prompt,
          context: { 
            deleteElement: true,
            elementId: selectedElement.id,
            elementType: selectedElement.type
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code) {
        codeContext.updateCode(data.code);
        setSelectedElement(null); // Close the panel after deletion
        console.log('✅ Element deleted successfully');
      } else {
        throw new Error('No code returned from server');
      }
    } catch (error) {
      console.error('❌ Error deleting element:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete element: ${errorMessage}\nPlease try again.`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApplyChanges = (changes: {
    styles: Record<string, string>;
    content?: string;
    imageUrl?: string;
    imageFile?: File;
    imagePrompt?: string;
    optimize?: string;
    background?: string;
  }) => {
    console.log('🎯 Applying changes:', changes);
    
    if (!selectedElement || !codeContext) return;

    // Store this modification in history for future reference
    const historyEntry = {
      elementId: selectedElement.id,
      changes: { ...changes, timestamp: Date.now() }
    };
    setModificationHistory(prev => [...prev, historyEntry]);

    // Use AI for ALL changes - this ensures proper code regeneration
    console.log('🤖 Using AI to apply all modifications...');
    
    // Build a detailed prompt for AI to regenerate the component with all changes
    let modificationPrompt = `I want to modify this component. Here are the changes:\n\n`;
    
    // Add previous modification context for continuity
    if (modificationHistory.length > 0) {
      modificationPrompt += `IMPORTANT - Previous modifications made (preserve these):\n`;
      modificationHistory.forEach((entry, idx) => {
        if (entry.changes.content) {
          modificationPrompt += `  ${idx + 1}. Text content was changed\n`;
        }
        if (entry.changes.imagePrompt) {
          modificationPrompt += `  ${idx + 1}. Image was modified\n`;
        }
        if (Object.keys(entry.changes.styles || {}).length > 0) {
          modificationPrompt += `  ${idx + 1}. Styles were adjusted\n`;
        }
      });
      modificationPrompt += `\n`;
    }
    
    // Add element identification with more context
    modificationPrompt += `Element to modify: ${selectedElement.type} tag`;
    if (selectedElement.id) {
      modificationPrompt += ` with id/data-element-id="${selectedElement.id}"`;
    }
    
    // Add additional context for image elements
    if (selectedElement.type === 'img' && selectedElement.element) {
      const imgElement = selectedElement.element as HTMLImageElement;
      modificationPrompt += `\nCurrent image src: ${imgElement.src?.substring(0, 100)}...`;
      if (imgElement.alt) {
        modificationPrompt += `\nImage alt text: "${imgElement.alt}"`;
      }
      // Try to find parent context (product name, etc.)
      const parent = imgElement.closest('[data-element-id]');
      if (parent) {
        const parentText = parent.textContent?.substring(0, 50);
        modificationPrompt += `\nParent element context: "${parentText}..."`;
      }
    }
    modificationPrompt += `\n\n`;
    
    // Add style changes
    if (Object.keys(changes.styles).length > 0) {
      modificationPrompt += `Style changes:\n`;
      Object.entries(changes.styles).forEach(([property, value]) => {
        modificationPrompt += `  - ${property}: ${value}\n`;
      });
      modificationPrompt += `\n`;
    }
    
    // Add content changes (for AI-based content modifications)
    if (changes.content && changes.content !== selectedElement.content) {
      modificationPrompt += `Content change:\n`;
      modificationPrompt += `  - Old: "${selectedElement.content.substring(0, 100)}"\n`;
      modificationPrompt += `  - New: "${changes.content.substring(0, 100)}"\n\n`;
    }
    
    // Add image changes
    if (changes.imagePrompt) {
      modificationPrompt += `Image change:\n`;
      modificationPrompt += `  - Generate a new image with this description: "${changes.imagePrompt}"\n`;
      modificationPrompt += `  - Use AI to create a professional, high-quality image\n\n`;
    } else if (changes.imageUrl) {
      modificationPrompt += `Image change:\n`;
      if (changes.imageUrl.startsWith('data:')) {
        modificationPrompt += `  - Replace the current image with the uploaded image provided in imageDataUrl field\n`;
        modificationPrompt += `  - IMPORTANT: Use the COMPLETE imageDataUrl value as the src attribute\n`;
        modificationPrompt += `  - The data URL will be provided separately (it's very long)\n\n`;
      } else {
        modificationPrompt += `  - New image URL: ${changes.imageUrl}\n\n`;
      }
    }
    
    // Add background change
    if (changes.background) {
      modificationPrompt += `Background change for the ENTIRE PAGE:\n`;
      let backgroundStyle = '';
      switch (changes.background) {
        case 'gradient-purple':
          backgroundStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          break;
        case 'gradient-ocean':
          backgroundStyle = 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)';
          break;
        case 'mesh-dark':
          backgroundStyle = 'radial-gradient(circle at 20% 50%, rgba(124, 0, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 127, 0.2) 0%, transparent 50%), #0F0F0F';
          break;
        default:
          backgroundStyle = '#FFFFFF';
      }
      modificationPrompt += `  - Apply this background to the outermost container/main div: background: "${backgroundStyle}"\n`;
      modificationPrompt += `  - Set minHeight: "100vh" on the main container to cover full viewport\n`;
      modificationPrompt += `  - Ensure the background covers the entire visible page\n`;
      modificationPrompt += `  - Adjust text colors for proper contrast if needed (light text on dark backgrounds, dark text on light backgrounds)\n\n`;
    }
    
    // Add optimization request
    if (changes.optimize === 'true') {
      modificationPrompt += `\n🎨 IMPORTANT: Also optimize and enhance the entire design:\n`;
      modificationPrompt += `  - Improve spacing, padding, and margins for better visual hierarchy\n`;
      modificationPrompt += `  - Enhance color scheme and contrast\n`;
      modificationPrompt += `  - Improve typography (font sizes, weights, line heights)\n`;
      modificationPrompt += `  - Add smooth transitions and hover effects where appropriate\n`;
      modificationPrompt += `  - Make the layout more modern and professional\n`;
      modificationPrompt += `  - Ensure mobile responsiveness\n\n`;
    }
    
    modificationPrompt += `CRITICAL: Preserve ALL previous text changes and modifications. Apply these changes and return the complete, optimized component code. Use ONLY inline styles (no className or Tailwind). Ensure all functionality is preserved.`;
    
    console.log('📝 Modification prompt:', modificationPrompt);
    console.log('🤖 Sending to AI for regeneration...');
    
    // Set loading state
    setIsRegenerating(true);
    
    // Prepare request body
    const requestBody: {
      componentCode: string;
      prompt: string;
      context: Record<string, unknown>;
      imageDataUrl?: string;
      imagePrompt?: string;
    } = {
      componentCode: codeContext.code,
      prompt: modificationPrompt,
      context: {
        elementId: selectedElement.id,
        elementType: selectedElement.type,
        optimize: changes.optimize === 'true',
        modificationHistory: modificationHistory  // Send full history
      }
    };
    
    // Add image data URL - this is the highest priority for image changes
    if (changes.imageUrl) {
      console.log('🖼️ Image change detected!');
      console.log('  - Image URL starts with:', changes.imageUrl.substring(0, 50));
      console.log('  - Is base64:', changes.imageUrl.startsWith('data:'));
      console.log('  - Total length:', changes.imageUrl.length);
      
      if (changes.imageUrl.startsWith('data:')) {
        // Base64 image data from uploaded file
        requestBody.imageDataUrl = changes.imageUrl;
        console.log('📷 Using uploaded image (base64 length:', changes.imageUrl.length, ')');
        console.log('  - Data prefix:', changes.imageUrl.substring(0, 50));
      } else if (changes.imageUrl.startsWith('http')) {
        // External URL
        requestBody.imageDataUrl = changes.imageUrl;
        console.log('🔗 Using image URL:', changes.imageUrl);
      } else {
        console.warn('⚠️ Unknown image URL format:', changes.imageUrl.substring(0, 100));
      }
      
      // Include element info for targeting the right image
      if (selectedElement.type === 'img' && selectedElement.element) {
        const imgElement = selectedElement.element as HTMLImageElement;
        requestBody.context.currentImageSrc = imgElement.src || '';
        requestBody.context.imageAlt = imgElement.alt || '';
        console.log('🎯 Target image element with src:', imgElement.src?.substring(0, 100));
      }
    }
    
    // Add image prompt if present
    if (changes.imagePrompt) {
      requestBody.imagePrompt = changes.imagePrompt;
      console.log('🎨 Including image generation prompt:', changes.imagePrompt);
    }
    
    // Send to backend for AI regeneration
    fetch('http://localhost:3001/modify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(data => {
      setIsRegenerating(false);
      if (data.code) {
        console.log('✅ AI regenerated component successfully!');
        console.log('📄 New code length:', data.code.length);
        codeContext.setCode(data.code);
        
        // Try to reselect the same element after iframe reloads
        if (lastSelectedElementId) {
          console.log('🔄 Will try to reselect element:', lastSelectedElementId);
          setTimeout(() => {
            const iframe = document.querySelector('iframe[title="Interactive Preview"]') as HTMLIFrameElement;
            const iframeDoc = iframe?.contentDocument;
            if (iframeDoc) {
              const element = iframeDoc.querySelector(`[data-element-id="${lastSelectedElementId}"]`) as HTMLElement;
              if (element) {
                console.log('✅ Reselected element for continued editing');
                // Reselect the element
                const elementData: SelectedElement = {
                  id: element.getAttribute('data-element-id') || lastSelectedElementId,
                  type: element.tagName.toLowerCase(),
                  styles: window.getComputedStyle(element),
                  content: element.textContent || '',
                  classes: element.className,
                  element: element
                };
                setSelectedElement(elementData);
                element.classList.add('selected-element');
              } else {
                console.warn('⚠️ Could not find element to reselect:', lastSelectedElementId);
              }
            }
          }, 1000); // Wait for iframe to reload
        }
      } else {
        console.error('❌ Failed to regenerate:', data.error);
        alert('Failed to apply changes: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(err => {
      setIsRegenerating(false);
      console.error('❌ Error calling AI modification:', err);
      const errorMsg = err.message || 'Unknown error';
      alert('Error communicating with AI: ' + errorMsg + '. Check console for details.');
    });
  };

  const handleExport = async () => {
    if (!codeContext?.code) {
      alert('No code to export');
      return;
    }

    try {
      // Call export endpoint to get full Next.js project
      const response = await fetch('http://localhost:3001/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentCode: codeContext.code,
          projectName: `webweave-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      if (data.success) {
        // Store project data in sessionStorage to avoid URL length limits
        const projectData = {
          files: data.project,
          name: data.projectName
        };
        
        sessionStorage.setItem('exportedProject', JSON.stringify(projectData));
        
        // Open deployment guide in new tab with just a flag
        window.open('/deployment-guide', '_blank');
      } else {
        alert('Export failed: ' + data.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export project. Please try again.');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .editor-container {
          animation: fadeIn 0.8s ease-in-out;
        }

        .selected-element {
          outline: 2px solid #7C00FF !important;
          outline-offset: 2px !important;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0D0D0D;
        }

        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .nav-button {
          transition: all 0.25s ease-in-out;
        }

        .nav-button:hover {
          transform: scale(1.05);
        }

        @media (max-width: 1024px) {
          .editor-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .preview-panel {
            width: 100% !important;
            height: 50vh !important;
          }
          .customizer-panel {
            width: 100% !important;
            height: 50vh !important;
          }
        }
      `}</style>

      <div className="editor-container" style={{ 
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0D0D0D',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* AI Regeneration Loading Overlay */}
        {isRegenerating && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '24px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              🤖
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AI is Regenerating Your Component
            </div>
            <div style={{
              fontSize: '16px',
              color: '#B0B0B0',
              marginBottom: '32px'
            }}>
              Applying changes and optimizing design...
            </div>
            <div style={{
              width: '200px',
              height: '4px',
              background: '#1A1A1A',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                animation: 'loading 1.5s ease-in-out infinite'
              }} />
            </div>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        {/* Top Navigation Bar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: '#0D0D0D',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          borderBottom: '1px solid #2A2A2A'
        }}>
          {/* Left: Back Button */}
          <button
            onClick={onBack}
            className="nav-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#B0B0B0',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EAEAEA'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#B0B0B0'}
          >
            ← Back
          </button>

          {/* Center: Title */}
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #FF007F, #7C00FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            WebWeave Editor
          </div>

          {/* Right: Control Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setViewMode('preview')}
              className="nav-button"
              style={{
                width: '100px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.25s ease-in-out',
                background: viewMode === 'preview' ? 'linear-gradient(90deg, #7C00FF, #FF007F)' : '#252525',
                color: '#FFFFFF'
              }}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className="nav-button"
              style={{
                width: '100px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.25s ease-in-out',
                background: viewMode === 'code' ? 'linear-gradient(90deg, #7C00FF, #FF007F)' : '#252525',
                color: '#FFFFFF'
              }}
            >
              Code
            </button>
            <button
              onClick={handleExport}
              className="nav-button"
              style={{
                width: '100px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'linear-gradient(90deg, #FF007F, #7C00FF)',
                color: '#FFFFFF',
                transition: 'all 0.25s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(124, 0, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Export
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="editor-grid" style={{
          marginTop: '70px',
          display: 'grid',
          gridTemplateColumns: '70% 30%',
          height: 'calc(100vh - 70px)',
          overflow: 'hidden'
        }}>
          {/* Left Panel: Preview Area */}
          <div className="preview-panel" style={{
            background: '#1A1A1A',
            padding: '24px',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 'calc(100vh - 70px)'
          }}>
            <div style={{
              background: '#1A1A1A',
              borderRadius: '12px',
              padding: '24px',
              minHeight: '100%'
            }}>
              {viewMode === 'preview' ? (
                <InteractivePreview 
                  ref={previewRef}
                  code={codeContext?.code || ''} 
                  onElementSelect={handleElementSelect}
                />
              ) : (
                <CodeView code={codeContext?.code || ''} />
              )}
            </div>
          </div>

          {/* Right Panel: Customizer Sidebar */}
          <div className="customizer-panel" style={{
            background: '#121212',
            padding: '32px',
            borderLeft: '1px solid #2A2A2A',
            overflowY: 'auto',
            height: 'calc(100vh - 70px)'
          }}>
            <PropertyPanel
              selectedElement={selectedElement}
              onApplyChanges={handleApplyChanges}
              onClose={() => setSelectedElement(null)}
              onDeleteElement={handleDeleteElement}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorWorkspace;
