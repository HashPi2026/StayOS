import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  BadgeCheck, 
  CheckSquare, 
  Clock, 
  Smartphone, 
  UserPlus, 
  UserMinus, 
  Save, 
  CheckCircle2, 
  Filter, 
  RotateCcw,
  FolderX,
  AlertCircle
} from 'lucide-react';
import { HousekeepingMember, HousekeepingTask } from '../types';

interface GroupMembersTabProps {
  members: HousekeepingMember[];
  tasks: HousekeepingTask[];
  onOpenAddMember: () => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
  onUpdateMemberTasks: (memberId: string, taskIds: string[]) => void;
}

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({
  members,
  tasks,
  onOpenAddMember,
  onRemoveMember,
  onUpdateMemberTasks,
}) => {
  const [selectedGroupState, setSelectedGroupState] = useState<'active' | 'empty' | 'no-group'>('active');
  const [selectedGroupName, setSelectedGroupName] = useState('active');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for assignments: memberId -> Set of taskId strings
  const [assignments, setAssignments] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    members.forEach((m) => {
      map[m.id] = m.assignedTasks || [];
    });
    return map;
  });

  // Sync when members list changes
  useEffect(() => {
    setAssignments((prev) => {
      const next = { ...prev };
      members.forEach((m) => {
        if (!next[m.id]) {
          next[m.id] = m.assignedTasks || [];
        }
      });
      return next;
    });
  }, [members]);

  // Keyboard shortcut for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveMatrix();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [assignments]);

  const toggleTask = (memberId: string, taskId: string) => {
    setIsSaved(false);
    setAssignments((prev) => {
      const current = prev[memberId] || [];
      const updated = current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId];
      return { ...prev, [memberId]: updated };
    });
  };

  const handleSyncDefaults = () => {
    setIsSaved(false);
    setAssignments((prev) => {
      const next = { ...prev };
      const defaultTaskIds = tasks.filter((t) => t.isTemplateDefault).map((t) => t.id);
      members.forEach((m) => {
        next[m.id] = [...defaultTaskIds];
      });
      return next;
    });
  };

  const handleClearAll = () => {
    setIsSaved(false);
    setAssignments((prev) => {
      const next = { ...prev };
      members.forEach((m) => {
        next[m.id] = [];
      });
      return next;
    });
  };

  const handleSaveMatrix = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      // notify parent
      Object.entries(assignments).forEach(([memberId, taskIds]) => {
        onUpdateMemberTasks(memberId, taskIds);
      });
    }, 400);
  };

  // Calculate total capability links
  const totalLinks = Object.values(assignments).reduce((sum, taskList) => sum + taskList.length, 0);

  // Filtered members for the matrix
  const filteredMembers = members.filter((m) => {
    const q = matrixSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.empId.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto w-full">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer">Operations</span>
            <span>/</span>
            <span className="hover:text-slate-800 cursor-pointer">Housekeeping</span>
            <span>/</span>
            <span className="font-semibold text-[#2170e4]">Group Members</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Group Members</h1>
            <span className="bg-slate-100 px-2.5 py-1 rounded text-xs font-mono text-slate-700 flex items-center gap-1.5 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#2170e4] animate-pulse"></span>
              SYNCED: PMS-CORE #4092
            </span>
          </div>
        </div>

        {/* Controls & Group Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View State Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => {
                setSelectedGroupState('active');
                setSelectedGroupName('active');
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedGroupState === 'active'
                  ? 'bg-white text-[#2170e4] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Squad
            </button>
            <button
              onClick={() => {
                setSelectedGroupState('empty');
                setSelectedGroupName('empty');
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedGroupState === 'empty'
                  ? 'bg-white text-[#2170e4] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Empty Squad
            </button>
            <button
              onClick={() => {
                setSelectedGroupState('no-group');
                setSelectedGroupName('no-group');
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedGroupState === 'no-group'
                  ? 'bg-white text-[#2170e4] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unselected
            </button>
          </div>

          {/* Group Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedGroupName}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedGroupName(val);
                if (val === 'no-group') setSelectedGroupState('no-group');
                else if (val === 'empty') setSelectedGroupState('empty');
                else setSelectedGroupState('active');
              }}
              className="pl-4 pr-10 py-2 bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2170e4]/20 min-w-[320px]"
            >
              <option value="active">North Tower Morning Squad (Shift A • 07:00 - 15:30)</option>
              <option value="empty">Floor 1-4 Daily Turn (0 members)</option>
              <option value="exec">Executive Suites Team (VIP Priority • 4 members)</option>
              <option value="deep">Deep Clean & Sanitization Unit (5 members)</option>
              <option value="no-group">(No group selected)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Group Metrics Banner */}
      {selectedGroupState !== 'no-group' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2170e4]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Target Zone</div>
              <div className="text-xs font-semibold text-slate-900">North Tower (Fl. 1–4)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Roster Size</div>
              <div className="text-xs font-semibold text-slate-900">
                {selectedGroupState === 'empty' ? '0' : members.length} Attendants Assigned
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2170e4]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Matrix Links</div>
              <div className="text-xs font-semibold text-slate-900">
                {selectedGroupState === 'empty' ? '0' : totalLinks} Active Capability Links
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Active Shift Window</div>
              <div className="text-xs font-semibold text-slate-900">07:00 – 15:30 (Morning)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#2170e4]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Mobile Terminal Sync</div>
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Real-Time Push Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: No Group Selected */}
      {selectedGroupState === 'no-group' && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FolderX className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Housekeeping Group Selected</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select an operational team from the dropdown above to view attendant staff rosters and calibrate room task
            assignments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedGroupState('active');
                setSelectedGroupName('active');
              }}
              className="px-4 py-2 bg-[#2170e4] text-white rounded-lg text-xs font-semibold shadow hover:bg-[#1a5bc2] transition-colors"
            >
              Select North Tower Morning Squad
            </button>
          </div>
        </div>
      )}

      {/* STATE 2 & 3: Active Content */}
      {selectedGroupState !== 'no-group' && (
        <div className="space-y-6">
          {/* SECTION 1: Members Roster */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Members</h2>
                  <span className="bg-blue-50 text-[#2170e4] text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-100">
                    {selectedGroupState === 'empty' ? '0' : members.length} Staff Assigned
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Staff roster for North Tower Morning Squad. Members inherit group schedules; task capabilities must
                  be assigned in the matrix below.
                </p>
              </div>
              <button
                onClick={onOpenAddMember}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2170e4] text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-[#1a5bc2] transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                + Add Member
              </button>
            </div>

            {/* Empty Members Substate */}
            {selectedGroupState === 'empty' && (
              <div className="p-8 bg-slate-50 rounded-lg text-center space-y-2 border border-slate-200">
                <FolderX className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800">No Staff Assigned to this Squad</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This group does not have any housekeeping attendants bound yet. Use the action button above to
                  assign attendants.
                </p>
                <button
                  onClick={onOpenAddMember}
                  className="mt-2 px-3 py-1.5 bg-[#2170e4] text-white rounded text-xs font-semibold"
                >
                  + Add First Member
                </button>
              </div>
            )}

            {/* Attendants Cards Grid (4 Cols) */}
            {selectedGroupState !== 'empty' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 p-3.5 rounded-lg flex flex-col justify-between transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-blue-100/80 text-[#2170e4] flex items-center justify-center font-bold text-xs">
                            {member.initials}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                              member.isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{member.name}</div>
                          <div className="font-mono text-[10px] text-slate-500">{member.empId}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveMember(member.id, member.name)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title={`Unbind ${member.name} and clear matrix capabilities`}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {member.role}
                      </span>
                      {member.isOnDuty ? (
                        <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> On Duty
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">{member.shiftStart}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: Task Assignments Matrix */}
          {selectedGroupState !== 'empty' && (
            <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              {/* Header & Controls Ribbon */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Task Assignments Matrix</h2>
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded border border-slate-200">
                      {tasks.length} Tasks × {members.length} Attendants
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign specific housekeeping routine tasks to group members. Checking creates an assignment record;
                    unchecking revokes the assignment on attendant worksheets.
                  </p>
                </div>

                {/* Matrix Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Inline Staff Search */}
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter attendants..."
                      value={matrixSearch}
                      onChange={(e) => setMatrixSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white w-44"
                    />
                  </div>

                  {/* Bulk Preset Buttons */}
                  <button
                    onClick={handleSyncDefaults}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Sync Defaults
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Clear All
                  </button>

                  {/* Save Status & Action */}
                  <div className="flex items-center gap-2 ml-1">
                    {isSaved ? (
                      <span className="bg-blue-50 text-[#2170e4] text-xs font-mono px-2.5 py-1 rounded border border-blue-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2170e4]" />
                        All saved
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-800 text-xs font-mono px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Unsaved changes
                      </span>
                    )}

                    <button
                      onClick={handleSaveMatrix}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
                    >
                      {isSaving ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save (Ctrl+S)
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Wrapper */}
              <div className="relative overflow-x-auto rounded-lg border border-slate-200 max-h-[560px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 z-30 shadow-xs border-b border-slate-200">
                    <tr>
                      <th className="sticky left-0 top-0 z-40 bg-slate-100 p-3.5 min-w-[240px] text-xs font-bold text-slate-800 tracking-wider">
                        Attendant Profile
                      </th>
                      {tasks.map((task) => (
                        <th key={task.id} className="p-3 min-w-[140px] text-slate-800 align-top border-l border-slate-200/60">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] text-[#2170e4] font-bold">{task.code}</span>
                            <span className="font-semibold text-xs truncate" title={task.name}>
                              {task.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {task.durationMinutes} min
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMembers.map((member) => {
                      const memberTasks = assignments[member.id] || [];
                      const count = memberTasks.length;
                      return (
                        <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                          {/* Sticky Left Column: Attendant Profile */}
                          <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-20 p-3 border-r border-slate-200/60">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2170e4] flex items-center justify-center font-bold text-[11px]">
                                  {member.initials}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-xs">{member.name}</div>
                                  <div className="font-mono text-[10px] text-slate-500">{member.empId}</div>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                                  count >= 6
                                    ? 'bg-slate-100 text-slate-700 font-medium'
                                    : 'bg-blue-50 text-[#2170e4] font-semibold'
                                }`}
                              >
                                {count}/{tasks.length} Tasks
                              </span>
                            </div>
                          </td>

                          {/* Task Checkboxes */}
                          {tasks.map((task) => {
                            const isChecked = memberTasks.includes(task.id);
                            return (
                              <td key={task.id} className="p-3 text-center border-l border-slate-200/40">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTask(member.id, task.id)}
                                  className="w-4 h-4 rounded text-[#2170e4] focus:ring-[#2170e4] cursor-pointer accent-[#2170e4]"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Matrix Footer Note */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#2170e4]" />
                  <span>Task durations define auto-workload limits per shift window (max 420 productive minutes/attendant).</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">Matrix Protocol: HSK-CORE-V2.4</div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
