export type BuildingStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface Building {
  id: string;
  code: string;
  name: string;
  description: string;
  status: BuildingStatus;
  totalFloors: number;
  totalRooms: number;
  hasActiveRooms: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    name: string;
    initials: string;
  };
}
