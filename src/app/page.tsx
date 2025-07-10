'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { usePoints } from '@/hooks/usePoints';
import { Point, CreatePointRequest, UpdatePointRequest, CoordinateType } from '@/lib/types';
import PointsTable from '@/components/PointsTable';
import PointDialog from '@/components/PointDialog';
import { Plus, RefreshCw, Map, MapPin } from 'lucide-react';
import { DrawingToolbar, DrawingMode } from '@/components/DrawingToolbar';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Harita yükleniyor...</p>
      </div>
    </div>
  )
});

// Dynamically import components that use browser-only APIs
const MapDrawController = dynamic(() => import('@/components/MapDrawController'), { ssr: false });

export default function HomePage() {
  const { points, loading, error, createPoint, updatePoint, deletePoint, fetchPoints } = usePoints();
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [mapClickCoordinates, setMapClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [newShapeInfo, setNewShapeInfo] = useState<{ geometry: string; coordinateType: CoordinateType } | null>(null);
  const [hiddenPoints, setHiddenPoints] = useState<Set<number>>(new Set());
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('off');

  const handleMapClick = (lat: number, lng: number) => {
    if (drawingMode !== 'off') return; // Çizim modunda ise haritaya tıklamayı engelle
    setMapClickCoordinates({ lat, lng });
    setEditingPoint(null);
    setNewShapeInfo(null);
    setDialogOpen(true);
  };

  const handleShapeDrawn = (type: CoordinateType, geometry: string) => {
    setNewShapeInfo({ geometry, coordinateType: type });
    setEditingPoint(null);
    setMapClickCoordinates(null);
    setDialogOpen(true);
  };

  const handleEditPoint = (point: Point) => {
    setEditingPoint(point);
    setMapClickCoordinates(null);
    setNewShapeInfo(null);
    setDialogOpen(true);
  };

  const handleSavePoint = async (request: CreatePointRequest | UpdatePointRequest): Promise<boolean> => {
    if ('id' in request) {
      // Update existing point
      return await updatePoint(request);
    } else {
      // Create new point
      return await createPoint(request);
    }
  };

  const handlePointSelect = (point: Point) => {
    setSelectedPoint(point);
  };

  const handleRefresh = () => {
    fetchPoints();
  };

  const handleToggleVisibility = (pointId: number) => {
    setHiddenPoints(prev => {
      const newHidden = new Set(prev);
      if (newHidden.has(pointId)) {
        newHidden.delete(pointId);
      } else {
        newHidden.add(pointId);
      }
      return newHidden;
    });
  };

  const totalPoints = points.length;
  const pointsByType = {
    points: points.filter(p => p.coordinateType === 1).length,
    lines: points.filter(p => p.coordinateType === 2).length,
    polygons: points.filter(p => p.coordinateType === 3).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Geo Organize</h1>
                <p className="text-sm text-gray-600">Türkiye Harita Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Point Count in Header */}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Map Section - Full Width */}
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Türkiye Haritası
              {selectedPoint && (
                <span className="text-sm font-normal text-gray-600">
                  - {selectedPoint.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <MapComponent
              points={points}
              onMapClick={handleMapClick}
              selectedPoint={selectedPoint}
              onPointSelect={handlePointSelect}
              hiddenPoints={hiddenPoints}
            >
              {drawingMode !== 'off' && (
                <MapDrawController
                  drawingMode={drawingMode}
                  setDrawingMode={setDrawingMode}
                  onShapeDrawn={handleShapeDrawn}
                />
              )}
            </MapComponent>
          </CardContent>
        </Card>
        
        {/* Drawing Toolbar Section */}
        <div className="flex justify-center">
            <DrawingToolbar drawingMode={drawingMode} setDrawingMode={setDrawingMode} />
        </div>

        {/* Table and Statistics Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Points Table Section - Fills remaining space */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Koordinat Listesi
                  <span className="text-sm font-normal text-gray-600">
                    ({totalPoints} nokta)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PointsTable
                  points={points}
                  onEdit={handleEditPoint}
                  onDelete={deletePoint}
                  onSelect={handlePointSelect}
                  selectedPoint={selectedPoint}
                  loading={loading}
                  hiddenPoints={hiddenPoints}
                  onToggleVisibility={handleToggleVisibility}
                />
              </CardContent>
            </Card>
          </div>

          {/* Statistics Section - Square boxes */}
          <div className="flex flex-row lg:flex-col gap-2 justify-start">
            <div className="w-24 h-24 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mb-1"></div>
              <p className="text-xs font-semibold text-red-700">Noktalar</p>
              <p className="text-xl font-bold text-red-900 mt-1">{pointsByType.points}</p>
            </div>

            <div className="w-24 h-24 bg-blue-50 border border-blue-200 rounded-lg flex flex-col items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mb-1"></div>
              <p className="text-xs font-semibold text-blue-700">Çizgiler</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{pointsByType.lines}</p>
            </div>

            <div className="w-24 h-24 bg-green-50 border border-green-200 rounded-lg flex flex-col items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mb-1"></div>
              <p className="text-xs font-semibold text-green-700">Alanlar</p>
              <p className="text-xl font-bold text-green-900 mt-1">{pointsByType.polygons}</p>
            </div>

            <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-500 mb-1"></div>
              <p className="text-xs font-semibold text-slate-700">Toplam</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{totalPoints}</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        
      </div>

      {/* Point Dialog */}
      <PointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        point={editingPoint}
        onSave={handleSavePoint}
        initialCoordinates={mapClickCoordinates}
        newShapeInfo={newShapeInfo}
      />
    </div>
  );
}
