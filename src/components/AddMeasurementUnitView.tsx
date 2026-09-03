import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';

export const AddMeasurementUnitView: React.FC = () => {
  const {
    measurementUnits,
    editingMeasurementUnitId,
    setEditingMeasurementUnitId,
    addMeasurementUnit,
    updateMeasurementUnit,
    isMeasurementUnitNameUnique,
    isMeasurementUnitShortNameUnique,
    navigate,
  } = useProperty();

  const isEditing = Boolean(editingMeasurementUnitId);
  const existingUnit = measurementUnits.find((u) => u.id === editingMeasurementUnitId);

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
  });

  const [errors, setErrors] = useState<{ name?: string; shortName?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingUnit) {
      setFormData({
        name: existingUnit.name,
        shortName: existingUnit.shortName,
        description: existingUnit.description || '',
      });
    } else {
      setFormData({
        name: '',
        shortName: '',
        description: '',
      });
    }
    setErrors({});
  }, [existingUnit]);

  const validate = () => {
    const newErrors: { name?: string; shortName?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Measurement name is required.';
    } else if (!isMeasurementUnitNameUnique(formData.name.trim(), editingMeasurementUnitId || undefined)) {
      newErrors.name = `Measurement unit "${formData.name.trim()}" already exists.`;
    }

    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short name is required.';
    } else if (formData.shortName.trim().length > 5) {
      newErrors.shortName = 'Short name must be 5 characters or less.';
    } else if (
      !isMeasurementUnitShortNameUnique(formData.shortName.trim(), editingMeasurementUnitId || undefined)
    ) {
      newErrors.shortName = `Short name "${formData.shortName.trim().toUpperCase()}" is already in use.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    if (isEditing && editingMeasurementUnitId) {
      const success = updateMeasurementUnit(editingMeasurementUnitId, {
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        description: formData.description.trim(),
      });
      if (success) {
        setEditingMeasurementUnitId(null);
        navigate('measurement-units');
      }
    } else {
      const success = addMeasurementUnit({
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        description: formData.description.trim(),
      });
      if (success) {
        navigate('measurement-units');
      }
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditingMeasurementUnitId(null);
    navigate('measurement-units');
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative">
      {/* Top decorative background glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-[#000000]/[0.02] rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Breadcrumbs & Header */}
      <div className="px-8 lg:px-12 py-6 flex flex-col gap-2 z-10">
        <nav className="flex items-center gap-2 text-[13px] text-[#45464d] font-medium">
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
            onClick={() => navigate('measurement-units')}
            className="hover:text-[#000000] cursor-pointer transition-colors"
          >
            Measurement Units
          </button>
          <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
          <span className="text-[#000000] font-semibold">
            {isEditing ? 'Edit Unit' : 'Add Unit'}
          </span>
        </nav>

        <div className="flex items-center justify-between mt-1">
          <h1 className="text-[26px] lg:text-[28px] font-bold text-[#191c1e] tracking-tight">
            {isEditing ? 'Edit Measurement Unit' : 'Add Measurement Unit'}
          </h1>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="flex-1 px-8 lg:px-12 pb-36 flex justify-center">
        <div className="w-full max-w-2xl mt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Card: Unit Details */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e0e3e5] p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group">
              {/* Header inside Card */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#e0e3e5]/60">
                <div className="w-8 h-8 rounded-lg bg-[#dae2fd]/40 flex items-center justify-center text-[#191c1e]">
                  <span className="material-symbols-outlined text-[18px]">straighten</span>
                </div>
                <h2 className="text-[17px] font-semibold text-[#191c1e]">Unit Details</h2>
              </div>

              <div className="flex flex-col gap-6">
                {/* Row: Measurement & Short Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Measurement Input */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label
                      htmlFor="measurementName"
                      className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase flex items-center gap-1"
                    >
                      Measurement
                      <span aria-hidden="true" className="text-[#ba1a1a]">*</span>
                      <span
                        className="material-symbols-outlined text-[14px] text-[#76777d] cursor-help ml-auto"
                        title="The full name of the unit (e.g., Kilogram, Liter, Meter)"
                      >
                        info
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="measurementName"
                        name="measurementName"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="e.g., Kilogram"
                        className={`w-full bg-[#f2f4f6] text-[#191c1e] text-[14px] rounded-lg px-4 py-3 outline-none transition-all placeholder-[#76777d]/60 border ${
                          errors.name
                            ? 'border-[#ba1a1a] bg-[#ffdad6]/10 focus:ring-1 focus:ring-[#ba1a1a]'
                            : 'border-transparent focus:bg-white focus:ring-1 focus:ring-[#000000] focus:border-[#000000]'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Short Name Input */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label
                      htmlFor="shortName"
                      className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase flex items-center gap-1"
                    >
                      Short Name
                      <span aria-hidden="true" className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="shortName"
                        name="shortName"
                        type="text"
                        maxLength={5}
                        value={formData.shortName}
                        onChange={(e) => {
                          setFormData({ ...formData, shortName: e.target.value.toUpperCase() });
                          if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: undefined }));
                        }}
                        placeholder="e.g., KG"
                        className={`w-full bg-[#f2f4f6] text-[#191c1e] text-[14px] font-mono rounded-lg px-4 py-3 outline-none uppercase transition-all placeholder-[#76777d]/60 border ${
                          errors.shortName
                            ? 'border-[#ba1a1a] bg-[#ffdad6]/10 focus:ring-1 focus:ring-[#ba1a1a]'
                            : 'border-transparent focus:bg-white focus:ring-1 focus:ring-[#000000] focus:border-[#000000]'
                        }`}
                      />
                    </div>
                    {errors.shortName && (
                      <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                        {errors.shortName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="description"
                      className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase"
                    >
                      Description
                    </label>
                    <span
                      className={`text-[11px] font-medium ${
                        formData.description.length > 200 ? 'text-[#ba1a1a]' : 'text-[#76777d]'
                      }`}
                    >
                      {formData.description.length}/200
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      maxLength={200}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter description..."
                      className="w-full bg-[#f2f4f6] text-[#191c1e] text-[14px] rounded-lg px-4 py-3 outline-none transition-all placeholder-[#76777d]/60 border border-transparent focus:bg-white focus:ring-1 focus:ring-[#000000] focus:border-[#000000] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Helper Text */}
            <div className="flex items-start gap-2.5 text-[#45464d] text-[13px] px-2">
              <span className="material-symbols-outlined text-[18px] text-[#76777d] mt-0.5 shrink-0">
                lightbulb
              </span>
              <p className="leading-relaxed">
                Measurement units defined here will be available across inventory, purchasing, and reporting modules.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        id="stickyFooter"
        className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-[#f7f9fb]/90 backdrop-blur-xl border-t border-[#c6c6cd]/40 px-8 lg:px-12 py-3.5 z-40 flex items-center justify-between shadow-lg"
      >
        <div className="text-[13px] text-[#45464d] hidden sm:flex items-center gap-2">
          <span className="font-mono font-medium text-[#191c1e]">Status:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            {isEditing ? 'Active Unit' : 'Draft'}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg text-[12px] font-semibold tracking-wider uppercase text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg text-[12px] font-semibold tracking-wider uppercase text-white bg-[#000000] hover:bg-[#2d3133] shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{isEditing ? 'Update Unit' : 'Save Measurement Unit'}</span>
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
      </div>
    </div>
  );
};
