import { useState, useEffect } from 'react';
import { Point, CreatePointRequest, UpdatePointRequest, CoordinateType } from '@/lib/types';
import { ApiService } from '@/lib/api';
import { toast } from 'sonner';

export const usePoints = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getAllPoints();
      if (response.isSuccess && response.data) {
        setPoints(response.data);
      } else {
        setError(response.message || 'Failed to fetch points');
        toast.error(response.message || 'Noktalar yüklenemedi');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createPoint = async (request: CreatePointRequest): Promise<boolean> => {
    try {
      const response = await ApiService.createPoint(request);
      if (response.isSuccess && response.data) {
        setPoints(prev => [...prev, response.data!]);
        toast.success('Nokta başarıyla eklendi');
        return true;
      } else {
        toast.error(response.message || 'Nokta eklenemedi');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  const updatePoint = async (request: UpdatePointRequest): Promise<boolean> => {
    try {
      const response = await ApiService.updatePoint(request);
      if (response.isSuccess && response.data) {
        setPoints(prev => 
          prev.map(point => 
            point.id === request.id ? response.data! : point
          )
        );
        toast.success('Nokta başarıyla güncellendi');
        return true;
      } else {
        toast.error(response.message || 'Nokta güncellenemedi');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  const deletePoint = async (id: number): Promise<boolean> => {
    try {
      const response = await ApiService.deletePoint(id);
      if (response.isSuccess) {
        setPoints(prev => prev.filter(point => point.id !== id));
        toast.success('Nokta başarıyla silindi');
        return true;
      } else {
        toast.error(response.message || 'Nokta silinemedi');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  return {
    points,
    loading,
    error,
    fetchPoints,
    createPoint,
    updatePoint,
    deletePoint,
  };
}; 