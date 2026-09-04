import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { COUNTRY_PRESETS, CountryFlag } from '@/src/components/common/CountryFlag/CountryFlag';

export const AddExchangeRateView: React.FC = () => {
  const {
    exchangeRates,
    editingExchangeRateId,
    setEditingExchangeRateId,
    addExchangeRate,
    updateExchangeRate,
    isCountryExchangeRateUnique,
    navigate,
    addToast,
  } = useProperty();

  const isEditing = Boolean(editingExchangeRateId);
  const existingExchangeRate = exchangeRates.find((xr) => xr.id === editingExchangeRateId);

  const [formData, setFormData] = useState<{
    country: string;
    countryCode: string;
    currency: string;
    sign: string;
    rate: string;
    isBaseRate: boolean;
    flagUrl?: string;
  }>({
    country: '',
    countryCode: '',
    currency: '',
    sign: '',
    rate: '1.0000',
    isBaseRate: false,
    flagUrl: undefined,
  });

  const [errors, setErrors] = useState<{
    country?: string;
    currency?: string;
    sign?: string;
    rate?: string;
  }>({});

  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingExchangeRate) {
      setFormData({
        country: existingExchangeRate.country,
        countryCode: existingExchangeRate.countryCode || '',
        currency: existingExchangeRate.currency,
        sign: existingExchangeRate.sign,
        rate: existingExchangeRate.rate.toFixed(4),
        isBaseRate: existingExchangeRate.isBaseRate,
        flagUrl: existingExchangeRate.flagUrl,
      });
    } else {
      setFormData({
        country: '',
        countryCode: '',
        currency: '',
        sign: '',
        rate: '1.0000',
        isBaseRate: false,
        flagUrl: undefined,
      });
    }
    setErrors({});
    setShowCountrySuggestions(false);
  }, [existingExchangeRate]);

  // Click outside to close country suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountrySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountryPresets = COUNTRY_PRESETS.filter(
    (c) =>
      c.country.toLowerCase().includes(formData.country.toLowerCase()) ||
      c.currency.toLowerCase().includes(formData.country.toLowerCase()) ||
      c.code.toLowerCase().includes(formData.country.toLowerCase())
  );

  const handleSelectCountryPreset = (preset: typeof COUNTRY_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      country: preset.country,
      countryCode: preset.code,
      currency: preset.currency,
      sign: preset.sign,
      rate: prev.isBaseRate ? '1.0000' : preset.defaultRate ? preset.defaultRate.toFixed(4) : prev.rate,
      flagUrl: preset.flagUrl,
    }));
    setShowCountrySuggestions(false);
    setErrors((prev) => ({ ...prev, country: undefined, currency: undefined, sign: undefined }));
  };

  const handleBaseRateToggle = () => {
    setFormData((prev) => {
      const nextIsBase = !prev.isBaseRate;
      return {
        ...prev,
        isBaseRate: nextIsBase,
        rate: nextIsBase ? '1.0000' : prev.rate,
      };
    });
  };

  const validate = () => {
    const newErrors: {
      country?: string;
      currency?: string;
      sign?: string;
      rate?: string;
    } = {};

    if (!formData.country.trim()) {
      newErrors.country = 'Country name is required.';
    } else if (!isCountryExchangeRateUnique(formData.country.trim(), editingExchangeRateId || undefined)) {
      newErrors.country = `An exchange rate for "${formData.country.trim()}" already exists.`;
    }

    if (!formData.currency.trim()) {
      newErrors.currency = 'Currency name is required.';
    }

    if (!formData.sign.trim()) {
      newErrors.sign = 'Currency sign is required.';
    }

    const numRate = parseFloat(formData.rate);
    if (isNaN(numRate) || numRate <= 0) {
      newErrors.rate = 'Exchange rate must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setEditingExchangeRateId(null);
    navigate('exchange-rates');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    const payload = {
      country: formData.country.trim(),
      countryCode: formData.countryCode.trim().toUpperCase() || undefined,
      currency: formData.currency.trim(),
      sign: formData.sign.trim(),
      rate: formData.isBaseRate ? 1.0000 : parseFloat(formData.rate) || 1.0000,
      isBaseRate: formData.isBaseRate,
      flagUrl: formData.flagUrl,
    };

    setTimeout(() => {
      let success = false;
      if (isEditing && editingExchangeRateId) {
        success = updateExchangeRate(editingExchangeRateId, payload);
      } else {
        success = addExchangeRate(payload);
      }

      setIsSaving(false);
      if (success) {
        setEditingExchangeRateId(null);
        navigate('exchange-rates');
      }
    }, 300);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative pb-28 select-none">
      {/* Header Section */}
      <div className="flex flex-col gap-2 px-8 py-6 bg-[#ffffff] border-b border-[#c6c6cd]/50 shadow-xs mb-6">
        <nav className="flex items-center gap-2 text-xs text-[#45464d] font-medium">
          <button
            type="button"
            onClick={() => navigate('overview')}
            className="hover:text-[#191c1e] transition-colors"
          >
            Configuration
          </button>
          <span className="material-symbols-outlined text-[14px] text-[#76777d]">chevron_right</span>
          <button
            type="button"
            onClick={() => navigate('overview')}
            className="hover:text-[#191c1e] transition-colors"
          >
            Property
          </button>
          <span className="material-symbols-outlined text-[14px] text-[#76777d]">chevron_right</span>
          <button
            type="button"
            onClick={() => navigate('exchange-rates')}
            className="hover:text-[#191c1e] transition-colors"
          >
            Exchange Rates
          </button>
          <span className="material-symbols-outlined text-[14px] text-[#76777d]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">
            {isEditing ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
          </span>
        </nav>

        <div className="flex items-center justify-between mt-2">
          <h1 className="text-[26px] font-bold text-[#191c1e] tracking-tight">
            {isEditing ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
          </h1>
          <span className="bg-[#dae2fd] text-[#131b2e] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {isEditing ? (formData.isBaseRate ? 'Base Currency' : 'Active') : 'Draft'}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-12 gap-6 px-8 max-w-7xl w-full mx-auto">
        {/* Left Column: Form */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Currency Details Card */}
          <div className="bg-[#ffffff] shadow-sm border border-[#c6c6cd]/60 rounded-xl p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-[#191c1e]">Currency Details</h2>
              <p className="text-xs text-[#45464d]">Configure the attributes for the exchange rate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Country Name */}
              <div className="flex flex-col gap-1.5 group relative" ref={dropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-[#45464d] group-focus-within:text-[#0058be] transition-colors">
                  Country Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <div
                  className={`relative flex items-center bg-[#eceef0]/80 rounded-lg px-3.5 py-2.5 border transition-all ${
                    errors.country
                      ? 'border-[#ba1a1a] bg-[#ffdad6]/20'
                      : 'border-transparent focus-within:border-[#0058be] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0058be]/20'
                  }`}
                >
                  <div className="mr-2 flex items-center shrink-0">
                    {formData.country ? (
                      <CountryFlag
                        country={formData.country}
                        countryCode={formData.countryCode}
                        flagUrl={formData.flagUrl}
                        className="w-5 h-3.5"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-[#76777d]">public</span>
                    )}
                  </div>
                  <input
                    id="input-country-name"
                    type="text"
                    value={formData.country}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, country: e.target.value }));
                      setShowCountrySuggestions(true);
                      if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
                    }}
                    onFocus={() => setShowCountrySuggestions(true)}
                    placeholder="e.g. United States"
                    className="w-full bg-transparent outline-none text-sm text-[#191c1e] placeholder:text-[#76777d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCountrySuggestions((prev) => !prev)}
                    className="text-[#76777d] hover:text-[#191c1e] p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showCountrySuggestions ? 'expand_less' : 'search'}
                    </span>
                  </button>
                </div>

                {errors.country && (
                  <p className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.country}
                  </p>
                )}

                {/* Country Presets Dropdown */}
                {showCountrySuggestions && filteredCountryPresets.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#ffffff] border border-[#c6c6cd] rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-[#c6c6cd]/30">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-[#75859d] uppercase tracking-wider bg-[#f2f4f6]">
                      Quick Select Country Presets
                    </div>
                    {filteredCountryPresets.map((preset) => (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleSelectCountryPreset(preset)}
                        className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#f2f4f6] transition-colors group/item"
                      >
                        <div className="flex items-center gap-2.5">
                          <CountryFlag
                            country={preset.country}
                            countryCode={preset.code}
                            flagUrl={preset.flagUrl}
                            className="w-5 h-3.5"
                          />
                          <span className="text-sm font-medium text-[#191c1e] group-hover/item:text-[#0058be]">
                            {preset.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#75859d]">
                          <span>{preset.currency}</span>
                          <span className="font-mono bg-[#eceef0] px-1.5 py-0.5 rounded text-[11px] font-bold text-[#191c1e]">
                            {preset.sign}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency Name */}
              <div className="flex flex-col gap-1.5 group">
                <label className="text-xs font-bold uppercase tracking-wider text-[#45464d] group-focus-within:text-[#0058be] transition-colors">
                  Currency Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <div
                  className={`relative flex items-center bg-[#eceef0]/80 rounded-lg px-3.5 py-2.5 border transition-all ${
                    errors.currency
                      ? 'border-[#ba1a1a] bg-[#ffdad6]/20'
                      : 'border-transparent focus-within:border-[#0058be] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0058be]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#76777d] mr-2">payments</span>
                  <input
                    id="input-currency-name"
                    type="text"
                    value={formData.currency}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, currency: e.target.value }));
                      if (errors.currency) setErrors((prev) => ({ ...prev, currency: undefined }));
                    }}
                    placeholder="e.g. US Dollar"
                    className="w-full bg-transparent outline-none text-sm text-[#191c1e] placeholder:text-[#76777d]"
                  />
                </div>
                {errors.currency && (
                  <p className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.currency}
                  </p>
                )}
              </div>

              {/* Currency Sign */}
              <div className="flex flex-col gap-1.5 group">
                <label className="text-xs font-bold uppercase tracking-wider text-[#45464d] group-focus-within:text-[#0058be] transition-colors">
                  Currency Sign <span className="text-[#ba1a1a]">*</span>
                </label>
                <div
                  className={`relative flex items-center bg-[#eceef0]/80 rounded-lg px-3.5 py-2.5 border transition-all ${
                    errors.sign
                      ? 'border-[#ba1a1a] bg-[#ffdad6]/20'
                      : 'border-transparent focus-within:border-[#0058be] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0058be]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#76777d] mr-2">tag</span>
                  <input
                    id="input-currency-sign"
                    type="text"
                    value={formData.sign}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, sign: e.target.value }));
                      if (errors.sign) setErrors((prev) => ({ ...prev, sign: undefined }));
                    }}
                    placeholder="e.g. $"
                    className="w-full bg-transparent outline-none text-sm font-mono text-[#191c1e] placeholder:text-[#76777d]"
                  />
                </div>
                {errors.sign && (
                  <p className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.sign}
                  </p>
                )}
              </div>

              {/* Rate (Against Base) */}
              <div className="flex flex-col gap-1.5 group">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#45464d] group-focus-within:text-[#0058be] transition-colors">
                    Rate (Against Base) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  {formData.isBaseRate && (
                    <span className="text-[11px] font-bold text-[#0058be] bg-[#2170e4]/10 px-2 py-0.5 rounded">
                      Locked to Base (1.0000)
                    </span>
                  )}
                </div>
                <div
                  className={`relative flex items-center bg-[#eceef0]/80 rounded-lg px-3.5 py-2.5 border transition-all ${
                    formData.isBaseRate ? 'opacity-80 bg-[#e0e3e5] cursor-not-allowed' : ''
                  } ${
                    errors.rate
                      ? 'border-[#ba1a1a] bg-[#ffdad6]/20'
                      : 'border-transparent focus-within:border-[#0058be] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0058be]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#76777d] mr-2">currency_exchange</span>
                  <input
                    id="input-rate"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    disabled={formData.isBaseRate}
                    value={formData.isBaseRate ? '1.0000' : formData.rate}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, rate: e.target.value }));
                      if (errors.rate) setErrors((prev) => ({ ...prev, rate: undefined }));
                    }}
                    placeholder="1.0000"
                    className="w-full bg-transparent outline-none text-sm font-mono text-[#191c1e] placeholder:text-[#76777d]"
                  />
                  <span className="text-xs font-mono font-bold text-[#75859d] ml-2">
                    {formData.isBaseRate ? 'BASE' : formData.sign || 'UNITS'}
                  </span>
                </div>
                {errors.rate && (
                  <p className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.rate}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-[#c6c6cd]/50 my-1"></div>

            {/* Is Base Rate Toggle */}
            <div className="flex items-start justify-between bg-[#f7f9fb] p-4 rounded-xl border border-[#c6c6cd]/60">
              <div className="flex flex-col gap-1 pr-4">
                <span className="text-sm font-bold text-[#191c1e]">Set as Base Rate</span>
                <span className="text-xs text-[#45464d]">
                  Only one currency can be the base rate for the property.
                </span>
                {formData.isBaseRate && (
                  <span id="base-rate-warning" className="text-xs text-[#0058be] font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    This will become the property's primary base currency. All other currencies calculate against it.
                  </span>
                )}
              </div>
              <button
                id="toggle-base-rate"
                type="button"
                onClick={handleBaseRateToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:ring-offset-2 ${
                  formData.isBaseRate ? 'bg-[#0058be]' : 'bg-[#c6c6cd]'
                }`}
              >
                <span
                  id="toggle-knob"
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    formData.isBaseRate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Rate Analytics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Live Preview
            </h3>

            {/* Premium Preview Card */}
            <div className="bg-gradient-to-br from-[#131b2e] via-[#0b1c30] to-[#000000] p-6 rounded-2xl shadow-xl relative overflow-hidden text-white group border border-[#131b2e]">
              {/* Decorative Background Elements */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#2170e4]/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#0058be]/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/15">
                    <span id="preview-sign" className="text-xl font-bold font-mono text-white">
                      {formData.sign || '?'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.country && (
                      <CountryFlag
                        country={formData.country}
                        countryCode={formData.countryCode}
                        flagUrl={formData.flagUrl}
                        className="w-7 h-4.5"
                      />
                    )}
                    <span className="material-symbols-outlined text-white/50 text-[26px]">monitoring</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-white/70 font-semibold">
                      Exchange Rate
                    </span>
                    {formData.isBaseRate && (
                      <span className="bg-[#2170e4] text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Base Currency
                      </span>
                    )}
                  </div>
                  <h4 id="preview-name" className="text-xl font-bold text-white truncate">
                    {formData.currency || 'Currency Name'}
                  </h4>
                  <p className="text-xs text-white/60 truncate">
                    {formData.country || 'Select or enter country'}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 mt-4 flex items-center justify-between border border-white/10">
                  <span className="text-xs text-white/80 font-medium">1 Base =</span>
                  <span id="preview-rate" className="text-base font-bold font-mono text-white tracking-wide">
                    {formData.isBaseRate
                      ? '1.0000'
                      : formData.rate
                      ? parseFloat(formData.rate || '0').toFixed(4)
                      : '0.0000'}{' '}
                    <span className="text-xs font-normal text-white/70">{formData.sign || ''}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Rate Trend Analysis decorative card */}
            <div className="bg-[#ffffff] border border-[#c6c6cd]/60 rounded-xl p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
                  Rate Trend Analysis
                </span>
                <span className="text-[11px] font-semibold text-[#0058be]">Real-time Sync</span>
              </div>
              <div className="bg-[#f2f4f6] rounded-lg p-3 h-24 flex items-center justify-center relative overflow-hidden">
                <svg
                  className="absolute inset-0 w-full h-full text-[#0058be]/10"
                  preserveAspectRatio="none"
                  viewBox="0 0 200 100"
                >
                  <path
                    d="M0,80 C40,70 60,85 100,45 C140,15 160,25 200,5 L200,100 L0,100 Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <div className="relative z-10 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-[#0058be] text-[28px]">trending_up</span>
                  <p className="text-xs font-medium text-[#191c1e] mt-1">
                    Auto-synchronized conversion engine
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#c6c6cd]/60 p-4 flex items-center justify-end gap-3 z-40 shadow-lg">
        <button
          id="btn-cancel-exchange-rate"
          type="button"
          onClick={handleCancel}
          className="px-6 py-2.5 rounded-lg bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          id="btn-save-exchange-rate"
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="px-8 py-2.5 rounded-lg bg-[#000000] hover:bg-[#131b2e] text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                save
              </span>
              <span>Save Exchange Rate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
