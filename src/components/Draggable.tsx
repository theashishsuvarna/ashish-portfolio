import React, { useState, useRef, useEffect, useContext, createContext } from 'react';

export interface DeskContextType {
  scale: number;
  resetKey: number;
}

export const DeskContext = createContext<DeskContextType>({
  scale: 1,
  resetKey: 0,
});

export interface DraggableLayout {
  left?: number;
  top?: number;
  width?: number | string;
  height?: number | string;
  rotation: number;
  zIndex: number;
  x?: number;
  y?: number;
}

interface DraggableProps {
  children: React.ReactNode;
  id?: string;
  layout?: DraggableLayout;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Draggable: React.FC<DraggableProps> = ({ children, id, layout, className = "", onClick }) => {
  const { scale, resetKey } = useContext(DeskContext);

  const initialX = layout?.left ?? layout?.x ?? 0;
  const initialY = layout?.top ?? layout?.y ?? 0;
  const rotation = layout?.rotation ?? 0;
  const initialZIndex = layout?.zIndex ?? 1;

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [zIndex, setZIndex] = useState(initialZIndex);
  const [isDragging, setIsDragging] = useState(false);

  // Reset positions when resetKey changes or when layout changes
  useEffect(() => {
    setPos({ x: initialX, y: initialY });
    setZIndex(initialZIndex);
  }, [resetKey, initialX, initialY, initialZIndex]);

  const currentTargetRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, startX: 0, startY: 0, pointerId: 0 });
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary pointer (left mouse button or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Bring this element to the top
    setZIndex((prev) => Math.max(prev, 100) + 1);

    currentTargetRef.current = e.currentTarget;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: pos.x,
      startY: pos.y,
      pointerId: e.pointerId,
    };
    isDraggingRef.current = true;
    hasMovedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaClientX = e.clientX - dragStartRef.current.pointerX;
    const deltaClientY = e.clientY - dragStartRef.current.pointerY;

    if (!hasMovedRef.current && Math.hypot(deltaClientX, deltaClientY) > 3) {
      hasMovedRef.current = true;
      setIsDragging(true);
      try {
        currentTargetRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    if (hasMovedRef.current) {
      // Scale compensation: divide screen pixels by scale so motion is 1:1
      const currentScale = scale > 0 ? scale : 1;
      const newX = dragStartRef.current.startX + deltaClientX / currentScale;
      const newY = dragStartRef.current.startY + deltaClientY / currentScale;
      setPos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (currentTargetRef.current) {
      try {
        currentTargetRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // Prevent triggering clicks on child buttons/links if the user was dragging
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'top left',
    zIndex,
    touchAction: 'none',
    userSelect: 'none',
  };

  if (layout?.width) style.width = typeof layout.width === 'number' ? `${layout.width}px` : layout.width;
  if (layout?.height) style.height = typeof layout.height === 'number' ? `${layout.height}px` : layout.height;

  return (
    <div
      id={id}
      className={`select-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-95' : ''} ${className}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
