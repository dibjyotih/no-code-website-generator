import React, { useState, useContext } from 'react';
import { CodeContext } from '../../contexts/CodeContext';

const Toolbar = () => {
  const [prompt, setPrompt] = useState('');
  const codeContext = useContext(CodeContext);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && codeContext) {
      codeContext.generateCode(prompt);
      setPrompt('');
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality coming soon!');
  };

  return (
    <div className="toolbar-gradient w-full h-16 border-b border-slate-200/20 flex items-center px-6 justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-white">Lovable AI</h1>
        </div>
        
        <div className="flex items-center space-x-2 ml-8">
          <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-md transition-colors">
            ↶ Undo
          </button>
          <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-md transition-colors">
            ↷ Redo
          </button>
        </div>
      </div>

      <div className="flex-grow max-w-2xl mx-8">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="✨ Describe your dream website... (e.g., 'modern landing page for a coffee shop')"
            className="lovable-input w-full px-6 py-3 pr-16 text-slate-700 placeholder-slate-400 font-medium shadow-sm"
            disabled={codeContext?.isLoading}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 lovable-button-secondary px-4 py-1.5 text-sm"
            disabled={codeContext?.isLoading}
          >
            {codeContext?.isLoading ? '⏳' : '🚀'}
          </button>
        </form>
      </div>

      <div className="flex items-center space-x-3">
        <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-1">
          <span>📱</span>
          <span>Mobile</span>
        </button>
        <button 
          onClick={handleExport}
          className="lovable-button-primary px-6 py-2 text-sm font-semibold flex items-center space-x-2"
        >
          <span>📦</span>
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
