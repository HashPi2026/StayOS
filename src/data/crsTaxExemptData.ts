import { CrsTaxExemptMapping } from '../types';

export const CRS_ENGINES = [
  { id: 'expedia', name: 'Expedia', code: 'E', color: 'bg-primary-fixed-dim/20 text-primary' },
  { id: 'booking', name: 'Booking.com', code: 'B', color: 'bg-secondary-fixed-dim/20 text-secondary' },
  { id: 'direct', name: 'Direct Web', code: 'D', color: 'bg-outline-variant/20 text-on-surface-variant' },
  { id: 'agoda', name: 'Agoda', code: 'A', color: 'bg-amber-100 text-amber-800' },
  { id: 'trip', name: 'Trip.com', code: 'T', color: 'bg-sky-100 text-sky-800' },
  { id: 'gds', name: 'Sabre / Amadeus GDS', code: 'G', color: 'bg-purple-100 text-purple-800' },
];

export const CRS_MARKET_SOURCES = [
  'Mobile App',
  'B2B',
  'Social Media',
  'GDS',
  'Corporate',
  'Wholesaler',
  'Direct Call',
  'Meta Search',
];

export const CRS_TAX_OPTIONS = [
  'City Tax',
  'Service Charge',
  'VAT',
  'Stay Tax',
  'Tourism Fee',
  'Occupancy Tax',
];

export const INITIAL_CRS_MAPPINGS: CrsTaxExemptMapping[] = [
  {
    id: 'crs-1',
    engineName: 'Expedia',
    marketSource: 'Mobile App',
    taxName: 'City Tax',
    status: 'Active',
    createdAt: '2026-08-15',
    notes: 'Exempt city tax for mobile app promotional bookings.',
  },
  {
    id: 'crs-2',
    engineName: 'Booking.com',
    marketSource: 'B2B',
    taxName: 'Service Charge',
    status: 'Active',
    createdAt: '2026-08-20',
    notes: 'Corporate negotiated rates exempt from property service charge.',
  },
  {
    id: 'crs-3',
    engineName: 'Direct Web',
    marketSource: 'Social Media',
    taxName: 'VAT',
    status: 'Inactive',
    createdAt: '2026-08-22',
    notes: 'Special influencer campaign VAT exemption (temporary disabled).',
  },
  {
    id: 'crs-4',
    engineName: 'Booking.com',
    marketSource: 'Mobile App',
    taxName: 'City Tax',
    status: 'Active',
    createdAt: '2026-08-25',
  },
  {
    id: 'crs-5',
    engineName: 'Expedia',
    marketSource: 'GDS',
    taxName: 'Stay Tax',
    status: 'Active',
    createdAt: '2026-08-28',
  },
];
