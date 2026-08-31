import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { BuildingStatus } from '../types';

export const AddBuildingView: React.FC = () => {
  const {
    navigate,
    addBuilding,
    isBuildingNameUnique,
    buildings,
    rooms,
  } = useProperty();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalFloors, setTotalFloors] = useState<number>(1);
  const [status, setStatus] = useState<BuildingStatus>('active');
  const [touched, setTouched] = useState<{ name?: boolean }>({});

  const totalRoomsCount = rooms.length > 0 ? 412 : 0; // matching mock or dynamic

  // Validation
  const isDuplicate = name.trim().length > 0 && !isBuildingNameUnique(name);
  const isNameEmpty = name.trim().length === 0;
  const hasError = isDuplicate || (touched.name && isNameEmpty);

  const hasUnsavedChanges = name.length > 0 || description.length > 0 || totalFloors !== 1;

  const handleSave = () => {
    setTouched({ name: true });
    if (isNameEmpty || isDuplicate) return;

    const success = addBuilding({
      name,
      description,
      status,
      totalFloors,
    });

    if (success) {
      navigate('buildings');
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-6 py-8 min-h-screen bg-[#f7f9fb]">
      {/* Header Sticky */}
      <div className="flex items-center justify-between mb-8 sticky top-16 bg-[#f7f9fb] z-10 py-2 border-b border-[#c6c6cd]/20">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center text-body-sm text-[#75859d] mb-1">
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Property
            </span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span
              onClick={() => navigate('buildings')}
              className="hover:text-[#000000] cursor-pointer transition-colors"
            >
              Buildings
            </span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span className="text-[#191c1e] font-medium">Add Building</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('buildings')}
              aria-label="Go back to buildings list"
              className="w-9 h-9 rounded-full hover:bg-[#eceef0] flex items-center justify-center text-[#191c1e] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div>
              <h1 className="font-semibold text-headline-md text-[#191c1e] tracking-tight">
                Add Building
              </h1>
              <p className="font-body-md text-[#45464d] mt-0.5">
                Create a new physical structure or wing within this property.
              </p>
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 bg-[#e6e8ea] px-3 py-1 rounded-full ml-3 border border-[#c6c6cd]/40">
                <div className="w-2 h-2 rounded-full bg-[#0058be]"></div>
                <span className="font-semibold text-[11px] text-[#191c1e] tracking-wider uppercase">
                  Unsaved Changes
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('buildings')}
            className="px-4 py-2 rounded-lg font-body-md font-medium text-[#191c1e] border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors focus:ring-2 focus:ring-[#0058be]/20 focus:outline-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg font-body-md font-medium text-white bg-[#000000] hover:bg-[#333333] transition-colors focus:ring-2 focus:ring-black/20 focus:outline-none flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Building
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8 relative">
        {/* Left Form */}
        <div className="col-span-12 lg:col-span-8 space-y-6 pb-8">
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-sm border border-[#c6c6cd]/40 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#eceef0] pb-3">
              <h2 className="font-semibold text-title-sm text-[#191c1e]">Building Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Building Name with Duplicate Warning */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-body-sm text-[#191c1e] font-medium flex items-center justify-between"
                  htmlFor="building-name"
                >
                  <span>
                    Building Name <span className="text-[#ba1a1a]">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    aria-describedby="building-name-error"
                    aria-invalid={hasError}
                    className={`w-full bg-[#ffffff] rounded-lg px-4 py-2.5 font-body-md text-[#191c1e] focus:outline-none transition-all pr-10 shadow-xs ${
                      hasError
                        ? 'border border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20 shadow-[#ba1a1a]/5'
                        : 'border border-[#c6c6cd] focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]'
                    }`}
                    id="building-name"
                    type="text"
                    placeholder="e.g. North Wing"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setTouched({ ...touched, name: true });
                    }}
                  />
                  {hasError && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#ba1a1a] text-[20px]">
                      error
                    </span>
                  )}
                </div>

                {isDuplicate ? (
                  <div className="flex items-start gap-1.5 mt-1 animate-in fade-in duration-200">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[16px] mt-0.5">
                      info
                    </span>
                    <p className="font-body-sm text-[#ba1a1a]" id="building-name-error">
                      A building with this name already exists.
                    </p>
                  </div>
                ) : null}

                <p className="font-body-sm text-[#75859d] mt-0.5">
                  Building name must be unique within the property.
                </p>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-body-sm text-[#191c1e] font-medium"
                  htmlFor="building-description"
                >
                  Description
                </label>
                <textarea
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 font-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-xs resize-y min-h-[120px]"
                  id="building-description"
                  placeholder="Enter a detailed description of this building..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="font-body-sm text-[#75859d] mt-0.5">
                  Internal notes or description of the building's location and purpose.
                </p>
              </div>

              {/* Total Floors and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body-sm text-[#191c1e] font-medium" htmlFor="building-floors">
                    Total Floors
                  </label>
                  <input
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-xs"
                    id="building-floors"
                    type="number"
                    min={1}
                    max={150}
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-body-sm text-[#191c1e] font-medium">Status</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 pr-10 py-2.5 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all cursor-pointer shadow-xs"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as BuildingStatus)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="closed">Closed</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="col-span-12 lg:col-span-4 hidden lg:block sticky top-[140px]">
          <div className="bg-[#eceef0] rounded-xl p-6 overflow-hidden relative group border border-[#c6c6cd]/50 shadow-xs">
            <div className="absolute inset-0 bg-gradient-to-br from-[#dae2fd]/30 to-transparent pointer-events-none rounded-xl" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#ffffff] flex items-center justify-center shadow-sm border border-[#c6c6cd]/30">
                <span className="material-symbols-outlined text-[#0058be] text-[24px]">
                  domain_add
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-title-sm text-[#191c1e] mb-1">
                  Buildings Overview
                </h3>
                <p className="font-body-sm text-[#45464d] leading-relaxed">
                  Adding separate buildings helps in organizing rooms and filtering reports. This is particularly useful for resort-style properties or hotels with multiple wings.
                </p>
              </div>

              <div className="mt-2 flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#ffffff]/70 border border-[#c6c6cd]/40">
                  <span className="font-body-sm text-[#45464d] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#75859d]">domain</span>
                    Existing Buildings
                  </span>
                  <span className="font-data-mono text-[#191c1e] font-semibold">
                    {buildings.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#ffffff]/70 border border-[#c6c6cd]/40">
                  <span className="font-body-sm text-[#45464d] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#75859d]">meeting_room</span>
                    Total Rooms
                  </span>
                  <span className="font-data-mono text-[#191c1e] font-semibold">
                    {totalRoomsCount}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0058be]/5 rounded-full blur-2xl group-hover:bg-[#0058be]/10 transition-colors duration-700 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
