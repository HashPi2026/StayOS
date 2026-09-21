export type ShiftType = 'morning' | 'afternoon' | 'specialized' | 'deep-clean';

export interface HousekeepingMember {
  id: string;
  empId: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
  isOnDuty: boolean;
  shiftStart?: string;
  tasksCount?: number;
  assignedTasks?: string[]; // array of task IDs
}

export interface HousekeepingGroup {
  id: string;
  name: string;
  shift: ShiftType;
  shiftHours: string;
  badge?: string;
  badgeType?: 'default' | 'success' | 'vip' | 'rotational' | 'draft';
  description: string;
  memberInitials: string[];
  membersCount: number;
  roomCount: number;
  roomScope: string;
  isProtected?: boolean; // cannot be deleted if has members/rooms
  iconName?: string;
}

export interface HousekeepingTask {
  id: string; // e.g. HSK-101
  seq: number;
  name: string;
  code: string;
  description: string;
  durationMinutes: number;
  autoVacantDirty: boolean;
  isTemplateDefault: boolean;
}

export interface UnassignedRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  status: 'VD' | 'OD' | 'SO' | 'VCI' | 'TOUCH';
  statusLabel: string;
  priorityLabel?: string;
  isVip?: boolean;
  vipTier?: string;
  estMinutes: number;
  note?: string;
}

export interface AttendantAssignment {
  attendantId: string;
  empId: string;
  name: string;
  role: string;
  initials: string;
  focusFloor: string;
  maxMinutes: number;
  assignedRooms: {
    roomNumber: string;
    status: 'VD' | 'OD' | 'SO' | 'VCI';
    type: string;
    minutes: number;
  }[];
}
