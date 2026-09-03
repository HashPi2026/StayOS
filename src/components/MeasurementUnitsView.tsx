import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { MeasurementUnitItem } from '../types';

export const MeasurementUnitsView: React.FC = () => {
  const {
    measurementUnits,
    setEditingMeasurementUnitId,
    openDeleteMeasurementUnitDialog,
    navigate,
  } = useProperty();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUnits = measurementUnits.filter((unit) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      unit.name.toLowerCase().includes(q) ||
      unit.shortName.toLowerCase().includes(q) ||
      (unit.description && unit.description.toLowerCase().includes(q))
    );
  });

  const getUnitIcon = (unit: MeasurementUnitItem) => {
    if (unit.icon) return unit.icon;
    const name = unit.name.toLowerCase();
    if (name.includes('gram') || name.includes('kilo') || name.includes('weight') || name.includes('pound') || name.includes('ton')) return 'scale';
    if (name.includes('liter') || name.includes('liquid') || name.includes('gallon') || name.includes('fluid') || name.includes('ml')) return 'water_drop';
    if (name.includes('piece') || name.includes('unit') || name.includes('each') || name.includes('item')) return 'category';
    if (name.includes('bottle') || name.includes('can') || name.includes('drink')) return 'wine_bar';
    if (name.includes('box') || name.includes('pack') || name.includes('case') || name.includes('carton')) return 'inventory_2';
    if (name.includes('hour') || name.includes('day') || name.includes('minute') || name.includes('time')) return 'schedule';
    if (name.includes('meter') || name.includes('inch') || name.includes('foot') || name.includes('yard')) return 'straighten';
    return 'category';
  };

  const getIconColorClass = (index: number) => {
    const colorStyles = [
      'bg-[#191c1e]/10 text-[#191c1e]',
      'bg-[#0058be]/10 text-[#0058be]',
      'bg-[#6750a4]/10 text-[#6750a4]',
      'bg-[#006a6a]/10 text-[#006a6a]',
      'bg-[#9c4146]/10 text-[#9c4146]',
      'bg-[#7a5900]/10 text-[#7a5900]',
      'bg-[#006874]/10 text-[#006874]',
    ];
    return colorStyles[index % colorStyles.length];
  };

  return (
    <div className="flex flex-col w-full h-full relative" id="measurement-unit-container">
      {/* Sticky Top Header Bar */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 bg-[#f7f9fb]/90 backdrop-blur-sm sticky top-0 border-b border-[#e0e3e5] shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#76777d]">
              Configuration &gt; Measurement Units
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#eceef0] text-[#45464d]">
              {measurementUnits.length} {measurementUnits.length === 1 ? 'Unit' : 'Units'}
            </span>
          </div>
          <h1 className="text-[24px] font-semibold text-[#191c1e] tracking-tight">
            Measurement Units
          </h1>
          <p className="text-[14px] text-[#45464d] max-w-2xl">
            Manage units of measure used across the property for inventory, food &amp; beverage, and laundry tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex items-center w-64 md:w-72">
            <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[18px]">
              search
            </span>
            <input
              id="input-search-units"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search units..."
              className="w-full h-10 pl-9 pr-8 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#191c1e] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 text-[#76777d] hover:text-[#191c1e] p-0.5 rounded"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Add Unit Button */}
          <button
            id="btn-add-unit"
            onClick={() => {
              setEditingMeasurementUnitId(null);
              navigate('add-measurement-unit');
            }}
            className="h-10 px-4 bg-[#000000] text-white rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-[#1f1f1f] active:scale-[0.98] transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Unit
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 flex-1 overflow-x-auto relative z-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#e0e3e5] overflow-hidden flex flex-col w-full min-w-[760px]">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_3fr_auto] gap-4 p-4 bg-[#f2f4f6] border-b border-[#e0e3e5] text-[12px] font-semibold text-[#45464d] uppercase tracking-wider sticky top-0 z-10 select-none">
            <div className="px-2">Measurement</div>
            <div className="px-2">Short Name</div>
            <div className="px-2">Description</div>
            <div className="px-2 w-28 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {filteredUnits.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#e0e3e5]">
              {filteredUnits.map((unit, index) => {
                const icon = getUnitIcon(unit);
                const colorClass = getIconColorClass(index);

                return (
                  <div
                    key={unit.id}
                    id={`unit-row-${unit.id}`}
                    className="grid grid-cols-[2fr_1fr_3fr_auto] gap-4 p-4 items-center group hover:bg-[#f7f9fb] transition-colors bg-white"
                  >
                    {/* Measurement Name with Icon */}
                    <div className="px-2 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-[#191c1e]">
                          {unit.name}
                        </span>
                        {unit.updatedAt && (
                          <span className="text-[11px] text-[#76777d]">
                            Updated {unit.updatedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Short Name Tag */}
                    <div className="px-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#eceef0] font-mono text-[13px] font-semibold text-[#191c1e] tracking-wider border border-[#c6c6cd]/40">
                        {unit.shortName}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="px-2">
                      <p className="text-[13px] text-[#45464d] line-clamp-2" title={unit.description}>
                        {unit.description || (
                          <span className="text-[#76777d] italic">No description provided</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="px-2 w-28 flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`btn-edit-unit-${unit.id}`}
                        onClick={() => {
                          setEditingMeasurementUnitId(unit.id);
                          navigate('edit-measurement-unit');
                        }}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-[#45464d] hover:bg-[#eceef0] hover:text-[#0058be] transition-colors cursor-pointer"
                        title={`Edit ${unit.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        id={`btn-delete-unit-${unit.id}`}
                        onClick={() => openDeleteMeasurementUnitDialog(unit)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-[#45464d] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                        title={`Delete ${unit.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#eceef0] flex items-center justify-center mb-3 text-[#76777d]">
                <span className="material-symbols-outlined text-[24px]">scale</span>
              </div>
              <p className="text-[16px] font-medium text-[#191c1e]">No measurement units found</p>
              <p className="text-[13px] text-[#76777d] mt-1 max-w-sm">
                {searchTerm
                  ? `No measurement units matching "${searchTerm}". Try a different keyword.`
                  : 'Start by adding measurement units for food & beverage, laundry, or guest services.'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-3 py-1.5 rounded text-xs font-medium text-[#0058be] hover:bg-[#0058be]/10 transition-colors"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingMeasurementUnitId(null);
                    navigate('add-measurement-unit');
                  }}
                  className="mt-4 px-4 py-2 bg-[#000000] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-[#1f1f1f]"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add First Unit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
