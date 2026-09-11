import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { TaxItem } from '@/src/types';

export const TaxConfigurationView: React.FC = () => {
  const {
    taxes,
    openAddTaxRuleDrawer,
    openEditTaxRuleDrawer,
    openDeleteTaxDialog,
    openTaxConfigDrawer,
    updateTax,
    navigate,
    addToast,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionTaxId, setActiveActionTaxId] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionTaxId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Taxes
  const filteredTaxes = useMemo(() => {
    return taxes.filter((tax) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tax.name.toLowerCase().includes(q) ||
        (tax.code && tax.code.toLowerCase().includes(q)) ||
        (tax.description && tax.description.toLowerCase().includes(q));

      const isPercentage =
        tax.ruleType === 'percentage' ||
        tax.taxType === 'VAT' ||
        tax.taxType === 'GST' ||
        tax.taxType === 'Environmental Fee';

      const matchesType =
        filterType === 'all' ||
        (filterType === 'percentage' && isPercentage) ||
        (filterType === 'fixed' && !isPercentage);

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && tax.isActive) ||
        (filterStatus === 'inactive' && !tax.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [taxes, searchQuery, filterType, filterStatus]);

  // Paginated Taxes
  const paginatedTaxes = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTaxes.slice(start, start + rowsPerPage);
  }, [filteredTaxes, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredTaxes.length / rowsPerPage) || 1;

  // Export to CSV
  const handleExport = () => {
    const headers = ['Tax Name', 'Code', 'Type', 'Value', 'Application', 'Status'];
    const rows = filteredTaxes.map((t) => [
      t.name,
      t.code || `TAX-${t.id}`,
      t.ruleType === 'percentage' ? 'Percentage' : 'Fixed',
      t.ruleType === 'percentage' ? `${t.value || t.slabs?.[0]?.ratePercentage || 0}%` : `$${t.value || 0}`,
      t.applicationMethod || t.calculationStrategy || 'Per Stay',
      t.isActive ? 'Active' : 'Inactive',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tax_configurations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Tax configuration exported successfully', 'success');
  };

  const getApplicationLabel = (tax: TaxItem) => {
    if (tax.applicationMethod) {
      if (tax.applicationMethod === 'per_person_night') return 'Per Person, Per Night';
      if (tax.applicationMethod === 'per_night') return 'Per Room, Per Night';
      if (tax.applicationMethod === 'per_stay') return 'Per Stay';
      if (tax.applicationMethod === 'per_item') return 'Per Item';
      return tax.applicationMethod.replace(/_/g, ' ');
    }
    if (tax.calculationStrategy === 'per-day') return 'Per Room, Per Night';
    if (tax.calculationStrategy === 'per-stay') return 'Per Stay';
    return 'Per Room, Per Night';
  };

  const formatTaxValue = (tax: TaxItem) => {
    const isPercentage =
      tax.ruleType === 'percentage' ||
      tax.taxType === 'VAT' ||
      tax.taxType === 'GST' ||
      tax.taxType === 'Environmental Fee';

    const val = tax.value !== undefined ? tax.value : tax.slabs?.[0]?.ratePercentage ?? 10;
    if (isPercentage) {
      return `${Number(val).toFixed(2)}%`;
    }
    return `$${Number(val).toFixed(2)}`;
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 lg:px-10 py-6 bg-[#f7f9fb] relative overflow-hidden border-b border-[#e0e3e5]/60 gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f2f4f6] to-transparent opacity-50 z-0 pointer-events-none" />
        
        <div className="relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[#45464d] text-[12px] font-semibold tracking-wider uppercase mb-1.5">
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#0058be] transition-colors cursor-pointer"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#000000] font-bold">Tax Configuration</span>
          </div>

          <h1 className="text-[24px] font-bold text-[#191c1e] tracking-tight">
            Tax Configuration
          </h1>
          <p className="text-[14px] text-[#45464d] mt-1">
            Manage local, federal, and custom tax rules applied to reservations.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-nav-crs-from-config"
            onClick={() => navigate('crs-tax-exempt')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white rounded-lg text-[12px] font-semibold uppercase tracking-wider text-[#0058be] hover:bg-[#d8e2ff]/30 transition-colors cursor-pointer border border-[#0058be]/30 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">rule_folder</span>
            CRS Tax Exempt
          </button>
          <button
            id="btn-export-tax-config"
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#eceef0] rounded-lg text-[12px] font-semibold uppercase tracking-wider text-[#191c1e] hover:bg-[#e0e3e5] transition-colors cursor-pointer border border-[#c6c6cd]/50 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            id="btn-create-tax-config"
            onClick={() => navigate('add-tax-rate')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#000000] rounded-lg text-[12px] font-semibold uppercase tracking-wider text-white hover:bg-[#333333] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Tax
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 lg:px-10 py-6 flex-1 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3.5 rounded-xl shadow-xs border border-[#e0e3e5] gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:max-w-lg">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] text-[20px]">
                search
              </span>
              <input
                id="input-search-tax-config"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all border border-transparent focus:border-[#0058be]"
                placeholder="Search taxes by name..."
                type="text"
              />
            </div>

            {/* Filter Button & Popover */}
            <div className="relative" ref={filterRef}>
              <button
                id="btn-filter-tax-config"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                  filterType !== 'all' || filterStatus !== 'all'
                    ? 'bg-[#2170e4] text-white border-[#2170e4]'
                    : 'bg-[#f2f4f6] text-[#191c1e] border-transparent hover:bg-[#e0e3e5]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
                {(filterType !== 'all' || filterStatus !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-white ml-0.5" />
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e0e3e5] p-4 z-30 flex flex-col gap-3 animate-fadeIn">
                  <div className="text-[13px] font-bold text-[#191c1e] border-b border-[#e0e3e5] pb-2">
                    Filter Taxes
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Calculation Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] outline-none border border-transparent focus:border-[#0058be]"
                    >
                      <option value="all">All Types</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] outline-none border border-transparent focus:border-[#0058be]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#e0e3e5]">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterStatus('all');
                      }}
                      className="px-2.5 py-1 text-[12px] font-semibold text-[#45464d] hover:text-[#191c1e] cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-3 py-1 bg-[#000000] text-white rounded text-[12px] font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-[#45464d]">
            <span>
              Showing {filteredTaxes.length > 0 ? `1-${filteredTaxes.length}` : '0'} of{' '}
              {filteredTaxes.length}
            </span>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-xl shadow-xs overflow-hidden flex-1 border border-[#e0e3e5]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]/50 border-b border-[#e0e3e5]">
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] sticky left-0 bg-[#f2f4f6] shadow-[1px_0_0_0_#E2E8F0] z-20 w-[240px]">
                    Tax Name
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] w-[160px]">
                    Type
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] w-[120px]">
                    Value
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] w-[180px]">
                    Application
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] w-[120px]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] text-right w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/60">
                {paginatedTaxes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-[44px] text-[#c6c6cd] mb-2">
                          tune
                        </span>
                        <div className="text-[15px] font-semibold text-[#191c1e]">
                          No tax configurations found
                        </div>
                        <p className="text-[13px] text-[#75859d] mt-1">
                          Create your first tax rule to apply to bookings and reservations.
                        </p>
                        <button
                          onClick={() => navigate('add-tax-rate')}
                          className="mt-4 px-4 py-2 bg-[#000000] text-white text-[12px] font-semibold uppercase tracking-wider rounded-lg hover:bg-[#333333] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Create New Tax
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTaxes.map((tax) => {
                    const isPercentage =
                      tax.ruleType === 'percentage' ||
                      tax.taxType === 'VAT' ||
                      tax.taxType === 'GST' ||
                      tax.taxType === 'Environmental Fee';

                    const code = tax.code || `TAX-00${tax.id.replace(/\D/g, '') || '1'}`;
                    const applicationLabel = getApplicationLabel(tax);
                    const formattedVal = formatTaxValue(tax);

                    return (
                      <tr
                        key={tax.id}
                        className="group hover:bg-[#f2f4f6]/60 transition-colors bg-white border-b border-[#e0e3e5]/50 h-[60px]"
                      >
                        {/* Tax Name (Sticky Left) */}
                        <td className="px-5 py-3.5 sticky left-0 bg-white group-hover:bg-[#f2f4f6]/60 transition-colors z-10 shadow-[1px_0_0_0_#E2E8F0]">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-semibold text-[#191c1e] truncate">
                              {tax.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#75859d] uppercase tracking-wider">
                              {code}
                            </span>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f2f4f6] rounded text-[12px] font-medium text-[#191c1e] border border-[#e0e3e5]">
                            <span className="material-symbols-outlined text-[14px] text-[#75859d]">
                              {isPercentage ? 'percent' : 'attach_money'}
                            </span>
                            {isPercentage ? 'Percentage' : 'Fixed'}
                          </span>
                        </td>

                        {/* Value */}
                        <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-[#191c1e]">
                          {formattedVal}
                        </td>

                        {/* Application */}
                        <td className="px-5 py-3.5 text-[13px] text-[#191c1e]">
                          {applicationLabel}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          {tax.isActive ? (
                            <span className="inline-flex px-2 py-0.5 bg-[#d3e4fe]/40 text-[#0b1c30] rounded text-[11px] font-semibold uppercase tracking-wider border border-[#b7c8e1]/40">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 bg-[#e0e3e5] text-[#45464d] rounded text-[11px] font-semibold uppercase tracking-wider">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions (more_vert menu) */}
                        <td className="px-5 py-3.5 text-right relative">
                          <button
                            id={`btn-tax-rule-actions-${tax.id}`}
                            onClick={() =>
                              setActiveActionTaxId(
                                activeActionTaxId === tax.id ? null : tax.id
                              )
                            }
                            className="p-1.5 text-[#45464d] hover:text-[#000000] transition-colors hover:bg-[#eceef0] rounded-lg cursor-pointer"
                            title="More options"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>

                          {/* Popover Action Menu */}
                          {activeActionTaxId === tax.id && (
                            <div
                              ref={actionMenuRef}
                              className="absolute right-6 top-10 w-52 bg-white rounded-xl shadow-xl border border-[#e0e3e5] py-1 z-30 text-left animate-fadeIn"
                            >
                              <button
                                onClick={() => {
                                  setActiveActionTaxId(null);
                                  navigate('add-tax-rate', tax.id);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#000000]">
                                  percent
                                </span>
                                Configure Rate & Period
                              </button>
                              <button
                                onClick={() => {
                                  setActiveActionTaxId(null);
                                  openEditTaxRuleDrawer(tax);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#0058be]">
                                  edit
                                </span>
                                Edit Tax Rule
                              </button>
                              <button
                                onClick={() => {
                                  setActiveActionTaxId(null);
                                  openTaxConfigDrawer(tax);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#75859d]">
                                  tune
                                </span>
                                Rate Tiers / Slabs
                              </button>
                              <button
                                onClick={() => {
                                  setActiveActionTaxId(null);
                                  updateTax(tax.id, { isActive: !tax.isActive });
                                  addToast(
                                    `Tax rule "${tax.name}" marked as ${
                                      !tax.isActive ? 'Active' : 'Inactive'
                                    }`,
                                    'info'
                                  );
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#75859d]">
                                  {tax.isActive ? 'toggle_off' : 'toggle_on'}
                                </span>
                                {tax.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <div className="border-t border-[#e0e3e5] my-1" />
                              <button
                                onClick={() => {
                                  setActiveActionTaxId(null);
                                  openDeleteTaxDialog(tax);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
                                  delete
                                </span>
                                Delete Tax Rule
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3.5 bg-white border-t border-[#e0e3e5] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-[#45464d]">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#f2f4f6] border border-[#c6c6cd]/50 rounded text-[13px] text-[#191c1e] py-1 px-2.5 focus:ring-0 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#75859d] mr-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 text-[#45464d] hover:bg-[#eceef0] rounded disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Previous page"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 text-[#45464d] hover:bg-[#eceef0] rounded disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Next page"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
