import React from 'react';

interface PreviewIframeProps {
  srcDoc: string;
}

const PreviewIframe: React.FC<PreviewIframeProps> = ({ srcDoc }) => {
  return (
    <iframe
      srcDoc={srcDoc}
      title="Live Preview"
      sandbox="allow-scripts"
      width="100%"
      height="100%"
      style={{ border: 'none', backgroundColor: 'white' }}
    />
  );
};

export default PreviewIframe;
