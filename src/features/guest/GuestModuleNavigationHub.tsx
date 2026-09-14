import React, { useState } from 'react';
import { GuestRecord, GuestSubMenu } from './types';

interface GuestModuleNavigationHubProps {
  guests: GuestRecord[];
  onSelectSubMenu: (sub: GuestSubMenu) => void;
  onSelectGuest: (guest: GuestRecord) => void;
  onAddGuest: () => void;
  onEditGuest: (guest: GuestRecord) => void;
  onAddContact: () => void;
  onLogItem: () => void;
}

export const GuestModuleNavigationHub: React.FC<GuestModuleNavigationHubProps> = ({
  guests,
  onSelectSubMenu,
  onSelectGuest,
  onAddGuest,
  onEditGuest,
  onAddContact,
  onLogItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'vip' | 'in_house' | 'dnr'>('all');
  const [showNewEntryMenu, setShowNewEntryMenu] = useState(false);

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

    if (activeFilter === 'vip') return guest.isVip;
    if (activeFilter === 'in_house') return guest.inHouse;
    if (activeFilter === 'dnr') return guest.dnrStatus !== 'none';
    return true;
  });

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>StayOS PMS</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-800 font-semibold">Guest</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Guest Module Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#4472C4] border border-blue-200">
              Guest Services & Operations
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 relative">
          {/* Quick New Entry Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNewEntryMenu((prev) => !prev)}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#4472C4]">add_circle</span>
              <span>Quick Entry</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
            </button>

            {showNewEntryMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setShowNewEntryMenu(false);
                    onAddGuest();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#4472C4]">person_add</span>
                  <div>
                    <div className="font-semibold text-slate-900">Individual Guest</div>
                    <div className="text-[11px] text-slate-400">Register new guest profile</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowNewEntryMenu(false);
                    onAddContact();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">corporate_fare</span>
                  <div>
                    <div className="font-semibold text-slate-900">Commercial Account</div>
                    <div className="text-[11px] text-slate-400">Corporate, agency or vendor</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowNewEntryMenu(false);
                    onLogItem();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-600">inventory_2</span>
                  <div>
                    <div className="font-semibold text-slate-900">Lost / Found Ticket</div>
                    <div className="text-[11px] text-slate-400">Log recovered property item</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onAddGuest}
            className="px-4 py-2 rounded-lg bg-[#4472C4] hover:bg-[#3b62a8] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Register Guest Profile</span>
          </button>
        </div>
      </div>

      {/* 3 Pillar Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Guest Database */}
        <div
          onClick={() => onSelectSubMenu('guest-database')}
          className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#4472C4] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4472C4] group-hover:bg-[#4472C4] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">badge</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                SUB-MENU 1
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#4472C4] transition-colors">
              Guest Database
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Master individual guest profiles, identity documents, stay statistics, contact channels, and DNR compliance verification.
            </p>

            <div className="space-y-2 py-3 border-y border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Profiles:</span>
                <span className="font-bold text-slate-900 font-mono">18,420</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">VIP Tier 1 & 2:</span>
                <span className="font-semibold text-[#4472C4]">1,240</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">ID Verification Rate:</span>
                <span className="font-semibold text-emerald-600">98.4%</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-[#4472C4] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Guest Database
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">6 Screens Integrated</span>
          </div>
        </div>

        {/* Pillar 2: Contacts */}
        <div
          onClick={() => onSelectSubMenu('contacts')}
          className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">corporate_fare</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                SUB-MENU 2
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Contacts (Commercial Directory)
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              B2B commercial accounts, corporate partners, travel management agencies, suppliers, and category credit terms.
            </p>

            <div className="space-y-2 py-3 border-y border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Commercial Accounts:</span>
                <span className="font-bold text-slate-900 font-mono">642</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Corporate Partners:</span>
                <span className="font-semibold text-blue-600">298</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Travel Intermediaries:</span>
                <span className="font-semibold text-emerald-600">184</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Contacts Directory
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">4 Screens Integrated</span>
          </div>
        </div>

        {/* Pillar 3: Lost and Found */}
        <div
          onClick={() => onSelectSubMenu('lost-and-found')}
          className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">inventory_2</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                SUB-MENU 3
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Lost and Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Property custody ledger, recovered guest belongings, high-security vault safekeeping, and statutory disposition logs.
            </p>

            <div className="space-y-2 py-3 border-y border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Records:</span>
                <span className="font-bold text-slate-900 font-mono">28</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Open in Safe Vault:</span>
                <span className="font-semibold text-amber-600">18 Units</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Returned to Guests:</span>
                <span className="font-semibold text-emerald-600">7 Recovered</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Lost & Found Log
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Operational Ledger</span>
          </div>
        </div>
      </div>

      {/* Isolation Architecture Callout Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4472C4] flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
              B2B Entity Segregation & DNR Integrity Protocol
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Individual guest profiles in the Guest Database remain strictly isolated from B2B Commercial Contacts. DNR flags block reservations system-wide.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            ISO/PAS 24019 Compliant
          </span>
          <span className="px-2 py-1 rounded text-[11px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
            Vault Sync: Active
          </span>
        </div>
      </div>

      {/* Interactive Quick Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests, phones, emails..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#4472C4] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Guests ({guests.length})
              </button>
              <button
                onClick={() => setActiveFilter('vip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeFilter === 'vip'
                    ? 'bg-[#4472C4] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                VIP Members
              </button>
              <button
                onClick={() => setActiveFilter('in_house')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeFilter === 'in_house'
                    ? 'bg-[#4472C4] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                In-House Now
              </button>
              <button
                onClick={() => setActiveFilter('dnr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeFilter === 'dnr'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                DNR Flagged
              </button>
            </div>
          </div>

          <button
            onClick={() => onSelectSubMenu('guest-database')}
            className="text-xs font-semibold text-[#4472C4] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Go to Full Master List & Profile Inspector
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Guest Profile & ID</th>
                <th className="py-3 px-4">Affiliation / VIP</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Stay Stats</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">DNR Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredGuests.map((guest) => {
                const primaryContact =
                  guest.contacts.find((c) => c.isPrimary) || guest.contacts[0];

                return (
                  <tr
                    key={guest.id}
                    onClick={() => {
                      onSelectGuest(guest);
                      onSelectSubMenu('guest-database');
                    }}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {guest.firstName[0]}
                          {guest.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {guest.title} {guest.firstName} {guest.lastName}
                            {guest.inHouse && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                IN-HOUSE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {guest.id} • {guest.nationality}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {guest.company ? (
                        <div>
                          <div className="font-semibold text-slate-800">{guest.company}</div>
                          <div className="text-[11px] text-slate-500">{guest.designation}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Individual Guest</span>
                      )}
                      {guest.isVip && (
                        <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                          {guest.vipTier || 'VIP'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {primaryContact ? (
                        <div>
                          <div className="font-mono text-slate-800">{primaryContact.phone}</div>
                          <div className="text-[11px] text-slate-500">{primaryContact.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No contact logged</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {guest.totalStays} Stays • {guest.totalNights} Nights
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Last: {guest.lastVisit}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">
                        ${guest.totalSpend.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {guest.dnrStatus === 'none' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          No (OK)
                        </span>
                      ) : guest.dnrStatus === 'warning' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                          Warning Flag
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-300">
                          <span className="material-symbols-outlined text-[12px]">block</span>
                          Do Not Rent
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onSelectGuest(guest);
                            onSelectSubMenu('guest-database');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onEditGuest(guest)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 hover:bg-blue-100 text-[#4472C4] transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
