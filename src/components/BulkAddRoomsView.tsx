import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { RoomStatus } from '../types';

interface GeneratedRoomPreview {
  id: string;
  roomNumber: number;
  name: string;
  shortName: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floor: number;
  floorName: string;
  roomTypeId: string;
  roomTypeName: string;
  rate: number;
  status: RoomStatus;
  isHourlyRental: boolean;
  isSmoking: boolean;
  isHandicapAccessible: boolean;
  isPetAllowed: boolean;
  includeInOccupancyAdr: boolean;
  isCrsInventory: boolean;
  conflict?: string;
}

export const BulkAddRoomsView: React.FC = () => {
  const {
    buildings,
    floors,
    roomTypes,
    rooms,
    bulkAddRooms,
    navigate,
  } = useProperty();

  // Hierarchy selection
  const [buildingId, setBuildingId] = useState<string>('');
  const [floorId, setFloorId] = useState<string>('');
  const [roomTypeId, setRoomTypeId] = useState<string>('');

  // Range inputs
  const [startNumberStr, setStartNumberStr] = useState<string>('');
  const [endNumberStr, setEndNumberStr] = useState<string>('');
  const [rangeError, setRangeError] = useState<string>('');

  // Generated preview list
  const [generatedList, setGeneratedList] = useState<GeneratedRoomPreview[]>([]);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  // Available floors for selected building
  const availableFloors = useMemo(() => {
    if (!buildingId) return [];
    return floors.filter((f) => f.buildingId === buildingId);
  }, [buildingId, floors]);

  // Selected building, floor, room type objects
  const selectedBuilding = useMemo(() => {
    return buildings.find((b) => b.id === buildingId);
  }, [buildings, buildingId]);

  const selectedFloor = useMemo(() => {
    return availableFloors.find((f) => f.id === floorId);
  }, [availableFloors, floorId]);

  const selectedRoomType = useMemo(() => {
    return roomTypes.find((rt) => rt.id === roomTypeId);
  }, [roomTypes, roomTypeId]);

  const handleBuildingChange = (bId: string) => {
    setBuildingId(bId);
    setFloorId('');
    setHasGenerated(false);
    setGeneratedList([]);
  };

  const handleFloorChange = (fId: string) => {
    setFloorId(fId);
    setHasGenerated(false);
    setGeneratedList([]);
  };

  const handleRoomTypeChange = (rtId: string) => {
    setRoomTypeId(rtId);
    setHasGenerated(false);
    setGeneratedList([]);
  };

  const handleGeneratePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRangeError('');

    if (!buildingId) {
      setRangeError('Please select a Building first.');
      return;
    }
    if (!floorId) {
      setRangeError('Please select a Floor.');
      return;
    }
    if (!roomTypeId) {
      setRangeError('Please select a Room Type.');
      return;
    }

    const startNum = parseInt(startNumberStr, 10);
    const endNum = parseInt(endNumberStr, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
      setRangeError('Please enter valid numeric start and end room numbers.');
      return;
    }

    if (startNum <= 0 || endNum <= 0) {
      setRangeError('Room numbers must be greater than 0.');
      return;
    }

    if (endNum < startNum) {
      setRangeError('End number cannot be smaller than Start number.');
      return;
    }

    const count = endNum - startNum + 1;
    if (count > 250) {
      setRangeError('Maximum 250 rooms can be generated in a single batch.');
      return;
    }

    const bld = selectedBuilding;
    const flr = selectedFloor;
    const rt = selectedRoomType;

    const numericFloor = flr?.floorNumber ?? (parseInt(flr?.name.replace(/\D/g, '') || '1', 10) || 1);

    const existingNameSet = new Set(rooms.map((r) => r.name.trim().toLowerCase()));
    const existingShortSet = new Set(rooms.map((r) => (r.shortName?.trim().toLowerCase() || r.number?.trim().toLowerCase())));

    const generated: GeneratedRoomPreview[] = [];

    for (let num = startNum; num <= endNum; num++) {
      const roomNumStr = String(num);
      const roomName = `Room ${roomNumStr}`;
      const shortName = roomNumStr;

      let conflict: string | undefined = undefined;
      if (existingNameSet.has(roomName.toLowerCase()) || existingShortSet.has(shortName.toLowerCase())) {
        conflict = 'Already exists in PMS';
      }

      generated.push({
        id: `gen-${num}-${Date.now()}`,
        roomNumber: num,
        name: roomName,
        shortName: shortName,
        buildingId,
        buildingName: bld?.name || '',
        floorId,
        floor: numericFloor,
        floorName: flr?.name || `Floor ${numericFloor}`,
        roomTypeId,
        roomTypeName: rt?.name || '',
        rate: rt?.baseRate || 200,
        status: 'available',
        isHourlyRental: false,
        isSmoking: false,
        isHandicapAccessible: false,
        isPetAllowed: false,
        includeInOccupancyAdr: true,
        isCrsInventory: true,
        conflict,
      });
    }

    setGeneratedList(generated);
    setHasGenerated(true);
  };

  const handleRemoveItem = (id: string) => {
    setGeneratedList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateRooms = () => {
    if (generatedList.length === 0) return;

    // Filter out conflicts if any or alert
    const conflicts = generatedList.filter((r) => r.conflict);
    if (conflicts.length > 0) {
      setRangeError(`Cannot create: ${conflicts.length} room(s) already exist in your inventory. Please remove them before proceeding.`);
      return;
    }

    const payload = generatedList.map((r) => ({
      name: r.name,
      shortName: r.shortName,
      number: r.shortName,
      buildingId: r.buildingId,
      buildingName: r.buildingName,
      floorId: r.floorId,
      floor: r.floor,
      floorName: r.floorName,
      roomTypeId: r.roomTypeId,
      roomTypeName: r.roomTypeName,
      rate: r.rate,
      status: r.status,
      isHourlyRental: r.isHourlyRental,
      isSmoking: r.isSmoking,
      isHandicapAccessible: r.isHandicapAccessible,
      isPetAllowed: r.isPetAllowed,
      includeInOccupancyAdr: r.includeInOccupancyAdr,
      isCrsInventory: r.isCrsInventory,
    }));

    const success = bulkAddRooms(payload);
    if (success) {
      navigate('rooms');
    }
  };

  const displayedList = showAllRows ? generatedList : generatedList.slice(0, 5);
  const totalCount = generatedList.length;
  const startNum = parseInt(startNumberStr, 10);
  const endNum = parseInt(endNumberStr, 10);
  const hasRange = !isNaN(startNum) && !isNaN(endNum) && endNum >= startNum;

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-4rem)] p-6 lg:p-8 bg-[#f7f9fb]" id="bulk-add-rooms-view">
      <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-6 pb-28">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[13px] text-[#45464d] font-medium">
            <span
              onClick={() => navigate('overview')}
              className="cursor-pointer hover:text-[#0058be] transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">chevron_right</span>
            <span
              onClick={() => navigate('overview')}
              className="cursor-pointer hover:text-[#0058be] transition-colors"
            >
              Property
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">chevron_right</span>
            <span
              onClick={() => navigate('rooms')}
              className="cursor-pointer hover:text-[#0058be] transition-colors"
            >
              Rooms
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">Bulk Add</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-[30px] font-bold text-[#191c1e] tracking-tight">Bulk Add Rooms</h1>
            <div className="flex items-center gap-2 bg-[#f2f4f6] px-3.5 py-1.5 rounded-full shadow-2xs border border-[#e0e3e5]">
              <span className="w-2 h-2 rounded-full bg-[#0058be] animate-pulse"></span>
              <span className="text-[13px] text-[#191c1e] font-medium">Draft Mode</span>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Main Column */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            {/* Section 1: Room Hierarchy */}
            <section className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e0e3e5] bg-[#f2f4f6]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#000000] text-white flex items-center justify-center font-bold text-[14px] shadow-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#191c1e]">Room Hierarchy</h2>
                    <p className="text-[13px] text-[#45464d]">Select the physical location and type for the new rooms.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Building */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                    Building <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="bulk-select-building"
                      value={buildingId}
                      onChange={(e) => handleBuildingChange(e.target.value)}
                      className="w-full appearance-none bg-white border border-[#c6c6cd] text-[#191c1e] text-[14px] font-medium rounded-lg pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="" disabled>
                        Select Building
                      </option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Floor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                    Floor <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className={`relative transition-opacity ${!buildingId ? 'opacity-50' : ''}`}>
                    <select
                      id="bulk-select-floor"
                      value={floorId}
                      disabled={!buildingId}
                      onChange={(e) => handleFloorChange(e.target.value)}
                      className={`w-full appearance-none bg-white disabled:bg-[#f2f4f6] border border-[#c6c6cd] text-[#191c1e] text-[14px] font-medium rounded-lg pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-2xs ${
                        !buildingId ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <option value="" disabled>
                        {buildingId ? 'Select Floor' : 'Select Building First'}
                      </option>
                      {availableFloors.map((fl) => (
                        <option key={fl.id} value={fl.id}>
                          {fl.name} ({fl.status})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Room Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                    Room Type <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className={`relative transition-opacity ${!floorId ? 'opacity-50' : ''}`}>
                    <select
                      id="bulk-select-room-type"
                      value={roomTypeId}
                      disabled={!floorId}
                      onChange={(e) => handleRoomTypeChange(e.target.value)}
                      className={`w-full appearance-none bg-white disabled:bg-[#f2f4f6] border border-[#c6c6cd] text-[#191c1e] text-[14px] font-medium rounded-lg pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-2xs ${
                        !floorId ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <option value="" disabled>
                        {floorId ? 'Select Room Type' : 'Select Floor First'}
                      </option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} (${rt.baseRate}/night)
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Room Range */}
            <section className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e0e3e5] bg-[#f2f4f6]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#000000] text-white flex items-center justify-center font-bold text-[14px] shadow-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#191c1e]">Room Range</h2>
                    <p className="text-[13px] text-[#45464d]">Define the numeric sequence for generation.</p>
                  </div>
                </div>

                {hasGenerated && totalCount > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#dae2fd] text-[#0058be] text-[12px] font-semibold uppercase tracking-wider shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">tag</span>
                    <span>{totalCount} Rooms Requested</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <form onSubmit={handleGeneratePreview} className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 flex flex-col gap-1.5 w-full">
                    <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Start Number <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      id="startNum"
                      type="number"
                      value={startNumberStr}
                      onChange={(e) => {
                        setStartNumberStr(e.target.value);
                        setRangeError('');
                      }}
                      placeholder="e.g., 101"
                      className="w-full bg-white border border-[#c6c6cd] text-[#191c1e] text-[14px] font-medium rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-2xs"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 w-full">
                    <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      End Number <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      id="endNum"
                      type="number"
                      value={endNumberStr}
                      onChange={(e) => {
                        setEndNumberStr(e.target.value);
                        setRangeError('');
                      }}
                      placeholder="e.g., 120"
                      className="w-full bg-white border border-[#c6c6cd] text-[#191c1e] text-[14px] font-medium rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all shadow-2xs"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <button
                      id="generateBtn"
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] font-semibold text-[13px] hover:bg-[#f2f4f6] active:bg-[#e0e3e5] transition-all shadow-2xs flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#0058be]">auto_fix_high</span>
                      Generate Preview
                    </button>
                  </div>
                </form>

                {rangeError && (
                  <div className="mt-3 p-3 bg-[#ffdad6]/60 border border-[#ffdad6] rounded-lg text-[#ba1a1a] text-[13px] font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {rangeError}
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Preview Generation Table */}
            {hasGenerated && (
              <section
                id="previewSection"
                className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 overflow-hidden animate-fade-in"
              >
                <div className="px-6 py-4 border-b border-[#e0e3e5] bg-[#f2f4f6]/60 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#191c1e]">Preview Generation</h2>
                    <span className="px-2 py-0.5 bg-[#eceef0] text-[#45464d] text-[11px] font-semibold rounded-full">
                      {totalCount} total
                    </span>
                  </div>
                  <span className="text-[13px] text-[#45464d]">Review before creation</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e0e3e5] bg-[#f7f9fb] text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                        <th className="py-3 px-6 w-16">#</th>
                        <th className="py-3 px-6">Room Name</th>
                        <th className="py-3 px-6">Short Name</th>
                        <th className="py-3 px-6">Location</th>
                        <th className="py-3 px-6 w-32 text-center">Status</th>
                        <th className="py-3 px-6 w-16 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e3e5] text-[13px] text-[#191c1e]">
                      {displayedList.map((roomItem, idx) => (
                        <tr
                          key={roomItem.id}
                          className={`hover:bg-[#f7f9fb] transition-colors group ${
                            roomItem.conflict ? 'bg-[#ffdad6]/20' : ''
                          }`}
                        >
                          <td className="py-3 px-6 text-[#75859d] font-mono">{idx + 1}</td>
                          <td className="py-3 px-6 font-semibold text-[#191c1e]">
                            {roomItem.name}
                            {roomItem.conflict && (
                              <span className="block text-[11px] text-[#ba1a1a] font-normal">
                                {roomItem.conflict}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6 font-mono font-medium text-[#45464d]">
                            {roomItem.shortName}
                          </td>
                          <td className="py-3 px-6 text-[#45464d]">
                            {roomItem.buildingName} / {roomItem.floorName}
                          </td>
                          <td className="py-3 px-6 text-center">
                            {roomItem.conflict ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-[#ffdad6] text-[#ba1a1a] tracking-wide">
                                Duplicate
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-[#dae2fd] text-[#0058be] tracking-wide">
                                New
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <button
                              onClick={() => handleRemoveItem(roomItem.id)}
                              className="text-[#75859d] hover:text-[#ba1a1a] p-1 rounded hover:bg-[#ffdad6]/50 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                              title="Exclude from batch"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalCount > 5 && (
                  <div className="p-3 border-t border-[#e0e3e5] flex justify-center bg-[#f7f9fb]">
                    <button
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="text-[#0058be] font-semibold hover:underline text-[13px] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showAllRows ? 'expand_less' : 'expand_more'}
                      </span>
                      {showAllRows ? 'Show Less' : `Show All ${totalCount} Generated Rooms`}
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div
              className={`sticky top-20 bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-6 flex flex-col gap-6 transition-all duration-300 ${
                hasGenerated && totalCount > 0 ? 'opacity-100' : 'opacity-60'
              }`}
              id="creationSummary"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#e0e3e5]">
                <span className="material-symbols-outlined text-[#0058be] text-[24px]">summarize</span>
                <h2 className="text-[16px] font-bold text-[#191c1e]">Creation Summary</h2>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-[48px] font-bold text-[#191c1e] leading-none tracking-tight" id="summaryCount">
                  {totalCount}
                </div>
                <div className="text-[13px] text-[#45464d]">Total rooms to be created</div>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex justify-between items-start">
                  <span className="text-[13px] text-[#45464d]">Location</span>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-[#191c1e]">
                      {selectedBuilding ? selectedBuilding.name : '--'}
                    </div>
                    <div className="text-[12px] text-[#45464d]">
                      {selectedFloor ? selectedFloor.name : '--'}
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-[#e0e3e5]"></div>

                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#45464d]">Room Type</span>
                  <span className="text-[13px] font-semibold text-[#191c1e]">
                    {selectedRoomType ? selectedRoomType.name : '--'}
                  </span>
                </div>

                <div className="w-full h-px bg-[#e0e3e5]"></div>

                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#45464d]">Number Range</span>
                  <span
                    className="font-mono text-[13px] font-semibold text-[#191c1e] bg-[#f2f4f6] px-2 py-0.5 rounded border border-[#e0e3e5]"
                    id="summaryRange"
                  >
                    {hasRange ? `${startNum} - ${endNum}` : '--'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#dae2fd]/40 border border-[#dae2fd] relative overflow-hidden">
                <div className="flex gap-2.5 items-start text-[13px] text-[#45464d] leading-relaxed">
                  <span className="material-symbols-outlined text-[#0058be] mt-0.5 text-[18px] shrink-0">info</span>
                  <p>
                    Upon creation, rooms will default to{' '}
                    <span className="font-semibold text-[#191c1e]">Available</span> inventory status ready for reservations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-[240px] right-0 bg-white/95 backdrop-blur-md border-t border-[#e0e3e5] px-8 py-4 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex justify-between items-center">
        <button
          onClick={() => navigate('rooms')}
          className="px-5 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          id="createBtn"
          disabled={!hasGenerated || totalCount === 0}
          onClick={handleCreateRooms}
          className={`px-6 py-2.5 rounded-lg bg-[#000000] text-white text-[13px] font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer ${
            !hasGenerated || totalCount === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#333333] active:scale-[0.98]'
          }`}
        >
          <span>{totalCount > 0 ? `Create ${totalCount} Rooms` : 'Create Rooms'}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
