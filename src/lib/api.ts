import { ApiResponse, Point, CreatePointRequest, UpdatePointRequest, CoordinateType } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        isSuccess: false, 
        message: 'Network error occurred' 
      }));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // GET all points
  static async getAllPoints(): Promise<ApiResponse<Point[]>> {
    return this.request<Point[]>('/Points');
  }

  // GET point by ID
  static async getPointById(id: number): Promise<ApiResponse<Point>> {
    return this.request<Point>(`/Points/${id}`);
  }

  // POST create new point
  static async createPoint(request: CreatePointRequest): Promise<ApiResponse<Point>> {
    const params = new URLSearchParams({
      geometry: request.geometry,
      name: request.name,
      coordinateType: request.coordinateType.toString()
    });

    return this.request<Point>(`/Points?${params}`, {
      method: 'POST',
    });
  }

  // PUT update point
  static async updatePoint(request: UpdatePointRequest): Promise<ApiResponse<Point>> {
    const params = new URLSearchParams({
      geometry: request.geometry,
      name: request.name,
      coordinateType: request.coordinateType.toString()
    });

    return this.request<Point>(`/Points/${request.id}?${params}`, {
      method: 'PUT',
    });
  }

  // DELETE point
  static async deletePoint(id: number): Promise<ApiResponse<Point>> {
    return this.request<Point>(`/Points/${id}`, {
      method: 'DELETE',
    });
  }
}

// Geometry parsing utilities
export const parseGeometry = (geometry: string, type: CoordinateType): [number, number][] => {
  try {
    const coordinates = geometry.split(',').map(coord => {
      const [lng, lat] = coord.trim().split(' ').map(parseFloat);
      return [lat, lng] as [number, number]; // Leaflet uses [lat, lng] format
    });
    
    return coordinates;
  } catch (error) {
    console.error('Error parsing geometry:', error);
    return [];
  }
};

export const formatGeometry = (coordinates: [number, number][]): string => {
  return coordinates.map(([lat, lng]) => `${lng} ${lat}`).join(', ');
};

export const getCoordinateTypeLabel = (type: CoordinateType): string => {
  switch (type) {
    case CoordinateType.Point:
      return 'Nokta';
    case CoordinateType.Line:
      return 'Çizgi';
    case CoordinateType.Polygon:
      return 'Alan';
    default:
      return 'Bilinmiyor';
  }
};

export const getCoordinateTypeColor = (type: CoordinateType): string => {
  switch (type) {
    case CoordinateType.Point:
      return '#ef4444'; // red
    case CoordinateType.Line:
      return '#3b82f6'; // blue
    case CoordinateType.Polygon:
      return '#10b981'; // green
    default:
      return '#6b7280'; // gray
  }
}; 