import { useEffect, useState } from 'react';
import './App.css';
import { FiUpload, FiMic, FiCopy, FiCheck } from 'react-icons/fi';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [copied, setCopied] = useState<{ html: boolean; css: boolean; js: boolean }>({ html: false, css: false, js: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [theme, previewImage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !file) {
      setError('Please provide a prompt or upload an image.');
      console.log('Submission failed: No prompt or file provided');
      return;
    }
    setLoading(true);
    setError('');
    setPreviewImage(null);
    try {
      const formData = new FormData();
      if (prompt) formData.append('prompt', prompt);
      if (file) formData.append('file', file);

      console.log('Sending request with prompt:', prompt, 'and file:', file ? file.name : 'none');

      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${errorText}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setHtml(data.html || '');
      setCss(data.css || '');
      setJs(data.js || '');
    } catch (err) {
      setError(`Failed to generate website: ${err}`);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(imageUrl);
      console.log('File selected:', selectedFile.name, 'Preview URL:', imageUrl);
    } else {
      setPreviewImage(null);
      setFile(null);
    }
  };

  const handleSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech-to-text is not supported in this browser. Try Chrome or Edge.');
      console.log('Speech-to-Text: API not supported');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech-to-Text: Recording started');
        setError('Recording... Speak your prompt now.');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        console.log('Speech-to-Text: Transcript received:', transcript);
        setError('');
      };

      recognition.onend = () => {
        console.log('Speech-to-Text: Recording stopped');
      };

      recognition.onerror = (event) => {
        console.error('Speech-to-Text Error:', event.error);
        setError(`Speech-to-text failed: ${event.error}. Check microphone permissions or try Chrome/Edge.`);
      };

      console.log('Speech-to-Text: Initiating recognition');
      recognition.start();
    } catch (err) {
      console.error('Speech-to-Text Initialization Error:', err);
      setError('Failed to initialize speech-to-text. Ensure microphone access and try Chrome or Edge.');
    }
  };

  const handleCopy = (code: string, type: 'html' | 'css' | 'js') => {
    navigator.clipboard.writeText(code);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
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
          <label htmlFor="file-upload" className="chat-icon" title="Upload image to generate website">
            <FiUpload size={20} />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileUpload}
          />

          <div className="input-container">
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="input-container img"
              />
            )}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter or speak your website prompt..."
              className="input full-width"
            />
          </div>

          <button
            type="button"
            className="chat-icon"
            title="Speak to enter prompt"
            onClick={handleSpeechToText}
          >
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
            <button onClick={() => setActiveTab('code')} className={activeTab === 'code' ? 'tab active' : 'tab'}>Code</button>
          </div>

          {activeTab === 'preview' && (
            <div className="preview-container">
              <iframe title="Generated Website" srcDoc={`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`} className="iframe" />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="code-container">
              <div className="code-section">
                <h3>HTML</h3>
                <button className="copy-icon-button" onClick={() => handleCopy(html, 'html')}>
                  {copied.html ? <FiCheck /> : <FiCopy />}
                </button>
                <textarea value={html} readOnly className="code-box" />
              </div>
              <div className="code-section">
                <h3>CSS</h3>
                <button className="copy-icon-button" onClick={() => handleCopy(css, 'css')}>
                  {copied.css ? <FiCheck /> : <FiCopy />}
                </button>
                <textarea value={css} readOnly className="code-box" />
              </div>
              <div className="code-section">
                <h3>JavaScript</h3>
                <button className="copy-icon-button" onClick={() => handleCopy(js, 'js')}>
                  {copied.js ? <FiCheck /> : <FiCopy />}
                </button>
                <textarea value={js} readOnly className="code-box" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;