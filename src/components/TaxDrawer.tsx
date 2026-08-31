import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';

export const TaxDrawer: React.FC = () => {
  const { isTaxDrawerOpen, drawerTax, closeTaxDrawer, addTax, updateTax, taxes } = useProperty();

  const [name, setName] = useState('');
  const [taxType, setTaxType] = useState('GST');
  const [calculationStrategy, setCalculationStrategy] = useState<'per-day' | 'per-stay'>('per-stay');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (drawerTax) {
      setName(drawerTax.name || '');
      setTaxType(drawerTax.taxType || 'GST');
      setCalculationStrategy(drawerTax.calculationStrategy === 'per-day' ? 'per-day' : 'per-stay');
      setIsActive(drawerTax.isActive !== false);
    } else {
      setName('');
      setTaxType('GST');
      setCalculationStrategy('per-stay');
      setIsActive(true);
    }
    setErrors({});
  }, [drawerTax, isTaxDrawerOpen]);

  if (!isTaxDrawerOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Tax name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (drawerTax) {
      updateTax(drawerTax.id, {
        name: name.trim(),
        taxType,
        calculationStrategy,
        isActive,
      });
    } else {
      const nextNum = taxes.length + 1;
      addTax({
        name: name.trim(),
        code: `TAX-${String(nextNum).padStart(3, '0')}`,
        taxType,
        calculationStrategy,
        isActive,
        ruleType: taxType === 'GST' || taxType === 'VAT' ? 'percentage' : 'fixed',
        value: taxType === 'GST' || taxType === 'VAT' ? 18 : 5,
        applicationMethod: calculationStrategy === 'per-stay' ? 'per_stay' : 'per_night',
        configsCount: 1,
        jurisdiction: 'State / Local Jurisdiction',
        description: `Standard tax applied to ${name.toLowerCase().includes('good') ? 'goods' : 'property services'}`,
        slabs: [
          {
            id: `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: taxType === 'GST' || taxType === 'VAT' ? 18 : 0,
            description: 'Standard flat rate tier',
          },
        ],
        applicableTo: 'all-rooms',
      });
    }
    closeTaxDrawer();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="drawer-overlay"
        onClick={closeTaxDrawer}
        className="fixed inset-0 bg-[#000000]/30 backdrop-blur-xs z-[60] transition-opacity duration-300 animate-fadeIn"
      />

      {/* Right Side Drawer */}
      <div
        id="tax-drawer"
        className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-[#e0e3e5] animate-slideInRight"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e0e3e5] bg-white">
          <h2 className="text-[20px] font-bold text-[#191c1e]">
            {drawerTax ? 'Edit Tax' : 'Add Tax'}
          </h2>
          <button
            id="btn-close-tax-drawer"
            onClick={closeTaxDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#eceef0] hover:bg-[#e0e3e5] text-[#45464d] transition-colors cursor-pointer"
            title="Close drawer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Drawer Content (Form) */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Tax Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
              Tax Name *
            </label>
            <input
              id="input-tax-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`w-full px-3.5 py-2.5 bg-[#eceef0] rounded-lg font-body-md text-[14px] text-[#191c1e] placeholder:text-[#76777d] outline-none transition-all ${
                errors.name
                  ? 'border border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                  : 'border border-transparent focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
              }`}
              placeholder="e.g. State Sales Tax"
              type="text"
              autoFocus
            />
            {errors.name && (
              <span className="text-[12px] text-[#ba1a1a] flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {errors.name}
              </span>
            )}
          </div>

          {/* Tax Type Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
              Tax Type
            </label>
            <div className="relative">
              <select
                id="select-tax-type"
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full px-3.5 pr-10 py-2.5 bg-[#eceef0] rounded-lg text-[14px] text-[#191c1e] appearance-none focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer border border-transparent"
              >
                <option value="GST">GST</option>
                <option value="VAT">VAT</option>
                <option value="Service Tax">Service Tax</option>
                <option value="Luxury Tax">Luxury Tax</option>
                <option value="Municipal Tax">Municipal Tax</option>
                <option value="Environmental Fee">Environmental Fee</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Calculation Strategy Segmented Control */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
              Calculation Strategy
            </label>
            <div className="flex bg-[#eceef0] rounded-lg p-1 relative border border-[#e0e3e5]">
              <button
                type="button"
                onClick={() => setCalculationStrategy('per-day')}
                className={`flex-1 py-2 text-[13px] font-semibold rounded-md transition-all cursor-pointer ${
                  calculationStrategy === 'per-day'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'bg-transparent text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                Per Day Tax
              </button>
              <button
                type="button"
                onClick={() => setCalculationStrategy('per-stay')}
                className={`flex-1 py-2 text-[13px] font-semibold rounded-md transition-all cursor-pointer ${
                  calculationStrategy === 'per-stay'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'bg-transparent text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                Per Stay Tax
              </button>
            </div>
            <p className="text-[12px] text-[#75859d] mt-1">
              Determines if the tax is applied once per booking or accumulated daily.
            </p>
          </div>

          {/* Is Active Toggle Card */}
          <div className="flex items-center justify-between p-4 bg-[#eceef0] rounded-xl border border-[#e0e3e5] mt-1">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#191c1e]">Is Active</span>
              <span className="text-[12px] text-[#75859d]">
                Make this tax available for configurations immediately.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="checkbox-is-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-[#000000]" />
            </label>
          </div>
        </form>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-[#e0e3e5] bg-white flex items-center justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)]">
          <button
            id="btn-cancel-tax"
            type="button"
            onClick={closeTaxDrawer}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-tax"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#000000] rounded-lg text-[13px] font-semibold text-white hover:bg-[#333333] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            Save Tax
          </button>
        </div>
      </div>
    </>
  );
};
