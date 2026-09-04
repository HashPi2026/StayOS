import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { Building, BuildingStatus } from '@/src/types';

export const EditBuildingView: React.FC = () => {
  const {
    selectedBuildingId,
    buildings,
    updateBuilding,
    navigate,
    openDeleteDialog,
    isBuildingNameUnique,
  } = useProperty();

  const building = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

  const [name, setName] = useState(building?.name || '');
  const [description, setDescription] = useState(building?.description || '');
  const [totalFloors, setTotalFloors] = useState<number>(building?.totalFloors || 1);
  const [status, setStatus] = useState<BuildingStatus>(building?.status || 'active');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (building) {
      setName(building.name);
      setDescription(building.description);
      setTotalFloors(building.totalFloors);
      setStatus(building.status);
      setHasUnsavedChanges(false);
    }
  }, [building]);

  if (!building) {
    return (
      <div className="p-8 text-center text-[#75859d]">
        <p>No building selected.</p>
        <button
          onClick={() => navigate('buildings')}
          className="mt-4 px-4 py-2 bg-[#000000] text-white rounded-lg"
        >
          Back to Buildings
        </button>
      </div>
    );
  }

  const handleFieldChange = (setter: Function) => (e: any) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (!isBuildingNameUnique(name, building.id)) {
      alert(`A building with the name "${name}" already exists.`);
      return;
    }

    updateBuilding(building.id, {
      name: name.trim(),
      description: description.trim(),
      totalFloors: Number(totalFloors) || 1,
      status,
    });

    setHasUnsavedChanges(false);
    navigate('buildings');
  };

  const handleDelete = () => {
    openDeleteDialog(building);
  };

  return (
    <div className="flex flex-col w-full h-full pb-16 min-h-screen bg-[#f7f9fb]">
      {/* Sticky Header */}
      <div className="bg-[#ffffff] border-b border-[#eceef0] sticky top-0 z-10 shadow-xs">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1 text-body-sm text-[#75859d] mb-1">
              <span
                onClick={() => navigate('overview')}
                className="hover:text-[#000000] cursor-pointer transition-colors"
              >
                Configuration
              </span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span
                onClick={() => navigate('overview')}
                className="hover:text-[#000000] cursor-pointer transition-colors"
              >
                Property
              </span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span
                onClick={() => navigate('buildings')}
                className="hover:text-[#000000] cursor-pointer transition-colors"
              >
                Buildings
              </span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-[#191c1e] font-medium">Edit {building.name}</span>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('buildings')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#eceef0] transition-colors text-[#45464d]"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="font-semibold text-headline-md text-[#191c1e] tracking-tight">
                Edit Building
              </h1>

              {hasUnsavedChanges && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#ffdad6]/80 text-[#ba1a1a] rounded text-label-uppercase font-semibold">
                  <span className="material-symbols-outlined text-[14px]">circle</span>
                  Unsaved Changes
                </div>
              )}
            </div>
            <p className="text-body-md text-[#45464d] mt-1 ml-10">
              Modify building details and configuration.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:self-end">
            <button
              onClick={() => navigate('buildings')}
              className="px-4 py-2 rounded-lg text-body-sm font-medium text-[#191c1e] bg-[#ffffff] border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors focus:ring-2 focus:ring-[#000000]/10 outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-body-sm font-medium text-white bg-[#000000] hover:bg-[#333333] transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-[#000000]/30 outline-none shadow-sm shadow-[#000000]/10 cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section className="bg-[#ffffff] rounded-xl shadow-sm border border-[#eceef0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eceef0] bg-[#eceef0]/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#45464d]">domain</span>
              <h2 className="font-semibold text-title-sm text-[#191c1e]">Building Information</h2>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-label-uppercase text-[#45464d]" htmlFor="building-name">
                  Building Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all placeholder:text-[#75859d]"
                  id="building-name"
                  placeholder="e.g. South Tower"
                  type="text"
                  value={name}
                  onChange={handleFieldChange(setName)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-label-uppercase text-[#45464d]"
                  htmlFor="building-description"
                >
                  Description
                </label>
                <textarea
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all resize-none placeholder:text-[#75859d]"
                  id="building-description"
                  placeholder="Add a description for this building..."
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={handleFieldChange(setDescription)}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-[#75859d]">Internal use only</span>
                  <span className="text-[11px] text-[#75859d] font-data-mono">
                    {description.length}/500
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-label-uppercase text-[#45464d]"
                    htmlFor="building-floors"
                  >
                    Total Floors
                  </label>
                  <input
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all placeholder:text-[#75859d]"
                    id="building-floors"
                    type="number"
                    min={1}
                    max={150}
                    value={totalFloors}
                    onChange={(e) => {
                      setTotalFloors(parseInt(e.target.value) || 1);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label-uppercase text-[#45464d]">Status</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 pr-10 py-2.5 text-body-md text-[#191c1e] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none transition-all cursor-pointer"
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as BuildingStatus);
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* System Info Card */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#eceef0] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#eceef0] bg-[#eceef0]/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#45464d]">info</span>
              <h3 className="text-body-md font-semibold text-[#191c1e]">System Info</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center py-2 border-b border-[#eceef0] border-dashed">
                <span className="text-body-sm text-[#45464d]">Building ID</span>
                <span className="font-data-mono text-[#191c1e] font-medium bg-[#eceef0] px-2 py-0.5 rounded text-[12px]">
                  {building.code}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#eceef0] border-dashed">
                <span className="text-body-sm text-[#45464d]">Created</span>
                <span className="text-body-sm text-[#191c1e] font-medium">
                  {building.createdAt}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#eceef0] border-dashed">
                <span className="text-body-sm text-[#45464d]">Last Updated</span>
                <span className="text-body-sm text-[#191c1e] font-medium">
                  {building.updatedAt}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-body-sm text-[#45464d]">Updated By</span>
                <span className="text-body-sm text-[#191c1e] font-medium flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#131b2e] text-[#dae2fd] flex items-center justify-center text-[10px] font-bold">
                    {building.updatedBy?.initials || 'JS'}
                  </div>
                  {building.updatedBy?.name || 'Jane Smith'}
                </span>
              </div>
            </div>
          </div>

          {/* Deletion Protection Card */}
          <div className="bg-[#eceef0] rounded-xl p-5 flex flex-col gap-2.5 border border-[#c6c6cd]/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#000000]/5 rounded-full blur-xl group-hover:bg-[#000000]/10 transition-colors duration-500" />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-[#ffffff] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px] text-[#000000]">warning</span>
              </div>
              <h4 className="text-body-md font-semibold text-[#191c1e]">Deletion Protection</h4>
            </div>
            <p className="text-body-sm text-[#45464d] relative z-10 leading-relaxed">
              This building cannot be deleted because it has active rooms associated with it. You must reassign or remove all rooms first.
            </p>
            <button
              onClick={handleDelete}
              className="mt-2 self-start text-body-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6] px-2.5 py-1 rounded transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete Building
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
