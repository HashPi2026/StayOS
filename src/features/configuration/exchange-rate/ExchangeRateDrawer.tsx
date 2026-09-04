import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { COUNTRY_PRESETS, CountryFlag } from '@/src/components/common/CountryFlag/CountryFlag';

export const ExchangeRateDrawer: React.FC = () => {
  const {
    isExchangeRateDrawerOpen,
    drawerExchangeRate,
    closeExchangeRateDrawer,
    addExchangeRate,
    updateExchangeRate,
    isCountryExchangeRateUnique,
  } = useProperty();

  const isEditing = Boolean(drawerExchangeRate);

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
    if (drawerExchangeRate) {
      setFormData({
        country: drawerExchangeRate.country,
        countryCode: drawerExchangeRate.countryCode || '',
        currency: drawerExchangeRate.currency,
        sign: drawerExchangeRate.sign,
        rate: drawerExchangeRate.rate.toFixed(4),
        isBaseRate: drawerExchangeRate.isBaseRate,
        flagUrl: drawerExchangeRate.flagUrl,
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
    setIsSaving(false);
  }, [drawerExchangeRate, isExchangeRateDrawerOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExchangeRateDrawerOpen) {
        closeExchangeRateDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExchangeRateDrawerOpen, closeExchangeRateDrawer]);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountrySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountryPresets = COUNTRY_PRESETS.filter((c) =>
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
      rate: prev.isBaseRate ? '1.0000' : (preset.defaultRate ? preset.defaultRate.toFixed(4) : prev.rate),
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
    } else if (!isCountryExchangeRateUnique(formData.country.trim(), drawerExchangeRate?.id)) {
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
      if (isEditing && drawerExchangeRate) {
        success = updateExchangeRate(drawerExchangeRate.id, payload);
      } else {
        success = addExchangeRate(payload);
      }

      setIsSaving(false);
      if (success) {
        closeExchangeRateDrawer();
      }
    }, 300);
  };

  if (!isExchangeRateDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeExchangeRateDrawer}
      />

      {/* Slide Drawer */}
      <aside className="absolute top-0 right-0 h-full w-[440px] max-w-full bg-[#ffffff] shadow-2xl z-50 flex flex-col border-l border-[#c6c6cd]/50 transform transition-transform duration-300 ease-in-out animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#c6c6cd]/50 flex items-center justify-between shrink-0 bg-[#ffffff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-[22px]">
              {isEditing ? 'edit_note' : 'add_circle'}
            </span>
            <h3 className="text-[17px] font-bold text-[#191c1e]">
              {isEditing ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeExchangeRateDrawer}
            className="p-1.5 hover:bg-[#eceef0] rounded-full text-[#45464d] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Country Field with search dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-[#45464d] uppercase tracking-wider mb-2">
                Country Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  {formData.country ? (
                    <CountryFlag
                      country={formData.country}
                      countryCode={formData.countryCode}
                      flagUrl={formData.flagUrl}
                      className="w-5 h-3.5"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-[#76777d]">public</span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, country: e.target.value }));
                    setShowCountrySuggestions(true);
                    if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
                  }}
                  onFocus={() => setShowCountrySuggestions(true)}
                  placeholder="Search or select country..."
                  className={`w-full pl-11 pr-10 py-3 bg-[#f2f4f6] border rounded-lg focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] outline-none text-sm transition-all ${
                    errors.country ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]/80'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCountrySuggestions((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showCountrySuggestions ? 'expand_less' : 'search'}
                  </span>
                </button>
              </div>
              {errors.country && (
                <p className="mt-1.5 text-xs text-[#ba1a1a] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.country}
                </p>
              )}

              {/* Suggestions Dropdown */}
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
                      className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#f2f4f6] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <CountryFlag
                          country={preset.country}
                          countryCode={preset.code}
                          flagUrl={preset.flagUrl}
                          className="w-5 h-3.5"
                        />
                        <span className="text-sm font-medium text-[#191c1e] group-hover:text-[#0058be]">
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

            {/* Currency Name & Sign in 2-Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-wider mb-2">
                  Currency Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, currency: e.target.value }));
                    if (errors.currency) setErrors((prev) => ({ ...prev, currency: undefined }));
                  }}
                  placeholder="e.g. US Dollar"
                  className={`w-full px-4 py-3 bg-[#f2f4f6] border rounded-lg focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] outline-none text-sm transition-all ${
                    errors.currency ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]/80'
                  }`}
                />
                {errors.currency && (
                  <p className="mt-1.5 text-xs text-[#ba1a1a] flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.currency}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-wider mb-2">
                  Currency Sign <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sign}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, sign: e.target.value }));
                    if (errors.sign) setErrors((prev) => ({ ...prev, sign: undefined }));
                  }}
                  placeholder="e.g. $"
                  className={`w-full px-4 py-3 bg-[#f2f4f6] border rounded-lg focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] outline-none text-sm font-mono transition-all text-center ${
                    errors.sign ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]/80'
                  }`}
                />
                {errors.sign && (
                  <p className="mt-1.5 text-xs text-[#ba1a1a] flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.sign}
                  </p>
                )}
              </div>
            </div>

            {/* Exchange Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-wider">
                  Exchange Rate <span className="text-[#ba1a1a]">*</span>
                </label>
                {formData.isBaseRate && (
                  <span className="text-[11px] font-bold text-[#0058be] uppercase bg-[#2170e4]/10 px-2 py-0.5 rounded">
                    Locked to Base
                  </span>
                )}
              </div>
              <div className="relative">
                <input
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
                  className={`w-full px-4 py-3 bg-[#f2f4f6] border rounded-lg focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] outline-none text-sm font-mono pr-16 transition-all ${
                    formData.isBaseRate ? 'opacity-80 bg-[#eceef0] cursor-not-allowed text-[#0058be] font-bold' : ''
                  } ${errors.rate ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]/80'}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75859d] text-xs font-mono font-semibold">
                  {formData.isBaseRate ? 'BASE' : (formData.sign || 'RATE')}
                </span>
              </div>
              {errors.rate ? (
                <p className="mt-1.5 text-xs text-[#ba1a1a] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.rate}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-[#75859d] leading-relaxed">
                  Input the conversion factor relative to the base currency. (e.g., 1 Base Unit = {formData.rate || '1.0000'} {formData.sign || 'Local'}).
                </p>
              )}
            </div>

            {/* Base Rate Toggle Box */}
            <div className="p-4 bg-[#f2f4f6] rounded-xl border border-[#c6c6cd]/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-[#191c1e]">Designate as Base Rate</span>
                  <span className="text-xs text-[#45464d]">Set this as the primary property currency</span>
                </div>
                <button
                  type="button"
                  onClick={handleBaseRateToggle}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0058be]/40 ${
                    formData.isBaseRate ? 'bg-[#0058be]' : 'bg-[#c6c6cd]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute left-1 top-1 transition-transform duration-200 shadow-sm ${
                      formData.isBaseRate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex gap-2 mt-3 p-2.5 bg-[#d8e2ff]/40 rounded-lg border border-[#0058be]/20">
                <span className="material-symbols-outlined text-[18px] text-[#0058be] shrink-0">info</span>
                <p className="text-[11px] text-[#38485d] leading-tight">
                  Only one currency can be designated as the Base Rate. Setting this as Base will replace the current selection.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-[#c6c6cd]/50 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={closeExchangeRateDrawer}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#0058be] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#2170e4] hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
