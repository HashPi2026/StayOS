export interface FloorEntity {
  floor_id: number;
  client_id: string;
  building_id: number;
  floor_name: string;
  description: string | null;
}

export interface CreateFloorDTO {
  building_id: number;
  floor_name: string;
  description?: string | null;
}

export interface UpdateFloorDTO {
  building_id?: number;
  floor_name?: string;
  description?: string | null;
}
