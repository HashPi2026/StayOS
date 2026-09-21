import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoomBlockItem } from '../types';
import { INITIAL_ROOM_BLOCKS, WORKING_DATE } from '../mockData';

interface BlockRoomScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const BlockRoomScreen: React.FC<BlockRoomScreenProps> = ({ onNavigateToScreen }) => {
  const { navigate } = useProperty();
  const [blocks, setBlocks] = useState<RoomBlockItem[]>(INITIAL_ROOM_BLOCKS);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedBlockForEdit, setSelectedBlockForEdit] = useState<RoomBlockItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add/Edit Block Form State
  const [formRoomNumber, setFormRoomNumber] = useState('109');
  const [formCategoryType, setFormCategoryType] = useState<'OOO' | 'OOS'>('OOO');
  const [formCategory, setFormCategory] = useState('HVAC Repair');
  const [formFromDate, setFormFromDate] = useState('29-Jun-2026 10:00');
  const [formToDate, setFormToDate] = useState('02-Jul-2026 18:00');
  const [formRemarks, setFormRemarks] = useState('Compressor coil replacement. Authorized by Facilities Mgr Dave K.');
  const [formAcknowledgeConflict, setFormAcknowledgeConflict] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeCount = blocks.filter((b) => b.isActive).length;
  const oooCount = blocks.filter((b) => b.categoryType === 'OOO' && b.isActive).length;
  const oosCount = blocks.filter((b) => b.categoryType === 'OOS' && b.isActive).length;

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (filterTab === 'active' && !b.isActive) return false;
      if (filterTab === 'inactive' && b.isActive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          b.roomNumber.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.remarks.toLowerCase().includes(q) ||
          b.blockedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [blocks, filterTab, searchQuery]);

  const handleToggleBlockActive = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nextState = !b.isActive;
          showToast(`Room Block for Room ${b.roomNumber} ${nextState ? 'activated' : 'lifted/inactivated'}.`);
          return { ...b, isActive: nextState };
        }
        return b;
      })
    );
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();

    if (formRoomNumber === '109' && !formAcknowledgeConflict) {
      showToast('Please acknowledge the reservation conflict before saving.');
      return;
    }

    if (selectedBlockForEdit) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedBlockForEdit.id
            ? {
                ...b,
                roomNumber: formRoomNumber,
                categoryType: formCategoryType,
                category: formCategory,
                fromDateTime: formFromDate,
                toDateTime: formToDate,
                remarks: formRemarks,
                isActive: formIsActive,
              }
            : b
        )
      );
      showToast(`Room Block for Room ${formRoomNumber} updated.`);
    } else {
      const newBlock: RoomBlockItem = {
        id: String(Date.now()),
        roomNumber: formRoomNumber,
        roomType: formRoomNumber.startsWith('2') ? 'EXST' : 'DLXK',
        roomTypeName: formRoomNumber.startsWith('2') ? 'Executive Suite' : 'Deluxe King',
        floor: `Floor ${formRoomNumber[0]}`,
        wing: 'Wing A',
        category: formCategory,
        categoryType: formCategoryType,
        fromDateTime: formFromDate,
        toDateTime: formToDate,
        durationString: '3d 8h',
        remarks: formRemarks,
        overlapWarning:
          formRoomNumber === '109'
            ? {
                resId: 'RES-9620',
                guestName: 'David Harrison',
                checkInTime: '01-Jul-2026 15:00',
              }
            : undefined,
        blockedBy: 'Alex Rivera',
        blockedByRole: 'Front Desk Lead',
        isActive: formIsActive,
      };
      setBlocks((prev) => [newBlock, ...prev]);
      showToast(`Room ${formRoomNumber} placed on ${formCategoryType} hold until ${formToDate}.`);
    }

    setIsAddDrawerOpen(false);
    setSelectedBlockForEdit(null);
  };

  const handleOpenEdit = (b: RoomBlockItem) => {
    setSelectedBlockForEdit(b);
    setFormRoomNumber(b.roomNumber);
    setFormCategoryType(b.categoryType);
    setFormCategory(b.category);
    setFormFromDate(b.fromDateTime);
    setFormToDate(b.toDateTime);
    setFormRemarks(b.remarks);
    setFormIsActive(b.isActive);
    setFormAcknowledgeConflict(true);
    setIsAddDrawerOpen(true);
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
          <span className="text-on-surface font-semibold">Block Room</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mt-xs">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Room Blocking & Maintenance Holds
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Designate Out-of-Order (OOO) and Out-of-Service (OOS) rooms with automated overlap conflict warnings.
            </p>
          </div>

          <div className="flex items-center gap-sm">
            <button
              onClick={() => {
                const csv =
                  'Room,Type,Category,From,To,Remarks\n' +
                  blocks.map((b) => `${b.roomNumber},${b.categoryType},"${b.category}",${b.fromDateTime},${b.toDateTime},"${b.remarks}"`).join('\n');
                const link = document.createElement('a');
                link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
                link.download = `room_blocks_${WORKING_DATE}.csv`;
                link.click();
                showToast('Room blocks exported to CSV.');
              }}
              className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                setSelectedBlockForEdit(null);
                setFormRoomNumber('109');
                setFormCategoryType('OOO');
                setFormCategory('HVAC Maintenance');
                setFormFromDate(`${WORKING_DATE} 10:00`);
                setFormToDate('02-Jul-2026 18:00');
                setFormRemarks('Compressor repair scheduled with vendor.');
                setFormAcknowledgeConflict(false);
                setFormIsActive(true);
                setIsAddDrawerOpen(true);
              }}
              className="flex items-center gap-xs px-md py-xs bg-secondary text-on-secondary hover:opacity-95 rounded text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Block Room</span>
              <span className="ml-xs px-xs py-0.5 bg-tertiary-container/30 text-on-secondary font-data-mono text-[10px] rounded">
                Alt+B
              </span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-md pt-sm">
          <div className="p-md rounded-xl bg-surface-container flex flex-col">
            <span className="font-label-uppercase text-[11px] text-on-surface-variant uppercase">Total Active Blocks</span>
            <span className="font-display-lg text-[24px] font-bold text-on-surface mt-1">{activeCount} Rooms</span>
            <span className="text-[11px] text-on-surface-variant font-data-mono">4.2% Total Inventory</span>
          </div>
          <div className="p-md rounded-xl bg-surface-container flex flex-col">
            <span className="font-label-uppercase text-[11px] text-on-surface-variant uppercase">Scheduled Next 7 Days</span>
            <span className="font-display-lg text-[24px] font-bold text-secondary mt-1">3 Upcoming</span>
            <span className="text-[11px] text-on-surface-variant font-data-mono">Facilities Calendar</span>
          </div>
          <div className="p-md rounded-xl bg-rose-50 border border-rose-200/50 flex flex-col">
            <span className="font-label-uppercase text-[11px] text-rose-800 uppercase font-semibold">
              Out of Order (OOO)
            </span>
            <span className="font-display-lg text-[24px] font-bold text-rose-900 mt-1">{oooCount} Rooms</span>
            <span className="text-[11px] text-rose-700 font-data-mono">Unsellable • Deducts Capacity</span>
          </div>
          <div className="p-md rounded-xl bg-purple-50 border border-purple-200/50 flex flex-col">
            <span className="font-label-uppercase text-[11px] text-purple-800 uppercase font-semibold">
              Out of Service (OOS)
            </span>
            <span className="font-display-lg text-[24px] font-bold text-purple-900 mt-1">{oosCount} Rooms</span>
            <span className="text-[11px] text-purple-700 font-data-mono">Cosmetic • Retains Capacity</span>
          </div>
        </div>

        {/* Operational Rule Instruction Note */}
        <div className="mt-xs p-sm bg-surface-container-low border border-surface-container rounded-lg flex items-center justify-between gap-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
            <span>
              <strong>Rule 4.1 PMS Accounting:</strong> OOO reduces total available hotel rooms from occupancy %
              calculation. OOS rooms remain inside inventory calculations for audit balancing.
            </span>
          </div>
          <span className="font-data-mono text-[11px] text-on-surface-variant">RevPAR Enforced</span>
        </div>
      </div>

      {/* Main Table Workspace */}
      <div className="px-lg py-md flex flex-col gap-md">
        {/* Table Filters Bar */}
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-md">
          <div className="flex items-center gap-sm flex-1 w-full">
            <div className="relative flex items-center min-w-[260px] max-w-md w-full">
              <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full pl-xl pr-md py-xs bg-surface-container-low rounded-lg text-body-sm font-body-sm outline-none text-on-surface focus:bg-surface-container-lowest"
                placeholder="Search room #, maintenance reason, technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  filterTab === 'all' ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                All Blocks ({blocks.length})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  filterTab === 'active' ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                Active Holds ({activeCount})
              </button>
              <button
                onClick={() => setFilterTab('inactive')}
                className={`px-sm py-xs rounded text-body-sm font-semibold transition-all ${
                  filterTab === 'inactive' ? 'bg-surface-container-lowest text-secondary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                Lifted / Past ({blocks.length - activeCount})
              </button>
            </div>
          </div>
        </div>

        {/* Master Blocks Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-body-sm font-body-sm text-on-surface border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-label-uppercase uppercase tracking-wider text-[11px] select-none">
                  <th className="py-sm px-md font-semibold">Room & Type</th>
                  <th className="py-sm px-md font-semibold">Category / Type</th>
                  <th className="py-sm px-md font-semibold">From Date & Time</th>
                  <th className="py-sm px-md font-semibold">To Date & Time</th>
                  <th className="py-sm px-md font-semibold">Hold Duration</th>
                  <th className="py-sm px-md font-semibold">Remarks & Conflict Notes</th>
                  <th className="py-sm px-md font-semibold">Blocked By</th>
                  <th className="py-sm px-md font-semibold text-center">Is Active</th>
                  <th className="py-sm px-md font-semibold text-right pr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredBlocks.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-sm px-md">
                      <div className="flex items-center gap-xs">
                        <span className="px-sm py-0.5 rounded bg-surface-container-highest font-data-mono font-bold text-[13px] text-on-surface">
                          Room {b.roomNumber}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-[12px]">{b.roomTypeName}</span>
                          <span className="text-[10px] text-on-surface-variant font-data-mono">
                            {b.floor} • {b.wing}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex items-center gap-xs">
                        <span
                          className={`px-xs py-0.5 rounded font-data-mono text-[11px] font-bold ${
                            b.categoryType === 'OOO' ? 'bg-rose-100 text-rose-900' : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {b.categoryType}
                        </span>
                        <span className="font-semibold text-body-sm">{b.category}</span>
                      </div>
                    </td>

                    <td className="py-sm px-md font-data-mono text-[12px] text-on-surface">{b.fromDateTime}</td>
                    <td className="py-sm px-md font-data-mono text-[12px] text-on-surface">{b.toDateTime}</td>

                    <td className="py-sm px-md font-data-mono font-semibold text-secondary">{b.durationString}</td>

                    <td className="py-sm px-md max-w-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-body-sm text-on-surface truncate">{b.remarks}</span>
                        {b.overlapWarning && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-sm py-0.5 rounded border border-amber-200/50 w-fit">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            <span>
                              Overlaps {b.overlapWarning.resId} ({b.overlapWarning.guestName})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface text-[12px]">{b.blockedBy}</span>
                        <span className="text-[10px] text-on-surface-variant">{b.blockedByRole}</span>
                      </div>
                    </td>

                    <td className="py-sm px-md text-center">
                      <input
                        type="checkbox"
                        checked={b.isActive}
                        onChange={() => handleToggleBlockActive(b.id)}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                    </td>

                    <td className="py-sm px-md text-right pr-lg">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="px-sm py-1 bg-surface-container hover:bg-surface-container-high rounded text-body-sm font-semibold text-on-surface"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleBlockActive(b.id)}
                          className="px-sm py-1 bg-surface-container hover:bg-surface-container-high rounded text-body-sm text-on-surface-variant"
                        >
                          {b.isActive ? 'Lift Hold' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Block Slide-over Drawer */}
      {isAddDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setIsAddDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[500px] bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-lg bg-surface-container-low flex items-start justify-between border-b border-surface-container">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-secondary font-bold uppercase">
                  Facilities & Housekeeping Hold
                </span>
                <h3 className="font-headline-md text-[20px] font-bold text-on-surface">
                  {selectedBlockForEdit ? `Edit Block: Room ${formRoomNumber}` : 'Schedule New Room Block'}
                </h3>
                <span className="text-body-sm text-on-surface-variant">Working Date: {WORKING_DATE}</span>
              </div>
              <button
                onClick={() => setIsAddDrawerOpen(false)}
                className="p-xs text-on-surface-variant hover:text-on-surface rounded-full"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveBlock} className="flex-1 overflow-y-auto p-lg space-y-md">
              {/* Conflict Warning Box for Room 109 */}
              {formRoomNumber === '109' && (
                <div className="p-md rounded-lg bg-rose-50 border border-rose-300 text-rose-950 space-y-2">
                  <div className="flex items-center gap-xs font-bold text-body-sm text-rose-900">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <span>RESERVATION OVERLAP CONFLICT DETECTED</span>
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    Room <strong>109</strong> has an existing confirmed booking for{' '}
                    <strong>David Harrison (RES-9620)</strong> checking in on <strong>01-Jul-2026 15:00</strong>.
                    Executing this hold requires the Front Desk to reassign David Harrison to another Deluxe King room.
                  </p>
                  <label className="flex items-center gap-xs pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formAcknowledgeConflict}
                      onChange={(e) => setFormAcknowledgeConflict(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-700 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-rose-900">
                      I acknowledge reservation conflict and authorize room reassignment
                    </span>
                  </label>
                </div>
              )}

              {/* Target Room */}
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Target Inventory Unit (Room #) *
                </label>
                <select
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 text-on-surface font-semibold outline-none"
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                >
                  <option value="109">Room 109 — DLXK (Deluxe King, Garden)</option>
                  <option value="102">Room 102 — SUPQ (Superior Queen)</option>
                  <option value="204">Room 204 — EXST (Executive Suite)</option>
                  <option value="315">Room 315 — DLXK (Deluxe King, Corner)</option>
                  <option value="402">Room 402 — PRES (Presidential Suite)</option>
                </select>
              </div>

              {/* Category Type */}
              <div className="space-y-xs">
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block uppercase font-semibold">
                  Block Classification *
                </label>
                <div className="grid grid-cols-2 gap-sm">
                  <button
                    type="button"
                    onClick={() => setFormCategoryType('OOO')}
                    className={`p-sm rounded-lg text-left border flex flex-col gap-0.5 transition-all ${
                      formCategoryType === 'OOO'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <span className="font-bold text-body-sm">OOO • Out of Order</span>
                    <span className="text-[10px] text-on-surface-variant">Deducted from house occupancy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCategoryType('OOS')}
                    className={`p-sm rounded-lg text-left border flex flex-col gap-0.5 transition-all ${
                      formCategoryType === 'OOS'
                        ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <span className="font-bold text-body-sm">OOS • Out of Service</span>
                    <span className="text-[10px] text-on-surface-variant">Retains capacity calculation</span>
                  </button>
                </div>
              </div>

              {/* Category Reason */}
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Reason / Work Order Category *
                </label>
                <input
                  required
                  className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 text-on-surface outline-none focus:border-secondary"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. HVAC Repair, Carpet Sanitization, Plumbing"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                    Hold Start Date & Time
                  </label>
                  <input
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono text-on-surface outline-none"
                    value={formFromDate}
                    onChange={(e) => setFormFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                    Hold End Date & Time
                  </label>
                  <input
                    className="w-full px-md py-xs bg-surface-container-low rounded border border-outline-variant/40 font-data-mono text-on-surface outline-none"
                    value={formToDate}
                    onChange={(e) => setFormToDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration Notice */}
              <div className="p-sm rounded bg-surface-container flex items-center justify-between text-[12px] font-data-mono">
                <span className="text-on-surface-variant">Calculated Hold Duration:</span>
                <strong className="text-secondary">3 Days, 8 Hours (80 Hours)</strong>
              </div>

              {/* Technical Remarks */}
              <div>
                <label className="font-label-uppercase text-[11px] text-on-surface-variant block mb-1">
                  Technical Remarks & Facilities Log
                </label>
                <textarea
                  rows={3}
                  className="w-full p-sm rounded bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface outline-none focus:border-secondary"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                />
              </div>

              {/* Active Toggle */}
              <div className="p-md rounded-lg bg-surface-container-low flex items-center justify-between">
                <div>
                  <span className="font-bold text-body-sm text-on-surface block">Block Active Immediately</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Pushes lock command to PMS rack & prevents walk-in sales
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-5 h-5 rounded text-secondary focus:ring-secondary cursor-pointer"
                />
              </div>

              {/* Footer */}
              <div className="pt-md border-t border-surface-container flex items-center justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="px-md py-xs rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm hover:opacity-95"
                >
                  Save Room Block
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
