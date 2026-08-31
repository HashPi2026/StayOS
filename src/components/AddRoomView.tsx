import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { RoomStatus } from '../types';

export const AddRoomView: React.FC = () => {
  const {
    buildings,
    floors,
    roomTypes,
    addRoom,
    isRoomNameUnique,
    isRoomShortNameUnique,
    navigate,
  } = useProperty();

  // Identity Form State
  const [roomName, setRoomName] = useState('');
  const [shortName, setShortName] = useState('');
  const [errorRoomName, setErrorRoomName] = useState('');
  const [errorShortName, setErrorShortName] = useState('');

  // Hierarchy Form State
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [errorBuilding, setErrorBuilding] = useState('');
  const [errorFloor, setErrorFloor] = useState('');
  const [errorRoomType, setErrorRoomType] = useState('');

  // Attributes State
  const [isHourlyRental, setIsHourlyRental] = useState(false);
  const [isSmoking, setIsSmoking] = useState(false);
  const [isHandicapAccessible, setIsHandicapAccessible] = useState(false);
  const [isPetAllowed, setIsPetAllowed] = useState(false);
  const [includeInOccupancyAdr, setIncludeInOccupancyAdr] = useState(true);
  const [isCrsInventory, setIsCrsInventory] = useState(true);

  // Status & Rate
  const [status] = useState<RoomStatus>('available');

  // Available floors for selected building
  const availableFloors = useMemo(() => {
    if (!buildingId) return [];
    return floors.filter((f) => f.buildingId === buildingId);
  }, [buildingId, floors]);

  // Selected building, floor, and room type objects for path indicator
  const selectedBuilding = useMemo(() => {
    return buildings.find((b) => b.id === buildingId);
  }, [buildings, buildingId]);

  const selectedFloor = useMemo(() => {
    return availableFloors.find((f) => f.id === floorId);
  }, [availableFloors, floorId]);

  const selectedRoomType = useMemo(() => {
    return roomTypes.find((rt) => rt.id === roomTypeId);
  }, [roomTypes, roomTypeId]);

  // Handlers for inputs with validation
  const handleRoomNameChange = (val: string) => {
    setRoomName(val);
    if (!val.trim()) {
      setErrorRoomName('Room name is required');
    } else if (!isRoomNameUnique(val)) {
      setErrorRoomName('A room with this name already exists in the property');
    } else {
      setErrorRoomName('');
    }
  };

  const handleShortNameChange = (val: string) => {
    setShortName(val);
    if (!val.trim()) {
      setErrorShortName('Short name is required');
    } else if (!isRoomShortNameUnique(val)) {
      setErrorShortName('A room with this short name already exists');
    } else {
      setErrorShortName('');
    }
  };

  const handleBuildingChange = (bId: string) => {
    setBuildingId(bId);
    setErrorBuilding('');
    setFloorId(''); // Reset floor when building changes
    setErrorFloor('');
  };

  const handleFloorChange = (fId: string) => {
    setFloorId(fId);
    setErrorFloor('');
  };

  const handleRoomTypeChange = (rtId: string) => {
    setRoomTypeId(rtId);
    setErrorRoomType('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;

    if (!roomName.trim()) {
      setErrorRoomName('Room name is required');
      hasErrors = true;
    } else if (!isRoomNameUnique(roomName)) {
      setErrorRoomName('A room with this name already exists in the property');
      hasErrors = true;
    }

    if (!shortName.trim()) {
      setErrorShortName('Short name is required');
      hasErrors = true;
    } else if (!isRoomShortNameUnique(shortName)) {
      setErrorShortName('A room with this short name already exists');
      hasErrors = true;
    }

    if (!buildingId) {
      setErrorBuilding('Please select a building');
      hasErrors = true;
    }

    if (!floorId) {
      setErrorFloor('Please select a floor');
      hasErrors = true;
    }

    if (!roomTypeId) {
      setErrorRoomType('Please select a room type');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const bld = buildings.find((b) => b.id === buildingId);
    const flr = floors.find((f) => f.id === floorId);
    const rt = roomTypes.find((r) => r.id === roomTypeId);

    const numericFloor = flr?.floorNumber ?? (parseInt(flr?.name.replace(/\D/g, '') || '1', 10) || 1);

    const success = addRoom({
      name: roomName.trim(),
      shortName: shortName.trim(),
      number: shortName.trim(),
      buildingId,
      buildingName: bld?.name || '',
      floorId,
      floor: numericFloor,
      floorName: flr?.name || `Floor ${numericFloor}`,
      roomTypeId,
      roomTypeName: rt?.name || '',
      rate: rt?.baseRate || 200,
      status,
      isHourlyRental,
      isSmoking,
      isHandicapAccessible,
      isPetAllowed,
      includeInOccupancyAdr,
      isCrsInventory,
    });

    if (success) {
      navigate('rooms');
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-4rem)] p-6 lg:p-8 space-y-8 bg-[#f7f9fb]" id="add-room-view">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 max-w-4xl mx-auto w-full">
        <div className="space-y-1">
          <nav className="flex items-center text-[13px] text-[#45464d]">
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
              onClick={() => navigate('rooms')}
              className="hover:text-[#000000] transition-colors cursor-pointer"
            >
              Rooms
            </span>
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span className="text-[#191c1e] font-semibold">Add Room</span>
          </nav>
          <h1 className="text-[30px] font-bold text-[#191c1e] tracking-tight">Add Room</h1>
        </div>
        <button
          onClick={() => navigate('rooms')}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#eceef0] hover:bg-[#e0e3e5] transition-colors text-[#191c1e] rounded-lg text-[12px] font-semibold uppercase tracking-wider cursor-pointer shadow-2xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Rooms
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-4xl mx-auto w-full space-y-6 pb-32">
        {/* Section 1: Identity */}
        <section className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-[#c6c6cd]/30 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-[#e0e3e5]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#191c1e]">Identity</h2>
              <p className="text-[13px] text-[#45464d] mt-1">Define the unique identifiers for this room.</p>
            </div>
            <span className="material-symbols-outlined text-[#45464d] p-2 bg-[#eceef0] rounded-full text-[20px]">
              badge
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                Room Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="input-room-name"
                type="text"
                value={roomName}
                onChange={(e) => handleRoomNameChange(e.target.value)}
                placeholder="e.g., Suite 401"
                className={`w-full px-4 py-2.5 bg-white border ${
                  errorRoomName ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd]/60 focus:border-[#0058be]'
                } rounded-lg text-[14px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all font-medium`}
              />
              {errorRoomName && (
                <p className="text-[12px] text-[#ba1a1a] font-medium mt-1">{errorRoomName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                Short Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="input-short-name"
                type="text"
                value={shortName}
                onChange={(e) => handleShortNameChange(e.target.value)}
                placeholder="e.g., S-401"
                className={`w-full px-4 py-2.5 bg-white border ${
                  errorShortName ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd]/60 focus:border-[#0058be]'
                } rounded-lg text-[14px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all font-medium`}
              />
              {errorShortName && (
                <p className="text-[12px] text-[#ba1a1a] font-medium mt-1">{errorShortName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 p-3 bg-[#dae2fd]/40 rounded-lg text-[#0b1c30] text-[13px] border border-[#dae2fd]">
            <span className="material-symbols-outlined text-[18px] text-[#0058be]">info</span>
            <p className="font-medium">Room and Short names must be unique within the property.</p>
          </div>
        </section>

        {/* Section 2: Hierarchy */}
        <section className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-[#c6c6cd]/30 space-y-4 relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#dae2fd]/25 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start justify-between pb-3 border-b border-[#e0e3e5] relative z-10">
            <div>
              <h2 className="text-[18px] font-semibold text-[#191c1e]">Hierarchy</h2>
              <p className="text-[13px] text-[#45464d] mt-1">Assign this room to its physical and logical location.</p>
            </div>
            <span className="material-symbols-outlined text-[#45464d] p-2 bg-[#eceef0] rounded-full text-[20px]">
              account_tree
            </span>
          </div>

          {/* Progressive Path Indicator */}
          <div className="flex items-center gap-2 py-2 overflow-x-auto text-[13px] font-mono text-[#45464d] relative z-10">
            <span className={`px-2.5 py-1 rounded transition-colors ${selectedBuilding ? 'bg-[#dae2fd] text-[#0058be] font-semibold' : 'bg-[#eceef0]'}`}>
              {selectedBuilding ? selectedBuilding.name : 'Building'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d]">arrow_right_alt</span>
            <span className={`px-2.5 py-1 rounded transition-colors ${selectedFloor ? 'bg-[#dae2fd] text-[#0058be] font-semibold' : 'bg-[#eceef0] opacity-75'}`}>
              {selectedFloor ? selectedFloor.name : 'Floor'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d] opacity-75">arrow_right_alt</span>
            <span className={`px-2.5 py-1 rounded transition-colors ${selectedRoomType ? 'bg-[#dae2fd] text-[#0058be] font-semibold' : 'bg-[#eceef0] opacity-60'}`}>
              {selectedRoomType ? selectedRoomType.name : 'Room Type'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#75859d] opacity-50">arrow_right_alt</span>
            <span className="px-2.5 py-1 bg-[#000000] text-white rounded font-medium shadow-2xs">
              {shortName.trim() ? `Room ${shortName.trim()}` : 'New Room'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 relative z-10">
            {/* Building Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                Building <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-building"
                  value={buildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    errorBuilding ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd]/60 focus:border-[#0058be]'
                  } rounded-lg text-[14px] text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer font-medium`}
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
              {errorBuilding && (
                <p className="text-[12px] text-[#ba1a1a] font-medium mt-1">{errorBuilding}</p>
              )}
            </div>

            {/* Floor Dropdown */}
            <div className={`space-y-1.5 transition-opacity ${!buildingId ? 'opacity-50' : ''}`}>
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                Floor <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-floor"
                  value={floorId}
                  disabled={!buildingId}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white disabled:bg-[#f2f4f6] border ${
                    errorFloor ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd]/60 focus:border-[#0058be]'
                  } rounded-lg text-[14px] text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all ${
                    !buildingId ? 'cursor-not-allowed' : 'cursor-pointer font-medium'
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
              {errorFloor && (
                <p className="text-[12px] text-[#ba1a1a] font-medium mt-1">{errorFloor}</p>
              )}
            </div>

            {/* Room Type Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] flex items-center gap-1">
                Room Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-room-type"
                  value={roomTypeId}
                  onChange={(e) => handleRoomTypeChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    errorRoomType ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c6c6cd]/60 focus:border-[#0058be]'
                  } rounded-lg text-[14px] text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer font-medium`}
                >
                  <option value="" disabled>
                    Select Room Type
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
              {errorRoomType && (
                <p className="text-[12px] text-[#ba1a1a] font-medium mt-1">{errorRoomType}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Room Attributes */}
        <section className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-[#c6c6cd]/30 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-[#e0e3e5]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#191c1e]">Room Attributes</h2>
              <p className="text-[13px] text-[#45464d] mt-1">Configure specific features and inventory rules for this room.</p>
            </div>
            <span className="material-symbols-outlined text-[#45464d] p-2 bg-[#eceef0] rounded-full text-[20px]">
              tune
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
            {/* Toggle 1: Hourly Rental */}
            <div className="flex items-center justify-between p-3.5 hover:bg-[#f2f4f6] rounded-xl transition-colors group border border-transparent hover:border-[#e0e3e5]">
              <div className="space-y-0.5 pr-4">
                <div className="text-[14px] font-medium text-[#191c1e]">Is Hourly Rental</div>
                <div className="text-[12px] text-[#45464d]">Allow room to be booked by the hour.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="toggle-hourly-rental"
                  type="checkbox"
                  checked={isHourlyRental}
                  onChange={(e) => setIsHourlyRental(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e0e3e5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>

            {/* Toggle 2: Smoking */}
            <div className="flex items-center justify-between p-3.5 hover:bg-[#f2f4f6] rounded-xl transition-colors group border border-transparent hover:border-[#e0e3e5]">
              <div className="space-y-0.5 pr-4">
                <div className="text-[14px] font-medium text-[#191c1e] flex items-center gap-1.5">
                  Is Smoking{' '}
                  <span className="material-symbols-outlined text-[16px] text-[#45464d]">
                    smoking_rooms
                  </span>
                </div>
                <div className="text-[12px] text-[#45464d]">Designate this as a smoking room.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="toggle-smoking"
                  type="checkbox"
                  checked={isSmoking}
                  onChange={(e) => setIsSmoking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e0e3e5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>

            {/* Toggle 3: Handicap Accessible */}
            <div className="flex items-center justify-between p-3.5 hover:bg-[#f2f4f6] rounded-xl transition-colors group border border-transparent hover:border-[#e0e3e5]">
              <div className="space-y-0.5 pr-4">
                <div className="text-[14px] font-medium text-[#191c1e] flex items-center gap-1.5">
                  Is Handicap Accessible{' '}
                  <span className="material-symbols-outlined text-[16px] text-[#45464d]">
                    accessible
                  </span>
                </div>
                <div className="text-[12px] text-[#45464d]">Meets accessibility standards.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="toggle-handicap-accessible"
                  type="checkbox"
                  checked={isHandicapAccessible}
                  onChange={(e) => setIsHandicapAccessible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e0e3e5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>

            {/* Toggle 4: Pet Allowed */}
            <div className="flex items-center justify-between p-3.5 hover:bg-[#f2f4f6] rounded-xl transition-colors group border border-transparent hover:border-[#e0e3e5]">
              <div className="space-y-0.5 pr-4">
                <div className="text-[14px] font-medium text-[#191c1e] flex items-center gap-1.5">
                  Is Pet Allowed{' '}
                  <span className="material-symbols-outlined text-[16px] text-[#45464d]">
                    pets
                  </span>
                </div>
                <div className="text-[12px] text-[#45464d]">Permit pets in this specific room.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="toggle-pet-allowed"
                  type="checkbox"
                  checked={isPetAllowed}
                  onChange={(e) => setIsPetAllowed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e0e3e5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>

            {/* Toggle 5: Occupancy ADR */}
            <div className="flex items-center justify-between p-3.5 hover:bg-[#f2f4f6] rounded-xl transition-colors group border border-transparent hover:border-[#e0e3e5]">
              <div className="space-y-0.5 pr-4">
                <div className="text-[14px] font-medium text-[#191c1e]">Include in Occupancy ADR</div>
                <div className="text-[12px] text-[#45464d]">Factor into Average Daily Rate calculations.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="toggle-occupancy-adr"
                  type="checkbox"
                  checked={includeInOccupancyAdr}
                  onChange={(e) => setIncludeInOccupancyAdr(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e0e3e5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>

            {/* Toggle 6: CRS Inventory */}
            <div className="flex items-center justify-between p-3.5 hover:bg-[#f2f4f6] rounded-xl transition-colors group border border-transparent hover:border-[#e0e3e5]">
              <div className="space-y-0.5 pr-4">
                <div className="text-[14px] font-medium text-[#191c1e]">Is CRS Inventory</div>
                <div className="text-[12px] text-[#45464d]">Available for Central Reservation System.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="toggle-crs-inventory"
                  type="checkbox"
                  checked={isCrsInventory}
                  onChange={(e) => setIsCrsInventory(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e0e3e5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Sticky Footer Actions */}
        <div className="fixed bottom-0 left-[240px] right-0 bg-white/95 backdrop-blur-md border-t border-[#e0e3e5] px-8 py-4 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
            <button
              id="btn-cancel-add-room"
              type="button"
              onClick={() => navigate('rooms')}
              className="px-6 py-2.5 bg-transparent hover:bg-[#f2f4f6] transition-colors text-[#191c1e] rounded-lg text-[13px] font-semibold uppercase tracking-wider cursor-pointer border border-[#c6c6cd]/50"
            >
              Cancel
            </button>
            <button
              id="btn-save-room"
              type="submit"
              className="px-6 py-2.5 bg-[#000000] hover:bg-[#333333] active:scale-[0.98] transition-all text-white rounded-lg text-[13px] font-semibold uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Room
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
