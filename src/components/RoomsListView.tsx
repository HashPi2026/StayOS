import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { Room } from '../types';

export const RoomsListView: React.FC = () => {
  const {
    rooms,
    buildings,
    roomTypes,
    navigate,
    setSelectedRoomId,
    openDeleteRoomDialog,
  } = useProperty();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (selectedBuilding !== 'all' && r.buildingId !== selectedBuilding) {
        return false;
      }
      if (selectedRoomType !== 'all' && r.roomTypeId !== selectedRoomType) {
        return false;
      }
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(query);
        const matchesShort = r.shortName?.toLowerCase().includes(query);
        const matchesNumber = r.number?.toLowerCase().includes(query);
        const matchesType = r.roomTypeName?.toLowerCase().includes(query);
        const matchesBld = r.buildingName?.toLowerCase().includes(query);
        if (!matchesName && !matchesShort && !matchesNumber && !matchesType && !matchesBld) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, selectedBuilding, selectedRoomType, selectedStatus, searchQuery]);

  const handleEditRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    navigate('edit-room');
  };

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-blue-50 text-[#0058be] border border-blue-200">
            Occupied
          </span>
        );
      case 'reserved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
            Reserved
          </span>
        );
      case 'cleaning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-purple-50 text-purple-700 border border-purple-200">
            Cleaning
          </span>
        );
      case 'maintenance':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]">
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1360px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]" id="rooms-list-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center text-[13px] text-[#45464d] mb-1">
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
            <span className="text-[#191c1e] font-semibold">Rooms</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold text-[#191c1e] tracking-tight">Rooms</h1>
            <span className="px-2.5 py-0.5 bg-[#eceef0] text-[#45464d] text-[12px] font-semibold rounded-full">
              {filteredRooms.length} {filteredRooms.length === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
          <p className="text-[13px] text-[#45464d] mt-0.5">
            Manage individual room numbers, physical locations, inventory rules, and operational status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="bg-[#eceef0] p-0.5 rounded-lg flex items-center border border-[#e0e3e5]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#191c1e] shadow-2xs'
                  : 'text-[#75859d] hover:text-[#191c1e]'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#191c1e] shadow-2xs'
                  : 'text-[#75859d] hover:text-[#191c1e]'
              }`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
          </div>

          <button
            onClick={() => navigate('room-status')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#f2f4f6] text-[#191c1e] border border-[#c6c6cd] rounded-lg font-semibold text-[13px] tracking-wide transition-all shadow-2xs cursor-pointer"
            title="Configure room status master catalogue"
          >
            <span className="material-symbols-outlined text-[18px] text-[#000000]">fact_check</span>
            Status Master
          </button>

          <button
            id="btn-bulk-add-room"
            onClick={() => navigate('bulk-add-rooms')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#f2f4f6] text-[#191c1e] border border-[#c6c6cd] rounded-lg font-semibold text-[13px] tracking-wide transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0058be]">auto_fix_high</span>
            Bulk Add
          </button>

          <button
            id="btn-add-room-primary"
            onClick={() => navigate('add-room')}
            className="flex items-center gap-2 px-4 py-2 bg-[#000000] hover:bg-[#333333] active:scale-[0.98] text-white rounded-lg font-semibold text-[13px] uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Room
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-xs border border-[#c6c6cd]/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by room name, number, type..."
            className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] focus:bg-white text-[#191c1e] text-[13px] rounded-lg border border-transparent focus:border-[#0058be] outline-none transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] hover:text-[#191c1e]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3 py-2 bg-white text-[#191c1e] text-[13px] font-medium border border-[#c6c6cd] rounded-lg outline-none cursor-pointer hover:bg-[#f2f4f6] transition-colors"
          >
            <option value="all">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Room Type Filter */}
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="px-3 py-2 bg-white text-[#191c1e] text-[13px] font-medium border border-[#c6c6cd] rounded-lg outline-none cursor-pointer hover:bg-[#f2f4f6] transition-colors"
          >
            <option value="all">All Room Types</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white text-[#191c1e] text-[13px] font-medium border border-[#c6c6cd] rounded-lg outline-none cursor-pointer hover:bg-[#f2f4f6] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Rooms Content */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#c6c6cd]/30 shadow-xs flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#eceef0] text-[#75859d] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[28px]">meeting_room</span>
          </div>
          <h3 className="text-[16px] font-bold text-[#191c1e]">No rooms found</h3>
          <p className="text-[13px] text-[#75859d] mt-1 max-w-sm">
            {searchQuery || selectedBuilding !== 'all' || selectedRoomType !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters or search term.'
              : 'Start by adding rooms to this property.'}
          </p>
          <button
            onClick={() => navigate('add-room')}
            className="mt-4 px-4 py-2 bg-[#000000] text-white text-[13px] font-semibold rounded-lg hover:bg-[#333333] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Room
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl p-5 border border-[#c6c6cd]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[18px] font-bold text-[#191c1e] font-mono tracking-tight block">
                      {room.name || `Room ${room.number}`}
                    </span>
                    <span className="text-[12px] font-mono text-[#75859d] font-medium">
                      Short: {room.shortName || room.number}
                    </span>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                <div className="mt-3 space-y-1 text-[13px]">
                  <div className="font-semibold text-[#191c1e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0058be]">
                      bedroom_parent
                    </span>
                    {room.roomTypeName}
                  </div>
                  <div className="text-[#45464d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#75859d]">
                      domain
                    </span>
                    {room.buildingName} • Floor {room.floor}
                  </div>
                </div>

                {/* Attributes Chips */}
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-[#eceef0]">
                  {room.isHourlyRental && (
                    <span className="px-1.5 py-0.5 bg-[#f2f4f6] text-[#45464d] rounded text-[10px] font-semibold" title="Hourly Rental">
                      Hourly
                    </span>
                  )}
                  {room.isSmoking ? (
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] font-semibold flex items-center gap-0.5" title="Smoking Room">
                      <span className="material-symbols-outlined text-[12px]">smoking_rooms</span> Smoking
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-semibold" title="Non-Smoking">
                      Non-Smoking
                    </span>
                  )}
                  {room.isHandicapAccessible && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-semibold flex items-center gap-0.5" title="Accessible">
                      <span className="material-symbols-outlined text-[12px]">accessible</span> Accessible
                    </span>
                  )}
                  {room.isPetAllowed && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded text-[10px] font-semibold flex items-center gap-0.5" title="Pet Friendly">
                      <span className="material-symbols-outlined text-[12px]">pets</span> Pets
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#eceef0] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#75859d] uppercase font-semibold block">Base Rate</span>
                  <span className="font-bold text-[16px] text-[#191c1e]">${room.rate}<span className="text-[11px] text-[#75859d] font-normal">/nt</span></span>
                </div>

                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="p-1.5 rounded-lg text-[#45464d] hover:text-[#0058be] hover:bg-[#dae2fd]/40 transition-colors"
                    title="Edit Room"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteRoomDialog(room)}
                    className="p-1.5 rounded-lg text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                    title="Delete Room"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#e0e3e5] text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  <th className="px-4 py-3">Room Name</th>
                  <th className="px-4 py-3">Short Name</th>
                  <th className="px-4 py-3">Room Type</th>
                  <th className="px-4 py-3">Building & Floor</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Attributes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0] text-[13px]">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#191c1e]">
                      {room.name || `Room ${room.number}`}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-[#45464d]">
                      {room.shortName || room.number}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#191c1e]">
                      {room.roomTypeName}
                    </td>
                    <td className="px-4 py-3 text-[#45464d]">
                      {room.buildingName} (Floor {room.floor})
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#191c1e]">
                      ${room.rate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {room.isSmoking && (
                          <span className="material-symbols-outlined text-[16px] text-amber-700" title="Smoking Room">
                            smoking_rooms
                          </span>
                        )}
                        {room.isHandicapAccessible && (
                          <span className="material-symbols-outlined text-[16px] text-[#0058be]" title="Accessible">
                            accessible
                          </span>
                        )}
                        {room.isPetAllowed && (
                          <span className="material-symbols-outlined text-[16px] text-purple-700" title="Pet Friendly">
                            pets
                          </span>
                        )}
                        {room.isHourlyRental && (
                          <span className="text-[10px] font-bold px-1 bg-[#eceef0] rounded text-[#45464d]" title="Hourly">
                            HR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="p-1.5 rounded text-[#45464d] hover:text-[#0058be] hover:bg-[#dae2fd]/40 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteRoomDialog(room)}
                          className="p-1.5 rounded text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
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
        </div>
      )}
    </div>
  );
};
