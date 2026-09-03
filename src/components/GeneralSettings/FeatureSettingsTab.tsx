import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { FeatureSettings } from '../../types';

export const FeatureSettingsTab: React.FC = () => {
  const { generalSettings, updateGeneralSettingsSection } = useProperty();
  const feature: FeatureSettings = generalSettings.feature;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = (key: keyof FeatureSettings) => {
    updateGeneralSettingsSection('feature', { [key]: !feature[key] });
  };

  const handleFieldChange = <K extends keyof FeatureSettings>(field: K, value: FeatureSettings[K]) => {
    updateGeneralSettingsSection('feature', { [field]: value });
  };

  const coreToggles: Array<{
    id: keyof FeatureSettings;
    title: string;
    description: string;
    spanFull?: boolean;
  }> = [
    {
      id: 'enableGroupBooking',
      title: 'Group Booking',
      description: 'Enable group blocks and allotment management.',
    },
    {
      id: 'enableMultiCurrency',
      title: 'Multi-Currency',
      description: 'Allow transactions and reporting in multiple currencies.',
    },
    {
      id: 'enableMultiRoomSelection',
      title: 'Multi-Room Selection',
      description: 'Enable selecting multiple rooms in a single reservation.',
    },
    {
      id: 'enableDeposits',
      title: 'Deposits',
      description: 'Activate deposit requirements and tracking workflows.',
    },
    {
      id: 'enableExpressCheckInOut',
      title: 'Express Check-in/out',
      description: 'Enable streamlined arrival and departure flows via guest portal.',
    },
    {
      id: 'enableRateThreshold',
      title: 'Rate Threshold',
      description: 'Set automated alerts for significant rate variance.',
    },
    {
      id: 'enablePosInterface',
      title: 'POS Interface',
      description: 'Sync with Point of Sale systems for folio routing.',
      spanFull: true,
    },
  ];

  const operationalModules = [
    {
      id: 'enableHousekeeping' as keyof FeatureSettings,
      title: 'Housekeeping & Maid Service Matrix',
      description: 'Track room cleanliness states (Dirty, Cleaning in Progress, Inspected, Out of Order) and assign daily cleaning rosters.',
      icon: 'cleaning_services',
      enabled: feature.enableHousekeeping,
      badge: 'Core Operations',
    },
    {
      id: 'enableMaintenance' as keyof FeatureSettings,
      title: 'Maintenance Work Orders & Asset Tickets',
      description: 'Log preventative maintenance, plumbing, HVAC, and repair jobs with engineering room blocks.',
      icon: 'handyman',
      enabled: feature.enableMaintenance,
      badge: 'Engineering',
    },
    {
      id: 'enableKeycardIntegration' as keyof FeatureSettings,
      title: 'Digital Door Lock & Keycard Encoder Sync',
      description: 'Direct PMS encoder communication to cut RFID keycards and send digital Bluetooth mobile room keys.',
      icon: 'key',
      enabled: feature.enableKeycardIntegration,
      hasExtra: true,
      badge: 'Hardware',
    },
    {
      id: 'enableMinibarBilling' as keyof FeatureSettings,
      title: 'Minibar & In-Room Amenity Auto-Posting',
      description: 'Allow housekeeping staff to post in-room snacks, beverages, and consumable amenities directly to guest folio.',
      icon: 'local_bar',
      enabled: feature.enableMinibarBilling,
      badge: 'F&B POS',
    },
    {
      id: 'enableSelfCheckInKiosk' as keyof FeatureSettings,
      title: 'Guest Self Check-In Kiosk & QR Web App',
      description: 'Enable contactless mobile registration, passport scanning, and QR-code-based room key collection.',
      icon: 'touch_app',
      enabled: feature.enableSelfCheckInKiosk,
      badge: 'Guest Experience',
    },
    {
      id: 'enableChannelManagerSync' as keyof FeatureSettings,
      title: 'Two-Way Channel Manager Rate & Inventory Sync',
      description: 'Real-time 2-way distribution with Booking.com, Expedia, Airbnb, Agoda, and GDS networks.',
      icon: 'sync_alt',
      enabled: feature.enableChannelManagerSync,
      badge: 'Distribution',
    },
    {
      id: 'enableLostAndFound' as keyof FeatureSettings,
      title: 'Lost & Found Property Registry',
      description: 'Catalog items found in vacated rooms with storage locker locations and guest claim verification.',
      icon: 'inventory_2',
      enabled: feature.enableLostAndFound,
      badge: 'Security',
    },
    {
      id: 'enablePackageHandling' as keyof FeatureSettings,
      title: 'Guest Mail & Parcel Delivery Management',
      description: 'Track incoming Amazon, FedEx, and DHL guest courier parcels with automated SMS/email pickup notifications.',
      icon: 'package_2',
      enabled: feature.enablePackageHandling,
      badge: 'Concierge',
    },
    {
      id: 'enableBanquetAndEvents' as keyof FeatureSettings,
      title: 'Banquet & Conference Room Booking Engine',
      description: 'Manage meeting halls, event catering, audiovisual equipment rentals, and B2B corporate contracts.',
      icon: 'meeting_room',
      enabled: feature.enableBanquetAndEvents,
      badge: 'Events & MICE',
    },
    {
      id: 'enableSpaAndWellness' as keyof FeatureSettings,
      title: 'Spa & Wellness Treatment Scheduling',
      description: 'Book therapy rooms, massage appointments, fitness classes, and cross-charge to room bill.',
      icon: 'spa',
      enabled: feature.enableSpaAndWellness,
      badge: 'Wellness',
    },
    {
      id: 'enableLoyaltyProgram' as keyof FeatureSettings,
      title: 'Guest Loyalty & VIP Tier Rewards Engine',
      description: 'Award points per dollar spent, recognize returning frequent travelers, and auto-apply tier perks.',
      icon: 'military_tech',
      enabled: feature.enableLoyaltyProgram,
      badge: 'Retention',
    },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1 mb-1">
        <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#191c1e] tracking-tight">
          Feature Configuration
        </h2>
        <p className="text-[14px] text-[#45464d]">
          Enable system-wide features and manage property-level defaults.
        </p>
      </div>

      {/* Card 1: Core Features */}
      <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#c6c6cd]/50 p-6 flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#eceef0] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#45464d] text-[22px]">toggle_on</span>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#191c1e]">Core Features</h3>
            <p className="text-[13px] text-[#75859d]">Activate modules and operational capabilities.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {coreToggles.map((item) => {
            const isChecked = Boolean(feature[item.id]);
            return (
              <label
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggle(item.id);
                }}
                className={`flex items-start justify-between p-4 rounded-lg bg-[#f2f4f6] hover:bg-[#eceef0] transition-colors cursor-pointer group ${
                  item.spanFull ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-[14px] font-semibold text-[#191c1e]">{item.title}</span>
                  <span className="text-[13px] text-[#75859d] leading-snug">{item.description}</span>
                </div>

                {/* Switch Graphic */}
                <div
                  className={`relative w-11 h-6 rounded-full shrink-0 mt-0.5 transition-colors duration-200 ${
                    isChecked ? 'bg-[#0058be]' : 'bg-[#e0e3e5] group-hover:bg-[#c6c6cd]'
                  }`}
                >
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
                      isChecked
                        ? 'bg-white translate-x-5'
                        : 'bg-[#75859d] translate-x-0'
                    }`}
                  />
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Card 2: Default Values */}
      <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#c6c6cd]/50 p-6 flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3.5 mb-0.5">
          <div className="w-10 h-10 rounded-lg bg-[#eceef0] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#45464d] text-[22px]">tune</span>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#191c1e]">Default Values</h3>
            <p className="text-[13px] text-[#75859d]">Pre-populated settings for new reservations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
          {/* Default Check-in Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#191c1e]">Default Check-in Time</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
                schedule
              </span>
              <input
                type="time"
                value={feature.defaultCheckInTime || '14:00'}
                onChange={(e) => handleFieldChange('defaultCheckInTime', e.target.value)}
                className="w-full bg-[#ffffff] rounded-lg pl-10 pr-4 py-2 text-[14px] text-[#191c1e] border border-[#c6c6cd] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/20 transition-all font-data-mono"
              />
            </div>
          </div>

          {/* Default Check-out Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#191c1e]">Default Check-out Time</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
                schedule
              </span>
              <input
                type="time"
                value={feature.defaultCheckOutTime || '11:00'}
                onChange={(e) => handleFieldChange('defaultCheckOutTime', e.target.value)}
                className="w-full bg-[#ffffff] rounded-lg pl-10 pr-4 py-2 text-[14px] text-[#191c1e] border border-[#c6c6cd] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/20 transition-all font-data-mono"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex flex-col md:col-span-2">
            <div className="w-full h-px bg-[#eceef0] my-1" />
          </div>

          {/* Default Rate Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#191c1e]">Default Rate Type</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
                sell
              </span>
              <select
                value={feature.defaultRateType || 'bar'}
                onChange={(e) => handleFieldChange('defaultRateType', e.target.value as any)}
                className="w-full bg-[#ffffff] rounded-lg pl-10 pr-8 py-2 text-[14px] text-[#191c1e] border border-[#c6c6cd] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/20 appearance-none transition-all cursor-pointer font-medium"
              >
                <option value="bar">Best Available Rate (BAR)</option>
                <option value="corp">Corporate Standard</option>
                <option value="walk">Walk-in Rate</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Default Stay Days */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#191c1e]">Default Stay Days</label>
            <div className="relative flex items-center w-full bg-[#ffffff] rounded-lg border border-[#c6c6cd] focus-within:border-[#0058be] focus-within:ring-1 focus-within:ring-[#0058be]/20 transition-all overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('defaultStayDays', Math.max(1, (feature.defaultStayDays || 1) - 1))
                }
                className="w-10 h-[38px] flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#45464d] hover:text-[#191c1e] transition-colors border-r border-[#c6c6cd]"
                title="Decrease stay days"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                min={1}
                max={365}
                value={feature.defaultStayDays || 1}
                onChange={(e) =>
                  handleFieldChange('defaultStayDays', Math.max(1, parseInt(e.target.value) || 1))
                }
                className="flex-1 w-full bg-transparent text-center py-2 text-[14px] text-[#191c1e] focus:outline-none font-data-mono font-semibold"
              />
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('defaultStayDays', (feature.defaultStayDays || 1) + 1)
                }
                className="w-10 h-[38px] flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#45464d] hover:text-[#191c1e] transition-colors border-l border-[#c6c6cd]"
                title="Increase stay days"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Advanced Operational Modules (Collapsible) */}
      <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#c6c6cd]/50 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-[#f7f9fb]/50 transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#eceef0] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#45464d] text-[22px]">extension</span>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#191c1e]">
                Additional Operations & Hardware Modules
              </h3>
              <p className="text-[13px] text-[#75859d]">
                Housekeeping, maintenance tickets, RFID door locks, minibar, kiosks & channel manager
              </p>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-[#75859d] transition-transform duration-200 text-[24px] ${
              showAdvanced ? 'rotate-180' : 'rotate-0'
            }`}
          >
            expand_more
          </span>
        </button>

        {showAdvanced && (
          <div className="px-5 pb-5">
            <div className="h-px bg-[#eceef0] mb-5 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operationalModules.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    item.enabled
                      ? 'bg-[#ffffff] border-[#0058be]/30 shadow-xs'
                      : 'bg-[#f7f9fb] border-[#c6c6cd]/40 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            item.enabled ? 'bg-[#dae2fd] text-[#0058be]' : 'bg-[#eceef0] text-[#75859d]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[13px] text-[#191c1e]">{item.title}</h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f2f4f6] text-[#45464d] border border-[#c6c6cd]/30">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Switch */}
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggle(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
                      </label>
                    </div>

                    <p className="text-[12px] text-[#45464d] mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.hasExtra && item.enabled && (
                    <div className="mt-3 pt-2.5 border-t border-[#eceef0] flex items-center justify-between text-[12px]">
                      <span className="text-[#75859d] font-medium">Encoder Protocol:</span>
                      <select
                        value={feature.keycardProvider}
                        onChange={(e) => handleFieldChange('keycardProvider', e.target.value as any)}
                        className="bg-[#f7f9fb] border border-[#c6c6cd] rounded px-2 py-1 text-[12px] text-[#191c1e] font-medium outline-none"
                      >
                        <option value="salto">SALTO Systems ProAccess</option>
                        <option value="assa_abloy">ASSA ABLOY VingCard Visionline</option>
                        <option value="dormakaba">Dormakaba Saflok Messenger</option>
                        <option value="generic">Generic RS-232 / TCP Key Encoder</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
