import React, { useState, useEffect } from 'react';
import { CategoryScreen } from './screens/CategoryScreen';
import { BusinessSourceScreen } from './screens/BusinessSourceScreen';
import { InvoiceScreen } from './screens/InvoiceScreen';
import { CommissionInvoiceScreen } from './screens/CommissionInvoiceScreen';

export type BusinessChannelsScreenKey =
  | 'category'
  | 'business-source'
  | 'invoice'
  | 'commission-invoice';

interface BusinessChannelsViewProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export function resolveBusinessChannelsScreen(tab?: string): BusinessChannelsScreenKey {
  if (!tab) return 'category';
  const clean = tab.toLowerCase().trim();
  if (clean.includes('commission')) return 'commission-invoice';
  if (clean.includes('invoice')) return 'invoice';
  if (clean.includes('source')) return 'business-source';
  if (clean.includes('category') || clean.includes('categories')) return 'category';
  return 'category';
}

const BUSINESS_CHANNELS_TABS: {
  key: BusinessChannelsScreenKey;
  label: string;
  icon: string;
  countBadge?: string;
  description: string;
}[] = [
  {
    key: 'category',
    label: 'Category',
    icon: 'category',
    countBadge: '6',
    description: 'Channel taxonomy, commission eligibility, and credit allowance rules',
  },
  {
    key: 'business-source',
    label: 'Business Source',
    icon: 'corporate_fare',
    countBadge: '8',
    description: 'Master accounts, OTAs, travel agencies, and credit limits',
  },
  {
    key: 'invoice',
    label: 'Invoice',
    icon: 'receipt_long',
    countBadge: '5',
    description: 'City ledger master invoices, corporate folios, and payment processing',
  },
  {
    key: 'commission-invoice',
    label: 'Commission Invoice',
    icon: 'percent',
    countBadge: '4',
    description: 'OTA fee audits, agent commissions, and net payout vouchers',
  },
];

export const BusinessChannelsView: React.FC<BusinessChannelsViewProps> = ({
  initialTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<BusinessChannelsScreenKey>(() => {
    return resolveBusinessChannelsScreen(initialTab);
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveBusinessChannelsScreen(initialTab));
    }
  }, [initialTab]);

  const handleTabChange = (key: BusinessChannelsScreenKey) => {
    setActiveTab(key);
    if (onTabChange) {
      onTabChange(key);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)] bg-[#f5f6fa]">
      {/* Sub-Navigation Header Bar */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/40 px-lg pt-sm pb-0 sticky top-16 z-20 shadow-xs">
        <div className="max-w-[1720px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          {/* Module Identifier */}
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-[#4472C4]/10 text-[#4472C4] flex items-center justify-center border border-[#4472C4]/20">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-xs">
                <span className="font-title-sm text-title-sm font-bold text-on-surface">
                  Business Channels
                </span>
                <span className="px-xs py-0.5 rounded text-[10px] font-label-uppercase font-bold bg-[#4472C4]/15 text-[#4472C4] border border-[#4472C4]/30">
                  Distribution & AR Ledger
                </span>
              </div>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                Enterprise B2B billing, OTA channel commission management, and travel agency accounts
              </span>
            </div>
          </div>

          {/* Screen Switcher Tabs */}
          <div className="flex items-center gap-xs overflow-x-auto no-scrollbar pt-xs">
            {BUSINESS_CHANNELS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-xs px-md py-sm rounded-t-lg font-label-uppercase text-label-uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[#4472C4] text-[#4472C4] bg-surface-container-lowest font-bold shadow-xs'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/80'
                  }`}
                  type="button"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isActive ? 'text-[#4472C4]' : 'text-on-surface-variant'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.countBadge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#4472C4] text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {tab.countBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Screen Container */}
      <div className="flex-1 w-full py-md">
        {activeTab === 'category' && (
          <CategoryScreen onNavigateToTab={(tab) => handleTabChange(resolveBusinessChannelsScreen(tab))} />
        )}
        {activeTab === 'business-source' && (
          <BusinessSourceScreen onNavigateToTab={(tab) => handleTabChange(resolveBusinessChannelsScreen(tab))} />
        )}
        {activeTab === 'invoice' && (
          <InvoiceScreen onNavigateToTab={(tab) => handleTabChange(resolveBusinessChannelsScreen(tab))} />
        )}
        {activeTab === 'commission-invoice' && (
          <CommissionInvoiceScreen onNavigateToTab={(tab) => handleTabChange(resolveBusinessChannelsScreen(tab))} />
        )}
      </div>
    </div>
  );
};
