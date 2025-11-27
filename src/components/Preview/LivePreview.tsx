import { useContext, useEffect } from 'react';
import { CodeContext } from '../../contexts/CodeContext';
import { useLivePreview } from '../../hooks/useLivePreview';
import { useComponentSelection } from '../../hooks/useComponentSelection';

const LivePreview = () => {
  const codeContext = useContext(CodeContext);
  if (!codeContext) {
    throw new Error('LivePreview must be used within a CodeProvider');
  }
  const { code } = codeContext;
  const { iframeContent, error } = useLivePreview(code);
  const { selectComponent } = useComponentSelection();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { source, type, componentId } = event.data;
      if (source === 'live-preview' && type === 'component-selected') {
        selectComponent(componentId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [selectComponent]);

  return (
    <div className="h-full bg-white relative overflow-hidden">
      {error && (
        <div className="absolute top-0 left-0 w-full h-full bg-red-100 text-red-700 p-4 z-10 overflow-auto">
          <h3 className="font-bold">Preview Error</h3>
          <pre className="text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      <iframe
        srcDoc={iframeContent}
        title="Live Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default LivePreview;
