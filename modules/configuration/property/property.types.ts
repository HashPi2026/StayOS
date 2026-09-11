export interface PropertyEntity {
  client_id: string;
  property_name: string;
  region: string | null;
  address: string | null;
  city: string;
  state: string;
  url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface UpsertPropertyDTO {
  property_name: string;
  region?: string | null;
  address?: string | null;
  city: string;
  state: string;
  url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
