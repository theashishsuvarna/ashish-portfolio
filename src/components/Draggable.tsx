import React, { useState, useRef, useEffect, useContext, createContext } from 'react';
import { soundFX } from '../utils/audio';

export interface DeskContextType {
  scale: number;
  resetKey: number;
  boardWidth?: number;
  boardHeight?: number;
  onObjectMoved?: (id: string, x: number, y: number, zIndex: number) => void;
  getNextZIndex?: () => number;
}

export const DeskContext = createContext<DeskContextType>({
  scale: 1,
  resetKey: 0,
  boardWidth: 2700,
  boardHeight: 1700,
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
  id: string;
  layout?: DraggableLayout;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Draggable: React.FC<DraggableProps> = ({ children, id, layout, className = "", onClick }) => {
  const { scale, resetKey, boardWidth = 2700, boardHeight = 1700, onObjectMoved, getNextZIndex } = useContext(DeskContext);

  const initialX = layout?.left ?? layout?.x ?? 0;
  const initialY = layout?.top ?? layout?.y ?? 0;
  const rotation = layout?.rotation ?? 0;
  const initialZIndex = layout?.zIndex ?? 1;

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [zIndex, setZIndex] = useState(initialZIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentTargetRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, boardLeft: 0, boardTop: 0, startX: 0, startY: 0, pointerId: 0 });
  const currentPosRef = useRef({ x: initialX, y: initialY });
  const constraintsRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number; currentScale: number } | null>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const prevResetKeyRef = useRef(resetKey);

  // Synchronize positions. Only trigger smooth reset animation when resetKey explicitly changes.
  useEffect(() => {
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      setIsResetting(true);
      setPos({ x: initialX, y: initialY });
      currentPosRef.current = { x: initialX, y: initialY };
      setZIndex(initialZIndex);
      const timer = setTimeout(() => setIsResetting(false), 450);
      return () => clearTimeout(timer);
    } else {
      setPos({ x: initialX, y: initialY });
      currentPosRef.current = { x: initialX, y: initialY };
      setZIndex(initialZIndex);
    }
  }, [resetKey, initialX, initialY, initialZIndex]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Bring this element to the top
    let nextZ = zIndex;
    if (getNextZIndex) {
      nextZ = getNextZIndex();
      setZIndex(nextZ);
    } else {
      nextZ = Math.max(zIndex, 100) + 1;
      setZIndex(nextZ);
    }

    const boardEl = (e.currentTarget.closest('#cutting-mat') || document.getElementById('cutting-mat')) as HTMLElement | null;
    const boardRect = boardEl?.getBoundingClientRect();

    currentTargetRef.current = e.currentTarget;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      boardLeft: boardRect?.left ?? 0,
      boardTop: boardRect?.top ?? 0,
      startX: pos.x,
      startY: pos.y,
      pointerId: e.pointerId,
    };
    currentPosRef.current = { x: pos.x, y: pos.y };
    constraintsRef.current = null;
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    // Physical pickup sound tailored to the object material
    soundFX.playGrab(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaClientX = e.clientX - dragStartRef.current.pointerX;
    const deltaClientY = e.clientY - dragStartRef.current.pointerY;
    const distance = Math.hypot(deltaClientX, deltaClientY);

    // Click vs Drag threshold: > 6px triggers drag
    if (!hasMovedRef.current && distance >= 6) {
      hasMovedRef.current = true;
      setIsDragging(true);
      try {
        currentTargetRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    if (hasMovedRef.current) {
      // Subtle material movement sound (throttled inside soundFX)
      soundFX.playDrag(id);

      const objEl = currentTargetRef.current;
      const boardEl = (objEl?.closest('#cutting-mat') || document.getElementById('cutting-mat')) as HTMLElement | null;
      const currentBoardRect = boardEl?.getBoundingClientRect();

      // Dynamically calculate constraints using rendered bounding rects on first move
      if (!constraintsRef.current) {
        if (objEl && boardEl && currentBoardRect) {
          const boardRect = currentBoardRect;
          const objRect = objEl.getBoundingClientRect();

          const bWidth = boardWidth > 0 ? boardWidth : 2700;
          const bHeight = boardHeight > 0 ? boardHeight : 1700;

          // Scale factor between viewport pixels and unscaled board coordinates (BASE_WIDTH)
          const renderedScale = boardRect.width > 0 && bWidth > 0
            ? boardRect.width / bWidth
            : (scale > 0 ? scale : 1);

          // Actual rendered visual dimensions of the object in unscaled board coordinates.
          // Accounts for rotation, scale, tape, and nested elements.
          const visualWidth = objRect.width / renderedScale;
          const visualHeight = objRect.height / renderedScale;

          // Object's visual top-left relative to the board in unscaled board space
          // (Viewport scroll offset cancels out since both are client rects)
          const visualLeft = (objRect.left - boardRect.left) / renderedScale;
          const visualTop = (objRect.top - boardRect.top) / renderedScale;

          // Visual offset between element's CSS (left, top) and its visual bounding box
          const visualOffsetX = visualLeft - dragStartRef.current.startX;
          const visualOffsetY = visualTop - dragStartRef.current.startY;

          // Minimal allowed visible margin to keep objects partially visible and grabbable.
          // Small stickers and large objects can reach all 4 visual edges of the board naturally.
          const allowedMarginX = Math.min(24, Math.max(10, visualWidth * 0.20));
          const allowedMarginY = Math.min(24, Math.max(10, visualHeight * 0.20));

          // Conceptual formula:
          // minX = boardLeft - objectWidth + allowedVisibleMargin - visualOffsetX
          // maxX = boardRight - allowedVisibleMargin - visualOffsetX
          // minY = boardTop - objectHeight + allowedVisibleMargin - visualOffsetY
          // maxY = boardBottom - allowedVisibleMargin - visualOffsetY
          constraintsRef.current = {
            minX: -visualWidth + allowedMarginX - visualOffsetX,
            maxX: bWidth - allowedMarginX - visualOffsetX,
            minY: -visualHeight + allowedMarginY - visualOffsetY,
            maxY: bHeight - allowedMarginY - visualOffsetY,
            currentScale: renderedScale,
          };
        } else {
          // Fallback if DOM rects are not yet available
          const fallbackW = typeof layout?.width === 'number' ? layout.width : 60;
          const fallbackH = typeof layout?.height === 'number' ? layout.height : 60;
          const fallbackMargin = 12;
          const fallbackScale = scale > 0 ? scale : 1;
          constraintsRef.current = {
            minX: -fallbackW + fallbackMargin,
            maxX: (boardWidth || 2700) - fallbackMargin,
            minY: -fallbackH + fallbackMargin,
            maxY: (boardHeight || 1700) - fallbackMargin,
            currentScale: fallbackScale,
          };
        }
      }

      const { minX, maxX, minY, maxY, currentScale } = constraintsRef.current;

      // Board coordinate delta accounting for scroll & viewport positioning
      const curBoardLeft = currentBoardRect?.left ?? dragStartRef.current.boardLeft;
      const curBoardTop = currentBoardRect?.top ?? dragStartRef.current.boardTop;
      const deltaBoardX = ((e.clientX - curBoardLeft) - (dragStartRef.current.pointerX - dragStartRef.current.boardLeft)) / currentScale;
      const deltaBoardY = ((e.clientY - curBoardTop) - (dragStartRef.current.pointerY - dragStartRef.current.boardTop)) / currentScale;

      let newX = dragStartRef.current.startX + deltaBoardX;
      let newY = dragStartRef.current.startY + deltaBoardY;

      // Clamp within visual edge boundaries
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      currentPosRef.current = { x: newX, y: newY };
      setPos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const wasDragging = hasMovedRef.current;

    isDraggingRef.current = false;
    setIsDragging(false);
    constraintsRef.current = null;

    if (currentTargetRef.current) {
      try {
        currentTargetRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    // Persist position if moved
    if (wasDragging) {
      soundFX.playRelease(id);
      if (onObjectMoved && id) {
        onObjectMoved(id, currentPosRef.current.x, currentPosRef.current.y, zIndex);
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
    soundFX.playClick(id);
    if (onClick) {
      onClick(e);
    }
  };

  // Drag physics feel:
  // Normal: scale 1, original rotation, natural shadow
  // Dragging: scale ~1.02, slight tilt response, elevated shadow
  // Resetting: smooth spring/bezier return to original position
  const activeScale = isDragging ? 1.02 : 1;
  const activeRotation = isDragging ? rotation + 0.6 : rotation;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    transform: `translate3d(0, 0, 0) rotate(${activeRotation}deg) scale(${activeScale})`,
    transformOrigin: 'center center',
    zIndex,
    touchAction: 'none',
    userSelect: 'none',
    transition: isResetting 
      ? 'left 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' 
      : (isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'),
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  if (layout?.width) style.width = typeof layout.width === 'number' ? `${layout.width}px` : layout.width;
  if (layout?.height) style.height = typeof layout.height === 'number' ? `${layout.height}px` : layout.height;

  return (
    <div
      id={id}
      className={`select-none ${isDragging ? 'opacity-98 drop-shadow-2xl' : ''} ${className}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={() => {
        if (!isDraggingRef.current) soundFX.playHover(id);
      }}
      onClickCapture={handleClickCapture}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
