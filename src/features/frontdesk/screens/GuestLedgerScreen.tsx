import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { GuestLedgerTab, GuestLedgerEntry, FolioTransaction } from '../types';
import {
  WORKING_DATE,
  INITIAL_LEDGER_ENTRIES,
  SAMPLE_FOLIO_TRANSACTIONS,
} from '../mockData';

interface GuestLedgerScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const GuestLedgerScreen: React.FC<GuestLedgerScreenProps> = ({ onNavigateToScreen }) => {
  const { navigate } = useProperty();
  const [activeTab, setActiveTab] = useState<GuestLedgerTab>('inhouse');
  const [entries, setEntries] = useState<GuestLedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChipFilter, setActiveChipFilter] = useState<'all' | 'vip' | 'balance' | 'direct'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Folio Drawer State
  const [activeDrawerGuest, setActiveDrawerGuest] = useState<{
    guestName: string;
    roomNum: string;
    folioId: string;
    balance: number;
  } | null>(null);

  const [folioTransactions, setFolioTransactions] = useState<FolioTransaction[]>(SAMPLE_FOLIO_TRANSACTIONS);
  const [isPostChargeModalOpen, setIsPostChargeModalOpen] = useState(false);
  const [newChargeForm, setNewChargeForm] = useState({
    description: 'The Palm Terrace Bar & Grill',
    amount: '45.00',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tab Counts
  const inHouseCount = entries.filter((e) => e.status === 'In-House').length;
  const toCheckOutCount = entries.filter((e) => e.status === 'To Check Out').length;
  const checkedOutCount = 12;
  const reservationsCount = 42;
  const roomChangeCount = entries.filter((e) => Boolean(e.targetRoomNumber)).length;
  const lateCheckoutCount = entries.filter((e) => Boolean(e.approvedDeparture)).length;

  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Tab filter
      if (activeTab === 'inhouse' && item.status !== 'In-House') return false;
      if (activeTab === 'checkout' && item.status !== 'To Check Out') return false;
      if (activeTab === 'room-change' && !item.targetRoomNumber) return false;
      if (activeTab === 'late-checkout' && !item.approvedDeparture) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.guestName.toLowerCase().includes(q) ||
          item.roomNumber.toLowerCase().includes(q) ||
          item.folioId.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Chip Filter
      if (activeChipFilter === 'vip' && !item.vipTier?.includes('VIP')) return false;
      if (activeChipFilter === 'balance' && item.balanceDue <= 0) return false;

      return true;
    });
  }, [entries, activeTab, searchQuery, activeChipFilter]);

  const handleCompleteRoomMove = (guestName: string, toRoom: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.guestName === guestName) {
          return {
            ...e,
            roomNumber: toRoom,
            targetRoomNumber: undefined,
            hkStatus: 'Inspected & Clean Ready',
          };
        }
        return e;
      })
    );
    showToast(`Room relocation completed for ${guestName} to Room ${toRoom}. Digital keys re-encoded.`);
  };

  const handlePostCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newChargeForm.amount) || 0;
    if (amt <= 0) return;

    const newTx: FolioTransaction = {
      id: String(Date.now()),
      date: '29-Jun',
      description: newChargeForm.description,
      debit: amt,
      credit: 0,
    };
    setFolioTransactions((prev) => [newTx, ...prev]);
    if (activeDrawerGuest) {
      setActiveDrawerGuest({
        ...activeDrawerGuest,
        balance: activeDrawerGuest.balance + amt,
      });
      // Also update entry
      setEntries((prev) =>
        prev.map((e) =>
          e.folioId === activeDrawerGuest.folioId
            ? { ...e, balanceDue: e.balanceDue + amt }
            : e
        )
      );
    }
    setIsPostChargeModalOpen(false);
    setNewChargeForm({ description: 'The Palm Terrace Bar & Grill', amount: '45.00' });
    showToast(`Charge of $${amt.toFixed(2)} posted to Folio #${activeDrawerGuest?.folioId}.`);
  };

  const handleSettleFolio = () => {
    if (!activeDrawerGuest) return;
    const due = activeDrawerGuest.balance;
    if (due <= 0) {
      showToast('Folio is already fully settled.');
      return;
    }
    const settleTx: FolioTransaction = {
      id: String(Date.now()),
      date: '29-Jun',
      description: 'Front Desk Express Terminal Settlement (Visa)',
      debit: 0,
      credit: due,
    };
    setFolioTransactions((prev) => [settleTx, ...prev]);
    setActiveDrawerGuest({
      ...activeDrawerGuest,
      balance: 0,
    });
    setEntries((prev) =>
      prev.map((e) =>
        e.folioId === activeDrawerGuest.folioId ? { ...e, balanceDue: 0 } : e
      )
    );
    showToast(`Folio #${activeDrawerGuest.folioId} successfully settled in full!`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Operational Sub-Header & Breadcrumb Bar */}
      <div className="px-lg pt-md pb-base flex flex-col gap-xs bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-xs text-body-sm text-on-surface-variant font-body-sm">
            <span onClick={() => navigate('dashboard')} className="hover:text-primary cursor-pointer transition-colors">Operations</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span onClick={() => onNavigateToScreen ? onNavigateToScreen('search-reservation') : navigate('front-desk')} className="hover:text-primary cursor-pointer transition-colors">Front Desk</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Guest Ledger</span>
          </div>

          {/* Live Sync & Quick Utility Actions */}
          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container text-body-sm font-data-mono text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>SYNCED 10:42:18 EDT</span>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-xs px-sm py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-body-md transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Manifest</span>
            </button>
            <button
              onClick={() => showToast('Exporting guest ledger report to XLSX...')}
              className="flex items-center gap-xs px-sm py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-body-md transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export .XLSX</span>
            </button>
            <button
              onClick={() => showToast('Guest Ledger refreshed with live PMS database.')}
              className="flex items-center gap-xs px-sm py-xs bg-primary text-on-primary hover:bg-primary/90 rounded text-body-sm font-body-md transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Working Date Audit Strip Banner */}
        <div className="mt-xs flex flex-wrap items-center justify-between gap-sm px-md py-xs bg-tertiary-container text-on-tertiary rounded-lg">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]">event_available</span>
            <div className="flex items-center gap-xs text-body-sm font-data-mono">
              <span className="text-on-tertiary font-semibold tracking-wide">Property Working Date:</span>
              <span className="text-secondary-fixed font-semibold">Monday, {WORKING_DATE}</span>
              <span className="text-outline-variant font-normal">|</span>
              <span className="text-tertiary-fixed text-body-sm">Night Audit: Active Business Day</span>
              <span className="text-outline-variant font-normal">|</span>
              <span className="px-xs py-[2px] bg-secondary-container text-on-secondary-container rounded text-label-uppercase font-label-uppercase text-[11px]">
                PMS Day 180
              </span>
            </div>
          </div>
          <div className="flex items-center gap-md text-body-sm font-data-mono text-tertiary-fixed-dim">
            <span>
              House Occupancy: <strong className="text-on-tertiary font-semibold">88.4%</strong> (176/200 Rms)
            </span>
            <span>
              RevPAR: <strong className="text-on-tertiary font-semibold">$198.40</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Operational Core Surface */}
      <div className="px-lg py-md flex flex-col gap-md">
        {/* KPI Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
          {/* In House */}
          <div
            onClick={() => setActiveTab('inhouse')}
            className={`flex flex-col p-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 cursor-pointer ${
              activeTab === 'inhouse' ? 'border-secondary ring-1 ring-secondary/30' : 'border-secondary/60'
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-uppercase font-label-uppercase text-[11px] uppercase tracking-wider">
                In-House Guests
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">hotel</span>
            </div>
            <div className="mt-xs flex items-baseline gap-xs">
              <span className="text-display-lg font-display-lg text-on-surface">58</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">registered</span>
            </div>
            <div className="mt-xs flex items-center justify-between text-body-sm font-data-mono text-on-surface-variant text-[11px]">
              <span>
                Folio Bal: <strong className="text-on-surface">$14,280</strong>
              </span>
              <span className="text-secondary font-semibold">92% VIP</span>
            </div>
          </div>

          {/* Today Due Out */}
          <div
            onClick={() => setActiveTab('checkout')}
            className={`flex flex-col p-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
              activeTab === 'checkout' ? 'ring-1 ring-secondary/30 border-l-4 border-amber-500' : ''
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-uppercase font-label-uppercase text-[11px] uppercase tracking-wider">
                Today Due Out
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">departure_board</span>
            </div>
            <div className="mt-xs flex items-baseline gap-xs">
              <span className="text-display-lg font-display-lg text-on-surface">18</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">departures</span>
            </div>
            <div className="mt-xs flex items-center justify-between text-body-sm font-data-mono text-on-surface-variant text-[11px]">
              <span>
                Unsettled: <strong className="text-error font-semibold">4 Folios</strong>
              </span>
              <span>Due by 12:00</span>
            </div>
          </div>

          {/* Checked Out */}
          <div
            onClick={() => setActiveTab('checkedout')}
            className={`flex flex-col p-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
              activeTab === 'checkedout' ? 'ring-1 ring-secondary/30 border-l-4 border-emerald-500' : ''
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-uppercase font-label-uppercase text-[11px] uppercase tracking-wider">
                Checked Out
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">fact_check</span>
            </div>
            <div className="mt-xs flex items-baseline gap-xs">
              <span className="text-display-lg font-display-lg text-on-surface">12</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">completed</span>
            </div>
            <div className="mt-xs flex items-center justify-between text-body-sm font-data-mono text-on-surface-variant text-[11px]">
              <span>100% Settled</span>
              <span>HK Clean In-Prog</span>
            </div>
          </div>

          {/* Pending Room Moves */}
          <div
            onClick={() => setActiveTab('room-change')}
            className={`flex flex-col p-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 cursor-pointer ${
              activeTab === 'room-change'
                ? 'border-secondary-container ring-1 ring-secondary/30'
                : 'border-secondary-container/70'
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-uppercase font-label-uppercase text-[11px] uppercase tracking-wider">
                Pending Moves
              </span>
              <span className="material-symbols-outlined text-secondary-container text-[20px]">swap_horiz</span>
            </div>
            <div className="mt-xs flex items-baseline gap-xs">
              <span className="text-display-lg font-display-lg text-on-surface">4</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">relocations</span>
            </div>
            <div className="mt-xs flex items-center justify-between text-body-sm font-data-mono text-on-surface-variant text-[11px]">
              <span className="text-on-surface font-semibold">2 Upgrades</span>
              <span className="text-secondary font-semibold">1 Bell Action</span>
            </div>
          </div>

          {/* Pending Late Checkouts */}
          <div
            onClick={() => setActiveTab('late-checkout')}
            className={`flex flex-col p-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
              activeTab === 'late-checkout' ? 'ring-1 ring-secondary/30 border-l-4 border-indigo-500' : ''
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-uppercase font-label-uppercase text-[11px] uppercase tracking-wider">
                Late Checkouts
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">schedule</span>
            </div>
            <div className="mt-xs flex items-baseline gap-xs">
              <span className="text-display-lg font-display-lg text-on-surface">6</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">approved</span>
            </div>
            <div className="mt-xs flex items-center justify-between text-body-sm font-data-mono text-on-surface-variant text-[11px]">
              <span>Until 14:00 - 15:00</span>
              <span>4 Waived / 2 Billed</span>
            </div>
          </div>
        </div>

        {/* Operational Room Transition Preview Callout Banner */}
        <div className="bg-surface-container-low rounded-xl p-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div className="flex items-start gap-md">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-on-secondary-container text-[24px]">
                published_with_changes
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-xs">
                <span className="font-title-sm text-title-sm text-on-surface">Live Pipeline: Scheduled Room Relocations</span>
                <span className="px-xs py-[2px] bg-secondary-fixed text-on-secondary-fixed rounded text-label-uppercase font-label-uppercase text-[10px]">
                  Priority Shift
                </span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-[2px]">
                Guest <strong>Victoria Sterling</strong> transitioning Room 108 (DLXK) → Room 312 (PRMS Upgrade) scheduled
                for 11:30 AM. Bell desk notified for 2 items.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-sm shrink-0">
            <button
              onClick={() => setActiveTab('room-change')}
              className="px-md py-xs bg-surface-container-lowest hover:bg-surface-container-high text-on-surface rounded-lg text-body-sm font-body-md font-semibold transition-colors shadow-sm flex items-center gap-xs"
            >
              <span>View Room Moves Sub-Ledger</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Main Tabbed Ledger Card Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Pattern F Operational Tab Bar */}
          <div className="flex items-center justify-between bg-surface-container-low px-md overflow-x-auto no-scrollbar border-b border-surface-container">
            <div className="flex items-center gap-xs pt-xs">
              {/* Tab 1: In House Guests */}
              <button
                onClick={() => setActiveTab('inhouse')}
                className={`flex items-center gap-xs px-md py-sm rounded-t-lg transition-all text-body-sm font-body-md ${
                  activeTab === 'inhouse'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-normal'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">bed</span>
                <span>In House Guests</span>
                <span className="ml-xs px-xs py-[2px] rounded-full bg-secondary-fixed text-on-secondary-fixed font-data-mono text-[11px] font-semibold">
                  {inHouseCount}
                </span>
              </button>

              {/* Tab 2: Guests To Check Out */}
              <button
                onClick={() => setActiveTab('checkout')}
                className={`flex items-center gap-xs px-md py-sm rounded-t-lg transition-all text-body-sm font-body-md ${
                  activeTab === 'checkout'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-normal'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>To Check Out</span>
                <span className="ml-xs px-xs py-[2px] rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]">
                  {toCheckOutCount}
                </span>
              </button>

              {/* Tab 3: Guests Checked Out */}
              <button
                onClick={() => setActiveTab('checkedout')}
                className={`flex items-center gap-xs px-md py-sm rounded-t-lg transition-all text-body-sm font-body-md ${
                  activeTab === 'checkedout'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-normal'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Checked Out</span>
                <span className="ml-xs px-xs py-[2px] rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]">
                  {checkedOutCount}
                </span>
              </button>

              {/* Tab 4: Reservations */}
              <button
                onClick={() => setActiveTab('reservations')}
                className={`flex items-center gap-xs px-md py-sm rounded-t-lg transition-all text-body-sm font-body-md ${
                  activeTab === 'reservations'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-normal'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">book_online</span>
                <span>Reservations</span>
                <span className="ml-xs px-xs py-[2px] rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]">
                  {reservationsCount}
                </span>
              </button>

              {/* Tab 5: Guests To Change Room */}
              <button
                onClick={() => setActiveTab('room-change')}
                className={`flex items-center gap-xs px-md py-sm rounded-t-lg transition-all text-body-sm font-body-md ${
                  activeTab === 'room-change'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-normal'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                <span>To Change Room</span>
                <span className="ml-xs px-xs py-[2px] rounded-full bg-secondary-container text-on-secondary-container font-data-mono text-[11px] font-semibold">
                  {roomChangeCount}
                </span>
              </button>

              {/* Tab 6: Late Checkout */}
              <button
                onClick={() => setActiveTab('late-checkout')}
                className={`flex items-center gap-xs px-md py-sm rounded-t-lg transition-all text-body-sm font-body-md ${
                  activeTab === 'late-checkout'
                    ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-normal'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">timelapse</span>
                <span>Late Checkout</span>
                <span className="ml-xs px-xs py-[2px] rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]">
                  {lateCheckoutCount}
                </span>
              </button>
            </div>

            {/* Density Controls */}
            <div className="flex items-center gap-xs pb-xs">
              <button className="p-xs text-on-surface-variant hover:text-on-surface rounded bg-surface-container" title="Compact View">
                <span className="material-symbols-outlined text-[18px]">density_small</span>
              </button>
              <button className="p-xs text-on-surface-variant hover:text-on-surface rounded bg-surface-container" title="Columns Visibility">
                <span className="material-symbols-outlined text-[18px]">view_column</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Ribbon Bar */}
          <div className="p-md flex flex-wrap items-center justify-between gap-md bg-surface-container-lowest border-b border-surface-container">
            <div className="flex flex-wrap items-center gap-sm flex-1">
              <div className="relative flex items-center min-w-[300px] flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[18px]">
                  filter_alt
                </span>
                <input
                  className="w-full pl-xl pr-md py-xs bg-surface-container-low rounded-lg text-body-sm font-body-sm outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/30 transition-all text-on-surface"
                  placeholder="Filter guest by name, room, confirmation number..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Fast Quick Filter Chips */}
              <div className="flex items-center gap-xs flex-wrap">
                <button
                  onClick={() => setActiveChipFilter('all')}
                  className={`px-sm py-xs rounded text-body-sm font-body-sm font-medium transition-colors ${
                    activeChipFilter === 'all'
                      ? 'bg-surface-container-highest text-on-surface font-semibold'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  All Floors
                </button>
                <button
                  onClick={() => setActiveChipFilter(activeChipFilter === 'vip' ? 'all' : 'vip')}
                  className={`px-sm py-xs rounded text-body-sm font-body-sm transition-colors ${
                    activeChipFilter === 'vip'
                      ? 'bg-secondary-fixed text-on-secondary-fixed font-semibold'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  VIP Tier Only
                </button>
                <button
                  onClick={() => setActiveChipFilter(activeChipFilter === 'balance' ? 'all' : 'balance')}
                  className={`px-sm py-xs rounded text-body-sm font-body-sm transition-colors ${
                    activeChipFilter === 'balance'
                      ? 'bg-amber-100 text-amber-900 font-semibold'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Balance Due (&gt;$0.00)
                </button>
              </div>
            </div>

            {/* Bulk Action Options */}
            <div className="flex items-center gap-xs">
              <button
                onClick={() => showToast('Batch pre-authorization initiated for 14 active folios.')}
                className="px-sm py-xs bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded text-body-sm font-body-sm flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                <span>Batch Pre-Auth</span>
              </button>
              <button
                onClick={() => showToast('Batch statements prepared for dispatch.')}
                className="px-sm py-xs bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded text-body-sm font-body-sm flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>Batch Statement</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'inhouse' && (
            <div className="flex flex-col w-full overflow-x-auto">
              <table className="w-full text-left text-body-sm font-body-sm text-on-surface border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-label-uppercase uppercase tracking-wider text-[11px]">
                    <th className="py-sm px-md font-semibold">Guest & VIP Tier</th>
                    <th className="py-sm px-md font-semibold">Room / Floor</th>
                    <th className="py-sm px-md font-semibold">Type</th>
                    <th className="py-sm px-md font-semibold">Date In</th>
                    <th className="py-sm px-md font-semibold">Date Out</th>
                    <th className="py-sm px-md font-semibold text-right">ADR</th>
                    <th className="py-sm px-md font-semibold text-right">Paid</th>
                    <th className="py-sm px-md font-semibold text-right">Balance</th>
                    <th className="py-sm px-md font-semibold">Special Requests / Alerts</th>
                    <th className="py-sm px-md font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredEntries.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-sm px-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-semibold text-body-sm">
                            {row.guestName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-xs">
                              <span
                                onClick={() =>
                                  setActiveDrawerGuest({
                                    guestName: row.guestName,
                                    roomNum: row.roomNumber,
                                    folioId: row.folioId,
                                    balance: row.balanceDue,
                                  })
                                }
                                className="font-semibold text-on-surface group-hover:text-secondary cursor-pointer"
                              >
                                {row.guestName}
                              </span>
                              {row.vipTier && (
                                <span className="px-[6px] py-[1px] bg-secondary-fixed text-on-secondary-fixed text-[10px] font-label-uppercase rounded">
                                  {row.vipTier}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-data-mono text-on-surface-variant">
                              {row.phone} • Folio #{row.folioId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-sm px-md">
                        <div className="flex items-center gap-xs">
                          <span className="px-sm py-[2px] bg-surface-container-highest text-on-surface font-data-mono font-semibold text-body-sm rounded">
                            {row.roomNumber}
                          </span>
                          {row.targetRoomNumber && (
                            <>
                              <span className="material-symbols-outlined text-secondary text-[14px]">trending_flat</span>
                              <span className="px-sm py-[2px] bg-secondary-container text-on-secondary-container font-data-mono font-semibold text-body-sm rounded">
                                {row.targetRoomNumber}
                              </span>
                            </>
                          )}
                          <span className="text-[11px] text-on-surface-variant ml-1">{row.floor}</span>
                        </div>
                      </td>

                      <td className="py-sm px-md font-data-mono font-medium text-on-surface">{row.roomCategory}</td>
                      <td className="py-sm px-md font-data-mono text-[12px] text-on-surface">{row.checkInDate}</td>
                      <td className="py-sm px-md font-data-mono text-[12px] text-on-surface">{row.checkOutDate}</td>
                      <td className="py-sm px-md font-data-mono text-right text-on-surface">${row.adr.toFixed(2)}</td>
                      <td className="py-sm px-md font-data-mono text-right text-on-surface">${row.paidAmount.toFixed(2)}</td>
                      <td className="py-sm px-md font-data-mono text-right">
                        <span
                          className={`px-xs py-[2px] rounded text-[11px] font-medium ${
                            row.balanceDue > 0
                              ? 'bg-error-container text-on-error-container font-semibold'
                              : 'bg-surface-container text-on-surface'
                          }`}
                        >
                          {row.balanceDue > 0 ? `$${row.balanceDue.toFixed(2)} Due` : '$0.00 Settled'}
                        </span>
                      </td>

                      <td className="py-sm px-md max-w-xs truncate">
                        {row.specialRequests && row.specialRequests.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="px-xs py-[2px] bg-surface-container-high text-on-surface-variant rounded text-[11px]">
                              {row.specialRequests[0]}
                            </span>
                            {row.specialRequests.length > 1 && (
                              <span className="text-[11px] text-on-surface-variant">+{row.specialRequests.length - 1} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-[12px]">—</span>
                        )}
                      </td>

                      <td className="py-sm px-md text-center">
                        <div className="flex items-center justify-center gap-xs">
                          <button
                            onClick={() =>
                              setActiveDrawerGuest({
                                guestName: row.guestName,
                                roomNum: row.roomNumber,
                                folioId: row.folioId,
                                balance: row.balanceDue,
                              })
                            }
                            className="px-xs py-1 rounded hover:bg-surface-container text-secondary text-body-sm font-semibold"
                            title="View Folio"
                          >
                            Folio
                          </button>
                          <button
                            onClick={() => {
                              setActiveDrawerGuest({
                                guestName: row.guestName,
                                roomNum: row.roomNumber,
                                folioId: row.folioId,
                                balance: row.balanceDue,
                              });
                              setIsPostChargeModalOpen(true);
                            }}
                            className="px-xs py-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                            title="Post Charge"
                          >
                            <span className="material-symbols-outlined text-[18px]">add_card</span>
                          </button>
                          <button
                            onClick={() => showToast(`Keycard issued for Room ${row.roomNumber}.`)}
                            className="px-xs py-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                            title="Encode Key Card"
                          >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: GUESTS TO CHANGE ROOM */}
          {activeTab === 'room-change' && (
            <div className="flex flex-col w-full overflow-x-auto">
              <div className="px-md py-sm bg-surface-container flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px]">transfer_within_a_station</span>
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    Daily Room Relocation Queue ({entries.filter((e) => e.targetRoomNumber).length} Total Transfers)
                  </span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">
                    • Housekeeping auto-routed for priority clean on destination units
                  </span>
                </div>
                <button
                  onClick={() => showToast('Push notification broadcast to Bell Desk for all pending luggage transfers.')}
                  className="px-sm py-xs bg-secondary text-on-secondary rounded text-body-sm font-body-md font-semibold hover:bg-secondary/90 transition-colors shadow-sm"
                >
                  Notify Bell Desk All
                </button>
              </div>

              <table className="w-full text-left text-body-sm font-body-sm text-on-surface border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-label-uppercase uppercase tracking-wider text-[11px]">
                    <th className="py-sm px-md font-semibold">Guest & Folio</th>
                    <th className="py-sm px-md font-semibold">Current (From) Room</th>
                    <th className="py-sm px-md font-semibold">Transition Type</th>
                    <th className="py-sm px-md font-semibold">Target (To) Room</th>
                    <th className="py-sm px-md font-semibold">Move Time</th>
                    <th className="py-sm px-md font-semibold">Baggage Handling</th>
                    <th className="py-sm px-md font-semibold">Housekeeping Status</th>
                    <th className="py-sm px-md font-semibold text-center">Move Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {entries
                    .filter((e) => Boolean(e.targetRoomNumber))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-sm px-md">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">{item.guestName}</span>
                            <span className="text-[11px] font-data-mono text-on-surface-variant">
                              Folio #{item.folioId} • {item.vipTier || 'Standard'}
                            </span>
                          </div>
                        </td>

                        <td className="py-sm px-md">
                          <div className="flex items-center gap-xs">
                            <span className="px-sm py-xs rounded bg-surface-container-highest font-data-mono font-semibold text-on-surface">
                              Room {item.roomNumber}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">{item.roomCategory}</span>
                          </div>
                        </td>

                        <td className="py-sm px-md">
                          <span className="px-xs py-[2px] bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-semibold">
                            {item.transitionType || 'Upgrade'}
                          </span>
                        </td>

                        <td className="py-sm px-md">
                          <div className="flex items-center gap-xs">
                            <span className="px-sm py-xs rounded bg-secondary-container text-on-secondary-container font-data-mono font-semibold">
                              Room {item.targetRoomNumber}
                            </span>
                          </div>
                        </td>

                        <td className="py-sm px-md font-data-mono font-semibold text-on-surface">
                          {item.moveTime || '12:00 PM'}
                        </td>

                        <td className="py-sm px-md">
                          <span className="flex items-center gap-xs text-[12px] text-secondary font-medium">
                            <span className="material-symbols-outlined text-[16px]">luggage</span>
                            {item.baggageHandling || 'Bell Desk'}
                          </span>
                        </td>

                        <td className="py-sm px-md">
                          <span
                            className={`px-xs py-[2px] rounded text-[11px] font-semibold ${
                              item.hkStatus?.includes('Ready')
                                ? 'bg-secondary-fixed text-on-secondary-fixed'
                                : 'bg-surface-container-highest text-on-surface'
                            }`}
                          >
                            {item.hkStatus || 'Pending HK'}
                          </span>
                        </td>

                        <td className="py-sm px-md text-center">
                          <button
                            onClick={() => handleCompleteRoomMove(item.guestName, item.targetRoomNumber!)}
                            className="px-md py-xs bg-primary text-on-primary hover:bg-primary/80 rounded text-body-sm font-semibold transition-all shadow-sm"
                          >
                            Complete Room Move
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: LATE CHECKOUT */}
          {activeTab === 'late-checkout' && (
            <div className="flex flex-col w-full overflow-x-auto">
              <div className="px-md py-sm bg-surface-container flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px]">more_time</span>
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    Late Checkout Approvals & Departure Scheduling (6 Authorized)
                  </span>
                </div>
                <span className="text-body-sm font-data-mono text-on-surface-variant">
                  Standard Checkout Policy: 11:00 AM EDT
                </span>
              </div>

              <table className="w-full text-left text-body-sm font-body-sm text-on-surface border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-label-uppercase uppercase tracking-wider text-[11px]">
                    <th className="py-sm px-md font-semibold">Guest & Folio</th>
                    <th className="py-sm px-md font-semibold">Room</th>
                    <th className="py-sm px-md font-semibold">Approved Departure</th>
                    <th className="py-sm px-md font-semibold">Late Checkout Fee Status</th>
                    <th className="py-sm px-md font-semibold">Authorized By</th>
                    <th className="py-sm px-md font-semibold">Housekeeping Sync</th>
                    <th className="py-sm px-md font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {entries
                    .filter((e) => Boolean(e.approvedDeparture))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-sm px-md font-semibold text-on-surface">
                          {item.guestName} ({item.vipTier || 'Standard'})
                        </td>
                        <td className="py-sm px-md font-data-mono font-semibold">Room {item.roomNumber}</td>
                        <td className="py-sm px-md font-data-mono text-secondary font-semibold">
                          {item.approvedDeparture}
                        </td>
                        <td className="py-sm px-md">
                          <span
                            className={`px-xs py-[2px] text-[11px] font-semibold rounded ${
                              item.lateFeeStatus?.includes('Waived')
                                ? 'bg-surface-container text-on-surface'
                                : 'bg-secondary-fixed text-on-secondary-fixed'
                            }`}
                          >
                            {item.lateFeeStatus}
                          </span>
                        </td>
                        <td className="py-sm px-md text-body-sm">{item.authorizedBy || 'Alex Rivera (FD Sup)'}</td>
                        <td className="py-sm px-md">
                          <span className="text-secondary font-medium text-[12px]">
                            {item.hkSyncStatus || 'HK Board Updated'}
                          </span>
                        </td>
                        <td className="py-sm px-md text-center">
                          <button
                            onClick={() => showToast(`Extension adjusted for ${item.guestName}.`)}
                            className="px-sm py-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded text-body-sm"
                          >
                            Edit Extension
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2, 3, 4 DYNAMIC VIEWS */}
          {(activeTab === 'checkout' || activeTab === 'checkedout' || activeTab === 'reservations') && (
            <div className="p-xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary text-[48px] mb-sm">
                {activeTab === 'checkout' ? 'logout' : activeTab === 'checkedout' ? 'fact_check' : 'book_online'}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {activeTab === 'checkout'
                  ? 'Guests To Check Out (18 Due Today)'
                  : activeTab === 'checkedout'
                  ? 'Checked Out Folio Archive (12 Today)'
                  : 'Active Reservations Ledger (42 Expected)'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-xs">
                {activeTab === 'checkout'
                  ? 'Operational review of departures awaiting folio reconciliation, baggage pickup, or key drop.'
                  : activeTab === 'checkedout'
                  ? 'Archived checkouts for working date 29-Jun-2026. All accounts zeroed and released to HK turnover pipeline.'
                  : 'Today expected arrivals, guaranteed reservations, and advance deposit ledger tracking.'}
              </p>
              <button
                onClick={() => setActiveTab('inhouse')}
                className="mt-md px-md py-xs bg-secondary text-on-secondary rounded text-body-sm font-semibold"
              >
                Return to In-House Ledger
              </button>
            </div>
          )}

          {/* Ledger Table Footer */}
          <div className="px-md py-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-sm border-t border-surface-container">
            <div className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface-variant">
              <span>
                Displaying <strong className="text-on-surface font-semibold">{filteredEntries.length}</strong> Records
              </span>
              <span className="text-outline-variant">|</span>
              <span className="font-data-mono text-[12px]">
                Total Ledger Val: <strong className="text-on-surface">$162,940.00</strong>
              </span>
            </div>
            <div className="flex items-center gap-xs">
              <button className="px-sm py-xs bg-surface-container text-on-surface-variant rounded text-body-sm hover:bg-surface-container-high disabled:opacity-40" disabled>
                Previous
              </button>
              <span className="px-sm py-xs bg-secondary text-on-secondary rounded text-body-sm font-semibold font-data-mono">
                1
              </span>
              <button className="px-sm py-xs bg-surface-container text-on-surface-variant rounded text-body-sm hover:bg-surface-container-high disabled:opacity-40" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Out Quick Folio Ledger Drawer */}
      {activeDrawerGuest && (
        <>
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setActiveDrawerGuest(null)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-[480px] max-w-full bg-surface-container-lowest shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-lg py-md bg-tertiary-container text-on-tertiary flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-xs">
                  <span className="font-title-sm text-title-sm">{activeDrawerGuest.guestName}</span>
                  <span className="px-xs py-[2px] bg-secondary-container text-on-secondary-container font-data-mono text-[10px] rounded">
                    Room {activeDrawerGuest.roomNum}
                  </span>
                </div>
                <span className="font-data-mono text-[11px] text-tertiary-fixed-dim">
                  Folio #{activeDrawerGuest.folioId} • Express Settle Console
                </span>
              </div>
              <button
                className="text-on-tertiary hover:text-secondary-fixed transition-colors"
                onClick={() => setActiveDrawerGuest(null)}
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Drawer Content Scroll */}
            <div className="flex-1 p-lg overflow-y-auto flex flex-col gap-md">
              {/* Balance Status Box */}
              <div className="p-md bg-surface-container rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-label-uppercase uppercase text-on-surface-variant text-[11px]">
                    Outstanding Folio Balance
                  </span>
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">
                    ${activeDrawerGuest.balance.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleSettleFolio}
                  className="px-md py-xs bg-secondary text-on-secondary rounded-lg font-semibold text-body-sm shadow-sm hover:bg-secondary/90 transition-all"
                >
                  Settle Folio
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-xs">
                <button
                  onClick={() => setIsPostChargeModalOpen(true)}
                  className="flex flex-col items-center justify-center p-sm bg-surface-container-low hover:bg-surface-container rounded-lg gap-1 text-center transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">add_circle</span>
                  <span className="text-body-sm font-semibold text-on-surface text-[12px]">Post Charge</span>
                </button>
                <button
                  onClick={() => showToast('Credit card tokenized from terminal.')}
                  className="flex flex-col items-center justify-center p-sm bg-surface-container-low hover:bg-surface-container rounded-lg gap-1 text-center transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">credit_card</span>
                  <span className="text-body-sm font-semibold text-on-surface text-[12px]">Add Card</span>
                </button>
                <button
                  onClick={() => showToast('Split billing window activated.')}
                  className="flex flex-col items-center justify-center p-sm bg-surface-container-low hover:bg-surface-container rounded-lg gap-1 text-center transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
                  <span className="text-body-sm font-semibold text-on-surface text-[12px]">Split Bill</span>
                </button>
              </div>

              {/* Itemized Ledger Line Items */}
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <span className="font-title-sm text-[14px] font-semibold text-on-surface">
                    Recent Posted Transactions
                  </span>
                  <span
                    onClick={() => {
                      if (onNavigateToScreen) onNavigateToScreen('batch-folio');
                    }}
                    className="text-body-sm text-secondary font-medium cursor-pointer hover:underline"
                  >
                    Full Statement
                  </span>
                </div>
                <div className="bg-surface-container-low rounded-lg p-sm flex flex-col gap-xs font-data-mono text-body-sm divide-y divide-outline-variant/30">
                  {folioTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between pt-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface text-[12px]">{tx.description}</span>
                        <span className="text-[10px] text-on-surface-variant">Date: {tx.date}-2026</span>
                      </div>
                      <span className={`font-semibold ${tx.credit > 0 ? 'text-secondary' : 'text-on-surface'}`}>
                        {tx.credit > 0 ? `-$${tx.credit.toFixed(2)}` : `$${tx.debit.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-md bg-surface-container-low flex items-center justify-end gap-sm border-t border-surface-container">
              <button
                className="px-md py-xs rounded-lg text-on-surface-variant hover:text-on-surface text-body-sm font-semibold"
                onClick={() => setActiveDrawerGuest(null)}
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Folio statement dispatched to guest email.`);
                  setActiveDrawerGuest(null);
                }}
                className="px-md py-xs bg-primary text-on-primary hover:bg-primary/90 rounded-lg text-body-sm font-semibold shadow-sm"
              >
                Email Statement
              </button>
            </div>
          </div>
        </>
      )}

      {/* Post Charge Micro-Modal */}
      {isPostChargeModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <h4 className="font-title-sm text-title-sm text-on-surface">Post Room Charge</h4>
              <button onClick={() => setIsPostChargeModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePostCharge} className="space-y-sm text-body-sm">
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Department / Outlet</label>
                <select
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40"
                  value={newChargeForm.description}
                  onChange={(e) => setNewChargeForm({ ...newChargeForm, description: e.target.value })}
                >
                  <option value="The Palm Terrace Bar & Grill">The Palm Terrace Bar & Grill</option>
                  <option value="In-Room Dining (Room Service)">In-Room Dining (Room Service)</option>
                  <option value="Grand Spa Treatment & Wellness">Grand Spa Treatment & Wellness</option>
                  <option value="Valet & Overnight Parking Surcharge">Valet & Overnight Parking Surcharge</option>
                  <option value="Minibar Premium Replenishment">Minibar Premium Replenishment</option>
                </select>
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Charge Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono"
                  value={newChargeForm.amount}
                  onChange={(e) => setNewChargeForm({ ...newChargeForm, amount: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-sm pt-sm border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsPostChargeModalOpen(false)}
                  className="px-md py-xs rounded text-body-sm text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm"
                >
                  Post to Folio
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
