import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { PmsSidebar } from './PmsSidebar';
import { PmsHeader } from './PmsHeader';
import { ComingSoonView } from './ComingSoonView';
import { RateAvailabilityMaster } from '../rate-availability';
import { PmsModuleInfo, PMS_MODULES_CONFIG, RATE_AVAILABILITY_SUBMENUS } from './types';

const DEFAULT_MODULES: PmsModuleInfo[] = [
  { moduleKey: 'dashboard', displayName: 'Dashboard', iconKey: 'layout-dashboard', materialIcon: 'space_dashboard', sortOrder: 1, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.dashboard.description, plannedFeatures: PMS_MODULES_CONFIG.dashboard.plannedFeatures },
  { moduleKey: 'reservation', displayName: 'Reservation', iconKey: 'calendar-check', materialIcon: 'calendar_month', sortOrder: 2, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.reservation.description, plannedFeatures: PMS_MODULES_CONFIG.reservation.plannedFeatures },
  { moduleKey: 'front_desk', displayName: 'Front Desk', iconKey: 'concierge-bell', materialIcon: 'desk', sortOrder: 3, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.front_desk.description, plannedFeatures: PMS_MODULES_CONFIG.front_desk.plannedFeatures },
  { moduleKey: 'rate_availability', displayName: 'Rate & Availability', iconKey: 'tags', materialIcon: 'sell', sortOrder: 4, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.rate_availability.description, plannedFeatures: PMS_MODULES_CONFIG.rate_availability.plannedFeatures, subItems: RATE_AVAILABILITY_SUBMENUS },
  { moduleKey: 'audit', displayName: 'Audit', iconKey: 'clipboard-list', materialIcon: 'fact_check', sortOrder: 5, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.audit.description, plannedFeatures: PMS_MODULES_CONFIG.audit.plannedFeatures },
  { moduleKey: 'business_channels', displayName: 'Business Channels', iconKey: 'share-2', materialIcon: 'hub', sortOrder: 6, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.business_channels.description, plannedFeatures: PMS_MODULES_CONFIG.business_channels.plannedFeatures },
  { moduleKey: 'guest', displayName: 'Guest', iconKey: 'users', materialIcon: 'group', sortOrder: 7, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.guest.description, plannedFeatures: PMS_MODULES_CONFIG.guest.plannedFeatures },
  { moduleKey: 'housekeeping', displayName: 'Housekeeping', iconKey: 'broom', materialIcon: 'cleaning_services', sortOrder: 8, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.housekeeping.description, plannedFeatures: PMS_MODULES_CONFIG.housekeeping.plannedFeatures },
  { moduleKey: 'utility', displayName: 'Utility', iconKey: 'wrench', materialIcon: 'build', sortOrder: 9, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.utility.description, plannedFeatures: PMS_MODULES_CONFIG.utility.plannedFeatures },
  { moduleKey: 'reports', displayName: 'Reports', iconKey: 'bar-chart-2', materialIcon: 'bar_chart', sortOrder: 10, isBuilt: false, hasAccess: true, description: PMS_MODULES_CONFIG.reports.description, plannedFeatures: PMS_MODULES_CONFIG.reports.plannedFeatures },
  { moduleKey: 'configuration', displayName: 'Configuration', iconKey: 'settings', materialIcon: 'settings', sortOrder: 11, isBuilt: true, hasAccess: true, description: PMS_MODULES_CONFIG.configuration.description, plannedFeatures: PMS_MODULES_CONFIG.configuration.plannedFeatures },
];

export const MainPmsShell: React.FC = () => {
  const { activePath, currentUser } = useProperty();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [modules, setModules] = useState<PmsModuleInfo[]>(DEFAULT_MODULES);

  // Sync with /api/v1/modules backend table
  useEffect(() => {
    async function fetchModules() {
      try {
        const roleId = currentUser?.role?.toLowerCase().includes('staff') || currentUser?.role?.toLowerCase().includes('front') ? 2 : 1;
        const res = await fetch(`/api/v1/modules?role_id=${roleId}`);
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
              isBuilt: item.is_built,
              hasAccess: item.has_access !== false,
              description: conf.description,
              badge: conf.badge,
              plannedFeatures: conf.plannedFeatures,
              subItems: item.module_key === 'rate_availability' ? RATE_AVAILABILITY_SUBMENUS : undefined,
            };
          });
          setModules(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch modules from backend, using defaults', err);
      }
    }
    fetchModules();
  }, [currentUser?.role]);

  // Determine current active PMS module & sub-menu
  const isRateAvailability =
    activePath === 'rate-availability' ||
    activePath === 'rate_availability' ||
    activePath.startsWith('rate-availability-') ||
    activePath.startsWith('rate_availability_');

  const currentModuleKey =
    activePath === 'front-desk'
      ? 'front_desk'
      : isRateAvailability
      ? 'rate_availability'
      : activePath === 'business-channels'
      ? 'business_channels'
      : activePath === 'house-keeping'
      ? 'housekeeping'
      : activePath;

  let activeSubMenuKey: string | undefined;
  if (isRateAvailability) {
    if (activePath.includes('flash')) activeSubMenuKey = 'flash';
    else if (activePath.includes('forecasting')) activeSubMenuKey = 'forecasting';
    else if (activePath.includes('restriction')) activeSubMenuKey = 'restriction';
    else if (activePath.includes('rate')) activeSubMenuKey = 'rate';
    else activeSubMenuKey = 'flash';
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
          {isRateAvailability ? (
            <RateAvailabilityMaster initialSubMenu={activeSubMenuKey} />
          ) : (
            <ComingSoonView
              module={currentModule}
              activeSubMenuKey={activeSubMenuKey}
            />
          )}
        </main>
      </div>
    </div>
  );
};
