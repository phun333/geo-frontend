'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { usePoints } from '@/hooks/usePoints';
import { Point, CreatePointRequest, UpdatePointRequest } from '@/lib/types';
import PointsTable from '@/components/PointsTable';
import PointDialog from '@/components/PointDialog';
import { Plus, RefreshCw, Map } from 'lucide-react';

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

export default function HomePage() {
  const { points, loading, error, createPoint, updatePoint, deletePoint, fetchPoints } = usePoints();
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [mapClickCoordinates, setMapClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [hiddenPoints, setHiddenPoints] = useState<Set<number>>(new Set());

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickCoordinates({ lat, lng });
    setEditingPoint(null);
    setDialogOpen(true);
  };

  const handleAddPoint = () => {
    setMapClickCoordinates(null);
    setEditingPoint(null);
    setDialogOpen(true);
  };

  const handleEditPoint = (point: Point) => {
    setEditingPoint(point);
    setMapClickCoordinates(null);
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
              <Button
                onClick={handleAddPoint}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nokta Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
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
                />
              </CardContent>
            </Card>
          </div>

          {/* Points Table Section */}
          <div className="lg:col-span-1">
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
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-medium">Noktalar</p>
                  <p className="text-2xl font-bold">
                    {points.filter(p => p.coordinateType === 1).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">Çizgiler</p>
                  <p className="text-2xl font-bold">
                    {points.filter(p => p.coordinateType === 2).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Alanlar</p>
                  <p className="text-2xl font-bold">
                    {points.filter(p => p.coordinateType === 3).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Kullanım Kılavuzu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Harita Kullanımı:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Harita üzerine tıklayarak yeni nokta ekleyin</li>
                  <li>• Mevcut noktaları seçmek için üzerine tıklayın</li>
                  <li>• Popup&apos;lardan detaylı bilgi alın</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Koordinat Türleri:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <span className="text-red-500">●</span> Nokta: Tekil konum</li>
                  <li>• <span className="text-blue-500">●</span> Çizgi: Rota/yol</li>
                  <li>• <span className="text-green-500">●</span> Alan: Kapalı bölge</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Point Dialog */}
      <PointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        point={editingPoint}
        onSave={handleSavePoint}
        initialCoordinates={mapClickCoordinates}
      />
    </div>
  );
}
