import React from 'react';
import { useProperty } from '../context/PropertyContext';
import { NavigationPath } from '../types';

interface NavItem {
  id: NavigationPath;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { activePath, navigate } = useProperty();

  const sections: NavSection[] = [
    {
      title: 'Property',
      items: [
        { id: 'overview', label: 'Overview', icon: 'analytics' },
        { id: 'room-types', label: 'Room Types', icon: 'bedroom_parent' },
        { id: 'rooms', label: 'Rooms', icon: 'meeting_room' },
        { id: 'amenities', label: 'Amenities', icon: 'pool' },
        { id: 'taxes', label: 'Taxes', icon: 'account_balance_wallet' },
        { id: 'tax-configuration', label: 'Tax Configuration', icon: 'tune' },
        { id: 'buildings', label: 'Buildings', icon: 'domain' },
        { id: 'floors', label: 'Floors', icon: 'layers' },
        { id: 'room-status', label: 'Room Status', icon: 'fact_check' },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { id: 'rates-packages', label: 'Rates', icon: 'sell' },
        { id: 'policies', label: 'Policies', icon: 'policy' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { id: 'user-management', label: 'User Management', icon: 'manage_accounts' },
        { id: 'integrations', label: 'Integrations', icon: 'extension' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
      ],
    },
    {
      title: 'Miscellaneous',
      items: [
        { id: 'audit-logs', label: 'Audit Logs', icon: 'history' },
        { id: 'system-health', label: 'System Health', icon: 'health_and_safety' },
      ],
    },
  ];

  // Helper to determine if item is active
  const isItemActive = (itemId: NavigationPath) => {
    if (activePath === itemId) return true;
    if (itemId === 'buildings' && (activePath === 'add-building' || activePath === 'edit-building')) {
      return true;
    }
    if (itemId === 'room-types' && (activePath === 'add-room-type' || activePath === 'edit-room-type')) {
      return true;
    }
    if (itemId === 'rooms' && (activePath === 'add-room' || activePath === 'bulk-add-rooms' || activePath === 'edit-room')) {
      return true;
    }
    if (itemId === 'taxes' && (activePath === 'taxes' || activePath === 'add-tax' || activePath === 'edit-tax')) {
      return true;
    }
    return false;
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#f2f4f6] z-50 flex flex-col border-r border-[#c6c6cd]/60 select-none">
      {/* Brand & Exit */}
      <div className="px-4 py-6 flex flex-col gap-6">
        <div 
          className="flex items-center gap-2 px-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('overview')}
        >
          <span className="material-symbols-outlined text-[#0058be] text-[26px]">domain</span>
          <span className="font-semibold text-[22px] tracking-tight text-[#191c1e]">StayOS</span>
        </div>
        <button
          onClick={() => navigate('overview')}
          className="flex items-center justify-center gap-2 w-full py-2 bg-[#000000] text-white rounded-lg text-label-uppercase hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Exit Configuration
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 overflow-y-auto space-y-1 pb-8 text-body-sm">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider uppercase text-[#75859d]">
              {section.title}
            </div>
            <div className="space-y-[2px]">
              {section.items.map((item) => {
                const active = isItemActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md transition-all text-left text-[13px] ${
                      active
                        ? 'bg-[#2170e4] text-white font-medium shadow-sm'
                        : 'text-[#45464d] hover:bg-[#e6e8ea] hover:text-[#191c1e]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined mr-2.5 text-[19px] ${
                        active ? 'text-white' : 'text-[#75859d]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
