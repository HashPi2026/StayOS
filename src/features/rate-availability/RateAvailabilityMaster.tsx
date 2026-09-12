import React, { useState, useEffect } from 'react';
import { RateAvailabilitySubMenu } from './types';
import { FlashScreen } from './FlashScreen';
import { ForecastingScreen } from './ForecastingScreen';
import { RateMatrixScreen } from './RateMatrixScreen';
import { RestrictionsScreen } from './RestrictionsScreen';
import { useProperty } from '../../context/PropertyContext';

interface RateAvailabilityMasterProps {
  initialSubMenu?: string;
}

export const RateAvailabilityMaster: React.FC<RateAvailabilityMasterProps> = ({
  initialSubMenu = 'flash',
}) => {
  const { navigate } = useProperty();

  // Normalize initial tab
  const getSubMenuKey = (sub: string): RateAvailabilitySubMenu => {
    if (sub.includes('forecasting')) return 'forecasting';
    if (sub.includes('restriction')) return 'restriction';
    if (sub.includes('rate')) return 'rate';
    return 'flash';
  };

  const [activeTab, setActiveTab] = useState<RateAvailabilitySubMenu>(getSubMenuKey(initialSubMenu));
  const [toastMessage, setToMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(getSubMenuKey(initialSubMenu));
  }, [initialSubMenu]);

  const handleTabChange = (tab: RateAvailabilitySubMenu) => {
    setActiveTab(tab);
    if (navigate) {
      navigate(`rate-availability-${tab}`);
    }
  };

  const showToast = (msg: string) => {
    setToMessage(msg);
    setTimeout(() => {
      setToMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const tabs: { key: RateAvailabilitySubMenu; label: string; icon: string; badge?: string }[] = [
    { key: 'flash', label: 'Flash', icon: 'bolt' },
    { key: 'forecasting', label: 'Forecasting', icon: 'trending_up', badge: 'v4.2' },
    { key: 'rate', label: 'Rate', icon: 'sell' },
    { key: 'restriction', label: 'Restriction', icon: 'rule' },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#f5f6fa]">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#191c1e] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-[#0058be] text-[20px]">check_circle</span>
          <span className="text-[13px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Sub-menu Navigation Bar */}
      <div className="w-full bg-white border-b border-[#e2e8f0] px-6 sticky top-16 z-30 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 -mb-[1px]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 py-3.5 px-5 font-semibold text-[14px] border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#0058be] text-[#0058be]'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#0058be]' : 'text-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#d8e2ff] text-[#001a42] rounded">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3 text-[12px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PMS SynXis ARI Link: Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Sub-Menu View Screen */}
      <div className="w-full flex-1">
        {activeTab === 'flash' && <FlashScreen onNotify={showToast} />}
        {activeTab === 'forecasting' && <ForecastingScreen onNotify={showToast} />}
        {activeTab === 'rate' && <RateMatrixScreen onNotify={showToast} />}
        {activeTab === 'restriction' && <RestrictionsScreen onNotify={showToast} />}
      </div>
    </div>
  );
};
