import React, { useState, useRef, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { OtherChargeItem } from '@/src/types';

export const OtherChargesView: React.FC = () => {
  const {
    otherCharges,
    otherChargeCategories,
    editingOtherChargeId,
    setEditingOtherChargeId,
    openAddOtherChargeDrawer,
    openEditOtherChargeDrawer,
    openDeleteOtherChargeDialog,
    addOtherCharge,
    navigate,
    addToast,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [filterRule, setFilterRule] = useState<'all' | 'taxable' | 'always' | 'reoccur' | 'crs' | 'pos'>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter charges
  const filteredCharges = otherCharges.filter((charge) => {
    const matchesSearch =
      charge.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      charge.shortName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      charge.category.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesCategory =
      selectedCategoryFilter === 'all' || charge.category === selectedCategoryFilter;

    let matchesRule = true;
    if (filterRule === 'taxable') matchesRule = charge.taxable;
    else if (filterRule === 'always') matchesRule = charge.alwaysCharge;
    else if (filterRule === 'reoccur') matchesRule = charge.reoccur;
    else if (filterRule === 'crs') matchesRule = charge.crsCharge;
    else if (filterRule === 'pos') matchesRule = charge.posCharge;

    return matchesSearch && matchesCategory && matchesRule;
  });

  const totalPages = Math.ceil(filteredCharges.length / itemsPerPage) || 1;
  const paginatedCharges = filteredCharges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDuplicate = (charge: OtherChargeItem) => {
    const duplicatedData = {
      shortName: `${charge.shortName.slice(0, 7)}-C`,
      name: `${charge.name} (Copy)`,
      category: charge.category,
      price: charge.price,
      taxable: charge.taxable,
      alwaysCharge: charge.alwaysCharge,
      reoccur: charge.reoccur,
      reoccurFrequency: charge.reoccurFrequency,
      crsCharge: charge.crsCharge,
      callLoggingCharge: charge.callLoggingCharge,
      posCharge: charge.posCharge,
      forecastingRevenue: charge.forecastingRevenue,
      description: charge.description,
    };
    addOtherCharge(duplicatedData);
    setActiveMenuId(null);
  };

  return (
    <div className="flex flex-col w-full h-full relative overflow-hidden text-[#191c1e] p-6 lg:p-8 gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#191c1e] leading-tight">
            Other Charges
          </h1>
          <p className="text-[14px] text-[#45464d] mt-1">
            Manage ancillary revenues, POS items, and recurring fees.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Quick link to Other Charges Categories */}
          <button
            onClick={() => navigate('other-charges-categories')}
            className="px-3.5 py-2 rounded text-[13px] font-medium text-[#45464d] hover:text-[#191c1e] bg-[#f2f4f6] hover:bg-[#e6e8ea] border border-[#c6c6cd]/50 transition-colors flex items-center gap-1.5"
            title="Manage Categories"
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            <span>Categories</span>
          </button>

          {/* Add Charge Button */}
          <button
            id="btn-add-charge"
            onClick={() => {
              setEditingOtherChargeId(null);
              navigate('add-other-charge');
            }}
            className="bg-[#000000] text-white text-[14px] font-medium px-4 py-2 rounded shadow-sm hover:bg-[#1a1a1a] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Charge
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white shadow-sm rounded-lg border border-[#e0e3e5] overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Search & Filter Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-[#e6e8ea] bg-[#f7f9fb] sticky top-0 z-10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search charges..."
              className="w-full bg-[#eceef0] rounded-full py-2 pl-10 pr-4 text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] placeholder:text-[#45464d]/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filter Trigger & Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                selectedCategoryFilter !== 'all' || filterRule !== 'all'
                  ? 'bg-[#0058be] text-white'
                  : 'bg-[#eceef0] text-[#45464d] hover:bg-[#e0e3e5]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Filter</span>
              {(selectedCategoryFilter !== 'all' || filterRule !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-white ml-0.5" />
              )}
            </button>

            {/* Filter Dropdown */}
            {isFilterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-[#c6c6cd]/60 p-4 z-30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                  <span className="text-[12px] font-semibold uppercase text-[#191c1e] tracking-wider">
                    Filter Charges
                  </span>
                  {(selectedCategoryFilter !== 'all' || filterRule !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter('all');
                        setFilterRule('all');
                        setCurrentPage(1);
                      }}
                      className="text-[11px] text-[#0058be] font-medium hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => {
                      setSelectedCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#f2f4f6] border border-[#c6c6cd] rounded px-3 py-1.5 text-[13px] text-[#191c1e] focus:outline-none focus:border-[#0058be]"
                  >
                    <option value="all">All Categories</option>
                    {otherChargeCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="Fees & Surcharges">Fees & Surcharges</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Spa & Wellness">Spa & Wellness</option>
                  </select>
                </div>

                {/* Rule Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1.5">
                    Feature / Rule
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'all', label: 'All Rules' },
                      { id: 'taxable', label: 'Taxable' },
                      { id: 'always', label: 'Always' },
                      { id: 'recur', label: 'Reoccur' },
                      { id: 'crs', label: 'CRS' },
                      { id: 'pos', label: 'POS' },
                    ].map((rule) => (
                      <button
                        key={rule.id}
                        onClick={() => {
                          setFilterRule(rule.id as any);
                          setCurrentPage(1);
                        }}
                        className={`px-2.5 py-1.5 rounded text-[11px] font-medium border text-left transition-colors ${
                          filterRule === rule.id
                            ? 'bg-[#0058be] text-white border-[#0058be]'
                            : 'bg-[#f7f9fb] text-[#45464d] border-[#c6c6cd]/50 hover:bg-[#eceef0]'
                        }`}
                      >
                        {rule.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charges Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead className="bg-[#f2f4f6] sticky top-0 z-10 shadow-[0_1px_0_0_#e0e3e5]">
              <tr>
                <th className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
                  Short Name
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  Charge Name
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  Category
                </th>
                <th
                  className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center"
                  title="Taxable"
                >
                  Tax
                </th>
                <th
                  className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center"
                  title="Always Charge"
                >
                  Always
                </th>
                <th
                  className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center"
                  title="Reoccur"
                >
                  Recur
                </th>
                <th
                  className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center"
                  title="CRS"
                >
                  CRS
                </th>
                <th
                  className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center"
                  title="POS"
                >
                  POS
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-right w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-[14px] divide-y divide-[#eceef0]">
              {paginatedCharges.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#76777d]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-[#c6c6cd]">
                        receipt_long
                      </span>
                      <p className="text-[15px] font-medium text-[#191c1e]">No charges found</p>
                      <p className="text-[13px] text-[#45464d]">
                        {searchQuery || selectedCategoryFilter !== 'all' || filterRule !== 'all'
                          ? 'Try adjusting your search or filter options.'
                          : 'Get started by creating your first auxiliary charge.'}
                      </p>
                      {searchQuery || selectedCategoryFilter !== 'all' || filterRule !== 'all' ? (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategoryFilter('all');
                            setFilterRule('all');
                          }}
                          className="mt-2 text-[12px] text-[#0058be] font-medium hover:underline"
                        >
                          Clear filters
                        </button>
                      ) : (
                        <button
                          onClick={openAddOtherChargeDrawer}
                          className="mt-2 px-3.5 py-1.5 rounded text-[13px] bg-[#0058be] text-white font-medium hover:bg-[#004395] transition-colors"
                        >
                          Add New Charge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCharges.map((charge) => (
                  <tr
                    key={charge.id}
                    className="hover:bg-[#f7f9fb] group transition-colors shadow-[0_1px_0_0_#eceef0]"
                  >
                    {/* Short Name */}
                    <td className="px-4 py-3 font-mono text-[13px] text-[#0058be] font-semibold whitespace-nowrap">
                      {charge.shortName}
                    </td>

                    {/* Charge Name */}
                    <td className="px-4 py-3 font-medium text-[#191c1e]">
                      <div className="flex items-center gap-2">
                        <span>{charge.name}</span>
                        {charge.price !== undefined && (
                          <span className="text-[12px] font-normal text-[#76777d] bg-[#eceef0] px-1.5 py-0.5 rounded">
                            ${charge.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {charge.description && (
                        <div className="text-[11px] text-[#76777d] font-normal line-clamp-1 mt-0.5">
                          {charge.description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-[#45464d] text-[13px] whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] bg-[#f2f4f6] text-[#45464d] border border-[#e0e3e5]">
                        {charge.category}
                      </span>
                    </td>

                    {/* Taxable */}
                    <td className="px-4 py-3 text-center">
                      {charge.taxable ? (
                        <span
                          className="material-symbols-outlined text-[#0058be] text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Taxable: Yes"
                        >
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c6c6cd] text-[20px]" title="Taxable: No">
                          cancel
                        </span>
                      )}
                    </td>

                    {/* Always Charge */}
                    <td className="px-4 py-3 text-center">
                      {charge.alwaysCharge ? (
                        <span
                          className="material-symbols-outlined text-[#0058be] text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Always Charge: Yes"
                        >
                          check_circle
                        </span>
                      ) : (
                        <span
                          className="material-symbols-outlined text-[#c6c6cd] text-[20px]"
                          title="Always Charge: No"
                        >
                          cancel
                        </span>
                      )}
                    </td>

                    {/* Reoccur */}
                    <td className="px-4 py-3 text-center">
                      {charge.reoccur ? (
                        <span
                          className="material-symbols-outlined text-[#0058be] text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title={`Reoccur: Yes (${charge.reoccurFrequency || 'Daily'})`}
                        >
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c6c6cd] text-[20px]" title="Reoccur: No">
                          cancel
                        </span>
                      )}
                    </td>

                    {/* CRS */}
                    <td className="px-4 py-3 text-center">
                      {charge.crsCharge ? (
                        <span
                          className="material-symbols-outlined text-[#0058be] text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="CRS Charge: Yes"
                        >
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c6c6cd] text-[20px]" title="CRS Charge: No">
                          cancel
                        </span>
                      )}
                    </td>

                    {/* POS */}
                    <td className="px-4 py-3 text-center">
                      {charge.posCharge ? (
                        <span
                          className="material-symbols-outlined text-[#0058be] text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="POS Charge: Yes"
                        >
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c6c6cd] text-[20px]" title="POS Charge: No">
                          cancel
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 relative">
                        {/* Quick Edit Icon */}
                        <button
                          onClick={() => {
                            setEditingOtherChargeId(charge.id);
                            navigate('edit-other-charge');
                          }}
                          className="p-1 text-[#45464d] hover:text-[#0058be] opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[#eceef0] cursor-pointer"
                          title="Edit charge"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>

                        {/* More Options Button */}
                        <div className="relative" ref={activeMenuId === charge.id ? actionMenuRef : null}>
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === charge.id ? null : charge.id)
                            }
                            className="p-1 text-[#76777d] hover:text-[#191c1e] rounded hover:bg-[#eceef0] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>

                          {/* Action Popover Menu */}
                          {activeMenuId === charge.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-md shadow-lg border border-[#c6c6cd]/50 py-1 z-30 animate-in fade-in duration-100">
                              <button
                                onClick={() => {
                                  setEditingOtherChargeId(charge.id);
                                  navigate('edit-other-charge');
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#191c1e] hover:bg-[#f2f4f6] flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#0058be]">
                                  edit
                                </span>
                                Edit Charge
                              </button>

                              <button
                                onClick={() => handleDuplicate(charge)}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#191c1e] hover:bg-[#f2f4f6] flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                                  content_copy
                                </span>
                                Duplicate
                              </button>

                              <div className="my-1 border-t border-[#eceef0]" />

                              <button
                                onClick={() => {
                                  openDeleteOtherChargeDialog(charge);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-3 border-t border-[#e6e8ea] bg-[#f7f9fb] flex items-center justify-between text-[13px] text-[#45464d]">
          <span>
            Showing{' '}
            {filteredCharges.length > 0
              ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  filteredCharges.length
                )}`
              : '0'}{' '}
            of {filteredCharges.length} charges
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-[#eceef0] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <span className="text-[12px] font-medium px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-[#eceef0] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
