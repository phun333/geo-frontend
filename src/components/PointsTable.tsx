'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Point, CoordinateType } from '@/lib/types';
import { getCoordinateTypeLabel, getCoordinateTypeColor } from '@/lib/api';
import { Edit2, Trash2, MapPin, Eye, EyeOff } from 'lucide-react';

interface PointsTableProps {
  points: Point[];
  onEdit: (point: Point) => void;
  onDelete: (id: number) => Promise<boolean>;
  onSelect: (point: Point) => void;
  selectedPoint?: Point | null;
  loading?: boolean;
  hiddenPoints?: Set<number>;
  onToggleVisibility?: (pointId: number) => void;
}

const PointsTable: React.FC<PointsTableProps> = ({
  points,
  onEdit,
  onDelete,
  onSelect,
  selectedPoint,
  loading = false,
  hiddenPoints = new Set(),
  onToggleVisibility,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState<Point | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (point: Point) => {
    setPointToDelete(point);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pointToDelete) return;

    setDeleting(true);
    try {
      const success = await onDelete(pointToDelete.id);
      if (success) {
        setDeleteDialogOpen(false);
        setPointToDelete(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type: CoordinateType) => {
    const color = getCoordinateTypeColor(type);
    return (
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: color }}
      />
    );
  };

  const truncateGeometry = (geometry: string, maxLength: number = 30) => {
    if (geometry.length <= maxLength) return geometry;
    return geometry.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {points.length === 0 ? (
          <div className="text-center py-8 text-gray-500 px-4">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Henüz nokta eklenmemiş</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">Tür</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>Koordinatlar</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow 
                    key={point.id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedPoint?.id === point.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onSelect(point)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(point.coordinateType)}
                        <span className="text-xs text-gray-500">
                          {getCoordinateTypeLabel(point.coordinateType)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {point.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">
                      {truncateGeometry(point.geometry)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onToggleVisibility && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleVisibility(point.id);
                            }}
                            title={hiddenPoints.has(point.id) ? "Haritada göster" : "Haritada gizle"}
                            className={hiddenPoints.has(point.id) ? "text-gray-400" : ""}
                          >
                            {hiddenPoints.has(point.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(point);
                          }}
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(point);
                          }}
                          title="Sil"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nokta Sil</DialogTitle>
            <DialogDescription>
              &quot;{pointToDelete?.name}&quot; noktasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PointsTable; 