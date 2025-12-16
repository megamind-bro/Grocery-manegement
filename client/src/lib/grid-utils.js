/**
 * Snap-to-Grid Utility Functions
 * Provides grid snapping functionality for UI elements
 */

export const GRID_SIZE = 8; // 8px grid

/**
 * Snap a value to the nearest grid point
 * @param {number} value - The value to snap
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {number} The snapped value
 */
export const snapToGrid = (value, gridSize = GRID_SIZE) => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap coordinates to grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {Object} Snapped coordinates {x, y}
 */
export const snapCoordinatesToGrid = (x, y, gridSize = GRID_SIZE) => {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  };
};

/**
 * Snap dimensions to grid
 * @param {number} width - Width value
 * @param {number} height - Height value
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {Object} Snapped dimensions {width, height}
 */
export const snapDimensionsToGrid = (width, height, gridSize = GRID_SIZE) => {
  return {
    width: snapToGrid(width, gridSize),
    height: snapToGrid(height, gridSize),
  };
};

/**
 * Get grid-aligned padding
 * @param {number} padding - Padding value
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {number} Grid-aligned padding
 */
export const getGridPadding = (padding, gridSize = GRID_SIZE) => {
  return snapToGrid(padding, gridSize);
};

/**
 * Get grid-aligned gap
 * @param {number} gap - Gap value
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {number} Grid-aligned gap
 */
export const getGridGap = (gap, gridSize = GRID_SIZE) => {
  return snapToGrid(gap, gridSize);
};

/**
 * Generate grid background CSS
 * @param {number} gridSize - The grid size (default: 8px)
 * @param {string} color - Grid line color (default: light gray)
 * @returns {string} CSS background value
 */
export const getGridBackground = (gridSize = GRID_SIZE, color = '#e5e7eb') => {
  return `
    linear-gradient(0deg, ${color} 1px, transparent 1px),
    linear-gradient(90deg, ${color} 1px, transparent 1px)
  `.trim();
};

/**
 * Generate grid background size CSS
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {string} CSS background-size value
 */
export const getGridBackgroundSize = (gridSize = GRID_SIZE) => {
  return `${gridSize}px ${gridSize}px`;
};

/**
 * Create a grid-aligned style object
 * @param {Object} style - Original style object
 * @param {number} gridSize - The grid size (default: 8px)
 * @returns {Object} Grid-aligned style object
 */
export const createGridAlignedStyle = (style = {}, gridSize = GRID_SIZE) => {
  const alignedStyle = { ...style };

  if (alignedStyle.left !== undefined) {
    alignedStyle.left = snapToGrid(alignedStyle.left, gridSize);
  }
  if (alignedStyle.top !== undefined) {
    alignedStyle.top = snapToGrid(alignedStyle.top, gridSize);
  }
  if (alignedStyle.width !== undefined) {
    alignedStyle.width = snapToGrid(alignedStyle.width, gridSize);
  }
  if (alignedStyle.height !== undefined) {
    alignedStyle.height = snapToGrid(alignedStyle.height, gridSize);
  }
  if (alignedStyle.padding !== undefined) {
    alignedStyle.padding = snapToGrid(alignedStyle.padding, gridSize);
  }
  if (alignedStyle.margin !== undefined) {
    alignedStyle.margin = snapToGrid(alignedStyle.margin, gridSize);
  }

  return alignedStyle;
};

export default {
  snapToGrid,
  snapCoordinatesToGrid,
  snapDimensionsToGrid,
  getGridPadding,
  getGridGap,
  getGridBackground,
  getGridBackgroundSize,
  createGridAlignedStyle,
  GRID_SIZE,
};
