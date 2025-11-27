import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

interface CodeReviewProps {
  code: string;
}

const CodeReview: React.FC<CodeReviewProps> = ({ code }) => {
  const [review, setReview] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = async () => {
    if (!code) return;
    setIsReviewing(true);
    setReview('');
    try {
      const response = await fetch('http://localhost:8000/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error('Failed to get code review');
      }
      const data = await response.json();
      setReview(data.review);
    } catch (error) {
      setReview(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsReviewing(false);
    }
  };

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 text-gray-400">
        Generated code and AI review will appear here.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-900">
      {/* Code Panel */}
      <div className="md:w-1/2 h-1/2 md:h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-800">
          <h2 className="text-lg font-semibold text-white">Generated Code</h2>
          <button
            onClick={handleReview}
            disabled={isReviewing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:bg-gray-500 transition-colors"
          >
            {isReviewing ? 'Reviewing...' : 'Review Code'}
          </button>
        </div>
        <div className="h-full overflow-auto">
          <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ margin: 0, height: '100%' }}>
            {code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Review Panel */}
      <div className="md:w-1/2 h-1/2 md:h-full flex flex-col">
        <h2 className="text-lg font-semibold p-4 bg-gray-800 text-white">AI Code Review</h2>
        <div className="p-4 h-full overflow-auto prose prose-invert">
          {isReviewing && <p>Getting feedback from the AI agent...</p>}
          {review ? <ReactMarkdown>{review}</ReactMarkdown> : <p className="text-gray-400">Click "Review Code" to get feedback.</p>}
        </div>
      </div>
    </div>
  );
};

export default CodeReview;
