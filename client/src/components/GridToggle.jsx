import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3x3, Eye, EyeOff } from 'lucide-react';

/**
 * GridToggle Component
 * Provides UI controls for toggling grid visibility and changing grid size
 */
const GridToggle = ({
  showGrid = false,
  gridSize = 8,
  onToggleGrid = () => {},
  onChangeGridSize = () => {},
  className = '',
}) => {
  const gridSizeOptions = [4, 8, 16, 24, 32];

  return (
    <div className={`flex items-center gap-2 p-2 bg-gray-100 rounded-lg ${className}`}>
      {/* Toggle Grid Button */}
      <Button
        variant={showGrid ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleGrid}
        title={showGrid ? 'Hide grid' : 'Show grid'}
        className="flex items-center gap-2"
      >
        {showGrid ? (
          <>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Grid On</span>
          </>
        ) : (
          <>
            <EyeOff className="h-4 w-4" />
            <span className="hidden sm:inline">Grid Off</span>
          </>
        )}
      </Button>

      {/* Grid Size Selector */}
      {showGrid && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Size:</span>
          <select
            value={gridSize}
            onChange={(e) => onChangeGridSize(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {gridSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default GridToggle;
