import React, { useState } from 'react';
import { 
  Users, 
  BadgeCheck, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Sun, 
  Building2, 
  Crown, 
  Moon, 
  Building, 
  Bed, 
  ShieldAlert, 
  Lock, 
  RefreshCw,
  FolderX
} from 'lucide-react';
import { HousekeepingGroup, ShiftType } from '../types';

interface HousekeepingGroupsTabProps {
  groups: HousekeepingGroup[];
  onOpenAddGroup: () => void;
  onEditGroup: (group: HousekeepingGroup) => void;
  onDeleteGroupRequest: (group: HousekeepingGroup) => void;
}

export const HousekeepingGroupsTab: React.FC<HousekeepingGroupsTabProps> = ({
  groups,
  onOpenAddGroup,
  onEditGroup,
  onDeleteGroupRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState<'all' | ShiftType>('all');
  const [viewState, setViewState] = useState<'live' | 'skeleton' | 'empty'>('live');

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = selectedShift === 'all' || g.shift === selectedShift;
    return matchesSearch && matchesShift;
  });

  const getGroupIcon = (name: string) => {
    switch (name) {
      case 'Sun':
        return <Sun className="w-4 h-4 text-[#2170e4]" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-slate-600" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-[#2170e4]" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-slate-700" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-slate-700" />;
      default:
        return <Building className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer">Operations</span>
            <span>/</span>
            <span className="hover:text-slate-800 cursor-pointer">Housekeeping</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Groups</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Housekeeping Groups</h1>
          <p className="text-sm text-slate-500 mt-1">Organize housekeeping staff into operational groups.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            id="housekeeping-groups-filter-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          <button
            id="housekeeping-add-group-btn"
            onClick={onOpenAddGroup}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2170e4] text-white rounded-lg shadow-sm text-xs font-semibold hover:bg-[#1a5bc2] transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Add Group
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Groups</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">6</div>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#2170e4]"></span>
              6 Active Groups
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2170e4]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendants Assigned</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">38</div>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <BadgeCheck className="w-3.5 h-3.5 text-[#2170e4]" />
              Active Staff
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2170e4]">
            <BadgeCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Shifts</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">3</div>
            <span className="text-xs text-slate-500 mt-1">Morning • Afternoon • Deep Clean</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2170e4]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unassigned Rooms</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">
              0 <span className="text-sm font-normal text-slate-400">/ 142</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              Full Coverage 100%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Bed className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Shift Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="groups-search-input"
                type="text"
                placeholder="Filter by group name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2170e4]/20 transition-all"
              />
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded">
              {filteredGroups.length} Groups
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedShift('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                selectedShift === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Shifts
            </button>
            <button
              onClick={() => setSelectedShift('morning')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                selectedShift === 'morning'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Morning
            </button>
            <button
              onClick={() => setSelectedShift('afternoon')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                selectedShift === 'afternoon'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setSelectedShift('specialized')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                selectedShift === 'specialized'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Specialized
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1"></div>

            {/* View State Switches */}
            <div className="flex items-center bg-slate-100 rounded p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setViewState('live')}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewState === 'live' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Live ({filteredGroups.length})
              </button>
              <button
                onClick={() => setViewState('skeleton')}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewState === 'skeleton' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Skeleton
              </button>
              <button
                onClick={() => setViewState('empty')}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewState === 'empty' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Empty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {viewState === 'skeleton' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded-lg w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-12 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-12 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-12 bg-slate-100 rounded-lg w-full"></div>
          </div>
        </div>
      )}

      {viewState === 'empty' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <FolderX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No housekeeping groups configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Click "+ Add Group" to create your first operational team, assign attendants, and link room inventories.
          </p>
          <button
            onClick={onOpenAddGroup}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2170e4] text-white rounded-lg shadow-sm text-xs font-semibold hover:bg-[#1a5bc2] transition-all"
          >
            <Plus className="w-4 h-4" />
            + Add Group
          </button>
        </div>
      )}

      {viewState === 'live' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Group Name</th>
                  <th className="py-3 px-4">Operational Description</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Room Coverage / Scope</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Group Name & Shift */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50/80 text-[#2170e4] flex items-center justify-center shrink-0">
                          {getGroupIcon(group.iconName || '')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{group.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {group.shiftHours}
                            </span>
                            {group.badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  group.badgeType === 'vip'
                                    ? 'bg-blue-100 text-blue-800'
                                    : group.badgeType === 'rotational'
                                    ? 'bg-purple-100 text-purple-800'
                                    : group.badgeType === 'draft'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {group.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-sm text-slate-600 leading-relaxed">
                      {group.description}
                    </td>

                    {/* Members Avatar Stack */}
                    <td className="py-3.5 px-4">
                      {group.membersCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {group.memberInitials.map((init, i) => (
                              <div
                                key={i}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center"
                              >
                                {init}
                              </div>
                            ))}
                            {group.membersCount > group.memberInitials.length && (
                              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-medium text-slate-600 flex items-center justify-center">
                                +{group.membersCount - group.memberInitials.length}
                              </div>
                            )}
                          </div>
                          <span className="font-mono text-xs text-slate-700 font-medium">
                            {group.membersCount} members
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-400 italic">0 members</span>
                      )}
                    </td>

                    {/* Room Coverage */}
                    <td className="py-3.5 px-4">
                      {group.roomCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-[#2170e4]" />
                          <span className="font-semibold text-slate-900">{group.roomCount} Rooms</span>
                          <span className="text-slate-500 text-[11px]">{group.roomScope}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">{group.roomScope}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditGroup(group)}
                          className="p-1.5 text-slate-500 hover:text-[#2170e4] hover:bg-blue-50 rounded transition-colors"
                          title="Edit Group"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteGroupRequest(group)}
                          className={`p-1.5 rounded transition-colors ${
                            group.isProtected
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                          }`}
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Displaying <span className="font-semibold text-slate-900">{filteredGroups.length}</span> of{' '}
              {groups.length} configured groups
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2170e4]"></span> Fully Allocated
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Draft/Empty
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[#2170e4] font-semibold text-xs">
            <ShieldAlert className="w-4 h-4" />
            Allocation Rules
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Staff members inherit room rosters and inventory credit keys automatically based on assigned groups.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[#2170e4] font-semibold text-xs">
            <Lock className="w-4 h-4" />
            Referential Integrity
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deletion is strictly prohibited whenever active staff or scheduled room cleanings are bound to a group.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[#2170e4] font-semibold text-xs">
            <RefreshCw className="w-4 h-4" />
            Roster Synchronization
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Changes to group shift schedules propagate to the housekeeping mobile terminal across 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};
