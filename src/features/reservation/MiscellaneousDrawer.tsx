import React, { useState } from 'react';
import { VehicleItem, SharedGuestItem } from './types';

interface MiscellaneousDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleItem[];
  onUpdateVehicles: (vehicles: VehicleItem[]) => void;
  sharedGuests: SharedGuestItem[];
  onUpdateSharedGuests: (guests: SharedGuestItem[]) => void;
  folioNumber?: string;
}

export const MiscellaneousDrawer: React.FC<MiscellaneousDrawerProps> = ({
  isOpen,
  onClose,
  vehicles,
  onUpdateVehicles,
  sharedGuests,
  onUpdateSharedGuests,
  folioNumber = 'MET-2026-8841',
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'guests'>('vehicles');
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState<Partial<VehicleItem>>({
    makeModel: '',
    plate: '',
    state: 'CA',
    color: '',
    parkingType: 'Valet',
    stallOrBay: '',
    keyPeg: '',
  });

  // New guest form state
  const [newGuest, setNewGuest] = useState<Partial<SharedGuestItem>>({
    name: '',
    relationship: 'Guest',
    phone: '',
    email: '',
    idDocument: '',
    keycardStatus: 'Keycard Authorized',
  });

  if (!isOpen) return null;

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.makeModel || !newVehicle.plate) return;

    const item: VehicleItem = {
      id: `veh-${Date.now()}`,
      makeModel: newVehicle.makeModel,
      plate: newVehicle.plate.toUpperCase(),
      state: newVehicle.state || 'CA',
      color: newVehicle.color || 'Silver',
      isPrimary: vehicles.length === 0,
      parkingType: newVehicle.parkingType || 'Valet',
      stallOrBay: newVehicle.stallOrBay || (newVehicle.parkingType === 'Valet' ? 'Bay B2-18' : 'North Garage #204'),
      keyPeg: newVehicle.keyPeg || (newVehicle.parkingType === 'Valet' ? '#V-92' : undefined),
    };

    onUpdateVehicles([...vehicles, item]);
    setNewVehicle({
      makeModel: '',
      plate: '',
      state: 'CA',
      color: '',
      parkingType: 'Valet',
      stallOrBay: '',
      keyPeg: '',
    });
    setIsAddingVehicle(false);
  };

  const handleDeleteVehicle = (id: string) => {
    onUpdateVehicles(vehicles.filter((v) => v.id !== id));
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.name) return;

    const item: SharedGuestItem = {
      id: `gst-${Date.now()}`,
      name: newGuest.name,
      relationship: newGuest.relationship || 'Accompanying',
      isPrimary: false,
      phone: newGuest.phone || '+1 (212) 555-0100',
      email: newGuest.email || '',
      idDocument: newGuest.idDocument || 'DL Verified',
      keycardStatus: 'Keycard Authorized',
    };

    onUpdateSharedGuests([...sharedGuests, item]);
    setNewGuest({
      name: '',
      relationship: 'Guest',
      phone: '',
      email: '',
      idDocument: '',
      keycardStatus: 'Keycard Authorized',
    });
    setIsAddingGuest(false);
  };

  const handleDeleteGuest = (id: string) => {
    onUpdateSharedGuests(sharedGuests.filter((g) => g.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Backdrop Click Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col z-50 border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#4472C4] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px]">tune</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Miscellaneous Information</h2>
                <span className="text-[11px] font-mono font-semibold text-[#4472C4]">
                  Folio #{folioNumber} Attached
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              title="Close Drawer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
            <span className="material-symbols-outlined text-[14px] text-[#4472C4]">info</span>
            <span>Non-Step Contextual Utility • Always accessible across Steps 1–4</span>
          </div>

          {/* Sub-tabs for Vehicle vs Shared Guests */}
          <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-1 rounded-lg mt-1">
            <button
              type="button"
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-white shadow-xs text-[#4472C4]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">directions_car</span>
              <span>Vehicles ({vehicles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guests')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                activeTab === 'guests'
                  ? 'bg-white shadow-xs text-[#4472C4]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>Shared Guests ({sharedGuests.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {activeTab === 'vehicles' ? (
            /* ================= VEHICLES SECTION ================= */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4472C4] text-[20px]">directions_car</span>
                  <h3 className="text-sm font-bold text-slate-900">Vehicle Registration</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#4472C4] text-[11px] font-mono font-bold">
                    {vehicles.length} Vehicles
                  </span>
                </div>

                {!isAddingVehicle && (
                  <button
                    type="button"
                    onClick={() => setIsAddingVehicle(true)}
                    className="text-xs font-bold text-[#4472C4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Vehicle
                  </button>
                )}
              </div>

              {/* Add Vehicle Form */}
              {isAddingVehicle && (
                <form
                  onSubmit={handleAddVehicle}
                  className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 font-bold text-slate-900">
                    <span>New Vehicle Registration</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingVehicle(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Make & Model *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2024 Tesla Model 3"
                        value={newVehicle.makeModel}
                        onChange={(e) => setNewVehicle({ ...newVehicle, makeModel: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">License Plate *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8XYZ123"
                        value={newVehicle.plate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="CA"
                        value={newVehicle.state}
                        onChange={(e) => setNewVehicle({ ...newVehicle, state: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Color</label>
                      <input
                        type="text"
                        placeholder="Midnight Silver"
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parking</label>
                      <select
                        value={newVehicle.parkingType}
                        onChange={(e) => setNewVehicle({ ...newVehicle, parkingType: e.target.value as any })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Valet">Valet</option>
                        <option value="Self-Park">Self-Park</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200/60">
                    <button
                      type="button"
                      onClick={() => setIsAddingVehicle(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-md font-bold shadow-xs cursor-pointer"
                    >
                      Save Vehicle
                    </button>
                  </div>
                </form>
              )}

              {/* Vehicle List */}
              <div className="flex flex-col gap-3">
                {vehicles.map((veh, idx) => (
                  <div
                    key={veh.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 shadow-2xs hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs font-mono">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-xs">{veh.makeModel}</span>
                            {veh.isPrimary && (
                              <span className="px-1.5 py-0.5 bg-[#4472C4] text-white text-[10px] font-bold uppercase rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 font-medium">
                            Plate: {veh.plate} ({veh.state}) • {veh.color}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(veh.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                        title="Remove Vehicle"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#4472C4]">
                        <span className="material-symbols-outlined text-[14px]">local_parking</span>
                        {veh.parkingType === 'Valet' ? `Valet Assigned • ${veh.stallOrBay}` : `Self-Park • ${veh.stallOrBay}`}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {veh.keyPeg ? `Key Peg: ${veh.keyPeg}` : 'No Valet Key'}
                      </span>
                    </div>
                  </div>
                ))}

                {!isAddingVehicle && (
                  <button
                    type="button"
                    onClick={() => setIsAddingVehicle(true)}
                    className="p-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs text-[#4472C4] font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ Add Another Vehicle (Make, Plate, Valet)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ================= SHARED GUESTS SECTION ================= */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4472C4] text-[20px]">group</span>
                  <h3 className="text-sm font-bold text-slate-900">Shared & Accompanying Guests</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#4472C4] text-[11px] font-mono font-bold">
                    {sharedGuests.length} Guests
                  </span>
                </div>

                {!isAddingGuest && (
                  <button
                    type="button"
                    onClick={() => setIsAddingGuest(true)}
                    className="text-xs font-bold text-[#4472C4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span> Add Guest
                  </button>
                )}
              </div>

              {/* Add Guest Form */}
              {isAddingGuest && (
                <form
                  onSubmit={handleAddGuest}
                  className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 font-bold text-slate-900">
                    <span>Add Accompanying Guest</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingGuest(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eleanor Hayes"
                        value={newGuest.name}
                        onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        placeholder="Spouse / Colleague / Child"
                        value={newGuest.relationship}
                        onChange={(e) => setNewGuest({ ...newGuest, relationship: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+1 (212) 555-0199"
                        value={newGuest.phone}
                        onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Document</label>
                      <input
                        type="text"
                        placeholder="DL #NY-881920"
                        value={newGuest.idDocument}
                        onChange={(e) => setNewGuest({ ...newGuest, idDocument: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200/60">
                    <button
                      type="button"
                      onClick={() => setIsAddingGuest(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-md font-bold shadow-xs cursor-pointer"
                    >
                      Attach Guest
                    </button>
                  </div>
                </form>
              )}

              {/* Guest List */}
              <div className="flex flex-col gap-3">
                {sharedGuests.map((gst) => {
                  const initials = gst.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={gst.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#4472C4] flex items-center justify-center font-bold text-xs font-mono">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 text-xs">{gst.name}</span>
                              {gst.vipTier && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                  {gst.vipTier}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] font-medium rounded">
                                {gst.relationship}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-500">
                              {gst.phone} {gst.email ? `• ${gst.email}` : ''}
                            </span>
                          </div>
                        </div>

                        {!gst.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleDeleteGuest(gst.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                            title="Remove Guest"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">id_card</span>
                          {gst.idDocument || 'Document on File'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#4472C4] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">key</span>
                          {gst.keycardStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {!isAddingGuest && (
                  <button
                    type="button"
                    onClick={() => setIsAddingGuest(true)}
                    className="p-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs text-[#4472C4] font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>+ Add Accompanying Guest (Name, Contact & Key)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Save & Close Drawer
          </button>
          <p className="text-[11px] text-center text-slate-500">
            Changes auto-sync to Folio #{folioNumber}. Does not disrupt wizard progression.
          </p>
        </div>
      </aside>
    </div>
  );
};
