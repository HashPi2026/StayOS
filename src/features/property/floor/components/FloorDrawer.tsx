import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { FloorStatus } from '@/src/types';

export const FloorDrawer: React.FC = () => {
  const {
    isFloorDrawerOpen,
    drawerFloor,
    drawerDefaultBuildingId,
    closeFloorDrawer,
    buildings,
    addFloor,
    updateFloor,
    isFloorNameUnique,
  } = useProperty();

  const isEditing = !!drawerFloor;

  const [buildingId, setBuildingId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<FloorStatus>('active');
  const [errorName, setErrorName] = useState<string>('');
  const [errorBuilding, setErrorBuilding] = useState<string>('');

  useEffect(() => {
    if (isFloorDrawerOpen) {
      if (drawerFloor) {
        setBuildingId(drawerFloor.buildingId);
        setName(drawerFloor.name);
        setDescription(drawerFloor.description || '');
        setStatus(drawerFloor.status || 'active');
      } else {
        setBuildingId(drawerDefaultBuildingId || (buildings.length > 0 ? buildings[0].id : ''));
        setName('');
        setDescription('');
        setStatus('active');
      }
      setErrorName('');
      setErrorBuilding('');
    }
  }, [isFloorDrawerOpen, drawerFloor, drawerDefaultBuildingId, buildings]);

  if (!isFloorDrawerOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!val.trim()) {
      setErrorName('Floor name is required');
    } else if (buildingId && !isFloorNameUnique(val, buildingId, drawerFloor?.id)) {
      setErrorName('Floor name already exists in this building');
    } else {
      setErrorName('');
    }
  };

  const handleBuildingChange = (bId: string) => {
    setBuildingId(bId);
    setErrorBuilding('');
    if (name.trim() && !isFloorNameUnique(name, bId, drawerFloor?.id)) {
      setErrorName('Floor name already exists in this building');
    } else {
      setErrorName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buildingId) {
      setErrorBuilding('Please select a building');
      return;
    }

    if (!name.trim()) {
      setErrorName('Floor name is required');
      return;
    }

    if (!isFloorNameUnique(name, buildingId, drawerFloor?.id)) {
      setErrorName('Floor name already exists in this building');
      return;
    }

    const selectedBuilding = buildings.find((b) => b.id === buildingId);

    if (isEditing && drawerFloor) {
      const success = updateFloor(drawerFloor.id, {
        name: name.trim(),
        buildingId,
        buildingName: selectedBuilding?.name || drawerFloor.buildingName,
        description: description.trim(),
        status,
      });
      if (success) {
        closeFloorDrawer();
      }
    } else {
      const success = addFloor({
        name: name.trim(),
        buildingId,
        buildingName: selectedBuilding?.name || '',
        description: description.trim(),
        status,
      });
      if (success) {
        closeFloorDrawer();
      }
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        id="floor-drawer-overlay"
        onClick={closeFloorDrawer}
        className="fixed inset-0 bg-[#000000]/30 backdrop-blur-[2px] z-50 transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-over Container */}
      <div
        id="floor-drawer"
        className="fixed top-0 right-0 h-full w-[480px] max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#e0e3e5]"
      >
        {/* Drawer Header */}
        <div className="px-8 py-5 bg-[#eceef0] flex items-center justify-between border-b border-[#e0e3e5] relative z-10">
          <div>
            <h2 className="text-[22px] font-bold text-[#191c1e] tracking-tight">
              {isEditing ? 'Edit Floor' : 'Add Floor'}
            </h2>
            <p className="text-[12px] text-[#45464d] mt-0.5">
              {isEditing
                ? `Updating configuration for ${drawerFloor.name}`
                : 'Define a new floor level within a selected building'}
            </p>
          </div>
          <button
            onClick={closeFloorDrawer}
            className="text-[#45464d] hover:text-[#191c1e] p-1.5 rounded-full hover:bg-[#e0e3e5] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-[#eceef0] pb-2">
              <h3 className="text-[16px] font-semibold text-[#191c1e]">
                Floor Information
              </h3>
            </div>

            {/* Building Select */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1.5">
                Building <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="drawer-building-select"
                  value={buildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className={`w-full appearance-none bg-white text-[#191c1e] text-[14px] px-3.5 py-2.5 rounded-lg border ${
                    errorBuilding ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd] focus:border-[#0058be]'
                  } outline-none focus:ring-2 focus:ring-[#0058be]/20 cursor-pointer transition-colors font-medium`}
                >
                  <option value="" disabled>
                    Select a building
                  </option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
              {errorBuilding ? (
                <p className="text-[12px] text-[#ba1a1a] mt-1">{errorBuilding}</p>
              ) : (
                <p className="text-[12px] text-[#75859d] mt-1">
                  Floors must be assigned to a specific building.
                </p>
              )}
            </div>

            {/* Floor Name Input */}
            <div className={`transition-opacity ${!buildingId ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1.5">
                Floor Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="drawer-floor-name-input"
                type="text"
                value={name}
                disabled={!buildingId}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Level 3, Penthouse"
                className={`w-full bg-white disabled:bg-[#f2f4f6] text-[#191c1e] text-[14px] px-3.5 py-2.5 rounded-lg border ${
                  errorName ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd] focus:border-[#0058be]'
                } outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-colors font-medium`}
              />
              {errorName && (
                <p className="text-[12px] text-[#ba1a1a] mt-1 font-medium">{errorName}</p>
              )}
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1.5">
                Operational Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'inactive', 'maintenance'] as FloorStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 px-3 rounded-lg text-[13px] font-semibold capitalize border transition-all text-center ${
                      status === st
                        ? 'bg-[#000000] text-white border-[#000000] shadow-sm'
                        : 'bg-white text-[#45464d] border-[#c6c6cd] hover:bg-[#f2f4f6]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1.5">
                Description
              </label>
              <textarea
                id="drawer-floor-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Optional details about this floor's purpose or layout..."
                className="w-full bg-white text-[#191c1e] text-[14px] px-3.5 py-2.5 rounded-lg border border-[#c6c6cd] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-colors resize-none"
              />
            </div>

            {/* Decorative Card */}
            <div className="p-4 bg-[#eceef0]/60 border border-[#e0e3e5] rounded-xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#dae2fd] text-[#0058be] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">domain</span>
              </div>
              <div>
                <h4 className="font-semibold text-[14px] text-[#191c1e]">
                  Did you know?
                </h4>
                <p className="text-[12px] text-[#45464d] mt-0.5 leading-relaxed">
                  Organizing floors correctly ensures housekeeping and maintenance routing algorithms run at peak efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-8 mt-6 border-t border-[#eceef0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeFloorDrawer}
              className="px-5 py-2.5 rounded-lg font-semibold text-[14px] text-[#191c1e] border border-[#c6c6cd] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-semibold text-[14px] bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isEditing ? 'check' : 'add'}
              </span>
              {isEditing ? 'Save Changes' : 'Save Floor'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
