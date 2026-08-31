import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { RateTypeItem } from '../types';

export const RateTypesView: React.FC = () => {
  const {
    rateTypes,
    addRateType,
    updateRateType,
    deleteRateType,
    isRateTypeDrawerOpen,
    drawerRateType,
    openAddRateTypeDrawer,
    openEditRateTypeDrawer,
    closeRateTypeDrawer,
    isDeleteRateTypeDialogOpen,
    deleteTargetRateType,
    openDeleteRateTypeDialog,
    closeDeleteRateTypeDialog,
    navigate,
    addToast,
  } = useProperty();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filterHourly, setFilterHourly] = useState<'all' | 'hourly' | 'daily'>('all');
  const [filterCrs, setFilterCrs] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    shortName: true,
    name: true,
    description: true,
    bindPercentage: true,
    isHourly: true,
    isCrsTaxInclusive: true,
    isCrsEnabled: true,
  });

  // Drawer Form State
  const [formData, setFormData] = useState({
    shortName: '',
    name: '',
    description: '',
    bindPercentage: 0,
    isHourly: false,
    isCrsTaxInclusive: true,
    isCrsEnabled: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Sync drawer form state when drawer opens or changes
  React.useEffect(() => {
    if (isRateTypeDrawerOpen) {
      if (drawerRateType) {
        setFormData({
          shortName: drawerRateType.shortName,
          name: drawerRateType.name,
          description: drawerRateType.description,
          bindPercentage: drawerRateType.bindPercentage,
          isHourly: drawerRateType.isHourly,
          isCrsTaxInclusive: drawerRateType.isCrsTaxInclusive,
          isCrsEnabled: drawerRateType.isCrsEnabled,
        });
      } else {
        setFormData({
          shortName: '',
          name: '',
          description: '',
          bindPercentage: 0.0,
          isHourly: false,
          isCrsTaxInclusive: true,
          isCrsEnabled: true,
        });
      }
      setFormErrors({});
    }
  }, [isRateTypeDrawerOpen, drawerRateType]);

  // Filtered List
  const filteredRateTypes = useMemo(() => {
    return rateTypes.filter((rt) => {
      const matchesSearch =
        rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rt.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rt.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHourly =
        filterHourly === 'all'
          ? true
          : filterHourly === 'hourly'
          ? rt.isHourly
          : !rt.isHourly;

      const matchesCrs =
        filterCrs === 'all'
          ? true
          : filterCrs === 'enabled'
          ? rt.isCrsEnabled
          : !rt.isCrsEnabled;

      return matchesSearch && matchesHourly && matchesCrs;
    });
  }, [rateTypes, searchQuery, filterHourly, filterCrs]);

  const handleSaveRateType = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.shortName.trim()) {
      errors.shortName = 'Short Name is required';
    } else if (formData.shortName.trim().length > 8) {
      errors.shortName = 'Short Name must be 8 characters or fewer';
    }

    if (!formData.name.trim()) {
      errors.name = 'Rate Type Name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please correct the highlighted form errors', 'error');
      return;
    }

    if (drawerRateType) {
      updateRateType(drawerRateType.id, {
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        bindPercentage: Number(formData.bindPercentage) || 0,
        isHourly: formData.isHourly,
        isCrsTaxInclusive: formData.isCrsTaxInclusive,
        isCrsEnabled: formData.isCrsEnabled,
      });
    } else {
      addRateType({
        shortName: formData.shortName.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        bindPercentage: Number(formData.bindPercentage) || 0,
        isHourly: formData.isHourly,
        isCrsTaxInclusive: formData.isCrsTaxInclusive,
        isCrsEnabled: formData.isCrsEnabled,
      });
    }

    closeRateTypeDrawer();
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen relative overflow-hidden bg-[#f7f9fb]">
      {/* Header Section */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-end justify-between bg-white z-10 shadow-xs relative border-b border-[#e0e3e5]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <svg
            className="absolute inset-0 mix-blend-soft-light text-black/5"
            height="100%"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern height="40" id="rate-types-grid" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#rate-types-grid)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <nav className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wider uppercase text-[#75859d]">
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span
              onClick={() => navigate('rates-packages')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Rates & Packages
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#000000] font-bold">Rate Types</span>
          </nav>
          <div>
            <h1 className="text-[28px] font-bold text-[#191c1e] m-0 tracking-tight leading-tight">
              Rate Types
            </h1>
            <p className="text-[14px] text-[#45464d] mt-1 max-w-2xl">
              Manage standard and derived rate types used across the property. Configure pricing
              structures, binding rules, and CRS synchronization.
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 relative z-10">
          <button
            id="open-drawer-btn"
            onClick={openAddRateTypeDrawer}
            className="relative flex items-center gap-2 bg-[#000000] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide shadow-md hover:bg-[#2d3133] active:scale-[0.98] transition-all group overflow-hidden cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px] transition-transform group-hover:rotate-90">
              add
            </span>
            <span>Add Rate Type</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none rounded-lg" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 p-6 md:p-8 flex flex-col relative z-0">
        <div className="absolute -right-32 top-10 w-96 h-96 bg-[#2170e4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] flex flex-col flex-1 overflow-hidden relative z-10">
          {/* Table Controls */}
          <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#e0e3e5] z-20">
            <div className="relative flex items-center w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter rate types..."
                className="bg-[#f2f4f6] w-full pl-10 pr-4 py-2 rounded-lg text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#2170e4] placeholder:text-[#75859d]/60 transition-all border border-transparent focus:border-[#2170e4] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#75859d] hover:text-[#191c1e] text-[16px] material-symbols-outlined"
                >
                  close
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsFilterMenuOpen(!isFilterMenuOpen);
                    setIsColumnsMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-[12px] font-semibold tracking-wider uppercase cursor-pointer ${
                    filterHourly !== 'all' || filterCrs !== 'all'
                      ? 'bg-[#2170e4] text-white shadow-xs'
                      : 'text-[#45464d] hover:bg-[#e6e8ea]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  <span>Filter</span>
                  {(filterHourly !== 'all' || filterCrs !== 'all') && (
                    <span className="w-2 h-2 rounded-full bg-white ml-0.5" />
                  )}
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-xl border border-[#e0e3e5] p-3 z-30 space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center pb-2 border-b border-[#e0e3e5]">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[#191c1e]">
                        Filter Rates
                      </span>
                      <button
                        onClick={() => {
                          setFilterHourly('all');
                          setFilterCrs('all');
                        }}
                        className="text-[11px] text-[#0058be] hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase text-[#75859d] block mb-1">
                        Billing Basis
                      </label>
                      <select
                        value={filterHourly}
                        onChange={(e) =>
                          setFilterHourly(e.target.value as 'all' | 'hourly' | 'daily')
                        }
                        className="w-full bg-[#f2f4f6] text-[13px] border border-[#c6c6cd] rounded-lg px-2.5 py-1.5 text-[#191c1e] outline-none"
                      >
                        <option value="all">All (Hourly & Daily)</option>
                        <option value="daily">Daily Rates only</option>
                        <option value="hourly">Hourly Rates only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase text-[#75859d] block mb-1">
                        CRS Channel Sync
                      </label>
                      <select
                        value={filterCrs}
                        onChange={(e) =>
                          setFilterCrs(e.target.value as 'all' | 'enabled' | 'disabled')
                        }
                        className="w-full bg-[#f2f4f6] text-[13px] border border-[#c6c6cd] rounded-lg px-2.5 py-1.5 text-[#191c1e] outline-none"
                      >
                        <option value="all">All Sync States</option>
                        <option value="enabled">CRS Enabled</option>
                        <option value="disabled">CRS Disabled</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Columns Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsColumnsMenuOpen(!isColumnsMenuOpen);
                    setIsFilterMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[#45464d] hover:bg-[#e6e8ea] rounded-md transition-colors text-[12px] font-semibold tracking-wider uppercase cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">view_column</span>
                  <span>Columns</span>
                </button>

                {isColumnsMenuOpen && (
                  <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-xl border border-[#e0e3e5] p-3 z-30 space-y-2 animate-fadeIn">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#191c1e] block pb-1 border-b border-[#e0e3e5]">
                      Toggle Columns
                    </span>
                    <label className="flex items-center gap-2 text-[13px] text-[#191c1e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.shortName}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, shortName: e.target.checked })
                        }
                        className="rounded text-[#0058be]"
                      />
                      Short Name
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#191c1e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.description}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, description: e.target.checked })
                        }
                        className="rounded text-[#0058be]"
                      />
                      Description
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#191c1e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.bindPercentage}
                        onChange={(e) =>
                          setVisibleColumns({
                            ...visibleColumns,
                            bindPercentage: e.target.checked,
                          })
                        }
                        className="rounded text-[#0058be]"
                      />
                      Bind %
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#191c1e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.isHourly}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, isHourly: e.target.checked })
                        }
                        className="rounded text-[#0058be]"
                      />
                      Hourly
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#191c1e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.isCrsTaxInclusive}
                        onChange={(e) =>
                          setVisibleColumns({
                            ...visibleColumns,
                            isCrsTaxInclusive: e.target.checked,
                          })
                        }
                        className="rounded text-[#0058be]"
                      />
                      CRS Tax Inc.
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#191c1e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.isCrsEnabled}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, isCrsEnabled: e.target.checked })
                        }
                        className="rounded text-[#0058be]"
                      />
                      CRS Enable
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#eceef0]/90 backdrop-blur-md z-10 shadow-xs border-b border-[#e0e3e5]">
                <tr>
                  {visibleColumns.shortName && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap">
                      Short Name
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap">
                      Rate Type Name
                    </th>
                  )}
                  {visibleColumns.description && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] w-1/3">
                      Description
                    </th>
                  )}
                  {visibleColumns.bindPercentage && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap text-right">
                      Bind %
                    </th>
                  )}
                  {visibleColumns.isHourly && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap text-center">
                      Hourly
                    </th>
                  )}
                  {visibleColumns.isCrsTaxInclusive && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap text-center">
                      CRS Tax Inc.
                    </th>
                  )}
                  {visibleColumns.isCrsEnabled && (
                    <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap text-center">
                      CRS Enable
                    </th>
                  )}
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-[#45464d] whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#191c1e] divide-y divide-[#eceef0]">
                {filteredRateTypes.length > 0 ? (
                  filteredRateTypes.map((rt) => (
                    <tr
                      key={rt.id}
                      className="group hover:bg-[#f2f4f6] transition-colors cursor-default"
                    >
                      {/* Short Name */}
                      {visibleColumns.shortName && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-[12px] bg-[#eceef0] px-2 py-0.5 rounded text-[#45464d] font-semibold group-hover:bg-[#e0e3e5] transition-colors tracking-wider">
                            {rt.shortName}
                          </span>
                        </td>
                      )}

                      {/* Rate Type Name */}
                      {visibleColumns.name && (
                        <td className="py-3.5 px-4 font-semibold text-[14px] text-[#191c1e] whitespace-nowrap">
                          {rt.name}
                        </td>
                      )}

                      {/* Description */}
                      {visibleColumns.description && (
                        <td className="py-3.5 px-4 text-[#45464d]">
                          <span
                            className="truncate block max-w-xs text-[13px]"
                            title={rt.description}
                          >
                            {rt.description || '—'}
                          </span>
                        </td>
                      )}

                      {/* Bind % */}
                      {visibleColumns.bindPercentage && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-[13px]">
                          <span
                            className={`font-semibold ${
                              rt.bindPercentage < 0
                                ? 'text-[#ba1a1a]'
                                : rt.bindPercentage > 0
                                ? 'text-[#0058be]'
                                : 'text-[#45464d]'
                            }`}
                          >
                            {rt.bindPercentage > 0
                              ? `+${rt.bindPercentage.toFixed(2)}%`
                              : `${rt.bindPercentage.toFixed(2)}%`}
                          </span>
                        </td>
                      )}

                      {/* Hourly */}
                      {visibleColumns.isHourly && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {rt.isHourly ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2170e4]/10 text-[#0058be] material-symbols-outlined text-[16px]">
                              check
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e6e8ea] text-[#75859d] material-symbols-outlined text-[16px]">
                              close
                            </span>
                          )}
                        </td>
                      )}

                      {/* CRS Tax Inclusive */}
                      {visibleColumns.isCrsTaxInclusive && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {rt.isCrsTaxInclusive ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2170e4]/10 text-[#0058be] material-symbols-outlined text-[16px]">
                              check
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e6e8ea] text-[#75859d] material-symbols-outlined text-[16px]">
                              close
                            </span>
                          )}
                        </td>
                      )}

                      {/* CRS Enable */}
                      {visibleColumns.isCrsEnabled && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {rt.isCrsEnabled ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2170e4]/10 text-[#0058be] material-symbols-outlined text-[16px]">
                              check
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e6e8ea] text-[#75859d] material-symbols-outlined text-[16px]">
                              close
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Edit Rate Type"
                            onClick={() => openEditRateTypeDrawer(rt)}
                            className="text-[#0058be] hover:bg-[#2170e4]/10 p-1.5 rounded-lg transition-colors material-symbols-outlined text-[18px] cursor-pointer"
                          >
                            edit
                          </button>
                          <button
                            title="Delete Rate Type"
                            onClick={() => openDeleteRateTypeDialog(rt)}
                            className="text-[#75859d] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 p-1.5 rounded-lg transition-colors material-symbols-outlined text-[18px] cursor-pointer"
                          >
                            delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#75859d]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-[#75859d]/60">
                          search_off
                        </span>
                        <p className="text-[14px] font-medium text-[#191c1e]">
                          No rate types found
                        </p>
                        <p className="text-[12px] text-[#75859d]">
                          Try adjusting your search query or filter options.
                        </p>
                        <button
                          onClick={openAddRateTypeDrawer}
                          className="mt-2 px-3 py-1.5 bg-[#000000] text-white rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all cursor-pointer"
                        >
                          + Add New Rate Type
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-4 py-3 bg-white flex justify-between items-center border-t border-[#e0e3e5] text-[#75859d] text-[13px] z-20">
            <span>
              Showing 1 to {filteredRateTypes.length} of {rateTypes.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 rounded hover:bg-[#f2f4f6] material-symbols-outlined text-[20px] opacity-40 cursor-not-allowed"
              >
                chevron_left
              </button>
              <button
                disabled
                className="p-1 rounded hover:bg-[#f2f4f6] material-symbols-outlined text-[20px] opacity-40 cursor-not-allowed"
              >
                chevron_right
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer Backdrop Overlay */}
      {isRateTypeDrawerOpen && (
        <div
          id="drawer-overlay"
          onClick={closeRateTypeDrawer}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Side Drawer */}
      <div
        id="side-drawer"
        className={`fixed top-0 right-0 h-full w-[480px] max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isRateTypeDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-[#e0e3e5] z-10">
          <div>
            <h2 className="text-[20px] font-bold text-[#191c1e] m-0 leading-tight">
              {drawerRateType ? 'Edit Rate Type' : 'Add Rate Type'}
            </h2>
            <p className="text-[13px] text-[#75859d] mt-0.5">
              {drawerRateType
                ? `Update configuration for ${drawerRateType.name}`
                : 'Define a new pricing configuration'}
            </p>
          </div>
          <button
            id="close-drawer-btn"
            onClick={closeRateTypeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f4f6] text-[#75859d] hover:text-[#191c1e] transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f7f9fb]">
          <form id="rate-type-form" onSubmit={handleSaveRateType} className="flex flex-col gap-5">
            {/* Short Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="short-name"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Short Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="short-name"
                type="text"
                maxLength={8}
                value={formData.shortName}
                onChange={(e) =>
                  setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
                }
                placeholder="e.g. WKDY"
                className={`bg-white border rounded-lg px-3.5 py-2.5 font-mono text-[14px] text-[#191c1e] placeholder:text-[#75859d]/40 transition-all outline-none uppercase font-semibold ${
                  formErrors.shortName
                    ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
                    : 'border-[#c6c6cd] focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/20'
                }`}
              />
              {formErrors.shortName && (
                <span className="text-[12px] text-[#ba1a1a] font-medium">
                  {formErrors.shortName}
                </span>
              )}
            </div>

            {/* Rate Type Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rate-type-name"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Rate Type Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="rate-type-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Weekday Special"
                className={`bg-white border rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] placeholder:text-[#75859d]/40 transition-all outline-none ${
                  formErrors.name
                    ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
                    : 'border-[#c6c6cd] focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/20'
                }`}
              />
              {formErrors.name && (
                <span className="text-[12px] text-[#ba1a1a] font-medium">{formErrors.name}</span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-[12px] font-bold uppercase tracking-wider text-[#45464d]"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description..."
                className="bg-white border border-[#c6c6cd] focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/20 rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] placeholder:text-[#75859d]/40 transition-all outline-none resize-none"
              />
            </div>

            <hr className="border-[#e0e3e5] my-1" />

            {/* Bind With Rate */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-[#2170e4]/10 text-[#0058be] rounded material-symbols-outlined text-[18px]">
                  percent
                </span>
                <label
                  htmlFor="bind-rate"
                  className="text-[12px] font-bold uppercase tracking-wider text-[#45464d] flex-1"
                >
                  Bind With Rate (%)
                </label>
              </div>
              <div className="relative">
                <input
                  id="bind-rate"
                  type="number"
                  step="0.01"
                  value={formData.bindPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, bindPercentage: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white border border-[#c6c6cd] focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/20 rounded-lg pl-3.5 pr-8 py-2.5 w-full font-mono text-[14px] text-[#191c1e] transition-all outline-none text-right font-medium"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75859d] font-semibold pointer-events-none">
                  %
                </span>
              </div>
              <span className="text-[12px] text-[#75859d] italic">
                Use negative values for discounts relative to base rate (e.g. -10 for 10% off).
              </span>
            </div>

            <hr className="border-[#e0e3e5] my-1" />

            {/* Toggles Grid */}
            <div className="bg-white p-4 rounded-xl border border-[#e0e3e5] shadow-xs space-y-4">
              {/* Is Hourly */}
              <div
                onClick={() => setFormData({ ...formData, isHourly: !formData.isHourly })}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[14px] text-[#191c1e]">Hourly Rate</span>
                  <span className="text-[12px] text-[#75859d]">
                    Rate applies per hour instead of daily
                  </span>
                </div>
                <div className="relative w-11 h-6 transition-all">
                  <div
                    className={`block w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.isHourly ? 'bg-[#2170e4]' : 'bg-[#c6c6cd]'
                    }`}
                  />
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
                      formData.isHourly ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </div>

              <hr className="border-[#e0e3e5]" />

              {/* CRS Tax Inclusive */}
              <div
                onClick={() =>
                  setFormData({ ...formData, isCrsTaxInclusive: !formData.isCrsTaxInclusive })
                }
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[14px] text-[#191c1e]">
                    CRS Tax Inclusive
                  </span>
                  <span className="text-[12px] text-[#75859d]">
                    Send rates with taxes included to CRS
                  </span>
                </div>
                <div className="relative w-11 h-6 transition-all">
                  <div
                    className={`block w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.isCrsTaxInclusive ? 'bg-[#2170e4]' : 'bg-[#c6c6cd]'
                    }`}
                  />
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
                      formData.isCrsTaxInclusive ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </div>

              <hr className="border-[#e0e3e5]" />

              {/* CRS Enable */}
              <div
                onClick={() =>
                  setFormData({ ...formData, isCrsEnabled: !formData.isCrsEnabled })
                }
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[14px] text-[#191c1e]">Enable in CRS</span>
                  <span className="text-[12px] text-[#75859d]">
                    Sync this rate type with central system
                  </span>
                </div>
                <div className="relative w-11 h-6 transition-all">
                  <div
                    className={`block w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.isCrsEnabled ? 'bg-[#2170e4]' : 'bg-[#c6c6cd]'
                    }`}
                  />
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
                      formData.isCrsEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-white border-t border-[#e0e3e5] flex justify-end gap-3 z-10 shadow-xs">
          <button
            id="cancel-drawer-btn"
            type="button"
            onClick={closeRateTypeDrawer}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] border border-[#c6c6cd] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="rate-type-form"
            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Save Rate Type</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteRateTypeDialogOpen && deleteTargetRateType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-[#191c1e]">Delete Rate Type</h3>
                <p className="text-[12px] text-[#75859d]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[14px] text-[#45464d] mb-6">
              Are you sure you want to delete rate type{' '}
              <strong className="text-[#191c1e]">{deleteTargetRateType.name}</strong> (
              {deleteTargetRateType.shortName})? All rate packages bound to this rate will need to be
              reconfigured.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteRateTypeDialog}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#191c1e] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteRateType(deleteTargetRateType.id);
                  closeDeleteRateTypeDialog();
                }}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors cursor-pointer shadow-sm"
              >
                Delete Rate Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
