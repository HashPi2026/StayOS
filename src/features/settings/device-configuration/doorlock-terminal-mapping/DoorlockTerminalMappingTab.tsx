import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DoorlockTerminalMappingTab: React.FC = () => {
  const { deviceConfig, rooms } = useProperty();
  const [selectedDoorlock, setSelectedDoorlock] = useState(
    deviceConfig.doorlock.doorlockSystems?.[0]?.id || ''
  );
  const [mappingSearch, setMappingSearch] = useState('');

  const systems = deviceConfig.doorlock.doorlockSystems || [];
  const currentSystem = systems.find((s) => s.id === selectedDoorlock) || systems[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-base font-semibold text-stone-900">Doorlock Terminal Mapping</h3>
          <p className="text-xs text-stone-500">Map physical room keys and door locks to network encoder terminals</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDoorlock}
            onChange={(e) => setSelectedDoorlock(e.target.value)}
            className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-stone-700"
          >
            {systems.map((sys) => (
              <option key={sys.id} value={sys.id}>
                {sys.name} ({sys.doorlockId})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-medium text-stone-700">
            Terminals assigned to {currentSystem ? currentSystem.name : 'Selected Doorlock System'}
          </div>
          <input
            type="text"
            value={mappingSearch}
            onChange={(e) => setMappingSearch(e.target.value)}
            placeholder="Filter terminals or rooms..."
            className="text-xs px-3 py-1.5 border border-stone-300 rounded-lg w-full sm:w-64 bg-white"
          />
        </div>

        <div className="divide-y divide-stone-200">
          {currentSystem?.terminals && currentSystem.terminals.length > 0 ? (
            currentSystem.terminals
              .filter((t) =>
                t.name.toLowerCase().includes(mappingSearch.toLowerCase()) ||
                t.ipAddress.includes(mappingSearch)
              )
              .map((terminal) => (
                <div key={terminal.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-stone-900">{terminal.name}</div>
                    <div className="text-xs text-stone-500">
                      IP: {terminal.ipAddress}:{terminal.port} {terminal.macAddress ? `• MAC: ${terminal.macAddress}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        terminal.status === 'Online'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {terminal.status}
                    </span>
                    <button className="text-xs text-amber-700 hover:text-amber-800 font-medium">
                      Configure
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="p-8 text-center text-xs text-stone-500">
              No terminals configured for this doorlock system yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
