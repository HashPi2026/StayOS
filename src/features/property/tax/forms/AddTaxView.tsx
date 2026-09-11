import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { TaxItem } from '@/src/types';

interface AddTaxViewProps {
  isEdit?: boolean;
}

export const AddTaxView: React.FC<AddTaxViewProps> = ({ isEdit = false }) => {
  const { taxes, selectedTaxId, addTax, updateTax, navigate, addToast } = useProperty();

  const existingTax = isEdit && selectedTaxId ? taxes.find((t) => t.id === selectedTaxId) : null;

  const [name, setName] = useState('');
  const [taxType, setTaxType] = useState('');
  const [calculationStrategy, setCalculationStrategy] = useState<'per-day' | 'per-stay'>('per-day');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingTax) {
      setName(existingTax.name || '');
      setTaxType(existingTax.taxType || '');
      setCalculationStrategy(
        existingTax.calculationStrategy === 'per-stay' ? 'per-stay' : 'per-day'
      );
      setIsActive(existingTax.isActive !== false);
    } else {
      setName('');
      setTaxType('');
      setCalculationStrategy('per-day');
      setIsActive(true);
    }
    setErrors({});
  }, [existingTax, isEdit]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Tax name is required';
    }
    if (!taxType.trim()) {
      newErrors.taxType = 'Please select a tax type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && existingTax) {
      updateTax(existingTax.id, {
        name: name.trim(),
        taxType,
        calculationStrategy,
        isActive,
      });
    } else {
      addTax({
        name: name.trim(),
        taxType,
        calculationStrategy,
        isActive,
        jurisdiction: 'General Jurisdiction',
        description: `${taxType} calculated ${calculationStrategy === 'per-day' ? 'daily per night' : 'once per stay'}.`,
        configsCount: 1,
        slabs: [
          {
            id: `sl-${Date.now()}`,
            fromAmount: 0,
            toAmount: null,
            ratePercentage: 12,
            description: 'Standard Flat Slab',
          },
        ],
        applicableTo: 'all-rooms',
      });
    }

    navigate('taxes');
  };

  const handleCancel = () => {
    navigate('taxes');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] relative">
      {/* Sticky Top Header Bar */}
      <div className="px-6 lg:px-10 py-5 flex justify-between items-center bg-[#f7f9fb] sticky top-0 z-10 border-b border-[#e0e3e5]">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[13px] text-[#45464d] mb-1">
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">
              chevron_right
            </span>
            <button
              onClick={() => navigate('taxes')}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Taxes
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">
              chevron_right
            </span>
            <span className="font-semibold text-[#191c1e]">
              {isEdit ? 'Edit Tax' : 'Add Tax'}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-[#191c1e] tracking-tight">
            {isEdit ? 'Edit Tax' : 'Add Tax'}
          </h1>
        </div>

        {/* Back Button */}
        <button
          id="btn-back-to-taxes"
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg transition-colors text-[13px] font-semibold cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Taxes
        </button>
      </div>

      {/* Form Content Area */}
      <form
        onSubmit={handleSave}
        className="p-6 lg:p-10 max-w-4xl w-full mx-auto flex flex-col gap-6 flex-1 pb-36"
      >
        {/* Section 1: Tax Information */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e0e3e5] bg-white">
            <h2 className="text-[16px] font-bold text-[#191c1e]">Tax Information</h2>
            <p className="text-[13px] text-[#45464d] mt-0.5">
              Define the basic details for this tax.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {/* Tax Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d] flex items-center gap-1">
                Tax Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="input-tax-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={`w-full px-4 py-2.5 bg-white rounded-lg border text-[14px] text-[#191c1e] outline-none transition-all ${
                  errors.name
                    ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                    : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                }`}
                placeholder="e.g., GST, Luxury Tax"
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

            {/* Tax Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d] flex items-center gap-1">
                Tax Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-tax-type"
                  value={taxType}
                  onChange={(e) => {
                    setTaxType(e.target.value);
                    if (errors.taxType) setErrors((prev) => ({ ...prev, taxType: '' }));
                  }}
                  className={`w-full px-4 py-2.5 bg-white rounded-lg border text-[14px] outline-none transition-all appearance-none pr-10 cursor-pointer ${
                    !taxType ? 'text-[#75859d]' : 'text-[#191c1e]'
                  } ${
                    errors.taxType
                      ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                      : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                  }`}
                >
                  <option value="" disabled>
                    Select a tax type
                  </option>
                  <option value="GST">GST</option>
                  <option value="Luxury Tax">Luxury Tax</option>
                  <option value="Service Tax">Service Tax</option>
                  <option value="Municipal Tax">Municipal Tax</option>
                  <option value="VAT">VAT</option>
                  <option value="City Lodging Tax">City Lodging Tax</option>
                  <option value="Environmental Fee">Environmental Fee</option>
                  <option value="Tourism Levy">Tourism Levy</option>
                  <option value="Other">Other Surcharge</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#75859d] text-[20px]">
                  expand_more
                </span>
              </div>
              {errors.taxType && (
                <span className="text-[12px] text-[#ba1a1a] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.taxType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Tax Calculation */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e0e3e5] bg-white">
            <h2 className="text-[16px] font-bold text-[#191c1e]">Tax Calculation</h2>
            <p className="text-[13px] text-[#45464d] mt-0.5">
              Determine how this tax is applied to bookings.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
                Calculation Method
              </label>

              {/* Segmented Button Group */}
              <div className="flex bg-[#eceef0] rounded-lg p-1 border border-[#e0e3e5]">
                <button
                  id="btn-per-day"
                  type="button"
                  onClick={() => setCalculationStrategy('per-day')}
                  className={`flex-1 py-2 text-center rounded-md font-semibold text-[13px] transition-all cursor-pointer ${
                    calculationStrategy === 'per-day'
                      ? 'bg-white shadow-xs text-[#191c1e]'
                      : 'text-[#45464d] hover:text-[#191c1e] bg-transparent'
                  }`}
                >
                  Per Day Tax
                </button>
                <button
                  id="btn-per-stay"
                  type="button"
                  onClick={() => setCalculationStrategy('per-stay')}
                  className={`flex-1 py-2 text-center rounded-md font-semibold text-[13px] transition-all cursor-pointer ${
                    calculationStrategy === 'per-stay'
                      ? 'bg-white shadow-xs text-[#191c1e]'
                      : 'text-[#45464d] hover:text-[#191c1e] bg-transparent'
                  }`}
                >
                  Per Stay Tax
                </button>
              </div>

              {/* Dynamic Helper Note */}
              <div
                id="calc-helper-text"
                className="text-[13px] text-[#45464d] bg-[#f7f9fb] p-3.5 rounded-lg border border-[#e0e3e5] flex items-start gap-2.5 mt-1"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0058be] shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  {calculationStrategy === 'per-day'
                    ? "Tax will be calculated and applied for every night of the guest's stay."
                    : 'Tax will be applied as a single fixed charge for the entire duration of the stay.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Status */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] overflow-hidden">
          <div className="p-6 flex items-center justify-between gap-6">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[16px] font-bold text-[#191c1e]">Is Active</h2>
              <p className="text-[13px] text-[#45464d]">
                Enable this tax for use in price calculations and bookings.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="checkbox-is-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be] transition-colors" />
            </label>
          </div>
        </div>
      </form>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-white border-t border-[#e0e3e5] px-6 lg:px-10 py-3.5 flex justify-end items-center gap-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          id="btn-cancel-tax"
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] hover:bg-[#eceef0] transition-colors font-semibold text-[13px] cursor-pointer"
        >
          Cancel
        </button>
        <button
          id="btn-save-tax"
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all font-semibold text-[13px] shadow-xs cursor-pointer"
        >
          Save Tax
        </button>
      </div>
    </div>
  );
};
