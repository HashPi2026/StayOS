import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PmsSidebar } from './PmsSidebar';
import { PmsHeader } from './PmsHeader';
import { ComingSoonView } from './ComingSoonView';
import { RateAvailabilityMaster } from '../rate-availability';
import { GuestMaster } from '../guest';
import { DashboardView } from '../dashboard/DashboardView';
import { FrontDeskView } from '../frontdesk/FrontDeskView';
import { ReservationView } from '../reservation/ReservationView';
import { AuditView } from '../audit/AuditView';
import { BusinessChannelsView } from '../channels/BusinessChannelsView';
import { HousekeepingView } from '../housekeeping/HousekeepingView';
import { UtilityView } from '../utility/UtilityView';
import { ReportsView } from '../reports/ReportsView';
import { ErrorBoundary } from '@/src/components/shared';
import { PmsModuleInfo, PMS_MODULES_CONFIG, RATE_AVAILABILITY_SUBMENUS, GUEST_SUBMENUS, HOUSEKEEPING_SUBMENUS, FRONT_DESK_SUBMENUS } from './types';

const DEFAULT_MODULES: PmsModuleInfo[] = [
  { moduleKey: 'dashboard', displayName: 'Dashboard', iconKey: 'layout-dashboard', materialIcon: 'space_dashboard', sortOrder: 1, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.dashboard.description, plannedFeatures: PMS_MODULES_CONFIG.dashboard.plannedFeatures },
  { moduleKey: 'reservation', displayName: 'Reservation', iconKey: 'calendar-check', materialIcon: 'calendar_month', sortOrder: 2, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.reservation.description, plannedFeatures: PMS_MODULES_CONFIG.reservation.plannedFeatures },
  { moduleKey: 'front_desk', displayName: 'Front Desk', iconKey: 'concierge-bell', materialIcon: 'desk', sortOrder: 3, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.front_desk.description, plannedFeatures: PMS_MODULES_CONFIG.front_desk.plannedFeatures, subItems: FRONT_DESK_SUBMENUS },
  { moduleKey: 'rate_availability', displayName: 'Rate & Availability', iconKey: 'tags', materialIcon: 'sell', sortOrder: 4, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.rate_availability.description, plannedFeatures: PMS_MODULES_CONFIG.rate_availability.plannedFeatures, subItems: RATE_AVAILABILITY_SUBMENUS },
  { moduleKey: 'audit', displayName: 'Audit', iconKey: 'clipboard-list', materialIcon: 'fact_check', sortOrder: 5, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.audit.description, plannedFeatures: PMS_MODULES_CONFIG.audit.plannedFeatures },
  { moduleKey: 'business_channels', displayName: 'Business Channels', iconKey: 'share-2', materialIcon: 'hub', sortOrder: 6, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.business_channels.description, plannedFeatures: PMS_MODULES_CONFIG.business_channels.plannedFeatures },
  { moduleKey: 'guest', displayName: 'Guest', iconKey: 'users', materialIcon: 'group', sortOrder: 7, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.guest.description, plannedFeatures: PMS_MODULES_CONFIG.guest.plannedFeatures, subItems: GUEST_SUBMENUS },
  { moduleKey: 'housekeeping', displayName: 'Housekeeping', iconKey: 'broom', materialIcon: 'cleaning_services', sortOrder: 8, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.housekeeping.description, plannedFeatures: PMS_MODULES_CONFIG.housekeeping.plannedFeatures, subItems: HOUSEKEEPING_SUBMENUS },
  { moduleKey: 'utility', displayName: 'Utility', iconKey: 'wrench', materialIcon: 'build', sortOrder: 9, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.utility.description, plannedFeatures: PMS_MODULES_CONFIG.utility.plannedFeatures },
  { moduleKey: 'reports', displayName: 'Reports', iconKey: 'bar-chart-2', materialIcon: 'bar_chart', sortOrder: 10, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.reports.description, plannedFeatures: PMS_MODULES_CONFIG.reports.plannedFeatures },
  { moduleKey: 'configuration', displayName: 'Configuration', iconKey: 'settings', materialIcon: 'settings', sortOrder: 11, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.configuration.description, plannedFeatures: PMS_MODULES_CONFIG.configuration.plannedFeatures },
];

