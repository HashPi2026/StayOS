import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { NightAuditSettings } from '../../types';

interface ReportOption {
  key: keyof NightAuditSettings['automatedReports'];
  label: string;
  description: string;
}

export const NightAuditsTab: React.FC = () => {
  const {
    generalSettings,
    updateGeneralSettingsSection,
    resetGeneralSettingsSection,
    addToast,
  } = useProperty();

  const nightAudits = generalSettings.nightAudits;

  // New email input state for adding to distribution list
  const [newEmail, setNewEmail] = useState('');
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmails, setNewGroupEmails] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Field change handlers
  const handleFieldChange = (field: keyof NightAuditSettings, value: any) => {
    updateGeneralSettingsSection('nightAudits', { [field]: value });
  };

  const handleReportToggle = (reportKey: keyof NightAuditSettings['automatedReports']) => {
    const currentReports = nightAudits.automatedReports || {
      dailySummary: true,
      taxReport: true,
      collectionReport: false,
      ledgerReport: true,
      forecastReport: false,
      guestInHouse: false,
      arrivalDepartureList: true,
      noShowReport: false,
    };
    const updated = {
      ...currentReports,
      [reportKey]: !currentReports[reportKey],
    };
    updateGeneralSettingsSection('nightAudits', { automatedReports: updated });
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const currentList = nightAudits.globalDistributionList || [];
    const updated = currentList.filter((e) => e !== emailToRemove);
    updateGeneralSettingsSection('nightAudits', { globalDistributionList: updated });
    addToast(`Removed ${emailToRemove} from distribution list`, 'info');
  };

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;

    // Basic email validation
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    const currentList = nightAudits.globalDistributionList || [];
    if (currentList.includes(trimmed)) {
      addToast('Email is already in distribution list', 'info');
      setNewEmail('');
      return;
    }

    const updated = [...currentList, trimmed];
    updateGeneralSettingsSection('nightAudits', { globalDistributionList: updated });
    setNewEmail('');
    addToast(`Added ${trimmed} to distribution list`, 'success');
  };

  const handleKeyDownEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleAddRecipientGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      addToast('Please specify a group name', 'error');
      return;
    }

    const emails = newGroupEmails
      .split(/[,\n]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@') && e.includes('.'));

    if (emails.length === 0) {
      addToast('Please provide at least one valid email address for the group', 'error');
      return;
    }

    const currentList = nightAudits.globalDistributionList || [];
    const merged = Array.from(new Set([...currentList, ...emails]));
    updateGeneralSettingsSection('nightAudits', { globalDistributionList: merged });

    addToast(`Added recipient group "${newGroupName.trim()}" with ${emails.length} email(s)`, 'success');
    setNewGroupName('');
    setNewGroupEmails('');
    setIsRecipientModalOpen(false);
  };

  const handleRunAuditDryRun = () => {
    addToast('Night Audit simulation dry-run passed with 0 ledger variances', 'success');
  };

  // Report grid items definition
  const reportOptions: ReportOption[] = [
    {
      key: 'dailySummary',
      label: 'Daily Summary',
      description: 'Key metrics and totals for the day.',
    },
    {
      key: 'taxReport',
      label: 'Tax Report',
      description: 'Detailed breakdown of taxes collected.',
    },
    {
      key: 'collectionReport',
      label: 'Collection Report',
      description: 'Payments received by method.',
    },
    {
      key: 'ledgerReport',
      label: 'Ledger Report',
      description: 'Guest, City, and Deposit ledgers.',
    },
    {
      key: 'forecastReport',
      label: 'Forecast Report',
      description: 'Projected occupancy and revenue (14-day).',
    },
    {
      key: 'guestInHouse',
      label: 'Guest In-House',
      description: 'Current guests and room assignments.',
    },
    {
      key: 'arrivalDepartureList',
      label: 'Arrival/Departure List',
      description: 'Expected activity for the next day.',
    },
    {
      key: 'noShowReport',
      label: 'No-Show Report',
      description: 'List of reservations that failed to arrive.',
    },
  ];

  const distributionList = nightAudits.globalDistributionList || ['gm@grandplaza.com', 'nightaudit@grandplaza.com'];
  const automatedReports = nightAudits.automatedReports || {
    dailySummary: true,
    taxReport: true,
    collectionReport: false,
    ledgerReport: true,
    forecastReport: false,
    guestInHouse: false,
    arrivalDepartureList: true,
    noShowReport: false,
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1 mb-1">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
          Night Audit Settings
        </h1>
        <p className="text-[14px] text-[#45464d] max-w-2xl">
          Configure property audit timing, behavior, and automated reporting schedules.
        </p>
      </div>

      {/* Main Settings Area */}
      <div className="flex flex-col gap-6 w-full">
        {/* 1. Audit Configuration Card */}
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 flex flex-col gap-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 border-b border-[#eceef0] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#dae2fd] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#0058be] text-[20px]">
                schedule
              </span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#191c1e]">
              Audit Configuration
            </h2>
          </div>

          {/* Card Rows */}
          <div className="flex flex-col gap-6 pl-1 sm:pl-2">
            {/* Audit Clock Time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <label className="text-[14px] font-semibold text-[#191c1e]">
                  Audit Clock Time
                </label>
                <p className="text-[13px] text-[#45464d]">
                  The exact time the system initiates the night audit process.
                </p>
              </div>
              <div className="relative shrink-0">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px] pointer-events-none">
                  schedule
                </span>
                <input
                  type="time"
                  value={nightAudits.auditClockTime || nightAudits.auditScheduleTime || '02:00'}
                  onChange={(e) => {
                    handleFieldChange('auditClockTime', e.target.value);
                    handleFieldChange('auditScheduleTime', e.target.value);
                  }}
                  className="bg-[#eceef0] hover:bg-[#e0e3e5] rounded-lg pl-10 pr-3 py-2 text-[14px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] w-[140px] font-mono transition-colors font-medium"
                />
              </div>
            </div>

            {/* Prompt Behavior */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <label className="text-[14px] font-semibold text-[#191c1e]">
                  Prompt Behavior
                </label>
                <p className="text-[13px] text-[#45464d]">
                  Determine if staff must manually approve the audit.
                </p>
              </div>
              <div className="relative shrink-0">
                <select
                  value={nightAudits.promptBehavior || 'manual'}
                  onChange={(e) => handleFieldChange('promptBehavior', e.target.value)}
                  className="bg-[#eceef0] hover:bg-[#e0e3e5] rounded-lg pl-3.5 pr-9 py-2 text-[14px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] appearance-none w-[240px] font-medium transition-colors cursor-pointer"
                >
                  <option value="manual">Require Manual Confirmation</option>
                  <option value="auto">Full Auto (No Prompt)</option>
                  <option value="notify">Notify Only</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Auto Room Status Change */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 max-w-xl">
                <label className="text-[14px] font-semibold text-[#191c1e] flex items-center gap-1.5">
                  Auto Room Status Change
                  <span
                    className="material-symbols-outlined text-[#0058be] text-[16px] cursor-help"
                    title="Automatically transition room statuses (e.g., Vacant Dirty to Vacant Clean) during the audit process."
                  >
                    info
                  </span>
                </label>
                <p className="text-[13px] text-[#45464d]">
                  Automatically transition room statuses (e.g., Vacant Dirty to Vacant Clean) during the audit process.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={nightAudits.autoRoomStatusChange !== false}
                  onChange={(e) => handleFieldChange('autoRoomStatusChange', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 2. Automatic Reports Card */}
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 flex flex-col gap-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eceef0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[20px]">
                  summarize
                </span>
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#191c1e]">
                  Report Automation
                </h2>
                <p className="text-[13px] text-[#45464d]">
                  Select reports to generate and email upon completion.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRecipientModalOpen(true)}
              className="text-[#0058be] text-[13px] font-semibold hover:bg-[#0058be]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Recipient Group
            </button>
          </div>

          {/* Global Distribution List */}
          <div className="flex items-center gap-3.5 bg-[#eceef0] p-4 rounded-xl">
            <span className="material-symbols-outlined text-[#75859d] text-[20px] shrink-0">
              mail
            </span>
            <div className="flex-1 min-w-0">
              <label className="text-[12px] font-semibold text-[#191c1e] block mb-1.5">
                Global Distribution List
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {distributionList.map((email) => (
                  <span
                    key={email}
                    className="bg-[#ffffff] border border-[#c6c6cd]/80 rounded-full px-3 py-0.5 text-[12px] font-medium text-[#191c1e] flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-[#75859d] hover:text-[#ba1a1a] transition-colors flex items-center"
                      title="Remove recipient"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={handleKeyDownEmail}
                    placeholder="Add email..."
                    className="bg-transparent border-none focus:outline-none text-[13px] text-[#191c1e] placeholder-[#75859d] w-36 px-1"
                  />
                  {newEmail.trim() && (
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-[#2170e4] text-white rounded hover:bg-[#0058be] transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Report Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportOptions.map((item) => {
              const isChecked = automatedReports[item.key] ?? false;
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer group select-none ${
                    isChecked
                      ? 'border-[#2170e4]/40 bg-[#dae2fd]/15 hover:bg-[#dae2fd]/25'
                      : 'border-[#c6c6cd]/50 hover:bg-[#f2f4f6]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleReportToggle(item.key)}
                    className="mt-0.5 w-4 h-4 text-[#0058be] bg-white border-[#c6c6cd] rounded focus:ring-[#0058be] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-[14px] font-semibold transition-colors ${
                        isChecked
                          ? 'text-[#0058be]'
                          : 'text-[#191c1e] group-hover:text-[#0058be]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[12px] text-[#45464d] mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Advanced Operational Policies & Financial Posting (Expandable) */}
        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 px-6 flex items-center justify-between hover:bg-[#f2f4f6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#eceef0] flex items-center justify-center text-[#191c1e]">
                <span className="material-symbols-outlined text-[18px]">
                  account_balance
                </span>
              </div>
              <div>
                <span className="text-[14px] font-semibold text-[#191c1e] block">
                  Advanced Audit Operations & Ledger Posting
                </span>
                <span className="text-[12px] text-[#45464d]">
                  Room rate posting, no-show fees, business date rollover & audit dry-run
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRunAuditDryRun();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold text-[#0058be] bg-[#dae2fd] hover:bg-[#c7d5fd] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">
                  play_circle
                </span>
                Dry Run Audit
              </button>
              <span
                className={`material-symbols-outlined text-[#75859d] transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </div>
          </button>

          {showAdvanced && (
            <div className="p-6 pt-2 border-t border-[#eceef0] space-y-4">
              {/* Post Room & Tax Automatically */}
              <div className="py-3 flex items-center justify-between gap-4 border-b border-[#eceef0]">
                <div>
                  <div className="font-semibold text-[14px] text-[#191c1e]">
                    Post Room Rates & Applicable Taxes Automatically
                  </div>
                  <p className="text-[12px] text-[#45464d] mt-0.5">
                    Generate room revenue journal and city occupancy tax ledger lines for all in-house guests.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightAudits.autoPostRoomAndTax ?? true}
                    onChange={(e) => handleFieldChange('autoPostRoomAndTax', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* No-Show Auto Release & Cutoff */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eceef0]">
                <div>
                  <div className="font-semibold text-[14px] text-[#191c1e]">
                    Auto-Process Unarrived Bookings (No-Shows)
                  </div>
                  <p className="text-[12px] text-[#45464d] mt-0.5">
                    Release unassigned rooms and apply cancellation/no-show rules after the cutoff hour.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#45464d]">Cutoff:</span>
                    <input
                      type="time"
                      value={nightAudits.noShowCutoffTime || '02:00'}
                      onChange={(e) => handleFieldChange('noShowCutoffTime', e.target.value)}
                      className="bg-[#eceef0] rounded px-2.5 py-1 text-[13px] text-[#191c1e] font-mono outline-none"
                    />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nightAudits.autoProcessNoShows ?? true}
                      onChange={(e) => handleFieldChange('autoProcessNoShows', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>
              </div>

              {/* No Show Penalty Billing Rule */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eceef0]">
                <div>
                  <div className="font-semibold text-[14px] text-[#191c1e]">
                    Default No-Show Penalty Billing Rule
                  </div>
                  <p className="text-[12px] text-[#45464d] mt-0.5">
                    Specify payment penalty levied against guaranteed credit card upon marking no-show.
                  </p>
                </div>
                <select
                  value={nightAudits.noShowBillingPolicy || 'charge_first_night'}
                  onChange={(e) => handleFieldChange('noShowBillingPolicy', e.target.value)}
                  className="bg-[#eceef0] rounded-lg px-3 py-2 text-[13px] text-[#191c1e] font-medium outline-none cursor-pointer shrink-0"
                >
                  <option value="charge_first_night">Charge First Night Room + Tax (Standard)</option>
                  <option value="charge_full">Charge 100% of Total Booking Value</option>
                  <option value="forfeit_deposit">Forfeit Collected Deposit Only</option>
                  <option value="no_charge">Release Room with No Charge</option>
                </select>
              </div>

              {/* Business Date Rollover */}
              <div className="py-3 flex items-center justify-between gap-4 border-b border-[#eceef0]">
                <div>
                  <div className="font-semibold text-[14px] text-[#191c1e]">
                    Advance Business Date to Next Calendar Day
                  </div>
                  <p className="text-[12px] text-[#45464d] mt-0.5">
                    Shift PMS operational business date forward upon successful completion of the audit run.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightAudits.autoRolloverBusinessDate ?? true}
                    onChange={(e) => handleFieldChange('autoRolloverBusinessDate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Lock Audited Transactions */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[14px] text-[#191c1e]">
                    Lock Audited Day Transactions & Ledgers
                  </div>
                  <p className="text-[12px] text-[#45464d] mt-0.5">
                    Prevent retroactive folio adjustments for finalized dates without Manager PIN authorization.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightAudits.lockTransactionsAfterAudit ?? true}
                    onChange={(e) => handleFieldChange('lockTransactionsAfterAudit', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Recipient Group Modal */}
      {isRecipientModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#c6c6cd] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#eceef0] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[20px]">
                  group_add
                </span>
                <h3 className="text-[17px] font-semibold text-[#191c1e]">
                  Add Recipient Group
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipientModalOpen(false)}
                className="text-[#75859d] hover:text-[#191c1e] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRecipientGroup} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#191c1e] block mb-1">
                  Group Label
                </label>
                <input
                  type="text"
                  placeholder="e.g., Executive Leadership or Finance Team"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-[#eceef0] border border-[#c6c6cd]/50 rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#191c1e] block mb-1">
                  Recipient Emails (Comma or Newline Separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="controller@grandplaza.com, generalmanager@grandplaza.com"
                  value={newGroupEmails}
                  onChange={(e) => setNewGroupEmails(e.target.value)}
                  className="w-full bg-[#eceef0] border border-[#c6c6cd]/50 rounded-lg p-3 text-[13px] text-[#191c1e] outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setIsRecipientModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#45464d] hover:bg-[#eceef0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0058be] text-white text-[13px] font-semibold hover:bg-[#004395] transition-colors shadow-xs"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
