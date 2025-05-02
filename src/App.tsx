import { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      setHtml(data.html);
    } catch (err) {
      setError('Failed to fetch HTML from the backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    alert('HTML copied to clipboard!');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>No-Code Website Generator</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your website prompt..."
          style={{ width: '300px', padding: '8px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Generate</button>
      </form>

      {loading && <p>Generating HTML...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {html && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '8px 12px',
                marginRight: '10px',
                background: activeTab === 'preview' ? '#007bff' : '#eee',
                color: activeTab === 'preview' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              style={{
                padding: '8px 12px',
                background: activeTab === 'code' ? '#007bff' : '#eee',
                color: activeTab === 'code' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              HTML Code
            </button>
          </div>

          {activeTab === 'preview' ? (
            <iframe
              title="Generated Website"
              srcDoc={html}
              style={{
                width: '100%',
                height: '600px',
                border: '1px solid #ccc',
              }}
            />
          ) : (
            <div>
              <textarea
                value={html}
                readOnly
                style={{
                  width: '100%',
                  height: '400px',
                  padding: '10px',
                  fontFamily: 'monospace',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Copy HTML
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
