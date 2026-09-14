import React, { useState, useEffect } from 'react';
import { useProperty } from '../../context/PropertyContext';
import {
  GuestRecord,
  CommercialContact,
  ContactCategory,
  LostFoundItem,
  GuestSubMenu,
} from './types';
import {
  SAMPLE_GUESTS,
  SAMPLE_COMMERCIAL_CONTACTS,
  SAMPLE_CONTACT_CATEGORIES,
  SAMPLE_LOST_FOUND_ITEMS,
  SURAT_GUESTS,
  SURAT_COMMERCIAL_CONTACTS,
  SURAT_LOST_FOUND_ITEMS,
} from './sampleData';

import { GuestModuleNavigationHub } from './GuestModuleNavigationHub';
import { GuestDatabaseMasterList } from './GuestDatabaseMasterList';
import { AddGuestScreen } from './AddGuestScreen';
import { EditGuestScreen } from './EditGuestScreen';
import { ContactsDirectoryScreen } from './ContactsDirectoryScreen';
import { LostAndFoundLogScreen } from './LostAndFoundLogScreen';

interface GuestMasterProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const GuestMaster: React.FC<GuestMasterProps> = ({ currentPath, onNavigate }) => {
  const { currentPropertyId, currentUser } = useProperty();
  const isSurat = currentPropertyId === 'STVMC_SURAT';

  // State for all data - strictly isolated by tenant
  const [guests, setGuests] = useState<GuestRecord[]>(isSurat ? SURAT_GUESTS : SAMPLE_GUESTS);
  const [commercialContacts, setCommercialContacts] = useState<CommercialContact[]>(
    isSurat ? SURAT_COMMERCIAL_CONTACTS : SAMPLE_COMMERCIAL_CONTACTS
  );
  const [categories, setCategories] = useState<ContactCategory[]>(SAMPLE_CONTACT_CATEGORIES);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(
    isSurat ? SURAT_LOST_FOUND_ITEMS : SAMPLE_LOST_FOUND_ITEMS
  );

  // Selected records
  const [selectedGuest, setSelectedGuest] = useState<GuestRecord | null>(
    isSurat ? SURAT_GUESTS[0] : SAMPLE_GUESTS[0]
  );
  const [editingGuest, setEditingGuest] = useState<GuestRecord | null>(null);

