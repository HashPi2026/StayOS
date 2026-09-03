import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { FieldRequirementConfig } from '../../types';

export const GuestMandatoryDataTab: React.FC = () => {
  const { generalSettings, updateGuestMandatoryField, resetGeneralSettingsSection, addToast } = useProperty();
  const fields = generalSettings.guestMandatoryData.fields;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Profile Fields', count: fields.length },
    { id: 'personal', label: 'Personal & Legal', count: fields.filter((f) => f.category === 'personal').length },
    { id: 'contact', label: 'Contact Details', count: fields.filter((f) => f.category === 'contact').length },
    { id: 'identification', label: 'ID & Passport Verification', count: fields.filter((f) => f.category === 'identification').length },
    { id: 'address', label: 'Residential Address', count: fields.filter((f) => f.category === 'address').length },
    { id: 'other', label: 'Corporate, Valet & Privacy', count: fields.filter((f) => f.category === 'other').length },
  ];

  const filteredFields = fields.filter((f) => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.label.toLowerCase().includes(q) || (f.hint && f.hint.toLowerCase().includes(q));
    }
    return true;
  });

  const mandatoryCount = fields.filter((f) => f.enabled && f.required).length;
  const optionalCount = fields.filter((f) => f.enabled && !f.required).length;
  const disabledCount = fields.filter((f) => !f.enabled).length;

  const handleToggleEnabled = (field: FieldRequirementConfig) => {
    if (field.locked) {
      addToast(`${field.label} is a core PMS requirement and cannot be disabled.`, 'error');
      return;
    }
    const nextEnabled = !field.enabled;
    updateGuestMandatoryField(field.id, {
      enabled: nextEnabled,
      required: nextEnabled ? field.required : false,
    });
  };

  const handleToggleRequired = (field: FieldRequirementConfig) => {
    if (field.locked) {
      addToast(`${field.label} is always mandatory for guest safety and compliance.`, 'info');
      return;
    }
    if (!field.enabled) {
      updateGuestMandatoryField(field.id, { enabled: true, required: true });
    } else {
      updateGuestMandatoryField(field.id, { required: !field.required });
    }
  };

  const handleBulkSetMandatory = (required: boolean) => {
    fields.forEach((f) => {
      if (!f.locked && f.enabled) {
        updateGuestMandatoryField(f.id, { required });
      }
    });
    addToast(`Set all active fields to ${required ? 'Mandatory (*)' : 'Optional'}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eceef0]">
        <div>
          <h3 className="text-title-md font-semibold text-[#191c1e] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-[22px]">how_to_reg</span>
            Guest Mandatory Data & Form Validation Matrix
          </h3>
          <p className="text-body-sm text-[#45464d] mt-0.5">
            Define mandatory required fields (*) vs optional inputs during front desk walk-ins, OTA imports, and online check-in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => resetGeneralSettingsSection('guestMandatoryData')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#75859d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors border border-transparent hover:border-[#ffdad6]"
          title="Reset Guest Mandatory Data settings to defaults"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          Reset Tab Defaults
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#c6c6cd]/40 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#191c1e] font-data-mono">{mandatoryCount}</div>
            <div className="text-[12px] text-[#75859d]">Mandatory Required Fields (*)</div>
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#c6c6cd]/40 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#dae2fd] text-[#0058be] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">help</span>
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#191c1e] font-data-mono">{optionalCount}</div>
            <div className="text-[12px] text-[#75859d]">Optional Profile Fields</div>
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#c6c6cd]/40 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] text-[#75859d] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">visibility_off</span>
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#191c1e] font-data-mono">{disabledCount}</div>
            <div className="text-[12px] text-[#75859d]">Hidden / Inactive Inputs</div>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#0058be] text-white shadow-2xs font-semibold'
                  : 'bg-[#ffffff] border border-[#c6c6cd]/60 text-[#45464d] hover:bg-[#f2f4f6]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#eceef0] text-[#75859d]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter fields..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-sm text-[#191c1e] outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleBulkSetMandatory(true)}
              className="px-2.5 py-1.5 bg-[#ffffff] border border-[#c6c6cd] text-[#191c1e] rounded-lg text-[11px] font-semibold hover:bg-[#f2f4f6] transition-colors whitespace-nowrap"
              title="Make all active fields mandatory"
            >
              All Required
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetMandatory(false)}
              className="px-2.5 py-1.5 bg-[#ffffff] border border-[#c6c6cd] text-[#191c1e] rounded-lg text-[11px] font-semibold hover:bg-[#f2f4f6] transition-colors whitespace-nowrap"
              title="Make all active fields optional"
            >
              All Optional
            </button>
          </div>
        </div>
      </div>

      {/* Field Matrix Table */}
      <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9fb] border-b border-[#c6c6cd]/40 text-label-uppercase text-[#45464d] text-[11px]">
                <th className="py-3 px-4 font-semibold">Field Name & Data Scope</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-center w-32">Display In UI</th>
                <th className="py-3 px-4 font-semibold text-center w-36">Mandatory (*)</th>
                <th className="py-3 px-4 font-semibold text-right">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0] text-body-sm">
              {filteredFields.map((field) => (
                <tr
                  key={field.id}
                  className={`hover:bg-[#f7f9fb]/80 transition-colors ${
                    !field.enabled ? 'bg-[#f7f9fb]/40 opacity-70' : ''
                  }`}
                >
                  {/* Label & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#191c1e] text-[14px]">
                        {field.label}
                      </span>
                      {field.required && field.enabled && (
                        <span className="text-[#ba1a1a] font-bold text-[16px] leading-none" title="Mandatory Field">*</span>
                      )}
                      {field.locked && (
                        <span className="material-symbols-outlined text-[#75859d] text-[14px]" title="Core required field">
                          lock
                        </span>
                      )}
                    </div>
                    {field.hint && (
                      <p className="text-[11px] text-[#75859d] mt-0.5">{field.hint}</p>
                    )}
                  </td>

                  {/* Category Chip */}
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium capitalize bg-[#f2f4f6] text-[#45464d] border border-[#c6c6cd]/30">
                      {field.category}
                    </span>
                  </td>

                  {/* Enabled Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={field.locked}
                        checked={field.enabled}
                        onChange={() => handleToggleEnabled(field)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be] peer-disabled:opacity-50"></div>
                    </label>
                  </td>

                  {/* Required Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={field.locked || !field.enabled}
                        checked={field.required && field.enabled}
                        onChange={() => handleToggleRequired(field)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ba1a1a] peer-disabled:opacity-40"></div>
                    </label>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-right">
                    {field.locked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0058be] bg-[#dae2fd] px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        System Core
                      </span>
                    ) : !field.enabled ? (
                      <span className="text-[11px] font-medium text-[#75859d] bg-[#f2f4f6] px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    ) : field.required ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">emergency</span>
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0058be] bg-[#dae2fd]/60 px-2.5 py-1 rounded-full">
                        Optional
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
