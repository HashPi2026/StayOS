import React, { useState, useMemo, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { TaxItem } from '../types';

interface AddTaxRateViewProps {
  isEdit?: boolean;
}

export const AddTaxRateView: React.FC<AddTaxRateViewProps> = ({ isEdit = false }) => {
  const { taxes, selectedTaxId, updateTax, addTax, navigate, addToast } = useProperty();

  // Find or default the active tax being configured
  const currentTax = useMemo(() => {
    if (selectedTaxId) {
      const found = taxes.find((t) => t.id === selectedTaxId);
      if (found) return found;
    }
    return taxes.find((t) => t.name.includes('VAT')) || taxes[0] || null;
  }, [taxes, selectedTaxId]);

  const [selectedTax, setSelectedTax] = useState<TaxItem | null>(currentTax);
  const [ratePercentage, setRatePercentage] = useState('18.50');
  const [isActiveStatus, setIsActiveStatus] = useState(true);
  const [fromDate, setFromDate] = useState('2024-06-01');
  const [lastDate, setLastDate] = useState('2024-12-31');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentTax) {
      setSelectedTax(currentTax);
      if (currentTax.ratePercentage !== undefined) {
        setRatePercentage(String(currentTax.ratePercentage));
      } else if (currentTax.value !== undefined) {
        setRatePercentage(String(currentTax.value));
      } else if (currentTax.slabs?.[0]?.ratePercentage !== undefined) {
        setRatePercentage(String(currentTax.slabs[0].ratePercentage));
      }
      if (currentTax.fromDate) setFromDate(currentTax.fromDate);
      if (currentTax.lastDate) setLastDate(currentTax.lastDate);
      if (currentTax.isActive !== undefined) setIsActiveStatus(currentTax.isActive);
    }
  }, [currentTax]);

  // Existing active benchmark period for overlap simulation
  // e.g. Current rate is active from Jan 1, 2024 to Jul 15, 2024 (15.00%)
  const existingPeriod = useMemo(() => {
    return {
      rate: '15.00%',
      from: '2024-01-01',
      to: '2024-07-15',
      fromMonthIdx: 0, // Jan (0/12)
      toMonthIdx: 6.5, // Mid-July (6.5/12)
    };
  }, []);

  // Compute date range positions on timeline (0% to 100% of 2024)
  const timelinePositions = useMemo(() => {
    const parseMonthFraction = (dateStr: string) => {
      try {
        const parts = dateStr.split('-');
        if (parts.length >= 2) {
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2] || '1', 10);
          return Math.max(0, Math.min(12, month + (day - 1) / 30));
        }
      } catch (e) {
        // fallback
      }
      return 0;
    };

    const fromFraction = parseMonthFraction(fromDate);
    const toFraction = parseMonthFraction(lastDate);

    const leftPercent = Math.max(0, Math.min(100, (fromFraction / 12) * 100));
    const rightPercent = Math.max(0, Math.min(100, (toFraction / 12) * 100));
    const widthPercent = Math.max(4, rightPercent - leftPercent);

    return {
      left: `${leftPercent.toFixed(1)}%`,
      width: `${widthPercent.toFixed(1)}%`,
      fromFraction,
      toFraction,
    };
  }, [fromDate, lastDate]);

  // Check overlap with existing active period
  const hasOverlap = useMemo(() => {
    if (!fromDate || !lastDate) return false;
    // Overlap occurs if requested From Date is before existing To Date (2024-07-15)
    return fromDate <= existingPeriod.to && lastDate >= existingPeriod.from;
  }, [fromDate, lastDate, existingPeriod]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!ratePercentage || isNaN(Number(ratePercentage)) || Number(ratePercentage) < 0) {
      errs.rate = 'Please enter a valid rate percentage';
    }
    if (!fromDate) {
      errs.fromDate = 'From date is required';
    }
    if (!lastDate) {
      errs.lastDate = 'Last date is required';
    }
    if (fromDate && lastDate && fromDate > lastDate) {
      errs.lastDate = 'Last date must be after From date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numRate = parseFloat(ratePercentage) || 0;
    const taxName = selectedTax ? selectedTax.name : 'Value Added Tax (VAT)';

    if (selectedTax) {
      updateTax(selectedTax.id, {
        value: numRate,
        ratePercentage: numRate,
        fromDate,
        lastDate,
        isActive: isActiveStatus,
        slabs: [
          {
            id: `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: numRate,
            description: `${taxName} active tier (${fromDate} to ${lastDate})`,
          },
        ],
      });
      addToast(`Tax rate of ${numRate.toFixed(2)}% configured for ${taxName}`, 'success');
    } else {
      addTax({
        name: taxName,
        code: `TAX-${String(taxes.length + 1).padStart(3, '0')}`,
        taxType: 'VAT',
        ruleType: 'percentage',
        value: numRate,
        ratePercentage: numRate,
        fromDate,
        lastDate,
        applicationMethod: 'per_stay',
        calculationStrategy: 'per-stay',
        isActive: isActiveStatus,
        configsCount: 1,
        jurisdiction: 'Property Tax Authority',
        description: `Active rate configured for ${fromDate} to ${lastDate}`,
        slabs: [
          {
            id: `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: numRate,
            description: `Active rate period`,
          },
        ],
        applicableTo: 'all-rooms',
      });
      addToast(`New tax rate configured successfully`, 'success');
    }

    navigate('tax-configuration');
  };

  const taxCalculationText =
    selectedTax?.calculationStrategy === 'per-stay'
      ? 'Per Stay'
      : selectedTax?.calculationStrategy === 'per-day'
      ? 'Per Day'
      : selectedTax?.applicationMethod?.includes('stay')
      ? 'Per Stay'
      : 'Per Room, Per Night';

  const taxTypeText =
    selectedTax?.ruleType === 'fixed'
      ? 'Fixed Amount'
      : selectedTax?.taxType === 'Luxury Tax'
      ? 'Luxury Tax'
      : 'Percentage';

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] pb-16">
      <div className="flex flex-col w-full px-6 lg:px-10 py-8 max-w-5xl mx-auto space-y-6 relative">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-[#45464d] mb-1">
          <button
            onClick={() => navigate('overview')}
            className="hover:text-[#000000] transition-colors cursor-pointer"
          >
            Property
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <button
            onClick={() => navigate('tax-configuration')}
            className="hover:text-[#000000] transition-colors cursor-pointer"
          >
            Tax Configuration
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">
            {selectedTax ? selectedTax.name : 'Value Added Tax (VAT)'}
          </span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#000000] font-semibold">Add Rate</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-[30px] font-bold text-[#191c1e] tracking-tight m-0">
            Add Tax Rate
          </h1>
          <p className="text-[14px] text-[#45464d] m-0">
            Configure a new active period and percentage for this tax.
          </p>
        </div>

        {/* Parent Context Card */}
        <div className="bg-[#eceef0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 shadow-xs border border-[#c6c6cd]/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#131b2e] flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Tax Configuration
              </span>
              <div className="relative">
                <select
                  value={selectedTax?.id || ''}
                  onChange={(e) => {
                    const match = taxes.find((t) => t.id === e.target.value);
                    if (match) setSelectedTax(match);
                  }}
                  className="text-[16px] font-bold text-[#191c1e] bg-transparent border-none outline-none cursor-pointer pr-5 appearance-none focus:ring-0"
                >
                  {taxes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[16px] text-[#45464d] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-[#c6c6cd]/50 hidden sm:block" />

          <div className="flex flex-row gap-8 flex-1">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Type
              </span>
              <span className="text-[14px] text-[#191c1e] font-medium mt-0.5">
                {taxTypeText}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Calculation
              </span>
              <span className="text-[14px] text-[#191c1e] font-medium mt-0.5">
                {taxCalculationText}
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-md flex flex-col border border-[#e0e3e5] overflow-hidden">
          {/* Top Form Fields */}
          <div className="p-6 border-b border-[#e0e3e5]">
            <h2 className="text-[18px] font-bold text-[#191c1e] mb-5">
              Rate Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rate Percentage */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#191c1e]">
                  Rate Percentage <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative w-full">
                  <input
                    id="input-rate-percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={ratePercentage}
                    onChange={(e) => {
                      setRatePercentage(e.target.value);
                      if (errors.rate) setErrors((prev) => ({ ...prev, rate: '' }));
                    }}
                    placeholder="0.00"
                    className="w-full h-10 pl-4 pr-10 rounded-lg bg-white border border-[#c6c6cd] text-[14px] font-mono text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/30 focus:border-[#0058be] transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[14px] text-[#75859d]">
                    %
                  </span>
                </div>
                <span className="text-[12px] text-[#75859d] mt-0.5">
                  Enter the tax rate as a decimal (e.g., 18.00)
                </span>
                {errors.rate && (
                  <span className="text-[12px] text-[#ba1a1a] flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.rate}
                  </span>
                )}
              </div>

              {/* Active Status Toggle */}
              <div className="flex flex-col gap-1.5 justify-center md:pl-6 md:border-l border-[#e0e3e5]">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#191c1e]">
                  Status
                </label>
                <label className="flex items-center gap-3 cursor-pointer group mt-2">
                  <div className="relative">
                    <input
                      id="checkbox-rate-status"
                      type="checkbox"
                      checked={isActiveStatus}
                      onChange={(e) => setIsActiveStatus(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] rounded-full peer peer-focus:ring-2 peer-focus:ring-[#0058be]/30 peer-checked:bg-[#000000] transition-colors" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-xs" />
                  </div>
                  <span className="text-[14px] text-[#191c1e]">
                    Enable this rate for the specified period
                  </span>
                </label>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* From Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#191c1e]">
                  From Date <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px] pointer-events-none">
                    calendar_today
                  </span>
                  <input
                    id="input-from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (errors.fromDate) setErrors((prev) => ({ ...prev, fromDate: '' }));
                    }}
                    className={`w-full h-10 pl-10 pr-4 rounded-lg bg-white border text-[14px] text-[#191c1e] focus:outline-none transition-all ${
                      hasOverlap
                        ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/30'
                        : 'border-[#c6c6cd] focus:ring-2 focus:ring-[#0058be]/30 focus:border-[#0058be]'
                    }`}
                  />
                </div>
                {errors.fromDate && (
                  <span className="text-[12px] text-[#ba1a1a]">{errors.fromDate}</span>
                )}
              </div>

              {/* Last Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#191c1e]">
                  Last Date <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px] pointer-events-none">
                    calendar_today
                  </span>
                  <input
                    id="input-last-date"
                    type="date"
                    value={lastDate}
                    onChange={(e) => {
                      setLastDate(e.target.value);
                      if (errors.lastDate) setErrors((prev) => ({ ...prev, lastDate: '' }));
                    }}
                    className={`w-full h-10 pl-10 pr-4 rounded-lg bg-white border text-[14px] text-[#191c1e] focus:outline-none transition-all ${
                      hasOverlap
                        ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/30'
                        : 'border-[#c6c6cd] focus:ring-2 focus:ring-[#0058be]/30 focus:border-[#0058be]'
                    }`}
                  />
                </div>
                {errors.lastDate && (
                  <span className="text-[12px] text-[#ba1a1a]">{errors.lastDate}</span>
                )}
              </div>
            </div>
          </div>

          {/* Validation & Timeline Visuals */}
          <div className="p-6 bg-[#f2f4f6] rounded-b-xl">
            {/* Simulated Overlap Warning Banner */}
            {hasOverlap ? (
              <div className="bg-[#ffdad6]/70 border border-[#ba1a1a]/30 rounded-lg p-4 mb-6 flex items-start gap-3.5 animate-fadeIn">
                <span
                  className="material-symbols-outlined text-[#ba1a1a] mt-0.5 text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#93000a] m-0">
                    Date range overlap detected
                  </span>
                  <span className="text-[13px] text-[#93000a]/90 mt-0.5">
                    This rate overlaps with an existing active configuration for the selected dates. Please adjust the From or Last Date.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#d3e4fe]/50 border border-[#2170e4]/30 rounded-lg p-3.5 mb-6 flex items-center gap-3 animate-fadeIn">
                <span className="material-symbols-outlined text-[#0058be] text-[20px]">
                  check_circle
                </span>
                <span className="text-[13px] text-[#001a42] font-medium">
                  Date range available without conflicting overlaps.
                </span>
              </div>
            )}

            {/* Timeline Visualization */}
            <div className="flex flex-col">
              {/* Month Markers */}
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-2 px-2">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>

              {/* Timeline Track Bar */}
              <div className="relative w-full h-9 bg-[#eceef0] rounded-full overflow-hidden flex items-center px-1 border border-[#c6c6cd]/50 shadow-inner">
                {/* Base Grid Track Dividers */}
                <div className="absolute inset-0 flex justify-between px-2 w-full h-full pointer-events-none">
                  {Array.from({ length: 11 }).map((_, idx) => (
                    <div key={idx} className="w-px h-full bg-[#c6c6cd]/40 mx-auto" />
                  ))}
                </div>

                {/* Existing Active Period (Jan - Mid July) */}
                <div
                  className="absolute h-7 rounded-full bg-[#dae2fd] border border-[#000000]/10 flex items-center justify-center top-1 shadow-xs overflow-hidden z-10"
                  style={{ left: '0%', width: '54%' }}
                >
                  <span className="font-mono text-[10px] text-[#131b2e] font-semibold opacity-80 px-2 truncate">
                    Current: 15.00%
                  </span>
                </div>

                {/* New Requested Period Pill */}
                <div
                  className={`absolute h-7 rounded-full flex items-center justify-center top-1 z-20 backdrop-blur-xs transition-all duration-300 ${
                    hasOverlap
                      ? 'bg-[#ba1a1a]/15 border-2 border-[#ba1a1a] border-dashed shadow-xs'
                      : 'bg-[#2170e4]/20 border-2 border-[#0058be] shadow-xs'
                  }`}
                  style={{
                    left: timelinePositions.left,
                    width: timelinePositions.width,
                  }}
                >
                  <span
                    className={`font-mono text-[10px] font-bold px-2 truncate ${
                      hasOverlap ? 'text-[#ba1a1a]' : 'text-[#0058be]'
                    }`}
                  >
                    {hasOverlap ? `Conflict: ${ratePercentage || '0.00'}%` : `New: ${ratePercentage || '0.00'}%`}
                  </span>
                </div>
              </div>

              {/* Quarter Markers */}
              <div className="flex justify-between text-[11px] font-semibold text-[#75859d] mt-2 px-2">
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            id="btn-cancel-add-rate"
            type="button"
            onClick={() => navigate('tax-configuration')}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-[#191c1e] border border-[#c6c6cd] bg-white hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-add-rate"
            type="button"
            onClick={handleSave}
            disabled={hasOverlap}
            className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              hasOverlap
                ? 'bg-[#000000]/40 opacity-60 cursor-not-allowed'
                : 'bg-[#000000] hover:bg-[#333333] active:scale-[0.98]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Rate
          </button>
        </div>
      </div>
    </div>
  );
};
