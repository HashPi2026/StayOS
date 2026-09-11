export interface BuildingEntity {
  building_id: number;
  client_id: string;
  building_name: string;
  description: string | null;
}

export interface CreateBuildingDTO {
  building_name: string;
  description?: string | null;
}

export interface UpdateBuildingDTO {
  building_name?: string;
  description?: string | null;
}
