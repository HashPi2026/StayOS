import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';
export const Sidebar = () => {
    const { activePath, navigate } = useProperty();
    const [openSubMenus, setOpenSubMenus] = React.useState({
        'general-settings': true,
        'device-configuration': true,
    });
    const toggleSubMenu = (menuId) => {
        setOpenSubMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };
    const sections = [
        {
            title: 'Property',
            items: [
                { id: 'overview', label: 'Overview', icon: 'analytics' },
                { id: 'buildings', label: 'Buildings', icon: 'domain' },
                { id: 'floors', label: 'Floors', icon: 'layers' },
                { id: 'room-types', label: 'Room Types', icon: 'bedroom_parent' },
                { id: 'rooms', label: 'Rooms', icon: 'meeting_room' },
                { id: 'room-status', label: 'Room Status', icon: 'fact_check' },
                { id: 'taxes', label: 'Taxes', icon: 'account_balance_wallet' },
                { id: 'tax-configuration', label: 'Tax Configuration', icon: 'tune' },
            ],
        },
        {
            title: 'Configuration',
            items: [
                { id: 'rates-packages', label: 'Rates & Packages', icon: 'sell' },
                { id: 'document-types', label: 'Document Types', icon: 'badge' },
                { id: 'other-charges-categories', label: 'Other Charges Category', icon: 'category' },
                { id: 'other-charges', label: 'Other Charges', icon: 'receipt_long' },
                { id: 'measurement-units', label: 'Measurement Units', icon: 'scale' },
                { id: 'payment-types', label: 'Payment Types', icon: 'credit_card' },
                { id: 'exchange-rates', label: 'Exchange Rates', icon: 'currency_exchange' },
                { id: 'email-templates', label: 'E-mail Templates', icon: 'mail' },
                { id: 'roles-privileges', label: 'Roles & Privileges', icon: 'admin_panel_settings' },
                { id: 'user-management', label: 'User Management', icon: 'manage_accounts' },
                { id: 'policies', label: 'Policies', icon: 'gavel' },
                { id: 'guest-categories', label: 'Guest Categories', icon: 'person_pin' },
            ],
        },
        {
            title: 'Settings',
            items: [
                {
                    id: 'general-settings',
                    label: 'General Settings',
                    icon: 'settings',
                    subItems: [
                        { id: 'general-settings-rental', label: 'Rental', icon: 'hotel' },
                        { id: 'general-settings-feature', label: 'Feature', icon: 'toggle_on' },
                        { id: 'general-settings-night-audits', label: 'Night Audit', icon: 'schedule' },
                        { id: 'general-settings-localization', label: 'Localization', icon: 'public' },
                        { id: 'general-settings-display', label: 'Display', icon: 'desktop_windows' },
                        { id: 'general-settings-folios', label: 'Folio', icon: 'receipt_long' },
                        { id: 'general-settings-credit-cards', label: 'Credit Card', icon: 'credit_card' },
                        { id: 'general-settings-emails', label: 'Emails', icon: 'mail' },
                    ],
                },
                { id: 'guest-mandatory-data', label: 'Guest Mandatory Data', icon: 'how_to_reg' },
                { id: 'crs-tax-exempt', label: 'CRS Tax Exempt', icon: 'account_balance' },
                {
                    id: 'device-configuration',
                    label: 'Device Configuration',
                    icon: 'devices',
                    subItems: [
                        { id: 'device-configuration-payment-gateway', label: 'Payment Gateway', icon: 'point_of_sale' },
                        { id: 'device-configuration-doorlock', label: 'Doorlock Configuration', icon: 'sensor_door' },
                        { id: 'device-configuration-scanner', label: 'Scanner Configuration', icon: 'document_scanner' },
                    ],
                },
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
    const isItemActive = (itemId) => {
        if (activePath === itemId)
            return true;
        if (itemId === 'general-settings' && (activePath === 'general-settings' ||
            activePath === 'general-settings-rental' ||
            activePath === 'general-settings-feature' ||
            activePath === 'general-settings-night-audits' ||
            activePath === 'general-settings-localization' ||
            activePath === 'general-settings-display' ||
            activePath === 'general-settings-folios' ||
            activePath === 'general-settings-credit-cards' ||
            activePath === 'general-settings-emails')) {
            return true;
        }
        if (itemId === 'guest-mandatory-data' && (activePath === 'guest-mandatory-data' ||
            activePath === 'general-settings-guest-mandatory-data')) {
            return true;
        }
        if (itemId === 'crs-tax-exempt' && (activePath === 'crs-tax-exempt' ||
            activePath === 'add-crs-tax-exempt' ||
            activePath === 'edit-crs-tax-exempt')) {
            return true;
        }
        if (itemId === 'device-configuration' && (activePath === 'device-configuration' ||
            activePath === 'device-configuration-payment-gateway' ||
            activePath === 'device-configuration-doorlock' ||
            activePath === 'device-configuration-scanner' ||
            activePath === 'payment-gateway' ||
            activePath === 'doorlock-configuration' ||
            activePath === 'scanner-configuration')) {
            return true;
        }
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
        if (itemId === 'document-types' && (activePath === 'document-types' || activePath === 'add-document-type' || activePath === 'edit-document-type')) {
            return true;
        }
        if (itemId === 'other-charges-categories' && (activePath === 'other-charges-categories' || activePath === 'add-other-charge-category' || activePath === 'edit-other-charge-category')) {
            return true;
        }
        if (itemId === 'other-charges' && (activePath === 'other-charges' || activePath === 'add-other-charge' || activePath === 'edit-other-charge')) {
            return true;
        }
        if (itemId === 'measurement-units' && (activePath === 'measurement-units' || activePath === 'add-measurement-unit' || activePath === 'edit-measurement-unit')) {
            return true;
        }
        if (itemId === 'payment-types' && (activePath === 'payment-types' || activePath === 'add-payment-type' || activePath === 'edit-payment-type')) {
            return true;
        }
        if (itemId === 'exchange-rates' && (activePath === 'exchange-rates' || activePath === 'add-exchange-rate' || activePath === 'edit-exchange-rate')) {
            return true;
        }
        if (itemId === 'roles-privileges' && (activePath === 'roles-privileges' || activePath === 'add-role' || activePath === 'edit-role')) {
            return true;
        }
        if (itemId === 'policies' && (activePath === 'policies' || activePath === 'add-policy' || activePath === 'edit-policy')) {
            return true;
        }
        return false;
    };
    return (<aside className="fixed left-0 top-0 h-full w-[240px] bg-[#f2f4f6] z-50 flex flex-col border-r border-[#c6c6cd]/60 select-none">
      {/* Brand & Exit */}
      <div className="px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('overview')}>
          <span className="material-symbols-outlined text-[#0058be] text-[26px]">domain</span>
          <span className="font-semibold text-[22px] tracking-tight text-[#191c1e]">StayOS</span>
        </div>
        <button onClick={() => navigate('overview')} className="flex items-center justify-center gap-2 w-full py-2 bg-[#000000] text-white rounded-lg text-label-uppercase hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Exit Configuration
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 overflow-y-auto space-y-1 pb-8 text-body-sm">
        {sections.map((section) => (<div key={section.title} className="mb-2">
            <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider uppercase text-[#75859d]">
              {section.title}
            </div>
            <div className="space-y-[2px]">
              {section.items.map((item) => {
                const active = isItemActive(item.id);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                return (<div key={item.id} className="space-y-0.5">
                    <div className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-left text-[13px] group cursor-pointer ${active && !hasSubItems
                        ? 'bg-[#2170e4] text-white font-medium shadow-sm'
                        : active && hasSubItems
                            ? 'bg-[#e0ecfc] text-[#0058be] font-semibold'
                            : 'text-[#45464d] hover:bg-[#e6e8ea] hover:text-[#191c1e]'}`} onClick={() => {
                        navigate(item.id);
                        if (hasSubItems) {
                            setOpenSubMenus((prev) => ({ ...prev, [item.id]: true }));
                        }
                    }}>
                      <div className="flex items-center min-w-0">
                        <span className={`material-symbols-outlined mr-2.5 text-[19px] shrink-0 ${active && !hasSubItems
                        ? 'text-white'
                        : active && hasSubItems
                            ? 'text-[#0058be]'
                            : 'text-[#75859d]'}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {hasSubItems && (<button type="button" onClick={(e) => {
                            e.stopPropagation();
                            toggleSubMenu(item.id);
                        }} className="p-0.5 hover:bg-black/5 rounded text-[#75859d]">
                          <span className={`material-symbols-outlined text-[16px] transition-transform ${openSubMenus[item.id] ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>)}
                    </div>

                    {/* Sub-Items list */}
                    {hasSubItems && openSubMenus[item.id] && (<div className="pl-4 pr-1 py-1 space-y-[2px] border-l-2 border-[#dae2fd] ml-4 my-1">
                        {item.subItems.map((sub) => {
                            const isSubActive = activePath === sub.id ||
                                (sub.id === 'device-configuration-payment-gateway' && activePath === 'payment-gateway') ||
                                (sub.id === 'device-configuration-doorlock' && activePath === 'doorlock-configuration') ||
                                (sub.id === 'device-configuration-scanner' && activePath === 'scanner-configuration');
                            return (<button key={sub.id} onClick={() => navigate(sub.id)} className={`w-full flex items-center px-2.5 py-1.5 rounded-md transition-all text-left text-[12px] ${isSubActive
                                    ? 'bg-[#2170e4] text-white font-semibold shadow-xs'
                                    : 'text-[#5f6368] hover:bg-[#e6e8ea] hover:text-[#191c1e]'}`}>
                              <span className={`material-symbols-outlined mr-2 text-[15px] shrink-0 ${isSubActive ? 'text-white' : 'text-[#75859d]'}`}>
                                {sub.icon}
                              </span>
                              <span className="truncate">{sub.label}</span>
                            </button>);
                        })}
                      </div>)}
                  </div>);
            })}
            </div>
          </div>))}
      </nav>
    </aside>);
};
