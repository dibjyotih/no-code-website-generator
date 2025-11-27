import { useContext } from 'react';
import { CodeContext } from '../../contexts/CodeContext';
import '../../styles/lovable-theme.css';

const LandingPage = ({ onEnterWorkspace }: { onEnterWorkspace: () => void }) => {
  const codeContext = useContext(CodeContext);

  const features = [
    { icon: '🤖', title: 'AI-Powered', desc: 'Generate components with natural language' },
    { icon: '⚡', title: 'Lightning Fast', desc: 'See your designs come to life instantly' },
    { icon: '🎨', title: 'Beautiful UI', desc: 'Modern, clean, and professional designs' },
    { icon: '📱', title: 'Responsive', desc: 'Works perfectly on all devices' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">WebWeaver AI</span>
                <p className="text-xs text-white/70">Powered by Gemini 2.0</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/90 hover:text-white font-medium transition-colors">Features</a>
              <a href="#" className="text-white/90 hover:text-white font-medium transition-colors">Docs</a>
              <a href="#" className="text-white/90 hover:text-white font-medium transition-colors">GitHub</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center space-x-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 shadow-2xl">
          <span className="text-white font-semibold">🚀 Now with Image-to-Component Generation</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-7xl md:text-8xl font-black text-white mb-6 text-center leading-tight">
          Build Anything<br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
            With AI Magic
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 text-center max-w-3xl leading-relaxed">
          Transform your ideas into beautiful React components instantly.<br/>
          Just describe what you want, and watch it come to life.
        </p>

        {/* Quick Start Button */}
        <button
          onClick={onEnterWorkspace}
          className="group mb-16 px-12 py-5 bg-white hover:bg-gray-50 text-purple-700 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center space-x-3"
        >
          <span>Start Creating</span>
          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Features Grid */}
        <div id="features" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all hover:scale-105 shadow-xl"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Example Prompts */}
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Try These Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Create a modern hero section with gradient',
              'Build a pricing table with 3 tiers',
              'Design a contact form with validation',
              'Make a testimonial carousel',
            ].map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  codeContext?.generateCode(example);
                  onEnterWorkspace();
                }}
                className="group text-left p-5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{example}</span>
                  <svg className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 backdrop-blur-xl bg-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/70 text-sm">
            Made with ❤️ using AI • Powered by React, Vite & Google Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;