  // Re-sync whenever active tenant changes (CAP theorem & multi-tenant isolation)
  useEffect(() => {
    async function loadTenantData() {
      const defaultTenantGuests = isSurat ? SURAT_GUESTS : SAMPLE_GUESTS;
      const defaultTenantContacts = isSurat ? SURAT_COMMERCIAL_CONTACTS : SAMPLE_COMMERCIAL_CONTACTS;
      const defaultTenantLostFound = isSurat ? SURAT_LOST_FOUND_ITEMS : SAMPLE_LOST_FOUND_ITEMS;

      try {
        const roleId = currentUser?.roleId || 1;
        const res = await fetch('/api/v1/guests', {
          headers: {
            'x-client-id': currentPropertyId,
            'x-role-id': String(roleId),
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const mappedGuests: GuestRecord[] = json.data.map((g: any) => ({
              id: g.guest_id || g.id,
              title: g.salutation || g.title || '',
              firstName: g.first_name || '',
              middleName: g.middle_name || '',
              lastName: g.last_name || '',
              suffix: '',
              birthDate: g.date_of_birth ? new Date(g.date_of_birth).toISOString().split('T')[0] : '',
              gender: g.gender || '',
              nationality: g.nationality || '',
              company: g.company || '',
              designation: g.designation || '',
              remarks: g.general_notes || g.remarks || '',
              dnrStatus: g.is_dnr ? 'dnr' : 'none',
              isVip: Boolean(g.is_vip),
              vipTier: g.vip_tier || '',
              createdDate: g.created_at ? new Date(g.created_at).toLocaleDateString() : '',
              totalStays: g.lifetime_stays || 0,
              totalNights: g.lifetime_nights || 0,
              totalSpend: parseFloat(g.lifetime_revenue || 0),
              lastVisit: '',
              lastRoom: '',
              inHouse: false,
              contacts: [],
              documents: [],
            }));
            setGuests(mappedGuests);
            setSelectedGuest(mappedGuests[0] || null);
          } else {
            setGuests(defaultTenantGuests);
            setSelectedGuest(defaultTenantGuests[0] || null);
          }
        } else {
          setGuests(defaultTenantGuests);
          setSelectedGuest(defaultTenantGuests[0] || null);
        }
      } catch (err) {
        setGuests(defaultTenantGuests);
        setSelectedGuest(defaultTenantGuests[0] || null);
      }

      setCommercialContacts(defaultTenantContacts);
      setLostFoundItems(defaultTenantLostFound);
      setEditingGuest(null);
    }

    loadTenantData();
  }, [currentPropertyId, isSurat, currentUser?.roleId]);

  // Active view
  const [activeView, setActiveView] = useState<GuestSubMenu>('guest-database');

  // Synchronize view with currentPath prop from PMS Shell
  useEffect(() => {
    if (!currentPath) return;
    const clean = currentPath.toLowerCase().replace(/^\/+/, '');

    if (clean.includes('contacts')) {
      setActiveView('contacts');
    } else if (clean.includes('lost-and-found') || clean.includes('lost_and_found')) {
      setActiveView('lost-and-found');
    } else if (clean.includes('add-guest') || clean.includes('guest-add')) {
      setActiveView('add-guest');
    } else if (clean.includes('edit-guest') || clean.includes('guest-edit')) {
      setActiveView('edit-guest');
    } else if (clean.includes('guest-database')) {
      setActiveView('guest-database');
    } else if (clean === 'guest' || clean === 'guest-hub' || clean === 'guest/hub') {
      setActiveView('hub');
    } else {
      setActiveView('guest-database');
    }
  }, [currentPath]);

  const handleNavigateView = (view: GuestSubMenu) => {
    setActiveView(view);
    if (onNavigate) {
      if (view === 'hub') onNavigate('guest');
      else if (view === 'guest-database') onNavigate('guest-database');
      else if (view === 'contacts') onNavigate('contacts');
      else if (view === 'lost-and-found') onNavigate('lost-and-found');
      else if (view === 'add-guest') onNavigate('add-guest');
      else if (view === 'edit-guest') onNavigate('edit-guest');
      else onNavigate(view);
    }
  };

  // Handlers for Guest Operations
  const handleSaveNewGuest = (newGuest: GuestRecord) => {
    setGuests([newGuest, ...guests]);
    setSelectedGuest(newGuest);
    handleNavigateView('guest-database');
  };

  const handleUpdateGuest = (updatedGuest: GuestRecord) => {
    setGuests(guests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
    setSelectedGuest(updatedGuest);
    if (editingGuest?.id === updatedGuest.id) {
      setEditingGuest(null);
      handleNavigateView('guest-database');
    }
  };

  const handleStartEditGuest = (guest: GuestRecord) => {
    setEditingGuest(guest);
    handleNavigateView('edit-guest');
  };

  // Handlers for Commercial Contacts
  const handleSaveContact = (contact: CommercialContact) => {
    const exists = commercialContacts.some((c) => c.id === contact.id);
    if (exists) {
      setCommercialContacts(
        commercialContacts.map((c) => (c.id === contact.id ? contact : c))
      );
    } else {
      setCommercialContacts([contact, ...commercialContacts]);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    setCommercialContacts(commercialContacts.filter((c) => c.id !== contactId));
  };

  // Handlers for Contact Categories
  const handleSaveCategory = (cat: ContactCategory) => {
    const exists = categories.some((c) => c.id === cat.id);
    if (exists) {
      setCategories(categories.map((c) => (c.id === cat.id ? cat : c)));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(categories.filter((c) => c.id !== catId));
  };

  // Handlers for Lost and Found
  const handleSaveLostFoundItem = (item: LostFoundItem) => {
    const exists = lostFoundItems.some((i) => i.id === item.id);
    if (exists) {
      setLostFoundItems(lostFoundItems.map((i) => (i.id === item.id ? item : i)));
    } else {
      setLostFoundItems([item, ...lostFoundItems]);
    }
  };

  const handleDeleteLostFoundItem = (itemId: string) => {
    setLostFoundItems(lostFoundItems.filter((i) => i.id !== itemId));
  };

  return (
    <div className="w-full">
      {/* 1. Hub View */}
      {activeView === 'hub' && (
        <GuestModuleNavigationHub
          guests={guests}
          onSelectSubMenu={handleNavigateView}
          onSelectGuest={(guest) => {
            setSelectedGuest(guest);
            handleNavigateView('guest-database');
          }}
          onAddGuest={() => handleNavigateView('add-guest')}
          onEditGuest={handleStartEditGuest}
          onAddContact={() => handleNavigateView('contacts')}
          onLogItem={() => handleNavigateView('lost-and-found')}
        />
      )}

      {/* 2. Guest Database Master List & Profile Inspector */}
      {activeView === 'guest-database' && (
        <GuestDatabaseMasterList
          guests={guests}
          selectedGuest={selectedGuest}
          onSelectGuest={setSelectedGuest}
          onAddGuest={() => handleNavigateView('add-guest')}
          onEditGuest={handleStartEditGuest}
          onUpdateGuest={handleUpdateGuest}
          onOpenHub={() => handleNavigateView('hub')}
        />
      )}

      {/* 3. Add Guest Screen */}
      {activeView === 'add-guest' && (
        <AddGuestScreen
          onSave={handleSaveNewGuest}
          onCancel={() => handleNavigateView('guest-database')}
        />
      )}

      {/* 4. Edit Guest Screen */}
      {activeView === 'edit-guest' && editingGuest && (
        <EditGuestScreen
          guest={editingGuest}
          onSave={handleUpdateGuest}
          onCancel={() => handleNavigateView('guest-database')}
        />
      )}

      {/* 5. Contacts Directory (Commercial Directory) */}
      {activeView === 'contacts' && (
        <ContactsDirectoryScreen
          contacts={commercialContacts}
          categories={categories}
          onSaveContact={handleSaveContact}
          onDeleteContact={handleDeleteContact}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onOpenHub={() => handleNavigateView('hub')}
        />
      )}

      {/* 6. Lost and Found Operational Log */}
      {activeView === 'lost-and-found' && (
        <LostAndFoundLogScreen
          items={lostFoundItems}
          onSaveItem={handleSaveLostFoundItem}
          onDeleteItem={handleDeleteLostFoundItem}
          onOpenHub={() => handleNavigateView('hub')}
        />
      )}
    </div>
  );
};
