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

interface RateMatrixScreenProps {
  onNotify: (msg: string) => void;
}

export const RateMatrixScreen: React.FC<RateMatrixScreenProps> = ({ onNotify }) => {
  const { currentProperty, roomTypes, rooms, currentPropertyId } = useProperty();
  const isSurat = currentPropertyId === '10002' || currentPropertyId === 'STVMC_SURAT';
  const currencySymbol = currentProperty?.meta?.currencySymbol || (isSurat ? '₹' : '$');

  // Modal / Drawer states
  const [isRangeDrawerOpen, setIsRangeDrawerOpen] = useState(false);
  const [isBindingDrawerOpen, setIsBindingDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Editing state for direct spreadsheet cell edit
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Selected Rate Plan
  const [selectedRatePlan, setSelectedRatePlan] = useState('RACK');

  // Dynamic grid state: rowId -> isoDate -> price (Strictly tenant-scoped for confidentiality)
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem(`stayos_${currentPropertyId}_rate_matrix_data`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load and isolate grid state when active hotel changes (strict multi-tenant confidentiality)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`stayos_${currentPropertyId}_rate_matrix_data`);
      setMatrixData(saved ? JSON.parse(saved) : {});
    } catch {
      setMatrixData({});
    }
    setEditingKey(null);
  }, [currentPropertyId]);

  const categories = useMemo(() => {
    if (roomTypes && roomTypes.length > 0) {
      return roomTypes.map((rt) => {
        const rtRooms = rooms.filter((r) => r.roomTypeId === rt.id);
        const keysCount = rtRooms.length > 0 ? rtRooms.length : (rt.totalUnits || 10);
        const baseWk = rt.baseRate || (isSurat ? 12500 : 285);
        const basePk = Math.round(baseWk * 1.3);
        const code = rt.code || rt.shortName || `RT-${rt.id}`;

        const adultWk = Math.round(baseWk * 0.18);
        const adultPk = Math.round(basePk * 0.18);
        const childWk = Math.round(baseWk * 0.09);
        const childPk = Math.round(basePk * 0.09);

        return {
          code,
          name: rt.name,
          keys: keysCount,
          plan: `Base Plan: RACK-${code}`,
          baseRateWeekday: baseWk,
          baseRatePeak: basePk,
          rows: [
            { id: `${code}-Base`, title: `${code} • Base Tier`, tierLabel: 'Base (2)', isBase: true, defaultWk: baseWk, defaultPk: basePk },
            { id: `${code}-Adult`, title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: adultWk, defaultPk: adultPk },
            { id: `${code}-Child`, title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: childWk, defaultPk: childPk },
            { id: `${code}-Special`, title: 'Club / Special Fee', tierLabel: '+Amenity', isBase: false, defaultWk: Math.round(baseWk * 0.12), defaultPk: Math.round(basePk * 0.12) },
          ],
        };
      });
    }

    if (isSurat) {
      return [
        {
          code: 'DLX_KG',
          name: 'Deluxe King Room',
          keys: 30,
          plan: 'Base Plan: RACK-DLX',
          baseRateWeekday: 11500,
          baseRatePeak: 14500,
          rows: [
            { id: 'DLX_KG-Base', title: 'DLX_KG • Standard', tierLabel: 'Base (2)', isBase: true, defaultWk: 11500, defaultPk: 14500 },
            { id: 'DLX_KG-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 2200, defaultPk: 2800 },
            { id: 'DLX_KG-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 1200, defaultPk: 1500 },
            { id: 'DLX_KG-Breakfast', title: 'Breakfast Buffet', tierLabel: '+Meal', isBase: false, defaultWk: 950, defaultPk: 950 },
          ],
        },
        {
          code: 'EXE_TW',
          name: 'Executive Twin Room',
          keys: 24,
          plan: 'Derived: +₹2,000 from DLX_KG',
          baseRateWeekday: 13500,
          baseRatePeak: 16800,
          rows: [
            { id: 'EXE_TW-Base', title: 'EXE_TW • Base Tier', tierLabel: 'Base (2)', isBase: true, defaultWk: 13500, defaultPk: 16800 },
            { id: 'EXE_TW-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 2500, defaultPk: 3200 },
            { id: 'EXE_TW-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 1500, defaultPk: 1800 },
            { id: 'EXE_TW-Lounge', title: 'Executive Lounge Access', tierLabel: '+Lounge', isBase: false, defaultWk: 1800, defaultPk: 1800 },
          ],
        },
        {
          code: 'TAPI_SU',
          name: 'Tapi River View Suite',
          keys: 12,
          plan: 'Derived: +₹8,500 from EXE_TW',
          baseRateWeekday: 22000,
          baseRatePeak: 28000,
          rows: [
            { id: 'TAPI_SU-Base', title: 'TAPI_SU • Standard', tierLabel: 'Base (2)', isBase: true, defaultWk: 22000, defaultPk: 28000 },
            { id: 'TAPI_SU-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 3500, defaultPk: 4500 },
            { id: 'TAPI_SU-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 2000, defaultPk: 2500 },
            { id: 'TAPI_SU-Butler', title: 'Dedicated Butler Service', tierLabel: '+Butler', isBase: false, defaultWk: 2500, defaultPk: 2500 },
          ],
        },
        {
          code: 'PRES_SU',
          name: 'Presidential Suite',
          keys: 2,
          plan: 'Independent Luxury Pricing',
          baseRateWeekday: 65000,
          baseRatePeak: 85000,
          rows: [
            { id: 'PRES_SU-Base', title: 'PRES_SU • Full Suite', tierLabel: 'Base (4)', isBase: true, defaultWk: 65000, defaultPk: 85000 },
            { id: 'PRES_SU-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 7500, defaultPk: 10000 },
            { id: 'PRES_SU-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 4500, defaultPk: 6000 },
            { id: 'PRES_SU-Dining', title: 'Private Chef Dining', tierLabel: '+Chef', isBase: false, defaultWk: 6500, defaultPk: 8000 },
          ],
        },
      ];
    }

    return [
      {
        code: 'DLXK',
        name: 'Deluxe King Room',
        keys: 42,
        plan: 'Base Plan: RACK-STD',
        baseRateWeekday: 285,
        baseRatePeak: 365,
        rows: [
          { id: 'DLXK-Base', title: 'DLXK • Standard', tierLabel: 'Base (2)', isBase: true, defaultWk: 285, defaultPk: 365 },
          { id: 'DLXK-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 45, defaultPk: 55 },
          { id: 'DLXK-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 25, defaultPk: 25 },
          { id: 'DLXK-Pet', title: 'Pet Fee', tierLabel: '+Pet (1)', isBase: false, defaultWk: 35, defaultPk: 35 },
        ],
      },
      {
        code: 'EXSU',
        name: 'Executive Suite',
        keys: 18,
        plan: 'Derived: +$135 from DLXK',
        baseRateWeekday: 420,
        baseRatePeak: 540,
        rows: [
          { id: 'EXSU-Base', title: 'EXSU • Base Tier', tierLabel: 'Base (2)', isBase: true, defaultWk: 420, defaultPk: 540 },
          { id: 'EXSU-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 65, defaultPk: 75 },
          { id: 'EXSU-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 35, defaultPk: 35 },
          { id: 'EXSU-Pet', title: 'Pet Fee', tierLabel: '+Pet (1)', isBase: false, defaultWk: 50, defaultPk: 50 },
        ],
      },
      {
        code: 'PROV',
        name: 'Premier Ocean View',
        keys: 24,
        plan: 'Derived: +$75 from DLXK',
        baseRateWeekday: 360,
        baseRatePeak: 450,
        rows: [
          { id: 'PROV-Base', title: 'PROV • Standard', tierLabel: 'Base (2)', isBase: true, defaultWk: 360, defaultPk: 450 },
          { id: 'PROV-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 55, defaultPk: 65 },
          { id: 'PROV-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 30, defaultPk: 30 },
          { id: 'PROV-Pet', title: 'Pet Fee', tierLabel: '+Pet (1)', isBase: false, defaultWk: 40, defaultPk: 40 },
        ],
      },
      {
        code: 'PRES',
        name: 'Presidential Villa',
        keys: 4,
        plan: 'Independent Luxury Pricing',
        baseRateWeekday: 1250,
        baseRatePeak: 1750,
        rows: [
          { id: 'PRES-Base', title: 'PRES • Full Villa', tierLabel: 'Base (4)', isBase: true, defaultWk: 1250, defaultPk: 1750 },
          { id: 'PRES-Adult', title: 'Extra Adult', tierLabel: '+Adult (1)', isBase: false, defaultWk: 150, defaultPk: 200 },
          { id: 'PRES-Child', title: 'Extra Child', tierLabel: '+Child (1)', isBase: false, defaultWk: 75, defaultPk: 100 },
          { id: 'PRES-Pet', title: 'Pet Fee', tierLabel: '+Pet (1)', isBase: false, defaultWk: 80, defaultPk: 80 },
        ],
      },
    ];
  }, [roomTypes, rooms, currentPropertyId, isSurat]);

  // Helper to retrieve cell value
  const getCellValue = (rowId: string, d: DateItem, defaultWk: number, defaultPk: number): number => {
    if (matrixData[rowId]?.[d.iso] !== undefined) {
      return matrixData[rowId][d.iso];
    }
    return d.isPeak ? defaultPk : defaultWk;
  };

  const handleCellDblClick = (rowId: string, dateIso: string, currentVal: number) => {
    setEditingKey(`${rowId}__${dateIso}`);
    setEditValue(currentVal.toString());
  };

  const handleCommitEdit = (rowId: string, d: DateItem) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) {
      setMatrixData((prev) => {
        const next = {
          ...prev,
          [rowId]: {
            ...(prev[rowId] || {}),
            [d.iso]: num,
          },
        };
        try {
          localStorage.setItem(`stayos_${currentPropertyId}_rate_matrix_data`, JSON.stringify(next));
        } catch (e) {
          console.warn('Storage save warning:', e);
        }
        return next;
      });
      onNotify(`Rate point for ${rowId} on ${d.label} updated to ${currencySymbol}${num}. Saved confidentially for this property.`);
    }
    setEditingKey(null);
  };

  // Timeline Navigation Handlers
  const handleJumpFirst = () => {
    setStartDate(new Date(2026, 5, 29));
    onNotify('Matrix horizon reset to working date (29-Jun-2026)');
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

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify('Rate Matrix refreshed with latest PMS pricing models.');
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Row Title', 'Tier', ...dates.map((d) => `${d.day} ${d.label}`)];
    const rows: (string | number)[][] = [];

    categories.forEach((cat) => {
      cat.rows.forEach((r) => {
        rows.push([
          cat.name,
          r.title,
          r.tierLabel,
          ...dates.map((d) => getCellValue(r.id, d, r.defaultWk, r.defaultPk)),
        ]);
      });
    });

    const hotelName = currentProperty?.identity?.name?.replace(/\s+/g, '_') || 'Hotel';
    const filename = `Rate_Matrix_${hotelName}_${formatDisplayDate(startDate).replace(/\//g, '-')}_to_${formatDisplayDate(endDate).replace(/\//g, '-')}.csv`;
    exportToCSV(filename, headers, rows);
    onNotify(`Exported Rate Matrix to ${filename}`);
  };

  // Range Drawer state
  const [rangeOpType, setRangeOpType] = useState<'fixed' | 'markup' | 'markdown'>('markup');
  const [rangeVal, setRangeVal] = useState('15');
  const [rangeStartDate, setRangeStartDate] = useState<Date>(new Date(2026, 5, 29));
  const [rangeEndDate, setRangeEndDate] = useState<Date>(new Date(2026, 6, 12));
  const [rangeRoomDLXK, setRangeRoomDLXK] = useState(true);
  const [rangeRoomEXSU, setRangeRoomEXSU] = useState(true);
  const [rangeRoomPROV, setRangeRoomPROV] = useState(true);
  const [rangeRoomPRES, setRangeRoomPRES] = useState(false);

  const handleApplyRangeOperation = () => {
    const num = parseFloat(rangeVal);
    if (isNaN(num)) {
      onNotify('Please enter a valid numeric adjustment value.');
      return;
    }

    const selectedCodes: string[] = [];
    if (rangeRoomDLXK) selectedCodes.push('DLXK');
    if (rangeRoomEXSU) selectedCodes.push('EXSU');
    if (rangeRoomPROV) selectedCodes.push('PROV');
    if (rangeRoomPRES) selectedCodes.push('PRES');

    const updated = { ...matrixData };
    let modifiedCount = 0;

    let curr = new Date(rangeStartDate.getTime());
    const endTimestamp = rangeEndDate.getTime();

    while (curr.getTime() <= endTimestamp) {
      const dItem = generateDateItems(curr, 1)[0];

      categories
        .filter((cat) => selectedCodes.includes(cat.code))
        .forEach((cat) => {
          cat.rows.forEach((row) => {
            if (!updated[row.id]) updated[row.id] = {};
            const currentVal = getCellValue(row.id, dItem, row.defaultWk, row.defaultPk);

            if (rangeOpType === 'fixed') {
              updated[row.id][dItem.iso] = num;
            } else if (rangeOpType === 'markup') {
              updated[row.id][dItem.iso] = Math.round(currentVal * (1 + num / 100));
            } else if (rangeOpType === 'markdown') {
              updated[row.id][dItem.iso] = Math.max(10, Math.round(currentVal * (1 - num / 100)));
            }
            modifiedCount++;
          });
        });

      curr = shiftDate(curr, 1);
    }

    setMatrixData(updated);
    try {
      localStorage.setItem(`stayos_${currentPropertyId}_rate_matrix_data`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
    setIsRangeDrawerOpen(false);
    onNotify(`Range rate operation applied! ${modifiedCount} rate points updated and saved confidentially for this property.`);
  };

  // Binding Drawer state
  const [bindingTarget, setBindingTarget] = useState('EXSU');
  const [bindingOffset, setBindingOffset] = useState('15');

  const handleApplyBinding = () => {
    const offsetPct = parseFloat(bindingOffset) || 0;
    const sourceCat = categories.find((c) => c.code === 'DLXK')!;
    const targetCat = categories.find((c) => c.code === bindingTarget);

    if (!targetCat) return;

    const updated = { ...matrixData };
    let copyCount = 0;

    dates.forEach((d) => {
      targetCat.rows.forEach((targetRow, idx) => {
        const sourceRow = sourceCat.rows[idx];
        if (sourceRow) {
          const sourceVal = getCellValue(sourceRow.id, d, sourceRow.defaultWk, sourceRow.defaultPk);
          const computedTarget = Math.round(sourceVal * (1 + offsetPct / 100));
          if (!updated[targetRow.id]) updated[targetRow.id] = {};
          updated[targetRow.id][d.iso] = computedTarget;
          copyCount++;
        }
      });
    });

    setMatrixData(updated);
    try {
      localStorage.setItem(`stayos_${currentPropertyId}_rate_matrix_data`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
    setIsBindingDrawerOpen(false);
    onNotify(`Room Type Binding applied! ${copyCount} rate points calculated and mapped to ${targetCat.name}. Saved confidentially.`);
  };

  const hotelDisplayName = currentProperty?.identity?.name || 'Destin Inn & Suites';

  return (
    <div className="flex flex-col w-full">
      {/* Top Section Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-1 font-medium">
              <span>Yield & Inventory</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Rate & Availability</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-800 font-bold">Rate Matrix</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
                Rate Management Matrix
              </h1>
              <span className="px-2.5 py-0.5 bg-[#d8e2ff] text-[#001a42] text-[11px] font-bold rounded uppercase tracking-wider">
                {hotelDisplayName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefreshRates}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] text-[#0058be] ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Rates'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_view</span>
              <span>Export Matrix (.XLSX)</span>
            </button>
            <button
              onClick={() => setIsBindingDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0058be] rounded-lg text-[13px] font-semibold border border-blue-200 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Room Type Binding</span>
            </button>
            <button
              onClick={() => setIsRangeDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0058be] hover:bg-[#0048a0] text-white rounded-lg text-[13px] font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Range Rate Operation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace: Left Filters + Right Horizontally Scrollable Matrix */}
      <div className="flex flex-col lg:flex-row w-full p-6 gap-6 bg-[#f8fafc]">
        {/* Left Filter Panel (280px) */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rate Plan</label>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-[#d8e2ff] text-[#001a42] font-bold rounded">
                  {currentProperty?.meta?.currency || (isSurat ? 'INR' : 'USD')} ({currencySymbol})
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedRatePlan}
                  onChange={(e) => {
                    setSelectedRatePlan(e.target.value);
                    onNotify(`Rate Matrix filtered for ${e.target.value}`);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-[13px] py-2 px-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                >
                  <option value="RACK">RACK (Standard Best Available)</option>
                  <option value="BAR1">BAR1 (Flexible Non-Refundable)</option>
                  <option value="PROMO">PROMO (Summer Escape 2026)</option>
                  <option value="CORP_A">CORP_A (Global Corporate Preferential)</option>
                  <option value="GOV">GOV (Government & Diplomatic)</option>
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

            {/* Presets */}
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
              onClick={() => onNotify(`Matrix filtered for ${selectedRatePlan} across ${horizonDays} days.`)}
              className="w-full bg-[#191c1e] hover:bg-black text-white py-2 rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Apply Filters</span>
            </button>
          </div>

          {/* Quick Workflows Launcher */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Workflows</span>

            <div
              onClick={() => setIsBindingDrawerOpen(true)}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-[#0058be] text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                  <span>Room Binding</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[12px] text-slate-500 leading-tight">
                Duplicate & bind base rates across categories with % or flat $ delta.
              </p>
            </div>

            <div
              onClick={() => setIsRangeDrawerOpen(true)}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-[#0058be] text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Range Operation</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[12px] text-slate-500 leading-tight">
                Bulk adjust occupancy tiers across calendar periods in a single commit.
              </p>
            </div>
          </div>

          {/* Matrix Legend */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-2 text-[12px] text-slate-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Matrix Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#0058be]" />
              <span className="font-medium text-slate-800">Blue value:</span>
              <span className="text-slate-500">Active editable rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
              <span className="font-semibold text-rose-700">Red column:</span>
              <span className="text-slate-500">Peak & Weekend rate</span>
            </div>
            <div className="pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1 font-mono">
              <span className="font-bold text-slate-700">Shortcuts:</span>
              <span>• 2x Click cell to edit inline</span>
              <span>• Enter to save & commit</span>
              <span>• Esc to cancel</span>
            </div>
          </div>
        </aside>

        {/* Right Spreadsheet Matrix */}
        <main className="flex-1 min-w-0 flex flex-col bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0058be] animate-ping" />
                <span className="font-mono text-[12px] text-slate-800 font-bold">LIVE GRID ACTIVE</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-[13px] text-slate-600">
                Property: <strong className="text-slate-800 font-semibold">{hotelDisplayName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-mono text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-[#0058be]">cloud_done</span>
              <span>Auto-Sync</span>
              <span>•</span>
              <span className="font-bold text-slate-700">{dates.length * 16} Active Cells</span>
            </div>
          </div>

          {/* Spreadsheet Table Container */}
          <div className="relative overflow-x-auto overflow-y-auto max-h-[750px] select-none">
            <table className="w-full text-left border-collapse border-spacing-0 text-[13px]">
              <thead className="sticky top-0 z-30 bg-[#f1f5f9] border-b border-slate-300 shadow-2xs">
                <tr>
                  <th className="sticky left-0 z-40 bg-[#f1f5f9] px-4 py-2.5 w-[210px] min-w-[210px] text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                    Room Category
                  </th>
                  <th className="sticky left-[210px] z-40 bg-[#f1f5f9] px-3 py-2.5 w-[130px] min-w-[130px] text-[11px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 shadow-xs">
                    Tier / Occupancy
                  </th>

                  {dates.map((d, i) => (
                    <th
                      key={i}
                      className={`px-1 py-2 text-center w-[90px] min-w-[90px] font-mono border-r border-slate-200 ${
                        d.isPeak ? 'bg-rose-50 text-rose-800' : 'text-slate-700'
                      }`}
                    >
                      {d.isPeak ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[10px] font-bold text-[#ba1a1a] uppercase">{d.day}</span>
                          <span className="px-1 bg-[#ba1a1a] text-white font-mono text-[9px] font-bold rounded">
                            PEAK
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">{d.day}</div>
                      )}
                      <div className={`font-mono text-[13px] font-bold ${d.isPeak ? 'text-[#ba1a1a]' : 'text-slate-800'}`}>
                        {d.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono">
                {categories.map((cat) => (
                  <React.Fragment key={cat.code}>
                    {/* Category Header */}
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
                          <span className="text-slate-500 text-[12px] font-normal ml-auto">{cat.plan}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Tier Rows */}
                    {cat.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white px-4 py-1.5 text-slate-700 font-medium font-sans border-r border-slate-200">
                          {row.title}
                        </td>
                        <td className="sticky left-[210px] z-20 bg-white px-3 py-1.5 border-r border-slate-200 shadow-xs">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              row.isBase
                                ? 'bg-blue-100 text-[#0058be] font-bold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.tierLabel}
                          </span>
                        </td>

                        {dates.map((d, i) => {
                          const val = getCellValue(row.id, d, row.defaultWk, row.defaultPk);
                          const cellId = `${row.id}__${d.iso}`;
                          const isEditing = editingKey === cellId;

                          return (
                            <td
                              key={i}
                              onDoubleClick={() => handleCellDblClick(row.id, d.iso, val)}
                              className={`p-1 text-center cursor-pointer border-r border-slate-100 transition-colors ${
                                d.isPeak ? 'bg-rose-50/40 text-rose-800' : 'text-slate-800'
                              } hover:bg-blue-50`}
                              title="Double-click to edit rate"
                            >
                              {isEditing ? (
                                <div className="w-full h-8 bg-white rounded ring-2 ring-[#0058be] flex items-center px-1 shadow-xs">
                                  <input
                                    type="number"
                                    value={editValue}
                                    autoFocus
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleCommitEdit(row.id, d)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCommitEdit(row.id, d);
                                      if (e.key === 'Escape') setEditingKey(null);
                                    }}
                                    className="w-full text-center font-mono font-bold text-[#0058be] bg-transparent focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <div
                                  className={`w-full h-8 flex items-center justify-center font-bold rounded ${
                                    d.isPeak ? 'text-[#ba1a1a]' : 'text-[#0058be]'
                                  }`}
                                >
                                  {currencySymbol}{val}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* DRAWER 1: RANGE RATE OPERATION */}
      {isRangeDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsRangeDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#0058be] uppercase tracking-wider">
                    Bulk Pricing Engine • {hotelDisplayName}
                  </span>
                  <h3 className="text-[20px] font-bold text-slate-900 mt-0.5">Range Rate Operation</h3>
                </div>
                <button
                  onClick={() => setIsRangeDrawerOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1">
                {/* Step 1: Date Range with Calendar Pickers */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#191c1e] text-white text-[12px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <h4 className="text-[14px] font-bold text-slate-900">Target Calendar Period</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DatePickerField
                      label="From:"
                      value={rangeStartDate}
                      onChange={(d) => setRangeStartDate(d)}
                    />
                    <DatePickerField
                      label="To:"
                      value={rangeEndDate}
                      onChange={(d) => setRangeEndDate(d)}
                      minDate={rangeStartDate}
                    />
                  </div>
                </div>

                {/* Step 2: Room Types Selection */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#191c1e] text-white text-[12px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <h4 className="text-[14px] font-bold text-slate-900">Room Types Selection</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rangeRoomDLXK}
                        onChange={(e) => setRangeRoomDLXK(e.target.checked)}
                        className="accent-[#0058be] w-4 h-4 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">Deluxe King (DLXK)</p>
                        <p className="text-[11px] text-slate-500 font-mono">42 Keys • Base: $285</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rangeRoomEXSU}
                        onChange={(e) => setRangeRoomEXSU(e.target.checked)}
                        className="accent-[#0058be] w-4 h-4 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">Executive Suite (EXSU)</p>
                        <p className="text-[11px] text-slate-500 font-mono">18 Keys • Base: $420</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rangeRoomPROV}
                        onChange={(e) => setRangeRoomPROV(e.target.checked)}
                        className="accent-[#0058be] w-4 h-4 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">Premier Ocean View (PROV)</p>
                        <p className="text-[11px] text-slate-500 font-mono">24 Keys • Base: $360</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rangeRoomPRES}
                        onChange={(e) => setRangeRoomPRES(e.target.checked)}
                        className="accent-[#0058be] w-4 h-4 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">Presidential Villa (PRES)</p>
                        <p className="text-[11px] text-slate-500 font-mono">4 Keys • Base: $1,250</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Step 3: Operation & Adjustment Engine */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#191c1e] text-white text-[12px] font-bold flex items-center justify-center">
                        3
                      </span>
                      <h4 className="text-[14px] font-bold text-slate-900">Operation & Adjustment Engine</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRangeOpType('fixed')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        rangeOpType === 'fixed'
                          ? 'border-[#0058be] bg-blue-50 text-[#0058be] font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-[13px]">Set Fixed Rate</p>
                      <p className="text-[11px] text-slate-500 font-normal">Flat dollar target</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRangeOpType('markup')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        rangeOpType === 'markup'
                          ? 'border-[#0058be] bg-[#0058be] text-white font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-[13px]">Increase Rate (+%)</p>
                      <p className="text-[11px] text-white/80 font-normal">Markup by %</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRangeOpType('markdown')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        rangeOpType === 'markdown'
                          ? 'border-[#0058be] bg-blue-50 text-[#0058be] font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-[13px]">Decrease Rate (-%)</p>
                      <p className="text-[11px] text-slate-500 font-normal">Discount by %</p>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Adjustment Value ({rangeOpType === 'fixed' ? '$' : '%'})
                      </span>
                      <input
                        type="text"
                        value={rangeVal}
                        onChange={(e) => setRangeVal(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg font-mono font-bold text-[14px] text-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-5">
                      {['5', '10', '15', '20', '25'].map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRangeVal(btn)}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-mono text-[11px] font-bold text-slate-800 cursor-pointer"
                        >
                          {rangeOpType === 'fixed' ? `$${btn}` : `+${btn}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsRangeDrawerOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[13px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel & Return
                </button>
                <button
                  type="button"
                  onClick={handleApplyRangeOperation}
                  className="px-6 py-2 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                  <span>Apply Changes to Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 2: ROOM TYPE BINDING */}
      {isBindingDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsBindingDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#0058be] uppercase tracking-wider">
                    {hotelDisplayName} • Formula Engine
                  </span>
                  <h3 className="text-[20px] font-bold text-slate-900 mt-0.5">Room Type Binding</h3>
                </div>
                <button
                  onClick={() => setIsBindingDrawerOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1">
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[13px] text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#0058be] text-[20px] shrink-0 mt-0.5">info</span>
                  <div>
                    <strong>Rate Binding Operation:</strong> Computes the rates for the target room type using a formula offset relative to the Deluxe King (DLXK) source.
                  </div>
                </div>

                {/* Step 1: Source Room */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-900">1. Source Room Type</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Source: Copy From</span>
                  </div>
                  <div className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-[13px] font-medium text-slate-800">
                    Deluxe King Room (DLXK) — 42 Keys, Base: $285.00
                  </div>
                </div>

                {/* Step 2: Target Room */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-900">2. Target Room Type</span>
                    <span className="text-[10px] font-bold text-[#0058be] uppercase">Target: Apply To</span>
                  </div>
                  <select
                    value={bindingTarget}
                    onChange={(e) => setBindingTarget(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-[13px] font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="EXSU">Executive Suite (EXSU) — 18 Keys, Base: $420.00</option>
                    <option value="PROV">Premier Ocean View (PROV) — 24 Keys, Base: $360.00</option>
                  </select>
                </div>

                {/* Step 3: Rate Adjustment */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-900">3. Rate Adjustment</span>
                    <span className="text-[11px] font-mono text-slate-500">Percentage Offset</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
                      <span className="text-[#0058be] font-bold text-[14px] mr-1">+</span>
                      <input
                        type="text"
                        value={bindingOffset}
                        onChange={(e) => setBindingOffset(e.target.value)}
                        className="w-full font-mono font-bold text-[13px] text-slate-800 focus:outline-none"
                      />
                      <span className="text-slate-400 font-bold text-[12px]">%</span>
                    </div>
                    <span className="text-[12px] text-slate-500 font-medium">Markup over Deluxe King</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsBindingDrawerOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[13px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBinding}
                  className="px-6 py-2 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">copy_all</span>
                  <span>Apply Binding Formula</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
