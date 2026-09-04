import React, { useState, useMemo, useEffect } from 'react';
import { CrsTaxExemptMapping } from '@/src/types';
import { INITIAL_CRS_MAPPINGS, CRS_ENGINES } from '@/src/data/crsTaxExemptData';
import { CrsTaxExemptDrawer } from './CrsTaxExemptDrawer';
import { CrsTaxExemptFormView } from '../forms/CrsTaxExemptFormView';
import { useProperty } from '@/src/context/PropertyContext';

export const CrsTaxExemptView: React.FC = () => {
  const { navigate, addToast } = useProperty();

  // Local persistence for CRS Tax Exempt mappings
  const [mappings, setMappings] = useState<CrsTaxExemptMapping[]>(() => {
    try {
      const saved = localStorage.getItem('stayos_crs_tax_exempt_mappings');
      return saved ? JSON.parse(saved) : INITIAL_CRS_MAPPINGS;
    } catch {
      return INITIAL_CRS_MAPPINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stayos_crs_tax_exempt_mappings', JSON.stringify(mappings));
    } catch (err) {
      console.error('Failed to persist CRS mappings', err);
    }
  }, [mappings]);

  // View mode: 'list' (table) or 'form' (full page form)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [engineFilter, setEngineFilter] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<CrsTaxExemptMapping | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CrsTaxExemptMapping | null>(null);

  // Filtered mappings
  const filteredMappings = useMemo(() => {
    return mappings.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.engineName.toLowerCase().includes(q) ||
        m.marketSource.toLowerCase().includes(q) ||
        m.taxName.toLowerCase().includes(q) ||
        (m.notes && m.notes.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesEngine = engineFilter === 'all' || m.engineName.toLowerCase() === engineFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesEngine;
    });
  }, [mappings, searchQuery, statusFilter, engineFilter]);

  // Paginated mappings
  const totalPages = Math.ceil(filteredMappings.length / pageSize) || 1;
  const paginatedMappings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMappings.slice(start, start + pageSize);
  }, [filteredMappings, currentPage, pageSize]);

  // Ensure current page is valid when list changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  // Handlers for Add/Edit
  const handleOpenAddDrawer = () => {
    setEditingMapping(null);
    setIsDrawerOpen(true);
  };

  const handleOpenAddFullPage = () => {
    setEditingMapping(null);
    setIsDrawerOpen(false);
    setViewMode('form');
  };

  const handleOpenEdit = (mapping: CrsTaxExemptMapping, mode: 'drawer' | 'form' = 'drawer') => {
    setEditingMapping(mapping);
    if (mode === 'drawer') {
      setIsDrawerOpen(true);
    } else {
      setViewMode('form');
    }
  };

  const handleSaveMapping = (data: {
    engineName: string;
    marketSource: string;
    taxName: string;
    status: 'Active' | 'Inactive';
    notes?: string;
  }) => {
    if (editingMapping) {
      // Update
      setMappings((prev) =>
        prev.map((item) =>
          item.id === editingMapping.id
            ? { ...item, ...data }
            : item
        )
      );
      addToast('Exemption rule updated successfully', 'success');
    } else {
      // Add new
      const newMapping: CrsTaxExemptMapping = {
        id: `crs-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setMappings((prev) => [newMapping, ...prev]);
      addToast('New tax exemption mapping created', 'success');
    }

    setIsDrawerOpen(false);
    setEditingMapping(null);
    setViewMode('list');
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setMappings((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    addToast(`Exemption mapping for ${deleteTarget.engineName} deleted`, 'info');
    setDeleteTarget(null);
  };

  const handleToggleStatus = (id: string) => {
    setMappings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
          addToast(`${item.engineName} exemption rule is now ${nextStatus}`, 'info');
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Booking Engine', 'Market Source', 'Tax Name', 'Status', 'Notes'];
    const rows = filteredMappings.map((m) => [
      m.id,
      `"${m.engineName}"`,
      `"${m.marketSource}"`,
      `"${m.taxName}"`,
      m.status,
      `"${m.notes || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crs-tax-exempt-mappings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Mappings exported to CSV', 'success');
  };

  // Helper to render letter logo avatar
  const renderEngineAvatar = (engineName: string) => {
    const found = CRS_ENGINES.find(
      (e) => e.name.toLowerCase() === engineName.toLowerCase()
    );
    const code = found?.code || engineName.charAt(0).toUpperCase();
    const color = found?.color || 'bg-primary-fixed-dim/20 text-primary';

    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] ${color} shadow-2xs`}>
        {code}
      </div>
    );
  };

  // Render Full Page Form if active
  if (viewMode === 'form') {
    return (
      <CrsTaxExemptFormView
        initialData={editingMapping}
        existingMappings={mappings}
        onSave={handleSaveMapping}
        onCancel={() => {
          setViewMode('list');
          setEditingMapping(null);
        }}
        onSwitchToDrawer={() => {
          setViewMode('list');
          setIsDrawerOpen(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-150">
      {/* Breadcrumb matching Screenshot 1 */}
      <nav className="flex items-center gap-2 text-[13px] text-[#75859d] mb-4">
        <button
          type="button"
          onClick={() => navigate('general-settings')}
          className="hover:text-[#191c1e] transition-colors"
        >
          Settings
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <button
          type="button"
          onClick={() => navigate('taxes')}
          className="hover:text-[#191c1e] transition-colors"
        >
          Taxes
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-[#191c1e] font-semibold">CRS Tax Exempt</span>
      </nav>

      {/* Page Header matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[30px] font-bold text-[#191c1e] tracking-tight leading-tight">
            CRS Tax Exempt
          </h1>
          <p className="text-[14px] text-[#45464d] mt-1">
            Configure automated exemptions for bookings originating from specific CRS engines and distribution market sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Mapping with Dropdown or direct click */}
          <div className="relative inline-flex rounded-lg shadow-sm">
            <button
              type="button"
              id="openDrawerBtn"
              onClick={handleOpenAddDrawer}
              className="bg-[#000000] text-white px-4 py-2.5 rounded-l-lg font-semibold text-[13px] hover:bg-[#2d3133] active:scale-98 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Mapping</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddFullPage}
              title="Open full page form"
              className="bg-[#191c1e] text-white px-2.5 py-2.5 rounded-r-lg border-l border-white/20 hover:bg-[#2d3133] transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#eceef0] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">Total Mappings</div>
            <div className="text-[22px] font-bold text-[#191c1e] mt-0.5">{mappings.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#d8e2ff]/40 text-[#004395] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#eceef0] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">Active Rules</div>
            <div className="text-[22px] font-bold text-[#10b981] mt-0.5">
              {mappings.filter((m) => m.status === 'Active').length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#eceef0] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#75859d]">Engines Configured</div>
            <div className="text-[22px] font-bold text-[#0058be] mt-0.5">
              {new Set(mappings.map((m) => m.engineName)).size}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#e0e3e5] text-[#191c1e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
        </div>
      </div>

      {/* Main Table Card (Screenshot 1) */}
      <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/50 overflow-hidden flex flex-col flex-1">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-[#eceef0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-[#75859d]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter mappings..."
              className="w-full h-10 pl-9 pr-8 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#75859d] hover:text-[#191c1e]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Action Buttons: Filter & Download */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                className={`h-10 px-3 border rounded-lg flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                  statusFilter !== 'all' || engineFilter !== 'all'
                    ? 'bg-[#d8e2ff]/50 border-[#2170e4] text-[#004395]'
                    : 'bg-white border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6]'
                }`}
                title="Filter rules"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>Filter</span>
                {(statusFilter !== 'all' || engineFilter !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-[#0058be]" />
                )}
              </button>

              {/* Filter Dropdown */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-[#c6c6cd] rounded-xl shadow-xl p-4 z-30 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]">
                      Filter Mappings
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setEngineFilter('all');
                      }}
                      className="text-[11px] text-[#0058be] hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#75859d] uppercase block mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full bg-white border border-[#c6c6cd] rounded-lg p-2 text-[13px] text-[#191c1e] outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active only</option>
                      <option value="Inactive">Inactive only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#75859d] uppercase block mb-1">
                      Booking Engine
                    </label>
                    <select
                      value={engineFilter}
                      onChange={(e) => setEngineFilter(e.target.value)}
                      className="w-full bg-white border border-[#c6c6cd] rounded-lg p-2 text-[13px] text-[#191c1e] outline-none"
                    >
                      <option value="all">All Engines</option>
                      {CRS_ENGINES.map((eng) => (
                        <option key={eng.id} value={eng.name}>
                          {eng.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="h-10 px-3 bg-white border border-[#c6c6cd] rounded-lg flex items-center gap-1.5 text-[13px] font-medium text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
              title="Download CSV"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table Component (Screenshot 1) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eceef0] bg-[#f7f9fb]/60 text-[12px] font-semibold uppercase tracking-wider text-[#75859d]">
                <th className="py-3.5 px-6">Engine Name</th>
                <th className="py-3.5 px-6">Market Source</th>
                <th className="py-3.5 px-6">Tax Name</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0] text-[14px]">
              {paginatedMappings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#75859d]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-[#a0a5ab]">
                        search_off
                      </span>
                      <p className="font-semibold text-[#191c1e]">No tax exemption mappings found</p>
                      <p className="text-[13px]">
                        {searchQuery || statusFilter !== 'all' || engineFilter !== 'all'
                          ? 'Try adjusting your filters or search terms.'
                          : 'Click "+ Add Mapping" to set up your first CRS tax exemption rule.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMappings.map((mapping) => (
                  <tr
                    key={mapping.id}
                    className="hover:bg-[#f7f9fb] transition-colors group cursor-default"
                  >
                    {/* Engine Name with Letter Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {renderEngineAvatar(mapping.engineName)}
                        <div>
                          <span className="font-semibold text-[#191c1e]">
                            {mapping.engineName}
                          </span>
                          {mapping.notes && (
                            <p className="text-[12px] text-[#75859d] truncate max-w-xs">
                              {mapping.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Market Source */}
                    <td className="py-4 px-6 font-medium text-[#45464d]">
                      {mapping.marketSource}
                    </td>

                    {/* Tax Name */}
                    <td className="py-4 px-6 font-medium text-[#191c1e]">
                      {mapping.taxName}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(mapping.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-opacity hover:opacity-85 ${
                          mapping.status === 'Active'
                            ? 'bg-[#d8e2ff]/50 text-[#004395] border border-[#0058be]/20'
                            : 'bg-[#e0e3e5] text-[#45464d] border border-[#76777d]/20'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            mapping.status === 'Active' ? 'bg-[#004395]' : 'bg-[#76777d]'
                          }`}
                        />
                        <span>{mapping.status}</span>
                      </button>
                    </td>

                    {/* Actions on hover */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(mapping, 'drawer')}
                          className="w-8 h-8 rounded-lg hover:bg-[#d8e2ff]/40 text-[#45464d] hover:text-[#0058be] flex items-center justify-center transition-colors"
                          title="Quick Edit (Drawer)"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(mapping, 'form')}
                          className="w-8 h-8 rounded-lg hover:bg-[#d8e2ff]/40 text-[#45464d] hover:text-[#0058be] flex items-center justify-center transition-colors"
                          title="Edit in Full Page Form"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(mapping)}
                          className="w-8 h-8 rounded-lg hover:bg-[#ffdad6]/60 text-[#ba1a1a] flex items-center justify-center transition-colors"
                          title="Delete Mapping"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer matching Screenshot 1 */}
        <div className="p-4 border-t border-[#eceef0] flex items-center justify-between text-[13px] text-[#75859d] bg-white mt-auto">
          <span>
            Showing{' '}
            <span className="font-semibold text-[#191c1e]">
              {paginatedMappings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[#191c1e]">
              {Math.min(currentPage * pageSize, filteredMappings.length)}
            </span>{' '}
            of <span className="font-semibold text-[#191c1e]">{filteredMappings.length}</span> mappings
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded border border-[#c6c6cd] flex items-center justify-center hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <div className="px-3 py-1 bg-[#000000] text-white rounded text-[12px] font-bold">
              {currentPage}
            </div>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded border border-[#c6c6cd] flex items-center justify-center hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer Component (Screenshot 1) */}
      <CrsTaxExemptDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingMapping(null);
        }}
        onSave={handleSaveMapping}
        initialData={editingMapping}
        existingMappings={mappings}
        onOpenFullPage={() => {
          setIsDrawerOpen(false);
          setViewMode('form');
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-[#eceef0] animate-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#191c1e]">Delete Tax Exemption?</h3>
                <p className="text-[13px] text-[#45464d]">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-[14px] text-[#45464d] mb-6 leading-relaxed">
              Are you sure you want to remove the exemption rule for{' '}
              <strong className="text-[#191c1e]">{deleteTarget.engineName}</strong> with market source{' '}
              <strong className="text-[#191c1e]">{deleteTarget.marketSource}</strong> and tax{' '}
              <strong className="text-[#191c1e]">{deleteTarget.taxName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-[#c6c6cd] text-[13px] font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-[13px] font-semibold hover:bg-[#93000a] transition-colors shadow-xs"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
