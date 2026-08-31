/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PropertyProvider, useProperty } from './context/PropertyContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PropertyMasterView } from './components/PropertyMasterView';
import { BuildingsListView } from './components/BuildingsListView';
import { AddBuildingView } from './components/AddBuildingView';
import { EditBuildingView } from './components/EditBuildingView';
import { BuildingDrawer } from './components/BuildingDrawer';
import { DeleteBuildingDialog } from './components/DeleteBuildingDialog';
import { VerifyPinModal } from './components/VerifyPinModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer } from './components/ToastContainer';
import {
  RoomTypesView,
  RoomsView,
  AmenitiesView,
  AuditLogsView,
  SystemHealthView,
  GenericSettingsView,
} from './components/OtherViews';

const MainLayout: React.FC = () => {
  const { activePath } = useProperty();

  const renderActiveScreen = () => {
    switch (activePath) {
      case 'overview':
        return <PropertyMasterView />;
      case 'buildings':
        return <BuildingsListView />;
      case 'add-building':
        return <AddBuildingView />;
      case 'edit-building':
        return <EditBuildingView />;
      case 'room-types':
        return <RoomTypesView />;
      case 'rooms':
        return <RoomsView />;
      case 'amenities':
        return <AmenitiesView />;
      case 'rates-packages':
        return (
          <GenericSettingsView
            title="Rates & Packages"
            subtitle="Manage dynamic pricing models, rate tiers, and promotional packaging."
            category="Configuration"
          />
        );
      case 'taxes':
        return (
          <GenericSettingsView
            title="Taxes & Surcharges"
            subtitle="Configure regional accommodation taxes, VAT rules, and municipal fees."
            category="Configuration"
          />
        );
      case 'policies':
        return (
          <GenericSettingsView
            title="Policies & Compliance"
            subtitle="Configure check-in/out policies, deposits, and cancellation terms."
            category="Configuration"
          />
        );
      case 'user-management':
        return (
          <GenericSettingsView
            title="User Management"
            subtitle="Manage staff accounts, hotel managers, and role-based permissions."
            category="Settings"
          />
        );
      case 'integrations':
        return (
          <GenericSettingsView
            title="System Integrations"
            subtitle="Configure PMS sync, OTA channel managers, and payment terminals."
            category="Settings"
          />
        );
      case 'notifications':
        return (
          <GenericSettingsView
            title="Notification Rules"
            subtitle="Set up automated guest SMS, confirmation emails, and lead alerts."
            category="Settings"
          />
        );
      case 'audit-logs':
        return <AuditLogsView />;
      case 'system-health':
        return <SystemHealthView />;
      default:
        return <PropertyMasterView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] relative flex">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-[240px] flex-1 flex flex-col min-w-0">
        <Header />
        <main className="relative pt-16 flex-1 min-h-screen bg-[#f7f9fb]">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <BuildingDrawer />
      <DeleteBuildingDialog />
      <VerifyPinModal />
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PropertyProvider>
      <MainLayout />
    </PropertyProvider>
  );
}
