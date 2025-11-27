import { createContext, Dispatch, SetStateAction } from 'react';

export interface ComponentTreeNode {
  id: string;
  name: string;
  attributes: Record<string, unknown>;
  children: ComponentTreeNode[];
}

export interface EditorContextType {
  components: ComponentTreeNode[];
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
}

export const EditorContext = createContext<EditorContextType | null>(null);