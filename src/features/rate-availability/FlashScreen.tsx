import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { DatePickerField } from './DatePickerField';
import {
  generateDateItems,
  shiftDate,
  DateItem,
  exportToCSV,
  formatDisplayDate,
} from './dateUtils';

interface FlashScreenProps {
  onNotify: (msg: string) => void;
}

export const FlashScreen: React.FC<FlashScreenProps> = ({ onNotify }) => {
  const { currentProperty, properties, switchProperty, roomTypes, rooms, currentPropertyId } = useProperty();
  const isSurat = currentPropertyId === '10002' || currentPropertyId === 'STVMC_SURAT';
  const currencySymbol = currentProperty?.meta?.currencySymbol || (isSurat ? '₹' : '$');

  // Active hotel selector dropdown state
  const [isPropMenuOpen, setIsPropMenuOpen] = useState(false);
  const propMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (propMenuRef.current && !propMenuRef.current.contains(e.target as Node)) {
        setIsPropMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Date horizon state - Default starts at working date 29 June 2026
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 5, 29));
  const [horizonDays, setHorizonDays] = useState<number>(14);

  // Computed consecutive dates array based on startDate and horizonDays
  const dates = useMemo<DateItem[]>(() => {
    return generateDateItems(startDate, horizonDays);
  }, [startDate, horizonDays]);

  const endDate = useMemo<Date>(() => {
    return shiftDate(startDate, horizonDays - 1);
  }, [startDate, horizonDays]);

  // Metric toggles
  const [showRate, setShowRate] = useState(true);
  const [showOccupancy, setShowOccupancy] = useState(true);
  const [showCrs, setShowCrs] = useState(true);
  const [showVmaint, setShowVmaint] = useState(true);
  const [showChart, setShowChart] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Settings & Bulk Edit Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bulk Edit Form state
  const [bulkRoomCode, setBulkRoomCode] = useState('ALL');
  const [bulkFromDate, setBulkFromDate] = useState<Date>(new Date(2026, 5, 29));
  const [bulkToDate, setBulkToDate] = useState<Date>(new Date(2026, 6, 12));
  const [bulkAction, setBulkAction] = useState<'set' | 'inc_pct' | 'dec_pct' | 'inc_flat' | 'crs_adj'>('set');
  const [bulkValue, setBulkValue] = useState('295');
  const [bulkDayFilter, setBulkDayFilter] = useState<'all' | 'weekdays' | 'weekends'>('all');

  // Editing cell state
  const [editingCell, setEditingCell] = useState<{ room: string; dateKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // User custom rate overrides: roomCode -> isoDate -> number
  const [userRates, setUserRates] = useState<Record<string, Record<string, number>>>({});
  // User custom CRS overrides: roomCode -> isoDate -> number
  const [userCrs, setUserCrs] = useState<Record<string, Record<string, number>>>({});

  // Reset override state on tenant switch (strict data isolation)
  useEffect(() => {
    setUserRates({});
    setUserCrs({});
    setEditingCell(null);
  }, [currentPropertyId]);

  // Dynamic Room definitions per tenant
  const categories = useMemo(() => {
    if (roomTypes && roomTypes.length > 0) {
      return roomTypes.map((rt) => {
        const rtRooms = rooms.filter((r) => r.roomTypeId === rt.id);
        const keysCount = rtRooms.length > 0 ? rtRooms.length : (rt.totalUnits || 10);
        const baseRate = rt.baseRate || (isSurat ? 12500 : 285);
        const peakRate = Math.round(baseRate * 1.35);
        const baseAvail = Math.max(1, Math.round(keysCount * 0.8));
        const peakAvail = Math.max(1, Math.round(keysCount * 0.4));
        return {
          code: rt.code || rt.shortName || `RT-${rt.id}`,
          name: `${rt.name} (${rt.code || rt.shortName})`,
          keys: keysCount,
          subtitle: `${rt.category || 'Standard'} • ${rt.bedType || 'King Bed'}`,
          baseRateWeekday: baseRate,
          baseRatePeak: peakRate,
          baseAvailWeekday: baseAvail,
          baseAvailPeak: peakAvail,
          baseCrsWeekday: Math.max(1, Math.round(keysCount * 0.3)),
          baseCrsPeak: Math.max(1, Math.round(keysCount * 0.15)),
          maint: 1,
        };
      });
    }

    if (isSurat) {
      return [
        {
          code: 'DLX_KG',
          name: 'Deluxe King Room (DLX_KG)',
          keys: 30,
          subtitle: 'City View • Plush King Bed',
          baseRateWeekday: 11500,
          baseRatePeak: 14500,
          baseAvailWeekday: 26,
          baseAvailPeak: 12,
          baseCrsWeekday: 10,
          baseCrsPeak: 4,
          maint: 1,
        },
        {
          code: 'EXE_TW',
          name: 'Executive Twin Room (EXE_TW)',
          keys: 24,
          subtitle: 'Executive Club Access • Twin Beds',
          baseRateWeekday: 13500,
          baseRatePeak: 16800,
          baseAvailWeekday: 20,
          baseAvailPeak: 9,
          baseCrsWeekday: 8,
          baseCrsPeak: 3,
          maint: 1,
        },
        {
          code: 'TAPI_SU',
          name: 'Tapi River View Suite (TAPI_SU)',
          keys: 12,
          subtitle: 'Panoramic Tapi River View Suite',
          baseRateWeekday: 22000,
          baseRatePeak: 28000,
          baseAvailWeekday: 10,
          baseAvailPeak: 4,
          baseCrsWeekday: 4,
          baseCrsPeak: 1,
          maint: 0,
        },
        {
          code: 'PRES_SU',
          name: 'Presidential Suite (PRES_SU)',
          keys: 2,
          subtitle: 'Signature Luxury Penthouse',
          baseRateWeekday: 65000,
          baseRatePeak: 85000,
          baseAvailWeekday: 2,
          baseAvailPeak: 1,
          baseCrsWeekday: 1,
          baseCrsPeak: 0,
          maint: 0,
        },
      ];
    }

    return [
      {
        code: 'DLXK',
        name: 'Deluxe King (DLXK)',
        keys: 42,
        subtitle: 'Max Occ: 2 Ad + 1 Ch',
        baseRateWeekday: 285,
        baseRatePeak: 385,
        baseAvailWeekday: 38,
        baseAvailPeak: 19,
        baseCrsWeekday: 15,
        baseCrsPeak: 6,
        maint: 1,
      },
      {
        code: 'EXSU',
        name: 'Executive Suite (EXSU)',
        keys: 18,
        subtitle: 'Max Occ: 3 Ad',
        baseRateWeekday: 420,
        baseRatePeak: 550,
        baseAvailWeekday: 15,
        baseAvailPeak: 6,
        baseCrsWeekday: 6,
        baseCrsPeak: 2,
        maint: 1,
      },
      {
        code: 'PROV',
        name: 'Premier Ocean View (PROV)',
        keys: 24,
        subtitle: 'Max Occ: 2 Ad',
        baseRateWeekday: 380,
        baseRatePeak: 495,
        baseAvailWeekday: 21,
        baseAvailPeak: 8,
        baseCrsWeekday: 7,
        baseCrsPeak: 3,
        maint: 1,
      },
      {
        code: 'PRES',
        name: 'Presidential Suite (PRES)',
        keys: 4,
        subtitle: 'VIP Signature Penthouse',
        baseRateWeekday: 1450,
        baseRatePeak: 1950,
        baseAvailWeekday: 3,
        baseAvailPeak: 1,
        baseCrsWeekday: 1,
        baseCrsPeak: 0,
        maint: 0,
      },
    ];
  }, [roomTypes, rooms, currentPropertyId, isSurat]);

  // Helper to get rate for a room & date
  const getRateForDate = (roomCode: string, d: DateItem): number => {
    if (userRates[roomCode]?.[d.iso] !== undefined) {
      return userRates[roomCode][d.iso];
    }
    const cat = categories.find((c) => c.code === roomCode);
    if (!cat) return 250;
    if (d.isPeak) {
      // Slight variation based on Friday vs Saturday
      return d.day === 'Sat' ? cat.baseRatePeak : cat.baseRatePeak - 20;
    }
    return cat.baseRateWeekday + ((d.date.getDate() % 3) * 10);
  };

  // Helper to get CRS for a room & date
  const getCrsForDate = (roomCode: string, d: DateItem): number => {
    if (userCrs[roomCode]?.[d.iso] !== undefined) {
      return userCrs[roomCode][d.iso];
    }
    const cat = categories.find((c) => c.code === roomCode);
    if (!cat) return 5;
    return d.isPeak ? cat.baseCrsPeak : cat.baseCrsWeekday;
  };

  // Helper to get Avail Physical
  const getPhysicalAvail = (roomCode: string, d: DateItem): number => {
    const cat = categories.find((c) => c.code === roomCode);
    if (!cat) return 10;
    if (d.isPeak) {
      return Math.max(1, cat.baseAvailPeak - (d.day === 'Sat' ? 3 : 0));
    }
    return Math.max(2, cat.baseAvailWeekday - (d.date.getDate() % 4));
  };

  // Helper to get Occupancy %
  const getOccupancy = (roomCode: string, d: DateItem): string => {
    const cat = categories.find((c) => c.code === roomCode);
    if (!cat) return '80%';
    const avail = getPhysicalAvail(roomCode, d);
    const sold = cat.keys - avail - cat.maint;
    const occ = Math.min(100, Math.max(50, Math.round((sold / cat.keys) * 100)));
    return `${occ}%`;
  };

  // Inline Rate Editing
  const handleCellDoubleClick = (room: string, dateKey: string, currentVal: number) => {
    setEditingCell({ room, dateKey });
    setEditValue(currentVal.toString());
  };

  const handleSaveRate = (room: string, dateItem: DateItem) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) {
      setUserRates((prev) => ({
        ...prev,
        [room]: {
          ...(prev[room] || {}),
          [dateItem.iso]: num,
        },
      }));
      onNotify(`BAR Rate for ${room} on ${dateItem.label} updated to ${currencySymbol}${num}. Synchronized to ARI.`);
    }
    setEditingCell(null);
  };

  // Navigation handlers
  const handleJumpFirst = () => {
    setStartDate(new Date(2026, 5, 29));
    onNotify('Returned to working date: 29-Jun-2026');
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

  const handleResetFilters = () => {
    setStartDate(new Date(2026, 5, 29));
    setHorizonDays(14);
    setShowRate(true);
    setShowOccupancy(true);
    setShowCrs(true);
    setShowVmaint(true);
    setShowChart(true);
    setShowTooltip(true);
    onNotify('Filters and dates reset to standard 14-day property horizon.');
  };

  const handleRefreshGrid = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify('Live inventory and BAR rates synced with SynXis ARI gateway.');
    }, 600);
  };

  // Export CSV
  const handleExportXLSX = () => {
    const headers = ['Room Category', 'Total Keys', 'Metric', ...dates.map((d) => `${d.day} ${d.label}`)];
    const rows: (string | number)[][] = [];

    categories.forEach((cat) => {
      // Row 1: Physical Avail
      rows.push([cat.name, cat.keys, 'Avail Physical', ...dates.map((d) => getPhysicalAvail(cat.code, d))]);
      // Row 2: CRS Allocation
      rows.push([cat.name, cat.keys, 'CRS Allocation', ...dates.map((d) => getCrsForDate(cat.code, d))]);
      // Row 3: BAR Rate
      rows.push([cat.name, cat.keys, `BAR Rate (${currencySymbol})`, ...dates.map((d) => `${currencySymbol}${getRateForDate(cat.code, d)}`)]);
      // Row 4: Maintenance
      rows.push([cat.name, cat.keys, 'Maintenance (OOO)', ...dates.map(() => cat.maint)]);
      // Row 5: Occupancy
      rows.push([cat.name, cat.keys, 'Occupancy %', ...dates.map((d) => getOccupancy(cat.code, d))]);
    });

    const hotelName = currentProperty?.identity?.name?.replace(/\s+/g, '_') || 'Hotel';
    const filename = `Flash_Rates_${hotelName}_${formatDisplayDate(startDate).replace(/\//g, '-')}_to_${formatDisplayDate(endDate).replace(/\//g, '-')}.csv`;
    exportToCSV(filename, headers, rows);
    onNotify(`Exported Flash Grid to ${filename}`);
  };

  // Apply Bulk Quick Edit
  const handleApplyBulkEdit = () => {
    const fromTime = bulkFromDate.getTime();
    const toTime = bulkToDate.getTime();
    const targetCats = bulkRoomCode === 'ALL' ? categories : categories.filter((c) => c.code === bulkRoomCode);
    const numVal = parseFloat(bulkValue);

    if (isNaN(numVal)) {
      onNotify('Please enter a valid numeric adjustment value.');
      return;
    }

    const updatedUserRates = { ...userRates };
    const updatedUserCrs = { ...userCrs };

    targetCats.forEach((cat) => {
      if (!updatedUserRates[cat.code]) updatedUserRates[cat.code] = {};
      if (!updatedUserCrs[cat.code]) updatedUserCrs[cat.code] = {};

      // Loop through dates
      let curr = new Date(fromTime);
      while (curr.getTime() <= toTime) {
        const dItem = generateDateItems(curr, 1)[0];
        const isMatchDay =
          bulkDayFilter === 'all' ||
          (bulkDayFilter === 'weekdays' && !dItem.isWeekend) ||
          (bulkDayFilter === 'weekends' && dItem.isWeekend);

        if (isMatchDay) {
          const currentRate = getRateForDate(cat.code, dItem);
          const currentCrsVal = getCrsForDate(cat.code, dItem);

          if (bulkAction === 'set') {
            updatedUserRates[cat.code][dItem.iso] = numVal;
          } else if (bulkAction === 'inc_pct') {
            updatedUserRates[cat.code][dItem.iso] = Math.round(currentRate * (1 + numVal / 100));
          } else if (bulkAction === 'dec_pct') {
            updatedUserRates[cat.code][dItem.iso] = Math.max(50, Math.round(currentRate * (1 - numVal / 100)));
          } else if (bulkAction === 'inc_flat') {
            updatedUserRates[cat.code][dItem.iso] = currentRate + numVal;
          } else if (bulkAction === 'crs_adj') {
            updatedUserCrs[cat.code][dItem.iso] = Math.max(0, currentCrsVal + numVal);
          }
        }
        curr = shiftDate(curr, 1);
      }
    });

    setUserRates(updatedUserRates);
    setUserCrs(updatedUserCrs);
    setIsBulkEditOpen(false);
    onNotify(`Bulk Quick-Edit applied successfully across ${targetCats.length} room categories.`);
  };

  // Stacked chart data dynamically computed from dates
  const chartBars = useMemo(() => {
    return dates.map((d) => {
      let totalKeys = 0;
      let totalAvail = 0;
      let totalMaint = 0;

      categories.forEach((cat) => {
        totalKeys += cat.keys;
        totalAvail += getPhysicalAvail(cat.code, d);
        totalMaint += cat.maint;
      });

      const totalSold = totalKeys - totalAvail - totalMaint;
      const occPct = Math.min(100, Math.max(0, Math.round((totalSold / totalKeys) * 100)));
      const availPct = Math.min(100, Math.max(0, Math.round((totalAvail / totalKeys) * 100)));
      const maintPct = Math.min(100, Math.max(0, Math.round((totalMaint / totalKeys) * 100)));

      return {
        label: d.label,
        day: d.day,
        occ: occPct,
        avail: availPct,
        maint: maintPct,
        isPeak: d.isPeak,
      };
    });
  }, [dates, userRates]);

  const hotelDisplayName = currentProperty?.identity?.name || 'Destin Inn & Suites';

  return (
    <div className="flex flex-col w-full">
      {/* Top Operational Context Bar */}
      <div className="flex flex-col gap-3 p-6 bg-white border-b border-[#e2e8f0]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Property Selector */}
            <div className="relative" ref={propMenuRef}>
              <button
                type="button"
                onClick={() => setIsPropMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f5f9] hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer border border-slate-200"
                title="Switch Property Context"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0058be]">domain</span>
                <span className="text-[14px] font-semibold text-slate-800">
                  {hotelDisplayName}
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-500">arrow_drop_down</span>
              </button>

              {isPropMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Property
                  </div>
                  {properties.map((p) => {
                    const isSelected = p.id === currentProperty?.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchProperty(p.id);
                          setIsPropMenuOpen(false);
                          onNotify(`Switched active hotel to ${p.identity?.name}`);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-[13px] hover:bg-slate-50 cursor-pointer ${
                          isSelected ? 'bg-blue-50/80 text-[#0058be] font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{p.identity?.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {p.location?.city || 'Location'} • {p.meta?.code || p.identity?.clientId || 'DIS'}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-[#0058be]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Working Date Display */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-slate-600 text-[12px] border border-slate-200">
              <span className="font-semibold text-[#0058be]">Working Date</span>
              <span className="font-mono font-semibold text-slate-800">29-Jun-2026</span>
              <span className="px-1.5 py-0.5 bg-[#d8e2ff] text-[#001a42] text-[10px] font-bold rounded">OPEN</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-600">
              <span>Property Pace: <strong className="text-[#0058be]">78.4%</strong></span>
              <span className="text-slate-300">|</span>
              <span>ADR: <strong className="text-slate-800">{currencySymbol}{isSurat ? '14,250' : '342'}</strong></span>
              <span className="text-slate-300">|</span>
              <span>RevPAR: <strong className="text-slate-800">{currencySymbol}{isSurat ? '11,180' : '268'}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshGrid}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-medium rounded transition-colors cursor-pointer"
                title="Refresh Live Grid"
              >
                <span className={`material-symbols-outlined text-[16px] text-[#0058be] ${isRefreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isRefreshing ? 'Syncing...' : 'Refresh Grid'}</span>
              </button>

              <button
                onClick={() => setIsBulkEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-medium rounded transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-600">edit_calendar</span>
                <span>Bulk Quick-Edit</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-medium rounded shadow-xs transition-colors cursor-pointer"
                title="Configure Flash View Settings"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Settings</span>
              </button>

              <button
                onClick={() => setShowLegend((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[13px] transition-colors cursor-pointer ${
                  showLegend ? 'bg-slate-200 text-slate-900 font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Toggle legend bar"
              >
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Legend</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Pane Body */}
      <div className="flex flex-col lg:flex-row w-full gap-0 min-h-[calc(100vh-180px)]">
        {/* Left Filter Panel (260px) */}
        <aside className="w-full lg:w-[270px] shrink-0 bg-white border-r border-[#e2e8f0] p-4 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#0058be]">tune</span>
              <span className="text-[14px] font-bold text-slate-900">Flash Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[12px] text-[#0058be] hover:underline font-semibold cursor-pointer"
              title="Reset to 29-Jun working date standard horizon"
            >
              Reset
            </button>
          </div>

          {/* Date Range Selection (Interactive Calendar Pickers) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date Range</span>
              <span className="text-[11px] text-slate-400 font-mono">Click to pick</span>
            </div>
            <div className="flex flex-col gap-2">
              <DatePickerField
                label="From:"
                value={startDate}
                onChange={(newStart) => {
                  setStartDate(newStart);
                  onNotify(`Start date updated to ${formatDisplayDate(newStart)}`);
                }}
                icon="calendar_today"
              />
              <DatePickerField
                label="To:"
                value={endDate}
                onChange={(newEnd) => {
                  const diffTime = newEnd.getTime() - startDate.getTime();
                  const diffDays = Math.max(7, Math.min(30, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1));
                  setHorizonDays(diffDays);
                  onNotify(`Horizon adjusted to ${diffDays} days (ending ${formatDisplayDate(newEnd)})`);
                }}
                minDate={startDate}
                icon="event"
              />
            </div>
          </div>

          {/* Day Navigation & Horizon Shifters */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Day Shifter</span>
              <span className="text-[11px] text-[#0058be] font-bold">{horizonDays} Days</span>
            </div>

            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={handleShiftBack14}
                className="p-1 hover:bg-white rounded text-slate-700 hover:text-[#0058be] transition-colors cursor-pointer"
                title="Shift 14 Days Back (««)"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
              </button>
              <button
                type="button"
                onClick={handleShiftBack7}
                className="p-1 hover:bg-white rounded text-slate-700 hover:text-[#0058be] transition-colors cursor-pointer"
                title="Shift 7 Days Back (‹)"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <button
                type="button"
                onClick={handleJumpFirst}
                className="px-2 py-0.5 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-800 rounded border border-slate-200 cursor-pointer shadow-2xs"
                title="Return to Working Date (29-Jun)"
              >
                Today
              </button>

              <button
                type="button"
                onClick={handleShiftForward7}
                className="p-1 hover:bg-white rounded text-slate-700 hover:text-[#0058be] transition-colors cursor-pointer"
                title="Shift 7 Days Forward (›)"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
              <button
                type="button"
                onClick={handleShiftForward14}
                className="p-1 hover:bg-white rounded text-slate-700 hover:text-[#0058be] transition-colors cursor-pointer"
                title="Shift 14 Days Forward (»»)"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
              </button>
            </div>

            {/* Quick Horizon Presets */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[7, 14, 21].map((days) => (
                <button
                  key={days}
                  onClick={() => {
                    setHorizonDays(days);
                    onNotify(`Horizon switched to ${days} days`);
                  }}
                  className={`py-1 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
                    horizonDays === days
                      ? 'bg-[#0058be] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Display Metrics Toggles */}
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Display Metrics</span>
            <div className="flex flex-col gap-1 text-[13px]">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#0058be]" />
                  Show Rate (BAR)
                </span>
                <input
                  type="checkbox"
                  checked={showRate}
                  onChange={(e) => setShowRate(e.target.checked)}
                  className="accent-[#0058be] rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Show Occupancy %
                </span>
                <input
                  type="checkbox"
                  checked={showOccupancy}
                  onChange={(e) => setShowOccupancy(e.target.checked)}
                  className="accent-[#0058be] rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Show CRS Inventory
                </span>
                <input
                  type="checkbox"
                  checked={showCrs}
                  onChange={(e) => setShowCrs(e.target.checked)}
                  className="accent-[#0058be] rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  Show V/Maint Room
                </span>
                <input
                  type="checkbox"
                  checked={showVmaint}
                  onChange={(e) => setShowVmaint(e.target.checked)}
                  className="accent-[#0058be] rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">bar_chart</span>
                  Show Distribution Chart
                </span>
                <input
                  type="checkbox"
                  checked={showChart}
                  onChange={(e) => setShowChart(e.target.checked)}
                  className="accent-[#0058be] rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">quick_reference_all</span>
                  Hover Tooltip Inspector
                </span>
                <input
                  type="checkbox"
                  checked={showTooltip}
                  onChange={(e) => setShowTooltip(e.target.checked)}
                  className="accent-[#0058be] rounded w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNotify('Filters applied to Flash Grid.')}
              className="w-full py-2 px-3 bg-[#0058be] hover:bg-[#0048a0] text-white rounded-lg text-[13px] font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
              <span>Apply Filters</span>
            </button>
            <button
              onClick={handleExportXLSX}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export .XLSX</span>
            </button>
          </div>

          {/* Pace Overview Card */}
          <div className="mt-auto bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pace Overview</span>
              <span className="font-mono text-[11px] font-bold text-[#0058be]">88 Keys</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#0058be] h-full rounded-full" style={{ width: '78.4%' }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex flex-col bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Sellable</span>
                <span className="font-mono text-[13px] font-bold text-slate-800">85 / 88</span>
              </div>
              <div className="flex flex-col bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">OOO / Maint</span>
                <span className="font-mono text-[13px] font-bold text-[#ba1a1a]">3 Rooms</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Grid Area */}
        <main className="flex-1 min-w-0 flex flex-col bg-[#f8fafc] p-6 gap-6 overflow-hidden">
          {/* Main Grid Card */}
          <div className="w-full bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col overflow-hidden">
            {/* Legend Bar */}
            {showLegend && (
              <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-50 border-b border-[#e2e8f0] text-[12px] text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="font-bold uppercase text-[11px] text-slate-400">Grid Color Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-white border border-slate-300" />
                    <span>Weekday</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                    <span className="font-semibold text-rose-700">Peak / Weekend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#d8e2ff] border border-blue-200" />
                    <span>CRS Allocation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
                    <span>Maintenance (OOO)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Double-click BAR Rate to edit inline</span>
                </div>
              </div>
            )}

            {/* Horizontally & Vertically Scrollable Grid */}
            <div className="overflow-x-auto overflow-y-auto max-h-[640px] select-none">
              <table className="w-full border-collapse text-left text-[13px] min-w-[1240px]">
                <thead className="sticky top-0 z-30 bg-[#f1f5f9] border-b border-[#cbd5e1] shadow-2xs">
                  <tr>
                    {/* Frozen Sticky Col 1 */}
                    <th className="sticky left-0 z-40 bg-[#f1f5f9] min-w-[210px] w-[210px] p-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                      ROOM TYPE / METRIC
                    </th>
                    {/* Frozen Sticky Col 2 */}
                    <th className="sticky left-[210px] z-40 bg-[#f1f5f9] min-w-[75px] w-[75px] p-2.5 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                      TOTAL
                    </th>

                    {/* Dynamic Date Columns */}
                    {dates.map((d, i) => (
                      <th
                        key={i}
                        className={`min-w-[76px] p-2 text-center font-mono border-r border-slate-200/60 ${
                          d.isPeak ? 'bg-rose-50 text-rose-800 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {d.isPeak && (
                          <div className="text-[10px] font-bold text-[#ba1a1a] uppercase leading-none mb-0.5">
                            Peak
                          </div>
                        )}
                        <div className={`text-[11px] ${d.isPeak ? 'text-[#ba1a1a]' : 'text-slate-500'}`}>
                          {d.day}
                        </div>
                        <div className={`text-[13px] font-bold ${d.isPeak ? 'text-[#ba1a1a]' : 'text-slate-800'}`}>
                          {d.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <React.Fragment key={cat.code}>
                      {/* Category Header Row */}
                      <tr className="bg-slate-100/80 font-semibold text-slate-800">
                        <td colSpan={dates.length + 2} className="px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-[#0058be]">hotel</span>
                              <span className="font-bold text-[14px]">{cat.name}</span>
                              <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 font-mono text-[11px] rounded">
                                {cat.keys} Keys
                              </span>
                            </div>
                            <div className="text-[12px] font-normal text-slate-500">{cat.subtitle}</div>
                          </div>
                        </td>
                      </tr>

                      {/* Physical Avail Row */}
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-3 py-1.5 font-medium text-slate-700 border-r border-slate-200">
                          Avail Physical
                        </td>
                        <td className="sticky left-[210px] z-20 bg-white text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                          {cat.keys}
                        </td>
                        {dates.map((d, i) => {
                          const val = getPhysicalAvail(cat.code, d);
                          return (
                            <td
                              key={i}
                              className={`p-1.5 text-center font-mono border-r border-slate-100 ${
                                d.isPeak ? 'bg-rose-50/50 text-[#ba1a1a] font-bold' : 'text-slate-700'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>

                      {/* CRS Allocation Row */}
                      {showCrs && (
                        <tr className="hover:bg-slate-50/70 transition-colors text-[12px]">
                          <td className="sticky left-0 z-20 bg-white px-3 py-1.5 text-slate-500 border-r border-slate-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]" />
                              CRS Allocation
                            </span>
                            <span className="text-[10px] text-slate-400">OTA/GDS</span>
                          </td>
                          <td className="sticky left-[210px] z-20 bg-white text-center font-mono text-[#0058be] font-bold border-r border-slate-200">
                            {getCrsForDate(cat.code, dates[0])}
                          </td>
                          {dates.map((d, i) => {
                            const val = getCrsForDate(cat.code, d);
                            return (
                              <td
                                key={i}
                                className={`p-1.5 text-center font-mono text-[#0058be] border-r border-slate-100 ${
                                  d.isPeak ? 'bg-rose-50/30 font-semibold' : ''
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      )}

                      {/* BAR Rate Row (Double-click to edit inline) */}
                      {showRate && (
                        <tr className="hover:bg-blue-50/40 transition-colors">
                          <td className="sticky left-0 z-20 bg-white px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px] text-[#0058be]">sell</span>
                              BAR Rate ({currencySymbol})
                            </span>
                            <span className="px-1.5 py-0.2 bg-blue-100 text-[#0058be] text-[10px] font-bold rounded">
                              LIVE
                            </span>
                          </td>
                          <td className="sticky left-[210px] z-20 bg-white text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                            {currencySymbol}{getRateForDate(cat.code, dates[0])}
                          </td>
                          {dates.map((d, i) => {
                            const currentRate = getRateForDate(cat.code, d);
                            const isEditing = editingCell?.room === cat.code && editingCell?.dateKey === d.iso;
                            return (
                              <td
                                key={i}
                                onDoubleClick={() => handleCellDoubleClick(cat.code, d.iso, currentRate)}
                                className={`p-1.5 text-center font-mono border-r border-slate-100 cursor-pointer select-text transition-colors ${
                                  d.isPeak ? 'bg-rose-50/60 font-bold text-[#ba1a1a]' : 'text-slate-800'
                                } ${isEditing ? 'bg-yellow-100 ring-2 ring-[#0058be]' : 'hover:bg-yellow-50'}`}
                                title={showTooltip ? `Double-click to edit BAR rate for ${cat.code} on ${d.label}` : undefined}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-1 justify-center">
                                    <input
                                      type="number"
                                      autoFocus
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveRate(cat.code, d);
                                        if (e.key === 'Escape') setEditingCell(null);
                                      }}
                                      onBlur={() => handleSaveRate(cat.code, d)}
                                      className="w-16 px-1 py-0.5 text-center text-[12px] font-bold bg-white border border-[#0058be] rounded shadow-xs focus:outline-none"
                                    />
                                  </div>
                                ) : (
                                  <span>{currencySymbol}{currentRate}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      )}

                      {/* Maintenance / OOO */}
                      {showVmaint && (
                        <tr className="hover:bg-slate-50/70 transition-colors text-[12px]">
                          <td className="sticky left-0 z-20 bg-white px-3 py-1 text-slate-400 border-r border-slate-200 flex items-center justify-between">
                            <span>V / Maint (OOO)</span>
                            <span className="material-symbols-outlined text-[14px] text-amber-500">build</span>
                          </td>
                          <td className="sticky left-[210px] z-20 bg-white text-center font-mono text-slate-500 border-r border-slate-200">
                            {cat.maint}
                          </td>
                          {dates.map((d, i) => (
                            <td
                              key={i}
                              className={`p-1 text-center font-mono text-slate-400 border-r border-slate-100 ${
                                cat.maint > 0 ? 'text-amber-700 font-medium' : ''
                              }`}
                            >
                              {cat.maint}
                            </td>
                          ))}
                        </tr>
                      )}

                      {/* Occupancy % */}
                      {showOccupancy && (
                        <tr className="hover:bg-slate-50/70 transition-colors text-[12px] border-b border-slate-200">
                          <td className="sticky left-0 z-20 bg-white px-3 py-1 text-slate-500 border-r border-slate-200">
                            Occupancy %
                          </td>
                          <td className="sticky left-[210px] z-20 bg-white text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                            {getOccupancy(cat.code, dates[0])}
                          </td>
                          {dates.map((d, i) => {
                            const occ = getOccupancy(cat.code, d);
                            return (
                              <td
                                key={i}
                                className={`p-1 text-center font-mono font-semibold border-r border-slate-100 ${
                                  d.isPeak ? 'text-[#ba1a1a] bg-rose-50/30' : 'text-[#0058be]'
                                }`}
                              >
                                {occ}
                              </td>
                            );
                          })}
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>

                {/* Footer Totals Row */}
                <tfoot className="sticky bottom-0 z-30 bg-slate-100 border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td className="sticky left-0 z-40 bg-slate-100 px-3 py-2 text-slate-900 border-r border-slate-300">
                      TOTAL AVAIL ROOMS
                    </td>
                    <td className="sticky left-[210px] z-40 bg-slate-100 text-center font-mono text-[#0058be] text-[14px] border-r border-slate-300">
                      88
                    </td>
                    {dates.map((d, i) => {
                      const totalAvail = categories.reduce((sum, cat) => sum + getPhysicalAvail(cat.code, d), 0);
                      return (
                        <td
                          key={i}
                          className={`p-2 text-center font-mono border-r border-slate-200 ${
                            d.isPeak ? 'text-[#ba1a1a] bg-rose-100/50' : 'text-slate-900'
                          }`}
                        >
                          {totalAvail}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Stacked Distribution Chart */}
          {showChart && (
            <section className="w-full bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0058be]">bar_chart</span>
                  <h3 className="text-[15px] font-bold text-slate-900">
                    Occupancy & Inventory Distribution Overview
                  </h3>
                  <span className="text-[12px] text-slate-500">
                    ({formatDisplayDate(startDate)} to {formatDisplayDate(endDate)})
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#0058be]" />
                    <span className="text-slate-700">Occupied Keys (Weekday)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#ba1a1a]" />
                    <span className="text-slate-700">Occupied Keys (Peak)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#adc6ff]" />
                    <span className="text-slate-700">Available Keys</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-amber-500" />
                    <span className="text-slate-700">Maintenance / OOO</span>
                  </div>
                </div>
              </div>

              {/* Visual Stacked Distribution */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[840px] h-48 flex items-end justify-between gap-2 pt-4 px-2">
                  {chartBars.map((bar, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                      title={`${bar.label}: ${bar.occ}% Occupied, ${bar.avail}% Available, ${bar.maint}% Maint`}
                    >
                      <div className="w-full max-w-[36px] flex flex-col items-center gap-0.5 h-36 justify-end">
                        {bar.maint > 0 && (
                          <div
                            className="w-full bg-amber-500 rounded-t-xs transition-all duration-200"
                            style={{ height: `${bar.maint}%` }}
                          />
                        )}
                        <div
                          className="w-full bg-[#adc6ff] transition-all duration-200"
                          style={{ height: `${bar.avail}%` }}
                        />
                        <div
                          className={`w-full rounded-b-xs transition-all duration-200 ${
                            bar.isPeak ? 'bg-[#ba1a1a]' : 'bg-[#0058be]'
                          }`}
                          style={{ height: `${bar.occ}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono text-[10px] ${
                          bar.isPeak ? 'font-bold text-[#ba1a1a]' : 'text-slate-500'
                        }`}
                      >
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* BULK QUICK EDIT MODAL */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
                  <span className="material-symbols-outlined text-[22px]">edit_calendar</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-slate-900">Bulk Quick-Edit Rates & Allocation</h3>
                  <p className="text-[12px] text-slate-500">{hotelDisplayName} • ARI Update Window</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkEditOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold uppercase text-slate-600 block mb-1">Target Room Category</label>
                <select
                  value={bulkRoomCode}
                  onChange={(e) => setBulkRoomCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-[13px] font-medium text-slate-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                >
                  <option value="ALL">-- ALL ROOM CATEGORIES --</option>
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.keys} Keys)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range with Calendar Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold uppercase text-slate-600 block mb-1">From Date</label>
                  <DatePickerField
                    label="From:"
                    value={bulkFromDate}
                    onChange={(d) => setBulkFromDate(d)}
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold uppercase text-slate-600 block mb-1">To Date</label>
                  <DatePickerField
                    label="To:"
                    value={bulkToDate}
                    onChange={(d) => setBulkToDate(d)}
                    minDate={bulkFromDate}
                  />
                </div>
              </div>

              {/* Day Filter */}
              <div>
                <label className="text-[12px] font-bold uppercase text-slate-600 block mb-1">Day of Week Filter</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkDayFilter('all')}
                    className={`py-1.5 text-[12px] font-semibold rounded-lg border transition-colors ${
                      bulkDayFilter === 'all'
                        ? 'bg-[#0058be] text-white border-[#0058be]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDayFilter('weekdays')}
                    className={`py-1.5 text-[12px] font-semibold rounded-lg border transition-colors ${
                      bulkDayFilter === 'weekdays'
                        ? 'bg-[#0058be] text-white border-[#0058be]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Mon - Thu
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDayFilter('weekends')}
                    className={`py-1.5 text-[12px] font-semibold rounded-lg border transition-colors ${
                      bulkDayFilter === 'weekends'
                        ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Fri - Sun (Peak)
                  </button>
                </div>
              </div>

              {/* Action Operation & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold uppercase text-slate-600 block mb-1">Operation</label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-[13px] font-medium text-slate-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  >
                    <option value="set">Set Fixed BAR Rate ($)</option>
                    <option value="inc_pct">Increase BAR Rate by (%)</option>
                    <option value="dec_pct">Decrease BAR Rate by (%)</option>
                    <option value="inc_flat">Increase Flat ($)</option>
                    <option value="crs_adj">Adjust CRS Allocation (Keys)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold uppercase text-slate-600 block mb-1">Adjustment Value</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <span className="text-[13px] text-slate-400 mr-1 font-mono">
                      {bulkAction === 'set' || bulkAction === 'inc_flat' ? '$' : bulkAction.includes('pct') ? '%' : '#'}
                    </span>
                    <input
                      type="number"
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                      className="bg-transparent font-mono text-[14px] font-bold text-slate-900 w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkEditOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-[13px] font-medium rounded-lg border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkEdit}
                className="px-5 py-2 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Apply Updates to Grid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLASH VIEW SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
                  <span className="material-symbols-outlined text-[22px]">tune</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Flash View Settings</h3>
                  <p className="text-[12px] text-slate-500 font-mono">
                    {hotelDisplayName} • Single Property Scope
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#0058be] text-[20px] shrink-0 mt-0.5">info</span>
                <div className="text-[13px] text-slate-700 leading-relaxed">
                  <strong>Display Preference Architecture:</strong> Controls which metrics and calculation charts are visible on the Flash grid. Changes are updated in real-time.
                </div>
              </div>

              {/* Metric Visibility Preferences */}
              <section className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold text-slate-900">Metric Visibility Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer">
                    <div className="flex flex-col gap-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Rate (BAR)</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#0058be] text-[10px] font-bold">Primary</span>
                      </div>
                      <span className="text-[12px] text-slate-500">
                        Display active Best Available Rate baseline row for each category.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showRate}
                      onChange={(e) => setShowRate(e.target.checked)}
                      className="accent-[#0058be] w-5 h-5 rounded mt-1 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer">
                    <div className="flex flex-col gap-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-slate-800">Show Occupancy %</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#0058be] text-[10px] font-bold">KPI</span>
                      </div>
                      <span className="text-[12px] text-slate-500">
                        Render calculated daily occupancy percentages per room category.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showOccupancy}
                      onChange={(e) => setShowOccupancy(e.target.checked)}
                      className="accent-[#0058be] w-5 h-5 rounded mt-1 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer">
                    <div className="flex flex-col gap-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-slate-800">Show CRS Inventory</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Allotment</span>
                      </div>
                      <span className="text-[12px] text-slate-500">
                        Central reservation system key counts versus direct PMS allotment.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showCrs}
                      onChange={(e) => setShowCrs(e.target.checked)}
                      className="accent-[#0058be] w-5 h-5 rounded mt-1 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer">
                    <div className="flex flex-col gap-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-slate-800">Show V/Maint Room</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">OOO</span>
                      </div>
                      <span className="text-[12px] text-slate-500">
                        Surface Out of Order and maintenance hold room tallies.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showVmaint}
                      onChange={(e) => setShowVmaint(e.target.checked)}
                      className="accent-[#0058be] w-5 h-5 rounded mt-1 cursor-pointer"
                    />
                  </label>
                </div>
              </section>

              {/* Interactive & Visual Controls */}
              <section className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold text-slate-900">Interactive & Visual Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer">
                    <div className="flex flex-col gap-1 pr-3">
                      <span className="text-[13px] font-bold text-slate-800">Show Distribution Chart</span>
                      <span className="text-[12px] text-slate-500">
                        Render the stacked bar chart below the date grid for occupied vs available keys.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showChart}
                      onChange={(e) => setShowChart(e.target.checked)}
                      className="accent-[#0058be] w-5 h-5 rounded mt-1 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer">
                    <div className="flex flex-col gap-1 pr-3">
                      <span className="text-[13px] font-bold text-slate-800">Hover Tooltip Inspector</span>
                      <span className="text-[12px] text-slate-500">
                        Enable detailed multi-metric hover popovers when lingering over cells.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showTooltip}
                      onChange={(e) => setShowTooltip(e.target.checked)}
                      className="accent-[#0058be] w-5 h-5 rounded mt-1 cursor-pointer"
                    />
                  </label>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[12px] text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0058be]">lock</span>
                Applied live across Front Desk & Revenue views.
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setShowRate(true);
                    setShowOccupancy(true);
                    setShowCrs(true);
                    setShowVmaint(true);
                    setShowChart(true);
                    setShowTooltip(true);
                    onNotify('Reset to default visibility settings.');
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-[13px] font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    onNotify('Flash view display preferences saved successfully.');
                  }}
                  className="px-5 py-2 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
