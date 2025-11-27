import { useState, useEffect, useContext } from 'react';
import { transform } from 'sucrase';
import { EditorContext } from '../contexts/EditorContext';

const createHtml = (componentCode: string, selectedComponentId: string | null) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Live Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body { 
        margin: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        overflow-y: auto;
        min-height: 100vh;
        background-color: #ffffff;
      }
      [data-component-id]:hover {
        outline: 2px dashed #3b82f6;
        cursor: pointer;
      }
      .selected-component {
        outline: 2px solid #3b82f6 !important;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      try {
        const React = window.React;
        const selectedComponentId = "${selectedComponentId || ''}";

        // Monkey-patch React.createElement to add data attributes and click handlers
        const originalCreateElement = React.createElement;
        let componentCounter = 0;
        React.createElement = function(type, props, ...children) {
          const componentId = 'comp-' + componentCounter++;
          const newProps = { ...props };
          
          if (typeof type === 'string') {
            newProps['data-component-id'] = componentId;
            newProps.onClick = (e) => {
              e.stopPropagation();
              window.parent.postMessage({
                source: 'live-preview',
                type: 'component-selected',
                componentId: componentId
              }, '*');
            };
            if (componentId === selectedComponentId) {
                newProps.className = (newProps.className || '') + ' selected-component';
            }
          }
          
          return originalCreateElement.apply(this, [type, newProps, ...children]);
        };

        ${componentCode}

        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', { style: { padding: '1rem', color: 'red' } },
                        React.createElement('h2', null, 'Runtime Error'),
                        React.createElement('pre', null, this.state.error.toString())
                    );
                }
                return this.props.children;
            }
        }

        // Get the component from the window global
        const GeneratedComponent = window.GeneratedComponent;
        if (!GeneratedComponent) {
          throw new Error('No component exported. Make sure your code exports a default component.');
        }
        const App = () => React.createElement(ErrorBoundary, null, React.createElement(GeneratedComponent));
        root.render(React.createElement(App));

      } catch (e) {
        console.error('Preview render error:', e);
        const root = document.getElementById('root');
        root.innerHTML = \`
          <div style="padding: 2rem; color: #991b1b; background: #fee2e2; border-radius: 12px; margin: 2rem; border: 2px solid #fca5a5;">
            <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">⚠️ Render Error</h2>
            <pre style="font-size: 0.875rem; white-space: pre-wrap; margin-top: 1rem; background: white; padding: 1rem; border-radius: 8px; border: 1px solid #fca5a5;">\${e.message}</pre>
            <p style="margin-top: 1rem; font-size: 0.875rem;">Check the browser console for more details.</p>
          </div>
        \`;
      }
    </script>
  </body>
  </html>`;
};


export const useLivePreview = (rawCode: string) => {
  const editorContext = useContext(EditorContext);
  const selectedComponentId = editorContext?.selectedComponentId || null;
  const [iframeContent, setIframeContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎨 useLivePreview - rawCode:', rawCode ? `${rawCode.length} chars` : 'NO CODE RECEIVED');
    
    if (!rawCode) {
      const emptyComponent = `
        window.GeneratedComponent = () => {
          const containerStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          };
          
          const iconStyle = {
            fontSize: '5rem',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
          };
          
          const titleStyle = {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '0.75rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          };
          
          const textStyle = {
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.125rem'
          };
          
          return React.createElement('div', { style: containerStyle },
            React.createElement('div', { style: iconStyle }, '✨'),
            React.createElement('h2', { style: titleStyle }, 'Ready to Create Magic'),
            React.createElement('p', { style: textStyle }, 'Generate a component to see the live preview here.')
          );
        };
      `;
      setIframeContent(createHtml(emptyComponent, selectedComponentId));
      setError(null);
      return;
    }

    try {
      console.log('🔄 Transforming code with Sucrase...');
      const transformed = transform(rawCode, {
        transforms: ['typescript', 'jsx'],
        production: true,
      });

      // Remove import statements and fix exports
      const cleanedCode = transformed.code
        .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove all imports
        .replace(/export\s+default\s+/g, 'window.GeneratedComponent = ') // Assign to window
        .replace(/export\s+\{[^}]*\}/g, '') // Remove named exports
        .replace(/export\s+/g, ''); // Remove other export keywords
      
      const bundledCode = `
        ${cleanedCode}
      `;
      
      console.log('✅ Code transformed successfully, setting iframe content...');
      setIframeContent(createHtml(bundledCode, selectedComponentId));
      setError(null);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('❌ Transpilation error:', message);
        setError(`Transpilation Error: ${message}`);
        const errorHtml = `<div style="color: red; padding: 1rem;"><h2>Transpilation Error</h2><pre>${message}</pre></div>`;
        setIframeContent(createHtml(`document.body.innerHTML = \`${errorHtml}\``, selectedComponentId));
    }
  }, [rawCode, selectedComponentId]);

  return { iframeContent, error };
};
