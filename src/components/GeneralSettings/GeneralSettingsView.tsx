import React from 'react';
import { useProperty } from '../../context/PropertyContext';
import { GeneralSettingsTab } from '../../types';
import { RentalSettingsTab } from './RentalSettingsTab';
import { FeatureSettingsTab } from './FeatureSettingsTab';
import { NightAuditsTab } from './NightAuditsTab';
import { LocalizationTab } from './LocalizationTab';
import { DisplayTab } from './DisplayTab';
import { FoliosTab } from './FoliosTab';
import { CreditCardsTab } from './CreditCardsTab';
import { EmailsTab } from './EmailsTab';
import { GuestMandatoryDataTab } from './GuestMandatoryDataTab';

export const GeneralSettingsView: React.FC = () => {
  const {
    activeGeneralSettingsTab,
    saveGeneralSettings,
    resetGeneralSettingsSection,
  } = useProperty();

  const renderActiveTabContent = () => {
    switch (activeGeneralSettingsTab) {
      case 'rental':
        return <RentalSettingsTab />;
      case 'feature':
        return <FeatureSettingsTab />;
      case 'night-audits':
        return <NightAuditsTab />;
      case 'localization':
        return <LocalizationTab />;
      case 'display':
        return <DisplayTab />;
      case 'folios':
        return <FoliosTab />;
      case 'credit-cards':
        return <CreditCardsTab />;
      case 'emails':
        return <EmailsTab />;
      case 'guest-mandatory-data':
        return <GuestMandatoryDataTab />;
      default:
        return <RentalSettingsTab />;
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto gap-6 pb-28 px-4 sm:px-6">
      {/* Page Header (rendered only for tabs without their own top-level heading) */}
      {!['rental', 'feature', 'night-audits', 'localization', 'display', 'folios', 'credit-cards', 'emails'].includes(activeGeneralSettingsTab) && (
        <div className="flex items-baseline justify-between w-full mb-2">
          <div>
            <h1 className="text-[28px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
              General Settings
            </h1>
            <p className="text-[14px] text-[#45464d] mt-1">
              Configure global property parameters and enable core system features.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full flex flex-col gap-6">
        {renderActiveTabContent()}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#c6c6cd]/50 p-4 px-6 sm:px-8 flex items-center justify-between z-30 shadow-md">
        {activeGeneralSettingsTab === 'night-audits' ? (
          <div className="text-[13px] text-[#45464d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#0058be]">info</span>
            <span>Changes affect the next scheduled audit.</span>
          </div>
        ) : activeGeneralSettingsTab === 'localization' ? (
          <div className="text-[13px] text-[#45464d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">history</span>
            <span>Last updated: Today, 09:41 AM by Alex Rivera</span>
          </div>
        ) : activeGeneralSettingsTab === 'display' ? (
          <div />
        ) : activeGeneralSettingsTab === 'folios' ? (
          <button
            type="button"
            onClick={() => resetGeneralSettingsSection('folios')}
            className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-[13px] font-semibold hover:bg-[#eceef0] transition-colors"
          >
            Reset to Default
          </button>
        ) : activeGeneralSettingsTab === 'credit-cards' ? (
          <div className="flex items-center gap-1.5 text-[13px] text-[#45464d]">
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">info</span>
            <span>Last modified by Admin on Oct 24, 2023</span>
          </div>
        ) : activeGeneralSettingsTab === 'emails' ? (
          <div className="flex items-center gap-1.5 text-[13px] text-[#45464d]">
            <span className="material-symbols-outlined text-[18px] text-[#76777d]">history</span>
            <span>Last modified by Admin on Oct 24, 2023 at 14:32</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const sectionKey = activeGeneralSettingsTab === 'guest-mandatory-data' 
                ? 'guestMandatoryData' 
                : activeGeneralSettingsTab;
              resetGeneralSettingsSection(sectionKey as any);
            }}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Reset to Default
          </button>
        )}

        <div className="flex items-center gap-3">
          {activeGeneralSettingsTab === 'night-audits' ? (
            <button
              type="button"
              onClick={() => resetGeneralSettingsSection('nightAudits')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors border border-[#c6c6cd]"
            >
              Reset to Default
            </button>
          ) : activeGeneralSettingsTab === 'localization' ? (
            <button
              type="button"
              onClick={() => resetGeneralSettingsSection('localization')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors border border-[#c6c6cd]"
            >
              Reset to Default
            </button>
          ) : activeGeneralSettingsTab === 'display' ? (
            <button
              type="button"
              onClick={() => resetGeneralSettingsSection('display')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors border border-[#c6c6cd]"
            >
              Reset to Default
            </button>
          ) : activeGeneralSettingsTab === 'folios' ? (
            <button
              type="button"
              onClick={() => resetGeneralSettingsSection('folios')}
              className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-[#45464d] text-[13px] font-semibold hover:bg-[#eceef0] transition-colors"
            >
              Cancel
            </button>
          ) : activeGeneralSettingsTab === 'credit-cards' ? (
            <button
              type="button"
              onClick={() => resetGeneralSettingsSection('creditCards')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors"
            >
              Reset to Default
            </button>
          ) : activeGeneralSettingsTab === 'emails' ? (
            <button
              type="button"
              onClick={() => resetGeneralSettingsSection('emails')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors"
            >
              Reset to Default
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const sectionKey = activeGeneralSettingsTab === 'guest-mandatory-data' 
                  ? 'guestMandatoryData' 
                  : activeGeneralSettingsTab;
                resetGeneralSettingsSection(sectionKey as any);
              }}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={saveGeneralSettings}
            className="px-5 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold hover:bg-[#222222] transition-colors shadow-sm flex items-center gap-2 active:scale-98 group"
          >
            {activeGeneralSettingsTab === 'localization' ? (
              <>
                <span>Save Changes</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            ) : activeGeneralSettingsTab === 'display' ? (
              <span>Save Changes</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
