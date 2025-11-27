/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, ReactNode, useCallback } from 'react';

interface CodeContextType {
  code: string;
  setCode: (code: string) => void;
  updateCode: (updatedCode: string) => void;
  applyChanges: (elementId: string, changes: ElementChanges) => void;
  generateCode: (prompt: string, image?: File) => Promise<void>;
  modifyCode: (prompt: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface ElementChanges {
  styles?: Record<string, string>;
  content?: string;
  imageUrl?: string;
  imagePath?: string;
}

export const CodeContext = createContext<CodeContextType | null>(null);

export const CodeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = useCallback(async (prompt: string, image?: File) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🚀 Sending request to backend:', prompt, image ? 'with image' : 'text only');
      
      if (image) {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('image', image);
        
        const response = await fetch('http://localhost:3001/generate', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to generate code.');
        const data = await response.json();
        console.log('✅ Received response from backend, code length:', data.code?.length);
        setCode(data.code);
      } else {
        const response = await fetch('http://localhost:3001/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        if (!response.ok) throw new Error('Failed to generate code.');
        const data = await response.json();
        console.log('✅ Received response from backend, code length:', data.code?.length);
        setCode(data.code);
      }
    } catch (err) {
      console.error('❌ Error generating code:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const modifyCode = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentCode: code, prompt }),
      });
      if (!response.ok) throw new Error('Failed to modify code.');
      const data = await response.json();
      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const updateCode = useCallback((updatedCode: string) => {
    setCode(updatedCode);
  }, []);

  const applyChanges = useCallback((elementId: string, changes: ElementChanges) => {
    console.log(`Applying changes to element ${elementId}:`, changes);
    
    setCode(prevCode => {
      let updatedCode = prevCode;
      
      // Replace image URL if changed
      if (changes.imageUrl && changes.imagePath) {
        // Extract the actual URL from the full src (might include origin)
        let pathToReplace = changes.imagePath;
        try {
          const url = new URL(changes.imagePath);
          pathToReplace = url.href;
        } catch {
          // If it's not a full URL, use as is
        }
        
        console.log('🔍 Looking to replace:', pathToReplace.substring(0, 100));
        console.log('🔍 With:', changes.imageUrl.substring(0, 100));
        
        // Escape special regex characters in the path
        const escapedPath = pathToReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Try multiple patterns to find the URL in the code
        // Pattern 1: URL in quotes (single, double, or backtick)
        const pattern1 = new RegExp(`(['"\`])${escapedPath}\\1`, 'g');
        if (pattern1.test(updatedCode)) {
          updatedCode = updatedCode.replace(pattern1, `$1${changes.imageUrl}$1`);
          console.log('✅ Replaced using pattern 1 (quoted URL)');
          return updatedCode;
        }
        
        // Pattern 2: URL in src attribute
        const pattern2 = new RegExp(`src=(['"\`])${escapedPath}\\1`, 'gi');
        if (pattern2.test(updatedCode)) {
          updatedCode = updatedCode.replace(pattern2, `src=$1${changes.imageUrl}$1`);
          console.log('✅ Replaced using pattern 2 (src attribute)');
          return updatedCode;
        }
        
        // Pattern 3: URL with query parameters - just find the base URL
        const baseUrl = pathToReplace.split('?')[0];
        const escapedBase = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern3 = new RegExp(`(['"\`])${escapedBase}[^'"\`]*\\1`, 'g');
        if (pattern3.test(updatedCode)) {
          updatedCode = updatedCode.replace(pattern3, `$1${changes.imageUrl}$1`);
          console.log('✅ Replaced using pattern 3 (URL with query params)');
          return updatedCode;
        }
        
        // Pattern 4: Fallback - just find any occurrence of the URL
        const simplePattern = new RegExp(escapedPath, 'g');
        if (simplePattern.test(updatedCode)) {
          updatedCode = updatedCode.replace(simplePattern, changes.imageUrl);
          console.log('✅ Replaced using pattern 4 (simple replacement)');
          return updatedCode;
        }
        
        console.warn('⚠️ Could not find URL in code to replace');
      }
      
      return updatedCode;
    });
  }, []);

  return (
    <CodeContext.Provider value={{ 
      code, 
      setCode, 
      updateCode,
      applyChanges,
      generateCode, 
      modifyCode, 
      isLoading, 
      error 
    }}>
      {children}
    </CodeContext.Provider>
  );
};
