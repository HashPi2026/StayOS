import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '../context/PropertyContext';

const AVAILABLE_ICONS = [
  { id: 'scale', label: 'Weight / Scale', icon: 'scale' },
  { id: 'water_drop', label: 'Liquid / Volume', icon: 'water_drop' },
  { id: 'category', label: 'Unit / Piece', icon: 'category' },
  { id: 'grain', label: 'Dry / Grain', icon: 'grain' },
  { id: 'wine_bar', label: 'Bottle / Glass', icon: 'wine_bar' },
  { id: 'inventory_2', label: 'Box / Package', icon: 'inventory_2' },
  { id: 'schedule', label: 'Hour / Duration', icon: 'schedule' },
  { id: 'straighten', label: 'Length / Dimension', icon: 'straighten' },
  { id: 'square_foot', label: 'Area / Space', icon: 'square_foot' },
];

export const MeasurementUnitDrawer: React.FC = () => {
  const {
    isMeasurementUnitDrawerOpen,
    drawerMeasurementUnit,
    closeMeasurementUnitDrawer,
    addMeasurementUnit,
    updateMeasurementUnit,
    isMeasurementUnitNameUnique,
    isMeasurementUnitShortNameUnique,
  } = useProperty();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('scale');

  const [errors, setErrors] = useState<{ name?: string; shortName?: string }>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(drawerMeasurementUnit);

  useEffect(() => {
    if (isMeasurementUnitDrawerOpen) {
      if (drawerMeasurementUnit) {
        setName(drawerMeasurementUnit.name);
        setShortName(drawerMeasurementUnit.shortName);
        setDescription(drawerMeasurementUnit.description || '');
        setSelectedIcon(drawerMeasurementUnit.icon || 'scale');
      } else {
        setName('');
        setShortName('');
        setDescription('');
        setSelectedIcon('scale');
      }
      setErrors({});
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  }, [isMeasurementUnitDrawerOpen, drawerMeasurementUnit]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMeasurementUnitDrawerOpen) {
        closeMeasurementUnitDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMeasurementUnitDrawerOpen, closeMeasurementUnitDrawer]);

  if (!isMeasurementUnitDrawerOpen) return null;

  const validate = (): boolean => {
    const newErrors: { name?: string; shortName?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Measurement unit name is required';
    } else if (!isMeasurementUnitNameUnique(name.trim(), drawerMeasurementUnit?.id)) {
      newErrors.name = `Unit "${name.trim()}" already exists`;
    }

    if (!shortName.trim()) {
      newErrors.shortName = 'Short name is required';
    } else if (shortName.trim().length > 5) {
      newErrors.shortName = 'Short name must be 5 characters or less';
    } else if (!isMeasurementUnitShortNameUnique(shortName.trim(), drawerMeasurementUnit?.id)) {
      newErrors.shortName = `Short name "${shortName.trim().toUpperCase()}" already in use`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && drawerMeasurementUnit) {
      const success = updateMeasurementUnit(drawerMeasurementUnit.id, {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        description: description.trim(),
        icon: selectedIcon,
      });
      if (success) {
        closeMeasurementUnitDrawer();
      }
    } else {
      const success = addMeasurementUnit({
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        description: description.trim(),
        icon: selectedIcon,
      });
      if (success) {
        closeMeasurementUnitDrawer();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="drawer-backdrop"
        onClick={closeMeasurementUnitDrawer}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out cursor-pointer"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="side-drawer"
          className="w-screen max-w-[480px] bg-white shadow-2xl flex flex-col border-l border-[#e0e3e5] animate-in slide-in-from-right duration-300"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e0e3e5] bg-[#ffffff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#191c1e]">
                <span className="material-symbols-outlined text-[20px]">{selectedIcon}</span>
              </div>
              <h2 id="drawer-title" className="text-[18px] font-semibold text-[#191c1e]">
                {isEditing ? 'Edit Measurement Unit' : 'Add Measurement Unit'}
              </h2>
            </div>
            <button
              onClick={closeMeasurementUnitDrawer}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#76777d] hover:bg-[#eceef0] hover:text-[#191c1e] transition-colors cursor-pointer"
              title="Close drawer (Esc)"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Form Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Measurement Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="measurement-input"
                className="block text-[13px] font-semibold text-[#191c1e]"
              >
                Measurement <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="measurement-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g., Gram, Meter, Liter"
                className={`w-full h-11 px-3.5 bg-white border ${
                  errors.name ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20' : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                } rounded-lg text-[14px] text-[#191c1e] placeholder:text-[#76777d] focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.name && (
                <p className="text-[12px] text-[#ba1a1a] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Short Name Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="shortname-input"
                className="block text-[13px] font-semibold text-[#191c1e]"
              >
                Short Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <input
                  id="shortname-input"
                  type="text"
                  maxLength={5}
                  value={shortName}
                  onChange={(e) => {
                    setShortName(e.target.value.toUpperCase());
                    if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: undefined }));
                  }}
                  placeholder="e.g., G, M, KG"
                  className={`w-full h-11 pl-3.5 pr-24 bg-white border ${
                    errors.shortName ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20' : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                  } rounded-lg font-mono text-[14px] uppercase text-[#191c1e] placeholder:text-[#76777d] placeholder:normal-case focus:outline-none focus:ring-2 transition-all`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[11px] font-medium pointer-events-none select-none">
                  {shortName.length}/5 max
                </div>
              </div>
              {errors.shortName && (
                <p className="text-[12px] text-[#ba1a1a] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.shortName}
                </p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="description-input"
                  className="block text-[13px] font-semibold text-[#191c1e]"
                >
                  Description
                </label>
                <span className="text-[11px] text-[#76777d] font-normal">Optional</span>
              </div>
              <textarea
                id="description-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context on where and how this unit is used..."
                className="w-full p-3 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all resize-none"
              />
            </div>

            {/* Icon Visual Selection */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-[#191c1e]">
                Display Icon
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const isSelected = selectedIcon === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedIcon(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0058be] bg-[#0058be]/5 text-[#0058be] font-medium ring-1 ring-[#0058be]'
                          : 'border-[#c6c6cd]/60 hover:bg-[#f2f4f6] text-[#45464d]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] mb-1">
                        {item.icon}
                      </span>
                      <span className="text-[11px] leading-tight truncate w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Helpful Informational Box */}
            <div className="p-3.5 rounded-lg bg-[#f2f4f6] border border-[#e0e3e5] flex gap-3 items-start text-[12px] text-[#45464d]">
              <span className="material-symbols-outlined text-[#0058be] text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <div>
                <p className="font-semibold text-[#191c1e] mb-0.5">Where is this used?</p>
                <p className="leading-relaxed">
                  Configured measurement units appear in stock keeping, laundry charges, minibar items, and POS retail catalogs across StayOS.
                </p>
              </div>
            </div>
          </form>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-[#e0e3e5] bg-[#ffffff] flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancel-unit"
              onClick={closeMeasurementUnitDrawer}
              className="h-10 px-4 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-[13px] font-medium hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-unit"
              onClick={handleSave}
              className="h-10 px-5 rounded-lg bg-[#000000] text-white text-[13px] font-medium hover:bg-[#1f1f1f] transition-opacity shadow-sm flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isEditing ? 'Save Changes' : 'Save Unit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
