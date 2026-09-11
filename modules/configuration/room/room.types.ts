export interface RoomEntity {
  room_id: number;
  client_id: string;
  room_type_id: number;
  floor_id: number;
  building_id: number;
  room_name: string;
  short_name: string;
  is_hourly_rental: boolean;
  is_smoking: boolean;
  is_handicap: boolean;
  is_pet_allowed: boolean;
  include_in_occupancy_adr: boolean;
  is_crs_inventory: boolean;
}

export interface CreateRoomDTO {
  room_type_id: number;
  floor_id: number;
  building_id: number;
  room_name: string;
  short_name: string;
  is_hourly_rental?: boolean;
  is_smoking?: boolean;
  is_handicap?: boolean;
  is_pet_allowed?: boolean;
  include_in_occupancy_adr?: boolean;
  is_crs_inventory?: boolean;
}

export interface UpdateRoomDTO {
  room_type_id?: number;
  floor_id?: number;
  building_id?: number;
  room_name?: string;
  short_name?: string;
  is_hourly_rental?: boolean;
  is_smoking?: boolean;
  is_handicap?: boolean;
  is_pet_allowed?: boolean;
  include_in_occupancy_adr?: boolean;
  is_crs_inventory?: boolean;
}
