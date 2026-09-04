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
  autoCheckoutAtEndStay: boolean;
  restrictCheckoutOutstandingBalance: boolean;
  autoApplyDefaultDiscounts: boolean;
  postCheckoutRoomStatus: 'dirty' | 'inspection' | 'ooo' | 'clean';
  postMaintenanceRoomStatus: 'clean' | 'dirty' | 'inspection';
  autoCancelNoShows: boolean;
  noShowCancellationTime: string;
  noShowFeeApplication: 'none' | 'first_night' | 'full_stay';
  overbookingNotificationTrigger: 'none' | 'manager' | 'all';
}

export interface FeatureSettings {
  enableGroupBooking: boolean;
  enableMultiCurrency: boolean;
  enableMultiRoomSelection: boolean;
  enableDeposits: boolean;
  enableExpressCheckInOut: boolean;
  enableRateThreshold: boolean;
  enablePosInterface: boolean;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  defaultRateType: 'bar' | 'corp' | 'walk';
  defaultStayDays: number;
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
  auditClockTime: string;
  promptBehavior: 'manual' | 'auto' | 'notify';
  autoRoomStatusChange: boolean;
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
  country: string;
  currency: string;
  currencySymbol: string;
  secondaryCurrencyEnabled?: boolean;
  secondaryCurrency?: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: 'in' | 'us' | 'eu';
  timezone?: string;
  language?: string;
  decimalSeparator?: '.' | ',';
  thousandsSeparator?: ',' | '.' | ' ';
  firstDayOfWeek?: 'sunday' | 'monday';
  customLabels: {
    stateField: string;
    zipField: string;
    roomTerminology: string;
    rateTerminology: string;
    guestTitles: string;
  };
  fiscalStartDate: string;
  fiscalEndDate: string;
  weekendDays: string[];
}

export interface DisplaySettings {
  showDeletedRecords?: boolean;
  highContrastBadges?: boolean;
  statusRowHighlighting?: boolean;
  statusIndicatorStyle?: 'Solid' | 'Bordered' | 'Text-only';
  guestNameCasing?: 'Sentence Case (John Doe)' | 'ALL CAPS (JOHN DOE)' | 'Proper Case (John Doe)';
  defaultPrintLayout?: 'Standard Layout' | 'Compact Layout' | 'Extended Layout';
  includePropertyLogoOnReports?: boolean;
  enablePageNumberingPdf?: boolean;
  checkInWelcomeMessage?: string;
  checkOutThankYouMessage?: string;
  noShowNotificationFooter?: string;
  documentStorageTarget?: 'Internal Cloud' | 'Amazon S3' | 'Google Cloud Storage';
  storagePathPrefix?: string;
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
  numberingSeries?: FolioNumberingItem[];
  printOnCheckout?: boolean;
  emailOnGeneration?: boolean;
  printReceiptsAutomatically?: boolean;
  ccCorporateOnInvoice?: boolean;
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
  smtpServer?: string;
  smtpPort?: number;
  domain?: string;
  enableSslTls?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpStatus?: 'connected' | 'failed' | 'testing';
  fromAddress?: string;
  replyToAddress?: string;
  fromName?: string;
  defaultAdminRecipient?: string;
  globalBccAddress?: string;
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
  locked?: boolean;
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
  doorlockId: string;
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
  engineName: string;
  marketSource: string;
  taxName: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  notes?: string;
}
