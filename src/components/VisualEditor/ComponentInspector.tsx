import { useContext } from 'react';
import { EditorContext } from '../../contexts/EditorContext';

const ComponentInspector = () => {
  const editorContext = useContext(EditorContext);

  return (
    <div className="p-4 bg-gray-100">
      <h3 className="text-lg">Component Inspector</h3>
      {editorContext?.selectedComponentId ? (
        <p>Selected Component: {editorContext.selectedComponentId}</p>
      ) : (
        <p>No component selected.</p>
      )}
    </div>
  );
};

export default ComponentInspector;
