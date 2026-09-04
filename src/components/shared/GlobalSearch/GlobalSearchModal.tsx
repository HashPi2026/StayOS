import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { NavigationPath } from '@/src/types';

interface SearchOption {
  id: string;
  title: string;
  category: string;
  icon: string;
  path: NavigationPath;
  targetId?: string;
  description: string;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setSearchModalOpen,
    buildings,
    floors,
    roomTypes,
    rooms,
    taxes,
    otherCharges,
    measurementUnits,
    paymentTypes,
    exchangeRates,
    roles,
    navigate,
    openEditRoleDrawer,
    openEditFloorDrawer,
  } = useProperty();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const baseOptions: SearchOption[] = [
    {
      id: 'opt-prop-master',
      title: 'Property Master (Identity & Location)',
      category: 'Property',
      icon: 'analytics',
      path: 'overview',
      description: 'Configure hotel name, address, coordinates, and contact details.',
    },
    {
      id: 'opt-bld-list',
      title: 'Buildings Management',
      category: 'Property',
      icon: 'domain',
      path: 'buildings',
      description: 'Manage towers, wings, structures, and total floor capacity.',
    },
    {
      id: 'opt-add-bld',
      title: 'Add New Building',
      category: 'Property',
      icon: 'domain_add',
      path: 'add-building',
      description: 'Create a new wing or physical structure in the property.',
    },
    {
      id: 'opt-floors',
      title: 'Floors Configuration',
      category: 'Property',
      icon: 'layers',
      path: 'floors',
      description: 'Manage floor levels across property buildings, wings, and towers.',
    },
    {
      id: 'opt-room-types',
      title: 'Room Types & Categories',
      category: 'Inventory',
      icon: 'bedroom_parent',
      path: 'room-types',
      description: 'Configure King Suites, Deluxe Rooms, rates, and bed types.',
    },
    {
      id: 'opt-add-room-type',
      title: 'Add New Room Type',
      category: 'Inventory',
      icon: 'add_circle',
      path: 'add-room-type',
      description: 'Create a new room class, occupancy rules, bed type, and rate structure.',
    },
    {
      id: 'opt-rooms',
      title: 'Rooms Inventory Grid',
      category: 'Inventory',
      icon: 'meeting_room',
      path: 'rooms',
      description: 'View room statuses, assigned buildings, and floor plans.',
    },
    {
      id: 'opt-add-room',
      title: 'Add New Room',
      category: 'Inventory',
      icon: 'add_circle',
      path: 'add-room',
      description: 'Create a new room number, configure physical hierarchy, and inventory attributes.',
    },
    {
      id: 'opt-bulk-add-rooms',
      title: 'Bulk Add Rooms',
      category: 'Inventory',
      icon: 'auto_fix_high',
      path: 'bulk-add-rooms',
      description: 'Quickly generate a numeric sequence of rooms across buildings and floors in bulk.',
    },
    {
      id: 'opt-amenities',
      title: 'Amenities & Facilities',
      category: 'Property',
      icon: 'pool',
      path: 'amenities',
      description: 'Configure spa, pool, gym, executive lounge, and dining venues.',
    },
    {
      id: 'opt-rates',
      title: 'Rates & Packages',
      category: 'Configuration',
      icon: 'sell',
      path: 'rates-packages',
      description: 'Base pricing, seasonal rate multipliers, and promo packages.',
    },
    {
      id: 'opt-rates-packages',
      title: 'Rate Types (Rates & Packages)',
      category: 'Configuration',
      icon: 'sell',
      path: 'rates-packages',
      description: 'Manage standard and derived rate types, binding discounts, and CRS synchronization.',
    },
    {
      id: 'opt-document-types',
      title: 'Document Types',
      category: 'Configuration',
      icon: 'badge',
      path: 'document-types',
      description: 'Manage property document classifications, identity rules, and default settings.',
    },
    {
      id: 'opt-other-charges-categories',
      title: 'Other Charges Category',
      category: 'Configuration',
      icon: 'category',
      path: 'other-charges-categories',
      description: 'Manage classifications and defaults for non-room charges across the property.',
    },
    {
      id: 'opt-other-charges',
      title: 'Other Charges',
      category: 'Configuration',
      icon: 'receipt_long',
      path: 'other-charges',
      description: 'Manage auxiliary fees, POS items, breakfast, parking, and recurring services.',
    },
    {
      id: 'opt-measurement-units',
      title: 'Measurement Units',
      category: 'Configuration',
      icon: 'scale',
      path: 'measurement-units',
      description: 'Manage units of measure used across the property for inventory, food & beverage, and laundry tracking.',
    },
    {
      id: 'opt-payment-types',
      title: 'Payment Types',
      category: 'Configuration',
      icon: 'credit_card',
      path: 'payment-types',
      description: 'Manage accepted payment methods (Credit Cards, Cash, Digital Wallets, Bank Transfers) and CC processing.',
    },
    {
      id: 'opt-exchange-rates',
      title: 'Exchange Rates',
      category: 'Configuration',
      icon: 'currency_exchange',
      path: 'exchange-rates',
      description: 'Configure multi-currency conversion factors, base currency designation, and currency symbols.',
    },
    {
      id: 'opt-taxes',
      title: 'Taxes',
      category: 'Property',
      icon: 'account_balance_wallet',
      path: 'taxes',
      description: 'Manage jurisdiction tax rates, strategies, and application rules.',
    },
    {
      id: 'opt-tax-config',
      title: 'Tax Configuration',
      category: 'Property',
      icon: 'tune',
      path: 'tax-configuration',
      description: 'Manage local, federal, and custom tax rules applied to reservations.',
    },
    {
      id: 'opt-add-tax',
      title: 'Add New Tax',
      category: 'Property',
      icon: 'add_circle',
      path: 'add-tax',
      description: 'Create a new tax rule, calculation method, and operational settings.',
    },
    {
      id: 'opt-add-tax-rate',
      title: 'Add Tax Rate',
      category: 'Property',
      icon: 'percent',
      path: 'add-tax-rate',
      description: 'Configure active period date range, rate percentages, and overlap validation.',
    },
    {
      id: 'opt-policies',
      title: 'Policies & Cancellation',
      category: 'Configuration',
      icon: 'gavel',
      path: 'policies',
      description: 'Check-in rules, deposit requirements, and cancellation terms.',
    },
    {
      id: 'opt-add-policy',
      title: 'Add New Policy',
      category: 'Configuration',
      icon: 'add_circle',
      path: 'add-policy',
      description: 'Define cancellation, payment, or general booking rules with live preview.',
    },
    {
      id: 'opt-guest-categories',
      title: 'Guest Categories',
      category: 'Configuration',
      icon: 'person_pin',
      path: 'guest-categories',
      description: 'Manage segmentations to identify and cater to VIP, Corporate, and custom guest types.',
    },
    {
      id: 'opt-roles-privileges',
      title: 'Roles & Privileges',
      category: 'Configuration',
      icon: 'admin_panel_settings',
      path: 'roles-privileges',
      description: 'Manage staff roles, operational scopes, and access permissions matrix.',
    },
    {
      id: 'opt-email-templates',
      title: 'E-mail Templates',
      category: 'Configuration',
      icon: 'mail',
      path: 'email-templates',
      description: 'Customize guest transactional email templates, lifecycle trigger events, and dynamic merge variables.',
    },
    {
      id: 'opt-add-email-template',
      title: 'Add E-mail Template',
      category: 'Configuration',
      icon: 'mark_email_unread',
      path: 'add-email-template',
      description: 'Compose a new guest transactional email template with lifecycle triggers.',
    },
    {
      id: 'opt-add-role',
      title: 'Add New Role',
      category: 'Configuration',
      icon: 'add_moderator',
      path: 'add-role',
      description: 'Create a new operational role and define module permission levels.',
    },
    {
      id: 'opt-policies',
      title: 'Policies',
      category: 'Configuration',
      icon: 'gavel',
      path: 'policies',
      description: 'Manage cancellation and deposit rules across room and rate types.',
    },
    {
      id: 'opt-guest-mandatory-data',
      title: 'Guest Mandatory Data',
      category: 'Settings',
      icon: 'how_to_reg',
      path: 'guest-mandatory-data',
      description: 'Configure mandatory fields for reservations and check-in compliance.',
    },
    {
      id: 'opt-device-configuration',
      title: 'Device Configuration',
      category: 'Settings',
      icon: 'devices',
      path: 'device-configuration',
      description: 'Configure hardware devices: Payment Gateway, Doorlock Encoders, and Passport Scanners.',
    },
    {
      id: 'opt-device-payment-gateway',
      title: 'Payment Gateway (Device Configuration)',
      category: 'Settings',
      icon: 'point_of_sale',
      path: 'device-configuration-payment-gateway',
      description: 'Manage countertop EMV terminals, Stripe/Adyen gateways, and pre-auth capture policies.',
    },
    {
      id: 'opt-device-doorlock',
      title: 'Doorlock Configuration (Device Configuration)',
      category: 'Settings',
      icon: 'sensor_door',
      path: 'device-configuration-doorlock',
      description: 'Configure RFID keycard encoders, Assa Abloy/Salto/Dormakaba servers, and mobile keys.',
    },
    {
      id: 'opt-device-scanner',
      title: 'Scanner Configuration (Device Configuration)',
      category: 'Settings',
      icon: 'document_scanner',
      path: 'device-configuration-scanner',
      description: 'Manage Regula/Plustek optical passport scanners, OCR auto-fill, and UV authenticity checks.',
    },
    {
      id: 'opt-audit',
      title: 'Audit Logs & Change History',
      category: 'Miscellaneous',
      icon: 'history',
      path: 'audit-logs',
      description: 'Track staff edits, system updates, and timestamped logs.',
    },
    {
      id: 'opt-health',
      title: 'System Health & Integrations',
      category: 'Miscellaneous',
      icon: 'health_and_safety',
      path: 'system-health',
      description: 'Channel manager connectivity, PMS engine status, and latency.',
    },
  ];

  // Dynamic building options
  const buildingOptions: SearchOption[] = buildings.map((b) => ({
    id: `opt-bld-${b.id}`,
    title: `Edit Building: ${b.name} (${b.code})`,
    category: 'Buildings',
    icon: 'domain',
    path: 'edit-building',
    targetId: b.id,
    description: `${b.totalFloors} floors, status: ${b.status}. ${b.description}`,
  }));

  // Dynamic room type options
  const roomTypeOptions: SearchOption[] = roomTypes.map((rt) => ({
    id: `opt-rt-${rt.id}`,
    title: `Edit Room Type: ${rt.name} (${rt.code})`,
    category: 'Room Types',
    icon: 'bedroom_parent',
    path: 'edit-room-type',
    targetId: rt.id,
    description: `${rt.category} tier, ${rt.bedType}, $${rt.baseRate}/night, ${rt.totalUnits} units in PMS.`,
  }));

  // Dynamic floor options
  const floorOptions: SearchOption[] = floors.map((flr) => ({
    id: `opt-flr-${flr.id}`,
    title: `Floor: ${flr.name} (${flr.buildingName})`,
    category: 'Floors',
    icon: 'layers',
    path: 'floors',
    targetId: flr.id,
    description: `Building: ${flr.buildingName}, status: ${flr.status}. ${flr.description}`,
  }));

  // Dynamic room options
  const roomOptions: SearchOption[] = rooms.map((rm) => ({
    id: `opt-rm-${rm.id}`,
    title: `Room: ${rm.name || `Room ${rm.number}`} (${rm.shortName || rm.number})`,
    category: 'Rooms',
    icon: 'meeting_room',
    path: 'edit-room',
    targetId: rm.id,
    description: `${rm.roomTypeName} in ${rm.buildingName} (Floor ${rm.floor}), status: ${rm.status}, $${rm.rate}/night.`,
  }));

  // Dynamic tax options
  const taxOptions: SearchOption[] = taxes.map((t) => ({
    id: `opt-tax-${t.id}`,
    title: `Tax: ${t.name} (${t.taxType})`,
    category: 'Property',
    icon: 'account_balance_wallet',
    path: 'taxes',
    targetId: t.id,
    description: `${t.taxType} • ${t.calculationStrategy === 'per-day' ? 'Per Day' : 'Per Stay'} • ${t.isActive ? 'Active' : 'Inactive'} • ${t.description || ''}`,
  }));

  // Dynamic other charges options
  const otherChargeOptions: SearchOption[] = otherCharges.map((c) => ({
    id: `opt-charge-${c.id}`,
    title: `Charge: ${c.name} (${c.shortName})`,
    category: 'Other Charges',
    icon: 'receipt_long',
    path: 'other-charges',
    targetId: c.id,
    description: `${c.category} • ${c.price !== undefined ? `$${c.price.toFixed(2)}` : 'Dynamic rate'} • ${c.taxable ? 'Taxable' : 'Non-taxable'} • ${c.reoccur ? `Reoccurring (${c.reoccurFrequency || 'Daily'})` : 'One-time'}`,
  }));

  // Dynamic measurement units options
  const measurementUnitOptions: SearchOption[] = measurementUnits.map((m) => ({
    id: `opt-mu-${m.id}`,
    title: `Unit: ${m.name} (${m.shortName})`,
    category: 'Measurement Units',
    icon: m.icon || 'scale',
    path: 'measurement-units',
    targetId: m.id,
    description: `${m.description || 'Unit of measure used in inventory and billing.'}`,
  }));

  // Dynamic payment types options
  const paymentTypeOptions: SearchOption[] = paymentTypes.map((pt) => ({
    id: `opt-pt-${pt.id}`,
    title: `Payment Type: ${pt.name} (${pt.shortName})`,
    category: 'Payment Types',
    icon: 'credit_card',
    path: 'payment-types',
    targetId: pt.id,
    description: `${pt.category} • CC Processing: ${pt.ccProcessing ? 'Enabled' : 'Disabled'} • Status: ${pt.status} • ${pt.description || ''}`,
  }));

  // Dynamic exchange rate options
  const exchangeRateOptions: SearchOption[] = exchangeRates.map((xr) => ({
    id: `opt-xr-${xr.id}`,
    title: `Exchange Rate: ${xr.country} (${xr.currency} - ${xr.sign})`,
    category: 'Exchange Rates',
    icon: 'currency_exchange',
    path: 'exchange-rates',
    targetId: xr.id,
    description: `Rate: ${xr.rate.toFixed(4)} • ${xr.isBaseRate ? '★ Designated Base Currency' : 'Converted Currency'}`,
  }));

  // Dynamic roles options
  const roleOptions: SearchOption[] = roles.map((r) => ({
    id: `opt-role-${r.id}`,
    title: `Role: ${r.name} (${r.code})`,
    category: 'Roles & Privileges',
    icon: 'admin_panel_settings',
    path: 'roles-privileges',
    targetId: r.id,
    description: `Type: ${r.type} • ${r.usersCount} users • ${r.description || 'Access privileges configuration'}`,
  }));

  const allOptions = [
    ...baseOptions,
    ...buildingOptions,
    ...floorOptions,
    ...roomTypeOptions,
    ...roomOptions,
    ...taxOptions,
    ...otherChargeOptions,
    ...measurementUnitOptions,
    ...paymentTypeOptions,
    ...exchangeRateOptions,
    ...roleOptions,
  ];

  const filtered = query.trim()
    ? allOptions.filter(
        (o) =>
          o.title.toLowerCase().includes(query.toLowerCase()) ||
          o.category.toLowerCase().includes(query.toLowerCase()) ||
          o.description.toLowerCase().includes(query.toLowerCase())
      )
    : allOptions;

  const handleSelect = (option: SearchOption) => {
    navigate(option.path, option.targetId);
    setSearchModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[80] flex items-start justify-center pt-20 p-4"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="bg-[#ffffff] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#c6c6cd]/60 animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[#eceef0] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#0058be] text-[22px]">search</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full text-body-md text-[#191c1e] placeholder:text-[#75859d] outline-none bg-transparent"
            placeholder="Search screens, buildings, room types, or settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchModalOpen(false);
              if (e.key === 'Enter' && filtered.length > 0) {
                handleSelect(filtered[0]);
              }
            }}
          />
          <span className="text-[11px] bg-[#eceef0] text-[#75859d] px-2 py-0.5 rounded font-mono">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#eceef0]/60">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#75859d] text-body-sm">
              No matching configuration found for "{query}"
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                className="p-3 hover:bg-[#f2f4f6] rounded-lg cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eceef0] flex items-center justify-center text-[#0058be] group-hover:bg-[#d8e2ff]">
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#191c1e] flex items-center gap-2">
                      {opt.title}
                      <span className="text-[10px] uppercase font-semibold text-[#75859d] bg-[#eceef0] px-1.5 py-0.5 rounded">
                        {opt.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#75859d] line-clamp-1">{opt.description}</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#75859d] opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#f2f4f6] border-t border-[#eceef0] flex items-center justify-between text-[11px] text-[#75859d]">
          <span>Use ↵ to select, ESC to close</span>
          <span>StayOS Configuration Engine</span>
        </div>
      </div>
    </div>
  );
};
