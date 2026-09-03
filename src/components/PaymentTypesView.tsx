import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { PaymentTypeItem } from '../types';

export const PaymentTypesView: React.FC = () => {
  const {
    paymentTypes,
    setEditingPaymentTypeId,
    openAddPaymentTypeDrawer,
    openEditPaymentTypeDrawer,
    openDeletePaymentTypeDialog,
    bulkDeletePaymentTypes,
    togglePaymentTypeStatus,
    addToast,
    navigate,
  } = useProperty();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filtered payment types
  const filteredPaymentTypes = useMemo(() => {
    return paymentTypes.filter((pt) => {
      // Search
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pt.name.toLowerCase().includes(q) ||
        pt.shortName.toLowerCase().includes(q) ||
        pt.category.toLowerCase().includes(q) ||
        (pt.description && pt.description.toLowerCase().includes(q));

      // Category filter
      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'cc' && pt.category === 'Credit Card') ||
        (categoryFilter === 'cash' && pt.category === 'Cash') ||
        (categoryFilter === 'bank' && pt.category === 'Bank Transfer') ||
        (categoryFilter === 'wallet' && pt.category === 'Digital Wallet') ||
        (categoryFilter === 'check' && pt.category === 'Check') ||
        (categoryFilter === 'other' && pt.category === 'Other');

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && pt.status === 'Active') ||
        (statusFilter === 'inactive' && pt.status === 'Inactive');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [paymentTypes, searchTerm, categoryFilter, statusFilter]);

  // Pagination calculation
  const totalItems = filteredPaymentTypes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedItems = filteredPaymentTypes.slice(startIndex, startIndex + pageSize);

  // Checkbox management
  const allSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedItems.map((item) => item.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected payment type(s)?`)) {
      bulkDeletePaymentTypes(selectedIds);
      setSelectedIds([]);
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (filteredPaymentTypes.length === 0) {
      addToast('No payment types to export', 'info');
      return;
    }

    const headers = ['Short Name', 'Payment Type Name', 'Category', 'CC Processing', 'Status', 'Description', 'Updated At'];
    const rows = filteredPaymentTypes.map((pt) => [
      `"${pt.shortName}"`,
      `"${pt.name}"`,
      `"${pt.category}"`,
      `"${pt.ccProcessing ? 'Enabled' : 'Disabled'}"`,
      `"${pt.status}"`,
      `"${(pt.description || '').replace(/"/g, '""')}"`,
      `"${pt.updatedAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Payment_Types_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${filteredPaymentTypes.length} payment types to CSV`, 'success');
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] text-[#191c1e] relative select-none">
      {/* Header Section */}
      <div className="flex items-center justify-between px-8 py-5 bg-[#f7f9fb] border-b border-[#c6c6cd]/50 shrink-0 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[13px] text-[#45464d] font-medium">
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Configuration
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">Payment Types</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#191c1e] tracking-tight m-0">
            Payment Types
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-export-payment-types"
            onClick={handleExport}
            className="h-10 px-4 flex items-center justify-center rounded-lg bg-[#f2f4f6] text-[#191c1e] border border-[#c6c6cd] hover:bg-[#eceef0] active:scale-[0.98] transition-all text-[14px] font-semibold cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined mr-2 text-[20px] text-[#45464d]">download</span>
            Export
          </button>
          <button
            id="addPaymentTypeBtn"
            onClick={() => {
              setEditingPaymentTypeId(null);
              navigate('add-payment-type');
            }}
            className="h-10 px-4 flex items-center justify-center rounded-lg bg-[#000000] text-white hover:bg-[#1f1f1f] active:scale-[0.98] transition-all text-[14px] font-semibold shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
            Add Payment Type
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <div className="bg-white rounded-xl border border-[#c6c6cd]/60 shadow-sm flex flex-col overflow-hidden relative z-10">
          {/* Table Filters / Search Bar */}
          <div className="p-4 border-b border-[#e0e3e5] flex flex-wrap items-center justify-between gap-4 bg-white shrink-0">
            <div className="relative w-72 md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]">
                search
              </span>
              <input
                id="input-search-payment-types"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search payment types..."
                className="w-full h-10 pl-10 pr-8 rounded-lg bg-[#eceef0]/60 border border-[#c6c6cd] text-[14px] text-[#191c1e] placeholder:text-[#76777d] focus:outline-none focus:bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[13px] text-[#45464d] font-medium hidden sm:inline">Filter by:</span>

              {/* Category Filter */}
              <div className="relative">
                <select
                  id="select-category-filter"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 pr-8 rounded-lg bg-[#eceef0]/60 border border-[#c6c6cd] text-[13px] font-medium text-[#191c1e] appearance-none focus:outline-none focus:bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="cc">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="wallet">Digital Wallet</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  id="select-status-filter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 pr-8 rounded-lg bg-[#eceef0]/60 border border-[#c6c6cd] text-[13px] font-medium text-[#191c1e] appearance-none focus:outline-none focus:bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Bulk Action Bar (when rows are selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-[#dae2fd]/40 border-b border-[#0058be]/20 px-6 py-2.5 flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#001a42]">
                <span className="w-5 h-5 rounded-full bg-[#0058be] text-white text-[11px] flex items-center justify-center font-bold">
                  {selectedIds.length}
                </span>
                <span>{selectedIds.length} payment type{selectedIds.length > 1 ? 's' : ''} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="h-8 px-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="h-8 px-2.5 rounded-lg text-[#45464d] hover:bg-[#eceef0] text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="flex-1 overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead className="sticky top-0 bg-[#eceef0] border-b border-[#c6c6cd]/60 z-20 shadow-xs">
                <tr>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider w-16 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="rounded border-[#c6c6cd] text-[#000000] focus:ring-[#000000] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
                    Short Name
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
                    Payment Type Name
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
                    CC Processing
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap w-28">
                    Status
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap text-right w-28 pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#191c1e] divide-y divide-[#e0e3e5]">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((pt) => {
                    const isSelected = selectedIds.includes(pt.id);
                    const isInactive = pt.status === 'Inactive';

                    return (
                      <tr
                        key={pt.id}
                        id={`payment-type-row-${pt.id}`}
                        onClick={() => {
                          setEditingPaymentTypeId(pt.id);
                          navigate('edit-payment-type');
                        }}
                        className={`hover:bg-[#f2f4f6] transition-colors group cursor-pointer ${
                          isSelected ? 'bg-[#dae2fd]/20' : ''
                        } ${isInactive ? 'opacity-75' : ''}`}
                      >
                        {/* Checkbox */}
                        <td
                          className="p-4 text-center"
                          onClick={(e) => handleToggleSelect(pt.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-[#c6c6cd] text-[#000000] focus:ring-[#000000] w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Short Name */}
                        <td className="p-4">
                          <span className="font-mono text-[13px] font-bold bg-[#eceef0] text-[#191c1e] px-2.5 py-1 rounded border border-[#c6c6cd]/40">
                            {pt.shortName}
                          </span>
                        </td>

                        {/* Payment Type Name */}
                        <td className="p-4 font-semibold text-[#191c1e]">
                          <div className="flex flex-col">
                            <span>{pt.name}</span>
                            {pt.description && (
                              <span className="text-[12px] text-[#76777d] font-normal truncate max-w-xs">
                                {pt.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 text-[#45464d]">
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]" />
                            {pt.category}
                          </span>
                        </td>

                        {/* CC Processing */}
                        <td className="p-4">
                          {pt.ccProcessing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2170e4]/15 text-[#0058be] text-[11px] font-semibold tracking-wide">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e6e8ea] text-[#45464d] text-[11px] font-semibold tracking-wide">
                              <span className="material-symbols-outlined text-[14px]">block</span>
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePaymentTypeStatus(pt.id);
                            }}
                            className="group/status inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                            title={`Click to switch to ${isInactive ? 'Active' : 'Inactive'}`}
                          >
                            {isInactive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eceef0] text-[#76777d] border border-[#c6c6cd]/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#76777d]" />
                                Inactive
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#131b2e] border border-[#0058be]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
                                Active
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`btn-edit-pt-${pt.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPaymentTypeId(pt.id);
                                navigate('edit-payment-type');
                              }}
                              className="w-8 h-8 rounded-full hover:bg-[#eceef0] text-[#45464d] hover:text-[#0058be] transition-colors inline-flex items-center justify-center cursor-pointer"
                              title="Edit payment type"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              id={`btn-delete-pt-${pt.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeletePaymentTypeDialog(pt);
                              }}
                              className="w-8 h-8 rounded-full hover:bg-[#ffdad6] text-[#45464d] hover:text-[#ba1a1a] transition-colors inline-flex items-center justify-center cursor-pointer"
                              title="Delete payment type"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#eceef0] flex items-center justify-center mb-3 text-[#76777d]">
                          <span className="material-symbols-outlined text-[24px]">credit_card_off</span>
                        </div>
                        <p className="text-[16px] font-semibold text-[#191c1e]">No payment types found</p>
                        <p className="text-[13px] text-[#76777d] mt-1 max-w-sm">
                          {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                            ? 'No payment types matched your filter criteria. Try resetting the filters.'
                            : 'Configure payment methods accepted across the front desk, POS, and online portals.'}
                        </p>
                        {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setCategoryFilter('all');
                              setStatusFilter('all');
                            }}
                            className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#0058be] hover:bg-[#0058be]/10 transition-colors cursor-pointer"
                          >
                            Reset all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 px-6 border-t border-[#e0e3e5] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <span className="text-[13px] text-[#45464d]">
              Showing{' '}
              <strong className="text-[#191c1e] font-semibold">
                {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)}
              </strong>{' '}
              of <strong className="text-[#191c1e] font-semibold">{totalItems}</strong> payment types
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#eceef0] text-[#191c1e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Previous Page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-[13px] font-semibold transition-colors cursor-pointer ${
                      validCurrentPage === pageNum
                        ? 'bg-[#000000] text-white shadow-xs'
                        : 'hover:bg-[#eceef0] text-[#191c1e]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#eceef0] text-[#191c1e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Next Page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
