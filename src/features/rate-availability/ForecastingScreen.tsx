import React, { useState, useMemo } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { DatePickerField } from './DatePickerField';
import {
  generateDateItems,
  shiftDate,
  DateItem,
  exportToCSV,
  formatDisplayDate,
} from './dateUtils';

interface ForecastingScreenProps {
  onNotify: (msg: string) => void;
}

interface ManifestFolio {
  id: string;
  channel: string;
  guest: string;
  ratePerNight: string;
  roomInfo: string;
  status: string;
}

export const ForecastingScreen: React.FC<ForecastingScreenProps> = ({ onNotify }) => {
  const { currentProperty } = useProperty();

  const [selectedRoomType, setSelectedRoomType] = useState('ALL');
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 5, 29));
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic Date items
  const dates = useMemo<DateItem[]>(() => {
    return generateDateItems(startDate, horizonDays);
  }, [startDate, horizonDays]);

  const endDate = useMemo<Date>(() => {
    return shiftDate(startDate, horizonDays - 1);
  }, [startDate, horizonDays]);

  // Drawer state for underlying manifest
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrilldown, setActiveDrilldown] = useState<{
    date: string;
    rev: string;
    occ: string;
    adr: string;
    sold: number;
  } | null>(null);

  // Dynamically compute forecast rows for the active horizon dates
  const forecastData = useMemo(() => {
    const totalRooms = 88;
    return dates.map((d, index) => {
      const isPeak = d.isPeak;
      // Weekday vs weekend dynamics
      const soldCY = isPeak ? 82 + (index % 4) : 68 + (index % 5);
      const soldPY = soldCY - 5;
      const avail = Math.max(1, totalRooms - soldCY - 2);
      const maint = 2;
      const stayOver = Math.round(soldCY * 0.65);
      const expIn = Math.round(soldCY * 0.35);
      const expOut = Math.round(stayOver * 0.4);
      const inhouse = soldCY;

      const adrCY = isPeak ? 385 + (d.day === 'Sat' ? 30 : 0) : 315 + (index % 3) * 10;
      const adrPY = Math.round(adrCY * 0.94);
      const revCY = soldCY * adrCY;
      const revPY = soldPY * adrPY;

      const occCY = Number(((soldCY / totalRooms) * 100).toFixed(1));
      const occPY = Number(((soldPY / totalRooms) * 100).toFixed(1));

      return {
        date: `${d.day} ${d.label}`,
        fullDate: d.display,
        isWeekend: d.isWeekend,
        isPeak,
        avail,
        total: totalRooms,
        maint,
        stayOver,
        expIn,
        expOut,
        inhouse,
        soldCY,
        soldPY,
        adrCY,
        adrPY,
        revCY,
        revPY,
        occCY,
        occPY,
      };
    });
  }, [dates]);

  // Summary KPIs based on forecast rows
  const summaryKpis = useMemo(() => {
    const totalRev = forecastData.reduce((acc, row) => acc + row.revCY, 0);
    const totalSold = forecastData.reduce((acc, row) => acc + row.soldCY, 0);
    const avgOcc = (
      forecastData.reduce((acc, row) => acc + row.occCY, 0) / forecastData.length
    ).toFixed(1);
    const avgAdr = (totalRev / (totalSold || 1)).toFixed(2);

    return {
      rev: `$${totalRev.toLocaleString()}`,
      occ: `${avgOcc}%`,
      adr: `$${avgAdr}`,
    };
  }, [forecastData]);

  // Timeline Navigation Handlers
  const handleJumpFirst = () => {
    setStartDate(new Date(2026, 5, 29));
    onNotify('Forecast horizon reset to working date (29-Jun-2026)');
  };

  const handleShiftBack7 = () => {
    setStartDate((prev) => shiftDate(prev, -7));
    onNotify('Shifted forecast 7 days back');
  };

  const handleShiftForward7 = () => {
    setStartDate((prev) => shiftDate(prev, 7));
    onNotify('Shifted forecast 7 days forward');
  };

  const handleShiftForward14 = () => {
    setStartDate((prev) => shiftDate(prev, 14));
    onNotify('Shifted forecast 14 days forward');
  };

  const handleResetFilters = () => {
    setStartDate(new Date(2026, 5, 29));
    setHorizonDays(14);
    setSelectedRoomType('ALL');
    onNotify('Forecasting filters restored to default property configuration');
  };

  const handleRefreshForecast = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify('Refreshed 14-Day Horizon forecast from active PMS database.');
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Avail Rooms',
      'Total Rooms',
      'OOO / Maint',
      'Stay Over',
      'Exp In',
      'Exp Out',
      'In-House',
      'Rev CY ($)',
      'Rev PY ($)',
      'Sold CY',
      'Sold PY',
      'Occ CY (%)',
      'Occ PY (%)',
      'ADR CY ($)',
      'ADR PY ($)',
    ];

    const rows = forecastData.map((r) => [
      r.date,
      r.avail,
      r.total,
      r.maint,
      r.stayOver,
      r.expIn,
      r.expOut,
      r.inhouse,
      r.revCY,
      r.revPY,
      r.soldCY,
      r.soldPY,
      `${r.occCY}%`,
      `${r.occPY}%`,
      r.adrCY,
      r.adrPY,
    ]);

    const hotelName = currentProperty?.identity?.name?.replace(/\s+/g, '_') || 'Hotel';
    const filename = `Forecast_${hotelName}_${formatDisplayDate(startDate).replace(/\//g, '-')}_to_${formatDisplayDate(endDate).replace(/\//g, '-')}.csv`;
    exportToCSV(filename, headers, rows);
    onNotify(`Forecasting matrix exported to ${filename}`);
  };

  const sampleFolios: ManifestFolio[] = [
    {
      id: '#BK-99214-G',
      channel: 'Direct / Corporate',
      guest: 'Victoria Sterling',
      ratePerNight: '$345.00 / night',
      roomInfo: 'Deluxe King (DLXK) — Room 412',
      status: 'Confirmed (Inhouse)',
    },
    {
      id: '#BK-99308-A',
      channel: 'Expedia OTA',
      guest: 'Ethan Caldwell',
      ratePerNight: '$310.00 / night',
      roomInfo: 'Premier Ocean View (PROV) — Room 608',
      status: 'Exp. Arrival 15:30',
    },
    {
      id: '#BK-99450-C',
      channel: 'GDS Sabre',
      guest: 'Dr. Helena Rossi',
      ratePerNight: '$420.00 / night',
      roomInfo: 'Executive Suite (EXSU) — Room 701',
      status: 'VIP Tier 1',
    },
    {
      id: '#BK-99482-D',
      channel: 'Direct Web',
      guest: 'Raymond Thorne',
      ratePerNight: '$295.00 / night',
      roomInfo: 'Deluxe King (DLXK) — Room 204',
      status: 'Guaranteed Late Checkin',
    },
  ];

  const handleOpenDrilldown = (row: typeof forecastData[0]) => {
    setActiveDrilldown({
      date: row.date,
      rev: row.revCY.toLocaleString(),
      occ: `${row.occCY}%`,
      adr: row.adrCY.toFixed(2),
      sold: row.soldCY,
    });
    setDrawerOpen(true);
  };

  const hotelDisplayName = currentProperty?.identity?.name || 'Destin Inn & Suites';

  return (
    <div className="flex flex-col w-full">
      {/* Top Banner & Header */}
      <div className="w-full bg-white border-b border-[#e2e8f0] shadow-xs px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium">
              <span>Property Operations</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Rate & Availability</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-800 font-bold">Forecasting</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
                Demand & Revenue Forecasting
              </h1>
              <span className="px-2.5 py-0.5 bg-[#d8e2ff] text-[#001a42] text-[11px] font-bold rounded uppercase tracking-wider">
                {hotelDisplayName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefreshForecast}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] text-[#0058be] ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Forecast'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_view</span>
              <span>Export Matrix (.XLSX)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0058be] hover:bg-[#0048a0] text-white text-[13px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Application Body */}
      <div className="p-6 flex flex-col lg:flex-row gap-6 w-full items-start bg-[#f8fafc]">
        {/* Left Filter Panel (Sticky 280px) */}
        <aside className="w-full lg:w-[280px] shrink-0 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 flex flex-col gap-5 sticky top-24">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-[#0058be]">tune</span>
              <h2 className="text-[14px] font-bold text-slate-900">Forecasting Filters</h2>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[12px] font-bold text-[#0058be] hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Date Window Controls with Interactive Calendar Pickers */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Date Range Horizon
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Calendar Pick</span>
            </div>
            <div className="space-y-2">
              <DatePickerField
                label="From:"
                value={startDate}
                onChange={(newDate) => {
                  setStartDate(newDate);
                  onNotify(`Forecast starting date updated to ${formatDisplayDate(newDate)}`);
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
                  onNotify(`Forecast horizon adjusted to ${diffDays} days`);
                }}
                minDate={startDate}
                icon="event"
              />
            </div>
          </div>

          {/* Timeline Navigation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Timeline Navigation
              </span>
              <span className="text-[11px] text-[#0058be] font-bold">{horizonDays} Days</span>
            </div>
            <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={handleJumpFirst}
                className="py-1 bg-white hover:bg-slate-50 text-center rounded text-[11px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                title="Jump to 29-Jun-2026"
              >
                « First
              </button>
              <button
                type="button"
                onClick={handleShiftBack7}
                className="py-1 bg-white hover:bg-slate-50 text-center rounded text-[11px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                title="Shift 7 Days Back"
              >
                ‹ Prev
              </button>
              <button
                type="button"
                onClick={handleJumpFirst}
                className="py-1 bg-[#0058be] text-white text-center rounded text-[11px] font-semibold flex items-center justify-center cursor-pointer"
                title="Return to Working Date"
              >
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              </button>
              <button
                type="button"
                onClick={handleShiftForward7}
                className="py-1 bg-white hover:bg-slate-50 text-center rounded text-[11px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                title="Shift 7 Days Forward"
              >
                Next ›
              </button>
              <button
                type="button"
                onClick={handleShiftForward14}
                className="py-1 bg-white hover:bg-slate-50 text-center rounded text-[11px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                title="Shift 14 Days Forward"
              >
                Last »
              </button>
            </div>
          </div>

          {/* Room Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Inventory Classification
            </label>
            <div className="relative">
              <select
                value={selectedRoomType}
                onChange={(e) => {
                  setSelectedRoomType(e.target.value);
                  onNotify(`Forecast filtered for ${e.target.value}`);
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-[13px] font-medium text-slate-800 px-3 py-2 pr-8 rounded-lg focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="ALL">-- ALL ROOM TYPES (88 Keys) --</option>
                <option value="DLXK">Deluxe King (DLXK - 42 Keys)</option>
                <option value="EXSU">Executive Suite (EXSU - 18 Keys)</option>
                <option value="PROV">Premier Ocean View (PROV - 24 Keys)</option>
                <option value="PRES">Presidential Suite (PRES - 4 Keys)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-slate-400 text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Rolling Horizon Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rolling Horizon</label>
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
              <button
                onClick={() => {
                  setHorizonDays(14);
                  onNotify('Horizon set to 14 Days');
                }}
                className={`py-1.5 text-[12px] font-bold text-center rounded transition-colors cursor-pointer ${
                  horizonDays === 14 ? 'bg-white text-[#0058be] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14 Days
              </button>
              <button
                onClick={() => {
                  setHorizonDays(30);
                  onNotify('Horizon set to 30 Days');
                }}
                className={`py-1.5 text-[12px] font-bold text-center rounded transition-colors cursor-pointer ${
                  horizonDays === 30 ? 'bg-white text-[#0058be] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={() => onNotify('Forecasting matrix refreshed with selected parameters.')}
              className="w-full py-2 bg-[#0058be] hover:bg-[#0048a0] text-white font-semibold text-[13px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">insights</span>
              <span>Apply Filters</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[13px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>

          {/* KPI Summary Card */}
          <div className="mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {horizonDays}-Day Summary Metrics
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#0058be] animate-ping" />
            </div>

            <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Projected Net Revenue</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[20px] font-bold text-slate-900 font-mono">{summaryKpis.rev}</span>
                <span className="text-[11px] font-bold text-[#0058be]">+11.4% YoY</span>
              </div>
            </div>

            <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Forecasted Occupancy</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[20px] font-bold text-slate-900 font-mono">{summaryKpis.occ}</span>
                <span className="text-[11px] font-bold text-[#0058be]">+3.2% YoY</span>
              </div>
            </div>

            <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Blended Projected ADR</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[20px] font-bold text-slate-900 font-mono">{summaryKpis.adr}</span>
                <span className="text-[11px] text-slate-400 font-mono">PY: $324.00</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area: Daily Operational & Financial Matrix */}
        <section className="flex-1 min-w-0 flex flex-col gap-4 w-full">
          {/* Table Header Bar & Legend */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] flex items-center justify-center text-[#0058be]">
                <span className="material-symbols-outlined text-[24px]">calendar_view_week</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-slate-900">Daily Operational & Financial Matrix</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded">
                    {hotelDisplayName} • {horizonDays} Days
                  </span>
                </div>
                <p className="text-[12px] text-slate-500">
                  Synchronized with Central Reservation Engine & Channel Allotments
                </p>
              </div>
            </div>

            {/* Color Tint Legend */}
            <div className="flex items-center gap-3 flex-wrap text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                <span className="text-slate-600">Revenue ($)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
                <span className="text-slate-600">Rooms Sold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
                <span className="text-slate-600">Occupancy %</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-100 border border-cyan-300" />
                <span className="text-slate-600">ADR ($)</span>
              </div>
            </div>
          </div>

          {/* Matrix Table Container */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-[13px] font-mono select-none">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th rowSpan={2} className="p-3 sticky left-0 z-30 bg-slate-100 min-w-[125px] border-r border-slate-200">
                      Date
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[65px] border-r border-slate-200">
                      Avail
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[65px] border-r border-slate-200">
                      Total
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[70px] border-r border-slate-200" title="Out of Order">
                      V/Maint
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[75px] border-r border-slate-200">
                      Stay Over
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[75px] border-r border-slate-200">
                      Exp In
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[75px] border-r border-slate-200">
                      Exp Out
                    </th>
                    <th rowSpan={2} className="p-3 text-right min-w-[75px] border-r border-slate-200">
                      Inhouse
                    </th>

                    {/* Revenue CY / PY */}
                    <th colSpan={2} className="p-2 text-center bg-amber-50 text-amber-900 border-r border-slate-200">
                      Room Revenue ($)
                    </th>
                    {/* Rooms Sold CY / PY */}
                    <th colSpan={2} className="p-2 text-center bg-slate-200 text-slate-800 border-r border-slate-200">
                      Rooms Sold
                    </th>
                    {/* Occ CY / PY */}
                    <th colSpan={2} className="p-2 text-center bg-rose-50 text-rose-900 border-r border-slate-200">
                      Occupancy (%)
                    </th>
                    {/* ADR CY / PY */}
                    <th colSpan={2} className="p-2 text-center bg-cyan-50 text-cyan-900">
                      ADR ($)
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-1.5 text-right bg-amber-50/50 text-amber-900 border-r border-slate-200">CY</th>
                    <th className="p-1.5 text-right bg-amber-50/20 text-slate-400 border-r border-slate-200">PY</th>
                    <th className="p-1.5 text-right bg-slate-100 text-slate-800 border-r border-slate-200">CY</th>
                    <th className="p-1.5 text-right text-slate-400 border-r border-slate-200">PY</th>
                    <th className="p-1.5 text-right bg-rose-50/50 text-rose-900 border-r border-slate-200">CY</th>
                    <th className="p-1.5 text-right bg-rose-50/20 text-slate-400 border-r border-slate-200">PY</th>
                    <th className="p-1.5 text-right bg-cyan-50/50 text-cyan-900 border-r border-slate-200">CY</th>
                    <th className="p-1.5 text-right bg-cyan-50/20 text-slate-400">PY</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {forecastData.map((row, idx) => {
                    const isPeak = row.isPeak;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleOpenDrilldown(row)}
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                          isPeak ? 'bg-rose-50/30' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                        title="Click to inspect underlying manifest folio drilldown"
                      >
                        {/* Date Cell */}
                        <td className="p-3 sticky left-0 z-20 bg-inherit font-semibold text-slate-900 border-r border-slate-200 flex items-center gap-1.5">
                          {isPeak && <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />}
                          <span className={isPeak ? 'text-[#ba1a1a] font-bold' : 'text-slate-800'}>{row.date}</span>
                        </td>

                        <td className="p-2.5 text-right font-bold text-emerald-700 border-r border-slate-100">
                          {row.avail}
                        </td>
                        <td className="p-2.5 text-right text-slate-600 border-r border-slate-100">{row.total}</td>
                        <td className="p-2.5 text-right text-amber-600 border-r border-slate-100">{row.maint}</td>
                        <td className="p-2.5 text-right text-slate-700 border-r border-slate-100">{row.stayOver}</td>
                        <td className="p-2.5 text-right text-slate-700 border-r border-slate-100">{row.expIn}</td>
                        <td className="p-2.5 text-right text-slate-700 border-r border-slate-100">{row.expOut}</td>
                        <td className="p-2.5 text-right font-semibold text-slate-800 border-r border-slate-200">
                          {row.inhouse}
                        </td>

                        {/* Revenue CY / PY */}
                        <td className="p-2.5 text-right font-bold text-amber-950 bg-amber-50/30 border-r border-slate-100">
                          ${row.revCY.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right text-slate-400 border-r border-slate-200">
                          ${row.revPY.toLocaleString()}
                        </td>

                        {/* Sold CY / PY */}
                        <td className="p-2.5 text-right font-bold text-slate-900 bg-slate-100/50 border-r border-slate-100">
                          {row.soldCY}
                        </td>
                        <td className="p-2.5 text-right text-slate-400 border-r border-slate-200">{row.soldPY}</td>

                        {/* Occ CY / PY */}
                        <td
                          className={`p-2.5 text-right font-bold border-r border-slate-100 ${
                            row.occCY >= 90
                              ? 'text-[#ba1a1a] bg-rose-100/50'
                              : 'text-slate-800 bg-rose-50/20'
                          }`}
                        >
                          {row.occCY}%
                        </td>
                        <td className="p-2.5 text-right text-slate-400 border-r border-slate-200">{row.occPY}%</td>

                        {/* ADR CY / PY */}
                        <td className="p-2.5 text-right font-bold text-cyan-950 bg-cyan-50/30 border-r border-slate-100">
                          ${row.adrCY.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right text-slate-400">${row.adrPY.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Manifest Folio Drilldown Drawer */}
      {drawerOpen && activeDrilldown && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-slate-900">Underlying Manifest Drilldown</h3>
                  <span className="text-[12px] text-slate-500 font-mono">
                    {activeDrilldown.date} • {hotelDisplayName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-4 gap-2 p-4 bg-[#f8fafc] border-b border-slate-200 text-center">
              <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Revenue</span>
                <span className="text-[14px] font-bold text-slate-900 font-mono">${activeDrilldown.rev}</span>
              </div>
              <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Rooms Sold</span>
                <span className="text-[14px] font-bold text-[#0058be] font-mono">{activeDrilldown.sold}</span>
              </div>
              <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Occupancy</span>
                <span className="text-[14px] font-bold text-rose-600 font-mono">{activeDrilldown.occ}</span>
              </div>
              <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Average ADR</span>
                <span className="text-[14px] font-bold text-slate-900 font-mono">${activeDrilldown.adr}</span>
              </div>
            </div>

            {/* Folio Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                  Sample Guest Bookings for Date
                </span>
                <span className="text-[11px] text-slate-400">Showing 4 of {activeDrilldown.sold}</span>
              </div>

              {sampleFolios.map((folio) => (
                <div
                  key={folio.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all bg-white flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] font-bold text-[#0058be]">{folio.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[12px] text-slate-500">{folio.channel}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      {folio.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] font-bold text-slate-900">{folio.guest}</span>
                    <span className="text-[13px] font-mono font-bold text-slate-800">{folio.ratePerNight}</span>
                  </div>

                  <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">meeting_room</span>
                    <span>{folio.roomInfo}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-[13px] font-medium rounded-lg border border-slate-200 cursor-pointer"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
