import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { ReservationRecord, SearchReservationFilterState } from '../types';
import { INITIAL_RESERVATIONS } from '../mockData';

interface SearchReservationScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const SearchReservationScreen: React.FC<SearchReservationScreenProps> = ({
  onNavigateToScreen,
}) => {
  const { navigate } = useProperty();
  const [reservations, setReservations] = useState<ReservationRecord[]>(INITIAL_RESERVATIONS);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedResForDetail, setSelectedResForDetail] = useState<ReservationRecord | null>(null);
  const [isNewResModalOpen, setIsNewResModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<SearchReservationFilterState>({
    searchQuery: '',
    resIdOrConf: 'RES-9',
    guestName: '',
    status: 'all',
    building: 'all',
    floor: 'all',
    roomCategory: 'all',
    roomNumber: '',
    checkInWindow: '29-Jun-2026 to 02-Jul-2026',
    checkOutWindow: '30-Jun-2026 to 05-Jul-2026',
    channelSource: 'all',
    ratePlan: 'all',
  });

  const [activeTags, setActiveTags] = useState<string[]>(['DLXK', 'Direct Web']);

  // New Reservation Form State
  const [newResForm, setNewResForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomCategory: 'DLXK',
    roomNumber: '102',
    checkInDate: '29-Jun-2026',
    checkOutDate: '02-Jul-2026',
    channelSource: 'Direct Web',
    ratePlan: 'Best Available Rate (BAR)',
    totalAmount: '450.00',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleClearTag = (tag: string) => {
    setActiveTags((prev) => prev.filter((t) => t !== tag));
    showToast(`Filter tag "${tag}" removed.`);
  };

  const handleClearAllTags = () => {
    setActiveTags([]);
    setFilters({
      searchQuery: '',
      resIdOrConf: '',
      guestName: '',
      status: 'all',
      building: 'all',
      floor: 'all',
      roomCategory: 'all',
      roomNumber: '',
      checkInWindow: '',
      checkOutWindow: '',
      channelSource: 'all',
      ratePlan: 'all',
    });
    showToast('All search filters reset.');
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          r.guestName.toLowerCase().includes(q) ||
          r.resId.toLowerCase().includes(q) ||
          r.crsNumber.toLowerCase().includes(q) ||
          r.roomNumber.toLowerCase().includes(q) ||
          r.guestEmail.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (filters.resIdOrConf && !filters.resIdOrConf.includes('RES-9')) {
        const rc = filters.resIdOrConf.toLowerCase();
        if (!r.resId.toLowerCase().includes(rc) && !r.crsNumber.toLowerCase().includes(rc)) {
          return false;
        }
      }
      if (filters.guestName && !r.guestName.toLowerCase().includes(filters.guestName.toLowerCase())) {
        return false;
      }
      if (filters.status !== 'all') {
        if (filters.status === 'confirmed' && r.status !== 'Confirmed') return false;
        if (filters.status === 'checked-in' && r.status !== 'Checked In') return false;
        if (filters.status === 'checked-out' && r.status !== 'Checked Out') return false;
        if (filters.status === 'cancelled' && r.status !== 'Cancelled') return false;
      }
      if (filters.roomCategory !== 'all') {
        if (r.roomCategory !== filters.roomCategory) return false;
      }
      if (filters.roomNumber && !r.roomNumber.includes(filters.roomNumber)) {
        return false;
      }
      return true;
    });
  }, [reservations, filters]);

  const handleExportCSV = () => {
    setIsExportMenuOpen(false);
    const headers = ['Res ID', 'CRS', 'Guest Name', 'Room', 'Category', 'Check In', 'Check Out', 'Total Amount', 'Status'];
    const rows = filteredReservations.map((r) => [
      r.resId,
      r.crsNumber,
      `"${r.guestName}"`,
      r.roomNumber,
      r.roomCategory,
      r.checkInDate,
      r.checkOutDate,
      r.totalAmount.toFixed(2),
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservations_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported reservations manifest to CSV.');
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResForm.guestName) {
      showToast('Please enter guest name.');
      return;
    }
    const newRecord: ReservationRecord = {
      id: String(Date.now()),
      resId: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      crsNumber: `DIR-${Math.floor(10000 + Math.random() * 90000)}`,
      guestName: newResForm.guestName,
      guestEmail: newResForm.guestEmail || 'guest@stayos.hotel',
      guestPhone: newResForm.guestPhone || '+1 (555) 000-0000',
      roomNumber: newResForm.roomNumber,
      roomCategory: newResForm.roomCategory,
      roomCategoryName: newResForm.roomCategory === 'DLXK' ? 'Deluxe King' : 'Superior Queen',
      floor: 'Floor 1',
      wing: 'North Wing',
      checkInDate: newResForm.checkInDate,
      checkOutDate: newResForm.checkOutDate,
      nights: 3,
      channelSource: newResForm.channelSource,
      ratePlan: newResForm.ratePlan,
      totalAmount: parseFloat(newResForm.totalAmount) || 450.0,
      paidAmount: 0.0,
      balanceDue: parseFloat(newResForm.totalAmount) || 450.0,
      status: 'Confirmed',
    };
    setReservations((prev) => [newRecord, ...prev]);
    setIsNewResModalOpen(false);
    setNewResForm({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomCategory: 'DLXK',
      roomNumber: '102',
      checkInDate: '29-Jun-2026',
      checkOutDate: '02-Jul-2026',
      channelSource: 'Direct Web',
      ratePlan: 'Best Available Rate (BAR)',
      totalAmount: '450.00',
    });
    showToast(`Reservation ${newRecord.resId} created successfully for ${newRecord.guestName}!`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Action Bar */}
      <div className="px-lg pt-lg pb-base flex flex-col gap-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant">
          <span onClick={() => navigate('dashboard')} className="hover:text-primary cursor-pointer transition-colors">Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => onNavigateToScreen ? onNavigateToScreen('search-reservation') : navigate('front-desk')} className="hover:text-primary cursor-pointer transition-colors">Front Desk</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-on-surface">Search Reservation</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Search Reservation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Find, filter, and inspect property reservations across all channels and guest folios.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Dropdown */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
                <span>Export</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl py-1 z-30 border border-slate-200">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4472C4]">table_view</span>
                    <span>Export as .CSV</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4472C4]">description</span>
                    <span>Export as .XLSX</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Print Report */}
            <button
              onClick={() => {
                window.print();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">print</span>
              <span className="hidden sm:inline">Daily Manifest</span>
            </button>

            {/* New Reservation Action */}
            <button
              onClick={() => setIsNewResModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#4472C4] hover:bg-[#365cb5] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Reservation</span>
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-white font-mono text-[10px] rounded">
                Alt+N
              </span>
            </button>
          </div>
        </div>

        {/* Live Metric Summary Metric Chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#4472C4] border border-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">filter_list</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Filtered</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {filteredReservations.length}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-500">Active Query</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">flight_land</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Arriving Today</div>
                <div className="text-xl font-bold text-[#4472C4] mt-0.5">14</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                8 Pending ETA
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">hotel</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In-House</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">58</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                89% Occupancy
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">flight_takeoff</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Departing Today</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">18</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                6 Settled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area */}
      <div className="px-6 pb-8 flex flex-col gap-4">
        {/* Filter Workspace (Pattern E Collapsible Panel) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
          {/* Quick Filter Bar */}
          <div className="p-3.5 flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-50 border-b border-slate-200">
            {/* Quick Search Bar */}
            <div className="relative w-full lg:max-w-xl flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px] pointer-events-none">search</span>
              <input
                className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#4472C4] focus:ring-1 focus:ring-[#4472C4] outline-none shadow-xs transition-all"
                placeholder="Quick search by Guest Name, Confirmation #, Room #, Phone, CRS..."
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Bar Trigger & Action Buttons */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-[#4472C4] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Filters</span>
                <span className="px-1.5 py-0.2 bg-[#4472C4] text-white font-mono text-[10px] rounded-full">
                  {activeTags.length} Active
                </span>
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                    isFilterPanelOpen ? '' : 'rotate-180'
                  }`}
                >
                  expand_less
                </span>
              </button>

              <button
                onClick={handleClearAllTags}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reset</span>
              </button>

              <button
                onClick={() => showToast('Filters applied successfully.')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4472C4] text-white text-xs font-semibold rounded-lg hover:bg-[#365cb5] shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Collapsible Grid Filter Area */}
          {isFilterPanelOpen && (
            <div className="p-4 bg-white space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Confirmation / Reservation Code */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Res ID / Conf #
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      tag
                    </span>
                    <input
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none transition-all"
                      placeholder="e.g. RES-2026-9041"
                      type="text"
                      value={filters.resIdOrConf}
                      onChange={(e) => setFilters((prev) => ({ ...prev, resIdOrConf: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 2. Guest Name */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Guest Name</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      person
                    </span>
                    <input
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#4472C4] outline-none transition-all"
                      placeholder="Last or First name"
                      type="text"
                      value={filters.guestName}
                      onChange={(e) => setFilters((prev) => ({ ...prev, guestName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 3. Status Multi-select */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Reservation Status
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      verified
                    </span>
                    <select
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none cursor-pointer appearance-none transition-all"
                      value={filters.status}
                      onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="all">All Active Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked-in">Checked In</option>
                      <option value="checked-out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* 4. Building */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Building / Wing
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      apartment
                    </span>
                    <select
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none cursor-pointer appearance-none transition-all"
                      value={filters.building}
                      onChange={(e) => setFilters((prev) => ({ ...prev, building: e.target.value }))}
                    >
                      <option value="all">All Buildings (All Wings)</option>
                      <option value="north">North Tower</option>
                      <option value="south">South Wing</option>
                      <option value="villa">Executive Villa</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* 5. Floor */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Floor Level
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      layers
                    </span>
                    <select
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none cursor-pointer appearance-none transition-all"
                      value={filters.floor}
                      onChange={(e) => setFilters((prev) => ({ ...prev, floor: e.target.value }))}
                    >
                      <option value="all">All Floors</option>
                      <option value="1">Floor 1 (Garden & Pool)</option>
                      <option value="2">Floor 2 (Standard)</option>
                      <option value="3">Floor 3 (Executive)</option>
                      <option value="4">Floor 4 (Penthouse)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* 6. Room Type */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Room Category
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      bed
                    </span>
                    <select
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none cursor-pointer appearance-none transition-all"
                      value={filters.roomCategory}
                      onChange={(e) => setFilters((prev) => ({ ...prev, roomCategory: e.target.value }))}
                    >
                      <option value="all">All Room Types</option>
                      <option value="DLXK">DLXK - Deluxe King</option>
                      <option value="SUPQ">SUPQ - Superior Queen</option>
                      <option value="EXST">EXST - Executive Suite</option>
                      <option value="PRMS">PRMS - Presidential Suite</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* 7. Room Number */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Specific Room #
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      meeting_room
                    </span>
                    <input
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#4472C4] outline-none transition-all"
                      placeholder="101, 204, 310..."
                      type="text"
                      value={filters.roomNumber}
                      onChange={(e) => setFilters((prev) => ({ ...prev, roomNumber: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 8. Check-in Date Range */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Check-in Window
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      calendar_today
                    </span>
                    <input
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none transition-all"
                      type="text"
                      value={filters.checkInWindow}
                      onChange={(e) => setFilters((prev) => ({ ...prev, checkInWindow: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 9. Check-out Date Range */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Check-out Window
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      event_available
                    </span>
                    <input
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none transition-all"
                      type="text"
                      value={filters.checkOutWindow}
                      onChange={(e) => setFilters((prev) => ({ ...prev, checkOutWindow: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 10. Channel Source */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Channel Source
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      hub
                    </span>
                    <select
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none cursor-pointer appearance-none transition-all"
                      value={filters.channelSource}
                      onChange={(e) => setFilters((prev) => ({ ...prev, channelSource: e.target.value }))}
                    >
                      <option value="all">All Booking Channels</option>
                      <option value="Direct Web">Direct Web Engine</option>
                      <option value="Booking.com">Booking.com OTA</option>
                      <option value="Expedia Partner">Expedia Partner</option>
                      <option value="Corporate Direct AR">Corporate Direct AR</option>
                      <option value="Front Desk Walk-in">Front Desk Walk-in</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* 11. Rate Plan */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rate Plan</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                      sell
                    </span>
                    <select
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-[#4472C4] outline-none cursor-pointer appearance-none transition-all"
                      value={filters.ratePlan}
                      onChange={(e) => setFilters((prev) => ({ ...prev, ratePlan: e.target.value }))}
                    >
                      <option value="all">All Active Rate Plans</option>
                      <option value="Best Available Rate (BAR)">Best Flexible Rate (BAR)</option>
                      <option value="Corporate Negotiated Tier 1">Corporate Negotiated Tier 1</option>
                      <option value="Weekend Getaway Package">Weekend Getaway Package</option>
                      <option value="AAA Member Discount">AAA / CAA Club Member</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Active Filter Tags Quick Clear */}
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 flex-wrap pb-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active tags:</span>
                    {activeTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#4472C4] text-[11px] font-medium flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleClearTag(tag)}
                          className="material-symbols-outlined text-[13px] hover:opacity-75 cursor-pointer"
                        >
                          close
                        </button>
                      </span>
                    ))}
                    {activeTags.length > 0 && (
                      <button
                        onClick={handleClearAllTags}
                        className="text-[11px] font-semibold text-[#4472C4] hover:underline ml-1 cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dense Searchable Results Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Table Header Status Bar */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-800">Reservations Found:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 font-mono text-xs font-bold text-[#4472C4]">
                {filteredReservations.length} Records
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                • Sorted by Check-in Date (Ascending)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <button className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1.5 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-slate-500">view_column</span>
                <span className="hidden md:inline">Columns</span>
              </button>
              <button className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1.5 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-slate-500">density_medium</span>
                <span className="hidden md:inline">Compact Mode</span>
              </button>
            </div>
          </div>

          {/* Table Wrapper */}
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full min-w-[1080px] text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider select-none">
                  <th className="py-2.5 px-4 cursor-pointer hover:text-slate-800" scope="col">
                    <div className="flex items-center gap-1.5">
                      <span>Res ID & CRS</span>
                      <span className="material-symbols-outlined text-[15px] text-[#4472C4]">arrow_upward</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 cursor-pointer hover:text-slate-800" scope="col">
                    <div className="flex items-center gap-1.5">
                      <span>Guest Information</span>
                      <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 cursor-pointer hover:text-slate-800" scope="col">
                    <div className="flex items-center gap-1.5">
                      <span>Room & Category</span>
                      <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 cursor-pointer hover:text-slate-800" scope="col">
                    <div className="flex items-center gap-1.5">
                      <span>Dates & Stay</span>
                      <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 cursor-pointer hover:text-slate-800" scope="col">
                    <div className="flex items-center gap-1.5">
                      <span>Source & Rate</span>
                      <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-right cursor-pointer hover:text-slate-800" scope="col">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Financial Summary</span>
                      <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-center" scope="col">
                    Status
                  </th>
                  <th className="py-2.5 px-4 text-right pr-6" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-[40px] text-slate-300 mb-2">search_off</span>
                      <p className="font-semibold text-sm text-slate-800">No reservations match current criteria</p>
                      <p className="text-xs text-slate-500 mt-1">Try resetting search filters or changing date ranges</p>
                      <button
                        onClick={handleClearAllTags}
                        className="mt-3 px-3.5 py-1.5 bg-[#4472C4] text-white rounded text-xs font-semibold hover:bg-[#365cb5] cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((row) => {
                    const initials = row.guestName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-4 align-middle">
                          <div className="flex flex-col">
                            <span
                              onClick={() => setSelectedResForDetail(row)}
                              className="font-mono text-xs font-bold text-[#4472C4] hover:underline cursor-pointer"
                            >
                              {row.resId}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4]"></span>
                              {row.crsNumber}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-[#4472C4] flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 truncate">{row.guestName}</span>
                                {row.vipTier && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold uppercase">
                                    {row.vipTier}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 truncate mt-0.5">
                                {row.guestEmail} • {row.guestPhone}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span
                                className={`px-2 py-0.5 font-mono text-[11px] font-bold rounded mr-2 ${
                                  row.roomNumber === 'Unassigned'
                                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                                }`}
                              >
                                {row.roomNumber}
                              </span>
                              <span className="font-semibold text-slate-900">{row.roomCategory}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5">
                              {row.roomCategoryName} • {row.floor}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-semibold text-slate-800">
                              {row.checkInDate} → {row.checkOutDate}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span>{row.nights} Nights</span>
                              {row.etaNote && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#4472C4] font-medium">{row.etaNote}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{row.channelSource}</span>
                            <span className="text-[11px] text-slate-500 mt-0.5">{row.ratePlan}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle text-right">
                          <div className="flex flex-col items-end">
                            <div className="font-mono text-xs font-bold text-slate-900">
                              ${row.totalAmount.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500">
                                Paid ${row.paidAmount.toFixed(2)}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold ${
                                  row.balanceDue > 0
                                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                }`}
                              >
                                Bal: ${row.balanceDue.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle text-center">
                          {row.status === 'Checked In' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Checked In
                            </span>
                          )}
                          {row.status === 'Confirmed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#4472C4] text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4]"></span>
                              Confirmed
                            </span>
                          )}
                          {row.status === 'Departing' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              Departing
                            </span>
                          )}
                          {row.status === 'Cancelled' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Cancelled
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 align-middle text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedResForDetail(row)}
                              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-[#4472C4] hover:text-[#4472C4] text-slate-700 text-xs font-semibold rounded shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Edit</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                            <button
                              onClick={() => setSelectedResForDetail(row)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Quick Options"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Table Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-500">
                Showing <strong className="font-semibold text-slate-900">1–{filteredReservations.length}</strong> of{' '}
                <strong className="font-semibold text-slate-900">42</strong> reservations
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rows per page:</span>
                <div className="relative inline-block">
                  <select className="pl-2 pr-6 py-1 bg-white border border-slate-200 rounded font-mono text-xs text-slate-800 outline-none cursor-pointer appearance-none shadow-xs">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-1 top-1.5 text-[14px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-40 transition-colors cursor-pointer"
                disabled
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="w-7 h-7 rounded bg-[#4472C4] text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
                1
              </button>
              <button className="w-7 h-7 rounded hover:bg-slate-200 text-slate-700 font-mono text-xs font-medium flex items-center justify-center transition-colors cursor-pointer">
                2
              </button>
              <button className="w-7 h-7 rounded hover:bg-slate-200 text-slate-700 font-mono text-xs font-medium flex items-center justify-center transition-colors cursor-pointer">
                3
              </button>
              <button className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Detail / Edit Drawer */}
      {selectedResForDetail && (
        <>
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setSelectedResForDetail(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-lg bg-surface-container-low flex items-start justify-between border-b border-surface-container">
              <div className="flex flex-col">
                <div className="flex items-center gap-xs text-[11px] font-label-uppercase uppercase text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[15px]">room_service</span>
                  <span>Reservation Record</span>
                </div>
                <h2 className="font-title-sm text-title-sm font-bold text-on-surface">
                  {selectedResForDetail.resId} — {selectedResForDetail.guestName}
                </h2>
                <span className="text-body-sm text-on-surface-variant font-data-mono text-[12px]">
                  CRS: {selectedResForDetail.crsNumber} • Room {selectedResForDetail.roomNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedResForDetail(null)}
                className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-lg space-y-md">
              {/* Financial Status Banner */}
              <div className="p-md rounded-lg bg-surface-container flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-label-uppercase text-on-surface-variant uppercase">
                    Total Folio Invoiced
                  </span>
                  <span className="font-display-lg text-[22px] font-bold text-on-surface">
                    ${selectedResForDetail.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-data-mono">
                    Paid: ${selectedResForDetail.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`px-sm py-1 rounded text-body-sm font-bold font-data-mono ${
                      selectedResForDetail.balanceDue > 0
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {selectedResForDetail.balanceDue > 0
                      ? `$${selectedResForDetail.balanceDue.toFixed(2)} DUE`
                      : 'FOLIO ZEROED'}
                  </span>
                </div>
              </div>

              {/* Guest & Contact Details */}
              <div className="space-y-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant uppercase">Guest Profile</label>
                <div className="p-sm bg-surface-container-low rounded-lg space-y-xs text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Full Name:</span>
                    <span className="font-semibold text-on-surface">{selectedResForDetail.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Email:</span>
                    <span className="font-data-mono text-[12px]">{selectedResForDetail.guestEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Phone:</span>
                    <span className="font-data-mono text-[12px]">{selectedResForDetail.guestPhone}</span>
                  </div>
                  {selectedResForDetail.vipTier && (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-on-surface-variant">VIP Tier:</span>
                      <span className="px-xs py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-[11px]">
                        {selectedResForDetail.vipTier}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay Window & Room Specs */}
              <div className="space-y-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant uppercase">
                  Room Allocation
                </label>
                <div className="p-sm bg-surface-container-low rounded-lg space-y-xs text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Assigned Room:</span>
                    <span className="font-bold text-secondary font-data-mono">
                      Room {selectedResForDetail.roomNumber} ({selectedResForDetail.roomCategory})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Category:</span>
                    <span>{selectedResForDetail.roomCategoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Dates:</span>
                    <span className="font-data-mono text-[12px]">
                      {selectedResForDetail.checkInDate} to {selectedResForDetail.checkOutDate} ({selectedResForDetail.nights}N)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Booking Channel:</span>
                    <span>{selectedResForDetail.channelSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Rate Plan:</span>
                    <span>{selectedResForDetail.ratePlan}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions inside Drawer */}
              <div className="space-y-xs pt-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant uppercase">
                  Operational Handoff Actions
                </label>
                <div className="grid grid-cols-2 gap-sm">
                  <button
                    onClick={() => {
                      showToast(`Keycard programmed for Room ${selectedResForDetail.roomNumber}.`);
                    }}
                    className="p-sm bg-surface-container hover:bg-surface-container-high rounded text-left flex items-center gap-xs font-semibold text-body-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">key</span>
                    <span>Encode Keycard</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateToScreen) onNavigateToScreen('guest-ledger');
                      setSelectedResForDetail(null);
                    }}
                    className="p-sm bg-surface-container hover:bg-surface-container-high rounded text-left flex items-center gap-xs font-semibold text-body-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">receipt_long</span>
                    <span>View in Ledger</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateToScreen) onNavigateToScreen('room-comments');
                      setSelectedResForDetail(null);
                    }}
                    className="p-sm bg-surface-container hover:bg-surface-container-high rounded text-left flex items-center gap-xs font-semibold text-body-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">comment</span>
                    <span>Room Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Folio dispatched to ${selectedResForDetail.guestEmail}`);
                    }}
                    className="p-sm bg-surface-container hover:bg-surface-container-high rounded text-left flex items-center gap-xs font-semibold text-body-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">send</span>
                    <span>Email Folio</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-lg bg-surface-container-low flex items-center justify-between border-t border-surface-container">
              <button
                onClick={() => setSelectedResForDetail(null)}
                className="px-md py-xs rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Reservation ${selectedResForDetail.resId} updated.`);
                  setSelectedResForDetail(null);
                }}
                className="px-lg py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm hover:opacity-90 transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* New Reservation Modal */}
      {isNewResModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <div className="flex items-center gap-xs text-secondary font-bold">
                <span className="material-symbols-outlined text-[22px]">add_circle</span>
                <h3 className="font-title-sm text-title-sm text-on-surface">Create New Reservation</h3>
              </div>
              <button
                onClick={() => setIsNewResModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-sm text-body-sm">
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Guest Full Name *
                </label>
                <input
                  required
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 text-on-surface outline-none focus:border-secondary"
                  placeholder="e.g. Victoria Harrison"
                  value={newResForm.guestName}
                  onChange={(e) => setNewResForm({ ...newResForm, guestName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 text-on-surface outline-none focus:border-secondary"
                    placeholder="guest@domain.com"
                    value={newResForm.guestEmail}
                    onChange={(e) => setNewResForm({ ...newResForm, guestEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Phone</label>
                  <input
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 text-on-surface outline-none focus:border-secondary"
                    placeholder="+1 (555) 000-0000"
                    value={newResForm.guestPhone}
                    onChange={(e) => setNewResForm({ ...newResForm, guestPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Room Category</label>
                  <select
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 text-on-surface outline-none"
                    value={newResForm.roomCategory}
                    onChange={(e) => setNewResForm({ ...newResForm, roomCategory: e.target.value })}
                  >
                    <option value="DLXK">DLXK - Deluxe King</option>
                    <option value="SUPQ">SUPQ - Superior Queen</option>
                    <option value="EXST">EXST - Executive Suite</option>
                    <option value="PRMS">PRMS - Presidential Suite</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Target Room #</label>
                  <input
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 text-on-surface outline-none"
                    placeholder="101, 204..."
                    value={newResForm.roomNumber}
                    onChange={(e) => setNewResForm({ ...newResForm, roomNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Check-In Date</label>
                  <input
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 font-data-mono text-on-surface outline-none"
                    value={newResForm.checkInDate}
                    onChange={(e) => setNewResForm({ ...newResForm, checkInDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">Check-Out Date</label>
                  <input
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 font-data-mono text-on-surface outline-none"
                    value={newResForm.checkOutDate}
                    onChange={(e) => setNewResForm({ ...newResForm, checkOutDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Total Rate / Folio Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/50 font-data-mono text-on-surface outline-none"
                  value={newResForm.totalAmount}
                  onChange={(e) => setNewResForm({ ...newResForm, totalAmount: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-sm pt-md border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsNewResModalOpen(false)}
                  className="px-md py-xs rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-xs bg-secondary text-on-secondary rounded text-body-sm font-semibold shadow-sm hover:opacity-95"
                >
                  Create Reservation
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
