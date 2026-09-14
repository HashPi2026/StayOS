import React, { useState } from 'react';
import { GuestRecord, GuestContact, GuestDocument } from './types';
import { GuestContactDrawer } from './GuestContactDrawer';
import { GuestDocumentDrawer } from './GuestDocumentDrawer';

interface GuestDatabaseMasterListProps {
  guests: GuestRecord[];
  selectedGuest: GuestRecord | null;
  onSelectGuest: (guest: GuestRecord | null) => void;
  onAddGuest: () => void;
  onEditGuest: (guest: GuestRecord) => void;
  onUpdateGuest: (updated: GuestRecord) => void;
  onOpenHub: () => void;
}

export const GuestDatabaseMasterList: React.FC<GuestDatabaseMasterListProps> = ({
  guests,
  selectedGuest,
  onSelectGuest,
  onAddGuest,
  onEditGuest,
  onUpdateGuest,
  onOpenHub,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'dnr' | 'vip' | 'in_house'>('all');
  const [inspectorTab, setInspectorTab] = useState<'personal' | 'contacts' | 'documents'>('personal');

  // Drawers state
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<GuestContact | null>(null);

  const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<GuestDocument | null>(null);

  const activeGuest = selectedGuest || guests[0];

  const filteredGuests = guests.filter((guest) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      guest.firstName.toLowerCase().includes(q) ||
      guest.lastName.toLowerCase().includes(q) ||
      guest.id.toLowerCase().includes(q) ||
      guest.company?.toLowerCase().includes(q) ||
      guest.contacts.some((c) => c.phone.includes(q) || c.email.toLowerCase().includes(q)) ||
      guest.documents.some((d) => d.documentNumber.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (activeFilter === 'dnr') return guest.dnrStatus !== 'none';
    if (activeFilter === 'vip') return guest.isVip;
    if (activeFilter === 'in_house') return guest.inHouse;
    return true;
  });

  // Handle setting a contact as primary
  const handleSetPrimaryContact = (contactId: string) => {
    if (!activeGuest) return;
    const updatedContacts = activeGuest.contacts.map((c) => ({
      ...c,
      isPrimary: c.id === contactId,
    }));
    onUpdateGuest({
      ...activeGuest,
      contacts: updatedContacts,
    });
  };

  // Handle contact save
  const handleSaveContact = (contact: GuestContact) => {
    if (!activeGuest) return;
    let updatedContacts: GuestContact[];
    const exists = activeGuest.contacts.some((c) => c.id === contact.id);

    if (exists) {
      updatedContacts = activeGuest.contacts.map((c) => {
        if (c.id === contact.id) return contact;
        if (contact.isPrimary) return { ...c, isPrimary: false };
        return c;
      });
    } else {
      updatedContacts = contact.isPrimary
        ? [...activeGuest.contacts.map((c) => ({ ...c, isPrimary: false })), contact]
        : [...activeGuest.contacts, contact];
    }

    onUpdateGuest({
      ...activeGuest,
      contacts: updatedContacts,
    });
  };

  // Handle contact delete
  const handleDeleteContact = (contactId: string) => {
    if (!activeGuest) return;
    const updatedContacts = activeGuest.contacts.filter((c) => c.id !== contactId);
    onUpdateGuest({
      ...activeGuest,
      contacts: updatedContacts,
    });
  };

  // Handle setting a document as primary
  const handleSetPrimaryDocument = (docId: string) => {
    if (!activeGuest) return;
    const updatedDocs = activeGuest.documents.map((d) => ({
      ...d,
      isPrimary: d.id === docId,
    }));
    onUpdateGuest({
      ...activeGuest,
      documents: updatedDocs,
    });
  };

  // Handle document save
  const handleSaveDocument = (doc: GuestDocument) => {
    if (!activeGuest) return;
    let updatedDocs: GuestDocument[];
    const exists = activeGuest.documents.some((d) => d.id === doc.id);

    if (exists) {
      updatedDocs = activeGuest.documents.map((d) => {
        if (d.id === doc.id) return doc;
        if (doc.isPrimary) return { ...d, isPrimary: false };
        return d;
      });
    } else {
      updatedDocs = doc.isPrimary
        ? [...activeGuest.documents.map((d) => ({ ...d, isPrimary: false })), doc]
        : [...activeGuest.documents, doc];
    }

    onUpdateGuest({
      ...activeGuest,
      documents: updatedDocs,
    });
  };

  // Handle document delete
  const handleDeleteDocument = (docId: string) => {
    if (!activeGuest) return;
    const updatedDocs = activeGuest.documents.filter((d) => d.id !== docId);
    onUpdateGuest({
      ...activeGuest,
      documents: updatedDocs,
    });
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHub}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Return to Guest Hub"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>StayOS PMS</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Guest</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-800 font-semibold">Guest Database</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Guest Database Master List & Profile Inspector
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Master Guest List as CSV...')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            Export .CSV
          </button>
          <button
            onClick={onAddGuest}
            className="px-3.5 py-1.5 rounded-lg bg-[#4472C4] hover:bg-[#3b62a8] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            + Add Guest
          </button>
        </div>
      </div>

      {/* 2-Pane Split Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Master List Table (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Search & Filter Toolbar */}
          <div className="p-3.5 border-b border-slate-100 space-y-2.5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Guest Name, Phone, Email, or Document Number..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#4472C4] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Guests (18,420)
              </button>
              <button
                onClick={() => setActiveFilter('dnr')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'dnr'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                DNR Flagged (142)
              </button>
              <button
                onClick={() => setActiveFilter('vip')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'vip'
                    ? 'bg-[#4472C4] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                VIP Members (1,240)
              </button>
              <button
                onClick={() => setActiveFilter('in_house')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'in_house'
                    ? 'bg-[#4472C4] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                In-House Now (214)
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Guest Profile & ID</th>
                  <th className="py-2.5 px-3">Affiliation</th>
                  <th className="py-2.5 px-3">Nationality</th>
                  <th className="py-2.5 px-3">Contact Details</th>
                  <th className="py-2.5 px-3">DNR Protocol</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredGuests.map((guest) => {
                  const isSelected = activeGuest?.id === guest.id;
                  const primaryContact =
                    guest.contacts.find((c) => c.isPrimary) || guest.contacts[0];

                  return (
                    <tr
                      key={guest.id}
                      onClick={() => onSelectGuest(guest)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-l-[#4472C4]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#4472C4] text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {guest.firstName[0]}
                            {guest.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              {guest.title} {guest.firstName} {guest.lastName}
                              {guest.isVip && (
                                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {guest.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="truncate block max-w-[120px] text-slate-700 font-medium">
                          {guest.company || '—'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-slate-600">{guest.nationality}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        {primaryContact ? (
                          <div className="font-mono text-[11px]">
                            <div>{primaryContact.phone}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                              {primaryContact.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {guest.dnrStatus === 'none' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="material-symbols-outlined text-[11px]">check_circle</span>
                            OK
                          </span>
                        ) : guest.dnrStatus === 'warning' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="material-symbols-outlined text-[11px]">warning</span>
                            Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-300">
                            <span className="material-symbols-outlined text-[11px]">block</span>
                            Do Not Rent
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectGuest(guest);
                          }}
                          className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                            isSelected
                              ? 'bg-[#4472C4] text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Tabbed Guest Profile Inspector (5 columns) */}
        {activeGuest && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden sticky top-20">
            {/* Inspector Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#4472C4] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {activeGuest.firstName[0]}
                  {activeGuest.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {activeGuest.title} {activeGuest.firstName} {activeGuest.lastName}
                    </h2>
                    {activeGuest.isVip && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {activeGuest.vipTier?.split('•')[0] || 'VIP Tier 1'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {activeGuest.id} • Created {activeGuest.createdDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => alert(`Printing Guest Registration Card for ${activeGuest.id}...`)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Print Guest Registration Card"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                </button>
                <button
                  onClick={() => onEditGuest(activeGuest)}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-[#4472C4] hover:bg-[#3b62a8] rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Edit Profile
                </button>
              </div>
            </div>

            {/* 3 Inspector Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
              <button
                onClick={() => setInspectorTab('personal')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inspectorTab === 'personal'
                    ? 'border-[#4472C4] text-[#4472C4]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Personal Details
              </button>

              <button
                onClick={() => setInspectorTab('contacts')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inspectorTab === 'contacts'
                    ? 'border-[#4472C4] text-[#4472C4]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Contacts
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {activeGuest.contacts.length}
                </span>
              </button>

              <button
                onClick={() => setInspectorTab('documents')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inspectorTab === 'documents'
                    ? 'border-[#4472C4] text-[#4472C4]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                Documents
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {activeGuest.documents.length}
                </span>
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="p-5 max-h-[calc(100vh-340px)] overflow-y-auto space-y-4">
              {/* TAB 1: Personal Details */}
              {inspectorTab === 'personal' && (
                <div className="space-y-4 text-xs">
                  {/* Identity & Demographics */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Identity & Demographics
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Full Name</span>
                        <span className="font-semibold text-slate-900">
                          {activeGuest.title} {activeGuest.firstName} {activeGuest.middleName || ''}{' '}
                          {activeGuest.lastName} {activeGuest.suffix || ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                        <span className="font-semibold">{activeGuest.birthDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Gender</span>
                        <span className="font-semibold">{activeGuest.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Nationality</span>
                        <span className="font-semibold">{activeGuest.nationality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Corporate Linkage */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Corporate & Commercial Linkage
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-slate-700">
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px]">Company / Entity</span>
                        <span className="font-semibold text-slate-900">
                          {activeGuest.company || 'Direct Individual (Non-corporate)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Designation</span>
                        <span className="font-semibold">{activeGuest.designation || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Department</span>
                        <span className="font-semibold">{activeGuest.department || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Remarks */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Concierge & Operational Remarks
                    </span>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{activeGuest.remarks || 'Standard guest profile; no special operational flags.'}"
                    </p>
                  </div>

                  {/* DNR Status & Compliance Audit */}
                  <div
                    className={`rounded-xl p-3.5 border space-y-2.5 ${
                      activeGuest.dnrStatus === 'none'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : activeGuest.dnrStatus === 'warning'
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-rose-50/60 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            activeGuest.dnrStatus === 'none'
                              ? 'text-emerald-600'
                              : activeGuest.dnrStatus === 'warning'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          security
                        </span>
                        DNR Status & Safety Audit
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeGuest.dnrStatus === 'none'
                            ? 'bg-emerald-100 text-emerald-800'
                            : activeGuest.dnrStatus === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {activeGuest.dnrStatus === 'none'
                          ? 'No (OK)'
                          : activeGuest.dnrStatus === 'warning'
                          ? 'Warning Active'
                          : 'Do Not Rent (Blocked)'}
                      </span>
                    </div>

                    {activeGuest.dnrStatus !== 'none' && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1 text-slate-800">
                        <div className="font-semibold text-rose-800">
                          Incident Reason: {activeGuest.dnrReason}
                        </div>
                        {activeGuest.incidentRef && (
                          <div className="text-[10px] font-mono text-slate-500">
                            Log Ref: {activeGuest.incidentRef}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Contacts */}
              {inspectorTab === 'contacts' && (
                <div className="space-y-4 text-xs">
                  {/* Single-Primary Rule Callout */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#4472C4] shrink-0 mt-0.5">
                      info
                    </span>
                    <span className="text-[11px] leading-relaxed">
                      <strong>Single-Primary Enforcement:</strong> Each guest profile maintains exactly one verified Primary Contact channel for folio dispatch and critical stay alerts.
                    </span>
                  </div>

                  {/* Repeatable Contact Cards */}
                  <div className="space-y-3">
                    {activeGuest.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          contact.isPrimary
                            ? 'bg-blue-50/30 border-blue-300 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="primaryContactRadio"
                              checked={contact.isPrimary}
                              onChange={() => handleSetPrimaryContact(contact.id)}
                              className="w-4 h-4 text-[#4472C4] cursor-pointer"
                              title="Set as active Primary Contact"
                            />
                            <span className="font-bold text-slate-900">{contact.contactType}</span>
                            {contact.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#4472C4] text-white">
                                PRIMARY
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingContact(contact);
                                setContactDrawerOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-[#4472C4] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              disabled={contact.isPrimary}
                              onClick={() => handleDeleteContact(contact.id)}
                              className={`p-1 rounded transition-colors ${
                                contact.isPrimary
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                              }`}
                              title={contact.isPrimary ? 'Cannot delete primary contact' : 'Delete'}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                            <span className="font-mono font-medium">{contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                            <span className="font-medium text-slate-800">{contact.email}</span>
                            {contact.folioDispatch && (
                              <span className="text-[9px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                Folio Dispatch
                              </span>
                            )}
                          </div>
                          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
                            <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0 mt-0.5">
                              home
                            </span>
                            <span>
                              {contact.street}, {contact.city}, {contact.state} {contact.zip}, {contact.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Contact Button */}
                  <button
                    onClick={() => {
                      setEditingContact(null);
                      setContactDrawerOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4472C4] text-slate-600 hover:text-[#4472C4] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    + Add New Contact Channel
                  </button>
                </div>
              )}

              {/* TAB 3: Documents */}
              {inspectorTab === 'documents' && (
                <div className="space-y-4 text-xs">
                  {/* Police & Tax Compliance Banner */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700 shrink-0 mt-0.5">
                      verified
                    </span>
                    <span className="text-[11px] leading-relaxed">
                      <strong>Police & Municipal Audit Sync:</strong> Registered identity documents are logged for statutory stay verification and tax exemption compliance.
                    </span>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {activeGuest.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          doc.isPrimary
                            ? 'bg-blue-50/30 border-blue-300 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="primaryDocRadio"
                              checked={doc.isPrimary}
                              onChange={() => handleSetPrimaryDocument(doc.id)}
                              className="w-4 h-4 text-[#4472C4] cursor-pointer"
                              title="Set as active Primary Identification"
                            />
                            <span className="font-bold text-slate-900">{doc.documentType}</span>
                            {doc.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#4472C4] text-white">
                                PRIMARY ID
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingDocument(doc);
                                setDocumentDrawerOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-[#4472C4] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              disabled={doc.isPrimary}
                              onClick={() => handleDeleteDocument(doc.id)}
                              className={`p-1 rounded transition-colors ${
                                doc.isPrimary
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                              }`}
                              title={doc.isPrimary ? 'Cannot delete primary document' : 'Delete'}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {doc.documentNumber}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              EXP: <strong>{doc.validTill}</strong>
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600">
                            Name on Document: <span className="font-semibold">{doc.nameOnDocument}</span>
                          </div>

                          <div className="text-[10px] text-slate-500">
                            Issued by: {doc.issuedBy} • {doc.issuePlace}
                          </div>

                          {/* Scanned Badge Card */}
                          <div className="pt-2 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                            <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                              <span className="material-symbols-outlined text-[13px]">document_scanner</span>
                              Biometrics Authenticated
                            </span>
                            <button
                              onClick={() => {
                                setEditingDocument(doc);
                                setDocumentDrawerOpen(true);
                              }}
                              className="text-[10px] font-bold text-[#4472C4] hover:underline"
                            >
                              View Scans & OCR
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Document Button */}
                  <button
                    onClick={() => {
                      setEditingDocument(null);
                      setDocumentDrawerOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4472C4] text-slate-600 hover:text-[#4472C4] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    + Add New Identity Document
                  </button>
                </div>
              )}
            </div>

            {/* Inspector Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                Immutable Folio Vault
              </span>
              <button
                onClick={() => onSelectGuest(null)}
                className="px-3 py-1 font-semibold text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in Drawers */}
      {activeGuest && (
        <>
          <GuestContactDrawer
            isOpen={contactDrawerOpen}
            onClose={() => setContactDrawerOpen(false)}
            guest={activeGuest}
            contact={editingContact}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
          />

          <GuestDocumentDrawer
            isOpen={documentDrawerOpen}
            onClose={() => setDocumentDrawerOpen(false)}
            guest={activeGuest}
            document={editingDocument}
            onSave={handleSaveDocument}
            onDelete={handleDeleteDocument}
          />
        </>
      )}
    </div>
  );
};
