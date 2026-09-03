import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { GuestCategoryItem } from '../types';

export const GuestCategoriesView: React.FC = () => {
  const {
    navigate,
    guestCategories,
    setEditingGuestCategoryId,
    openDeleteGuestCategoryDialog,
    toggleGuestCategoryStatus,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return guestCategories.filter((cat) => {
      const q = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.shortName.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
      );
    });
  }, [guestCategories, searchQuery]);

  // Pagination calculation
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const renderHighlightIcon = (category: GuestCategoryItem) => {
    if (!category.isHighlight) {
      return (
        <span className="material-symbols-outlined text-[#c6c6cd] text-[18px]">
          horizontal_rule
        </span>
      );
    }

    const iconType = category.highlightIcon || 'star';
    let iconColorClass = 'text-[#0058be]';
    let iconName = 'star';

    if (iconType === 'warning' || category.color.toLowerCase() === '#ba1a1a') {
      iconColorClass = 'text-[#ba1a1a]';
      iconName = 'warning';
    } else if (iconType === 'verified') {
      iconColorClass = 'text-[#10b981]';
      iconName = 'verified';
    } else if (iconType === 'favorite') {
      iconColorClass = 'text-[#e11d48]';
      iconName = 'favorite';
    } else if (iconType === 'flag') {
      iconColorClass = 'text-[#f59e0b]';
      iconName = 'flag';
    } else {
      iconColorClass = category.color ? '' : 'text-[#0058be]';
      iconName = 'star';
    }

    return (
      <span
        className={`material-symbols-outlined text-[20px] ${iconColorClass}`}
        style={{
          fontVariationSettings: "'FILL' 1",
          color: iconColorClass ? undefined : category.color,
        }}
      >
        {iconName}
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full h-full relative" id="guest-category-container">
      <div className="flex-1 p-6 md:p-8 bg-[#f7f9fb]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-[28px] font-bold text-[#191c1e] tracking-tight">
              Guest Categories
            </h1>
            <p className="text-sm text-[#75859d]">
              Manage segmentations to identify and cater to specific guest types.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[18px] pointer-events-none">
                search
              </span>
              <input
                id="search-guest-categories-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search categories..."
                className="bg-[#f2f4f6] pl-9 pr-4 py-2 rounded-lg w-56 md:w-64 text-sm text-[#191c1e] placeholder-[#75859d] border border-transparent focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058be] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#75859d] hover:text-[#191c1e] text-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Add Category Button */}
            <button
              id="add-guest-category-btn"
              onClick={() => {
                setEditingGuestCategoryId(null);
                navigate('add-guest-category');
              }}
              className="bg-[#000000] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#333333] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Category
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="guest-categories-table">
              <thead className="bg-[#f2f4f6] border-b border-[#e0e3e5]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] whitespace-nowrap w-14 text-center">
                    Color
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] whitespace-nowrap">
                    Category Name
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] whitespace-nowrap">
                    Short Name
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] w-1/3">
                    Description
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] whitespace-nowrap text-center">
                    Highlight
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] whitespace-nowrap text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#75859d] whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <tr
                      key={category.id}
                      id={`guest-category-row-${category.id}`}
                      onClick={() => {
                        setEditingGuestCategoryId(category.id);
                        navigate('edit-guest-category');
                      }}
                      className="hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                    >
                      {/* Color */}
                      <td className="px-4 py-3.5 align-middle text-center">
                        <div
                          className="w-4 h-4 rounded-full mx-auto shadow-2xs ring-1 ring-black/10"
                          style={{ backgroundColor: category.color || '#0058be' }}
                          title={category.color}
                        />
                      </td>

                      {/* Category Name */}
                      <td className="px-4 py-3.5 align-middle font-semibold text-sm text-[#191c1e]">
                        {category.name}
                      </td>

                      {/* Short Name */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono text-xs font-semibold bg-[#eceef0] px-2 py-1 rounded text-[#45464d] tracking-wide">
                          {category.shortName}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 align-middle text-xs text-[#75859d] max-w-[280px] truncate">
                        {category.description || '—'}
                      </td>

                      {/* Highlight */}
                      <td className="px-4 py-3.5 align-middle text-center">
                        {renderHighlightIcon(category)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-middle text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGuestCategoryStatus(category.id);
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide transition-colors cursor-pointer ${
                            category.status === 'active'
                              ? 'bg-[#d8e2ff] text-[#001a42] hover:bg-[#c6d7ff]'
                              : 'bg-[#e0e3e5] text-[#45464d] hover:bg-[#d0d3d5]'
                          }`}
                        >
                          {category.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div
                          className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            id={`edit-guest-category-btn-${category.id}`}
                            onClick={() => {
                              setEditingGuestCategoryId(category.id);
                              navigate('edit-guest-category');
                            }}
                            title="Edit Category"
                            className="text-[#75859d] hover:text-[#0058be] hover:bg-[#d8e2ff]/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            id={`delete-guest-category-btn-${category.id}`}
                            onClick={() => openDeleteGuestCategoryDialog(category)}
                            title="Delete Category"
                            className="text-[#75859d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-[#c6c6cd] mb-2">
                          person_search
                        </span>
                        <p className="text-sm font-semibold text-[#191c1e]">
                          No guest categories found
                        </p>
                        <p className="text-xs text-[#75859d] mt-1 max-w-sm">
                          {searchQuery
                            ? `No categories match "${searchQuery}". Try adjusting your search term.`
                            : 'No guest categories have been configured yet.'}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-3 text-xs font-semibold text-[#0058be] hover:underline"
                          >
                            Clear Search Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-3 bg-[#f2f4f6] border-t border-[#e0e3e5] flex justify-between items-center text-xs text-[#75859d]">
            <span>
              Showing {paginatedCategories.length} of {totalItems} categories
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#e0e3e5] text-[#191c1e] hover:bg-[#d0d3d5] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="px-2 font-medium text-[#191c1e]">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#e0e3e5] text-[#191c1e] hover:bg-[#d0d3d5] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
