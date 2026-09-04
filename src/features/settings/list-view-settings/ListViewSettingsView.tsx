import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const ListViewSettingsView: React.FC = () => {
  const [defaultPageSize, setDefaultPageSize] = useState('25');
  const [isCompactDensity, setIsCompactDensity] = useState(false);
  const [showStatusIcons, setShowStatusIcons] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-serif font-semibold text-stone-900">List View Settings</h2>
          <p className="text-xs text-stone-500">Configure global defaults for tables, columns, and data density across the PMS</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
        >
          {savedNotice ? 'Saved Preferences' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-semibold text-stone-900">Display Density & Layout</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Default Records Per Page
            </label>
            <select
              value={defaultPageSize}
              onChange={(e) => setDefaultPageSize(e.target.value)}
              className="w-full text-xs border border-stone-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="10">10 records</option>
              <option value="25">25 records (recommended)</option>
              <option value="50">50 records</option>
              <option value="100">100 records</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <div className="text-xs font-medium text-stone-900">Compact Cell Density</div>
              <div className="text-[11px] text-stone-500">Reduce table row height for dense data screens</div>
            </div>
            <input
              type="checkbox"
              checked={isCompactDensity}
              onChange={(e) => setIsCompactDensity(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <div className="text-xs font-medium text-stone-900">Show Status Color Badges</div>
              <div className="text-[11px] text-stone-500">Display high-contrast visual badges next to room & booking rows</div>
            </div>
            <input
              type="checkbox"
              checked={showStatusIcons}
              onChange={(e) => setShowStatusIcons(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
