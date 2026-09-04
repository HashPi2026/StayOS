import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { CountryFlag } from '@/src/components/common/CountryFlag/CountryFlag';
import { ExchangeRateItem } from '@/src/types';

export const ExchangeRatesView: React.FC = () => {
  const {
    exchangeRates,
    setEditingExchangeRateId,
    openAddExchangeRateDrawer,
    openEditExchangeRateDrawer,
    openDeleteExchangeRateDialog,
    setBaseExchangeRate,
    addToast,
    navigate,
  } = useProperty();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'base' | 'custom'>('all');
  const [showConverter, setShowConverter] = useState(false);

  // Quick Currency Converter state
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [fromCurrencyId, setFromCurrencyId] = useState<string>('');
  const [toCurrencyId, setToCurrencyId] = useState<string>('');

  const baseRateItem = useMemo(() => {
    return exchangeRates.find((xr) => xr.isBaseRate) || exchangeRates[0];
  }, [exchangeRates]);

  // Set default converter options
  React.useEffect(() => {
    if (exchangeRates.length > 0) {
      if (!fromCurrencyId && baseRateItem) {
        setFromCurrencyId(baseRateItem.id);
      }
      if (!toCurrencyId && exchangeRates.length > 1) {
        const other = exchangeRates.find((xr) => xr.id !== baseRateItem?.id) || exchangeRates[1];
        setToCurrencyId(other.id);
      }
    }
  }, [exchangeRates, baseRateItem, fromCurrencyId, toCurrencyId]);

  // Filtered Exchange Rates
  const filteredRates = useMemo(() => {
    return exchangeRates.filter((xr) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        xr.country.toLowerCase().includes(q) ||
        xr.currency.toLowerCase().includes(q) ||
        xr.sign.toLowerCase().includes(q) ||
        xr.rate.toString().includes(q);

      const matchesType =
        filterType === 'all' ||
        (filterType === 'base' && xr.isBaseRate) ||
        (filterType === 'custom' && !xr.isBaseRate);

      return matchesSearch && matchesType;
    });
  }, [exchangeRates, searchTerm, filterType]);

  // Currency Converter calculation
  const convertedResult = useMemo(() => {
    const fromItem = exchangeRates.find((x) => x.id === fromCurrencyId);
    const toItem = exchangeRates.find((x) => x.id === toCurrencyId);
    if (!fromItem || !toItem || !convertAmount) return 0;

    // Convert from source currency to base currency, then to target currency
    // rate represents units of local currency per 1 unit of base currency
    const amountInBase = fromItem.isBaseRate ? convertAmount : convertAmount / fromItem.rate;
    const finalAmount = toItem.isBaseRate ? amountInBase : amountInBase * toItem.rate;
    return finalAmount;
  }, [exchangeRates, fromCurrencyId, toCurrencyId, convertAmount]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRates.length === 0) {
      addToast('No exchange rates to export', 'info');
      return;
    }

    const headers = ['Country', 'Currency', 'Sign', 'Exchange Rate', 'Base Rate Flag', 'Updated At'];
    const rows = filteredRates.map((xr) => [
      `"${xr.country}"`,
      `"${xr.currency}"`,
      `"${xr.sign}"`,
      `"${xr.rate.toFixed(4)}"`,
      `"${xr.isBaseRate ? 'BASE' : 'NO'}"`,
      `"${xr.updatedAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Exchange_Rates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${filteredRates.length} exchange rates to CSV`, 'success');
  };

  const handleSetBase = (xr: ExchangeRateItem) => {
    if (xr.isBaseRate) return;
    setBaseExchangeRate(xr.id);
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative select-none">
      {/* Header Section with Breadcrumbs & Action Button */}
      <header className="bg-[#f7f9fb] border-b border-[#c6c6cd]/50 px-8 py-5 shrink-0 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-[#45464d] mb-2 font-medium">
          <button
            onClick={() => navigate('overview')}
            className="hover:text-[#191c1e] transition-colors cursor-pointer"
          >
            Configuration
          </button>
          <span className="material-symbols-outlined text-[14px] text-[#76777d]">chevron_right</span>
          <button
            onClick={() => navigate('overview')}
            className="hover:text-[#191c1e] transition-colors cursor-pointer"
          >
            Property
          </button>
          <span className="material-symbols-outlined text-[14px] text-[#76777d]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">Exchange Rates</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-[#191c1e] tracking-tight">Exchange Rates</h1>
            {baseRateItem && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2170e4]/10 text-[#0058be] border border-[#2170e4]/20">
                <span className="size-2 rounded-full bg-[#0058be] animate-pulse"></span>
                Base: {baseRateItem.currency} ({baseRateItem.sign})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowConverter((prev) => !prev)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all shadow-sm ${
                showConverter
                  ? 'bg-[#0058be] text-white border-[#0058be]'
                  : 'bg-white text-[#45464d] border-[#c6c6cd] hover:bg-[#eceef0] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calculate</span>
              <span>Quick Converter</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-[#45464d] border border-[#c6c6cd] hover:bg-[#eceef0] hover:text-[#191c1e] flex items-center gap-1.5 transition-all shadow-sm"
              title="Export table data to CSV"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export</span>
            </button>

            <button
              id="addExchangeRateBtn"
              type="button"
              onClick={() => {
                setEditingExchangeRateId(null);
                navigate('add-exchange-rate');
              }}
              className="bg-[#000000] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1f1f1f] active:scale-95 transition-all shadow-sm text-sm font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add Exchange Rate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Section */}
      <section className="flex-1 overflow-auto p-8 space-y-6">
        {/* Interactive Currency Converter Banner */}
        {showConverter && (
          <div className="bg-[#ffffff] border border-[#0058be]/20 rounded-xl p-5 shadow-sm animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#eceef0] pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-[#2170e4]/10 text-[#0058be] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#191c1e]">Real-time Currency Calculator</h3>
                  <p className="text-[11px] text-[#75859d]">Test exchange rate conversions based on your configured property rates</p>
                </div>
              </div>
              <button
                onClick={() => setShowConverter(false)}
                className="text-[#75859d] hover:text-[#191c1e] p-1 rounded hover:bg-[#eceef0]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold text-[#45464d] uppercase mb-1.5">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0058be] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#45464d] uppercase mb-1.5">From Currency</label>
                <select
                  value={fromCurrencyId}
                  onChange={(e) => setFromCurrencyId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg text-sm focus:ring-2 focus:ring-[#0058be] outline-none"
                >
                  {exchangeRates.map((xr) => (
                    <option key={xr.id} value={xr.id}>
                      {xr.country} - {xr.currency} ({xr.sign}) {xr.isBaseRate ? '★ Base' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#45464d] uppercase mb-1.5">To Currency</label>
                <select
                  value={toCurrencyId}
                  onChange={(e) => setToCurrencyId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg text-sm focus:ring-2 focus:ring-[#0058be] outline-none"
                >
                  {exchangeRates.map((xr) => (
                    <option key={xr.id} value={xr.id}>
                      {xr.country} - {xr.currency} ({xr.sign}) {xr.isBaseRate ? '★ Base' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#f2f4f6] border border-[#c6c6cd]/60 p-3 rounded-lg flex flex-col justify-center">
                <span className="text-[11px] text-[#75859d] font-semibold uppercase">Converted Equivalent</span>
                <div className="text-lg font-bold font-mono text-[#0058be] truncate">
                  {exchangeRates.find((x) => x.id === toCurrencyId)?.sign || ''} {convertedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by country, currency, or sign..."
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-[#c6c6cd] rounded-lg text-xs focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] outline-none transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#eceef0] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                All ({exchangeRates.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('base')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'base'
                    ? 'bg-white text-[#0058be] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                Base Rate
              </button>
              <button
                type="button"
                onClick={() => setFilterType('custom')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'custom'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                Converted ({exchangeRates.length - 1})
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Country</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Currency</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-center">Sign</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Rate</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Base Rate</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/50">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#75859d]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-[#c6c6cd]">
                        currency_exchange
                      </span>
                      <p className="text-sm font-medium text-[#45464d]">No exchange rates found</p>
                      <p className="text-xs text-[#75859d]">
                        Try searching with a different keyword or add a new exchange rate.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="hover:bg-[#f2f4f6]/80 transition-colors group"
                  >
                    {/* Country */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CountryFlag
                          country={rate.country}
                          countryCode={rate.countryCode}
                          flagUrl={rate.flagUrl}
                          className="w-6 h-4"
                        />
                        <span className="text-sm font-medium text-[#191c1e]">
                          {rate.country}
                        </span>
                      </div>
                    </td>

                    {/* Currency */}
                    <td className="px-6 py-4 text-sm text-[#45464d]">
                      {rate.currency}
                    </td>

                    {/* Sign */}
                    <td className="px-6 py-4 text-sm font-mono text-center font-semibold text-[#191c1e]">
                      {rate.sign}
                    </td>

                    {/* Rate */}
                    <td className="px-6 py-4 text-sm font-mono text-[#191c1e]">
                      {rate.rate.toFixed(4)}
                    </td>

                    {/* Base Rate */}
                    <td className="px-6 py-4">
                      {rate.isBaseRate ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0058be] text-white shadow-xs">
                          BASE
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetBase(rate)}
                          title="Click to designate as Base Rate"
                          className="w-5 h-5 rounded border border-[#c6c6cd] hover:border-[#0058be] hover:bg-[#2170e4]/10 transition-colors flex items-center justify-center cursor-pointer group/btn"
                        >
                          <span className="material-symbols-outlined text-[14px] text-transparent group-hover/btn:text-[#0058be] transition-colors">
                            check
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          id={`btn-edit-xr-${rate.id}`}
                          onClick={() => {
                            setEditingExchangeRateId(rate.id);
                            navigate('edit-exchange-rate');
                          }}
                          title="Edit Exchange Rate"
                          className="text-[#45464d] hover:text-[#0058be] hover:bg-[#eceef0] p-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>

                        {!rate.isBaseRate && (
                          <button
                            type="button"
                            onClick={() => openDeleteExchangeRateDialog(rate)}
                            title="Delete Exchange Rate"
                            className="text-[#75859d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 p-1.5 rounded-md transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notes / Summary Card */}
        <div className="bg-[#f2f4f6] border border-[#c6c6cd]/70 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#45464d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#0058be]">lightbulb</span>
            <span>
              All transactions, billing invoices, and reports will convert automatically using the selected <strong>Base Currency</strong>.
            </span>
          </div>
          <div className="text-[11px] text-[#75859d] shrink-0 font-medium">
            Showing {filteredRates.length} of {exchangeRates.length} configured rates
          </div>
        </div>
      </section>
    </div>
  );
};
