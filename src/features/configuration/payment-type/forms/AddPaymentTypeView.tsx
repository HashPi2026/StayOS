import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PaymentTypeItem } from '@/src/types';

export const AddPaymentTypeView: React.FC = () => {
  const {
    paymentTypes,
    editingPaymentTypeId,
    setEditingPaymentTypeId,
    addPaymentType,
    updatePaymentType,
    isPaymentTypeNameUnique,
    isPaymentTypeShortNameUnique,
    navigate,
  } = useProperty();

  const isEditing = Boolean(editingPaymentTypeId);
  const existingPaymentType = paymentTypes.find((p) => p.id === editingPaymentTypeId);

  const [formData, setFormData] = useState<{
    shortName: string;
    name: string;
    category: PaymentTypeItem['category'] | '';
    ccProcessing: boolean;
    status: 'Active' | 'Inactive';
    description: string;
  }>({
    shortName: '',
    name: '',
    category: '',
    ccProcessing: false,
    status: 'Active',
    description: '',
  });

  const [errors, setErrors] = useState<{
    shortName?: string;
    name?: string;
    category?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingPaymentType) {
      setFormData({
        shortName: existingPaymentType.shortName,
        name: existingPaymentType.name,
        category: existingPaymentType.category,
        ccProcessing: existingPaymentType.ccProcessing,
        status: existingPaymentType.status,
        description: existingPaymentType.description || '',
      });
    } else {
      setFormData({
        shortName: '',
        name: '',
        category: '',
        ccProcessing: false,
        status: 'Active',
        description: '',
      });
    }
    setErrors({});
  }, [existingPaymentType]);

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
    } else if (
      !isPaymentTypeShortNameUnique(formData.shortName.trim(), editingPaymentTypeId || undefined)
    ) {
      newErrors.shortName = `Short name "${formData.shortName.trim().toUpperCase()}" is already in use.`;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Payment type name is required.';
    } else if (
      !isPaymentTypeNameUnique(formData.name.trim(), editingPaymentTypeId || undefined)
    ) {
      newErrors.name = `Payment type "${formData.name.trim()}" already exists.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    const categoryValue = (formData.category || 'Other') as PaymentTypeItem['category'];

    if (isEditing && editingPaymentTypeId) {
      const success = updatePaymentType(editingPaymentTypeId, {
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: categoryValue,
        ccProcessing: formData.ccProcessing,
        status: formData.status,
        description: formData.description.trim(),
      });
      if (success) {
        setEditingPaymentTypeId(null);
        navigate('payment-types');
      }
    } else {
      const success = addPaymentType({
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: categoryValue,
        ccProcessing: formData.ccProcessing,
        status: formData.status,
        description: formData.description.trim(),
      });
      if (success) {
        navigate('payment-types');
      }
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditingPaymentTypeId(null);
    navigate('payment-types');
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative select-none">
      <main className="flex-1 w-full max-w-[960px] mx-auto px-8 lg:px-12 py-8 flex flex-col pb-32">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-[13px] text-[#45464d]">
          <button
            type="button"
            onClick={() => navigate('overview')}
            className="hover:text-[#000000] transition-colors cursor-pointer"
          >
            Configuration
          </button>
          <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
          <button
            type="button"
            onClick={() => navigate('overview')}
            className="hover:text-[#000000] transition-colors cursor-pointer"
          >
            Property
          </button>
          <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
          <button
            type="button"
            onClick={() => navigate('payment-types')}
            className="hover:text-[#000000] transition-colors cursor-pointer"
          >
            Payment Types
          </button>
          <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
          <span className="font-semibold text-[#191c1e]">
            {isEditing ? 'Edit Payment Type' : 'Add Payment Type'}
          </span>
        </nav>

        {/* Title and Subtitle */}
        <div className="mb-8">
          <h1 className="text-[26px] lg:text-[28px] font-bold text-[#191c1e] tracking-tight mb-1">
            {isEditing ? 'Edit Payment Type' : 'Add Payment Type'}
          </h1>
          <p className="text-[14px] text-[#45464d]">
            Configure a new payment method for front desk and online transactions.
          </p>
        </div>

        {/* Main Details Card */}
        <div className="bg-white shadow-xs rounded-xl mb-8 flex flex-col border border-[#c6c6cd]">
          {/* Card Header */}
          <div className="px-6 lg:px-8 py-5 border-b border-[#e0e3e5] bg-white rounded-t-xl">
            <h2 className="text-[17px] font-semibold text-[#191c1e]">Payment Type Details</h2>
          </div>

          {/* Card Form Body */}
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Short Name Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="short-name"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                Short Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="short-name"
                type="text"
                maxLength={5}
                value={formData.shortName}
                onChange={(e) => {
                  setFormData({ ...formData, shortName: e.target.value.toUpperCase() });
                  if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: undefined }));
                }}
                placeholder="e.g. VISA"
                required
                className={`h-10 px-3.5 font-mono uppercase text-[14px] text-[#191c1e] bg-white border ${
                  errors.shortName
                    ? 'border-[#ba1a1a] bg-[#ffdad6]/10 focus:ring-1 focus:ring-[#ba1a1a]'
                    : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]'
                } rounded outline-none transition-all placeholder:text-[#76777d]/60 placeholder:normal-case`}
              />
              {errors.shortName && (
                <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                  {errors.shortName}
                </span>
              )}
            </div>

            {/* Payment Type Name Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="type-name"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                Payment Type Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="type-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Visa Credit Card"
                required
                className={`h-10 px-3.5 text-[14px] text-[#191c1e] bg-white border ${
                  errors.name
                    ? 'border-[#ba1a1a] bg-[#ffdad6]/10 focus:ring-1 focus:ring-[#ba1a1a]'
                    : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]'
                } rounded outline-none transition-all placeholder:text-[#76777d]/60`}
              />
              {errors.name && (
                <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="category"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                Category Name
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as PaymentTypeItem['category'],
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-10 text-[14px] text-[#191c1e] bg-white border border-[#c6c6cd] rounded appearance-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] outline-none transition-all cursor-pointer"
                >
                  <option disabled value="">
                    Select a category...
                  </option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="description"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Internal notes or description for this payment type..."
                className="p-3 text-[14px] text-[#191c1e] bg-white border border-[#c6c6cd] rounded focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] outline-none transition-all resize-y placeholder:text-[#76777d]/60"
              />
            </div>

            {/* Credit Card Processing Toggle Box */}
            <div className="md:col-span-2 bg-[#f2f4f6] rounded-lg p-4 mt-2 flex items-start gap-4 border border-[#c6c6cd]/60">
              <div className="pt-0.5 shrink-0">
                <button
                  id="cc-processing-toggle"
                  type="button"
                  role="switch"
                  aria-checked={formData.ccProcessing}
                  onClick={() =>
                    setFormData({ ...formData, ccProcessing: !formData.ccProcessing })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:ring-offset-2 focus:ring-offset-[#f2f4f6] cursor-pointer ${
                    formData.ccProcessing ? 'bg-[#0058be]' : 'bg-[#c6c6cd]'
                  }`}
                >
                  <span className="sr-only">Enable Credit Card Processing</span>
                  <span
                    id="cc-processing-thumb"
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      formData.ccProcessing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#191c1e] mb-0.5">
                  Credit Card Processing
                </div>
                <div className="text-[13px] text-[#45464d]">
                  When enabled, selecting this payment type at Front Desk can initiate the
                  payment-terminal flow.
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-[#f7f9fb]/90 backdrop-blur-xl border-t border-[#c6c6cd] px-8 lg:px-12 py-3.5 z-40 flex items-center justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 rounded border border-[#c6c6cd] text-[#191c1e] text-[14px] font-semibold hover:bg-[#eceef0] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2 rounded bg-[#000000] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer active:scale-[0.98]"
        >
          {isEditing ? 'Update Payment Type' : 'Save Payment Type'}
        </button>
      </div>
    </div>
  );
};
