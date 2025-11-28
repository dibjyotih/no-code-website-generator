import React, { useState, useEffect, useRef } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hints = [
    "💡 Describe what kind of website you want to build (e.g., a portfolio, an AI blog, or a business dashboard).",
    "🪄 Build a blog generator with AI-powered content creation...",
    "✨ Design an AI resume maker with custom templates...",
    "💬 Create an e-commerce platform with smart recommendations...",
    "🎨 Generate a landing page with modern animations..."
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '850px',
          maxWidth: '90vw',
          minHeight: '120px',
          backgroundColor: '#181818',
          borderRadius: '20px',
          border: isFocused ? '1px solid #7C00FF' : '1px solid #2E2E2E',
          padding: '24px 30px',
          boxShadow: isFocused 
            ? '0 0 60px rgba(124,0,255,0.25)' 
            : '0 0 40px rgba(124,0,255,0.15)',
          transition: 'all 0.4s ease-in-out',
          boxSizing: 'border-box'
        }}
      >
        {/* Animated Hint Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '26px',
            left: '40px',
            right: '80px',
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
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          {hints[currentHintIndex]}
        </div>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            minHeight: '72px',
            maxHeight: '300px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            color: '#EAEAEA',
            lineHeight: '1.6',
            resize: 'none',
            overflow: 'auto',
            boxSizing: 'border-box'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e as React.KeyboardEvent<HTMLTextAreaElement>);
            }
          }}
        />

        {/* AI Spark Icon */}
        {isFocused && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '30px',
              transform: 'translateY(-50%)',
              fontSize: '24px',
              opacity: 0,
              animation: 'sparkFadeIn 0.5s ease-in-out forwards',
              pointerEvents: 'none'
            }}
          >
            ✨
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!prompt.trim()}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 28px',
            backgroundColor: prompt.trim() ? '#7C00FF' : '#2E2E2E',
            color: prompt.trim() ? '#FFFFFF' : '#666666',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: prompt.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease-in-out',
            fontFamily: 'Inter, sans-serif',
            boxShadow: prompt.trim() ? '0 4px 20px rgba(124,0,255,0.4)' : 'none',
            transform: prompt.trim() ? 'scale(1)' : 'scale(0.95)',
            opacity: prompt.trim() ? 1 : 0.5
          }}
          onMouseEnter={(e) => {
            if (prompt.trim()) {
              e.currentTarget.style.backgroundColor = '#9D1FFF';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(124,0,255,0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (prompt.trim()) {
              e.currentTarget.style.backgroundColor = '#7C00FF';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,0,255,0.4)';
            }
          }}
        >
          Generate ✨
        </button>

        {/* Keyboard Shortcut Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '26px',
            left: '30px',
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
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
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
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes sparkFadeIn {
          from {
            opacity: 0;
            transform: translateY(-50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }

        textarea::-webkit-scrollbar {
          width: 8px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: #3A3A3A;
          border-radius: 4px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: #4A4A4A;
        }

        @media (max-width: 768px) {
          form > div {
            padding: 20px 24px !important;
          }
          
          form > div > div:first-child {
            font-size: 16px !important;
            left: 30px !important;
            right: 70px !important;
          }
          
          textarea {
            font-size: 16px !important;
          }
          
          button[type="submit"] {
            padding: 10px 20px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </form>
  );
};

export default PromptInput;
