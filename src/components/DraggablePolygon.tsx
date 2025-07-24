'use client';

import { useEffect, useRef } from 'react';
import { Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Point } from '@/lib/types';

// Import leaflet-path-drag to add drag functionality
if (typeof window !== 'undefined' && typeof require !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('leaflet-path-drag');
}

interface DraggablePolygonProps {
  point: Point;
  positions: L.LatLngExpression[];
  color: string;
  opacity: number;
  fillOpacity: number;
  weight: number;
  onClick: () => void;
  onDragEnd: (point: Point, newPositions: L.LatLng[]) => void;
  isDragging?: boolean;
}

const DraggablePolygon: React.FC<React.PropsWithChildren<DraggablePolygonProps>> = ({
  point,
  positions,
  color,
  opacity,
  fillOpacity,
  weight,
  onClick,
  onDragEnd,
  isDragging = false,
  children,
}) => {
  const map = useMap();
  const polygonRef = useRef<L.Polygon | null>(null);

  useEffect(() => {
    if (!polygonRef.current) return;

    const polygon = polygonRef.current;
    
    // Enable dragging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (polygon as any).dragging?.enable();

    const handleDragStart = () => {
      polygon.setStyle({ 
        opacity: 0.5, 
        fillOpacity: 0.3,
        dashArray: '5, 10'
      });
      map.getContainer().style.cursor = 'move';
    };

    const handleDrag = () => {
      // Visual feedback during drag
      polygon.setStyle({ 
        weight: weight + 2 
      });
    };

    const handleDragEnd = () => {
      const newPositions = polygon.getLatLngs()[0] as L.LatLng[];
      
      // Reset styles
      polygon.setStyle({ 
        opacity,
        fillOpacity,
        weight,
        dashArray: ''
      });
      map.getContainer().style.cursor = '';

      // Call the onDragEnd callback with new positions
      onDragEnd(point, newPositions);
    };

    // Add event listeners
    polygon.on('dragstart', handleDragStart);
    polygon.on('drag', handleDrag);
    polygon.on('dragend', handleDragEnd);

    return () => {
      // Cleanup
      polygon.off('dragstart', handleDragStart);
      polygon.off('drag', handleDrag);
      polygon.off('dragend', handleDragEnd);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygon as any).dragging?.disable();
    };
  }, [map, point, opacity, fillOpacity, weight, onDragEnd]);

  return (
    <Polygon
      ref={polygonRef}
      positions={positions}
      pathOptions={{
        color,
        opacity: isDragging ? 0.5 : opacity,
        fillOpacity: isDragging ? 0.3 : fillOpacity,
        weight,
      }}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onClick();
        },
      }}
    >
      {children}
    </Polygon>
  );
};

export default DraggablePolygon;