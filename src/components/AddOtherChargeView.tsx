import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';

export const AddOtherChargeView: React.FC = () => {
  const {
    otherCharges,
    otherChargeCategories,
    editingOtherChargeId,
    setEditingOtherChargeId,
    addOtherCharge,
    updateOtherCharge,
    navigate,
  } = useProperty();

  const isEditing = Boolean(editingOtherChargeId);
  const existingCharge = isEditing
    ? otherCharges.find((c) => c.id === editingOtherChargeId)
    : null;

  const [formData, setFormData] = useState({
    shortName: '',
    name: '',
    category: '',
    price: '',
    taxable: true,
    alwaysCharge: false,
    reoccur: false,
    reoccurFrequency: 'Daily' as 'Daily' | 'Weekly' | 'Monthly',
    crsCharge: false,
    callLoggingCharge: false,
    posCharge: true,
    forecastingRevenue: true,
    description: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingCharge) {
      setFormData({
        shortName: existingCharge.shortName,
        name: existingCharge.name,
        category: existingCharge.category,
        price: existingCharge.price !== undefined ? existingCharge.price.toString() : '',
        taxable: existingCharge.taxable,
        alwaysCharge: existingCharge.alwaysCharge,
        reoccur: existingCharge.reoccur,
        reoccurFrequency: existingCharge.reoccurFrequency || 'Daily',
        crsCharge: existingCharge.crsCharge,
        callLoggingCharge: existingCharge.callLoggingCharge,
        posCharge: existingCharge.posCharge,
        forecastingRevenue: existingCharge.forecastingRevenue,
        description: existingCharge.description || '',
      });
    } else {
      setFormData({
        shortName: '',
        name: '',
        category: otherChargeCategories[0]?.name || 'F&B',
        price: '',
        taxable: true,
        alwaysCharge: false,
        reoccur: false,
        reoccurFrequency: 'Daily',
        crsCharge: false,
        callLoggingCharge: false,
        posCharge: true,
        forecastingRevenue: true,
        description: '',
      });
    }
    setErrors({});
  }, [existingCharge, otherChargeCategories]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short name is required';
    } else if (formData.shortName.trim().length > 10) {
      newErrors.shortName = 'Short name cannot exceed 10 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Charge name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      shortName: formData.shortName.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: formData.price ? parseFloat(formData.price) : undefined,
      taxable: formData.taxable,
      alwaysCharge: formData.alwaysCharge,
      reoccur: formData.reoccur,
      reoccurFrequency: formData.reoccur ? formData.reoccurFrequency : undefined,
      crsCharge: formData.crsCharge,
      callLoggingCharge: formData.callLoggingCharge,
      posCharge: formData.posCharge,
      forecastingRevenue: formData.forecastingRevenue,
      description: formData.description.trim() || undefined,
    };

    if (isEditing && editingOtherChargeId) {
      updateOtherCharge(editingOtherChargeId, payload);
    } else {
      addOtherCharge(payload);
    }

    setEditingOtherChargeId(null);
    navigate('other-charges');
  };

  const handleCancel = () => {
    setEditingOtherChargeId(null);
    navigate('other-charges');
  };

  return (
    <div className="flex flex-col w-full h-full text-[#191c1e] p-6 lg:p-8 max-w-4xl mx-auto pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#45464d] mb-4">
        <button
          onClick={() => navigate('overview')}
          className="hover:text-[#0058be] transition-colors"
        >
          Configuration
        </button>
        <span className="text-[#c6c6cd]">/</span>
        <button
          onClick={() => navigate('other-charges')}
          className="hover:text-[#0058be] transition-colors"
        >
          Other Charges
        </button>
        <span className="text-[#c6c6cd]">/</span>
        <span className="text-[#191c1e] font-semibold">
          {isEditing ? 'Edit Charge' : 'Add Charge'}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#191c1e]">
          {isEditing ? 'Edit Other Charge' : 'Add Other Charge'}
        </h1>
        <p className="text-sm text-[#45464d] mt-1">
          Configure auxiliary charge code, category, and automatic fee posting rules.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <section className="bg-white rounded-lg border border-[#e0e3e5] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#191c1e] mb-4 pb-2 border-b border-[#eceef0] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-[20px]">info</span>
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Short Name */}
            <div>
              <label className="text-xs font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => {
                  setFormData({ ...formData, shortName: e.target.value.toUpperCase() });
                  if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: '' }));
                }}
                placeholder="e.g. B-FAST"
                maxLength={10}
                className={`w-full bg-white border ${
                  errors.shortName ? 'border-red-500' : 'border-[#c6c6cd]'
                } rounded px-3 py-2 font-mono text-sm uppercase focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20`}
              />
              {errors.shortName && (
                <span className="text-xs text-red-500 mt-1 block">{errors.shortName}</span>
              )}
            </div>

            {/* Charge Name */}
            <div>
              <label className="text-xs font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                Charge Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Continental Breakfast"
                className={`w-full bg-white border ${
                  errors.name ? 'border-red-500' : 'border-[#c6c6cd]'
                } rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20`}
              />
              {errors.name && (
                <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                }}
                className="w-full bg-white border border-[#c6c6cd] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20"
              >
                <option value="" disabled>Select category</option>
                {otherChargeCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.shortName})
                  </option>
                ))}
                <option value="Fees & Surcharges">Fees & Surcharges</option>
                <option value="Transportation">Transportation</option>
                <option value="Spa & Wellness">Spa & Wellness</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                Default Price / Rate ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-white border border-[#c6c6cd] rounded pl-7 pr-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0058be]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Card 2: Charge Rules */}
        <section className="bg-white rounded-lg border border-[#e0e3e5] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#191c1e] mb-4 pb-2 border-b border-[#eceef0] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-[20px]">rule</span>
            Charge Rules & Posting Behavior
          </h2>

          <div className="space-y-4 divide-y divide-[#eceef0]">
            {/* Taxable */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-sm font-medium text-[#191c1e]">Taxable</div>
                <div className="text-xs text-[#76777d]">Include configured taxes when calculating total</div>
              </div>
              <input
                type="checkbox"
                checked={formData.taxable}
                onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                className="w-5 h-5 accent-[#0058be] rounded"
              />
            </div>

            {/* Always Charge */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-sm font-medium text-[#191c1e]">Always Charge</div>
                <div className="text-xs text-[#76777d]">Automatically charge on every check-in</div>
              </div>
              <input
                type="checkbox"
                checked={formData.alwaysCharge}
                onChange={(e) => setFormData({ ...formData, alwaysCharge: e.target.checked })}
                className="w-5 h-5 accent-[#0058be] rounded"
              />
            </div>

            {/* Reoccur */}
            <div className="pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[#191c1e]">Reoccur Charge</div>
                  <div className="text-xs text-[#76777d]">Automatically repeat across guest stay nights</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.reoccur}
                  onChange={(e) => setFormData({ ...formData, reoccur: e.target.checked })}
                  className="w-5 h-5 accent-[#0058be] rounded"
                />
              </div>

              {formData.reoccur && (
                <div className="p-3 bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center gap-4">
                  <span className="text-xs font-semibold text-[#45464d] uppercase">Frequency:</span>
                  <select
                    value={formData.reoccurFrequency}
                    onChange={(e) =>
                      setFormData({ ...formData, reoccurFrequency: e.target.value as any })
                    }
                    className="bg-white border border-[#c6c6cd] rounded px-3 py-1 text-xs"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>

            {/* CRS */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-sm font-medium text-[#191c1e]">CRS Charge</div>
                <div className="text-xs text-[#76777d]">Make selectable during online booking reservation flow</div>
              </div>
              <input
                type="checkbox"
                checked={formData.crsCharge}
                onChange={(e) => setFormData({ ...formData, crsCharge: e.target.checked })}
                className="w-5 h-5 accent-[#0058be] rounded"
              />
            </div>

            {/* POS */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-sm font-medium text-[#191c1e]">POS Charge</div>
                <div className="text-xs text-[#76777d]">Available to post from restaurant or spa POS</div>
              </div>
              <input
                type="checkbox"
                checked={formData.posCharge}
                onChange={(e) => setFormData({ ...formData, posCharge: e.target.checked })}
                className="w-5 h-5 accent-[#0058be] rounded"
              />
            </div>

            {/* Forecasting */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-sm font-medium text-[#191c1e]">Forecasting Revenue</div>
                <div className="text-xs text-[#76777d]">Incorporate in hotel ancillary revenue projection calculations</div>
              </div>
              <input
                type="checkbox"
                checked={formData.forecastingRevenue}
                onChange={(e) => setFormData({ ...formData, forecastingRevenue: e.target.checked })}
                className="w-5 h-5 accent-[#0058be] rounded"
              />
            </div>
          </div>
        </section>

        {/* Card 3: Notes */}
        <section className="bg-white rounded-lg border border-[#e0e3e5] p-6 shadow-sm">
          <label className="text-xs font-semibold text-[#45464d] uppercase tracking-wider block mb-2">
            Description & Notes
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Operational notes, tax exemption details, or special instructions..."
            className="w-full bg-white border border-[#c6c6cd] rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#0058be]"
          />
        </section>

        {/* Fixed Bottom Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded text-sm font-medium border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#191c1e] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded text-sm font-medium bg-[#000000] text-white hover:bg-[#1a1a1a] shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            {isEditing ? 'Save Changes' : 'Save Charge'}
          </button>
        </div>
      </form>
    </div>
  );
};
