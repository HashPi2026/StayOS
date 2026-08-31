import React from 'react';
import { useProperty } from '../context/PropertyContext';
import { HOTLINKED_MAP_IMAGE } from '../data/mockData';

export const PropertyMasterView: React.FC = () => {
  const {
    propertyForm,
    updatePropertyField,
    hasPropertyUnsavedChanges,
    savePropertyMaster,
    discardPropertyMasterChanges,
    setVerifyPinOpen,
  } = useProperty();

  return (
    <div className="flex flex-col w-full h-full relative font-body-md text-[#191c1e] min-h-screen bg-[#f7f9fb]">
      {/* Header */}
      <div className="flex flex-col px-6 py-8 bg-[#f7f9fb] z-10 sticky top-0 shadow-sm border-b border-[#c6c6cd]/20">
        <div className="flex items-center text-body-sm text-[#75859d] mb-1">
          <span>Configuration</span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span>Property</span>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">Property Master</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-headline-md font-semibold tracking-tight text-[#191c1e] mb-1">
              Property Master
            </h1>
            <p className="text-body-md text-[#45464d] max-w-2xl">
              Configure the basic identity and location information for this property.
            </p>
          </div>

          {hasPropertyUnsavedChanges && (
            <div className="flex items-center gap-2 bg-[#ffdad6] text-[#ba1a1a] px-3 py-1 rounded-full text-label-uppercase">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
              Unsaved Changes
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-[100px]">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Identity Section */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#c6c6cd]/30 p-6">
            <h2 className="text-title-sm text-[#191c1e] mb-4 pb-2 border-b border-[#eceef0]">
              Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Name */}
              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                  Property Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all"
                  type="text"
                  value={propertyForm.identity.name}
                  onChange={(e) => updatePropertyField('identity', 'name', e.target.value)}
                  placeholder="e.g. Grand Plaza Hotel"
                />
              </div>

              {/* Client ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                  Client ID
                </label>
                <input
                  className="w-full bg-[#eceef0] border border-[#c6c6cd]/50 rounded-lg px-4 py-2.5 font-data-mono text-[#45464d] cursor-not-allowed shadow-none"
                  readOnly
                  type="text"
                  value={propertyForm.identity.clientId}
                />
              </div>

              {/* Region */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                  Region
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg pl-4 pr-10 py-2.5 text-body-md text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all cursor-pointer"
                    value={propertyForm.identity.region}
                    onChange={(e) => updatePropertyField('identity', 'region', e.target.value)}
                  >
                    <option value="na">North America</option>
                    <option value="eu">Europe</option>
                    <option value="apac">Asia Pacific</option>
                    <option value="latam">Latin America</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#c6c6cd]/30 p-6">
            <h2 className="text-title-sm text-[#191c1e] mb-4 pb-2 border-b border-[#eceef0]">
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Side */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                    Address <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <textarea
                    className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all resize-none"
                    rows={3}
                    value={propertyForm.location.address}
                    onChange={(e) => updatePropertyField('location', 'address', e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                      City <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all"
                      type="text"
                      value={propertyForm.location.city}
                      onChange={(e) => updatePropertyField('location', 'city', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                      State/Prefecture <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all"
                      type="text"
                      value={propertyForm.location.state}
                      onChange={(e) => updatePropertyField('location', 'state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                    Country <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg pl-4 pr-10 py-2 text-body-md text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all cursor-pointer"
                      value={propertyForm.location.country}
                      onChange={(e) => updatePropertyField('location', 'country', e.target.value)}
                    >
                      <option value="Japan">Japan</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Singapore">Singapore</option>
                      <option value="France">France</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                      Latitude
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2 font-data-mono text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all"
                      type="text"
                      value={propertyForm.location.latitude}
                      onChange={(e) => updatePropertyField('location', 'latitude', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                      Longitude
                    </label>
                    <input
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-4 py-2 font-data-mono text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all"
                      type="text"
                      value={propertyForm.location.longitude}
                      onChange={(e) => updatePropertyField('location', 'longitude', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Map Side */}
              <div className="flex flex-col h-full min-h-[300px]">
                <label className="text-label-uppercase text-[#45464d] mb-1.5 flex items-center justify-between">
                  <span>Location Preview</span>
                  <span className="text-[11px] text-[#75859d] lowercase font-normal">GPS 35.7100, 139.8107</span>
                </label>
                <div
                  onClick={() => setVerifyPinOpen(true)}
                  className="flex-1 w-full min-h-[260px] rounded-lg overflow-hidden border border-[#c6c6cd] shadow-sm relative group cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${propertyForm.location.mapImageUrl || HOTLINKED_MAP_IMAGE}')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-[#000000]/5 group-hover:bg-transparent transition-colors" />

                  {/* Pulsing Pin Indicator */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                    <span className="relative flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0058be] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-[#0058be] border-2 border-white shadow-md"></span>
                    </span>
                    <span className="mt-1 bg-[#000000]/80 text-white text-[10px] px-2 py-0.5 rounded shadow">
                      {propertyForm.identity.name}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#ffffff]/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-md border border-[#c6c6cd]/50 group-hover:bg-[#ffffff] transition-all">
                    <span className="material-symbols-outlined text-[16px] text-[#000000]">my_location</span>
                    <span className="text-label-uppercase text-[#191c1e] text-[10px]">Verify Pin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Web & Contact Section */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#c6c6cd]/30 p-6 mb-8">
            <h2 className="text-title-sm text-[#191c1e] mb-4 pb-2 border-b border-[#eceef0]">
              Web & Contact
            </h2>
            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-label-uppercase text-[#45464d] flex items-center gap-1">
                Property Website URL
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[18px]">
                  language
                </span>
                <input
                  className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg pl-10 pr-4 py-2 text-body-md text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] shadow-sm transition-all"
                  type="url"
                  value={propertyForm.contact.websiteUrl}
                  onChange={(e) => updatePropertyField('contact', 'websiteUrl', e.target.value)}
                  placeholder="https://www.yourhotel.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-[240px] right-0 bg-[#ffffff] border-t border-[#c6c6cd]/40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-6 py-3 flex items-center justify-end gap-3 z-40">
        <button
          onClick={discardPropertyMasterChanges}
          disabled={!hasPropertyUnsavedChanges}
          className={`px-5 py-2 rounded-lg text-[#191c1e] bg-[#f2f4f6] hover:bg-[#eceef0] transition-all text-body-md font-medium border border-[#c6c6cd]/60 active:scale-[0.98] ${
            !hasPropertyUnsavedChanges ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          Discard Changes
        </button>
        <button
          onClick={savePropertyMaster}
          className="px-5 py-2 rounded-lg text-white bg-[#000000] hover:bg-[#333333] transition-all text-body-md font-medium flex items-center gap-2 shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );
};
