import React, { useState, useRef, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

interface PmsHeaderProps {
  isSidebarCollapsed: boolean;
}

export const PmsHeader: React.FC<PmsHeaderProps> = ({ isSidebarCollapsed }) => {
  const {
    properties,
    currentProperty,
    setSearchModalOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    currentUser,
    authUsers,
    switchUser,
    logout,
    navigate,
    tenantSubscription,
    tenantCapMetrics,
  } = useProperty();

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-[#e2e8f0] shadow-xs z-40 flex items-center justify-between px-6 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'left-[72px]' : 'left-[220px]'
      }`}
    >
      {/* Left: Property Switcher & Working Date */}
      <div className="flex items-center gap-5 min-w-0">
        {/* Scoped Single Property Badge (1 User = 1 Property) */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] select-none shadow-2xs">
          <div className="w-7 h-7 rounded-md bg-[#4472C4] text-white flex items-center justify-center font-bold text-[12px] shrink-0">
            <span className="material-symbols-outlined text-[16px]">hotel</span>
          </div>
          <div className="text-left flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-slate-800 truncate max-w-[220px] leading-tight">
              {currentProperty?.identity?.name || 'Assigned Hotel'}
            </span>
            <span className="text-[10px] text-slate-500 leading-none mt-0.5">
              {currentProperty?.location?.city || 'Location'} • {currentProperty?.meta?.code || currentProperty?.identity?.clientId || 'PROP'}
            </span>
          </div>
          <span className="ml-1 text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
            Assigned Property
          </span>
        </div>

        {/* SaaS Tenant & CAP Theorem Isolation Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/90 rounded-lg border border-emerald-200/80 text-emerald-800 text-[11px] font-medium select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tenant: <strong className="font-semibold font-mono text-[11px]">{currentProperty?.identity?.clientId}</strong></span>
          <span className="text-emerald-300">•</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-900 font-mono text-[10px] font-semibold">
            CAP: {tenantCapMetrics?.theoremModel || 'CP'} Isolated
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-900 text-[10px] font-semibold">
            {tenantSubscription?.plan || 'Pro'}
          </span>
        </div>

        {/* Center-left: Current Working Date (from UIUX Design Doc) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] text-slate-700">
          <span className="material-symbols-outlined text-[17px] text-[#4472C4]">
            calendar_today
          </span>
          <span className="text-[12px] font-medium text-slate-700">
            Working Date: <strong className="text-slate-900 font-semibold">29-Jun-2026</strong>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Night Audit cycle current" />
        </div>
      </div>

      {/* Center-Right: Global Search */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div
          onClick={() => setSearchModalOpen(true)}
          className="relative flex items-center bg-[#f8fafc] border border-[#e2e8f0] hover:border-slate-300 rounded-lg px-3 py-2 cursor-pointer transition-colors group"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 mr-2">
            search
          </span>
          <span className="text-[13px] text-slate-400 flex-1 truncate select-none">
            Search guest names, reservations, rooms, folios...
          </span>
          <span className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-mono shadow-2xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Quick Launch Configuration button */}
        <button
          onClick={() => navigate('overview')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#4472C4] bg-[#d9e1f2]/50 hover:bg-[#d9e1f2] transition-colors border border-[#4472C4]/20 cursor-pointer"
          title="Open Property Configuration"
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
          <span>Configuration</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#4472C4] rounded-full ring-2 ring-white" />
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-3 z-50">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-[13px] font-semibold text-slate-800">Operational Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-[#4472C4] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-slate-400">
                    No active system alerts
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 text-[12px] hover:bg-slate-50 transition-colors cursor-pointer flex gap-2.5 items-start ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[17px] mt-0.5 ${
                          notif.type === 'warning'
                            ? 'text-amber-500'
                            : notif.type === 'success'
                            ? 'text-emerald-500'
                            : 'text-[#4472C4]'
                        }`}
                      >
                        {notif.type === 'warning'
                          ? 'warning'
                          : notif.type === 'success'
                          ? 'check_circle'
                          : 'info'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-[12px]">
                          {notif.title}
                        </div>
                        <div className="text-slate-500 text-[11px] leading-snug mt-0.5">
                          {notif.message}
                        </div>
                        <div className="text-slate-400 text-[10px] mt-1">{notif.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-semibold text-[12px] ring-2 ring-[#4472C4]/20">
              {currentUser?.initials || 'MV'}
            </div>
            <div className="text-left hidden xl:flex flex-col">
              <span className="text-[12px] font-bold text-slate-800 leading-tight">
                {currentUser?.name || 'Marcus Vance'}
              </span>
              <span className="text-[10px] text-slate-500 leading-none mt-0.5">
                {currentUser?.role || 'Administrator'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 hidden xl:block">
              expand_more
            </span>
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-[13px] font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'Marcus Vance'}
                </div>
                <div className="text-[11px] text-[#4472C4] font-semibold mt-0.5">
                  {currentUser?.role || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {currentUser?.email || 'marcus.vance@grandmetropole.com'}
                </div>
              </div>

              {/* Single-Property Account Switcher */}
              <div className="px-3 py-1.5 border-b border-slate-100 bg-[#f8fafc]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Switch Account (1 User = 1 Hotel)
                </div>
                <div className="space-y-1">
                  {authUsers.filter((u) => u.status === 'active').map((u) => {
                    const isSelected = currentUser?.id === u.id;
                    const prop = properties.find((p) => p.id === (u.accessiblePropertyIds?.[0] || u.defaultPropertyId));
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#4472C4]/10 text-[#4472C4] font-semibold'
                            : 'hover:bg-slate-200/60 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="font-medium truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {prop?.identity?.name || 'Property'} • {u.role}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px] text-[#4472C4] shrink-0">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('overview');
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] text-slate-700 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#4472C4]">
                    settings
                  </span>
                  <span>Property Configuration</span>
                </button>
                <button
                  onClick={() => {
                    navigate('user-management');
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[13px] text-slate-700 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">
                    manage_accounts
                  </span>
                  <span>Users & Login Credentials</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 text-[13px] text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
