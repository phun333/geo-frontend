export enum CoordinateType {
  Point = 1,
  Line = 2,
  Polygon = 3
}

export interface Point {
  id: number;
  geometry: string;
  name: string;
  coordinateType: CoordinateType;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export interface CreatePointRequest {
  geometry: string;
  name: string;
  coordinateType: CoordinateType;
}

export interface UpdatePointRequest {
  id: number;
  geometry: string;
  name: string;
  coordinateType: CoordinateType;
}

export interface MapPoint {
  id: number;
  name: string;
  coordinates: [number, number][];
  type: CoordinateType;
} 