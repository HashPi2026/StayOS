import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { DisplaySettings } from '../../types';

export const DisplayTab: React.FC = () => {
  const { generalSettings, updateGeneralSettingsSection } = useProperty();
  const display = generalSettings.display;

  // Collapsible cards state (all open by default)
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    visibility: true,
    visuals: true,
    guest: true,
    print: true,
    lifecycle: true,
    storage: true,
  });

  const toggleCard = (cardId: string) => {
    setOpenCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleFieldChange = (field: keyof DisplaySettings, value: any) => {
    updateGeneralSettingsSection('display', { [field]: value });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 mb-1">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
          Display Settings
        </h1>
        <p className="text-[14px] text-[#45464d] max-w-2xl">
          Configure UI behavior, visual indicators, and communication templates.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Record Visibility Card */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
          <div
            onClick={() => toggleCard('visibility')}
            className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  visibility
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                Record Visibility
              </h3>
            </div>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                openCards.visibility ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </div>

          {openCards.visibility && (
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[14px] font-semibold text-[#191c1e] block">
                    Show deleted records in list views
                  </label>
                  <p className="text-[13px] text-[#45464d] mt-0.5">
                    When enabled, archived and deleted records will appear with a &apos;Deleted&apos; badge.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={display.showDeletedRecords ?? false}
                    onChange={(e) => handleFieldChange('showDeletedRecords', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 2. Visual Indicators Card */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
          <div
            onClick={() => toggleCard('visuals')}
            className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  palette
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                Visual Indicators
              </h3>
            </div>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                openCards.visuals ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </div>

          {openCards.visuals && (
            <div className="p-6 space-y-5">
              {/* Row 1: High-contrast badges */}
              <div className="flex items-start justify-between gap-4 border-b border-[#eceef0] pb-5">
                <div className="flex-1">
                  <label className="text-[14px] font-semibold text-[#191c1e] block">
                    Enable high-contrast icon badges
                  </label>
                  <p className="text-[13px] text-[#45464d] mt-0.5">
                    Increases contrast for status badges in data tables for better readability.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={display.highContrastBadges !== false}
                    onChange={(e) => handleFieldChange('highContrastBadges', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Row 2: Row Highlighting */}
              <div className="flex items-start justify-between gap-4 border-b border-[#eceef0] pb-5">
                <div className="flex-1">
                  <label className="text-[14px] font-semibold text-[#191c1e] block">
                    Use status-specific row highlighting
                  </label>
                  <p className="text-[13px] text-[#45464d] mt-0.5">
                    Applies subtle background tints to entire rows based on record status (e.g., green for checked-in).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={display.statusRowHighlighting ?? false}
                    onChange={(e) => handleFieldChange('statusRowHighlighting', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Row 3: Status Indicator Style */}
              <div>
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                  Status Indicator Style
                </label>
                <div className="relative">
                  <select
                    value={display.statusIndicatorStyle || 'Bordered'}
                    onChange={(e) => handleFieldChange('statusIndicatorStyle', e.target.value)}
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] font-medium appearance-none focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow cursor-pointer"
                  >
                    <option value="Solid">Solid</option>
                    <option value="Bordered">Bordered</option>
                    <option value="Text-only">Text-only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Guest Display Card */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
          <div
            onClick={() => toggleCard('guest')}
            className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  person
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                Guest Display
              </h3>
            </div>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                openCards.guest ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </div>

          {openCards.guest && (
            <div className="p-6">
              <div>
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                  Guest Name Casing
                </label>
                <div className="relative">
                  <select
                    value={display.guestNameCasing || 'Proper Case (John Doe)'}
                    onChange={(e) => handleFieldChange('guestNameCasing', e.target.value)}
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] font-medium appearance-none focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow cursor-pointer"
                  >
                    <option value="Sentence Case (John Doe)">Sentence Case (John Doe)</option>
                    <option value="ALL CAPS (JOHN DOE)">ALL CAPS (JOHN DOE)</option>
                    <option value="Proper Case (John Doe)">Proper Case (John Doe)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
                <p className="text-[13px] text-[#45464d] mt-2">
                  Determines how guest names are formatted across folios and dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Printing & Reports Card */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
          <div
            onClick={() => toggleCard('print')}
            className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  print
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                Printing &amp; Reports
              </h3>
            </div>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                openCards.print ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </div>

          {openCards.print && (
            <div className="p-6 space-y-5">
              {/* Radio Group: Default Print Layout */}
              <div className="border-b border-[#eceef0] pb-5">
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-3">
                  Default Print Layout
                </label>
                <div className="flex flex-col gap-2.5">
                  {(['Standard Layout', 'Compact Layout', 'Extended Layout'] as const).map(
                    (layout) => (
                      <label
                        key={layout}
                        className="flex items-center gap-3 cursor-pointer group select-none w-max"
                      >
                        <input
                          type="radio"
                          name="print-layout"
                          value={layout}
                          checked={(display.defaultPrintLayout || 'Compact Layout') === layout}
                          onChange={() => handleFieldChange('defaultPrintLayout', layout)}
                          className="w-4 h-4 text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] cursor-pointer"
                        />
                        <span className="text-[14px] text-[#191c1e] group-hover:text-[#0058be] transition-colors font-medium">
                          {layout}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Include property logo on internal reports */}
              <div className="flex items-start justify-between gap-4 border-b border-[#eceef0] pb-5">
                <div className="flex-1">
                  <label className="text-[14px] font-semibold text-[#191c1e] block">
                    Include property logo on internal reports
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={display.includePropertyLogoOnReports !== false}
                    onChange={(e) =>
                      handleFieldChange('includePropertyLogoOnReports', e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Enable page numbering for multi-page PDF exports */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[14px] font-semibold text-[#191c1e] block">
                    Enable page numbering for multi-page PDF exports
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={display.enablePageNumberingPdf !== false}
                    onChange={(e) =>
                      handleFieldChange('enablePageNumberingPdf', e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 5. Lifecycle Messages Card */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
          <div
            onClick={() => toggleCard('lifecycle')}
            className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  mail
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                Lifecycle Messages
              </h3>
            </div>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                openCards.lifecycle ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </div>

          {openCards.lifecycle && (
            <div className="p-6 space-y-5">
              {/* Check-in Welcome Message */}
              <div>
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                  Check-in Welcome Message
                </label>
                <textarea
                  rows={3}
                  value={
                    display.checkInWelcomeMessage ||
                    'Welcome to Grand Plaza Hotel & Spa. We hope you enjoy your stay. Please contact the front desk if you require any assistance.'
                  }
                  onChange={(e) => handleFieldChange('checkInWelcomeMessage', e.target.value)}
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow resize-y min-h-[80px]"
                />
              </div>

              {/* Check-out Thank You Message */}
              <div>
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                  Check-out Thank You Message
                </label>
                <textarea
                  rows={3}
                  value={
                    display.checkOutThankYouMessage ||
                    'Thank you for choosing Grand Plaza Hotel & Spa. We look forward to welcoming you back soon.'
                  }
                  onChange={(e) => handleFieldChange('checkOutThankYouMessage', e.target.value)}
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow resize-y min-h-[80px]"
                />
              </div>

              {/* No-show Notification Footer */}
              <div>
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                  No-show Notification Footer
                </label>
                <textarea
                  rows={3}
                  value={
                    display.noShowNotificationFooter ||
                    'Please note that no-show penalties may apply as per the booking terms and conditions.'
                  }
                  onChange={(e) => handleFieldChange('noShowNotificationFooter', e.target.value)}
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow resize-y min-h-[80px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 6. Document Storage Card */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
          <div
            onClick={() => toggleCard('storage')}
            className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  cloud
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                Document Storage
              </h3>
            </div>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                openCards.storage ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </div>

          {openCards.storage && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Storage Target */}
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                    Document Storage Target
                  </label>
                  <div className="relative">
                    <select
                      value={display.documentStorageTarget || 'Internal Cloud'}
                      onChange={(e) =>
                        handleFieldChange(
                          'documentStorageTarget',
                          e.target.value as DisplaySettings['documentStorageTarget']
                        )
                      }
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] font-medium appearance-none focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow cursor-pointer"
                    >
                      <option value="Internal Cloud">Internal Cloud</option>
                      <option value="Amazon S3">Amazon S3</option>
                      <option value="Google Cloud Storage">Google Cloud Storage</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Storage Path Prefix */}
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase block mb-1.5">
                    Storage Path Prefix
                  </label>
                  <input
                    type="text"
                    value={display.storagePathPrefix || '/documents/grand-plaza/'}
                    onChange={(e) => handleFieldChange('storagePathPrefix', e.target.value)}
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg py-2.5 px-4 text-[14px] text-[#191c1e] font-mono focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
