import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing page content refresh on state changes
 * Automatically triggers re-renders when dependencies change
 */
export const usePageRefresh = (dependencies = [], onRefresh = null) => {
  const refreshCountRef = useRef(0);
  const previousDepsRef = useRef(dependencies);

  // Detect changes in dependencies
  useEffect(() => {
    const depsChanged = dependencies.some(
      (dep, index) => dep !== previousDepsRef.current[index]
    );

    if (depsChanged) {
      refreshCountRef.current += 1;
      previousDepsRef.current = dependencies;

      // Call custom refresh handler if provided
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh(refreshCountRef.current);
      }
    }
  }, dependencies);

  // Return refresh count and manual refresh function
  const manualRefresh = useCallback(() => {
    refreshCountRef.current += 1;
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh(refreshCountRef.current);
    }
  }, [onRefresh]);

  return {
    refreshCount: refreshCountRef.current,
    manualRefresh,
  };
};

export default usePageRefresh;
