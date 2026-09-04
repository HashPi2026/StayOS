import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const PolicyDrawer: React.FC = () => {
  const {
    isPolicyDrawerOpen,
    drawerPolicy,
    closePolicyDrawer,
    addPolicy,
    updatePolicy,
    roomTypes,
    rateTypes,
  } = useProperty();

  const isEdit = Boolean(drawerPolicy);

  // Form State
  const [roomTypeId, setRoomTypeId] = useState<string>('all');
  const [roomTypeName, setRoomTypeName] = useState<string>('All Room Types');
  const [rateTypeId, setRateTypeId] = useState<string>('all');
  const [rateTypeName, setRateTypeName] = useState<string>('All Rate Types');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync state with drawerPolicy on open
  useEffect(() => {
    if (drawerPolicy) {
      setRoomTypeId(drawerPolicy.roomTypeId || 'all');
      setRoomTypeName(drawerPolicy.roomTypeName || 'All Room Types');
      setRateTypeId(drawerPolicy.rateTypeId || 'all');
      setRateTypeName(drawerPolicy.rateTypeName || 'All Rate Types');
      setContent(drawerPolicy.content || '');
      setError(null);
    } else {
      setRoomTypeId('all');
      setRoomTypeName('All Room Types');
      setRateTypeId('all');
      setRateTypeName('All Rate Types');
      setContent('');
      setError(null);
    }
  }, [drawerPolicy, isPolicyDrawerOpen]);

  if (!isPolicyDrawerOpen) return null;

  // Compile unique room type options
  const defaultRoomTypeOptions = [
    'All Room Types',
    'Deluxe King',
    'Executive Suite',
    'Presidential Penthouse',
    'Standard Single',
    'Superior Double',
    'Family Suite',
    'Junior Suite',
    'Ocean Villa',
    'Grand Suite',
    ...roomTypes.map((rt) => rt.name),
  ];
  const uniqueRoomTypeOptions = Array.from(new Set(defaultRoomTypeOptions));

  // Compile unique rate type options
  const defaultRateTypeOptions = [
    'All Rate Types',
    'Standard Rate',
    'Non-Refundable',
    'Early Bird',
    'VIP Flexible',
    'Weekend Special',
    'Corporate Rate',
    'Promotional Package',
    'Long Stay Discount',
    'Government / Military',
    ...rateTypes.map((rt) => rt.name),
  ];
  const uniqueRateTypeOptions = Array.from(new Set(defaultRateTypeOptions));

  // Handle Room Type change
  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setRoomTypeName(selectedName);
    if (selectedName === 'All Room Types') {
      setRoomTypeId('all');
    } else {
      const found = roomTypes.find((rt) => rt.name === selectedName);
      setRoomTypeId(found ? found.id : selectedName.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  // Handle Rate Type change
  const handleRateTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setRateTypeName(selectedName);
    if (selectedName === 'All Rate Types') {
      setRateTypeId('all');
    } else {
      const found = rateTypes.find((rt) => rt.name === selectedName);
      setRateTypeId(found ? found.id : selectedName.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  // Quick formatting toolbar insertion
  const applyFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('policy-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const before = content.substring(0, start);
    const after = content.substring(end);

    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(newText);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Policy content is required.');
      return;
    }

    if (isEdit && drawerPolicy) {
      updatePolicy(drawerPolicy.id, {
        roomTypeId,
        roomTypeName,
        rateTypeId,
        rateTypeName,
        content: content.trim(),
      });
    } else {
      addPolicy({
        roomTypeId,
        roomTypeName,
        rateTypeId,
        rateTypeName,
        content: content.trim(),
        policyType: content.toLowerCase().includes('deposit') ? 'deposit' : 'cancellation',
      });
    }

    closePolicyDrawer();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="policy-drawer-backdrop"
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={closePolicyDrawer}
      />

      {/* Slide-out Drawer */}
      <div
        id="policy-drawer-panel"
        className="fixed top-0 right-0 h-full w-[480px] max-w-full bg-[#f8f9fb] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out border-l border-[#e5e7eb]"
      >
        {/* Drawer Header */}
        <div
          id="policy-drawer-header"
          className="px-6 py-5 flex items-center justify-between bg-white border-b border-[#e5e7eb] shadow-xs shrink-0"
        >
          <div>
            <h2 id="policy-drawer-title" className="text-lg font-bold text-[#191c1e]">
              {isEdit ? 'Edit Policy' : 'Add Policy'}
            </h2>
            <p className="text-xs text-[#76777d] mt-0.5">
              {isEdit ? 'Update cancellation & deposit terms' : 'Define new booking rule'}
            </p>
          </div>
          <button
            id="policy-drawer-close-btn"
            type="button"
            onClick={closePolicyDrawer}
            className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#76777d] hover:text-[#191c1e] transition-colors cursor-pointer"
            title="Close drawer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Selects: Room Type and Rate Type */}
            <div className="space-y-4">
              {/* Room Type */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="policy-room-type-select" className="text-xs font-semibold text-[#191c1e]">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="policy-room-type-select"
                    value={roomTypeName}
                    onChange={handleRoomTypeChange}
                    className="w-full appearance-none bg-white border border-[#d8dadc] focus:border-[#0058be] rounded-lg px-3.5 py-2.5 text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 shadow-xs cursor-pointer pr-10"
                  >
                    {uniqueRoomTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Rate Type */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="policy-rate-type-select" className="text-xs font-semibold text-[#191c1e]">
                  Rate Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="policy-rate-type-select"
                    value={rateTypeName}
                    onChange={handleRateTypeChange}
                    className="w-full appearance-none bg-white border border-[#d8dadc] focus:border-[#0058be] rounded-lg px-3.5 py-2.5 text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 shadow-xs cursor-pointer pr-10"
                  >
                    {uniqueRateTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Policy Content Editor */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="policy-content-textarea" className="text-xs font-semibold text-[#191c1e]">
                Policy Content <span className="text-red-500">*</span>
              </label>
              <div className="bg-white rounded-lg shadow-xs overflow-hidden flex flex-col border border-[#d8dadc] focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[#0058be]/20">
                {/* Editor Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-[#f8f9fa] border-b border-[#e5e7eb]">
                  <button
                    type="button"
                    onClick={() => applyFormat('**', '**')}
                    className="p-1 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('*', '*')}
                    className="p-1 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('<u>', '</u>')}
                    className="p-1 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer"
                    title="Underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                  </button>
                  <div className="w-px h-4 bg-[#d1d5db] mx-1" />
                  <button
                    type="button"
                    onClick={() => applyFormat('\n• ')}
                    className="p-1 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer"
                    title="Bullet List"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('[', '](https://)')}
                    className="p-1 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer"
                    title="Link"
                  >
                    <span className="material-symbols-outlined text-[18px]">link</span>
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  id="policy-content-textarea"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (error) setError(null);
                  }}
                  rows={4}
                  className="w-full p-3.5 bg-transparent border-none resize-none text-sm text-[#191c1e] focus:outline-none placeholder-[#9ca3af] leading-relaxed"
                  placeholder="Enter policy terms here..."
                />
              </div>
              {error && <p className="text-red-600 text-xs font-medium mt-1">{error}</p>}
            </div>

            {/* Live Preview */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0058be]">visibility</span>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777d]">
                  Live Preview
                </label>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-xs border border-[#e5e7eb] relative min-h-[110px]">
                <div className="absolute top-0 right-0 bg-blue-50 text-[#0058be] text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider border-l border-b border-blue-100">
                  Guest Folio View
                </div>
                <div className="font-serif text-[14px] leading-relaxed text-[#374151] italic mt-2">
                  {content ? (
                    `"${content}"`
                  ) : (
                    <span className="text-[#9ca3af] not-italic font-sans text-xs">
                      Policy text will appear formatted here in real time...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div
            id="policy-drawer-footer"
            className="pt-6 border-t border-[#e5e7eb] flex items-center justify-end gap-3 shrink-0 bg-[#f8f9fb]"
          >
            <button
              id="policy-drawer-cancel-btn"
              type="button"
              onClick={closePolicyDrawer}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#191c1e] bg-white border border-[#d8dadc] hover:bg-[#f3f4f6] transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              id="policy-drawer-save-btn"
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#191c1e] hover:bg-black transition-all shadow-sm cursor-pointer"
            >
              Save Policy
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
