import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { LocalizationSettings } from '../../types';

export const LocalizationTab: React.FC = () => {
  const { generalSettings, updateGeneralSettingsSection, addToast } = useProperty();
  const loc = generalSettings.localization;

  // Collapsible section states
  const [isRegionalOpen, setIsRegionalOpen] = useState(true);
  const [isFormattingOpen, setIsFormattingOpen] = useState(true);
  const [isCustomLabelsOpen, setIsCustomLabelsOpen] = useState(true);
  const [isFiscalOpen, setIsFiscalOpen] = useState(true);
  const [isWeekendOpen, setIsWeekendOpen] = useState(true);

  // Field change helper
  const handleFieldChange = (field: keyof LocalizationSettings, value: any) => {
    updateGeneralSettingsSection('localization', { [field]: value });
  };

  // Custom labels change helper
  const handleCustomLabelChange = (
    key: keyof LocalizationSettings['customLabels'],
    value: string
  ) => {
    const current = loc.customLabels || {
      stateField: 'State/Province',
      zipField: 'Pincode',
      roomTerminology: 'Suite',
      rateTerminology: 'Daily Rate',
      guestTitles: 'Salutation',
    };
    updateGeneralSettingsSection('localization', {
      customLabels: {
        ...current,
        [key]: value,
      },
    });
  };

  // Currency selection helper that also sets default symbol
  const handleCurrencySelect = (curr: string) => {
    const symbolMap: Record<string, string> = {
      inr: '₹',
      usd: '$',
      eur: '€',
      gbp: '£',
      aud: 'A$',
      cad: 'CA$',
      jpy: '¥',
      aed: 'AED ',
    };
    const symbol = symbolMap[curr] || '$';
    updateGeneralSettingsSection('localization', {
      currency: curr,
      currencySymbol: symbol,
    });
  };

  // Weekend day toggle helper
  const handleToggleWeekendDay = (day: string) => {
    const currentDays = loc.weekendDays || ['Sat', 'Sun'];
    const exists = currentDays.includes(day);
    const updated = exists
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateGeneralSettingsSection('localization', { weekendDays: updated });
    addToast(
      `${day} is now ${exists ? 'excluded from' : 'included in'} weekend rate logic`,
      'info'
    );
  };

  // Dynamic preview calculations
  const getDatePreview = (format: string) => {
    switch (format) {
      case 'ddmmmyyyy':
        return '30 Aug 2026';
      case 'mmddyyyy':
      case 'MM/DD/YYYY':
        return '08/30/2026';
      case 'ddmmyyyy':
      case 'DD/MM/YYYY':
        return '30/08/2026';
      case 'yyyymmdd':
      case 'YYYY-MM-DD':
        return '2026-08-30';
      default:
        return '30 Aug 2026';
    }
  };

  const getTimePreview = (format: string) => {
    return format === '12h' ? '02:30 PM' : '14:30';
  };

  const getNumberPreview = (numFormat: string, currSymbol: string) => {
    const symbol = currSymbol || '₹';
    switch (numFormat) {
      case 'in':
        return `${symbol}1,25,000.00`;
      case 'eu':
        return `125.000,00 ${symbol}`;
      case 'us':
      default:
        return `${symbol}125,000.00`;
    }
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activeWeekendDays = loc.weekendDays || ['Sat', 'Sun'];

  const customLabels = loc.customLabels || {
    stateField: 'State/Province',
    zipField: 'Pincode',
    roomTerminology: 'Suite',
    rateTerminology: 'Daily Rate',
    guestTitles: 'Salutation',
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
            Localization Preferences
          </h1>
          <p className="text-[14px] text-[#45464d] mt-1">
            Configure regional formats, terminology, and fiscal timelines for your property.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#131b2e] text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[24px]">language</span>
        </div>
      </header>

      {/* Form Content */}
      <div className="space-y-6">
        {/* 1. Regional Settings Card */}
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => setIsRegionalOpen(!isRegionalOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <h3 className="text-[17px] font-semibold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be]">public</span>
              Regional Settings
            </h3>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                isRegionalOpen ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </button>

          {isRegionalOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-2 border-t border-[#eceef0]">
              {/* Country / Region */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                  Country / Region
                </label>
                <div className="relative">
                  <select
                    value={loc.country || 'in'}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    className="w-full appearance-none bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors cursor-pointer"
                  >
                    <option value="in">India</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="au">Australia</option>
                    <option value="ca">Canada</option>
                    <option value="de">Germany</option>
                    <option value="sg">Singapore</option>
                    <option value="ae">United Arab Emirates</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                    arrow_drop_down
                  </span>
                </div>
              </div>

              {/* Default Currency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                  Default Currency
                </label>
                <div className="relative">
                  <select
                    value={(loc.currency || 'inr').toLowerCase()}
                    onChange={(e) => handleCurrencySelect(e.target.value)}
                    className="w-full appearance-none bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors cursor-pointer"
                  >
                    <option value="inr">Indian Rupee (INR ₹)</option>
                    <option value="usd">US Dollar (USD $)</option>
                    <option value="eur">Euro (EUR €)</option>
                    <option value="gbp">British Pound (GBP £)</option>
                    <option value="aud">Australian Dollar (AUD A$)</option>
                    <option value="cad">Canadian Dollar (CAD CA$)</option>
                    <option value="jpy">Japanese Yen (JPY ¥)</option>
                    <option value="aed">UAE Dirham (AED)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                    arrow_drop_down
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Formatting & Display Card */}
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#0058be]/5 rounded-tl-full blur-2xl pointer-events-none" />

          <button
            type="button"
            onClick={() => setIsFormattingOpen(!isFormattingOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group relative z-10"
          >
            <h3 className="text-[17px] font-semibold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be]">calendar_today</span>
              Formatting &amp; Display
            </h3>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                isFormattingOpen ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </button>

          {isFormattingOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pt-2 border-t border-[#eceef0] relative z-10">
              {/* Date Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                  Date Format
                </label>
                <div className="relative">
                  <select
                    value={loc.dateFormat || 'ddmmmyyyy'}
                    onChange={(e) => handleFieldChange('dateFormat', e.target.value)}
                    className="w-full appearance-none bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors cursor-pointer"
                  >
                    <option value="ddmmmyyyy">DD MMM YYYY</option>
                    <option value="mmddyyyy">MM/DD/YYYY</option>
                    <option value="ddmmyyyy">DD/MM/YYYY</option>
                    <option value="yyyymmdd">YYYY-MM-DD</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                    arrow_drop_down
                  </span>
                </div>
                <div className="font-mono text-[#45464d] mt-1 bg-[#f2f4f6] px-2.5 py-1 rounded inline-block w-max self-start text-[11px] shadow-2xs border border-[#c6c6cd]/40">
                  Preview: {getDatePreview(loc.dateFormat || 'ddmmmyyyy')}
                </div>
              </div>

              {/* Time Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                  Time Format
                </label>
                <div className="relative">
                  <select
                    value={loc.timeFormat || '24h'}
                    onChange={(e) => handleFieldChange('timeFormat', e.target.value)}
                    className="w-full appearance-none bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors cursor-pointer"
                  >
                    <option value="24h">24-hour</option>
                    <option value="12h">12-hour (AM/PM)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                    arrow_drop_down
                  </span>
                </div>
                <div className="font-mono text-[#45464d] mt-1 bg-[#f2f4f6] px-2.5 py-1 rounded inline-block w-max self-start text-[11px] shadow-2xs border border-[#c6c6cd]/40">
                  Preview: {getTimePreview(loc.timeFormat || '24h')}
                </div>
              </div>

              {/* Number Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                  Number Format
                </label>
                <div className="relative">
                  <select
                    value={loc.numberFormat || 'in'}
                    onChange={(e) => handleFieldChange('numberFormat', e.target.value)}
                    className="w-full appearance-none bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors cursor-pointer"
                  >
                    <option value="in">Indian Standard</option>
                    <option value="us">US / International</option>
                    <option value="eu">European Standard</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
                    arrow_drop_down
                  </span>
                </div>
                <div className="font-mono text-[#45464d] mt-1 bg-[#f2f4f6] px-2.5 py-1 rounded inline-block w-max self-start text-[11px] shadow-2xs border border-[#c6c6cd]/40">
                  Preview: {getNumberPreview(loc.numberFormat || 'in', loc.currencySymbol)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Custom Field Labels Card */}
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => setIsCustomLabelsOpen(!isCustomLabelsOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <h3 className="text-[17px] font-semibold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be]">label</span>
              Custom Field Labels
            </h3>
            <span
              className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                isCustomLabelsOpen ? 'rotate-0' : 'rotate-180'
              }`}
            >
              expand_less
            </span>
          </button>

          {isCustomLabelsOpen && (
            <div className="mt-3 pt-2 border-t border-[#eceef0]">
              <p className="text-[13px] text-[#45464d] mb-5 max-w-2xl">
                Adapt the system terminology to match your property&apos;s specific vernacular.
                These labels will be reflected across folios, reports, and the user interface.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {/* State Field */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase flex items-center justify-between">
                    <span>State Field</span>
                    <span className="text-[10px] text-[#76777d] bg-[#eceef0] px-1.5 py-0.5 rounded font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      System: state
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customLabels.stateField}
                    onChange={(e) => handleCustomLabelChange('stateField', e.target.value)}
                    placeholder="e.g. State"
                    className="bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow shadow-xs hover:border-[#76777d]"
                  />
                </div>

                {/* ZIP / Postal Field */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase flex items-center justify-between">
                    <span>ZIP / Postal Field</span>
                    <span className="text-[10px] text-[#76777d] bg-[#eceef0] px-1.5 py-0.5 rounded font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      System: zip
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customLabels.zipField}
                    onChange={(e) => handleCustomLabelChange('zipField', e.target.value)}
                    placeholder="e.g. Zip Code"
                    className="bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow shadow-xs hover:border-[#76777d]"
                  />
                </div>

                {/* Room Terminology */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase flex items-center justify-between">
                    <span>Room Terminology</span>
                    <span className="text-[10px] text-[#76777d] bg-[#eceef0] px-1.5 py-0.5 rounded font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      System: room
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customLabels.roomTerminology}
                    onChange={(e) => handleCustomLabelChange('roomTerminology', e.target.value)}
                    placeholder="e.g. Room, Villa"
                    className="bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow shadow-xs hover:border-[#76777d]"
                  />
                </div>

                {/* Rate Terminology */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase flex items-center justify-between">
                    <span>Rate Terminology</span>
                    <span className="text-[10px] text-[#76777d] bg-[#eceef0] px-1.5 py-0.5 rounded font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      System: rate
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customLabels.rateTerminology}
                    onChange={(e) => handleCustomLabelChange('rateTerminology', e.target.value)}
                    placeholder="e.g. Tariff, Rate"
                    className="bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow shadow-xs hover:border-[#76777d]"
                  />
                </div>

                {/* Guest Titles */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase flex items-center justify-between">
                    <span>Guest Titles</span>
                    <span className="text-[10px] text-[#76777d] bg-[#eceef0] px-1.5 py-0.5 rounded font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      System: title
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customLabels.guestTitles}
                    onChange={(e) => handleCustomLabelChange('guestTitles', e.target.value)}
                    placeholder="e.g. Title, Honorific"
                    className="bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-shadow shadow-xs hover:border-[#76777d]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4 & 5 Grid Row: Fiscal Timeline & Weekend Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 4: Fiscal Timeline */}
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 hover:shadow-md transition-shadow">
            <button
              type="button"
              onClick={() => setIsFiscalOpen(!isFiscalOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <h3 className="text-[17px] font-semibold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">account_balance</span>
                Fiscal Timeline
              </h3>
              <span
                className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                  isFiscalOpen ? 'rotate-0' : 'rotate-180'
                }`}
              >
                expand_less
              </span>
            </button>

            {isFiscalOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4 pt-2 border-t border-[#eceef0]">
                {/* Fiscal Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                    Fiscal Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loc.fiscalStartDate || '01 Apr'}
                      onChange={(e) => handleFieldChange('fiscalStartDate', e.target.value)}
                      placeholder="DD MMM"
                      className="w-full bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg pl-10 pr-3 py-2 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors shadow-xs"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
                      event
                    </span>
                  </div>
                </div>

                {/* Fiscal End Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[#45464d] tracking-wider uppercase">
                    Fiscal End Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loc.fiscalEndDate || '31 Mar'}
                      onChange={(e) => handleFieldChange('fiscalEndDate', e.target.value)}
                      placeholder="DD MMM"
                      className="w-full bg-[#ffffff] text-[#191c1e] border border-[#c6c6cd] rounded-lg pl-10 pr-3 py-2 text-[14px] font-medium focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors shadow-xs"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
                      event_busy
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Weekend Days */}
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs border border-[#c6c6cd]/50 hover:shadow-md transition-shadow relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#0058be 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <button
              type="button"
              onClick={() => setIsWeekendOpen(!isWeekendOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer group relative z-10"
            >
              <h3 className="text-[17px] font-semibold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">weekend</span>
                Weekend Days
              </h3>
              <span
                className={`material-symbols-outlined text-[#45464d] transform transition-transform duration-200 ${
                  isWeekendOpen ? 'rotate-0' : 'rotate-180'
                }`}
              >
                expand_less
              </span>
            </button>

            {isWeekendOpen && (
              <div className="mt-3 pt-2 border-t border-[#eceef0] relative z-10">
                <p className="text-[13px] text-[#45464d] mb-4">
                  Define which days trigger weekend rate rules and logic.
                </p>

                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = activeWeekendDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleWeekendDay(day)}
                        className={`px-3.5 py-1.5 rounded-lg border text-[13px] transition-all cursor-pointer shadow-xs select-none ${
                          isSelected
                            ? 'bg-[#0058be] text-white border-[#0058be] font-semibold shadow-xs'
                            : 'border-[#c6c6cd] bg-[#ffffff] text-[#45464d] font-medium hover:bg-[#f2f4f6]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