export const MainPmsShell: React.FC = () => {
  const { activePath, navigate, currentUser, currentProperty, currentPropertyId } = useProperty();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [modules, setModules] = useState<PmsModuleInfo[]>(DEFAULT_MODULES);

  const effectiveRoleId =
    currentUser?.roleId ||
    (currentUser?.role?.toLowerCase().includes('staff') ||
    currentUser?.role?.toLowerCase().includes('front')
      ? 2
      : 1);

  // Sync with /api/v1/modules backend table with strict role check
  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await fetch(`/api/v1/modules?role_id=${effectiveRoleId}`, {
          headers: {
            'x-role-id': String(effectiveRoleId),
            'x-client-id': currentPropertyId,
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const mapped: PmsModuleInfo[] = json.data.map((item: any) => {
            const conf = PMS_MODULES_CONFIG[item.module_key] || {
              materialIcon: 'inventory_2',
              description: 'Operational PMS module.',
              plannedFeatures: [],
            };
            return {
              moduleKey: item.module_key,
              displayName: item.display_name,
              iconKey: item.icon_key,
              materialIcon: conf.materialIcon,
              sortOrder: item.sort_order,
              isBuilt:
                item.module_key === 'guest' ||
                item.module_key === 'housekeeping' ||
                item.module_key === 'front_desk' ||
                item.module_key === 'front-desk'
                  ? true
                  : item.is_built,
              hasAccess: item.has_access !== false,
              description: conf.description,
              badge: conf.badge,
              plannedFeatures: conf.plannedFeatures,
              subItems:
                item.module_key === 'front_desk' || item.module_key === 'front-desk'
                  ? FRONT_DESK_SUBMENUS
                  : item.module_key === 'rate_availability'
                  ? RATE_AVAILABILITY_SUBMENUS
                  : item.module_key === 'guest'
                  ? GUEST_SUBMENUS
                  : item.module_key === 'housekeeping'
                  ? HOUSEKEEPING_SUBMENUS
                  : undefined,
            };
          });
          setModules(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch modules from backend, using defaults', err);
      }
    }
    fetchModules();
  }, [currentUser?.role, currentUser?.roleId, effectiveRoleId, currentPropertyId]);

  // Determine current active PMS module & sub-menu
  const normalizedPath = (activePath || '').toLowerCase().replace(/^\/+/, '');

  const isRateAvailability =
    normalizedPath === 'rate-availability' ||
    normalizedPath === 'rate_availability' ||
    normalizedPath.startsWith('rate-availability-') ||
    normalizedPath.startsWith('rate_availability_');

  const isGuest =
    normalizedPath === 'guest' ||
    normalizedPath.startsWith('guest-') ||
    normalizedPath.startsWith('guest/') ||
    normalizedPath === 'contacts' ||
    normalizedPath.startsWith('contacts-') ||
    normalizedPath === 'lost-and-found' ||
    normalizedPath === 'lost_and_found' ||
    normalizedPath === 'add-guest' ||
    normalizedPath === 'edit-guest';

  const isHousekeeping =
    normalizedPath === 'housekeeping' ||
    normalizedPath === 'house-keeping' ||
    normalizedPath.startsWith('housekeeping-') ||
    normalizedPath.startsWith('house-keeping-');

  const isFrontDesk =
    normalizedPath === 'front-desk' ||
    normalizedPath === 'front_desk' ||
    normalizedPath === 'frontdesk' ||
    normalizedPath.startsWith('front-desk-') ||
    normalizedPath.startsWith('front_desk_') ||
    normalizedPath.startsWith('frontdesk-') ||
    normalizedPath.startsWith('frontdesk_') ||
    normalizedPath.startsWith('front-desk/') ||
    normalizedPath.startsWith('front_desk/') ||
    normalizedPath.startsWith('frontdesk/') ||
    normalizedPath === 'search-reservation' ||
    normalizedPath === 'guest-ledger' ||
    normalizedPath === 'batch-folio' ||
    normalizedPath === 'change-room-status' ||
    normalizedPath === 'block-room' ||
    normalizedPath === 'edit-group' ||
    normalizedPath === 'room-comments';

  const currentModuleKey =
    isFrontDesk
      ? 'front_desk'
      : isRateAvailability
      ? 'rate_availability'
      : isGuest
      ? 'guest'
      : isHousekeeping
      ? 'housekeeping'
      : normalizedPath === 'business-channels'
      ? 'business_channels'
      : normalizedPath;

  let activeSubMenuKey: string | undefined;
  if (isFrontDesk) {
    if (normalizedPath.includes('guest-ledger') || normalizedPath.includes('ledger')) activeSubMenuKey = 'guest-ledger';
    else if (normalizedPath.includes('batch-folio') || normalizedPath.includes('folio')) activeSubMenuKey = 'batch-folio';
    else if (normalizedPath.includes('change-room-status') || normalizedPath.includes('room-status')) activeSubMenuKey = 'change-room-status';
    else if (normalizedPath.includes('block-room') || normalizedPath.includes('block')) activeSubMenuKey = 'block-room';
    else if (normalizedPath.includes('edit-group') || normalizedPath.includes('group')) activeSubMenuKey = 'edit-group';
    else if (normalizedPath.includes('room-comments') || normalizedPath.includes('comments')) activeSubMenuKey = 'room-comments';
    else activeSubMenuKey = 'search-reservation';
  } else if (isRateAvailability) {
    if (normalizedPath.includes('flash')) activeSubMenuKey = 'flash';
    else if (normalizedPath.includes('forecasting')) activeSubMenuKey = 'forecasting';
    else if (normalizedPath.includes('restriction')) activeSubMenuKey = 'restriction';
    else if (normalizedPath.includes('rate')) activeSubMenuKey = 'rate';
    else activeSubMenuKey = 'flash';
  } else if (isGuest) {
    if (normalizedPath.includes('contacts')) activeSubMenuKey = 'contacts';
    else if (normalizedPath.includes('lost-and-found') || normalizedPath.includes('lost_and_found')) activeSubMenuKey = 'lost-and-found';
    else activeSubMenuKey = 'guest-database';
  } else if (isHousekeeping) {
    if (normalizedPath.includes('member')) activeSubMenuKey = 'members';
    else if (normalizedPath.includes('assignment')) activeSubMenuKey = 'assignment';
    else if (normalizedPath.includes('task')) activeSubMenuKey = 'tasks';
    else activeSubMenuKey = 'groups';
  }

  const currentModule =
    modules.find((m) => m.moduleKey === currentModuleKey) ||
    modules.find((m) => m.moduleKey === 'dashboard') ||
    modules[0];

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-[#191c1e] relative flex">
      {/* Persistent Left Sidebar */}
      <PmsSidebar
        modules={modules}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'pl-[72px]' : 'pl-[220px]'
        }`}
      >
        <PmsHeader isSidebarCollapsed={isSidebarCollapsed} />

        <main className="relative pt-16 flex-1 min-h-screen bg-[#f5f6fa]">
          <ErrorBoundary fallbackTitle="Operational View Error">
            {!currentModule.hasAccess ? (
              <div className="p-8 flex items-center justify-center min-h-[70vh]">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[32px]">lock</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Access Restricted</h2>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-[12px] font-medium my-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Role: {currentUser?.role || 'Front Desk'} (Role ID #{effectiveRoleId})
                  </div>
                  <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
                    Your assigned user role does not have authorization to access the{' '}
                    <strong className="text-slate-700">{currentModule.displayName}</strong> module for{' '}
                    <strong className="text-slate-700">{currentProperty?.identity?.name || 'this property'}</strong>.
                    Administrative privileges are required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      onClick={() => navigate('dashboard')}
                      className="px-4 py-2.5 rounded-xl bg-[#4472C4] hover:bg-[#365cb5] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      Go to Operations Dashboard
                    </button>
                    <button
                      onClick={() => navigate('front-desk')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
                    >
                      Front Desk
                    </button>
                  </div>
                </div>
              </div>
            ) : currentModuleKey === 'dashboard' ? (
              <DashboardView />
            ) : currentModuleKey === 'front_desk' ? (
              <FrontDeskView
                initialScreen={activeSubMenuKey}
                onScreenChange={(screen) => navigate(screen as any)}
              />
            ) : currentModuleKey === 'reservation' ? (
              <ReservationView />
            ) : currentModuleKey === 'audit' ? (
              <AuditView />
            ) : currentModuleKey === 'business_channels' ? (
              <BusinessChannelsView />
            ) : currentModuleKey === 'housekeeping' ? (
              <HousekeepingView initialTab={activeSubMenuKey as any} />
            ) : currentModuleKey === 'utility' ? (
              <UtilityView />
            ) : currentModuleKey === 'reports' ? (
              <ReportsView />
            ) : isRateAvailability ? (
              <RateAvailabilityMaster initialSubMenu={activeSubMenuKey} />
            ) : isGuest ? (
              <div className="p-6">
                <GuestMaster
                  currentPath={activePath}
                  onNavigate={(path) => navigate(path as any)}
                />
              </div>
            ) : (
              <ComingSoonView
                module={currentModule}
                activeSubMenuKey={activeSubMenuKey}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
