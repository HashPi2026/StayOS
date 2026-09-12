import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PmsModuleInfo, PMS_MODULES_CONFIG } from './types';

interface ComingSoonViewProps {
  module: PmsModuleInfo;
  activeSubMenuKey?: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ module, activeSubMenuKey }) => {
  const { currentProperty, navigate, rooms, buildings, roomTypes } = useProperty();

  const activeSubItem = module.subItems?.find(
    (sub) => sub.key === activeSubMenuKey
  ) || module.subItems?.[0];

  const defaultConfig = PMS_MODULES_CONFIG[module.moduleKey] || {
    materialIcon: 'inventory_2',
    description: 'This operational module is scheduled for development in StayOS PMS.',
    badge: 'Phase 2 Development',
    plannedFeatures: ['Operational telemetry', 'Live workflow integration'],
  };

  const displayIcon = activeSubItem?.materialIcon || defaultConfig.materialIcon;
  const displayTitle = activeSubItem
    ? `${module.displayName}: ${activeSubItem.displayName}`
    : module.displayName;
  const displayBadge = activeSubItem?.badge || defaultConfig.badge || 'Phase 2 Development';
  const displayDescription = activeSubItem?.description || defaultConfig.description;
  const displayFeatures = activeSubItem?.plannedFeatures || defaultConfig.plannedFeatures;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
            <span>StayOS PMS</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span
              onClick={() => module.subItems?.[0] && navigate(module.subItems[0].path)}
              className={`${module.subItems ? 'hover:text-[#4472C4] cursor-pointer' : ''}`}
            >
              {module.displayName}
            </span>
            {activeSubItem && (
              <>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#4472C4] font-semibold">{activeSubItem.displayName}</span>
              </>
            )}
          </div>
          <h1 className="text-[24px] font-bold text-slate-900 tracking-tight mt-1">
            {displayTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#d9e1f2] text-[#4472C4]">
            <span className="w-2 h-2 rounded-full bg-[#4472C4] animate-ping" />
            {displayBadge}
          </span>
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-[#4472C4] hover:bg-[#3b62a8] transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Open Configuration</span>
          </button>
        </div>
      </div>

      {/* Sub-menu Tabs for modules with sub-items (Rate & Availability) */}
      {module.subItems && module.subItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-xl border border-[#e2e8f0] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Sub Menus:
          </span>
          {module.subItems.map((sub, idx) => {
            const isSelected = activeSubItem?.key === sub.key;
            return (
              <button
                key={sub.key}
                onClick={() => navigate(sub.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4472C4] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{sub.materialIcon}</span>
                <span>{sub.displayName}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Centered Intentional Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-10 flex flex-col items-center text-center">
        {/* Module Icon in Brand-Framed Badge */}
        <div className="w-20 h-20 rounded-2xl bg-[#d9e1f2] text-[#4472C4] flex items-center justify-center mb-6 shadow-xs ring-8 ring-[#d9e1f2]/30">
          <span className="material-symbols-outlined text-[44px]">
            {displayIcon}
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight">
          {displayTitle}
        </h2>

        {/* Muted Text as required by UI/UX Design Doc */}
        <p className="text-[16px] text-slate-500 font-medium mt-1 mb-3">
          This sub-module is scheduled for active PMS operational release.
        </p>

        {/* Narrative Description */}
        <p className="text-[14px] text-slate-600 max-w-xl leading-relaxed mb-8">
          {displayDescription}
        </p>

        {/* Planned Features Grid */}
        <div className="w-full max-w-3xl bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
              Planned Core Capabilities
            </span>
            <span className="text-[11px] font-semibold text-[#4472C4] bg-[#d9e1f2]/60 px-2 py-0.5 rounded">
              StayOS Specification v1.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#e2e8f0]/80 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-md bg-[#d9e1f2] text-[#4472C4] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </div>
                <span className="text-[13px] text-slate-700 font-medium leading-snug">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Section */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4472C4] hover:bg-[#3b62a8] text-white font-semibold text-[14px] shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Configure Hotel Parameters in Configuration</span>
          </button>
          <button
            onClick={() => navigate('dashboard')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[14px] transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Property Context Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Active Property</div>
          <div className="text-[15px] font-bold text-slate-800 mt-1 truncate">
            {currentProperty?.identity?.name || 'Destin Inn & Suites'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {currentProperty?.location?.city || 'Destin'}, {currentProperty?.location?.country || 'United States'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Configured Rooms</div>
          <div className="text-[15px] font-bold text-slate-800 mt-1">
            {rooms?.length || 24} Rooms
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {roomTypes?.length || 5} Room Types
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Infrastructure</div>
          <div className="text-[15px] font-bold text-slate-800 mt-1">
            {buildings?.length || 2} Buildings
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Elevators & Wings Mapped</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Working Date</div>
          <div className="text-[15px] font-bold text-[#4472C4] mt-1">
            29-Jun-2026
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Audit Cycle In Sync
          </div>
        </div>
      </div>
    </div>
  );
};
