import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

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
    taxable: false,
    alwaysCharge: false,
    reoccur: false,
    reoccurFrequency: '' as '' | 'Daily' | 'Weekly' | 'Monthly' | 'Per Stay',
    crsCharge: false,
    callLoggingCharge: false,
    posCharge: false,
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
        reoccurFrequency: (existingCharge.reoccurFrequency as any) || 'Daily',
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
        category: '',
        price: '',
        taxable: false,
        alwaysCharge: false,
        reoccur: false,
        reoccurFrequency: '',
        crsCharge: false,
        callLoggingCharge: false,
        posCharge: false,
        forecastingRevenue: true,
        description: '',
      });
    }
    setErrors({});
  }, [existingCharge]);

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

    if (formData.reoccur && !formData.reoccurFrequency) {
      newErrors.reoccurFrequency = 'Please select a recurrence frequency';
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
      reoccurFrequency: formData.reoccur ? (formData.reoccurFrequency as any) : undefined,
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

  const handleReoccurToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      reoccur: checked,
      reoccurFrequency: checked ? (prev.reoccurFrequency || 'Daily') : '',
    }));
    if (errors.reoccurFrequency) {
      setErrors((prev) => ({ ...prev, reoccurFrequency: '' }));
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative">
      {/* Sticky Header with Navigation Breadcrumb */}
      <div className="px-6 lg:px-8 py-5 flex items-center justify-between z-10 sticky top-0 bg-[#f7f9fb]/90 backdrop-blur-md border-b border-[#e0e3e5]/50">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center text-[13px] text-[#45464d] gap-1.5 font-medium">
            <button
              type="button"
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Configuration
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
            <button
              type="button"
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
            <button
              type="button"
              onClick={() => navigate('other-charges')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Other Charges
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
            <span className="text-[#000000] font-semibold">
              {isEditing ? 'Edit Other Charge' : 'Add Other Charge'}
            </span>
          </nav>
          <h1 className="text-[28px] lg:text-[30px] font-bold text-[#191c1e] tracking-tight">
            {isEditing ? 'Edit Other Charge' : 'Add Other Charge'}
          </h1>
        </div>
      </div>

      {/* Main Content Form Area */}
      <div className="px-6 lg:px-8 pb-28 pt-6 flex-1 flex flex-col gap-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 pt-2">
              <h2 className="text-[18px] font-semibold text-[#191c1e]">Basic Information</h2>
              <p className="text-[13px] text-[#45464d] leading-relaxed">
                Define the primary identity and categorization for this charge within the folio and reporting.
              </p>
              <div className="mt-auto hidden lg:block opacity-50 pointer-events-none pt-4">
                <svg className="w-full h-28 text-[#000000]" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0 100 L10 80 Q 20 60 40 85 T 80 50 L100 70 L100 100 Z" fill="currentColor" fillOpacity="0.04" />
                  <path d="M0 100 L15 75 Q 30 50 50 90 T 90 40 L100 60 L100 100 Z" fill="currentColor" fillOpacity="0.08" />
                </svg>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-[#eceef0] rounded-xl p-6 flex flex-col gap-5 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#dae2fd]/30 rounded-full blur-3xl group-hover:bg-[#dae2fd]/50 transition-colors duration-700 ease-out pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-5 relative z-10">
                {/* Short Name */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[12px] font-semibold tracking-wider text-[#191c1e] uppercase flex items-center gap-1">
                    Short Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.shortName}
                      onChange={(e) => {
                        setFormData({ ...formData, shortName: e.target.value.toUpperCase() });
                        if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: '' }));
                      }}
                      placeholder="e.g., B-FAST"
                      maxLength={10}
                      className={`w-full bg-white text-[#191c1e] placeholder:text-[#45464d]/50 text-[14px] px-4 py-2.5 rounded-lg outline-none transition-all border ${
                        errors.shortName ? 'border-[#ba1a1a]' : 'border-transparent'
                      } focus:bg-white focus:ring-2 focus:ring-[#0058be]/30 uppercase`}
                    />
                  </div>
                  {errors.shortName && (
                    <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">{errors.shortName}</span>
                  )}
                </div>

                {/* Charge Name */}
                <div className="flex-[2] flex flex-col gap-1">
                  <label className="text-[12px] font-semibold tracking-wider text-[#191c1e] uppercase flex items-center gap-1">
                    Charge Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g., Continental Breakfast"
                      className={`w-full bg-white text-[#191c1e] placeholder:text-[#45464d]/50 text-[14px] px-4 py-2.5 rounded-lg outline-none transition-all border ${
                        errors.name ? 'border-[#ba1a1a]' : 'border-transparent'
                      } focus:bg-white focus:ring-2 focus:ring-[#0058be]/30`}
                    />
                  </div>
                  {errors.name && (
                    <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">{errors.name}</span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1 relative z-10">
                <label className="text-[12px] font-semibold tracking-wider text-[#191c1e] uppercase flex items-center gap-1">
                  Category <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`w-full bg-white text-[#191c1e] text-[14px] px-4 py-2.5 rounded-lg outline-none appearance-none transition-all pr-10 cursor-pointer border ${
                      errors.category ? 'border-[#ba1a1a]' : 'border-transparent'
                    } focus:bg-white focus:ring-2 focus:ring-[#0058be]/30 ${
                      !formData.category ? 'text-[#45464d]/60' : 'text-[#191c1e]'
                    }`}
                  >
                    <option disabled value="">
                      Select category...
                    </option>
                    {otherChargeCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {!otherChargeCategories.some((c) => c.name === 'F&B') && (
                      <option value="F&B">F&B</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Laundry') && (
                      <option value="Laundry">Laundry</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Spa') && (
                      <option value="Spa">Spa</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Parking') && (
                      <option value="Parking">Parking</option>
                    )}
                    {!otherChargeCategories.some((c) => c.name === 'Fees & Surcharges') && (
                      <option value="Fees & Surcharges">Fees & Surcharges</option>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
                {errors.category && (
                  <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">{errors.category}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Charge Rules */}
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 pt-2">
              <h2 className="text-[18px] font-semibold text-[#191c1e]">Charge Rules</h2>
              <p className="text-[13px] text-[#45464d] leading-relaxed">
                Configure posting behavior, taxation logic, and automated recurrence for guest stays.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-[#eceef0] rounded-xl p-6 flex flex-col gap-6 shadow-sm">
              {/* 2 Top Toggles: Taxable & Always Charge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Taxable */}
                <label className="flex items-center justify-between p-4 bg-white rounded-lg cursor-pointer hover:bg-[#e6e8ea] transition-colors group select-none shadow-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-medium text-[#191c1e]">Taxable</span>
                    <span className="text-[12px] text-[#45464d]">Apply standard tax codes</span>
                  </div>
                  <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                    <input
                      type="checkbox"
                      checked={formData.taxable}
                      onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>

                {/* Always Charge */}
                <label className="flex items-center justify-between p-4 bg-white rounded-lg cursor-pointer hover:bg-[#e6e8ea] transition-colors group select-none shadow-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-medium text-[#191c1e]">Always Charge</span>
                    <span className="text-[12px] text-[#45464d]">Mandatory posting on folio</span>
                  </div>
                  <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                    <input
                      type="checkbox"
                      checked={formData.alwaysCharge}
                      onChange={(e) => setFormData({ ...formData, alwaysCharge: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>
              </div>

              <div className="h-[1px] w-full bg-[#c6c6cd]/30" />

              {/* Reoccur Charge Card */}
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4 bg-white rounded-lg cursor-pointer hover:bg-[#e6e8ea] transition-colors group select-none shadow-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-medium text-[#191c1e]">Reoccur Charge</span>
                    <span className="text-[12px] text-[#45464d]">
                      Automatically post charge based on a schedule
                    </span>
                  </div>
                  <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                    <input
                      type="checkbox"
                      id="reoccurToggle"
                      checked={formData.reoccur}
                      onChange={(e) => handleReoccurToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>

                {/* Sub-container for Frequency */}
                <div
                  className={`flex flex-col gap-1.5 pl-4 ml-2 border-l-2 transition-all duration-300 ${
                    formData.reoccur ? 'border-[#000000]' : 'border-[#c6c6cd]/40'
                  }`}
                >
                  <label
                    className={`text-[12px] font-semibold tracking-wider uppercase transition-colors ${
                      formData.reoccur ? 'text-[#191c1e]' : 'text-[#45464d]'
                    }`}
                  >
                    Reoccur Frequency
                  </label>
                  <div className="relative w-full sm:w-1/2 min-w-[220px]">
                    <select
                      disabled={!formData.reoccur}
                      value={formData.reoccurFrequency}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          reoccurFrequency: e.target.value as any,
                        });
                        if (errors.reoccurFrequency) {
                          setErrors((prev) => ({ ...prev, reoccurFrequency: '' }));
                        }
                      }}
                      className={`w-full text-[14px] px-4 py-2.5 rounded-lg outline-none appearance-none transition-all pr-10 border ${
                        errors.reoccurFrequency ? 'border-[#ba1a1a]' : 'border-transparent'
                      } ${
                        formData.reoccur
                          ? 'bg-white text-[#191c1e] cursor-pointer focus:ring-2 focus:ring-[#0058be]/30 shadow-xs'
                          : 'bg-[#f2f4f6] text-[#45464d] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <option disabled value="">
                        Select frequency...
                      </option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Per Stay">Per Stay</option>
                    </select>
                    <span
                      className={`material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] ${
                        formData.reoccur ? 'text-[#76777d]' : 'text-[#76777d]/50'
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                  {errors.reoccurFrequency ? (
                    <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                      {errors.reoccurFrequency}
                    </span>
                  ) : (
                    <span
                      className={`text-[12px] text-[#45464d]/80 mt-0.5 ${
                        formData.reoccur ? 'hidden' : 'block'
                      }`}
                    >
                      Enable 'Reoccur Charge' to select a frequency.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Integration */}
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 pt-2">
              <h2 className="text-[18px] font-semibold text-[#191c1e]">Integration</h2>
              <p className="text-[13px] text-[#45464d] leading-relaxed">
                Sync posting rules with external systems and reporting modules.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-[#eceef0] rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              {/* CRS Charge */}
              <label className="flex items-center justify-between py-2 cursor-pointer group select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#45464d] group-hover:text-[#000000] transition-colors">
                      cloud_sync
                    </span>
                    CRS Charge
                  </span>
                  <span className="text-[13px] text-[#45464d] pl-[26px]">
                    Map to Central Reservation System
                  </span>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                  <input
                    type="checkbox"
                    checked={formData.crsCharge}
                    onChange={(e) => setFormData({ ...formData, crsCharge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                  <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>

              <div className="h-[1px] w-full bg-[#c6c6cd]/30" />

              {/* Call Logging Charge */}
              <label className="flex items-center justify-between py-2 cursor-pointer group select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#45464d] group-hover:text-[#000000] transition-colors">
                      call
                    </span>
                    Call Logging Charge
                  </span>
                  <span className="text-[13px] text-[#45464d] pl-[26px]">
                    Enable for PABX integration
                  </span>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                  <input
                    type="checkbox"
                    checked={formData.callLoggingCharge}
                    onChange={(e) =>
                      setFormData({ ...formData, callLoggingCharge: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                  <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>

              <div className="h-[1px] w-full bg-[#c6c6cd]/30" />

              {/* POS Charge */}
              <label className="flex items-center justify-between py-2 cursor-pointer group select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#45464d] group-hover:text-[#000000] transition-colors">
                      point_of_sale
                    </span>
                    POS Charge
                  </span>
                  <span className="text-[13px] text-[#45464d] pl-[26px]">
                    Allow posting from Point of Sale terminals
                  </span>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                  <input
                    type="checkbox"
                    checked={formData.posCharge}
                    onChange={(e) => setFormData({ ...formData, posCharge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                  <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>

              <div className="h-[1px] w-full bg-[#c6c6cd]/30" />

              {/* Forecasting Revenue */}
              <label className="flex items-center justify-between py-2 cursor-pointer group select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#45464d] group-hover:text-[#000000] transition-colors">
                      trending_up
                    </span>
                    Forecasting Revenue
                  </span>
                  <span className="text-[13px] text-[#45464d] pl-[26px]">
                    Include in projected revenue calculations
                  </span>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200">
                  <input
                    type="checkbox"
                    checked={formData.forecastingRevenue}
                    onChange={(e) =>
                      setFormData({ ...formData, forecastingRevenue: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#e0e3e5] rounded-full peer peer-checked:bg-[#000000] transition-colors duration-200" />
                  <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-[#f7f9fb]/90 backdrop-blur-xl border-t border-[#c6c6cd]/40 py-3.5 px-6 lg:px-8 flex justify-end gap-3 z-30 shadow-lg">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 rounded-lg bg-transparent text-[#000000] hover:bg-[#eceef0] font-semibold text-[12px] tracking-wider uppercase transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-[#000000] text-white hover:bg-[#2d3133] font-semibold text-[12px] tracking-wider uppercase shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Charge
        </button>
      </div>
    </div>
  );
};

