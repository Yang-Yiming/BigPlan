import { useState, useCallback } from 'react';

export interface DraggableItem {
  id: number | string;
  order?: number;
}

export function useDragAndDrop<T extends DraggableItem>(
  items: T[],
  onReorder?: (reorderedItems: T[]) => void
) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverItem, setDragOverItem] = useState<T | null>(null);

  const handleDragStart = useCallback((item: T) => {
    setDraggedItem(item);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, item: T) => {
    e.preventDefault();
    setDragOverItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!draggedItem || !dragOverItem || draggedItem.id === dragOverItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === dragOverItem.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update order property if it exists
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    onReorder?.(reorderedItems);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, dragOverItem, items, onReorder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleDragEnd();
  }, [handleDragEnd]);

  const getDragHandleProps = useCallback((item: T) => ({
    draggable: true,
    onDragStart: () => handleDragStart(item),
    onDragOver: (e: React.DragEvent) => handleDragOver(e, item),
    onDragEnd: handleDragEnd,
    onDrop: handleDrop,
    className: `
      ${draggedItem?.id === item.id ? 'opacity-50' : ''}
      ${dragOverItem?.id === item.id ? 'border-t-2 border-blue-500' : ''}
    `,
  }), [draggedItem, dragOverItem, handleDragStart, handleDragOver, handleDragEnd, handleDrop]);

  return {
    draggedItem,
    dragOverItem,
    getDragHandleProps,
  };
}
