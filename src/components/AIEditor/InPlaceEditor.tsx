import { useContext, useState } from 'react';
import { EditorContext } from '../../contexts/EditorContext';
import { CodeContext } from '../../contexts/CodeContext';

const InPlaceEditor = () => {
  const editorContext = useContext(EditorContext);
  const codeContext = useContext(CodeContext);
  const [prompt, setPrompt] = useState('');

  if (!editorContext || !codeContext) {
    return <div>Loading...</div>;
  }

  const handleModify = () => {
    if (editorContext?.selectedComponentId) {
      codeContext.modifyCode(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="p-4">
      {editorContext?.selectedComponentId && (
        <div>
          <h3 className="text-lg">Modify Component</h3>
          <textarea
            className="w-full h-24 p-2 border rounded"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the changes you want to make..."
          />
          <button
            onClick={handleModify}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Apply Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default InPlaceEditor;
