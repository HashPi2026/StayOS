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

function mapApiGuestToGuestRecord(g: any): GuestRecord {
  return {
    id: g.guest_code || (g.guest_id ? `GST-${g.guest_id}` : g.id),
    dbGuestId: g.guest_id || undefined,
    title: g.title || g.salutation || 'Mr.',
    firstName: g.first_name || '',
    middleName: g.middle_name || '',
    lastName: g.last_name || '',
    suffix: g.suffix || '',
    birthDate: g.birth_date
      ? typeof g.birth_date === 'string'
        ? g.birth_date.split('T')[0]
        : new Date(g.birth_date).toISOString().split('T')[0]
      : '',
    gender: (g.gender || 'Prefer not to say') as any,
    nationality: g.nationality || '',
    company: g.company || '',
    designation: g.designation || '',
    department: g.department || '',
    remarks: g.guest_remark || g.remarks || g.general_notes || '',
    dnrStatus: g.dnr_status === 'Yes' ? 'blocked' : g.dnr_status === 'Yes Warning' ? 'warning' : 'none',
    dnrReason: g.dnr_reason || '',
    isVip: Boolean(g.is_vip),
    vipTier: g.vip_tier || '',
    createdDate: g.created_date || (g.created_at ? new Date(g.created_at).toLocaleDateString() : ''),
    totalStays: Number(g.total_stays || g.lifetime_stays || 0),
    totalNights: Number(g.total_nights || g.lifetime_nights || 0),
    totalSpend: parseFloat(g.total_spend || g.lifetime_revenue || 0),
    lastVisit: g.last_visit || '',
    lastRoom: g.last_room || '',
    inHouse: Boolean(g.in_house),
    contacts: Array.isArray(g.contacts)
      ? g.contacts.map((c: any) => ({
          id: String(c.guest_contact_id || c.id || Math.random()),
          isPrimary: Boolean(c.is_primary),
          contactType: c.contact_type || 'Mobile / Personal',
          phone: c.phone_number || c.phone || '',
          countryCode: c.country_code || '+1',
          email: c.email_address || c.email || '',
          folioDispatch: Boolean(c.folio_dispatch),
          addressType: c.address_type || 'Primary Residence',
          street: c.address || c.street || '',
          city: c.city || '',
          state: c.state || '',
          zip: c.zip_code || c.zip || '',
          country: c.country || '',
        }))
      : [],
    documents: Array.isArray(g.documents)
      ? g.documents.map((d: any) => ({
          id: String(d.guest_document_id || d.id || Math.random()),
          isPrimary: Boolean(d.is_primary),
          documentType: d.document_name || d.document_type_short_name || d.documentType || 'Passport',
          documentNumber: d.document_number || d.documentNumber || '',
          validTill: d.valid_till
            ? typeof d.valid_till === 'string'
              ? d.valid_till.split('T')[0]
              : new Date(d.valid_till).toISOString().split('T')[0]
            : '',
          nameOnDocument: d.name_on_document || d.nameOnDocument || '',
          issuedBy: d.issued_by || d.issuedBy || '',
          issuePlace: d.issue_place || d.issuePlace || '',
          registeredAddress: {
            street: d.address || '',
            city: d.city || '',
            state: d.state || '',
            zip: d.zip_code || '',
            country: d.country || '',
          },
          remarks: d.remark || d.remarks || '',
          isOcrVerified: Boolean(d.is_ocr_verified),
        }))
      : [],
  };
}

