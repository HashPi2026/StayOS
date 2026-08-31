import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { DocumentCategory } from '../types';

export const AddDocumentTypeView: React.FC = () => {
  const {
    documentTypes,
    editingDocumentTypeId,
    setEditingDocumentTypeId,
    addDocumentType,
    updateDocumentType,
    navigate,
    addToast,
  } = useProperty();

  const isEditing = Boolean(editingDocumentTypeId);
  const existingDocType = isEditing
    ? documentTypes.find((d) => d.id === editingDocumentTypeId)
    : null;

  // Find currently designated default document type for the warning box
  const currentDefaultDoc = documentTypes.find(
    (d) => d.isDefault && (!isEditing || d.id !== editingDocumentTypeId)
  );

  const [formData, setFormData] = useState<{
    shortName: string;
    name: string;
    category: DocumentCategory | '';
    description: string;
    isDefault: boolean;
    isActive: boolean;
  }>({
    shortName: '',
    name: '',
    category: '',
    description: '',
    isDefault: false,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingDocType) {
      setFormData({
        shortName: existingDocType.shortName,
        name: existingDocType.name,
        category: existingDocType.category,
        description: existingDocType.description || '',
        isDefault: existingDocType.isDefault,
        isActive: existingDocType.isActive,
      });
    } else {
      setFormData({
        shortName: '',
        name: '',
        category: '',
        description: '',
        isDefault: false,
        isActive: true,
      });
    }
    setErrors({});
  }, [existingDocType]);

  const handleCancel = () => {
    setEditingDocumentTypeId(null);
    navigate('document-types');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short Name is required';
    } else if (formData.shortName.trim().length > 8) {
      newErrors.shortName = 'Short Name must be 8 characters or fewer';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Document Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Document Category is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please complete all required fields', 'error');
      return;
    }

    if (isEditing && existingDocType) {
      updateDocumentType(existingDocType.id, {
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category as DocumentCategory,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      });
    } else {
      addDocumentType({
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category as DocumentCategory,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      });
    }

    setEditingDocumentTypeId(null);
    navigate('document-types');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative pb-28">
      {/* Breadcrumb Navigation Bar */}
      <div className="px-8 py-4 flex items-center text-[13px] text-[#75859d] gap-2 mt-2">
        <button
          onClick={() => {
            setEditingDocumentTypeId(null);
            navigate('overview');
          }}
          className="hover:text-[#000000] transition-colors cursor-pointer"
        >
          Configuration
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <button
          onClick={() => {
            setEditingDocumentTypeId(null);
            navigate('overview');
          }}
          className="hover:text-[#000000] transition-colors cursor-pointer"
        >
          Property
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <button
          onClick={handleCancel}
          className="hover:text-[#000000] transition-colors cursor-pointer"
        >
          Document Types
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-[#191c1e] font-medium">
          {isEditing ? 'Edit Document Type' : 'Add Document Type'}
        </span>
      </div>

      {/* Page Header */}
      <div className="px-8 pb-6">
        <h1 className="text-[26px] font-bold text-[#191c1e] mb-6">
          {isEditing ? 'Edit Document Type' : 'Add Document Type'}
        </h1>

        {/* Form Container Card */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] p-8 w-full max-w-4xl mx-auto">
          <form id="doc-type-full-form" onSubmit={handleSubmit}>
            {/* Identity & Classification Section */}
            <div className="mb-8">
              <h2 className="text-[18px] font-semibold text-[#191c1e] mb-6">
                Identity & Classification
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Short Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="shortNameInput"
                    className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1"
                  >
                    <span>Short Name</span>
                    <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="shortNameInput"
                      type="text"
                      maxLength={8}
                      value={formData.shortName}
                      onChange={(e) =>
                        setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., DL"
                      className={`w-full bg-[#f7f9fb] text-[#191c1e] text-[14px] font-mono rounded-lg py-2.5 px-3.5 outline-none transition-colors border ${
                        errors.shortName
                          ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                          : 'border-[#c6c6cd] focus:bg-white focus:border-[#000000] focus:ring-2 focus:ring-black/10'
                      }`}
                    />
                  </div>
                  {errors.shortName && (
                    <span className="text-[12px] text-[#ba1a1a] font-medium">
                      {errors.shortName}
                    </span>
                  )}
                </div>

                {/* Document Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="docNameInput"
                    className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1"
                  >
                    <span>Document Name</span>
                    <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="docNameInput"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Driving License"
                      className={`w-full bg-[#f7f9fb] text-[#191c1e] text-[14px] rounded-lg py-2.5 px-3.5 outline-none transition-colors border ${
                        errors.name
                          ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                          : 'border-[#c6c6cd] focus:bg-white focus:border-[#000000] focus:ring-2 focus:ring-black/10'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <span className="text-[12px] text-[#ba1a1a] font-medium">{errors.name}</span>
                  )}
                </div>

                {/* Document Category */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label
                    htmlFor="categorySelect"
                    className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1"
                  >
                    <span>Document Category</span>
                    <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="categorySelect"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as DocumentCategory,
                        })
                      }
                      className={`w-full appearance-none bg-[#f7f9fb] text-[#191c1e] text-[14px] rounded-lg py-2.5 pl-3.5 pr-10 outline-none transition-colors border cursor-pointer ${
                        errors.category
                          ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                          : 'border-[#c6c6cd] focus:bg-white focus:border-[#000000] focus:ring-2 focus:ring-black/10'
                      }`}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="Identity">Identity</option>
                      <option value="Visa">Visa</option>
                      <option value="Voucher">Voucher</option>
                      <option value="Health">Health</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                  {errors.category && (
                    <span className="text-[12px] text-[#ba1a1a] font-medium">
                      {errors.category}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label
                    htmlFor="descInput"
                    className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                  >
                    Description
                  </label>
                  <textarea
                    id="descInput"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details about this document type..."
                    className="w-full bg-[#f7f9fb] text-[#191c1e] text-[14px] rounded-lg py-2.5 px-3.5 outline-none transition-colors border border-[#c6c6cd] focus:bg-white focus:border-[#000000] focus:ring-2 focus:ring-black/10 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full bg-[#e0e3e5] mb-8" />

            {/* Property Defaults Section */}
            <div>
              <h2 className="text-[18px] font-semibold text-[#191c1e] mb-4">
                Property Defaults
              </h2>

              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="text-[14px] text-[#191c1e] font-medium">
                    Default Document Type
                  </div>
                  <div className="text-[13px] text-[#75859d] mt-0.5">
                    Only one Document Type can be the default for this property.
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  id="defaultToggle"
                  role="switch"
                  aria-checked={formData.isDefault}
                  onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-inner ${
                    formData.isDefault ? 'bg-[#000000]' : 'bg-[#e0e3e5]'
                  }`}
                >
                  <span className="sr-only">Set as default</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      formData.isDefault
                        ? 'translate-x-[22px] translate-y-[2px]'
                        : 'translate-x-[2px] translate-y-[2px]'
                    }`}
                  />
                </button>
              </div>

              {/* Warning Alert Banner when toggle is checked */}
              {formData.isDefault && (
                <div
                  id="defaultWarning"
                  className="mt-4 bg-[#d8e2ff] text-[#001a42] rounded-lg p-3.5 flex items-start gap-3 border border-[#adc6ff] animate-fadeIn"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#0058be] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="text-[13px] leading-relaxed">
                    Enabling this will replace{' '}
                    <strong>{currentDefaultDoc ? currentDefaultDoc.name : 'the existing default'}</strong>{' '}
                    as the default document type for this property.
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Fixed Bottom Action Toolbar */}
      <div className="fixed bottom-0 left-0 md:left-60 right-0 bg-white/90 backdrop-blur-md border-t border-[#e0e3e5] px-8 py-3.5 flex justify-end gap-3 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] bg-transparent hover:bg-[#f2f4f6] transition-colors border border-[#c6c6cd] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="doc-type-full-form"
          className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#000000] hover:bg-[#2d3133] shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
        >
          <span>Save Document Type</span>
          <span className="material-symbols-outlined text-[18px]">check</span>
        </button>
      </div>
    </div>
  );
};
