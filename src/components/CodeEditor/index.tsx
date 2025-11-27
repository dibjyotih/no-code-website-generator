import React, { useContext } from 'react';
import { CodeContext } from '../../contexts/CodeContext';

const CodeEditor: React.FC = () => {
  const codeContext = useContext(CodeContext);

  return (
    <div className="code-editor">
      <h2>Code Editor</h2>
      <pre>
        <code>{codeContext?.code}</code>
      </pre>
    </div>
  );
};

export default CodeEditor;
