import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { HOTLINKED_MAP_IMAGE } from '../data/mockData';

export const VerifyPinModal: React.FC = () => {
  const {
    isVerifyPinOpen,
    setVerifyPinOpen,
    propertyForm,
    updatePropertyField,
    addToast,
  } = useProperty();

  const [lat, setLat] = useState(propertyForm.location.latitude || '35.7100');
  const [lng, setLng] = useState(propertyForm.location.longitude || '139.8107');

  if (!isVerifyPinOpen) return null;

  const handleSavePin = () => {
    updatePropertyField('location', 'latitude', lat);
    updatePropertyField('location', 'longitude', lng);
    addToast('GPS Coordinates updated and verified', 'success');
    setVerifyPinOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-[#000000]/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={() => setVerifyPinOpen(false)}
    >
      <div
        className="bg-[#ffffff] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#c6c6cd]/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-[24px]">my_location</span>
            <div>
              <h3 className="font-semibold text-title-sm text-[#191c1e]">Verify Property Pin Location</h3>
              <p className="text-[12px] text-[#75859d]">
                {propertyForm.location.address}, {propertyForm.location.city}, {propertyForm.location.country}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVerifyPinOpen(false)}
            className="text-[#75859d] hover:text-[#191c1e] p-1.5 rounded-full hover:bg-[#eceef0]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Map Container */}
        <div className="relative h-[340px] w-full bg-[#e0e3e5] overflow-hidden">
          <img
            src={propertyForm.location.mapImageUrl || HOTLINKED_MAP_IMAGE}
            alt="Property GPS Map Location"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Interactive Pin Marker in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="relative flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0058be] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-[#0058be] border-2 border-white shadow-lg items-center justify-center text-white text-[10px] font-bold">
                ✓
              </span>
            </span>
            <div className="mt-1.5 bg-[#000000]/90 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg border border-white/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-sky-400">hotel</span>
              {propertyForm.identity.name}
            </div>
          </div>

          <div className="absolute top-3 right-3 bg-[#ffffff]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-[12px] font-data-mono text-[#191c1e] border border-[#c6c6cd]/50">
            Lat: {lat} | Lng: {lng}
          </div>
        </div>

        {/* Coordinate Adjustments */}
        <div className="p-6 bg-[#ffffff] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label-uppercase text-[#45464d] block mb-1">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg font-data-mono text-body-sm text-[#191c1e]"
              />
            </div>
            <div>
              <label className="text-label-uppercase text-[#45464d] block mb-1">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg font-data-mono text-body-sm text-[#191c1e]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eceef0]">
            <span className="text-[12px] text-[#75859d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
              Geocoded via Google Maps Platform API
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setVerifyPinOpen(false)}
                className="px-4 py-2 text-[#191c1e] text-label-uppercase border border-[#c6c6cd] rounded-lg hover:bg-[#eceef0]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="px-4 py-2 bg-[#000000] text-white text-label-uppercase rounded-lg hover:bg-[#333333] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Confirm Coordinates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
