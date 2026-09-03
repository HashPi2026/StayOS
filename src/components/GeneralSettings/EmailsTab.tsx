import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { EmailsSettings } from '../../types';

export const EmailsTab: React.FC = () => {
  const { generalSettings, updateGeneralSettingsSection, addToast } = useProperty();
  const emails = generalSettings.emails;

  const [activeNav, setActiveNav] = useState<'smtp' | 'sender'>('smtp');
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [queueCount, setQueueCount] = useState(142);

  // Field values with fallbacks matching design
  const smtpServer = emails.smtpServer ?? 'smtp.grandplaza.internal';
  const smtpPort = emails.smtpPort ?? 587;
  const domain = emails.domain ?? 'grandplaza.com';
  const enableSslTls = emails.enableSslTls ?? true;
  const smtpUsername = emails.smtpUsername ?? 'system@grandplaza.com';
  const smtpPassword = emails.smtpPassword ?? 'supersecretpassword123';
  const smtpStatus = emails.smtpStatus ?? 'failed';

  const fromAddress = emails.fromAddress ?? emails.senderEmail ?? 'reservations@grandplaza.com';
  const replyToAddress = emails.replyToAddress ?? emails.replyToEmail ?? 'support@grandplaza.com';
  const fromName = emails.fromName ?? emails.senderName ?? 'Grand Plaza Reservations';
  const defaultAdminRecipient = emails.defaultAdminRecipient ?? emails.frontDeskInbox ?? 'frontdesk@grandplaza.com';
  const globalBccAddress = emails.globalBccAddress ?? '';

  const handleChange = (field: keyof EmailsSettings, value: any) => {
    updateGeneralSettingsSection('emails', { [field]: value });
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      // Flip status to connected or show successful ping
      handleChange('smtpStatus', 'connected');
      addToast('SMTP Connection verified successfully. Latency: 41ms. Handshake: TLSv1.3 OK.', 'success');
    }, 900);
  };

  const scrollToSection = (sectionId: string, navKey: 'smtp' | 'sender') => {
    setActiveNav(navKey);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Mock queue items for interactive queue drawer/modal
  const queueItems = [
    { id: 'Q-9812', recipient: 'sarah.t@example.com', subject: 'Booking Confirmation: Res #GP-88392', type: 'Confirmation', status: 'Pending', retries: 2 },
    { id: 'Q-9813', recipient: 'david.kim@example.com', subject: 'Pre-Arrival Check-in: Res #GP-88395', type: 'Pre-Arrival', status: 'Pending', retries: 1 },
    { id: 'Q-9814', recipient: 'j.mendoza@corporate.org', subject: 'Guest Folio & Invoice: Res #GP-88380', type: 'Folio Invoice', status: 'Pending', retries: 3 },
    { id: 'Q-9815', recipient: 'frontdesk@grandplaza.com', subject: 'Night Audit Shift EOD Summary Report', type: 'Internal Alert', status: 'Queued', retries: 0 },
    { id: 'Q-9816', recipient: 'elena.rodriguez@domain.com', subject: 'Booking Cancellation Voucher: Res #GP-88371', type: 'Cancellation', status: 'Queued', retries: 0 },
  ];

  const handleFlushQueue = () => {
    setQueueCount(0);
    addToast('Email queue cleared successfully', 'info');
  };

  const handleRetryAllQueue = () => {
    addToast(`Initiating batch dispatch of ${queueCount} queued messages...`, 'info');
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#c6c6cd]/40">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d] mb-1">
            General Settings
          </div>
          <h1 className="text-[28px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight font-display-lg">
            Email Configuration
          </h1>
          <p className="text-[14px] text-[#45464d] mt-1 max-w-2xl leading-relaxed">
            Configure your property&apos;s outbound email settings. These settings will be used for all system-generated communications, including guest confirmations and internal alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {smtpStatus === 'failed' ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[13px] font-semibold shadow-2xs border border-[#ffdad6]">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>SMTP Connection Failing</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[13px] font-semibold shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>SMTP Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column 3 cols, Right Column 9 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1200px] w-full">
        {/* Left Column (Span 3) */}
        <div className="col-span-1 lg:col-span-3 space-y-4 lg:sticky lg:top-20 self-start">
          {/* Quick Navigation Card */}
          <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#c6c6cd]/50">
            <h3 className="text-[15px] font-semibold text-[#191c1e] mb-3 pb-2 border-b border-[#c6c6cd]/30">
              Quick Navigation
            </h3>
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => scrollToSection('smtp-config', 'smtp')}
                className={`w-full px-3 py-2 text-[13px] rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${
                  activeNav === 'smtp'
                    ? 'font-semibold text-[#0058be] bg-[#0058be]/10'
                    : 'text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e]'
                }`}
              >
                <span>SMTP Settings</span>
                {activeNav === 'smtp' && (
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('sender-recipients', 'sender')}
                className={`w-full px-3 py-2 text-[13px] rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${
                  activeNav === 'sender'
                    ? 'font-semibold text-[#0058be] bg-[#0058be]/10'
                    : 'text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e]'
                }`}
              >
                <span>Sender Details</span>
                {activeNav === 'sender' && (
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                )}
              </button>
            </nav>
          </div>

          {/* Email Queue Status Card */}
          <div className="bg-[#f2f4f6] rounded-xl p-5 border border-[#c6c6cd]/50 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#0058be] text-white mx-auto flex items-center justify-center mb-2.5 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">mark_email_unread</span>
            </div>
            <h4 className="text-[15px] font-semibold text-[#191c1e] mb-0.5">
              Email Queue Status
            </h4>
            <div className="text-[36px] font-bold text-[#191c1e] my-1 font-display-lg tracking-tight">
              {queueCount}
            </div>
            <p className="text-[13px] text-[#45464d]">
              Messages pending delivery
            </p>
            <button
              type="button"
              onClick={() => setIsQueueModalOpen(true)}
              className="mt-4 w-full py-2 px-3 border border-[#c6c6cd] rounded-lg text-[13px] font-semibold text-[#191c1e] hover:bg-[#ffffff] transition-colors bg-white/70 cursor-pointer shadow-2xs"
            >
              View Queue
            </button>
          </div>
        </div>

        {/* Right Column (Span 9) */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          {/* Section 1: SMTP Configuration */}
          <section
            id="smtp-config"
            className="bg-[#ffffff] rounded-xl shadow-xs border border-[#c6c6cd]/50 overflow-hidden scroll-mt-24"
          >
            <div className="px-6 py-3.5 border-b border-[#c6c6cd]/40 bg-[#f7f9fb] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[22px]">dns</span>
                <h2 className="text-[16px] font-semibold text-[#191c1e]">
                  SMTP Configuration
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {smtpStatus === 'failed' ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ba1a1a]"></span>
                    </span>
                    <span className="text-[13px] font-semibold text-[#ba1a1a]">Connection Failed</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    <span className="text-[13px] font-semibold text-emerald-700">Connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Server Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#191c1e]">
                  SMTP Server Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px] pointer-events-none">
                    language
                  </span>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => handleChange('smtpServer', e.target.value)}
                    placeholder="e.g., smtp.gmail.com"
                    className="w-full pl-11 pr-4 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Port */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#191c1e]">
                  Port <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 0)}
                  placeholder="587"
                  className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none shadow-2xs"
                />
              </div>

              {/* Domain */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#191c1e]">
                  Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => handleChange('domain', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none shadow-2xs"
                />
              </div>

              {/* SSL/TLS Toggle */}
              <div className="md:col-span-2 pt-2 pb-4 border-b border-[#eceef0] mb-1">
                <label className="flex items-center justify-between cursor-pointer group select-none">
                  <div>
                    <div className="text-[14px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                      Enable SSL/TLS Encryption
                    </div>
                    <div className="text-[13px] text-[#45464d] mt-0.5">
                      Required for secure connections (Recommended)
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableSslTls}
                      onChange={(e) => handleChange('enableSslTls', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </div>
                </label>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#191c1e]">
                  Username <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px] pointer-events-none">
                    person
                  </span>
                  <input
                    type="text"
                    autoComplete="off"
                    value={smtpUsername}
                    onChange={(e) => handleChange('smtpUsername', e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#191c1e]">
                  Password <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    value={smtpPassword}
                    onChange={(e) => handleChange('smtpPassword', e.target.value)}
                    className="w-full pl-11 pr-11 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] font-mono focus:border-[#0058be] outline-none shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="md:col-span-2 mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] font-semibold text-[12px] uppercase tracking-wider rounded-lg border border-[#c6c6cd] transition-colors cursor-pointer group disabled:opacity-60 shadow-2xs"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${
                      isTesting ? 'animate-spin' : 'group-hover:rotate-180'
                    }`}
                  >
                    sync
                  </span>
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Sender & Recipients */}
          <section
            id="sender-recipients"
            className="bg-[#ffffff] rounded-xl shadow-xs border border-[#c6c6cd]/50 overflow-hidden scroll-mt-24"
          >
            <div className="px-6 py-3.5 border-b border-[#c6c6cd]/40 bg-[#f7f9fb] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be] text-[22px]">
                assignment_ind
              </span>
              <h2 className="text-[16px] font-semibold text-[#191c1e]">
                Sender & Recipients
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Defaults */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#75859d] mb-4">
                  Sender Defaults
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#191c1e]">
                      From Address <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      type="email"
                      value={fromAddress}
                      onChange={(e) => {
                        handleChange('fromAddress', e.target.value);
                        handleChange('senderEmail', e.target.value);
                      }}
                      className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] focus:border-[#0058be] outline-none shadow-2xs"
                    />
                    <p className="text-[12px] text-[#76777d]">
                      The address displayed to guests.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#191c1e]">
                      Reply-To Address
                    </label>
                    <input
                      type="email"
                      value={replyToAddress}
                      onChange={(e) => {
                        handleChange('replyToAddress', e.target.value);
                        handleChange('replyToEmail', e.target.value);
                      }}
                      className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] focus:border-[#0058be] outline-none shadow-2xs"
                    />
                    <p className="text-[12px] text-[#76777d]">
                      Where guest replies will be routed.
                    </p>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#191c1e]">
                      From Name (Display Name)
                    </label>
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => {
                        handleChange('fromName', e.target.value);
                        handleChange('senderName', e.target.value);
                      }}
                      className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] focus:border-[#0058be] outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Internal Recipients */}
              <div className="border-t border-[#eceef0] pt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#75859d] mb-4">
                  Internal Recipients
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#191c1e]">
                      Default Admin Recipient
                    </label>
                    <input
                      type="email"
                      value={defaultAdminRecipient}
                      onChange={(e) => {
                        handleChange('defaultAdminRecipient', e.target.value);
                        handleChange('frontDeskInbox', e.target.value);
                      }}
                      className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] focus:border-[#0058be] outline-none shadow-2xs"
                    />
                    <p className="text-[12px] text-[#76777d]">
                      Receives system alerts and daily summaries.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#191c1e]">
                      Global BCC Address
                    </label>
                    <input
                      type="email"
                      value={globalBccAddress}
                      onChange={(e) => handleChange('globalBccAddress', e.target.value)}
                      placeholder="e.g., audit@grandplaza.com"
                      className="w-full px-3.5 py-2 bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg text-[14px] text-[#191c1e] focus:border-[#0058be] outline-none shadow-2xs"
                    />
                    <p className="text-[12px] text-[#76777d]">
                      Hidden copy of all outbound guest emails.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Queue Modal */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between bg-[#f7f9fb]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[22px]">
                  mark_email_unread
                </span>
                <h3 className="text-[17px] font-semibold text-[#191c1e]">
                  Outbound Email Queue ({queueCount} items)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQueueModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#eceef0] text-[#76777d] hover:text-[#191c1e] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-[13px] text-[#45464d] bg-[#f2f4f6] p-3 rounded-lg border border-[#c6c6cd]/50">
                <span>Currently holding outgoing messages due to SMTP connectivity issue.</span>
                <span className="font-semibold text-[#ba1a1a]">Queue Paused</span>
              </div>

              <div className="divide-y divide-[#eceef0] border border-[#c6c6cd]/50 rounded-lg overflow-hidden">
                {queueItems.map((item) => (
                  <div key={item.id} className="p-3 bg-white hover:bg-[#f7f9fb] transition-colors flex items-center justify-between text-[13px]">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#191c1e] flex items-center gap-2">
                        <span>{item.subject}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#eceef0] text-[#45464d]">
                          {item.id}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#76777d]">
                        To: <span className="font-mono text-[#191c1e]">{item.recipient}</span> • Type: {item.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Retries: {item.retries}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#f7f9fb] border-t border-[#eceef0] flex items-center justify-between">
              <button
                type="button"
                onClick={handleFlushQueue}
                className="px-3.5 py-2 text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors border border-transparent hover:border-[#ffdad6]"
              >
                Purge All Messages
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQueueModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-[#45464d] hover:bg-[#eceef0] rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleRetryAllQueue}
                  className="px-4 py-2 text-[13px] font-semibold bg-[#0058be] text-white hover:bg-[#004bb0] rounded-lg transition-colors shadow-xs"
                >
                  Retry All Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
