import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { TaxSlab } from '../types';

export const TaxConfigDrawer: React.FC = () => {
  const { isTaxConfigDrawerOpen, configTargetTax, closeTaxConfigDrawer, updateTax, roomTypes } = useProperty();

  const [slabs, setSlabs] = useState<TaxSlab[]>([]);
  const [applicableTo, setApplicableTo] = useState<'all-rooms' | 'specific-rooms' | 'food-beverage' | 'all-services'>('all-rooms');
  const [effectiveDate, setEffectiveDate] = useState('Jan 01, 2024');
  const [newFromAmount, setNewFromAmount] = useState<number>(0);
  const [newToAmount, setNewToAmount] = useState<string>('');
  const [newRate, setNewRate] = useState<number>(12);
  const [newDesc, setNewDesc] = useState<string>('');
  const [isAddingSlab, setIsAddingSlab] = useState(false);

  useEffect(() => {
    if (configTargetTax) {
      setSlabs(
        configTargetTax.slabs || [
          {
            id: `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: 10,
            description: 'Standard flat rate',
          },
        ]
      );
      setApplicableTo(configTargetTax.applicableTo || 'all-rooms');
      setEffectiveDate(configTargetTax.effectiveDate || 'Jan 01, 2024');
      setIsAddingSlab(false);
    }
  }, [configTargetTax, isTaxConfigDrawerOpen]);

  if (!isTaxConfigDrawerOpen || !configTargetTax) return null;

  const handleAddSlab = () => {
    const toVal = newToAmount.trim() === '' ? null : parseFloat(newToAmount);
    const newSlab: TaxSlab = {
      id: `sl-${Date.now()}`,
      fromAmount: newFromAmount || 0,
      toAmount: toVal,
      ratePercentage: newRate || 0,
      description: newDesc.trim() || 'Rate Slab Tier',
    };
    setSlabs([...slabs, newSlab]);
    setNewFromAmount(toVal !== null ? toVal + 1 : 0);
    setNewToAmount('');
    setNewRate(12);
    setNewDesc('');
    setIsAddingSlab(false);
  };

  const handleRemoveSlab = (slabId: string) => {
    setSlabs(slabs.filter((s) => s.id !== slabId));
  };

  const handleSaveConfig = () => {
    updateTax(configTargetTax.id, {
      slabs,
      configsCount: slabs.length,
      applicableTo,
      effectiveDate,
    });
    closeTaxConfigDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn"
        onClick={closeTaxConfigDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[560px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slideInRight border-l border-[#e0e3e5]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e0e3e5] bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#dae2fd] text-[#0058be] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#191c1e]">
                  {configTargetTax.name}
                </h2>
                <p className="text-[12px] text-[#75859d]">
                  Rate tiers, slab thresholds, and applicability settings
                </p>
              </div>
            </div>
            <button
              onClick={closeTaxConfigDrawer}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#eceef0] hover:bg-[#e0e3e5] text-[#45464d] transition-colors cursor-pointer"
              title="Close drawer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
            {/* Quick Summary Card */}
            <div className="p-4 bg-[#f2f4f6] rounded-xl border border-[#c6c6cd]/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">
                  Tax Type & Strategy
                </span>
                <div className="text-[14px] font-semibold text-[#191c1e] mt-0.5">
                  {configTargetTax.taxType} •{' '}
                  {configTargetTax.calculationStrategy === 'per-day' ? 'Per Day' : 'Per Stay'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">
                  Jurisdiction
                </span>
                <div className="text-[14px] font-semibold text-[#191c1e] mt-0.5">
                  {configTargetTax.jurisdiction || 'General'}
                </div>
              </div>
            </div>

            {/* Slabs / Rate Tiers Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#191c1e]">Tax Rate Slabs & Tiers</h3>
                  <p className="text-[12px] text-[#75859d]">
                    Define rate percentages based on room price thresholds
                  </p>
                </div>
                {!isAddingSlab && (
                  <button
                    type="button"
                    onClick={() => setIsAddingSlab(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0058be] text-white text-[12px] font-semibold rounded-lg hover:bg-[#004395] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Slab
                  </button>
                )}
              </div>

              {/* Slabs List Table */}
              <div className="bg-white rounded-xl border border-[#e0e3e5] overflow-hidden">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#f2f4f6] border-b border-[#e0e3e5] text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                      <th className="px-4 py-2.5">Price Range ($)</th>
                      <th className="px-4 py-2.5">Rate (%)</th>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e3e5]">
                    {slabs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-[#75859d]">
                          No rate slabs defined. Click "Add Slab" to configure rate percentages.
                        </td>
                      </tr>
                    ) : (
                      slabs.map((slab) => (
                        <tr key={slab.id} className="hover:bg-[#f7f9fb]">
                          <td className="px-4 py-3 font-mono font-medium text-[#191c1e]">
                            ${slab.fromAmount} – {slab.toAmount !== null ? `$${slab.toAmount}` : 'Above'}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#0058be]">
                            {slab.ratePercentage}%
                          </td>
                          <td className="px-4 py-3 text-[#45464d] text-[12px]">
                            {slab.description || '--'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveSlab(slab.id)}
                              className="text-[#75859d] hover:text-[#ba1a1a] p-1 rounded transition-colors cursor-pointer"
                              title="Remove slab"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Slab Inline Form */}
              {isAddingSlab && (
                <div className="p-4 bg-[#f2f4f6] rounded-xl border border-[#c6c6cd]/60 flex flex-col gap-3 animate-fadeIn">
                  <div className="text-[13px] font-bold text-[#191c1e]">New Slab Tier</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-[#45464d] block mb-1">
                        From Amount ($)
                      </label>
                      <input
                        type="number"
                        value={newFromAmount}
                        onChange={(e) => setNewFromAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] outline-none font-mono"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-[#45464d] block mb-1">
                        To Amount ($)
                      </label>
                      <input
                        type="number"
                        value={newToAmount}
                        onChange={(e) => setNewToAmount(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] outline-none font-mono"
                        placeholder="Leave empty for Above"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-[#45464d] block mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={newRate}
                        onChange={(e) => setNewRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] outline-none font-mono"
                        placeholder="12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#45464d] block mb-1">
                      Slab Remarks
                    </label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] outline-none"
                      placeholder="e.g. Standard luxury suite slab"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingSlab(false)}
                      className="px-3 py-1.5 text-[12px] font-semibold text-[#45464d] hover:bg-[#e0e3e5] rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSlab}
                      className="px-4 py-1.5 text-[12px] font-semibold bg-[#000000] text-white rounded-lg hover:bg-[#333333] cursor-pointer"
                    >
                      Save Slab
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Applicability Settings */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
                Applicability Scope
              </label>
              <select
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#eceef0] rounded-lg text-[13px] text-[#191c1e] outline-none border border-transparent focus:border-[#0058be] transition-all cursor-pointer"
              >
                <option value="all-rooms">All Room Types & Suites ({roomTypes.length} types)</option>
                <option value="specific-rooms">Select Room Categories Only</option>
                <option value="food-beverage">Food & Beverage Services Only</option>
                <option value="all-services">All Property Services & Accommodations</option>
              </select>
            </div>

            {/* Effective Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
                Effective Date
              </label>
              <input
                type="text"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                placeholder="e.g. Jan 01, 2024"
                className="w-full px-3.5 py-2.5 bg-[#eceef0] rounded-lg text-[13px] text-[#191c1e] outline-none border border-transparent focus:border-[#0058be] transition-all font-mono"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 flex items-center justify-end gap-3 bg-white border-t border-[#e0e3e5]">
            <button
              type="button"
              onClick={closeTaxConfigDrawer}
              className="px-4 py-2 bg-transparent text-[#191c1e] font-semibold text-[13px] rounded-lg hover:bg-[#eceef0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-5 py-2 bg-[#000000] text-white font-semibold text-[13px] rounded-lg hover:bg-[#333333] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
