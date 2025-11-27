import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SplitPaneProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  initialSizes?: number[];
}

const SplitPane: React.FC<SplitPaneProps> = ({ children, direction = 'horizontal', initialSizes }) => {
  const childArray = React.Children.toArray(children);
  const [sizes, setSizes] = useState(initialSizes || Array(childArray.length).fill(100 / childArray.length));
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragIndex = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    isDragging.current = true;
    dragIndex.current = index;
    e.preventDefault();
  };

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragIndex.current = null;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current || dragIndex.current === null) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const isHorizontal = direction === 'horizontal';
    const totalSize = isHorizontal ? containerRect.width : containerRect.height;
    const clientPos = isHorizontal ? e.clientX : e.clientY;
    const containerStart = isHorizontal ? containerRect.left : containerRect.top;

    const newSizes = [...sizes];
    
    let sumOfPreviousSizes = 0;
    for(let i = 0; i < dragIndex.current; i++) {
        sumOfPreviousSizes += newSizes[i];
    }

    const dragBarPosInPerc = sumOfPreviousSizes;
    const mousePosInPerc = ((clientPos - containerStart) / totalSize) * 100;
    
    let delta = mousePosInPerc - dragBarPosInPerc;

    let prevSize = newSizes[dragIndex.current] + delta;
    let nextSize = newSizes[dragIndex.current + 1] - delta;

    const minSize = 10; // 10% minimum size
    if (prevSize < minSize) {
        const diff = minSize - prevSize;
        prevSize = minSize;
        nextSize -= diff;
    }
    if (nextSize < minSize) {
        const diff = minSize - nextSize;
        nextSize = minSize;
        prevSize -= diff;
    }

    let total = 0;
    for(let i = 0; i < newSizes.length; i++) {
        if(i === dragIndex.current) total += prevSize;
        else if (i === dragIndex.current + 1) total += nextSize;
        else total += newSizes[i];
    }
    
    if (total > 101 || total < 99) {
        const scale = 100 / total;
        prevSize *= scale;
        nextSize *= scale;
    }


    newSizes[dragIndex.current] = prevSize;
    newSizes[dragIndex.current + 1] = nextSize;

    setSizes(newSizes);
  }, [sizes, direction]);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const isHorizontal = direction === 'horizontal';
  const containerClasses = `flex h-full w-full bg-gray-800 ${!isHorizontal ? 'flex-col' : ''}`;
  const handleClasses = `bg-gray-700 hover:bg-blue-500 transition-colors ${isHorizontal ? 'w-2 h-full cursor-col-resize' : 'h-2 w-full cursor-row-resize'}`;

  return (
    <div ref={containerRef} className={containerClasses}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          <motion.div 
            style={isHorizontal ? { width: `${sizes[index]}%` } : { height: `${sizes[index]}%` }} 
            className="overflow-auto"
          >
            {child}
          </motion.div>
          {index < childArray.length - 1 && (
            <div
              onMouseDown={(e) => handleMouseDown(e, index)}
              className={handleClasses}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SplitPane;