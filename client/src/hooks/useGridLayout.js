import { useState, useCallback, useEffect } from 'react';
import { snapToGrid, snapCoordinatesToGrid, snapDimensionsToGrid } from '@/lib/grid-utils';

/**
 * Custom hook for managing grid-aligned layouts
 * Provides state management and automatic refresh on state changes
 */
export const useGridLayout = (initialState = {}) => {
  const [layout, setLayout] = useState(initialState);
  const [gridSize, setGridSize] = useState(8);
  const [showGrid, setShowGrid] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Trigger refresh on state change
  const refreshLayout = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Update layout with grid snapping
  const updateLayout = useCallback((updates) => {
    setLayout(prev => {
      const newLayout = { ...prev, ...updates };
      // Trigger refresh after state update
      setTimeout(refreshLayout, 0);
      return newLayout;
    });
  }, [refreshLayout]);

  // Snap position to grid
  const snapPosition = useCallback((x, y) => {
    const snapped = snapCoordinatesToGrid(x, y, gridSize);
    updateLayout(snapped);
    return snapped;
  }, [gridSize, updateLayout]);

  // Snap dimensions to grid
  const snapDimensions = useCallback((width, height) => {
    const snapped = snapDimensionsToGrid(width, height, gridSize);
    updateLayout(snapped);
    return snapped;
  }, [gridSize, updateLayout]);

  // Snap individual value
  const snapValue = useCallback((value) => {
    return snapToGrid(value, gridSize);
  }, [gridSize]);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  // Change grid size
  const changeGridSize = useCallback((newSize) => {
    setGridSize(newSize);
    refreshLayout();
  }, [refreshLayout]);

  // Reset layout
  const resetLayout = useCallback(() => {
    setLayout(initialState);
    refreshLayout();
  }, [initialState, refreshLayout]);

  return {
    layout,
    gridSize,
    showGrid,
    refreshKey,
    updateLayout,
    snapPosition,
    snapDimensions,
    snapValue,
    toggleGrid,
    changeGridSize,
    resetLayout,
    refreshLayout,
  };
};

export default useGridLayout;
