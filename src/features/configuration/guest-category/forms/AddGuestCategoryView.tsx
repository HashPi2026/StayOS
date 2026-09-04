import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { GuestCategoryItem } from '@/src/types';

interface AddGuestCategoryViewProps {
  isEdit?: boolean;
}

const COLOR_PRESETS = [
  '#0F172A',
  '#0058BE',
  '#10B981',
  '#F59E0B',
  '#BA1A1A',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#64748B',
];

export const AddGuestCategoryView: React.FC<AddGuestCategoryViewProps> = ({ isEdit = false }) => {
  const {
    navigate,
    guestCategories,
    editingGuestCategoryId,
    setEditingGuestCategoryId,
    addGuestCategory,
    updateGuestCategory,
    addToast,
  } = useProperty();

  const editingCategory = isEdit && editingGuestCategoryId
    ? guestCategories.find((c) => c.id === editingGuestCategoryId)
    : null;

  // Form State
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0F172A');
  const [colorInputText, setColorInputText] = useState('#0F172A');
  const [isHighlight, setIsHighlight] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEdit && editingCategory) {
      setName(editingCategory.name);
      setShortName(editingCategory.shortName);
      setDescription(editingCategory.description || '');
      const hexColor = (editingCategory.color || '#0F172A').toUpperCase();
      setColor(hexColor);
      setColorInputText(hexColor);
      setIsHighlight(editingCategory.isHighlight);
      setStatus(editingCategory.status || 'active');
    } else {
      setName('');
      setShortName('');
      setDescription('');
      setColor('#0F172A');
      setColorInputText('#0F172A');
      setIsHighlight(false);
      setStatus('active');
    }
  }, [isEdit, editingCategory]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setColorInputText(newColor.toUpperCase());
  };

  const handleColorTextChange = (text: string) => {
    setColorInputText(text);
    let val = text.trim();
    if (!val.startsWith('#') && val.length > 0) {
      val = '#' + val;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setColor(val);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Category Name is required';
    }
    if (shortName.trim().length > 8) {
      errs.shortName = 'Short Name cannot exceed 8 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fill in the required fields', 'error');
      return;
    }

    const payload: Omit<GuestCategoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      shortName: (shortName.trim() || name.trim().slice(0, 4)).toUpperCase(),
      color: color || '#0F172A',
      description: description.trim(),
      isHighlight,
      highlightIcon: isHighlight ? 'star' : 'none',
      status,
    };

    if (isEdit && editingGuestCategoryId) {
      updateGuestCategory(editingGuestCategoryId, payload);
    } else {
      addGuestCategory(payload);
    }

    setEditingGuestCategoryId(null);
    navigate('guest-categories');
  };

  const handleCancel = () => {
    setEditingGuestCategoryId(null);
    navigate('guest-categories');
  };

  // Preview badge text logic
  const displayBadgeText = (shortName.trim() || name.trim().slice(0, 4) || 'VIP').toUpperCase();

  return (
    <div className="flex flex-col w-full h-full relative" id="guest-category-form-container">
      {/* Header & Breadcrumb */}
      <div className="px-6 md:px-8 py-5 flex flex-col gap-2">
        <nav className="flex items-center gap-1.5 text-xs text-[#75859d]">
          <button
            onClick={() => navigate('guest-categories')}
            className="hover:text-[#191c1e] transition-colors cursor-pointer"
          >
            Configuration
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <button
            onClick={() => navigate('guest-categories')}
            className="hover:text-[#191c1e] transition-colors cursor-pointer"
          >
            Guest Categories
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#191c1e] font-medium">
            {isEdit ? 'Edit Category' : 'Add Category'}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-[26px] font-bold text-[#191c1e] tracking-tight">
            {isEdit ? 'Edit Guest Category' : 'Add New Guest Category'}
          </h1>
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="px-6 md:px-8 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e0e3e5]/80 flex flex-col gap-5">
            <h2 className="text-base font-bold text-[#191c1e] border-b border-[#eceef0] pb-3">
              Category Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cat-name"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  Category Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g., VIP, Corporate, Local"
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-[#191c1e] placeholder-[#9ca3af] focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
                      : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-[#0058be]/20'
                  }`}
                />
                {errors.name && <p className="text-xs text-[#ba1a1a] mt-0.5">{errors.name}</p>}
              </div>

              {/* Short Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cat-short-name"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  Short Name
                </label>
                <input
                  id="cat-short-name"
                  type="text"
                  maxLength={8}
                  value={shortName}
                  onChange={(e) => {
                    setShortName(e.target.value.toUpperCase());
                    if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: '' }));
                  }}
                  placeholder="e.g., CORP"
                  className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 text-sm font-mono uppercase text-[#191c1e] placeholder-[#9ca3af] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
                />
                {errors.shortName && <p className="text-xs text-[#ba1a1a] mt-0.5">{errors.shortName}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cat-description"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                Description
              </label>
              <textarea
                id="cat-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the criteria for this guest category..."
                className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 text-sm text-[#191c1e] placeholder-[#9ca3af] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-none"
              />
            </div>

            {/* Color Picker & Highlight Toggle Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 items-start">
              {/* Color Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Badge Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#c6c6cd] shrink-0 shadow-xs cursor-pointer">
                    <input
                      id="cat-color"
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    id="cat-color-text"
                    type="text"
                    value={colorInputText}
                    onChange={(e) => handleColorTextChange(e.target.value)}
                    className="flex-1 bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-sm text-[#191c1e] font-mono uppercase focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
                  />
                </div>

                {/* Color presets */}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleColorChange(preset)}
                      className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                        color.toUpperCase() === preset.toUpperCase()
                          ? 'ring-2 ring-[#0058be] scale-110 border-white'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset }}
                      title={preset}
                    />
                  ))}
                </div>
              </div>

              {/* Is Highlight Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Visibility
                </label>
                <div className="flex items-start gap-3 mt-1">
                  <button
                    id="toggle-highlight"
                    type="button"
                    role="switch"
                    aria-checked={isHighlight}
                    onClick={() => setIsHighlight(!isHighlight)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:ring-offset-2 ${
                      isHighlight ? 'bg-[#0058be]' : 'bg-[#76777d]'
                    }`}
                  >
                    <span className="sr-only">Toggle Highlight</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isHighlight ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div className="flex flex-col -mt-0.5">
                    <span className="text-sm font-semibold text-[#191c1e]">
                      Highlight in UI
                    </span>
                    <span className="text-xs text-[#75859d] leading-relaxed mt-0.5">
                      Highlighted categories can appear as visual badges on guest profiles and reservation rows.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between pt-4 border-t border-[#eceef0]">
              <div>
                <span className="text-sm font-semibold text-[#191c1e]">Active Status</span>
                <p className="text-xs text-[#75859d]">Category is available for guest profile and booking assignments</p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                  status === 'active'
                    ? 'bg-[#d8e2ff] text-[#001a42] hover:bg-[#c6d7ff]'
                    : 'bg-[#e0e3e5] text-[#45464d] hover:bg-[#d0d3d5]'
                }`}
              >
                {status}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-[#e0e3e5]/70 rounded-xl p-6 sticky top-24 shadow-xs border border-[#c6c6cd]/50 flex flex-col gap-6 items-center justify-center min-h-[340px]">
            <div className="w-full text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                Live Badge Preview
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative py-6">
              {/* Decorative subtle grid background for the preview area */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none rounded-lg"
                style={{
                  backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* The Badge Preview */}
              <div
                id="preview-badge"
                className={`px-3.5 py-1 rounded text-white text-xs font-bold tracking-wider shadow-sm transition-all duration-300 transform hover:scale-105 select-none ${
                  isHighlight ? 'ring-2 ring-offset-2 ring-black/20 shadow-md' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                <span id="preview-text">{displayBadgeText}</span>
              </div>

              {/* Contextual mockup card */}
              <div className="mt-8 w-full max-w-[280px] bg-white rounded-lg p-3.5 shadow-sm border border-[#c6c6cd]/40 flex items-center gap-3 select-none">
                <div className="w-10 h-10 rounded-full bg-[#eceef0] flex items-center justify-center flex-shrink-0 text-[#75859d]">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </div>
                <div className="flex flex-col flex-1 gap-1 overflow-hidden">
                  <div className="text-sm font-semibold text-[#191c1e] truncate">
                    Eleanor Shellstrop
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      id="preview-badge-small"
                      className="px-1.5 py-[2px] rounded text-white text-[9px] font-bold tracking-widest leading-none shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <span id="preview-text-small">{displayBadgeText}</span>
                    </div>
                    <span className="text-xs text-[#75859d]">Room 402</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-[#c6c6cd] px-6 py-3.5 flex items-center justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        <button
          type="button"
          id="cancel-guest-category-btn"
          onClick={handleCancel}
          className="px-5 py-2 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-sm font-medium hover:bg-[#f2f4f6] active:scale-[0.98] transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          id="save-guest-category-btn"
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-[#000000] text-white text-sm font-semibold shadow-sm hover:bg-[#222222] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Category
        </button>
      </div>
    </div>
  );
};
