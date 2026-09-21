import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoomCommentItem } from '../types';
import { INITIAL_ROOM_COMMENTS, ROOM_108_HARDWARE_SPECS, WORKING_DATE } from '../mockData';

interface RoomCommentsScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const RoomCommentsScreen: React.FC<RoomCommentsScreenProps> = ({ onNavigateToScreen }) => {
  const { navigate } = useProperty();
  const [comments, setComments] = useState<RoomCommentItem[]>(INITIAL_ROOM_COMMENTS);
  const [activeRoomNum, setActiveRoomNum] = useState('108');
  const [newCategory, setNewCategory] = useState<
    'Front Desk Note' | 'Housekeeping' | 'Maintenance' | 'Guest Preference' | 'Security Incident'
  >('Front Desk Note');
  const [newCommentText, setNewCommentText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePostComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) {
      showToast('Please enter a comment before appending.');
      return;
    }

    const newEntry: RoomCommentItem = {
      id: String(Date.now()),
      commentId: `LOG-2906-${Math.floor(1000 + Math.random() * 9000)}`,
      authorName: 'Alex Rivera',
      authorRole: 'Front Desk Supervisor',
      authorDepartment: 'Front Desk',
      authorInitials: 'AR',
      terminal: 'FD-01',
      category: newCategory,
      timestamp: `Today, ${WORKING_DATE} • Just Now`,
      content: newCommentText.trim(),
      isUrgentAlert: isUrgent,
      verifiedBadge: 'Appended to PMS Audit Trail',
    };

