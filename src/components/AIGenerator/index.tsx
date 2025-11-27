import React, { useState, useContext } from 'react';
import { CodeContext } from '../../contexts/CodeContext';

const AIGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const codeContext = useContext(CodeContext);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    codeContext?.generateCode(prompt, imageFile || undefined);
    setPrompt('');
    setImageFile(null);
    setImagePreview(null);
  };

  const examplePrompts = [
    { icon: '🎨', text: 'Modern hero section with gradient background', color: 'from-purple-500 to-pink-500' },
    { icon: '📱', text: 'Responsive pricing table with 3 tiers', color: 'from-blue-500 to-cyan-500' },
    { icon: '✨', text: 'Feature grid with icons and descriptions', color: 'from-green-500 to-emerald-500' },
    { icon: '🚀', text: 'Call-to-action banner with animation', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Component Generator</h3>
                <p className="text-purple-100 text-sm mt-0.5">Describe your vision, we'll make it real</p>
              </div>
            </div>
            {codeContext?.isLoading && (
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-white text-sm font-medium ml-2">Generating magic...</span>
              </div>
            )}
          </div>
        </div>

        {/* Example Prompts */}
        <div className="px-8 py-5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Start Ideas</p>
          <div className="grid grid-cols-2 gap-3">
            {examplePrompts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(example.text)}
                className="group flex items-center space-x-3 p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all hover:shadow-md text-left"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${example.color} rounded-lg flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                  {example.icon}
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium flex-1">{example.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-5">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Describe your component
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a modern hero section with a gradient background, large heading, subtitle, and two call-to-action buttons..."
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all resize-none text-gray-900 placeholder-gray-400 font-medium"
                  rows={4}
                  disabled={codeContext?.isLoading}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
                  {prompt.length} characters
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Or upload a design/wireframe (optional)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-2xl cursor-pointer transition-all group">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    {imageFile ? imageFile.name : 'Choose image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={codeContext?.isLoading}
                  />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 shadow-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={codeContext?.isLoading || (!prompt.trim() && !imageFile)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl flex items-center justify-center space-x-3 group"
            >
              {codeContext?.isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Crafting your component...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Component</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIGenerator;
