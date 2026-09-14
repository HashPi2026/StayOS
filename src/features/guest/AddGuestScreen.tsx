import React, { useState } from 'react';
import { GuestRecord, GuestContact, GuestDocument } from './types';

interface AddGuestScreenProps {
  onSave: (guest: GuestRecord) => void;
  onCancel: () => void;
}

export const AddGuestScreen: React.FC<AddGuestScreenProps> = ({ onSave, onCancel }) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'dnr' | 'contacts' | 'documents'>('personal');

  // Form State
  const [title, setTitle] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say'>('Male');
  const [nationality, setNationality] = useState('United States');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [remarks, setRemarks] = useState('');

  // DNR State
  const [dnrStatus, setDnrStatus] = useState<'none' | 'warning' | 'blocked'>('none');
  const [dnrReason, setDnrReason] = useState('');
  const [incidentRef, setIncidentRef] = useState('');

  // Contacts State
  const [contacts, setContacts] = useState<GuestContact[]>([
    {
      id: 'CNT-NEW-01',
      isPrimary: true,
      contactType: 'Mobile / Personal',
      phone: '',
      countryCode: '+1',
      email: '',
      folioDispatch: true,
      addressType: 'Primary Residence',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
    },
  ]);

  // Documents State
  const [documents, setDocuments] = useState<GuestDocument[]>([
    {
      id: 'DOC-NEW-01',
      isPrimary: true,
      documentType: 'Passport',
      documentNumber: '',
      validTill: '2030-12-31',
      nameOnDocument: '',
      issuedBy: 'Department of State',
      issuePlace: 'Washington D.C.',
      registeredAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
      },
      remarks: 'Standard passport verification at check-in.',
      isOcrVerified: true,
      frontScanUrl: 'front_scan.png',
      backScanUrl: 'back_scan.png',
    },
  ]);

  const handleAddContactSlot = () => {
    const newId = `CNT-NEW-${String(contacts.length + 1).padStart(2, '0')}`;
    setContacts([
      ...contacts,
      {
        id: newId,
        isPrimary: false,
        contactType: 'Office / Executive Assistant',
        phone: '',
        countryCode: '+1',
        email: '',
        folioDispatch: false,
        addressType: 'Corporate HQ',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
      },
    ]);
  };

  const handleSetPrimaryContact = (idx: number) => {
    setContacts(contacts.map((c, i) => ({ ...c, isPrimary: i === idx })));
  };

  const handleRemoveContact = (idx: number) => {
    if (contacts[idx].isPrimary) {
      alert('Cannot delete active primary contact. Please assign another contact as Primary first.');
      return;
    }
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const handleAddDocumentSlot = () => {
    const newId = `DOC-NEW-${String(documents.length + 1).padStart(2, '0')}`;
    setDocuments([
      ...documents,
      {
        id: newId,
        isPrimary: false,
        documentType: 'Driver License',
        documentNumber: '',
        validTill: '2028-12-31',
        nameOnDocument: '',
        issuedBy: 'State Department of Motor Vehicles',
        issuePlace: 'State Authority',
        registeredAddress: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'United States',
        },
        remarks: 'Secondary identity document.',
        isOcrVerified: true,
      },
    ]);
  };

  const handleSetPrimaryDocument = (idx: number) => {
    setDocuments(documents.map((d, i) => ({ ...d, isPrimary: i === idx })));
  };

  const handleRemoveDocument = (idx: number) => {
    if (documents[idx].isPrimary) {
      alert('Cannot delete active primary identification document.');
      return;
    }
    setDocuments(documents.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both First Name and Last Name.');
      return;
    }

    if (dnrStatus !== 'none' && !dnrReason.trim()) {
      alert('Please provide a mandatory reason for the DNR / Warning restriction.');
      return;
    }

    const newGuest: GuestRecord = {
      id: `GST-${Math.floor(100000 + Math.random() * 900000)}`,
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
      isVip: false,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalStays: 0,
      totalNights: 0,
      totalSpend: 0,
      lastVisit: 'New Profile',
      lastRoom: '—',
      inHouse: false,
      contacts: contacts.map((c) => ({
        ...c,
        street: c.street || 'Standard Address',
        city: c.city || 'Metropolis',
        state: c.state || 'CA',
        zip: c.zip || '00000',
      })),
      documents: documents.map((d) => ({
        ...d,
        nameOnDocument: d.nameOnDocument || `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
        documentNumber: d.documentNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      })),
    };

    onSave(newGuest);
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
              <span className="text-slate-800 font-semibold">Add Guest</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Guest</h1>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-100 text-[#4472C4]">
                New Profile Draft
              </span>
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
            Save Guest Profile
          </button>
        </div>
      </div>

      {/* Main Form Grid with Left Sticky Nav Rail */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
        {/* Left Form Navigation Rail (3 cols) */}
        <div className="lg:col-span-3 space-y-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            <span className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Form Sections
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
                {dnrStatus === 'none' ? 'OK' : 'Restricted'}
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
              <span className="text-[10px] opacity-75">{contacts.length} Channel(s)</span>
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
              <span className="text-[10px] opacity-75">{documents.length} ID(s)</span>
            </button>
          </div>

          {/* Compliance Ingestion Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-[#4472C4]">rule</span>
              Profile Ingestion Rule
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Mandatory fields marked with an asterisk (<span className="text-rose-500">*</span>) must be filled. Guest record will be instantly available in Front Desk check-in and Folio Lookups.
            </p>
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
              <span className="text-xs text-slate-400 font-medium">Guest Identity Baseline</span>
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
                  placeholder="e.g. Elena"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="M."
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
                  placeholder="Rostova-Hughes"
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
                  placeholder="PhD, Jr., III"
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
                  placeholder="United States"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                />
              </div>
            </div>

            {/* Corporate Linkage */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Corporate Linkage (Optional)
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
                    placeholder="Chief Scientific Officer"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Genomics R&D"
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
                placeholder="Room preferences, pillow preferences, allergy notifications, special anniversary notes..."
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
              {/* Option 1: None / OK */}
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
                  Standard guest profile; authorized for reservations and room assignments without restrictions.
                </p>
              </div>

              {/* Option 2: Yes Warning */}
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
                  Alert front desk of prior disputes or payment anomalies; supervisor approval required for check-in.
                </p>
              </div>

              {/* Option 3: Do Not Rent */}
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
                  Critical property-wide restriction; blocks room allocation and flags security upon attempted booking.
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
                    placeholder="Document exact incident, damage, payment default, or behavioral policy violation..."
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
                3. Contact Directory & Communication Channels
              </h2>
              <button
                type="button"
                onClick={handleAddContactSlot}
                className="px-3 py-1.5 text-xs font-bold text-[#4472C4] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Secondary Contact Channel
              </button>
            </div>

            {/* Single-Primary Rule Notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-xs text-blue-900">
              <span className="material-symbols-outlined text-[16px] text-[#4472C4] shrink-0 mt-0.5">
                verified
              </span>
              <span className="text-[11px] leading-relaxed">
                <strong>Single-Primary Enforcement:</strong> Each guest profile must maintain exactly one active Primary Contact channel. Selecting the Primary radio automatically updates dispatch routing.
              </span>
            </div>

            {/* Repeatable Contact Slots */}
            <div className="space-y-4">
              {contacts.map((contact, idx) => (
                <div
                  key={contact.id}
                  className={`p-4 rounded-xl border transition-all ${
                    contact.isPrimary
                      ? 'bg-blue-50/40 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                    <div className="flex items-center gap-2.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addGuestPrimaryRadio"
                          checked={contact.isPrimary}
                          onChange={() => handleSetPrimaryContact(idx)}
                          className="w-4 h-4 text-[#4472C4]"
                        />
                        <span className="font-bold text-xs text-slate-900">
                          {contact.isPrimary ? 'Active Primary Contact' : 'Set as Primary'}
                        </span>
                      </label>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                        {contact.id}
                      </span>
                    </div>

                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                          contact.isPrimary
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-rose-600 hover:text-rose-800'
                        }`}
                        title={contact.isPrimary ? 'Cannot remove primary contact' : 'Remove contact'}
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Classification</label>
                      <select
                        value={contact.contactType}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].contactType = e.target.value as any;
                          setContacts(updated);
                        }}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                      >
                        <option value="Mobile / Personal">Mobile / Personal</option>
                        <option value="Office / Executive Assistant">Office / Executive Assistant</option>
                        <option value="Home">Home</option>
                        <option value="Holiday / Alternate">Holiday / Alternate</option>
                        <option value="Emergency Contact">Emergency Contact</option>
                        <option value="Billing / Accounts">Billing / Accounts</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].phone = e.target.value;
                          setContacts(updated);
                        }}
                        placeholder="+1 (415) 890-2194"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].email = e.target.value;
                          setContacts(updated);
                        }}
                        placeholder="elena.rostova@example.com"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium"
                      />
                    </div>
                  </div>

                  {/* Address subgrid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[11px] font-medium text-slate-600">Street Address</label>
                      <input
                        type="text"
                        value={contact.street}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].street = e.target.value;
                          setContacts(updated);
                        }}
                        placeholder="742 Montgomery St"
                        className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-600">City</label>
                      <input
                        type="text"
                        value={contact.city}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].city = e.target.value;
                          setContacts(updated);
                        }}
                        placeholder="San Francisco"
                        className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-600">State & ZIP</label>
                      <input
                        type="text"
                        value={`${contact.state} ${contact.zip}`.trim()}
                        onChange={(e) => {
                          const updated = [...contacts];
                          const parts = e.target.value.split(' ');
                          updated[idx].state = parts[0] || '';
                          updated[idx].zip = parts[1] || '';
                          setContacts(updated);
                        }}
                        placeholder="CA 94111"
                        className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
                      />
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
                onClick={handleAddDocumentSlot}
                className="px-3 py-1.5 text-xs font-bold text-[#4472C4] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Secondary Document
              </button>
            </div>

            {/* Repeatable Documents */}
            <div className="space-y-4">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all ${
                    doc.isPrimary
                      ? 'bg-blue-50/40 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                    <div className="flex items-center gap-2.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addGuestPrimaryDocRadio"
                          checked={doc.isPrimary}
                          onChange={() => handleSetPrimaryDocument(idx)}
                          className="w-4 h-4 text-[#4472C4]"
                        />
                        <span className="font-bold text-xs text-slate-900">
                          {doc.isPrimary ? 'Active Primary Identification' : 'Set as Primary ID'}
                        </span>
                      </label>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                        {doc.id}
                      </span>
                    </div>

                    {documents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                          doc.isPrimary
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-rose-600 hover:text-rose-800'
                        }`}
                        title={doc.isPrimary ? 'Cannot remove primary ID' : 'Remove document'}
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Document Type</label>
                      <select
                        value={doc.documentType}
                        onChange={(e) => {
                          const updated = [...documents];
                          updated[idx].documentType = e.target.value as any;
                          setDocuments(updated);
                        }}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                      >
                        <option value="Passport">Passport</option>
                        <option value="National Identity Card">National Identity Card</option>
                        <option value="Driver License">Driver License</option>
                        <option value="Diplomatic ID">Diplomatic ID</option>
                        <option value="Permanent Resident Card">Permanent Resident Card</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Document Reference #
                      </label>
                      <input
                        type="text"
                        value={doc.documentNumber}
                        onChange={(e) => {
                          const updated = [...documents];
                          updated[idx].documentNumber = e.target.value;
                          setDocuments(updated);
                        }}
                        placeholder="USA-P98421098"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Valid Till (Expiry)</label>
                      <input
                        type="date"
                        value={doc.validTill}
                        onChange={(e) => {
                          const updated = [...documents];
                          updated[idx].validTill = e.target.value;
                          setDocuments(updated);
                        }}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                      />
                    </div>
                  </div>

                  {/* Scanned Card Dropzone Preview */}
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="material-symbols-outlined text-[20px] text-[#4472C4]">
                        document_scanner
                      </span>
                      <div>
                        <span className="font-bold block">Front Photo Scan & MRZ Attached</span>
                        <span className="text-[11px] text-slate-400">Specimen authenticated by scanner</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      OCR Cleared
                    </span>
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
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Validation Complete • Ready for Intake</span>
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
            <span className="material-symbols-outlined text-[16px]">check</span>
            Save Guest Profile
          </button>
        </div>
      </div>
    </div>
  );
};
