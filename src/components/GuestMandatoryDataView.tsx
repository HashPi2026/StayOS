import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { FieldRequirementConfig } from '../types';

interface SectionDefinition {
  title: string;
  icon: string;
  fields: {
    id: string;
    label: string;
    description: string;
    defaultRequired?: boolean;
    locked?: boolean;
  }[];
}

const SECTIONS: SectionDefinition[] = [
  {
    title: 'Name Details',
    icon: 'person',
    fields: [
      { id: 'first_name', label: 'First Name', description: 'Primary given name.', defaultRequired: true, locked: true },
      { id: 'last_name', label: 'Last Name', description: 'Family name or surname.', defaultRequired: true, locked: true },
      { id: 'middle_name', label: 'Middle Name', description: 'Secondary given name(s).' },
      { id: 'guest_title', label: 'Guest Title', description: 'Prefix (Mr., Mrs., Dr., etc.).' },
    ],
  },
  {
    title: 'Company Details',
    icon: 'corporate_fare',
    fields: [
      { id: 'company_name', label: 'Company Name', description: 'Associated business entity.' },
      { id: 'job_title', label: 'Job Title', description: "Guest's role within the company." },
      { id: 'department', label: 'Department', description: 'Specific division within the company.' },
    ],
  },
  {
    title: 'Phone Details',
    icon: 'call',
    fields: [
      { id: 'mobile_phone', label: 'Mobile Phone', description: 'Primary mobile contact number.', defaultRequired: true },
      { id: 'work_phone', label: 'Work Phone', description: 'Business contact number.' },
      { id: 'home_phone', label: 'Home Phone', description: 'Residential contact number.' },
    ],
  },
  {
    title: 'Address Details',
    icon: 'location_on',
    fields: [
      { id: 'home_address', label: 'Home Address', description: 'Primary residential street address.' },
      { id: 'business_address', label: 'Business Address', description: 'Company or office address.' },
      { id: 'city', label: 'City', description: 'City or municipality.' },
      { id: 'country', label: 'Country', description: 'Nation of residence.', defaultRequired: true },
      { id: 'postal_code', label: 'ZIP/Postal Code', description: 'Postal routing code.' },
    ],
  },
  {
    title: 'Email Details',
    icon: 'mail',
    fields: [
      { id: 'primary_email', label: 'Primary Email', description: 'Main email address for confirmations.', defaultRequired: true },
      { id: 'secondary_email', label: 'Secondary Email', description: 'Alternate contact email address.' },
    ],
  },
  {
    title: 'Document Details',
    icon: 'badge',
    fields: [
      { id: 'passport_id', label: 'Passport/ID Number', description: 'Official government identification number.', defaultRequired: true },
      { id: 'issue_date', label: 'Issue Date', description: 'Date the identification document was issued.' },
      { id: 'expiry_date', label: 'Expiry Date', description: 'Date the identification document expires.' },
      { id: 'nationality', label: 'Nationality', description: 'Country of citizenship as per ID.' },
    ],
  },
  {
    title: 'Vehicle Details',
    icon: 'directions_car',
    fields: [
      { id: 'license_plate', label: 'License Plate', description: 'Vehicle registration plate number.' },
      { id: 'vehicle_make_model', label: 'Vehicle Make/Model', description: 'Brand and model of the vehicle.' },
    ],
  },
  {
    title: 'Business Source',
    icon: 'bar_chart',
    fields: [
      { id: 'market_segment', label: 'Market Segment', description: 'Categorization of the business source.' },
      { id: 'source_code', label: 'Source Code', description: 'Specific tracking code for the reservation.' },
    ],
  },
  {
    title: 'Signature',
    icon: 'draw',
    fields: [
      { id: 'digital_signature', label: 'Digital Signature Required', description: 'Mandate guest signature on registration card.', defaultRequired: true },
    ],
  },
];

export const GuestMandatoryDataView: React.FC = () => {
  const { generalSettings, updateGuestMandatoryField, addToast, saveGeneralSettings } = useProperty();
  const configuredFields = generalSettings.guestMandatoryData?.fields || [];
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getFieldState = (fieldDef: { id: string; defaultRequired?: boolean; locked?: boolean }) => {
    const existing = configuredFields.find((f: FieldRequirementConfig) => f.id === fieldDef.id);
    if (existing) {
      return {
        required: existing.required,
        locked: existing.locked || fieldDef.locked,
      };
    }
    return {
      required: fieldDef.defaultRequired ?? false,
      locked: fieldDef.locked ?? false,
    };
  };

  const handleToggle = (fieldId: string, currentRequired: boolean, locked?: boolean) => {
    if (locked) {
      addToast('This field is mandatory for PMS core operations and cannot be modified.', 'info');
      return;
    }
    updateGuestMandatoryField(fieldId, {
      required: !currentRequired,
      enabled: true,
    });
    setHasUnsavedChanges(true);
  };

  const handleCancel = () => {
    // Re-read or notify
    addToast('Changes discarded', 'info');
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    saveGeneralSettings();
    addToast('Guest mandatory data configuration saved successfully', 'success');
    setHasUnsavedChanges(false);
  };

  return (
    <div className="flex flex-col w-full pb-32">
      <div className="px-6 py-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Top Info Banner */}
        <div className="bg-[#131b2e] text-[#ffffff] p-5 rounded-xl shadow-md flex items-start gap-4">
          <span className="material-symbols-outlined text-[#dae2fd] text-[22px] mt-0.5 shrink-0">
            info
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-[17px] font-semibold text-[#ffffff] tracking-tight">
              Mandatory Field Configuration
            </h3>
            <p className="text-[14px] text-[#eff1f3]/80 leading-relaxed">
              Selected fields will be strictly required during the Reservation creation and Check-in processes. Please ensure compliance with local data collection regulations.
            </p>
          </div>
        </div>

        {/* Section Cards */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-[#ffffff] rounded-xl shadow-xs p-6 flex flex-col gap-4 border border-[#e0e3e5]"
            >
              <h4 className="text-[17px] font-semibold text-[#191c1e] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#45464d] text-[20px]">
                  {section.icon}
                </span>
                <span>{section.title}</span>
              </h4>

              <div className="flex flex-col gap-1">
                {section.fields.map((field) => {
                  const state = getFieldState(field);
                  const isLocked = state.locked;
                  const isChecked = state.required;

                  return (
                    <label
                      key={field.id}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors select-none ${
                        isLocked
                          ? 'cursor-not-allowed hover:bg-transparent'
                          : 'cursor-pointer hover:bg-[#eceef0]/60'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 pr-4">
                        <span className="text-[14px] font-semibold text-[#191c1e]">
                          {field.label}
                        </span>
                        <span className="text-[13px] text-[#45464d]">
                          {field.description}
                        </span>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLocked}
                        onChange={() => handleToggle(field.id, isChecked, isLocked)}
                        className={`w-5 h-5 rounded accent-[#000000] shrink-0 transition-transform active:scale-95 ${
                          isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-[#ffffff]/90 backdrop-blur-md border-t border-[#eceef0] px-8 py-3.5 flex justify-end gap-3 z-40 shadow-sm">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 rounded-lg text-[14px] font-semibold text-[#000000] hover:bg-[#eceef0] transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-[14px] font-semibold bg-[#000000] text-[#ffffff] shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );
};
