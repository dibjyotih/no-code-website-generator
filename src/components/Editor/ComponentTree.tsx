import { useContext } from 'react';
import { EditorContext, ComponentTreeNode } from '../../contexts/EditorContext';

interface ComponentNodeProps {
  component: ComponentTreeNode;
  depth: number;
}

const ComponentNode: React.FC<ComponentNodeProps> = ({ component, depth }) => {
  const context = useContext(EditorContext);
  if (!context) return null;

  const { selectedComponentId, setSelectedComponentId } = context;
  const isSelected = selectedComponentId === component.id;

  return (
    <>
      <li
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponentId(component.id);
        }}
        className={`cursor-pointer p-1 rounded truncate ${
          isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        {`<${component.name}>`}
      </li>
      {component.children && component.children.length > 0 && (
        <ul className="space-y-1">
          {component.children.map((child) => (
            <ComponentNode key={child.id} component={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </>
  );
};

const ComponentTree = () => {
  const context = useContext(EditorContext);

  if (!context) {
    return <div className="text-gray-400 p-4">Loading tree...</div>;
  }

  const { components } = context;

  return (
    <ul className="space-y-1 text-sm text-gray-300">
      {components.map((component) => (
        <ComponentNode key={component.id} component={component} depth={0} />
      ))}
    </ul>
  );
};

export default ComponentTree;
