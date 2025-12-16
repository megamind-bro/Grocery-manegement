import React, { useMemo } from 'react';
import { getGridBackground, getGridBackgroundSize, GRID_SIZE } from '@/lib/grid-utils';

/**
 * GridContainer Component
 * Renders a container with optional snap-to-grid background
 * Automatically refreshes content on state changes
 */
const GridContainer = React.forwardRef(({
  children,
  showGrid = false,
  gridSize = GRID_SIZE,
  gridColor = '#e5e7eb',
  className = '',
  style = {},
  refreshKey = 0,
  ...props
}, ref) => {
  // Generate grid background styles
  const gridStyles = useMemo(() => {
    if (!showGrid) {
      return {};
    }

    return {
      backgroundImage: getGridBackground(gridSize, gridColor),
      backgroundSize: getGridBackgroundSize(gridSize),
      backgroundPosition: '0 0',
      backgroundAttachment: 'local',
    };
  }, [showGrid, gridSize, gridColor]);

  // Combine styles
  const combinedStyle = useMemo(() => ({
    ...gridStyles,
    ...style,
  }), [gridStyles, style]);

  return (
    <div
      ref={ref}
      key={refreshKey}
      className={`grid-container ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </div>
  );
});

GridContainer.displayName = 'GridContainer';

export default GridContainer;
