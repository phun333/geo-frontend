'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Point, CoordinateType } from '@/lib/types';
import { parseGeometry, getCoordinateTypeColor, getCoordinateTypeLabel } from '@/lib/api';

// Fix for leaflet default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  points: Point[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPoint?: Point | null;
  onPointSelect?: (point: Point) => void;
  hiddenPoints?: Set<number>;
}

// Turkey center coordinates
const TURKEY_CENTER: LatLngExpression = [39.0, 35.0];
const TURKEY_ZOOM = 6;

// --- Step 1: Create a dedicated MapContent component ---
const MapContent = ({ 
  points, 
  onMapClick, 
  selectedPoint, 
  onPointSelect,
  hiddenPoints = new Set()
}: MapComponentProps) => {
  const map = useMap();

  // Map Click Handler Logic
  useEffect(() => {
    if (!onMapClick) return;
    const handleClick = (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  // Render function for points (markers, polylines, polygons)
  const renderPoint = (point: Point) => {
    const coordinates = parseGeometry(point.geometry, point.coordinateType);
    const color = getCoordinateTypeColor(point.coordinateType);
    
    if (coordinates.length === 0) return null;

    const isSelected = selectedPoint?.id === point.id;
    const opacity = isSelected ? 1 : 0.7;

    switch (point.coordinateType) {
      case CoordinateType.Point:
        return (
          <Marker 
            key={point.id} 
            position={coordinates[0]}
            eventHandlers={{
              click: () => onPointSelect?.(point),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-semibold">{point.name}</h3>
                <p className="text-sm text-gray-600">
                  {getCoordinateTypeLabel(point.coordinateType)}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {point.id}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      
      case CoordinateType.Line:
        return (
          <Polyline 
            key={point.id}
            positions={coordinates}
            color={color}
            opacity={opacity}
            weight={isSelected ? 5 : 3}
            eventHandlers={{
              click: () => onPointSelect?.(point),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-semibold">{point.name}</h3>
                <p className="text-sm text-gray-600">
                  {getCoordinateTypeLabel(point.coordinateType)}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {point.id}
                </p>
              </div>
            </Popup>
          </Polyline>
        );
      
      case CoordinateType.Polygon:
        return (
          <Polygon 
            key={point.id}
            positions={coordinates}
            color={color}
            opacity={opacity}
            fillOpacity={isSelected ? 0.3 : 0.2}
            weight={isSelected ? 3 : 2}
            eventHandlers={{
              click: () => onPointSelect?.(point),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-semibold">{point.name}</h3>
                <p className="text-sm text-gray-600">
                  {getCoordinateTypeLabel(point.coordinateType)}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {point.id}
                </p>
              </div>
            </Popup>
          </Polygon>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <>
      {points.filter(point => !hiddenPoints.has(point.id)).map(renderPoint)}
    </>
  );
};


// --- Step 2: Simplify the main MapComponent ---
const MapComponent: React.FC<React.PropsWithChildren<MapComponentProps>> = ({ children, ...props }) => {
  return (
    <div className="w-full h-full">
      <MapContainer
        center={TURKEY_CENTER}
        zoom={TURKEY_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* All dynamic content is now inside MapContent */}
        <MapContent {...props} />

        {/* Render children inside the map container (for controls, etc.) */}
        {children}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 