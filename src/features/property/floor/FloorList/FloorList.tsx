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
  } = useProperty();

  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

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
        floor.name.toLowerCase().includes(query) ||
        floor.description.toLowerCase().includes(query) ||
        floor.buildingName.toLowerCase().includes(query);

      return matchesBuilding && matchesSearch;
    });
  }, [floors, selectedBuildingFilter, searchFilter]);

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
    <div className="flex flex-col w-full h-[calc(100vh-64px)] overflow-hidden bg-[#f7f9fb]">
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

        {/* Title and Action */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[30px] leading-[38px] font-bold text-[#191c1e] tracking-tight">
              Floors
            </h1>
            <p className="text-[14px] text-[#45464d] mt-1">
              Manage floors within each building.
            </p>
          </div>
          <button
            id="add-floor-btn"
            onClick={() => openAddFloorDrawer(selectedBuildingFilter !== 'all' ? selectedBuildingFilter : undefined)}
            className="bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-1.5 shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Floor
          </button>
        </div>

        {/* Controls / Filter Bar */}
        <div className="flex items-center gap-4 mt-2 bg-[#eceef0] p-2 rounded-lg">
          {/* Building Selector */}
          <div className="relative w-64">
            <select
              id="building-filter-select"
              value={selectedBuildingFilter}
              onChange={(e) => setSelectedBuildingFilter(e.target.value)}
              className="w-full appearance-none bg-white text-[#191c1e] text-[14px] px-3.5 py-2 rounded-md shadow-sm border border-transparent outline-none focus:ring-2 focus:ring-[#0058be]/20 cursor-pointer font-medium"
            >
              <option value="all">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm ml-auto flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[20px]">
              search
            </span>
            <input
              id="search-floors-input"
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search floors..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-md shadow-sm text-[13px] text-[#191c1e] placeholder:text-[#75859d] outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 text-[#75859d] hover:text-[#191c1e]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-[#f7f9fb] px-8 pb-8 pt-2">
        <div className="bg-white rounded-xl shadow-sm border border-[#e0e3e5] overflow-hidden flex flex-col h-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eceef0] sticky top-0 z-10 shadow-xs border-b border-[#e0e3e5]">
              <tr>
                <th className="px-6 py-3 font-semibold text-[12px] uppercase tracking-wider text-[#45464d]">
                  Floor Name
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] w-1/2">
                  Description
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] uppercase tracking-wider text-[#45464d]">
                  Building
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] uppercase tracking-wider text-[#45464d]">
                  Status
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] uppercase tracking-wider text-[#45464d] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#191c1e] divide-y divide-[#eceef0]">
              {filteredFloors.map((floor, idx) => (
                <tr
                  key={floor.id}
                  onClick={() => openEditFloorDrawer(floor)}
                  className={`hover:bg-[#f2f4f6] transition-colors group cursor-pointer ${
                    idx % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'
                  }`}
                >
                  {/* Floor Name */}
                  <td className="px-6 py-4 font-semibold text-[#191c1e]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#75859d] text-[18px] group-hover:text-[#0058be] transition-colors">
                        layers
                      </span>
                      <span>{floor.name}</span>
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
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="inline-flex items-center gap-1">
                      <button
                        title="Edit floor"
                        onClick={(e) => handleEdit(e, floor)}
                        className="text-[#0058be] hover:text-[#004395] p-1.5 rounded-full hover:bg-[#0058be]/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        title="Delete floor"
                        onClick={(e) => handleDelete(e, floor)}
                        className="text-[#ba1a1a] hover:text-[#93000a] p-1.5 rounded-full hover:bg-[#ba1a1a]/10 transition-colors ml-1"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
