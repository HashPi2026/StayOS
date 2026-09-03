import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '../context/PropertyContext';

interface AddPolicyViewProps {
  isEdit?: boolean;
}

type PreviewTab = 'confirmation' | 'folio' | 'email';

export const AddPolicyView: React.FC<AddPolicyViewProps> = ({ isEdit = false }) => {
  const {
    policies,
    editingPolicyId,
    drawerPolicy,
    addPolicy,
    updatePolicy,
    roomTypes,
    rateTypes,
    navigate,
    addToast,
  } = useProperty();

  const targetPolicy = isEdit
    ? drawerPolicy || policies.find((p) => p.id === editingPolicyId)
    : null;

  // Form states
  const [roomTypeName, setRoomTypeName] = useState<string>('');
  const [rateTypeName, setRateTypeName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [activeTab, setActiveTab] = useState<PreviewTab>('confirmation');
  const [errors, setErrors] = useState<{ roomType?: string; rateType?: string; content?: string }>({});

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Predefined options
  const defaultRoomTypeOptions = [
    'All Room Types',
    'Deluxe King',
    'Executive Suite',
    'Standard Double',
    'Presidential Penthouse',
    'Standard Single',
    'Superior Double',
    'Family Suite',
    'Junior Suite',
    'Ocean Villa',
    ...roomTypes.map((rt) => rt.name),
  ];
  const uniqueRoomTypeOptions = Array.from(new Set(defaultRoomTypeOptions));

  const defaultRateTypeOptions = [
    'All Rate Types',
    'Standard Rate',
    'Non-Refundable',
    'Early Bird',
    'Corporate Rate',
    'VIP Flexible',
    'Weekend Special',
    'Promotional Package',
    'Long Stay Discount',
    'Government / Military',
    ...rateTypes.map((rt) => rt.name),
  ];
  const uniqueRateTypeOptions = Array.from(new Set(defaultRateTypeOptions));

  // Initialize or populate when editing
  useEffect(() => {
    if (targetPolicy) {
      setRoomTypeName(targetPolicy.roomTypeName || 'All Room Types');
      setRateTypeName(targetPolicy.rateTypeName || 'All Rate Types');
      setContent(targetPolicy.content || '');
    } else {
      setRoomTypeName('');
      setRateTypeName('');
      setContent('');
    }
    setErrors({});
  }, [targetPolicy, isEdit]);

  // Insert Variable helper
  const handleInsertVariable = (variableTag: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const prevText = content;

    const newText = prevText.substring(0, startPos) + variableTag + prevText.substring(endPos);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + variableTag.length, startPos + variableTag.length);
    }, 0);
  };

  // Rich Text Formatting helpers
  const applyFormat = (prefix: string, suffix: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const selectedText = content.substring(startPos, endPos) || 'text';
    const before = content.substring(0, startPos);
    const after = content.substring(endPos);

    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + prefix.length, startPos + prefix.length + selectedText.length);
    }, 0);
  };

  // Helper to render variables dynamically inside previews
  const getResolvedPreviewText = () => {
    if (!content.trim()) return '';

    const effectiveRoom = roomTypeName && roomTypeName !== 'All Room Types' ? roomTypeName : 'Deluxe King';
    const effectiveRate = rateTypeName && rateTypeName !== 'All Rate Types' ? rateTypeName : 'Standard Rate';
    const effectiveCheckIn = 'Oct 15, 2026';

    return content
      .replace(/\{\{Room_Type\}\}/g, effectiveRoom)
      .replace(/\{\{Rate_Type\}\}/g, effectiveRate)
      .replace(/\{\{Check_In\}\}/g, effectiveCheckIn)
      .replace(/\{\{Property_Name\}\}/g, 'Grand Plaza Hotel');
  };

  // Rate short code for Folio
  const getRateShortCode = () => {
    if (!rateTypeName || rateTypeName === 'All Rate Types') return 'STND';
    if (rateTypeName.toLowerCase().includes('non-ref')) return 'NONREF';
    if (rateTypeName.toLowerCase().includes('early')) return 'EARLY';
    if (rateTypeName.toLowerCase().includes('corp')) return 'CORP';
    if (rateTypeName.toLowerCase().includes('flex') || rateTypeName.toLowerCase().includes('vip')) return 'FLEX';
    return rateTypeName.substring(0, 4).toUpperCase();
  };

  // Form Validation and Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { roomType?: string; rateType?: string; content?: string } = {};

    if (!roomTypeName.trim()) {
      newErrors.roomType = 'Please select a room type';
    }
    if (!rateTypeName.trim()) {
      newErrors.rateType = 'Please select a rate type';
    }
    if (!content.trim()) {
      newErrors.content = 'Policy content cannot be empty';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const roomTypeFound = roomTypes.find((r) => r.name === roomTypeName);
    const roomTypeId =
      roomTypeName === 'All Room Types'
        ? 'all'
        : roomTypeFound
        ? roomTypeFound.id
        : roomTypeName.toLowerCase().replace(/\s+/g, '-');

    const rateTypeFound = rateTypes.find((r) => r.name === rateTypeName);
    const rateTypeId =
      rateTypeName === 'All Rate Types'
        ? 'all'
        : rateTypeFound
        ? rateTypeFound.id
        : rateTypeName.toLowerCase().replace(/\s+/g, '-');

    const isDeposit = content.toLowerCase().includes('deposit');

    if (isEdit && targetPolicy) {
      updatePolicy(targetPolicy.id, {
        roomTypeId,
        roomTypeName,
        rateTypeId,
        rateTypeName,
        content: content.trim(),
        policyType: isDeposit ? 'deposit' : 'cancellation',
      });
      if (addToast) {
        addToast({
          title: 'Policy Updated',
          message: 'The policy terms have been successfully updated.',
          type: 'success',
        });
      }
    } else {
      addPolicy({
        roomTypeId,
        roomTypeName,
        rateTypeId,
        rateTypeName,
        content: content.trim(),
        policyType: isDeposit ? 'deposit' : 'cancellation',
      });
      if (addToast) {
        addToast({
          title: 'Policy Created',
          message: 'New policy rule has been created successfully.',
          type: 'success',
        });
      }
    }

    navigate('policies');
  };

  const resolvedText = getResolvedPreviewText();

  return (
    <div id="add-policy-view" className="flex-1 flex flex-col min-h-screen bg-[#f8f9fb]">
      {/* Top Header Bar with Standard Padding & Borders */}
      <div
        id="policy-form-header"
        className="px-8 py-6 bg-white border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs"
      >
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#6b7280] mb-1.5">
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] transition-colors cursor-pointer font-medium"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[14px] text-[#9ca3af]">chevron_right</span>
            <button
              onClick={() => navigate('policies')}
              className="hover:text-[#191c1e] transition-colors cursor-pointer font-medium"
            >
              Policies
            </button>
            <span className="material-symbols-outlined text-[14px] text-[#9ca3af]">chevron_right</span>
            <span className="font-semibold text-[#191c1e]">
              {isEdit ? 'Edit Policy' : 'Add New Policy'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            {isEdit ? 'Edit Policy' : 'Add New Policy'}
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Define cancellation, deposit, or general booking rules.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            id="policy-form-cancel-top-btn"
            type="button"
            onClick={() => navigate('policies')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#191c1e] bg-white border border-[#d8dadc] hover:bg-[#f3f4f6] transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            id="policy-form-save-top-btn"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#191c1e] hover:bg-black transition-all shadow-sm cursor-pointer"
          >
            {isEdit ? 'Save Changes' : 'Save Policy'}
          </button>
        </div>
      </div>

      {/* Main Content Form & Preview Grid */}
      <div className="p-8 flex-1 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Form Inputs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Section 1: Policy Scope */}
            <div className="bg-white rounded-xl shadow-xs border border-[#e5e7eb] p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f1f3]">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0058be] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#191c1e]">Policy Scope</h2>
                  <p className="text-xs text-[#6b7280]">Select which room and rate categories apply.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Room Type Select */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="policy-room-type-select"
                    className="text-xs font-bold uppercase tracking-wider text-[#4b5563]"
                  >
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="policy-room-type-select"
                      value={roomTypeName}
                      onChange={(e) => {
                        setRoomTypeName(e.target.value);
                        if (errors.roomType) setErrors((prev) => ({ ...prev, roomType: undefined }));
                      }}
                      className={`w-full appearance-none bg-white border rounded-lg px-3.5 py-2.5 text-sm outline-none shadow-xs cursor-pointer pr-10 transition-all ${
                        errors.roomType
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 text-[#191c1e]'
                          : 'border-[#d8dadc] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]'
                      }`}
                    >
                      <option disabled value="">
                        Select Room Type
                      </option>
                      {uniqueRoomTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                      expand_more
                    </span>
                  </div>
                  {errors.roomType && (
                    <span className="text-red-500 text-xs font-medium mt-0.5">{errors.roomType}</span>
                  )}
                </div>

                {/* Rate Type Select */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="policy-rate-type-select"
                    className="text-xs font-bold uppercase tracking-wider text-[#4b5563]"
                  >
                    Rate Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="policy-rate-type-select"
                      value={rateTypeName}
                      onChange={(e) => {
                        setRateTypeName(e.target.value);
                        if (errors.rateType) setErrors((prev) => ({ ...prev, rateType: undefined }));
                      }}
                      className={`w-full appearance-none bg-white border rounded-lg px-3.5 py-2.5 text-sm outline-none shadow-xs cursor-pointer pr-10 transition-all ${
                        errors.rateType
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 text-[#191c1e]'
                          : 'border-[#d8dadc] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]'
                      }`}
                    >
                      <option disabled value="">
                        Select Rate Type
                      </option>
                      {uniqueRateTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                      expand_more
                    </span>
                  </div>
                  {errors.rateType && (
                    <span className="text-red-500 text-xs font-medium mt-0.5">{errors.rateType}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Policy Content & Editor */}
            <div className="bg-white rounded-xl shadow-xs border border-[#e5e7eb] overflow-hidden flex flex-col">
              {/* Header with Variables */}
              <div className="px-6 py-4 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0058be] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#191c1e]">Policy Content</h2>
                    <p className="text-xs text-[#6b7280]">Write the detailed cancellation or deposit rule.</p>
                  </div>
                </div>

                {/* Variable Tokens */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#76777d]">
                    Variables:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleInsertVariable('{{Room_Type}}')}
                      className="px-2.5 py-1 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1e293b] font-mono text-xs rounded-md border border-[#e5e7eb] transition-colors cursor-pointer font-medium shadow-2xs"
                      title="Insert {{Room_Type}}"
                    >
                      {'{{Room_Type}}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertVariable('{{Rate_Type}}')}
                      className="px-2.5 py-1 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1e293b] font-mono text-xs rounded-md border border-[#e5e7eb] transition-colors cursor-pointer font-medium shadow-2xs"
                      title="Insert {{Rate_Type}}"
                    >
                      {'{{Rate_Type}}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertVariable('{{Check_In}}')}
                      className="px-2.5 py-1 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1e293b] font-mono text-xs rounded-md border border-[#e5e7eb] transition-colors cursor-pointer font-medium shadow-2xs"
                      title="Insert {{Check_In}}"
                    >
                      {'{{Check_In}}'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Rich Text Toolbar */}
              <div className="px-4 py-2 bg-[#f8f9fa] border-b border-[#e5e7eb] flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => applyFormat('**', '**')}
                  className="p-1.5 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]"
                  title="Bold"
                >
                  <span className="material-symbols-outlined text-[18px]">format_bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('*', '*')}
                  className="p-1.5 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]"
                  title="Italic"
                >
                  <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('<u>', '</u>')}
                  className="p-1.5 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]"
                  title="Underline"
                >
                  <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                </button>

                <div className="w-px h-4 bg-[#d1d5db] mx-1.5" />

                <button
                  type="button"
                  onClick={() => applyFormat('\n• ')}
                  className="p-1.5 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]"
                  title="Bullet List"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('\n1. ')}
                  className="p-1.5 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]"
                  title="Numbered List"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                </button>

                <div className="w-px h-4 bg-[#d1d5db] mx-1.5" />

                <button
                  type="button"
                  onClick={() => setTextAlign('left')}
                  className={`p-1.5 rounded transition-colors cursor-pointer border ${
                    textAlign === 'left'
                      ? 'bg-blue-50 text-[#0058be] border-blue-200'
                      : 'border-transparent text-[#4b5563] hover:bg-white hover:border-[#e5e7eb]'
                  }`}
                  title="Align Left"
                >
                  <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('center')}
                  className={`p-1.5 rounded transition-colors cursor-pointer border ${
                    textAlign === 'center'
                      ? 'bg-blue-50 text-[#0058be] border-blue-200'
                      : 'border-transparent text-[#4b5563] hover:bg-white hover:border-[#e5e7eb]'
                  }`}
                  title="Align Center"
                >
                  <span className="material-symbols-outlined text-[18px]">format_align_center</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('right')}
                  className={`p-1.5 rounded transition-colors cursor-pointer border ${
                    textAlign === 'right'
                      ? 'bg-blue-50 text-[#0058be] border-blue-200'
                      : 'border-transparent text-[#4b5563] hover:bg-white hover:border-[#e5e7eb]'
                  }`}
                  title="Align Right"
                >
                  <span className="material-symbols-outlined text-[18px]">format_align_right</span>
                </button>

                <div className="w-px h-4 bg-[#d1d5db] mx-1.5" />

                <button
                  type="button"
                  onClick={() => applyFormat('[', '](https://)')}
                  className="p-1.5 rounded hover:bg-white text-[#4b5563] hover:text-[#191c1e] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]"
                  title="Insert Link"
                >
                  <span className="material-symbols-outlined text-[18px]">link</span>
                </button>
              </div>

              {/* Textarea Area */}
              <div className="p-6 flex flex-col bg-white">
                <textarea
                  ref={editorRef}
                  id="policy-editor"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  style={{ textAlign }}
                  rows={8}
                  className="w-full resize-y text-sm text-[#191c1e] placeholder-[#9ca3af] bg-transparent outline-none leading-relaxed font-sans min-h-[160px]"
                  placeholder="Enter policy text here... For example: Cancellations made within 48 hours of {{Check_In}} for a {{Room_Type}} booked under the {{Rate_Type}} will incur a penalty..."
                />
                {errors.content && (
                  <span className="text-red-500 text-xs font-medium mt-2">{errors.content}</span>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('policies')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#191c1e] bg-white border border-[#d8dadc] hover:bg-[#f3f4f6] transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#191c1e] hover:bg-black transition-all shadow-sm cursor-pointer"
              >
                {isEdit ? 'Save Changes' : 'Save Policy'}
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Live Preview Panel */}
          <div className="lg:col-span-5 flex flex-col sticky top-28">
            <div className="bg-white rounded-xl shadow-xs border border-[#e5e7eb] overflow-hidden flex flex-col">
              {/* Preview Tabs */}
              <div className="p-2 bg-[#f3f4f6] border-b border-[#e5e7eb] flex items-center gap-1.5">
                <button
                  type="button"
                  id="tab-confirmation"
                  onClick={() => setActiveTab('confirmation')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                    activeTab === 'confirmation'
                      ? 'bg-white shadow-xs text-[#191c1e] border border-[#e5e7eb]'
                      : 'text-[#6b7280] hover:text-[#191c1e] hover:bg-white/60'
                  }`}
                >
                  Confirmation
                </button>
                <button
                  type="button"
                  id="tab-folio"
                  onClick={() => setActiveTab('folio')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                    activeTab === 'folio'
                      ? 'bg-white shadow-xs text-[#191c1e] border border-[#e5e7eb]'
                      : 'text-[#6b7280] hover:text-[#191c1e] hover:bg-white/60'
                  }`}
                >
                  Folio
                </button>
                <button
                  type="button"
                  id="tab-email"
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-white shadow-xs text-[#191c1e] border border-[#e5e7eb]'
                      : 'text-[#6b7280] hover:text-[#191c1e] hover:bg-white/60'
                  }`}
                >
                  Email
                </button>
              </div>

              {/* Preview Canvas Area */}
              <div className="p-6 bg-[#f8f9fb] flex items-center justify-center min-h-[380px]">
                {/* Confirmation Tab */}
                {activeTab === 'confirmation' && (
                  <div id="preview-confirmation" className="w-full max-w-sm">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#0058be] border-x border-b border-[#e5e7eb]">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 bg-blue-50 text-[#0058be] rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">hotel</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#76777d]">
                            Conf #
                          </div>
                          <div className="font-mono text-xs text-[#191c1e] font-bold">
                            104-9823A
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-[#191c1e] mb-3">
                        Reservation Confirmed
                      </h3>
                      <div className="h-px w-full bg-[#e5e7eb] my-3"></div>

                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4b5563] mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#0058be]">gavel</span>
                        Policy Terms
                      </h4>

                      <div className="text-xs text-[#4b5563] leading-relaxed p-4 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb] border-dashed min-h-[90px]">
                        {resolvedText ? (
                          <p className="text-[#191c1e] whitespace-pre-wrap">{resolvedText}</p>
                        ) : (
                          <span className="text-[#9ca3af] italic">
                            Your policy text will appear here formatted for a PDF confirmation document.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Folio Tab */}
                {activeTab === 'folio' && (
                  <div id="preview-folio" className="w-full max-w-sm">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-[#e5e7eb] font-mono text-xs">
                      <div className="text-center mb-4 pb-3 border-b border-[#e5e7eb] border-dashed">
                        <div className="text-sm font-bold text-[#191c1e] tracking-widest">GRAND PLAZA</div>
                        <div className="text-[10px] text-[#76777d] mt-0.5">GUEST FOLIO RECORD</div>
                      </div>
                      <div className="text-[11px] text-[#191c1e] mb-4 flex justify-between">
                        <span>ROOM: 402</span>
                        <span>
                          RATE: <span className="text-[#0058be] font-bold">{getRateShortCode()}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-[#76777d] mb-1 font-bold">
                        *** POLICY NOTIFICATION ***
                      </div>
                      <div className="text-xs text-[#191c1e] leading-snug p-3 bg-[#f3f4f6] rounded border border-[#e5e7eb] min-h-[70px]">
                        {resolvedText ? (
                          <p className="whitespace-pre-wrap">{resolvedText}</p>
                        ) : (
                          <span className="text-[#9ca3af] italic">
                            Your policy text will appear here formatted for a printed receipt or folio.
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#76777d] mt-2 text-right">
                        *************************
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Tab */}
                {activeTab === 'email' && (
                  <div id="preview-email" className="w-full max-w-sm">
                    <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
                      <div className="bg-[#f3f4f6] px-3 py-2 border-b border-[#e5e7eb] flex gap-1.5 items-center">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      </div>
                      <div className="p-4 bg-white border-b border-[#e5e7eb]">
                        <div className="text-[11px] text-[#76777d]">From: reservations@stayos.com</div>
                        <div className="text-[11px] text-[#76777d]">To: guest@example.com</div>
                        <div className="text-xs font-bold text-[#191c1e] mt-2">
                          Important: Details regarding your upcoming stay
                        </div>
                      </div>
                      <div className="p-4 text-xs text-[#374151] space-y-2.5">
                        <p>Dear Guest,</p>
                        <p className="text-[#6b7280]">
                          We are looking forward to welcoming you. Please note the following policy applied to your reservation:
                        </p>
                        <div className="pl-3.5 border-l-2 border-[#0058be] text-[#191c1e] py-1 bg-blue-50/50 rounded-r min-h-[50px]">
                          {resolvedText ? (
                            <p className="whitespace-pre-wrap italic">{resolvedText}</p>
                          ) : (
                            <span className="text-[#9ca3af] italic">
                              Your policy text will appear here formatted for an HTML email.
                            </span>
                          )}
                        </div>
                        <p className="pt-2 text-[#6b7280]">
                          Best regards,<br />The Grand Plaza Team
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
