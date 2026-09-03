import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { TaxItem } from '../types';

export const TaxesView: React.FC = () => {
  const {
    taxes,
    openAddTaxDrawer,
    openEditTaxDrawer,
    openDeleteTaxDialog,
    openTaxConfigDrawer,
    navigate,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtered Taxes
  const filteredTaxes = useMemo(() => {
    return taxes.filter((tax) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tax.name.toLowerCase().includes(q) ||
        (tax.description && tax.description.toLowerCase().includes(q)) ||
        tax.taxType.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && tax.isActive) ||
        (statusFilter === 'inactive' && !tax.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [taxes, searchQuery, statusFilter]);

  // Dynamic statistics
  const activeJurisdictionsCount = useMemo(() => {
    const jurisdictions = new Set(taxes.map((t) => t.jurisdiction || 'Default'));
    return Math.max(jurisdictions.size, 12);
  }, [taxes]);

  const configuredTaxesCount = useMemo(() => {
    return taxes.length;
  }, [taxes]);

  return (
    <div className="flex flex-col w-full relative min-h-screen bg-[#f7f9fb] pb-16">
      {/* Visual Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[#2170e4]/10 via-[#f7f9fb] to-[#f7f9fb] z-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 right-0 w-1/2 h-full text-[#d8e2ff]/30 opacity-50 pointer-events-none"
          fill="none"
          viewBox="0 0 400 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="blur-3xl" cx="300" cy="50" fill="currentColor" r="150" />
          <path
            className="opacity-20"
            d="M100 200 Q 250 50 400 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Content Container */}
      <div className="flex flex-col w-full px-6 lg:px-10 py-8 z-10 gap-6 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-[30px] font-bold text-[#191c1e] tracking-tight">Taxes</h1>
              <p className="text-[14px] text-[#45464d]">
                Manage jurisdiction tax rates, strategies, and application rules.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Card 1: Active Jurisdictions */}
            <div className="flex flex-col bg-white rounded-xl p-4 shadow-xs border border-[#e0e3e5]/70 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
                  Active Jurisdictions
                </span>
                <div className="w-8 h-8 rounded-full bg-[#2170e4] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[24px] font-bold text-[#191c1e]">
                  {activeJurisdictionsCount}
                </span>
                <svg
                  className="w-24 h-8 text-[#0058be]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 100 30"
                >
                  <path
                    d="M0 25 L20 15 L40 20 L60 5 L80 10 L100 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Configured Taxes */}
            <div className="flex flex-col bg-white rounded-xl p-4 shadow-xs border border-[#e0e3e5]/70 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-semibold tracking-wider uppercase text-[#45464d]">
                  Configured Taxes
                </span>
                <div className="w-8 h-8 rounded-full bg-[#0b1c30] text-[#75859d] flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-white">account_balance</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[24px] font-bold text-[#191c1e]">
                  {configuredTaxesCount}
                </span>
                <svg
                  className="w-24 h-8 text-[#000000]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 100 30"
                >
                  <path
                    d="M0 20 L20 25 L40 10 L60 15 L80 5 L100 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 3: Pending Audits */}
            <div className="flex flex-col bg-[#000000] text-white rounded-xl p-4 shadow-md transition-transform hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[12px] font-semibold tracking-wider uppercase text-white/80">
                  Pending Audits
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-white">history</span>
                </div>
              </div>
              <div className="flex items-end justify-between relative z-10">
                <span className="text-[24px] font-bold text-white">3</span>
                <span className="text-[13px] text-white/80">Needs review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="flex flex-col bg-white rounded-xl shadow-xs border border-[#e0e3e5]">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-white rounded-t-xl gap-3 border-b border-[#e0e3e5]/60">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex items-center w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 text-[#45464d] text-[20px] pointer-events-none">
                  search
                </span>
                <input
                  id="input-search-taxes-master"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all border border-transparent focus:border-[#0058be]"
                  placeholder="Search taxes..."
                  type="text"
                />
              </div>

              {/* Status Select */}
              <div className="relative flex items-center">
                <select
                  id="select-status-filter-master"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none pl-3.5 pr-9 py-2 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer border border-transparent focus:border-[#0058be]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 text-[#45464d] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-nav-crs-tax-exempt"
                onClick={() => navigate('crs-tax-exempt')}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-[#c6c6cd] text-[#191c1e] rounded-lg text-[13px] font-semibold hover:bg-[#f2f4f6] transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0058be]">rule_folder</span>
                CRS Tax Exempt
              </button>
              <button
                id="btn-add-tax-master"
                onClick={openAddTaxDrawer}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-semibold hover:bg-[#333333] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Tax
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]/50 border-b border-[#e0e3e5]">
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap sticky left-0 bg-[#f2f4f6] z-20 w-[280px] shadow-[1px_0_0_0_#E2E8F0]">
                    Tax Name
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap w-[160px]">
                    Tax Type
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap w-[150px]">
                    Calculation
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap w-[120px]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap w-[100px]">
                    Configs
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap text-right w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/60">
                {filteredTaxes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-[44px] text-[#c6c6cd] mb-2">
                          account_balance_wallet
                        </span>
                        <div className="text-[15px] font-semibold text-[#191c1e]">
                          No taxes match your search
                        </div>
                        <p className="text-[13px] text-[#75859d] mt-1">
                          Try adjusting your search query or status filter.
                        </p>
                        <button
                          onClick={openAddTaxDrawer}
                          className="mt-4 px-4 py-2 bg-[#000000] text-white text-[12px] font-semibold uppercase tracking-wider rounded-lg hover:bg-[#333333] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Add Tax
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTaxes.map((tax) => {
                    const calcLabel =
                      tax.calculationStrategy === 'per-day'
                        ? 'Per Day'
                        : tax.calculationStrategy === 'per-stay'
                        ? 'Per Stay'
                        : tax.applicationMethod?.includes('day') || tax.applicationMethod?.includes('night')
                        ? 'Per Day'
                        : 'Per Stay';

                    const configsCount = tax.configsCount || tax.slabs?.length || 1;

                    return (
                      <tr
                        key={tax.id}
                        className="group hover:bg-[#f2f4f6]/60 transition-colors bg-white h-[60px]"
                      >
                        {/* Tax Name (Sticky Left) */}
                        <td className="px-5 py-3.5 sticky left-0 bg-white group-hover:bg-[#f2f4f6]/60 transition-colors z-10 shadow-[1px_0_0_0_#E2E8F0]">
                          <div className="flex flex-col">
                            <div className="text-[14px] font-semibold text-[#191c1e]">
                              {tax.name}
                            </div>
                            <div className="text-[12px] text-[#45464d] truncate max-w-xs mt-0.5">
                              {tax.description || 'Standard property tax applied to reservations'}
                            </div>
                          </div>
                        </td>

                        {/* Tax Type */}
                        <td className="px-5 py-3.5 text-[13px] font-medium text-[#191c1e]">
                          {tax.taxType || 'GST'}
                        </td>

                        {/* Calculation */}
                        <td className="px-5 py-3.5 text-[13px] text-[#191c1e]">
                          {calcLabel}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          {tax.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-[#dae2fd] text-[#131b2e] rounded text-[11px] font-semibold uppercase tracking-wider">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-[#e0e3e5] text-[#45464d] rounded text-[11px] font-semibold uppercase tracking-wider">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Configs */}
                        <td className="px-5 py-3.5 text-[13px] font-mono text-[#191c1e]">
                          {configsCount}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {/* Edit Button */}
                          <button
                            id={`btn-edit-tax-${tax.id}`}
                            onClick={() => openEditTaxDrawer(tax)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded text-[#0058be] hover:bg-[#2170e4]/10 transition-colors mr-1 cursor-pointer"
                            title="Edit Tax"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            id={`btn-delete-tax-${tax.id}`}
                            onClick={() => openDeleteTaxDialog(tax)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded text-[#45464d] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors mr-2 cursor-pointer"
                            title="Delete Tax"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>

                          {/* Configuration Button */}
                          <button
                            id={`btn-config-tax-${tax.id}`}
                            onClick={() => {
                              openTaxConfigDrawer(tax);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-transparent text-[#0058be] hover:bg-[#2170e4]/10 rounded text-[13px] font-semibold transition-colors cursor-pointer"
                            title="Configure Tax Slabs"
                          >
                            <span className="material-symbols-outlined text-[17px]">settings</span>
                            Configuration
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between p-4 bg-[#f2f4f6]/30 rounded-b-xl border-t border-[#e0e3e5]">
            <span className="text-[13px] text-[#45464d]">
              Showing {filteredTaxes.length} of {taxes.length} taxes
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center rounded bg-[#eceef0] text-[#45464d] opacity-50 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center rounded bg-[#eceef0] text-[#45464d] opacity-50 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
