import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { GroupBookingMaster, GroupMemberItem } from '../types';
import { INITIAL_GROUP_MASTER } from '../mockData';

interface EditGroupScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const EditGroupScreen: React.FC<EditGroupScreenProps> = ({ onNavigateToScreen }) => {
  const { navigate } = useProperty();
  const [group, setGroup] = useState<GroupBookingMaster>(INITIAL_GROUP_MASTER);
  const [searchQuery, setSearchQuery] = useState('Apex Global Annual Summit 2026');
  const [memberFilter, setMemberFilter] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [memberToDetach, setMemberToDetach] = useState<GroupMemberItem | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberResId, setNewMemberResId] = useState('RES-9520');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group Form state
  const [groupForm, setGroupForm] = useState({
    groupName: group.groupName,
    corporateAccountName: group.corporateAccountName,
    primaryOrganizer: group.primaryOrganizer,
    organizerPhone: group.organizerPhone,
    checkInDate: group.checkInDate,
    checkOutDate: group.checkOutDate,
    cutOffDate: group.cutOffDate,
    roomAndTaxRouting: group.enforcedRoutingDirective.roomAndTax,
    incidentalsRouting: group.enforcedRoutingDirective.incidentals,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveDirectives = (e: React.FormEvent) => {
    e.preventDefault();
    setGroup((prev) => ({
      ...prev,
      groupName: groupForm.groupName,
      corporateAccountName: groupForm.corporateAccountName,
      primaryOrganizer: groupForm.primaryOrganizer,
      organizerPhone: groupForm.organizerPhone,
      checkInDate: groupForm.checkInDate,
      checkOutDate: groupForm.checkOutDate,
      cutOffDate: groupForm.cutOffDate,
      enforcedRoutingDirective: {
        roomAndTax: groupForm.roomAndTaxRouting,
        incidentals: groupForm.incidentalsRouting,
      },
    }));
    showToast('Group directives and master AR billing profile saved.');
  };

  const handleConfirmDetach = () => {
    if (!memberToDetach) return;
    setGroup((prev) => ({
      ...prev,
      membersCount: prev.membersCount - 1,
      members: prev.members.filter((m) => m.id !== memberToDetach.id),
    }));
    showToast(
      `Guest ${memberToDetach.guestName} detached from ${group.groupName}. Corporate AR routing removed.`
    );
    setMemberToDetach(null);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: GroupMemberItem = {
      id: String(Date.now()),
      resId: newMemberResId,
      guestName: 'Julian Wright',
      guestEmail: 'j.wright@wrightlaw.com',
      vipTier: 'Repeat Guest',
      roomNumber: '114',
      roomType: 'DLXK',
      roomTypeName: 'Deluxe King',
      checkInDate: '27-Jun',
      checkOutDate: '02-Jul',
      status: 'In-House',
      billingCoverage: 'Room & Tax Covered',
    };
    setGroup((prev) => ({
      ...prev,
      membersCount: prev.membersCount + 1,
      members: [...prev.members, newMember],
    }));
    setIsAddMemberModalOpen(false);
    showToast(`Reservation ${newMemberResId} linked to ${group.groupName}.`);
  };

  const filteredMembers = group.members.filter((m) => {
    if (!memberFilter) return true;
    const q = memberFilter.toLowerCase();
    return (
      m.guestName.toLowerCase().includes(q) ||
      m.resId.toLowerCase().includes(q) ||
      m.roomNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="px-lg pt-lg pb-base flex flex-col gap-xs bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-xs text-body-sm text-on-surface-variant font-body-sm">
          <span onClick={() => navigate('dashboard')} className="hover:text-primary cursor-pointer transition-colors">Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => onNavigateToScreen ? onNavigateToScreen('search-reservation') : navigate('front-desk')} className="hover:text-primary cursor-pointer transition-colors">Front Desk</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit Group</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mt-xs">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Group Master Folio & Member Allocations
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Search corporate groups, configure master routing directives, verify credit headroom, and manage delegate reservations.
            </p>
          </div>

          <div className="flex items-center gap-sm">
            <span className="px-sm py-xs rounded bg-secondary-fixed text-on-secondary-fixed font-data-mono text-body-sm font-semibold">
              Master AR: {group.directArCode}
            </span>
          </div>
        </div>

        {/* Group Search Hub */}
        <div className="mt-sm relative">
          <div className="flex items-center bg-surface-container-low rounded-xl p-xs shadow-inner">
            <span className="material-symbols-outlined text-secondary ml-sm text-[22px]">groups</span>
            <input
              className="w-full pl-sm pr-md py-xs bg-transparent text-body-md text-on-surface font-semibold outline-none"
              placeholder="Search group code, corporate name, or AR contract..."
              value={searchQuery}
              onFocus={() => setIsSearchDropdownOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-xs text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container z-30 p-xs space-y-1">
              {[
                {
                  code: 'GRP-2026-088',
                  name: 'Apex Global Annual Summit 2026',
                  corp: 'Apex Global Holdings LLC',
                  ar: 'AR-APX-992',
                },
                {
                  code: 'GRP-2026-092',
                  name: 'BioHealth World Expo 2026',
                  corp: 'BioHealth International Corp',
                  ar: 'AR-BIO-104',
                },
                {
                  code: 'GRP-2026-101',
                  name: 'Nordic FinTech Forum',
                  corp: 'Nordic Banking Alliance',
                  ar: 'AR-NOR-880',
                },
              ].map((item) => (
                <div
                  key={item.code}
                  onClick={() => {
                    setSearchQuery(item.name);
                    setIsSearchDropdownOpen(false);
                    showToast(`Switched active context to ${item.name}.`);
                  }}
                  className="p-sm hover:bg-surface-container-low rounded-lg cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">corporate_fare</span>
                    <div>
                      <span className="font-bold text-body-sm text-on-surface block">{item.name}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        {item.code} • {item.corp}
                      </span>
                    </div>
                  </div>
                  <span className="font-data-mono text-[11px] text-secondary font-semibold">{item.ar}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Form & Members Grid */}
      <div className="px-lg py-md flex flex-col gap-lg">
        {/* Section 1: Master Group Directives & Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          {/* Left 2 Cols: Group Directives Form */}
          <form
            onSubmit={handleSaveDirectives}
            className="lg:col-span-2 bg-surface-container-lowest p-lg rounded-xl shadow-sm space-y-md"
          >
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
                <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Master Billing Directives & Account Details
                </h3>
              </div>
              <span className="font-data-mono text-[11px] text-on-surface-variant">Code: {group.groupId}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Group Event Name *
                </label>
                <input
                  required
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-semibold text-body-sm text-on-surface outline-none focus:border-secondary"
                  value={groupForm.groupName}
                  onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
                />
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Corporate Account Name *
                </label>
                <input
                  required
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 text-body-sm text-on-surface outline-none focus:border-secondary"
                  value={groupForm.corporateAccountName}
                  onChange={(e) => setGroupForm({ ...groupForm, corporateAccountName: e.target.value })}
                />
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Primary Organizer Contact
                </label>
                <input
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 text-body-sm text-on-surface outline-none focus:border-secondary"
                  value={groupForm.primaryOrganizer}
                  onChange={(e) => setGroupForm({ ...groupForm, primaryOrganizer: e.target.value })}
                />
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Organizer Phone
                </label>
                <input
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono text-body-sm text-on-surface outline-none focus:border-secondary"
                  value={groupForm.organizerPhone}
                  onChange={(e) => setGroupForm({ ...groupForm, organizerPhone: e.target.value })}
                />
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Group Check-In Date
                </label>
                <input
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono text-body-sm text-on-surface outline-none"
                  value={groupForm.checkInDate}
                  onChange={(e) => setGroupForm({ ...groupForm, checkInDate: e.target.value })}
                />
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Group Check-Out Date
                </label>
                <input
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono text-body-sm text-on-surface outline-none"
                  value={groupForm.checkOutDate}
                  onChange={(e) => setGroupForm({ ...groupForm, checkOutDate: e.target.value })}
                />
              </div>
            </div>

            {/* Enforced Routing Directives */}
            <div className="space-y-sm pt-xs border-t border-surface-container">
              <span className="font-label-uppercase text-[11px] text-on-surface-variant uppercase block font-semibold">
                Enforced Routing Directives
              </span>

              <div>
                <label className="text-[12px] font-semibold text-on-surface block mb-1">
                  Room & Lodging Taxes (Master Folio Routing)
                </label>
                <input
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 text-body-sm text-on-surface outline-none"
                  value={groupForm.roomAndTaxRouting}
                  onChange={(e) => setGroupForm({ ...groupForm, roomAndTaxRouting: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-on-surface block mb-1">
                  Incidentals & Food & Beverage Routing
                </label>
                <input
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 text-body-sm text-on-surface outline-none"
                  value={groupForm.incidentalsRouting}
                  onChange={(e) => setGroupForm({ ...groupForm, incidentalsRouting: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-sm flex justify-end">
              <button
                type="submit"
                className="px-lg py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm hover:opacity-95 transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Group Directives</span>
              </button>
            </div>
          </form>

          {/* Right Col: Financial Credit Summary Card */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm flex flex-col justify-between space-y-md">
            <div>
              <div className="flex items-center justify-between pb-xs border-b border-surface-container">
                <span className="font-title-sm text-title-sm font-bold text-on-surface">
                  Corporate AR Credit Line
                </span>
                <span className="px-sm py-0.5 rounded bg-surface-container font-data-mono text-[11px]">
                  {group.directArCode}
                </span>
              </div>

              <div className="mt-md space-y-sm">
                <div>
                  <span className="font-label-uppercase text-[10px] text-on-surface-variant uppercase">
                    Master Billing Folio
                  </span>
                  <span className="font-data-mono font-bold text-body-md text-secondary block">
                    {group.masterBillingFolio}
                  </span>
                </div>

                <div>
                  <span className="font-label-uppercase text-[10px] text-on-surface-variant uppercase">
                    Total Billed to Group
                  </span>
                  <span className="font-display-lg text-[26px] font-bold text-on-surface block">
                    ${group.totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-data-mono text-on-surface-variant">
                    <span>Utilization ({group.creditUtilizationPercent}%)</span>
                    <span>Line Cap: ${group.creditLineCap.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: `${group.creditUtilizationPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-sm rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-950 flex items-center justify-between">
                  <span className="text-[12px] font-medium">Available Headroom:</span>
                  <strong className="font-data-mono text-emerald-900 text-[14px]">
                    ${group.creditHeadroom.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-xs pt-md border-t border-surface-container">
              <button
                onClick={() => showToast('Master invoice generated for Apex Global Holdings.')}
                className="w-full py-xs bg-surface-container hover:bg-surface-container-high rounded text-body-sm font-semibold text-on-surface flex items-center justify-center gap-xs shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Print Master Statement</span>
              </button>
              <button
                onClick={() => showToast('Dispatched corporate summary statement via email.')}
                className="w-full py-xs bg-surface-container hover:bg-surface-container-high rounded text-body-sm font-semibold text-on-surface flex items-center justify-center gap-xs shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Email Corporate Billing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Group Member Reservations */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg flex flex-col gap-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md pb-xs border-b border-surface-container">
            <div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">badge</span>
                <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Group Member Reservations ({group.members.length} Picked Up of {group.contractedBlocks} Blocks)
                </h3>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Manage room allocations and AR routing coverage per individual delegate.
              </p>
            </div>

            <div className="flex items-center gap-sm">
              <div className="relative flex items-center min-w-[200px]">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[16px]">search</span>
                <input
                  className="w-full pl-xl pr-sm py-1 bg-surface-container-low rounded text-body-sm text-on-surface outline-none"
                  placeholder="Filter member..."
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                />
              </div>

              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-md py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm hover:opacity-95 flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Reservation to Group</span>
              </button>
            </div>
          </div>

          {/* Data Integrity Notice */}
          <div className="p-sm bg-surface-container-low rounded-lg text-[12px] text-on-surface-variant flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
            <span>
              <strong>Data Integrity Protocol:</strong> Detaching a guest removes corporate AR routing and redirects charges to
              their personal folio. The reservation record and guest profile remain intact.
            </span>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-body-sm font-body-sm text-on-surface border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-label-uppercase uppercase tracking-wider text-[11px]">
                  <th className="py-sm px-md font-semibold">Res ID</th>
                  <th className="py-sm px-md font-semibold">Guest Name & VIP</th>
                  <th className="py-sm px-md font-semibold">Room & Type</th>
                  <th className="py-sm px-md font-semibold">Stay Window</th>
                  <th className="py-sm px-md font-semibold">Status</th>
                  <th className="py-sm px-md font-semibold">Billing Coverage</th>
                  <th className="py-sm px-md font-semibold text-right pr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-sm px-md font-data-mono font-semibold text-secondary">{m.resId}</td>

                    <td className="py-sm px-md">
                      <div className="flex items-center gap-xs">
                        <span className="font-semibold text-on-surface">{m.guestName}</span>
                        {m.vipTier && (
                          <span className="px-xs py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[9px]">
                            {m.vipTier}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-data-mono">{m.guestEmail}</span>
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex items-center gap-xs">
                        <span className="px-sm py-0.5 rounded bg-surface-container-highest font-data-mono font-bold">
                          {m.roomNumber}
                        </span>
                        <span className="text-body-sm">{m.roomTypeName}</span>
                      </div>
                    </td>

                    <td className="py-sm px-md font-data-mono text-[12px]">
                      {m.checkInDate} → {m.checkOutDate}
                    </td>

                    <td className="py-sm px-md">
                      <span className="px-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold text-[11px]">
                        {m.status}
                      </span>
                    </td>

                    <td className="py-sm px-md">
                      <span
                        className={`px-xs py-0.5 rounded text-[11px] font-semibold ${
                          m.billingCoverage.includes('Covered')
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {m.billingCoverage}
                      </span>
                    </td>

                    <td className="py-sm px-md text-right pr-lg">
                      <button
                        onClick={() => setMemberToDetach(m)}
                        className="px-sm py-1 bg-surface-container hover:bg-rose-100 hover:text-rose-900 rounded text-body-sm text-on-surface-variant font-semibold transition-colors"
                      >
                        Detach from Group
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detach Micro-Dialog Confirmation Modal */}
      {memberToDetach && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md">
            <div className="flex items-center gap-sm text-amber-800">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                Detach Guest from Group Master
              </h3>
            </div>

            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to detach <strong>{memberToDetach.guestName}</strong> ({memberToDetach.resId}) from{' '}
              <strong>{group.groupName}</strong>?
            </p>

            <div className="p-sm bg-surface-container-low rounded text-[12px] text-on-surface-variant space-y-1">
              <p>• Room & Tax will no longer route to Master Folio {group.masterBillingFolio}.</p>
              <p>• Guest will be required to provide a personal credit card upon check-in/checkout.</p>
              <p>• The reservation {memberToDetach.resId} will not be cancelled.</p>
            </div>

            <div className="flex items-center justify-end gap-sm pt-xs border-t border-surface-container">
              <button
                onClick={() => setMemberToDetach(null)}
                className="px-md py-xs rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDetach}
                className="px-md py-xs bg-rose-600 hover:bg-rose-700 text-white rounded text-body-sm font-semibold shadow-sm"
              >
                Confirm Detach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reservation to Group Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                Link Reservation to Group
              </h3>
              <button onClick={() => setIsAddMemberModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-sm text-body-sm">
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Select Confirmed Reservation
                </label>
                <select
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono"
                  value={newMemberResId}
                  onChange={(e) => setNewMemberResId(e.target.value)}
                >
                  <option value="RES-9520">RES-9520 — Julian Wright (Room 114, DLXK)</option>
                  <option value="RES-9410">RES-9410 — Marcus Kraus (Unassigned, SUPQ)</option>
                  <option value="RES-9445">RES-9445 — Sophia Lin (Room 310, PRMS)</option>
                </select>
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Billing Directive for New Member
                </label>
                <select className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40">
                  <option value="covered">Room & Tax Covered by Corporate Master</option>
                  <option value="self">Self-Pay All (Delegate Folio)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-sm pt-sm border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-md py-xs rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-xs bg-secondary text-on-secondary rounded text-body-sm font-semibold shadow-sm hover:opacity-95"
                >
                  Link to Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-lg right-lg z-50 bg-primary text-on-primary px-md py-sm rounded-lg shadow-xl flex items-center gap-sm animate-in fade-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          <span className="font-body-sm text-[13px]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
