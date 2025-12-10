import React, { useState, useRef, useCallback } from 'react';
import type { Widget } from '../types';

interface HolographicWidgetProps {
  id: number;
  title: string;
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  zIndex: number;
  onUpdate: (id: number, newProps: Partial<Widget>) => void;
  onRemove: (id: number) => void;
  onFocus: (id: number) => void;
}

export const HolographicWidget: React.FC<HolographicWidgetProps> = ({
  id,
  title,
  children,
  initialPosition,
  initialSize,
  zIndex,
  onUpdate,
  onRemove,
  onFocus,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const dragRef = useRef({ x: 0, y: 0 });
  const resizeRef = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(id);
    dragRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [id, onFocus, position]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    const newX = e.clientX - dragRef.current.x;
    const newY = e.clientY - dragRef.current.y;
    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    onUpdate(id, { position });
  }, [id, onUpdate, position, handleDragMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(id);
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [id, onFocus]);
  
  const handleResizeMove = useCallback((e: MouseEvent) => {
      const dx = e.clientX - resizeRef.current.x;
      const dy = e.clientY - resizeRef.current.y;
      setSize(prevSize => ({
          width: Math.max(200, prevSize.width + dx),
          height: Math.max(150, prevSize.height + dy),
      }));
      resizeRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleResizeEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    onUpdate(id, { size });
  }, [id, onUpdate, size, handleResizeMove]);

  return (
    <div
      ref={widgetRef}
      className="absolute bg-slate-900/50 backdrop-blur-sm border border-[var(--theme-primary)]/30 rounded-lg shadow-lg shadow-[var(--theme-primary)]/20 text-[var(--theme-primary)] flex flex-col group widget-enter-animation"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
      }}
      onMouseDown={() => onFocus(id)}
    >
      {/* Corner Brackets */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--theme-primary)] opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--theme-primary)] opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--theme-primary)] opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--theme-primary)] opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div
        className="h-8 bg-slate-800/30 rounded-t-lg flex items-center justify-between px-3 cursor-move"
        onMouseDown={handleDragStart}
      >
        <h2 className="font-bold text-sm text-glow">{title}</h2>
        <button onClick={() => onRemove(id)} className="text-[var(--theme-primary)] hover:text-red-500 transition-colors text-lg">
          &times;
        </button>
      </div>
      <div className="flex-grow p-3 overflow-auto relative">
        {children}
      </div>
       <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-[var(--theme-primary)]/50 z-10"
        onMouseDown={handleResizeStart}
       >
        <svg viewBox="0 0 10 10" className="w-full h-full">
          <path d="M 0 10 L 10 10 L 10 0" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};