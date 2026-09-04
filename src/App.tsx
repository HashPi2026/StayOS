/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PropertyProvider, useProperty } from './context/PropertyContext';
import { Sidebar, Header } from './components/layout';
import { ToastContainer, GlobalSearchModal, VerifyPinModal } from './components/shared';

// Property Features
import {
  BuildingsListView,
  AddBuildingView,
  EditBuildingView,
  BuildingDrawer,
  DeleteBuildingDialog,
} from './features/property/building';
import {
  FloorsListView,
  FloorDrawer,
  DeleteFloorDialog,
} from './features/property/floor';
import {
  RoomTypesListView,
  AddRoomTypeView,
  EditRoomTypeView,
  RoomTypeDrawer,
  DeleteRoomTypeDialog,
} from './features/property/room-type';
import {
  RoomsListView,
  AddRoomView,
  EditRoomView,
  BulkAddRoomsView,
  DeleteRoomDialog,
} from './features/property/room';
import {
  RoomStatusMasterView,
  RoomStatusDrawer,
  DeleteRoomStatusDialog,
} from './features/property/room-status';
import {
  TaxesView,
  TaxConfigurationView,
  AddTaxView,
  AddTaxRateView,
  TaxDrawer,
  TaxRuleDrawer,
  TaxConfigDrawer,
  DeleteTaxDialog,
} from './features/property/tax';
import { PropertyMasterView } from './features/property/property-master';
import { MultiPropertyModal } from './features/property';
import { Login } from './features/auth';

// Configuration Features
import { RateTypesView } from './features/configuration/rate-type';
import { DocumentTypesView, AddDocumentTypeView } from './features/configuration/document-type';
import { OtherChargesCategoriesView, AddOtherChargeCategoryView } from './features/configuration/other-charge-category';
import {
  OtherChargesView,
  AddOtherChargeView,
  OtherChargeDrawer,
  DeleteOtherChargeDialog,
} from './features/configuration/other-charge';
import {
  MeasurementUnitsView,
  AddMeasurementUnitView,
  MeasurementUnitDrawer,
  DeleteMeasurementUnitDialog,
} from './features/configuration/measurement-unit';
import {
  PaymentTypesView,
  AddPaymentTypeView,
  PaymentTypeDrawer,
  DeletePaymentTypeDialog,
} from './features/configuration/payment-type';
import {
  ExchangeRatesView,
  AddExchangeRateView,
  ExchangeRateDrawer,
  DeleteExchangeRateDialog,
} from './features/configuration/exchange-rate';
import {
  RolesPrivilegesView,
  RoleDrawer,
  DeleteRoleDialog,
} from './features/configuration/roles-privileges';
import {
  PoliciesView,
  AddPolicyView,
  PolicyDrawer,
  DeletePolicyDialog,
} from './features/configuration/policy';
import {
  GuestCategoriesView,
  AddGuestCategoryView,
  DeleteGuestCategoryDialog,
} from './features/configuration/guest-category';
import {
  EmailTemplatesView,
  AddEmailTemplateView,
  EmailTemplateDrawer,
  DeleteEmailTemplateDialog,
} from './features/configuration/email-template';
import {
  UserManagementView,
  AddUserView,
  InviteUserModal,
} from './features/configuration/user';

// Settings Features
import { GeneralSettingsView } from './features/settings/general';
import { GuestMandatoryDataView } from './features/settings/guest-mandatory-data';
import { DeviceConfigurationView } from './features/settings/device-configuration';
import { CrsTaxExemptView } from './features/settings/crs-tax-exempt';

// Miscellaneous Views
import {
  AmenitiesView,
  AuditLogsView,
  SystemHealthView,
  GenericSettingsView,
} from './features/miscellaneous';

const MainLayout: React.FC = () => {
  const { activePath, isAuthenticated } = useProperty();

  if (!isAuthenticated) {
    return <Login />;
  }

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
        return <GeneralSettingsView />;
      case 'guest-mandatory-data':
      case 'general-settings-guest-mandatory-data':
        return <GuestMandatoryDataView />;
      case 'device-configuration':
      case 'device-configuration-payment-gateway':
      case 'payment-gateway':
      case 'device-configuration-doorlock':
      case 'doorlock-configuration':
      case 'device-configuration-scanner':
      case 'scanner-configuration':
        return <DeviceConfigurationView />;
      case 'crs-tax-exempt':
      case 'add-crs-tax-exempt':
      case 'edit-crs-tax-exempt':
        return <CrsTaxExemptView />;
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
      <MultiPropertyModal />
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
