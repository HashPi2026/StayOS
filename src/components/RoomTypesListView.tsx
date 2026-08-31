import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { RoomType, RoomCategory, RoomTypeStatus } from '../types';

export const RoomTypesListView: React.FC = () => {
  const {
    roomTypes,
    buildings,
    navigate,
    duplicateRoomType,
    openDeleteRoomTypeDialog,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories: ('all' | RoomCategory)[] = [
    'all',
    'Standard',
    'Deluxe',
    'Suite',
    'Executive',
  ];

  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter((rt) => {
      if (selectedCategory !== 'all' && rt.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && rt.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = rt.name.toLowerCase().includes(query);
        const matchesCode = rt.code.toLowerCase().includes(query);
        const matchesDesc = rt.description?.toLowerCase().includes(query);
        const matchesAmenity = rt.amenities?.some((a) => a.toLowerCase().includes(query));
        const matchesBed = rt.bedType?.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesAmenity && !matchesBed) {
          return false;
        }
      }
      return true;
    });
  }, [roomTypes, selectedCategory, selectedStatus, searchQuery]);

  const getStatusBadge = (status: RoomTypeStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
            Inactive
          </span>
        );
      case 'renovation':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Renovation
          </span>
        );
      default:
        return null;
    }
  };

  const getBuildingNames = (buildingIds?: string[]) => {
    if (!buildingIds || buildingIds.length === 0) return 'All Buildings';
    const names = buildingIds
      .map((id) => buildings.find((b) => b.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : 'Unassigned';
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#f7f9fb] pb-16" id="room-types-view">
      {/* Header */}
      <div className="px-8 py-6 bg-[#f7f9fb] border-b border-[#e0e3e5] sticky top-0 z-10 shadow-xs">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-1.5 text-[13px] text-[#45464d] font-medium">
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
            <span className="text-[#191c1e] font-semibold">Room Types</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-[#191c1e] tracking-tight">Room Types</h1>
              <p className="text-[14px] text-[#45464d] mt-0.5">
                Manage room types, configurations, pricing tiers, and amenities across your property.
              </p>
            </div>

            <button
              id="add-room-type-btn"
              onClick={() => navigate('add-room-type')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#000000] text-white rounded-lg text-[13px] font-semibold uppercase tracking-wider hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Room Type
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-[#e0e3e5]/70 p-1 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] font-medium focus:outline-none focus:border-[#0058be] appearance-none cursor-pointer shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="renovation">Renovation</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[18px]">
                expand_more
              </span>
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
                placeholder="Search name, code, amenity..."
                className="pl-9 pr-4 py-2 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] w-60 focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 placeholder-[#75859d] transition-all shadow-2xs"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#e0e3e5]/70 p-1 rounded-lg border border-[#c6c6cd]/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#0058be] shadow-xs' : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#0058be] shadow-xs' : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
                title="Table View"
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 pt-6">
        {filteredRoomTypes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e0e3e5] p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[48px] text-[#c6c6cd] mb-2">
              hotel
            </span>
            <h3 className="text-[16px] font-semibold text-[#191c1e]">No room types found</h3>
            <p className="text-[13px] text-[#45464d] mt-1 max-w-sm">
              We couldn't find any room types matching your current filter criteria. Try clearing search filters or add a new room type.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="mt-4 px-4 py-2 bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e0e3e5] text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoomTypes.map((rt) => (
              <div
                key={rt.id}
                className="bg-white rounded-xl border border-[#e0e3e5] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Image & Badges Banner */}
                <div className="relative h-48 w-full bg-[#e0e3e5] overflow-hidden">
                  <img
                    src={rt.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                    alt={rt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider">
                      {rt.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {getStatusBadge(rt.status)}
                  </div>

                  {/* Pricing on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[22px] font-bold tracking-tight">${rt.baseRate}</span>
                      <span className="text-[12px] opacity-80 font-normal"> / night</span>
                    </div>
                    <span className="text-[12px] font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                      {rt.totalUnits} Units
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#191c1e] group-hover:text-[#0058be] transition-colors line-clamp-1">
                        {rt.name}
                      </h3>
                      <span className="text-[12px] font-mono font-semibold text-[#45464d]">
                        {rt.code}
                      </span>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#45464d] line-clamp-2 mb-4 leading-relaxed">
                    {rt.description || 'No description available for this room type.'}
                  </p>

                  {/* Spec Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-[#45464d] bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5] mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#75859d]">bed</span>
                      <span className="truncate">{rt.bedType || '1 King Bed'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#75859d]">group</span>
                      <span>Up to {rt.capacity} Guests</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#75859d]">square_foot</span>
                      <span>{rt.sizeSqm ? `${rt.sizeSqm} m² (${rt.sizeSqft} sqft)` : '45 m²'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#75859d]">apartment</span>
                      <span className="truncate">{getBuildingNames(rt.buildingIds)}</span>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  {rt.amenities && rt.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {rt.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#eceef0] text-[#45464d] rounded text-[11px] font-medium truncate max-w-[140px]"
                          >
                            {amenity}
                          </span>
                        ))}
                        {rt.amenities.length > 3 && (
                          <span className="px-2 py-0.5 bg-[#eceef0] text-[#45464d] rounded text-[11px] font-medium">
                            +{rt.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="mt-auto pt-3 border-t border-[#e0e3e5] flex items-center justify-between">
                    <div className="text-[11px] text-[#75859d]">
                      Updated {rt.updatedAt || 'Recent'}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateRoomType(rt.id)}
                        className="p-1.5 text-[#45464d] hover:text-[#0058be] hover:bg-[#eceef0] rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Room Type"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                      <button
                        onClick={() => navigate('edit-room-type', rt.id)}
                        className="p-1.5 text-[#45464d] hover:text-[#0058be] hover:bg-[#eceef0] rounded-lg transition-colors cursor-pointer"
                        title="Edit Room Type"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteRoomTypeDialog(rt)}
                        className="p-1.5 text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Room Type"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-[#e0e3e5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f2f4f6] text-[12px] font-semibold uppercase tracking-wider text-[#45464d] border-b border-[#e0e3e5]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Room Type</th>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Bedding & Guests</th>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold text-right">Base Rate</th>
                    <th className="px-4 py-3 font-semibold text-center">Total Units</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#191c1e] divide-y divide-[#e0e3e5]">
                  {filteredRoomTypes.map((rt) => (
                    <tr
                      key={rt.id}
                      onClick={() => navigate('edit-room-type', rt.id)}
                      className="hover:bg-[#f7f9fb] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rt.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                            alt={rt.name}
                            className="w-12 h-10 rounded-lg object-cover border border-[#e0e3e5]"
                          />
                          <div>
                            <span className="font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors block">
                              {rt.name}
                            </span>
                            <span className="text-[11px] text-[#75859d] truncate block max-w-xs">
                              {getBuildingNames(rt.buildingIds)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{rt.code}</td>
                      <td className="px-4 py-3">{rt.category}</td>
                      <td className="px-4 py-3">
                        <div className="text-[12px]">
                          <div>{rt.bedType || '1 King Bed'}</div>
                          <div className="text-[#75859d]">Max {rt.capacity} guests</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px]">
                        {rt.sizeSqm ? `${rt.sizeSqm} m² / ${rt.sizeSqft} sqft` : '45 m²'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#191c1e]">
                        ${rt.baseRate} <span className="text-[11px] font-normal text-[#75859d]">/ night</span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{rt.totalUnits}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(rt.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => duplicateRoomType(rt.id)}
                            className="p-1 text-[#45464d] hover:text-[#0058be] hover:bg-[#dae2fd]/50 rounded transition-colors cursor-pointer"
                            title="Duplicate"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                          <button
                            onClick={() => navigate('edit-room-type', rt.id)}
                            className="p-1 text-[#45464d] hover:text-[#0058be] hover:bg-[#dae2fd]/50 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteRoomTypeDialog(rt)}
                            className="p-1 text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded transition-colors cursor-pointer"
                            title="Delete"
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
    </div>
  );
};
