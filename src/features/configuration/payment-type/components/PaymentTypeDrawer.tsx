import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PaymentTypeItem } from '@/src/types';

export const PaymentTypeDrawer: React.FC = () => {
  const {
    isPaymentTypeDrawerOpen,
    drawerPaymentType,
    closePaymentTypeDrawer,
    addPaymentType,
    updatePaymentType,
    isPaymentTypeNameUnique,
    isPaymentTypeShortNameUnique,
  } = useProperty();

  const isEditing = Boolean(drawerPaymentType);

  const [formData, setFormData] = useState<{
    shortName: string;
    name: string;
    category: PaymentTypeItem['category'];
    ccProcessing: boolean;
    status: 'Active' | 'Inactive';
    description: string;
  }>({
    shortName: '',
    name: '',
    category: 'Credit Card',
    ccProcessing: true,
    status: 'Active',
    description: '',
  });

  const [errors, setErrors] = useState<{
    shortName?: string;
    name?: string;
    category?: string;
  }>({});

  useEffect(() => {
    if (drawerPaymentType) {
      setFormData({
        shortName: drawerPaymentType.shortName,
        name: drawerPaymentType.name,
        category: drawerPaymentType.category,
        ccProcessing: drawerPaymentType.ccProcessing,
        status: drawerPaymentType.status,
        description: drawerPaymentType.description || '',
      });
    } else {
      setFormData({
        shortName: '',
        name: '',
        category: 'Credit Card',
        ccProcessing: true,
        status: 'Active',
        description: '',
      });
    }
    setErrors({});
  }, [drawerPaymentType, isPaymentTypeDrawerOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPaymentTypeDrawerOpen) {
        closePaymentTypeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaymentTypeDrawerOpen, closePaymentTypeDrawer]);

  const validate = () => {
    const newErrors: {
      shortName?: string;
      name?: string;
      category?: string;
    } = {};

    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short name is required.';
    } else if (formData.shortName.trim().length > 5) {
      newErrors.shortName = 'Short name must be 5 characters or less.';
    } else if (!isPaymentTypeShortNameUnique(formData.shortName.trim(), drawerPaymentType?.id)) {
      newErrors.shortName = `Short name "${formData.shortName.trim().toUpperCase()}" is already in use.`;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Payment type name is required.';
    } else if (!isPaymentTypeNameUnique(formData.name.trim(), drawerPaymentType?.id)) {
      newErrors.name = `Payment type "${formData.name.trim()}" already exists.`;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && drawerPaymentType) {
      const success = updatePaymentType(drawerPaymentType.id, {
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        ccProcessing: formData.ccProcessing,
        status: formData.status,
        description: formData.description.trim(),
      });
      if (success) {
        closePaymentTypeDrawer();
      }
    } else {
      const success = addPaymentType({
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        ccProcessing: formData.ccProcessing,
        status: formData.status,
        description: formData.description.trim(),
      });
      if (success) {
        closePaymentTypeDrawer();
      }
    }
  };

  if (!isPaymentTypeDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Overlay Backdrop */}
      <div
        id="sideDrawerOverlay"
        onClick={closePaymentTypeDrawer}
        className="fixed inset-0 bg-[#000000]/30 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div
        id="sideDrawer"
        className="fixed top-0 sm:top-16 right-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#c6c6cd]/60 animate-in slide-in-from-right duration-300 ease-in-out"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e0e3e5] shrink-0 bg-[#f7f9fb]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dae2fd]/60 flex items-center justify-center text-[#0058be]">
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
            </div>
            <h2 className="text-[18px] font-bold text-[#191c1e] m-0" id="drawerTitle">
              {isEditing ? 'Edit Payment Type' : 'Add Payment Type'}
            </h2>
          </div>
          <button
            onClick={closePaymentTypeDrawer}
            className="w-8 h-8 rounded-full hover:bg-[#eceef0] flex items-center justify-center text-[#45464d] hover:text-[#191c1e] transition-colors cursor-pointer"
            title="Close Drawer (Esc)"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-white">
          {/* Status Toggle Card */}
          <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-xl border border-[#c6c6cd]/40">
            <div className="flex flex-col pr-4">
              <span className="text-[14px] font-semibold text-[#191c1e]">Payment Type Status</span>
              <span className="text-[12px] text-[#45464d] mt-0.5">
                Active payment types can be selected during transactions.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.status === 'Active'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.checked ? 'Active' : 'Inactive',
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]" />
            </label>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-5">
            {/* Short Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-[#191c1e] font-semibold flex items-center justify-between">
                <span>
                  Short Name <span className="text-[#ba1a1a]">*</span>
                </span>
                <span className="text-[11px] font-mono text-[#76777d]">
                  {formData.shortName.length}/5
                </span>
              </label>
              <input
                type="text"
                id="input-shortName"
                maxLength={5}
                value={formData.shortName}
                onChange={(e) => {
                  setFormData({ ...formData, shortName: e.target.value.toUpperCase() });
                  if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: undefined }));
                }}
                placeholder="e.g. VISA"
                className={`h-11 px-4 rounded-lg bg-white border text-[14px] font-mono uppercase text-[#191c1e] transition-all placeholder:text-[#76777d]/60 ${
                  errors.shortName
                    ? 'border-[#ba1a1a] bg-[#ffdad6]/10 focus:ring-1 focus:ring-[#ba1a1a] outline-none'
                    : 'border-[#c6c6cd] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                }`}
              />
              {errors.shortName ? (
                <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                  {errors.shortName}
                </span>
              ) : (
                <span className="text-[11px] text-[#45464d]">
                  Maximum 5 characters. Used in compact reports.
                </span>
              )}
            </div>

            {/* Payment Type Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-[#191c1e] font-semibold">
                Payment Type Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                id="input-paymentTypeName"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Visa Credit Card"
                className={`h-11 px-4 rounded-lg bg-white border text-[14px] text-[#191c1e] transition-all placeholder:text-[#76777d]/60 ${
                  errors.name
                    ? 'border-[#ba1a1a] bg-[#ffdad6]/10 focus:ring-1 focus:ring-[#ba1a1a] outline-none'
                    : 'border-[#c6c6cd] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
                }`}
              />
              {errors.name && (
                <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-[#191c1e] font-semibold">
                Category <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-drawer-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as PaymentTypeItem['category'],
                    })
                  }
                  className="w-full h-11 px-4 pr-10 rounded-lg bg-white border border-[#c6c6cd] text-[14px] text-[#191c1e] appearance-none focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                  <option value="Check">Check</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-[#191c1e] font-semibold">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Internal notes about this payment type..."
                className="p-3 rounded-lg bg-white border border-[#c6c6cd] text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-none placeholder:text-[#76777d]/60"
              />
            </div>
          </div>

          {/* Integration Settings */}
          <div className="pt-5 border-t border-[#e0e3e5] flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#191c1e] m-0">Integration Settings</h3>

            <div className="p-4 bg-[#dae2fd]/30 rounded-xl border border-[#0058be]/20 flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-full bg-[#0058be]/10 flex items-center justify-center shrink-0 text-[#0058be] mt-0.5">
                <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
              </div>
              <div className="flex flex-col flex-1 gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#191c1e]">
                    Credit Card Processing
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.ccProcessing}
                      onChange={(e) =>
                        setFormData({ ...formData, ccProcessing: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]" />
                  </label>
                </div>
                <p className="text-[12px] text-[#45464d] leading-relaxed m-0">
                  When enabled, selecting this payment type at Front Desk can initiate the payment-terminal flow or integrated payment gateway.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 px-6 border-t border-[#e0e3e5] bg-[#f7f9fb] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={closePaymentTypeDrawer}
            className="h-10 px-5 rounded-lg bg-transparent border border-[#c6c6cd] text-[#191c1e] font-semibold text-[13px] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-6 rounded-lg bg-[#000000] text-white font-semibold text-[13px] hover:bg-[#1f1f1f] shadow-sm active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{isEditing ? 'Update Payment Type' : 'Save Payment Type'}</span>
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
      </div>
    </div>
  );
};
