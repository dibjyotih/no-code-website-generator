import { useContext } from 'react';
import { CodeContext } from '../../contexts/CodeContext';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const context = useContext(CodeContext);

  if (!context) {
    throw new Error('CodeEditor must be used within a CodeProvider');
  }

  const { code, setCode } = context;

  return (
    <div className="h-full w-full">
       <Editor
        height="100%"
        language="typescript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

export default CodeEditor;
