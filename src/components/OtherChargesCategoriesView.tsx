import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '../context/PropertyContext';
import { OtherChargeCategoryItem } from '../types';

export const OtherChargesCategoriesView: React.FC = () => {
  const {
    otherChargeCategories,
    addOtherChargeCategory,
    updateOtherChargeCategory,
    deleteOtherChargeCategory,
    setDefaultOtherChargeCategory,
    isOtherChargeCategoryDrawerOpen,
    drawerOtherChargeCategory,
    openAddOtherChargeCategoryDrawer,
    openEditOtherChargeCategoryDrawer,
    closeOtherChargeCategoryDrawer,
    isDeleteOtherChargeCategoryDialogOpen,
    deleteTargetOtherChargeCategory,
    openDeleteOtherChargeCategoryDialog,
    closeDeleteOtherChargeCategoryDialog,
    setEditingOtherChargeCategoryId,
    navigate,
    addToast,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Drawer form state
  const [formData, setFormData] = useState<{
    shortName: string;
    name: string;
    description: string;
    isDefault: boolean;
  }>({
    shortName: '',
    name: '',
    description: '',
    isDefault: false,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const isEditing = Boolean(drawerOtherChargeCategory);

  // Sync drawer form data when opened or target changes
  useEffect(() => {
    if (drawerOtherChargeCategory) {
      setFormData({
        shortName: drawerOtherChargeCategory.shortName,
        name: drawerOtherChargeCategory.name,
        description: drawerOtherChargeCategory.description || '',
        isDefault: drawerOtherChargeCategory.isDefault,
      });
    } else {
      setFormData({
        shortName: '',
        name: '',
        description: '',
        isDefault: false,
      });
    }
    setFormErrors({});
  }, [drawerOtherChargeCategory, isOtherChargeCategoryDrawerOpen]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories by search
  const filteredCategories = otherChargeCategories.filter((cat) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      cat.shortName.toLowerCase().includes(query) ||
      cat.name.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  // Currently designated default category (excluding current if editing)
  const currentDefaultCategory = otherChargeCategories.find(
    (c) => c.isDefault && (!drawerOtherChargeCategory || c.id !== drawerOtherChargeCategory.id)
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    const cleanShortName = formData.shortName.trim().toUpperCase();
    const cleanName = formData.name.trim();

    if (!cleanShortName) {
      errors.shortName = 'Short Name is required';
    } else if (cleanShortName.length > 4) {
      errors.shortName = 'Short Name must be 4 characters or fewer';
    }

    if (!cleanName) {
      errors.name = 'Category Name is required';
    }

    // Check unique short name
    const shortNameConflict = otherChargeCategories.some(
      (c) =>
        c.shortName.toUpperCase() === cleanShortName &&
        (!drawerOtherChargeCategory || c.id !== drawerOtherChargeCategory.id)
    );
    if (shortNameConflict) {
      errors.shortName = 'A category with this short name already exists';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (isEditing && drawerOtherChargeCategory) {
      updateOtherChargeCategory(drawerOtherChargeCategory.id, {
        shortName: cleanShortName,
        name: cleanName,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
      });
    } else {
      addOtherChargeCategory({
        shortName: cleanShortName,
        name: cleanName,
        description: formData.description.trim(),
        isDefault: formData.isDefault,
      });
    }

    closeOtherChargeCategoryDrawer();
  };

  const handleConfirmDelete = () => {
    if (deleteTargetOtherChargeCategory) {
      deleteOtherChargeCategory(deleteTargetOtherChargeCategory.id);
      closeDeleteOtherChargeCategoryDialog();
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f7f9fb] text-[#191c1e]" id="other-charges-container">
      <div className="flex-1 flex flex-col p-6 md:p-8 max-w-7xl w-full mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col mb-6">
          <nav className="flex items-center gap-1.5 mb-3 text-[12px] text-[#75859d] font-medium tracking-wide uppercase">
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Configuration
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <button
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] transition-colors cursor-pointer"
            >
              Property
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">Other Charges Categories</span>
          </nav>

          {/* Page Title and Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[26px] md:text-[28px] font-bold text-[#191c1e] tracking-tight mb-1">
                Other Charges Categories
              </h1>
              <p className="text-[14px] text-[#45464d]">
                Manage classifications for non-room charges across the property.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => navigate('other-charges')}
                className="h-10 px-3.5 bg-[#f2f4f6] text-[#45464d] hover:text-[#191c1e] hover:bg-[#e6e8ea] border border-[#c6c6cd]/60 transition-all rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                title="View All Other Charges"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Other Charges</span>
              </button>
              <button
                id="btn-add-category"
                onClick={() => {
                  setEditingOtherChargeCategoryId(null);
                  navigate('add-other-charge-category');
                }}
                className="h-10 px-4 bg-[#000000] text-white hover:bg-[#2d3133] active:scale-[0.98] transition-all rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] flex flex-col flex-1 overflow-hidden">
          {/* Filter / Search Bar */}
          <div className="p-4 bg-[#eceef0] border-b border-[#e0e3e5] flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-white border border-[#c6c6cd] rounded-lg py-2 pl-9 pr-3 text-[13px] text-[#191c1e] focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#75859d] hover:text-[#191c1e] p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <div className="text-[12px] text-[#75859d] font-medium hidden sm:block">
              Total Categories: {otherChargeCategories.length}
            </div>
          </div>

          {/* Categories Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#e0e3e5]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#75859d] bg-[#f2f4f6]/60">
                  <th className="py-3 px-6 w-[130px]">Short Name</th>
                  <th className="py-3 px-6 w-[200px]">Category Name</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6 w-[120px] text-center">Default</th>
                  <th className="py-3 px-6 w-[90px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#191c1e] divide-y divide-[#e0e3e5]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#75859d]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-[#c6c6cd]">
                          category
                        </span>
                        <p className="text-[14px] font-medium text-[#45464d]">No categories found</p>
                        <p className="text-[12px] text-[#75859d]">
                          {searchQuery
                            ? `No categories match "${searchQuery}"`
                            : 'Click "Add Category" above to create your first other charge category.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-[#eceef0]/40 transition-colors group"
                    >
                      <td className="py-3.5 px-6 font-mono text-[13px] font-semibold text-[#191c1e]">
                        {category.shortName}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-[#191c1e]">
                        {category.name}
                      </td>
                      <td className="py-3.5 px-6 text-[#45464d] text-[13px] line-clamp-1 max-w-[320px]">
                        {category.description || '—'}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {category.isDefault ? (
                          <span className="inline-flex items-center justify-center bg-[#d8e2ff] text-[#001a42] rounded px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wider">
                            Default
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-6 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === category.id ? null : category.id);
                          }}
                          className="text-[#75859d] hover:text-[#191c1e] p-1.5 rounded-full hover:bg-[#e0e3e5] transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
                          title="Category options"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === category.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-6 top-10 w-48 bg-white rounded-lg shadow-lg border border-[#e0e3e5] py-1.5 z-30 text-left animate-fadeIn"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setEditingOtherChargeCategoryId(category.id);
                                navigate('edit-other-charge-category');
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                            >
                              <span className="material-symbols-outlined text-[18px] text-[#75859d]">
                                edit
                              </span>
                              Edit Category
                            </button>

                            {!category.isDefault && (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDefaultOtherChargeCategory(category.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors cursor-pointer font-medium"
                              >
                                <span className="material-symbols-outlined text-[18px] text-[#0058be]">
                                  star
                                </span>
                                Set as Default
                              </button>
                            )}

                            <div className="h-[1px] bg-[#e0e3e5] my-1" />

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (category.isDefault) {
                                  addToast('Default category cannot be deleted. Set another category as default first.', 'error');
                                  return;
                                }
                                openDeleteOtherChargeCategoryDialog(category);
                              }}
                              disabled={category.isDefault}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors cursor-pointer font-medium ${
                                category.isDefault
                                  ? 'text-[#c6c6cd] cursor-not-allowed'
                                  : 'text-[#ba1a1a] hover:bg-[#ffdad6]/40'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Delete Category
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="p-3 bg-white border-t border-[#e0e3e5] flex items-center justify-between text-[13px] text-[#75859d]">
            <span>
              Showing {filteredCategories.length} of {otherChargeCategories.length} categories
            </span>
          </div>
        </div>
      </div>

      {/* Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOtherChargeCategoryDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeOtherChargeCategoryDrawer}
        id="drawer-backdrop"
      />

      {/* Slide-out Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#e0e3e5] ${
          isOtherChargeCategoryDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="drawer"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#e0e3e5] flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-[20px] font-bold text-[#191c1e]">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={closeOtherChargeCategoryDrawer}
            className="p-1 rounded-full hover:bg-[#eceef0] transition-colors text-[#75859d] hover:text-[#191c1e] cursor-pointer"
            id="btn-close-drawer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f7f9fb]">
          <form id="category-drawer-form" onSubmit={handleFormSubmit} className="space-y-6">
            {/* Input fields card */}
            <div className="bg-white p-5 rounded-xl border border-[#e0e3e5] space-y-4 shadow-xs">
              {/* Short Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#191c1e] flex items-center gap-1">
                  <span>Short Name</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.shortName}
                  onChange={(e) =>
                    setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., SPA"
                  className={`w-full bg-white border rounded-lg px-3.5 py-2 text-[14px] font-mono uppercase focus:ring-2 transition-all outline-none ${
                    formErrors.shortName
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
                      : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                  }`}
                />
                {formErrors.shortName ? (
                  <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                    {formErrors.shortName}
                  </span>
                ) : (
                  <p className="text-[11px] text-[#75859d] mt-0.5">
                    Max 4 characters. Used in compact reports.
                  </p>
                )}
              </div>

              {/* Category Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#191c1e] flex items-center gap-1">
                  <span>Category Name</span>
                  <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spa & Wellness"
                  className={`w-full bg-white border rounded-lg px-3.5 py-2 text-[14px] focus:ring-2 transition-all outline-none ${
                    formErrors.name
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
                      : 'border-[#c6c6cd] focus:ring-[#0058be]/20 focus:border-[#0058be]'
                  }`}
                />
                {formErrors.name && (
                  <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#191c1e]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe the types of charges in this category..."
                  className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[13px] resize-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all outline-none"
                />
              </div>
            </div>

            {/* Default Category Switch Card */}
            <div className="bg-white p-5 rounded-xl border border-[#e0e3e5] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[14px] font-semibold text-[#191c1e] block mb-1">
                    Default Category
                  </label>
                  <p className="text-[12px] text-[#75859d] leading-relaxed">
                    Set this as the default category for new manual charges if no other category is specified.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0058be]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-xs peer-checked:bg-[#0058be]" />
                </label>
              </div>

              {formData.isDefault && (
                <div className="bg-[#d8e2ff] text-[#001a42] rounded-lg p-3 flex items-start gap-2.5 border border-[#adc6ff] animate-fadeIn">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="text-[12px] leading-relaxed">
                    Enabling this will replace{' '}
                    <strong>{currentDefaultCategory ? currentDefaultCategory.name : 'the existing default'}</strong>{' '}
                    as the property&apos;s default other charge category.
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#e0e3e5] bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={closeOtherChargeCategoryDrawer}
            className="h-9 px-4 bg-white text-[#191c1e] border border-[#c6c6cd] rounded-lg text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            id="btn-cancel-drawer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="category-drawer-form"
            className="h-9 px-4 bg-[#000000] text-white hover:bg-[#2d3133] active:scale-[0.98] rounded-lg text-[13px] font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{isEditing ? 'Update Category' : 'Save Category'}</span>
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOtherChargeCategoryDialogOpen && deleteTargetOtherChargeCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-[#e0e3e5]">
            <div className="flex items-center gap-3 text-[#ba1a1a] mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="text-[18px] font-bold text-[#191c1e]">Delete Category</h3>
            </div>
            <p className="text-[13px] text-[#45464d] mb-6 leading-relaxed">
              Are you sure you want to delete the category{' '}
              <strong>&ldquo;{deleteTargetOtherChargeCategory.name}&rdquo; ({deleteTargetOtherChargeCategory.shortName})</strong>? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteOtherChargeCategoryDialog}
                className="px-4 py-2 text-[13px] font-semibold text-[#191c1e] border border-[#c6c6cd] rounded-lg hover:bg-[#f2f4f6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#ba1a1a] hover:bg-[#93000a] active:scale-[0.98] rounded-lg transition-all cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
