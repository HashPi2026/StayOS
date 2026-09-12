export type RateAvailabilitySubMenu = 'flash' | 'forecasting' | 'rate' | 'restriction';

export interface DateColumn {
  key: string;
  dayOfWeek: string;
  dateStr: string;
  isWeekend: boolean;
  isPeak: boolean;
  star?: boolean;
}

export interface FlashRoomCategory {
  code: string;
  name: string;
  totalKeys: number;
  maxOcc: string;
  rates: Record<string, number>;
  physicalAvail: Record<string, number>;
  crsAlloc: Record<string, number>;
  maintenance: Record<string, number>;
  occupancyPercent: Record<string, number>;
}

export interface ForecastingRow {
  date: string;
  avail: number;
  total: number;
  maint: number;
  stayOver: number;
  expIn: number;
  expOut: number;
  inhouse: number;
  revCY: number;
  revPY: number;
  soldCY: number;
  soldPY: number;
  occCY: number;
  occPY: number;
  adrCY: number;
  adrPY: number;
}

export interface RateMatrixRoom {
  code: string;
  name: string;
  keys: number;
  tierSubtitle: string;
  tiers: {
    name: string;
    label: string;
    isBase: boolean;
    rates: Record<string, number>;
  }[];
}

export interface RestrictionRoom {
  code: string;
  name: string;
  description: string;
  keys: number;
  cta: Record<string, boolean>;
  ctd: Record<string, boolean>;
  soldOut: Record<string, boolean>;
  minLos: Record<string, number>;
  maxLos: Record<string, number>;
}
