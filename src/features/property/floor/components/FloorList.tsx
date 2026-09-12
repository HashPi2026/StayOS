import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { Floor, FloorStatus } from '@/src/types';

export const FloorsListView: React.FC = () => {
  const {
    floors,
    buildings,
    openAddFloorDrawer,
    openEditFloorDrawer,
    openDeleteFloorDialog,
    deleteFloor,
    syncWithDatabase,
    isDbSyncing,
  } = useProperty();

  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<'all' | number>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpandedView, setIsExpandedView] = useState(true); // Default true so all rows are visible without clipping

  // Filtered floors
  const filteredFloors = useMemo(() => {
    return floors.filter((floor) => {
      const matchesBuilding =
        selectedBuildingFilter === 'all' ||
        floor.buildingId === selectedBuildingFilter ||
        floor.buildingName.toLowerCase() === selectedBuildingFilter.toLowerCase();

      const query = searchFilter.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        (floor.name || '').toLowerCase().includes(query) ||
        (floor.description || '').toLowerCase().includes(query) ||
        (floor.buildingName || '').toLowerCase().includes(query);

      return matchesBuilding && matchesSearch;
    });
  }, [floors, selectedBuildingFilter, searchFilter]);

  // Paginated floors
  const displayedFloors = useMemo(() => {
    if (rowsPerPage === 'all') return filteredFloors;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredFloors.slice(start, start + rowsPerPage);
  }, [filteredFloors, rowsPerPage, currentPage]);

  const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(filteredFloors.length / rowsPerPage);

  const renderStatusBadge = (status: FloorStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-[#d3e4fe] text-[#0b1c30] rounded font-semibold text-[11px] uppercase tracking-wider">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-[#e0e3e5] text-[#45464d] rounded font-semibold text-[11px] uppercase tracking-wider">
            Inactive
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded font-semibold text-[11px] uppercase tracking-wider">
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-[#eceef0] text-[#75859d] rounded font-semibold text-[11px] uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const handleEdit = (e: React.MouseEvent, floor: Floor) => {
    e.stopPropagation();
    openEditFloorDrawer(floor);
  };

  const handleDelete = (e: React.MouseEvent, floor: Floor) => {
    e.stopPropagation();
    openDeleteFloorDialog(floor);
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-[#f7f9fb] pb-10">
      {/* Header & Controls */}
      <div className="flex-none px-8 py-6 bg-[#f7f9fb] flex flex-col gap-4 shadow-sm relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-[#75859d] font-medium">
          <span>Configuration</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Property</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">Floor</span>
        </div>

        {/* Title and Actions */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[30px] leading-[38px] font-bold text-[#191c1e] tracking-tight">
                Floors
              </h1>
              <span className="px-2.5 py-0.5 bg-[#e0e3e5] text-[#191c1e] rounded-full font-semibold text-[12px]">
                {filteredFloors.length} {filteredFloors.length === 1 ? 'Floor' : 'Floors'}
              </span>
            </div>
            <p className="text-[14px] text-[#45464d] mt-1">
              Manage floors and levels across all property buildings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync from Database Button */}
            <button
              id="sync-floors-btn"
              onClick={() => syncWithDatabase()}
              disabled={isDbSyncing}
              title="Refresh and sync floors from PostgreSQL database"
              className="bg-white hover:bg-[#eceef0] text-[#191c1e] border border-[#c6c6cd] transition-all px-3.5 py-2 rounded-lg font-medium text-[13px] flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[18px] text-[#0058be] ${isDbSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isDbSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <button
              id="add-floor-btn"
              onClick={() => openAddFloorDrawer(selectedBuildingFilter !== 'all' ? selectedBuildingFilter : undefined)}
              className="bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Floor
            </button>
          </div>
        </div>

        {/* Controls / Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 bg-[#eceef0] p-2.5 rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            {/* Building Selector */}
            <div className="relative w-64">
              <select
                id="building-filter-select"
                value={selectedBuildingFilter}
                onChange={(e) => {
                  setSelectedBuildingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white text-[#191c1e] text-[14px] px-3.5 py-2 rounded-md shadow-sm border border-transparent outline-none focus:ring-2 focus:ring-[#0058be]/20 cursor-pointer font-medium"
              >
                <option value="all">All Buildings ({floors.length} floors)</option>
                {buildings.map((b) => {
                  const count = floors.filter(
                    (f) => f.buildingId === b.id || f.buildingName.toLowerCase() === b.name.toLowerCase()
                  ).length;
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} ({count})
                    </option>
                  );
                })}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>

            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md shadow-sm text-[12px] font-medium text-[#45464d]">
              <span>Show:</span>
              {(['all', 5, 10, 25] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setRowsPerPage(opt);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-semibold ${
                    rowsPerPage === opt
                      ? 'bg-[#000000] text-white'
                      : 'hover:bg-[#f2f4f6] text-[#191c1e]'
                  }`}
                >
                  {opt === 'all' ? 'All' : opt}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsExpandedView(!isExpandedView)}
              title={isExpandedView ? 'Switch to scroll container' : 'Switch to full expanded view'}
              className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-md shadow-sm text-[12px] font-medium text-[#45464d] hover:bg-[#f8fafc] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0058be]">
                {isExpandedView ? 'expand' : 'vertical_align_center'}
              </span>
              <span>{isExpandedView ? 'Full List' : 'Scroll View'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[20px]">
              search
            </span>
            <input
              id="search-floors-input"
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by floor name, building, or description..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-md shadow-sm text-[13px] text-[#191c1e] placeholder:text-[#75859d] outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent"
            />
            {searchFilter && (
              <button
                onClick={() => {
                  setSearchFilter('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 text-[#75859d] hover:text-[#191c1e]"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-[#e0e3e5] overflow-hidden flex flex-col">
          {/* Scrollable Container with sticky header and custom visible scrollbar */}
          <div
            className={`overflow-x-auto custom-scrollbar transition-all ${
              isExpandedView
                ? 'overflow-y-visible max-h-none min-h-[360px]'
                : 'overflow-y-auto max-h-[520px] min-h-[360px]'
            }`}
          >
            <table className="w-full min-w-[780px] text-left border-collapse">
              <thead className="bg-[#eceef0] sticky top-0 z-20 shadow-xs border-b border-[#e0e3e5]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] w-[25%]">
                    Floor Name
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] w-[40%]">
                    Description
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] w-[18%]">
                    Building
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] w-[10%]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] text-right w-[7%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#191c1e] divide-y divide-[#eceef0]">
                {displayedFloors.map((floor, idx) => (
                  <tr
                    key={floor.id}
                    onClick={() => openEditFloorDrawer(floor)}
                    className={`hover:bg-[#f2f4f6] transition-colors group cursor-pointer ${
                      idx % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'
                    }`}
                  >
                    {/* Floor Name */}
                    <td className="px-6 py-4 font-semibold text-[#191c1e]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#eceef0] flex items-center justify-center text-[#45464d] group-hover:bg-[#d3e4fe] group-hover:text-[#0058be] transition-colors">
                          <span className="material-symbols-outlined text-[18px]">
                            layers
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                            {floor.name}
                          </span>
                          <span className="text-[11px] text-[#75859d]">
                            Level {floor.floorNumber || idx + 1}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-[#45464d] text-[13px] leading-relaxed">
                      {floor.description || (
                        <span className="text-[#75859d] italic">No description provided</span>
                      )}
                    </td>

                    {/* Building */}
                    <td className="px-6 py-4 font-medium text-[#191c1e]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#75859d]">
                          domain
                        </span>
                        <span>{floor.buildingName}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {renderStatusBadge(floor.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Edit floor"
                          onClick={(e) => handleEdit(e, floor)}
                          className="text-[#0058be] hover:text-[#004395] p-1.5 rounded-md hover:bg-[#0058be]/10 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          title="Delete floor"
                          onClick={(e) => handleDelete(e, floor)}
                          className="text-[#ba1a1a] hover:text-[#93000a] p-1.5 rounded-md hover:bg-[#ba1a1a]/10 transition-colors ml-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary and Scrolling Status */}
          <div className="bg-[#f7f9fb] border-t border-[#e0e3e5] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#45464d]">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#191c1e]">
                Showing {displayedFloors.length} of {filteredFloors.length} {filteredFloors.length === 1 ? 'Floor' : 'Floors'}
                {filteredFloors.length !== floors.length && ` (filtered from ${floors.length} total)`}
              </span>
              {selectedBuildingFilter !== 'all' && (
                <span className="px-2 py-0.5 bg-[#e0e3e5] text-[#45464d] rounded text-[11px] font-medium">
                  Building: {buildings.find((b) => b.id === selectedBuildingFilter)?.name || selectedBuildingFilter}
                </span>
              )}
            </div>

            {/* Pagination / Controls */}
            <div className="flex items-center gap-3">
              {rowsPerPage !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1 text-[12px]">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#c6c6cd] hover:bg-[#eceef0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="px-2 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#c6c6cd] hover:bg-[#eceef0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Next page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 text-[12px] text-[#75859d]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#0058be]">database</span>
                  <span>Database Rows: {floors.length}</span>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  All Rows Accessible
                </span>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredFloors.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#75859d] p-12">
              <div className="w-16 h-16 rounded-full bg-[#f2f4f6] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[36px] text-[#75859d]">layers</span>
              </div>
              <p className="text-[16px] font-semibold text-[#191c1e] mb-1">
                No floors found matching your criteria
              </p>
              <p className="text-[13px] text-[#45464d] text-center max-w-sm mb-4">
                {searchFilter
                  ? `No floors found matching "${searchFilter}". Try adjusting your keywords or building filter.`
                  : 'There are no floors recorded for the selected building yet.'}
              </p>
              <div className="flex items-center gap-2">
                {(searchFilter || selectedBuildingFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchFilter('');
                      setSelectedBuildingFilter('all');
                    }}
                    className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-[13px] font-medium hover:bg-[#f2f4f6] text-[#191c1e] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => openAddFloorDrawer(selectedBuildingFilter !== 'all' ? selectedBuildingFilter : undefined)}
                  className="px-4 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-medium hover:bg-[#333333] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Floor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
