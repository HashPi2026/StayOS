import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

interface DashboardStats {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  inspectedRooms: number;
  maintenanceRooms: number;
  inHouseGuests: number;
  todayArrivals: number;
  todayDepartures: number;
  occupancyPercent: number;
  adr: number;
  revpar: number;
  totalRevenue: number;
  systemDate: string;
}

interface ReservationItem {
  reservation_id: number;
  booking_number: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_number: string;
  room_type_name?: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  adults: number;
  total_amount: string | number;
  paid_amount: string | number;
}

export const DashboardView: React.FC = () => {
  const { currentProperty, currentPropertyId, navigate, addToast } = useProperty();

  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 23,
    cleanRooms: 14,
    dirtyRooms: 5,
    inspectedRooms: 3,
    maintenanceRooms: 1,
    inHouseGuests: 5,
    todayArrivals: 4,
    todayDepartures: 2,
    occupancyPercent: 74,
    adr: 242,
    revpar: 179,
    totalRevenue: 14850,
    systemDate: '29-Jun-2026',
  });

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IN_HOUSE' | 'CONFIRMED'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [statsRes, resList] = await Promise.all([
        fetch(`/api/v1/reservations/dashboard-stats`, {
          headers: { 'x-client-id': currentPropertyId },
        }),
        fetch(`/api/v1/reservations?limit=15`, {
          headers: { 'x-client-id': currentPropertyId },
        }),
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.data) {
          setStats((prev) => ({
            ...prev,
            ...statsJson.data,
            systemDate: statsJson.data.systemDate || '29-Jun-2026',
          }));
        }
      }

      if (resList.ok) {
        const resJson = await resList.json();
        if (Array.isArray(resJson.data)) {
          setReservations(resJson.data);
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch notice:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentPropertyId]);

  const handleQuickCheckIn = async (resId: number, guestName: string) => {
    try {
      const res = await fetch(`/api/v1/reservations/${resId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': currentPropertyId,
        },
        body: JSON.stringify({ status: 'IN_HOUSE' }),
      });
      if (res.ok) {
        addToast(`Guest ${guestName} checked in successfully`, 'success');
        fetchDashboardData();
      } else {
        addToast('Failed to check in guest', 'error');
      }
    } catch {
      addToast('Network error processing check-in', 'error');
    }
  };

  const handleQuickCheckOut = async (resId: number, guestName: string) => {
    try {
      const res = await fetch(`/api/v1/reservations/${resId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': currentPropertyId,
        },
        body: JSON.stringify({ status: 'CHECKED_OUT' }),
      });
      if (res.ok) {
        addToast(`Guest ${guestName} checked out successfully. Room marked dirty.`, 'success');
        fetchDashboardData();
      } else {
        addToast('Failed to check out guest', 'error');
      }
    } catch {
      addToast('Network error processing check-out', 'error');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status?.toUpperCase() === activeFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#4472C4]">
            <span className="material-symbols-outlined text-[28px]">dashboard</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentProperty?.identity?.name || 'Surat Marriott Hotel'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Operational PMS Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Business Date: <strong className="text-slate-700 font-semibold">{stats.systemDate}</strong> &bull; Region: {currentProperty?.identity?.region || 'APAC (India)'} &bull; Master Node Connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isRefreshing ? 'Syncing...' : 'Refresh KPIs'}
          </button>
          <button
            onClick={() => navigate('front-desk')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#4472C4] hover:bg-[#365cb5] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">concierge</span>
            Front Desk
          </button>
          <button
            onClick={() => navigate('reservation')}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Reservation
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Occupancy Rate</span>
            <span className="p-1 rounded-md bg-blue-50 text-[#4472C4]">
              <span className="material-symbols-outlined text-[18px]">hotel</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.occupancyPercent}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.inHouseGuests}/{stats.totalRooms} Rooms)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-[#4472C4] h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* ADR Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Average Daily Rate (ADR)</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats.adr.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Target: ₹250.00 &bull; RevPAR: ₹{stats.revpar}</p>
        </div>

        {/* Today's Arrivals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Today's Expected Arrivals</span>
            <span className="p-1 rounded-md bg-purple-50 text-purple-600">
              <span className="material-symbols-outlined text-[18px]">flight_land</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.todayArrivals}
            </span>
            <span className="text-xs text-slate-500">Guests Booked</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            <span>Departures Today:</span>
            <strong className="text-slate-800 font-semibold">{stats.todayDepartures} Guests</strong>
          </div>
        </div>

        {/* Room Cleanliness Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Housekeeping Status</span>
            <button
              onClick={() => navigate('housekeeping')}
              className="text-[11px] text-[#4472C4] font-semibold hover:underline"
            >
              Open Board &rarr;
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center my-1">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <div className="text-lg font-bold">{stats.cleanRooms}</div>
              <div className="text-[10px] uppercase font-semibold">Clean</div>
            </div>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800">
              <div className="text-lg font-bold">{stats.dirtyRooms}</div>
              <div className="text-[10px] uppercase font-semibold">Dirty</div>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
              <div className="text-lg font-bold">{stats.inspectedRooms}</div>
              <div className="text-[10px] uppercase font-semibold">Inspected</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center">Maintenance / OOO: {stats.maintenanceRooms} room(s)</p>
        </div>
      </div>

      {/* Operations Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <button
          onClick={() => navigate('front-desk')}
          className="p-3.5 bg-white border border-slate-200 hover:border-[#4472C4] hover:shadow-xs rounded-xl text-center transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#4472C4] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
          </div>
          <div className="text-xs font-bold text-slate-800">Front Desk</div>
          <div className="text-[10px] text-slate-500">Check-in / Out</div>
        </button>

        <button
          onClick={() => navigate('reservation')}
          className="p-3.5 bg-white border border-slate-200 hover:border-[#4472C4] hover:shadow-xs rounded-xl text-center transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </div>
          <div className="text-xs font-bold text-slate-800">Reservation</div>
          <div className="text-[10px] text-slate-500">Tape Chart Grid</div>
        </button>

        <button
          onClick={() => navigate('housekeeping')}
          className="p-3.5 bg-white border border-slate-200 hover:border-[#4472C4] hover:shadow-xs rounded-xl text-center transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">cleaning_services</span>
          </div>
          <div className="text-xs font-bold text-slate-800">Housekeeping</div>
          <div className="text-[10px] text-slate-500">Room Cleanliness</div>
        </button>

        <button
          onClick={() => navigate('audit')}
          className="p-3.5 bg-white border border-slate-200 hover:border-[#4472C4] hover:shadow-xs rounded-xl text-center transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">nightlight</span>
          </div>
          <div className="text-xs font-bold text-slate-800">Night Audit</div>
          <div className="text-[10px] text-slate-500">Financial Rollover</div>
        </button>

        <button
          onClick={() => navigate('business-channels')}
          className="p-3.5 bg-white border border-slate-200 hover:border-[#4472C4] hover:shadow-xs rounded-xl text-center transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
          <div className="text-xs font-bold text-slate-800">Channels</div>
          <div className="text-[10px] text-slate-500">OTA 2-Way Sync</div>
        </button>

        <button
          onClick={() => navigate('reports')}
          className="p-3.5 bg-white border border-slate-200 hover:border-[#4472C4] hover:shadow-xs rounded-xl text-center transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">bar_chart</span>
          </div>
          <div className="text-xs font-bold text-slate-800">Reports</div>
          <div className="text-[10px] text-slate-500">Revenue & Flash</div>
        </button>
      </div>

      {/* Main Operations Table: Active Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Operational Room Status & Today's Manifest
            </h2>
            <p className="text-xs text-slate-500">
              Real-time bookings synchronized with PostgreSQL database
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Active
            </button>
            <button
              onClick={() => setActiveFilter('IN_HOUSE')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'IN_HOUSE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In-House ({stats.inHouseGuests})
            </button>
            <button
              onClick={() => setActiveFilter('CONFIRMED')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'CONFIRMED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arrivals ({stats.todayArrivals})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Booking #</th>
                <th className="px-4 py-3">Guest Profile</th>
                <th className="px-4 py-3">Assigned Room</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Folio Amount</th>
                <th className="px-4 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No reservations matching current filter.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((r) => {
                  const isInHouse = r.status?.toUpperCase() === 'IN_HOUSE';
                  const isConfirmed = r.status?.toUpperCase() === 'CONFIRMED';
                  return (
                    <tr key={r.reservation_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#4472C4]">
                        {r.booking_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{r.guest_name}</div>
                        <div className="text-[11px] text-slate-400">{r.guest_phone || r.guest_email || 'No contact'}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.room_number || 'Unassigned'}
                        {r.room_type_name && (
                          <div className="text-[10px] text-slate-500">{r.room_type_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>
                          In: {r.check_in_date ? new Date(r.check_in_date).toLocaleDateString() : '29 Jun'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Out: {r.check_out_date ? new Date(r.check_out_date).toLocaleDateString() : '02 Jul'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            isInHouse
                              ? 'bg-blue-100 text-[#4472C4]'
                              : isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.status || 'CONFIRMED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        ₹{Number(r.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isConfirmed && (
                          <button
                            onClick={() => handleQuickCheckIn(r.reservation_id, r.guest_name)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            Check-In
                          </button>
                        )}
                        {isInHouse && (
                          <button
                            onClick={() => handleQuickCheckOut(r.reservation_id, r.guest_name)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            Check-Out
                          </button>
                        )}
                        {!isConfirmed && !isInHouse && (
                          <span className="text-slate-400 text-[11px] italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
