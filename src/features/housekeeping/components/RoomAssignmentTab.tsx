import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Scale, 
  RotateCcw, 
  Smartphone, 
  Info, 
  Search, 
  GripVertical, 
  Printer, 
  UserMinus, 
  X, 
  PlusCircle, 
  Sparkles,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react';
import { UnassignedRoom, AttendantAssignment } from '../types';

interface RoomAssignmentTabProps {
  unassignedRooms: UnassignedRoom[];
  attendants: AttendantAssignment[];
  onAssignRoom: (roomId: string, attendantId: string) => void;
  onUnassignRoom: (attendantId: string, roomNumber: string) => void;
  onUnassignAll: (attendantId: string) => void;
  onAutoBalance: () => void;
  onClearAll: () => void;
}

export const RoomAssignmentTab: React.FC<RoomAssignmentTabProps> = ({
  unassignedRooms,
  attendants,
  onAssignRoom,
  onUnassignRoom,
  onUnassignAll,
  onAutoBalance,
  onClearAll,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'VD' | 'OD' | 'VIP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedRoomId, setDraggedRoomId] = useState<string | null>(null);
  const [isAutoBalancing, setIsAutoBalancing] = useState(false);
  const [dragOverAttendantId, setDragOverAttendantId] = useState<string | null>(null);
  const [areChipsCollapsed, setAreChipsCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAutoBalanceClick = () => {
    setIsAutoBalancing(true);
    setTimeout(() => {
      onAutoBalance();
      setIsAutoBalancing(false);
      showToast('Equitable distribution applied: 6 attendants re-balanced across North Tower floors.');
    }, 700);
  };

  // Filter unassigned rooms
  const filteredUnassigned = unassignedRooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.includes(searchQuery) ||
      r.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.note && r.note.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'VD') return r.status === 'VD';
    if (filterType === 'OD') return r.status === 'OD';
    if (filterType === 'VIP') return r.isVip;
    return true;
  });

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedRoomId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, attendantId: string) => {
    e.preventDefault();
    setDragOverAttendantId(attendantId);
  };

  const handleDragLeave = () => {
    setDragOverAttendantId(null);
  };

  const handleDrop = (e: React.DragEvent, attendantId: string) => {
    e.preventDefault();
    setDragOverAttendantId(null);
    const roomId = e.dataTransfer.getData('text/plain') || draggedRoomId;
    if (roomId) {
      onAssignRoom(roomId, attendantId);
      const room = unassignedRooms.find((r) => r.id === roomId);
      const attendant = attendants.find((a) => a.attendantId === attendantId);
      if (room && attendant) {
        showToast(`Room ${room.roomNumber} assigned to ${attendant.name}`);
      }
      setDraggedRoomId(null);
    }
  };

  const totalAssignedRooms = attendants.reduce((acc, a) => acc + a.assignedRooms.length, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-2.5 bg-white text-slate-800 rounded-lg shadow-xl border-l-4 border-[#2170e4] transition-all">
          <CheckCircle2 className="w-5 h-5 text-[#2170e4]" />
          <div className="text-xs">
            <span className="font-semibold block">Room Assignment Synchronized</span>
            <span className="text-slate-500">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer">Operations</span>
            <span>/</span>
            <span className="hover:text-slate-800 cursor-pointer">Housekeeping</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Room Assignment</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room Assignment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign daily guest rooms and turnaround quotas across housekeeping attendants with live load calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoBalanceClick}
            disabled={isAutoBalancing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            {isAutoBalancing ? (
              <RotateCcw className="w-4 h-4 text-[#2170e4] animate-spin" />
            ) : (
              <Scale className="w-4 h-4 text-[#2170e4]" />
            )}
            Auto-Balance Roster
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>

          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Smartphone className="w-3.5 h-3.5" />
            Sync Attendants Mobile
          </div>
        </div>
      </div>

      {/* Controls & Workload KPI Strip */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        {/* Date Picker & Squad Selector (5 Cols) */}
        <div className="xl:col-span-5 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs border border-slate-200">
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-slate-600">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-2 font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#2170e4]" />
              <span>Today • 29 Jun 2026</span>
            </div>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-slate-600">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200 cursor-pointer hover:bg-slate-200/70 transition-colors">
            <Users className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <span>North Tower Morning Squad (Shift A • 07:00 – 15:30)</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          </div>
        </div>

        {/* Quick Metrics Badges (7 Cols) */}
        <div className="xl:col-span-7 flex flex-wrap items-center justify-start xl:justify-end gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{unassignedRooms.length}</span>
                <span className="text-[10px] text-slate-500">Unassigned</span>
              </div>
              <span className="text-[9px] text-slate-400">8 VD • 4 OD • 2 SO</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-[#2170e4]" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{totalAssignedRooms}</span>
                <span className="text-[10px] text-slate-500">Assigned</span>
              </div>
              <span className="text-[9px] text-slate-400">{attendants.length} Attendants on Duty</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Activity className="w-5 h-5 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">~8 Rms / Stf</span>
              <span className="text-[9px] text-[#2170e4] font-semibold">Target Capacity Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Operational Callout */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
        <Info className="w-5 h-5 text-[#2170e4] shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <p className="text-xs text-slate-700">
            <strong className="font-semibold text-slate-900">Auto-Reassignment Rule:</strong> Moving a room from one
            attendant instantly revokes prior ownership for 29 Jun 2026. Real-time cleaning turnover time recalculates
            dynamically per zone.
          </p>
          <span className="px-2 py-0.5 bg-white text-[#2170e4] text-[10px] font-bold rounded uppercase tracking-wider border border-blue-200 shadow-xs whitespace-nowrap">
            Live Rules Active
          </span>
        </div>
      </div>

      {/* 2-COLUMN SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Unassigned Rooms (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900">Unassigned Rooms</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-full border border-slate-200">
                {unassignedRooms.length}
              </span>
            </div>
            <button
              onClick={() => showToast('All unassigned rooms selected for batch distribution.')}
              className="text-[11px] text-[#2170e4] hover:underline font-semibold"
            >
              Select All
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter room, floor, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({unassignedRooms.length})
            </button>
            <button
              onClick={() => setFilterType('VD')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterType === 'VD'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Vacant Dirty ({unassignedRooms.filter((r) => r.status === 'VD').length})
            </button>
            <button
              onClick={() => setFilterType('OD')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterType === 'OD'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Occupied ({unassignedRooms.filter((r) => r.status === 'OD').length})
            </button>
            <button
              onClick={() => setFilterType('VIP')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterType === 'VIP'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              VIP ({unassignedRooms.filter((r) => r.isVip).length})
            </button>
          </div>

          {/* Batch distribute dropdown */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-600 pl-1">Batch distribute:</span>
            <select
              onChange={(e) => {
                const attId = e.target.value;
                if (attId && filteredUnassigned.length > 0) {
                  onAssignRoom(filteredUnassigned[0].id, attId);
                  e.target.value = '';
                }
              }}
              className="bg-white text-xs text-slate-800 px-2 py-1 rounded border border-slate-200 font-medium cursor-pointer"
            >
              <option value="">Choose Attendant...</option>
              {attendants.map((a) => (
                <option key={a.attendantId} value={a.attendantId}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Draggable Room Cards Deck */}
          <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredUnassigned.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No unassigned rooms matching criteria.</div>
            ) : (
              filteredUnassigned.map((room) => (
                <div
                  key={room.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, room.id)}
                  className="group p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg shadow-2xs cursor-grab active:cursor-grabbing transition-all flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      <span className="text-xs font-bold text-slate-900">Room {room.roomNumber}</span>
                      <span className="px-1.5 py-0.5 bg-slate-200/80 text-slate-700 text-[10px] font-mono rounded">
                        {room.roomType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {room.isVip && (
                        <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded">
                          {room.vipTier || 'VIP'}
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          room.status === 'VD'
                            ? 'bg-red-100 text-red-800'
                            : room.status === 'OD'
                            ? 'bg-amber-100 text-amber-900'
                            : room.status === 'SO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {room.statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pl-5">
                    <span className={room.priorityLabel ? 'text-red-600 font-medium' : ''}>
                      {room.priorityLabel || room.note || 'Standard Refresh'}
                    </span>
                    <span className="font-mono text-[10px]">Est. {room.estMinutes}m</span>
                  </div>

                  {/* Quick Click-to-Assign Dropdown */}
                  <div className="pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Quick assign:</span>
                    <div className="flex items-center gap-1">
                      {attendants.slice(0, 3).map((a) => (
                        <button
                          key={a.attendantId}
                          onClick={() => onAssignRoom(room.id, a.attendantId)}
                          className="px-1.5 py-0.5 bg-white hover:bg-[#2170e4] hover:text-white text-slate-700 border border-slate-200 rounded text-[9px] font-bold transition-colors"
                          title={`Assign to ${a.name}`}
                        >
                          {a.initials}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-100/70 rounded-lg flex items-center gap-2 text-xs text-slate-500 border border-slate-200/60">
            <Sparkles className="w-4 h-4 text-[#2170e4] shrink-0" />
            <span>Drag rooms to any attendant on the right or click initials for instant assignment.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Attendants Duty Roster Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Assigned Rooms by Attendant</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-[#2170e4] text-[10px] font-bold rounded">
                {attendants.length} On-Duty
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Sort:</span>
                <button className="font-semibold text-slate-900 hover:text-[#2170e4]">Workload</button>
                <span>•</span>
                <button className="hover:text-[#2170e4]">Name</button>
              </div>
              <button
                onClick={() => setAreChipsCollapsed(!areChipsCollapsed)}
                className="text-xs text-[#2170e4] font-semibold hover:underline flex items-center gap-1"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                {areChipsCollapsed ? 'Expand All' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* Attendants Cards Stack (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendants.map((attendant) => {
              const totalMins = attendant.assignedRooms.reduce((sum, r) => sum + r.minutes, 0);
              const percentage = Math.min(Math.round((totalMins / attendant.maxMinutes) * 100), 100);
              const isOver = percentage > 90;
              const isUnder = percentage < 60;
              const isDraggingOver = dragOverAttendantId === attendant.attendantId;

              return (
                <div
                  key={attendant.attendantId}
                  onDragOver={(e) => handleDragOver(e, attendant.attendantId)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, attendant.attendantId)}
                  className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3 transition-all ${
                    isDraggingOver
                      ? 'border-[#2170e4] ring-2 ring-[#2170e4]/20 bg-blue-50/20'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800">
                          {attendant.initials}
                        </div>
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"
                          title="On Duty"
                        ></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{attendant.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px]">
                            {attendant.role}
                          </span>
                          {isUnder && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-semibold">
                              Under Capacity
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {attendant.empId} • {attendant.focusFloor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => showToast(`Worksheet printed for ${attendant.name}`)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                        title="Print Worksheet"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUnassignAll(attendant.attendantId)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Unassign All"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Workload Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-900">
                        {attendant.assignedRooms.length} Rooms Assigned
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {totalMins}m / {attendant.maxMinutes}m max
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-red-500' : isUnder ? 'bg-amber-500' : 'bg-[#2170e4]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Drop Zone Target */}
                  <div
                    className={`py-1.5 px-3 rounded-lg text-center text-xs transition-colors flex items-center justify-center gap-1 ${
                      isDraggingOver
                        ? 'bg-[#2170e4] text-white font-semibold'
                        : 'bg-slate-50 text-slate-500 border border-dashed border-slate-200'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {isDraggingOver ? 'Drop to assign' : 'Drop rooms here to assign'}
                  </div>

                  {/* Assigned Room Chips */}
                  {!areChipsCollapsed && (
                    <div className="flex flex-wrap gap-1.5 min-h-[42px]">
                      {attendant.assignedRooms.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic py-1">No rooms assigned yet.</span>
                      ) : (
                        attendant.assignedRooms.map((r) => (
                          <div
                            key={r.roomNumber}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-xs font-mono text-slate-800 border border-slate-200"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                r.status === 'VD'
                                  ? 'bg-red-500'
                                  : r.status === 'OD'
                                  ? 'bg-amber-500'
                                  : r.status === 'SO'
                                  ? 'bg-blue-500'
                                  : 'bg-emerald-500'
                              }`}
                            ></span>
                            <span>
                              {r.roomNumber} ({r.status})
                            </span>
                            <button
                              onClick={() => onUnassignRoom(attendant.attendantId, r.roomNumber)}
                              className="text-slate-400 hover:text-red-600 ml-0.5"
                              title="Unassign room"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
