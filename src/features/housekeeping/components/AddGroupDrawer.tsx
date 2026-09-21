import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { HousekeepingGroup, ShiftType } from '../types';

interface AddGroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: Partial<HousekeepingGroup>) => void;
  editingGroup?: HousekeepingGroup | null;
}

export const AddGroupDrawer: React.FC<AddGroupDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGroup,
}) => {
  const [name, setName] = useState('');
  const [shift, setShift] = useState<ShiftType>('morning');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setShift(editingGroup.shift);
      setDescription(editingGroup.description);
    } else {
      setName('');
      setShift('morning');
      setDescription('');
    }
    setErrorMsg('');
  }, [editingGroup, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Group name is mandatory and cannot be left blank.');
      return;
    }

    let shiftHours = 'Shift A • 07:00 - 15:30';
    if (shift === 'afternoon') shiftHours = 'Shift B • 15:00 - 23:30';
    if (shift === 'deep-clean' || shift === 'specialized') shiftHours = 'Shift C • 21:00 - 05:00';

    onSave({
      id: editingGroup ? editingGroup.id : `grp-${Date.now()}`,
      name: name.trim(),
      shift,
      shiftHours,
      description: description.trim() || 'Standard operational turnaround unit.',
      badge: editingGroup?.badge || (shift === 'deep-clean' ? 'Rotational' : 'Active Crew'),
      badgeType: editingGroup?.badgeType || 'default',
      memberInitials: editingGroup?.memberInitials || [],
      membersCount: editingGroup?.membersCount || 0,
      roomCount: editingGroup?.roomCount || 0,
      roomScope: editingGroup?.roomScope || 'Unassigned Units',
      isProtected: editingGroup ? editingGroup.isProtected : false,
      iconName: editingGroup?.iconName || (shift === 'morning' ? 'Sun' : shift === 'afternoon' ? 'Moon' : 'Sparkles'),
    });

    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-50 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingGroup ? 'Edit Group' : 'Add Group'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Define operational scope and team assignment parameters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          <form id="group-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Group Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. North Tower Morning Squad"
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#2170e4] transition-all"
              />
              {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
            </div>

            {/* Shift Roster */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Operational Shift Roster
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    shift === 'morning'
                      ? 'bg-blue-50 border-[#2170e4] text-[#2170e4]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="shiftRoster"
                    value="morning"
                    checked={shift === 'morning'}
                    onChange={() => setShift('morning')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold uppercase">Morning</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">07:00-15:30</span>
                </label>

                <label
                  className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    shift === 'afternoon'
                      ? 'bg-blue-50 border-[#2170e4] text-[#2170e4]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="shiftRoster"
                    value="afternoon"
                    checked={shift === 'afternoon'}
                    onChange={() => setShift('afternoon')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold uppercase">Afternoon</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">15:00-23:30</span>
                </label>

                <label
                  className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    shift === 'deep-clean'
                      ? 'bg-blue-50 border-[#2170e4] text-[#2170e4]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="shiftRoster"
                    value="deep-clean"
                    checked={shift === 'deep-clean'}
                    onChange={() => setShift('deep-clean')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold uppercase">Deep Clean</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">21:00-05:00</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Operational Scope & Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the unit duties, daily turnover quotas, or specific floor designations..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#2170e4] transition-all resize-none"
              />
              <span className="text-[11px] text-slate-400 block text-right">Max 300 characters</span>
            </div>

            {/* Informational Guidance Box */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Info className="w-4 h-4 text-[#2170e4]" />
                Assignment Protocol
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Attendants can be associated via the Attendants sub-roster once the group shell is created. Rooms are
                allocated automatically according to floor plan templates.
              </p>
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="group-form"
            className="px-4 py-2 bg-[#2170e4] text-white rounded-lg text-xs font-semibold hover:bg-[#1a5bc2] shadow-sm transition-all"
          >
            Save Group
          </button>
        </div>
      </aside>
    </>
  );
};
