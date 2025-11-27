import { useMemo } from 'react';
import { ComponentTreeNode } from '../contexts/EditorContext';

const findComponentById = (components: ComponentTreeNode[], id: string | null): ComponentTreeNode | null => {
  if (!id) return null;
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    const foundInChildren = findComponentById(component.children, id);
    if (foundInChildren) {
      return foundInChildren;
    }
  }
  return null;
};

export const usePropertyEditor = (components: ComponentTreeNode[], componentId: string | null) => {
  const selectedComponent = useMemo(() => findComponentById(components, componentId), [components, componentId]);

  const properties = useMemo(() => {
    if (!selectedComponent) return [];
    return Object.entries(selectedComponent.attributes).map(([key, value]) => ({
      key,
      value,
    }));
  }, [selectedComponent]);

  return {
    properties,
    // updateProperty function will be implemented later
  };
};
