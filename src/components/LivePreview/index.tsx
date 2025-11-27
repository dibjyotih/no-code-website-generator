import React, { useContext } from 'react';
import { EditorContext } from '../../contexts/EditorContext';
import { CodeContext } from '../../contexts/CodeContext';
import EditingOverlay from '../VisualEditor/EditingOverlay';

const LivePreview: React.FC = () => {
  const editorContext = useContext(EditorContext);
  const codeContext = useContext(CodeContext);

  const handleComponentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    editorContext?.setSelectedComponentId(target.dataset.componentId || null);
  };

  return (
    <div className="live-preview" onClick={handleComponentClick}>
      <h2>Live Preview</h2>
      <div dangerouslySetInnerHTML={{ __html: codeContext?.code || '' }} />
      <EditingOverlay />
    </div>
  );
};

export default LivePreview;
