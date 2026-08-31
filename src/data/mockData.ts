import { Building, PropertyData, Room, RoomType, Amenity, AuditLog, NotificationItem } from '../types';

export const HOTLINKED_MAP_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBZvTElkodqqy7cl8wiEBOOk3O1R1ngI9OlG1TkA3JGLYXK_l2uwg0jPIbTZJSbnWYsjafRGkqskm2HWnCBj3VPPbI6ZL6LfaekSI_aIC2eysCNoa0iMOUxZbfNrJFr9Pt7oxdJVUSPoCPS_lyTfhX7qV4yQ-IJWEu2PZL9yEXUnI16zXA1M0G-psWkbUDsubpvG9L9VgH4IydqRgUNMQaWGPAP6h9Zf8LmKByjDJE4BpZtXrOlw4J';

export const INITIAL_PROPERTIES: PropertyData[] = [
  {
    id: 'prop-grand-plaza',
    identity: {
      name: 'Grand Plaza Hotel',
      clientId: 'CL-9824-A1',
      region: 'apac',
    },
    location: {
      address: '1-1-2 Oshiage, Sumida City',
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'Japan',
      latitude: '35.7100',
      longitude: '139.8107',
      mapImageUrl: HOTLINKED_MAP_IMAGE,
    },
    contact: {
      websiteUrl: 'https://www.grandplazatokyo.com',
      email: 'reservations@grandplazatokyo.com',
      phone: '+81 3-5809-1000',
    },
  },
  {
    id: 'prop-tokyo-bay',
    identity: {
      name: 'Tokyo Bay Luxury Resort',
      clientId: 'CL-4412-B2',
      region: 'apac',
    },
    location: {
      address: '1-8-1 Maihama, Urayasu',
      city: 'Chiba',
      state: 'Chiba Prefecture',
      country: 'Japan',
      latitude: '35.6329',
      longitude: '139.8804',
      mapImageUrl: HOTLINKED_MAP_IMAGE,
    },
    contact: {
      websiteUrl: 'https://www.tokyobayresort.jp',
      email: 'concierge@tokyobayresort.jp',
      phone: '+81 47-355-1111',
    },
  },
  {
    id: 'prop-kyoto-heritage',
    identity: {
      name: 'Kyoto Heritage Inn & Spa',
      clientId: 'CL-7731-K3',
      region: 'apac',
    },
    location: {
      address: 'Higashiyama-ku, Kiyomizu 1-chome',
      city: 'Kyoto',
      state: 'Kyoto Prefecture',
      country: 'Japan',
      latitude: '34.9949',
      longitude: '135.7850',
      mapImageUrl: HOTLINKED_MAP_IMAGE,
    },
    contact: {
      websiteUrl: 'https://www.kyotoheritagehotel.jp',
      email: 'info@kyotoheritagehotel.jp',
      phone: '+81 75-531-0001',
    },
  },
];

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld-001',
    code: 'BLD-001',
    name: 'Main Wing',
    description: 'Primary guest rooms and lobby area. Includes executive lounge and rooftop terrace.',
    status: 'active',
    totalFloors: 12,
    totalRooms: 180,
    hasActiveRooms: true,
    createdAt: 'Oct 24, 2023',
    updatedAt: 'Oct 25, 2023',
    updatedBy: {
      name: 'Jane Smith',
      initials: 'JS',
    },
  },
  {
    id: 'bld-002',
    code: 'BLD-002',
    name: 'South Tower',
    description: 'Conference center and event spaces.',
    status: 'active',
    totalFloors: 18,
    totalRooms: 150,
    hasActiveRooms: true,
    createdAt: 'Oct 21, 2023',
    updatedAt: 'Oct 21, 2023 14:30',
    updatedBy: {
      name: 'Alex Wong',
      initials: 'AW',
    },
  },
  {
    id: 'bld-003',
    code: 'BLD-003',
    name: 'Annex Building',
    description: 'Staff quarters and maintenance facilities.',
    status: 'inactive',
    totalFloors: 4,
    totalRooms: 42,
    hasActiveRooms: false,
    createdAt: 'Sep 15, 2023',
    updatedAt: 'Sep 15, 2023 11:45',
    updatedBy: {
      name: 'David Miller',
      initials: 'DM',
    },
  },
  {
    id: 'bld-004',
    code: 'BLD-004',
    name: 'Pool House',
    description: 'Recreation area and spa facilities. Currently under renovation.',
    status: 'maintenance',
    totalFloors: 2,
    totalRooms: 40,
    hasActiveRooms: true,
    createdAt: 'Aug 02, 2023',
    updatedAt: 'Aug 02, 2023 08:20',
    updatedBy: {
      name: 'Jane Smith',
      initials: 'JS',
    },
  },
];

