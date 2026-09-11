import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { GuestMandatoryDataTab } from '../general/guest-mandatory-data/GuestMandatoryDataTab';

export const GuestMandatoryDataView: React.FC = () => {
  const {
    saveGeneralSettings,
    resetGeneralSettingsSection,
    generalSettings,
    addToast,
    navigate,
  } = useProperty();

  const [isSaving, setIsSaving] = useState(false);

  const configuredFields = generalSettings.guestMandatoryData?.fields || [];
  const requiredCount = configuredFields.filter((f) => f.required).length;
  const lockedCount = configuredFields.filter((f) => f.locked).length;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveGeneralSettings();
      addToast('Guest mandatory data requirements saved successfully.', 'success');
    } catch {
      addToast('Failed to save guest mandatory settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetGeneralSettingsSection('guestMandatoryData');
    addToast('Reset mandatory data settings to system defaults.', 'info');
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto gap-6 pb-28 px-4 sm:px-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[13px] text-[#45464d]">
            <button
              type="button"
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] transition-colors"
            >
              Property
            </button>
            <span className="text-[11px] text-[#76777d]">/</span>
            <button
              type="button"
              onClick={() => navigate('general-settings')}
              className="hover:text-[#191c1e] transition-colors"
            >
              Settings
            </button>
            <span className="text-[11px] text-[#76777d]">/</span>
            <span className="text-[#191c1e] font-medium">Guest Mandatory Data</span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
            Guest Mandatory Data
          </h1>
          <p className="text-[14px] text-[#45464d]">
            Define required guest demographic and identity fields for reservations and check-in workflows.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-white border border-[#c6c6cd]/60 rounded-lg px-3.5 py-2 flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0058be]" />
            <span className="text-[12px] text-[#45464d]">Required:</span>
            <span className="text-[13px] font-bold text-[#191c1e]">{requiredCount}</span>
          </div>
          <div className="bg-white border border-[#c6c6cd]/60 rounded-lg px-3.5 py-2 flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#76777d]" />
            <span className="text-[12px] text-[#45464d]">Core Locked:</span>
            <span className="text-[13px] font-bold text-[#191c1e]">{lockedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <GuestMandatoryDataTab />

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#c6c6cd]/50 p-4 px-6 sm:px-8 flex items-center justify-between z-30 shadow-md">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          Reset to Default
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('general-settings')}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#45464d] hover:bg-[#eceef0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold hover:bg-[#222222] transition-colors shadow-sm flex items-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
