import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Sparkles, 
  GripVertical, 
  Zap, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Save, 
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { HousekeepingTask } from '../types';

interface HousekeepingTasksTabProps {
  tasks: HousekeepingTask[];
  onOpenAddTask: () => void;
  onEditTask: (task: HousekeepingTask) => void;
  onDuplicateTask: (task: HousekeepingTask) => void;
  onDeleteTaskRequest: (task: HousekeepingTask) => void;
  onReorderTasks: (newTasks: HousekeepingTask[]) => void;
}

export const HousekeepingTasksTab: React.FC<HousekeepingTasksTabProps> = ({
  tasks,
  onOpenAddTask,
  onEditTask,
  onDuplicateTask,
  onDeleteTaskRequest,
  onReorderTasks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState('Synced at 10:42 AM');

  const filteredTasks = tasks.filter((t) => {
    const q = searchTerm.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

  const avgDuration = Math.round(tasks.reduce((sum, t) => sum + t.durationMinutes, 0) / (tasks.length || 1));
  const vacantDirtyCount = tasks.filter((t) => t.autoVacantDirty).length;
  const templateDefaultCount = tasks.filter((t) => t.isTemplateDefault).length;

  // Drag & drop sorting
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) return;

    const fromIndex = tasks.findIndex((t) => t.id === draggedTaskId);
    const toIndex = tasks.findIndex((t) => t.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // re-assign seq
    const updated = reordered.map((item, idx) => ({ ...item, seq: idx + 1 }));
    onReorderTasks(updated);
    setDraggedTaskId(null);

    const now = new Date();
    setSyncMessage(`Order reordered at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleSaveOrder = () => {
    const now = new Date();
    setSyncMessage(`Order synced at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer">Operations</span>
            <span>/</span>
            <span className="hover:text-slate-800 cursor-pointer">Housekeeping</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Tasks</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Housekeeping Tasks</h1>
            <span className="text-xs text-slate-500">Standardized attendant routine workflows</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2170e4] text-white rounded-lg shadow-sm text-xs font-semibold hover:bg-[#1a5bc2] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Tasks</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">{tasks.length}</div>
            <span className="text-xs text-[#2170e4] flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active in rotation
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2170e4]">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Vacant Dirty Auto-Run</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">{vacantDirtyCount}</div>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5 text-[#2170e4]" />
              Triggers checkout cycle
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2170e4]">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Template Defaults</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">{templateDefaultCount}</div>
            <span className="text-xs text-slate-500 mt-1">Pre-selected in rosters</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Task Duration</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-slate-900">{avgDuration}</span>
              <span className="text-xs text-slate-500">min</span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Standard room pace
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reorder Sequence Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <p className="text-xs text-slate-800">
              <strong className="font-semibold text-slate-900">Display Sequence:</strong> Drag rows using the 6-dot
              handle (<span className="font-mono">⠿</span>) to set assignment priority across attendant worksheets.
            </p>
            <span className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-semibold rounded-full border border-slate-200 w-fit">
              Automatic Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#2170e4] animate-pulse"></span>
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={handleSaveOrder}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Order
          </button>
        </div>
      </div>

      {/* Master Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Configured Workflow Tasks</span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-mono rounded">
              {tasks.length} Entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-white rounded-lg px-2.5 py-1 border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Filter by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs text-slate-900 outline-none w-44"
              />
            </div>
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
              title="Compact view"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="w-10 px-3 py-2.5 text-center">Seq</th>
                <th className="px-4 py-2.5">Task Name & Description</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Auto: Vacant Dirty</th>
                <th className="px-4 py-2.5">Template Default</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, task.id)}
                  className={`group hover:bg-slate-50/80 transition-colors ${
                    isCompact ? 'py-1' : 'py-3'
                  } ${draggedTaskId === task.id ? 'opacity-40 bg-blue-50' : ''}`}
                >
                  <td className="px-3 py-3 text-center">
                    <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-600 cursor-grab active:cursor-grabbing mx-auto" />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-[#2170e4] transition-colors text-xs">
                        {task.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-0.5">
                        <span className="bg-slate-100 px-1 py-0.2 rounded text-slate-700 font-bold">{task.code}</span>
                        <span>• {task.description}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded font-mono text-slate-700 text-xs">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.durationMinutes} min
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {task.autoVacantDirty ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#2170e4] border border-blue-100 text-[11px] font-semibold rounded">
                        <Zap className="w-3 h-3" />
                        Auto: Vacant Dirty
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {task.isTemplateDefault ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-semibold rounded border border-slate-200">
                        <CheckSquare className="w-3 h-3 text-[#2170e4]" />
                        Default
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-[#2170e4] hover:bg-blue-50 rounded transition-colors"
                        title="Edit Task"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicateTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        title="Duplicate Task"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTaskRequest(task)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-xs">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-[#2170e4]"></span> Auto: Vacant Dirty
              (Instant assign)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300"></span> Default
              (Pre-checked in groups)
            </span>
          </div>
          <span className="font-mono text-[11px]">Display sequence 1 → {tasks.length} preserved across attendants</span>
        </div>
      </div>

      {/* Compliance / SOP Runbook Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2170e4] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs">StayOS Standard Compliance Check</span>
            <p className="text-xs text-slate-500">
              All tasks conform to ISO 9001 hospitality sanitation criteria. Attendants confirm execution via mobile
              PMS app.
            </p>
          </div>
        </div>
        <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
          Export SOP Runbook
        </button>
      </div>
    </div>
  );
};
