export type FrontDeskScreen =
  | 'search-reservation'
  | 'guest-ledger'
  | 'batch-folio'
  | 'change-room-status'
  | 'block-room'
  | 'edit-group'
  | 'room-comments';

// SCREEN 1: Search Reservation Types
export interface SearchReservationFilterState {
  searchQuery: string;
  resIdOrConf: string;
  guestName: string;
  status: string;
  building: string;
  floor: string;
  roomCategory: string;
  roomNumber: string;
  checkInWindow: string;
  checkOutWindow: string;
  channelSource: string;
  ratePlan: string;
}

export interface ReservationRecord {
  id: string;
  resId: string;
  crsNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  vipTier?: 'VIP 1' | 'VIP 2' | 'VIP Diamond' | 'VIP Platinum' | 'Repeat Guest' | 'AAA Member';
  roomNumber: string;
  roomCategory: string;
  roomCategoryName: string;
  floor: string;
  wing: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  etaNote?: string;
  channelSource: string;
  ratePlan: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Confirmed' | 'Checked In' | 'Departing' | 'Checked Out' | 'Cancelled' | 'No Show';
  notes?: string;
}

// SCREEN 2: Guest Ledger Types
export type GuestLedgerTab =
  | 'inhouse'
  | 'checkout'
  | 'checkedout'
  | 'reservations'
  | 'room-change'
  | 'late-checkout';

export interface GuestLedgerEntry {
  id: string;
  guestName: string;
  folioId: string;
  vipTier?: string;
  phone: string;
  email: string;
  roomNumber: string;
  targetRoomNumber?: string;
  floor: string;
  roomCategory: string;
  checkInDate: string;
  checkOutDate: string;
  adr: number;
  paidAmount: number;
  balanceDue: number;
  specialRequests?: string[];
  status: string;
  // Room change details
  transitionType?: 'Comp Upgrade' | 'Maintenance Swap' | 'Connecting Room Req' | 'Paid Upgrade';
  moveTime?: string;
  baggageHandling?: string;
  hkStatus?: string;
  // Late checkout details
  approvedDeparture?: string;
  lateFeeStatus?: string;
  authorizedBy?: string;
  hkSyncStatus?: string;
}

export interface FolioTransaction {
  id: string;
  date: string;
  description: string;
  note?: string;
  debit: number;
  credit: number;
}

// SCREEN 3: Batch Folio Types
export interface BatchFolioItem {
  id: string;
  resId: string;
  folioId: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomCategory: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  stayCategory: 'Due Out' | 'In-House' | 'Due In';
  totalAmount: number;
  balanceDue: number;
  dispatchStatus: 'Folio Generated' | 'Emailed' | 'Reg Form Ready' | 'Unprinted';
  dispatchNote?: string;
  selected: boolean;
}

// SCREEN 4: Change Room Status Types
export type RoomStatusCode = 'VC' | 'VD' | 'OC' | 'OD' | 'OOO' | 'OOS';

export interface RoomRackCard {
  id: string;
  roomNumber: string;
  floor: number;
  wing: string;
  roomType: string;
  roomTypeName: string;
  status: RoomStatusCode;
  isOccupied: boolean;
  guestName?: string;
  occupancyDetail?: string;
  hkAttendant?: string;
  cleanedTime?: string;
  maintenanceNote?: string;
  isFocusRoom?: boolean;
}

// SCREEN 5: Block Room Types
export interface RoomBlockItem {
  id: string;
  roomNumber: string;
  roomType: string;
  roomTypeName: string;
  floor: string;
  wing: string;
  category: string;
  categoryType: 'OOO' | 'OOS';
  fromDateTime: string;
  toDateTime: string;
  durationString: string;
  remarks: string;
  overlapWarning?: {
    resId: string;
    guestName: string;
    checkInTime: string;
  };
  blockedBy: string;
  blockedByRole: string;
  isActive: boolean;
}

// SCREEN 6: Edit Group Types
export interface GroupMemberItem {
  id: string;
  resId: string;
  guestName: string;
  guestEmail: string;
  vipTier?: string;
  roomNumber: string;
  roomType: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'In-House' | 'Confirmed' | 'Checked Out';
  billingCoverage: 'Room & Tax Covered' | 'Self-Pay All';
}

export interface GroupBookingMaster {
  id: string;
  groupId: string;
  groupName: string;
  corporateAccountName: string;
  directArCode: string;
  primaryOrganizer: string;
  organizerPhone: string;
  checkInDate: string;
  checkOutDate: string;
  cutOffDate: string;
  cutOffStatus: string;
  masterBillingFolio: string;
  totalBilled: number;
  creditHeadroom: number;
  creditLineCap: number;
  creditUtilizationPercent: number;
  enforcedRoutingDirective: {
    roomAndTax: string;
    incidentals: string;
  };
  membersCount: number;
  contractedBlocks: number;
  members: GroupMemberItem[];
}

// SCREEN 7: Room Comments Types
export interface RoomCommentItem {
  id: string;
  commentId: string;
  authorName: string;
  authorRole: string;
  authorDepartment: 'Front Desk' | 'Housekeeping' | 'Engineering' | 'Guest Services' | 'Security';
  authorInitials: string;
  terminal: string;
  category: 'Front Desk Note' | 'Housekeeping' | 'Maintenance' | 'Guest Preference' | 'Security Incident';
  timestamp: string;
  content: string;
  isUrgentAlert?: boolean;
  verifiedBadge?: string;
}

export interface RoomHardwareSpecs {
  roomNumber: string;
  roomType: string;
  floor: number;
  tower: string;
  currentStatus: string;
  currentGuest?: string;
  stayRange?: string;
  keycardLock: {
    model: string;
    batteryLevel: number;
  };
  minibarScale: {
    status: string;
  };
  hvacController: {
    model: string;
    targetTemp: string;
    ambientTemp: string;
  };
  lastSanitized: string;
  cleanCert: string;
  departmentVolumes: {
    frontDesk: number;
    housekeeping: number;
    maintenance: number;
  };
  checklist: Array<{
    task: string;
    status: 'DONE' | 'PENDING';
  }>;
}
