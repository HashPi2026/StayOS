export type BusinessChannelTabKey = 'category' | 'business-source' | 'invoice' | 'commission-invoice';

export interface CategoryItem {
  id: string;
  name: string;
  code: string;
  description: string;
  commissionApply: boolean;
  creditApply: boolean;
  linkedSourcesCount: number;
  mappedSources: { id: string; name: string; code: string }[];
  status: 'active' | 'inactive';
}

export interface CommissionRule {
  id: string;
  category: string;
  rateType: string;
  commissionRate: number; // e.g. 15.00 for 15%
}

export interface ComplianceDocument {
  id: string;
  documentType: string;
  documentNumber: string;
  status: 'Verified Active' | 'Signed & Executed' | 'Valid thru 2027' | 'Pending Review';
  verifiedDate?: string;
}

export interface BusinessSourceItem {
  id: string;
  sourceCode: string;
  name: string;
  shortName: string;
  category: string;
  iataNumber?: string;
  crsEngine: string;
  crsStatus: string;
  contactPerson: string;
  contactEmail?: string;
  contactPhone?: string;
  address: string;
  isActive: boolean;
  dueBalance: number;
  creditLimit: number;
  termsDays: number;
  lastSyncTime?: string;
  initials?: string;
  badgeBgColor?: string;
  // Policies & Direct Billing toggles
  prepaidOnly: boolean;
  rateApply: boolean;
  taxExempt: boolean;
  selfCheckInPayment: boolean;
  commissionApply: boolean;
  creditApply: boolean;
  // Nested collections
  commissionRules: CommissionRule[];
  documents: ComplianceDocument[];
}

export interface InvoiceFolioItem {
  id: string;
  reservationId: string;
  guestName: string;
  stayPeriod: string;
  nights: number;
  roomNumber: string;
  roomType: string;
  rateCode: string;
  grossRevenue: number;
  commissionPercent?: number;
  commissionAmount?: number;
}

export interface InvoicePaymentRecord {
  id: string;
  method: string;
  paymentDate: string;
  receiptNumber: string;
  referenceNote: string;
  amount: number;
  status: 'Cleared' | 'Pending';
}

export interface CorporateInvoiceItem {
  id: string;
  invoiceNumber: string;
  invoiceType: 'Corporate Master' | 'OTA Net Comm' | 'OTA Merchant' | 'Group Banquet';
  businessSourceId: string;
  businessSourceName: string;
  businessSourceAcct: string;
  sourceInitials: string;
  sourceBgColor: string;
  invoiceDate: string;
  dueDate: string;
  billingCycle: string;
  taxRegistrationNumber: string;
  terms: string;
  postedAmount: number;
  receivedAmount: number;
  balanceDue: number;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'DRAFT';
  overdueDays?: number;
  folios: InvoiceFolioItem[];
  payments: InvoicePaymentRecord[];
}

export interface CommissionInvoiceItem {
  id: string;
  invoiceNumber: string;
  agencyName: string;
  agencyCode: string;
  iataNumber: string;
  partnerRef: string;
  invoiceDate: string;
  dueDate: string;
  stayMonth: string;
  taxIdVat: string;
  vatRegime: string;
  commissionPayable: number;
  disbursedAmount: number;
  balanceDue: number;
  status: 'PAID' | 'PARTIAL' | 'DUE_SOON' | 'OVERDUE';
  overdueDays?: number;
  folios: InvoiceFolioItem[];
  payments: InvoicePaymentRecord[];
}
