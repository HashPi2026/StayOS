import React, { useState, useEffect } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { DeviceConfigurationState } from '../../types';
import { initialDeviceConfiguration } from '../../data/deviceConfigurationData';
import { PaymentGatewayTab } from './PaymentGatewayTab';
import { DoorlockTab } from './DoorlockTab';
import { ScannerTab } from './ScannerTab';

export type DeviceConfigSubTab = 'payment-gateway' | 'doorlock' | 'scanner';

interface DeviceConfigurationViewProps {
  initialTab?: DeviceConfigSubTab;
}

export const DeviceConfigurationView: React.FC<DeviceConfigurationViewProps> = ({
  initialTab = 'payment-gateway',
}) => {
  const { activePath, navigate, addToast } = useProperty();

  // Determine active tab from activePath or prop
  const getSubTabFromPath = (path: string): DeviceConfigSubTab => {
    if (path === 'device-configuration-doorlock' || path === 'doorlock-configuration') {
      return 'doorlock';
    }
    if (path === 'device-configuration-scanner' || path === 'scanner-configuration') {
      return 'scanner';
    }
    return 'payment-gateway';
  };

  const [currentTab, setCurrentTab] = useState<DeviceConfigSubTab>(() => {
    if (activePath.includes('doorlock')) return 'doorlock';
    if (activePath.includes('scanner')) return 'scanner';
    return initialTab;
  });

  // Sync when activePath changes
  useEffect(() => {
    setCurrentTab(getSubTabFromPath(activePath));
  }, [activePath]);

  // Load configuration from localStorage or initial defaults
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfigurationState>(() => {
    const saved = localStorage.getItem('stayos_device_configuration');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialDeviceConfiguration;
      }
    }
    return initialDeviceConfiguration;
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleTabChange = (tab: DeviceConfigSubTab) => {
    setCurrentTab(tab);
    if (tab === 'payment-gateway') {
      navigate('device-configuration-payment-gateway');
    } else if (tab === 'doorlock') {
      navigate('device-configuration-doorlock');
    } else if (tab === 'scanner') {
      navigate('device-configuration-scanner');
    }
  };

  const handlePaymentGatewayChange = (updated: typeof deviceConfig.paymentGateway) => {
    setDeviceConfig((prev) => ({ ...prev, paymentGateway: updated }));
    setHasChanges(true);
  };

  const handleDoorlockChange = (updated: typeof deviceConfig.doorlock) => {
    setDeviceConfig((prev) => ({ ...prev, doorlock: updated }));
    setHasChanges(true);
  };

  const handleScannerChange = (updated: typeof deviceConfig.scanner) => {
    setDeviceConfig((prev) => ({ ...prev, scanner: updated }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('stayos_device_configuration', JSON.stringify(deviceConfig));
    setHasChanges(false);
    addToast('Device configuration saved successfully', 'success');
  };

  const handleReset = () => {
    if (currentTab === 'payment-gateway') {
      setDeviceConfig((prev) => ({
        ...prev,
        paymentGateway: initialDeviceConfiguration.paymentGateway,
      }));
      addToast('Reset payment gateway settings to defaults', 'info');
    } else if (currentTab === 'doorlock') {
      setDeviceConfig((prev) => ({
        ...prev,
        doorlock: initialDeviceConfiguration.doorlock,
      }));
      addToast('Reset doorlock configuration to defaults', 'info');
    } else {
      setDeviceConfig((prev) => ({
        ...prev,
        scanner: initialDeviceConfiguration.scanner,
      }));
      addToast('Reset scanner configuration to defaults', 'info');
    }
    setHasChanges(true);
  };

  const handleCancel = () => {
    const saved = localStorage.getItem('stayos_device_configuration');
    if (saved) {
      try {
        setDeviceConfig(JSON.parse(saved));
      } catch {
        setDeviceConfig(initialDeviceConfiguration);
      }
    } else {
      setDeviceConfig(initialDeviceConfiguration);
    }
    setHasChanges(false);
    addToast('Unsaved device configuration changes reverted', 'info');
  };

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Top Header & Breadcrumbs */}
      <div className="border-b border-[#e0e3e5] bg-white px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#75859d] mb-1 font-medium">
              <span>Settings</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#191c1e] font-semibold">Device Configuration</span>
            </div>
            <h1 className="text-[24px] font-bold text-[#191c1e] tracking-tight">
              Device Configuration
            </h1>
            <p className="text-[13px] text-[#75859d] mt-0.5">
              Manage front desk hardware, chip & PIN terminals, electronic doorlock encoders, and optical passport scanners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Reset Section</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex gap-2 border-b border-[#e0e3e5] -mb-5 overflow-x-auto">
          {[
            {
              id: 'payment-gateway',
              label: 'Payment Gateway',
              icon: 'point_of_sale',
              badge: `${deviceConfig.paymentGateway.terminals.length} Terminals`,
            },
            {
              id: 'doorlock',
              label: 'Doorlock Configuration',
              icon: 'vpn_key',
              badge: `${deviceConfig.doorlock.doorlockSystems?.length || 4} Systems`,
            },
            {
              id: 'scanner',
              label: 'Scanner Configuration',
              icon: 'document_scanner',
              badge: `${deviceConfig.scanner.scanners.length} Scanners`,
            },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as DeviceConfigSubTab)}
                className={`flex items-center gap-2 px-4 py-3 text-[14px] font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#0058be] text-[#0058be]'
                    : 'border-transparent text-[#75859d] hover:text-[#191c1e] hover:border-[#c6c6cd]'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#e0ecfc] text-[#0058be]' : 'bg-[#f2f4f6] text-[#75859d]'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto w-full px-8 pt-8 flex flex-col gap-6">
        {currentTab === 'payment-gateway' && (
          <PaymentGatewayTab
            config={deviceConfig.paymentGateway}
            onChange={handlePaymentGatewayChange}
            onShowToast={addToast}
          />
        )}

        {currentTab === 'doorlock' && (
          <DoorlockTab
            config={deviceConfig.doorlock}
            onChange={handleDoorlockChange}
            onShowToast={addToast}
          />
        )}

        {currentTab === 'scanner' && (
          <ScannerTab
            config={deviceConfig.scanner}
            onChange={handleScannerChange}
            onShowToast={addToast}
          />
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-white/95 backdrop-blur-md border-t border-[#e0e3e5] px-8 py-3.5 flex items-center justify-between z-40 shadow-sm">
        <div className="text-[13px] text-[#75859d] flex items-center gap-2">
          {hasChanges ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#f9ab00] animate-pulse"></span>
              <span className="font-semibold text-[#191c1e]">You have unsaved device changes</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#107c41]"></span>
              <span>All hardware configurations are up to date</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              hasChanges
                ? 'text-[#191c1e] hover:bg-[#eceef0]'
                : 'text-[#c6c6cd] cursor-not-allowed'
            }`}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[#000000] text-white hover:bg-[#2d3133] transition-all flex items-center gap-2 shadow-sm active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
