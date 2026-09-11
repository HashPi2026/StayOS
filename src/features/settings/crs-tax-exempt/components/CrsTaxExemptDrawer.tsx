import React, { useState, useEffect, useMemo } from 'react';
import { CrsTaxExemptMapping } from '@/src/types';
import { CRS_ENGINES, CRS_MARKET_SOURCES, CRS_TAX_OPTIONS } from '@/src/data/crsTaxExemptData';

interface CrsTaxExemptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    engineName: string;
    marketSource: string;
    taxName: string;
    status: 'Active' | 'Inactive';
    notes?: string;
  }) => void;
  initialData?: CrsTaxExemptMapping | null;
  existingMappings: CrsTaxExemptMapping[];
  onOpenFullPage?: () => void;
}

export const CrsTaxExemptDrawer: React.FC<CrsTaxExemptDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingMappings,
  onOpenFullPage,
}) => {
  const [engine, setEngine] = useState('');
  const [marketSource, setMarketSource] = useState('');
  const [tax, setTax] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [notes, setNotes] = useState('');

  // Reset or populate form when drawer opens/changes
  useEffect(() => {
    if (initialData) {
      setEngine(initialData.engineName);
      setMarketSource(initialData.marketSource);
      setTax(initialData.taxName);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      // Default to empty or initial values
      setEngine('');
      setMarketSource('');
      setTax('');
      setStatus('Active');
      setNotes('');
    }
  }, [initialData, isOpen]);

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col justify-between border-l border-[#eceef0] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#eceef0] flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[18px] font-bold text-[#191c1e] tracking-tight">
              {initialData ? 'Edit Mapping' : 'Add Mapping'}
            </h2>
            <p className="text-[13px] text-[#75859d] mt-0.5">
              Configure tax exemption rules.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onOpenFullPage && (
              <button
                type="button"
                onClick={onOpenFullPage}
                className="w-8 h-8 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center text-[#75859d] hover:text-[#191c1e] transition-colors"
                title="Expand to Full Page Form"
              >
                <span className="material-symbols-outlined text-[19px]">open_in_full</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center text-[#75859d] hover:text-[#191c1e] transition-colors"
              title="Close Drawer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#f7f9fb]">
          <form id="crsDrawerForm" onSubmit={handleSubmit} className="space-y-5">
            {/* Booking Engine */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Engine <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    isDuplicate ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]/40' : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/40'
                  } rounded-lg py-2.5 pl-3.5 pr-10 text-[14px] text-[#191c1e] outline-none transition-shadow cursor-pointer font-medium`}
                >
                  <option value="" disabled>Select Engine...</option>
                  {CRS_ENGINES.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#75859d] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Market Source */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Market Source <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  value={marketSource}
                  onChange={(e) => setMarketSource(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    isDuplicate ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]/40' : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/40'
                  } rounded-lg py-2.5 pl-3.5 pr-10 text-[14px] text-[#191c1e] outline-none transition-shadow cursor-pointer font-medium`}
                >
                  <option value="" disabled>Select Market Source...</option>
                  {CRS_MARKET_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#75859d] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Tax to Exempt */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Tax <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    isDuplicate
                      ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]/40'
                      : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/40'
                  } rounded-lg py-2.5 pl-3.5 pr-10 text-[14px] text-[#191c1e] outline-none transition-shadow cursor-pointer font-medium`}
                >
                  <option value="" disabled>Select Tax...</option>
                  {CRS_TAX_OPTIONS.map((taxItem) => (
                    <option key={taxItem} value={taxItem}>
                      {taxItem}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#75859d] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Duplicate Error Warning */}
              {isDuplicate && (
                <div className="flex items-center gap-1.5 mt-1 text-[#ba1a1a] animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span className="text-[12px] font-medium">
                    This combination already exists for this property.
                  </span>
                </div>
              )}
            </div>

            {/* Status Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Active')}
                  className={`py-2 px-3 rounded-lg text-[13px] font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Active'
                      ? 'bg-[#d8e2ff]/50 border-[#2170e4] text-[#004395] shadow-xs'
                      : 'bg-white border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-[#10b981]' : 'bg-[#a0a5ab]'}`} />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Inactive')}
                  className={`py-2 px-3 rounded-lg text-[13px] font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Inactive'
                      ? 'bg-[#e0e3e5] border-[#76777d] text-[#191c1e] shadow-xs'
                      : 'bg-white border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status === 'Inactive' ? 'bg-[#76777d]' : 'bg-[#a0a5ab]'}`} />
                  Inactive
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Notes / Internal Reason
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Contractual OTA exemption agreement..."
                rows={2}
                className="w-full bg-white border border-[#c6c6cd] rounded-lg p-2.5 text-[13px] text-[#191c1e] outline-none focus:border-[#0058be] transition-colors"
              />
            </div>
          </form>

          {/* Combination Preview Card (matching Screenshot 1) */}
          <div className="p-4 bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#d8e2ff]/30 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#75859d] mb-3 relative z-10">
              Combination Preview
            </h3>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[13px] text-[#191c1e] relative z-10">
              <span className="px-2.5 py-1 bg-[#f2f4f6] rounded border border-[#c6c6cd]/50 font-semibold text-[12px]">
                {engine || 'Select Engine'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#75859d]">
                arrow_forward
              </span>
              <span className="px-2.5 py-1 bg-[#f2f4f6] rounded border border-[#c6c6cd]/50 font-semibold text-[12px]">
                {marketSource || 'Select Source'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#75859d]">
                arrow_forward
              </span>
              <span
                className={`px-2.5 py-1 rounded border font-bold text-[12px] transition-colors ${
                  isDuplicate
                    ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30'
                    : tax
                    ? 'bg-[#d8e2ff]/40 text-[#004395] border-[#0058be]/20'
                    : 'bg-[#f2f4f6] text-[#75859d] border-[#c6c6cd]/50'
                }`}
              >
                {tax || 'Select Tax'}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#eceef0] bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="crsDrawerForm"
            disabled={!isValid}
            className={`px-5 py-2 rounded-lg font-semibold text-[13px] shadow-sm transition-all flex items-center gap-1.5 ${
              isValid
                ? 'bg-[#000000] text-white hover:bg-[#2d3133] active:scale-98 cursor-pointer'
                : 'bg-[#000000] text-white opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Mapping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