    setComments((prev) => [newEntry, ...prev]);
    setNewCommentText('');
    setIsUrgent(false);
    showToast(`Comment permanently appended to Room ${activeRoomNum} audit trail.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handlePostComment();
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="px-lg pt-lg pb-base flex flex-col gap-xs bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-xs text-body-sm text-on-surface-variant font-body-sm">
          <span onClick={() => navigate('dashboard')} className="hover:text-primary cursor-pointer transition-colors">Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => onNavigateToScreen ? onNavigateToScreen('search-reservation') : navigate('front-desk')} className="hover:text-primary cursor-pointer transition-colors">Front Desk</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Room Comments</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mt-xs">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Room Activity Feed & Operational Audit Log
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Strictly append-only room audit log, shift handoffs, housekeeping remarks, and guest preferences.
            </p>
          </div>

          <div className="flex items-center gap-sm">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Room Dossier</span>
            </button>
          </div>
        </div>

        {/* Target Room Selector Bar */}
        <div className="mt-sm p-sm bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-center justify-between gap-md border border-surface-container">
          <div className="flex items-center gap-md flex-wrap">
            <div className="flex items-center gap-xs">
              <span className="font-label-uppercase text-[11px] text-on-surface-variant uppercase">Target Unit:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveRoomNum('107');
                    showToast('Loaded Room 107 activity log.');
                  }}
                  className={`px-sm py-1 rounded text-body-sm font-data-mono font-semibold ${
                    activeRoomNum === '107' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  #107
                </button>
                <button
                  onClick={() => {
                    setActiveRoomNum('108');
                    showToast('Loaded Room 108 activity log.');
                  }}
                  className={`px-sm py-1 rounded text-body-sm font-data-mono font-semibold ${
                    activeRoomNum === '108' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  #108 (Active)
                </button>
                <button
                  onClick={() => {
                    setActiveRoomNum('109');
                    showToast('Loaded Room 109 activity log.');
                  }}
                  className={`px-sm py-1 rounded text-body-sm font-data-mono font-semibold ${
                    activeRoomNum === '109' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  #109
                </button>
              </div>
            </div>

            <div className="flex items-center gap-xs text-body-sm">
              <span className="px-sm py-0.5 rounded bg-orange-100 text-orange-900 font-data-mono font-bold text-[11px]">
                OD • Occupied Dirty
              </span>
              <span className="font-semibold text-on-surface">Eleanor Vance (Stayover)</span>
              <span className="text-on-surface-variant font-data-mono text-[11px] hidden md:inline">
                • DLXK Deluxe King (Floor 1, North Tower)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-xs text-body-sm text-on-surface-variant font-data-mono text-[11px]">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">lock_clock</span>
            <span>Audit Trail Sealed • Append-Only</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="px-lg py-md grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Left Column: Comments Timeline Feed + Add Comment Box (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          {/* Post New Comment Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg flex flex-col gap-sm border border-outline-variant/30">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">edit_note</span>
                <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Append Room Comment to Room #{activeRoomNum}
                </h3>
              </div>
              <span className="text-[11px] font-data-mono text-on-surface-variant">
                Author: Alex Rivera (FD-01)
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-xs flex-wrap">
              <span className="font-label-uppercase text-[11px] text-on-surface-variant">Classification:</span>
              {[
                'Front Desk Note',
                'Housekeeping',
                'Maintenance',
                'Guest Preference',
                'Security Incident',
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat as any)}
                  className={`px-sm py-1 rounded text-body-sm font-semibold transition-colors ${
                    newCategory === cat
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <textarea
                rows={3}
                className="w-full p-md bg-surface-container-low rounded-xl border border-outline-variant/40 text-body-sm text-on-surface outline-none focus:bg-surface-container-lowest focus:border-secondary transition-all"
                placeholder="Type operational shift note, maintenance request, or guest preference observation..."
                value={newCommentText}
                onKeyDown={handleKeyDown}
                onChange={(e) => setNewCommentText(e.target.value)}
                maxLength={1000}
              />
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-data-mono px-1">
                <span>Ctrl + Enter to append comment</span>
                <span>{newCommentText.length} / 1000 Characters</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-xs border-t border-surface-container">
              <label className="flex items-center gap-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-body-sm font-semibold text-rose-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                  Flag as Urgent Front Desk Alert
                </span>
              </label>

              <button
                onClick={() => handlePostComment()}
                className="px-lg py-xs bg-secondary text-on-secondary rounded font-semibold text-body-sm shadow-sm hover:opacity-95 transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add_comment</span>
                <span>Append to Room Log</span>
              </button>
            </div>
          </div>

          {/* Chronological Audit Timeline */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg flex flex-col gap-md">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Activity Timeline ({comments.length} Logged Entries)
                </h3>
              </div>
              <span className="text-[11px] font-data-mono text-on-surface-variant">
                Working Date: {WORKING_DATE}
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-md relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
              {comments.map((entry) => (
                <div key={entry.id} className="relative flex flex-col gap-xs group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${
                      entry.isUrgentAlert ? 'bg-rose-600' : 'bg-secondary'
                    }`}
                  ></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-xs">
                    <div className="flex items-center gap-sm">
                      <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-body-sm">
                        {entry.authorInitials}
                      </div>
                      <div>
                        <span className="font-bold text-body-sm text-on-surface">{entry.authorName}</span>
                        <span className="text-[11px] text-on-surface-variant ml-1">
                          • {entry.authorRole} ({entry.terminal})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-xs">
                      <span className="px-xs py-0.5 rounded bg-surface-container text-body-sm font-semibold text-on-surface text-[11px]">
                        {entry.category}
                      </span>
                      {entry.isUrgentAlert && (
                        <span className="px-xs py-0.5 rounded bg-rose-100 text-rose-900 font-bold text-[10px] uppercase">
                          Urgent Alert
                        </span>
                      )}
                      <span className="text-[11px] font-data-mono text-on-surface-variant">{entry.timestamp}</span>
                    </div>
                  </div>

                  <div className="p-md rounded-xl bg-surface-container-low text-body-sm text-on-surface leading-relaxed mt-1">
                    {entry.content}
                  </div>

                  {entry.verifiedBadge && (
                    <div className="flex items-center gap-1 text-[11px] text-secondary font-medium">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>{entry.verifiedBadge}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Physical Room Metadata & Operational Specs (1 Col) */}
        <div className="flex flex-col gap-md">
          {/* Room Specs Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg flex flex-col gap-md border border-outline-variant/30">
            <div className="flex items-center justify-between pb-xs border-b border-surface-container">
              <span className="font-title-sm text-title-sm font-bold text-on-surface">Room {activeRoomNum} Hardware Specs</span>
              <span className="px-sm py-0.5 rounded bg-surface-container font-data-mono text-[11px]">
                {ROOM_108_HARDWARE_SPECS.roomType}
              </span>
            </div>

            {/* Specs Checklist */}
            <div className="space-y-sm text-body-sm">
              <div className="flex items-center justify-between p-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>RFID Keycard Lock:</span>
                </span>
                <span className="font-data-mono font-bold text-emerald-700">
                  {ROOM_108_HARDWARE_SPECS.keycardLock.batteryLevel}% (VingCard)
                </span>
              </div>

              <div className="flex items-center justify-between p-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">thermostat</span>
                  <span>EcoTemp Pro HVAC:</span>
                </span>
                <span className="font-data-mono font-bold text-secondary">
                  {ROOM_108_HARDWARE_SPECS.hvacController.ambientTemp} (Target {ROOM_108_HARDWARE_SPECS.hvacController.targetTemp})
                </span>
              </div>

              <div className="flex items-center justify-between p-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">liquor</span>
                  <span>Smart Minibar Scale:</span>
                </span>
                <span className="font-data-mono text-emerald-700 text-[12px] font-semibold">Active Ping (OK)</span>
              </div>

              <div className="flex items-center justify-between p-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">sanitizer</span>
                  <span>Sanitization Certificate:</span>
                </span>
                <span className="font-data-mono text-emerald-700 font-bold text-[12px]">Grade A+ (Verified)</span>
              </div>
            </div>

            {/* Department Volume Graph */}
            <div className="pt-xs border-t border-surface-container space-y-xs">
              <span className="font-label-uppercase text-[11px] text-on-surface-variant uppercase font-semibold">
                Audit Entries by Department
              </span>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px] font-data-mono">
                    <span>Front Desk</span>
                    <span>12 Notes</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-data-mono">
                    <span>Housekeeping</span>
                    <span>8 Notes</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-data-mono">
                    <span>Engineering</span>
                    <span>4 Notes</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Checklist */}
            <div className="pt-xs border-t border-surface-container space-y-xs">
              <span className="font-label-uppercase text-[11px] text-on-surface-variant uppercase font-semibold">
                Shift Checklist for Room 108
              </span>
              <div className="space-y-1">
                {ROOM_108_HARDWARE_SPECS.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-sm rounded bg-surface-container-low text-[12px]">
                    <span className="text-on-surface">{item.task}</span>
                    <span
                      className={`px-xs py-0.5 rounded font-bold font-data-mono text-[10px] ${
                        item.status === 'DONE'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-lg right-lg z-50 bg-primary text-on-primary px-md py-sm rounded-lg shadow-xl flex items-center gap-sm animate-in fade-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          <span className="font-body-sm text-[13px]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
