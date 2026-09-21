import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoomRackCard, RoomStatusCode } from '../types';
import { INITIAL_ROOM_CARDS, PROPERTY_NAME } from '../mockData';

interface ChangeRoomStatusScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const ChangeRoomStatusScreen: React.FC<ChangeRoomStatusScreenProps> = ({ onNavigateToScreen }) => {
  const { navigate } = useProperty();
  const [rooms, setRooms] = useState<RoomRackCard[]>(INITIAL_ROOM_CARDS);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStatusCode, setSelectedStatusCode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEditingRoom, setActiveEditingRoom] = useState<RoomRackCard | null>(null);
  const [newStatusSelection, setNewStatusSelection] = useState<RoomStatusCode>('VC');
  const [hkRemark, setHkRemark] = useState('');
  const [isRushPriority, setIsRushPriority] = useState(false);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Metrics
  const vcCount = rooms.filter((r) => r.status === 'VC').length;
  const vdCount = rooms.filter((r) => r.status === 'VD').length;
  const ocCount = rooms.filter((r) => r.status === 'OC').length;
  const odCount = rooms.filter((r) => r.status === 'OD').length;
  const oooCount = rooms.filter((r) => r.status === 'OOO' || r.status === 'OOS').length;

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
      if (selectedStatusCode !== 'all' && r.status !== selectedStatusCode) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.roomNumber.toLowerCase().includes(q) ||
          r.roomTypeName.toLowerCase().includes(q) ||
          (r.guestName && r.guestName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rooms, selectedFloor, selectedStatusCode, searchQuery]);

  const floor1Rooms = useMemo(() => filteredRooms.filter((r) => r.floor === 1), [filteredRooms]);
  const floor2Rooms = useMemo(() => filteredRooms.filter((r) => r.floor === 2), [filteredRooms]);

  const handleOpenStatusDrawer = (room: RoomRackCard) => {
    setActiveEditingRoom(room);
    setNewStatusSelection(room.status);
    setHkRemark(room.maintenanceNote || '');
    setIsRushPriority(false);
    setSupervisorPin('');
  };

  const handleSaveRoomStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingRoom) return;

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === activeEditingRoom.id) {
          const isOcc = newStatusSelection.startsWith('O') && newStatusSelection !== 'OOO' && newStatusSelection !== 'OOS';
          return {
            ...r,
            status: newStatusSelection,
            isOccupied: isOcc ? true : newStatusSelection === 'VC' || newStatusSelection === 'VD' ? false : r.isOccupied,
            cleanedTime: newStatusSelection === 'VC' ? 'Cleaned Just Now' : r.cleanedTime,
            maintenanceNote:
              newStatusSelection === 'OOO' || newStatusSelection === 'OOS'
                ? hkRemark || 'Under Maintenance'
                : undefined,
          };
        }
        return r;
      })
    );

    showToast(
      `Room ${activeEditingRoom.roomNumber} updated to ${newStatusSelection}${
        isRushPriority ? ' with RUSH priority flag' : ''
      }.`
    );
    setActiveEditingRoom(null);
  };

  const getStatusBadge = (status: RoomStatusCode) => {
    switch (status) {
      case 'VC':
        return (
          <span className="px-xs py-0.5 rounded bg-emerald-100 text-emerald-900 font-data-mono text-[11px] font-bold">
            VC • Vacant Clean
          </span>
        );
      case 'VD':
        return (
          <span className="px-xs py-0.5 rounded bg-amber-100 text-amber-900 font-data-mono text-[11px] font-bold">
            VD • Vacant Dirty
          </span>
        );
      case 'OC':
        return (
          <span className="px-xs py-0.5 rounded bg-blue-100 text-blue-900 font-data-mono text-[11px] font-bold">
            OC • Occupied Clean
          </span>
        );
      case 'OD':
        return (
          <span className="px-xs py-0.5 rounded bg-orange-100 text-orange-900 font-data-mono text-[11px] font-bold">
            OD • Occupied Dirty
          </span>
        );
      case 'OOO':
        return (
          <span className="px-xs py-0.5 rounded bg-rose-100 text-rose-900 font-data-mono text-[11px] font-bold">
            OOO • Out of Order
          </span>
        );
      case 'OOS':
        return (
          <span className="px-xs py-0.5 rounded bg-purple-100 text-purple-900 font-data-mono text-[11px] font-bold">
            OOS • Out of Service
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="px-lg pt-lg pb-base flex flex-col gap-xs bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-xs text-body-sm text-on-surface-variant font-body-sm">
          <span onClick={() => navigate('dashboard')} className="hover:text-primary cursor-pointer transition-colors">Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => onNavigateToScreen ? onNavigateToScreen('search-reservation') : navigate('front-desk')} className="hover:text-primary cursor-pointer transition-colors">Front Desk</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Change Room Status</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mt-xs">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Room Rack & Housekeeping Status
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Floor-by-floor interactive room cards with instant HK status update and occupancy conflict warnings.
            </p>
          </div>

          <div className="flex items-center gap-sm">
            <button
              onClick={() => {
                setRooms((prev) =>
                  prev.map((r) => (r.floor === 1 && r.status === 'VD' ? { ...r, status: 'VC' } : r))
                );
                showToast('Floor 1 dirty rooms marked clean for turnover.');
              }}
              className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
              <span>Quick Turn Fl 1</span>
            </button>
            <button
              onClick={() => {
                if (onNavigateToScreen) onNavigateToScreen('block-room');
              }}
              className="flex items-center gap-xs px-md py-xs bg-secondary text-on-secondary hover:opacity-95 rounded text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">domain_disabled</span>
              <span>Manage Room Blocks</span>
            </button>
          </div>
        </div>

        {/* Live Rack KPI Strip with Visual Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-sm pt-sm">
          <div className="p-sm rounded-lg bg-surface-container flex flex-col">
            <span className="font-label-uppercase text-[10px] text-on-surface-variant uppercase">Total Inventory</span>
            <span className="text-headline-md font-bold text-on-surface">200 Rms</span>
            <span className="text-[10px] text-on-surface-variant font-data-mono">100% In Service</span>
          </div>
          <div className="p-sm rounded-lg bg-emerald-50 border border-emerald-200/50 flex flex-col">
            <span className="font-label-uppercase text-[10px] text-emerald-800 uppercase font-semibold">Vacant Clean (VC)</span>
            <span className="text-headline-md font-bold text-emerald-900">{vcCount * 8} Rms</span>
            <span className="text-[10px] text-emerald-700 font-data-mono">Immediate Check-in Ready</span>
          </div>
          <div className="p-sm rounded-lg bg-amber-50 border border-amber-200/50 flex flex-col">
            <span className="font-label-uppercase text-[10px] text-amber-800 uppercase font-semibold">Vacant Dirty (VD)</span>
            <span className="text-headline-md font-bold text-amber-900">{vdCount * 6} Rms</span>
            <span className="text-[10px] text-amber-700 font-data-mono">Turnover in Progress</span>
          </div>
          <div className="p-sm rounded-lg bg-blue-50 border border-blue-200/50 flex flex-col">
            <span className="font-label-uppercase text-[10px] text-blue-800 uppercase font-semibold">Occupied Clean (OC)</span>
            <span className="text-headline-md font-bold text-blue-900">{ocCount * 14} Rms</span>
            <span className="text-[10px] text-blue-700 font-data-mono">In-House Stayovers</span>
          </div>
          <div className="p-sm rounded-lg bg-orange-50 border border-orange-200/50 flex flex-col">
            <span className="font-label-uppercase text-[10px] text-orange-800 uppercase font-semibold">Occupied Dirty (OD)</span>
            <span className="text-headline-md font-bold text-orange-900">{odCount * 4} Rms</span>
            <span className="text-[10px] text-orange-700 font-data-mono">Awaiting Daily Maid</span>
          </div>
          <div className="p-sm rounded-lg bg-rose-50 border border-rose-200/50 flex flex-col">
            <span className="font-label-uppercase text-[10px] text-rose-800 uppercase font-semibold">Out of Order (OOO)</span>
            <span className="text-headline-md font-bold text-rose-900">{oooCount * 2} Rms</span>
            <span className="text-[10px] text-rose-700 font-data-mono">Blocked / Maintenance</span>
          </div>
        </div>
      </div>

      {/* Main Floor-Grouped Cards Rack */}
      <div className="px-lg py-md flex flex-col gap-lg">
        {/* Rack Filters Ribbon */}
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-md">
          <div className="flex items-center gap-xs flex-wrap flex-1 w-full">
            {/* Quick search input */}
            <div className="relative flex items-center min-w-[200px] max-w-xs">
              <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full pl-xl pr-md py-xs bg-surface-container-low rounded-lg text-body-sm font-body-sm outline-none text-on-surface focus:bg-surface-container-lowest"
                placeholder="Search Room #, Guest, Type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Floor selector tabs */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  selectedFloor === 'all' ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                All Floors
              </button>
              <button
                onClick={() => setSelectedFloor(1)}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  selectedFloor === 1 ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                Floor 1 (Garden)
              </button>
              <button
                onClick={() => setSelectedFloor(2)}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  selectedFloor === 2 ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                Floor 2 (Mezzanine)
              </button>
              <button
                onClick={() => setSelectedFloor(3)}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  selectedFloor === 3 ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                Floor 3 (Tower)
              </button>
              <button
                onClick={() => setSelectedFloor(4)}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  selectedFloor === 4 ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                Floor 4 (Penthouse)
              </button>
            </div>
          </div>

          {/* Quick status chips */}
          <div className="flex items-center gap-xs flex-wrap">
            {['all', 'VC', 'VD', 'OC', 'OD', 'OOO'].map((code) => (
              <button
                key={code}
                onClick={() => setSelectedStatusCode(code)}
                className={`px-xs py-0.5 rounded text-body-sm font-data-mono font-semibold transition-colors ${
                  selectedStatusCode === code
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Floor 1 Section */}
        {(selectedFloor === 'all' || selectedFloor === 1) && (
          <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-[22px]">floor</span>
                <h2 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Floor 1 — Ground Level & Garden Access
                </h2>
                <span className="px-sm py-0.5 rounded bg-surface-container text-[11px] font-data-mono text-on-surface-variant">
                  {floor1Rooms.length} Units Available
                </span>
              </div>
              <span className="text-body-sm text-on-surface-variant">North Wing / South Courtyard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
              {floor1Rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between border ${
                    room.isFocusRoom ? 'ring-2 ring-secondary/50 border-secondary' : 'border-outline-variant/30'
                  }`}
                >
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-start justify-between">
                      <span className="font-display-lg text-[22px] font-bold font-data-mono text-on-surface">
                        {room.roomNumber}
                      </span>
                      {getStatusBadge(room.status)}
                    </div>
                    <div className="text-body-sm font-semibold text-on-surface">{room.roomTypeName}</div>
                    <span className="text-[11px] text-on-surface-variant font-data-mono">{room.wing}</span>

                    {/* Occupancy or HK Note */}
                    <div className="mt-xs pt-xs border-t border-surface-container/60 text-[11px]">
                      {room.guestName ? (
                        <div className="flex items-center gap-1 text-on-surface font-semibold truncate">
                          <span className="material-symbols-outlined text-[14px] text-secondary">person</span>
                          <span className="truncate">{room.guestName}</span>
                        </div>
                      ) : room.maintenanceNote ? (
                        <div className="text-rose-700 font-semibold truncate flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          <span className="truncate">{room.maintenanceNote}</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 font-medium">{room.cleanedTime || 'Vacant & Ready'}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-md pt-xs border-t border-surface-container flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant">{room.hkAttendant || 'HK Team'}</span>
                    <button
                      onClick={() => handleOpenStatusDrawer(room)}
                      className="px-sm py-1 bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface rounded text-body-sm font-semibold transition-all shadow-xs"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floor 2 Section */}
        {(selectedFloor === 'all' || selectedFloor === 2) && (
          <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-[22px]">floor</span>
                <h2 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Floor 2 — Premium Mezzanine & Executive Balcony
                </h2>
                <span className="px-sm py-0.5 rounded bg-surface-container text-[11px] font-data-mono text-on-surface-variant">
                  {floor2Rooms.length} Units Available
                </span>
              </div>
              <span className="text-body-sm text-on-surface-variant">Tower East & West Atrium</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
              {floor2Rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/30"
                >
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-start justify-between">
                      <span className="font-display-lg text-[22px] font-bold font-data-mono text-on-surface">
                        {room.roomNumber}
                      </span>
                      {getStatusBadge(room.status)}
                    </div>
                    <div className="text-body-sm font-semibold text-on-surface">{room.roomTypeName}</div>
                    <span className="text-[11px] text-on-surface-variant font-data-mono">{room.wing}</span>

                    <div className="mt-xs pt-xs border-t border-surface-container/60 text-[11px]">
                      {room.guestName ? (
                        <div className="flex items-center gap-1 text-on-surface font-semibold truncate">
                          <span className="material-symbols-outlined text-[14px] text-secondary">person</span>
                          <span className="truncate">{room.guestName}</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 font-medium">{room.cleanedTime || 'Vacant & Ready'}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-md pt-xs border-t border-surface-container flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant">{room.hkAttendant || 'HK Team'}</span>
                    <button
                      onClick={() => handleOpenStatusDrawer(room)}
                      className="px-sm py-1 bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface rounded text-body-sm font-semibold transition-all shadow-xs"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Update Status Drawer */}
      {activeEditingRoom && (
        <>
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setActiveEditingRoom(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-lg bg-surface-container-low flex items-start justify-between border-b border-surface-container">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-secondary font-bold uppercase">
                  Housekeeping & Front Desk Sync
                </span>
                <h3 className="font-headline-md text-[20px] font-bold text-on-surface">
                  Update Status: Room {activeEditingRoom.roomNumber}
                </h3>
                <span className="text-body-sm text-on-surface-variant font-data-mono">
                  {activeEditingRoom.roomTypeName} • Floor {activeEditingRoom.floor} ({activeEditingRoom.wing})
                </span>
              </div>
              <button
                onClick={() => setActiveEditingRoom(null)}
                className="p-xs text-on-surface-variant hover:text-on-surface rounded-full"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveRoomStatus} className="flex-1 overflow-y-auto p-lg space-y-md">
              {/* Live Occupancy Warning Banner */}
              {activeEditingRoom.isOccupied && (
                <div className="p-md rounded-lg bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <div className="flex items-center gap-xs font-bold text-body-sm text-amber-900">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>OCCUPANCY WARNING</span>
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    Room is currently registered to{' '}
                    <strong>{activeEditingRoom.guestName || 'In-House Guest'}</strong>. Changing to Vacant (VC/VD) or Out
                    of Order (OOO) will flag a discrepancy against active keycard locks and night audit folio balances.
                  </p>
                </div>
              )}

              {/* Status Selector Grid */}
              <div className="space-y-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant uppercase font-semibold">
                  Select New Room Status *
                </label>
                <div className="grid grid-cols-2 gap-sm">
                  {[
                    { code: 'VC' as RoomStatusCode, label: 'VC • Vacant Clean', desc: 'Ready for check-in' },
                    { code: 'VD' as RoomStatusCode, label: 'VD • Vacant Dirty', desc: 'Awaiting HK maid' },
                    { code: 'OC' as RoomStatusCode, label: 'OC • Occupied Clean', desc: 'Serviced stayover' },
                    { code: 'OD' as RoomStatusCode, label: 'OD • Occupied Dirty', desc: 'Requires daily service' },
                    { code: 'OOO' as RoomStatusCode, label: 'OOO • Out of Order', desc: 'Major repair / offline' },
                    { code: 'OOS' as RoomStatusCode, label: 'OOS • Out of Service', desc: 'Cosmetic / touchup' },
                  ].map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => setNewStatusSelection(s.code)}
                      className={`p-sm rounded-lg text-left border flex flex-col gap-0.5 transition-all ${
                        newStatusSelection === s.code
                          ? 'border-secondary bg-secondary-fixed/20 shadow-sm'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <span className="font-bold text-body-sm text-on-surface">{s.label}</span>
                      <span className="text-[10px] text-on-surface-variant">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Remark / Maintenance Note */}
              <div className="space-y-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant uppercase font-semibold">
                  Housekeeping & Maintenance Remarks
                </label>
                <textarea
                  rows={3}
                  className="w-full p-sm rounded-lg bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface outline-none focus:border-secondary"
                  placeholder="e.g. Deep sanitization complete, linen restocked, plumbing inspection cleared..."
                  value={hkRemark}
                  onChange={(e) => setHkRemark(e.target.value)}
                />
              </div>

              {/* Rush Priority Flag Toggle */}
              <div className="p-md rounded-lg bg-surface-container-low flex items-center justify-between">
                <div>
                  <span className="font-bold text-body-sm text-on-surface block">
                    Flag as Rush Priority for Housekeeping
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Pushes high-priority buzzer to floor attendant mobile tablet
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isRushPriority}
                  onChange={(e) => setIsRushPriority(e.target.checked)}
                  className="w-5 h-5 rounded text-secondary focus:ring-secondary cursor-pointer"
                />
              </div>

              {/* Supervisor PIN Validation */}
              <div className="space-y-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant uppercase font-semibold">
                  Front Desk Supervisor PIN Authorization (Required for Overrides)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono text-on-surface outline-none"
                  placeholder="••••"
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                />
                <span className="text-[10px] text-on-surface-variant">Enter 4-digit supervisor passcode (e.g. 1234)</span>
              </div>

              {/* Footer */}
              <div className="pt-md border-t border-surface-container flex items-center justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => setActiveEditingRoom(null)}
                  className="px-md py-xs rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm hover:opacity-95"
                >
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </>
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
