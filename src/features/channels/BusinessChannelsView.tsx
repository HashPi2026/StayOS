import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

interface Channel {
  id: string;
  name: string;
  category: 'OTA' | 'GDS' | 'METASEARCH' | 'DIRECT';
  status: 'CONNECTED' | 'SYNCING' | 'PAUSED' | 'DISCONNECTED';
  markupPercent: number;
  lastSync: string;
  latencyMs: number;
  activeBookings: number;
  iconText: string;
}

export const BusinessChannelsView: React.FC = () => {
  const { addToast } = useProperty();

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'bcom',
      name: 'Booking.com',
      category: 'OTA',
      status: 'CONNECTED',
      markupPercent: 12,
      lastSync: '1 min ago',
      latencyMs: 142,
      activeBookings: 8,
      iconText: 'B.',
    },
    {
      id: 'expedia',
      name: 'Expedia Partner Central',
      category: 'OTA',
      status: 'CONNECTED',
      markupPercent: 15,
      lastSync: '3 mins ago',
      latencyMs: 188,
      activeBookings: 5,
      iconText: 'Exp',
    },
    {
      id: 'agoda',
      name: 'Agoda YCS API',
      category: 'OTA',
      status: 'CONNECTED',
      markupPercent: 12,
      lastSync: '2 mins ago',
      latencyMs: 210,
      activeBookings: 3,
      iconText: 'ago',
    },
    {
      id: 'mmt',
      name: 'MakeMyTrip / Goibibo',
      category: 'OTA',
      status: 'CONNECTED',
      markupPercent: 10,
      lastSync: 'Just now',
      latencyMs: 95,
      activeBookings: 11,
      iconText: 'MMT',
    },
    {
      id: 'bonvoy',
      name: 'Marriott Bonvoy CRS / GDS',
      category: 'GDS',
      status: 'CONNECTED',
      markupPercent: 0,
      lastSync: 'Real-time',
      latencyMs: 45,
      activeBookings: 18,
      iconText: 'MB',
    },
    {
      id: 'google',
      name: 'Google Hotel Center (Metasearch)',
      category: 'METASEARCH',
      status: 'CONNECTED',
      markupPercent: 0,
      lastSync: '1 min ago',
      latencyMs: 80,
      activeBookings: 6,
      iconText: 'G',
    },
  ]);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setChannels((prev) => prev.map((c) => ({ ...c, status: 'SYNCING' })));

    setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'CONNECTED',
          lastSync: 'Just now',
          latencyMs: Math.floor(60 + Math.random() * 80),
        }))
      );
      setIsSyncingAll(false);
      addToast('ARI (Availability, Rates & Inventory) pushed to all 6 active business channels!', 'success');
    }, 1500);
  };

  const handleUpdateMarkup = (id: string, delta: number) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, markupPercent: Math.max(0, c.markupPercent + delta) } : c
      )
    );
    addToast('Channel rate markup modifier updated', 'info');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-700">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Channels & Distribution</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                2-Way ARI Synchronizer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated two-way availability, rate parity adjustments, and instant OTA reservation ingestion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="px-4 py-2.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncingAll ? 'animate-spin' : ''}`}>
              sync
            </span>
            {isSyncingAll ? 'Pushed to 6 Channels...' : 'Sync All Channels (ARI)'}
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Active Connected Channels</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">6 / 6 Live</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Upstream Health</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Channel Production (Month)</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">51 Bookings</div>
          <div className="text-[11px] text-slate-500 mt-1">₹4,82,000 Revenue Gross</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Average Sync Latency</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">118 ms</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Sub-second Real-time</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Rate Parity Guard</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">Compliant</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero unauthorized OTA markdowns</div>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => {
          const isSyncing = channel.status === 'SYNCING';
          return (
            <div
              key={channel.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {channel.iconText}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{channel.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {channel.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isSyncing
                        ? 'bg-blue-100 text-blue-700 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isSyncing ? 'Syncing...' : 'Connected'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Latency / Speed:</span>
                    <span className="font-mono font-semibold text-slate-800">{channel.latencyMs} ms</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Last ARI Sync:</span>
                    <span className="text-slate-800 font-medium">{channel.lastSync}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Rate Markup Modifier:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <button
                        onClick={() => handleUpdateMarkup(channel.id, -1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span>+{channel.markupPercent}%</span>
                      <button
                        onClick={() => handleUpdateMarkup(channel.id, 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Active: {channel.activeBookings} bookings</span>
                <button
                  onClick={() => {
                    addToast(`Pushed immediate inventory snapshot to ${channel.name}`, 'info');
                  }}
                  className="text-[#4472C4] font-bold hover:underline"
                >
                  Force Sync &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
