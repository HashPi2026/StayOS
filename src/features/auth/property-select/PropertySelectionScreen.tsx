import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PropertyData } from '@/src/types';

interface PropertySelectionScreenProps {
  onBackToLogin?: () => void;
}

export const PropertySelectionScreen: React.FC<PropertySelectionScreenProps> = ({ onBackToLogin }) => {
  const {
    properties,
    currentProperty,
    currentUser,
    selectPropertyAndLogin,
    logout,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'na' | 'eu' | 'apac'>('all');
  const [rememberDefault, setRememberDefault] = useState(false);
  const [hoveredPropId, setHoveredPropId] = useState<string | null>(null);

  // Filter properties based on user access and search query
  const accessibleProperties = useMemo(() => {
    let list = properties;
    if (currentUser?.accessiblePropertyIds && currentUser.accessiblePropertyIds.length > 0) {
      list = properties.filter((p) => currentUser.accessiblePropertyIds.includes(p.id));
    }

    if (selectedRegion !== 'all') {
      list = list.filter((p) => p.identity.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.identity.name.toLowerCase().includes(q) ||
          p.identity.clientId.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.location.country.toLowerCase().includes(q) ||
          (p.meta?.code && p.meta.code.toLowerCase().includes(q))
      );
    }

    return list;
  }, [properties, currentUser, selectedRegion, searchQuery]);

  // Aggregate cluster metrics
  const totalClusterRooms = useMemo(
    () => properties.reduce((acc, p) => acc + (p.meta?.totalRooms || 150), 0),
    [properties]
  );
  const avgOccupancy = useMemo(() => {
    const sum = properties.reduce((acc, p) => acc + (p.meta?.occupancyRate || 85), 0);
    return (sum / properties.length).toFixed(1);
  }, [properties]);
  const totalTodayArrivals = useMemo(
    () => properties.reduce((acc, p) => acc + (p.meta?.todayArrivals || 25), 0),
    [properties]
  );

  const handleSelect = (propertyId: string) => {
    if (rememberDefault) {
      localStorage.setItem('stayos_default_prop_id', propertyId);
    }
    selectPropertyAndLogin(propertyId);
  };

  const handleSignOut = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-[#191c1e] flex flex-col selection:bg-[#0058be]/20">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e2e4e8] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0058be] flex items-center justify-center text-white shadow-md shadow-[#0058be]/20">
            <span className="material-symbols-outlined text-[20px]">apartment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#191c1e]">StayOS</span>
            <span className="text-[17px] font-light text-[#0058be]">PMS</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[#0058be]/10 text-[#0058be] border border-[#0058be]/20">
              Enterprise Cluster
            </span>
          </div>
        </div>

        {/* User Account Capsule */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#f7f9fb] border border-[#e2e4e8] rounded-full py-1.5 px-3.5">
            <div className="w-7 h-7 rounded-full bg-[#191c1e] text-white flex items-center justify-center text-[11px] font-semibold">
              {currentUser?.initials || 'MV'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[12px] font-semibold text-[#191c1e] leading-tight">
                {currentUser?.name || 'Marcus Vance'}
              </div>
              <div className="text-[10px] text-[#75859d] leading-tight">
                {currentUser?.role || 'Front Office Director'}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#45464d] hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Switch user account or sign out"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Section Heading */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0058be] mb-1.5">
                <span className="material-symbols-outlined text-[14px]">domain_verification</span>
                Multi-Property Access Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
                Select Property to Launch
              </h1>
              <p className="text-[14px] text-[#45464d] mt-1 max-w-2xl">
                You have active credentials for {currentUser?.accessiblePropertyIds?.length || properties.length} properties in this cluster. Select a hotel to load PMS configuration, room inventories, and operational desks.
              </p>
            </div>

            {/* Quick Default Toggle */}
            <div className="flex items-center gap-2 bg-[#ffffff] border border-[#e2e4e8] px-3.5 py-2 rounded-xl text-[12px] text-[#45464d] shadow-2xs">
              <input
                id="remember-prop"
                type="checkbox"
                checked={rememberDefault}
                onChange={(e) => setRememberDefault(e.target.checked)}
                className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] cursor-pointer"
              />
              <label htmlFor="remember-prop" className="cursor-pointer select-none">
                Remember selected property as default
              </label>
            </div>
          </div>

          {/* Aggregate Cluster Status Banner */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#ffffff] border border-[#e2e4e8] rounded-2xl p-4 shadow-2xs">
            <div className="px-3 py-1 border-r border-[#e2e4e8] last:border-0">
              <span className="text-[11px] font-medium text-[#75859d] block">Connected Properties</span>
              <span className="text-[18px] font-bold text-[#191c1e] mt-0.5 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {properties.length} Hotels
              </span>
            </div>
            <div className="px-3 py-1 border-r border-[#e2e4e8] last:border-0">
              <span className="text-[11px] font-medium text-[#75859d] block">Total Room Capacity</span>
              <span className="text-[18px] font-bold text-[#191c1e] mt-0.5 block">
                {totalClusterRooms.toLocaleString()} Keys
              </span>
            </div>
            <div className="px-3 py-1 border-r border-[#e2e4e8] last:border-0">
              <span className="text-[11px] font-medium text-[#75859d] block">Portfolio Occupancy</span>
              <span className="text-[18px] font-bold text-emerald-600 mt-0.5 block">
                {avgOccupancy}% Avg
              </span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[11px] font-medium text-[#75859d] block">Today's Expected Arrivals</span>
              <span className="text-[18px] font-bold text-[#0058be] mt-0.5 block">
                {totalTodayArrivals} Guests
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          {/* Region Tabs */}
          <div className="flex items-center gap-1 bg-[#e8ebf0] p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                selectedRegion === 'all'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#5a606d] hover:text-[#191c1e]'
              }`}
            >
              All Regions ({properties.length})
            </button>
            <button
              onClick={() => setSelectedRegion('na')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                selectedRegion === 'na'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#5a606d] hover:text-[#191c1e]'
              }`}
            >
              North America
            </button>
            <button
              onClick={() => setSelectedRegion('eu')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                selectedRegion === 'eu'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#5a606d] hover:text-[#191c1e]'
              }`}
            >
              Europe
            </button>
            <button
              onClick={() => setSelectedRegion('apac')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                selectedRegion === 'apac'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#5a606d] hover:text-[#191c1e]'
              }`}
            >
              Asia Pacific
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hotel, city, or code..."
              className="w-full pl-9 pr-8 py-2 bg-[#ffffff] border border-[#e2e4e8] rounded-xl text-[13px] text-[#191c1e] placeholder:text-[#75859d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
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

        {/* Property Cards Grid */}
        {accessibleProperties.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl border border-[#e2e4e8] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f3f5f8] flex items-center justify-center mx-auto text-[#75859d] mb-3">
              <span className="material-symbols-outlined text-[24px]">domain_disabled</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#191c1e]">No properties match your filter</h3>
            <p className="text-[13px] text-[#75859d] mt-1 max-w-sm mx-auto">
              Try modifying your search keywords or switch region filter to view other properties in your cluster.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('all');
              }}
              className="mt-4 px-4 py-2 bg-[#0058be] text-white text-[12px] font-semibold rounded-xl hover:bg-[#00479b] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleProperties.map((prop) => {
              const isCurrent = prop.id === currentProperty?.id;
              const meta = prop.meta;
              const occupancy = meta?.occupancyRate || 88;
              const rooms = meta?.totalRooms || 180;
              const arrivals = meta?.todayArrivals || 28;

              return (
                <div
                  key={prop.id}
                  onMouseEnter={() => setHoveredPropId(prop.id)}
                  onMouseLeave={() => setHoveredPropId(null)}
                  className={`bg-[#ffffff] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col group ${
                    isCurrent
                      ? 'border-[#0058be] shadow-lg shadow-[#0058be]/8 ring-2 ring-[#0058be]/20'
                      : 'border-[#e2e4e8] hover:border-[#c6c6cd] hover:shadow-md'
                  }`}
                >
                  {/* Card Media Header */}
                  <div className="relative h-44 w-full bg-[#0a0f1d] overflow-hidden">
                    {meta?.imageUrl ? (
                      <img
                        src={meta.imageUrl}
                        alt={prop.identity.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 text-white/40">
                        <span className="material-symbols-outlined text-[48px]">hotel</span>
                      </div>
                    )}

                    {/* Gradient Fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {prop.identity.region.toUpperCase()} • {meta?.code || prop.identity.clientId}
                      </span>

                      {isCurrent && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0058be] text-white shadow-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Active
                        </span>
                      )}
                    </div>

                    {/* Property Name on Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium mb-0.5">
                        <span className="material-symbols-outlined text-[13px] fill-current">star</span>
                        <span>{meta?.starRating || 5}-Star Luxury Property</span>
                      </div>
                      <h3 className="text-[17px] font-bold leading-snug drop-shadow-sm text-white truncate">
                        {prop.identity.name}
                      </h3>
                      <p className="text-[12px] text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                        {prop.location.city}, {prop.location.country}
                      </p>
                    </div>
                  </div>

                  {/* Card Content & Metrics */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Operational Metrics */}
                      <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-[#f7f9fb] rounded-xl border border-[#eceef0]">
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-semibold text-[#75859d] block">Rooms</span>
                          <span className="text-[14px] font-bold text-[#191c1e] mt-0.5 block">{rooms}</span>
                        </div>
                        <div className="text-center border-x border-[#e2e4e8]">
                          <span className="text-[10px] uppercase font-semibold text-[#75859d] block">Occupancy</span>
                          <span className="text-[14px] font-bold text-emerald-600 mt-0.5 block">{occupancy}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-semibold text-[#75859d] block">Arrivals</span>
                          <span className="text-[14px] font-bold text-[#0058be] mt-0.5 block">{arrivals} Today</span>
                        </div>
                      </div>

                      {/* Occupancy Mini Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-[#75859d]">Live Room Utilization</span>
                          <span className="font-semibold text-[#191c1e]">{occupancy}% Capacity</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#e8ebf0] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupancy > 90
                                ? 'bg-emerald-500'
                                : occupancy > 75
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>

                      {/* Role & Access Info */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#f0f2f5]">
                        <span className="text-[#75859d]">Your Access Level:</span>
                        <span className="font-semibold text-[#191c1e] bg-[#f0f2f5] px-2 py-0.5 rounded-md">
                          {meta?.userRole || currentUser?.role || 'Administrator'}
                        </span>
                      </div>
                    </div>

                    {/* Launch Action CTA */}
                    <div className="pt-5 mt-2">
                      <button
                        onClick={() => handleSelect(prop.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                          isCurrent
                            ? 'bg-[#0058be] text-white hover:bg-[#00479b]'
                            : 'bg-[#191c1e] text-white hover:bg-[#0058be]'
                        }`}
                      >
                        <span>{isCurrent ? 'Continue in PMS' : 'Launch Property PMS'}</span>
                        <span className="material-symbols-outlined text-[17px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Support Info */}
        <div className="mt-12 pt-6 border-t border-[#e2e4e8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#75859d]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>StayOS Multi-Property Real-Time Cluster Engine • Active & Synchronized</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-[#0058be] hover:underline font-medium cursor-pointer"
            >
              Sign In with different account
            </button>
            <span>•</span>
            <span className="text-[#75859d]">Enterprise 2026 Edition</span>
          </div>
        </div>
      </main>
    </div>
  );
};
