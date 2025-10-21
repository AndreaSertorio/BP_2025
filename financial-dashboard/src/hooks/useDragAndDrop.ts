/**
 * CUSTOM HOOK: useDragAndDrop
 * Gestisce drag & drop reordering con salvataggio automatico
 */

import { useState, useCallback } from 'react';

interface UseDragAndDropProps<T> {
  items: T[];
  onReorder: (reorderedItems: T[]) => Promise<void>;
}

export function useDragAndDrop<T extends { id: string; order?: number }>({
  items,
  onReorder,
}: UseDragAndDropProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setHoveredIndex(index);
  }, [draggedIndex]);

  const handleDrop = useCallback(async () => {
    if (draggedIndex === null || hoveredIndex === null) {
      setDraggedIndex(null);
      setHoveredIndex(null);
      return;
    }

    // Reorder items
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(hoveredIndex, 0, draggedItem);

    // Update order property
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Reset drag state
    setDraggedIndex(null);
    setHoveredIndex(null);

    // Save to backend
    try {
      await onReorder(reorderedItems);
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  }, [draggedIndex, hoveredIndex, items, onReorder]);

  return {
    draggedIndex,
    hoveredIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
