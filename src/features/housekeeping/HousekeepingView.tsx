import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { 
  Users, 
  UserCheck, 
  BedDouble, 
  CheckSquare, 
  Building2,
  Sparkles
} from 'lucide-react';

import { HousekeepingGroupsTab } from './components/HousekeepingGroupsTab';
import { GroupMembersTab } from './components/GroupMembersTab';
import { RoomAssignmentTab } from './components/RoomAssignmentTab';
import { HousekeepingTasksTab } from './components/HousekeepingTasksTab';

import { AddGroupDrawer } from './components/AddGroupDrawer';
import { AddTaskDrawer } from './components/AddTaskDrawer';
import { AddMemberModal } from './components/AddMemberModal';
import { 
  BlockedGroupDeleteModal, 
  AllowedGroupDeleteModal, 
  TaskDeleteModal 
} from './components/DeleteConfirmationModals';

import { 
  INITIAL_GROUPS, 
  INITIAL_TASKS, 
  INITIAL_MEMBERS, 
  INITIAL_UNASSIGNED_ROOMS, 
  INITIAL_ATTENDANT_ASSIGNMENTS 
} from './sampleData';

import { 
  HousekeepingGroup, 
  HousekeepingMember, 
  HousekeepingTask, 
  UnassignedRoom, 
  AttendantAssignment 
} from './types';

export type HousekeepingTab = 'groups' | 'members' | 'assignment' | 'tasks';

interface HousekeepingViewProps {
  initialTab?: HousekeepingTab;
}

