// src/components/PromptInput.tsx
import { useState } from "react";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
}

export default function PromptInput({ onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="Describe your website..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={() => onGenerate(prompt)}
      >
        Generate Website
      </button>
    </div>
  );
}