'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Point, CoordinateType, CreatePointRequest, UpdatePointRequest } from '@/lib/types';
import { getCoordinateTypeLabel } from '@/lib/api';

interface PointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  point?: Point | null;
  onSave: (request: CreatePointRequest | UpdatePointRequest) => Promise<boolean>;
  initialCoordinates?: { lat: number; lng: number } | null;
  newShapeInfo?: { geometry: string; coordinateType: CoordinateType } | null;
}

const PointDialog: React.FC<PointDialogProps> = ({
  open,
  onOpenChange,
  point,
  onSave,
  initialCoordinates,
  newShapeInfo,
}) => {
  const [name, setName] = useState('');
  const [coordinateType, setCoordinateType] = useState<CoordinateType>(CoordinateType.Point);
  const [geometry, setGeometry] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!point;

  useEffect(() => {
    if (point) {
      setName(point.name);
      setCoordinateType(point.coordinateType);
      setGeometry(point.geometry);
    } else {
      setName('');
      if (newShapeInfo) {
        setCoordinateType(newShapeInfo.coordinateType);
        setGeometry(newShapeInfo.geometry);
      } else if (initialCoordinates) {
        setCoordinateType(CoordinateType.Point);
        setGeometry(`${initialCoordinates.lng} ${initialCoordinates.lat}`);
      } else {
        setCoordinateType(CoordinateType.Point);
        setGeometry('');
      }
    }
    setErrors({});
  }, [point, initialCoordinates, newShapeInfo, open]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'İsim gereklidir';
    }

    if (!geometry.trim()) {
      newErrors.geometry = 'Koordinat gereklidir';
    } else {
      // Basic geometry validation
      const coords = geometry.split(',').map(c => c.trim());
      
      switch (coordinateType) {
        case CoordinateType.Point:
          if (coords.length !== 1) {
            newErrors.geometry = 'Nokta için tek koordinat çifti gereklidir (örn: "28.9784 41.0082")';
          } else {
            const [lng, lat] = coords[0].split(' ').map(parseFloat);
            if (isNaN(lng) || isNaN(lat)) {
              newErrors.geometry = 'Geçersiz koordinat formatı';
            }
          }
          break;
        
        case CoordinateType.Line:
          if (coords.length < 2) {
            newErrors.geometry = 'Çizgi için en az 2 koordinat çifti gereklidir';
          }
          break;
        
        case CoordinateType.Polygon:
          if (coords.length < 4 || coords.length > 11) {
            newErrors.geometry = 'Poligon 3 ila 10 köşe içermelidir (4 ila 11 koordinat).';
          } else if (coords[0] !== coords[coords.length - 1]) {
            newErrors.geometry = 'Poligon kapalı olmalıdır (ilk ve son koordinat aynı olmalı).';
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let request;
      if (isEditing) {
        request = {
          id: point!.id,
          name: name.trim(),
          geometry: geometry.trim(),
          coordinateType,
        } as UpdatePointRequest;
      } else {
        request = {
          name: name.trim(),
          geometry: geometry.trim(),
          coordinateType,
        } as CreatePointRequest;
      }

      const success = await onSave(request);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getGeometryPlaceholder = () => {
    switch (coordinateType) {
      case CoordinateType.Point:
        return '28.9784 41.0082';
      case CoordinateType.Line:
        return '28.9784 41.0082, 32.8597 39.9334';
      case CoordinateType.Polygon:
        return '28.5 40.5, 29.5 40.5, 29.5 41.5, 28.5 41.5, 28.5 40.5';
      default:
        return '';
    }
  };

  const getGeometryHelper = () => {
    switch (coordinateType) {
      case CoordinateType.Point:
        return 'Format: "boylam enlem"';
      case CoordinateType.Line:
        return 'Format: "boylam1 enlem1, boylam2 enlem2"';
      case CoordinateType.Polygon:
        return '3-10 köşeli kapalı alan. Örn: "x1 y1, x2 y2, x3 y3, x1 y1"';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Nokta Düzenle' : 'Yeni Nokta Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Mevcut nokta bilgilerini düzenleyin' 
              : 'Haritaya yeni bir nokta, çizgi veya alan ekleyin'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">İsim</Label>
            <Input
              id="name"
              placeholder="Nokta ismi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinateType">Koordinat Türü</Label>
            <Select
              value={coordinateType.toString()}
              onValueChange={(value) => setCoordinateType(parseInt(value) as CoordinateType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Koordinat türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CoordinateType.Point.toString()}>
                  {getCoordinateTypeLabel(CoordinateType.Point)}
                </SelectItem>
                <SelectItem value={CoordinateType.Line.toString()}>
                  {getCoordinateTypeLabel(CoordinateType.Line)}
                </SelectItem>
                <SelectItem value={CoordinateType.Polygon.toString()}>
                  {getCoordinateTypeLabel(CoordinateType.Polygon)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geometry">Koordinatlar</Label>
            <Input
              id="geometry"
              placeholder={getGeometryPlaceholder()}
              value={geometry}
              onChange={(e) => setGeometry(e.target.value)}
              className={errors.geometry ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500">{getGeometryHelper()}</p>
            {errors.geometry && (
              <p className="text-sm text-red-500">{errors.geometry}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PointDialog; 