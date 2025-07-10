'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { FeatureGroup, LatLng } from 'leaflet';
import 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

import { DrawingMode } from './DrawingToolbar';
import { CoordinateType } from '@/lib/types';

// leaflet-draw'ın global L nesnesine eklediği tipleri düzeltmek için
declare const L: any;

interface MapDrawControllerProps {
  drawingMode: DrawingMode;
  onShapeDrawn: (type: CoordinateType, geometry: string) => void;
  setDrawingMode: (mode: DrawingMode) => void;
}

const MapDrawController: React.FC<MapDrawControllerProps> = ({
  drawingMode,
  onShapeDrawn,
  setDrawingMode,
}) => {
  const map = useMap();
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<FeatureGroup>(new L.FeatureGroup());
  const handlerRef = useRef<any>(null);

  // Çizim kontrolünü ve katmanını haritaya ekle
  useEffect(() => {
    drawnItemsRef.current.addTo(map);

    drawControlRef.current = new L.Control.Draw({
      edit: {
        featureGroup: drawnItemsRef.current,
      },
      draw: {
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });

    map.addControl(drawControlRef.current);

    // Çizim tamamlandığında tetiklenen event
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const { layer, layerType } = event;
      drawnItemsRef.current.addLayer(layer);

      let geometry = '';
      let type: CoordinateType;

      switch (layerType) {
        case 'marker':
          type = CoordinateType.Point;
          const { lat, lng } = layer.getLatLng();
          geometry = `${lng} ${lat}`;
          break;

        case 'polyline':
          type = CoordinateType.Line;
          geometry = layer
            .getLatLngs()
            .map((p: LatLng) => `${p.lng} ${p.lat}`)
            .join(', ');
          break;

        case 'polygon':
          type = CoordinateType.Polygon;
          const latlngs = layer.getLatLngs()[0];
          // Poligonu kapatmak için ilk noktayı sona ekle
          const closedLatLngs = [...latlngs, latlngs[0]];
          geometry = closedLatLngs
            .map((p: LatLng) => `${p.lng} ${p.lat}`)
            .join(', ');
          break;

        default:
          setDrawingMode('off');
          return;
      }

      onShapeDrawn(type, geometry);
      setDrawingMode('off'); // Çizimden sonra modu kapat
    });

    return () => {
      map.removeControl(drawControlRef.current);
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, onShapeDrawn, setDrawingMode]);

  // Çizim modunu aktif hale getir ve temizle
  useEffect(() => {
    // Önceki aktif aracı her zaman devre dışı bırak
    if (handlerRef.current) {
      handlerRef.current.disable();
    }

    // Geçici katmanları temizle
    drawnItemsRef.current.clearLayers();
    
    const handleVertexAdd = () => {
      // Çizgi çiziliyorsa ve 2 nokta eklendiyse, çizimi otomatik tamamla
      if (handlerRef.current?._markers?.length === 2) {
        // Kütüphane içindeki race condition'ı önlemek için tamamlamayı geciktir
        setTimeout(() => {
          if (handlerRef.current) {
            handlerRef.current.completeShape();
          }
        }, 0);
      }
    };

    // Yeni bir çizim modu seçildiyse ilgili aracı aktifleştir
    if (drawingMode !== 'off' && drawControlRef.current) {
      const tool =
        drawingMode === CoordinateType.Point ? 'Marker' :
        drawingMode === CoordinateType.Line ? 'Polyline' : 'Polygon';

      const newHandler = new L.Draw[tool](map, drawControlRef.current.options.draw[tool.toLowerCase()]);
      
      newHandler.enable();
      handlerRef.current = newHandler; // Yeni aracı referansta sakla

      // Eğer mod "Çizgi" ise, köşe ekleme olayını dinle
      if (drawingMode === CoordinateType.Line) {
        map.on('draw:drawvertex', handleVertexAdd);
      }
    }

    // Bu effect çalıştığında veya component unmount olduğunda temizlik yap
    return () => {
      map.off('draw:drawvertex', handleVertexAdd); // Olay dinleyicisini kaldır
      if (handlerRef.current) {
        handlerRef.current.disable();
      }
    };
  }, [drawingMode, map]);

  return null; // Bu bileşen bir UI render etmez
};

export default MapDrawController; 