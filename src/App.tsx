import { useState, useEffect } from 'react';
import './App.css';
import { CodeProvider } from './contexts/CodeContext';
import LandingPage from './components/Landing/LandingPage';
import EditorWorkspace from './components/Editor/EditorWorkspace';
import { DeploymentGuide } from './components/Export/DeploymentGuide';

function App() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);
  const [projectData, setProjectData] = useState<{ files: Record<string, string | object>; name: string } | null>(null);

  useEffect(() => {
    // Check if we're on the deployment-guide route
    if (window.location.pathname === '/deployment-guide') {
      // Get project data from sessionStorage
      const storedData = sessionStorage.getItem('exportedProject');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setProjectData(data);
          setShowDeploymentGuide(true);
          
          // Clear the data after reading it
          sessionStorage.removeItem('exportedProject');
        } catch (error) {
          console.error('Failed to parse project data:', error);
        }
      }
    }
  }, []);

  if (showDeploymentGuide && projectData) {
    return <DeploymentGuide projectFiles={projectData.files} projectName={projectData.name} />;
  }

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