import React, { useState, useEffect, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { databaseApi } from '@/src/services/api/database';

export interface ReservationLogItem {
  log_id: number;
  client_id: number;
  reservation_id?: number | null;
  booking_number: string;
  guest_name: string;
  action_type: string;
  action_title: string;
  action_details: string;
  performed_by_user_id?: number | null;
  performed_by_name: string;
  performed_by_role: string;
  witnessed_by_name?: string | null;
  witnessed_by_role?: string | null;
  workstation_or_terminal?: string;
  ip_address?: string;
  previous_values?: any;
  new_values?: any;
  notes?: string;
  created_at: string;
}

export const ReservationLogView: React.FC = () => {
  const { currentProperty, currentPropertyId, currentUser, addToast, navigate } = useProperty();
  const [logs, setLogs] = useState<ReservationLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ReservationLogItem | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);

  // New log form state
  const [newBookingNumber, setNewBookingNumber] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newActionType, setNewActionType] = useState('CHECK_IN');
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDetails, setNewActionDetails] = useState('');
  const [newWitnessName, setNewWitnessName] = useState('');
  const [newWitnessRole, setNewWitnessRole] = useState('Duty Manager');
  const [newWorkstation, setNewWorkstation] = useState('FrontDesk-WS-01');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await databaseApi.getReservationLogs(currentPropertyId);
      if (res.data && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to load reservation logs:', err);
      addToast('Failed to fetch reservation logs from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPropertyId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        log.booking_number?.toLowerCase().includes(q) ||
        log.guest_name?.toLowerCase().includes(q) ||
        log.performed_by_name?.toLowerCase().includes(q) ||
        log.witnessed_by_name?.toLowerCase().includes(q) ||
        log.action_details?.toLowerCase().includes(q) ||
        log.action_title?.toLowerCase().includes(q);
      return matchesAction && matchesQuery;
    });
  }, [logs, actionFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const checkIns = logs.filter((l) => l.action_type === 'CHECK_IN').length;
    const checkOuts = logs.filter((l) => l.action_type === 'CHECK_OUT').length;
    const created = logs.filter((l) => l.action_type === 'RESERVATION_CREATED').length;
    const modified = logs.filter((l) => l.action_type === 'RESERVATION_MODIFIED').length;
    return { total, checkIns, checkOuts, created, modified };
  }, [logs]);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingNumber.trim() || !newGuestName.trim() || !newActionDetails.trim()) {
      addToast('Booking number, guest name, and details are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        booking_number: newBookingNumber.trim().toUpperCase(),
        guest_name: newGuestName.trim(),
        action_type: newActionType,
        action_title:
          newActionTitle.trim() ||
          newActionType
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' '),
        action_details: newActionDetails.trim(),
        performed_by_name: currentUser?.name || 'Staff User',
        performed_by_role: currentUser?.role || 'Front Desk Staff',
        witnessed_by_name: newWitnessName.trim() || null,
        witnessed_by_role: newWitnessRole.trim() || null,
        workstation_or_terminal: newWorkstation.trim() || 'FrontDesk-WS-01',
        notes: newNotes.trim() || null,
      };

      const res = await databaseApi.createReservationLog(currentPropertyId, payload);
      if (res.data) {
        setLogs((prev) => [res.data, ...prev]);
        addToast(`Reservation log recorded for ${newBookingNumber}`, 'success');
        setIsRecordModalOpen(false);
        // Reset form
        setNewBookingNumber('');
        setNewGuestName('');
        setNewActionTitle('');
        setNewActionDetails('');
        setNewWitnessName('');
        setNewNotes('');
      }
    } catch (err: any) {
      console.error('Error creating reservation log:', err);
      addToast('Failed to record reservation log in database', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Check-In
          </span>
        );
      case 'CHECK_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Check-Out
          </span>
        );
      case 'RESERVATION_CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Created
          </span>
        );
      case 'RESERVATION_MODIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Modified
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      case 'ROOM_MOVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Room Move
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {type.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      addToast('No logs available to export', 'info');
      return;
    }
    const headers = [
      'Log ID',
      'Booking Number',
      'Guest Name',
      'Action Type',
      'Action Title',
      'Action Details',
      'Performed By',
      'Staff Role',
      'Witnessed By',
      'Witness Role',
      'Terminal',
      'Timestamp',
    ];
    const rows = logs.map((l) => [
      l.log_id,
      `"${l.booking_number}"`,
      `"${l.guest_name}"`,
      `"${l.action_type}"`,
      `"${l.action_title.replace(/"/g, '""')}"`,
      `"${l.action_details.replace(/"/g, '""')}"`,
      `"${l.performed_by_name}"`,
      `"${l.performed_by_role}"`,
      `"${l.witnessed_by_name || 'N/A'}"`,
      `"${l.witnessed_by_role || 'N/A'}"`,
      `"${l.workstation_or_terminal || 'FrontDesk'}"`,
      `"${new Date(l.created_at).toISOString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservation_logs_${currentPropertyId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Reservation log CSV downloaded successfully', 'success');
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8 min-h-screen bg-[#f8fafc]">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center text-sm text-slate-500 mb-1">
            <span onClick={() => navigate('overview')} className="hover:text-slate-800 cursor-pointer">
              Configuration
            </span>
            <span className="material-symbols-outlined text-base mx-1 text-slate-400">chevron_right</span>
            <span className="text-slate-500">Miscellaneous</span>
            <span className="material-symbols-outlined text-base mx-1 text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-semibold">Reservation Log</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reservation Log</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="material-symbols-outlined text-xs text-emerald-500">lock</span>
              Confidential to {currentProperty?.identity.name || `Property #${currentPropertyId}`}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Live audit trail tracking who created each booking, who modified reservations, and the supervising staff in
            whose presence guests checked in and checked out.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium shadow-xs transition-colors"
          >
            <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base text-slate-600">file_download</span>
            Export CSV
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Record Reservation Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Logs</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-xs text-slate-500">Database recorded</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check-Ins</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-lg">login</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.checkIns}</p>
          <span className="text-xs text-emerald-600 font-medium">Witness presence verified</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check-Outs</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <span className="material-symbols-outlined text-lg">logout</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.checkOuts}</p>
          <span className="text-xs text-purple-600 font-medium">Folios reconciled</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modifications</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <span className="material-symbols-outlined text-lg">edit_note</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.modified}</p>
          <span className="text-xs text-amber-600 font-medium">Rate/room adjustments</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Created Bookings</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <span className="material-symbols-outlined text-lg">book_online</span>
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.created}</p>
          <span className="text-xs text-slate-500">New arrivals booked</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Booking #, Guest Name, Staff, Witness, or Details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">All Action Types</option>
              <option value="CHECK_IN">Check-Ins</option>
              <option value="CHECK_OUT">Check-Outs</option>
              <option value="RESERVATION_CREATED">Created Bookings</option>
              <option value="RESERVATION_MODIFIED">Modifications</option>
              <option value="ROOM_MOVED">Room Moves</option>
              <option value="CANCELLED">Cancellations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Reservation Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">progress_activity</span>
            <p className="text-sm text-slate-500 mt-2">Loading reservation audit logs from database...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Reservation Logs Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || actionFilter !== 'all'
                ? 'No reservation logs matched your search filters.'
                : 'No reservation events have been logged yet for this property in the database.'}
            </p>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Record First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Date & Terminal</th>
                  <th className="py-3.5 px-4">Booking & Guest</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Executed By (Staff)</th>
                  <th className="py-3.5 px-4">Witnessed In Presence Of</th>
                  <th className="py-3.5 px-4">Audit Details</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {filteredLogs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={log.log_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{formattedDate}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {formattedTime}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {log.workstation_or_terminal || 'FrontDesk-WS'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md w-fit border border-blue-100">
                            {log.booking_number}
                          </span>
                          <span className="font-medium text-slate-900 mt-1">{log.guest_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getActionBadge(log.action_type)}
                          <span className="text-xs font-medium text-slate-700">{log.action_title}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                            {log.performed_by_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 text-xs">{log.performed_by_name}</span>
                            <span className="text-[11px] text-slate-500">{log.performed_by_role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.witnessed_by_name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-emerald-500 text-sm">verified_user</span>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900 text-xs">{log.witnessed_by_name}</span>
                              <span className="text-[11px] text-emerald-700 font-medium">
                                {log.witnessed_by_role || 'Supervisor Presence'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Self-authenticated</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2" title={log.action_details}>
                          {log.action_details}
                        </p>
                        {log.notes && (
                          <span className="text-[11px] text-slate-400 italic block mt-0.5 truncate">
                            Note: {log.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          View Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Reservation Log Audit #{selectedLog.log_id}</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Property ID: {selectedLog.client_id} • Booking: {selectedLog.booking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">Guest Name</span>
                  <span className="font-semibold text-slate-900">{selectedLog.guest_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Event Type</span>
                  <div className="mt-0.5">{getActionBadge(selectedLog.action_type)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Performed By</span>
                  <span className="font-semibold text-slate-900">{selectedLog.performed_by_name}</span>
                  <span className="text-xs text-slate-500 block">{selectedLog.performed_by_role}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Witnessed In Presence Of</span>
                  <span className="font-semibold text-slate-900">
                    {selectedLog.witnessed_by_name || 'Standard Front Desk Operation'}
                  </span>
                  {selectedLog.witnessed_by_role && (
                    <span className="text-xs text-emerald-700 font-medium block">{selectedLog.witnessed_by_role}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Timestamp</span>
                  <span className="font-mono text-xs text-slate-700">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Terminal & IP</span>
                  <span className="font-mono text-xs text-slate-700">
                    {selectedLog.workstation_or_terminal || 'FrontDesk-WS'} ({selectedLog.ip_address || '192.168.1.101'})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Action Summary
                </span>
                <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                  {selectedLog.action_details}
                </p>
              </div>

              {selectedLog.notes && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    Internal Notes
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    {selectedLog.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Reservation Event Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-xl">edit_document</span>
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Record Reservation Event</h3>
                  <p className="text-xs text-slate-500">Log audit details and supervising witness</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Booking # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK-2026-1044"
                    value={newBookingNumber}
                    onChange={(e) => setNewBookingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type *</label>
                  <select
                    value={newActionType}
                    onChange={(e) => setNewActionType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="CHECK_IN">Check-In</option>
                    <option value="CHECK_OUT">Check-Out</option>
                    <option value="RESERVATION_CREATED">Reservation Created</option>
                    <option value="RESERVATION_MODIFIED">Reservation Modified</option>
                    <option value="ROOM_MOVED">Room Moved</option>
                    <option value="PAYMENT_RECORDED">Payment Recorded</option>
                    <option value="CANCELLED">Cancellation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Workstation / Terminal</label>
                  <input
                    type="text"
                    value={newWorkstation}
                    onChange={(e) => setNewWorkstation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Title</label>
                <input
                  type="text"
                  placeholder="e.g. Guest Check-In with Keycard Authorization"
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Details / Changes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail exactly what was performed (e.g., Guest checked into Room 302; 2 keys issued; credit card pre-auth $200)."
                  value={newActionDetails}
                  onChange={(e) => setNewActionDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Witness Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified_user</span>
                  Witness Presence (Who was present / Supervising)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-0.5">Witness / Supervisor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={newWitnessName}
                      onChange={(e) => setNewWitnessName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-0.5">Witness Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Front Office Supervisor"
                      value={newWitnessRole}
                      onChange={(e) => setNewWitnessRole(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Remarks / Notes</label>
                <input
                  type="text"
                  placeholder="Optional internal remarks..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-xs"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                  Save Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
