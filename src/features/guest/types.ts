export type GuestSubMenu = 'guest-database' | 'contacts' | 'lost-and-found';

export type GuestDatabaseViewMode = 'hub' | 'master-list' | 'add' | 'edit';
export type ContactsViewMode = 'directory' | 'add-edit' | 'manage-categories';
export type LostAndFoundViewMode = 'ledger';

export interface GuestContact {
  id: string;
  isPrimary: boolean;
  contactType: 'Mobile / Personal' | 'Office / Executive Assistant' | 'Home' | 'Holiday / Alternate' | 'Emergency Contact' | 'Billing / Accounts';
  phone: string;
  countryCode: string;
  email: string;
  folioDispatch: boolean;
  addressType: 'Primary Residence' | 'Billing Address' | 'Corporate HQ' | 'Mailing' | 'Temporary';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface GuestDocument {
  id: string;
  isPrimary: boolean;
  documentType: 'Passport' | 'National Identity Card' | 'Driver License' | 'Diplomatic ID' | 'Permanent Resident Card';
  documentNumber: string;
  validTill: string;
  nameOnDocument: string;
  issuedBy: string;
  issuePlace: string;
  registeredAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  remarks?: string;
  frontScanUrl?: string;
  backScanUrl?: string;
  isOcrVerified?: boolean;
}

export interface GuestRecord {
  id: string;
  dbGuestId?: number;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  nationality: string;
  company?: string;
  designation?: string;
  department?: string;
  remarks?: string;
  dnrStatus: 'none' | 'warning' | 'blocked';
  dnrReason?: string;
  incidentRef?: string;
  isVip: boolean;
  vipTier?: string;
  createdDate: string;
  totalStays: number;
  totalNights: number;
  totalSpend: number;
  lastVisit: string;
  lastRoom: string;
  inHouse: boolean;
  contacts: GuestContact[];
  documents: GuestDocument[];
}

export interface CommercialContactChannel {
  id: string;
  isPrimary: boolean;
  type: string;
  phone: string;
  countryCode: string;
  email: string;
  addressType: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface CommercialDocumentRecord {
  id: string;
  documentType: string;
  documentNumber: string;
  validTill: string;
  status: 'Verified • Current' | 'Expiring Soon' | 'Archived' | 'Pending Review';
  fileAttachmentName?: string;
}

export interface CommercialContact {
  id: string;
  fullName: string;
  designation?: string;
  associatedCompany: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  taxPin: string;
  birthDate?: string;
  accountManager?: string;
  status: 'active' | 'under_review' | 'expired' | 'suspended';
  contractStatus?: 'Active SLA' | 'Expiring Q4' | 'Annual Preferred' | 'Vendor Master';
  contacts: CommercialContactChannel[];
  documents: CommercialDocumentRecord[];

  // Aliases & extended attributes
  accountName?: string;
  legalEntityName?: string;
  accountCode?: string;
  taxId?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  secondaryPhone?: string;
  creditLimit?: number;
  paymentTerms?: string;
  allowDirectBilling?: boolean;
  currency?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  corporateRateCode?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  remarks?: string;
}

export interface ContactCategory {
  id: string;
  name: string;
  badgeColor?: string;
  linkedAccountsCount?: number;
  description: string;
  defaultCreditTerms?: string;
  isLocked?: boolean;

  // Aliases
  code?: string;
  defaultPaymentTerms?: string;
  defaultCreditLimit?: number;
  allowDirectBilling?: boolean;
  accountCount?: number;
  isActive?: boolean;
}

export interface LostFoundItem {
  id: string;
  surrenderType?: 'found' | 'lost';
  dispositionStatus?: 'open' | 'returned' | 'discarded';
  itemName: string;
  category: string;
  color?: string;
  colorHex?: string;
  characteristics?: string;
  serialNumber?: string;
  locationFound?: string;
  storageVault?: string;
  dateLogged?: string;
  reportedBy?: string;
  guestId?: string;
  guestName?: string;
  roomNumber?: string;
  folioNumber?: string;
  custodyNotes?: string;
  retentionDaysRemaining?: number;

  // Extended operational log attributes
  tagNumber?: string;
  description?: string;
  foundDate?: string;
  foundLocation?: string;
  foundBy?: string;
  department?: string;
  storageLocation?: string;
  status?: 'vault_open' | 'claim_pending' | 'returned' | 'disposed';
  claimedBy?: string;
  claimDate?: string;
  disposalMethod?: string;
  remarks?: string;
}
