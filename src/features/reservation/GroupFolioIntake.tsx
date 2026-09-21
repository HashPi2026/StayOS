import React, { useState } from 'react';
import { GroupRecord } from './types';

interface GroupFolioIntakeProps {
  onContinueToWizard: (group: GroupRecord) => void;
  onCancel: () => void;
}

const SAMPLE_GROUPS: GroupRecord[] = [
  {
    id: 'grp-01',
    code: 'GRP-2026-088',
    name: 'Apex Global Annual Summit 2026',
    organization: 'Apex Global Holdings LLC',
    organizer: 'Eleanor Vance',
    marketSegment: 'Corporate Group (Negotiated Contract)',
    checkInDate: '2026-06-28',
    checkInTime: '14:00',
    checkOutDate: '2026-07-04',
    checkOutTime: '11:00',
    cutoffDate: '2026-06-20',
    remarks:
      'Master Direct Billing authorized for Room & Tax to Corporate AR #APX-992. Incidentals (Minibar, Spa, Dining) must be routed to Individual Guest Folio at Check-In. VIP amenity package for 6 C-suite attendees.',
    totalRooms: 35,
    pickedRooms: 28,
    negotiatedRate: 210.0,
    arAccountNumber: 'AR-APX-992',
    creditFacility: 50000.0,
    availableHeadroom: 32450.0,
    contacts: [
      {
        name: 'Eleanor Vance',
        role: 'Corporate Travel Director • Master Signer',
        phone: '+1 (212) 555-0144',
        email: 'e.vance@apexgroup.com',
        isPrimary: true,
      },
      {
        name: 'David Miller',
        role: 'Senior Logistics Manager • On-site Coordinator',
        phone: '+1 (212) 555-0189',
        email: 'd.miller@apexgroup.com',
        isPrimary: false,
      },
    ],
  },
  {
    id: 'grp-02',
    code: 'GRP-2026-094',
    name: 'BioHealth World Symposium',
    organization: 'BioHealth International',
    organizer: 'Dr. Alistair Finch',
    marketSegment: 'Association / Congress',
    checkInDate: '2026-07-05',
    checkInTime: '15:00',
    checkOutDate: '2026-07-10',
    checkOutTime: '11:00',
    cutoffDate: '2026-06-25',
    remarks: 'Full conference room block. Attendees self-pay room and tax.',
    totalRooms: 40,
    pickedRooms: 12,
    negotiatedRate: 245.0,
    arAccountNumber: 'AR-BIO-104',
    creditFacility: 40000.0,
    availableHeadroom: 25000.0,
    contacts: [
      {
        name: 'Dr. Alistair Finch',
        role: 'Conference Director',
        phone: '+1 (617) 555-0922',
        email: 'a.finch@biohealth.org',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'grp-03',
    code: 'GRP-2026-102',
    name: 'Nordic Tech Retreat 2026',
    organization: 'Nordic Innovations AS',
    organizer: 'Astrid Lindholm',
    marketSegment: 'Corporate Group (Negotiated Contract)',
    checkInDate: '2026-07-14',
    checkInTime: '14:00',
    checkOutDate: '2026-07-19',
    checkOutTime: '11:00',
    cutoffDate: '2026-07-01',
    remarks: 'Private executive workshop. Master billing for entire group.',
    totalRooms: 20,
    pickedRooms: 4,
    negotiatedRate: 195.0,
    arAccountNumber: 'AR-NOR-890',
    creditFacility: 30000.0,
    availableHeadroom: 22000.0,
    contacts: [
      {
        name: 'Astrid Lindholm',
        role: 'Operations VP',
        phone: '+47 22 55 01 23',
        email: 'astrid@nordictech.io',
        isPrimary: true,
      },
    ],
  },
];

export const GroupFolioIntake: React.FC<GroupFolioIntakeProps> = ({
  onContinueToWizard,
  onCancel,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupRecord>(SAMPLE_GROUPS[0]);
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('Apex Global');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // New group registration state
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    organization: '',
    organizer: '',
    marketSegment: 'Corporate Group (Negotiated Contract)',
    checkInDate: '2026-07-01',
    checkOutDate: '2026-07-05',
    totalRooms: 20,
    negotiatedRate: 220,
  });

  const handleSelectGroup = (grp: GroupRecord) => {
    setSelectedGroup(grp);
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
      onContinueToWizard(selectedGroup);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Context & Metrics Ribbon */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <span className="text-[#4472C4]">Grand Metropole Resort & Spa</span>
              <span>•</span>
              <span className="font-mono">AUDIT DATE: 29-JUN-2026</span>
              <span>•</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">SYS-VER 4.12</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Group Folio Master Intake</h1>
            <p className="text-xs text-slate-500 mt-1">
              Link incoming reservations to an authorized corporate/event block or establish a new group entity prior
              to the Folio Wizard.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#4472C4] text-[22px]">groups</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Groups</span>
                <span className="text-base font-bold text-slate-900 leading-tight">14</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5">
              <span className="material-symbols-outlined text-blue-600 text-[22px]">hotel_class</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Block Allocation</span>
                <span className="text-base font-bold text-slate-900 leading-tight">142 Rooms</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hold Status</span>
                <span className="font-mono text-xs text-emerald-700 font-bold leading-tight">Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard Step Sequence Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Step 0 */}
          <div className="flex items-center gap-1.5 bg-[#4472C4] text-white px-3 py-1.5 rounded-lg font-bold shadow-2xs">
            <span className="material-symbols-outlined text-[16px]">radio_button_checked</span>
            <span>Step 0: Group Assignment</span>
          </div>
          <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>

          {/* Steps 1 to 4 */}
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">
              1
            </span>
            <span>Stay & Rent Details</span>
          </div>
          <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>

          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">
              2
            </span>
            <span>Guest Details</span>
          </div>
          <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>

          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">
              3
            </span>
            <span>Other Charges</span>
          </div>
          <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>

          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">
              4
            </span>
            <span>Payment & Guarantee</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#4472C4] text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-medium">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Group ID & billing matrix auto-binds to Steps 1–4</span>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search existing group by name, company, GRP-Code, or contact (e.g. Apex Global, Vance, #GRP-2026)..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 shadow-2xs focus:outline-none focus:border-[#4472C4]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('search')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'search' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#4472C4]">manage_search</span>
              Search Block
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'create' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Register New Group
            </button>
          </div>
        </div>

        {/* Live Search Cards */}
        {mode === 'search' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_GROUPS.map((grp) => {
              const isSelected = selectedGroup.id === grp.id;
              return (
                <div
                  key={grp.id}
                  onClick={() => handleSelectGroup(grp)}
                  className={`bg-white p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#4472C4] ring-2 ring-[#4472C4]/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100 shadow-2xs'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-[#4472C4] text-white px-2 py-0.5 rounded-bl font-mono text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span> Active Selection
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <span className="text-[#4472C4] font-bold">{grp.code}</span>
                      <span>•</span>
                      <span className="truncate">{grp.organization}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">{grp.name}</h3>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {grp.checkInDate} → {grp.checkOutDate}
                    </p>
                  </div>

                  <div className="pt-2 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Block Pick-up</span>
                      <span className="font-bold text-slate-900">
                        {grp.pickedRooms} <span className="text-slate-500 font-normal">/ {grp.totalRooms} rms</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Negotiated Rate</span>
                      <span className="font-mono font-bold text-[#4472C4]">${grp.negotiatedRate.toFixed(2)} /nt</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Workspace: Left Form / Right Scope Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Group Details & Contacts (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Section 1: Master Group Definition */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">domain_verification</span>
                <h2 className="text-sm font-bold text-slate-900">1. Master Group Definition</h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#4472C4]">PMS Code: {selectedGroup.code}</span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Group Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={selectedGroup.name}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-[#4472C4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Organization / Corporate Client <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={selectedGroup.organization}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, organization: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-[#4472C4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Primary Account Organizer <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={selectedGroup.organizer}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, organizer: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-[#4472C4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Group Market Segment
                </label>
                <select
                  value={selectedGroup.marketSegment}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, marketSegment: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-[#4472C4]"
                >
                  <option value="Corporate Group (Negotiated Contract)">
                    Corporate Group (Negotiated Contract)
                  </option>
                  <option value="Association / Congress">Association / Congress</option>
                  <option value="Government / Diplomatic">Government / Diplomatic</option>
                  <option value="Incentive Travel">Incentive Travel</option>
                </select>
              </div>

              {/* Dates */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Check-In Date & Time <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={selectedGroup.checkInDate}
                      onChange={(e) => setSelectedGroup({ ...selectedGroup, checkInDate: e.target.value })}
                      className="w-2/3 p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                    <input
                      type="time"
                      value={selectedGroup.checkInTime}
                      onChange={(e) => setSelectedGroup({ ...selectedGroup, checkInTime: e.target.value })}
                      className="w-1/3 p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Check-Out Date & Time <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={selectedGroup.checkOutDate}
                      onChange={(e) => setSelectedGroup({ ...selectedGroup, checkOutDate: e.target.value })}
                      className="w-2/3 p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                    <input
                      type="time"
                      value={selectedGroup.checkOutTime}
                      onChange={(e) => setSelectedGroup({ ...selectedGroup, checkOutTime: e.target.value })}
                      className="w-1/3 p-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Release / Cut-off Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedGroup.cutoffDate}
                    onChange={(e) => setSelectedGroup({ ...selectedGroup, cutoffDate: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs text-rose-700 font-bold"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Master Billing Directives & Folio Remarks
                </label>
                <textarea
                  rows={2}
                  value={selectedGroup.remarks}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, remarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#4472C4] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Persons */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">2. Designated Contact Persons</h2>
                <p className="text-xs text-slate-500">Authorized signers and on-site liaisons managing block reservations.</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>+ Add Contact</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {selectedGroup.contacts.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                        c.isPrimary ? 'bg-[#4472C4] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        {c.isPrimary && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#4472C4] text-[9px] font-bold uppercase">
                            Primary Contact
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-medium uppercase">
                          {c.isPrimary ? 'Master Signer' : 'Coordinator'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <span>{c.role}</span>
                        <span>•</span>
                        <span className="font-mono">{c.phone}</span>
                        <span>•</span>
                        <span>{c.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button className="p-1 text-slate-400 hover:text-rose-600 rounded">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Attached Agreements */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">3. Attached Agreements & Tax Exemption Records</h2>
                <p className="text-xs text-slate-500">Mandatory legal and direct-billing attachments governing folio guarantee.</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>+ Attach Contract</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-[#4472C4]">
                  <span className="material-symbols-outlined text-[22px]">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">Apex_Master_Contract_Signed_2026.pdf</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">Master Agreement • Signed 15-May-2026</div>
                  <div className="mt-1 flex items-center gap-1 text-[#4472C4] font-bold text-[10px] uppercase">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Credit Pre-Authorized</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                  <span className="material-symbols-outlined text-[22px]">article</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">Tax_Exemption_Certificate_NY501.pdf</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">Occupancy Exemption • Exp: 31-Dec-2026</div>
                  <div className="mt-1 flex items-center gap-1 text-emerald-700 font-bold text-[10px] uppercase">
                    <span className="material-symbols-outlined text-[14px]">task_alt</span>
                    <span>State Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Master Scope Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Target Master</span>
                <h3 className="text-base font-bold text-slate-900">#{selectedGroup.code}</h3>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-[#4472C4] font-bold text-[10px] uppercase rounded">
                Ready to Link
              </span>
            </div>

            {/* Hotel Visual Card */}
            <div className="relative rounded-lg overflow-hidden h-28 bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                alt="Grand Metropole Resort"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-white/80 text-[10px] uppercase tracking-wider font-bold">
                  Grand Metropole Resort & Spa
                </span>
                <span className="text-white font-bold text-xs truncate">{selectedGroup.name}</span>
              </div>
            </div>

            {/* Block Consumption Visual Gauge */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Room Allotment Pick-Up</span>
                <span className="font-mono font-bold text-[#4472C4]">
                  {Math.round((selectedGroup.pickedRooms / selectedGroup.totalRooms) * 100)}% Picked
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#4472C4] h-full"
                  style={{
                    width: `${Math.round((selectedGroup.pickedRooms / selectedGroup.totalRooms) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{selectedGroup.pickedRooms} Picked Up</span>
                <span className="text-[#4472C4] font-semibold">
                  {selectedGroup.totalRooms - selectedGroup.pickedRooms} Available in Block
                </span>
              </div>
            </div>

            {/* Sub-allocation breakdown */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Room Breakdown</span>
              <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-800 font-medium">Deluxe King (DLXK)</span>
                <span className="font-mono font-bold text-slate-700">16 / 20 Picked</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-800 font-medium">Executive Suite (EXST)</span>
                <span className="font-mono font-bold text-slate-700">12 / 15 Picked</span>
              </div>
            </div>

            {/* Direct Bill AR Matrix */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="material-symbols-outlined text-[#4472C4] text-[18px]">credit_card</span>
                <span>Direct Bill AR Matrix</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedGroup.arAccountNumber}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Assigned Rate Code:</span>
                <span className="font-mono font-bold text-[#4472C4]">
                  GRP-APX26 (${selectedGroup.negotiatedRate}/nt)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Credit Facility:</span>
                <span className="font-mono text-slate-900">${selectedGroup.creditFacility.toLocaleString()} Limit</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">Available AR Headroom:</span>
                <span className="font-mono font-bold text-[#4472C4]">
                  ${selectedGroup.availableHeadroom.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Billing Routing Rules */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Billing Routing Rule</span>
              <p>
                <strong className="text-slate-900">Master Folio #{selectedGroup.code}</strong> pays Room Charge +
                Occupancy Surcharge. Individual guests pay Step 3 Incidentals.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-slate-700 flex items-start gap-2 text-xs">
              <span className="material-symbols-outlined text-[#4472C4] text-[18px] shrink-0">rule</span>
              <span>
                Continuing will launch <strong>Step 1 (Stay & Rent Details)</strong> locked to the {selectedGroup.name} dates,
                group allotment pricing, and master tax settings.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Operational Action Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Cancel / Reset Group Intake</span>
          </button>
          <span className="font-mono text-xs text-slate-400 hidden md:inline-block">
            Group Folio Link Engine: ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Destination</span>
            <span className="font-mono text-xs text-[#4472C4] font-bold">
              Step 1: Stay & Rent Details (#{selectedGroup.code})
            </span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isTransitioning}
            className="px-6 py-2.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
          >
            {isTransitioning ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Binding Group Data...</span>
              </>
            ) : (
              <>
                <span>Continue to Reservation Details</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase">Alt + ↵</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
