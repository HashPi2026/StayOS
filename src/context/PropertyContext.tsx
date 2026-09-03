import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Building,
  Floor,
  NavigationPath,
  PropertyData,
  Room,
  RoomType,
  RoomStatusConfig,
  TaxItem,
  TaxSlab,
  RateTypeItem,
  DocumentTypeItem,
  OtherChargeCategoryItem,
  OtherChargeItem,
  MeasurementUnitItem,
  PaymentTypeItem,
  ExchangeRateItem,
  Amenity,
  AuditLog,
  NotificationItem,
  RoleItem,
  UserAccountItem,
  EmailTemplateItem,
  PolicyItem,
  GuestCategoryItem,
  GeneralSettingsState,
  GeneralSettingsTab,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_BUILDINGS,
  INITIAL_FLOORS,
  INITIAL_ROOM_TYPES,
  INITIAL_ROOMS,
  INITIAL_ROOM_STATUSES,
  INITIAL_TAXES,
  INITIAL_RATE_TYPES,
  INITIAL_DOCUMENT_TYPES,
  INITIAL_OTHER_CHARGE_CATEGORIES,
  INITIAL_OTHER_CHARGES,
  INITIAL_MEASUREMENT_UNITS,
  INITIAL_PAYMENT_TYPES,
  INITIAL_EXCHANGE_RATES,
  INITIAL_AMENITIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_POLICIES,
  INITIAL_GUEST_CATEGORIES,
} from '../data/mockData';
import { INITIAL_GENERAL_SETTINGS } from '../data/generalSettingsData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface PropertyContextType {
  // Navigation
  activePath: NavigationPath;
  selectedBuildingId: string | null;
  selectedRoomTypeId: string | null;
  navigate: (path: NavigationPath, entityId?: string | null) => void;

  // Property Master
  properties: PropertyData[];
  currentProperty: PropertyData;
  switchProperty: (propertyId: string) => void;
  propertyForm: PropertyData;
  updatePropertyField: (section: 'identity' | 'location' | 'contact', field: string, value: any) => void;
  hasPropertyUnsavedChanges: boolean;
  savePropertyMaster: () => void;
  discardPropertyMasterChanges: () => void;

  // Buildings
  buildings: Building[];
  addBuilding: (building: Omit<Building, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'totalRooms' | 'hasActiveRooms'>) => boolean;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  deleteBuilding: (id: string) => boolean;
  isBuildingNameUnique: (name: string, excludeId?: string) => boolean;

  // Building Drawer
  isDrawerOpen: boolean;
  drawerBuilding: Building | null;
  openAddDrawer: () => void;
  openEditDrawer: (building: Building) => void;
  closeDrawer: () => void;

  // Building Delete Dialog
  isDeleteDialogOpen: boolean;
  deleteTargetBuilding: Building | null;
  openDeleteDialog: (building: Building) => void;
  closeDeleteDialog: () => void;

  // Floors
  floors: Floor[];
  addFloor: (data: Omit<Floor, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateFloor: (id: string, updates: Partial<Floor>) => boolean;
  deleteFloor: (id: string) => boolean;
  isFloorNameUnique: (name: string, buildingId: string, excludeId?: string) => boolean;

  // Floor Drawer & Delete Dialog
  isFloorDrawerOpen: boolean;
  drawerFloor: Floor | null;
  drawerDefaultBuildingId?: string;
  openAddFloorDrawer: (defaultBuildingId?: string) => void;
  openEditFloorDrawer: (floor: Floor) => void;
  closeFloorDrawer: () => void;
  isDeleteFloorDialogOpen: boolean;
  deleteTargetFloor: Floor | null;
  openDeleteFloorDialog: (floor: Floor) => void;
  closeDeleteFloorDialog: () => void;

  // Room Types
  roomTypes: RoomType[];
  addRoomType: (data: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateRoomType: (id: string, updates: Partial<RoomType>) => boolean;
  deleteRoomType: (id: string) => boolean;
  duplicateRoomType: (id: string) => boolean;
  isRoomTypeNameUnique: (name: string, excludeId?: string) => boolean;
  isRoomTypeCodeUnique: (code: string, excludeId?: string) => boolean;

  // Room Type Drawer & Dialogs
  isRoomTypeDrawerOpen: boolean;
  drawerRoomType: RoomType | null;
  openAddRoomTypeDrawer: () => void;
  openEditRoomTypeDrawer: (rt: RoomType) => void;
  closeRoomTypeDrawer: () => void;
  isDeleteRoomTypeDialogOpen: boolean;
  deleteTargetRoomType: RoomType | null;
  openDeleteRoomTypeDialog: (rt: RoomType) => void;
  closeDeleteRoomTypeDialog: () => void;

  // Room Statuses (Room Status Master)
  roomStatuses: RoomStatusConfig[];
  addRoomStatus: (data: Omit<RoomStatusConfig, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateRoomStatus: (id: string, updates: Partial<RoomStatusConfig>) => boolean;
  deleteRoomStatus: (id: string) => boolean;
  isRoomStatusNameUnique: (name: string, excludeId?: string) => boolean;
  isRoomStatusCodeUnique: (code: string, excludeId?: string) => boolean;
  isRoomStatusDrawerOpen: boolean;
  drawerRoomStatus: RoomStatusConfig | null;
  openAddRoomStatusDrawer: () => void;
  openEditRoomStatusDrawer: (status: RoomStatusConfig) => void;
  closeRoomStatusDrawer: () => void;
  isDeleteRoomStatusDialogOpen: boolean;
  deleteTargetRoomStatus: RoomStatusConfig | null;
  openDeleteRoomStatusDialog: (status: RoomStatusConfig) => void;
  closeDeleteRoomStatusDialog: () => void;

  // Rooms
  rooms: Room[];
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  addRoom: (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  bulkAddRooms: (roomsData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>[]) => boolean;
  updateRoom: (id: string, updates: Partial<Room>) => boolean;
  deleteRoom: (id: string) => boolean;
  isRoomNameUnique: (name: string, excludeId?: string) => boolean;
  isRoomShortNameUnique: (shortName: string, excludeId?: string) => boolean;
  isDeleteRoomDialogOpen: boolean;
  deleteTargetRoom: Room | null;
  openDeleteRoomDialog: (room: Room) => void;
  closeDeleteRoomDialog: () => void;

  // Verify Pin Modal
  isVerifyPinOpen: boolean;
  setVerifyPinOpen: (open: boolean) => void;

  // Taxes
  taxes: TaxItem[];
  selectedTaxId: string | null;
  setSelectedTaxId: (id: string | null) => void;
  addTax: (data: Omit<TaxItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateTax: (id: string, updates: Partial<TaxItem>) => boolean;
  deleteTax: (id: string) => boolean;
  isTaxDrawerOpen: boolean;
  drawerTax: TaxItem | null;
  openAddTaxDrawer: () => void;
  openEditTaxDrawer: (tax: TaxItem) => void;
  closeTaxDrawer: () => void;
  isTaxRuleDrawerOpen: boolean;
  drawerTaxRule: TaxItem | null;
  openAddTaxRuleDrawer: () => void;
  openEditTaxRuleDrawer: (tax: TaxItem) => void;
  closeTaxRuleDrawer: () => void;
  isDeleteTaxDialogOpen: boolean;
  deleteTargetTax: TaxItem | null;
  openDeleteTaxDialog: (tax: TaxItem) => void;
  closeDeleteTaxDialog: () => void;
  isTaxConfigDrawerOpen: boolean;
  configTargetTax: TaxItem | null;
  openTaxConfigDrawer: (tax: TaxItem) => void;
  closeTaxConfigDrawer: () => void;

  // Rate Types (Rates & Packages)
  rateTypes: RateTypeItem[];
  addRateType: (data: Omit<RateTypeItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateRateType: (id: string, updates: Partial<RateTypeItem>) => boolean;
  deleteRateType: (id: string) => boolean;
  isRateTypeDrawerOpen: boolean;
  drawerRateType: RateTypeItem | null;
  openAddRateTypeDrawer: () => void;
  openEditRateTypeDrawer: (rateType: RateTypeItem) => void;
  closeRateTypeDrawer: () => void;
  isDeleteRateTypeDialogOpen: boolean;
  deleteTargetRateType: RateTypeItem | null;
  openDeleteRateTypeDialog: (rateType: RateTypeItem) => void;
  closeDeleteRateTypeDialog: () => void;

  // Policies (Configuration)
  policies: PolicyItem[];
  editingPolicyId: string | null;
  setEditingPolicyId: (id: string | null) => void;
  addPolicy: (data: Omit<PolicyItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updatePolicy: (id: string, updates: Partial<PolicyItem>) => boolean;
  deletePolicy: (id: string) => boolean;
  isPolicyDrawerOpen: boolean;
  drawerPolicy: PolicyItem | null;
  openAddPolicyDrawer: () => void;
  openEditPolicyDrawer: (policy: PolicyItem) => void;
  closePolicyDrawer: () => void;
  isDeletePolicyDialogOpen: boolean;
  deleteTargetPolicy: PolicyItem | null;
  openDeletePolicyDialog: (policy: PolicyItem) => void;
  closeDeletePolicyDialog: () => void;

  // Guest Categories (Configuration)
  guestCategories: GuestCategoryItem[];
  editingGuestCategoryId: string | null;
  setEditingGuestCategoryId: (id: string | null) => void;
  addGuestCategory: (data: Omit<GuestCategoryItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateGuestCategory: (id: string, updates: Partial<GuestCategoryItem>) => boolean;
  deleteGuestCategory: (id: string) => boolean;
  toggleGuestCategoryStatus: (id: string) => boolean;
  isGuestCategoryDrawerOpen: boolean;
  drawerGuestCategory: GuestCategoryItem | null;
  openAddGuestCategoryDrawer: () => void;
  openEditGuestCategoryDrawer: (category: GuestCategoryItem) => void;
  closeGuestCategoryDrawer: () => void;
  isDeleteGuestCategoryDialogOpen: boolean;
  deleteTargetGuestCategory: GuestCategoryItem | null;
  openDeleteGuestCategoryDialog: (category: GuestCategoryItem) => void;
  closeDeleteGuestCategoryDialog: () => void;

  // Document Types
  documentTypes: DocumentTypeItem[];
  editingDocumentTypeId: string | null;
  setEditingDocumentTypeId: (id: string | null) => void;
  addDocumentType: (data: Omit<DocumentTypeItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateDocumentType: (id: string, updates: Partial<DocumentTypeItem>) => boolean;
  deleteDocumentType: (id: string) => boolean;
  toggleDocumentTypeStatus: (id: string) => boolean;
  setDefaultDocumentType: (id: string) => boolean;
  isDocumentTypeDrawerOpen: boolean;
  drawerDocumentType: DocumentTypeItem | null;
  openAddDocumentTypeDrawer: () => void;
  openEditDocumentTypeDrawer: (docType: DocumentTypeItem) => void;
  closeDocumentTypeDrawer: () => void;
  isDeleteDocumentTypeDialogOpen: boolean;
  deleteTargetDocumentType: DocumentTypeItem | null;
  openDeleteDocumentTypeDialog: (docType: DocumentTypeItem) => void;
  closeDeleteDocumentTypeDialog: () => void;

  // Other Charges Categories
  otherChargeCategories: OtherChargeCategoryItem[];
  editingOtherChargeCategoryId: string | null;
  setEditingOtherChargeCategoryId: (id: string | null) => void;
  addOtherChargeCategory: (data: Omit<OtherChargeCategoryItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateOtherChargeCategory: (id: string, updates: Partial<OtherChargeCategoryItem>) => boolean;
  deleteOtherChargeCategory: (id: string) => boolean;
  setDefaultOtherChargeCategory: (id: string) => boolean;
  isOtherChargeCategoryDrawerOpen: boolean;
  drawerOtherChargeCategory: OtherChargeCategoryItem | null;
  openAddOtherChargeCategoryDrawer: () => void;
  openEditOtherChargeCategoryDrawer: (category: OtherChargeCategoryItem) => void;
  closeOtherChargeCategoryDrawer: () => void;
  isDeleteOtherChargeCategoryDialogOpen: boolean;
  deleteTargetOtherChargeCategory: OtherChargeCategoryItem | null;
  openDeleteOtherChargeCategoryDialog: (category: OtherChargeCategoryItem) => void;
  closeDeleteOtherChargeCategoryDialog: () => void;

  // Other Charges (Configuration)
  otherCharges: OtherChargeItem[];
  editingOtherChargeId: string | null;
  setEditingOtherChargeId: (id: string | null) => void;
  addOtherCharge: (data: Omit<OtherChargeItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateOtherCharge: (id: string, updates: Partial<OtherChargeItem>) => boolean;
  deleteOtherCharge: (id: string) => boolean;
  isOtherChargeDrawerOpen: boolean;
  drawerOtherCharge: OtherChargeItem | null;
  openAddOtherChargeDrawer: () => void;
  openEditOtherChargeDrawer: (charge: OtherChargeItem) => void;
  closeOtherChargeDrawer: () => void;
  isDeleteOtherChargeDialogOpen: boolean;
  deleteTargetOtherCharge: OtherChargeItem | null;
  openDeleteOtherChargeDialog: (charge: OtherChargeItem) => void;
  closeDeleteOtherChargeDialog: () => void;

  // Measurement Units (Configuration)
  measurementUnits: MeasurementUnitItem[];
  editingMeasurementUnitId: string | null;
  setEditingMeasurementUnitId: (id: string | null) => void;
  addMeasurementUnit: (data: Omit<MeasurementUnitItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateMeasurementUnit: (id: string, updates: Partial<MeasurementUnitItem>) => boolean;
  deleteMeasurementUnit: (id: string) => boolean;
  isMeasurementUnitNameUnique: (name: string, excludeId?: string) => boolean;
  isMeasurementUnitShortNameUnique: (shortName: string, excludeId?: string) => boolean;
  isMeasurementUnitDrawerOpen: boolean;
  drawerMeasurementUnit: MeasurementUnitItem | null;
  openAddMeasurementUnitDrawer: () => void;
  openEditMeasurementUnitDrawer: (unit: MeasurementUnitItem) => void;
  closeMeasurementUnitDrawer: () => void;
  isDeleteMeasurementUnitDialogOpen: boolean;
  deleteTargetMeasurementUnit: MeasurementUnitItem | null;
  openDeleteMeasurementUnitDialog: (unit: MeasurementUnitItem) => void;
  closeDeleteMeasurementUnitDialog: () => void;

  // Payment Types (Configuration)
  paymentTypes: PaymentTypeItem[];
  editingPaymentTypeId: string | null;
  setEditingPaymentTypeId: (id: string | null) => void;
  addPaymentType: (data: Omit<PaymentTypeItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updatePaymentType: (id: string, updates: Partial<PaymentTypeItem>) => boolean;
  deletePaymentType: (id: string) => boolean;
  bulkDeletePaymentTypes: (ids: string[]) => boolean;
  togglePaymentTypeStatus: (id: string) => void;
  isPaymentTypeNameUnique: (name: string, excludeId?: string) => boolean;
  isPaymentTypeShortNameUnique: (shortName: string, excludeId?: string) => boolean;
  isPaymentTypeDrawerOpen: boolean;
  drawerPaymentType: PaymentTypeItem | null;
  openAddPaymentTypeDrawer: () => void;
  openEditPaymentTypeDrawer: (paymentType: PaymentTypeItem) => void;
  closePaymentTypeDrawer: () => void;
  isDeletePaymentTypeDialogOpen: boolean;
  deleteTargetPaymentType: PaymentTypeItem | null;
  openDeletePaymentTypeDialog: (paymentType: PaymentTypeItem) => void;
  closeDeletePaymentTypeDialog: () => void;

  // Exchange Rates (Configuration)
  exchangeRates: ExchangeRateItem[];
  editingExchangeRateId: string | null;
  setEditingExchangeRateId: (id: string | null) => void;
  addExchangeRate: (data: Omit<ExchangeRateItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateExchangeRate: (id: string, updates: Partial<ExchangeRateItem>) => boolean;
  deleteExchangeRate: (id: string) => boolean;
  setBaseExchangeRate: (id: string) => boolean;
  isCountryExchangeRateUnique: (country: string, excludeId?: string) => boolean;
  isExchangeRateDrawerOpen: boolean;
  drawerExchangeRate: ExchangeRateItem | null;
  openAddExchangeRateDrawer: () => void;
  openEditExchangeRateDrawer: (exchangeRate: ExchangeRateItem) => void;
  closeExchangeRateDrawer: () => void;
  isDeleteExchangeRateDialogOpen: boolean;
  deleteTargetExchangeRate: ExchangeRateItem | null;
  openDeleteExchangeRateDialog: (exchangeRate: ExchangeRateItem) => void;
  closeDeleteExchangeRateDialog: () => void;

  // Roles & Privileges (Configuration / User Management)
  roles: RoleItem[];
  editingRoleId: string | null;
  setEditingRoleId: (id: string | null) => void;
  addRole: (data: Omit<RoleItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateRole: (id: string, updates: Partial<RoleItem>) => boolean;
  deleteRole: (id: string) => boolean;
  bulkDeleteRoles: (ids: string[]) => boolean;
  isRoleNameUnique: (name: string, excludeId?: string) => boolean;
  isRoleCodeUnique: (code: string, excludeId?: string) => boolean;
  isRoleDrawerOpen: boolean;
  drawerRole: RoleItem | null;
  openAddRoleDrawer: () => void;
  openEditRoleDrawer: (role: RoleItem) => void;
  closeRoleDrawer: () => void;
  isDeleteRoleDialogOpen: boolean;
  deleteTargetRole: RoleItem | null;
  openDeleteRoleDialog: (role: RoleItem) => void;
  closeDeleteRoleDialog: () => void;

  // Users & Permissions (Settings / User Management)
  users: UserAccountItem[];
  editingUserId: string | null;
  setEditingUserId: (id: string | null) => void;
  addUser: (data: Omit<UserAccountItem, 'id' | 'createdAt'>) => boolean;
  updateUser: (id: string, updates: Partial<UserAccountItem>) => boolean;
  deleteUser: (id: string) => boolean;
  toggleUserStatus: (id: string) => void;
  isInviteUserModalOpen: boolean;
  drawerUser: UserAccountItem | null;
  openInviteUserModal: (user?: UserAccountItem) => void;
  closeInviteUserModal: () => void;

  // Email Templates (Configuration / Communications)
  emailTemplates: EmailTemplateItem[];
  editingEmailTemplateId: string | null;
  setEditingEmailTemplateId: (id: string | null) => void;
  addEmailTemplate: (data: Omit<EmailTemplateItem, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplateItem>) => boolean;
  deleteEmailTemplate: (id: string) => boolean;
  duplicateEmailTemplate: (id: string) => boolean;
  toggleEmailTemplateStatus: (id: string) => boolean;
  isEmailTemplateDrawerOpen: boolean;
  drawerEmailTemplate: EmailTemplateItem | null;
  openAddEmailTemplateDrawer: () => void;
  openEditEmailTemplateDrawer: (template: EmailTemplateItem) => void;
  closeEmailTemplateDrawer: () => void;
  isDeleteEmailTemplateDialogOpen: boolean;
  deleteTargetEmailTemplate: EmailTemplateItem | null;
  openDeleteEmailTemplateDialog: (template: EmailTemplateItem) => void;
  closeDeleteEmailTemplateDialog: () => void;

  // Search Modal
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // General Settings (Settings Menu)
  generalSettings: GeneralSettingsState;
  activeGeneralSettingsTab: GeneralSettingsTab;
  setActiveGeneralSettingsTab: (tab: GeneralSettingsTab) => void;
  updateGeneralSettingsSection: <K extends keyof GeneralSettingsState>(
    section: K,
    updates: Partial<GeneralSettingsState[K]>
  ) => void;
  updateGuestMandatoryField: (
    fieldId: string,
    updates: { enabled?: boolean; required?: boolean }
  ) => void;
  resetGeneralSettingsSection: (section: keyof GeneralSettingsState) => void;
  saveGeneralSettings: () => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Secondary Data
  amenities: Amenity[];
  auditLogs: AuditLog[];
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activePath, setActivePath] = useState<NavigationPath>('overview');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);

  // Property Data State
  const [properties, setProperties] = useState<PropertyData[]>(() => {
    const saved = localStorage.getItem('stayos_properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });
  const [currentPropertyId, setCurrentPropertyId] = useState<string>('prop-grand-plaza');
  const currentProperty = properties.find((p) => p.id === currentPropertyId) || properties[0];

  // Property Master Form State
  const [propertyForm, setPropertyForm] = useState<PropertyData>(currentProperty);
  const [hasPropertyUnsavedChanges, setHasPropertyUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    setPropertyForm(currentProperty);
    setHasPropertyUnsavedChanges(false);
  }, [currentPropertyId]);

  // Buildings State
  const [buildings, setBuildings] = useState<Building[]>(() => {
    const saved = localStorage.getItem('stayos_buildings');
    return saved ? JSON.parse(saved) : INITIAL_BUILDINGS;
  });

  // Floors State
  const [floors, setFloors] = useState<Floor[]>(() => {
    const saved = localStorage.getItem('stayos_floors');
    return saved ? JSON.parse(saved) : INITIAL_FLOORS;
  });

  // Room Types State
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(() => {
    const saved = localStorage.getItem('stayos_room_types');
    return saved ? JSON.parse(saved) : INITIAL_ROOM_TYPES;
  });

  // Secondary Data
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('stayos_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isDeleteRoomDialogOpen, setIsDeleteRoomDialogOpen] = useState(false);
  const [deleteTargetRoom, setDeleteTargetRoom] = useState<Room | null>(null);
  const [amenities] = useState<Amenity[]>(INITIAL_AMENITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // UI Drawers / Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerBuilding, setDrawerBuilding] = useState<Building | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetBuilding, setDeleteTargetBuilding] = useState<Building | null>(null);

  // Floor UI State
  const [isFloorDrawerOpen, setIsFloorDrawerOpen] = useState(false);
  const [drawerFloor, setDrawerFloor] = useState<Floor | null>(null);
  const [drawerDefaultBuildingId, setDrawerDefaultBuildingId] = useState<string>('');
  const [isDeleteFloorDialogOpen, setIsDeleteFloorDialogOpen] = useState(false);
  const [deleteTargetFloor, setDeleteTargetFloor] = useState<Floor | null>(null);

  // Room Type UI State
  const [isRoomTypeDrawerOpen, setIsRoomTypeDrawerOpen] = useState(false);
  const [drawerRoomType, setDrawerRoomType] = useState<RoomType | null>(null);
  const [isDeleteRoomTypeDialogOpen, setIsDeleteRoomTypeDialogOpen] = useState(false);
  const [deleteTargetRoomType, setDeleteTargetRoomType] = useState<RoomType | null>(null);

  // Room Statuses State
  const [roomStatuses, setRoomStatuses] = useState<RoomStatusConfig[]>(() => {
    const saved = localStorage.getItem('stayos_room_statuses');
    return saved ? JSON.parse(saved) : INITIAL_ROOM_STATUSES;
  });
  const [isRoomStatusDrawerOpen, setIsRoomStatusDrawerOpen] = useState(false);
  const [drawerRoomStatus, setDrawerRoomStatus] = useState<RoomStatusConfig | null>(null);
  const [isDeleteRoomStatusDialogOpen, setIsDeleteRoomStatusDialogOpen] = useState(false);
  const [deleteTargetRoomStatus, setDeleteTargetRoomStatus] = useState<RoomStatusConfig | null>(null);

  // Taxes State
  const [taxes, setTaxes] = useState<TaxItem[]>(() => {
    const saved = localStorage.getItem('stayos_taxes');
    return saved ? JSON.parse(saved) : INITIAL_TAXES;
  });
  const [selectedTaxId, setSelectedTaxId] = useState<string | null>(null);
  const [isTaxDrawerOpen, setIsTaxDrawerOpen] = useState(false);
  const [drawerTax, setDrawerTax] = useState<TaxItem | null>(null);
  const [isTaxRuleDrawerOpen, setIsTaxRuleDrawerOpen] = useState(false);
  const [drawerTaxRule, setDrawerTaxRule] = useState<TaxItem | null>(null);
  const [isDeleteTaxDialogOpen, setIsDeleteTaxDialogOpen] = useState(false);
  const [deleteTargetTax, setDeleteTargetTax] = useState<TaxItem | null>(null);
  const [isTaxConfigDrawerOpen, setIsTaxConfigDrawerOpen] = useState(false);
  const [configTargetTax, setConfigTargetTax] = useState<TaxItem | null>(null);

  // Rate Types State
  const [rateTypes, setRateTypes] = useState<RateTypeItem[]>(() => {
    const saved = localStorage.getItem('stayos_rate_types');
    return saved ? JSON.parse(saved) : INITIAL_RATE_TYPES;
  });
  const [isRateTypeDrawerOpen, setIsRateTypeDrawerOpen] = useState(false);
  const [drawerRateType, setDrawerRateType] = useState<RateTypeItem | null>(null);
  const [isDeleteRateTypeDialogOpen, setIsDeleteRateTypeDialogOpen] = useState(false);
  const [deleteTargetRateType, setDeleteTargetRateType] = useState<RateTypeItem | null>(null);

  // Policies State
  const [policies, setPolicies] = useState<PolicyItem[]>(() => {
    const saved = localStorage.getItem('stayos_policies');
    return saved ? JSON.parse(saved) : INITIAL_POLICIES;
  });
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [isPolicyDrawerOpen, setIsPolicyDrawerOpen] = useState(false);
  const [drawerPolicy, setDrawerPolicy] = useState<PolicyItem | null>(null);
  const [isDeletePolicyDialogOpen, setIsDeletePolicyDialogOpen] = useState(false);
  const [deleteTargetPolicy, setDeleteTargetPolicy] = useState<PolicyItem | null>(null);

  // Guest Categories State
  const [guestCategories, setGuestCategories] = useState<GuestCategoryItem[]>(() => {
    const saved = localStorage.getItem('stayos_guest_categories');
    return saved ? JSON.parse(saved) : INITIAL_GUEST_CATEGORIES;
  });
  const [editingGuestCategoryId, setEditingGuestCategoryId] = useState<string | null>(null);
  const [isGuestCategoryDrawerOpen, setIsGuestCategoryDrawerOpen] = useState(false);
  const [drawerGuestCategory, setDrawerGuestCategory] = useState<GuestCategoryItem | null>(null);
  const [isDeleteGuestCategoryDialogOpen, setIsDeleteGuestCategoryDialogOpen] = useState(false);
  const [deleteTargetGuestCategory, setDeleteTargetGuestCategory] = useState<GuestCategoryItem | null>(null);

  // Document Types State
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>(() => {
    const saved = localStorage.getItem('stayos_document_types');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENT_TYPES;
  });
  const [editingDocumentTypeId, setEditingDocumentTypeId] = useState<string | null>(null);
  const [isDocumentTypeDrawerOpen, setIsDocumentTypeDrawerOpen] = useState(false);
  const [drawerDocumentType, setDrawerDocumentType] = useState<DocumentTypeItem | null>(null);
  const [isDeleteDocumentTypeDialogOpen, setIsDeleteDocumentTypeDialogOpen] = useState(false);
  const [deleteTargetDocumentType, setDeleteTargetDocumentType] = useState<DocumentTypeItem | null>(null);

  // Other Charges Categories State
  const [otherChargeCategories, setOtherChargeCategories] = useState<OtherChargeCategoryItem[]>(() => {
    const saved = localStorage.getItem('stayos_other_charge_categories');
    return saved ? JSON.parse(saved) : INITIAL_OTHER_CHARGE_CATEGORIES;
  });
  const [editingOtherChargeCategoryId, setEditingOtherChargeCategoryId] = useState<string | null>(null);
  const [isOtherChargeCategoryDrawerOpen, setIsOtherChargeCategoryDrawerOpen] = useState(false);
  const [drawerOtherChargeCategory, setDrawerOtherChargeCategory] = useState<OtherChargeCategoryItem | null>(null);
  const [isDeleteOtherChargeCategoryDialogOpen, setIsDeleteOtherChargeCategoryDialogOpen] = useState(false);
  const [deleteTargetOtherChargeCategory, setDeleteTargetOtherChargeCategory] = useState<OtherChargeCategoryItem | null>(null);

  // Other Charges State
  const [otherCharges, setOtherCharges] = useState<OtherChargeItem[]>(() => {
    const saved = localStorage.getItem('stayos_other_charges');
    return saved ? JSON.parse(saved) : INITIAL_OTHER_CHARGES;
  });
  const [editingOtherChargeId, setEditingOtherChargeId] = useState<string | null>(null);
  const [isOtherChargeDrawerOpen, setIsOtherChargeDrawerOpen] = useState(false);
  const [drawerOtherCharge, setDrawerOtherCharge] = useState<OtherChargeItem | null>(null);
  const [isDeleteOtherChargeDialogOpen, setIsDeleteOtherChargeDialogOpen] = useState(false);
  const [deleteTargetOtherCharge, setDeleteTargetOtherCharge] = useState<OtherChargeItem | null>(null);

  // Measurement Units State
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitItem[]>(() => {
    const saved = localStorage.getItem('stayos_measurement_units');
    return saved ? JSON.parse(saved) : INITIAL_MEASUREMENT_UNITS;
  });
  const [editingMeasurementUnitId, setEditingMeasurementUnitId] = useState<string | null>(null);
  const [isMeasurementUnitDrawerOpen, setIsMeasurementUnitDrawerOpen] = useState(false);
  const [drawerMeasurementUnit, setDrawerMeasurementUnit] = useState<MeasurementUnitItem | null>(null);
  const [isDeleteMeasurementUnitDialogOpen, setIsDeleteMeasurementUnitDialogOpen] = useState(false);
  const [deleteTargetMeasurementUnit, setDeleteTargetMeasurementUnit] = useState<MeasurementUnitItem | null>(null);

  // Payment Types State
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeItem[]>(() => {
    const saved = localStorage.getItem('stayos_payment_types');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_TYPES;
  });
  const [editingPaymentTypeId, setEditingPaymentTypeId] = useState<string | null>(null);
  const [isPaymentTypeDrawerOpen, setIsPaymentTypeDrawerOpen] = useState(false);
  const [drawerPaymentType, setDrawerPaymentType] = useState<PaymentTypeItem | null>(null);
  const [isDeletePaymentTypeDialogOpen, setIsDeletePaymentTypeDialogOpen] = useState(false);
  const [deleteTargetPaymentType, setDeleteTargetPaymentType] = useState<PaymentTypeItem | null>(null);

  // Exchange Rates State
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateItem[]>(() => {
    const saved = localStorage.getItem('stayos_exchange_rates');
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_RATES;
  });
  const [editingExchangeRateId, setEditingExchangeRateId] = useState<string | null>(null);
  const [isExchangeRateDrawerOpen, setIsExchangeRateDrawerOpen] = useState(false);
  const [drawerExchangeRate, setDrawerExchangeRate] = useState<ExchangeRateItem | null>(null);
  const [isDeleteExchangeRateDialogOpen, setIsDeleteExchangeRateDialogOpen] = useState(false);
  const [deleteTargetExchangeRate, setDeleteTargetExchangeRate] = useState<ExchangeRateItem | null>(null);

  // Roles & Privileges State
  const [roles, setRoles] = useState<RoleItem[]>(() => {
    const saved = localStorage.getItem('stayos_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [drawerRole, setDrawerRole] = useState<RoleItem | null>(null);
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false);
  const [deleteTargetRole, setDeleteTargetRole] = useState<RoleItem | null>(null);

  // Users & Permissions State
  const [users, setUsers] = useState<UserAccountItem[]>(() => {
    const saved = localStorage.getItem('stayos_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserAccountItem | null>(null);

  // Email Templates State
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateItem[]>(() => {
    const saved = localStorage.getItem('stayos_email_templates');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
  });
  const [editingEmailTemplateId, setEditingEmailTemplateId] = useState<string | null>(null);
  const [isEmailTemplateDrawerOpen, setIsEmailTemplateDrawerOpen] = useState(false);
  const [drawerEmailTemplate, setDrawerEmailTemplate] = useState<EmailTemplateItem | null>(null);
  const [isDeleteEmailTemplateDialogOpen, setIsDeleteEmailTemplateDialogOpen] = useState(false);
  const [deleteTargetEmailTemplate, setDeleteTargetEmailTemplate] = useState<EmailTemplateItem | null>(null);

  const [isVerifyPinOpen, setVerifyPinOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsState>(() => {
    const saved = localStorage.getItem('stayos_general_settings');
    if (!saved) return INITIAL_GENERAL_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_GENERAL_SETTINGS,
        ...parsed,
        rental: { ...INITIAL_GENERAL_SETTINGS.rental, ...(parsed.rental || {}) },
        feature: { ...INITIAL_GENERAL_SETTINGS.feature, ...(parsed.feature || {}) },
        nightAudits: {
          ...INITIAL_GENERAL_SETTINGS.nightAudits,
          ...(parsed.nightAudits || {}),
          automatedReports: {
            ...INITIAL_GENERAL_SETTINGS.nightAudits.automatedReports,
            ...(parsed.nightAudits?.automatedReports || {}),
          },
          globalDistributionList: parsed.nightAudits?.globalDistributionList || INITIAL_GENERAL_SETTINGS.nightAudits.globalDistributionList,
        },
        localization: {
          ...INITIAL_GENERAL_SETTINGS.localization,
          ...(parsed.localization || {}),
          customLabels: {
            ...INITIAL_GENERAL_SETTINGS.localization.customLabels,
            ...(parsed.localization?.customLabels || {}),
          },
          weekendDays: parsed.localization?.weekendDays || INITIAL_GENERAL_SETTINGS.localization.weekendDays,
        },
        display: { ...INITIAL_GENERAL_SETTINGS.display, ...(parsed.display || {}) },
        folios: {
          ...INITIAL_GENERAL_SETTINGS.folios,
          ...(parsed.folios || {}),
          numberingSeries: parsed.folios?.numberingSeries || INITIAL_GENERAL_SETTINGS.folios.numberingSeries,
        },
        creditCards: { ...INITIAL_GENERAL_SETTINGS.creditCards, ...(parsed.creditCards || {}) },
        emails: { ...INITIAL_GENERAL_SETTINGS.emails, ...(parsed.emails || {}) },
      };
    } catch {
      return INITIAL_GENERAL_SETTINGS;
    }
  });
  const [activeGeneralSettingsTab, setActiveGeneralSettingsTab] = useState<GeneralSettingsTab>('rental');

  const updateGeneralSettingsSection = <K extends keyof GeneralSettingsState>(
    section: K,
    updates: Partial<GeneralSettingsState[K]>
  ) => {
    setGeneralSettings((prev) => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          ...updates,
        },
      };
      localStorage.setItem('stayos_general_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const updateGuestMandatoryField = (
    fieldId: string,
    updates: { enabled?: boolean; required?: boolean }
  ) => {
    setGeneralSettings((prev) => {
      const updatedFields = prev.guestMandatoryData.fields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, ...updates };
        }
        return f;
      });
      const updated: GeneralSettingsState = {
        ...prev,
        guestMandatoryData: {
          ...prev.guestMandatoryData,
          fields: updatedFields,
        },
      };
      localStorage.setItem('stayos_general_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetGeneralSettingsSection = (section: keyof GeneralSettingsState) => {
    setGeneralSettings((prev) => {
      const updated: GeneralSettingsState = {
        ...prev,
        [section]: INITIAL_GENERAL_SETTINGS[section],
      };
      localStorage.setItem('stayos_general_settings', JSON.stringify(updated));
      return updated;
    });
    addToast(`Reset ${section} settings to factory defaults`, 'info');
  };

  const saveGeneralSettings = () => {
    localStorage.setItem('stayos_general_settings', JSON.stringify(generalSettings));
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'General Settings',
      details: `Updated ${activeGeneralSettingsTab.toUpperCase()} configuration parameters`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('General settings saved successfully', 'success');
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (path: NavigationPath, entityId: string | null = null) => {
    setActivePath(path);
    if (path === 'edit-building' || path === 'buildings') {
      setSelectedBuildingId(entityId);
    } else if (path === 'edit-room-type' || path === 'room-types') {
      setSelectedRoomTypeId(entityId);
    } else if (path === 'general-settings-rental') {
      setActiveGeneralSettingsTab('rental');
    } else if (path === 'general-settings-feature') {
      setActiveGeneralSettingsTab('feature');
    } else if (path === 'general-settings-night-audits') {
      setActiveGeneralSettingsTab('night-audits');
    } else if (path === 'general-settings-localization') {
      setActiveGeneralSettingsTab('localization');
    } else if (path === 'general-settings-display') {
      setActiveGeneralSettingsTab('display');
    } else if (path === 'general-settings-folios') {
      setActiveGeneralSettingsTab('folios');
    } else if (path === 'general-settings-credit-cards') {
      setActiveGeneralSettingsTab('credit-cards');
    } else if (path === 'general-settings-emails') {
      setActiveGeneralSettingsTab('emails');
    } else if (path === 'general-settings-guest-mandatory-data') {
      setActiveGeneralSettingsTab('guest-mandatory-data');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchProperty = (propertyId: string) => {
    setCurrentPropertyId(propertyId);
    const target = properties.find((p) => p.id === propertyId);
    if (target) {
      addToast(`Switched property to ${target.identity.name}`, 'info');
    }
  };

  const updatePropertyField = (section: 'identity' | 'location' | 'contact', field: string, value: any) => {
    setPropertyForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasPropertyUnsavedChanges(true);
  };

  const savePropertyMaster = () => {
    const updatedProperties = properties.map((p) => (p.id === propertyForm.id ? propertyForm : p));
    setProperties(updatedProperties);
    localStorage.setItem('stayos_properties', JSON.stringify(updatedProperties));
    setHasPropertyUnsavedChanges(false);

    // Add audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Property Master',
      details: `Updated ${propertyForm.identity.name} settings and location data`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast('Property Master details saved successfully', 'success');
  };

  const discardPropertyMasterChanges = () => {
    setPropertyForm(currentProperty);
    setHasPropertyUnsavedChanges(false);
    addToast('Unsaved changes discarded', 'info');
  };

  const isBuildingNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !buildings.some(
      (b) => b.name.trim().toLowerCase() === trimmed && (!excludeId || b.id !== excludeId)
    );
  };

  const addBuilding = (data: Omit<Building, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'totalRooms' | 'hasActiveRooms'>): boolean => {
    if (!isBuildingNameUnique(data.name)) {
      addToast(`A building with name "${data.name}" already exists`, 'error');
      return false;
    }

    const nextIndex = buildings.length + 1;
    const code = `BLD-${String(nextIndex).padStart(3, '0')}`;
    const newBuilding: Building = {
      id: `bld-${Date.now()}`,
      code,
      name: data.name.trim(),
      description: data.description.trim(),
      status: data.status,
      totalFloors: data.totalFloors || 1,
      totalRooms: 0,
      hasActiveRooms: false,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      updatedBy: {
        name: 'Jane Smith',
        initials: 'JS',
      },
    };

    const updated = [newBuilding, ...buildings];
    setBuildings(updated);
    localStorage.setItem('stayos_buildings', JSON.stringify(updated));

    // Audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Buildings',
      details: `Created new building "${newBuilding.name}" (${newBuilding.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Building "${newBuilding.name}" created successfully`, 'success');
    return true;
  };

  const updateBuilding = (id: string, updates: Partial<Building>) => {
    const updated = buildings.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          ...updates,
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          updatedBy: {
            name: 'Jane Smith',
            initials: 'JS',
          },
        };
      }
      return b;
    });

    setBuildings(updated);
    localStorage.setItem('stayos_buildings', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Buildings',
      details: `Updated building details for ID ${id}`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast('Building updated successfully', 'success');
  };

  const deleteBuilding = (id: string): boolean => {
    const target = buildings.find((b) => b.id === id);
    if (!target) return false;

    // Check deletion protection
    if (target.hasActiveRooms || target.totalRooms > 0) {
      openDeleteDialog(target);
      return false;
    }

    const updated = buildings.filter((b) => b.id !== id);
    setBuildings(updated);
    localStorage.setItem('stayos_buildings', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'DELETE',
      module: 'Buildings',
      details: `Deleted building "${target.name}" (${target.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Building "${target.name}" deleted`, 'info');
    return true;
  };

  // Floors CRUD
  const isFloorNameUnique = (name: string, buildingId: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !floors.some(
      (f) => f.buildingId === buildingId && f.name.trim().toLowerCase() === trimmed && (!excludeId || f.id !== excludeId)
    );
  };

  const addFloor = (data: Omit<Floor, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isFloorNameUnique(data.name, data.buildingId)) {
      const bld = buildings.find((b) => b.id === data.buildingId);
      addToast(`A floor named "${data.name}" already exists in ${bld?.name || 'this building'}`, 'error');
      return false;
    }

    const targetBuilding = buildings.find((b) => b.id === data.buildingId);
    const newFloor: Floor = {
      ...data,
      id: `flr-${Date.now()}`,
      buildingName: targetBuilding ? targetBuilding.name : data.buildingName,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newFloor, ...floors];
    setFloors(updated);
    localStorage.setItem('stayos_floors', JSON.stringify(updated));

    // Update building totalFloors count if applicable
    if (targetBuilding) {
      const buildingFloorsCount = updated.filter((f) => f.buildingId === targetBuilding.id).length;
      updateBuilding(targetBuilding.id, { totalFloors: buildingFloorsCount });
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Floors',
      details: `Added floor "${newFloor.name}" to building "${newFloor.buildingName}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Floor "${newFloor.name}" added successfully`, 'success');
    return true;
  };

  const updateFloor = (id: string, updates: Partial<Floor>): boolean => {
    const existing = floors.find((f) => f.id === id);
    if (!existing) return false;

    const buildingId = updates.buildingId || existing.buildingId;
    const name = updates.name || existing.name;

    if (updates.name && !isFloorNameUnique(name, buildingId, id)) {
      const bld = buildings.find((b) => b.id === buildingId);
      addToast(`A floor named "${name}" already exists in ${bld?.name || 'this building'}`, 'error');
      return false;
    }

    const targetBuilding = buildings.find((b) => b.id === buildingId);
    const updated = floors.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          ...updates,
          buildingName: targetBuilding ? targetBuilding.name : (updates.buildingName || f.buildingName),
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
      }
      return f;
    });

    setFloors(updated);
    localStorage.setItem('stayos_floors', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Floors',
      details: `Updated floor details for "${name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast('Floor updated successfully', 'success');
    return true;
  };

  const deleteFloor = (id: string): boolean => {
    const target = floors.find((f) => f.id === id);
    if (!target) return false;

    // Active room check
    const hasRooms = rooms.some(
      (r) => r.buildingId === target.buildingId && (r.floor === target.floorNumber || target.name.toLowerCase().includes(String(r.floor)))
    );

    if (hasRooms) {
      openDeleteFloorDialog(target);
      return false;
    }

    const filtered = floors.filter((f) => f.id !== id);
    setFloors(filtered);
    localStorage.setItem('stayos_floors', JSON.stringify(filtered));

    // Update building floors count
    const bld = buildings.find((b) => b.id === target.buildingId);
    if (bld) {
      const bldCount = filtered.filter((f) => f.buildingId === bld.id).length;
      updateBuilding(bld.id, { totalFloors: bldCount });
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'DELETE',
      module: 'Floors',
      details: `Deleted floor "${target.name}" from building "${target.buildingName}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Floor "${target.name}" deleted`, 'info');
    return true;
  };

  const openAddFloorDrawer = (defaultBuildingId?: string) => {
    setDrawerFloor(null);
    setDrawerDefaultBuildingId(defaultBuildingId || '');
    setIsFloorDrawerOpen(true);
  };

  const openEditFloorDrawer = (floor: Floor) => {
    setDrawerFloor(floor);
    setDrawerDefaultBuildingId(floor.buildingId);
    setIsFloorDrawerOpen(true);
  };

  const closeFloorDrawer = () => {
    setIsFloorDrawerOpen(false);
    setDrawerFloor(null);
  };

  const openDeleteFloorDialog = (floor: Floor) => {
    setDeleteTargetFloor(floor);
    setIsDeleteFloorDialogOpen(true);
  };

  const closeDeleteFloorDialog = () => {
    setIsDeleteFloorDialogOpen(false);
    setDeleteTargetFloor(null);
  };

  // Room Types CRUD
  const isRoomTypeNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !roomTypes.some(
      (rt) => rt.name.trim().toLowerCase() === trimmed && (!excludeId || rt.id !== excludeId)
    );
  };

  const isRoomTypeCodeUnique = (code: string, excludeId?: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    return !roomTypes.some(
      (rt) => rt.code.trim().toUpperCase() === trimmed && (!excludeId || rt.id !== excludeId)
    );
  };

  const addRoomType = (data: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isRoomTypeNameUnique(data.name)) {
      addToast(`A room type with name "${data.name}" already exists`, 'error');
      return false;
    }
    if (!isRoomTypeCodeUnique(data.code)) {
      addToast(`A room type with code "${data.code}" already exists`, 'error');
      return false;
    }

    const newRoomType: RoomType = {
      ...data,
      id: `rt-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newRoomType, ...roomTypes];
    setRoomTypes(updated);
    localStorage.setItem('stayos_room_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Room Types',
      details: `Created new room type "${newRoomType.name}" (${newRoomType.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room Type "${newRoomType.name}" created successfully`, 'success');
    return true;
  };

  const updateRoomType = (id: string, updates: Partial<RoomType>): boolean => {
    if (updates.name && !isRoomTypeNameUnique(updates.name, id)) {
      addToast(`A room type with name "${updates.name}" already exists`, 'error');
      return false;
    }
    if (updates.code && !isRoomTypeCodeUnique(updates.code, id)) {
      addToast(`A room type with code "${updates.code}" already exists`, 'error');
      return false;
    }

    const updated = roomTypes.map((rt) => {
      if (rt.id === id) {
        return {
          ...rt,
          ...updates,
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
      }
      return rt;
    });

    setRoomTypes(updated);
    localStorage.setItem('stayos_room_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Room Types',
      details: `Updated room type details for ID ${id}`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast('Room type updated successfully', 'success');
    return true;
  };

  const deleteRoomType = (id: string): boolean => {
    const target = roomTypes.find((rt) => rt.id === id);
    if (!target) return false;

    // Check if any active rooms are assigned to this room type
    const assignedRooms = rooms.filter((r) => r.roomTypeId === id);
    if (assignedRooms.length > 0) {
      openDeleteRoomTypeDialog(target);
      return false;
    }

    const updated = roomTypes.filter((rt) => rt.id !== id);
    setRoomTypes(updated);
    localStorage.setItem('stayos_room_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'DELETE',
      module: 'Room Types',
      details: `Deleted room type "${target.name}" (${target.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room Type "${target.name}" deleted`, 'info');
    return true;
  };

  const duplicateRoomType = (id: string): boolean => {
    const source = roomTypes.find((rt) => rt.id === id);
    if (!source) return false;

    let copyName = `${source.name} (Copy)`;
    let copyCode = `${source.code}-CPY`;
    let counter = 1;
    while (!isRoomTypeNameUnique(copyName)) {
      counter++;
      copyName = `${source.name} (Copy ${counter})`;
      copyCode = `${source.code}-C${counter}`;
    }

    const duplicated: RoomType = {
      ...source,
      id: `rt-${Date.now()}`,
      name: copyName,
      code: copyCode.substring(0, 8),
      totalUnits: 0,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [duplicated, ...roomTypes];
    setRoomTypes(updated);
    localStorage.setItem('stayos_room_types', JSON.stringify(updated));

    addToast(`Duplicated into "${duplicated.name}"`, 'success');
    return true;
  };

  const openAddRoomTypeDrawer = () => {
    setDrawerRoomType(null);
    setIsRoomTypeDrawerOpen(true);
  };

  const openEditRoomTypeDrawer = (rt: RoomType) => {
    setDrawerRoomType(rt);
    setIsRoomTypeDrawerOpen(true);
  };

  const closeRoomTypeDrawer = () => {
    setIsRoomTypeDrawerOpen(false);
    setDrawerRoomType(null);
  };

  const openDeleteRoomTypeDialog = (rt: RoomType) => {
    setDeleteTargetRoomType(rt);
    setIsDeleteRoomTypeDialogOpen(true);
  };

  const closeDeleteRoomTypeDialog = () => {
    setIsDeleteRoomTypeDialogOpen(false);
    setDeleteTargetRoomType(null);
  };

  // Room Statuses CRUD
  const isRoomStatusNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !roomStatuses.some(
      (s) => s.name.trim().toLowerCase() === trimmed && (!excludeId || s.id !== excludeId)
    );
  };

  const isRoomStatusCodeUnique = (code: string, excludeId?: string): boolean => {
    const trimmed = code.trim().toLowerCase();
    return !roomStatuses.some(
      (s) => s.code.trim().toLowerCase() === trimmed && (!excludeId || s.id !== excludeId)
    );
  };

  const addRoomStatus = (data: Omit<RoomStatusConfig, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isRoomStatusNameUnique(data.name)) {
      addToast(`A room status named "${data.name}" already exists`, 'error');
      return false;
    }
    if (!isRoomStatusCodeUnique(data.code)) {
      addToast(`A room status with code "${data.code}" already exists`, 'error');
      return false;
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newStatus: RoomStatusConfig = {
      ...data,
      id: `rs-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = [...roomStatuses, newStatus];
    setRoomStatuses(updated);
    localStorage.setItem('stayos_room_statuses', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Room Status',
      details: `Created new room status "${newStatus.name}" (${newStatus.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room status "${newStatus.name}" created successfully`, 'success');
    return true;
  };

  const updateRoomStatus = (id: string, updates: Partial<RoomStatusConfig>): boolean => {
    const target = roomStatuses.find((s) => s.id === id);
    if (!target) return false;

    if (updates.name && !isRoomStatusNameUnique(updates.name, id)) {
      addToast(`A room status named "${updates.name}" already exists`, 'error');
      return false;
    }
    if (updates.code && !isRoomStatusCodeUnique(updates.code, id)) {
      addToast(`A room status with code "${updates.code}" already exists`, 'error');
      return false;
    }

    const updated = roomStatuses.map((s) =>
      s.id === id
        ? {
            ...s,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : s
    );

    setRoomStatuses(updated);
    localStorage.setItem('stayos_room_statuses', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Room Status',
      details: `Updated room status "${updates.name || target.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room status "${updates.name || target.name}" updated successfully`, 'success');
    return true;
  };

  const deleteRoomStatus = (id: string): boolean => {
    const target = roomStatuses.find((s) => s.id === id);
    if (!target) return false;

    const filtered = roomStatuses.filter((s) => s.id !== id);
    setRoomStatuses(filtered);
    localStorage.setItem('stayos_room_statuses', JSON.stringify(filtered));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'DELETE',
      module: 'Room Status',
      details: `Deleted room status "${target.name}" (${target.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room status "${target.name}" deleted`, 'info');
    return true;
  };

  const openAddRoomStatusDrawer = () => {
    setDrawerRoomStatus(null);
    setIsRoomStatusDrawerOpen(true);
  };

  const openEditRoomStatusDrawer = (status: RoomStatusConfig) => {
    setDrawerRoomStatus(status);
    setIsRoomStatusDrawerOpen(true);
  };

  const closeRoomStatusDrawer = () => {
    setIsRoomStatusDrawerOpen(false);
    setDrawerRoomStatus(null);
  };

  const openDeleteRoomStatusDialog = (status: RoomStatusConfig) => {
    setDeleteTargetRoomStatus(status);
    setIsDeleteRoomStatusDialogOpen(true);
  };

  const closeDeleteRoomStatusDialog = () => {
    setIsDeleteRoomStatusDialogOpen(false);
    setDeleteTargetRoomStatus(null);
  };

  // Taxes CRUD & Drawers
  const addTax = (data: Omit<TaxItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newTax: TaxItem = {
      ...data,
      id: `tax-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newTax, ...taxes];
    setTaxes(updated);
    localStorage.setItem('stayos_taxes', JSON.stringify(updated));

    // Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'CREATE',
      module: 'Taxes',
      details: `Created tax rule: ${newTax.name} (${newTax.taxType})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Tax "${newTax.name}" added successfully`, 'success');
    return true;
  };

  const updateTax = (id: string, updates: Partial<TaxItem>): boolean => {
    const updated = taxes.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : t
    );
    setTaxes(updated);
    localStorage.setItem('stayos_taxes', JSON.stringify(updated));

    const target = taxes.find((t) => t.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'UPDATE',
      module: 'Taxes',
      details: `Updated tax rule: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Tax updated successfully`, 'success');
    return true;
  };

  const deleteTax = (id: string): boolean => {
    const target = taxes.find((t) => t.id === id);
    const updated = taxes.filter((t) => t.id !== id);
    setTaxes(updated);
    localStorage.setItem('stayos_taxes', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'DELETE',
      module: 'Taxes',
      details: `Deleted tax rule: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Tax "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const openAddTaxDrawer = () => {
    setDrawerTax(null);
    setIsTaxDrawerOpen(true);
  };

  const openEditTaxDrawer = (tax: TaxItem) => {
    setDrawerTax(tax);
    setIsTaxDrawerOpen(true);
  };

  const closeTaxDrawer = () => {
    setIsTaxDrawerOpen(false);
    setDrawerTax(null);
  };

  const openAddTaxRuleDrawer = () => {
    setDrawerTaxRule(null);
    setIsTaxRuleDrawerOpen(true);
  };

  const openEditTaxRuleDrawer = (tax: TaxItem) => {
    setDrawerTaxRule(tax);
    setIsTaxRuleDrawerOpen(true);
  };

  const closeTaxRuleDrawer = () => {
    setIsTaxRuleDrawerOpen(false);
    setDrawerTaxRule(null);
  };

  const openDeleteTaxDialog = (tax: TaxItem) => {
    setDeleteTargetTax(tax);
    setIsDeleteTaxDialogOpen(true);
  };

  const closeDeleteTaxDialog = () => {
    setIsDeleteTaxDialogOpen(false);
    setDeleteTargetTax(null);
  };

  const openTaxConfigDrawer = (tax: TaxItem) => {
    setConfigTargetTax(tax);
    setIsTaxConfigDrawerOpen(true);
  };

  const closeTaxConfigDrawer = () => {
    setIsTaxConfigDrawerOpen(false);
    setConfigTargetTax(null);
  };

  // Rate Types CRUD & Drawers
  const addRateType = (data: Omit<RateTypeItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newRateType: RateTypeItem = {
      ...data,
      id: `rt-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newRateType, ...rateTypes];
    setRateTypes(updated);
    localStorage.setItem('stayos_rate_types', JSON.stringify(updated));

    // Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'CREATE',
      module: 'Rate Types',
      details: `Created rate type: ${newRateType.name} (${newRateType.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Rate Type "${newRateType.name}" added successfully`, 'success');
    return true;
  };

  const updateRateType = (id: string, updates: Partial<RateTypeItem>): boolean => {
    const updated = rateTypes.map((rt) =>
      rt.id === id
        ? {
            ...rt,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : rt
    );
    setRateTypes(updated);
    localStorage.setItem('stayos_rate_types', JSON.stringify(updated));

    const target = rateTypes.find((rt) => rt.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'UPDATE',
      module: 'Rate Types',
      details: `Updated rate type: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Rate Type updated successfully`, 'success');
    return true;
  };

  const deleteRateType = (id: string): boolean => {
    const target = rateTypes.find((rt) => rt.id === id);
    const updated = rateTypes.filter((rt) => rt.id !== id);
    setRateTypes(updated);
    localStorage.setItem('stayos_rate_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'DELETE',
      module: 'Rate Types',
      details: `Deleted rate type: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Rate Type "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const openAddRateTypeDrawer = () => {
    setDrawerRateType(null);
    setIsRateTypeDrawerOpen(true);
  };

  const openEditRateTypeDrawer = (rateType: RateTypeItem) => {
    setDrawerRateType(rateType);
    setIsRateTypeDrawerOpen(true);
  };

  const closeRateTypeDrawer = () => {
    setIsRateTypeDrawerOpen(false);
    setDrawerRateType(null);
  };

  const openDeleteRateTypeDialog = (rateType: RateTypeItem) => {
    setDeleteTargetRateType(rateType);
    setIsDeleteRateTypeDialogOpen(true);
  };

  const closeDeleteRateTypeDialog = () => {
    setIsDeleteRateTypeDialogOpen(false);
    setDeleteTargetRateType(null);
  };

  // Policies CRUD & Actions
  const addPolicy = (data: Omit<PolicyItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newPolicy: PolicyItem = {
      ...data,
      id: `pol-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = [newPolicy, ...policies];
    setPolicies(updated);
    localStorage.setItem('stayos_policies', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'CREATE',
      module: 'Policies',
      details: `Created policy for ${newPolicy.roomTypeName} - ${newPolicy.rateTypeName}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Policy for "${newPolicy.roomTypeName} (${newPolicy.rateTypeName})" added successfully`, 'success');
    return true;
  };

  const updatePolicy = (id: string, updates: Partial<PolicyItem>): boolean => {
    const target = policies.find((p) => p.id === id);
    if (!target) return false;

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const updated = policies.map((p) =>
      p.id === id
        ? {
            ...p,
            ...updates,
            updatedAt: nowStr,
          }
        : p
    );
    setPolicies(updated);
    localStorage.setItem('stayos_policies', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'UPDATE',
      module: 'Policies',
      details: `Updated policy: ${updates.roomTypeName || target.roomTypeName} - ${updates.rateTypeName || target.rateTypeName}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Policy updated successfully`, 'success');
    return true;
  };

  const deletePolicy = (id: string): boolean => {
    const target = policies.find((p) => p.id === id);
    if (!target) return false;

    const updated = policies.filter((p) => p.id !== id);
    setPolicies(updated);
    localStorage.setItem('stayos_policies', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'DELETE',
      module: 'Policies',
      details: `Deleted policy: ${target.roomTypeName} - ${target.rateTypeName}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Policy for "${target.roomTypeName}" deleted`, 'info');
    return true;
  };

  const openAddPolicyDrawer = () => {
    setDrawerPolicy(null);
    setEditingPolicyId(null);
    setIsPolicyDrawerOpen(true);
  };

  const openEditPolicyDrawer = (policy: PolicyItem) => {
    setDrawerPolicy(policy);
    setEditingPolicyId(policy.id);
    setIsPolicyDrawerOpen(true);
  };

  const closePolicyDrawer = () => {
    setIsPolicyDrawerOpen(false);
    setDrawerPolicy(null);
  };

  const openDeletePolicyDialog = (policy: PolicyItem) => {
    setDeleteTargetPolicy(policy);
    setIsDeletePolicyDialogOpen(true);
  };

  const closeDeletePolicyDialog = () => {
    setIsDeletePolicyDialogOpen(false);
    setDeleteTargetPolicy(null);
  };

  // Guest Categories CRUD & Actions
  const addGuestCategory = (data: Omit<GuestCategoryItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newCategory: GuestCategoryItem = {
      ...data,
      id: `gcat-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newCategory, ...guestCategories];
    setGuestCategories(updated);
    localStorage.setItem('stayos_guest_categories', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'CREATE',
      module: 'Guest Categories',
      details: `Added guest category: ${newCategory.name} (${newCategory.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Guest category "${newCategory.name}" created successfully`, 'success');
    return true;
  };

  const updateGuestCategory = (id: string, updates: Partial<GuestCategoryItem>): boolean => {
    const existing = guestCategories.find((c) => c.id === id);
    if (!existing) return false;

    const updatedCategory: GuestCategoryItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = guestCategories.map((c) => (c.id === id ? updatedCategory : c));
    setGuestCategories(updated);
    localStorage.setItem('stayos_guest_categories', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'UPDATE',
      module: 'Guest Categories',
      details: `Updated guest category: ${updatedCategory.name}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Guest category "${updatedCategory.name}" updated successfully`, 'success');
    return true;
  };

  const deleteGuestCategory = (id: string): boolean => {
    const target = guestCategories.find((c) => c.id === id);
    if (!target) return false;

    const updated = guestCategories.filter((c) => c.id !== id);
    setGuestCategories(updated);
    localStorage.setItem('stayos_guest_categories', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'DELETE',
      module: 'Guest Categories',
      details: `Deleted guest category: ${target.name} (${target.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Guest category "${target.name}" deleted`, 'info');
    return true;
  };

  const toggleGuestCategoryStatus = (id: string): boolean => {
    const target = guestCategories.find((c) => c.id === id);
    if (!target) return false;

    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    return updateGuestCategory(id, { status: newStatus });
  };

  const openAddGuestCategoryDrawer = () => {
    setDrawerGuestCategory(null);
    setEditingGuestCategoryId(null);
    setIsGuestCategoryDrawerOpen(true);
  };

  const openEditGuestCategoryDrawer = (category: GuestCategoryItem) => {
    setDrawerGuestCategory(category);
    setEditingGuestCategoryId(category.id);
    setIsGuestCategoryDrawerOpen(true);
  };

  const closeGuestCategoryDrawer = () => {
    setIsGuestCategoryDrawerOpen(false);
    setDrawerGuestCategory(null);
    setEditingGuestCategoryId(null);
  };

  const openDeleteGuestCategoryDialog = (category: GuestCategoryItem) => {
    setDeleteTargetGuestCategory(category);
    setIsDeleteGuestCategoryDialogOpen(true);
  };

  const closeDeleteGuestCategoryDialog = () => {
    setIsDeleteGuestCategoryDialogOpen(false);
    setDeleteTargetGuestCategory(null);
  };

  // Document Types CRUD & Actions
  const addDocumentType = (data: Omit<DocumentTypeItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newDocType: DocumentTypeItem = {
      ...data,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    let updatedList = [...documentTypes];
    // If set as default, clear default on all others
    if (newDocType.isDefault) {
      updatedList = updatedList.map((d) => ({ ...d, isDefault: false }));
    }

    const updated = [newDocType, ...updatedList];
    setDocumentTypes(updated);
    localStorage.setItem('stayos_document_types', JSON.stringify(updated));

    // Audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'CREATE',
      module: 'Document Types',
      details: `Created document type: ${newDocType.name} (${newDocType.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Document Type "${newDocType.name}" added successfully`, 'success');
    return true;
  };

  const updateDocumentType = (id: string, updates: Partial<DocumentTypeItem>): boolean => {
    let updatedList = [...documentTypes];
    
    // If marking as default, remove default from all others
    if (updates.isDefault) {
      updatedList = updatedList.map((d) => (d.id !== id ? { ...d, isDefault: false } : d));
    }

    const updated = updatedList.map((d) =>
      d.id === id
        ? {
            ...d,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : d
    );
    setDocumentTypes(updated);
    localStorage.setItem('stayos_document_types', JSON.stringify(updated));

    const target = documentTypes.find((d) => d.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'UPDATE',
      module: 'Document Types',
      details: `Updated document type: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Document Type updated successfully`, 'success');
    return true;
  };

  const deleteDocumentType = (id: string): boolean => {
    const target = documentTypes.find((d) => d.id === id);
    const updated = documentTypes.filter((d) => d.id !== id);
    setDocumentTypes(updated);
    localStorage.setItem('stayos_document_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'DELETE',
      module: 'Document Types',
      details: `Deleted document type: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Document Type "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const toggleDocumentTypeStatus = (id: string): boolean => {
    const target = documentTypes.find((d) => d.id === id);
    if (!target) return false;
    const newStatus = !target.isActive;
    return updateDocumentType(id, { isActive: newStatus });
  };

  const setDefaultDocumentType = (id: string): boolean => {
    const target = documentTypes.find((d) => d.id === id);
    if (!target) return false;
    return updateDocumentType(id, { isDefault: true, isActive: true });
  };

  const openAddDocumentTypeDrawer = () => {
    setDrawerDocumentType(null);
    setIsDocumentTypeDrawerOpen(true);
  };

  const openEditDocumentTypeDrawer = (docType: DocumentTypeItem) => {
    setDrawerDocumentType(docType);
    setIsDocumentTypeDrawerOpen(true);
  };

  const closeDocumentTypeDrawer = () => {
    setIsDocumentTypeDrawerOpen(false);
    setDrawerDocumentType(null);
  };

  const openDeleteDocumentTypeDialog = (docType: DocumentTypeItem) => {
    setDeleteTargetDocumentType(docType);
    setIsDeleteDocumentTypeDialogOpen(true);
  };

  const closeDeleteDocumentTypeDialog = () => {
    setIsDeleteDocumentTypeDialogOpen(false);
    setDeleteTargetDocumentType(null);
  };

  // Other Charges Categories CRUD & Actions
  const addOtherChargeCategory = (data: Omit<OtherChargeCategoryItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newCategory: OtherChargeCategoryItem = {
      ...data,
      id: `occ-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    let updatedList = [...otherChargeCategories];
    if (newCategory.isDefault) {
      updatedList = updatedList.map((c) => ({ ...c, isDefault: false }));
    }

    const updated = [newCategory, ...updatedList];
    setOtherChargeCategories(updated);
    localStorage.setItem('stayos_other_charge_categories', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'CREATE',
      module: 'Other Charges',
      details: `Created charge category: ${newCategory.name} (${newCategory.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Category "${newCategory.name}" added successfully`, 'success');
    return true;
  };

  const updateOtherChargeCategory = (id: string, updates: Partial<OtherChargeCategoryItem>): boolean => {
    let updatedList = [...otherChargeCategories];
    if (updates.isDefault) {
      updatedList = updatedList.map((c) => (c.id !== id ? { ...c, isDefault: false } : c));
    }

    const updated = updatedList.map((c) =>
      c.id === id
        ? {
            ...c,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : c
    );
    setOtherChargeCategories(updated);
    localStorage.setItem('stayos_other_charge_categories', JSON.stringify(updated));

    const target = otherChargeCategories.find((c) => c.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'UPDATE',
      module: 'Other Charges',
      details: `Updated charge category: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Category updated successfully`, 'success');
    return true;
  };

  const deleteOtherChargeCategory = (id: string): boolean => {
    const target = otherChargeCategories.find((c) => c.id === id);
    const updated = otherChargeCategories.filter((c) => c.id !== id);
    setOtherChargeCategories(updated);
    localStorage.setItem('stayos_other_charge_categories', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Property Admin',
      action: 'DELETE',
      module: 'Other Charges',
      details: `Deleted charge category: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Category "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const setDefaultOtherChargeCategory = (id: string): boolean => {
    const target = otherChargeCategories.find((c) => c.id === id);
    if (!target) return false;
    return updateOtherChargeCategory(id, { isDefault: true });
  };

  const openAddOtherChargeCategoryDrawer = () => {
    setDrawerOtherChargeCategory(null);
    setIsOtherChargeCategoryDrawerOpen(true);
  };

  const openEditOtherChargeCategoryDrawer = (category: OtherChargeCategoryItem) => {
    setDrawerOtherChargeCategory(category);
    setIsOtherChargeCategoryDrawerOpen(true);
  };

  const closeOtherChargeCategoryDrawer = () => {
    setIsOtherChargeCategoryDrawerOpen(false);
    setDrawerOtherChargeCategory(null);
  };

  const openDeleteOtherChargeCategoryDialog = (category: OtherChargeCategoryItem) => {
    setDeleteTargetOtherChargeCategory(category);
    setIsDeleteOtherChargeCategoryDialogOpen(true);
  };

  const closeDeleteOtherChargeCategoryDialog = () => {
    setIsDeleteOtherChargeCategoryDialogOpen(false);
    setDeleteTargetOtherChargeCategory(null);
  };

  // Other Charges (Configuration) CRUD & Actions
  const addOtherCharge = (data: Omit<OtherChargeItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newCharge: OtherChargeItem = {
      ...data,
      id: `oc-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newCharge, ...otherCharges];
    setOtherCharges(updated);
    localStorage.setItem('stayos_other_charges', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'CREATE',
      module: 'Other Charges',
      details: `Created charge: ${newCharge.name} (${newCharge.shortName}) in ${newCharge.category}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Charge "${newCharge.name}" created successfully`, 'success');
    return true;
  };

  const updateOtherCharge = (id: string, updates: Partial<OtherChargeItem>): boolean => {
    const updated = otherCharges.map((c) =>
      c.id === id
        ? {
            ...c,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : c
    );
    setOtherCharges(updated);
    localStorage.setItem('stayos_other_charges', JSON.stringify(updated));

    const target = otherCharges.find((c) => c.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'UPDATE',
      module: 'Other Charges',
      details: `Updated charge: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Charge updated successfully`, 'success');
    return true;
  };

  const deleteOtherCharge = (id: string): boolean => {
    const target = otherCharges.find((c) => c.id === id);
    const updated = otherCharges.filter((c) => c.id !== id);
    setOtherCharges(updated);
    localStorage.setItem('stayos_other_charges', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'DELETE',
      module: 'Other Charges',
      details: `Deleted charge: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Charge "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const openAddOtherChargeDrawer = () => {
    setDrawerOtherCharge(null);
    setIsOtherChargeDrawerOpen(true);
  };

  const openEditOtherChargeDrawer = (charge: OtherChargeItem) => {
    setDrawerOtherCharge(charge);
    setIsOtherChargeDrawerOpen(true);
  };

  const closeOtherChargeDrawer = () => {
    setIsOtherChargeDrawerOpen(false);
    setDrawerOtherCharge(null);
  };

  const openDeleteOtherChargeDialog = (charge: OtherChargeItem) => {
    setDeleteTargetOtherCharge(charge);
    setIsDeleteOtherChargeDialogOpen(true);
  };

  const closeDeleteOtherChargeDialog = () => {
    setIsDeleteOtherChargeDialogOpen(false);
    setDeleteTargetOtherCharge(null);
  };

  // Measurement Units (Configuration) CRUD & Actions
  const isMeasurementUnitNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !measurementUnits.some(
      (m) => m.name.trim().toLowerCase() === trimmed && (!excludeId || m.id !== excludeId)
    );
  };

  const isMeasurementUnitShortNameUnique = (shortName: string, excludeId?: string): boolean => {
    const trimmed = shortName.trim().toUpperCase();
    return !measurementUnits.some(
      (m) => m.shortName.trim().toUpperCase() === trimmed && (!excludeId || m.id !== excludeId)
    );
  };

  const addMeasurementUnit = (data: Omit<MeasurementUnitItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isMeasurementUnitNameUnique(data.name)) {
      addToast(`A measurement unit with name "${data.name}" already exists`, 'error');
      return false;
    }
    if (!isMeasurementUnitShortNameUnique(data.shortName)) {
      addToast(`A measurement unit with short name "${data.shortName}" already exists`, 'error');
      return false;
    }

    const newUnit: MeasurementUnitItem = {
      ...data,
      id: `mu-${Date.now()}`,
      shortName: data.shortName.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description?.trim() || '',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newUnit, ...measurementUnits];
    setMeasurementUnits(updated);
    localStorage.setItem('stayos_measurement_units', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'CREATE',
      module: 'Measurement Units',
      details: `Created measurement unit: ${newUnit.name} (${newUnit.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Measurement Unit "${newUnit.name}" added successfully`, 'success');
    return true;
  };

  const updateMeasurementUnit = (id: string, updates: Partial<MeasurementUnitItem>): boolean => {
    if (updates.name && !isMeasurementUnitNameUnique(updates.name, id)) {
      addToast(`A measurement unit with name "${updates.name}" already exists`, 'error');
      return false;
    }
    if (updates.shortName && !isMeasurementUnitShortNameUnique(updates.shortName, id)) {
      addToast(`A measurement unit with short name "${updates.shortName}" already exists`, 'error');
      return false;
    }

    const updated = measurementUnits.map((m) =>
      m.id === id
        ? {
            ...m,
            ...updates,
            shortName: updates.shortName ? updates.shortName.trim().toUpperCase() : m.shortName,
            name: updates.name ? updates.name.trim() : m.name,
            description: updates.description !== undefined ? updates.description.trim() : m.description,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : m
    );
    setMeasurementUnits(updated);
    localStorage.setItem('stayos_measurement_units', JSON.stringify(updated));

    const target = measurementUnits.find((m) => m.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'UPDATE',
      module: 'Measurement Units',
      details: `Updated measurement unit: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Measurement unit updated successfully`, 'success');
    return true;
  };

  const deleteMeasurementUnit = (id: string): boolean => {
    const target = measurementUnits.find((m) => m.id === id);
    const updated = measurementUnits.filter((m) => m.id !== id);
    setMeasurementUnits(updated);
    localStorage.setItem('stayos_measurement_units', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'DELETE',
      module: 'Measurement Units',
      details: `Deleted measurement unit: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Measurement unit "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const openAddMeasurementUnitDrawer = () => {
    setDrawerMeasurementUnit(null);
    setIsMeasurementUnitDrawerOpen(true);
  };

  const openEditMeasurementUnitDrawer = (unit: MeasurementUnitItem) => {
    setDrawerMeasurementUnit(unit);
    setIsMeasurementUnitDrawerOpen(true);
  };

  const closeMeasurementUnitDrawer = () => {
    setIsMeasurementUnitDrawerOpen(false);
    setDrawerMeasurementUnit(null);
  };

  const openDeleteMeasurementUnitDialog = (unit: MeasurementUnitItem) => {
    setDeleteTargetMeasurementUnit(unit);
    setIsDeleteMeasurementUnitDialogOpen(true);
  };

  const closeDeleteMeasurementUnitDialog = () => {
    setIsDeleteMeasurementUnitDialogOpen(false);
    setDeleteTargetMeasurementUnit(null);
  };

  // Payment Types (Configuration) CRUD & Actions
  const isPaymentTypeNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !paymentTypes.some(
      (p) => p.name.trim().toLowerCase() === trimmed && (!excludeId || p.id !== excludeId)
    );
  };

  const isPaymentTypeShortNameUnique = (shortName: string, excludeId?: string): boolean => {
    const trimmed = shortName.trim().toUpperCase();
    return !paymentTypes.some(
      (p) => p.shortName.trim().toUpperCase() === trimmed && (!excludeId || p.id !== excludeId)
    );
  };

  const addPaymentType = (data: Omit<PaymentTypeItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isPaymentTypeNameUnique(data.name)) {
      addToast(`A payment type with name "${data.name}" already exists`, 'error');
      return false;
    }
    if (!isPaymentTypeShortNameUnique(data.shortName)) {
      addToast(`A payment type with short name "${data.shortName}" already exists`, 'error');
      return false;
    }

    const newPaymentType: PaymentTypeItem = {
      ...data,
      id: `pt-${Date.now()}`,
      shortName: data.shortName.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description?.trim() || '',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newPaymentType, ...paymentTypes];
    setPaymentTypes(updated);
    localStorage.setItem('stayos_payment_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'CREATE',
      module: 'Payment Types',
      details: `Created payment type: ${newPaymentType.name} (${newPaymentType.shortName})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Payment type "${newPaymentType.name}" added successfully`, 'success');
    return true;
  };

  const updatePaymentType = (id: string, updates: Partial<PaymentTypeItem>): boolean => {
    if (updates.name && !isPaymentTypeNameUnique(updates.name, id)) {
      addToast(`A payment type with name "${updates.name}" already exists`, 'error');
      return false;
    }
    if (updates.shortName && !isPaymentTypeShortNameUnique(updates.shortName, id)) {
      addToast(`A payment type with short name "${updates.shortName}" already exists`, 'error');
      return false;
    }

    const updated = paymentTypes.map((p) =>
      p.id === id
        ? {
            ...p,
            ...updates,
            shortName: updates.shortName ? updates.shortName.trim().toUpperCase() : p.shortName,
            name: updates.name ? updates.name.trim() : p.name,
            description: updates.description !== undefined ? updates.description.trim() : p.description,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : p
    );
    setPaymentTypes(updated);
    localStorage.setItem('stayos_payment_types', JSON.stringify(updated));

    const target = paymentTypes.find((p) => p.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'UPDATE',
      module: 'Payment Types',
      details: `Updated payment type: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Payment type updated successfully`, 'success');
    return true;
  };

  const togglePaymentTypeStatus = (id: string) => {
    const target = paymentTypes.find((p) => p.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    updatePaymentType(id, { status: newStatus });
  };

  const deletePaymentType = (id: string): boolean => {
    const target = paymentTypes.find((p) => p.id === id);
    const updated = paymentTypes.filter((p) => p.id !== id);
    setPaymentTypes(updated);
    localStorage.setItem('stayos_payment_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'DELETE',
      module: 'Payment Types',
      details: `Deleted payment type: ${target?.name || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Payment type "${target?.name || 'Item'}" deleted`, 'info');
    return true;
  };

  const bulkDeletePaymentTypes = (ids: string[]): boolean => {
    const updated = paymentTypes.filter((p) => !ids.includes(p.id));
    setPaymentTypes(updated);
    localStorage.setItem('stayos_payment_types', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'DELETE',
      module: 'Payment Types',
      details: `Bulk deleted ${ids.length} payment types`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`${ids.length} payment types deleted`, 'info');
    return true;
  };

  const openAddPaymentTypeDrawer = () => {
    setDrawerPaymentType(null);
    setIsPaymentTypeDrawerOpen(true);
  };

  const openEditPaymentTypeDrawer = (paymentType: PaymentTypeItem) => {
    setDrawerPaymentType(paymentType);
    setIsPaymentTypeDrawerOpen(true);
  };

  const closePaymentTypeDrawer = () => {
    setIsPaymentTypeDrawerOpen(false);
    setDrawerPaymentType(null);
  };

  const openDeletePaymentTypeDialog = (paymentType: PaymentTypeItem) => {
    setDeleteTargetPaymentType(paymentType);
    setIsDeletePaymentTypeDialogOpen(true);
  };

  const closeDeletePaymentTypeDialog = () => {
    setIsDeletePaymentTypeDialogOpen(false);
    setDeleteTargetPaymentType(null);
  };

  // Exchange Rates CRUD
  const isCountryExchangeRateUnique = (country: string, excludeId?: string): boolean => {
    const trimmed = country.trim().toLowerCase();
    return !exchangeRates.some(
      (xr) => xr.country.trim().toLowerCase() === trimmed && (!excludeId || xr.id !== excludeId)
    );
  };

  const addExchangeRate = (data: Omit<ExchangeRateItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isCountryExchangeRateUnique(data.country)) {
      addToast(`An exchange rate for "${data.country}" already exists`, 'error');
      return false;
    }

    const isBase = Boolean(data.isBaseRate);
    const newRate: ExchangeRateItem = {
      ...data,
      id: `xr-${Date.now()}`,
      country: data.country.trim(),
      currency: data.currency.trim(),
      sign: data.sign.trim(),
      rate: isBase ? 1.0000 : Number(data.rate) || 1.0000,
      isBaseRate: isBase,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    let updated: ExchangeRateItem[];
    if (isBase) {
      updated = [newRate, ...exchangeRates.map((xr) => ({ ...xr, isBaseRate: false }))];
    } else {
      updated = [...exchangeRates, newRate];
    }

    setExchangeRates(updated);
    localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'CREATE',
      module: 'Exchange Rates',
      details: `Added exchange rate for ${newRate.country} (${newRate.currency}): ${newRate.rate}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Exchange rate for "${newRate.country}" added successfully`, 'success');
    return true;
  };

  const updateExchangeRate = (id: string, updates: Partial<ExchangeRateItem>): boolean => {
    if (updates.country && !isCountryExchangeRateUnique(updates.country, id)) {
      addToast(`An exchange rate for "${updates.country}" already exists`, 'error');
      return false;
    }

    const isBase = Boolean(updates.isBaseRate);

    const updated = exchangeRates.map((xr) => {
      if (xr.id === id) {
        return {
          ...xr,
          ...updates,
          country: updates.country !== undefined ? updates.country.trim() : xr.country,
          currency: updates.currency !== undefined ? updates.currency.trim() : xr.currency,
          sign: updates.sign !== undefined ? updates.sign.trim() : xr.sign,
          rate: isBase ? 1.0000 : updates.rate !== undefined ? Number(updates.rate) : xr.rate,
          isBaseRate: updates.isBaseRate !== undefined ? isBase : xr.isBaseRate,
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
      }
      if (isBase) {
        return { ...xr, isBaseRate: false };
      }
      return xr;
    });

    setExchangeRates(updated);
    localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));

    const target = exchangeRates.find((xr) => xr.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'UPDATE',
      module: 'Exchange Rates',
      details: `Updated exchange rate for ${target?.country || id}`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Exchange rate updated successfully`, 'success');
    return true;
  };

  const setBaseExchangeRate = (id: string): boolean => {
    const target = exchangeRates.find((xr) => xr.id === id);
    if (!target) return false;

    const updated = exchangeRates.map((xr) => ({
      ...xr,
      isBaseRate: xr.id === id,
      rate: xr.id === id ? 1.0000 : xr.rate,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    }));

    setExchangeRates(updated);
    localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'UPDATE',
      module: 'Exchange Rates',
      details: `Designated ${target.currency} (${target.country}) as Base Currency Rate`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`${target.currency} (${target.country}) is now designated as Base Rate`, 'success');
    return true;
  };

  const deleteExchangeRate = (id: string): boolean => {
    const target = exchangeRates.find((xr) => xr.id === id);
    if (!target) return false;

    if (target.isBaseRate) {
      addToast('Cannot delete the Base Rate currency. Please designate another base currency first.', 'error');
      return false;
    }

    const updated = exchangeRates.filter((xr) => xr.id !== id);
    setExchangeRates(updated);
    localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Alex Rivera',
      action: 'DELETE',
      module: 'Exchange Rates',
      details: `Deleted exchange rate for ${target.country} (${target.currency})`,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Exchange rate for "${target.country}" deleted`, 'info');
    return true;
  };

  const openAddExchangeRateDrawer = () => {
    setDrawerExchangeRate(null);
    setIsExchangeRateDrawerOpen(true);
  };

  const openEditExchangeRateDrawer = (exchangeRate: ExchangeRateItem) => {
    setDrawerExchangeRate(exchangeRate);
    setIsExchangeRateDrawerOpen(true);
  };

  const closeExchangeRateDrawer = () => {
    setIsExchangeRateDrawerOpen(false);
    setDrawerExchangeRate(null);
  };

  const openDeleteExchangeRateDialog = (exchangeRate: ExchangeRateItem) => {
    setDeleteTargetExchangeRate(exchangeRate);
    setIsDeleteExchangeRateDialogOpen(true);
  };

  const closeDeleteExchangeRateDialog = () => {
    setIsDeleteExchangeRateDialogOpen(false);
    setDeleteTargetExchangeRate(null);
  };

  // Roles & Privileges CRUD
  const isRoleNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !roles.some(
      (r) => r.name.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId)
    );
  };

  const isRoleCodeUnique = (code: string, excludeId?: string): boolean => {
    const trimmed = code.trim().toLowerCase();
    return !roles.some(
      (r) => r.code.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId)
    );
  };

  const addRole = (data: Omit<RoleItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isRoleNameUnique(data.name)) {
      addToast(`A role named "${data.name}" already exists`, 'error');
      return false;
    }
    if (!isRoleCodeUnique(data.code)) {
      addToast(`A role with code "${data.code}" already exists`, 'error');
      return false;
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newRole: RoleItem = {
      ...data,
      id: `role-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = [newRole, ...roles];
    setRoles(updated);
    localStorage.setItem('stayos_roles', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Roles & Privileges',
      details: `Created new role "${newRole.name}" (${newRole.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Role "${newRole.name}" successfully created`, 'success');
    return true;
  };

  const updateRole = (id: string, updates: Partial<RoleItem>): boolean => {
    const target = roles.find((r) => r.id === id);
    if (!target) return false;

    if (updates.name && !isRoleNameUnique(updates.name, id)) {
      addToast(`A role named "${updates.name}" already exists`, 'error');
      return false;
    }
    if (updates.code && !isRoleCodeUnique(updates.code, id)) {
      addToast(`A role with code "${updates.code}" already exists`, 'error');
      return false;
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const updated = roles.map((r) =>
      r.id === id
        ? {
            ...r,
            ...updates,
            updatedAt: nowStr,
          }
        : r
    );
    setRoles(updated);
    localStorage.setItem('stayos_roles', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Roles & Privileges',
      details: `Updated role "${updates.name || target.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Role "${updates.name || target.name}" updated`, 'success');
    return true;
  };

  const deleteRole = (id: string): boolean => {
    const target = roles.find((r) => r.id === id);
    if (!target) return false;

    if (target.isSystem) {
      addToast('Cannot delete system-critical role "System Administrator"', 'error');
      return false;
    }

    if (target.usersCount > 0) {
      addToast(`Cannot delete role "${target.name}" because it is currently assigned to ${target.usersCount} active users`, 'error');
      return false;
    }

    const filtered = roles.filter((r) => r.id !== id);
    setRoles(filtered);
    localStorage.setItem('stayos_roles', JSON.stringify(filtered));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Jane Smith (JS)',
      action: 'DELETE',
      module: 'Roles & Privileges',
      details: `Deleted role "${target.name}" (${target.code})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Role "${target.name}" deleted`, 'info');
    return true;
  };

  const bulkDeleteRoles = (ids: string[]): boolean => {
    const nonDeletable = roles.filter((r) => ids.includes(r.id) && (r.isSystem || r.usersCount > 0));
    if (nonDeletable.length > 0) {
      addToast(`Cannot delete system roles or roles with assigned users (${nonDeletable.map((r) => r.name).join(', ')})`, 'error');
      return false;
    }

    const filtered = roles.filter((r) => !ids.includes(r.id));
    setRoles(filtered);
    localStorage.setItem('stayos_roles', JSON.stringify(filtered));
    addToast(`Deleted ${ids.length} roles`, 'info');
    return true;
  };

  const openAddRoleDrawer = () => {
    setDrawerRole(null);
    setIsRoleDrawerOpen(true);
  };

  const openEditRoleDrawer = (role: RoleItem) => {
    setDrawerRole(role);
    setIsRoleDrawerOpen(true);
  };

  const closeRoleDrawer = () => {
    setIsRoleDrawerOpen(false);
    setDrawerRole(null);
  };

  const openDeleteRoleDialog = (role: RoleItem) => {
    setDeleteTargetRole(role);
    setIsDeleteRoleDialogOpen(true);
  };

  const closeDeleteRoleDialog = () => {
    setIsDeleteRoleDialogOpen(false);
    setDeleteTargetRole(null);
  };

  // User Management CRUD
  const addUser = (data: Omit<UserAccountItem, 'id' | 'createdAt'>): boolean => {
    const existing = users.find((u) => u.email.trim().toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      addToast(`A user with email "${data.email}" already exists`, 'error');
      return false;
    }

    const newUser: UserAccountItem = {
      ...data,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('stayos_users', JSON.stringify(updated));

    // Update role usersCount
    setRoles((prev) =>
      prev.map((r) => (r.id === data.roleId ? { ...r, usersCount: (r.usersCount || 0) + 1 } : r))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Sarah Jenkins (Admin)',
      action: 'CREATE',
      module: 'User Management',
      details: `Invited/created user "${newUser.name}" (${newUser.email}) with role "${newUser.roleName}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Invitation sent to "${newUser.name}"`, 'success');
    return true;
  };

  const updateUser = (id: string, updates: Partial<UserAccountItem>): boolean => {
    const target = users.find((u) => u.id === id);
    if (!target) return false;

    if (updates.email && updates.email.trim().toLowerCase() !== target.email.toLowerCase()) {
      const existing = users.find(
        (u) => u.email.trim().toLowerCase() === updates.email!.trim().toLowerCase() && u.id !== id
      );
      if (existing) {
        addToast(`A user with email "${updates.email}" already exists`, 'error');
        return false;
      }
    }

    const oldRoleId = target.roleId;
    const newRoleId = updates.roleId;

    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updated);
    localStorage.setItem('stayos_users', JSON.stringify(updated));

    // If role changed, adjust usersCount on roles
    if (newRoleId && newRoleId !== oldRoleId) {
      setRoles((prev) =>
        prev.map((r) => {
          if (r.id === oldRoleId) return { ...r, usersCount: Math.max(0, (r.usersCount || 1) - 1) };
          if (r.id === newRoleId) return { ...r, usersCount: (r.usersCount || 0) + 1 };
          return r;
        })
      );
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Sarah Jenkins (Admin)',
      action: 'UPDATE',
      module: 'User Management',
      details: `Updated user profile and role assignment for "${updates.name || target.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`User "${updates.name || target.name}" updated`, 'success');
    return true;
  };

  const deleteUser = (id: string): boolean => {
    const target = users.find((u) => u.id === id);
    if (!target) return false;

    const filtered = users.filter((u) => u.id !== id);
    setUsers(filtered);
    localStorage.setItem('stayos_users', JSON.stringify(filtered));

    // Decrement role usersCount
    setRoles((prev) =>
      prev.map((r) => (r.id === target.roleId ? { ...r, usersCount: Math.max(0, (r.usersCount || 1) - 1) } : r))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Sarah Jenkins (Admin)',
      action: 'DELETE',
      module: 'User Management',
      details: `Removed user account "${target.name}" (${target.email})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`User "${target.name}" removed`, 'info');
    return true;
  };

  const toggleUserStatus = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    updateUser(id, { status: nextStatus });
  };

  const openInviteUserModal = (user?: UserAccountItem) => {
    if (user) {
      setDrawerUser(user);
      setEditingUserId(user.id);
    } else {
      setDrawerUser(null);
      setEditingUserId(null);
    }
    setIsInviteUserModalOpen(true);
  };

  const closeInviteUserModal = () => {
    setIsInviteUserModalOpen(false);
    setDrawerUser(null);
    setEditingUserId(null);
  };

  // Email Templates CRUD
  const addEmailTemplate = (data: Omit<EmailTemplateItem, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const existing = emailTemplates.find(
      (t) => t.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (existing) {
      addToast(`An email template named "${data.name}" already exists`, 'error');
      return false;
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newTemplate: EmailTemplateItem = {
      ...data,
      id: `tmpl-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = [newTemplate, ...emailTemplates];
    setEmailTemplates(updated);
    localStorage.setItem('stayos_email_templates', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Sarah Jenkins (Admin)',
      action: 'CREATE',
      module: 'Communications',
      details: `Created new email template "${newTemplate.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Template "${newTemplate.name}" saved successfully`, 'success');
    return true;
  };

  const updateEmailTemplate = (id: string, updates: Partial<EmailTemplateItem>): boolean => {
    const target = emailTemplates.find((t) => t.id === id);
    if (!target) return false;

    if (updates.name && updates.name.trim().toLowerCase() !== target.name.toLowerCase()) {
      const existing = emailTemplates.find(
        (t) => t.name.trim().toLowerCase() === updates.name!.trim().toLowerCase() && t.id !== id
      );
      if (existing) {
        addToast(`An email template named "${updates.name}" already exists`, 'error');
        return false;
      }
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const updated = emailTemplates.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
            updatedAt: nowStr,
          }
        : t
    );
    setEmailTemplates(updated);
    localStorage.setItem('stayos_email_templates', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Sarah Jenkins (Admin)',
      action: 'UPDATE',
      module: 'Communications',
      details: `Updated email template "${updates.name || target.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Template "${updates.name || target.name}" updated`, 'success');
    return true;
  };

  const deleteEmailTemplate = (id: string): boolean => {
    const target = emailTemplates.find((t) => t.id === id);
    if (!target) return false;

    const filtered = emailTemplates.filter((t) => t.id !== id);
    setEmailTemplates(filtered);
    localStorage.setItem('stayos_email_templates', JSON.stringify(filtered));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Sarah Jenkins (Admin)',
      action: 'DELETE',
      module: 'Communications',
      details: `Deleted email template "${target.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Template "${target.name}" deleted`, 'info');
    return true;
  };

  const duplicateEmailTemplate = (id: string): boolean => {
    const target = emailTemplates.find((t) => t.id === id);
    if (!target) return false;

    const baseName = `${target.name} (Copy)`;
    let finalName = baseName;
    let counter = 1;
    while (emailTemplates.some((t) => t.name.toLowerCase() === finalName.toLowerCase())) {
      counter++;
      finalName = `${target.name} (Copy ${counter})`;
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const copy: EmailTemplateItem = {
      ...target,
      id: `tmpl-${Date.now()}`,
      name: finalName,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = [copy, ...emailTemplates];
    setEmailTemplates(updated);
    localStorage.setItem('stayos_email_templates', JSON.stringify(updated));

    addToast(`Duplicated template as "${finalName}"`, 'success');
    return true;
  };

  const toggleEmailTemplateStatus = (id: string): boolean => {
    const target = emailTemplates.find((t) => t.id === id);
    if (!target) return false;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    return updateEmailTemplate(id, { status: nextStatus });
  };

  const openAddEmailTemplateDrawer = () => {
    setDrawerEmailTemplate(null);
    setEditingEmailTemplateId(null);
    setIsEmailTemplateDrawerOpen(true);
  };

  const openEditEmailTemplateDrawer = (template: EmailTemplateItem) => {
    setDrawerEmailTemplate(template);
    setEditingEmailTemplateId(template.id);
    setIsEmailTemplateDrawerOpen(true);
  };

  const closeEmailTemplateDrawer = () => {
    setIsEmailTemplateDrawerOpen(false);
    setDrawerEmailTemplate(null);
    setEditingEmailTemplateId(null);
  };

  const openDeleteEmailTemplateDialog = (template: EmailTemplateItem) => {
    setDeleteTargetEmailTemplate(template);
    setIsDeleteEmailTemplateDialogOpen(true);
  };

  const closeDeleteEmailTemplateDialog = () => {
    setIsDeleteEmailTemplateDialogOpen(false);
    setDeleteTargetEmailTemplate(null);
  };

  // Rooms CRUD
  const isRoomNameUnique = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    return !rooms.some(
      (r) => r.name.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId)
    );
  };

  const isRoomShortNameUnique = (shortName: string, excludeId?: string): boolean => {
    const trimmed = shortName.trim().toLowerCase();
    return !rooms.some(
      (r) => (r.shortName?.trim().toLowerCase() === trimmed || r.number?.trim().toLowerCase() === trimmed) && (!excludeId || r.id !== excludeId)
    );
  };

  const addRoom = (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    if (!isRoomNameUnique(data.name)) {
      addToast(`A room named "${data.name}" already exists`, 'error');
      return false;
    }
    if (!isRoomShortNameUnique(data.shortName)) {
      addToast(`A room with short name "${data.shortName}" already exists`, 'error');
      return false;
    }

    const newRoom: Room = {
      ...data,
      id: `rm-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const updated = [newRoom, ...rooms];
    setRooms(updated);
    localStorage.setItem('stayos_rooms', JSON.stringify(updated));

    // Also update room type total units
    const rt = roomTypes.find((t) => t.id === data.roomTypeId);
    if (rt) {
      updateRoomType(rt.id, { totalUnits: (rt.totalUnits || 0) + 1 });
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Rooms',
      details: `Created new room "${newRoom.name}" (${newRoom.shortName}) in ${newRoom.buildingName}`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room "${newRoom.name}" successfully created`, 'success');
    return true;
  };

  const bulkAddRooms = (roomsData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>[]): boolean => {
    if (!roomsData || roomsData.length === 0) {
      addToast('No rooms to create', 'error');
      return false;
    }

    // Check if any room names or short names conflict with existing rooms
    const existingNameSet = new Set(rooms.map((r) => r.name.trim().toLowerCase()));
    const existingShortSet = new Set(rooms.map((r) => (r.shortName?.trim().toLowerCase() || r.number?.trim().toLowerCase())));

    for (const r of roomsData) {
      if (existingNameSet.has(r.name.trim().toLowerCase())) {
        addToast(`Room name "${r.name}" already exists`, 'error');
        return false;
      }
      if (existingShortSet.has(r.shortName.trim().toLowerCase())) {
        addToast(`Room short name "${r.shortName}" already exists`, 'error');
        return false;
      }
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newRooms: Room[] = roomsData.map((data, idx) => ({
      ...data,
      id: `rm-${Date.now()}-${idx}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    }));

    const updated = [...newRooms, ...rooms];
    setRooms(updated);
    localStorage.setItem('stayos_rooms', JSON.stringify(updated));

    // Update room types count
    const countsByRoomType: Record<string, number> = {};
    for (const r of roomsData) {
      countsByRoomType[r.roomTypeId] = (countsByRoomType[r.roomTypeId] || 0) + 1;
    }
    for (const [rtId, count] of Object.entries(countsByRoomType)) {
      const rt = roomTypes.find((t) => t.id === rtId);
      if (rt) {
        updateRoomType(rt.id, { totalUnits: (rt.totalUnits || 0) + count });
      }
    }

    const sampleBld = roomsData[0]?.buildingName || 'Property';
    const sampleFlr = roomsData[0]?.floorName || `Floor ${roomsData[0]?.floor}`;

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'CREATE',
      module: 'Rooms',
      details: `Bulk created ${roomsData.length} rooms in ${sampleBld} (${sampleFlr})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Successfully created ${roomsData.length} rooms in ${sampleBld}`, 'success');
    return true;
  };

  const updateRoom = (id: string, updates: Partial<Room>): boolean => {
    const target = rooms.find((r) => r.id === id);
    if (!target) return false;

    if (updates.name && !isRoomNameUnique(updates.name, id)) {
      addToast(`A room named "${updates.name}" already exists`, 'error');
      return false;
    }
    if (updates.shortName && !isRoomShortNameUnique(updates.shortName, id)) {
      addToast(`A room with short name "${updates.shortName}" already exists`, 'error');
      return false;
    }

    const updated = rooms.map((r) =>
      r.id === id
        ? {
            ...r,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }
        : r
    );
    setRooms(updated);
    localStorage.setItem('stayos_rooms', JSON.stringify(updated));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'UPDATE',
      module: 'Rooms',
      details: `Updated configuration for room "${updates.name || target.name}"`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room "${updates.name || target.name}" updated`, 'success');
    return true;
  };

  const deleteRoom = (id: string): boolean => {
    const target = rooms.find((r) => r.id === id);
    if (!target) return false;

    const filtered = rooms.filter((r) => r.id !== id);
    setRooms(filtered);
    localStorage.setItem('stayos_rooms', JSON.stringify(filtered));

    // Update room type total units
    const rt = roomTypes.find((t) => t.id === target.roomTypeId);
    if (rt && rt.totalUnits > 0) {
      updateRoomType(rt.id, { totalUnits: rt.totalUnits - 1 });
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      user: 'Jane Smith (JS)',
      action: 'DELETE',
      module: 'Rooms',
      details: `Deleted room "${target.name}" (${target.shortName})`,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast(`Room "${target.name}" deleted`, 'info');
    return true;
  };

  const openDeleteRoomDialog = (room: Room) => {
    setDeleteTargetRoom(room);
    setIsDeleteRoomDialogOpen(true);
  };

  const closeDeleteRoomDialog = () => {
    setIsDeleteRoomDialogOpen(false);
    setDeleteTargetRoom(null);
  };

  const openAddDrawer = () => {
    setDrawerBuilding(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (building: Building) => {
    setDrawerBuilding(building);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerBuilding(null);
  };

  const openDeleteDialog = (building: Building) => {
    setDeleteTargetBuilding(building);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTargetBuilding(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  return (
    <PropertyContext.Provider
      value={{
        activePath,
        selectedBuildingId,
        selectedRoomTypeId,
        navigate,
        properties,
        currentProperty,
        switchProperty,
        propertyForm,
        updatePropertyField,
        hasPropertyUnsavedChanges,
        savePropertyMaster,
        discardPropertyMasterChanges,
        buildings,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        isBuildingNameUnique,
        isDrawerOpen,
        drawerBuilding,
        openAddDrawer,
        openEditDrawer,
        closeDrawer,
        isDeleteDialogOpen,
        deleteTargetBuilding,
        openDeleteDialog,
        closeDeleteDialog,
        floors,
        addFloor,
        updateFloor,
        deleteFloor,
        isFloorNameUnique,
        isFloorDrawerOpen,
        drawerFloor,
        drawerDefaultBuildingId,
        openAddFloorDrawer,
        openEditFloorDrawer,
        closeFloorDrawer,
        isDeleteFloorDialogOpen,
        deleteTargetFloor,
        openDeleteFloorDialog,
        closeDeleteFloorDialog,
        roomTypes,
        addRoomType,
        updateRoomType,
        deleteRoomType,
        duplicateRoomType,
        isRoomTypeNameUnique,
        isRoomTypeCodeUnique,
        isRoomTypeDrawerOpen,
        drawerRoomType,
        openAddRoomTypeDrawer,
        openEditRoomTypeDrawer,
        closeRoomTypeDrawer,
        isDeleteRoomTypeDialogOpen,
        deleteTargetRoomType,
        openDeleteRoomTypeDialog,
        closeDeleteRoomTypeDialog,
        roomStatuses,
        addRoomStatus,
        updateRoomStatus,
        deleteRoomStatus,
        isRoomStatusNameUnique,
        isRoomStatusCodeUnique,
        isRoomStatusDrawerOpen,
        drawerRoomStatus,
        openAddRoomStatusDrawer,
        openEditRoomStatusDrawer,
        closeRoomStatusDrawer,
        isDeleteRoomStatusDialogOpen,
        deleteTargetRoomStatus,
        openDeleteRoomStatusDialog,
        closeDeleteRoomStatusDialog,
        taxes,
        selectedTaxId,
        setSelectedTaxId,
        addTax,
        updateTax,
        deleteTax,
        isTaxDrawerOpen,
        drawerTax,
        openAddTaxDrawer,
        openEditTaxDrawer,
        closeTaxDrawer,
        isTaxRuleDrawerOpen,
        drawerTaxRule,
        openAddTaxRuleDrawer,
        openEditTaxRuleDrawer,
        closeTaxRuleDrawer,
        isDeleteTaxDialogOpen,
        deleteTargetTax,
        openDeleteTaxDialog,
        closeDeleteTaxDialog,
        isTaxConfigDrawerOpen,
        configTargetTax,
        openTaxConfigDrawer,
        closeTaxConfigDrawer,
        rateTypes,
        addRateType,
        updateRateType,
        deleteRateType,
        isRateTypeDrawerOpen,
        drawerRateType,
        openAddRateTypeDrawer,
        openEditRateTypeDrawer,
        closeRateTypeDrawer,
        isDeleteRateTypeDialogOpen,
        deleteTargetRateType,
        openDeleteRateTypeDialog,
        closeDeleteRateTypeDialog,
        policies,
        editingPolicyId,
        setEditingPolicyId,
        addPolicy,
        updatePolicy,
        deletePolicy,
        isPolicyDrawerOpen,
        drawerPolicy,
        openAddPolicyDrawer,
        openEditPolicyDrawer,
        closePolicyDrawer,
        isDeletePolicyDialogOpen,
        deleteTargetPolicy,
        openDeletePolicyDialog,
        closeDeletePolicyDialog,
        guestCategories,
        editingGuestCategoryId,
        setEditingGuestCategoryId,
        addGuestCategory,
        updateGuestCategory,
        deleteGuestCategory,
        toggleGuestCategoryStatus,
        isGuestCategoryDrawerOpen,
        drawerGuestCategory,
        openAddGuestCategoryDrawer,
        openEditGuestCategoryDrawer,
        closeGuestCategoryDrawer,
        isDeleteGuestCategoryDialogOpen,
        deleteTargetGuestCategory,
        openDeleteGuestCategoryDialog,
        closeDeleteGuestCategoryDialog,
        documentTypes,
        editingDocumentTypeId,
        setEditingDocumentTypeId,
        addDocumentType,
        updateDocumentType,
        deleteDocumentType,
        toggleDocumentTypeStatus,
        setDefaultDocumentType,
        isDocumentTypeDrawerOpen,
        drawerDocumentType,
        openAddDocumentTypeDrawer,
        openEditDocumentTypeDrawer,
        closeDocumentTypeDrawer,
        isDeleteDocumentTypeDialogOpen,
        deleteTargetDocumentType,
        openDeleteDocumentTypeDialog,
        closeDeleteDocumentTypeDialog,
        otherChargeCategories,
        editingOtherChargeCategoryId,
        setEditingOtherChargeCategoryId,
        addOtherChargeCategory,
        updateOtherChargeCategory,
        deleteOtherChargeCategory,
        setDefaultOtherChargeCategory,
        isOtherChargeCategoryDrawerOpen,
        drawerOtherChargeCategory,
        openAddOtherChargeCategoryDrawer,
        openEditOtherChargeCategoryDrawer,
        closeOtherChargeCategoryDrawer,
        isDeleteOtherChargeCategoryDialogOpen,
        deleteTargetOtherChargeCategory,
        openDeleteOtherChargeCategoryDialog,
        closeDeleteOtherChargeCategoryDialog,
        otherCharges,
        editingOtherChargeId,
        setEditingOtherChargeId,
        addOtherCharge,
        updateOtherCharge,
        deleteOtherCharge,
        isOtherChargeDrawerOpen,
        drawerOtherCharge,
        openAddOtherChargeDrawer,
        openEditOtherChargeDrawer,
        closeOtherChargeDrawer,
        isDeleteOtherChargeDialogOpen,
        deleteTargetOtherCharge,
        openDeleteOtherChargeDialog,
        closeDeleteOtherChargeDialog,
        measurementUnits,
        editingMeasurementUnitId,
        setEditingMeasurementUnitId,
        addMeasurementUnit,
        updateMeasurementUnit,
        deleteMeasurementUnit,
        isMeasurementUnitNameUnique,
        isMeasurementUnitShortNameUnique,
        isMeasurementUnitDrawerOpen,
        drawerMeasurementUnit,
        openAddMeasurementUnitDrawer,
        openEditMeasurementUnitDrawer,
        closeMeasurementUnitDrawer,
        isDeleteMeasurementUnitDialogOpen,
        deleteTargetMeasurementUnit,
        openDeleteMeasurementUnitDialog,
        closeDeleteMeasurementUnitDialog,
        paymentTypes,
        editingPaymentTypeId,
        setEditingPaymentTypeId,
        addPaymentType,
        updatePaymentType,
        deletePaymentType,
        bulkDeletePaymentTypes,
        togglePaymentTypeStatus,
        isPaymentTypeNameUnique,
        isPaymentTypeShortNameUnique,
        isPaymentTypeDrawerOpen,
        drawerPaymentType,
        openAddPaymentTypeDrawer,
        openEditPaymentTypeDrawer,
        closePaymentTypeDrawer,
        isDeletePaymentTypeDialogOpen,
        deleteTargetPaymentType,
        openDeletePaymentTypeDialog,
        closeDeletePaymentTypeDialog,
        exchangeRates,
        editingExchangeRateId,
        setEditingExchangeRateId,
        addExchangeRate,
        updateExchangeRate,
        deleteExchangeRate,
        setBaseExchangeRate,
        isCountryExchangeRateUnique,
        isExchangeRateDrawerOpen,
        drawerExchangeRate,
        openAddExchangeRateDrawer,
        openEditExchangeRateDrawer,
        closeExchangeRateDrawer,
        isDeleteExchangeRateDialogOpen,
        deleteTargetExchangeRate,
        openDeleteExchangeRateDialog,
        closeDeleteExchangeRateDialog,
        roles,
        editingRoleId,
        setEditingRoleId,
        addRole,
        updateRole,
        deleteRole,
        bulkDeleteRoles,
        isRoleNameUnique,
        isRoleCodeUnique,
        isRoleDrawerOpen,
        drawerRole,
        openAddRoleDrawer,
        openEditRoleDrawer,
        closeRoleDrawer,
        isDeleteRoleDialogOpen,
        deleteTargetRole,
        openDeleteRoleDialog,
        closeDeleteRoleDialog,
        users,
        editingUserId,
        setEditingUserId,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        isInviteUserModalOpen,
        drawerUser,
        openInviteUserModal,
        closeInviteUserModal,
        emailTemplates,
        editingEmailTemplateId,
        setEditingEmailTemplateId,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        duplicateEmailTemplate,
        toggleEmailTemplateStatus,
        isEmailTemplateDrawerOpen,
        drawerEmailTemplate,
        openAddEmailTemplateDrawer,
        openEditEmailTemplateDrawer,
        closeEmailTemplateDrawer,
        isDeleteEmailTemplateDialogOpen,
        deleteTargetEmailTemplate,
        openDeleteEmailTemplateDialog,
        closeDeleteEmailTemplateDialog,
        rooms,
        selectedRoomId,
        setSelectedRoomId,
        addRoom,
        bulkAddRooms,
        updateRoom,
        deleteRoom,
        isRoomNameUnique,
        isRoomShortNameUnique,
        isDeleteRoomDialogOpen,
        deleteTargetRoom,
        openDeleteRoomDialog,
        closeDeleteRoomDialog,
        isVerifyPinOpen,
        setVerifyPinOpen,
        isSearchModalOpen,
        setSearchModalOpen,
        searchQuery,
        setSearchQuery,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        amenities,
        auditLogs,
        generalSettings,
        activeGeneralSettingsTab,
        setActiveGeneralSettingsTab,
        updateGeneralSettingsSection,
        updateGuestMandatoryField,
        resetGeneralSettingsSection,
        saveGeneralSettings,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
