import { useState, useContext, useEffect } from 'react';
import { CodeContext } from '../../contexts/CodeContext';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

const LandingPage = ({ onEnterWorkspace }: LandingPageProps) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const codeContext = useContext(CodeContext);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((prompt.trim() || imageFile) && codeContext) {
      await codeContext.generateCode(prompt, imageFile || undefined);
      setPrompt('');
      setImageFile(null);
      onEnterWorkspace();
    }
  };

  const handleChipClick = async (chipText: string) => {
    if (codeContext) {
      await codeContext.generateCode(chipText);
      onEnterWorkspace();
    }
  };

  const chipOptions = [
    'Portfolio Builder',
    'AI Resume Maker',
    'Task Manager',
    'E-Commerce Site',
    'Blog Generator'
  ];

  const hints = [
    "💡 Describe what kind of website you want to build...",
    "🪄 Try: Build a modern landing page with animations...",
    "✨ Try: Create a dashboard with charts and metrics...",
    "💬 Try: Design an e-commerce product gallery...",
    "🎨 Try: Generate a portfolio with project cards..."
  ];

  // Rotate hints every 4 seconds
  useEffect(() => {
    if (!prompt && !isFocused) {
      const interval = setInterval(() => {
        setCurrentHintIndex((prev) => (prev + 1) % hints.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [prompt, isFocused, hints.length]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .landing-container {
          animation: fadeInUp 0.8s ease-in-out;
        }

        .gradient-text {
          background: linear-gradient(90deg, #FF007F 0%, #7C00FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .generate-button {
          transition: all 0.25s ease-in-out;
        }

        .generate-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(124, 0, 255, 0.6);
        }

        .chip-button {
          transition: all 0.25s ease-in-out;
        }

        .chip-button:hover:not(:disabled) {
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }

        .input-container {
          transition: all 0.3s ease-in-out;
        }

        .input-container:focus-within {
          box-shadow: 0 0 50px rgba(124, 0, 255, 0.25);
          border-color: #7C00FF;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0D0D0D;
        }

        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @media (max-width: 1024px) {
          .landing-heading {
            font-size: 40px !important;
          }
          .landing-subtext {
            font-size: 18px !important;
          }
          .input-container-wrapper {
            width: 90% !important;
          }
        }
      `}</style>

      <div 
        className="landing-container"
        style={{
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: 'radial-gradient(circle at center, #1A1A1A 0%, #0D0D0D 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Main Content */}
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          flex: 1,
          justifyContent: 'center'
        }}>
          {/* Heading */}
          <div style={{ textAlign: 'center' }}>
            <h1 
              className="gradient-text landing-heading"
              style={{
                fontSize: '64px',
                fontWeight: 800,
                letterSpacing: '1px',
                lineHeight: '1.2',
                marginBottom: '10px'
              }}
            >
              Hello, WebWeaver 👋
            </h1>
            <p 
              className="landing-subtext"
              style={{
                fontSize: '22px',
                color: '#B0B0B0',
                marginTop: '10px'
              }}
            >
              Create stunning websites with AI in seconds
            </p>
          </div>

          {/* Input Section */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div 
              className="input-container input-container-wrapper"
              style={{
                position: 'relative',
                width: '850px',
                maxWidth: '90vw',
                minHeight: '120px',
                backgroundColor: '#181818',
                borderRadius: '20px',
                padding: '24px 30px',
                border: isFocused ? '1px solid #7C00FF' : '1px solid #2E2E2E',
                boxShadow: isFocused 
                  ? '0 0 60px rgba(124,0,255,0.25)' 
                  : '0 0 40px rgba(124,0,255,0.15)',
                transition: 'all 0.4s ease-in-out'
              }}
            >
              {/* Animated Hint Overlay */}
              {!imageFile && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    left: '80px',
                    right: '180px',
                    pointerEvents: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    color: '#777777',
                    fontStyle: 'italic',
                    opacity: prompt ? 0 : 0.9,
                    transform: prompt ? 'translateY(-5px)' : 'translateY(0)',
                    transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
                    lineHeight: '1.6',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {hints[currentHintIndex]}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                position: 'relative'
              }}>
                {/* File Upload Icon */}
                <label style={{ cursor: 'pointer', flexShrink: 0, zIndex: 10 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={codeContext?.isLoading}
                  />
                  <svg 
                    width="28" 
                    height="28" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{ 
                      color: imageFile ? '#7C00FF' : '#888888',
                      transition: 'all 0.3s ease-in-out',
                      cursor: codeContext?.isLoading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!codeContext?.isLoading && !imageFile) {
                        e.currentTarget.style.color = '#AAAAAA';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!imageFile) {
                        e.currentTarget.style.color = '#888888';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </label>

                {/* Input Field */}
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={imageFile ? "Describe the design (optional)..." : ""}
                  style={{ 
                    flex: 1,
                    minWidth: '200px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#EAEAEA',
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    zIndex: 10
                  }}
                  disabled={codeContext?.isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      if (prompt.trim() || imageFile) {
                        handleSubmit(e as React.FormEvent<HTMLInputElement>);
                      }
                    }
                  }}
                />

                {/* AI Spark Icon on Focus */}
                {isFocused && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '170px',
                      fontSize: '24px',
                      opacity: 0,
                      animation: 'sparkFadeIn 0.5s ease-in-out forwards',
                      pointerEvents: 'none'
                    }}
                  >
                    ✨
                  </div>
                )}

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={codeContext?.isLoading || (!prompt.trim() && !imageFile)}
                  className="generate-button"
                  style={{
                    width: '150px',
                    height: '60px',
                    borderRadius: '12px',
                    background: (prompt.trim() || imageFile) && !codeContext?.isLoading
                      ? '#7C00FF'
                      : '#2E2E2E',
                    color: (prompt.trim() || imageFile) && !codeContext?.isLoading
                      ? '#FFFFFF'
                      : '#666666',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: codeContext?.isLoading ? 'not-allowed' : 
                           (prompt.trim() || imageFile) ? 'pointer' : 'not-allowed',
                    opacity: codeContext?.isLoading ? 0.6 : 1,
                    transition: 'all 0.3s ease-in-out',
                    boxShadow: (prompt.trim() || imageFile) && !codeContext?.isLoading
                      ? '0 4px 20px rgba(124,0,255,0.4)'
                      : 'none',
                    flexShrink: 0,
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    if ((prompt.trim() || imageFile) && !codeContext?.isLoading) {
                      e.currentTarget.style.backgroundColor = '#9D1FFF';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 30px rgba(124,0,255,0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if ((prompt.trim() || imageFile) && !codeContext?.isLoading) {
                      e.currentTarget.style.backgroundColor = '#7C00FF';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,0,255,0.4)';
                    }
                  }}
                >
                  {codeContext?.isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Generate ✨'
                  )}
                </button>
              </div>

              {/* Keyboard Shortcut Hint */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '26px',
                  left: '80px',
                  fontSize: '13px',
                  color: '#555555',
                  fontFamily: 'Inter, sans-serif',
                  opacity: isFocused ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              >
                <kbd style={{
                  backgroundColor: '#2A2A2A',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                  {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
                </kbd>
                {' + '}
                <kbd style={{
                  backgroundColor: '#2A2A2A',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                  Enter
                </kbd>
                <span style={{ marginLeft: '8px', opacity: 0.7 }}>to submit</span>
              </div>

              {/* Image File Display */}
              {imageFile && (
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#252525',
                  borderRadius: '10px',
                  animation: 'fadeInUp 0.3s ease-in-out'
                }}>
                  <span style={{ color: '#EAEAEA', fontSize: '14px', flex: 1 }}>📎 {imageFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FF007F',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FF3399'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#FF007F'}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Suggestion Chips */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            maxWidth: '900px'
          }}>
            {chipOptions.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                disabled={codeContext?.isLoading}
                className="chip-button"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  borderRadius: '9999px',
                  background: '#252525',
                  color: '#EAEAEA',
                  border: 'none',
                  cursor: codeContext?.isLoading ? 'not-allowed' : 'pointer',
                  opacity: codeContext?.isLoading ? 0.5 : 1
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          position: 'relative',
          width: '100%',
          background: '#101010',
          padding: '20px',
          borderTop: '1px solid #2A2A2A'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px'
          }}>
            {['About', 'Docs', 'Terms', 'Privacy'].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  color: '#777777',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#EAEAEA'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#777777'}
              >
                {link}
              </a>
            ))}
          </div>
        </footer>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes sparkFadeIn {
            from {
              opacity: 0;
              transform: scale(0.5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default LandingPage;
