import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';

export const RoomsView: React.FC = () => {
  const { rooms, buildings, navigate } = useProperty();
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState('all');

  const filtered = selectedBuildingFilter === 'all'
    ? rooms
    : rooms.filter((r) => r.buildingId === selectedBuildingFilter);

  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
            <span onClick={() => navigate('overview')} className="hover:text-[#000000] cursor-pointer">Configuration</span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">Rooms</span>
          </nav>
          <h1 className="text-headline-md font-semibold text-[#191c1e]">Room Inventory</h1>
          <p className="text-body-md text-[#45464d] mt-0.5">Live status and building assignments across the property.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBuildingFilter}
            onChange={(e) => setSelectedBuildingFilter(e.target.value)}
            className="px-3 py-2 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-sm text-[#191c1e] outline-none"
          >
            <option value="all">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((room) => (
          <div
            key={room.id}
            className="bg-[#ffffff] rounded-xl p-4 border border-[#c6c6cd]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[18px] font-bold text-[#191c1e] font-data-mono">
                  Room {room.number}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    room.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : room.status === 'occupied'
                      ? 'bg-[#2170e4] text-white'
                      : room.status === 'reserved'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}
                >
                  {room.status}
                </span>
              </div>
              <p className="text-[12px] text-[#45464d] font-medium">{room.roomTypeName}</p>
              <p className="text-[11px] text-[#75859d] mt-0.5">
                {room.buildingName} • Floor {room.floor}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#eceef0] flex items-center justify-between text-[12px]">
              <span className="text-[#75859d]">Rate</span>
              <span className="font-semibold text-[#191c1e]">${room.rate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AmenitiesView: React.FC = () => {
  const { amenities, navigate } = useProperty();
  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]">
      <div className="mb-6">
        <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
          <span onClick={() => navigate('overview')} className="hover:text-[#000000] cursor-pointer">Configuration</span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">Amenities</span>
        </nav>
        <h1 className="text-headline-md font-semibold text-[#191c1e]">Property Amenities</h1>
        <p className="text-body-md text-[#45464d] mt-0.5">Manage on-site facilities, spa, fitness, and dining areas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {amenities.map((am) => (
          <div key={am.id} className="bg-[#ffffff] rounded-xl p-5 border border-[#c6c6cd]/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#dae2fd] text-[#0058be] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[22px]">{am.icon}</span>
              </div>
              <h3 className="font-semibold text-title-sm text-[#191c1e]">{am.name}</h3>
              <p className="text-[12px] text-[#75859d] mt-1">{am.location}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#eceef0] flex items-center justify-between text-[12px]">
              <span className="text-[#45464d]">Hours: {am.openingHours}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                am.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#ffdad6] text-[#ba1a1a]'
              }`}>
                {am.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AuditLogsView: React.FC = () => {
  const { auditLogs, navigate } = useProperty();
  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]">
      <div className="mb-6">
        <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
          <span onClick={() => navigate('overview')} className="hover:text-[#000000] cursor-pointer">Miscellaneous</span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">Audit Logs</span>
        </nav>
        <h1 className="text-headline-md font-semibold text-[#191c1e]">Audit Logs</h1>
        <p className="text-body-md text-[#45464d] mt-0.5">Immutable record of changes, property updates, and administrative actions.</p>
      </div>

      <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#c6c6cd]/30 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6] border-b border-[#e0e3e5] text-label-uppercase text-[#45464d]">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Change Details</th>
              <th className="px-4 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e3e5] text-body-md text-[#191c1e]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#f2f4f6]/60 transition-colors">
                <td className="px-4 py-3 font-data-mono text-[12px] text-[#45464d]">{log.timestamp}</td>
                <td className="px-4 py-3 font-medium">{log.user}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                    log.action === 'CREATE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.action === 'UPDATE'
                      ? 'bg-[#dae2fd] text-[#0058be]'
                      : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-[#191c1e]">{log.module}</td>
                <td className="px-4 py-3 text-[#45464d]">{log.details}</td>
                <td className="px-4 py-3 font-data-mono text-[12px] text-[#75859d]">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SystemHealthView: React.FC = () => {
  const { navigate } = useProperty();
  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]">
      <div className="mb-6">
        <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
          <span onClick={() => navigate('overview')} className="hover:text-[#000000] cursor-pointer">Miscellaneous</span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">System Health</span>
        </nav>
        <h1 className="text-headline-md font-semibold text-[#191c1e]">System Health & Diagnostics</h1>
        <p className="text-body-md text-[#45464d] mt-0.5">Real-time status of StayOS core engines, OTA channel connectors, and database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-[#ffffff] p-5 rounded-xl border border-[#c6c6cd]/40 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-body-sm text-[#75859d]">System Uptime</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-[28px] font-bold text-[#191c1e] font-data-mono">99.98%</div>
          <p className="text-[12px] text-emerald-600 mt-1">Operational across all regions</p>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-xl border border-[#c6c6cd]/40 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-body-sm text-[#75859d]">API Response Time</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-[28px] font-bold text-[#191c1e] font-data-mono">42 ms</div>
          <p className="text-[12px] text-[#75859d] mt-1">Average PMS query latency</p>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-xl border border-[#c6c6cd]/40 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-body-sm text-[#75859d]">Channel Sync Status</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-[28px] font-bold text-[#191c1e] font-data-mono">Healthy</div>
          <p className="text-[12px] text-[#75859d] mt-1">Booking.com, Expedia, Agoda live</p>
        </div>
      </div>
    </div>
  );
};

export const GenericSettingsView: React.FC<{ title: string; subtitle: string; category: string }> = ({
  title,
  subtitle,
  category,
}) => {
  const { navigate, addToast } = useProperty();
  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]">
      <div className="mb-6">
        <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
          <span onClick={() => navigate('overview')} className="hover:text-[#000000] cursor-pointer">{category}</span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">{title}</span>
        </nav>
        <h1 className="text-headline-md font-semibold text-[#191c1e]">{title}</h1>
        <p className="text-body-md text-[#45464d] mt-0.5">{subtitle}</p>
      </div>

      <div className="bg-[#ffffff] rounded-xl p-8 border border-[#c6c6cd]/30 shadow-sm max-w-3xl">
        <div className="flex items-center gap-3 pb-4 border-b border-[#eceef0] mb-6">
          <span className="material-symbols-outlined text-[#0058be] text-[28px]">tune</span>
          <div>
            <h3 className="font-semibold text-title-sm text-[#191c1e]">{title} Configuration</h3>
            <p className="text-[12px] text-[#75859d]">Adjust system rules and defaults for this property.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-label-uppercase text-[#45464d] block mb-1.5">Default Policy Tier</label>
            <select className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] outline-none">
              <option>Standard Hospitality Tier (Recommended)</option>
              <option>Strict Non-Refundable High Season</option>
              <option>Flexible 24h Free Cancellation</option>
            </select>
          </div>

          <div>
            <label className="text-label-uppercase text-[#45464d] block mb-1.5">Automated Notifications</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0058be] rounded" />
              <span className="text-body-md text-[#191c1e]">Notify Front Desk Lead on policy overrides</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => addToast(`${title} settings updated`, 'success')}
              className="px-5 py-2.5 bg-[#000000] text-white rounded-lg text-label-uppercase hover:bg-[#333333] transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
