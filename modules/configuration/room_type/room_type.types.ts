export interface RoomTypeEntity {
  room_type_id: number;
  client_id: string;
  floor_id: number;
  building_id: number;
  short_name: string;
  room_type_name: string;
  room_type_color: string | null;
  description: string | null;
  over_booking: number;
  allow_in_occupancy: boolean;
  is_crs: boolean;
}

export interface CreateRoomTypeDTO {
  floor_id: number;
  building_id: number;
  short_name: string;
  room_type_name: string;
  room_type_color?: string | null;
  description?: string | null;
  over_booking?: number;
  allow_in_occupancy?: boolean;
  is_crs?: boolean;
}

export interface UpdateRoomTypeDTO {
  floor_id?: number;
  building_id?: number;
  short_name?: string;
  room_type_name?: string;
  room_type_color?: string | null;
  description?: string | null;
  over_booking?: number;
  allow_in_occupancy?: boolean;
  is_crs?: boolean;
}
