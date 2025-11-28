import { useEffect, useState } from 'react';
import { DeploymentGuide } from '../components/Export/DeploymentGuide';

export const DeploymentGuidePage = () => {
  const [projectData, setProjectData] = useState<{ files: Record<string, string | object>; name: string } | null>(null);

  useEffect(() => {
    // Get project data from URL params
    const params = new URLSearchParams(window.location.search);
    const projectParam = params.get('project');
    
    if (projectParam) {
      try {
        const data = JSON.parse(decodeURIComponent(projectParam));
        setProjectData(data);
      } catch (error) {
        console.error('Failed to parse project data:', error);
      }
    }
  }, []);

  if (!projectData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading deployment guide...
      </div>
    );
  }

  return <DeploymentGuide projectFiles={projectData.files} projectName={projectData.name} />;
};