export const INITIAL_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt-1',
    name: 'Executive King Suite',
    code: 'EX-KNG',
    category: 'Suite',
    baseRate: 480,
    capacity: 3,
    bedType: '1 King Bed',
    totalUnits: 45,
    status: 'active',
  },
  {
    id: 'rt-2',
    name: 'Deluxe City View Twin',
    code: 'DLX-TWN',
    category: 'Deluxe',
    baseRate: 320,
    capacity: 2,
    bedType: '2 Twin Beds',
    totalUnits: 120,
    status: 'active',
  },
  {
    id: 'rt-3',
    name: 'Standard Queen',
    code: 'STD-QNN',
    category: 'Standard',
    baseRate: 210,
    capacity: 2,
    bedType: '1 Queen Bed',
    totalUnits: 160,
    status: 'active',
  },
  {
    id: 'rt-4',
    name: 'Presidential Skytree Penthouse',
    code: 'PRES-PNT',
    category: 'Executive',
    baseRate: 1450,
    capacity: 6,
    bedType: '2 King + Living Suite',
    totalUnits: 4,
    status: 'active',
  },
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r-101', number: '101', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 1, roomTypeId: 'rt-3', roomTypeName: 'Standard Queen', status: 'available', rate: 210 },
  { id: 'r-102', number: '102', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 1, roomTypeId: 'rt-3', roomTypeName: 'Standard Queen', status: 'occupied', rate: 210 },
  { id: 'r-201', number: '201', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 2, roomTypeId: 'rt-2', roomTypeName: 'Deluxe City View Twin', status: 'available', rate: 320 },
  { id: 'r-202', number: '202', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 2, roomTypeId: 'rt-2', roomTypeName: 'Deluxe City View Twin', status: 'cleaning', rate: 320 },
  { id: 'r-801', number: '801', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 8, roomTypeId: 'rt-1', roomTypeName: 'Executive King Suite', status: 'occupied', rate: 480 },
  { id: 'r-802', number: '802', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 8, roomTypeId: 'rt-1', roomTypeName: 'Executive King Suite', status: 'reserved', rate: 480 },
  { id: 'r-1201', number: '1201', buildingId: 'bld-001', buildingName: 'Main Wing', floor: 12, roomTypeId: 'rt-4', roomTypeName: 'Presidential Skytree Penthouse', status: 'occupied', rate: 1450 },
  { id: 'r-301', number: '301', buildingId: 'bld-002', buildingName: 'South Tower', floor: 3, roomTypeId: 'rt-2', roomTypeName: 'Deluxe City View Twin', status: 'available', rate: 320 },
  { id: 'r-302', number: '302', buildingId: 'bld-002', buildingName: 'South Tower', floor: 3, roomTypeId: 'rt-2', roomTypeName: 'Deluxe City View Twin', status: 'maintenance', rate: 320 },
  { id: 'r-501', number: '501', buildingId: 'bld-004', buildingName: 'Pool House', floor: 1, roomTypeId: 'rt-1', roomTypeName: 'Executive King Suite', status: 'maintenance', rate: 480 },
];

export const INITIAL_AMENITIES: Amenity[] = [
  { id: 'am-1', name: 'Rooftop Infinity Onsen & Spa', category: 'Wellness', location: 'Main Wing, 12th Floor', openingHours: '06:00 - 23:00', status: 'open', icon: 'hot_tub' },
  { id: 'am-2', name: 'Skyline Fitness Center', category: 'Wellness', location: 'Main Wing, 11th Floor', openingHours: '24/7 Access', status: 'open', icon: 'fitness_center' },
  { id: 'am-3', name: 'Grand Ballroom & Event Center', category: 'Business', location: 'South Tower, 2nd Floor', openingHours: 'Upon Booking', status: 'open', icon: 'theater_comedy' },
  { id: 'am-4', name: 'Garden Olympic Swimming Pool', category: 'Recreation', location: 'Pool House, Ground Level', openingHours: '08:00 - 20:00', status: 'renovation', icon: 'pool' },
  { id: 'am-5', name: 'Executive Club Lounge', category: 'Dining', location: 'Main Wing, 10th Floor', openingHours: '06:30 - 22:00', status: 'open', icon: 'local_bar' },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: 'Oct 25, 2023 16:42:10', user: 'Jane Smith (JS)', action: 'UPDATE', module: 'Property Master', details: 'Updated location coordinates and contact website URL', ipAddress: '192.168.1.104' },
  { id: 'log-2', timestamp: 'Oct 24, 2023 09:12:35', user: 'Jane Smith (JS)', action: 'UPDATE', module: 'Buildings', details: 'Modified Main Wing description and total floor count', ipAddress: '192.168.1.104' },
  { id: 'log-3', timestamp: 'Oct 21, 2023 14:30:19', user: 'Alex Wong (AW)', action: 'UPDATE', module: 'Buildings', details: 'Activated South Tower conference configuration', ipAddress: '192.168.1.182' },
  { id: 'log-4', timestamp: 'Oct 18, 2023 11:05:44', user: 'System Admin', action: 'SYNC', module: 'Channel Manager', details: 'Synchronized rates with Booking.com and Expedia', ipAddress: '10.0.4.12' },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif-1', title: 'Building Status Modified', message: 'Main Wing configuration has been updated by Jane Smith.', timestamp: '10m ago', type: 'info', read: false },
  { id: 'notif-2', title: 'Maintenance Scheduled', message: 'Pool House annual heating filter inspection scheduled for tomorrow 09:00.', timestamp: '2h ago', type: 'warning', read: false },
  { id: 'notif-3', title: 'Rates Sync Successful', message: 'Channel rates successfully pushed to GDS and OTA partners.', timestamp: '1d ago', type: 'success', read: true },
];
