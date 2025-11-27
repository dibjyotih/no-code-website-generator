import { useMemo } from 'react';
import { ComponentTreeNode } from '../contexts/EditorContext';

const parseCodeToTree = (code: string): ComponentTreeNode[] => {
  if (!code) return [];
  
  // Simplified parsing - just return empty array to avoid acorn-walk JSX issues
  // This feature is for visual component tree editing which isn't the primary use case
  try {
    // TODO: Implement proper JSX tree parsing when needed for visual editing
    console.log('📦 Component tree parsing disabled - using simplified mode');
    return [];
  } catch (error) {
    console.error("Failed to parse component tree:", error);
    return [];
  }
};

export const useComponentTree = (code: string) => {
  const componentTree = useMemo(() => parseCodeToTree(code), [code]);
  return { componentTree };
};
