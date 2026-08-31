import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Building,
  NavigationPath,
  PropertyData,
  Room,
  RoomType,
  Amenity,
  AuditLog,
  NotificationItem,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_BUILDINGS,
  INITIAL_ROOM_TYPES,
  INITIAL_ROOMS,
  INITIAL_AMENITIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface PropertyContextType {
  // Navigation
  activePath: NavigationPath;
  selectedBuildingId: string | null;
  navigate: (path: NavigationPath, buildingId?: string | null) => void;

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

  // Drawer
  isDrawerOpen: boolean;
  drawerBuilding: Building | null;
  openAddDrawer: () => void;
  openEditDrawer: (building: Building) => void;
  closeDrawer: () => void;

  // Delete Dialog
  isDeleteDialogOpen: boolean;
  deleteTargetBuilding: Building | null;
  openDeleteDialog: (building: Building) => void;
  closeDeleteDialog: () => void;

  // Verify Pin Modal
  isVerifyPinOpen: boolean;
  setVerifyPinOpen: (open: boolean) => void;

  // Search Modal
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Secondary Data
  roomTypes: RoomType[];
  rooms: Room[];
  amenities: Amenity[];
  auditLogs: AuditLog[];
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activePath, setActivePath] = useState<NavigationPath>('overview');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

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

  // Secondary Data
  const [roomTypes] = useState<RoomType[]>(INITIAL_ROOM_TYPES);
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [amenities] = useState<Amenity[]>(INITIAL_AMENITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // UI Drawers / Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerBuilding, setDrawerBuilding] = useState<Building | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetBuilding, setDeleteTargetBuilding] = useState<Building | null>(null);
  const [isVerifyPinOpen, setVerifyPinOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const navigate = (path: NavigationPath, buildingId: string | null = null) => {
    setActivePath(path);
    setSelectedBuildingId(buildingId);
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
        roomTypes,
        rooms,
        amenities,
        auditLogs,
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
