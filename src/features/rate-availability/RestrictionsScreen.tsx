import React, { useState, useMemo, useEffect } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { DatePickerField } from './DatePickerField';
import {
  generateDateItems,
  shiftDate,
  DateItem,
  exportToCSV,
  formatDisplayDate,
} from './dateUtils';

interface RestrictionsScreenProps {
  onNotify: (msg: string) => void;
}

export const RestrictionsScreen: React.FC<RestrictionsScreenProps> = ({ onNotify }) => {
  const { currentProperty, roomTypes, rooms, currentPropertyId } = useProperty();
  const isSurat = currentPropertyId === '10002' || currentPropertyId === 'STVMC_SURAT';
  const hotelDisplayName = currentProperty?.identity?.name || (isSurat ? 'Surat Marriott Hotel' : 'Destin Inn & Suites');

  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Date horizon state - Default starts at working date 29 June 2026
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 5, 29));
  const [horizonDays, setHorizonDays] = useState<number>(14);

  // Computed consecutive dates array
  const dates = useMemo<DateItem[]>(() => {
    return generateDateItems(startDate, horizonDays);
  }, [startDate, horizonDays]);

  const endDate = useMemo<Date>(() => {
    return shiftDate(startDate, horizonDays - 1);
  }, [startDate, horizonDays]);

  // Grid toggles state: catCode -> restrictionType -> isoDate -> value
  const [restrictions, setRestrictions] = useState<Record<string, {
    cta: Record<string, boolean>;
    ctd: Record<string, boolean>;
    stopSell: Record<string, boolean>;
    minLos: Record<string, number>;
    maxLos: Record<string, number>;
  }>>({
    DLXK: {
      cta: { '2026-07-03': true, '2026-07-04': true, '2026-07-10': true, '2026-07-11': true },
      ctd: { '2026-07-05': true, '2026-07-12': true },
      stopSell: { '2026-07-04': true, '2026-07-11': true },
      minLos: { '2026-07-03': 3, '2026-07-04': 3, '2026-07-10': 3, '2026-07-11': 3 },
      maxLos: { '2026-07-03': 7, '2026-07-04': 7, '2026-07-10': 7, '2026-07-11': 7 },
    },
    EXSU: {
      cta: { '2026-07-03': true, '2026-07-04': true, '2026-07-10': true, '2026-07-11': true },
      ctd: { '2026-07-05': true },
      stopSell: { '2026-07-04': true },
      minLos: { '2026-07-03': 3, '2026-07-04': 3, '2026-07-10': 3, '2026-07-11': 3 },
      maxLos: { '2026-07-03': 7, '2026-07-04': 7, '2026-07-10': 7, '2026-07-11': 7 },
    },
    PROV: {
      cta: { '2026-07-03': true, '2026-07-10': true },
      ctd: {},
      stopSell: {},
      minLos: { '2026-07-03': 2, '2026-07-04': 2, '2026-07-10': 2, '2026-07-11': 2 },
      maxLos: {},
    },
    PRES: {
      cta: { '2026-07-03': true, '2026-07-04': true, '2026-07-10': true, '2026-07-11': true },
      ctd: { '2026-07-05': true, '2026-07-12': true },
      stopSell: { '2026-07-04': true },
      minLos: { '2026-07-03': 4, '2026-07-04': 4, '2026-07-10': 4, '2026-07-11': 4 },
      maxLos: { '2026-07-03': 14, '2026-07-04': 14, '2026-07-10': 14, '2026-07-11': 14 },
    },
  });

  // Strict tenant data isolation: reset restrictions upon tenant change
  useEffect(() => {
    if (isSurat) {
      setRestrictions({
        DLX_KG: {
          cta: { '2026-07-04': true, '2026-07-11': true },
          ctd: { '2026-07-05': true },
          stopSell: {},
          minLos: { '2026-07-04': 2, '2026-07-11': 2 },
          maxLos: { '2026-07-04': 7, '2026-07-11': 7 },
        },
        EXE_TW: {
          cta: { '2026-07-04': true },
          ctd: {},
          stopSell: {},
          minLos: { '2026-07-04': 2 },
          maxLos: {},
        },
        TAPI_SU: {
          cta: {},
          ctd: {},
          stopSell: {},
          minLos: { '2026-07-04': 3 },
          maxLos: {},
        },
        PRES_SU: {
          cta: {},
          ctd: {},
          stopSell: {},
          minLos: {},
          maxLos: {},
        },
      });
    } else {
      setRestrictions({
        DLXK: {
          cta: { '2026-07-03': true, '2026-07-04': true, '2026-07-10': true, '2026-07-11': true },
          ctd: { '2026-07-05': true, '2026-07-12': true },
          stopSell: { '2026-07-04': true, '2026-07-11': true },
          minLos: { '2026-07-03': 3, '2026-07-04': 3, '2026-07-10': 3, '2026-07-11': 3 },
          maxLos: { '2026-07-03': 7, '2026-07-04': 7, '2026-07-10': 7, '2026-07-11': 7 },
        },
        EXSU: {
          cta: { '2026-07-03': true, '2026-07-04': true, '2026-07-10': true, '2026-07-11': true },
          ctd: { '2026-07-05': true },
          stopSell: { '2026-07-04': true },
          minLos: { '2026-07-03': 3, '2026-07-04': 3, '2026-07-10': 3, '2026-07-11': 3 },
          maxLos: { '2026-07-03': 7, '2026-07-04': 7, '2026-07-10': 7, '2026-07-11': 7 },
        },
        PROV: {
          cta: { '2026-07-03': true, '2026-07-10': true },
          ctd: {},
          stopSell: {},
          minLos: { '2026-07-03': 2, '2026-07-04': 2, '2026-07-10': 2, '2026-07-11': 2 },
          maxLos: {},
        },
        PRES: {
          cta: {},
          ctd: {},
          stopSell: {},
          minLos: { '2026-07-03': 5, '2026-07-04': 5, '2026-07-10': 5, '2026-07-11': 5 },
          maxLos: { '2026-07-03': 14, '2026-07-04': 14, '2026-07-10': 14, '2026-07-11': 14 },
        },
      });
    }
  }, [currentPropertyId, isSurat]);

  const categories = useMemo(() => {
    if (roomTypes && roomTypes.length > 0) {
      return roomTypes.map((rt) => {
        const rtRooms = rooms.filter((r) => r.roomTypeId === rt.id);
        const keysCount = rtRooms.length > 0 ? rtRooms.length : (rt.totalUnits || 10);
        return {
          code: rt.code || rt.shortName || `RT-${rt.id}`,
          name: rt.name,
          keys: keysCount,
        };
      });
    }

    if (isSurat) {
      return [
        { code: 'DLX_KG', name: 'Deluxe King Room', keys: 30 },
        { code: 'EXE_TW', name: 'Executive Twin Room', keys: 24 },
        { code: 'TAPI_SU', name: 'Tapi River View Suite', keys: 12 },
        { code: 'PRES_SU', name: 'Presidential Suite', keys: 2 },
      ];
    }

    return [
      { code: 'DLXK', name: 'Deluxe King Room', keys: 42 },
      { code: 'EXSU', name: 'Executive Suite', keys: 18 },
      { code: 'PROV', name: 'Premier Ocean View', keys: 24 },
      { code: 'PRES', name: 'Presidential Villa', keys: 4 },
    ];
  }, [roomTypes, rooms, currentPropertyId, isSurat]);

  const handleToggleBool = (catCode: string, type: 'cta' | 'ctd' | 'stopSell', dateIso: string, dateLabel: string) => {
    setRestrictions((prev) => {
      const catData = prev[catCode] || { cta: {}, ctd: {}, stopSell: {}, minLos: {}, maxLos: {} };
      const current = catData[type];
      const nextVal = !current[dateIso];
      const updated = { ...current };

      if (nextVal) {
        updated[dateIso] = true;
      } else {
        delete updated[dateIso];
      }

      return {
        ...prev,
        [catCode]: {
          ...catData,
          [type]: updated,
        },
      };
    });
    onNotify(`Toggled ${type.toUpperCase()} for ${catCode} on ${dateLabel}.`);
  };

  const handleCycleMinLos = (catCode: string, dateIso: string, dateLabel: string) => {
    setRestrictions((prev) => {
      const catData = prev[catCode] || { cta: {}, ctd: {}, stopSell: {}, minLos: {}, maxLos: {} };
      const currentVal = catData.minLos[dateIso] || 1;
      const nextVal = currentVal >= 5 ? 1 : currentVal + 1;
      return {
        ...prev,
        [catCode]: {
          ...catData,
          minLos: {
            ...catData.minLos,
            [dateIso]: nextVal,
          },
        },
      };
    });
    onNotify(`Updated MinLOS for ${catCode} on ${dateLabel}.`);
  };

  // Timeline Navigation Handlers
  const handleJumpFirst = () => {
    setStartDate(new Date(2026, 5, 29));
    onNotify('Restrictions horizon reset to working date (29-Jun-2026)');
  };

  const handleShiftBack14 = () => {
    setStartDate((prev) => shiftDate(prev, -14));
    onNotify('Shifted timeline 14 days back');
  };

  const handleShiftBack7 = () => {
    setStartDate((prev) => shiftDate(prev, -7));
    onNotify('Shifted timeline 7 days back');
  };

  const handleShiftForward7 = () => {
    setStartDate((prev) => shiftDate(prev, 7));
    onNotify('Shifted timeline 7 days forward');
  };

  const handleShiftForward14 = () => {
    setStartDate((prev) => shiftDate(prev, 14));
    onNotify('Shifted timeline 14 days forward');
  };

  const handleSyncChannels = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onNotify('All yield restrictions transmitted successfully to Booking.com, Expedia, and GDS gateways.');
    }, 700);
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Rule Type', ...dates.map((d) => `${d.day} ${d.label}`)];
    const rows: (string | number)[][] = [];

    categories.forEach((cat) => {
      const data = restrictions[cat.code] || { cta: {}, ctd: {}, stopSell: {}, minLos: {}, maxLos: {} };

      // CTA row
      rows.push([
        cat.name,
        'Closed to Arrival (CTA)',
        ...dates.map((d) => (data.cta[d.iso] ? 'YES' : 'NO')),
      ]);

      // CTD row
      rows.push([
        cat.name,
        'Closed to Departure (CTD)',
        ...dates.map((d) => (data.ctd[d.iso] ? 'YES' : 'NO')),
      ]);

      // StopSell row
      rows.push([
        cat.name,
        'Stop Sell',
        ...dates.map((d) => (data.stopSell[d.iso] ? 'CLOSED' : 'OPEN')),
      ]);

      // MinLOS row
      rows.push([
        cat.name,
        'Min Stay (Nights)',
        ...dates.map((d) => data.minLos[d.iso] || 1),
      ]);

      // MaxLOS row
      rows.push([
        cat.name,
        'Max Stay (Nights)',
        ...dates.map((d) => data.maxLos[d.iso] || 14),
      ]);
    });

    const hotelName = currentProperty?.identity?.name?.replace(/\s+/g, '_') || 'Hotel';
    const filename = `Restrictions_${hotelName}_${formatDisplayDate(startDate).replace(/\//g, '-')}_to_${formatDisplayDate(endDate).replace(/\//g, '-')}.csv`;
    exportToCSV(filename, headers, rows);
    onNotify(`Exported Restrictions Audit to ${filename}`);
  };

  // Bulk Drawer form state
  const [bulkStartDate, setBulkStartDate] = useState<Date>(new Date(2026, 5, 29));
  const [bulkEndDate, setBulkEndDate] = useState<Date>(new Date(2026, 6, 12));
  const [bulkSelectedRooms, setBulkSelectedRooms] = useState<Record<string, boolean>>({
    DLXK: true,
    EXSU: true,
    PROV: true,
    PRES: true,
  });
  const [bulkCta, setBulkCta] = useState<'set' | 'clear' | 'none'>('set');
  const [bulkCtd, setBulkCtd] = useState<'set' | 'clear' | 'none'>('none');
  const [bulkStopSell, setBulkStopSell] = useState<'set' | 'clear' | 'none'>('none');
  const [bulkMinLos, setBulkMinLos] = useState('2');
  const [bulkMaxLos, setBulkMaxLos] = useState('14');

  const handleApplyBulkRestrictions = () => {
    const updated = { ...restrictions };
    const minLosNum = parseInt(bulkMinLos, 10);
    const maxLosNum = parseInt(bulkMaxLos, 10);

    let curr = new Date(bulkStartDate.getTime());
    const endTimestamp = bulkEndDate.getTime();

    while (curr.getTime() <= endTimestamp) {
      const dItem = generateDateItems(curr, 1)[0];

      Object.keys(bulkSelectedRooms).forEach((code) => {
        if (!bulkSelectedRooms[code]) return;
        if (!updated[code]) {
          updated[code] = { cta: {}, ctd: {}, stopSell: {}, minLos: {}, maxLos: {} };
        }

        // Apply CTA
        if (bulkCta === 'set') {
          updated[code].cta[dItem.iso] = true;
        } else if (bulkCta === 'clear') {
          delete updated[code].cta[dItem.iso];
        }

        // Apply CTD
        if (bulkCtd === 'set') {
          updated[code].ctd[dItem.iso] = true;
        } else if (bulkCtd === 'clear') {
          delete updated[code].ctd[dItem.iso];
        }

        // Apply StopSell
        if (bulkStopSell === 'set') {
          updated[code].stopSell[dItem.iso] = true;
        } else if (bulkStopSell === 'clear') {
          delete updated[code].stopSell[dItem.iso];
        }

        // Apply MinLOS
        if (!isNaN(minLosNum) && minLosNum > 0) {
          updated[code].minLos[dItem.iso] = minLosNum;
        }

        // Apply MaxLOS
        if (!isNaN(maxLosNum) && maxLosNum > 0) {
          updated[code].maxLos[dItem.iso] = maxLosNum;
        }
      });

      curr = shiftDate(curr, 1);
    }

    setRestrictions(updated);
    setIsBulkDrawerOpen(false);
    onNotify('Bulk restrictions successfully committed and queued for channel push!');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Banner */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-1 font-medium">
              <span>Channel Management</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Rate & Availability</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-800 font-bold">Restrictions</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
                Rate Restrictions & Yield Rules
              </h1>
              <span className="px-2.5 py-0.5 bg-[#d8e2ff] text-[#001a42] text-[11px] font-bold rounded uppercase tracking-wider">
                {hotelDisplayName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncChannels}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] text-[#0058be] ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Syncing...' : 'Sync All Channels'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_view</span>
              <span>Export Audit (.XLSX)</span>
            </button>
            <button
              onClick={() => setIsBulkDrawerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0058be] hover:bg-[#0048a0] text-white rounded-lg text-[13px] font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>Bulk Restrictions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full p-6 gap-6 bg-[#f8fafc]">
        {/* Left Filter Panel (280px) */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Restriction Scope
                </label>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#d8e2ff] text-[#001a42] font-bold rounded">
                  ALL CHANNELS
                </span>
              </div>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-[13px] py-2 px-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0058be]">
                  <option>ALL ACTIVE RESTRICTIONS</option>
                  <option>Closed to Arrival (CTA)</option>
                  <option>Closed to Departure (CTD)</option>
                  <option>Stop Sell (Hard Close)</option>
                  <option>Minimum Length of Stay (MinLOS)</option>
                  <option>Maximum Length of Stay (MaxLOS)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-[18px] text-slate-400">
                  expand_more
                </span>
              </div>
            </div>

            {/* Date Range with Calendar Pickers */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date Range</label>
                <span className="text-[11px] text-slate-400 font-mono">Calendar Pick</span>
              </div>
              <div className="flex flex-col gap-2">
                <DatePickerField
                  label="From:"
                  value={startDate}
                  onChange={(newDate) => {
                    setStartDate(newDate);
                    onNotify(`Start date updated to ${formatDisplayDate(newDate)}`);
                  }}
                  icon="calendar_today"
                />
                <DatePickerField
                  label="To:"
                  value={endDate}
                  onChange={(newEnd) => {
                    const diffTime = newEnd.getTime() - startDate.getTime();
                    const diffDays = Math.max(7, Math.min(60, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1));
                    setHorizonDays(diffDays);
                    onNotify(`Horizon adjusted to ${diffDays} days`);
                  }}
                  minDate={startDate}
                  icon="event"
                />
              </div>
            </div>

            {/* Day Navigation & Shifter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Day Shifter</span>
                <span className="text-[11px] text-[#0058be] font-bold">{horizonDays} Days</span>
              </div>
              <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={handleShiftBack14}
                  className="p-1 hover:bg-white rounded text-slate-600 transition-colors cursor-pointer"
                  title="Shift 14 Days Back"
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleShiftBack7}
                  className="p-1 hover:bg-white rounded text-slate-600 transition-colors cursor-pointer"
                  title="Shift 7 Days Back"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleJumpFirst}
                  className="px-2 py-0.5 bg-white text-[11px] font-bold text-slate-800 rounded border border-slate-200 shadow-2xs cursor-pointer"
                  title="Jump to Working Date (29-Jun)"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleShiftForward7}
                  className="p-1 hover:bg-white rounded text-slate-600 transition-colors cursor-pointer"
                  title="Shift 7 Days Forward"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={handleShiftForward14}
                  className="p-1 hover:bg-white rounded text-slate-600 transition-colors cursor-pointer"
                  title="Shift 14 Days Forward"
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_right</span>
                </button>
              </div>
            </div>

            {/* Horizon presets */}
            <div className="flex items-center gap-1.5">
              {[14, 30, 60].map((days) => (
                <button
                  key={days}
                  onClick={() => {
                    setHorizonDays(days);
                    onNotify(`Preset ${days} Days selected`);
                  }}
                  className={`flex-1 py-1 text-center text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                    horizonDays === days
                      ? 'bg-[#0058be] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <button
              onClick={() => onNotify('Yield restrictions filtered.')}
              className="w-full bg-[#191c1e] hover:bg-black text-white py-2 rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
              <span>Apply Yield Filter</span>
            </button>
          </div>

          {/* Quick Info Card */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-2.5 text-[12px]">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="material-symbols-outlined text-[18px] text-[#0058be]">verified_user</span>
              <span>Channel ARI Transmission</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Rules defined here are propagated in real-time to Google Hotel Ads, Expedia, Booking.com, and Central Reservation systems.
            </p>
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">CTA (Closed Arrival):</span>
                <span className="font-bold text-rose-600">Blocks Check-in</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">CTD (Closed Departure):</span>
                <span className="font-bold text-amber-600">Blocks Checkout</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Stop Sell:</span>
                <span className="font-bold text-[#ba1a1a]">Hard Closes Inventory</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Spreadsheet Grid */}
        <main className="flex-1 min-w-0 flex flex-col bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[12px] text-slate-800 font-bold">RESTRICTIONS LIVE</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-[13px] text-slate-600">
                Property: <strong className="text-slate-800 font-semibold">{hotelDisplayName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-mono text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-[#0058be]">rule</span>
              <span>Click any cell to toggle rule</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="relative overflow-x-auto overflow-y-auto max-h-[750px] select-none">
            <table className="w-full text-left border-collapse border-spacing-0 text-[13px]">
              <thead className="sticky top-0 z-30 bg-[#f1f5f9] border-b border-slate-300 shadow-2xs">
                <tr>
                  <th className="sticky left-0 z-40 bg-[#f1f5f9] px-4 py-2.5 w-[200px] min-w-[200px] text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                    Room Category
                  </th>
                  <th className="sticky left-[200px] z-40 bg-[#f1f5f9] px-3 py-2.5 w-[140px] min-w-[140px] text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 shadow-xs">
                    Policy / Rule
                  </th>

                  {dates.map((d, i) => (
                    <th
                      key={i}
                      className={`px-1 py-2 text-center w-[85px] min-w-[85px] font-mono border-r border-slate-200 ${
                        d.isPeak ? 'bg-rose-50 text-rose-800' : 'text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">{d.day}</div>
                      <div className={`font-mono text-[13px] font-bold ${d.isPeak ? 'text-[#ba1a1a]' : 'text-slate-800'}`}>
                        {d.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono">
                {categories.map((cat) => {
                  const data = restrictions[cat.code] || { cta: {}, ctd: {}, stopSell: {}, minLos: {}, maxLos: {} };

                  return (
                    <React.Fragment key={cat.code}>
                      {/* Room Header Row */}
                      <tr className="bg-slate-100/90 font-sans font-semibold">
                        <td colSpan={dates.length + 2} className="px-4 py-2 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] font-bold text-slate-900">{cat.name}</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[11px] font-mono">
                              {cat.code}
                            </span>
                            <span className="px-2 py-0.5 bg-[#d8e2ff] text-[#001a42] font-bold rounded text-[11px]">
                              {cat.keys} Keys
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Closed to Arrival (CTA) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-4 py-1.5 text-slate-700 font-sans border-r border-slate-200">
                          Closed to Arrival
                        </td>
                        <td className="sticky left-[200px] z-20 bg-white px-3 py-1.5 border-r border-slate-200 shadow-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            CTA
                          </span>
                        </td>
                        {dates.map((d, i) => {
                          const isActive = !!data.cta[d.iso];
                          return (
                            <td
                              key={i}
                              onClick={() => handleToggleBool(cat.code, 'cta', d.iso, d.label)}
                              className={`p-1 text-center cursor-pointer border-r border-slate-100 transition-colors ${
                                isActive ? 'bg-rose-100/80 hover:bg-rose-200' : 'hover:bg-slate-100'
                              }`}
                              title={`Click to toggle CTA for ${d.label}`}
                            >
                              {isActive ? (
                                <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                                  CTA
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Closed to Departure (CTD) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-4 py-1.5 text-slate-700 font-sans border-r border-slate-200">
                          Closed to Departure
                        </td>
                        <td className="sticky left-[200px] z-20 bg-white px-3 py-1.5 border-r border-slate-200 shadow-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            CTD
                          </span>
                        </td>
                        {dates.map((d, i) => {
                          const isActive = !!data.ctd[d.iso];
                          return (
                            <td
                              key={i}
                              onClick={() => handleToggleBool(cat.code, 'ctd', d.iso, d.label)}
                              className={`p-1 text-center cursor-pointer border-r border-slate-100 transition-colors ${
                                isActive ? 'bg-amber-100/80 hover:bg-amber-200' : 'hover:bg-slate-100'
                              }`}
                              title={`Click to toggle CTD for ${d.label}`}
                            >
                              {isActive ? (
                                <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">
                                  CTD
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Stop Sell */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-4 py-1.5 text-slate-700 font-sans border-r border-slate-200">
                          Stop Sell
                        </td>
                        <td className="sticky left-[200px] z-20 bg-white px-3 py-1.5 border-r border-slate-200 shadow-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#ba1a1a]">
                            STOP
                          </span>
                        </td>
                        {dates.map((d, i) => {
                          const isActive = !!data.stopSell[d.iso];
                          return (
                            <td
                              key={i}
                              onClick={() => handleToggleBool(cat.code, 'stopSell', d.iso, d.label)}
                              className={`p-1 text-center cursor-pointer border-r border-slate-100 transition-colors ${
                                isActive ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-slate-100'
                              }`}
                              title={`Click to toggle Stop Sell for ${d.label}`}
                            >
                              {isActive ? (
                                <span className="px-1.5 py-0.5 bg-[#ba1a1a] text-white rounded text-[10px] font-bold">
                                  STOP
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Min Stay (MinLOS) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-4 py-1.5 text-slate-700 font-sans border-r border-slate-200">
                          Min Stay (MinLOS)
                        </td>
                        <td className="sticky left-[200px] z-20 bg-white px-3 py-1.5 border-r border-slate-200 shadow-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#0058be]">
                            MinLOS
                          </span>
                        </td>
                        {dates.map((d, i) => {
                          const val = data.minLos[d.iso] || 1;
                          return (
                            <td
                              key={i}
                              onClick={() => handleCycleMinLos(cat.code, d.iso, d.label)}
                              className={`p-1 text-center font-bold border-r border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                                val > 1 ? 'text-[#0058be]' : 'text-slate-500'
                              }`}
                              title="Click to cycle minimum nights (1-5)"
                            >
                              {val}n
                            </td>
                          );
                        })}
                      </tr>

                      {/* Max Stay (MaxLOS) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-4 py-1.5 text-slate-700 font-sans border-r border-slate-200">
                          Max Stay (MaxLOS)
                        </td>
                        <td className="sticky left-[200px] z-20 bg-white px-3 py-1.5 border-r border-slate-200 shadow-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            MaxLOS
                          </span>
                        </td>
                        {dates.map((d, i) => {
                          const val = data.maxLos[d.iso] || 14;
                          return (
                            <td
                              key={i}
                              className={`p-1 text-center font-bold border-r border-slate-100 ${
                                val < 14 ? 'text-rose-700' : 'text-slate-400'
                              }`}
                            >
                              {val}n
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* BULK RESTRICTIONS DRAWER */}
      {isBulkDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsBulkDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto overflow-y-auto animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#0058be] uppercase tracking-wider">
                    {hotelDisplayName} • Bulk Yield
                  </span>
                  <h3 className="text-[20px] font-bold text-slate-900 mt-0.5">Bulk Restrictions Setup</h3>
                </div>
                <button
                  onClick={() => setIsBulkDrawerOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-5 flex-1">
                {/* Step 1: Date Range with Calendar Pickers */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[14px] font-bold text-slate-900 block">1. Date Range Application</span>
                  <div className="grid grid-cols-2 gap-3">
                    <DatePickerField
                      label="From:"
                      value={bulkStartDate}
                      onChange={(d) => setBulkStartDate(d)}
                    />
                    <DatePickerField
                      label="To:"
                      value={bulkEndDate}
                      onChange={(d) => setBulkEndDate(d)}
                      minDate={bulkStartDate}
                    />
                  </div>
                </div>

                {/* Step 2: Room Selection */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-slate-900">2. Target Room Categories</span>
                    <button
                      type="button"
                      onClick={() =>
                        setBulkSelectedRooms({
                          DLXK: true,
                          EXSU: true,
                          PROV: true,
                          PRES: true,
                        })
                      }
                      className="text-[11px] text-[#0058be] font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <label
                        key={c.code}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!bulkSelectedRooms[c.code]}
                          onChange={(e) =>
                            setBulkSelectedRooms((prev) => ({
                              ...prev,
                              [c.code]: e.target.checked,
                            }))
                          }
                          className="accent-[#0058be] w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="text-[13px] font-medium text-slate-800">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 3: Restriction Controls */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <span className="text-[14px] font-bold text-slate-900 block">3. Restriction Rules & Policies</span>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">Closed to Arrival (CTA)</p>
                      <p className="text-[11px] text-slate-500">Prevent check-in on designated dates</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[12px]">
                      <button
                        type="button"
                        onClick={() => setBulkCta('set')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkCta === 'set' ? 'bg-[#ba1a1a] text-white' : 'text-slate-600'
                        }`}
                      >
                        Set CTA
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkCta('clear')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkCta === 'clear' ? 'bg-slate-200 text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkCta('none')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkCta === 'none' ? 'bg-slate-200 text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        No Change
                      </button>
                    </div>
                  </div>

                  {/* CTD */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">Closed to Departure (CTD)</p>
                      <p className="text-[11px] text-slate-500">Prevent checkout on designated dates</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[12px]">
                      <button
                        type="button"
                        onClick={() => setBulkCtd('set')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkCtd === 'set' ? 'bg-amber-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        Set CTD
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkCtd('clear')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkCtd === 'clear' ? 'bg-slate-200 text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkCtd('none')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkCtd === 'none' ? 'bg-slate-200 text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        No Change
                      </button>
                    </div>
                  </div>

                  {/* Stop Sell */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">Stop Sell (Hard Close)</p>
                      <p className="text-[11px] text-slate-500">Disables room sale across all channels</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[12px]">
                      <button
                        type="button"
                        onClick={() => setBulkStopSell('set')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkStopSell === 'set' ? 'bg-red-700 text-white' : 'text-slate-600'
                        }`}
                      >
                        Hard Close
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkStopSell('clear')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkStopSell === 'clear' ? 'bg-slate-200 text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkStopSell('none')}
                        className={`px-3 py-1 rounded font-bold cursor-pointer ${
                          bulkStopSell === 'none' ? 'bg-slate-200 text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        No Change
                      </button>
                    </div>
                  </div>

                  {/* MinLOS & MaxLOS */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Min Length of Stay (MinLOS)
                      </span>
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-2">
                        <input
                          type="number"
                          value={bulkMinLos}
                          onChange={(e) => setBulkMinLos(e.target.value)}
                          className="w-full font-mono text-[13px] font-bold text-slate-800 focus:outline-none"
                        />
                        <span className="text-slate-400 text-[12px] font-medium">Nights</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Max Length of Stay (MaxLOS)
                      </span>
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-2">
                        <input
                          type="number"
                          value={bulkMaxLos}
                          onChange={(e) => setBulkMaxLos(e.target.value)}
                          className="w-full font-mono text-[13px] font-bold text-slate-800 focus:outline-none"
                        />
                        <span className="text-slate-400 text-[12px] font-medium">Nights</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsBulkDrawerOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[13px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkRestrictions}
                  className="px-6 py-2 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Push Restrictions to Channels</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
