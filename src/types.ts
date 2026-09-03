export type NavigationPath =
  | 'overview'
  | 'buildings'
  | 'add-building'
  | 'edit-building'
  | 'floors'
  | 'room-types'
  | 'add-room-type'
  | 'edit-room-type'
  | 'rooms'
  | 'add-room'
  | 'bulk-add-rooms'
  | 'edit-room'
  | 'room-status'
  | 'amenities'
  | 'taxes'
  | 'tax-configuration'
  | 'add-tax'
  | 'edit-tax'
  | 'add-tax-rate'
  | 'edit-tax-rate'
  | 'rates-packages'
  | 'document-types'
  | 'add-document-type'
  | 'edit-document-type'
  | 'other-charges-categories'
  | 'add-other-charge-category'
  | 'edit-other-charge-category'
  | 'other-charges'
  | 'add-other-charge'
  | 'edit-other-charge'
  | 'measurement-units'
  | 'add-measurement-unit'
  | 'edit-measurement-unit'
  | 'payment-types'
  | 'add-payment-type'
  | 'edit-payment-type'
  | 'exchange-rates'
  | 'add-exchange-rate'
  | 'edit-exchange-rate'
  | 'policies'
  | 'add-policy'
  | 'edit-policy'
  | 'guest-categories'
  | 'add-guest-category'
  | 'edit-guest-category'
  | 'user-management'
  | 'add-user'
  | 'edit-user'
  | 'email-templates'
  | 'add-email-template'
  | 'edit-email-template'
  | 'roles-privileges'
  | 'add-role'
  | 'edit-role'
  | 'general-settings'
  | 'general-settings-rental'
  | 'general-settings-feature'
  | 'general-settings-night-audits'
  | 'general-settings-localization'
  | 'general-settings-display'
  | 'general-settings-folios'
  | 'general-settings-credit-cards'
  | 'general-settings-emails'
  | 'general-settings-guest-mandatory-data'
  | 'guest-mandatory-data'
  | 'device-configuration'
  | 'device-configuration-payment-gateway'
  | 'device-configuration-doorlock'
  | 'device-configuration-scanner'
  | 'payment-gateway'
  | 'doorlock-configuration'
  | 'scanner-configuration'
  | 'crs-tax-exempt'
  | 'add-crs-tax-exempt'
  | 'edit-crs-tax-exempt'
  | 'integrations'
  | 'notifications'
  | 'audit-logs'
  | 'system-health';

export interface PropertyIdentity {
  name: string;
  clientId: string;
  region: 'na' | 'eu' | 'apac' | 'latam';
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  mapImageUrl?: string;
}

export interface PropertyContact {
  websiteUrl: string;
  email?: string;
  phone?: string;
}

export interface PropertyData {
  id: string;
  identity: PropertyIdentity;
  location: PropertyLocation;
  contact: PropertyContact;
}

export type BuildingStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface Building {
  id: string;
  code: string;
  name: string;
  description: string;
  status: BuildingStatus;
  totalFloors: number;
  totalRooms: number;
  hasActiveRooms: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    name: string;
    initials: string;
  };
}

export type FloorStatus = 'active' | 'inactive' | 'maintenance';

