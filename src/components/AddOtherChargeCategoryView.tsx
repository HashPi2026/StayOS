import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';

interface CategoryPreset {
  shortName: string;
  name: string;
  description: string;
}

const COMMON_PRESETS: CategoryPreset[] = [
  { shortName: 'FB', name: 'Food & Beverage', description: 'Restaurant, bar, banquet, and room service charges.' },
  { shortName: 'LDY', name: 'Laundry', description: 'Guest laundry, pressing, and dry cleaning services.' },
  { shortName: 'SPA', name: 'Spa & Wellness', description: 'Spa treatments, massages, facials, and wellness center fees.' },
  { shortName: 'PKG', name: 'Parking', description: 'Valet and self-parking daily or hourly charges.' },
  { shortName: 'MINI', name: 'Minibar', description: 'In-room minibar snack and beverage consumption.' },
  { shortName: 'TOUR', name: 'Excursions & Tours', description: 'Guided tours, excursions, and local activity booking fees.' },
  { shortName: 'TRAN', name: 'Transportation', description: 'Airport transfers, private shuttle, and taxi service fees.' },
];

export const AddOtherChargeCategoryView: React.FC = () => {
  const {
    otherChargeCategories,
    editingOtherChargeCategoryId,
    setEditingOtherChargeCategoryId,
    addOtherChargeCategory,
    updateOtherChargeCategory,
    navigate,
    addToast,
  } = useProperty();

  const isEditing = Boolean(editingOtherChargeCategoryId);
  const existingCategory = isEditing
    ? otherChargeCategories.find((c) => c.id === editingOtherChargeCategoryId)
    : null;

  // Currently designated default category (excluding current if editing)
  const currentDefaultCategory = otherChargeCategories.find(
    (c) => c.isDefault && (!isEditing || c.id !== editingOtherChargeCategoryId)
  );

  const [formData, setFormData] = useState<{
    shortName: string;
    name: string;
    description: string;
    isDefault: boolean;
  }>({
    shortName: '',
    name: '',
    description: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingCategory) {
      setFormData({
        shortName: existingCategory.shortName,
        name: existingCategory.name,
        description: existingCategory.description || '',
        isDefault: existingCategory.isDefault,
      });
    } else {
      setFormData({
        shortName: '',
        name: '',
        description: '',
        isDefault: false,
      });
    }
    setErrors({});
  }, [existingCategory]);

  const handleCancel = () => {
    setEditingOtherChargeCategoryId(null);
    navigate('other-charges-categories');
  };

  const handlePresetSelect = (preset: CategoryPreset) => {
    setFormData((prev) => ({
      ...prev,
      shortName: preset.shortName,
      name: preset.name,
      description: preset.description,
    }));
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const cleanShortName = formData.shortName.trim().toUpperCase();
    const cleanName = formData.name.trim();

    if (!cleanShortName) {
      newErrors.shortName = 'Short Name is required';
    } else if (cleanShortName.length > 4) {
      newErrors.shortName = 'Short Name must be 4 characters or fewer';
    }

    if (!cleanName) {
      newErrors.name = 'Category Name is required';
    }

    // Check unique short name
    const shortNameConflict = otherChargeCategories.some(
      (c) =>
        c.shortName.toUpperCase() === cleanShortName &&
        (!isEditing || c.id !== editingOtherChargeCategoryId)
    );
    if (shortNameConflict) {
      newErrors.shortName = 'A category with this short name already exists';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please fix the highlighted errors', 'error');
      return;
    }

    if (isEditing && existingCategory) {
      updateOtherChargeCategory(existingCategory.id, {
        shortName: cleanShortName,
        name: cleanName,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
      });
    } else {
      addOtherChargeCategory({
        shortName: cleanShortName,
        name: cleanName,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
      });
    }

    setEditingOtherChargeCategoryId(null);
    navigate('other-charges-categories');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative pb-28">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-[13px] text-[#75859d] mb-4">
            <button
              onClick={() => {
                setEditingOtherChargeCategoryId(null);
                navigate('overview');
              }}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Configuration
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <button
              onClick={() => {
                setEditingOtherChargeCategoryId(null);
                navigate('overview');
              }}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <button
              onClick={handleCancel}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Other Charges Categories
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-[#191c1e] font-medium">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </span>
          </nav>

          {/* Page Heading */}
          <div>
            <h1 className="text-[24px] md:text-[26px] font-bold text-[#191c1e] tracking-tight mb-1">
              {isEditing ? 'Edit Other Charges Category' : 'Add Other Charges Category'}
            </h1>
            <p className="text-[14px] text-[#75859d]">
              Create a new category for non-room charges to organize guest folios.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] p-6 md:p-8 space-y-8">
            <form id="other-charge-form" onSubmit={handleSubmit}>
              {/* Section 1: Identity & Classification */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#001a42]">
                      category
                    </span>
                  </div>
                  <h2 className="text-[17px] font-semibold text-[#191c1e]">
                    Identity & Classification
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-11">
                  {/* Short Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="shortNameInput"
                      className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1"
                    >
                      <span>Short Name</span>
                      <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      id="shortNameInput"
                      type="text"
                      maxLength={4}
                      value={formData.shortName}
                      onChange={(e) =>
                        setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., FB"
                      className={`w-full bg-white border rounded-lg px-3.5 py-2 text-[14px] font-mono uppercase focus:ring-2 transition-all outline-none ${
                        errors.shortName
                          ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
                          : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                      }`}
                    />
                    {errors.shortName ? (
                      <span className="text-[11px] text-[#ba1a1a] font-medium block">
                        {errors.shortName}
                      </span>
                    ) : (
                      <p className="text-[11px] text-[#75859d]">
                        Max 4 characters. Used in compact reports.
                      </p>
                    )}
                  </div>

                  {/* Category Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="categoryNameInput"
                      className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1"
                    >
                      <span>Category Name</span>
                      <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      id="categoryNameInput"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Food & Beverage"
                      className={`w-full bg-white border rounded-lg px-3.5 py-2 text-[14px] focus:ring-2 transition-all outline-none ${
                        errors.name
                          ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
                          : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                      }`}
                    />
                    {errors.name && (
                      <span className="text-[11px] text-[#ba1a1a] font-medium block">
                        {errors.name}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="h-[1px] w-full bg-[#e0e3e5] my-8" />

              {/* Section 2: Description */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#001a42]">
                      description
                    </span>
                  </div>
                  <h2 className="text-[17px] font-semibold text-[#191c1e]">Description</h2>
                </div>

                <div className="pl-0 md:pl-11">
                  <label htmlFor="descriptionInput" className="sr-only">
                    Description
                  </label>
                  <textarea
                    id="descriptionInput"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details about this category..."
                    className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] resize-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all outline-none placeholder:text-[#75859d]/60"
                  />
                </div>
              </section>

              {/* Divider */}
              <div className="h-[1px] w-full bg-[#e0e3e5] my-8" />

              {/* Section 3: Property Defaults */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#001a42]">
                      settings
                    </span>
                  </div>
                  <h2 className="text-[17px] font-semibold text-[#191c1e]">Property Defaults</h2>
                </div>

                <div className="pl-0 md:pl-11 space-y-3">
                  <div className="flex items-start gap-4">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isDefault}
                      onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 mt-0.5 shadow-inner ${
                        formData.isDefault ? 'bg-[#000000]' : 'bg-[#e0e3e5]'
                      }`}
                    >
                      <span className="sr-only">Set as default category</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formData.isDefault
                            ? 'translate-x-[22px] translate-y-[2px]'
                            : 'translate-x-[2px] translate-y-[2px]'
                        }`}
                      />
                    </button>

                    <div>
                      <span className="block text-[14px] font-semibold text-[#191c1e]">
                        Default Category
                      </span>
                      <span className="block text-[13px] text-[#75859d] mt-0.5">
                        If enabled, this category will be the default for non-room charges.
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Alert Banner */}
                  {formData.isDefault && (
                    <div className="bg-[#d8e2ff] text-[#001a42] rounded-lg p-3.5 flex items-start gap-3 border border-[#adc6ff] animate-fadeIn mt-3">
                      <span className="material-symbols-outlined text-[20px] text-[#0058be] shrink-0 mt-0.5">
                        info
                      </span>
                      <div className="text-[13px] leading-relaxed">
                        Enabling this will replace{' '}
                        <strong>
                          {currentDefaultCategory ? currentDefaultCategory.name : 'the existing default'}
                        </strong>{' '}
                        as the property&apos;s default other charge category.
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Divider */}
              <div className="h-[1px] w-full bg-[#e0e3e5] my-8" />

              {/* Section 4: Common Categories */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eceef0] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                      visibility
                    </span>
                  </div>
                  <h2 className="text-[17px] font-semibold text-[#191c1e]">Common Categories</h2>
                </div>

                <div className="pl-0 md:pl-11">
                  <p className="text-[12px] text-[#75859d] mb-2.5">
                    Click a quick template to autofill standard category attributes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_PRESETS.map((preset) => (
                      <button
                        key={preset.shortName}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${
                          formData.shortName === preset.shortName
                            ? 'bg-[#191c1e] text-white border-[#191c1e] shadow-xs'
                            : 'bg-[#f2f4f6] text-[#45464d] border-[#c6c6cd]/60 hover:bg-[#e0e3e5] hover:text-[#191c1e]'
                        }`}
                      >
                        <span className="font-mono text-[11px] font-semibold opacity-75 mr-1.5">
                          {preset.shortName}
                        </span>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Toolbar */}
      <div className="fixed bottom-0 left-0 md:left-60 right-0 bg-white/95 backdrop-blur-md border-t border-[#e0e3e5] px-6 md:px-8 py-3.5 flex items-center justify-end gap-3 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] bg-transparent hover:bg-[#f2f4f6] transition-colors border border-[#c6c6cd] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="other-charge-form"
          className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#000000] hover:bg-[#2d3133] shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
        >
          <span>{isEditing ? 'Save Changes' : 'Save Category'}</span>
          <span className="material-symbols-outlined text-[18px]">check</span>
        </button>
      </div>
    </div>
  );
};
