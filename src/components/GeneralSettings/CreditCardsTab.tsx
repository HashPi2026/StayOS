import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { CreditCardsSettings } from '../../types';

export const CreditCardsTab: React.FC = () => {
  const { generalSettings, updateGeneralSettingsSection, addNotification } = useProperty();
  const cc = generalSettings.creditCards;

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const enableGatewayProcessing = cc.enableGatewayProcessing ?? true;
  const enableTokenization = cc.enableTokenization ?? true;
  const pgApiKey = cc.pgApiKey ?? 'sk_test_51NxXXXXXXXXXXXXXXXXXXXXX';
  const merchantId = cc.merchantId ?? 'MID-992384-US';
  const preAuthAtCheckIn = cc.preAuthAtCheckIn ?? true;
  const preAuthPercentage = cc.preAuthPercentage ?? 120;
  const gdsCrmRouting = cc.gdsCrmRouting ?? true;
  const defaultChargeMethod = cc.defaultChargeMethod ?? 'auth_capture';
  const nightAuditAutoRelease = cc.nightAuditAutoRelease ?? true;
  const nightAuditAutoRefund = cc.nightAuditAutoRefund ?? false;
  const nightAuditAutoCollection = cc.nightAuditAutoCollection ?? true;

  const handleChange = (field: keyof CreditCardsSettings, value: any) => {
    updateGeneralSettingsSection('creditCards', { [field]: value });
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTimeout(() => {
      setIsTestingConnection(false);
      addNotification('Payment Gateway connection verified successfully (HTTP 200 OK, Latency: 38ms)', 'success');
    }, 800);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex-shrink-0 flex flex-col justify-between items-start">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#76777d] mb-1">
          <span>General Settings</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#191c1e]">Credit Card</span>
        </div>
        <h1 className="text-[28px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
          Credit Card Processing
        </h1>
        <p className="text-[14px] text-[#45464d] mt-1 max-w-2xl">
          Configure payment gateways, authorization rules, and automated nightly processing routines. Changes to these settings may affect active reservations.
        </p>
      </div>

      {/* 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1200px]">
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gateway Configuration Card */}
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold text-[#191c1e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0058be]">security</span>
                  Gateway Configuration
                </h2>
                <p className="text-[13px] text-[#45464d] mt-0.5">
                  Connect your property to the primary payment gateway.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#eceef0] text-[#191c1e] hover:bg-[#e0e3e5] text-[13px] font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[18px] ${isTestingConnection ? 'animate-spin' : ''}`}>
                  {isTestingConnection ? 'sync' : 'gpp_good'}
                </span>
                <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {/* Enable Gateway Processing */}
              <div className="flex items-center justify-between py-2 border-b border-[#eceef0]/70">
                <div>
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    Enable Gateway Processing
                  </label>
                  <span className="text-[13px] text-[#45464d]">
                    Allow live transactions through the primary PG.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableGatewayProcessing}
                    onChange={(e) => handleChange('enableGatewayProcessing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Tokenized Service */}
              <div className="flex items-center justify-between py-2 border-b border-[#eceef0]/70">
                <div>
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    Tokenized Service
                  </label>
                  <span className="text-[13px] text-[#45464d]">
                    Store payment methods securely using vault tokens.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableTokenization}
                    onChange={(e) => handleChange('enableTokenization', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* API Key & Merchant ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#45464d] font-medium block">
                    PG API Key
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={pgApiKey}
                      onChange={(e) => handleChange('pgApiKey', e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none pr-10 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 p-1 text-[#76777d] hover:text-[#191c1e] transition-colors"
                      title={showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showApiKey ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#45464d] font-medium block">
                    Merchant ID
                  </label>
                  <input
                    type="text"
                    value={merchantId}
                    onChange={(e) => handleChange('merchantId', e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Authorization Policies Card */}
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 space-y-5">
            <div>
              <h2 className="text-[18px] font-semibold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0058be]">credit_card</span>
                Authorization Policies
              </h2>
              <p className="text-[13px] text-[#45464d] mt-0.5">
                Rules for holding funds against reservations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    Authorization at Check-in
                  </label>
                  <span className="text-[13px] text-[#45464d]">
                    Automatically trigger auth request upon status change to &apos;In-House&apos;.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={preAuthAtCheckIn}
                    onChange={(e) => handleChange('preAuthAtCheckIn', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Pre-auth Amount Subcontainer */}
              <div className="bg-[#f2f4f6] rounded-xl p-4 border border-[#c6c6cd]/40 space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[14px] font-semibold text-[#191c1e]">
                    Pre-authorization Amount (%)
                  </label>
                  <div className="relative w-28">
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={preAuthPercentage}
                      onChange={(e) => handleChange('preAuthPercentage', Number(e.target.value) || 0)}
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg pl-3 pr-8 py-1.5 text-[14px] font-mono font-semibold text-[#191c1e] text-right focus:border-[#0058be] outline-none shadow-2xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[13px] font-semibold pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                <p className="text-[13px] text-[#45464d] leading-relaxed">
                  Define the default percentage of the total estimated stay value to be authorized upon guest arrival (Standard is 120% to cover incidentals).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Routing & Methods Card */}
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 space-y-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0058be]">route</span>
                Routing & Methods
              </h2>
              <p className="text-[13px] text-[#45464d] mt-0.5">
                Determine how payments are processed during different guest lifecycle events.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-start justify-between py-2 border-b border-[#eceef0]/70">
                <div className="pr-3">
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    GDS/CRM Routing
                  </label>
                  <span className="text-[12px] text-[#45464d]">
                    Allow central systems to push CC info directly to folio.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={gdsCrmRouting}
                    onChange={(e) => handleChange('gdsCrmRouting', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-[#45464d] font-medium block">
                  Default Charge Method
                </label>
                <div className="relative">
                  <select
                    value={defaultChargeMethod}
                    onChange={(e) => handleChange('defaultChargeMethod', e.target.value as any)}
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] font-medium appearance-none focus:border-[#0058be] outline-none shadow-2xs cursor-pointer pr-10"
                  >
                    <option value="auth_capture">Auth and Capture</option>
                    <option value="auth_only">Auth Only</option>
                    <option value="manual">Manual processing</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#76777d] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Night Audit Automation Card */}
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 space-y-4 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#0058be]/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-[18px] font-semibold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0058be]">nightlight</span>
                Night Audit Automation
              </h2>
              <p className="text-[13px] text-[#45464d] mt-0.5">
                Routines run during EOD process.
              </p>
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f7f9fb] transition-colors">
                <div className="pr-3">
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    Auto Release
                  </label>
                  <span className="text-[12px] text-[#45464d] line-clamp-1">
                    Release unused authorizations
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightAuditAutoRelease}
                    onChange={(e) => handleChange('nightAuditAutoRelease', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f7f9fb] transition-colors">
                <div className="pr-3">
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    Auto Refund
                  </label>
                  <span className="text-[12px] text-[#45464d] line-clamp-1">
                    Process refunds for overpayments
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightAuditAutoRefund}
                    onChange={(e) => handleChange('nightAuditAutoRefund', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f7f9fb] transition-colors">
                <div className="pr-3">
                  <label className="text-[14px] font-semibold text-[#191c1e] block cursor-pointer">
                    Auto Collection
                  </label>
                  <span className="text-[12px] text-[#45464d] line-clamp-1">
                    Collect outstanding balances
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightAuditAutoCollection}
                    onChange={(e) => handleChange('nightAuditAutoCollection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* PCI-DSS Compliant Decorative Card */}
          <div className="bg-[#131b2e] rounded-xl shadow-xs overflow-hidden h-44 relative flex items-center justify-center group border border-[#c6c6cd]/30">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full mix-blend-luminosity opacity-40 group-hover:opacity-55 transition-opacity duration-700"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFvF1tyNDgp2usJjkEECcNXislsKxmk3VxnylAi_JILvXnMviXsN_CGTfVTmHVvfH5h2WPGSL8j85aHDJvqUOm_-97CeafXRJy1xTeX2rsf4bCUybsuSX2FWp602Rm9V4qNHIDjb-Ug7B4gKIIzsCsqho_xO_UNz2C9gmaAVrrOqR47DbWE-V982cSVdwHDto4KIIBY6oGMGe6jPJXm6XB1GtQTUitksFJZ9FfpS3cuvzHnu050Hwl')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/90 via-[#131b2e]/40 to-transparent" />
            <div className="relative z-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-[36px] text-[#2170e4] mb-1.5 drop-shadow-sm">
                verified_user
              </span>
              <span className="text-[12px] font-bold tracking-wider uppercase text-white/95 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 shadow-xs">
                PCI-DSS Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
