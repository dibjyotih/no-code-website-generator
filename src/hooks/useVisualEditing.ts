import { useState } from 'react';

export const useVisualEditing = () => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(prev => !prev);
  };

  return { isEditing, toggleEditing };
};
