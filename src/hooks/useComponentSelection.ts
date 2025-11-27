import { useState } from 'react';

export const useComponentSelection = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const selectComponent = (componentId: string | null) => {
    setSelectedComponent(componentId);
  };

  return { selectedComponent, selectComponent };
};
