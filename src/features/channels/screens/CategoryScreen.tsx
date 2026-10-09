import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../mockData';

interface CategoryScreenProps {
  onNavigateToTab?: (tabKey: string) => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({ onNavigateToTab }) => {
  const { navigate, addToast } = useProperty();
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [commissionFilter, setCommissionFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [creditFilter, setCreditFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Selected for Drawer (Add or Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('edit');
  const [selectedCatId, setSelectedCatId] = useState<string>('cat-1');

  // Form State inside Drawer
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCommissionApply, setFormCommissionApply] = useState(true);
  const [formCreditApply, setFormCreditApply] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Modals
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [blockedModalCategory, setBlockedModalCategory] = useState<CategoryItem | null>(null);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const matchesComm =
        commissionFilter === 'all' ||
        (commissionFilter === 'enabled' && c.commissionApply) ||
        (commissionFilter === 'disabled' && !c.commissionApply);

      const matchesCredit =
        creditFilter === 'all' ||
        (creditFilter === 'enabled' && c.creditApply) ||
        (creditFilter === 'disabled' && !c.creditApply);

      return matchesSearch && matchesComm && matchesCredit;
    });
  }, [categories, searchQuery, commissionFilter, creditFilter]);

  // Derived KPI Stats
  const totalCategories = categories.length;
  const commissionEligibleCount = categories.filter((c) => c.commissionApply).length;
  const creditActiveCount = categories.filter((c) => c.creditApply).length;
  const totalLinkedSources = categories.reduce((sum, c) => sum + c.linkedSourcesCount, 0);

  // Active Category being viewed/edited in Drawer
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCatId);
  }, [categories, selectedCatId]);

  const openDrawer = (mode: 'add' | 'edit', cat?: CategoryItem) => {
    setDrawerMode(mode);
    setFormTouched(false);
    if (mode === 'add') {
      setFormName('');
      setFormCode('');
      setFormDesc('');
      setFormCommissionApply(false);
      setFormCreditApply(false);
      setSelectedCatId('');
    } else if (cat) {
      setSelectedCatId(cat.id);
      setFormName(cat.name);
      setFormCode(cat.code);
      setFormDesc(cat.description);
      setFormCommissionApply(cat.commissionApply);
      setFormCreditApply(cat.creditApply);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSaveCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormTouched(true);

    if (!formName.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Category Name is required.',
        type: 'error',
      });
      return;
    }

    if (!formCode.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Short Name / Code is required.',
        type: 'error',
      });
      return;
    }

    if (drawerMode === 'add') {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDesc.trim(),
        commissionApply: formCommissionApply,
        creditApply: formCreditApply,
        linkedSourcesCount: 0,
        mappedSources: [],
        status: 'active',
      };
      setCategories((prev) => [newCat, ...prev]);
      addToast({
        title: 'Category Created',
        message: `Category '${newCat.name}' has been added successfully.`,
        type: 'success',
      });
    } else {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCatId
            ? {
                ...c,
                name: formName.trim(),
                code: formCode.trim().toUpperCase(),
                description: formDesc.trim(),
                commissionApply: formCommissionApply,
                creditApply: formCreditApply,
              }
            : c
        )
      );
      addToast({
        title: 'Category Saved',
        message: `Category '${formName}' updated successfully.`,
        type: 'success',
      });
    }

    closeDrawer();
  };

  const handleDeleteClick = (cat: CategoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cat.linkedSourcesCount > 0) {
      setBlockedModalCategory(cat);
    } else {
      setCategoryToDelete(cat);
    }
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    addToast({
      title: 'Category Removed',
      message: `Category '${categoryToDelete.name}' was deleted successfully.`,
      type: 'success',
    });
    setCategoryToDelete(null);
    if (selectedCatId === categoryToDelete.id) {
      closeDrawer();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Category Name', 'Short Code', 'Description', 'Commission Apply', 'Credit Apply', 'Linked Sources'];
    const rows = filteredCategories.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.code}"`,
      `"${c.description.replace(/"/g, '""')}"`,
      c.commissionApply ? 'Yes' : 'No',
      c.creditApply ? 'Yes' : 'No',
      c.linkedSourcesCount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Categories_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      title: 'Export Generated',
      message: `Downloaded ${filteredCategories.length} category records as CSV.`,
      type: 'info',
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Subtle Header Aura */}
      <div className="relative w-full px-lg py-md">
        <div className="absolute -top-12 right-24 w-96 h-96 bg-[#4472C4]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between gap-md mb-xs">
          <div className="flex items-center gap-xs font-label-uppercase text-label-uppercase text-on-surface-variant tracking-wider">
            <span onClick={() => navigate('dashboard')} className="hover:text-on-surface cursor-pointer transition-colors">
              Configuration
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span onClick={() => onNavigateToTab?.('business-source')} className="hover:text-on-surface cursor-pointer transition-colors">
              Business Sources
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#4472C4] font-semibold">Category</span>
          </div>

          <div className="flex items-center gap-sm">
            <span className="inline-flex items-center gap-xs px-sm py-xs rounded bg-surface-container text-on-surface-variant font-label-uppercase text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#4472C4] animate-pulse" />
              Master Ledger v4.12
            </span>
          </div>
        </div>

        {/* Page Title & Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Category Configuration
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-xs">
              Define and manage category classifications, commission applicability, and credit terms across business channels and operational folios.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => openDrawer('add')}
            className="flex items-center gap-xs bg-[#4472C4] hover:bg-[#3b63ab] text-white px-md py-sm rounded-lg font-label-uppercase text-label-uppercase transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Category
          </button>
        </div>

        {/* Top KPI Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
          {/* KPI 1 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Total Categories</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">category</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface font-bold">{totalCategories}</span>
              <span className="font-label-uppercase text-[11px] text-[#4472C4] font-semibold bg-[#4472C4]/10 px-xs py-0.5 rounded">
                100% Active
              </span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Commission Eligible</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">percent</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface font-bold">{commissionEligibleCount}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-data-mono">
                {((commissionEligibleCount / Math.max(1, totalCategories)) * 100).toFixed(1)}% applied
              </span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Credit Terms Active</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[#059669]">
                <span className="material-symbols-outlined text-[20px]">credit_score</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface font-bold">{creditActiveCount}</span>
              <span className="font-body-sm text-body-sm text-[#059669] font-data-mono font-medium">Direct Bill Allowed</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Linked Business Sources</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface font-bold">{totalLinkedSources}</span>
              <span className="font-label-uppercase text-[11px] text-on-surface-variant bg-surface-container px-xs py-0.5 rounded font-medium">
                Active Channels
              </span>
            </div>
          </div>
        </div>

        {/* Table Filters Bar */}
        <div className="bg-surface-container-lowest p-sm rounded-xl shadow-sm mb-md flex flex-wrap items-center justify-between gap-sm border border-outline-variant/30">
          <div className="flex items-center gap-sm flex-1 min-w-[280px]">
            <div className="relative flex items-center w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-sm text-[18px] text-on-surface-variant">search</span>
              <input
                className="w-full pl-xl pr-md py-xs bg-surface-container rounded-lg font-body-sm text-body-sm outline-none text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-[#4472C4]/20"
                placeholder="Filter by category or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-sm text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Select: Commission */}
            <select
              className="bg-surface-container text-on-surface font-body-sm text-body-sm px-sm py-xs rounded-lg outline-none cursor-pointer border border-transparent focus:border-[#4472C4]"
              value={commissionFilter}
              onChange={(e) => setCommissionFilter(e.target.value as any)}
            >
              <option value="all">Commission: All</option>
              <option value="enabled">Commissionable Only</option>
              <option value="disabled">Non-Commissionable</option>
            </select>

            {/* Filter Select: Credit */}
            <select
              className="bg-surface-container text-on-surface font-body-sm text-body-sm px-sm py-xs rounded-lg outline-none cursor-pointer border border-transparent focus:border-[#4472C4]"
              value={creditFilter}
              onChange={(e) => setCreditFilter(e.target.value as any)}
            >
              <option value="all">Credit: All</option>
              <option value="enabled">Credit Approved Only</option>
              <option value="disabled">Credit Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-xs">
            <button
              onClick={handleExportCSV}
              className="px-sm py-xs rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center gap-xs font-label-uppercase text-[11px] cursor-pointer transition-colors"
              title="Export Records to CSV"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              CSV Export
            </button>
          </div>
        </div>

        {/* Master Table Canvas */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-[11px] tracking-wider uppercase border-b border-outline-variant/30">
                  <th className="py-sm px-md font-semibold">Category Name</th>
                  <th className="py-sm px-md font-semibold">Short Code</th>
                  <th className="py-sm px-md font-semibold">Description & Accounting Notes</th>
                  <th className="py-sm px-md font-semibold">Commission Apply</th>
                  <th className="py-sm px-md font-semibold">Credit Apply</th>
                  <th className="py-sm px-md font-semibold">Linked Sources</th>
                  <th className="py-sm px-md font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container/60">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
                        <span className="font-semibold text-body-md">No categories match your filter criteria.</span>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setCommissionFilter('all');
                            setCreditFilter('all');
                          }}
                          className="mt-xs text-[12px] text-[#4472C4] font-semibold hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = isDrawerOpen && selectedCatId === cat.id;
                    const badgeInitials = cat.code.slice(0, 2);

                    return (
                      <tr
                        key={cat.id}
                        onClick={() => openDrawer('edit', cat)}
                        className={`hover:bg-surface-container/60 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#4472C4]/10' : ''
                        }`}
                      >
                        <td className="py-sm px-md">
                          <div className="flex items-center gap-sm">
                            <div className="w-7 h-7 rounded bg-[#4472C4]/10 flex items-center justify-center text-[#4472C4] font-semibold text-[11px]">
                              {badgeInitials}
                            </div>
                            <span className="font-semibold text-on-surface group-hover:text-[#4472C4] transition-colors">
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-sm px-md">
                          <span className="font-data-mono text-data-mono font-medium text-on-surface-variant bg-surface-container px-xs py-0.5 rounded">
                            {cat.code}
                          </span>
                        </td>
                        <td
                          className="py-sm px-md text-on-surface-variant max-w-xs truncate"
                          title={cat.description}
                        >
                          {cat.description || '—'}
                        </td>
                        <td className="py-sm px-md">
                          {cat.commissionApply ? (
                            <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-[#4472C4]/15 text-[#4472C4] font-label-uppercase text-[10px] font-semibold">
                              <span className="material-symbols-outlined text-[13px]">percent</span>
                              Commissionable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-uppercase text-[10px]">
                              <span className="material-symbols-outlined text-[13px]">remove</span>
                              Non-Comm
                            </span>
                          )}
                        </td>
                        <td className="py-sm px-md">
                          {cat.creditApply ? (
                            <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-[#059669]/15 text-[#059669] font-label-uppercase text-[10px] font-semibold">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              Direct Bill Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-uppercase text-[10px]">
                              <span className="material-symbols-outlined text-[13px]">block</span>
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-sm px-md">
                          <span
                            className={`inline-flex items-center gap-xs font-data-mono text-body-sm font-medium ${
                              cat.linkedSourcesCount > 0 ? 'text-[#4472C4]' : 'text-on-surface-variant'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.linkedSourcesCount > 0 ? 'bg-[#4472C4]' : 'bg-outline-variant'
                              }`}
                            />
                            {cat.linkedSourcesCount} Sources
                          </span>
                        </td>
                        <td className="py-sm px-md text-right">
                          <div
                            className="flex items-center justify-end gap-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openDrawer('edit', cat)}
                              className="p-xs rounded hover:bg-surface-container text-on-surface-variant hover:text-[#4472C4] transition-colors"
                              title="Edit Category"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(cat, e)}
                              className="p-xs rounded hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
                              title={
                                cat.linkedSourcesCount > 0
                                  ? 'Protected: Mapped sources exist'
                                  : 'Delete Category'
                              }
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Note */}
          <div className="px-md py-sm bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-xs text-on-surface-variant font-body-sm text-[12px] border-t border-outline-variant/30">
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-[#4472C4]">verified_user</span>
              All category edits synchronize automatically to Property Management reservation folios.
            </span>
            <span className="font-data-mono">
              Showing {filteredCategories.length} of {totalCategories} Master Categories
            </span>
          </div>
        </div>
      </div>

      {/* PATTERN B: Slide-Over Contextual Add / Edit Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs transition-opacity duration-200"
            onClick={closeDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-[480px] bg-surface-container-lowest shadow-2xl flex flex-col justify-between z-10 h-full border-l border-outline-variant/40 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-lg py-md bg-surface-container-low flex items-center justify-between border-b border-outline-variant/30">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-[#4472C4] tracking-wider uppercase font-semibold">
                  {drawerMode === 'add' ? 'New Entry' : 'Configuration Master'}
                </span>
                <h2 className="font-title-sm text-title-sm text-on-surface font-semibold truncate max-w-[340px]">
                  {drawerMode === 'add'
                    ? 'Add Master Category'
                    : `Edit Category — ${activeCategory?.name || formName || 'Category'}`}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body (Scrollable Form Canvas) */}
            <div className="flex-1 overflow-y-auto px-lg py-md space-y-md">
              {/* Contextual Rule Alert */}
              <div className="bg-[#4472C4]/10 p-sm rounded-lg flex items-start gap-sm border border-[#4472C4]/20">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px] mt-0.5">info</span>
                <div className="text-[12px] text-on-surface leading-relaxed">
                  <span className="font-semibold text-[#4472C4]">Operational Rule:</span> Commission and Credit rules configured here automatically govern payment processing and folio settlement for all linked business sources.
                </div>
              </div>

              {/* Referential Safeguard Banner (Visible on categories with linked channels) */}
              {drawerMode === 'edit' && activeCategory && activeCategory.linkedSourcesCount > 0 && (
                <div className="bg-surface-container p-sm rounded-lg flex items-start gap-sm border border-outline-variant/40">
                  <span className="material-symbols-outlined text-outline text-[20px] mt-0.5">lock</span>
                  <div className="text-[12px] text-on-surface-variant leading-relaxed">
                    <span className="font-semibold text-on-surface">Integrity Safeguard Active:</span> Cannot delete this category while <strong className="text-on-surface">{activeCategory.linkedSourcesCount} active Business Sources</strong> (e.g., Booking.com, Expedia) are mapped.
                  </div>
                </div>
              )}

              {/* Form Elements */}
              <form onSubmit={handleSaveCategory} className="space-y-md">
                {/* 1. Category Name */}
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                      Category Name <span className="text-error">*</span>
                    </label>
                    {formName.trim() ? (
                      <span className="text-[11px] font-label-uppercase text-[#4472C4] flex items-center gap-0.5 font-semibold">
                        <span className="material-symbols-outlined text-[13px]">check</span> Valid
                      </span>
                    ) : (
                      formTouched && (
                        <span className="text-[11px] font-label-uppercase text-error flex items-center gap-0.5">
                          Required
                        </span>
                      )
                    )}
                  </div>
                  <input
                    className="w-full px-sm py-xs bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#4472C4]/20 border border-outline-variant/40 transition-all"
                    placeholder="e.g. Corporate Direct, Online Travel Agencies"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    type="text"
                  />
                  <span className="text-[11px] text-on-surface-variant font-body-sm">
                    Display name appearing in front desk folios and revenue reports.
                  </span>
                </div>

                {/* 2. Short Name */}
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                      Short Name / Code <span className="text-error">*</span>
                    </label>
                    <span className="font-data-mono text-[11px] text-on-surface-variant">Uppercase code (2-10 chars)</span>
                  </div>
                  <input
                    className="w-full max-w-[160px] px-sm py-xs bg-surface-container-low rounded-lg font-data-mono text-data-mono uppercase text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#4472C4]/20 border border-outline-variant/40 transition-all font-semibold"
                    placeholder="e.g. OTA, CORP"
                    maxLength={10}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    required
                    type="text"
                  />
                  <span className="text-[11px] text-on-surface-variant font-body-sm">
                    Unique system key for audit logs and batch transaction exports.
                  </span>
                </div>

                {/* 3. Description */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    Description & Operational Notes
                  </label>
                  <textarea
                    className="w-full px-sm py-xs bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#4472C4]/20 border border-outline-variant/40 transition-all"
                    rows={3}
                    placeholder="Special accounting notes, reconciliation caveats, or rate package instructions..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                {/* 4. Commission Apply Toggle Switch */}
                <div className="p-sm rounded-lg bg-surface-container-low flex items-start justify-between gap-sm border border-outline-variant/30">
                  <div className="flex flex-col">
                    <span className="font-label-uppercase text-label-uppercase text-on-surface font-semibold flex items-center gap-xs">
                      Commission Apply
                      <span className="material-symbols-outlined text-[16px] text-[#4472C4]">percent</span>
                    </span>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      Enables commission ledger tracking and agent settlement for reservations under this category.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formCommissionApply}
                      onChange={(e) => setFormCommissionApply(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4472C4]" />
                  </label>
                </div>

                {/* 5. Credit Apply Toggle Switch */}
                <div className="p-sm rounded-lg bg-surface-container-low flex items-start justify-between gap-sm border border-outline-variant/30">
                  <div className="flex flex-col">
                    <span className="font-label-uppercase text-label-uppercase text-on-surface font-semibold flex items-center gap-xs">
                      Credit Apply
                      <span className="material-symbols-outlined text-[16px] text-[#4472C4]">account_balance_wallet</span>
                    </span>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      Allows city ledger AR billing and delayed payment terms for business accounts.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formCreditApply}
                      onChange={(e) => setFormCreditApply(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4472C4]" />
                  </label>
                </div>
              </form>

              {/* Linked Business Channels Preview (Rich contextual micro-table) */}
              {drawerMode === 'edit' && activeCategory && activeCategory.mappedSources.length > 0 && (
                <div className="mt-md pt-md border-t border-outline-variant/30">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">
                      Mapped Business Channels (Sample)
                    </span>
                    <button
                      onClick={() => {
                        closeDrawer();
                        onNavigateToTab?.('business-source');
                      }}
                      className="text-[11px] font-data-mono text-[#4472C4] hover:underline cursor-pointer"
                    >
                      View in Master →
                    </button>
                  </div>
                  <div className="space-y-xs">
                    {activeCategory.mappedSources.map((src) => (
                      <div
                        key={src.id}
                        className="flex items-center justify-between p-xs bg-surface-container rounded font-body-sm text-[12px]"
                      >
                        <span className="font-medium text-on-surface">{src.name}</span>
                        <span className="font-data-mono text-on-surface-variant">{src.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Action Bar */}
            <div className="px-lg py-md bg-surface-container-low flex items-center justify-end gap-sm border-t border-outline-variant/30">
              <button
                onClick={closeDrawer}
                className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase transition-all cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-md py-sm rounded-lg bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase transition-all shadow-sm active:scale-95 flex items-center gap-xs cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-xs p-md">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-xl p-lg flex flex-col gap-md border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Delete Category '{categoryToDelete.name}'?
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  This category has 0 active linked sources. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-sm pt-xs">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-md py-sm rounded-lg bg-error hover:bg-error/90 text-white font-label-uppercase text-label-uppercase transition-all shadow-sm cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referential Integrity Blocked Modal */}
      {blockedModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-xs p-md">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-xl p-lg flex flex-col gap-md border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Deletion Safeguard Triggered
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  Cannot delete category <strong>{blockedModalCategory.name}</strong> while{' '}
                  <strong>{blockedModalCategory.linkedSourcesCount} active Business Sources</strong> are mapped to it. Reassign or remove linked sources before deleting.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-sm pt-xs">
              <button
                onClick={() => setBlockedModalCategory(null)}
                className="px-md py-sm rounded-lg bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase transition-all shadow-sm cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
