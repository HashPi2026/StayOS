import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';

interface AuditStep {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  details?: string;
}

interface AuditLogItem {
  dev_log_id: string;
  timestamp: string;
  user_name: string;
  action: string;
  module: string;
}

export const AuditView: React.FC = () => {
  const { currentPropertyId, addToast } = useProperty();

  const [steps, setSteps] = useState<AuditStep[]>([
    {
      id: 1,
      title: 'Pending Departures & No-Show Clearance',
      description: 'Verifies all expected departures are checked out and marks unarrived reservations as No-Show.',
      status: 'PENDING',
    },
    {
      id: 2,
      title: 'Front Office Cashier Shift Balancing',
      description: 'Reconciles payment gateway terminals, cash drawer, and credit card settlements.',
      status: 'PENDING',
    },
    {
      id: 3,
      title: 'Room & Tax Automatic Batch Posting',
      description: 'Posts daily room rate, CGST, SGST, and luxury taxes to all active in-house guest folios.',
      status: 'PENDING',
    },
    {
      id: 4,
      title: 'Housekeeping Status Verification',
      description: 'Synchronizes room physical status with housekeeping dirty/clean turnover ledger.',
      status: 'PENDING',
    },
    {
      id: 5,
      title: 'Trial Balance & Revenue Settlement',
      description: 'Generates daily manager summary, occupancy figures, ADR, and general ledger accounts.',
      status: 'PENDING',
    },
    {
      id: 6,
      title: 'Business Date Rollover to 30-Jun-2026',
      description: 'Advances the PMS operational date to the next business cycle and locks historical transactions.',
      status: 'PENDING',
    },
  ]);

  const [isAuditing, setIsAuditing] = useState(false);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/v1/audit/logs`, {
        headers: { 'x-client-id': currentPropertyId },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) setLogs(json.data);
      }
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPropertyId]);

  const runSingleStep = async (stepId: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status: 'RUNNING' } : s))
    );

    try {
      const res = await fetch(`/api/v1/audit/run-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': currentPropertyId,
        },
        body: JSON.stringify({
          stepNumber: stepId,
          stepName: step.title,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSteps((prev) =>
          prev.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status: 'COMPLETED',
                  details: json.data?.message || 'Verification complete.',
                }
              : s
          )
        );
        addToast(`Step ${stepId} completed successfully`, 'success');
        fetchLogs();
      }
    } catch {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: 'ERROR' } : s))
      );
      addToast(`Step ${stepId} encountered an error`, 'error');
    }
  };

  const runAllSteps = async () => {
    setIsAuditing(true);
    for (let i = 0; i < steps.length; i++) {
      setActiveStepIndex(i);
      await runSingleStep(steps[i].id);
      // Brief pause between steps for realistic sequential processing
      await new Promise((r) => setTimeout(r, 600));
    }
    setIsAuditing(false);
    setActiveStepIndex(null);
    addToast('Night Audit Sequence Complete! Business date advanced.', 'success');
  };

  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[28px]">nightlight</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Night Audit & End of Day (EOD)</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Financial Close
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating Date: <strong className="text-slate-800">29-Jun-2026</strong> &bull; Target Rollover Date:{' '}
              <strong className="text-emerald-700 font-bold">30-Jun-2026</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={runAllSteps}
            disabled={isAuditing || completedCount === steps.length}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              completedCount === steps.length
                ? 'bg-emerald-600'
                : 'bg-[#4472C4] hover:bg-[#365cb5]'
            } disabled:opacity-60`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {completedCount === steps.length ? 'check_circle' : 'play_arrow'}
            </span>
            {isAuditing
              ? 'Processing EOD...'
              : completedCount === steps.length
              ? 'Audit Complete'
              : 'Run Night Audit (All 6 Steps)'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Audit Checklist Progress: {completedCount} / {steps.length} Steps Done
          </span>
          <span className="text-slate-500 font-mono font-bold">
            {Math.round((completedCount / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 6 Step Interactive Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isRunning = step.status === 'RUNNING';

          return (
            <div
              key={step.id}
              className={`p-4 bg-white rounded-xl border transition-all ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : isRunning
                  ? 'border-blue-400 shadow-xs'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isRunning
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : step.id}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => runSingleStep(step.id)}
                  disabled={isDone || isRunning || isAuditing}
                  className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isRunning
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isDone ? 'Verified' : isRunning ? 'Running...' : 'Execute'}
                </button>
              </div>

              {step.details && (
                <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  {step.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900">Recent Audit & System Event Log</h2>
          <button onClick={fetchLogs} className="text-[11px] text-[#4472C4] font-semibold hover:underline">
            Refresh Log
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Operator</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Operational Action Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No audit entries recorded yet.
                </td>
              </tr>
            ) : (
              logs.slice(0, 8).map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-500 text-[11px]">
                    {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Recent'}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{l.user_name || 'System Operator'}</td>
                  <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">{l.module}</td>
                  <td className="px-4 py-2.5 text-slate-700">{l.action}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
