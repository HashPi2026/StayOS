import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { BuildingStatus } from '../types';

export const BuildingDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    drawerBuilding,
    closeDrawer,
    addBuilding,
    updateBuilding,
    isBuildingNameUnique,
  } = useProperty();

  const isEdit = !!drawerBuilding;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<BuildingStatus>('active');
  const [totalFloors, setTotalFloors] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drawerBuilding) {
      setName(drawerBuilding.name);
      setDescription(drawerBuilding.description);
      setStatus(drawerBuilding.status);
      setTotalFloors(drawerBuilding.totalFloors);
      setError(null);
    } else {
      setName('');
      setDescription('');
      setStatus('active');
      setTotalFloors(1);
      setError(null);
    }
  }, [drawerBuilding, isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Building name is required.');
      return;
    }

    if (!isBuildingNameUnique(name, drawerBuilding?.id)) {
      setError('A building with this name already exists.');
      return;
    }

    if (isEdit && drawerBuilding) {
      updateBuilding(drawerBuilding.id, {
        name: name.trim(),
        description: description.trim(),
        status,
        totalFloors,
      });
    } else {
      addBuilding({
        name: name.trim(),
        description: description.trim(),
        status,
        totalFloors,
      });
    }

    closeDrawer();
  };

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className="fixed inset-0 bg-[#000000]/30 backdrop-blur-[2px] z-50 transition-opacity duration-300"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[480px] max-w-full bg-[#ffffff] shadow-2xl z-50 flex flex-col border-l border-[#c6c6cd]/50 animate-in slide-in-from-right duration-300 ease-in-out"
        id="add-building-drawer"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eceef0] bg-[#ffffff] sticky top-0 z-10">
          <h2 className="font-semibold text-title-sm text-[#191c1e]" id="drawer-title">
            {isEdit ? 'Edit Building' : 'Add Building'}
          </h2>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#eceef0] rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Graphic Element */}
          <div className="w-full h-28 rounded-xl bg-[#eceef0] overflow-hidden relative flex items-center justify-center border border-[#c6c6cd]/40">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0058be] via-transparent to-transparent" />
            <span className="material-symbols-outlined text-[44px] text-[#0058be] opacity-60 relative z-10">
              domain
            </span>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#ffffff] to-transparent" />
          </div>

          {/* Form Fields */}
          <div className="space-y-1.5">
            <label
              className="block text-label-uppercase text-[#45464d]"
              htmlFor="building-name-input"
            >
              Building Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              className={`w-full px-4 py-2.5 bg-[#ffffff] border rounded-lg text-body-md text-[#191c1e] outline-none transition-all ${
                error
                  ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                  : 'border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20'
              }`}
              id="building-name-input"
              placeholder="e.g. West Wing"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && (
              <p className="text-body-sm text-[#ba1a1a] flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {error}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className="block text-label-uppercase text-[#45464d]"
              htmlFor="building-desc-input"
            >
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-none"
              id="building-desc-input"
              placeholder="Brief description of the building's purpose or location..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-label-uppercase text-[#45464d]">Total Floors</label>
            <input
              type="number"
              min={1}
              max={150}
              className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#c6c6cd] rounded-lg text-body-md text-[#191c1e] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
              value={totalFloors}
              onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-label-uppercase text-[#45464d]">Status</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setStatus('active')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  status === 'active'
                    ? 'border-[#0058be] bg-[#d8e2ff]/30 text-[#0058be]'
                    : 'border-[#c6c6cd]/50 hover:bg-[#eceef0] text-[#191c1e]'
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-[#0058be] flex items-center justify-center">
                  {status === 'active' && <div className="w-2 h-2 rounded-full bg-[#0058be]" />}
                </div>
                <span className="text-body-md font-medium">Active</span>
              </label>

              <label
                onClick={() => setStatus('inactive')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  status === 'inactive'
                    ? 'border-[#000000] bg-[#eceef0] text-[#191c1e]'
                    : 'border-[#c6c6cd]/50 hover:bg-[#eceef0] text-[#45464d]'
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-[#75859d] flex items-center justify-center">
                  {status === 'inactive' && <div className="w-2 h-2 rounded-full bg-[#191c1e]" />}
                </div>
                <span className="text-body-md font-medium">Inactive</span>
              </label>

              <label
                onClick={() => setStatus('maintenance')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  status === 'maintenance'
                    ? 'border-[#ba1a1a] bg-[#ffdad6]/40 text-[#ba1a1a]'
                    : 'border-[#c6c6cd]/50 hover:bg-[#eceef0] text-[#45464d]'
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-[#ba1a1a] flex items-center justify-center">
                  {status === 'maintenance' && <div className="w-2 h-2 rounded-full bg-[#ba1a1a]" />}
                </div>
                <span className="text-body-md font-medium">Maintenance</span>
              </label>

              <label
                onClick={() => setStatus('closed')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  status === 'closed'
                    ? 'border-[#45464d] bg-[#e0e3e5] text-[#191c1e]'
                    : 'border-[#c6c6cd]/50 hover:bg-[#eceef0] text-[#45464d]'
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-[#75859d] flex items-center justify-center">
                  {status === 'closed' && <div className="w-2 h-2 rounded-full bg-[#45464d]" />}
                </div>
                <span className="text-body-md font-medium">Closed</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eceef0]">
            <p className="text-body-sm text-[#75859d] flex gap-2 items-start">
              <span className="material-symbols-outlined text-[16px] mt-0.5 text-[#0058be]">
                info
              </span>
              <span>
                Modifying a building's status will affect all assigned floors and rooms. Ensure dependent records are updated accordingly.
              </span>
            </p>
          </div>
        </div>

        {/* Sticky Drawer Footer */}
        <div className="p-6 border-t border-[#eceef0] bg-[#ffffff] flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            className="px-4 py-2 text-[#191c1e] text-label-uppercase border border-[#c6c6cd] rounded-lg hover:bg-[#eceef0] transition-colors cursor-pointer"
            onClick={closeDrawer}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#000000] text-white text-label-uppercase rounded-lg hover:bg-[#333333] transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
            onClick={handleSave}
          >
            {isEdit ? 'Save Changes' : 'Save Building'}
          </button>
        </div>
      </div>
    </>
  );
};
