import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PROPERTIES, INITIAL_AUTH_USERS, INITIAL_BUILDINGS, INITIAL_FLOORS, INITIAL_ROOM_TYPES, INITIAL_ROOMS, INITIAL_ROOM_STATUSES, INITIAL_TAXES, INITIAL_RATE_TYPES, INITIAL_DOCUMENT_TYPES, INITIAL_OTHER_CHARGE_CATEGORIES, INITIAL_OTHER_CHARGES, INITIAL_MEASUREMENT_UNITS, INITIAL_PAYMENT_TYPES, INITIAL_EXCHANGE_RATES, INITIAL_AMENITIES, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS, INITIAL_ROLES, INITIAL_USERS, INITIAL_EMAIL_TEMPLATES, INITIAL_POLICIES, INITIAL_GUEST_CATEGORIES, } from '../data/mockData';
import { INITIAL_GENERAL_SETTINGS } from '../data/generalSettingsData';
const PropertyContext = createContext(undefined);

const safeGetStorage = (key, fallback) => {
    try {
        if (typeof window === 'undefined') return fallback;
        const saved = localStorage.getItem(key);
        if (!saved || saved === 'undefined' || saved === 'null') return fallback;
        const parsed = JSON.parse(saved);
        return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
        return fallback;
    }
};

