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
import { FloorsListView } from './components/FloorsListView';
import { FloorDrawer } from './components/FloorDrawer';
import { DeleteFloorDialog } from './components/DeleteFloorDialog';
import { RoomTypesListView } from './components/RoomTypesListView';
import { AddRoomTypeView } from './components/AddRoomTypeView';
import { EditRoomTypeView } from './components/EditRoomTypeView';
import { RoomTypeDrawer } from './components/RoomTypeDrawer';
import { DeleteRoomTypeDialog } from './components/DeleteRoomTypeDialog';
import { RoomsListView } from './components/RoomsListView';
import { AddRoomView } from './components/AddRoomView';
import { BulkAddRoomsView } from './components/BulkAddRoomsView';
import { EditRoomView } from './components/EditRoomView';
import { DeleteRoomDialog } from './components/DeleteRoomDialog';
import { RoomStatusMasterView } from './components/RoomStatusMasterView';
import { RoomStatusDrawer } from './components/RoomStatusDrawer';
import { DeleteRoomStatusDialog } from './components/DeleteRoomStatusDialog';
import { TaxesView } from './components/TaxesView';
import { TaxConfigurationView } from './components/TaxConfigurationView';
import { AddTaxView } from './components/AddTaxView';
import { AddTaxRateView } from './components/AddTaxRateView';
import { RateTypesView } from './components/RateTypesView';
import { TaxDrawer } from './components/TaxDrawer';
import { TaxRuleDrawer } from './components/TaxRuleDrawer';
import { TaxConfigDrawer } from './components/TaxConfigDrawer';
import { DeleteTaxDialog } from './components/DeleteTaxDialog';
import { VerifyPinModal } from './components/VerifyPinModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer } from './components/ToastContainer';
import {
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
      case 'floors':
        return <FloorsListView />;
      case 'room-types':
        return <RoomTypesListView />;
      case 'add-room-type':
        return <AddRoomTypeView />;
      case 'edit-room-type':
        return <EditRoomTypeView />;
      case 'rooms':
        return <RoomsListView />;
      case 'add-room':
        return <AddRoomView />;
      case 'bulk-add-rooms':
        return <BulkAddRoomsView />;
      case 'edit-room':
        return <EditRoomView />;
      case 'room-status':
        return <RoomStatusMasterView />;
      case 'amenities':
        return <AmenitiesView />;
      case 'rates-packages':
        return <RateTypesView />;
      case 'taxes':
        return <TaxesView />;
      case 'tax-configuration':
        return <TaxConfigurationView />;
      case 'add-tax':
        return <AddTaxView />;
      case 'edit-tax':
        return <AddTaxView isEdit />;
      case 'add-tax-rate':
        return <AddTaxRateView />;
      case 'edit-tax-rate':
        return <AddTaxRateView isEdit />;
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
      <FloorDrawer />
      <DeleteFloorDialog />
      <RoomTypeDrawer />
      <DeleteRoomTypeDialog />
      <DeleteRoomDialog />
      <RoomStatusDrawer />
      <DeleteRoomStatusDialog />
      <TaxDrawer />
      <TaxRuleDrawer />
      <TaxConfigDrawer />
      <DeleteTaxDialog />
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