export const HousekeepingView: React.FC<HousekeepingViewProps> = ({ initialTab = 'groups' }) => {
  const { addToast } = useProperty();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<HousekeepingTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Shared Data States
  const [groups, setGroups] = useState<HousekeepingGroup[]>(INITIAL_GROUPS);
  const [tasks, setTasks] = useState<HousekeepingTask[]>(INITIAL_TASKS);
  const [members, setMembers] = useState<HousekeepingMember[]>(INITIAL_MEMBERS);
  const [unassignedRooms, setUnassignedRooms] = useState<UnassignedRoom[]>(INITIAL_UNASSIGNED_ROOMS);
  const [attendants, setAttendants] = useState<AttendantAssignment[]>(INITIAL_ATTENDANT_ASSIGNMENTS);

  // Modal / Drawer States
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<HousekeepingGroup | null>(null);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Delete Modals
  const [blockedGroupDelete, setBlockedGroupDelete] = useState<HousekeepingGroup | null>(null);
  const [allowedGroupDelete, setAllowedGroupDelete] = useState<HousekeepingGroup | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<HousekeepingTask | null>(null);

  // -------------------------------------------------------------
  // Group Handlers
  // -------------------------------------------------------------
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setIsAddGroupOpen(true);
  };

  const handleEditGroup = (group: HousekeepingGroup) => {
    setEditingGroup(group);
    setIsAddGroupOpen(true);
  };

  const handleSaveGroup = (groupData: Partial<HousekeepingGroup>) => {
    if (editingGroup) {
      setGroups((prev) =>
        prev.map((g) => (g.id === editingGroup.id ? ({ ...g, ...groupData } as HousekeepingGroup) : g))
      );
      addToast(`Updated group "${groupData.name}"`, 'success');
    } else {
      setGroups((prev) => [groupData as HousekeepingGroup, ...prev]);
      addToast(`Created group "${groupData.name}"`, 'success');
    }
  };

  const handleDeleteGroupRequest = (group: HousekeepingGroup) => {
    if (group.membersCount > 0 || group.roomCount > 0 || group.isProtected) {
      setBlockedGroupDelete(group);
    } else {
      setAllowedGroupDelete(group);
    }
  };

  const handleConfirmAllowedDeleteGroup = () => {
    if (allowedGroupDelete) {
      setGroups((prev) => prev.filter((g) => g.id !== allowedGroupDelete.id));
      addToast(`Deleted group "${allowedGroupDelete.name}"`, 'info');
      setAllowedGroupDelete(null);
    }
  };

  // -------------------------------------------------------------
  // Task Handlers
  // -------------------------------------------------------------
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task: HousekeepingTask) => {
    setEditingTask(task);
    setIsAddTaskOpen(true);
  };

  const handleDuplicateTask = (task: HousekeepingTask) => {
    const clone: HousekeepingTask = {
      ...task,
      id: `HSK-${Math.floor(100 + Math.random() * 800)}`,
      name: `${task.name} (Copy)`,
      seq: tasks.length + 1,
    };
    clone.code = clone.id;
    setTasks((prev) => [...prev, clone]);
    addToast(`Duplicated task as ${clone.code}`, 'success');
  };

  const handleSaveTask = (taskData: Partial<HousekeepingTask>) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? ({ ...t, ...taskData } as HousekeepingTask) : t))
      );
      addToast(`Updated task "${taskData.name}"`, 'success');
    } else {
      setTasks((prev) => [...prev, taskData as HousekeepingTask]);
      addToast(`Created new workflow task "${taskData.name}"`, 'success');
    }
  };

  const handleDeleteTaskRequest = (task: HousekeepingTask) => {
    setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      addToast(`Deleted task "${taskToDelete.name}"`, 'info');
      setTaskToDelete(null);
    }
  };

  const handleReorderTasks = (newTasks: HousekeepingTask[]) => {
    setTasks(newTasks);
  };

  // -------------------------------------------------------------
  // Member & Matrix Handlers
  // -------------------------------------------------------------
  const handleAddMember = (newMember: HousekeepingMember) => {
    setMembers((prev) => [...prev, newMember]);
    addToast(`Added ${newMember.name} to squad`, 'success');
    setIsAddMemberOpen(false);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (window.confirm(`Remove ${memberName} from squad?\nAssigned capability links in the matrix will be cleared.`)) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      addToast(`Removed ${memberName} from squad`, 'info');
    }
  };

  const handleUpdateMemberTasks = (memberId: string, taskIds: string[]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, assignedTasks: taskIds } : m))
    );
    addToast('Task matrix assignments saved to PMS', 'success');
  };

  // -------------------------------------------------------------
  // Room Assignment Handlers
  // -------------------------------------------------------------
  const handleAssignRoom = (roomId: string, attendantId: string) => {
    const room = unassignedRooms.find((r) => r.id === roomId);
    if (!room) return;

    // remove from unassigned
    setUnassignedRooms((prev) => prev.filter((r) => r.id !== roomId));

    // add to attendant
    setAttendants((prev) =>
      prev.map((a) => {
        if (a.attendantId === attendantId) {
          const alreadyHas = a.assignedRooms.some((r) => r.roomNumber === room.roomNumber);
          if (alreadyHas) return a;
          return {
            ...a,
            assignedRooms: [
              ...a.assignedRooms,
              {
                roomNumber: room.roomNumber,
                status: (room.status === 'TOUCH' ? 'VD' : room.status) as 'VD' | 'OD' | 'SO' | 'VCI',
                type: room.roomType,
                minutes: room.estMinutes,
              },
            ],
          };
        }
        return a;
      })
    );
  };

  const handleUnassignRoom = (attendantId: string, roomNumber: string) => {
    const attendant = attendants.find((a) => a.attendantId === attendantId);
    const roomToReturn = attendant?.assignedRooms.find((r) => r.roomNumber === roomNumber);

    if (roomToReturn) {
      // Remove from attendant
      setAttendants((prev) =>
        prev.map((a) =>
          a.attendantId === attendantId
            ? { ...a, assignedRooms: a.assignedRooms.filter((r) => r.roomNumber !== roomNumber) }
            : a
        )
      );

      // Return to unassigned pool
      const newCard: UnassignedRoom = {
        id: `card-${roomNumber}`,
        roomNumber: roomNumber,
        roomType: roomToReturn.type || 'DLXK',
        status: roomToReturn.status || 'VD',
        statusLabel:
          roomToReturn.status === 'VD'
            ? 'VACANT DIRTY'
            : roomToReturn.status === 'OD'
            ? 'OCCUPIED DIRTY'
            : 'STAYOVER CLEAN',
        estMinutes: roomToReturn.minutes || 25,
        note: 'Returned to inventory pool',
      };
      setUnassignedRooms((prev) => [newCard, ...prev]);
      addToast(`Room ${roomNumber} unassigned and returned to pool`, 'info');
    }
  };

  const handleUnassignAllFromAttendant = (attendantId: string) => {
    const attendant = attendants.find((a) => a.attendantId === attendantId);
    if (!attendant || attendant.assignedRooms.length === 0) return;

    const restored: UnassignedRoom[] = attendant.assignedRooms.map((r) => ({
      id: `card-${r.roomNumber}`,
      roomNumber: r.roomNumber,
      roomType: r.type,
      status: r.status,
      statusLabel:
        r.status === 'VD' ? 'VACANT DIRTY' : r.status === 'OD' ? 'OCCUPIED DIRTY' : 'STAYOVER CLEAN',
      estMinutes: r.minutes,
      note: 'Returned from unassigned staff roster',
    }));

    setAttendants((prev) =>
      prev.map((a) => (a.attendantId === attendantId ? { ...a, assignedRooms: [] } : a))
    );
    setUnassignedRooms((prev) => [...restored, ...prev]);
    addToast(`All rooms unassigned from ${attendant.name}`, 'info');
  };

  const handleAutoBalance = () => {
    // Distribute unassigned rooms evenly among on-duty attendants
    if (unassignedRooms.length === 0) {
      addToast('All rooms are already assigned!', 'info');
      return;
    }

    const roomsToDistribute = [...unassignedRooms];
    const updatedAttendants = attendants.map((a) => ({
      ...a,
      assignedRooms: [...a.assignedRooms],
    }));

    let attIndex = 0;
    roomsToDistribute.forEach((room) => {
      updatedAttendants[attIndex % updatedAttendants.length].assignedRooms.push({
        roomNumber: room.roomNumber,
        status: (room.status === 'TOUCH' ? 'VD' : room.status) as 'VD' | 'OD' | 'SO' | 'VCI',
        type: room.roomType,
        minutes: room.estMinutes,
      });
      attIndex++;
    });

    setAttendants(updatedAttendants);
    setUnassignedRooms([]);
    addToast(`Auto-balanced ${roomsToDistribute.length} rooms across attendants`, 'success');
  };

  const handleClearAllAssignments = () => {
    const allAssigned: UnassignedRoom[] = [];
    attendants.forEach((a) => {
      a.assignedRooms.forEach((r) => {
        allAssigned.push({
          id: `card-${r.roomNumber}`,
          roomNumber: r.roomNumber,
          roomType: r.type,
          status: r.status,
          statusLabel:
            r.status === 'VD' ? 'VACANT DIRTY' : r.status === 'OD' ? 'OCCUPIED DIRTY' : 'STAYOVER CLEAN',
          estMinutes: r.minutes,
          note: 'Returned via Clear All',
        });
      });
    });

    setAttendants((prev) => prev.map((a) => ({ ...a, assignedRooms: [] })));
    setUnassignedRooms((prev) => [...prev, ...allAssigned]);
    addToast('Cleared all assignments for this shift', 'info');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-800 pb-16">
      {/* Top Level Section Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'bg-[#2170e4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Groups ({groups.length})
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-[#2170e4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Group Members & Matrix ({members.length})
            </button>

            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'assignment'
                  ? 'bg-[#2170e4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              Room Assignment ({unassignedRooms.length} unassigned)
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-[#2170e4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Tasks & SOP ({tasks.length})
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>PMS Housekeeping Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {activeTab === 'groups' && (
          <HousekeepingGroupsTab
            groups={groups}
            onOpenAddGroup={handleOpenAddGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroupRequest={handleDeleteGroupRequest}
          />
        )}

        {activeTab === 'members' && (
          <GroupMembersTab
            members={members}
            tasks={tasks}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onRemoveMember={handleRemoveMember}
            onUpdateMemberTasks={handleUpdateMemberTasks}
          />
        )}

        {activeTab === 'assignment' && (
          <RoomAssignmentTab
            unassignedRooms={unassignedRooms}
            attendants={attendants}
            onAssignRoom={handleAssignRoom}
            onUnassignRoom={handleUnassignRoom}
            onUnassignAll={handleUnassignAllFromAttendant}
            onAutoBalance={handleAutoBalance}
            onClearAll={handleClearAllAssignments}
          />
        )}

        {activeTab === 'tasks' && (
          <HousekeepingTasksTab
            tasks={tasks}
            onOpenAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
            onDuplicateTask={handleDuplicateTask}
            onDeleteTaskRequest={handleDeleteTaskRequest}
            onReorderTasks={handleReorderTasks}
          />
        )}
      </div>

      {/* Drawers & Modals */}
      <AddGroupDrawer
        isOpen={isAddGroupOpen}
        onClose={() => setIsAddGroupOpen(false)}
        onSave={handleSaveGroup}
        editingGroup={editingGroup}
      />

      <AddTaskDrawer
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        totalExistingTasks={tasks.length}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
        currentMemberIds={members.map((m) => m.id)}
      />

      <BlockedGroupDeleteModal
        isOpen={!!blockedGroupDelete}
        group={blockedGroupDelete}
        onClose={() => setBlockedGroupDelete(null)}
        onNavigateToMembers={() => setActiveTab('members')}
      />

      <AllowedGroupDeleteModal
        isOpen={!!allowedGroupDelete}
        group={allowedGroupDelete}
        onClose={() => setAllowedGroupDelete(null)}
        onConfirm={handleConfirmAllowedDeleteGroup}
      />

      <TaskDeleteModal
        isOpen={!!taskToDelete}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
      />
    </div>
  );
};
