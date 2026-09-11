import React, { useState, useMemo } from 'react';
import { CrsTaxExemptMapping } from '@/src/types';
import { CRS_ENGINES, CRS_MARKET_SOURCES, CRS_TAX_OPTIONS } from '@/src/data/crsTaxExemptData';

interface CrsTaxExemptFormViewProps {
  initialData?: CrsTaxExemptMapping | null;
  existingMappings: CrsTaxExemptMapping[];
  onSave: (data: {
    engineName: string;
    marketSource: string;
    taxName: string;
    status: 'Active' | 'Inactive';
    notes?: string;
  }) => void;
  onCancel: () => void;
  onSwitchToDrawer?: () => void;
}

export const CrsTaxExemptFormView: React.FC<CrsTaxExemptFormViewProps> = ({
  initialData,
  existingMappings,
  onSave,
  onCancel,
  onSwitchToDrawer,
}) => {
  const [engine, setEngine] = useState(initialData ? initialData.engineName : 'Expedia');
  const [marketSource, setMarketSource] = useState(initialData ? initialData.marketSource : 'B2B');
  const [tax, setTax] = useState(initialData ? initialData.taxName : 'City Tax');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(initialData ? initialData.status : 'Active');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Check if combination already exists
  const isDuplicate = useMemo(() => {
    if (!engine || !marketSource || !tax) return false;
    return existingMappings.some((m) => {
      if (initialData && m.id === initialData.id) return false;
      return (
        m.engineName.toLowerCase() === engine.toLowerCase() &&
        m.marketSource.toLowerCase() === marketSource.toLowerCase() &&
        m.taxName.toLowerCase() === tax.toLowerCase()
      );
    });
  }, [engine, marketSource, tax, existingMappings, initialData]);

  const isValid = Boolean(engine && marketSource && tax && !isDuplicate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      engineName: engine,
      marketSource,
      taxName: tax,
      status,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col w-full h-full p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[13px] text-[#75859d] mb-4">
        <span>Configuration</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span>Taxes</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <button
          type="button"
          onClick={onCancel}
          className="hover:text-[#191c1e] transition-colors"
        >
          CRS Tax Exempt
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-[#191c1e] font-semibold">
          {initialData ? 'Edit Exemption' : 'Add Exemption'}
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-lg border border-[#c6c6cd] hover:bg-[#f2f4f6] flex items-center justify-center text-[#45464d] transition-colors shadow-2xs"
            title="Return to Mappings List"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[26px] font-bold text-[#191c1e] tracking-tight leading-tight">
              {initialData ? 'Edit Mapping' : 'Add New Mapping'}
            </h1>
            <p className="text-[14px] text-[#45464d] mt-0.5">
              Configure a new tax exemption rule for specific booking engines and market sources.
            </p>
          </div>
        </div>

        {onSwitchToDrawer && (
          <button
            type="button"
            onClick={onSwitchToDrawer}
            className="text-[13px] text-[#0058be] hover:underline flex items-center gap-1.5 font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
            <span>Switch to Drawer View</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Validation Alert (Screenshot 2) */}
          {isDuplicate && (
            <div className="bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl p-4 flex items-start gap-3.5 animate-in slide-in-from-top-2 duration-200 shadow-2xs">
              <span className="material-symbols-outlined text-[#ba1a1a] mt-0.5 shrink-0 text-[22px]">
                error
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-[#ba1a1a] mb-1">
                  Duplicate Mapping Detected
                </h3>
                <p className="text-[13px] text-[#45464d] leading-relaxed">
                  This combination of Engine, Market Source, and Tax already exists. Please modify your selection to create a unique rule.
                </p>
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/50 overflow-hidden">
            <div className="p-6 bg-[#f7f9fb] border-b border-[#eceef0]">
              <h2 className="text-[16px] font-bold text-[#191c1e]">Exemption Criteria</h2>
              <p className="text-[13px] text-[#45464d] mt-1">
                Select the parameters that will trigger this tax exemption.
              </p>
            </div>

            <form id="crsFullForm" onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              {/* Engine Select */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Booking Engine <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className={`w-full h-12 px-4 bg-white border ${
                      isDuplicate
                        ? 'border-[#ba1a1a]/60 focus:border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                        : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                    } rounded-lg text-[14px] text-[#191c1e] appearance-none outline-none transition-all font-medium cursor-pointer`}
                  >
                    <option disabled value="">Select booking engine</option>
                    {CRS_ENGINES.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#75859d]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Market Source Select */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Market Source <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={marketSource}
                    onChange={(e) => setMarketSource(e.target.value)}
                    className={`w-full h-12 px-4 bg-white border ${
                      isDuplicate
                        ? 'border-[#ba1a1a]/60 focus:border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                        : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                    } rounded-lg text-[14px] text-[#191c1e] appearance-none outline-none transition-all font-medium cursor-pointer`}
                  >
                    <option disabled value="">Select market source</option>
                    {CRS_MARKET_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#75859d]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Tax Select */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Tax to Exempt <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className={`w-full h-12 px-4 bg-white border ${
                      isDuplicate
                        ? 'border-[#ba1a1a]/60 focus:border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                        : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                    } rounded-lg text-[14px] text-[#191c1e] appearance-none outline-none transition-all font-medium cursor-pointer`}
                  >
                    <option disabled value="">Select tax</option>
                    {CRS_TAX_OPTIONS.map((taxOption) => (
                      <option key={taxOption} value={taxOption}>
                        {taxOption}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#75859d]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#eceef0]">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                    Initial Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('Active')}
                      className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-semibold border flex items-center justify-center gap-2 transition-colors ${
                        status === 'Active'
                          ? 'bg-[#d8e2ff]/50 border-[#2170e4] text-[#004395]'
                          : 'bg-white border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-[#10b981]' : 'bg-[#a0a5ab]'}`} />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Inactive')}
                      className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-semibold border flex items-center justify-center gap-2 transition-colors ${
                        status === 'Inactive'
                          ? 'bg-[#e0e3e5] border-[#76777d] text-[#191c1e]'
                          : 'bg-white border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status === 'Inactive' ? 'bg-[#76777d]' : 'bg-[#a0a5ab]'}`} />
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                    Internal Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Seasonal corporate tax exception"
                    className="w-full h-10 px-3 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] outline-none focus:border-[#0058be]"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 px-6 bg-transparent border border-[#c6c6cd] rounded-lg font-semibold text-[14px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="crsFullForm"
              disabled={!isValid}
              className={`h-10 px-6 rounded-lg font-semibold text-[14px] shadow-sm transition-all flex items-center gap-2 ${
                isValid
                  ? 'bg-[#000000] text-white hover:bg-[#2d3133] active:scale-98 cursor-pointer'
                  : 'bg-[#000000] text-white opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Exemption</span>
            </button>
          </div>
        </div>

        {/* Rule Preview Section (matching Screenshot 2 right side) */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/50 overflow-hidden sticky top-6">
            <div className="p-5 bg-[#f7f9fb] border-b border-[#eceef0] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#0058be] text-[20px]">
                account_tree
              </span>
              <h2 className="text-[16px] font-bold text-[#191c1e]">Rule Preview</h2>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Flow Diagram */}
              <div className="w-full flex flex-col items-center gap-3 py-4">
                {/* Step 1: Engine */}
                <div className="w-full max-w-[260px] bg-white border border-[#c6c6cd] rounded-xl p-4 text-center shadow-xs relative z-10 group hover:border-[#0058be] transition-colors">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#75859d] mb-1">
                    IF BOOKING ENGINE IS
                  </div>
                  <div className="text-[16px] font-bold text-[#191c1e]">
                    {engine || 'Select Engine'}
                  </div>
                </div>

                {/* Connector 1 */}
                <div className="flex flex-col items-center -my-1 z-0">
                  <div className="w-px h-6 bg-[#c6c6cd]"></div>
                  <div className="w-6 h-6 rounded-full bg-[#f2f4f6] border border-[#c6c6cd] flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-[14px] text-[#45464d]">add</span>
                  </div>
                  <div className="w-px h-6 bg-[#c6c6cd]"></div>
                </div>

                {/* Step 2: Source */}
                <div className="w-full max-w-[260px] bg-white border border-[#c6c6cd] rounded-xl p-4 text-center shadow-xs relative z-10 group hover:border-[#0058be] transition-colors">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#75859d] mb-1">
                    AND MARKET SOURCE IS
                  </div>
                  <div className="text-[16px] font-bold text-[#191c1e]">
                    {marketSource || 'Select Source'}
                  </div>
                </div>

                {/* Connector 2 */}
                <div className="flex flex-col items-center -my-1 z-0">
                  <div className="w-px h-6 bg-[#c6c6cd]"></div>
                  <div className="w-6 h-6 rounded-full bg-[#2170e4] border border-[#2170e4]/20 flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </div>
                  <div className="w-px h-6 bg-[#0058be]/30"></div>
                </div>

                {/* Result: Tax */}
                <div
                  className={`w-full max-w-[260px] rounded-xl p-4 text-center shadow-xs relative z-10 border transition-all ${
                    isDuplicate
                      ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/40'
                      : 'bg-[#d8e2ff]/30 border-[#0058be]/30'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#75859d] mb-1">
                    THEN EXEMPT FROM
                  </div>
                  <div className="text-[16px] font-bold text-[#004395]">
                    {tax || 'Select Tax'}
                  </div>

                  {/* Conflict Badge */}
                  {isDuplicate && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-[#ffdad6] px-2.5 py-0.5 rounded-full border border-[#ba1a1a]/30 animate-in fade-in">
                      <span className="material-symbols-outlined text-[14px] text-[#ba1a1a]">warning</span>
                      <span className="text-[11px] font-bold text-[#ba1a1a]">Conflict Detected</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[13px] text-[#75859d] text-center mt-3 px-4 leading-relaxed">
                When a reservation matches both the engine and source criteria, the selected tax will not be applied to the folio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
