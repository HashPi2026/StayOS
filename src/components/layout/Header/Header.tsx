import React, { useState, useRef, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const Header: React.FC = () => {
  const {
    properties,
    currentProperty,
    switchProperty,
    setSearchModalOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    navigate,
    currentUser,
    authUsers,
    switchUser,
    logout,
    isDbConnected,
    isDbSyncing,
    syncWithDatabase,
  } = useProperty();

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
    <>
      <header className="fixed top-0 left-[240px] right-0 h-16 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#c6c6cd]/50 z-40 flex items-center justify-between px-6">
        {/* Left: Active Assigned Property (Strictly 1 Property per User) */}
        <div className="flex items-center gap-2.5 bg-[#eceef0]/90 px-3.5 py-1.5 rounded-xl border border-[#c6c6cd]/40 select-none">
          <div className="w-6 h-6 rounded-md bg-[#0058be] text-white flex items-center justify-center text-[12px] font-bold shadow-sm">
            <span className="material-symbols-outlined text-[15px]">hotel</span>
          </div>
          <div className="text-left flex flex-col">
            <span className="text-[13px] font-bold text-[#191c1e] max-w-[260px] truncate leading-tight">
              {currentProperty.identity.name}
            </span>
            <span className="text-[10px] text-[#75859d] leading-none mt-0.5">
              {currentProperty.meta?.code || currentProperty.identity.clientId} • {currentProperty.location.city}, {currentProperty.location.state || currentProperty.location.country}
            </span>
          </div>
          <span className="ml-1 text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
            Property Scoped
          </span>
        </div>

        {/* Right: Search & User Controls */}
        <div className="flex items-center gap-3">
          {/* Database Live Status & Sync Button */}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold tracking-wide">PostgreSQL DB</span>
            <button
              onClick={() => syncWithDatabase()}
              disabled={isDbSyncing}
              className="ml-1 p-0.5 hover:bg-emerald-100 rounded text-emerald-700 disabled:opacity-50 cursor-pointer flex items-center"
              title="Sync now with PostgreSQL Supabase database"
            >
              <span className={`material-symbols-outlined text-[14px] ${isDbSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
            </button>
          </div>

          {/* Exit to Main PMS Button */}
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-[12px] font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Exit Configuration and return to Main PMS Dashboard"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Exit to PMS</span>
          </button>

          {/* Search Trigger */}
          <div
            onClick={() => setSearchModalOpen(true)}
            className="relative flex items-center cursor-pointer group"
          >
            <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[19px] group-hover:text-[#191c1e] transition-colors">
              search
            </span>
            <input
              readOnly
              className="pl-9 pr-8 py-1.5 bg-[#eceef0] rounded-full text-[13px] outline-none w-64 cursor-pointer hover:bg-[#e6e8ea] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e] placeholder:text-[#75859d] transition-all"
              placeholder="Search configuration..."
              type="text"
            />
            <span className="absolute right-2.5 text-[10px] bg-[#ffffff] border border-[#c6c6cd] rounded px-1.5 py-0.5 text-[#75859d] font-mono">
              ⌘K
            </span>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 text-[#45464d]">
            {/* Notifications */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-1 hover:text-[#000000] hover:bg-[#eceef0] rounded-full transition-colors"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#0058be] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#ffffff] rounded-xl shadow-xl border border-[#c6c6cd]/60 py-3 z-50">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-[#eceef0]">
                    <span className="text-[13px] font-semibold text-[#191c1e]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-[#0058be] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#eceef0]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-body-sm text-[#75859d]">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 text-[12px] hover:bg-[#f7f9fb] transition-colors cursor-pointer flex gap-2.5 items-start ${
                            !notif.read ? 'bg-[#f2f4f6]/60' : ''
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] mt-0.5 ${
                              notif.type === 'warning' ? 'text-amber-600' : notif.type === 'success' ? 'text-emerald-600' : 'text-[#0058be]'
                            }`}
                          >
                            {notif.type === 'warning' ? 'warning' : notif.type === 'success' ? 'check_circle' : 'info'}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-[#191c1e]">{notif.title}</div>
                            <div className="text-[#45464d] text-[11px] leading-snug mt-0.5">{notif.message}</div>
                            <div className="text-[#75859d] text-[10px] mt-1">{notif.timestamp}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-1 hover:text-[#000000] hover:bg-[#eceef0] rounded-full transition-colors"
              title="Help & Documentation"
            >
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>

            {/* Profile Avatar */}
            <div className="relative" ref={userDropdownRef}>
              <div
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-8 h-8 rounded-full bg-[#191c1e] flex items-center justify-center ml-1 cursor-pointer hover:ring-2 hover:ring-[#0058be]/30 transition-all text-white font-semibold text-[12px]"
                title={currentUser?.name || 'Marcus Vance'}
              >
                {currentUser?.initials || 'MV'}
              </div>

              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#ffffff] rounded-2xl shadow-xl border border-[#c6c6cd]/60 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2.5 border-b border-[#eceef0]">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-[#191c1e] leading-tight">
                        {currentUser?.name || 'Super Admin'}
                      </div>
                      {currentUser?.roleType === 'SuperAdmin' && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          SuperAdmin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#0058be] font-semibold mt-0.5">
                      {currentUser?.role || 'Super Administrator'}
                    </div>
                    <div className="text-[11px] text-[#75859d] truncate mt-0.5">
                      {currentUser?.email || 'superadmin@stayos.com'}
                    </div>
                  </div>

                  {/* Switch Active User / Account (Single-Property Model) */}
                  <div className="px-3 py-1.5 border-b border-[#eceef0] bg-[#fafafa]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#75859d] px-1 mb-1">
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
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#0058be]/10 text-[#0058be] font-semibold'
                                : 'hover:bg-slate-100 text-[#191c1e]'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <div className="font-medium truncate">{u.name}</div>
                              <div className="text-[10px] text-[#75859d] truncate">
                                {prop?.identity.name || 'Property'} • {u.role}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[14px] text-[#0058be] shrink-0">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('user-management');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f2f4f6] text-[13px] text-[#191c1e] flex items-center gap-2.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#75859d]">manage_accounts</span>
                      <span>Users & Login Credentials</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('audit-logs');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f2f4f6] text-[13px] text-[#191c1e] flex items-center gap-2.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#75859d]">history</span>
                      <span>Audit Logs</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#eceef0]">
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
        </div>
      </header>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#c6c6cd]/60 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">info</span>
                <h3 className="text-title-sm text-[#191c1e]">StayOS Configuration Guide</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="text-[#75859d] hover:text-[#191c1e] p-1 rounded-full hover:bg-[#eceef0]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-body-sm text-[#45464d]">
              <p>
                <strong>Property Master:</strong> Manage primary hotel identity, geo-coordinates, and web address.
              </p>
              <p>
                <strong>Buildings:</strong> Organize wings, towers, and auxiliary structures with room inventory and floor capacities.
              </p>
              <p>
                <strong>Quick Tip:</strong> Use <code className="bg-[#eceef0] px-1.5 py-0.5 rounded text-[11px] font-mono">⌘K</code> or <code className="bg-[#eceef0] px-1.5 py-0.5 rounded text-[11px] font-mono">Ctrl+K</code> anytime to jump between settings quickly.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-1.5 bg-[#000000] text-white text-[13px] font-medium rounded-lg hover:bg-[#333333]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
