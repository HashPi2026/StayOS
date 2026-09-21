export interface VehicleItem {
  id: string;
  makeModel: string;
  plate: string;
  state: string;
  color: string;
  isPrimary: boolean;
  parkingType: 'Valet' | 'Self-Park';
  stallOrBay: string;
  keyPeg?: string;
  passNumber?: string;
}

export interface SharedGuestItem {
  id: string;
  name: string;
  relationship: string;
  isPrimary: boolean;
  phone: string;
  email: string;
  idDocument: string;
  keycardStatus: string;
  vipTier?: string;
}

export interface OtherChargeItem {
  id: string;
  category: string;
  chargeName: string;
  chargeCode: string;
  date: string;
  rate: number;
  quantity: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  voucherNumber?: string;
  isRecurring: boolean;
}

export interface PaymentTransaction {
  id: string;
  method: string;
  methodDetail: string;
  payerName: string;
  payerRole: string;
  amount: number;
  dateTime: string;
  receiptNumber: string;
  authCode: string;
  status: 'Settled' | 'Approved' | 'Pending';
}

export interface GroupRecord {
  id: string;
  code: string;
  name: string;
  organization: string;
  organizer: string;
  marketSegment: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  cutoffDate: string;
  remarks: string;
  totalRooms: number;
  pickedRooms: number;
  negotiatedRate: number;
  arAccountNumber: string;
  creditFacility: number;
  availableHeadroom: number;
  contacts: Array<{
    name: string;
    role: string;
    phone: string;
    email: string;
    isPrimary: boolean;
  }>;
}

export interface ReservationWizardState {
  // Mode
  mode: 'NEW_FOLIO' | 'GROUP_FOLIO';
  step: number; // 0 for Group Intake (when GROUP_FOLIO), 1, 2, 3, 4
  selectedGroup: GroupRecord | null;

  // Step 1: Stay & Rent Details
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  nights: number;
  bookingSource: string;
  building: string;
  floor: string;
  roomType: string;
  roomNumber: string;
  adults: number;
  children: number;
  reservationStatus: string;
  rateType: string;
  isNonRefundable: boolean;
  isPrepaid: boolean;
  roomRatePerNight: number;

  // Step 2: Guest Details
  primaryGuest: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    birthDate: string;
    company: string;
    contactType: string;
    phone: string;
    email: string;
    address: string;
    docType: string;
    docNumber: string;
    docExpiry: string;
    vipTier: string;
    profileId: string;
    isDnrFlagged: boolean;
    dnrReason: string;
    dnrOverridden: boolean;
  };

  // Step 3: Other Charges
  otherCharges: OtherChargeItem[];

  // Step 4: Payments
  payments: PaymentTransaction[];
  demoState: 'settled' | 'due';

  // Miscellaneous Drawer Data
  vehicles: VehicleItem[];
  sharedGuests: SharedGuestItem[];
}
