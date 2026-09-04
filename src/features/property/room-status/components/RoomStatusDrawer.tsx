import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoomStatusConfig } from '@/src/types';

export const RoomStatusDrawer: React.FC = () => {
  const {
    isRoomStatusDrawerOpen,
    drawerRoomStatus,
    closeRoomStatusDrawer,
    addRoomStatus,
    updateRoomStatus,
    roomStatuses,
  } = useProperty();

  const isEditing = Boolean(drawerRoomStatus);

  const [formData, setFormData] = useState<{
    name: string;
    shortName: string;
    code: string;
    bgColor: string;
    textColor: string;
    isActive: boolean;
    description: string;
  }>({
    name: '',
    shortName: '',
    code: '',
    bgColor: '#22c55e',
    textColor: '#ffffff',
    isActive: true,
    description: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
  }>({});

  useEffect(() => {
    if (drawerRoomStatus) {
      setFormData({
        name: drawerRoomStatus.name,
        shortName: drawerRoomStatus.shortName || '',
        code: drawerRoomStatus.code || '',
        bgColor: drawerRoomStatus.bgColor || '#22c55e',
        textColor: drawerRoomStatus.textColor || '#ffffff',
        isActive: drawerRoomStatus.isActive ?? true,
        description: drawerRoomStatus.description || '',
      });
    } else {
      // Auto suggest next code
      const nextNum = (roomStatuses.length + 1).toString().padStart(2, '0');
      setFormData({
        name: '',
        shortName: '',
        code: nextNum,
        bgColor: '#22c55e',
        textColor: '#ffffff',
        isActive: true,
        description: '',
      });
    }
    setErrors({});
  }, [drawerRoomStatus, isRoomStatusDrawerOpen, roomStatuses.length]);

  if (!isRoomStatusDrawerOpen) return null;

  const validate = () => {
    const errs: { name?: string; code?: string } = {};
    if (!formData.name.trim()) {
      errs.name = 'Status name is required';
    }
    if (!formData.code.trim()) {
      errs.code = 'Status code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNameChange = (val: string) => {
    // Generate auto shortName if not customized
    const trimmed = val.trim();
    let autoShort = formData.shortName;
    if (!isEditing && (!formData.shortName || formData.shortName === generateShortCode(formData.name))) {
      autoShort = generateShortCode(trimmed);
    }
    setFormData((prev) => ({
      ...prev,
      name: val,
      shortName: autoShort,
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const generateShortCode = (name: string) => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 3).toUpperCase();
    }
    return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && drawerRoomStatus) {
      const success = updateRoomStatus(drawerRoomStatus.id, {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || formData.name.slice(0, 3).toUpperCase(),
        code: formData.code.trim(),
        bgColor: formData.bgColor,
        textColor: formData.textColor,
        isActive: formData.isActive,
        description: formData.description.trim(),
      });
      if (success) closeRoomStatusDrawer();
    } else {
      const success = addRoomStatus({
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || formData.name.slice(0, 3).toUpperCase(),
        code: formData.code.trim(),
        bgColor: formData.bgColor,
        textColor: formData.textColor,
        isActive: formData.isActive,
        description: formData.description.trim(),
      });
      if (success) closeRoomStatusDrawer();
    }
  };

  // Synchronize HEX text inputs
  const handleBgColorHex = (val: string) => {
    setFormData((prev) => ({ ...prev, bgColor: val }));
  };

  const handleTextColorHex = (val: string) => {
    setFormData((prev) => ({ ...prev, textColor: val }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={closeRoomStatusDrawer}
      />

      {/* Drawer Container */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out font-body-md text-[#191c1e]">
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e0e3e5] shrink-0 bg-[#f7f9fb]/90 backdrop-blur-md">
          <h2 className="text-[18px] font-bold text-[#191c1e]">
            {isEditing ? 'Edit Room Status' : 'Add Room Status'}
          </h2>
          <button
            onClick={closeRoomStatusDrawer}
            className="p-1.5 text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Live Preview */}
          <div className="bg-[#f2f4f6] rounded-xl p-6 flex flex-col gap-2 items-center justify-center min-h-[140px] shadow-inner relative overflow-hidden border border-[#e0e3e5]">
            <div className="absolute inset-0 bg-[radial-gradient(#c6c6cd_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#75859d] z-10 bg-[#f2f4f6] px-2 py-0.5 rounded">
              Live Preview
            </span>
            <div
              className="px-5 py-2.5 rounded-lg font-bold text-[15px] tracking-wider uppercase shadow-sm transition-all duration-200 z-10 flex items-center justify-center min-w-[140px]"
              style={{
                backgroundColor: formData.bgColor,
                color: formData.textColor,
                opacity: formData.isActive ? 1 : 0.6,
              }}
            >
              {formData.name.trim() ? formData.name.toUpperCase() : 'STATUS NAME'}
            </div>
            {!formData.isActive && (
              <span className="text-[11px] font-medium text-[#75859d] z-10 mt-0.5">
                (Inactive Mode)
              </span>
            )}
          </div>

          {/* Form Fields */}
          <form id="room-status-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Status Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#45464d]" htmlFor="statusName">
                Status Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="statusName"
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Vacant Clean, Out of Order, Early Check-In"
                className={`w-full bg-white border ${
                  errors.name ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20' : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                } rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] focus:outline-none focus:ring-2 transition-all shadow-2xs`}
              />
              {errors.name && <p className="text-[12px] text-[#ba1a1a]">{errors.name}</p>}
            </div>

            {/* Short Name & Status Code in 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#45464d]" htmlFor="shortName">
                  Short Name
                </label>
                <input
                  id="shortName"
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortName: e.target.value.toUpperCase() }))}
                  placeholder="VC"
                  maxLength={6}
                  className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 font-mono text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all uppercase shadow-2xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#45464d]" htmlFor="statusCode">
                  Status Code <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="statusCode"
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }));
                    if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder="01"
                  maxLength={8}
                  className={`w-full bg-white border ${
                    errors.code ? 'border-[#ba1a1a]' : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-[#0058be]/20'
                  } rounded-lg px-3.5 py-2.5 font-mono text-[14px] text-[#191c1e] focus:outline-none focus:ring-2 transition-all shadow-2xs`}
                />
                {errors.code && <p className="text-[12px] text-[#ba1a1a]">{errors.code}</p>}
              </div>
            </div>

            {/* Colors Section */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Background Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#45464d]" htmlFor="bgColorPicker">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="bgColorPicker"
                    type="color"
                    value={formData.bgColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bgColor: e.target.value }))}
                    className="h-10 w-10 p-0 border-0 rounded cursor-pointer shrink-0 shadow-2xs bg-transparent"
                  />
                  <input
                    id="bgColorText"
                    type="text"
                    value={formData.bgColor}
                    onChange={(e) => handleBgColorHex(e.target.value)}
                    placeholder="#22C55E"
                    className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3 py-2 font-mono text-[13px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 uppercase shadow-2xs"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#45464d]" htmlFor="textColorPicker">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="textColorPicker"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="h-10 w-10 p-0 border-0 rounded cursor-pointer shrink-0 shadow-2xs bg-transparent"
                  />
                  <input
                    id="textColorText"
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => handleTextColorHex(e.target.value)}
                    placeholder="#FFFFFF"
                    className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3 py-2 font-mono text-[13px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 uppercase shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[13px] font-semibold text-[#45464d]" htmlFor="statusDesc">
                Operational Notes / Description
              </label>
              <textarea
                id="statusDesc"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Guidelines or workflow notes for housekeeping and front desk..."
                className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[13px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-none shadow-2xs"
              />
            </div>

            {/* Status Active Toggle Switch */}
            <div className="flex items-center justify-between mt-2 p-3.5 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5]">
              <div>
                <label className="text-[14px] font-semibold text-[#191c1e] cursor-pointer block" htmlFor="isActiveToggle">
                  Status Active
                </label>
                <p className="text-[12px] text-[#75859d]">
                  When active, staff can assign this status to rooms in the property dashboard.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="isActiveToggle"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000000] shadow-inner" />
              </label>
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="h-16 border-t border-[#e0e3e5] flex items-center justify-end px-6 gap-3 shrink-0 bg-[#f7f9fb]">
          <button
            type="button"
            onClick={closeRoomStatusDrawer}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg text-[#191c1e] hover:bg-[#e0e3e5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="room-status-form"
            className="bg-[#000000] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Create Status'}
          </button>
        </div>
      </div>
    </>
  );
};
