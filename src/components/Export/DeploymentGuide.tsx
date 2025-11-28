import { useState } from 'react';

interface DeploymentGuideProps {
  projectFiles: Record<string, string | object>;
  projectName: string;
}

export const DeploymentGuide = ({ projectFiles, projectName }: DeploymentGuideProps) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'vercel' | 'netlify' | 'manual'>('vercel');

  const copyToClipboard = (content: string | object, fileName: string) => {
    const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(textContent);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const downloadAllFiles = () => {
    Object.entries(projectFiles).forEach(([filePath, content]) => {
      const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.replace(/\//g, '-');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const deploymentInstructions = {
    vercel: {
      title: '🚀 Deploy to Vercel (Easiest)',
      steps: [
        'Go to vercel.com and sign up for a free account (use your GitHub, GitLab, or email)',
        'Click the "Add New" button and select "Project"',
        'On your computer, create a new folder and copy all the files shown below into it',
        'Open your terminal/command prompt and navigate to that folder',
        'Run these commands:\n   - npm install (this installs required packages)\n   - npx vercel (this starts deployment)',
        'Follow the prompts: press Enter to accept defaults',
        'Your website will be live in 30-60 seconds! Vercel will give you a URL like: yoursite.vercel.app',
        '✅ Done! Share your website URL with anyone!'
      ],
      note: 'Free plan includes: Unlimited websites, automatic SSL certificates, and global CDN'
    },
    netlify: {
      title: '🌐 Deploy to Netlify',
      steps: [
        'Go to netlify.com and create a free account',
        'Create a new folder on your computer and copy all the files below into it',
        'In the folder, open terminal and run: npm install && npm run build',
        'This creates a ".next" folder with your built website',
        'On Netlify, click "Add new site" → "Deploy manually"',
        'Drag and drop the ".next" folder onto the upload area',
        'Netlify will deploy your site and give you a URL like: yoursite.netlify.app',
        '✅ Your website is live!'
      ],
      note: 'Free plan includes: 100GB bandwidth, custom domains, and automatic HTTPS'
    },
    manual: {
      title: '💻 Manual Deployment (Any Hosting)',
      steps: [
        'Create a new folder on your computer named "' + projectName + '"',
        'Copy all the files shown below into this folder, keeping the folder structure',
        'Open terminal/command prompt in that folder',
        'Install dependencies: npm install',
        'Build the project: npm run build',
        'Start the server: npm start',
        'Your website runs on http://localhost:3000',
        'For hosting providers like Heroku, AWS, DigitalOcean:',
        '   - Upload your folder to the server',
        '   - Run: npm install && npm run build',
        '   - Start with: npm start (or use PM2 for production)',
        '   - Make sure port 3000 is accessible'
      ],
      note: 'Requires basic knowledge of servers and hosting. Recommended for advanced users.'
    }
  };

  const currentInstructions = deploymentInstructions[selectedMethod];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: '700' }}>
            🎉 Your Website is Ready!
          </h1>
          <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>
            Project: <strong>{projectName}</strong> • {Object.keys(projectFiles).length} files
          </p>
        </div>

        {/* Method Selection */}
        <div style={{ padding: '32px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
            Choose Your Deployment Method:
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {(['vercel', 'netlify', 'manual'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                style={{
                  padding: '16px 24px',
                  border: selectedMethod === method ? '2px solid #667eea' : '2px solid #e0e0e0',
                  borderRadius: '12px',
                  background: selectedMethod === method ? '#f0f4ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: selectedMethod === method ? '#667eea' : '#666',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                {method === 'vercel' && '🚀 Vercel (Easiest)'}
                {method === 'netlify' && '🌐 Netlify'}
                {method === 'manual' && '💻 Manual'}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#333' }}>
            {currentInstructions.title}
          </h2>

          <div style={{
            background: '#e3f2fd',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            borderLeft: '4px solid #2196F3'
          }}>
            <p style={{ margin: 0, color: '#1565C0', fontSize: '14px' }}>
              💡 <strong>Note:</strong> {currentInstructions.note}
            </p>
          </div>

          <ol style={{ paddingLeft: '24px', lineHeight: '2', fontSize: '16px', color: '#444' }}>
            {currentInstructions.steps.map((step, index) => (
              <li key={index} style={{ marginBottom: '16px' }}>
                <span style={{ whiteSpace: 'pre-wrap' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Files Section */}
        <div style={{ padding: '32px', background: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
              📁 Project Files
            </h2>
            <button
              onClick={downloadAllFiles}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
            >
              ⬇️ Download All Files
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {Object.entries(projectFiles).map(([filePath, content]) => {
              const displayContent = typeof content === 'string' 
                ? content 
                : JSON.stringify(content, null, 2);
              
              return (
                <div key={filePath} style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <code style={{ fontFamily: 'monospace', fontSize: '14px', color: '#333', fontWeight: '600' }}>
                      {filePath}
                    </code>
                    <button
                      onClick={() => copyToClipboard(content, filePath)}
                      style={{
                        padding: '6px 16px',
                        background: copiedFile === filePath ? '#4caf50' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'background 0.2s'
                      }}
                    >
                      {copiedFile === filePath ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    overflow: 'auto',
                    maxHeight: '300px',
                    fontFamily: '"Fira Code", "Courier New", monospace'
                  }}>
                    {displayContent}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          background: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            Need help? Common issues and solutions:
          </p>
          <div style={{ display: 'grid', gap: '12px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <details style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#667eea' }}>
                ❓ "npm: command not found" error
              </summary>
              <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                You need to install Node.js first. Go to <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>nodejs.org</a> and download the LTS version. After installing, restart your terminal.
              </p>
            </details>
            <details style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#667eea' }}>
                ❓ Port 3000 already in use
              </summary>
              <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                Another app is using port 3000. Use: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>PORT=3001 npm start</code> to run on port 3001 instead.
              </p>
            </details>
            <details style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#667eea' }}>
                ❓ Want to use a custom domain?
              </summary>
              <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                Both Vercel and Netlify support custom domains for free! Just go to your project settings and add your domain. They'll provide instructions for DNS setup.
              </p>
            </details>
          </div>
          <p style={{ marginTop: '24px', color: '#999', fontSize: '12px' }}>
            Generated with ❤️ by WebWeave AI
          </p>
        </div>
      </div>
    </div>
  );
};
