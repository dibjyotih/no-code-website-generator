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
        const transformed = transform(code, {
          transforms: ['typescript', 'jsx'],
          production: true,
        });

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
      if (GeneratedComponent) {
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(GeneratedComponent));
      }
    } catch (error) {
      console.error('Preview error:', error);
      document.body.innerHTML = \`
        <div style="padding: 2rem; color: #EF4444; background: #FEE2E2; border-radius: 8px; margin: 2rem;">
          <h2 style="font-weight: bold; margin-bottom: 0.5rem;">Preview Error</h2>
          <pre style="white-space: pre-wrap; font-size: 0.875rem;">\${error.message}</pre>
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
