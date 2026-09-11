export type FloorStatus = 'active' | 'inactive' | 'maintenance';

export interface Floor {
  id: string;
  name: string;
  floorNumber?: number;
  description: string;
  buildingId: string;
  buildingName: string;
  status: FloorStatus;
  totalRooms?: number;
  createdAt?: string;
  updatedAt?: string;
}
