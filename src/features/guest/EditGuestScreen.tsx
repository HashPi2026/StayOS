import React, { useState } from 'react';
import { GuestRecord, GuestContact, GuestDocument } from './types';
import { GuestContactDrawer } from './GuestContactDrawer';
import { GuestDocumentDrawer } from './GuestDocumentDrawer';

interface EditGuestScreenProps {
  guest: GuestRecord;
  onSave: (updated: GuestRecord) => void;
  onCancel: () => void;
}

export const EditGuestScreen: React.FC<EditGuestScreenProps> = ({ guest, onSave, onCancel }) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'dnr' | 'contacts' | 'documents'>('personal');

  // Form State
  const [title, setTitle] = useState(guest.title);
  const [firstName, setFirstName] = useState(guest.firstName);
  const [middleName, setMiddleName] = useState(guest.middleName || '');
  const [lastName, setLastName] = useState(guest.lastName);
  const [suffix, setSuffix] = useState(guest.suffix || '');
  const [birthDate, setBirthDate] = useState(guest.birthDate);
  const [gender, setGender] = useState(guest.gender);
  const [nationality, setNationality] = useState(guest.nationality);
  const [company, setCompany] = useState(guest.company || '');
  const [designation, setDesignation] = useState(guest.designation || '');
  const [department, setDepartment] = useState(guest.department || '');
  const [remarks, setRemarks] = useState(guest.remarks || '');

  // DNR State
  const [dnrStatus, setDnrStatus] = useState(guest.dnrStatus);
  const [dnrReason, setDnrReason] = useState(guest.dnrReason || '');
  const [incidentRef, setIncidentRef] = useState(guest.incidentRef || '');

  // Contacts and Documents
  const [contacts, setContacts] = useState<GuestContact[]>(guest.contacts);
  const [documents, setDocuments] = useState<GuestDocument[]>(guest.documents);

  // Drawers
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<GuestContact | null>(null);

  const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<GuestDocument | null>(null);

  const handleSetPrimaryContact = (contactId: string) => {
    setContacts(contacts.map((c) => ({ ...c, isPrimary: c.id === contactId })));
  };

  const handleSaveContactFromDrawer = (c: GuestContact) => {
    const exists = contacts.some((item) => item.id === c.id);
    if (exists) {
      setContacts(
        contacts.map((item) => {
          if (item.id === c.id) return c;
          if (c.isPrimary) return { ...item, isPrimary: false };
          return item;
        })
      );
    } else {
      setContacts(
        c.isPrimary
          ? [...contacts.map((item) => ({ ...item, isPrimary: false })), c]
          : [...contacts, c]
      );
    }
  };

  const handleDeleteContactFromDrawer = (contactId: string) => {
    setContacts(contacts.filter((c) => c.id !== contactId));
  };

  const handleSetPrimaryDocument = (docId: string) => {
    setDocuments(documents.map((d) => ({ ...d, isPrimary: d.id === docId })));
  };

  const handleSaveDocumentFromDrawer = (d: GuestDocument) => {
    const exists = documents.some((item) => item.id === d.id);
    if (exists) {
      setDocuments(
        documents.map((item) => {
          if (item.id === d.id) return d;
          if (d.isPrimary) return { ...item, isPrimary: false };
          return item;
        })
      );
    } else {
      setDocuments(
        d.isPrimary
          ? [...documents.map((item) => ({ ...item, isPrimary: false })), d]
          : [...documents, d]
      );
    }
  };

  const handleDeleteDocumentFromDrawer = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('First and Last names are mandatory.');
      return;
    }

    if (dnrStatus !== 'none' && !dnrReason.trim()) {
      alert('Please provide a mandatory reason for the DNR / Warning restriction.');
      return;
    }

    const updated: GuestRecord = {
      ...guest,
      title,
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      suffix: suffix.trim() || undefined,
      birthDate,
      gender,
      nationality,
      company: company.trim() || undefined,
      designation: designation.trim() || undefined,
      department: department.trim() || undefined,
      remarks: remarks.trim() || undefined,
      dnrStatus,
      dnrReason: dnrStatus !== 'none' ? dnrReason.trim() : undefined,
      incidentRef: incidentRef.trim() || undefined,
      contacts,
      documents,
    };

    onSave(updated);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Guest</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Guest Database</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-800 font-semibold">Edit Guest Profile</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Edit Guest: {guest.title} {guest.firstName} {guest.lastName}
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-100 text-slate-700">
                {guest.id}
              </span>
              {guest.isVip && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-900">
                  {guest.vipTier || 'VIP Tier 1'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-[#4472C4] hover:bg-[#3b62a8] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Profile Changes
          </button>
        </div>
      </div>

      {/* Main Form Grid with Left Sticky Nav Rail */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
        {/* Left Form Navigation Rail (3 cols) */}
        <div className="lg:col-span-3 space-y-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            <span className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Profile Sections
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('personal')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'personal'
                  ? 'bg-[#4472C4] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span>
                1. Personal Details
              </div>
              <span className="text-[10px] opacity-75">Required</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('dnr')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'dnr'
                  ? 'bg-[#4472C4] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">security</span>
                2. DNR Compliance
              </div>
              <span className="text-[10px] opacity-75">
                {dnrStatus === 'none' ? 'OK' : 'Flagged'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('contacts')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'contacts'
                  ? 'bg-[#4472C4] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call</span>
                3. Contacts Directory
              </div>
              <span className="text-[10px] opacity-75">{contacts.length} Active</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('documents')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'documents'
                  ? 'bg-[#4472C4] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                4. Identity Documents
              </div>
              <span className="text-[10px] opacity-75">{documents.length} Records</span>
            </button>
          </div>

          {/* Stay Ledger Summary Mini Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <span>Historical Stay Summary</span>
              <span className="text-[#4472C4]">{guest.totalStays} Stays</span>
            </div>
            <div className="space-y-1 text-slate-500 text-[11px]">
              <div className="flex justify-between">
                <span>Nights Logged:</span>
                <span className="font-semibold text-slate-800">{guest.totalNights} Nights</span>
              </div>
              <div className="flex justify-between">
                <span>Total Folio Spend:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  ${guest.totalSpend.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Departure:</span>
                <span className="font-semibold text-slate-800">{guest.lastVisit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Body (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: Personal Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">person</span>
                1. Personal Details & Commercial Affiliation
              </h2>
              <span className="text-xs text-slate-400 font-medium">Core Demographics</span>
            </div>

            {/* Name Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Title</label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Sheikh">Sheikh</option>
                  <option value="Hon.">Hon.</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                />
              </div>
            </div>

            {/* Corporate Linkage */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Corporate Linkage
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Associated Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Hughes Biotechnology AG"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Designation / Title</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            {/* Operational Remarks */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Concierge & Operational Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
              />
            </div>
          </div>

          {/* SECTION 2: DNR Compliance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[20px]">gavel</span>
                2. DNR (Do Not Rent) Compliance & Safety Protocol
              </h2>
              <span className="text-xs text-slate-400 font-medium">Risk & Security Audit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1 */}
              <div
                onClick={() => setDnrStatus('none')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  dnrStatus === 'none'
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                    No (OK)
                  </span>
                  <input
                    type="radio"
                    checked={dnrStatus === 'none'}
                    onChange={() => setDnrStatus('none')}
                    className="w-4 h-4 text-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Standard guest profile; clear for reservations and check-in without alerts.
                </p>
              </div>

              {/* Option 2 */}
              <div
                onClick={() => setDnrStatus('warning')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  dnrStatus === 'warning'
                    ? 'bg-amber-50/70 border-amber-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                    Yes (Warning Flag)
                  </span>
                  <input
                    type="radio"
                    checked={dnrStatus === 'warning'}
                    onChange={() => setDnrStatus('warning')}
                    className="w-4 h-4 text-amber-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Alert front desk; supervisor sign-off required prior to key issue.
                </p>
              </div>

              {/* Option 3 */}
              <div
                onClick={() => setDnrStatus('blocked')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  dnrStatus === 'blocked'
                    ? 'bg-rose-50/70 border-rose-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-rose-600">block</span>
                    Yes (Do Not Rent)
                  </span>
                  <input
                    type="radio"
                    checked={dnrStatus === 'blocked'}
                    onChange={() => setDnrStatus('blocked')}
                    className="w-4 h-4 text-rose-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Critical property-wide block; halts reservation creation and folio allocation.
                </p>
              </div>
            </div>

            {/* Conditional DNR Details */}
            {dnrStatus !== 'none' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                  <span className="material-symbols-outlined text-[18px]">report</span>
                  Mandatory DNR Incident Reference & Reason
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-rose-900">
                    Restriction Reason <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={dnrReason}
                    onChange={(e) => setDnrReason(e.target.value)}
                    placeholder="Document exact incident, damage, payment default, or policy violation..."
                    className="w-full p-2.5 text-xs bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-rose-900">
                    Incident / Police Log Reference
                  </label>
                  <input
                    type="text"
                    value={incidentRef}
                    onChange={(e) => setIncidentRef(e.target.value)}
                    placeholder="e.g. INC-2026-0419"
                    className="w-full h-9 px-3 text-xs bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Contacts Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">call</span>
                3. Contacts Directory & Dispatch Channels
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedContact(null);
                  setContactDrawerOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#4472C4] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Contact Channel
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 rounded-xl border transition-all ${
                    contact.isPrimary
                      ? 'bg-blue-50/40 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editGuestPrimaryContactRadio"
                        checked={contact.isPrimary}
                        onChange={() => handleSetPrimaryContact(contact.id)}
                        className="w-4 h-4 text-[#4472C4] cursor-pointer"
                        title="Designate as active primary"
                      />
                      <span className="font-bold text-xs text-slate-900">{contact.contactType}</span>
                      {contact.isPrimary && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#4472C4] text-white">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContact(contact);
                          setContactDrawerOpen(true);
                        }}
                        className="px-2 py-1 text-xs font-semibold text-[#4472C4] hover:bg-blue-100 rounded cursor-pointer"
                      >
                        Edit in Drawer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone:</span>
                      <span className="font-mono font-medium">{contact.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email:</span>
                      <span className="font-medium text-slate-800">{contact.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Address:</span>
                      <span className="truncate block text-slate-600">
                        {contact.street}, {contact.city} {contact.state}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: Identity Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">badge</span>
                4. Identity Documents & Travel Credentials
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedDocument(null);
                  setDocumentDrawerOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#4472C4] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Identity Document
              </button>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all ${
                    doc.isPrimary
                      ? 'bg-blue-50/40 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editGuestPrimaryDocRadio"
                        checked={doc.isPrimary}
                        onChange={() => handleSetPrimaryDocument(doc.id)}
                        className="w-4 h-4 text-[#4472C4] cursor-pointer"
                        title="Designate as active primary"
                      />
                      <span className="font-bold text-xs text-slate-900">{doc.documentType}</span>
                      {doc.isPrimary && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#4472C4] text-white">
                          PRIMARY ID
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setDocumentDrawerOpen(true);
                        }}
                        className="px-2 py-1 text-xs font-semibold text-[#4472C4] hover:bg-blue-100 rounded cursor-pointer"
                      >
                        Edit in Drawer & Scan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document #:</span>
                      <span className="font-mono font-bold">{doc.documentNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valid Till (Expiry):</span>
                      <span className="font-medium text-slate-800">{doc.validTill}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Name on Doc:</span>
                      <span className="truncate block font-semibold text-slate-800">
                        {doc.nameOnDocument}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Persistent Bottom Action Dock */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-[220px] bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 z-40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          <span>Active Record Sync: Ready to save edits for {guest.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel & Revert
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-xs font-bold text-white bg-[#4472C4] hover:bg-[#3b62a8] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Profile Changes
          </button>
        </div>
      </div>

      {/* Slide-in Drawers */}
      <GuestContactDrawer
        isOpen={contactDrawerOpen}
        onClose={() => setContactDrawerOpen(false)}
        guest={guest}
        contact={selectedContact}
        onSave={handleSaveContactFromDrawer}
        onDelete={handleDeleteContactFromDrawer}
      />

      <GuestDocumentDrawer
        isOpen={documentDrawerOpen}
        onClose={() => setDocumentDrawerOpen(false)}
        guest={guest}
        document={selectedDocument}
        onSave={handleSaveDocumentFromDrawer}
        onDelete={handleDeleteDocumentFromDrawer}
      />
    </div>
  );
};