export interface Floor {
  id: string;
  name: string;
  floorNumber?: number;
  description: string;
  buildingId: string;
  buildingName: string;
  status: FloorStatus;
  totalRooms?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type RoomCategory = 'Standard' | 'Deluxe' | 'Suite' | 'Executive' | 'Villa' | 'Penthouse';
export type RoomTypeStatus = 'active' | 'inactive' | 'renovation';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  color?: string;
  category: RoomCategory;
  baseRate: number;
  extraAdultRate?: number;
  extraChildRate?: number;
  capacity: number;
  maxAdults?: number;
  maxChildren?: number;
  bedType: string;
  bedCount?: number;
  extraBedAllowed?: boolean;
  maxExtraBeds?: number;
  sizeSqm?: number;
  sizeSqft?: number;
  viewType?: string;
  smokingPolicy?: 'non-smoking' | 'smoking' | 'designated';
  isAccessible?: boolean;
  description?: string;
  amenities?: string[];
  totalUnits: number;
  status: RoomTypeStatus;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
  buildingIds?: string[];
  overBookingLimit?: number;
  isCrs?: boolean;
  allowInOccupancy?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RoomStatus = 'occupied' | 'available' | 'maintenance' | 'cleaning' | 'reserved' | 'dirty' | 'clean' | 'ooo' | string;

export interface RoomStatusConfig {
  id: string;
  name: string;
  shortName: string;
  code: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  isSystemDefault?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  name: string;
  shortName: string;
  number: string;
  buildingId: string;
  buildingName: string;
  floorId?: string;
  floor: number;
  floorName?: string;
  roomTypeId: string;
  roomTypeName: string;
  status: RoomStatus;
  rate: number;
  isHourlyRental?: boolean;
  isSmoking?: boolean;
  isHandicapAccessible?: boolean;
  isPetAllowed?: boolean;
  includeInOccupancyAdr?: boolean;
  isCrsInventory?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxSlab {
  id: string;
  fromAmount: number;
  toAmount: number | null;
  ratePercentage: number;
  description?: string;
}

export interface TaxItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  taxType: 'GST' | 'VAT' | 'Service Tax' | 'Luxury Tax' | 'City Tax' | 'Environmental Fee' | string;
  ruleType?: 'percentage' | 'fixed';
  value?: number;
  applicationMethod?: 'per_night' | 'per_person_night' | 'per_stay' | 'per_item' | string;
  calculationStrategy?: 'per-day' | 'per-stay' | 'percentage';
  isActive: boolean;
  configsCount?: number;
  jurisdiction?: string;
  slabs?: TaxSlab[];
  applicableTo?: 'all-rooms' | 'specific-rooms' | 'food-beverage' | 'all-services';
  effectiveDate?: string;
  fromDate?: string;
  lastDate?: string;
  ratePercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RateTypeItem {
  id: string;
  shortName: string;
  name: string;
  description: string;
  bindPercentage: number;
  isHourly: boolean;
  isCrsTaxInclusive: boolean;
  isCrsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentCategory = 'Identity' | 'Visa' | 'Voucher' | 'Health' | 'Business' | 'Other';

export interface DocumentTypeItem {
  id: string;
  shortName: string;
  name: string;
  category: DocumentCategory;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OtherChargeCategoryItem {
  id: string;
  shortName: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OtherChargeItem {
  id: string;
  shortName: string;
  name: string;
  category: string;
  price?: number;
  taxable: boolean;
  alwaysCharge: boolean;
  reoccur: boolean;
  reoccurFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  crsCharge: boolean;
  callLoggingCharge: boolean;
  posCharge: boolean;
  forecastingRevenue: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeasurementUnitItem {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTypeItem {
  id: string;
  shortName: string;
  name: string;
  category: 'Credit Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Check' | 'Other';
  ccProcessing: boolean;
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeRateItem {
  id: string;
  country: string;
  countryCode?: string;
  currency: string;
  sign: string;
  rate: number;
  isBaseRate: boolean;
  flagUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'Wellness' | 'Dining' | 'Business' | 'Recreation' | 'Facility';
  location: string;
  openingHours: string;
  status: 'open' | 'closed' | 'renovation';
  icon: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
}

export type RoleType =
  | 'FrontOffice'
  | 'Operations'
  | 'SuperAdmin'
  | 'Finance'
  | 'Management'
  | 'Sales'
  | 'Housekeeping'
  | 'Security';

export interface PermissionActionSet {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionModuleDef {
  id: string;
  name: string;
  group: 'Reservations' | 'Operations' | 'Finance & Routing' | 'Configuration' | 'User Management & System';
  subtext?: string;
  icon?: string;
  disabledActions?: {
    view?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  type: RoleType;
  description: string;
  usersCount: number;
  isSystem?: boolean;
  isCritical?: boolean;
  permissions: Record<string, PermissionActionSet>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccountItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  roleId: string;
  roleName: string;
  roleType: RoleType;
  lastLogin: string;
  status: 'active' | 'inactive';
  phone?: string;
  department?: string;
  description?: string;
  createdAt?: string;
}

export interface EmailTemplateTriggers {
  created: boolean;
  updated: boolean;
  cancelled: boolean;
  dob: boolean;
  beforeCheckIn: boolean;
  beforeCheckInDays: number;
  atCheckIn: boolean;
  afterCheckIn: boolean;
  afterCheckInDays: number;
  beforeCheckOut: boolean;
  beforeCheckOutDays: number;
  atCheckOut: boolean;
  afterCheckOut: boolean;
  afterCheckOutDays: number;
}

export interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  body: string;
  senderName?: string;
  replyTo?: string;
  triggers: EmailTemplateTriggers;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyItem {
  id: string;
  roomTypeId: string; // 'all' or roomType.id
  roomTypeName: string; // 'All Room Types' or roomType.name
  rateTypeId: string; // 'all' or rateType.id
  rateTypeName: string; // 'All Rate Types' or rateType.name
  content: string;
  policyType?: 'cancellation' | 'deposit' | 'general' | 'no-show';
  createdAt: string;
  updatedAt: string;
}

export interface GuestCategoryItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  description: string;
  isHighlight: boolean;
  highlightIcon?: 'star' | 'warning' | 'verified' | 'favorite' | 'flag' | 'none';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// GENERAL SETTINGS TYPES
// ==========================================

export type GeneralSettingsTab =
  | 'rental'
  | 'feature'
  | 'night-audits'
  | 'localization'
  | 'display'
  | 'folios'
  | 'credit-cards'
  | 'emails'
  | 'guest-mandatory-data';

export interface RentalSettings {
  checkInTime: string;
  checkOutTime: string;
  minStayNights: number;
  maxStayNights: number;
  earlyCheckInGraceMinutes: number;
  lateCheckOutGraceMinutes: number;
  earlyCheckInChargeType: 'free' | 'hourly' | 'fixed' | 'full_day';
  earlyCheckInAmount: number;
  lateCheckOutChargeType: 'free' | 'hourly' | 'fixed' | 'full_day';
  lateCheckOutAmount: number;
  defaultBookingMode: 'daily' | 'hourly' | 'weekly' | 'monthly';
  autoRoomAssignment: boolean;
  allowOverbooking: boolean;
  overbookingThresholdPercent: number;
  dayUseAllowed: boolean;
  dayUseRatePercent: number;
  // Checkout & Balance fields
  autoCheckoutAtEndStay: boolean;
  restrictCheckoutOutstandingBalance: boolean;
  autoApplyDefaultDiscounts: boolean;
  // Room Status Transitions
  postCheckoutRoomStatus: 'dirty' | 'inspection' | 'ooo' | 'clean';
  postMaintenanceRoomStatus: 'clean' | 'dirty' | 'inspection';
  // No-show Policies
  autoCancelNoShows: boolean;
  noShowCancellationTime: string;
  noShowFeeApplication: 'none' | 'first_night' | 'full_stay';
  // Overbooking fields
  overbookingNotificationTrigger: 'none' | 'manager' | 'all';
}

export interface FeatureSettings {
  // Core Features
  enableGroupBooking: boolean;
  enableMultiCurrency: boolean;
  enableMultiRoomSelection: boolean;
  enableDeposits: boolean;
  enableExpressCheckInOut: boolean;
  enableRateThreshold: boolean;
  enablePosInterface: boolean;

  // Default Values
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  defaultRateType: 'bar' | 'corp' | 'walk';
  defaultStayDays: number;

  // Advanced Operational Modules
  enableHousekeeping: boolean;
  enableMaintenance: boolean;
  enableKeycardIntegration: boolean;
  keycardProvider: 'assa_abloy' | 'salto' | 'dormakaba' | 'generic';
  enableMinibarBilling: boolean;
  enableSelfCheckInKiosk: boolean;
  enableChannelManagerSync: boolean;
  enableLostAndFound: boolean;
  enablePackageHandling: boolean;
  enableBanquetAndEvents: boolean;
  enableSpaAndWellness: boolean;
  enableLoyaltyProgram: boolean;
}

export interface NightAuditSettings {
  // Primary Audit Configuration
  auditClockTime: string;
  promptBehavior: 'manual' | 'auto' | 'notify';
  autoRoomStatusChange: boolean;

  // Report Automation
  globalDistributionList: string[];
  automatedReports: {
    dailySummary: boolean;
    taxReport: boolean;
    collectionReport: boolean;
    ledgerReport: boolean;
    forecastReport: boolean;
    guestInHouse: boolean;
    arrivalDepartureList: boolean;
    noShowReport: boolean;
  };

  // Legacy & Advanced Operations
  autoAuditEnabled?: boolean;
  auditScheduleTime?: string;
  autoPostRoomAndTax?: boolean;
  autoProcessNoShows?: boolean;
  noShowCutoffTime?: string;
  noShowBillingPolicy?: 'charge_first_night' | 'charge_full' | 'forfeit_deposit' | 'no_charge';
  autoRolloverBusinessDate?: boolean;
  requirePinForManualAudit?: boolean;
  emailEodReports?: boolean;
  eodReportRecipients?: string;
  generateTrialBalance?: boolean;
  lockTransactionsAfterAudit?: boolean;
}

export interface LocalizationSettings {
  // Region & Currency
  country: string;
  currency: string;
  currencySymbol: string;
  secondaryCurrencyEnabled?: boolean;
  secondaryCurrency?: string;

  // Formatting & Display
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: 'in' | 'us' | 'eu';
  timezone?: string;
  language?: string;
  decimalSeparator?: '.' | ',';
  thousandsSeparator?: ',' | '.' | ' ';
  firstDayOfWeek?: 'sunday' | 'monday';

  // Custom Field Labels
  customLabels: {
    stateField: string;
    zipField: string;
    roomTerminology: string;
    rateTerminology: string;
    guestTitles: string;
  };

  // Fiscal Timeline
  fiscalStartDate: string;
  fiscalEndDate: string;

  // Weekend Days
  weekendDays: string[];
}

export interface DisplaySettings {
  // Record Visibility
  showDeletedRecords?: boolean;

  // Visual Indicators
  highContrastBadges?: boolean;
  statusRowHighlighting?: boolean;
  statusIndicatorStyle?: 'Solid' | 'Bordered' | 'Text-only';

  // Guest Display
  guestNameCasing?: 'Sentence Case (John Doe)' | 'ALL CAPS (JOHN DOE)' | 'Proper Case (John Doe)';

  // Printing & Reports
  defaultPrintLayout?: 'Standard Layout' | 'Compact Layout' | 'Extended Layout';
  includePropertyLogoOnReports?: boolean;
  enablePageNumberingPdf?: boolean;

  // Lifecycle Messages
  checkInWelcomeMessage?: string;
  checkOutThankYouMessage?: string;
  noShowNotificationFooter?: string;

  // Document Storage
  documentStorageTarget?: 'Internal Cloud' | 'Amazon S3' | 'Google Cloud Storage';
  storagePathPrefix?: string;

  // Room Grid & UI Defaults
  gridDefaultView?: 'day' | '3day' | '7day' | '14day' | '30day';
  gridCellDensity?: 'compact' | 'normal' | 'spacious';
  roomSorting?: 'building_floor' | 'room_type' | 'room_number';
  showGuestNameOnGrid?: boolean;
  showRoomStatusIcon?: boolean;
  showChannelBadge?: boolean;
  showRateOnCard?: boolean;
  themeMode?: 'light' | 'dark' | 'system';
  accentColor?: string;
}

export interface FolioNumberingItem {
  id: string;
  documentType: string;
  type: 'Automatic' | 'Manual';
  prefix: string;
  startValue: number;
  currentValue: number;
  icon: string;
}

export interface FoliosSettings {
  // Numbering series
  numberingSeries?: FolioNumberingItem[];

  // Action settings
  printOnCheckout?: boolean;
  emailOnGeneration?: boolean;
  printReceiptsAutomatically?: boolean;
  ccCorporateOnInvoice?: boolean;

  // Existing/Legacy fields
  invoicePrefix?: string;
  receiptPrefix?: string;
  nextInvoiceNumber?: number;
  taxIdNumber?: string;
  showTaxBreakdown?: boolean;
  autoCloseZeroBalanceFolios?: boolean;
  allowNegativePostings?: boolean;
  requireSupervisorPinForRefunds?: boolean;
  defaultSplitFolioRouting?: 'single' | 'room_tax_split' | 'separate_incidentals';
  invoiceDisclaimer?: string;
  includePropertyLogo?: boolean;
}

export interface CreditCardsSettings {
  enableGatewayProcessing?: boolean;
  enableTokenization?: boolean;
  pgApiKey?: string;
  merchantId?: string;
  preAuthAtCheckIn?: boolean;
  preAuthPercentage?: number;
  gdsCrmRouting?: boolean;
  defaultChargeMethod?: 'auth_capture' | 'auth_only' | 'manual';
  nightAuditAutoRelease?: boolean;
  nightAuditAutoRefund?: boolean;
  nightAuditAutoCollection?: boolean;

  // Legacy/supporting properties
  gatewayProvider?: 'stripe' | 'adyen' | 'shift4' | 'authorize_net' | 'manual';
  preAuthCalculation?: 'room_plus_fixed' | 'percentage' | 'first_night';
  preAuthIncidentalsPerNight?: number;
  autoReleasePreAuthOnCheckout?: boolean;
  requireCvvForManualEntry?: boolean;
  acceptedCards?: {
    visa: boolean;
    mastercard: boolean;
    amex: boolean;
    discover: boolean;
    jcb: boolean;
    diners: boolean;
  };
  surchargeEnabled?: boolean;
  amexSurchargePercent?: number;
}

export interface EmailsSettings {
  // SMTP Configuration
  smtpServer?: string;
  smtpPort?: number;
  domain?: string;
  enableSslTls?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpStatus?: 'connected' | 'failed' | 'testing';

  // Sender & Recipients
  fromAddress?: string;
  replyToAddress?: string;
  fromName?: string;
  defaultAdminRecipient?: string;
  globalBccAddress?: string;

  // Legacy / supporting properties
  senderName?: string;
  senderEmail?: string;
  replyToEmail?: string;
  smtpHost?: string;
  smtpEncryption?: 'tls' | 'ssl' | 'none';
  ccFrontDesk?: boolean;
  frontDeskInbox?: string;
  autoSendBookingConfirmation?: boolean;
  autoSendPreArrivalEmail?: boolean;
  preArrivalHoursBefore?: number;
  autoSendDepartureInvoice?: boolean;
  autoSendCancellationNotice?: boolean;
  autoSendPaymentReceipt?: boolean;
}

export interface FieldRequirementConfig {
  id: string;
  label: string;
  category?: 'personal' | 'contact' | 'identification' | 'address' | 'other' | string;
  enabled?: boolean;
  required: boolean;
  locked?: boolean; // e.g. First & Last Name always locked as required
  hint?: string;
  description?: string;
}

export interface GuestMandatoryDataSettings {
  fields: FieldRequirementConfig[];
}

export interface GeneralSettingsState {
  rental: RentalSettings;
  feature: FeatureSettings;
  nightAudits: NightAuditSettings;
  localization: LocalizationSettings;
  display: DisplaySettings;
  folios: FoliosSettings;
  creditCards: CreditCardsSettings;
  emails: EmailsSettings;
  guestMandatoryData: GuestMandatoryDataSettings;
}

// Device Configuration Types
export interface PaymentTerminalDevice {
  id: string;
  terminalId?: string;
  name: string;
  gatewayProvider?: string;
  location?: string;
  locationId?: string;
  model?: string;
  serialNumber: string;
  ipAddress: string;
  port: number;
  readerId?: string;
  networkType?: 'router' | 'wifi' | 'lan';
  status: 'Online' | 'Offline' | 'Busy';
  batteryLevel?: number;
  lastPing?: string;
}

export interface PaymentGatewayConfig {
  provider: 'stripe' | 'adyen' | 'clover' | 'worldpay' | 'square' | 'pax' | 'verifone' | 'authorize_net';
  environment: 'production' | 'sandbox';
  apiKey: string;
  merchantId: string;
  terminalTimeoutSeconds: number;
  autoPreAuthAtCheckin: boolean;
  preAuthAmountType: 'fixed' | 'percentage';
  preAuthFixedAmount: number;
  preAuthPercentage: number;
  autoCaptureAtCheckout: boolean;
  allowManualKeyIn: boolean;
  requireSupervisorPinForRefund: boolean;
  terminals: PaymentTerminalDevice[];
}

export interface KeycardEncoderDevice {
  id: string;
  name: string;
  station: string;
  encoderType: 'usb' | 'tcp_ip';
  ipAddress?: string;
  port?: number;
  status: 'Online' | 'Offline' | 'Standby';
  firmwareVersion?: string;
}

export interface DoorlockTerminalDevice {
  id: string;
  name: string;
  doorlockId: string;
  ipAddress: string;
  port: number;
  macAddress?: string;
  status: 'Online' | 'Offline' | 'Standby';
  lastPing?: string;
}

export interface DoorlockSystemItem {
  id: string;
  doorlockId: string; // e.g. "DL-001"
  name: string;
  keyCards: number;
  status: 'Active' | 'Inactive' | 'Fault';
  terminals: DoorlockTerminalDevice[];
}

export interface DoorlockConfig {
  provider: 'assa_abloy' | 'salto' | 'dormakaba' | 'onity' | 'hotek' | 'generic_tcp';
  serverAddress: string;
  serverPort: number;
  systemOperatorId: string;
  siteCode: string;
  apiToken: string;
  defaultKeyExpiryTime: string;
  invalidateOldKeyOnNewCheckin: boolean;
  allowDuplicateGuestKeys: boolean;
  enableMobileKeyBle: boolean;
  commonAreas: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
  encoders: KeycardEncoderDevice[];
  doorlockSystems?: DoorlockSystemItem[];
}

export interface ScannerDevice {
  id: string;
  name: string;
  station: string;
  model: string;
  connectionType: 'USB' | 'WebSocket' | 'Network';
  status: 'Online' | 'Offline' | 'Ready';
  lastUsed?: string;
  ipAddress?: string;
  port?: number;
}

export interface ScannerConfig {
  provider: 'regula' | 'plustek' | 'honeywell' | 'zebra' | 'camera_ocr';
  driverPort: number;
  autoFillGuestProfile: boolean;
  autoCropGuestPhoto: boolean;
  autoSaveDocumentImages: boolean;
  verifyAuthenticityUv: boolean;
  alertOnExpiredDocument: boolean;
  enableFastCheckinQr: boolean;
  beepOnScan: boolean;
  scanners: ScannerDevice[];
}

export interface DeviceConfigurationState {
  paymentGateway: PaymentGatewayConfig;
  doorlock: DoorlockConfig;
  scanner: ScannerConfig;
}

export interface CrsTaxExemptMapping {
  id: string;
  engineName: string; // e.g. 'Expedia' | 'Booking.com' | 'Direct Web' | 'Agoda' | 'Trip.com'
  marketSource: string; // e.g. 'Mobile App' | 'B2B' | 'Social Media' | 'GDS' | 'Corporate' | 'Wholesaler'
  taxName: string; // e.g. 'City Tax' | 'Service Charge' | 'VAT' | 'Stay Tax'
  status: 'Active' | 'Inactive';
  createdAt?: string;
  notes?: string;
}





