import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { OtherChargeItem } from '../types';

export const OtherChargeDrawer: React.FC = () => {
  const {
    isOtherChargeDrawerOpen,
    drawerOtherCharge,
    closeOtherChargeDrawer,
    addOtherCharge,
    updateOtherCharge,
    otherChargeCategories,
    addToast,
  } = useProperty();

  const isEditing = Boolean(drawerOtherCharge);

  // Form State
  const [shortName, setShortName] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [taxable, setTaxable] = useState(true);
  const [alwaysCharge, setAlwaysCharge] = useState(false);
  const [reoccur, setReoccur] = useState(false);
  const [reoccurFrequency, setReoccurFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [crsCharge, setCrsCharge] = useState(false);
  const [callLoggingCharge, setCallLoggingCharge] = useState(false);
  const [posCharge, setPosCharge] = useState(true);
  const [forecastingRevenue, setForecastingRevenue] = useState(true);
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (drawerOtherCharge) {
      setShortName(drawerOtherCharge.shortName);
      setName(drawerOtherCharge.name);
      setCategory(drawerOtherCharge.category);
      setPrice(drawerOtherCharge.price !== undefined ? drawerOtherCharge.price.toString() : '');
      setTaxable(drawerOtherCharge.taxable);
      setAlwaysCharge(drawerOtherCharge.alwaysCharge);
      setReoccur(drawerOtherCharge.reoccur);
      setReoccurFrequency(drawerOtherCharge.reoccurFrequency || 'Daily');
      setCrsCharge(drawerOtherCharge.crsCharge);
      setCallLoggingCharge(drawerOtherCharge.callLoggingCharge);
      setPosCharge(drawerOtherCharge.posCharge);
      setForecastingRevenue(drawerOtherCharge.forecastingRevenue);
      setDescription(drawerOtherCharge.description || '');
    } else {
      // Default initial values
      setShortName('');
      setName('');
      setCategory(otherChargeCategories[0]?.name || 'F&B');
      setPrice('');
      setTaxable(true);
      setAlwaysCharge(false);
      setReoccur(false);
      setReoccurFrequency('Daily');
      setCrsCharge(false);
      setCallLoggingCharge(false);
      setPosCharge(true);
      setForecastingRevenue(true);
      setDescription('');
    }
    setErrors({});
  }, [drawerOtherCharge, isOtherChargeDrawerOpen, otherChargeCategories]);

  if (!isOtherChargeDrawerOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!shortName.trim()) {
      newErrors.shortName = 'Short name is required';
    } else if (shortName.trim().length > 10) {
      newErrors.shortName = 'Short name cannot exceed 10 characters';
    }

    if (!name.trim()) {
      newErrors.name = 'Charge name is required';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const chargePayload = {
      shortName: shortName.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      price: price ? parseFloat(price) : undefined,
      taxable,
      alwaysCharge,
      reoccur,
      reoccurFrequency: reoccur ? reoccurFrequency : undefined,
      crsCharge,
      callLoggingCharge,
      posCharge,
      forecastingRevenue,
      description: description.trim() || undefined,
    };

    if (isEditing && drawerOtherCharge) {
      updateOtherCharge(drawerOtherCharge.id, chargePayload);
    } else {
      addOtherCharge(chargePayload);
    }
    closeOtherChargeDrawer();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/25 backdrop-blur-[2px] z-[60] transition-opacity duration-300"
        onClick={closeOtherChargeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[70] transition-transform duration-300 ease-in-out flex flex-col border-l border-[#e0e3e5]"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#eceef0] bg-[#f7f9fb]">
          <div>
            <h2 className="text-[18px] font-semibold text-[#191c1e]">
              {isEditing ? 'Edit Charge' : 'Add New Charge'}
            </h2>
            <p className="text-[12px] text-[#45464d] mt-0.5">
              {isEditing ? 'Modify charge parameters and behavior rules' : 'Define auxiliary item code, category, and fee triggers'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeOtherChargeDrawer}
            className="p-2 rounded-full hover:bg-[#eceef0] text-[#45464d] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f7f9fb]">
          {/* Section: Basic Information */}
          <section className="bg-white p-5 rounded-lg border border-[#e0e3e5] shadow-sm">
            <h3 className="text-[12px] font-semibold tracking-wider text-[#000000] uppercase mb-4 pb-2 border-b border-[#eceef0] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be] text-[18px]">info</span>
              Basic Information
            </h3>

            <div className="space-y-4">
              {/* Short Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                  Short Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => {
                    setShortName(e.target.value.toUpperCase());
                    if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: '' }));
                  }}
                  placeholder="e.g. B-FAST"
                  maxLength={10}
                  className={`w-full bg-white border ${
                    errors.shortName ? 'border-red-500' : 'border-[#c6c6cd]'
                  } rounded px-3 py-2 font-mono text-[13px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all uppercase placeholder:normal-case`}
                />
                {errors.shortName ? (
                  <span className="text-[11px] text-red-500">{errors.shortName}</span>
                ) : (
                  <span className="text-[11px] text-[#76777d]">Max 10 alphanumeric characters (e.g. B-FAST, SPA-M)</span>
                )}
              </div>

              {/* Charge Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                  Charge Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Continental Breakfast"
                  className={`w-full bg-white border ${
                    errors.name ? 'border-red-500' : 'border-[#c6c6cd]'
                  } rounded px-3 py-2 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all`}
                />
                {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`w-full bg-white border ${
                      errors.category ? 'border-red-500' : 'border-[#c6c6cd]'
                    } rounded px-3 py-2 pr-9 text-[14px] text-[#191c1e] appearance-none focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer`}
                  >
                    <option value="" disabled>Select a category</option>
                    {otherChargeCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.shortName})
                      </option>
                    ))}
                    {!otherChargeCategories.some((c) => c.name === 'Fees & Surcharges') && (
                      <option value="Fees & Surcharges">Fees & Surcharges</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Transportation') && (
                      <option value="Transportation">Transportation</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Spa & Wellness') && (
                      <option value="Spa & Wellness">Spa & Wellness</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Other') && (
                      <option value="Other">Other</option>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d]">
                    expand_more
                  </span>
                </div>
                {errors.category && <span className="text-[11px] text-red-500">{errors.category}</span>}
              </div>

              {/* Optional Price */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                  Default Amount / Base Rate ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-[#c6c6cd] rounded pl-7 pr-3 py-2 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Charge Rules */}
          <section className="bg-white p-5 rounded-lg border border-[#e0e3e5] shadow-sm">
            <h3 className="text-[12px] font-semibold tracking-wider text-[#000000] uppercase mb-4 pb-2 border-b border-[#eceef0] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be] text-[18px]">rule</span>
              Charge Rules
            </h3>

            <div className="space-y-3 divide-y divide-[#eceef0]/70">
              {/* Taxable */}
              <label className="flex items-center justify-between pt-2 pb-1 cursor-pointer group select-none">
                <div>
                  <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                    Taxable
                  </div>
                  <div className="text-[12px] text-[#76777d]">Applies configured standard tax percentage rates</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={taxable}
                    onChange={(e) => setTaxable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </div>
              </label>

              {/* Always Charge */}
              <label className="flex items-center justify-between pt-3 pb-1 cursor-pointer group select-none">
                <div>
                  <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                    Always Charge
                  </div>
                  <div className="text-[12px] text-[#76777d]">Automatically post to folio on room assignment</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={alwaysCharge}
                    onChange={(e) => setAlwaysCharge(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </div>
              </label>

              {/* Reoccur Charge */}
              <div className="pt-3 pb-1 space-y-3">
                <label className="flex items-center justify-between cursor-pointer group select-none">
                  <div>
                    <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                      Reoccur Charge
                    </div>
                    <div className="text-[12px] text-[#76777d]">Repeats automatically across stay duration</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={reoccur}
                      onChange={(e) => setReoccur(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                  </div>
                </label>

                {/* Frequency sub-container */}
                {reoccur && (
                  <div className="pl-4 pr-1 py-2 bg-[#f2f4f6] rounded border border-[#e0e3e5] animate-in fade-in duration-200">
                    <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                      Posting Frequency
                    </label>
                    <div className="relative">
                      <select
                        value={reoccurFrequency}
                        onChange={(e) => setReoccurFrequency(e.target.value as 'Daily' | 'Weekly' | 'Monthly')}
                        className="w-full bg-white border border-[#c6c6cd] rounded px-3 py-1.5 pr-8 text-[13px] text-[#191c1e] appearance-none focus:outline-none focus:border-[#0058be]"
                      >
                        <option value="Daily">Daily (Every night during Night Audit)</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CRS Charge */}
              <label className="flex items-center justify-between pt-3 pb-1 cursor-pointer group select-none">
                <div>
                  <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                    CRS Charge
                  </div>
                  <div className="text-[12px] text-[#76777d]">Expose item in Central Reservation System add-ons</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={crsCharge}
                    onChange={(e) => setCrsCharge(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </div>
              </label>

              {/* Call Logging Charge */}
              <label className="flex items-center justify-between pt-3 pb-1 cursor-pointer group select-none">
                <div>
                  <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                    Call Logging Charge
                  </div>
                  <div className="text-[12px] text-[#76777d]">Link to telephone PBX integration logging</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={callLoggingCharge}
                    onChange={(e) => setCallLoggingCharge(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </div>
              </label>

              {/* POS Charge */}
              <label className="flex items-center justify-between pt-3 pb-1 cursor-pointer group select-none">
                <div>
                  <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                    POS Charge
                  </div>
                  <div className="text-[12px] text-[#76777d]">Available for direct posting on POS terminals</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={posCharge}
                    onChange={(e) => setPosCharge(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </div>
              </label>

              {/* Forecasting Revenue */}
              <label className="flex items-center justify-between pt-3 pb-1 cursor-pointer group select-none">
                <div>
                  <div className="text-[14px] font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                    Forecasting Revenue
                  </div>
                  <div className="text-[12px] text-[#76777d]">Include expected revenue in forecast reports</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={forecastingRevenue}
                    onChange={(e) => setForecastingRevenue(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
                </div>
              </label>
            </div>
          </section>

          {/* Optional Notes */}
          <section className="bg-white p-5 rounded-lg border border-[#e0e3e5] shadow-sm">
            <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider block mb-2">
              Internal Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide extra details regarding item availability, restrictions, or accounting codes..."
              className="w-full bg-white border border-[#c6c6cd] rounded px-3 py-2 text-[13px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-none"
            />
          </section>
        </form>

        {/* Drawer Action Footer */}
        <div className="p-6 border-t border-[#eceef0] bg-[#f7f9fb] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={closeOtherChargeDrawer}
            className="px-4 py-2 rounded text-[13px] font-medium text-[#191c1e] border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded text-[13px] font-medium bg-[#000000] text-white shadow-sm hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            {isEditing ? 'Save Changes' : 'Save Charge'}
          </button>
        </div>
      </div>
    </>
  );
};
