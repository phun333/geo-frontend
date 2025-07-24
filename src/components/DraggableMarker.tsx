'use client';

import { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Point } from '@/lib/types';

interface DraggableMarkerProps {
  point: Point;
  position: L.LatLngExpression;
  onClick: () => void;
  onDragEnd: (point: Point, newPosition: L.LatLng) => void;
  isDragging?: boolean;
}

const DraggableMarker: React.FC<React.PropsWithChildren<DraggableMarkerProps>> = ({
  point,
  position,
  onClick,
  onDragEnd,
  isDragging = false,
  children,
}) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!markerRef.current) return;

    const marker = markerRef.current;
    
    // Enable dragging
    marker.dragging?.enable();

    const handleDragStart = () => {
      marker.setOpacity(0.6);
      map.getContainer().style.cursor = 'move';
    };

    const handleDrag = () => {
      // Visual feedback during drag
      marker.setOpacity(0.7);
    };

    const handleDragEnd = () => {
      const newPosition = marker.getLatLng();
      
      // Reset styles
      marker.setOpacity(1);
      map.getContainer().style.cursor = '';

      // Call the onDragEnd callback with new position
      onDragEnd(point, newPosition);
    };

    // Add event listeners
    marker.on('dragstart', handleDragStart);
    marker.on('drag', handleDrag);
    marker.on('dragend', handleDragEnd);

    return () => {
      // Cleanup
      marker.off('dragstart', handleDragStart);
      marker.off('drag', handleDrag);
      marker.off('dragend', handleDragEnd);
      marker.dragging?.disable();
    };
  }, [map, point, onDragEnd]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      opacity={isDragging ? 0.6 : 1}
      draggable={true}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onClick();
        },
      }}
    >
      {children}
    </Marker>
  );
};

export default DraggableMarker;