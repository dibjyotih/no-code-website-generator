// src/App.tsx
import { useState } from "react";
import PromptInput from "./components/PromptInput";
import PreviewPane from "./components/PreviewPane";
import ThemeToggle from "./components/ThemeToggle";
import { Theme } from "./types";

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [htmlContent, setHtmlContent] = useState("");

  const handleGenerate = (prompt: string) => {
    setHtmlContent(`
      <html class="${theme}">
        <head><title>Generated Website</title></head>
        <body class="${theme === "dark" ? "bg-gray-900 text-white" : "bg-white"} p-4">
          <h1 class="text-2xl font-bold">${prompt || "Your Website"}</h1>
          <p>This is a mock preview.</p>
        </body>
      </html>
    `);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">No-Code Website Generator</h1>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PromptInput onGenerate={handleGenerate} />
          <PreviewPane htmlContent={htmlContent} theme={theme} />
        </div>
      </div>
    </div>
  );
}