import React from 'react';
import { Ban, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
import { HousekeepingGroup, HousekeepingTask } from '../types';

interface BlockedGroupDeleteModalProps {
  isOpen: boolean;
  group: HousekeepingGroup | null;
  onClose: () => void;
  onNavigateToMembers: () => void;
}

export const BlockedGroupDeleteModal: React.FC<BlockedGroupDeleteModalProps> = ({
  isOpen,
  group,
  onClose,
  onNavigateToMembers,
}) => {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 space-y-5 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Ban className="w-7 h-7" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xl font-bold text-slate-900">Cannot Delete Group</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This group has <strong className="text-slate-900">{group.membersCount} active staff members</strong>{' '}
              and <strong className="text-slate-900">{group.roomCount} room assignments</strong>. You must detach all
              members and reassign active rooms before deleting this group.
            </p>
          </div>
        </div>

        {/* Critical Warning Callout */}
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-slate-700">
            <span className="font-bold text-red-900 block">Referential Protection Active</span>
            <p className="text-slate-600 text-[11px]">
              StayOS prevents accidental loss of staff schedules and unassigned room orphans. Deletion cannot proceed
              until references are cleared.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToMembers();
            }}
            className="text-[#2170e4] font-semibold text-xs hover:underline flex items-center gap-1"
          >
            <span>View & Detach Members</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200 transition-colors"
            >
              Dismiss
            </button>
            <button
              disabled
              className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg cursor-not-allowed opacity-60"
            >
              Delete Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AllowedGroupDeleteModalProps {
  isOpen: boolean;
  group: HousekeepingGroup | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const AllowedGroupDeleteModal: React.FC<AllowedGroupDeleteModalProps> = ({
  isOpen,
  group,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Confirm Group Deletion</h3>
            <p className="text-xs text-slate-600 mt-1">
              Are you sure you want to permanently remove <strong className="text-slate-900">"{group.name}"</strong>?
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
          This group has 0 attendants and 0 assigned units. This action is irreversible.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 shadow-sm transition-all"
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskDeleteModalProps {
  isOpen: boolean;
  task: HousekeepingTask | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const TaskDeleteModal: React.FC<TaskDeleteModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
              Destructive Action
            </span>
            <h3 className="text-base font-bold text-slate-900">Delete Housekeeping Task?</h3>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-0.5">
          <div className="text-xs font-bold text-slate-900">"{task.name}"</div>
          <div className="font-mono text-[11px] text-slate-500">ID: {task.code}</div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          This task will be detached from <strong className="text-slate-900">2 housekeeping checklist templates</strong>.
          Completed historical logs and attendant payroll work metrics will retain this record.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
