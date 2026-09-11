import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const TaxRuleDrawer: React.FC = () => {
  const {
    isTaxRuleDrawerOpen,
    drawerTaxRule,
    closeTaxRuleDrawer,
    addTax,
    updateTax,
    taxes,
  } = useProperty();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [taxType, setTaxType] = useState('percentage'); // 'percentage' | 'fixed'
  const [value, setValue] = useState<number | string>('');
  const [applicationMethod, setApplicationMethod] = useState('per_night');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (drawerTaxRule) {
      setName(drawerTaxRule.name || '');
      setCode(drawerTaxRule.code || `TAX-00${drawerTaxRule.id.replace(/\D/g, '') || '1'}`);
      setTaxType(
        drawerTaxRule.ruleType ||
          (drawerTaxRule.taxType === 'VAT' ||
          drawerTaxRule.taxType === 'GST' ||
          drawerTaxRule.taxType === 'Environmental Fee'
            ? 'percentage'
            : 'fixed')
      );
      setValue(
        drawerTaxRule.value !== undefined
          ? drawerTaxRule.value
          : drawerTaxRule.slabs?.[0]?.ratePercentage || 0
      );
      setApplicationMethod(
        drawerTaxRule.applicationMethod ||
          (drawerTaxRule.calculationStrategy === 'per-stay' ? 'per_stay' : 'per_night')
      );
      setIsActive(drawerTaxRule.isActive !== false);
    } else {
      setName('');
      const nextNum = taxes.length + 1;
      setCode(`TAX-${String(nextNum).padStart(3, '0')}`);
      setTaxType('percentage');
      setValue('');
      setApplicationMethod('per_night');
      setIsActive(true);
    }
    setErrors({});
  }, [drawerTaxRule, isTaxRuleDrawerOpen, taxes.length]);

  if (!isTaxRuleDrawerOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Tax name is required';
    }
    if (value === '' || isNaN(Number(value)) || Number(value) < 0) {
      errs.value = 'Please enter a valid non-negative value';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numVal = parseFloat(String(value)) || 0;
    const calcStrategy =
      taxType === 'percentage'
        ? 'percentage'
        : applicationMethod === 'per_stay'
        ? 'per-stay'
        : 'per-day';

    const readableType =
      taxType === 'percentage'
        ? name.toLowerCase().includes('vat')
          ? 'VAT'
          : name.toLowerCase().includes('env')
          ? 'Environmental Fee'
          : 'GST'
        : name.toLowerCase().includes('city') || name.toLowerCase().includes('tourism')
        ? 'City Tax'
        : 'Service Tax';

    if (drawerTaxRule) {
      updateTax(drawerTaxRule.id, {
        name: name.trim(),
        code: code.trim().toUpperCase() || drawerTaxRule.code || 'TAX-001',
        ruleType: taxType as 'percentage' | 'fixed',
        value: numVal,
        applicationMethod,
        calculationStrategy: calcStrategy,
        taxType: readableType,
        isActive,
        slabs: [
          {
            id: drawerTaxRule.slabs?.[0]?.id || `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: taxType === 'percentage' ? numVal : 0,
            description: `${name} ${taxType === 'percentage' ? `${numVal}%` : `$${numVal}`}`,
          },
        ],
      });
    } else {
      addTax({
        name: name.trim(),
        code: code.trim().toUpperCase() || `TAX-${String(taxes.length + 1).padStart(3, '0')}`,
        ruleType: taxType as 'percentage' | 'fixed',
        value: numVal,
        applicationMethod,
        calculationStrategy: calcStrategy,
        taxType: readableType,
        isActive,
        configsCount: 1,
        jurisdiction: 'Property Local Jurisdiction',
        description: `${name} applied as ${taxType === 'percentage' ? `${numVal}%` : `$${numVal}`} ${applicationMethod.replace(/_/g, ' ')}.`,
        slabs: [
          {
            id: `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: taxType === 'percentage' ? numVal : 0,
            description: `${name} flat tier`,
          },
        ],
        applicableTo: 'all-rooms',
      });
    }
    closeTaxRuleDrawer();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="drawer-overlay"
        onClick={closeTaxRuleDrawer}
        className="fixed inset-0 bg-[#000000]/30 backdrop-blur-xs z-[60] transition-opacity duration-300 animate-fadeIn"
      />

      {/* Right Side Drawer */}
      <div
        id="tax-rule-drawer"
        className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-[#e0e3e5] animate-slideInRight"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e3e5] bg-white">
          <div>
            <h2 className="text-[18px] font-bold text-[#191c1e]">
              {drawerTaxRule ? 'Edit Tax Rule' : 'Create New Tax'}
            </h2>
            <p className="text-[13px] text-[#45464d] mt-0.5">
              Define a new tax rule for the property.
            </p>
          </div>
          <button
            id="btn-close-tax-rule-drawer"
            onClick={closeTaxRuleDrawer}
            className="p-2 text-[#45464d] hover:bg-[#eceef0] rounded-full transition-colors cursor-pointer"
            title="Close drawer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Content (Form) */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Section: General Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#75859d] border-b border-[#e0e3e5] pb-1.5">
              General Information
            </h3>

            {/* Tax Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                Tax Name *
              </label>
              <input
                id="input-tax-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={`w-full px-3.5 py-2 bg-white border rounded-lg text-[13px] text-[#191c1e] placeholder:text-[#76777d] outline-none transition-all ${
                  errors.name
                    ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                    : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                }`}
                placeholder="e.g., State Tax"
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

            {/* Internal Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                Internal Code
              </label>
              <input
                id="input-tax-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 bg-white border border-[#c6c6cd] rounded-lg font-mono text-[13px] text-[#191c1e] placeholder:text-[#76777d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all uppercase"
                placeholder="TAX-005"
                type="text"
              />
            </div>

            {/* Active Status Row */}
            <div className="flex items-center justify-between p-3.5 bg-[#f2f4f6] rounded-lg mt-1 border border-[#e0e3e5]">
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#191c1e]">Active Status</span>
                <span className="text-[12px] text-[#45464d]">Enable this tax immediately</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="checkbox-tax-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#000000]" />
              </label>
            </div>
          </div>

          {/* Section: Calculation Rules */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#75859d] border-b border-[#e0e3e5] pb-1.5">
              Calculation Rules
            </h3>

            {/* Tax Type & Value Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  Tax Type *
                </label>
                <div className="relative">
                  <select
                    id="select-tax-calc-type"
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] appearance-none focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#75859d] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  Value *
                </label>
                <div className="relative">
                  <input
                    id="input-tax-value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (errors.value) setErrors((prev) => ({ ...prev, value: '' }));
                    }}
                    placeholder="0.00"
                    className={`w-full px-3.5 py-2 bg-white border rounded-lg font-mono text-[13px] text-[#191c1e] placeholder:text-[#76777d] outline-none transition-all ${
                      errors.value
                        ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                        : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                    }`}
                  />
                </div>
                {errors.value && (
                  <span className="text-[11px] text-[#ba1a1a]">{errors.value}</span>
                )}
              </div>
            </div>

            {/* Application Method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                Application Method *
              </label>
              <div className="relative">
                <select
                  id="select-application-method"
                  value={applicationMethod}
                  onChange={(e) => setApplicationMethod(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] appearance-none focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer"
                >
                  <option value="per_night">Per Room, Per Night</option>
                  <option value="per_person_night">Per Person, Per Night</option>
                  <option value="per_stay">Per Stay</option>
                  <option value="per_item">Per Item (e.g. F&amp;B)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#75859d] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Info Callout */}
            <div className="p-3.5 bg-[#d3e4fe]/30 border border-[#b7c8e1]/60 rounded-lg mt-1 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#0b1c30] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-[12px] text-[#0b1c30] leading-relaxed">
                Ensure this configuration aligns with local regulatory requirements. Changes to active taxes will apply to all future reservations created after saving.
              </p>
            </div>
          </div>
        </form>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#e0e3e5] bg-white flex items-center justify-end gap-3">
          <button
            id="btn-cancel-tax-rule-drawer"
            type="button"
            onClick={closeTaxRuleDrawer}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-tax-rule-drawer"
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#000000] rounded-lg text-[13px] font-semibold text-white hover:bg-[#333333] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            Save Tax Rule
          </button>
        </div>
      </div>
    </>
  );
};
