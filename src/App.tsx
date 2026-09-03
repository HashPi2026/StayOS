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
import { DocumentTypesView } from './components/DocumentTypesView';
import { AddDocumentTypeView } from './components/AddDocumentTypeView';
import { OtherChargesCategoriesView } from './components/OtherChargesCategoriesView';
import { AddOtherChargeCategoryView } from './components/AddOtherChargeCategoryView';
import { OtherChargesView } from './components/OtherChargesView';
import { AddOtherChargeView } from './components/AddOtherChargeView';
import { OtherChargeDrawer } from './components/OtherChargeDrawer';
import { DeleteOtherChargeDialog } from './components/DeleteOtherChargeDialog';
import { MeasurementUnitsView } from './components/MeasurementUnitsView';
import { AddMeasurementUnitView } from './components/AddMeasurementUnitView';
import { MeasurementUnitDrawer } from './components/MeasurementUnitDrawer';
import { DeleteMeasurementUnitDialog } from './components/DeleteMeasurementUnitDialog';
import { PaymentTypesView } from './components/PaymentTypesView';
import { AddPaymentTypeView } from './components/AddPaymentTypeView';
import { PaymentTypeDrawer } from './components/PaymentTypeDrawer';
import { DeletePaymentTypeDialog } from './components/DeletePaymentTypeDialog';
import { ExchangeRatesView } from './components/ExchangeRatesView';
import { AddExchangeRateView } from './components/AddExchangeRateView';
import { ExchangeRateDrawer } from './components/ExchangeRateDrawer';
import { DeleteExchangeRateDialog } from './components/DeleteExchangeRateDialog';
import { RolesPrivilegesView } from './components/RolesPrivilegesView';
import { RoleDrawer } from './components/RoleDrawer';
import { DeleteRoleDialog } from './components/DeleteRoleDialog';
import { PoliciesView } from './components/PoliciesView';
import { AddPolicyView } from './components/AddPolicyView';
import { DeletePolicyDialog } from './components/DeletePolicyDialog';
import { GuestCategoriesView } from './components/GuestCategoriesView';
import { AddGuestCategoryView } from './components/AddGuestCategoryView';
import { DeleteGuestCategoryDialog } from './components/DeleteGuestCategoryDialog';
import { EmailTemplatesView } from './components/EmailTemplatesView';
import { AddEmailTemplateView } from './components/AddEmailTemplateView';
import { EmailTemplateDrawer } from './components/EmailTemplateDrawer';
import { DeleteEmailTemplateDialog } from './components/DeleteEmailTemplateDialog';
import { UserManagementView } from './components/UserManagementView';
import { AddUserView } from './components/AddUserView';
import { GeneralSettingsView } from './components/GeneralSettings/GeneralSettingsView';
import { InviteUserModal } from './components/InviteUserModal';
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
      case 'document-types':
        return <DocumentTypesView />;
      case 'add-document-type':
      case 'edit-document-type':
        return <AddDocumentTypeView />;
      case 'other-charges-categories':
        return <OtherChargesCategoriesView />;
      case 'add-other-charge-category':
      case 'edit-other-charge-category':
        return <AddOtherChargeCategoryView />;
      case 'other-charges':
        return <OtherChargesView />;
      case 'add-other-charge':
      case 'edit-other-charge':
        return <AddOtherChargeView />;
      case 'measurement-units':
        return <MeasurementUnitsView />;
      case 'add-measurement-unit':
      case 'edit-measurement-unit':
        return <AddMeasurementUnitView />;
      case 'payment-types':
        return <PaymentTypesView />;
      case 'add-payment-type':
      case 'edit-payment-type':
        return <AddPaymentTypeView />;
      case 'exchange-rates':
        return <ExchangeRatesView />;
      case 'add-exchange-rate':
      case 'edit-exchange-rate':
        return <AddExchangeRateView />;
      case 'email-templates':
        return <EmailTemplatesView />;
      case 'add-email-template':
      case 'edit-email-template':
        return <AddEmailTemplateView />;
      case 'roles-privileges':
      case 'add-role':
      case 'edit-role':
        return <RolesPrivilegesView />;
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
        return <PoliciesView />;
      case 'add-policy':
        return <AddPolicyView />;
      case 'edit-policy':
        return <AddPolicyView isEdit />;
      case 'guest-categories':
        return <GuestCategoriesView />;
      case 'add-guest-category':
        return <AddGuestCategoryView />;
      case 'edit-guest-category':
        return <AddGuestCategoryView isEdit />;
      case 'user-management':
        return <UserManagementView />;
      case 'add-user':
      case 'edit-user':
        return <AddUserView />;
      case 'general-settings':
      case 'general-settings-rental':
      case 'general-settings-feature':
      case 'general-settings-night-audits':
      case 'general-settings-localization':
      case 'general-settings-display':
      case 'general-settings-folios':
      case 'general-settings-credit-cards':
      case 'general-settings-emails':
      case 'general-settings-guest-mandatory-data':
        return <GeneralSettingsView />;
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
      <OtherChargeDrawer />
      <DeleteOtherChargeDialog />
      <MeasurementUnitDrawer />
      <DeleteMeasurementUnitDialog />
      <PaymentTypeDrawer />
      <DeletePaymentTypeDialog />
      <ExchangeRateDrawer />
      <DeleteExchangeRateDialog />
      <EmailTemplateDrawer />
      <DeleteEmailTemplateDialog />
      <DeletePolicyDialog />
      <DeleteGuestCategoryDialog />
      <RoleDrawer />
      <DeleteRoleDialog />
      <InviteUserModal />
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
