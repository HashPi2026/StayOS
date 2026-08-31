import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { RoomType, RoomTypeStatus } from '../types';

export const RoomTypeDrawer: React.FC = () => {
  const {
    isRoomTypeDrawerOpen,
    drawerRoomType,
    closeRoomTypeDrawer,
    addRoomType,
    updateRoomType,
    isRoomTypeNameUnique,
    isRoomTypeCodeUnique,
    buildings,
    floors,
  } = useProperty();

  const isEditing = Boolean(drawerRoomType);

  // Form State
  const [shortName, setShortName] = useState('DLX-K');
  const [name, setName] = useState('Deluxe King');
  const [description, setDescription] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [color, setColor] = useState('#1E3A8A');
  const [overBookingLimit, setOverBookingLimit] = useState<number>(0);
  const [allowInOccupancy, setAllowInOccupancy] = useState<boolean>(true);
  const [isCrs, setIsCrs] = useState<boolean>(true);
  const [status, setStatus] = useState<RoomTypeStatus>('active');
  const [baseRate, setBaseRate] = useState<number>(250);

  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (drawerRoomType) {
      setShortName(drawerRoomType.shortName || drawerRoomType.code || '');
      setName(drawerRoomType.name || '');
      setDescription(drawerRoomType.description || '');
      setBuildingId(drawerRoomType.buildingId || (buildings.length > 0 ? buildings[0].id : ''));
      setFloorId(drawerRoomType.floorId || (floors.length > 0 ? floors[0].id : ''));
      setColor(drawerRoomType.color || '#1E3A8A');
      setOverBookingLimit(drawerRoomType.overBookingLimit ?? 0);
      setAllowInOccupancy(drawerRoomType.allowInOccupancy ?? true);
      setIsCrs(drawerRoomType.isCrs ?? true);
      setStatus(drawerRoomType.status || 'active');
      setBaseRate(drawerRoomType.baseRate || 250);
    } else {
      setShortName('');
      setName('');
      setDescription('');
      setBuildingId(buildings.length > 0 ? buildings[0].id : '');
      setFloorId(floors.length > 0 ? floors[0].id : '');
      setColor('#1E3A8A');
      setOverBookingLimit(0);
      setAllowInOccupancy(true);
      setIsCrs(true);
      setStatus('active');
      setBaseRate(250);
    }
    setTouched({});
    setErrorMessage('');
  }, [drawerRoomType, isRoomTypeDrawerOpen, buildings, floors]);

  if (!isRoomTypeDrawerOpen) return null;

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  const handleOverBookingChange = (delta: number) => {
    setOverBookingLimit((prev) => Math.max(0, prev + delta));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouched({ name: true, shortName: true });
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Room Type Name is required.');
      return;
    }
    if (!shortName.trim()) {
      setErrorMessage('Short Name is required.');
      return;
    }

    if (!isRoomTypeNameUnique(name.trim(), drawerRoomType?.id)) {
      setErrorMessage('Room Type Name already exists.');
      return;
    }

    if (!isRoomTypeCodeUnique(shortName.trim(), drawerRoomType?.id)) {
      setErrorMessage('Short Name already exists.');
      return;
    }

    const selectedBld = buildings.find((b) => b.id === buildingId);
    const selectedFlr = floors.find((f) => f.id === floorId);

    const roomTypePayload = {
      name: name.trim(),
      code: shortName.trim().toUpperCase(),
      shortName: shortName.trim().toUpperCase(),
      category: drawerRoomType?.category || 'Deluxe',
      color: color.toUpperCase(),
      description: description.trim(),
      buildingId: buildingId || undefined,
      buildingName: selectedBld?.name || undefined,
      floorId: floorId || undefined,
      floorName: selectedFlr?.name || undefined,
      overBookingLimit: Number(overBookingLimit) || 0,
      allowInOccupancy,
      isCrs,
      status,
      baseRate: Number(baseRate) || 200,
      capacity: drawerRoomType?.capacity || 2,
      bedType: drawerRoomType?.bedType || '1 King Bed',
      totalUnits: drawerRoomType?.totalUnits || 10,
    };

    if (isEditing && drawerRoomType) {
      updateRoomType(drawerRoomType.id, roomTypePayload);
    } else {
      addRoomType({
        ...roomTypePayload,
        buildingIds: buildingId ? [buildingId] : [],
        amenities: ['High-speed Wi-Fi 6', 'Rain Shower', 'Electronic In-Room Safe'],
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      });
    }

    closeRoomTypeDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/20 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeRoomTypeDrawer}
      />

      {/* Drawer */}
      <div
        id="side-drawer"
        className="relative w-full max-w-[480px] bg-white h-full shadow-[-10px_0_15px_-3px_rgba(15,23,42,0.1)] flex flex-col z-10 transition-transform duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#e0e3e5] flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-[18px] font-semibold text-[#191c1e]">
            {isEditing ? 'Edit Room Type' : 'Add Room Type'}
          </h2>
          <button
            onClick={closeRoomTypeDrawer}
            className="p-1 text-[#45464d] hover:bg-[#eceef0] rounded-full transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg text-[#ba1a1a] text-[13px] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMessage}
            </div>
          )}

          {/* Section 1: Identity */}
          <section className="space-y-3.5">
            <h3 className="text-[12px] font-semibold uppercase text-[#000000] tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></span>
              Identity
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#45464d] font-semibold uppercase">
                  Short Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. DLX-K"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none text-[13px] font-mono transition-all uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#45464d] font-semibold uppercase">
                  Room Type Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deluxe King"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none text-[13px] font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#45464d] font-semibold uppercase">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter room details..."
                rows={3}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none text-[13px] transition-all resize-none"
              />
            </div>
          </section>

          {/* Section 2: Hierarchy */}
          <section className="space-y-3.5">
            <h3 className="text-[12px] font-semibold uppercase text-[#000000] tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></span>
              Hierarchy
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1 relative">
                <label className="text-[11px] text-[#45464d] font-semibold uppercase">Building</label>
                <div className="relative">
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none text-[13px] appearance-none transition-all pr-8 cursor-pointer font-medium"
                  >
                    <option value="" disabled>Select Building</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-[11px] text-[#45464d] font-semibold uppercase">Floor</label>
                <div className="relative">
                  <select
                    value={floorId}
                    onChange={(e) => setFloorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none text-[13px] appearance-none transition-all pr-8 cursor-pointer font-medium"
                  >
                    <option value="" disabled>Select Floor</option>
                    {floors.map((fl) => (
                      <option key={fl.id} value={fl.id}>
                        {fl.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Appearance */}
          <section className="space-y-3.5">
            <h3 className="text-[12px] font-semibold uppercase text-[#000000] tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></span>
              Appearance
            </h3>

            <div className="flex items-end gap-3.5">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[11px] text-[#45464d] font-semibold uppercase">Room Type Color</label>
                <div className="flex items-center gap-2">
                  <input
                    id="color-hex"
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-32 px-3 py-2 bg-white rounded-lg border border-[#c6c6cd] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-none text-[13px] font-mono uppercase"
                  />
                  <input
                    id="color-picker"
                    type="color"
                    value={color.startsWith('#') && color.length === 7 ? color : '#1E3A8A'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-9 h-9 p-0.5 border border-[#c6c6cd] rounded-lg cursor-pointer bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#f2f4f6] px-5 py-2.5 rounded-lg flex-1 border border-[#e0e3e5]">
                <span className="text-[11px] text-[#45464d] font-semibold uppercase mb-1">Preview</span>
                <div
                  className="w-7 h-7 rounded-full shadow-inner transition-colors"
                  style={{ backgroundColor: color }}
                  id="color-preview"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Inventory */}
          <section className="space-y-3.5">
            <h3 className="text-[12px] font-semibold uppercase text-[#000000] tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></span>
              Inventory
            </h3>

            <div className="w-1/2 flex flex-col gap-1">
              <label className="text-[11px] text-[#45464d] font-semibold uppercase">Over Booking Limit</label>
              <div className="flex items-center border border-[#c6c6cd] rounded-lg overflow-hidden w-full focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[#0058be]/20 transition-all bg-white">
                <button
                  type="button"
                  onClick={() => handleOverBookingChange(-1)}
                  className="px-3 py-2 text-[#45464d] hover:bg-[#eceef0] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <input
                  type="number"
                  min="0"
                  value={overBookingLimit}
                  onChange={(e) => setOverBookingLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center py-2 bg-transparent outline-none text-[13px] font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleOverBookingChange(1)}
                  className="px-3 py-2 text-[#45464d] hover:bg-[#eceef0] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 5: System Bindings */}
          <section className="space-y-3.5 bg-[#f2f4f6] p-4 rounded-xl border border-[#e0e3e5]">
            <h3 className="text-[12px] font-semibold uppercase text-[#000000] tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></span>
              System Bindings
            </h3>

            {/* Allow In-Occupancy */}
            <div className="flex items-start justify-between py-1">
              <div className="flex flex-col pr-4">
                <span className="font-medium text-[13px] text-[#191c1e]">Allow In-Occupancy</span>
                <span className="text-[12px] text-[#45464d] mt-0.5 leading-tight">
                  Allows this room type to be used in occupancy-based calculations across reports.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={allowInOccupancy}
                  onChange={(e) => setAllowInOccupancy(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#c6c6cd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>

            <div className="w-full h-px bg-[#e0e3e5]"></div>

            {/* Synchronize with CRS */}
            <div className="flex items-start justify-between py-1">
              <div className="flex flex-col pr-4">
                <span className="font-medium text-[13px] text-[#191c1e]">Synchronize with CRS</span>
                <span className="text-[12px] text-[#45464d] mt-0.5 leading-tight">
                  Synchronizes inventory and rates for this room type with the Central Reservation System.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isCrs}
                  onChange={(e) => setIsCrs(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#c6c6cd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#e0e3e5] bg-white flex items-center justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={closeRoomTypeDrawer}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#191c1e] border border-[#c6c6cd] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[#000000] text-white hover:bg-[#333333] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
