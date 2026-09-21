import React, { useState, useEffect } from 'react';
import { SearchReservationScreen } from './screens/SearchReservationScreen';
import { GuestLedgerScreen } from './screens/GuestLedgerScreen';
import { BatchFolioScreen } from './screens/BatchFolioScreen';
import { ChangeRoomStatusScreen } from './screens/ChangeRoomStatusScreen';
import { BlockRoomScreen } from './screens/BlockRoomScreen';
import { EditGroupScreen } from './screens/EditGroupScreen';
import { RoomCommentsScreen } from './screens/RoomCommentsScreen';

export type FrontDeskScreenKey =
  | 'search-reservation'
  | 'guest-ledger'
  | 'batch-folio'
  | 'change-room-status'
  | 'block-room'
  | 'edit-group'
  | 'room-comments';

interface FrontDeskViewProps {
  initialScreen?: string;
  onScreenChange?: (screen: string) => void;
}

export function resolveFrontDeskScreen(screen?: string): FrontDeskScreenKey {
  if (!screen) return 'search-reservation';
  const clean = screen.toLowerCase().trim();
  if (clean.includes('guest-ledger') || clean.includes('ledger')) return 'guest-ledger';
  if (clean.includes('batch-folio') || clean.includes('folio')) return 'batch-folio';
  if (clean.includes('change-room-status') || clean.includes('room-status')) return 'change-room-status';
  if (clean.includes('block-room') || clean.includes('block')) return 'block-room';
  if (clean.includes('edit-group') || clean.includes('group')) return 'edit-group';
  if (clean.includes('room-comments') || clean.includes('comments')) return 'room-comments';
  if (clean.includes('search-reservation') || clean.includes('search')) return 'search-reservation';
  return 'search-reservation';
}

const FRONT_DESK_TABS: { key: FrontDeskScreenKey; label: string; icon: string; countBadge?: string }[] = [
  { key: 'search-reservation', label: 'Search Reservation', icon: 'manage_search' },
  { key: 'guest-ledger', label: 'Guest Ledger', icon: 'menu_book', countBadge: '6' },
  { key: 'batch-folio', label: 'Batch Folio', icon: 'receipt_long', countBadge: '8' },
  { key: 'change-room-status', label: 'Change Room Status', icon: 'published_with_changes' },
  { key: 'block-room', label: 'Block Room', icon: 'domain_disabled', countBadge: '6' },
  { key: 'edit-group', label: 'Edit Group', icon: 'groups' },
  { key: 'room-comments', label: 'Room Comments', icon: 'rate_review' },
];

export const FrontDeskView: React.FC<FrontDeskViewProps> = ({ initialScreen, onScreenChange }) => {
  const [activeScreen, setActiveScreen] = useState<FrontDeskScreenKey>(() => {
    return resolveFrontDeskScreen(initialScreen);
  });

  useEffect(() => {
    if (initialScreen) {
      setActiveScreen(resolveFrontDeskScreen(initialScreen));
    }
  }, [initialScreen]);

  const handleTabChange = (key: FrontDeskScreenKey) => {
    setActiveScreen(key);
    if (onScreenChange) onScreenChange(key);
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)] bg-[#f5f6fa] text-[#191c1e]">
      {/* Front Desk Secondary Submenu Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 px-lg shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 py-1.5">
          <div className="flex items-center gap-1">
            {FRONT_DESK_TABS.map((tab) => {
              const isActive = activeScreen === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-body-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4472C4] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.countBadge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-data-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.countBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 text-xs font-data-mono text-slate-500 border-l border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AUDIT DATE: 29-JUN-2026</span>
          </div>
        </div>
      </div>

      {/* Screen Render Container */}
      <div className="flex-1 w-full">
        {activeScreen === 'search-reservation' && (
          <SearchReservationScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
        {activeScreen === 'guest-ledger' && (
          <GuestLedgerScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
        {activeScreen === 'batch-folio' && (
          <BatchFolioScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
        {activeScreen === 'change-room-status' && (
          <ChangeRoomStatusScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
        {activeScreen === 'block-room' && (
          <BlockRoomScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
        {activeScreen === 'edit-group' && (
          <EditGroupScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
        {activeScreen === 'room-comments' && (
          <RoomCommentsScreen onNavigateToScreen={(s) => handleTabChange(s as FrontDeskScreenKey)} />
        )}
      </div>
    </div>
  );
};
