import { useEffect, useState } from 'react';
import './App.css';
import { FiUpload, FiMic } from 'react-icons/fi';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [prompt, setPrompt] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview');

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Error from backend');
      const data = await response.json();
      setHtml(data.html || '');
      setCss(data.css || '');
      setJs(data.js || '');
    } catch (err) {
      setError('Failed to generate website.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Copied to clipboard!');
  };

  return (
    <div className="app-wrapper">
      <div className="header">
        <h1 className="app-title top-left">WebWeaver</h1>
        <button
          className="theme-toggle-icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <p className="chat-heading">WHAT ARE YOU UPTO TODAY?</p>

      <form onSubmit={handleSubmit} className="form chat-box">
        <div className="chat-input-wrapper">
          <label htmlFor="file-upload" className="chat-icon" title="Upload file">
            <FiUpload size={20} />
          </label>
          <input id="file-upload" type="file" hidden />

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your website prompt..."
            className="input full-width"
          />

          <button type="button" className="chat-icon" title="Voice input">
            <FiMic size={20} />
          </button>
        </div>

        <button className="btn generate-below" type="submit">
          <svg height="20" width="20" fill="#FFFFFF" viewBox="0 0 24 24" data-name="Layer 1" className="sparkle">
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z" />
          </svg>
          <span className="text">Generate</span>
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {(html || css || js) && (
        <div className="output-section">
          <div className="tab-buttons">
            <button onClick={() => setActiveTab('preview')} className={activeTab === 'preview' ? 'tab active' : 'tab'}>Preview</button>
            <button onClick={() => setActiveTab('html')} className={activeTab === 'html' ? 'tab active' : 'tab'}>HTML</button>
            <button onClick={() => setActiveTab('css')} className={activeTab === 'css' ? 'tab active' : 'tab'}>CSS</button>
            <button onClick={() => setActiveTab('js')} className={activeTab === 'js' ? 'tab active' : 'tab'}>JavaScript</button>
          </div>

          {activeTab === 'preview' && <iframe title="Generated Website" srcDoc={`<style>${css}</style><body>${html}<script>${js}</script>`} className="iframe" />}
          {activeTab === 'html' && (
            <>
              <textarea value={html} readOnly className="code-box" />
              <button onClick={() => handleCopy(html)} className="copy-button">Copy HTML</button>
            </>
          )}
          {activeTab === 'css' && (
            <>
              <textarea value={css} readOnly className="code-box" />
              <button onClick={() => handleCopy(css)} className="copy-button">Copy CSS</button>
            </>
          )}
          {activeTab === 'js' && (
            <>
              <textarea value={js} readOnly className="code-box" />
              <button onClick={() => handleCopy(js)} className="copy-button">Copy JavaScript</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
