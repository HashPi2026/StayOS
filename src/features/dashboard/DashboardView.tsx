import React, { useState, useEffect, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export type KpiKey =
  | 'arrivals'
  | 'departures'
  | 'checkouts'
  | 'vacant'
  | 'inhouse'
  | 'maintenance'
  | 'ota_cancel';

interface DashboardSummary {
  workingDate: string;
  kpis: {
    expectedArrivals: number;
    expectedDepartures: number;
    checkouts: number;
    vacantRooms: number;
    inhouseGuests: number;
    maintenanceRooms: number;
    otaCount: number;
    cancelCount: number;
  };
  revenue: {
    roomSold: number;
    roomRevenue: number;
    adr: number;
    occupancyPercent: number;
    revpar: number;
    availableRooms: number;
  };
}

interface RoomStatusBreakdownItem {
  label: string;
  color: string;
  count: number;
}

interface HousekeepingItem {
  roomId: number;
  roomName: string;
  roomNumber: string;
  houseKeeper: string;
  rawStatus: string;
  status: 'Done' | 'Pending';
}

export const DashboardView: React.FC = () => {
  const { currentProperty, currentUser, navigate } = useProperty();

  // Working Date: Initialized from property backend, user-changeable
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-29');
  const [defaultWorkingDate, setDefaultWorkingDate] = useState<string>('2026-06-29');

  // Selected KPI Card (Default: Expected Arrivals)
  const [selectedKpi, setSelectedKpi] = useState<KpiKey>('arrivals');
  const [otaSubFilter, setOtaSubFilter] = useState<'ota' | 'cancel'>('ota');

  // Room Status display view: Donut chart vs Table
  const [roomStatusViewMode, setRoomStatusViewMode] = useState<'donut' | 'table'>('donut');

  // Backend Data State
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [kpiList, setKpiList] = useState<any[]>([]);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatusBreakdownItem[]>([]);
  const [housekeepingList, setHousekeepingList] = useState<HousekeepingItem[]>([]);

  // Loading States
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [isListLoading, setIsListLoading] = useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
  const [isHkLoading, setIsHkLoading] = useState<boolean>(true);

  // Search filter for dynamic list
  const [searchQuery, setSearchQuery] = useState<string>('');

  const clientId = currentProperty?.identity?.clientId || 10001;
  const currencySymbol = currentProperty?.meta?.currencySymbol || '$';

  // 1. Fetch Working Date on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchWorkingDate = async () => {
      try {
        const res = await fetch(`/api/v1/dashboard/working-date`, {
          headers: {
            'x-client-id': String(clientId),
            'x-user-id': String(currentUser?.id || 1),
          },
        });
        const json = await res.json();
        if (isMounted && json.data?.workingDate) {
          setDefaultWorkingDate(json.data.workingDate);
          setSelectedDate(json.data.workingDate);
        }
      } catch (err) {
        console.error('Failed to fetch working date:', err);
      }
    };
    fetchWorkingDate();
    return () => {
      isMounted = false;
    };
  }, [clientId, currentUser?.id]);

  // 2. Fetch Summary, Room Statuses, and Housekeeping whenever selectedDate or property changes
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardPanels = async () => {
      setIsSummaryLoading(true);
      setIsChartLoading(true);
      setIsHkLoading(true);

      const headers = {
        'x-client-id': String(clientId),
        'x-user-id': String(currentUser?.id || 1),
      };

      try {
        // Summary KPIs & Financials
        const summaryPromise = fetch(`/api/v1/dashboard/summary?date=${selectedDate}`, { headers })
          .then((r) => r.json())
          .then((json) => {
            if (isMounted && json.data) setSummary(json.data);
          });

        // Room Status Breakdown
        const roomStatusPromise = fetch(`/api/v1/dashboard/room-status-breakdown`, { headers })
          .then((r) => r.json())
          .then((json) => {
            if (isMounted && json.data) setRoomStatuses(json.data);
          });

        // Housekeeping Panel
        const hkPromise = fetch(`/api/v1/dashboard/housekeeping`, { headers })
          .then((r) => r.json())
          .then((json) => {
            if (isMounted && json.data) setHousekeepingList(json.data);
          });

        await Promise.allSettled([summaryPromise, roomStatusPromise, hkPromise]);
      } catch (err) {
        console.error('Error fetching dashboard panels:', err);
      } finally {
        if (isMounted) {
          setIsSummaryLoading(false);
          setIsChartLoading(false);
          setIsHkLoading(false);
        }
      }
    };

    if (selectedDate) {
      fetchDashboardPanels();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedDate, clientId, currentUser?.id]);

  // 3. Fetch Dynamic KPI List whenever selectedKpi, selectedDate, or otaSubFilter changes
  useEffect(() => {
    let isMounted = true;

    const fetchKpiList = async () => {
      setIsListLoading(true);
      const headers = {
        'x-client-id': String(clientId),
        'x-user-id': String(currentUser?.id || 1),
      };

      let endpoint = '';
      if (selectedKpi === 'arrivals') {
        endpoint = `/api/v1/dashboard/lists/expected-arrivals?date=${selectedDate}`;
      } else if (selectedKpi === 'departures') {
        endpoint = `/api/v1/dashboard/lists/expected-departures?date=${selectedDate}`;
      } else if (selectedKpi === 'checkouts') {
        endpoint = `/api/v1/dashboard/lists/checkouts?date=${selectedDate}`;
      } else if (selectedKpi === 'vacant') {
        endpoint = `/api/v1/dashboard/lists/vacant-rooms?date=${selectedDate}`;
      } else if (selectedKpi === 'inhouse') {
        endpoint = `/api/v1/dashboard/lists/inhouse-guests?date=${selectedDate}`;
      } else if (selectedKpi === 'maintenance') {
        endpoint = `/api/v1/dashboard/lists/maintenance-rooms`;
      } else if (selectedKpi === 'ota_cancel') {
        endpoint = `/api/v1/dashboard/lists/ota-cancel?kind=${otaSubFilter}`;
      }

      try {
        const res = await fetch(endpoint, { headers });
        const json = await res.json();
        if (isMounted && json.data) {
          setKpiList(json.data);
        }
      } catch (err) {
        console.error('Failed to load KPI list:', err);
      } finally {
        if (isMounted) setIsListLoading(false);
      }
    };

    fetchKpiList();

    return () => {
      isMounted = false;
    };
  }, [selectedKpi, selectedDate, otaSubFilter, clientId, currentUser?.id]);

  // Filter KPI list with search input
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return kpiList;
    const q = searchQuery.toLowerCase().trim();
    return kpiList.filter((item) => {
      const gName = (item.guest_name || item.room_name || '').toLowerCase();
      const rNum = (item.room_number || '').toLowerCase();
      const bNum = (item.booking_number || item.folio_number || '').toLowerCase();
      const bSrc = (item.business_source || item.room_type_name || '').toLowerCase();
      return gName.includes(q) || rNum.includes(q) || bNum.includes(q) || bSrc.includes(q);
    });
  }, [kpiList, searchQuery]);

  // SVG Donut Chart calculations
  const donutData = useMemo(() => {
    const total = roomStatuses.reduce((acc, curr) => acc + curr.count, 0);
    if (total === 0) return { total: 0, segments: [] };

    let currentAngle = 0;
    const segments = roomStatuses.map((item) => {
      const percentage = (item.count / total) * 100;
      const angle = (item.count / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        ...item,
        percentage,
        startAngle,
        endAngle: currentAngle,
      };
    });

    return { total, segments };
  }, [roomStatuses]);

  // Handle clicking row chevron -> Navigates to Reservation edit view
  const handleOpenReservation = (reservationId?: number) => {
    if (reservationId) {
      navigate('reservation');
    }
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Working Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4 bg-white px-5 py-4 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4472C4] text-[24px]">
                space_dashboard
              </span>
              Operational Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#4472C4] border border-blue-200/60">
              Live StayOS PMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time hotel room status, arrivals, departures, occupancy metrics, and housekeeping turnover.
          </p>
        </div>

        {/* Working Date Selector */}
        <div className="flex items-center gap-3 bg-[#f8fafc] border border-slate-200 rounded-lg p-1.5 px-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="material-symbols-outlined text-[18px] text-[#4472C4]">
              calendar_month
            </span>
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Working Date:
            </span>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4] cursor-pointer"
          />

          {selectedDate !== defaultWorkingDate && (
            <button
              onClick={() => setSelectedDate(defaultWorkingDate)}
              className="text-[11px] font-medium text-[#4472C4] hover:underline px-1 cursor-pointer"
              title="Reset to hotel official working date"
            >
              Reset
            </button>
          )}

          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Synchronized with database" />
        </div>
      </div>

      {/* 2. Seven Interactive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* KPI 1: Expected Arrivals */}
        <button
          onClick={() => setSelectedKpi('arrivals')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'arrivals'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Expected Arrivals
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'arrivals' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              flight_land
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading ? '...' : summary?.kpis.expectedArrivals ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Due check-in today</div>
          </div>
        </button>

        {/* KPI 2: Expected Departure */}
        <button
          onClick={() => setSelectedKpi('departures')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'departures'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Expected Departure
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'departures' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              flight_takeoff
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading ? '...' : summary?.kpis.expectedDepartures ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Due check-out today</div>
          </div>
        </button>

        {/* KPI 3: Checkouts */}
        <button
          onClick={() => setSelectedKpi('checkouts')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'checkouts'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Checkouts
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'checkouts' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              logout
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading ? '...' : summary?.kpis.checkouts ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Already departed</div>
          </div>
        </button>

        {/* KPI 4: Vacant Rooms */}
        <button
          onClick={() => setSelectedKpi('vacant')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'vacant'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Vacant Rooms
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'vacant' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              meeting_room
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading ? '...' : summary?.kpis.vacantRooms ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Available to sell</div>
          </div>
        </button>

        {/* KPI 5: Inhouse Guest */}
        <button
          onClick={() => setSelectedKpi('inhouse')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'inhouse'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Inhouse Guest
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'inhouse' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              group
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading ? '...' : summary?.kpis.inhouseGuests ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Active checked-in stays</div>
          </div>
        </button>

        {/* KPI 6: Maintenance Rooms */}
        <button
          onClick={() => setSelectedKpi('maintenance')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'maintenance'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Maintenance Rooms
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'maintenance' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              handyman
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading ? '...' : summary?.kpis.maintenanceRooms ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">OOO / Out of Service</div>
          </div>
        </button>

        {/* KPI 7: OTA / Cancel Reservation (Dual Values) */}
        <button
          onClick={() => setSelectedKpi('ota_cancel')}
          className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
            selectedKpi === 'ota_cancel'
              ? 'bg-[#D9E1F2] border-[#4472C4] shadow-xs ring-1 ring-[#4472C4]'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">
              OTA / Cancel
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                selectedKpi === 'ota_cancel' ? 'text-[#4472C4]' : 'text-slate-400'
              }`}
            >
              share_location
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {isSummaryLoading
                ? '... / ...'
                : `${summary?.kpis.otaCount ?? 0} / ${summary?.kpis.cancelCount ?? 0}`}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">OTA Folios / Cancelled</div>
          </div>
        </button>
      </div>

      {/* 3. Main Dashboard Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        {/* ================= LEFT COLUMN (~70% Width / 7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Dynamic KPI Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4472C4]" />
                <h2 className="text-sm font-bold text-slate-900 capitalize">
                  {selectedKpi === 'arrivals' && 'Expected Arrivals List'}
                  {selectedKpi === 'departures' && 'Expected Departures List'}
                  {selectedKpi === 'checkouts' && 'Checked-Out Reservations'}
                  {selectedKpi === 'vacant' && 'Available & Vacant Rooms'}
                  {selectedKpi === 'inhouse' && 'Current In-House Guests'}
                  {selectedKpi === 'maintenance' && 'Rooms Under Maintenance'}
                  {selectedKpi === 'ota_cancel' &&
                    (otaSubFilter === 'ota' ? 'OTA / CRS Channel Bookings' : 'Cancelled Reservations')}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                  {filteredList.length}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Subfilter toggle for OTA / Cancel */}
                {selectedKpi === 'ota_cancel' && (
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setOtaSubFilter('ota')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        otaSubFilter === 'ota' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      OTA Folios ({summary?.kpis.otaCount ?? 0})
                    </button>
                    <button
                      onClick={() => setOtaSubFilter('cancel')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        otaSubFilter === 'cancel' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Cancelled ({summary?.kpis.cancelCount ?? 0})
                    </button>
                  </div>
                )}

                {/* Table Search Input */}
                <div className="relative">
                  <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 focus:border-[#4472C4] w-48 sm:w-56"
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto min-h-[300px]">
              {isListLoading ? (
                <div className="py-20 text-center text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-[32px] text-[#4472C4]">
                    progress_activity
                  </span>
                  <p className="mt-2 text-xs">Loading {selectedKpi} records from database...</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[40px] text-slate-300">
                    inbox
                  </span>
                  <p className="mt-1 text-sm font-medium text-slate-600">No records found</p>
                  <p className="text-xs text-slate-400">No entries match the selected KPI criteria for {selectedDate}.</p>
                </div>
              ) : selectedKpi === 'vacant' || selectedKpi === 'maintenance' ? (
                /* Room-Oriented Table View (Vacant or Maintenance) */
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Room #</th>
                      <th className="py-2.5 px-4">Room Name</th>
                      <th className="py-2.5 px-4">Room Type</th>
                      <th className="py-2.5 px-4">Building / Floor</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((item) => (
                      <tr
                        key={item.room_id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => navigate('change-room-status' as any)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {item.room_number}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {item.room_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.room_type_name || item.room_type_code || 'Standard'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {item.building_name || 'Main'} &bull; {item.floor_name || '1st Floor'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              (item.current_status || '').toLowerCase().includes('clean') ||
                              (item.current_status || '').toLowerCase().includes('ready')
                                ? 'bg-emerald-100 text-emerald-800'
                                : (item.current_status || '').toLowerCase().includes('maint')
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.current_status || 'Vacant'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="material-symbols-outlined text-[18px] text-slate-400 hover:text-[#4472C4]">
                            chevron_right
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* Reservation-Oriented Table View (Arrivals, Departures, Checkouts, Inhouse, OTA/Cancel) */
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Room / Type</th>
                      <th className="py-2.5 px-4">Guest / Group Name</th>
                      <th className="py-2.5 px-4">Business Source</th>
                      <th className="py-2.5 px-4">Date In</th>
                      <th className="py-2.5 px-4">Date Out</th>
                      <th className="py-2.5 px-4 font-mono">Folio #</th>
                      <th className="py-2.5 px-4 text-center">Guests</th>
                      <th className="py-2.5 px-4 text-right">Paid</th>
                      <th className="py-2.5 px-4 text-right">Balance</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((item) => {
                      const totalGuests = (item.adults || 1) + (item.children || 0);
                      const isGroup = Boolean(item.group_id);
                      const checkInFormatted = item.check_in_date
                        ? String(item.check_in_date).substring(0, 10)
                        : '-';
                      const checkOutFormatted = item.check_out_date
                        ? String(item.check_out_date).substring(0, 10)
                        : '-';

                      return (
                        <tr
                          key={item.reservation_id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => handleOpenReservation(item.reservation_id)}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {item.room_number ? `Room ${item.room_number}` : 'Unassigned'}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                              {item.room_type_name || item.room_type_code || 'Standard'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{item.guest_name}</span>
                              {isGroup && (
                                <span
                                  className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold"
                                  title={`Group Folio: ${item.group_name || 'Group'}`}
                                >
                                  GRP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.booking_number}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                              {item.business_source || 'Direct'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {checkInFormatted}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {checkOutFormatted}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-800">
                            {item.folio_number || item.crs_folio_number || `FOL-${item.reservation_id}`}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-800">
                            {totalGuests}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-700 font-medium">
                            {currencySymbol}
                            {Number(item.amount_paid || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold">
                            <span
                              className={
                                Number(item.balance || 0) > 0 ? 'text-rose-600' : 'text-slate-700'
                              }
                            >
                              {currencySymbol}
                              {Number(item.balance || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#4472C4] transition-colors"
                              title="Edit Reservation"
                            >
                              chevron_right
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer with Legend */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  GRP = Group Folio
                </span>
                <span className="text-slate-300">|</span>
                <span>Click any row to inspect reservation folio in edit view</span>
              </div>
              <div className="font-mono text-slate-400">
                Property #{clientId} &bull; {selectedDate}
              </div>
            </div>
          </div>

          {/* B. Room Status (Today) Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4472C4]">
                  pie_chart
                </span>
                <h3 className="text-sm font-bold text-slate-900">Room Status (Today)</h3>
                <span className="text-xs text-slate-500">
                  Total: {donutData.total} rooms
                </span>
              </div>

              {/* View Switcher: Donut vs Table */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setRoomStatusViewMode('donut')}
                  className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    roomStatusViewMode === 'donut'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">donut_large</span>
                  <span>Donut Chart</span>
                </button>
                <button
                  onClick={() => setRoomStatusViewMode('table')}
                  className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    roomStatusViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">table_rows</span>
                  <span>Table View</span>
                </button>
              </div>
            </div>

            {isChartLoading ? (
              <div className="py-12 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-[28px] text-[#4472C4]">
                  progress_activity
                </span>
                <p className="mt-1 text-xs">Loading configured status breakdown...</p>
              </div>
            ) : roomStatusViewMode === 'donut' ? (
              /* SVG Donut Chart View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative flex justify-center items-center">
                  <svg width="220" height="220" viewBox="0 0 42 42" className="transform -rotate-90">
                    <circle
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="6"
                    />
                    {donutData.segments.map((seg, idx) => {
                      const strokeDasharray = `${seg.percentage} ${100 - seg.percentage}`;
                      // Calculate offset as accumulated percentage before this slice
                      let accumulated = 0;
                      for (let i = 0; i < idx; i++) {
                        accumulated += donutData.segments[i].percentage;
                      }
                      const strokeDashoffset = 100 - accumulated;

                      return (
                        <circle
                          key={seg.label}
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="6"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {donutData.total}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Rooms Total
                    </span>
                  </div>
                </div>

                {/* Legend with Configured Colors */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {donutData.segments.map((seg) => (
                    <div
                      key={seg.label}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="font-semibold text-slate-800 truncate">
                          {seg.label}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 ml-2">
                        {seg.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Room Status Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Status Label</th>
                      <th className="py-2.5 px-4">Color Indicator</th>
                      <th className="py-2.5 px-4 text-center">Room Count</th>
                      <th className="py-2.5 px-4 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donutData.segments.map((seg) => (
                      <tr key={seg.label} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{seg.label}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded shadow-2xs border border-slate-200"
                              style={{ backgroundColor: seg.color }}
                            />
                            <span className="font-mono text-[11px] text-slate-500">
                              {seg.color}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900">
                          {seg.count}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                          {seg.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (~30% Width / 3 Cols) ================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* A. Revenue & Occupancy Metrics (2 x 2 Card Layout) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4472C4]">
                  analytics
                </span>
                <h3 className="text-sm font-bold text-slate-900">Revenue & Occupancy</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#4472C4]">
                Authoritative
              </span>
            </div>

            {/* 2 x 2 Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Card 1: ADR */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  ADR
                </span>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {isSummaryLoading
                      ? '...'
                      : `${currencySymbol}${summary?.revenue.adr ?? 0}`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Average Daily Rate</div>
                </div>
              </div>

              {/* Card 2: RevPAR */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  RevPAR
                </span>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {isSummaryLoading
                      ? '...'
                      : `${currencySymbol}${summary?.revenue.revpar ?? 0}`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Rev per Available Room</div>
                </div>
              </div>

              {/* Card 3: Occupancy % */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Occupancy %
                </span>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {isSummaryLoading ? '...' : `${summary?.revenue.occupancyPercent ?? 0}%`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {summary?.revenue.availableRooms ?? 0} Avail Rooms
                  </div>
                </div>
              </div>

              {/* Card 4: Room Sold */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Room Sold
                </span>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {isSummaryLoading ? '...' : summary?.revenue.roomSold ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Revenue: {currencySymbol}{summary?.revenue.roomRevenue ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B. Housekeeping Panel titled 'House Keeping' */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4472C4]">
                  cleaning_services
                </span>
                <h3 className="text-sm font-bold text-slate-900">House Keeping</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {housekeepingList.length} Rooms
              </span>
            </div>

            {/* Independently Scrollable Container */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 pr-1">
              {isHkLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-[24px] text-[#4472C4]">
                    progress_activity
                  </span>
                  <p className="mt-1 text-xs">Loading housekeeping assignments...</p>
                </div>
              ) : housekeepingList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No rooms assigned
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] sticky top-0">
                      <th className="py-2 px-2.5">Room Name</th>
                      <th className="py-2 px-2.5">House Keeper</th>
                      <th className="py-2 px-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {housekeepingList.map((hk) => (
                      <tr key={hk.roomId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2.5 font-bold text-slate-800">
                          {hk.roomName}
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-600 truncate max-w-[110px]">
                          {hk.houseKeeper}
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              hk.status === 'Done'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {hk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status derived from room clean state</span>
              <button
                onClick={() => navigate('change-room-status' as any)}
                className="text-[#4472C4] font-semibold hover:underline cursor-pointer"
              >
                Room Status &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
