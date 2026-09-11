export interface RoomStatusEntity {
  room_status_id: number;
  client_id: string;
  room_id: number | null;
  room_type_id: number | null;
  floor_id: number | null;
  building_id: number | null;
  status_name: string;
  short_name: string | null;
  status_code: string;
  status_color: string | null;
  text_color: string | null;
  is_active: boolean;
}

export interface CreateRoomStatusDTO {
  room_id?: number | null;
  room_type_id?: number | null;
  floor_id?: number | null;
  building_id?: number | null;
  status_name: string;
  short_name?: string | null;
  status_code: string;
  status_color?: string | null;
  text_color?: string | null;
  is_active?: boolean;
}

export interface UpdateRoomStatusDTO {
  room_id?: number | null;
  room_type_id?: number | null;
  floor_id?: number | null;
  building_id?: number | null;
  status_name?: string;
  short_name?: string | null;
  status_code?: string;
  status_color?: string | null;
  text_color?: string | null;
  is_active?: boolean;
}
