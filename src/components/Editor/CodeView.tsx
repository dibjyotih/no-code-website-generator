import React from 'react';

interface CodeViewProps {
  code: string;
}

const CodeView: React.FC<CodeViewProps> = ({ code }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Header */}
      <div 
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: '#3A3A3A' }}
      >
        <h3 className="font-bold" style={{ color: '#EAEAEA' }}>
          Generated Code
        </h3>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          style={{ 
            backgroundColor: '#2A2A2A',
            color: '#EAEAEA'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3A3A'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-6">
        <pre 
          className="text-sm font-mono leading-relaxed"
          style={{ 
            color: '#EAEAEA',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {code || '// No code generated yet'}
        </pre>
      </div>
    </div>
  );
};

export default CodeView;
