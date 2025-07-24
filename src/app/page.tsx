'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { usePoints } from '@/hooks/usePoints';
import { Point, CreatePointRequest, UpdatePointRequest, CoordinateType } from '@/lib/types';
import { formatGeometry } from '@/lib/api';
import PointsTable from '@/components/PointsTable';
import PointDialog from '@/components/PointDialog';
import FilterPanel from '@/components/FilterPanel';
import { RefreshCw, Map, MapPin } from 'lucide-react';
import { DrawingToolbar, DrawingMode } from '@/components/DrawingToolbar';
import { LatLng } from 'leaflet';
import { toast } from 'sonner';

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
  const { points, loading, createPoint, updatePoint, deletePoint, fetchPoints } = usePoints();
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [mapClickCoordinates, setMapClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [newShapeInfo, setNewShapeInfo] = useState<{ geometry: string; coordinateType: CoordinateType } | null>(null);
  const [hiddenPoints, setHiddenPoints] = useState<Set<number>>(new Set());
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('off');
  const [draggingPointId, setDraggingPointId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    types: Set<CoordinateType>;
    searchTerm: string;
  }>({
    types: new Set([CoordinateType.Point, CoordinateType.Line, CoordinateType.Polygon]),
    searchTerm: '',
  });

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

  const handlePolygonDragEnd = async (point: Point, newPositions: LatLng[]) => {
    setDraggingPointId(point.id);
    
    // Convert LatLng array to geometry string format
    const newGeometry = formatGeometry(newPositions.map(pos => [pos.lat, pos.lng]));
    
    // Create update request
    const updateRequest: UpdatePointRequest = {
      id: point.id,
      name: point.name,
      geometry: newGeometry,
      coordinateType: point.coordinateType
    };
    
    try {
      // Call API to update the point
      const success = await updatePoint(updateRequest);
      
      if (success) {
        toast.success('Alan başarıyla taşındı');
      } else {
        // Rollback on failure
        toast.error('Alan taşınamadı, lütfen tekrar deneyin');
      }
    } catch {
      // Rollback on error
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setDraggingPointId(null);
    }
  };

  const handlePointDragEnd = async (point: Point, newPosition: LatLng) => {
    setDraggingPointId(point.id);
    
    // Convert LatLng to geometry string format
    const newGeometry = formatGeometry([[newPosition.lat, newPosition.lng]]);
    
    // Create update request
    const updateRequest: UpdatePointRequest = {
      id: point.id,
      name: point.name,
      geometry: newGeometry,
      coordinateType: point.coordinateType
    };
    
    try {
      // Call API to update the point
      const success = await updatePoint(updateRequest);
      
      if (success) {
        toast.success('Nokta başarıyla taşındı');
      } else {
        // Rollback on failure
        toast.error('Nokta taşınamadı, lütfen tekrar deneyin');
      }
    } catch {
      // Rollback on error
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setDraggingPointId(null);
    }
  };

  // Filter points based on active filters
  const filteredPoints = useMemo(() => {
    return points.filter(point => {
      // Filter by type
      if (!activeFilters.types.has(point.coordinateType)) {
        return false;
      }
      
      // Filter by search term
      if (activeFilters.searchTerm && 
          !point.name.toLowerCase().includes(activeFilters.searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [points, activeFilters]);

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
              points={filteredPoints}
              onMapClick={handleMapClick}
              selectedPoint={selectedPoint}
              onPointSelect={handlePointSelect}
              hiddenPoints={hiddenPoints}
              onPolygonDragEnd={handlePolygonDragEnd}
              onPointDragEnd={handlePointDragEnd}
              draggingPointId={draggingPointId}
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
          <div className="flex-1 space-y-4">
            {/* Filter Panel */}
            <FilterPanel
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
              totalCount={totalPoints}
              filteredCount={filteredPoints.length}
              pointsByType={pointsByType}
            />
            
            {/* Table */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Koordinat Listesi
                  <span className="text-sm font-normal text-gray-600">
                    ({filteredPoints.length} / {totalPoints} nokta)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PointsTable
                  points={filteredPoints}
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
