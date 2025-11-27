import { useState, useContext } from 'react';
import LivePreview from '../Preview/LivePreview';
import CodeEditor from '../CodeEditor';
import PropertyPanel from '../Editor/PropertyPanel';
import AIGenerator from '../AIGenerator';
import { EditorContext } from '../../contexts/EditorContext';
import { useComponentTree } from '../../hooks/useComponentTree';
import { CodeContext } from '../../contexts/CodeContext';
import '../../styles/lovable-theme.css';

const Workspace = ({ onBackToLanding }: { onBackToLanding: () => void }) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const codeContext = useContext(CodeContext);
  
  if (!codeContext) {
    throw new Error("Workspace must be used within a CodeProvider");
  }
  
  const { code } = codeContext;
  console.log('💼 Workspace - code from context:', code ? `${code.length} chars` : 'empty');
  const { componentTree } = useComponentTree(code);

  const editorContextValue = {
    components: componentTree,
    selectedComponentId,
    setSelectedComponentId,
  };

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <EditorContext.Provider value={editorContextValue}>
      <div className="lovable-gradient-bg min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={onBackToLanding}
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">WebWeaver</span>
              </button>
              
              <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
                <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 shadow-sm">
                  Design
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Preview
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="lovable-workspace mx-4">
          <div className="h-full flex gap-4">
            {/* Main Preview Area */}
            <div className="flex-1 flex flex-col">
              <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                {/* Browser-style header */}
                <div className="h-14 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between px-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2 bg-white px-4 py-1.5 rounded-lg border border-gray-200">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">localhost:5173</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Preview Content */}
                <div className="h-[calc(100%-56px)] bg-gray-50">
                  <LivePreview />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-96 flex flex-col gap-4">
              {/* Code/Properties Toggle */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCode(false)}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      !showCode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Properties
                  </button>
                  <button
                    onClick={() => setShowCode(true)}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      showCode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Code
                  </button>
                </div>
              </div>

              {/* Content Panel */}
              <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {showCode ? (
                  <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <h3 className="text-lg font-bold text-gray-900">Generated Code</h3>
                      <p className="text-sm text-gray-500 mt-1">Your AI-generated component</p>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <CodeEditor />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <h3 className="text-lg font-bold text-gray-900">Properties</h3>
                      <p className="text-sm text-gray-500 mt-1">Customize your component</p>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6">
                      <PropertyPanel />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Floating Panel */}
        <AIGenerator />
      </div>
    </EditorContext.Provider>
  );
};

export default Workspace;
