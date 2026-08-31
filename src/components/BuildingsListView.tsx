import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { Building, BuildingStatus } from '../types';

export const BuildingsListView: React.FC = () => {
  const {
    buildings,
    navigate,
    openAddDrawer,
    openEditDrawer,
    openDeleteDialog,
  } = useProperty();

  const [searchFilter, setSearchFilter] = useState('');
  const [useDrawerMode, setUseDrawerMode] = useState(false);

  const filteredBuildings = buildings.filter((b) =>
    b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const renderStatusBadge = (status: BuildingStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#2170e4] text-white text-label-uppercase text-[11px] font-semibold">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#e0e3e5] text-[#45464d] text-label-uppercase text-[11px] font-semibold">
            Inactive
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-label-uppercase text-[11px] font-semibold">
            Maintenance
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eceef0] text-[#75859d] text-label-uppercase text-[11px] font-semibold">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const handleAddClick = () => {
    if (useDrawerMode) {
      openAddDrawer();
    } else {
      navigate('add-building');
    }
  };

  const handleEditClick = (b: Building) => {
    if (useDrawerMode) {
      openEditDrawer(b);
    } else {
      navigate('edit-building', b.id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full relative min-h-screen bg-[#f7f9fb]" id="buildings-screen">
      {/* Header Section */}
      <div className="flex flex-col px-6 pt-6 pb-4 bg-[#f7f9fb] shadow-sm z-10 sticky top-0 border-b border-[#c6c6cd]/20">
        <div className="flex items-center text-body-sm text-[#75859d] mb-1">
          <span
            onClick={() => navigate('overview')}
            className="hover:text-[#000000] cursor-pointer transition-colors"
          >
            Configuration
          </span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span
            onClick={() => navigate('overview')}
            className="hover:text-[#000000] cursor-pointer transition-colors"
          >
            Property
          </span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">Buildings</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-semibold text-headline-md text-[#191c1e]">Buildings</h1>
            <p className="text-body-md text-[#45464d] mt-0.5">Manage buildings within this property.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Drawer vs Page Switcher Mode Toggle */}
            <div className="hidden md:flex items-center bg-[#eceef0] p-0.5 rounded-lg border border-[#c6c6cd]/40 text-[11px] font-semibold text-[#45464d]">
              <button
                onClick={() => setUseDrawerMode(false)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  !useDrawerMode ? 'bg-white text-[#191c1e] shadow-xs' : 'hover:text-[#191c1e]'
                }`}
                title="Open Dedicated Full Page"
              >
                Page View
              </button>
              <button
                onClick={() => setUseDrawerMode(true)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  useDrawerMode ? 'bg-white text-[#191c1e] shadow-xs' : 'hover:text-[#191c1e]'
                }`}
                title="Open Slide-over Drawer"
              >
                Drawer View
              </button>
            </div>

            {/* Search */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[18px]">
                search
              </span>
              <input
                className="pl-9 pr-4 py-2 bg-[#eceef0] rounded-lg text-body-sm text-[#191c1e] outline-none w-56 focus:bg-[#e6e8ea] focus:ring-2 focus:ring-[#0058be]/20 transition-all placeholder:text-[#75859d]"
                placeholder="Search buildings..."
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            {/* Add Building Button */}
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 bg-[#000000] text-white px-4 py-2 rounded-lg text-label-uppercase hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Building
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#c6c6cd]/30 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#e0e3e5] text-label-uppercase text-[#45464d] text-[12px]">
                  <th className="px-4 py-3 w-[25%] font-semibold">Building Name</th>
                  <th className="px-4 py-3 w-[38%] font-semibold">Description</th>
                  <th className="px-4 py-3 w-[15%] font-semibold">Status</th>
                  <th className="px-4 py-3 w-[15%] font-semibold">Updated</th>
                  <th className="px-4 py-3 w-[7%] text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-[#191c1e] divide-y divide-[#e0e3e5]">
                {filteredBuildings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#75859d]">
                      No buildings found matching "{searchFilter}"
                    </td>
                  </tr>
                ) : (
                  filteredBuildings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-[#f2f4f6]/80 transition-colors group cursor-pointer"
                      onClick={() => handleEditClick(b)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#75859d] text-[18px]">
                            domain
                          </span>
                          <span className="font-semibold text-[#191c1e] hover:text-[#0058be]">
                            {b.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#45464d] truncate max-w-[320px]">
                        {b.description || 'No description provided.'}
                      </td>
                      <td className="px-4 py-3.5">{renderStatusBadge(b.status)}</td>
                      <td className="px-4 py-3.5 text-[#45464d] font-data-mono text-[12px]">
                        {b.updatedAt}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(b)}
                            className="p-1.5 text-[#45464d] hover:text-[#0058be] hover:bg-[#eceef0] rounded transition-colors"
                            title="Edit Building"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteDialog(b)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                            title="Delete Building"
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

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-[#ffffff] border-t border-[#e0e3e5] flex items-center justify-between text-body-sm text-[#45464d]">
            <span>
              Showing {filteredBuildings.length > 0 ? 1 : 0} to {filteredBuildings.length} of {buildings.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 rounded hover:bg-[#eceef0] transition-colors text-[#d8dadc] cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                disabled
                className="p-1 rounded hover:bg-[#eceef0] transition-colors text-[#d8dadc] cursor-not-allowed"
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
