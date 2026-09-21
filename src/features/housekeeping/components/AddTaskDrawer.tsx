import React, { useState, useEffect } from 'react';
import { X, Zap, CheckSquare, Save } from 'lucide-react';
import { HousekeepingTask } from '../types';

interface AddTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<HousekeepingTask>) => void;
  editingTask?: HousekeepingTask | null;
  totalExistingTasks: number;
}

export const AddTaskDrawer: React.FC<AddTaskDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  totalExistingTasks,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [autoVacantDirty, setAutoVacantDirty] = useState(true);
  const [isTemplateDefault, setIsTemplateDefault] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const DURATION_PRESETS = [10, 15, 20, 30, 45, 60];

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setCode(editingTask.code);
      setDescription(editingTask.description);
      setDuration(editingTask.durationMinutes);
      setAutoVacantDirty(editingTask.autoVacantDirty);
      setIsTemplateDefault(editingTask.isTemplateDefault);
    } else {
      setName('');
      setCode(`HSK-${100 + totalExistingTasks + 1}`);
      setDescription('');
      setDuration(15);
      setAutoVacantDirty(true);
      setIsTemplateDefault(true);
    }
    setErrorMsg('');
  }, [editingTask, isOpen, totalExistingTasks]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Task name is required.');
      return;
    }

    onSave({
      id: editingTask ? editingTask.id : code,
      name: name.trim(),
      code: code || `HSK-${100 + totalExistingTasks + 1}`,
      description: description.trim() || 'Attendant checklist cleaning procedure',
      durationMinutes: duration,
      autoVacantDirty,
      isTemplateDefault,
      seq: editingTask ? editingTask.seq : totalExistingTasks + 1,
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              StayOS Configuration
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {editingTask ? `Edit Task — ${editingTask.name}` : 'Add New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Task Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Bathroom Full Sanitization"
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#2170e4] transition-all"
              />
              {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
              <span className="text-[11px] text-slate-400">
                Concise, action-oriented name displayed on attendant mobile devices.
              </span>
            </div>

            {/* Task Code */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Task Code (System ID)
              </label>
              <input
                type="text"
                value={code}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 text-slate-600 font-mono text-xs rounded-lg border border-slate-200 outline-none cursor-not-allowed"
              />
            </div>

            {/* Attendant Instructions & SOP */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Attendant Instructions & SOP
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify chemicals, order of execution, or checklist items..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#2170e4] transition-all resize-none"
              />
            </div>

            {/* Duration Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Expected Duration <span className="text-red-500">*</span>
                </label>
                <span className="font-mono text-xs text-slate-500 font-semibold">{duration} minutes</span>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-3 gap-2">
                {DURATION_PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDuration(val)}
                    className={`py-1.5 rounded text-xs font-mono transition-colors ${
                      duration === val
                        ? 'bg-[#2170e4] text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {val} min
                  </button>
                ))}
              </div>

              {/* Custom Minutes Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500">Or custom:</span>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-28">
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
                    className="bg-transparent font-mono text-xs text-slate-900 outline-none w-14"
                  />
                  <span className="text-xs font-mono text-slate-500">min</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 my-2"></div>

            {/* Toggle: Auto On Vacant Dirty */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#2170e4]" />
                  <span className="text-xs font-bold text-slate-900">Auto: Vacant Dirty</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Auto-apply this task immediately when a room status transitions to Vacant Dirty during front-desk
                  checkout or scheduled night audit.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={autoVacantDirty}
                  onChange={(e) => setAutoVacantDirty(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2170e4]"></div>
              </label>
            </div>

            {/* Toggle: Default Template Task */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-900">Default Template Task</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automatically pre-checked when assembling new room attendant task groups or creating on-demand
                  housekeeping shifts.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isTemplateDefault}
                  onChange={(e) => setIsTemplateDefault(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2170e4]"></div>
              </label>
            </div>
          </form>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-5 border-t border-slate-100 flex flex-col gap-1 bg-slate-50">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-form"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2170e4] text-white rounded-lg text-xs font-semibold hover:bg-[#1a5bc2] shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Save Task
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            Task sequence index updates across active shift sheets automatically.
          </p>
        </div>
      </aside>
    </>
  );
};
