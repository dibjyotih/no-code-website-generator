import { useState } from 'react';
import './App.css';
import { CodeProvider } from './contexts/CodeContext';
import LandingPage from './components/Landing/LandingPage';
import EditorWorkspace from './components/Editor/EditorWorkspace';

function App() {
  const [showWorkspace, setShowWorkspace] = useState(false);

  return (
    <CodeProvider>
      {showWorkspace ? (
        <EditorWorkspace onBack={() => setShowWorkspace(false)} />
      ) : (
        <LandingPage onEnterWorkspace={() => setShowWorkspace(true)} />
      )}
    </CodeProvider>
  );
}

export default App;