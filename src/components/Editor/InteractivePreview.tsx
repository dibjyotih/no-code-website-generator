import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { transform } from 'sucrase';

interface InteractivePreviewProps {
  code: string;
  onElementSelect: (element: HTMLElement, event: React.MouseEvent) => void;
}

export interface InteractivePreviewHandle {
  updateElementStyle: (elementId: string, property: string, value: string) => void;
  updateElementContent: (elementId: string, content: string) => void;
  getIframeDocument: () => Document | null;
}

const InteractivePreview = forwardRef<InteractivePreviewHandle, InteractivePreviewProps>(
  ({ code, onElementSelect }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const elementStylesRef = useRef<Map<string, Record<string, string>>>(new Map());

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateElementStyle: (elementId: string, property: string, value: string) => {
      console.log(`[InteractivePreview] updateElementStyle called: ${elementId}, ${property}, ${value}`);
      if (!iframeRef.current) {
        console.log('[InteractivePreview] No iframe ref');
        return;
      }
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.log('[InteractivePreview] No iframe document');
        return;
      }

      const element = iframeDoc.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
      if (element) {
        console.log(`[InteractivePreview] Found element, updating ${property} to ${value}`);
        (element.style as unknown as Record<string, string>)[property] = value;
        
        // Store the style change
        const styles = elementStylesRef.current.get(elementId) || {};
        styles[property] = value;
        elementStylesRef.current.set(elementId, styles);
        
        console.log(`[InteractivePreview] Style updated successfully`);
      } else {
        console.log(`[InteractivePreview] Element not found: ${elementId}`);
      }
    },
    updateElementContent: (elementId: string, content: string) => {
      console.log(`[InteractivePreview] updateElementContent called: ${elementId}, "${content}"`);
      if (!iframeRef.current) {
        console.log('[InteractivePreview] No iframe ref');
        return;
      }
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.log('[InteractivePreview] No iframe document');
        return;
      }

      const element = iframeDoc.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
      if (element) {
        console.log(`[InteractivePreview] Found element, updating content`);
        element.textContent = content;
        console.log(`[InteractivePreview] Content updated successfully`);
      } else {
        console.log(`[InteractivePreview] Element not found: ${elementId}`);
      }
    },
    getIframeDocument: () => {
      return iframeRef.current?.contentDocument || null;
    }
  }));

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    try {
      // Transform the code
      let transformedCode = '';
      
      if (code && code.trim()) {
        let transformed;
        try {
          transformed = transform(code, {
            transforms: ['typescript', 'jsx'],
            production: true,
          });
        } catch (syntaxError) {
          console.error('Syntax error in generated code:', syntaxError);
          throw new Error(`Syntax Error: The generated code has invalid syntax. ${syntaxError instanceof Error ? syntaxError.message : 'Please try regenerating the component.'}`);
        }

        // Remove imports but keep the functionality by using globals
        // First, collect all React hooks being imported
        const hookMatches = transformed.code.match(/import\s+(?:React,?\s*)?\{([^}]*)\}\s*from\s+['"]react['"];?/g) || [];
        const allHooks = new Set<string>();
        
        hookMatches.forEach(match => {
          const hooksMatch = match.match(/\{([^}]*)\}/);
          if (hooksMatch) {
            hooksMatch[1].split(',').forEach(hook => {
              const trimmed = hook.trim();
              if (trimmed) allHooks.add(trimmed);
            });
          }
        });

        // Now transform the code
        transformedCode = transformed.code
          // Remove all React imports
          .replace(/import\s+React,?\s*\{[^}]*\}\s*from\s+['"]react['"];?\s*/g, '')
          .replace(/import\s+React\s+from\s+['"]react['"];?\s*/g, '')
          .replace(/import\s+\{[^}]*\}\s*from\s+['"]react['"];?\s*/g, '')
          .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
          .replace(/export\s+default\s+/g, 'window.GeneratedComponent = ')
          .replace(/export\s+\{[^}]*\}/g, '')
          .replace(/export\s+/g, '');

        // Note: React and ReactDOM are already declared in the HTML template
        // We also made all hooks available globally (window.useState, etc.)
        // So we don't need to redeclare anything here
      } else {
        // When no code is provided, set up an empty state component
        // Note: React is already declared in the HTML template, so we don't redeclare it
        transformedCode = `
window.GeneratedComponent = function EmptyState() {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }
  },
    React.createElement('div', { style: { fontSize: '5rem', marginBottom: '1rem' } }, '✨'),
    React.createElement('h2', { style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Ready to Create'),
    React.createElement('p', { style: { fontSize: '1.125rem', opacity: 0.9 } }, 'Click "Generate" to create your first component')
  );
};`;
      }

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
    }
    .preview-element {
      cursor: pointer;
      transition: outline 0.2s;
    }
    .preview-element:hover {
      outline: 1px dashed #7C00FF;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    try {
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      
      // Make React hooks available globally
      const { useState, useEffect, useRef, useContext, useReducer, useCallback, useMemo } = React;
      window.useState = useState;
      window.useEffect = useEffect;
      window.useRef = useRef;
      window.useContext = useContext;
      window.useReducer = useReducer;
      window.useCallback = useCallback;
      window.useMemo = useMemo;

      // Add data attributes and click handlers to elements
      const originalCreateElement = React.createElement;
      let elementCounter = 0;

      React.createElement = function(type, props, ...children) {
        if (typeof type === 'string') {
          const elementId = 'element-' + elementCounter++;
          const newProps = { 
            ...props,
            'data-element-id': elementId,
            className: (props?.className || '') + ' preview-element',
            onClick: (e) => {
              e.stopPropagation();
              window.parent.postMessage({
                type: 'element-clicked',
                elementId: elementId
              }, '*');
              if (props?.onClick) props.onClick(e);
            }
          };
          return originalCreateElement.apply(this, [type, newProps, ...children]);
        }
        return originalCreateElement.apply(this, [type, props, ...children]);
      };

      ${transformedCode}

      const GeneratedComponent = window.GeneratedComponent;
      if (!GeneratedComponent) {
        console.error('GeneratedComponent is not defined');
        throw new Error('Failed to create component. The generated code may have syntax errors.');
      }
      
      const container = document.getElementById('root');
      if (!container) {
        throw new Error('Root container not found');
      }
      
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(GeneratedComponent));
      
      console.log('Component rendered successfully');
    } catch (error) {
      console.error('Preview error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      document.body.innerHTML = \`
        <div style="padding: 2rem; color: #DC2626; background: #FEE2E2; border-radius: 8px; margin: 2rem; font-family: system-ui, -apple-system, sans-serif;">
          <h2 style="font-weight: bold; margin-bottom: 1rem; font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 2rem;">⚠️</span>
            Preview Error
          </h2>
          <div style="background: white; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
            <strong style="color: #991B1B;">Error:</strong>
            <pre style="white-space: pre-wrap; font-size: 0.875rem; margin-top: 0.5rem; color: #7F1D1D;">\${errorMessage}</pre>
          </div>
          <details style="background: white; padding: 1rem; border-radius: 4px; cursor: pointer;">
            <summary style="font-weight: 600; color: #991B1B;">Stack Trace</summary>
            <pre style="white-space: pre-wrap; font-size: 0.75rem; margin-top: 0.5rem; color: #7F1D1D; max-height: 300px; overflow: auto;">\${errorStack || 'No stack trace available'}</pre>
          </details>
          <div style="margin-top: 1rem; padding: 1rem; background: #FEF3C7; border-radius: 4px; color: #92400E;">
            <strong>💡 Tip:</strong> Try regenerating the component or check the browser console for more details.
          </div>
        </div>
      \`;
    }
  </script>
</body>
</html>`;

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Listen for element clicks from iframe
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'element-clicked') {
          const iframe = iframeRef.current;
          const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
          if (iframeDoc) {
            const element = iframeDoc.querySelector(`[data-element-id="${event.data.elementId}"]`) as HTMLElement;
            if (element) {
              // Create a synthetic event for the parent
              const syntheticEvent = {
                stopPropagation: () => {},
                preventDefault: () => {}
              } as React.MouseEvent;
              onElementSelect(element, syntheticEvent);
            }
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Auto-resize iframe based on content height
      const resizeIframe = () => {
        if (iframe.contentWindow) {
          try {
            const contentHeight = iframe.contentDocument?.body.scrollHeight || 0;
            if (contentHeight > 0) {
              iframe.style.height = contentHeight + 'px';
            }
          } catch (e) {
            console.error('Error resizing iframe:', e);
          }
        }
      };

      // Resize after content loads and on window resize
      setTimeout(resizeIframe, 100);
      setTimeout(resizeIframe, 500);
      setTimeout(resizeIframe, 1000);
      
      const resizeObserver = new ResizeObserver(resizeIframe);
      if (iframe.contentDocument?.body) {
        resizeObserver.observe(iframe.contentDocument.body);
      }

      // Reapply any stored styles after content loads
      setTimeout(() => {
        elementStylesRef.current.forEach((styles, elementId) => {
          const element = iframeDoc.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
          if (element) {
            Object.entries(styles).forEach(([property, value]) => {
              (element.style as unknown as Record<string, string>)[property] = value;
            });
          }
        });
      }, 100);

      return () => {
        window.removeEventListener('message', handleMessage);
        resizeObserver.disconnect();
      };
    } catch (error) {
      console.error('Error rendering preview:', error);
      
      // Display error in iframe
      if (iframeDoc) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
    }
    .error-container {
      max-width: 600px;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 2rem;
    }
    .error-icon {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    h2 {
      color: #DC2626;
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      text-align: center;
    }
    .error-message {
      background: #FEF2F2;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #DC2626;
      margin-bottom: 1rem;
      color: #991B1B;
      line-height: 1.6;
    }
    .suggestions {
      background: #FEF3C7;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #F59E0B;
      color: #92400E;
    }
    .suggestions strong {
      display: block;
      margin-bottom: 0.5rem;
    }
    ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    li {
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <h2>Preview Error</h2>
    <div class="error-message">
      ${errorMessage}
    </div>
    <div class="suggestions">
      <strong>💡 Suggestions:</strong>
      <ul>
        <li>Click the "Back" button and try regenerating with a clearer prompt</li>
        <li>The AI might have generated incomplete or invalid code</li>
        <li>Try simplifying your request and generate again</li>
        <li>Check the browser console (F12) for more details</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
        
        iframeDoc.open();
        iframeDoc.write(errorHTML);
        iframeDoc.close();
      }
    }
  }, [code, onElementSelect]);

  return (
    <div style={{ width: '100%', minHeight: '100%', backgroundColor: '#FFFFFF' }}>
      <iframe
        ref={iframeRef}
        title="Interactive Preview"
        style={{ 
          width: '100%', 
          minHeight: '600px',
          border: 'none', 
          display: 'block' 
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
});

InteractivePreview.displayName = 'InteractivePreview';

export default InteractivePreview;
