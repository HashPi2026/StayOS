import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { RoomStatusConfig } from '../types';

export const RoomStatusMasterView: React.FC = () => {
  const {
    roomStatuses,
    navigate,
    openAddRoomStatusDrawer,
    openEditRoomStatusDrawer,
    openDeleteRoomStatusDialog,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredStatuses = useMemo(() => {
    return roomStatuses.filter((s) => {
      if (selectedFilter === 'active' && !s.isActive) return false;
      if (selectedFilter === 'inactive' && s.isActive) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesShort = s.shortName.toLowerCase().includes(query);
        const matchesCode = s.code.toLowerCase().includes(query);
        const matchesDesc = s.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesShort && !matchesCode && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [roomStatuses, selectedFilter, searchQuery]);

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] relative overflow-x-hidden font-body-md text-[#191c1e] pb-16" id="room-status-master-view">
      {/* Header Section */}
      <div className="px-8 py-6 bg-[#f7f9fb] border-b border-[#e0e3e5] sticky top-0 z-10 shadow-xs">
        <div className="flex flex-col gap-1 mb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#45464d] font-medium">
            <span
              onClick={() => navigate('overview')}
              className="cursor-pointer hover:text-[#0058be] transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">chevron_right</span>
            <span
              onClick={() => navigate('overview')}
              className="cursor-pointer hover:text-[#0058be] transition-colors"
            >
              Property
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">chevron_right</span>
            <span
              onClick={() => navigate('rooms')}
              className="cursor-pointer hover:text-[#0058be] transition-colors"
            >
              Rooms
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">Room Status</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-[#191c1e] tracking-tight">Room Status Master</h1>
              <p className="text-[14px] text-[#45464d] mt-0.5">
                Configure operational room states, color identifiers, and workflow statuses across your property.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('rooms')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#c6c6cd] text-[#191c1e] rounded-lg text-[13px] font-semibold hover:bg-[#eceef0] active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                View Rooms Inventory
              </button>

              <button
                id="add-room-status-btn"
                onClick={openAddRoomStatusDrawer}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#000000] text-white rounded-lg text-[13px] font-semibold uppercase tracking-wider hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Status
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#e0e3e5]/70 p-1 rounded-lg">
            {(['all', 'active', 'inactive'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-all cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                {filter === 'all' ? 'All Statuses' : filter}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search status name, code..."
              className="pl-9 pr-4 py-2 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] w-64 focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 placeholder-[#75859d] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#75859d] hover:text-[#191c1e]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 pt-6 max-w-[1240px] mx-auto w-full flex flex-col gap-6">
        {/* Contextual Alert */}
        <div className="bg-[#e6e8ea] rounded-xl p-5 flex items-start gap-4 shadow-2xs border-l-4 border-[#000000]">
          <span className="material-symbols-outlined text-[#000000] text-[22px] mt-0.5 shrink-0">info</span>
          <div>
            <h2 className="text-[16px] font-bold text-[#191c1e] mb-1">Master Status Catalogue</h2>
            <p className="text-[13.5px] text-[#45464d] leading-relaxed">
              Define and manage the global room states available across your property. These statuses dictate operational workflows. Real-time application to individual rooms occurs in the <span className="font-semibold text-[#191c1e]">Property Overview</span> dashboard.
            </p>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] overflow-hidden">
          {filteredStatuses.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[44px] text-[#c6c6cd] mb-2">
                tune
              </span>
              <h3 className="text-[15px] font-semibold text-[#191c1e]">No room statuses found</h3>
              <p className="text-[13px] text-[#45464d] mt-1 max-w-sm">
                Try adjusting your search criteria or add a new room status.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e0e3e5] text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f4f6] border-b border-[#e0e3e5] text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                    <th className="px-5 py-3.5 w-16 text-left">Color</th>
                    <th className="px-5 py-3.5 text-left">Status Name</th>
                    <th className="px-5 py-3.5 w-32 text-left">Short Name</th>
                    <th className="px-5 py-3.5 w-24 text-left">Code</th>
                    <th className="px-5 py-3.5 w-36 text-left">Text Color</th>
                    <th className="px-5 py-3.5 w-28 text-left">Status</th>
                    <th className="px-5 py-3.5 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e5] text-[13px]">
                  {filteredStatuses.map((status) => (
                    <tr
                      key={status.id}
                      onClick={() => openEditRoomStatusDrawer(status)}
                      className="group hover:bg-[#f7f9fb] transition-colors cursor-pointer"
                    >
                      {/* Color Circle */}
                      <td className="px-5 py-3.5 align-middle">
                        <div
                          className="w-7 h-7 rounded-full shadow-2xs border border-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ backgroundColor: status.bgColor, opacity: status.isActive ? 1 : 0.6 }}
                          title={status.bgColor}
                        />
                      </td>

                      {/* Status Name & Description */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className={`text-[14px] font-semibold transition-colors ${status.isActive ? 'text-[#191c1e] group-hover:text-[#0058be]' : 'text-[#75859d]'}`}>
                          {status.name}
                        </div>
                        {status.description && (
                          <div className="text-[12px] text-[#75859d] mt-0.5 max-w-xl">
                            {status.description}
                          </div>
                        )}
                      </td>

                      {/* Short Name */}
                      <td className="px-5 py-3.5 align-middle">
                        <span className="inline-block font-mono text-[12px] font-semibold text-[#45464d] bg-[#eceef0] px-2.5 py-1 rounded border border-[#c6c6cd]/40">
                          {status.shortName || '--'}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-3.5 align-middle">
                        <span className={`font-mono text-[13px] font-medium ${status.isActive ? 'text-[#191c1e]' : 'text-[#75859d]'}`}>
                          {status.code}
                        </span>
                      </td>

                      {/* Text Color Swatch */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-2 text-[12px] text-[#45464d] font-mono uppercase">
                          <div
                            className="w-4 h-4 rounded-sm border border-[#c6c6cd] shadow-2xs shrink-0"
                            style={{ backgroundColor: status.textColor }}
                          />
                          <span>{status.textColor}</span>
                        </div>
                      </td>

                      {/* Active / Inactive Badge */}
                      <td className="px-5 py-3.5 align-middle">
                        {status.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#131b2e] text-[#dae2fd]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e0e3e5] text-[#45464d]">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditRoomStatusDrawer(status);
                            }}
                            className="text-[#45464d] hover:text-[#0058be] hover:bg-[#eceef0] transition-colors p-1.5 rounded-md cursor-pointer"
                            title="Edit Room Status"
                          >
                            <span className="material-symbols-outlined text-[19px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteRoomStatusDialog(status);
                            }}
                            className="text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors p-1.5 rounded-md cursor-pointer"
                            title="Delete Room Status"
                          >
                            <span className="material-symbols-outlined text-[19px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
