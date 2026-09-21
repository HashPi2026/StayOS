import React, { useState } from 'react';
import { ReservationWizardState } from './types';

interface Step2GuestDetailsProps {
  state: ReservationWizardState;
  onChange: (patch: Partial<ReservationWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2GuestDetails: React.FC<Step2GuestDetailsProps> = ({
  state,
  onChange,
  onNext,
  onBack,
}) => {
  const [profileMode, setProfileMode] = useState<'search' | 'new'>('search');
  const [searchQuery, setSearchQuery] = useState('Jonathan Hayes');
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [checklist, setChecklist] = useState({
    idVerified: true,
    keyEncoder: false,
    incidentWaiver: false,
  });

  const guest = state.primaryGuest;

  const updateGuest = (patch: Partial<typeof state.primaryGuest>) => {
    onChange({
      primaryGuest: {
        ...state.primaryGuest,
        ...patch,
      },
    });
  };

  const handleOverrideDnr = () => {
    updateGuest({ dnrOverridden: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Guest Profile Selection & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">badge</span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Guest Profile Selection</h2>
              </div>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setProfileMode('search')}
                  className={`px-3 py-1 font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    profileMode === 'search'
                      ? 'bg-white text-[#4472C4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">manage_search</span>
                  <span>Search Existing Guest</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMode('new');
                    updateGuest({
                      firstName: '',
                      middleName: '',
                      lastName: '',
                      phone: '',
                      email: '',
                      isDnrFlagged: false,
                    });
                  }}
                  className={`px-3 py-1 font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    profileMode === 'new'
                      ? 'bg-white text-[#4472C4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>+ New Profile</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            {profileMode === 'search' && (
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search existing guest by name, phone, or email... (e.g. Jonathan Hayes, +1 212...)"
                  className="w-full pl-9 pr-32 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4472C4]"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-100 text-[#4472C4] text-[10px] font-bold rounded">
                    1 RECORD FOUND
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CRITICAL DNR WARNING BANNER */}
          {guest.isDnrFlagged && (
            <div
              className={`p-4 rounded-xl flex items-start gap-4 shadow-2xs border transition-colors ${
                guest.dnrOverridden
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  guest.dnrOverridden ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {guest.dnrOverridden ? 'verified_user' : 'gavel'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        guest.dnrOverridden ? 'bg-amber-200 text-amber-900' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {guest.dnrOverridden ? 'SECURITY OVERRIDDEN' : 'SECURITY & OPERATIONAL ALERT'}
                    </span>
                    <span className="text-sm font-bold">
                      {guest.dnrOverridden ? 'DNR OVERRIDE APPLIED BY DUTY MGR' : 'DNR (DO NOT RESERVE) ACTIVE'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wide opacity-80">
                    Incident #SEC-2025-412
                  </span>
                </div>

                <p className="text-xs leading-relaxed">
                  {guest.dnrReason}
                  {!guest.dnrOverridden && (
                    <span className="block mt-1 font-semibold text-rose-800">
                      Operational requirement: Duty Manager verification or system override required to proceed.
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  {!guest.dnrOverridden ? (
                    <button
                      type="button"
                      onClick={handleOverrideDnr}
                      className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      <span>Duty Manager Override</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span>Override Logged: Marcus Vance (GM)</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowDossierModal(true)}
                    className="px-3 py-1.5 bg-white text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    View Incident Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Guest Master Record Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4472C4] font-bold text-lg flex items-center justify-center font-mono">
                    {guest.firstName[0]}
                    {guest.lastName[0]}
                  </div>
                  {guest.isDnrFlagged && !guest.dnrOverridden && (
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                      title="DNR Active"
                    >
                      !
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-slate-900">
                      {guest.title} {guest.firstName} {guest.lastName}
                    </span>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      {guest.vipTier}
                    </span>
                    {guest.isDnrFlagged && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          guest.dnrOverridden ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {guest.dnrOverridden ? 'OVERRIDDEN' : 'DNR FLAGGED'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                    <span className="font-medium text-slate-700">{guest.company}</span>
                    <span>•</span>
                    <span className="font-mono text-xs text-slate-500">Profile #{guest.profileId}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="self-start sm:self-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#4472C4] text-[16px]">edit_note</span>
                <span>Edit Guest Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Contact Information
                </span>
                <span className="font-mono text-slate-900 font-semibold">{guest.phone}</span>
                <span className="text-[#4472C4] truncate">{guest.email}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Primary Residence
                </span>
                <span className="text-slate-900">{guest.address}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Master Database Sync
                </span>
                <span className="text-slate-900 font-medium">Last Stay: 12-Oct-2025</span>
                <span className="text-slate-500 text-[11px]">Updates save directly to Global PMS</span>
              </div>
            </div>
          </div>

          {/* Guest Details Editable Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-6">
            {/* Section 1: Personal Details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[#4472C4] text-[18px]">person</span>
                <h3 className="text-sm font-bold text-slate-900">1. Personal Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">Title</label>
                  <select
                    value={guest.title}
                    onChange={(e) => updateGuest({ title: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-2 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  >
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                    <option>Dr.</option>
                    <option>Prof.</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    First Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guest.firstName}
                    onChange={(e) => updateGuest({ firstName: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">Middle Name</label>
                  <input
                    type="text"
                    value={guest.middleName}
                    onChange={(e) => updateGuest({ middleName: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>

                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Last Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guest.lastName}
                    onChange={(e) => updateGuest({ lastName: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>

                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">Birth Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guest.birthDate}
                      onChange={(e) => updateGuest({ birthDate: e.target.value })}
                      className="w-full bg-slate-50 py-2 pl-3 pr-8 rounded-lg border border-slate-200 font-mono text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      calendar_today
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-8 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={guest.company}
                    onChange={(e) => updateGuest({ company: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[#4472C4] text-[18px]">call</span>
                <h3 className="text-sm font-bold text-slate-900">2. Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">Contact Type</label>
                  <select
                    value={guest.contactType}
                    onChange={(e) => updateGuest({ contactType: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-2.5 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  >
                    <option>Mobile</option>
                    <option>Business</option>
                    <option>Home</option>
                    <option>Personal</option>
                  </select>
                </div>

                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Phone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guest.phone}
                    onChange={(e) => updateGuest({ phone: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 font-mono text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>

                <div className="sm:col-span-5 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={guest.email}
                    onChange={(e) => updateGuest({ email: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>

                <div className="sm:col-span-12 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Street Address, City, State, ZIP
                  </label>
                  <input
                    type="text"
                    value={guest.address}
                    onChange={(e) => updateGuest({ address: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Document Details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[#4472C4] text-[18px]">verified</span>
                <h3 className="text-sm font-bold text-slate-900">3. Identification Documents</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Document Type <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={guest.docType}
                    onChange={(e) => updateGuest({ docType: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-2.5 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  >
                    <option>Passport</option>
                    <option>National ID</option>
                    <option>Driver's License</option>
                  </select>
                </div>

                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Document Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guest.docNumber}
                    onChange={(e) => updateGuest({ docNumber: e.target.value })}
                    className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 font-mono text-xs uppercase focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                </div>

                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-600">
                    Valid Till (Expiry) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guest.docExpiry}
                      onChange={(e) => updateGuest({ docExpiry: e.target.value })}
                      className="w-full bg-slate-50 py-2 pl-3 pr-8 rounded-lg border border-slate-200 font-mono text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      event
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Guests Section (Multi-Occupant Assignment) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">group</span>
                <h3 className="text-sm font-bold text-slate-900">Guests Attached to Reservation</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-[#4472C4] text-[11px] font-bold rounded">
                  {state.sharedGuests.length} GUESTS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {state.sharedGuests.map((g, idx) => (
                <div
                  key={g.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={g.isPrimary}
                        onChange={() => {
                          const updated = state.sharedGuests.map((item) => ({
                            ...item,
                            isPrimary: item.id === g.id,
                          }));
                          onChange({ sharedGuests: updated });
                        }}
                        className="w-4 h-4 text-[#4472C4] accent-[#4472C4]"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        {g.isPrimary ? 'Primary Folio Guest' : 'Set as Primary'}
                      </span>
                    </label>

                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                        g.isPrimary ? 'bg-blue-100 text-[#4472C4]' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {g.isPrimary ? 'Billing Responsible' : 'Additional Occupant'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900 text-sm">{g.name}</span>
                    <span className="text-slate-500">{g.relationship}</span>
                    <div className="flex flex-col gap-0.5 mt-1 font-mono text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">phone</span>
                        {g.phone}
                      </span>
                      {g.email && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">mail</span>
                          {g.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">badge</span>
                        {g.idDocument}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-[#4472C4] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">key</span>
                      {g.keycardStatus}
                    </span>
                    <span className="text-slate-400">Occupant #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols STICKY */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-32">
          {/* Room & Stay Synopsis Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#4472C4] uppercase tracking-wider">
                  Assigned Inventory
                </span>
                <span className="text-base font-bold text-slate-900">{state.roomNumber.split(' ')[0]} {state.roomNumber.split(' ')[1]}</span>
                <span className="text-xs text-slate-500 font-medium">{state.roomType}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">single_bed</span>
              </div>
            </div>

            {/* Room Image Snippet */}
            <div className="w-full h-32 rounded-lg bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                alt="Deluxe King Suite Ocean View"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-xs rounded text-[10px] text-slate-900 font-semibold font-mono">
                FLOOR 3 • WING EAST
              </span>
            </div>

            {/* Stay Parameters */}
            <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-lg text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Check-In:</span>
                <span className="font-mono font-semibold text-slate-900">{state.checkInDate} (15:00)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Check-Out:</span>
                <span className="font-mono font-semibold text-slate-900">{state.checkOutDate} (11:00)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-slate-900">
                  {state.nights} Nights • {state.adults} Adults, {state.children} Children
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Rate Plan:</span>
                <span className="text-[#4472C4] font-medium">{state.rateType}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Room Base ({state.nights} nights @ $240.00)</span>
                <span className="font-mono text-slate-900 font-semibold">
                  ${(state.nights * 240).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Resort Fee ($15.00/night)</span>
                <span className="font-mono text-slate-900 font-semibold">
                  ${(state.nights * 15).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Occupancy Tax & City Levy</span>
                <span className="font-mono text-slate-900 font-semibold">
                  ${(state.nights * 240 * 0.12).toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-slate-100 rounded-lg flex flex-col gap-1 mt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Stay Estimate:</span>
                  <span className="font-mono font-bold text-[#4472C4] text-base">
                    ${(state.nights * 240 * 1.12).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Deposit Due at Check-In:</span>
                  <span className="font-mono font-semibold text-slate-900">$240.00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-blue-50 text-[#4472C4] rounded-lg text-xs font-medium">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Guest profile syncs to Folio #MET-2026-8841</span>
            </div>
          </div>

          {/* Quick Operational Checklist */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-2 text-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              Front Desk Requirement
            </span>
            <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.idVerified}
                onChange={(e) => setChecklist({ ...checklist, idVerified: e.target.checked })}
                className="w-4 h-4 text-[#4472C4] rounded accent-[#4472C4]"
              />
              <span>Government ID physically verified</span>
            </label>
            <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.keyEncoder}
                onChange={(e) => setChecklist({ ...checklist, keyEncoder: e.target.checked })}
                className="w-4 h-4 text-[#4472C4] rounded accent-[#4472C4]"
              />
              <span>Keycard encoder synchronized</span>
            </label>
            <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.incidentWaiver}
                onChange={(e) => setChecklist({ ...checklist, incidentWaiver: e.target.checked })}
                className="w-4 h-4 text-[#4472C4] rounded accent-[#4472C4]"
              />
              <span>Incident waiver & DNR acknowledgment</span>
            </label>
          </div>
        </div>
      </div>

      {/* Incident Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-700">
                <span className="material-symbols-outlined text-[24px]">policy</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Security Incident Dossier #SEC-2025-412</h3>
                  <span className="text-xs text-slate-500 font-mono">Date: 14-Oct-2025 • Room 412</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 border border-slate-200">
              <div>
                <span className="font-bold text-slate-700">Reporting Officer:</span> Officer R. Vance (Badge #09)
              </div>
              <div>
                <span className="font-bold text-slate-700">Summary:</span> Excessive noise complaint logged at 02:40 AM. Unsettled minibar folio of $184.00 cleared post-departure via corporate card. Flag set to review upon subsequent booking intake.
              </div>
              <div className="text-emerald-700 font-semibold">
                Status: Resolution agreed with corporate travel desk. Pre-authorization of $500 security deposit recommended.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleOverrideDnr();
                  setShowDossierModal(false);
                }}
                className="px-4 py-2 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold"
              >
                Approve & Apply Override
              </button>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back: Stay & Rent Details</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2 rounded-lg bg-[#4472C4] hover:bg-[#365cb5] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Other Charges</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px] uppercase">Alt + N</span>
          </button>
        </div>
      </div>
    </div>
  );
};
