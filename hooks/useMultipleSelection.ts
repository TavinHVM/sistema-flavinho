import { useState, useCallback } from 'react';

interface UseMultipleSelectionProps<T> {
  items: T[];
  getItemId: (item: T) => string | number;
}

export function useMultipleSelection<T>({ items, getItemId }: UseMultipleSelectionProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleItem = useCallback((item: T) => {
    const id = getItemId(item);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [getItemId]);

  const toggleAll = useCallback(() => {
    const allIds = items.map(getItemId);
    const allSelected = allIds.every(id => selectedItems.has(id));
    
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allIds));
    }
  }, [items, getItemId, selectedItems]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  const getSelectedItemsData = useCallback(() => {
    return items.filter(item => selectedItems.has(getItemId(item)));
  }, [items, selectedItems, getItemId]);

  const isSelected = useCallback((item: T) => {
    return selectedItems.has(getItemId(item));
  }, [selectedItems, getItemId]);

  const hasSelections = selectedItems.size > 0;
  const isAllSelected = items.length > 0 && items.every(item => selectedItems.has(getItemId(item)));
  const isPartiallySelected = hasSelections && !isAllSelected;

  return {
    selectedItems,
    isSelectionMode,
    hasSelections,
    isAllSelected,
    isPartiallySelected,
    selectedCount: selectedItems.size,
    toggleItem,
    toggleAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    getSelectedItemsData,
    isSelected,
  };
}