export const GuestMaster: React.FC<GuestMasterProps> = ({ currentPath, onNavigate }) => {
  const { currentPropertyId, currentUser, addToast } = useProperty();
  const isSurat = currentPropertyId === '10002' || currentPropertyId === 'STVMC_SURAT';
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Function to load and sync data with backend
  const fetchTenantData = async (showToast = false) => {
    setIsRefreshing(true);
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
          const mappedGuests: GuestRecord[] = json.data.map(mapApiGuestToGuestRecord);
          setGuests(mappedGuests);
          setSelectedGuest((prev) => {
            if (!prev) return mappedGuests[0] || null;
            const stillExists = mappedGuests.find((g) => g.id === prev.id || (g.dbGuestId && g.dbGuestId === prev.dbGuestId));
            return stillExists || mappedGuests[0] || null;
          });
          if (showToast) {
            addToast(`Synced ${mappedGuests.length} guests directly from database`, 'success');
          }
        } else {
          setGuests(defaultTenantGuests);
          setSelectedGuest(defaultTenantGuests[0] || null);
        }
      } else {
        setGuests(defaultTenantGuests);
        setSelectedGuest(defaultTenantGuests[0] || null);
      }
    } catch (err) {
      console.warn('Network or server error during guest synchronization:', err);
      setGuests(defaultTenantGuests);
      setSelectedGuest(defaultTenantGuests[0] || null);
    } finally {
      setIsRefreshing(false);
    }

    setCommercialContacts(defaultTenantContacts);
    setLostFoundItems(defaultTenantLostFound);
  };

  // Re-sync whenever active tenant changes (CAP theorem & multi-tenant isolation)
  useEffect(() => {
    fetchTenantData(false);
    setEditingGuest(null);
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
  const handleSaveNewGuest = async (newGuest: GuestRecord) => {
    // Optimistically add to UI state
    setGuests((prev) => [newGuest, ...prev]);
    setSelectedGuest(newGuest);
    handleNavigateView('guest-database');

    try {
      const res = await fetch('/api/v1/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': currentPropertyId,
          'x-role-id': String(currentUser?.roleId || 1),
        },
        body: JSON.stringify({
          title: newGuest.title,
          first_name: newGuest.firstName,
          middle_name: newGuest.middleName || null,
          last_name: newGuest.lastName,
          suffix: newGuest.suffix || null,
          birth_date: newGuest.birthDate || null,
          gender: newGuest.gender,
          nationality: newGuest.nationality,
          company: newGuest.company || null,
          designation: newGuest.designation || null,
          department: newGuest.department || null,
          guest_remark: newGuest.remarks || null,
          dnr_status: newGuest.dnrStatus === 'blocked' ? 'Yes' : (newGuest.dnrStatus === 'warning' ? 'Yes Warning' : 'No'),
          dnr_reason: newGuest.dnrReason || null,
          guest_code: newGuest.id,
          is_vip: newGuest.isVip,
          vip_tier: newGuest.vipTier || null,
          total_stays: newGuest.totalStays || 0,
          total_nights: newGuest.totalNights || 0,
          total_spend: newGuest.totalSpend || 0,
          last_visit: newGuest.lastVisit || 'New Profile',
          last_room: newGuest.lastRoom || '—',
          in_house: newGuest.inHouse || false,
          created_date: newGuest.createdDate || null,
          contacts: newGuest.contacts.map((c) => ({
            contact_type: c.contactType,
            is_primary: c.isPrimary,
            phone_number: c.phone,
            email_address: c.email,
            address_type: c.addressType,
            address: c.street,
            city: c.city,
            state: c.state,
            zip_code: c.zip,
            country: c.country,
            folio_dispatch: c.folioDispatch,
            country_code: c.countryCode,
          })),
          documents: newGuest.documents.map((d) => ({
            document_type_id: (d as any).document_type_id || undefined,
            document_name: d.documentType,
            document_number: d.documentNumber,
            valid_till: d.validTill || null,
            name_on_document: d.nameOnDocument,
            issued_by: d.issuedBy,
            issue_place: d.issuePlace,
            is_primary: d.isPrimary,
            address: d.registeredAddress?.street || '',
            city: d.registeredAddress?.city || '',
            state: d.registeredAddress?.state || '',
            zip_code: d.registeredAddress?.zip || '',
            country: d.registeredAddress?.country || 'United States',
            remark: d.remarks || null,
            is_ocr_verified: d.isOcrVerified,
          })),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const apiData = json.data || json;
        if (apiData && (apiData.guest_id || apiData.guest_code)) {
          const syncedGuest = mapApiGuestToGuestRecord(apiData);
          setGuests((prev) => prev.map((g) => (g.id === newGuest.id ? syncedGuest : g)));
          setSelectedGuest(syncedGuest);
        }
        addToast(`Guest ${newGuest.firstName} ${newGuest.lastName} (${newGuest.id}) persisted to PostgreSQL`, 'success');
      } else {
        const errorJson = await res.json().catch(() => ({}));
        addToast(`Server error saving guest: ${errorJson.message || res.statusText}`, 'error');
      }
    } catch (err) {
      console.warn('Failed to persist guest to database:', err);
      addToast('Failed to reach server to persist guest', 'error');
    }
  };

  const handleUpdateGuest = async (updatedGuest: GuestRecord) => {
    setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
    setSelectedGuest(updatedGuest);
    if (editingGuest?.id === updatedGuest.id) {
      setEditingGuest(null);
      handleNavigateView('guest-database');
    }

    try {
      const guestIdParam = updatedGuest.dbGuestId || (updatedGuest.id.match(/\d+/) ? updatedGuest.id.match(/\d+/)![0] : updatedGuest.id);
      const res = await fetch(`/api/v1/guests/${guestIdParam}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': currentPropertyId,
          'x-role-id': String(currentUser?.roleId || 1),
        },
        body: JSON.stringify({
          title: updatedGuest.title,
          first_name: updatedGuest.firstName,
          middle_name: updatedGuest.middleName || null,
          last_name: updatedGuest.lastName,
          suffix: updatedGuest.suffix || null,
          birth_date: updatedGuest.birthDate || null,
          gender: updatedGuest.gender,
          nationality: updatedGuest.nationality,
          company: updatedGuest.company || null,
          designation: updatedGuest.designation || null,
          department: updatedGuest.department || null,
          guest_remark: updatedGuest.remarks || null,
          dnr_status: updatedGuest.dnrStatus === 'blocked' ? 'Yes' : (updatedGuest.dnrStatus === 'warning' ? 'Yes Warning' : 'No'),
          dnr_reason: updatedGuest.dnrReason || null,
          guest_code: updatedGuest.id,
          is_vip: updatedGuest.isVip,
          vip_tier: updatedGuest.vipTier || null,
          total_stays: updatedGuest.totalStays || 0,
          total_nights: updatedGuest.totalNights || 0,
          total_spend: updatedGuest.totalSpend || 0,
          last_visit: updatedGuest.lastVisit || 'New Profile',
          last_room: updatedGuest.lastRoom || '—',
          in_house: updatedGuest.inHouse || false,
          contacts: updatedGuest.contacts.map((c) => ({
            contact_type: c.contactType,
            is_primary: c.isPrimary,
            phone_number: c.phone,
            email_address: c.email,
            address_type: c.addressType,
            address: c.street,
            city: c.city,
            state: c.state,
            zip_code: c.zip,
            country: c.country,
            folio_dispatch: c.folioDispatch,
            country_code: c.countryCode,
          })),
          documents: updatedGuest.documents.map((d) => ({
            document_type_id: (d as any).document_type_id || undefined,
            document_name: d.documentType,
            document_number: d.documentNumber,
            valid_till: d.validTill || null,
            name_on_document: d.nameOnDocument,
            issued_by: d.issuedBy,
            issue_place: d.issuePlace,
            is_primary: d.isPrimary,
            address: d.registeredAddress?.street || '',
            city: d.registeredAddress?.city || '',
            state: d.registeredAddress?.state || '',
            zip_code: d.registeredAddress?.zip || '',
            country: d.registeredAddress?.country || 'United States',
            remark: d.remarks || null,
            is_ocr_verified: d.isOcrVerified,
          })),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const apiData = json.data || json;
        if (apiData) {
          const syncedGuest = mapApiGuestToGuestRecord(apiData);
          setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? syncedGuest : g)));
          setSelectedGuest(syncedGuest);
        }
        addToast(`Guest profile for ${updatedGuest.firstName} ${updatedGuest.lastName} updated in database`, 'success');
      } else {
        addToast('Error updating guest profile in database', 'error');
      }
    } catch (err) {
      console.warn('Failed to update guest in database:', err);
      addToast('Network error updating guest in database', 'error');
    }
  };

  const handleDeleteGuest = async (guest: GuestRecord) => {
    const guestIdParam = guest.dbGuestId || (guest.id.match(/\d+/) ? guest.id.match(/\d+/)![0] : guest.id);
    // Optimistic removal from UI state
    setGuests((prev) => prev.filter((g) => g.id !== guest.id));
    setSelectedGuest((prev) => (prev?.id === guest.id ? null : prev));

    try {
      const res = await fetch(`/api/v1/guests/${guestIdParam}`, {
        method: 'DELETE',
        headers: {
          'x-client-id': currentPropertyId,
          'x-role-id': String(currentUser?.roleId || 1),
        },
      });

      if (res.ok) {
        addToast(`Guest ${guest.firstName} ${guest.lastName} deleted from database`, 'info');
      } else {
        addToast('Failed to delete guest from database', 'error');
        // Refresh to restore accurate state
        fetchTenantData(false);
      }
    } catch (err) {
      console.warn('Failed to delete guest in database:', err);
      addToast('Network error deleting guest in database', 'error');
      fetchTenantData(false);
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
          onDeleteGuest={handleDeleteGuest}
          onRefresh={() => fetchTenantData(true)}
          isRefreshing={isRefreshing}
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
