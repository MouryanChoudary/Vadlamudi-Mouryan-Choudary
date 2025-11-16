export type PipeSize = 'Small' | 'Medium' | 'Large' | 'Unknown';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Pipe {
  id: string;
  size: PipeSize;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  timestamp: number | null;
}

export interface AnalysisData {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  totalCount: number;
  countBySize: Record<PipeSize, number>;
  pipes: Pipe[];
  notes: string;
  location: GeolocationState;
  isQueued?: boolean;
  overallConfidence: number;
  modelVersion: string;
  feedbackSubmitted?: boolean;
}

export type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type InventorySyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export type UserRole = 'Admin' | 'User';

export interface User {
  email: string;
  role: UserRole;
}