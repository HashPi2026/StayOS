import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PackageItem, PackageType } from '@/src/types';

const PRESET_INCLUSIONS = [
  'Buffet Breakfast',
  'Airport Transfer',
  'High-Speed Wi-Fi',
  'Late Checkout (2 PM)',
  'Spa Credit $50',
  'Welcome Mocktail',
  'Beach Umbrella & Chairs',
  'Complimentary Valet Parking',
  'Executive Lounge Access',
  '3-Course Chef Dinner',
];

export const PackagesTab: React.FC = () => {
  const {
    packages,
    rateTypes,
    addPackage,
    updatePackage,
    deletePackage,
    isPackageDrawerOpen,
    drawerPackage,
    openAddPackageDrawer,
    openEditPackageDrawer,
    closePackageDrawer,
    isDeletePackageDialogOpen,
    deleteTargetPackage,
    openDeletePackageDialog,
    closeDeletePackageDialog,
    addToast,
  } = useProperty();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Drawer Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    rateTypeId: '',
    packageType: 'leisure' as PackageType,
    inclusions: [] as string[],
    basePrice: 199,
    extraAdultPrice: 40,
    extraChildPrice: 20,
    validFrom: '2024-01-01',
    validTo: '2026-12-31',
    minStayNights: 1,
    isActive: true,
    isCrsEnabled: true,
  });

  const [newInclusionInput, setNewInclusionInput] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Sync drawer state
  React.useEffect(() => {
    if (isPackageDrawerOpen) {
      if (drawerPackage) {
        setFormData({
          code: drawerPackage.code || '',
          name: drawerPackage.name || '',
          description: drawerPackage.description || '',
          rateTypeId: drawerPackage.rateTypeId || (rateTypes[0]?.id || ''),
          packageType: (drawerPackage.packageType as PackageType) || 'leisure',
          inclusions: Array.isArray(drawerPackage.inclusions) ? [...drawerPackage.inclusions] : [],
          basePrice: drawerPackage.basePrice ?? 199,
          extraAdultPrice: drawerPackage.extraAdultPrice ?? 40,
          extraChildPrice: drawerPackage.extraChildPrice ?? 20,
          validFrom: drawerPackage.validFrom || '2024-01-01',
          validTo: drawerPackage.validTo || '2026-12-31',
          minStayNights: drawerPackage.minStayNights ?? 1,
          isActive: drawerPackage.isActive ?? true,
          isCrsEnabled: drawerPackage.isCrsEnabled ?? true,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          rateTypeId: rateTypes[0]?.id || '',
          packageType: 'leisure',
          inclusions: ['Buffet Breakfast', 'High-Speed Wi-Fi'],
          basePrice: 199,
          extraAdultPrice: 40,
          extraChildPrice: 20,
          validFrom: new Date().toISOString().split('T')[0],
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          minStayNights: 1,
          isActive: true,
          isCrsEnabled: true,
        });
      }
      setNewInclusionInput('');
      setFormErrors({});
    }
  }, [isPackageDrawerOpen, drawerPackage, rateTypes]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = (pkg.code || '').toLowerCase().includes(q);
      const nameMatch = (pkg.name || '').toLowerCase().includes(q);
      const descMatch = (pkg.description || '').toLowerCase().includes(q);
      const rateMatch = (pkg.rateTypeName || '').toLowerCase().includes(q);
      const inclMatch = (pkg.inclusions || []).some((inc) => inc.toLowerCase().includes(q));
      const matchesSearch = !q || codeMatch || nameMatch || descMatch || rateMatch || inclMatch;

      const matchesType = filterType === 'all' || pkg.packageType === filterType;
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'active'
          ? pkg.isActive
          : !pkg.isActive;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [packages, searchQuery, filterType, filterStatus]);

  // Inclusion handlers
  const handleAddInclusion = () => {
    const trimmed = newInclusionInput.trim();
    if (!trimmed) return;
    if (formData.inclusions.includes(trimmed)) {
      addToast('This inclusion is already in the list', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      inclusions: [...prev.inclusions, trimmed],
    }));
    setNewInclusionInput('');
  };

  const handleAddPresetInclusion = (item: string) => {
    if (formData.inclusions.includes(item)) return;
    setFormData((prev) => ({
      ...prev,
      inclusions: [...prev.inclusions, item],
    }));
  };

  const handleRemoveInclusion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index),
    }));
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.code.trim()) {
      errors.code = 'Package code is required';
    } else if (formData.code.trim().length > 12) {
      errors.code = 'Code must be 12 characters or fewer';
    }

    if (!formData.name.trim()) {
      errors.name = 'Package name is required';
    }

    if (formData.basePrice < 0) {
      errors.basePrice = 'Base price must be 0 or higher';
    }

    if (formData.minStayNights < 1) {
      errors.minStayNights = 'Minimum stay must be at least 1 night';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please resolve highlighted form errors', 'error');
      return;
    }

    // Resolve rate type name
    const selectedRt = rateTypes.find((rt) => rt.id === formData.rateTypeId);
    const rateTypeName = selectedRt ? selectedRt.name : 'Standard Rate';

    if (drawerPackage) {
      updatePackage(drawerPackage.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        rateTypeId: formData.rateTypeId,
        rateTypeName,
        packageType: formData.packageType,
        inclusions: formData.inclusions,
        basePrice: Number(formData.basePrice),
        extraAdultPrice: Number(formData.extraAdultPrice),
        extraChildPrice: Number(formData.extraChildPrice),
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        minStayNights: Number(formData.minStayNights),
        isActive: formData.isActive,
        isCrsEnabled: formData.isCrsEnabled,
      });
    } else {
      addPackage({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        rateTypeId: formData.rateTypeId,
        rateTypeName,
        packageType: formData.packageType,
        inclusions: formData.inclusions,
        basePrice: Number(formData.basePrice),
        extraAdultPrice: Number(formData.extraAdultPrice),
        extraChildPrice: Number(formData.extraChildPrice),
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        minStayNights: Number(formData.minStayNights),
        isActive: formData.isActive,
        isCrsEnabled: formData.isCrsEnabled,
      });
    }

    closePackageDrawer();
  };

  const getPackageTypeBadge = (type: PackageType | string) => {
    switch (type) {
      case 'meal':
        return { label: 'Meal Plan', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'restaurant' };
      case 'wellness':
        return { label: 'Wellness & Spa', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'spa' };
      case 'business':
        return { label: 'Corporate / Business', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'business_center' };
      case 'seasonal':
        return { label: 'Seasonal Special', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'wb_sunny' };
      case 'all-inclusive':
        return { label: 'All Inclusive', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'hotel_class' };
      case 'leisure':
      default:
        return { label: 'Leisure & Stay', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'beach_access' };
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Search & Actions Bar */}
      <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#e0e3e5] z-20">
        <div className="relative flex items-center w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[20px]">
            search
          </span>
          <input
            id="packages-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by code, name, inclusions..."
            className="bg-[#f2f4f6] w-full pl-10 pr-8 py-2 rounded-lg text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#2170e4] placeholder:text-[#75859d]/60 transition-all border border-transparent focus:border-[#2170e4] focus:bg-white"
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

        <div className="flex items-center gap-2.5">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              id="packages-filter-btn"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-[12px] font-semibold tracking-wider uppercase cursor-pointer ${
                filterType !== 'all' || filterStatus !== 'all'
                  ? 'bg-[#2170e4] text-white shadow-xs'
                  : 'text-[#45464d] hover:bg-[#e6e8ea]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span>Filter</span>
              {(filterType !== 'all' || filterStatus !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-white ml-0.5" />
              )}
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-xl border border-[#e0e3e5] p-3 z-30 space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-[#e0e3e5]">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#191c1e]">
                    Filter Packages
                  </span>
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterStatus('all');
                    }}
                    className="text-[11px] text-[#0058be] hover:underline font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#75859d] block mb-1">
                    Package Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-[#f2f4f6] text-[13px] border border-[#c6c6cd] rounded-lg px-2.5 py-1.5 text-[#191c1e] outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="meal">Meal Plan</option>
                    <option value="leisure">Leisure & Stay</option>
                    <option value="wellness">Wellness & Spa</option>
                    <option value="business">Business / Corporate</option>
                    <option value="seasonal">Seasonal Special</option>
                    <option value="all-inclusive">All Inclusive</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#75859d] block mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="w-full bg-[#f2f4f6] text-[13px] border border-[#c6c6cd] rounded-lg px-2.5 py-1.5 text-[#191c1e] outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Add Package Button */}
          <button
            id="add-package-btn"
            onClick={openAddPackageDrawer}
            className="flex items-center gap-1.5 bg-[#000000] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#2d3133] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Packages Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#f2f4f6] text-[#75859d] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[30px]">inventory_2</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#191c1e]">No Packages Found</h3>
            <p className="text-[13px] text-[#75859d] max-w-sm mt-1 mb-4">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'No packages matched your filters. Try clearing your search or filter parameters.'
                : 'Get started by creating your first hotel package with bundled inclusions and special pricing.'}
            </p>
            <button
              onClick={openAddPackageDrawer}
              className="px-4 py-2 bg-[#000000] text-white text-[13px] font-semibold rounded-lg hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Create Package
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#e0e3e5] bg-[#f9fafb] text-[11px] font-semibold tracking-wider uppercase text-[#75859d]">
                <th className="py-3 px-4">Package Code & Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Inclusions</th>
                <th className="py-3 px-4">Base Pricing</th>
                <th className="py-3 px-4">Min Stay</th>
                <th className="py-3 px-4">CRS Sync</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5] text-[13px]">
              {filteredPackages.map((pkg) => {
                const typeBadge = getPackageTypeBadge(pkg.packageType);
                return (
                  <tr
                    key={pkg.id}
                    className="hover:bg-[#f2f4f6]/60 transition-colors group"
                  >
                    {/* Code & Name */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[12px] bg-[#eef2f6] px-2 py-0.5 rounded text-[#191c1e]">
                            {pkg.code}
                          </span>
                          <span className="font-semibold text-[#191c1e] text-[14px]">
                            {pkg.name}
                          </span>
                        </div>
                        {pkg.description && (
                          <span className="text-[12px] text-[#75859d] mt-0.5 line-clamp-1">
                            {pkg.description}
                          </span>
                        )}
                        {pkg.rateTypeName && (
                          <span className="text-[11px] text-[#0058be] mt-0.5 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">sell</span>
                            Rate Type: {pkg.rateTypeName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeBadge.bg}`}>
                        <span className="material-symbols-outlined text-[13px]">{typeBadge.icon}</span>
                        {typeBadge.label}
                      </span>
                    </td>

                    {/* Inclusions */}
                    <td className="py-3 px-4 max-w-[280px]">
                      <div className="flex flex-wrap gap-1">
                        {(pkg.inclusions || []).slice(0, 3).map((inc, i) => (
                          <span
                            key={i}
                            className="inline-block bg-[#f2f4f6] text-[#45464d] text-[11px] px-2 py-0.5 rounded-md font-medium"
                          >
                            {inc}
                          </span>
                        ))}
                        {(pkg.inclusions || []).length > 3 && (
                          <span className="inline-block bg-[#e0ecfc] text-[#0058be] text-[11px] px-1.5 py-0.5 rounded font-semibold">
                            +{pkg.inclusions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-[#191c1e]">
                          ${Number(pkg.basePrice).toFixed(2)}
                          <span className="text-[11px] font-normal text-[#75859d]">/night</span>
                        </span>
                        <div className="text-[11px] text-[#75859d] flex gap-2">
                          <span>Adult: +${Number(pkg.extraAdultPrice || 0).toFixed(0)}</span>
                          <span>Child: +${Number(pkg.extraChildPrice || 0).toFixed(0)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Min Stay */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#191c1e]">
                        {pkg.minStayNights || 1}{' '}
                        <span className="font-normal text-[#75859d] text-[12px]">
                          {(pkg.minStayNights || 1) === 1 ? 'night' : 'nights'}
                        </span>
                      </span>
                    </td>

                    {/* CRS Sync */}
                    <td className="py-3 px-4">
                      {pkg.isCrsEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                          Synced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#75859d] bg-[#f2f4f6] px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[13px]">cloud_off</span>
                          Local
                        </span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updatePackage(pkg.id, { isActive: !pkg.isActive })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                          pkg.isActive
                            ? 'bg-[#e0ecfc] text-[#0058be] hover:bg-blue-100'
                            : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-red-100'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditPackageDrawer(pkg)}
                          className="p-1.5 text-[#75859d] hover:text-[#0058be] hover:bg-white rounded-md transition-colors cursor-pointer"
                          title="Edit Package"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDeletePackageDialog(pkg)}
                          className="p-1.5 text-[#75859d] hover:text-[#ba1a1a] hover:bg-white rounded-md transition-colors cursor-pointer"
                          title="Delete Package"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Package Drawer */}
      {isPackageDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#e0e3e5]">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#e0e3e5] flex items-center justify-between bg-[#f9fafb]">
              <div>
                <h2 className="text-[18px] font-bold text-[#191c1e]">
                  {drawerPackage ? 'Edit Package' : 'Create New Package'}
                </h2>
                <p className="text-[12px] text-[#75859d] mt-0.5">
                  Configure package details, meal plans, bundled inclusions, and pricing.
                </p>
              </div>
              <button
                onClick={closePackageDrawer}
                className="p-2 text-[#75859d] hover:text-[#191c1e] hover:bg-white rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <form id="package-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Code & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Package Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. PKG-BB"
                      maxLength={12}
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border font-mono ${
                        formErrors.code ? 'border-[#ba1a1a] bg-[#fff8f7]' : 'border-[#c6c6cd] bg-white'
                      } text-[#191c1e] outline-none focus:border-[#2170e4]`}
                    />
                    {formErrors.code && (
                      <span className="text-[11px] text-[#ba1a1a] mt-1 block">{formErrors.code}</span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Bed & Breakfast Special"
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border ${
                        formErrors.name ? 'border-[#ba1a1a] bg-[#fff8f7]' : 'border-[#c6c6cd] bg-white'
                      } text-[#191c1e] outline-none focus:border-[#2170e4]`}
                    />
                    {formErrors.name && (
                      <span className="text-[11px] text-[#ba1a1a] mt-1 block">{formErrors.name}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Provide details about what makes this package special..."
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                  />
                </div>

                {/* Package Type & Linked Rate Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Package Type
                    </label>
                    <select
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value as PackageType })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    >
                      <option value="meal">Meal Plan</option>
                      <option value="leisure">Leisure & Stay</option>
                      <option value="wellness">Wellness & Spa</option>
                      <option value="business">Business / Corporate</option>
                      <option value="seasonal">Seasonal Special</option>
                      <option value="all-inclusive">All Inclusive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Linked Rate Type
                    </label>
                    <select
                      value={formData.rateTypeId}
                      onChange={(e) => setFormData({ ...formData, rateTypeId: e.target.value })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    >
                      {rateTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} ({rt.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inclusions Manager */}
                <div className="bg-[#f9fafb] p-3.5 rounded-xl border border-[#e0e3e5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#191c1e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#0058be]">checklist</span>
                      Included Amenities & Benefits ({formData.inclusions.length})
                    </label>
                  </div>

                  {/* Add inclusion input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInclusionInput}
                      onChange={(e) => setNewInclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInclusion();
                        }
                      }}
                      placeholder="Add custom benefit (e.g. Free Cabana Access)..."
                      className="flex-1 px-3 py-1.5 text-[12px] bg-white border border-[#c6c6cd] rounded-lg outline-none focus:border-[#2170e4]"
                    />
                    <button
                      type="button"
                      onClick={handleAddInclusion}
                      className="px-3 py-1.5 bg-[#000000] text-white text-[12px] font-semibold rounded-lg hover:bg-[#333333] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Active Inclusions Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[36px] bg-white p-2 rounded-lg border border-[#e0e3e5]">
                    {formData.inclusions.length === 0 ? (
                      <span className="text-[11px] text-[#75859d] italic py-1">
                        No inclusions added yet. Click preset chips below or type above.
                      </span>
                    ) : (
                      formData.inclusions.map((inc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 bg-[#e0ecfc] text-[#0058be] text-[11px] font-semibold px-2.5 py-1 rounded-md"
                        >
                          {inc}
                          <button
                            type="button"
                            onClick={() => handleRemoveInclusion(i)}
                            className="hover:text-red-700 ml-0.5 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Preset Suggestions */}
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#75859d] block mb-1">
                      Quick Suggestions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_INCLUSIONS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAddPresetInclusion(preset)}
                          disabled={formData.inclusions.includes(preset)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            formData.inclusions.includes(preset)
                              ? 'bg-[#e0e3e5] text-[#75859d] border-transparent cursor-not-allowed opacity-50'
                              : 'bg-white text-[#45464d] border-[#c6c6cd] hover:border-[#0058be] hover:text-[#0058be]'
                          }`}
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Min Stay */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Base Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Extra Adult ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.extraAdultPrice}
                      onChange={(e) => setFormData({ ...formData, extraAdultPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Extra Child ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.extraChildPrice}
                      onChange={(e) => setFormData({ ...formData, extraChildPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Min Stay (Nts)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.minStayNights}
                      onChange={(e) => setFormData({ ...formData, minStayNights: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    />
                  </div>
                </div>

                {/* Validity Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#45464d] mb-1">
                      Valid To
                    </label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] outline-none focus:border-[#2170e4]"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-2 border-t border-[#e0e3e5] space-y-3">
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] hover:bg-[#f9fafb] cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-[13px] text-[#191c1e] block">Package Active</span>
                      <span className="text-[11px] text-[#75859d]">Available for booking and front desk assignment</span>
                    </div>
                    <div className="relative w-11 h-6">
                      <div className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-[#2170e4]' : 'bg-[#c6c6cd]'}`} />
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-5' : ''}`} />
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, isCrsEnabled: !prev.isCrsEnabled }))}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] hover:bg-[#f9fafb] cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-[13px] text-[#191c1e] block">Enable in CRS</span>
                      <span className="text-[11px] text-[#75859d]">Synchronize package rates with Central Reservations</span>
                    </div>
                    <div className="relative w-11 h-6">
                      <div className={`w-11 h-6 rounded-full transition-colors ${formData.isCrsEnabled ? 'bg-[#2170e4]' : 'bg-[#c6c6cd]'}`} />
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isCrsEnabled ? 'translate-x-5' : ''}`} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-white border-t border-[#e0e3e5] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={closePackageDrawer}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] border border-[#c6c6cd] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="package-form"
                className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#000000] text-white hover:bg-[#333333] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{drawerPackage ? 'Update Package' : 'Save Package'}</span>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Package Confirmation Modal */}
      {isDeletePackageDialogOpen && deleteTargetPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-[#191c1e]">Delete Package</h3>
                <p className="text-[12px] text-[#75859d]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[14px] text-[#45464d] mb-6">
              Are you sure you want to delete package{' '}
              <strong className="text-[#191c1e]">{deleteTargetPackage.name}</strong> ({deleteTargetPackage.code})?
              Any existing reservations tied to this package will retain their rate snapshot.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeletePackageDialog}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#191c1e] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePackage(deleteTargetPackage.id);
                  closeDeletePackageDialog();
                }}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors cursor-pointer shadow-sm"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
