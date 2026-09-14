import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { NavigationPath } from '@/src/types';
import { PmsModuleInfo } from './types';

interface PmsSidebarProps {
  modules: PmsModuleInfo[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const PmsSidebar: React.FC<PmsSidebarProps> = ({
  modules,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { activePath, navigate, currentUser } = useProperty();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({
    rate_availability: true,
    guest: true,
  });

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleModuleClick = (mod: PmsModuleInfo) => {
    if (!mod.hasAccess) return;

    if (mod.moduleKey === 'configuration') {
      // Switches layout seamlessly into the Configuration module
      navigate('overview');
    } else if (mod.subItems && mod.subItems.length > 0) {
      // Ensure submenu is expanded
      setOpenSubMenus((prev) => ({
        ...prev,
        [mod.moduleKey]: true,
      }));
      // If currently not on one of the sub-items, navigate to the first sub-item
      const isAlreadyInSub = mod.subItems.some(
        (sub) =>
          activePath === sub.path ||
          activePath === sub.key ||
          activePath === `rate-availability-${sub.key}` ||
          activePath === `rate_availability_${sub.key}` ||
          activePath === `guest-${sub.key}` ||
          activePath === `guest_${sub.key}` ||
          (mod.moduleKey === 'guest' && (activePath === sub.key || activePath === sub.path))
      );
      if (!isAlreadyInSub) {
        navigate(mod.subItems[0].path);
      }
    } else {
      navigate(mod.moduleKey as NavigationPath);
    }
  };

  const isModuleActive = (mod: PmsModuleInfo) => {
    if (mod.moduleKey === 'configuration') {
      return (
        activePath === 'configuration' ||
        activePath === 'overview' ||
        activePath === 'buildings' ||
        activePath === 'floors' ||
        activePath === 'room-types' ||
        activePath === 'rooms' ||
        activePath === 'room-status' ||
        activePath === 'taxes' ||
        activePath === 'rates-packages' ||
        activePath === 'document-types' ||
        activePath === 'other-charges' ||
        activePath === 'measurement-units' ||
        activePath === 'payment-types' ||
        activePath === 'exchange-rates' ||
        activePath === 'policies' ||
        activePath === 'guest-categories' ||
        activePath === 'user-management' ||
        activePath === 'email-templates' ||
        activePath === 'roles-privileges' ||
        activePath === 'general-settings' ||
        activePath === 'device-configuration' ||
        activePath === 'crs-tax-exempt'
      );
    }
    if (mod.moduleKey === 'rate_availability') {
      return (
        activePath === 'rate_availability' ||
        activePath === 'rate-availability' ||
        activePath.startsWith('rate-availability-') ||
        activePath.startsWith('rate_availability_')
      );
    }
    if (mod.moduleKey === 'guest') {
      return (
        activePath === 'guest' ||
        activePath.startsWith('guest-') ||
        activePath.startsWith('guest/') ||
        activePath === 'contacts' ||
        activePath.startsWith('contacts-') ||
        activePath === 'lost-and-found' ||
        activePath === 'add-guest' ||
        activePath === 'edit-guest'
      );
    }
    return (
      activePath === mod.moduleKey ||
      activePath === (mod.moduleKey.replace(/_/g, '-') as NavigationPath)
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#0f172a] text-white z-50 flex flex-col border-r border-[#1e293b] select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-[220px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1e293b] shrink-0 justify-between">
        <div
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden py-1 group"
          title="StayOS PMS"
        >
          <div className="w-9 h-9 rounded-xl bg-[#4472C4] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:bg-[#3b62a8] transition-colors">
            <span className="material-symbols-outlined text-[20px]">hotel</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[18px] tracking-tight leading-none text-white">
                Stay<span className="text-[#60a5fa]">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 uppercase">
                Property PMS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 11 PMS Nav Items */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden space-y-1">
        {modules.map((mod) => {
          const active = isModuleActive(mod);
          const locked = !mod.hasAccess;
          const hasSubItems = Boolean(mod.subItems && mod.subItems.length > 0);
          const isSubMenuExpanded = openSubMenus[mod.moduleKey] ?? true;

          return (
            <div key={mod.moduleKey} className="relative group/module">
              <button
                onClick={() => handleModuleClick(mod)}
                disabled={locked}
                title={
                  locked
                    ? `${mod.displayName} (Locked: Requires higher role privileges)`
                    : mod.displayName
                }
                className={`w-full flex items-center rounded-lg transition-all text-left text-[13px] relative group cursor-pointer ${
                  isCollapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'bg-[#4472C4] text-white font-semibold shadow-sm'
                    : locked
                    ? 'text-slate-500 opacity-40 cursor-not-allowed hover:bg-transparent'
                    : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                {/* Left Active Accent Bar in brand color #4472C4 */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#93c5fd] rounded-r" />
                )}

                {/* Module Icon */}
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
                    active ? 'text-white' : locked ? 'text-slate-500' : 'text-slate-300 group-hover:text-white'
                  } ${isCollapsed ? '' : 'mr-3'}`}
                >
                  {mod.materialIcon}
                </span>

                {/* Module Label (expanded) */}
                {!isCollapsed && (
                  <span className="truncate flex-1 font-medium">{mod.displayName}</span>
                )}

                {/* Submenu Expand Chevron */}
                {!isCollapsed && hasSubItems && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubMenu(mod.moduleKey);
                    }}
                    className="material-symbols-outlined text-[16px] text-slate-400 hover:text-white transition-transform duration-200 p-0.5 rounded cursor-pointer ml-1 shrink-0"
                    title={isSubMenuExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                  >
                    {isSubMenuExpanded ? 'expand_more' : 'chevron_right'}
                  </span>
                )}

                {/* Lock icon for role-restricted items */}
                {locked && (
                  <span
                    className="material-symbols-outlined text-[15px] text-slate-400 shrink-0 ml-1.5"
                    title="Locked for your role"
                  >
                    lock
                  </span>
                )}
              </button>

              {/* Sub-menu items (Expanded Sidebar) */}
              {!isCollapsed && hasSubItems && isSubMenuExpanded && (
                <div className="pl-3 pr-1 py-1 space-y-0.5 ml-4 border-l-2 border-[#1e293b] my-1">
                  {mod.subItems!.map((sub, idx) => {
                    const isSubActive =
                      activePath === sub.path ||
                      activePath === sub.key ||
                      activePath === `rate-availability-${sub.key}` ||
                      activePath === `rate_availability_${sub.key}` ||
                      activePath === `guest-${sub.key}` ||
                      (sub.key === 'guest-database' && (activePath === 'guest' || activePath === 'guest-database' || activePath === 'guest-hub' || activePath === 'guest-add' || activePath === 'guest-edit' || activePath === 'add-guest' || activePath === 'edit-guest')) ||
                      (sub.key === 'contacts' && (activePath === 'contacts' || activePath.startsWith('contacts-'))) ||
                      (sub.key === 'lost-and-found' && (activePath === 'lost-and-found' || activePath === 'lost_and_found'));

                    return (
                      <button
                        key={sub.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(sub.path);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-all cursor-pointer text-left ${
                          isSubActive
                            ? 'bg-[#4472C4]/30 text-[#93c5fd] font-semibold border-l-2 border-[#60a5fa]'
                            : 'text-slate-400 hover:text-white hover:bg-[#1e293b]'
                        }`}
                        title={sub.displayName}
                      >
                        <span
                          className={`material-symbols-outlined text-[15px] shrink-0 ${
                            isSubActive ? 'text-[#93c5fd]' : 'text-slate-400'
                          }`}
                        >
                          {sub.materialIcon}
                        </span>
                        <span className="truncate flex-1 font-medium">
                          {sub.displayName}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1 py-0.2 rounded shrink-0 ${
                            isSubActive
                              ? 'bg-[#4472C4] text-white'
                              : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Submenu Flyout for Collapsed Sidebar */}
              {isCollapsed && hasSubItems && (
                <div className="absolute left-full top-0 ml-2 hidden group-hover/module:flex flex-col bg-[#0f172a] border border-[#1e293b] rounded-lg shadow-xl py-2 px-1.5 min-w-[170px] z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1e293b] mb-1">
                    {mod.displayName}
                  </div>
                  {mod.subItems!.map((sub, idx) => {
                    const isSubActive =
                      activePath === sub.path ||
                      activePath === sub.key ||
                      activePath === `rate-availability-${sub.key}` ||
                      activePath === `rate_availability_${sub.key}` ||
                      activePath === `guest-${sub.key}` ||
                      (sub.key === 'guest-database' && (activePath === 'guest' || activePath === 'guest-database' || activePath === 'guest-hub' || activePath === 'guest-add' || activePath === 'guest-edit' || activePath === 'add-guest' || activePath === 'edit-guest')) ||
                      (sub.key === 'contacts' && (activePath === 'contacts' || activePath.startsWith('contacts-'))) ||
                      (sub.key === 'lost-and-found' && (activePath === 'lost-and-found' || activePath === 'lost_and_found'));
                    return (
                      <button
                        key={sub.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(sub.path);
                        }}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-left transition-colors cursor-pointer ${
                          isSubActive
                            ? 'bg-[#4472C4] text-white font-semibold'
                            : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {sub.materialIcon}
                        </span>
                        <span className="truncate flex-1">{sub.displayName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section: Collapse Toggle & Active Staff Badge */}
      <div className="p-3 border-t border-[#1e293b] shrink-0 flex flex-col gap-2">
        {!isCollapsed && currentUser && (
          <div className="px-2 py-1.5 rounded-lg bg-[#1e293b]/60 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#4472C4] text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser.initials || 'MV'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-white truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[9px] text-slate-400 truncate leading-none mt-0.5">
                {currentUser.role}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`flex items-center text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg py-2 transition-colors cursor-pointer text-[12px] font-medium ${
            isCollapsed ? 'justify-center w-full' : 'px-2 gap-2.5'
          }`}
          title={isCollapsed ? 'Expand Sidebar (220px)' : 'Collapse Sidebar (72px)'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span>Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
};
