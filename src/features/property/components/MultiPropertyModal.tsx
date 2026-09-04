import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const MultiPropertyModal: React.FC = () => {
  const {
    properties,
    currentProperty,
    switchProperty,
    isMultiPropertyModalOpen,
    setMultiPropertyModalOpen,
    currentUser,
  } = useProperty();

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'na' | 'eu' | 'apac'>('all');

  if (!isMultiPropertyModalOpen) return null;

  const filteredProperties = properties.filter((p) => {
    const matchesRegion = regionFilter === 'all' || p.identity.region === regionFilter;
    const matchesSearch =
      !search ||
      p.identity.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.city.toLowerCase().includes(search.toLowerCase()) ||
      (p.meta?.code && p.meta.code.toLowerCase().includes(search.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d14]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-[#ffffff] rounded-2xl shadow-2xl border border-[#c6c6cd]/50 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#eceef0] flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0058be] flex items-center justify-center text-white shadow-md shadow-[#0058be]/20">
              <span className="material-symbols-outlined text-[22px]">domain</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#191c1e]">Multi-Property Cluster Portfolio</h2>
              <p className="text-[12px] text-[#75859d]">
                Switch active hotel workspace or review operational performance across your cluster
              </p>
            </div>
          </div>
          <button
            onClick={() => setMultiPropertyModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#75859d] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-[#eceef0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                regionFilter === 'all'
                  ? 'bg-[#0058be] text-white'
                  : 'bg-[#f0f2f5] text-[#45464d] hover:bg-[#e4e7eb]'
              }`}
            >
              All Properties ({properties.length})
            </button>
            <button
              onClick={() => setRegionFilter('na')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                regionFilter === 'na'
                  ? 'bg-[#0058be] text-white'
                  : 'bg-[#f0f2f5] text-[#45464d] hover:bg-[#e4e7eb]'
              }`}
            >
              North America
            </button>
            <button
              onClick={() => setRegionFilter('eu')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                regionFilter === 'eu'
                  ? 'bg-[#0058be] text-white'
                  : 'bg-[#f0f2f5] text-[#45464d] hover:bg-[#e4e7eb]'
              }`}
            >
              Europe
            </button>
            <button
              onClick={() => setRegionFilter('apac')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                regionFilter === 'apac'
                  ? 'bg-[#0058be] text-white'
                  : 'bg-[#f0f2f5] text-[#45464d] hover:bg-[#e4e7eb]'
              }`}
            >
              Asia Pacific
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[17px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10"
            />
          </div>
        </div>

        {/* Property Grid List */}
        <div className="p-6 overflow-y-auto max-h-[60vh] divide-y divide-[#eceef0]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProperties.map((prop) => {
              const isActive = prop.id === currentProperty.id;
              const meta = prop.meta;
              return (
                <div
                  key={prop.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-[#0058be] bg-[#f0f5ff] ring-1 ring-[#0058be]/30'
                      : 'border-[#e2e4e8] bg-white hover:border-[#c6c6cd] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-900 relative">
                      {meta?.imageUrl ? (
                        <img
                          src={meta.imageUrl}
                          alt={prop.identity.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <span className="material-symbols-outlined text-[24px]">hotel</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e8ebf0] text-[#45464d]">
                          {meta?.code || prop.identity.clientId}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-[#0058be] bg-[#0058be]/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]" />
                            Current Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-[14px] font-bold text-[#191c1e] mt-1 truncate">
                        {prop.identity.name}
                      </h4>
                      <p className="text-[11px] text-[#75859d] flex items-center gap-1 truncate mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {prop.location.city}, {prop.location.country}
                      </p>
                    </div>
                  </div>

                  {/* Property Quick Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#eceef0]/80 text-[11px]">
                    <div>
                      <span className="text-[#75859d] block">Total Keys</span>
                      <span className="font-bold text-[#191c1e]">{meta?.totalRooms || 160}</span>
                    </div>
                    <div>
                      <span className="text-[#75859d] block">Occupancy</span>
                      <span className="font-bold text-emerald-600">{meta?.occupancyRate || 88}%</span>
                    </div>
                    <div>
                      <span className="text-[#75859d] block">Today Check-ins</span>
                      <span className="font-bold text-[#0058be]">{meta?.todayArrivals || 25}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2">
                    {isActive ? (
                      <div className="w-full py-1.5 text-center text-[12px] font-semibold text-[#0058be] bg-[#0058be]/10 rounded-lg">
                        Currently Working In This Hotel
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          switchProperty(prop.id);
                          setMultiPropertyModalOpen(false);
                        }}
                        className="w-full py-1.5 bg-[#191c1e] hover:bg-[#0058be] text-white text-[12px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Switch to this Property</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f7f9fb] border-t border-[#eceef0] flex items-center justify-between text-[12px] text-[#75859d]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>StayOS Cluster Sync: 5 hotel nodes online</span>
          </div>
          <button
            onClick={() => setMultiPropertyModalOpen(false)}
            className="px-4 py-1.5 bg-[#ffffff] border border-[#c6c6cd] text-[#191c1e] rounded-lg hover:bg-[#eceef0] transition-colors font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
