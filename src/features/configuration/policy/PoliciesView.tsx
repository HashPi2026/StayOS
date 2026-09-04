import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PolicyItem } from '@/src/types';

export const PoliciesView: React.FC = () => {
  const {
    policies,
    setEditingPolicyId,
    openDeletePolicyDialog,
    navigate,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter policies based on search query
  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return policies;
    const q = searchQuery.toLowerCase().trim();
    return policies.filter(
      (p) =>
        p.roomTypeName.toLowerCase().includes(q) ||
        p.rateTypeName.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [policies, searchQuery]);

  // Pagination calculation
  const totalEntries = filteredPolicies.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);

  // Helper for Rate Type badge colors
  const getRateTypeBadgeClass = (rateName: string) => {
    const lower = rateName.toLowerCase();
    if (lower.includes('non-ref') || lower.includes('non refundable')) {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    if (lower.includes('early') || lower.includes('bird')) {
      return 'bg-slate-900 text-white';
    }
    if (lower.includes('standard') || lower.includes('flexible') || lower.includes('vip')) {
      return 'bg-blue-600 text-white';
    }
    if (lower.includes('weekend') || lower.includes('promo')) {
      return 'bg-amber-100 text-amber-900 border border-amber-300';
    }
    if (lower.includes('corp') || lower.includes('gov')) {
      return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
    return 'bg-blue-600 text-white';
  };

  return (
    <div id="policies-view-container" className="flex-1 flex flex-col min-h-screen bg-[#f8f9fb]">
      {/* Top Header Section with generous padding */}
      <div
        id="policies-header-bar"
        className="px-8 py-7 bg-white border-b border-[#e5e7eb] flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs"
      >
        <div>
          <h1 id="policies-main-heading" className="text-2xl font-bold text-[#191c1e] tracking-tight">
            Policies
          </h1>
          <p id="policies-subheading" className="text-sm text-[#76777d] mt-1">
            Manage cancellation and deposit rules across room and rate types.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-64 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]">
              search
            </span>
            <input
              id="policies-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search policies..."
              className="w-full pl-10 pr-8 py-2 bg-[#f2f4f6] hover:bg-[#eceef0] focus:bg-white border border-[#d8dadc] focus:border-[#0058be] rounded-lg text-sm text-[#191c1e] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] p-1 text-xs"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Add Policy Button */}
          <button
            id="add-policy-button"
            onClick={() => {
              setEditingPolicyId(null);
              navigate('add-policy');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#191c1e] hover:bg-black active:scale-[0.98] text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Policy
          </button>
        </div>
      </div>

      {/* Main Table Container with outer padding and proper margin */}
      <div id="policies-table-wrapper" className="p-8 flex-1 max-w-7xl w-full">
        <div className="bg-white rounded-xl shadow-xs border border-[#e5e7eb] overflow-hidden">
          <div className="overflow-x-auto">
            <table id="policies-data-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e7eb] text-[#4b5563] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3.5 sticky left-0 z-10 bg-[#f8f9fa] min-w-[180px]">
                    Room Type
                  </th>
                  <th className="px-6 py-3.5 min-w-[150px]">Rate Type</th>
                  <th className="px-6 py-3.5 min-w-[340px]">Policy Preview</th>
                  <th className="px-6 py-3.5 min-w-[140px]">Last Updated</th>
                  <th className="px-6 py-3.5 text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#191c1e] divide-y divide-[#f0f1f3]">
                {paginatedPolicies.length > 0 ? (
                  paginatedPolicies.map((policy) => (
                    <tr
                      key={policy.id}
                      id={`policy-row-${policy.id}`}
                      className="hover:bg-[#f8f9fa] transition-colors group"
                    >
                      {/* Room Type */}
                      <td className="px-6 py-4.5 sticky left-0 z-10 bg-white group-hover:bg-[#f8f9fa] transition-colors font-medium text-[#191c1e]">
                        {policy.roomTypeName}
                      </td>

                      {/* Rate Type Badge */}
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase ${getRateTypeBadgeClass(
                            policy.rateTypeName
                          )}`}
                        >
                          {policy.rateTypeName}
                        </span>
                      </td>

                      {/* Policy Preview with Interactive Tooltip */}
                      <td className="px-6 py-4.5 max-w-sm md:max-w-md">
                        <div className="truncate group/tooltip relative cursor-help text-[#374151]">
                          {policy.content}
                          {/* Tooltip Hover Overlay */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-[#1e293b] text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-30 whitespace-normal pointer-events-none leading-relaxed border border-slate-700">
                            {policy.content}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                          </div>
                        </div>
                      </td>

                      {/* Last Updated Date */}
                      <td className="px-6 py-4.5 text-[#6b7280] whitespace-nowrap text-xs">
                        {policy.updatedAt}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-policy-btn-${policy.id}`}
                            onClick={() => {
                              setEditingPolicyId(policy.id);
                              navigate('edit-policy');
                            }}
                            className="p-1.5 text-[#6b7280] hover:text-[#0058be] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit policy"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            id={`delete-policy-btn-${policy.id}`}
                            onClick={() => openDeletePolicyDialog(policy)}
                            className="p-1.5 text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete policy"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-[#6b7280]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-[#9ca3af]">
                          policy
                        </span>
                        <p className="font-semibold text-sm text-[#191c1e]">No policies found</p>
                        <p className="text-xs text-[#6b7280] max-w-sm">
                          {searchQuery
                            ? `No policies matched "${searchQuery}". Try a different keyword.`
                            : 'Create your first cancellation or deposit policy to get started.'}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-[#0058be] text-xs font-semibold hover:underline"
                          >
                            Clear search filter
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
          <div
            id="policies-pagination-bar"
            className="px-6 py-4 bg-white border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280]"
          >
            <span>
              {totalEntries > 0
                ? `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`
                : 'Showing 0 entries'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="policies-prev-page-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={validCurrentPage <= 1}
                className="p-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  id={`policies-page-${pageNum}-btn`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    pageNum === validCurrentPage
                      ? 'bg-blue-50 text-[#0058be] border border-blue-200'
                      : 'border border-transparent hover:bg-[#f3f4f6] text-[#374151]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                id="policies-next-page-btn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={validCurrentPage >= totalPages}
                className="p-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next page"
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
