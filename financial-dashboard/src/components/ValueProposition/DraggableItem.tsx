'use client';

import React, { DragEvent } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DraggableItem({
  id,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  className = '',
}: DraggableItemProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', id);
    onDragStart(index);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group relative ${className}`}
    >
      {/* Drag Handle */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      {children}
    </div>
  );
}
