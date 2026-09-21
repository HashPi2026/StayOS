import React, { useState } from 'react';
import { X, Search, UserPlus, AlertCircle, Plus } from 'lucide-react';
import { HousekeepingMember } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: HousekeepingMember) => void;
  currentMemberIds: string[];
}

const AVAILABLE_STAFF_POOL = [
  { id: 'mem-10', empId: 'EMP-4412', name: 'Hannah Schmidt', role: 'Floor Attendant', initials: 'HS', detail: 'Certified Lv. 2' },
  { id: 'mem-11', empId: 'EMP-4419', name: 'Tariq Vance', role: 'Linen Runner', initials: 'TV', detail: 'Linen Runner & Restock' },
  { id: 'mem-12', empId: 'EMP-4480', name: 'Nadia Petrova', role: 'Sr. Room Attendant', initials: 'NP', detail: 'Transfer' },
  { id: 'mem-13', empId: 'EMP-4501', name: 'Kenji Sato', role: 'Sanitization Tech', initials: 'KS', detail: 'Sanitization Tech' },
  { id: 'mem-14', empId: 'EMP-4520', name: 'Maya Lin', role: 'Floor Attendant', initials: 'ML', detail: 'Floor 1-3 Attendant' },
  { id: 'mem-15', empId: 'EMP-4533', name: 'Oscar Ortiz', role: 'Inspector', initials: 'OO', detail: 'Quality Lead' },
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  currentMemberIds,
}) => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  if (!isOpen) return null;

  const candidates = AVAILABLE_STAFF_POOL.filter((s) => !currentMemberIds.includes(s.id)).filter((s) => {
    const q = search.toLowerCase();
    const matchesQuery = s.name.toLowerCase().includes(q) || s.empId.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (filterRole === 'Floor' && !s.role.includes('Floor')) return false;
    if (filterRole === 'Linen' && !s.role.includes('Linen')) return false;
    if (filterRole === 'Inspector' && !s.role.includes('Inspector')) return false;
    return true;
  });

  const handleAdd = (staff: typeof AVAILABLE_STAFF_POOL[0]) => {
    onAddMember({
      id: staff.id,
      empId: staff.empId,
      name: staff.name,
      role: staff.role,
      initials: staff.initials,
      isOnDuty: true,
      assignedTasks: [], // per Figma: adding a new member does NOT automatically assign tasks
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2170e4] text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add Staff to North Tower Morning Squad</h3>
              <p className="text-[11px] text-slate-500">
                Select qualified attendants currently unassigned or available on Morning Shift A
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search available staff by name, ID or department..."
              value={search}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterRole === 'ALL'
                  ? 'bg-[#2170e4] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Housekeeping ({candidates.length} Available)
            </button>
            <button
              onClick={() => setFilterRole('Floor')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterRole === 'Floor'
                  ? 'bg-[#2170e4] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Floor Attendants
            </button>
            <button
              onClick={() => setFilterRole('Linen')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterRole === 'Linen'
                  ? 'bg-[#2170e4] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Linen Runners
            </button>
            <button
              onClick={() => setFilterRole('Inspector')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterRole === 'Inspector'
                  ? 'bg-[#2170e4] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inspectors
            </button>
          </div>

          {/* Important Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#2170e4] shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="font-semibold text-slate-900">Important:</strong> Adding a new member does{' '}
              <em>not</em> automatically assign tasks. Task assignment is configured separately in the matrix below.
            </p>
          </div>

          {/* Candidates List */}
          <div className="space-y-1.5 pt-1">
            {candidates.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No additional staff available to assign.</div>
            ) : (
              candidates.map((staff) => (
                <div
                  key={staff.id}
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2170e4] flex items-center justify-center font-bold text-xs">
                      {staff.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{staff.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {staff.empId} • {staff.role} ({staff.detail})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(staff)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#2170e4] hover:bg-[#1a5bc2] text-white rounded text-xs font-semibold shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