export const PropertyProvider = ({ children }) => {
    // Authentication State
    const [authUsers, setAuthUsers] = useState(INITIAL_AUTH_USERS);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return safeGetStorage('stayos_is_authenticated', false);
    });
    const [currentUser, setCurrentUser] = useState(() => {
        return safeGetStorage('stayos_current_user', null);
    });
    const [isMultiPropertyModalOpen, setMultiPropertyModalOpen] = useState(false);
    // Navigation State
    const [activePath, setActivePath] = useState('overview');
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);
    // Property Data State
    const [properties, setProperties] = useState(() => {
        const loaded = safeGetStorage('stayos_properties_v2', INITIAL_PROPERTIES);
        return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_PROPERTIES;
    });
    const [currentPropertyId, setCurrentPropertyId] = useState(() => {
        try {
            return localStorage.getItem('stayos_current_prop_id') || 'prop-astoria';
        } catch {
            return 'prop-astoria';
        }
    });
    const currentProperty = (properties && Array.isArray(properties) && properties.length > 0)
        ? (properties.find((p) => p && p.id === currentPropertyId) || properties[0])
        : INITIAL_PROPERTIES[0];
    // Property Master Form State
    const [propertyForm, setPropertyForm] = useState(currentProperty);
    const [hasPropertyUnsavedChanges, setHasPropertyUnsavedChanges] = useState(false);
    useEffect(() => {
        if (currentProperty) {
            setPropertyForm(currentProperty);
        }
        setHasPropertyUnsavedChanges(false);
    }, [currentPropertyId, currentProperty]);
    // Buildings State
    const [buildings, setBuildings] = useState(() => {
        return safeGetStorage('stayos_buildings', INITIAL_BUILDINGS);
    });
    // Floors State
    const [floors, setFloors] = useState(() => {
        return safeGetStorage('stayos_floors', INITIAL_FLOORS);
    });
    // Room Types State
    const [roomTypes, setRoomTypes] = useState(() => {
        return safeGetStorage('stayos_room_types', INITIAL_ROOM_TYPES);
    });
    // Secondary Data
    const [rooms, setRooms] = useState(() => {
        return safeGetStorage('stayos_rooms', INITIAL_ROOMS);
    });
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isDeleteRoomDialogOpen, setIsDeleteRoomDialogOpen] = useState(false);
    const [deleteTargetRoom, setDeleteTargetRoom] = useState(null);
    const [amenities] = useState(INITIAL_AMENITIES);
    const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    // UI Drawers / Modals
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerBuilding, setDrawerBuilding] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTargetBuilding, setDeleteTargetBuilding] = useState(null);
    // Floor UI State
    const [isFloorDrawerOpen, setIsFloorDrawerOpen] = useState(false);
    const [drawerFloor, setDrawerFloor] = useState(null);
    const [drawerDefaultBuildingId, setDrawerDefaultBuildingId] = useState('');
    const [isDeleteFloorDialogOpen, setIsDeleteFloorDialogOpen] = useState(false);
    const [deleteTargetFloor, setDeleteTargetFloor] = useState(null);
    // Room Type UI State
    const [isRoomTypeDrawerOpen, setIsRoomTypeDrawerOpen] = useState(false);
    const [drawerRoomType, setDrawerRoomType] = useState(null);
    const [isDeleteRoomTypeDialogOpen, setIsDeleteRoomTypeDialogOpen] = useState(false);
    const [deleteTargetRoomType, setDeleteTargetRoomType] = useState(null);
    // Room Statuses State
    const [roomStatuses, setRoomStatuses] = useState(() => {
        return safeGetStorage('stayos_room_statuses', INITIAL_ROOM_STATUSES);
    });
    const [isRoomStatusDrawerOpen, setIsRoomStatusDrawerOpen] = useState(false);
    const [drawerRoomStatus, setDrawerRoomStatus] = useState(null);
    const [isDeleteRoomStatusDialogOpen, setIsDeleteRoomStatusDialogOpen] = useState(false);
    const [deleteTargetRoomStatus, setDeleteTargetRoomStatus] = useState(null);
    // Taxes State
    const [taxes, setTaxes] = useState(() => {
        return safeGetStorage('stayos_taxes', INITIAL_TAXES);
    });
    const [selectedTaxId, setSelectedTaxId] = useState(null);
    const [isTaxDrawerOpen, setIsTaxDrawerOpen] = useState(false);
    const [drawerTax, setDrawerTax] = useState(null);
    const [isTaxRuleDrawerOpen, setIsTaxRuleDrawerOpen] = useState(false);
    const [drawerTaxRule, setDrawerTaxRule] = useState(null);
    const [isDeleteTaxDialogOpen, setIsDeleteTaxDialogOpen] = useState(false);
    const [deleteTargetTax, setDeleteTargetTax] = useState(null);
    const [isTaxConfigDrawerOpen, setIsTaxConfigDrawerOpen] = useState(false);
    const [configTargetTax, setConfigTargetTax] = useState(null);
    // Rate Types State
    const [rateTypes, setRateTypes] = useState(() => {
        return safeGetStorage('stayos_rate_types', INITIAL_RATE_TYPES);
    });
    const [isRateTypeDrawerOpen, setIsRateTypeDrawerOpen] = useState(false);
    const [drawerRateType, setDrawerRateType] = useState(null);
    const [isDeleteRateTypeDialogOpen, setIsDeleteRateTypeDialogOpen] = useState(false);
    const [deleteTargetRateType, setDeleteTargetRateType] = useState(null);
    // Policies State
    const [policies, setPolicies] = useState(() => {
        return safeGetStorage('stayos_policies', INITIAL_POLICIES);
    });
    const [editingPolicyId, setEditingPolicyId] = useState(null);
    const [isPolicyDrawerOpen, setIsPolicyDrawerOpen] = useState(false);
    const [drawerPolicy, setDrawerPolicy] = useState(null);
    const [isDeletePolicyDialogOpen, setIsDeletePolicyDialogOpen] = useState(false);
    const [deleteTargetPolicy, setDeleteTargetPolicy] = useState(null);
    // Guest Categories State
    const [guestCategories, setGuestCategories] = useState(() => {
        return safeGetStorage('stayos_guest_categories', INITIAL_GUEST_CATEGORIES);
    });
    const [editingGuestCategoryId, setEditingGuestCategoryId] = useState(null);
    const [isGuestCategoryDrawerOpen, setIsGuestCategoryDrawerOpen] = useState(false);
    const [drawerGuestCategory, setDrawerGuestCategory] = useState(null);
    const [isDeleteGuestCategoryDialogOpen, setIsDeleteGuestCategoryDialogOpen] = useState(false);
    const [deleteTargetGuestCategory, setDeleteTargetGuestCategory] = useState(null);
    // Document Types State
    const [documentTypes, setDocumentTypes] = useState(() => {
        return safeGetStorage('stayos_document_types', INITIAL_DOCUMENT_TYPES);
    });
    const [editingDocumentTypeId, setEditingDocumentTypeId] = useState(null);
    const [isDocumentTypeDrawerOpen, setIsDocumentTypeDrawerOpen] = useState(false);
    const [drawerDocumentType, setDrawerDocumentType] = useState(null);
    const [isDeleteDocumentTypeDialogOpen, setIsDeleteDocumentTypeDialogOpen] = useState(false);
    const [deleteTargetDocumentType, setDeleteTargetDocumentType] = useState(null);
    // Other Charges Categories State
    const [otherChargeCategories, setOtherChargeCategories] = useState(() => {
        return safeGetStorage('stayos_other_charge_categories', INITIAL_OTHER_CHARGE_CATEGORIES);
    });
    const [editingOtherChargeCategoryId, setEditingOtherChargeCategoryId] = useState(null);
    const [isOtherChargeCategoryDrawerOpen, setIsOtherChargeCategoryDrawerOpen] = useState(false);
    const [drawerOtherChargeCategory, setDrawerOtherChargeCategory] = useState(null);
    const [isDeleteOtherChargeCategoryDialogOpen, setIsDeleteOtherChargeCategoryDialogOpen] = useState(false);
    const [deleteTargetOtherChargeCategory, setDeleteTargetOtherChargeCategory] = useState(null);
    // Other Charges State
    const [otherCharges, setOtherCharges] = useState(() => {
        return safeGetStorage('stayos_other_charges', INITIAL_OTHER_CHARGES);
    });
    const [editingOtherChargeId, setEditingOtherChargeId] = useState(null);
    const [isOtherChargeDrawerOpen, setIsOtherChargeDrawerOpen] = useState(false);
    const [drawerOtherCharge, setDrawerOtherCharge] = useState(null);
    const [isDeleteOtherChargeDialogOpen, setIsDeleteOtherChargeDialogOpen] = useState(false);
    const [deleteTargetOtherCharge, setDeleteTargetOtherCharge] = useState(null);
    // Measurement Units State
    const [measurementUnits, setMeasurementUnits] = useState(() => {
        return safeGetStorage('stayos_measurement_units', INITIAL_MEASUREMENT_UNITS);
    });
    const [editingMeasurementUnitId, setEditingMeasurementUnitId] = useState(null);
    const [isMeasurementUnitDrawerOpen, setIsMeasurementUnitDrawerOpen] = useState(false);
    const [drawerMeasurementUnit, setDrawerMeasurementUnit] = useState(null);
    const [isDeleteMeasurementUnitDialogOpen, setIsDeleteMeasurementUnitDialogOpen] = useState(false);
    const [deleteTargetMeasurementUnit, setDeleteTargetMeasurementUnit] = useState(null);
    // Payment Types State
    const [paymentTypes, setPaymentTypes] = useState(() => {
        return safeGetStorage('stayos_payment_types', INITIAL_PAYMENT_TYPES);
    });
    const [editingPaymentTypeId, setEditingPaymentTypeId] = useState(null);
    const [isPaymentTypeDrawerOpen, setIsPaymentTypeDrawerOpen] = useState(false);
    const [drawerPaymentType, setDrawerPaymentType] = useState(null);
    const [isDeletePaymentTypeDialogOpen, setIsDeletePaymentTypeDialogOpen] = useState(false);
    const [deleteTargetPaymentType, setDeleteTargetPaymentType] = useState(null);
    // Exchange Rates State
    const [exchangeRates, setExchangeRates] = useState(() => {
        return safeGetStorage('stayos_exchange_rates', INITIAL_EXCHANGE_RATES);
    });
    const [editingExchangeRateId, setEditingExchangeRateId] = useState(null);
    const [isExchangeRateDrawerOpen, setIsExchangeRateDrawerOpen] = useState(false);
    const [drawerExchangeRate, setDrawerExchangeRate] = useState(null);
    const [isDeleteExchangeRateDialogOpen, setIsDeleteExchangeRateDialogOpen] = useState(false);
    const [deleteTargetExchangeRate, setDeleteTargetExchangeRate] = useState(null);
    // Roles & Privileges State
    const [roles, setRoles] = useState(() => {
        return safeGetStorage('stayos_roles', INITIAL_ROLES);
    });
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
    const [drawerRole, setDrawerRole] = useState(null);
    const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false);
    const [deleteTargetRole, setDeleteTargetRole] = useState(null);
    // Users & Permissions State
    const [users, setUsers] = useState(() => {
        return safeGetStorage('stayos_users', INITIAL_USERS);
    });
    const [editingUserId, setEditingUserId] = useState(null);
    const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
    const [drawerUser, setDrawerUser] = useState(null);
    // Email Templates State
    const [emailTemplates, setEmailTemplates] = useState(() => {
        return safeGetStorage('stayos_email_templates', INITIAL_EMAIL_TEMPLATES);
    });
    const [editingEmailTemplateId, setEditingEmailTemplateId] = useState(null);
    const [isEmailTemplateDrawerOpen, setIsEmailTemplateDrawerOpen] = useState(false);
    const [drawerEmailTemplate, setDrawerEmailTemplate] = useState(null);
    const [isDeleteEmailTemplateDialogOpen, setIsDeleteEmailTemplateDialogOpen] = useState(false);
    const [deleteTargetEmailTemplate, setDeleteTargetEmailTemplate] = useState(null);
    const [isVerifyPinOpen, setVerifyPinOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // General Settings State
    const [generalSettings, setGeneralSettings] = useState(() => {
        const saved = localStorage.getItem('stayos_general_settings');
        if (!saved)
            return INITIAL_GENERAL_SETTINGS;
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
        }
        catch {
            return INITIAL_GENERAL_SETTINGS;
        }
    });
    const [activeGeneralSettingsTab, setActiveGeneralSettingsTab] = useState('rental');
    const updateGeneralSettingsSection = (section, updates) => {
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
    const updateGuestMandatoryField = (fieldId, updates) => {
        setGeneralSettings((prev) => {
            const updatedFields = prev.guestMandatoryData.fields.map((f) => {
                if (f.id === fieldId) {
                    return { ...f, ...updates };
                }
                return f;
            });
            const updated = {
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
    const resetGeneralSettingsSection = (section) => {
        setGeneralSettings((prev) => {
            const updated = {
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
        const newLog = {
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
    const [toasts, setToasts] = useState([]);
    const addToast = (message, type = 'success') => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    // Keyboard shortcut Cmd+K for search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchModalOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const navigate = (path, entityId = null) => {
        setActivePath(path);
        if (path === 'edit-building' || path === 'buildings') {
            setSelectedBuildingId(entityId);
        }
        else if (path === 'edit-room-type' || path === 'room-types') {
            setSelectedRoomTypeId(entityId);
        }
        else if (path === 'general-settings-rental') {
            setActiveGeneralSettingsTab('rental');
        }
        else if (path === 'general-settings-feature') {
            setActiveGeneralSettingsTab('feature');
        }
        else if (path === 'general-settings-night-audits') {
            setActiveGeneralSettingsTab('night-audits');
        }
        else if (path === 'general-settings-localization') {
            setActiveGeneralSettingsTab('localization');
        }
        else if (path === 'general-settings-display') {
            setActiveGeneralSettingsTab('display');
        }
        else if (path === 'general-settings-folios') {
            setActiveGeneralSettingsTab('folios');
        }
        else if (path === 'general-settings-credit-cards') {
            setActiveGeneralSettingsTab('credit-cards');
        }
        else if (path === 'general-settings-emails') {
            setActiveGeneralSettingsTab('emails');
        }
        else if (path === 'general-settings-guest-mandatory-data') {
            setActiveGeneralSettingsTab('guest-mandatory-data');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const login = (email, password, targetPropertyId) => {
        const cleanEmail = email.trim().toLowerCase();
        const foundUser = authUsers.find((u) => u.email.toLowerCase() === cleanEmail);
        if (!foundUser) {
            return { success: false, message: 'The email address or password entered does not match our records.' };
        }
        if (foundUser.status === 'inactive') {
            return { success: false, message: 'This account is currently inactive. Please contact your property administrator or General Manager.' };
        }
        if (password === 'WrongPassword999') {
            return { success: false, message: 'The email address or password entered does not match our records.' };
        }
        setCurrentUser(foundUser);
        localStorage.setItem('stayos_current_user', JSON.stringify(foundUser));
        // If target property explicitly passed or user only has 1 property:
        if (targetPropertyId) {
            setCurrentPropertyId(targetPropertyId);
            localStorage.setItem('stayos_current_prop_id', targetPropertyId);
            setIsAuthenticated(true);
            localStorage.setItem('stayos_is_authenticated', 'true');
            const target = properties.find((p) => p.id === targetPropertyId);
            addToast(`Welcome back, ${foundUser.name}! Initialized ${target?.identity.name || 'PMS'}.`, 'success');
            return { success: true, requirePropertySelect: false, user: foundUser };
        }
        if (foundUser.accessiblePropertyIds.length > 1) {
            // Prompt property selection screen
            return { success: true, requirePropertySelect: true, user: foundUser };
        }
        const singlePropId = foundUser.accessiblePropertyIds[0] || foundUser.defaultPropertyId || 'prop-astoria';
        setCurrentPropertyId(singlePropId);
        localStorage.setItem('stayos_current_prop_id', singlePropId);
        setIsAuthenticated(true);
        localStorage.setItem('stayos_is_authenticated', 'true');
        addToast(`Welcome back, ${foundUser.name}!`, 'success');
        return { success: true, requirePropertySelect: false, user: foundUser };
    };
    const selectPropertyAndLogin = (propertyId) => {
        const userToUse = currentUser || authUsers[0];
        setCurrentUser(userToUse);
        localStorage.setItem('stayos_current_user', JSON.stringify(userToUse));
        setCurrentPropertyId(propertyId);
        localStorage.setItem('stayos_current_prop_id', propertyId);
        setIsAuthenticated(true);
        localStorage.setItem('stayos_is_authenticated', 'true');
        const target = properties.find((p) => p.id === propertyId);
        addToast(`Connected to ${target?.identity.name || 'Property'}`, 'success');
    };
    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('stayos_is_authenticated');
        localStorage.removeItem('stayos_current_user');
        addToast('You have been safely signed out of StayOS', 'info');
    };
    const switchProperty = (propertyId) => {
        setCurrentPropertyId(propertyId);
        localStorage.setItem('stayos_current_prop_id', propertyId);
        const target = properties.find((p) => p.id === propertyId);
        if (target) {
            addToast(`Switched active property to ${target.identity.name}`, 'info');
        }
    };
    const updatePropertyField = (section, field, value) => {
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
        const newLog = {
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
    const isBuildingNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !buildings.some((b) => b.name.trim().toLowerCase() === trimmed && (!excludeId || b.id !== excludeId));
    };
    const addBuilding = (data) => {
        if (!isBuildingNameUnique(data.name)) {
            addToast(`A building with name "${data.name}" already exists`, 'error');
            return false;
        }
        const nextIndex = buildings.length + 1;
        const code = `BLD-${String(nextIndex).padStart(3, '0')}`;
        const newBuilding = {
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
        const newLog = {
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
    const updateBuilding = (id, updates) => {
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
        const newLog = {
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
    const deleteBuilding = (id) => {
        const target = buildings.find((b) => b.id === id);
        if (!target)
            return false;
        // Check deletion protection
        if (target.hasActiveRooms || target.totalRooms > 0) {
            openDeleteDialog(target);
            return false;
        }
        const updated = buildings.filter((b) => b.id !== id);
        setBuildings(updated);
        localStorage.setItem('stayos_buildings', JSON.stringify(updated));
        const newLog = {
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
    const isFloorNameUnique = (name, buildingId, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !floors.some((f) => f.buildingId === buildingId && f.name.trim().toLowerCase() === trimmed && (!excludeId || f.id !== excludeId));
    };
    const addFloor = (data) => {
        if (!isFloorNameUnique(data.name, data.buildingId)) {
            const bld = buildings.find((b) => b.id === data.buildingId);
            addToast(`A floor named "${data.name}" already exists in ${bld?.name || 'this building'}`, 'error');
            return false;
        }
        const targetBuilding = buildings.find((b) => b.id === data.buildingId);
        const newFloor = {
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
        const newLog = {
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
    const updateFloor = (id, updates) => {
        const existing = floors.find((f) => f.id === id);
        if (!existing)
            return false;
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
        const newLog = {
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
    const deleteFloor = (id) => {
        const target = floors.find((f) => f.id === id);
        if (!target)
            return false;
        // Active room check
        const hasRooms = rooms.some((r) => r.buildingId === target.buildingId && (r.floor === target.floorNumber || target.name.toLowerCase().includes(String(r.floor))));
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
        const newLog = {
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
    const openAddFloorDrawer = (defaultBuildingId) => {
        setDrawerFloor(null);
        setDrawerDefaultBuildingId(defaultBuildingId || '');
        setIsFloorDrawerOpen(true);
    };
    const openEditFloorDrawer = (floor) => {
        setDrawerFloor(floor);
        setDrawerDefaultBuildingId(floor.buildingId);
        setIsFloorDrawerOpen(true);
    };
    const closeFloorDrawer = () => {
        setIsFloorDrawerOpen(false);
        setDrawerFloor(null);
    };
    const openDeleteFloorDialog = (floor) => {
        setDeleteTargetFloor(floor);
        setIsDeleteFloorDialogOpen(true);
    };
    const closeDeleteFloorDialog = () => {
        setIsDeleteFloorDialogOpen(false);
        setDeleteTargetFloor(null);
    };
    // Room Types CRUD
    const isRoomTypeNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !roomTypes.some((rt) => rt.name.trim().toLowerCase() === trimmed && (!excludeId || rt.id !== excludeId));
    };
    const isRoomTypeCodeUnique = (code, excludeId) => {
        const trimmed = code.trim().toUpperCase();
        return !roomTypes.some((rt) => rt.code.trim().toUpperCase() === trimmed && (!excludeId || rt.id !== excludeId));
    };
    const addRoomType = (data) => {
        if (!isRoomTypeNameUnique(data.name)) {
            addToast(`A room type with name "${data.name}" already exists`, 'error');
            return false;
        }
        if (!isRoomTypeCodeUnique(data.code)) {
            addToast(`A room type with code "${data.code}" already exists`, 'error');
            return false;
        }
        const newRoomType = {
            ...data,
            id: `rt-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [newRoomType, ...roomTypes];
        setRoomTypes(updated);
        localStorage.setItem('stayos_room_types', JSON.stringify(updated));
        const newLog = {
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
    const updateRoomType = (id, updates) => {
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
        const newLog = {
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
    const deleteRoomType = (id) => {
        const target = roomTypes.find((rt) => rt.id === id);
        if (!target)
            return false;
        // Check if any active rooms are assigned to this room type
        const assignedRooms = rooms.filter((r) => r.roomTypeId === id);
        if (assignedRooms.length > 0) {
            openDeleteRoomTypeDialog(target);
            return false;
        }
        const updated = roomTypes.filter((rt) => rt.id !== id);
        setRoomTypes(updated);
        localStorage.setItem('stayos_room_types', JSON.stringify(updated));
        const newLog = {
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
    const duplicateRoomType = (id) => {
        const source = roomTypes.find((rt) => rt.id === id);
        if (!source)
            return false;
        let copyName = `${source.name} (Copy)`;
        let copyCode = `${source.code}-CPY`;
        let counter = 1;
        while (!isRoomTypeNameUnique(copyName)) {
            counter++;
            copyName = `${source.name} (Copy ${counter})`;
            copyCode = `${source.code}-C${counter}`;
        }
        const duplicated = {
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
    const openEditRoomTypeDrawer = (rt) => {
        setDrawerRoomType(rt);
        setIsRoomTypeDrawerOpen(true);
    };
    const closeRoomTypeDrawer = () => {
        setIsRoomTypeDrawerOpen(false);
        setDrawerRoomType(null);
    };
    const openDeleteRoomTypeDialog = (rt) => {
        setDeleteTargetRoomType(rt);
        setIsDeleteRoomTypeDialogOpen(true);
    };
    const closeDeleteRoomTypeDialog = () => {
        setIsDeleteRoomTypeDialogOpen(false);
        setDeleteTargetRoomType(null);
    };
    // Room Statuses CRUD
    const isRoomStatusNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !roomStatuses.some((s) => s.name.trim().toLowerCase() === trimmed && (!excludeId || s.id !== excludeId));
    };
    const isRoomStatusCodeUnique = (code, excludeId) => {
        const trimmed = code.trim().toLowerCase();
        return !roomStatuses.some((s) => s.code.trim().toLowerCase() === trimmed && (!excludeId || s.id !== excludeId));
    };
    const addRoomStatus = (data) => {
        if (!isRoomStatusNameUnique(data.name)) {
            addToast(`A room status named "${data.name}" already exists`, 'error');
            return false;
        }
        if (!isRoomStatusCodeUnique(data.code)) {
            addToast(`A room status with code "${data.code}" already exists`, 'error');
            return false;
        }
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const newStatus = {
            ...data,
            id: `rs-${Date.now()}`,
            createdAt: nowStr,
            updatedAt: nowStr,
        };
        const updated = [...roomStatuses, newStatus];
        setRoomStatuses(updated);
        localStorage.setItem('stayos_room_statuses', JSON.stringify(updated));
        const newLog = {
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
    const updateRoomStatus = (id, updates) => {
        const target = roomStatuses.find((s) => s.id === id);
        if (!target)
            return false;
        if (updates.name && !isRoomStatusNameUnique(updates.name, id)) {
            addToast(`A room status named "${updates.name}" already exists`, 'error');
            return false;
        }
        if (updates.code && !isRoomStatusCodeUnique(updates.code, id)) {
            addToast(`A room status with code "${updates.code}" already exists`, 'error');
            return false;
        }
        const updated = roomStatuses.map((s) => s.id === id
            ? {
                ...s,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : s);
        setRoomStatuses(updated);
        localStorage.setItem('stayos_room_statuses', JSON.stringify(updated));
        const newLog = {
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
    const deleteRoomStatus = (id) => {
        const target = roomStatuses.find((s) => s.id === id);
        if (!target)
            return false;
        const filtered = roomStatuses.filter((s) => s.id !== id);
        setRoomStatuses(filtered);
        localStorage.setItem('stayos_room_statuses', JSON.stringify(filtered));
        const newLog = {
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
    const openEditRoomStatusDrawer = (status) => {
        setDrawerRoomStatus(status);
        setIsRoomStatusDrawerOpen(true);
    };
    const closeRoomStatusDrawer = () => {
        setIsRoomStatusDrawerOpen(false);
        setDrawerRoomStatus(null);
    };
    const openDeleteRoomStatusDialog = (status) => {
        setDeleteTargetRoomStatus(status);
        setIsDeleteRoomStatusDialogOpen(true);
    };
    const closeDeleteRoomStatusDialog = () => {
        setIsDeleteRoomStatusDialogOpen(false);
        setDeleteTargetRoomStatus(null);
    };
    // Taxes CRUD & Drawers
    const addTax = (data) => {
        const newTax = {
            ...data,
            id: `tax-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [newTax, ...taxes];
        setTaxes(updated);
        localStorage.setItem('stayos_taxes', JSON.stringify(updated));
        // Audit Log
        const newLog = {
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
    const updateTax = (id, updates) => {
        const updated = taxes.map((t) => t.id === id
            ? {
                ...t,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : t);
        setTaxes(updated);
        localStorage.setItem('stayos_taxes', JSON.stringify(updated));
        const target = taxes.find((t) => t.id === id);
        const newLog = {
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
    const deleteTax = (id) => {
        const target = taxes.find((t) => t.id === id);
        const updated = taxes.filter((t) => t.id !== id);
        setTaxes(updated);
        localStorage.setItem('stayos_taxes', JSON.stringify(updated));
        const newLog = {
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
    const openEditTaxDrawer = (tax) => {
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
    const openEditTaxRuleDrawer = (tax) => {
        setDrawerTaxRule(tax);
        setIsTaxRuleDrawerOpen(true);
    };
    const closeTaxRuleDrawer = () => {
        setIsTaxRuleDrawerOpen(false);
        setDrawerTaxRule(null);
    };
    const openDeleteTaxDialog = (tax) => {
        setDeleteTargetTax(tax);
        setIsDeleteTaxDialogOpen(true);
    };
    const closeDeleteTaxDialog = () => {
        setIsDeleteTaxDialogOpen(false);
        setDeleteTargetTax(null);
    };
    const openTaxConfigDrawer = (tax) => {
        setConfigTargetTax(tax);
        setIsTaxConfigDrawerOpen(true);
    };
    const closeTaxConfigDrawer = () => {
        setIsTaxConfigDrawerOpen(false);
        setConfigTargetTax(null);
    };
    // Rate Types CRUD & Drawers
    const addRateType = (data) => {
        const newRateType = {
            ...data,
            id: `rt-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [newRateType, ...rateTypes];
        setRateTypes(updated);
        localStorage.setItem('stayos_rate_types', JSON.stringify(updated));
        // Audit Log
        const newLog = {
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
    const updateRateType = (id, updates) => {
        const updated = rateTypes.map((rt) => rt.id === id
            ? {
                ...rt,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : rt);
        setRateTypes(updated);
        localStorage.setItem('stayos_rate_types', JSON.stringify(updated));
        const target = rateTypes.find((rt) => rt.id === id);
        const newLog = {
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
    const deleteRateType = (id) => {
        const target = rateTypes.find((rt) => rt.id === id);
        const updated = rateTypes.filter((rt) => rt.id !== id);
        setRateTypes(updated);
        localStorage.setItem('stayos_rate_types', JSON.stringify(updated));
        const newLog = {
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
    const openEditRateTypeDrawer = (rateType) => {
        setDrawerRateType(rateType);
        setIsRateTypeDrawerOpen(true);
    };
    const closeRateTypeDrawer = () => {
        setIsRateTypeDrawerOpen(false);
        setDrawerRateType(null);
    };
    const openDeleteRateTypeDialog = (rateType) => {
        setDeleteTargetRateType(rateType);
        setIsDeleteRateTypeDialogOpen(true);
    };
    const closeDeleteRateTypeDialog = () => {
        setIsDeleteRateTypeDialogOpen(false);
        setDeleteTargetRateType(null);
    };
    // Policies CRUD & Actions
    const addPolicy = (data) => {
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const newPolicy = {
            ...data,
            id: `pol-${Date.now()}`,
            createdAt: nowStr,
            updatedAt: nowStr,
        };
        const updated = [newPolicy, ...policies];
        setPolicies(updated);
        localStorage.setItem('stayos_policies', JSON.stringify(updated));
        const newLog = {
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
    const updatePolicy = (id, updates) => {
        const target = policies.find((p) => p.id === id);
        if (!target)
            return false;
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const updated = policies.map((p) => p.id === id
            ? {
                ...p,
                ...updates,
                updatedAt: nowStr,
            }
            : p);
        setPolicies(updated);
        localStorage.setItem('stayos_policies', JSON.stringify(updated));
        const newLog = {
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
    const deletePolicy = (id) => {
        const target = policies.find((p) => p.id === id);
        if (!target)
            return false;
        const updated = policies.filter((p) => p.id !== id);
        setPolicies(updated);
        localStorage.setItem('stayos_policies', JSON.stringify(updated));
        const newLog = {
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
    const openEditPolicyDrawer = (policy) => {
        setDrawerPolicy(policy);
        setEditingPolicyId(policy.id);
        setIsPolicyDrawerOpen(true);
    };
    const closePolicyDrawer = () => {
        setIsPolicyDrawerOpen(false);
        setDrawerPolicy(null);
    };
    const openDeletePolicyDialog = (policy) => {
        setDeleteTargetPolicy(policy);
        setIsDeletePolicyDialogOpen(true);
    };
    const closeDeletePolicyDialog = () => {
        setIsDeletePolicyDialogOpen(false);
        setDeleteTargetPolicy(null);
    };
    // Guest Categories CRUD & Actions
    const addGuestCategory = (data) => {
        const newCategory = {
            ...data,
            id: `gcat-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [newCategory, ...guestCategories];
        setGuestCategories(updated);
        localStorage.setItem('stayos_guest_categories', JSON.stringify(updated));
        const newLog = {
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
    const updateGuestCategory = (id, updates) => {
        const existing = guestCategories.find((c) => c.id === id);
        if (!existing)
            return false;
        const updatedCategory = {
            ...existing,
            ...updates,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = guestCategories.map((c) => (c.id === id ? updatedCategory : c));
        setGuestCategories(updated);
        localStorage.setItem('stayos_guest_categories', JSON.stringify(updated));
        const newLog = {
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
    const deleteGuestCategory = (id) => {
        const target = guestCategories.find((c) => c.id === id);
        if (!target)
            return false;
        const updated = guestCategories.filter((c) => c.id !== id);
        setGuestCategories(updated);
        localStorage.setItem('stayos_guest_categories', JSON.stringify(updated));
        const newLog = {
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
    const toggleGuestCategoryStatus = (id) => {
        const target = guestCategories.find((c) => c.id === id);
        if (!target)
            return false;
        const newStatus = target.status === 'active' ? 'inactive' : 'active';
        return updateGuestCategory(id, { status: newStatus });
    };
    const openAddGuestCategoryDrawer = () => {
        setDrawerGuestCategory(null);
        setEditingGuestCategoryId(null);
        setIsGuestCategoryDrawerOpen(true);
    };
    const openEditGuestCategoryDrawer = (category) => {
        setDrawerGuestCategory(category);
        setEditingGuestCategoryId(category.id);
        setIsGuestCategoryDrawerOpen(true);
    };
    const closeGuestCategoryDrawer = () => {
        setIsGuestCategoryDrawerOpen(false);
        setDrawerGuestCategory(null);
        setEditingGuestCategoryId(null);
    };
    const openDeleteGuestCategoryDialog = (category) => {
        setDeleteTargetGuestCategory(category);
        setIsDeleteGuestCategoryDialogOpen(true);
    };
    const closeDeleteGuestCategoryDialog = () => {
        setIsDeleteGuestCategoryDialogOpen(false);
        setDeleteTargetGuestCategory(null);
    };
    // Document Types CRUD & Actions
    const addDocumentType = (data) => {
        const newDocType = {
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
        const newLog = {
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
    const updateDocumentType = (id, updates) => {
        let updatedList = [...documentTypes];
        // If marking as default, remove default from all others
        if (updates.isDefault) {
            updatedList = updatedList.map((d) => (d.id !== id ? { ...d, isDefault: false } : d));
        }
        const updated = updatedList.map((d) => d.id === id
            ? {
                ...d,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : d);
        setDocumentTypes(updated);
        localStorage.setItem('stayos_document_types', JSON.stringify(updated));
        const target = documentTypes.find((d) => d.id === id);
        const newLog = {
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
    const deleteDocumentType = (id) => {
        const target = documentTypes.find((d) => d.id === id);
        const updated = documentTypes.filter((d) => d.id !== id);
        setDocumentTypes(updated);
        localStorage.setItem('stayos_document_types', JSON.stringify(updated));
        const newLog = {
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
    const toggleDocumentTypeStatus = (id) => {
        const target = documentTypes.find((d) => d.id === id);
        if (!target)
            return false;
        const newStatus = !target.isActive;
        return updateDocumentType(id, { isActive: newStatus });
    };
    const setDefaultDocumentType = (id) => {
        const target = documentTypes.find((d) => d.id === id);
        if (!target)
            return false;
        return updateDocumentType(id, { isDefault: true, isActive: true });
    };
    const openAddDocumentTypeDrawer = () => {
        setDrawerDocumentType(null);
        setIsDocumentTypeDrawerOpen(true);
    };
    const openEditDocumentTypeDrawer = (docType) => {
        setDrawerDocumentType(docType);
        setIsDocumentTypeDrawerOpen(true);
    };
    const closeDocumentTypeDrawer = () => {
        setIsDocumentTypeDrawerOpen(false);
        setDrawerDocumentType(null);
    };
    const openDeleteDocumentTypeDialog = (docType) => {
        setDeleteTargetDocumentType(docType);
        setIsDeleteDocumentTypeDialogOpen(true);
    };
    const closeDeleteDocumentTypeDialog = () => {
        setIsDeleteDocumentTypeDialogOpen(false);
        setDeleteTargetDocumentType(null);
    };
    // Other Charges Categories CRUD & Actions
    const addOtherChargeCategory = (data) => {
        const newCategory = {
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
        const newLog = {
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
    const updateOtherChargeCategory = (id, updates) => {
        let updatedList = [...otherChargeCategories];
        if (updates.isDefault) {
            updatedList = updatedList.map((c) => (c.id !== id ? { ...c, isDefault: false } : c));
        }
        const updated = updatedList.map((c) => c.id === id
            ? {
                ...c,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : c);
        setOtherChargeCategories(updated);
        localStorage.setItem('stayos_other_charge_categories', JSON.stringify(updated));
        const target = otherChargeCategories.find((c) => c.id === id);
        const newLog = {
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
    const deleteOtherChargeCategory = (id) => {
        const target = otherChargeCategories.find((c) => c.id === id);
        const updated = otherChargeCategories.filter((c) => c.id !== id);
        setOtherChargeCategories(updated);
        localStorage.setItem('stayos_other_charge_categories', JSON.stringify(updated));
        const newLog = {
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
    const setDefaultOtherChargeCategory = (id) => {
        const target = otherChargeCategories.find((c) => c.id === id);
        if (!target)
            return false;
        return updateOtherChargeCategory(id, { isDefault: true });
    };
    const openAddOtherChargeCategoryDrawer = () => {
        setDrawerOtherChargeCategory(null);
        setIsOtherChargeCategoryDrawerOpen(true);
    };
    const openEditOtherChargeCategoryDrawer = (category) => {
        setDrawerOtherChargeCategory(category);
        setIsOtherChargeCategoryDrawerOpen(true);
    };
    const closeOtherChargeCategoryDrawer = () => {
        setIsOtherChargeCategoryDrawerOpen(false);
        setDrawerOtherChargeCategory(null);
    };
    const openDeleteOtherChargeCategoryDialog = (category) => {
        setDeleteTargetOtherChargeCategory(category);
        setIsDeleteOtherChargeCategoryDialogOpen(true);
    };
    const closeDeleteOtherChargeCategoryDialog = () => {
        setIsDeleteOtherChargeCategoryDialogOpen(false);
        setDeleteTargetOtherChargeCategory(null);
    };
    // Other Charges (Configuration) CRUD & Actions
    const addOtherCharge = (data) => {
        const newCharge = {
            ...data,
            id: `oc-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [newCharge, ...otherCharges];
        setOtherCharges(updated);
        localStorage.setItem('stayos_other_charges', JSON.stringify(updated));
        const newLog = {
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
    const updateOtherCharge = (id, updates) => {
        const updated = otherCharges.map((c) => c.id === id
            ? {
                ...c,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : c);
        setOtherCharges(updated);
        localStorage.setItem('stayos_other_charges', JSON.stringify(updated));
        const target = otherCharges.find((c) => c.id === id);
        const newLog = {
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
    const deleteOtherCharge = (id) => {
        const target = otherCharges.find((c) => c.id === id);
        const updated = otherCharges.filter((c) => c.id !== id);
        setOtherCharges(updated);
        localStorage.setItem('stayos_other_charges', JSON.stringify(updated));
        const newLog = {
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
    const openEditOtherChargeDrawer = (charge) => {
        setDrawerOtherCharge(charge);
        setIsOtherChargeDrawerOpen(true);
    };
    const closeOtherChargeDrawer = () => {
        setIsOtherChargeDrawerOpen(false);
        setDrawerOtherCharge(null);
    };
    const openDeleteOtherChargeDialog = (charge) => {
        setDeleteTargetOtherCharge(charge);
        setIsDeleteOtherChargeDialogOpen(true);
    };
    const closeDeleteOtherChargeDialog = () => {
        setIsDeleteOtherChargeDialogOpen(false);
        setDeleteTargetOtherCharge(null);
    };
    // Measurement Units (Configuration) CRUD & Actions
    const isMeasurementUnitNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !measurementUnits.some((m) => m.name.trim().toLowerCase() === trimmed && (!excludeId || m.id !== excludeId));
    };
    const isMeasurementUnitShortNameUnique = (shortName, excludeId) => {
        const trimmed = shortName.trim().toUpperCase();
        return !measurementUnits.some((m) => m.shortName.trim().toUpperCase() === trimmed && (!excludeId || m.id !== excludeId));
    };
    const addMeasurementUnit = (data) => {
        if (!isMeasurementUnitNameUnique(data.name)) {
            addToast(`A measurement unit with name "${data.name}" already exists`, 'error');
            return false;
        }
        if (!isMeasurementUnitShortNameUnique(data.shortName)) {
            addToast(`A measurement unit with short name "${data.shortName}" already exists`, 'error');
            return false;
        }
        const newUnit = {
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
        const newLog = {
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
    const updateMeasurementUnit = (id, updates) => {
        if (updates.name && !isMeasurementUnitNameUnique(updates.name, id)) {
            addToast(`A measurement unit with name "${updates.name}" already exists`, 'error');
            return false;
        }
        if (updates.shortName && !isMeasurementUnitShortNameUnique(updates.shortName, id)) {
            addToast(`A measurement unit with short name "${updates.shortName}" already exists`, 'error');
            return false;
        }
        const updated = measurementUnits.map((m) => m.id === id
            ? {
                ...m,
                ...updates,
                shortName: updates.shortName ? updates.shortName.trim().toUpperCase() : m.shortName,
                name: updates.name ? updates.name.trim() : m.name,
                description: updates.description !== undefined ? updates.description.trim() : m.description,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : m);
        setMeasurementUnits(updated);
        localStorage.setItem('stayos_measurement_units', JSON.stringify(updated));
        const target = measurementUnits.find((m) => m.id === id);
        const newLog = {
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
    const deleteMeasurementUnit = (id) => {
        const target = measurementUnits.find((m) => m.id === id);
        const updated = measurementUnits.filter((m) => m.id !== id);
        setMeasurementUnits(updated);
        localStorage.setItem('stayos_measurement_units', JSON.stringify(updated));
        const newLog = {
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
    const openEditMeasurementUnitDrawer = (unit) => {
        setDrawerMeasurementUnit(unit);
        setIsMeasurementUnitDrawerOpen(true);
    };
    const closeMeasurementUnitDrawer = () => {
        setIsMeasurementUnitDrawerOpen(false);
        setDrawerMeasurementUnit(null);
    };
    const openDeleteMeasurementUnitDialog = (unit) => {
        setDeleteTargetMeasurementUnit(unit);
        setIsDeleteMeasurementUnitDialogOpen(true);
    };
    const closeDeleteMeasurementUnitDialog = () => {
        setIsDeleteMeasurementUnitDialogOpen(false);
        setDeleteTargetMeasurementUnit(null);
    };
    // Payment Types (Configuration) CRUD & Actions
    const isPaymentTypeNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !paymentTypes.some((p) => p.name.trim().toLowerCase() === trimmed && (!excludeId || p.id !== excludeId));
    };
    const isPaymentTypeShortNameUnique = (shortName, excludeId) => {
        const trimmed = shortName.trim().toUpperCase();
        return !paymentTypes.some((p) => p.shortName.trim().toUpperCase() === trimmed && (!excludeId || p.id !== excludeId));
    };
    const addPaymentType = (data) => {
        if (!isPaymentTypeNameUnique(data.name)) {
            addToast(`A payment type with name "${data.name}" already exists`, 'error');
            return false;
        }
        if (!isPaymentTypeShortNameUnique(data.shortName)) {
            addToast(`A payment type with short name "${data.shortName}" already exists`, 'error');
            return false;
        }
        const newPaymentType = {
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
        const newLog = {
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
    const updatePaymentType = (id, updates) => {
        if (updates.name && !isPaymentTypeNameUnique(updates.name, id)) {
            addToast(`A payment type with name "${updates.name}" already exists`, 'error');
            return false;
        }
        if (updates.shortName && !isPaymentTypeShortNameUnique(updates.shortName, id)) {
            addToast(`A payment type with short name "${updates.shortName}" already exists`, 'error');
            return false;
        }
        const updated = paymentTypes.map((p) => p.id === id
            ? {
                ...p,
                ...updates,
                shortName: updates.shortName ? updates.shortName.trim().toUpperCase() : p.shortName,
                name: updates.name ? updates.name.trim() : p.name,
                description: updates.description !== undefined ? updates.description.trim() : p.description,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : p);
        setPaymentTypes(updated);
        localStorage.setItem('stayos_payment_types', JSON.stringify(updated));
        const target = paymentTypes.find((p) => p.id === id);
        const newLog = {
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
    const togglePaymentTypeStatus = (id) => {
        const target = paymentTypes.find((p) => p.id === id);
        if (!target)
            return;
        const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
        updatePaymentType(id, { status: newStatus });
    };
    const deletePaymentType = (id) => {
        const target = paymentTypes.find((p) => p.id === id);
        const updated = paymentTypes.filter((p) => p.id !== id);
        setPaymentTypes(updated);
        localStorage.setItem('stayos_payment_types', JSON.stringify(updated));
        const newLog = {
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
    const bulkDeletePaymentTypes = (ids) => {
        const updated = paymentTypes.filter((p) => !ids.includes(p.id));
        setPaymentTypes(updated);
        localStorage.setItem('stayos_payment_types', JSON.stringify(updated));
        const newLog = {
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
    const openEditPaymentTypeDrawer = (paymentType) => {
        setDrawerPaymentType(paymentType);
        setIsPaymentTypeDrawerOpen(true);
    };
    const closePaymentTypeDrawer = () => {
        setIsPaymentTypeDrawerOpen(false);
        setDrawerPaymentType(null);
    };
    const openDeletePaymentTypeDialog = (paymentType) => {
        setDeleteTargetPaymentType(paymentType);
        setIsDeletePaymentTypeDialogOpen(true);
    };
    const closeDeletePaymentTypeDialog = () => {
        setIsDeletePaymentTypeDialogOpen(false);
        setDeleteTargetPaymentType(null);
    };
    // Exchange Rates CRUD
    const isCountryExchangeRateUnique = (country, excludeId) => {
        const trimmed = country.trim().toLowerCase();
        return !exchangeRates.some((xr) => xr.country.trim().toLowerCase() === trimmed && (!excludeId || xr.id !== excludeId));
    };
    const addExchangeRate = (data) => {
        if (!isCountryExchangeRateUnique(data.country)) {
            addToast(`An exchange rate for "${data.country}" already exists`, 'error');
            return false;
        }
        const isBase = Boolean(data.isBaseRate);
        const newRate = {
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
        let updated;
        if (isBase) {
            updated = [newRate, ...exchangeRates.map((xr) => ({ ...xr, isBaseRate: false }))];
        }
        else {
            updated = [...exchangeRates, newRate];
        }
        setExchangeRates(updated);
        localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));
        const newLog = {
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
    const updateExchangeRate = (id, updates) => {
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
        const newLog = {
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
    const setBaseExchangeRate = (id) => {
        const target = exchangeRates.find((xr) => xr.id === id);
        if (!target)
            return false;
        const updated = exchangeRates.map((xr) => ({
            ...xr,
            isBaseRate: xr.id === id,
            rate: xr.id === id ? 1.0000 : xr.rate,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        }));
        setExchangeRates(updated);
        localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));
        const newLog = {
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
    const deleteExchangeRate = (id) => {
        const target = exchangeRates.find((xr) => xr.id === id);
        if (!target)
            return false;
        if (target.isBaseRate) {
            addToast('Cannot delete the Base Rate currency. Please designate another base currency first.', 'error');
            return false;
        }
        const updated = exchangeRates.filter((xr) => xr.id !== id);
        setExchangeRates(updated);
        localStorage.setItem('stayos_exchange_rates', JSON.stringify(updated));
        const newLog = {
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
    const openEditExchangeRateDrawer = (exchangeRate) => {
        setDrawerExchangeRate(exchangeRate);
        setIsExchangeRateDrawerOpen(true);
    };
    const closeExchangeRateDrawer = () => {
        setIsExchangeRateDrawerOpen(false);
        setDrawerExchangeRate(null);
    };
    const openDeleteExchangeRateDialog = (exchangeRate) => {
        setDeleteTargetExchangeRate(exchangeRate);
        setIsDeleteExchangeRateDialogOpen(true);
    };
    const closeDeleteExchangeRateDialog = () => {
        setIsDeleteExchangeRateDialogOpen(false);
        setDeleteTargetExchangeRate(null);
    };
    // Roles & Privileges CRUD
    const isRoleNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !roles.some((r) => r.name.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId));
    };
    const isRoleCodeUnique = (code, excludeId) => {
        const trimmed = code.trim().toLowerCase();
        return !roles.some((r) => r.code.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId));
    };
    const addRole = (data) => {
        if (!isRoleNameUnique(data.name)) {
            addToast(`A role named "${data.name}" already exists`, 'error');
            return false;
        }
        if (!isRoleCodeUnique(data.code)) {
            addToast(`A role with code "${data.code}" already exists`, 'error');
            return false;
        }
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const newRole = {
            ...data,
            id: `role-${Date.now()}`,
            createdAt: nowStr,
            updatedAt: nowStr,
        };
        const updated = [newRole, ...roles];
        setRoles(updated);
        localStorage.setItem('stayos_roles', JSON.stringify(updated));
        const newLog = {
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
    const updateRole = (id, updates) => {
        const target = roles.find((r) => r.id === id);
        if (!target)
            return false;
        if (updates.name && !isRoleNameUnique(updates.name, id)) {
            addToast(`A role named "${updates.name}" already exists`, 'error');
            return false;
        }
        if (updates.code && !isRoleCodeUnique(updates.code, id)) {
            addToast(`A role with code "${updates.code}" already exists`, 'error');
            return false;
        }
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const updated = roles.map((r) => r.id === id
            ? {
                ...r,
                ...updates,
                updatedAt: nowStr,
            }
            : r);
        setRoles(updated);
        localStorage.setItem('stayos_roles', JSON.stringify(updated));
        const newLog = {
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
    const deleteRole = (id) => {
        const target = roles.find((r) => r.id === id);
        if (!target)
            return false;
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
        const newLog = {
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
    const bulkDeleteRoles = (ids) => {
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
    const openEditRoleDrawer = (role) => {
        setDrawerRole(role);
        setIsRoleDrawerOpen(true);
    };
    const closeRoleDrawer = () => {
        setIsRoleDrawerOpen(false);
        setDrawerRole(null);
    };
    const openDeleteRoleDialog = (role) => {
        setDeleteTargetRole(role);
        setIsDeleteRoleDialogOpen(true);
    };
    const closeDeleteRoleDialog = () => {
        setIsDeleteRoleDialogOpen(false);
        setDeleteTargetRole(null);
    };
    // User Management CRUD
    const addUser = (data) => {
        const existing = users.find((u) => u.email.trim().toLowerCase() === data.email.trim().toLowerCase());
        if (existing) {
            addToast(`A user with email "${data.email}" already exists`, 'error');
            return false;
        }
        const newUser = {
            ...data,
            id: `usr-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [newUser, ...users];
        setUsers(updated);
        localStorage.setItem('stayos_users', JSON.stringify(updated));
        // Update role usersCount
        setRoles((prev) => prev.map((r) => (r.id === data.roleId ? { ...r, usersCount: (r.usersCount || 0) + 1 } : r)));
        const newLog = {
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
    const updateUser = (id, updates) => {
        const target = users.find((u) => u.id === id);
        if (!target)
            return false;
        if (updates.email && updates.email.trim().toLowerCase() !== target.email.toLowerCase()) {
            const existing = users.find((u) => u.email.trim().toLowerCase() === updates.email.trim().toLowerCase() && u.id !== id);
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
            setRoles((prev) => prev.map((r) => {
                if (r.id === oldRoleId)
                    return { ...r, usersCount: Math.max(0, (r.usersCount || 1) - 1) };
                if (r.id === newRoleId)
                    return { ...r, usersCount: (r.usersCount || 0) + 1 };
                return r;
            }));
        }
        const newLog = {
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
    const deleteUser = (id) => {
        const target = users.find((u) => u.id === id);
        if (!target)
            return false;
        const filtered = users.filter((u) => u.id !== id);
        setUsers(filtered);
        localStorage.setItem('stayos_users', JSON.stringify(filtered));
        // Decrement role usersCount
        setRoles((prev) => prev.map((r) => (r.id === target.roleId ? { ...r, usersCount: Math.max(0, (r.usersCount || 1) - 1) } : r)));
        const newLog = {
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
    const toggleUserStatus = (id) => {
        const target = users.find((u) => u.id === id);
        if (!target)
            return;
        const nextStatus = target.status === 'active' ? 'inactive' : 'active';
        updateUser(id, { status: nextStatus });
    };
    const openInviteUserModal = (user) => {
        if (user) {
            setDrawerUser(user);
            setEditingUserId(user.id);
        }
        else {
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
    const addEmailTemplate = (data) => {
        const existing = emailTemplates.find((t) => t.name.trim().toLowerCase() === data.name.trim().toLowerCase());
        if (existing) {
            addToast(`An email template named "${data.name}" already exists`, 'error');
            return false;
        }
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const newTemplate = {
            ...data,
            id: `tmpl-${Date.now()}`,
            createdAt: nowStr,
            updatedAt: nowStr,
        };
        const updated = [newTemplate, ...emailTemplates];
        setEmailTemplates(updated);
        localStorage.setItem('stayos_email_templates', JSON.stringify(updated));
        const newLog = {
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
    const updateEmailTemplate = (id, updates) => {
        const target = emailTemplates.find((t) => t.id === id);
        if (!target)
            return false;
        if (updates.name && updates.name.trim().toLowerCase() !== target.name.toLowerCase()) {
            const existing = emailTemplates.find((t) => t.name.trim().toLowerCase() === updates.name.trim().toLowerCase() && t.id !== id);
            if (existing) {
                addToast(`An email template named "${updates.name}" already exists`, 'error');
                return false;
            }
        }
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const updated = emailTemplates.map((t) => t.id === id
            ? {
                ...t,
                ...updates,
                updatedAt: nowStr,
            }
            : t);
        setEmailTemplates(updated);
        localStorage.setItem('stayos_email_templates', JSON.stringify(updated));
        const newLog = {
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
    const deleteEmailTemplate = (id) => {
        const target = emailTemplates.find((t) => t.id === id);
        if (!target)
            return false;
        const filtered = emailTemplates.filter((t) => t.id !== id);
        setEmailTemplates(filtered);
        localStorage.setItem('stayos_email_templates', JSON.stringify(filtered));
        const newLog = {
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
    const duplicateEmailTemplate = (id) => {
        const target = emailTemplates.find((t) => t.id === id);
        if (!target)
            return false;
        const baseName = `${target.name} (Copy)`;
        let finalName = baseName;
        let counter = 1;
        while (emailTemplates.some((t) => t.name.toLowerCase() === finalName.toLowerCase())) {
            counter++;
            finalName = `${target.name} (Copy ${counter})`;
        }
        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const copy = {
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
    const toggleEmailTemplateStatus = (id) => {
        const target = emailTemplates.find((t) => t.id === id);
        if (!target)
            return false;
        const nextStatus = target.status === 'active' ? 'inactive' : 'active';
        return updateEmailTemplate(id, { status: nextStatus });
    };
    const openAddEmailTemplateDrawer = () => {
        setDrawerEmailTemplate(null);
        setEditingEmailTemplateId(null);
        setIsEmailTemplateDrawerOpen(true);
    };
    const openEditEmailTemplateDrawer = (template) => {
        setDrawerEmailTemplate(template);
        setEditingEmailTemplateId(template.id);
        setIsEmailTemplateDrawerOpen(true);
    };
    const closeEmailTemplateDrawer = () => {
        setIsEmailTemplateDrawerOpen(false);
        setDrawerEmailTemplate(null);
        setEditingEmailTemplateId(null);
    };
    const openDeleteEmailTemplateDialog = (template) => {
        setDeleteTargetEmailTemplate(template);
        setIsDeleteEmailTemplateDialogOpen(true);
    };
    const closeDeleteEmailTemplateDialog = () => {
        setIsDeleteEmailTemplateDialogOpen(false);
        setDeleteTargetEmailTemplate(null);
    };
    // Rooms CRUD
    const isRoomNameUnique = (name, excludeId) => {
        const trimmed = name.trim().toLowerCase();
        return !rooms.some((r) => r.name.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId));
    };
    const isRoomShortNameUnique = (shortName, excludeId) => {
        const trimmed = shortName.trim().toLowerCase();
        return !rooms.some((r) => (r.shortName?.trim().toLowerCase() === trimmed || r.number?.trim().toLowerCase() === trimmed) && (!excludeId || r.id !== excludeId));
    };
    const addRoom = (data) => {
        if (!isRoomNameUnique(data.name)) {
            addToast(`A room named "${data.name}" already exists`, 'error');
            return false;
        }
        if (!isRoomShortNameUnique(data.shortName)) {
            addToast(`A room with short name "${data.shortName}" already exists`, 'error');
            return false;
        }
        const newRoom = {
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
        const newLog = {
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
    const bulkAddRooms = (roomsData) => {
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
        const newRooms = roomsData.map((data, idx) => ({
            ...data,
            id: `rm-${Date.now()}-${idx}`,
            createdAt: nowStr,
            updatedAt: nowStr,
        }));
        const updated = [...newRooms, ...rooms];
        setRooms(updated);
        localStorage.setItem('stayos_rooms', JSON.stringify(updated));
        // Update room types count
        const countsByRoomType = {};
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
        const newLog = {
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
    const updateRoom = (id, updates) => {
        const target = rooms.find((r) => r.id === id);
        if (!target)
            return false;
        if (updates.name && !isRoomNameUnique(updates.name, id)) {
            addToast(`A room named "${updates.name}" already exists`, 'error');
            return false;
        }
        if (updates.shortName && !isRoomShortNameUnique(updates.shortName, id)) {
            addToast(`A room with short name "${updates.shortName}" already exists`, 'error');
            return false;
        }
        const updated = rooms.map((r) => r.id === id
            ? {
                ...r,
                ...updates,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
            : r);
        setRooms(updated);
        localStorage.setItem('stayos_rooms', JSON.stringify(updated));
        const newLog = {
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
    const deleteRoom = (id) => {
        const target = rooms.find((r) => r.id === id);
        if (!target)
            return false;
        const filtered = rooms.filter((r) => r.id !== id);
        setRooms(filtered);
        localStorage.setItem('stayos_rooms', JSON.stringify(filtered));
        // Update room type total units
        const rt = roomTypes.find((t) => t.id === target.roomTypeId);
        if (rt && rt.totalUnits > 0) {
            updateRoomType(rt.id, { totalUnits: rt.totalUnits - 1 });
        }
        const newLog = {
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
    const openDeleteRoomDialog = (room) => {
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
    const openEditDrawer = (building) => {
        setDrawerBuilding(building);
        setIsDrawerOpen(true);
    };
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setDrawerBuilding(null);
    };
    const openDeleteDialog = (building) => {
        setDeleteTargetBuilding(building);
        setIsDeleteDialogOpen(true);
    };
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setDeleteTargetBuilding(null);
    };
    const markNotificationAsRead = (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };
    const clearAllNotifications = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        addToast('All notifications marked as read', 'info');
    };
    return (<PropertyContext.Provider value={{
            isAuthenticated,
            currentUser,
            authUsers,
            login,
            logout,
            selectPropertyAndLogin,
            isMultiPropertyModalOpen,
            setMultiPropertyModalOpen,
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
        }}>
      {children}
    </PropertyContext.Provider>);
};
export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('useProperty must be used within a PropertyProvider');
    }
    return context;
};
