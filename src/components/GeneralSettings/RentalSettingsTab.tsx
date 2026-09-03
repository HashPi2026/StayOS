import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { RentalSettings } from '../../types';

export const RentalSettingsTab: React.FC = () => {
  const {
    generalSettings,
    updateGeneralSettingsSection,
    resetGeneralSettingsSection,
    saveGeneralSettings,
    addToast,
  } = useProperty();

  const rental: RentalSettings = generalSettings.rental || {
    checkInTime: '15:00',
    checkOutTime: '11:00',
    minStayNights: 1,
    maxStayNights: 30,
    earlyCheckInGraceMinutes: 60,
    lateCheckOutGraceMinutes: 30,
    earlyCheckInChargeType: 'hourly',
    earlyCheckInAmount: 25,
    lateCheckOutChargeType: 'fixed',
    lateCheckOutAmount: 40,
    defaultBookingMode: 'daily',
    autoRoomAssignment: true,
    allowOverbooking: false,
    overbookingThresholdPercent: 5,
    dayUseAllowed: true,
    dayUseRatePercent: 65,
    autoCheckoutAtEndStay: false,
    restrictCheckoutOutstandingBalance: true,
    autoApplyDefaultDiscounts: false,
    postCheckoutRoomStatus: 'dirty',
    postMaintenanceRoomStatus: 'inspection',
    autoCancelNoShows: true,
    noShowCancellationTime: '02:00',
    noShowFeeApplication: 'first_night',
    overbookingNotificationTrigger: 'manager',
  };

  // Section collapse state (default matching screenshot: checkout & status open, noshow & overbooking closed/openable)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    checkout: true,
    roomStatus: true,
    noShow: true,
    overbooking: true,
    arrivalSchedule: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleChange = <K extends keyof RentalSettings>(field: K, value: RentalSettings[K]) => {
    updateGeneralSettingsSection('rental', { [field]: value });
  };

  const handleReset = () => {
    resetGeneralSettingsSection('rental');
  };

  const handleSave = () => {
    saveGeneralSettings();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col gap-1 mb-1">
        <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#191c1e] tracking-tight">
          Rental Configuration
        </h2>
        <p className="text-[14px] text-[#45464d]">
          Manage global settings for guest checkouts, room statuses, and overbooking rules.
        </p>
      </div>

      <div className="space-y-5">
        {/* 1. Checkout & Balance Section */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('checkout')}
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-[#f7f9fb]/50 transition-colors"
          >
            <div>
              <h3 className="text-[16px] font-semibold text-[#191c1e]">Checkout & Balance</h3>
              <p className="text-[13px] text-[#75859d] mt-0.5">Rules for ending stays and handling folios</p>
            </div>
            <span
              className={`material-symbols-outlined text-[#75859d] transition-transform duration-200 text-[24px] ${
                openSections.checkout ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.checkout && (
            <div className="px-5 pb-5">
              <div className="h-px bg-[#eceef0] mb-5 w-full" />
              <div className="space-y-4">
                {/* Automatic Checkout */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[14px] font-semibold text-[#191c1e] block">
                      Automatic Checkout at End of Stay
                    </span>
                    <span className="text-[13px] text-[#75859d]">
                      Automatically change reservation status to 'Checked Out' on departure date.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.autoCheckoutAtEndStay ?? false}
                      onChange={(e) => handleChange('autoCheckoutAtEndStay', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                {/* Restrict Checkout with Outstanding Balance */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[14px] font-semibold text-[#191c1e] block">
                      Restrict Checkout with Outstanding Balance
                    </span>
                    <span className="text-[13px] text-[#75859d]">
                      Prevent checkout action if guest folio has a non-zero balance.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.restrictCheckoutOutstandingBalance ?? true}
                      onChange={(e) => handleChange('restrictCheckoutOutstandingBalance', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                {/* Auto-apply Default Discounts */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[14px] font-semibold text-[#191c1e] block">
                      Auto-apply Default Discounts
                    </span>
                    <span className="text-[13px] text-[#75859d]">
                      Apply standard rate discounts during checkout calculation.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.autoApplyDefaultDiscounts ?? false}
                      onChange={(e) => handleChange('autoApplyDefaultDiscounts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                {/* Late Checkout Grace Period */}
                <div className="pt-2">
                  <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                    Late Checkout Grace Period (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={rental.lateCheckOutGraceMinutes ?? 30}
                    onChange={(e) =>
                      handleChange('lateCheckOutGraceMinutes', parseInt(e.target.value) || 0)
                    }
                    className="w-32 bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-all font-data-mono"
                  />
                  <p className="text-[13px] text-[#75859d] mt-1.5">
                    Time allowed after standard checkout before late fees apply.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Room Status Transitions Section */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('roomStatus')}
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-[#f7f9fb]/50 transition-colors"
          >
            <div>
              <h3 className="text-[16px] font-semibold text-[#191c1e]">Room Status Transitions</h3>
              <p className="text-[13px] text-[#75859d] mt-0.5">
                Default status updates based on operational events
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-[#75859d] transition-transform duration-200 text-[24px] ${
                openSections.roomStatus ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.roomStatus && (
            <div className="px-5 pb-5">
              <div className="h-px bg-[#eceef0] mb-5 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                    Post-Checkout Room Status
                  </label>
                  <div className="relative">
                    <select
                      value={rental.postCheckoutRoomStatus ?? 'dirty'}
                      onChange={(e) => handleChange('postCheckoutRoomStatus', e.target.value as any)}
                      className="w-full appearance-none bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-shadow cursor-pointer font-medium"
                    >
                      <option value="dirty">Dirty</option>
                      <option value="inspection">Requires Inspection</option>
                      <option value="ooo">Out of Order</option>
                      <option value="clean">Clean</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      arrow_drop_down
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                    Post-Maintenance Room Status
                  </label>
                  <div className="relative">
                    <select
                      value={rental.postMaintenanceRoomStatus ?? 'inspection'}
                      onChange={(e) =>
                        handleChange('postMaintenanceRoomStatus', e.target.value as any)
                      }
                      className="w-full appearance-none bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-shadow cursor-pointer font-medium"
                    >
                      <option value="clean">Clean</option>
                      <option value="dirty">Dirty</option>
                      <option value="inspection">Requires Inspection</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      arrow_drop_down
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. No-show Policies Section */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('noShow')}
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-[#f7f9fb]/50 transition-colors"
          >
            <div>
              <h3 className="text-[16px] font-semibold text-[#191c1e]">No-show Policies</h3>
              <p className="text-[13px] text-[#75859d] mt-0.5">
                Handling of reservations that fail to check in
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-[#75859d] transition-transform duration-200 text-[24px] ${
                openSections.noShow ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.noShow && (
            <div className="px-5 pb-5">
              <div className="h-px bg-[#eceef0] mb-5 w-full" />
              <div className="space-y-4">
                {/* Auto-cancel No-show Reservations */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[14px] font-semibold text-[#191c1e] block">
                      Auto-cancel No-show Reservations
                    </span>
                    <span className="text-[13px] text-[#75859d]">
                      Automatically cancel non-arrived reservations after threshold.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.autoCancelNoShows ?? true}
                      onChange={(e) => handleChange('autoCancelNoShows', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                      No-show Cancellation Time
                    </label>
                    <input
                      type="time"
                      value={rental.noShowCancellationTime ?? '02:00'}
                      onChange={(e) => handleChange('noShowCancellationTime', e.target.value)}
                      className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-shadow font-medium"
                    />
                    <p className="text-[13px] text-[#75859d] mt-1.5">
                      Time next day to process no-shows.
                    </p>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                      No-show Fee Application
                    </label>
                    <div className="relative">
                      <select
                        value={rental.noShowFeeApplication ?? 'first_night'}
                        onChange={(e) =>
                          handleChange('noShowFeeApplication', e.target.value as any)
                        }
                        className="w-full appearance-none bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-shadow cursor-pointer font-medium"
                      >
                        <option value="none">Do Not Apply Fee</option>
                        <option value="first_night">Charge First Night</option>
                        <option value="full_stay">Charge Full Stay</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                        arrow_drop_down
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Overbooking Limits Section */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('overbooking')}
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-[#f7f9fb]/50 transition-colors"
          >
            <div>
              <h3 className="text-[16px] font-semibold text-[#191c1e]">Overbooking Limits</h3>
              <p className="text-[13px] text-[#75859d] mt-0.5">
                Capacity management and over-sell thresholds
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-[#75859d] transition-transform duration-200 text-[24px] ${
                openSections.overbooking ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.overbooking && (
            <div className="px-5 pb-5">
              <div className="h-px bg-[#eceef0] mb-5 w-full" />
              <div className="space-y-4">
                {/* Allow Overbooking */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[14px] font-semibold text-[#191c1e] block">
                      Allow Overbooking
                    </span>
                    <span className="text-[13px] text-[#75859d]">
                      Permit inventory to exceed physical capacity.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.allowOverbooking ?? false}
                      onChange={(e) => handleChange('allowOverbooking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 transition-opacity duration-200 ${
                    rental.allowOverbooking ? 'opacity-100' : 'opacity-40 pointer-events-none'
                  }`}
                >
                  <div>
                    <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                      Overbooking Limit %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={rental.overbookingThresholdPercent ?? 5}
                        onChange={(e) =>
                          handleChange(
                            'overbookingThresholdPercent',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 pr-8 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-shadow font-data-mono font-medium"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75859d] text-[14px] font-semibold pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#191c1e] mb-1.5 block">
                      Notification Trigger
                    </label>
                    <div className="relative">
                      <select
                        value={rental.overbookingNotificationTrigger ?? 'manager'}
                        onChange={(e) =>
                          handleChange(
                            'overbookingNotificationTrigger',
                            e.target.value as any
                          )
                        }
                        className="w-full appearance-none bg-[#ffffff] border border-[#c6c6cd] rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] transition-shadow cursor-pointer font-medium"
                      >
                        <option value="none">No Alert</option>
                        <option value="manager">Alert Manager Only</option>
                        <option value="all">Alert All Desk Staff</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                        arrow_drop_down
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Additional Check-In Schedule & Durations (Optional accordion) */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('arrivalSchedule')}
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-[#f7f9fb]/50 transition-colors"
          >
            <div>
              <h3 className="text-[16px] font-semibold text-[#191c1e]">
                Arrival Schedules & Stay Length Defaults
              </h3>
              <p className="text-[13px] text-[#75859d] mt-0.5">
                Check-in/out times, min/max length of stay, and early/late billing models
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-[#75859d] transition-transform duration-200 text-[24px] ${
                openSections.arrivalSchedule ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.arrivalSchedule && (
            <div className="px-5 pb-5">
              <div className="h-px bg-[#eceef0] mb-5 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] block mb-1.5">
                    Standard Check-In Time
                  </label>
                  <input
                    type="time"
                    value={rental.checkInTime}
                    onChange={(e) => handleChange('checkInTime', e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] focus:border-[#0058be] focus:bg-[#ffffff] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] block mb-1.5">
                    Standard Check-Out Time
                  </label>
                  <input
                    type="time"
                    value={rental.checkOutTime}
                    onChange={(e) => handleChange('checkOutTime', e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] focus:border-[#0058be] focus:bg-[#ffffff] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] block mb-1.5">
                    Min Stay (Nights)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={rental.minStayNights}
                    onChange={(e) =>
                      handleChange('minStayNights', parseInt(e.target.value) || 1)
                    }
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] focus:border-[#0058be] focus:bg-[#ffffff] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none transition-all font-data-mono"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] block mb-1.5">
                    Max Stay (Nights)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={rental.maxStayNights}
                    onChange={(e) =>
                      handleChange('maxStayNights', parseInt(e.target.value) || 30)
                    }
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] focus:border-[#0058be] focus:bg-[#ffffff] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none transition-all font-data-mono"
                  />
                </div>
              </div>

              {/* Early checkin & day use controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#eceef0]">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f7f9fb] border border-[#eceef0]">
                  <div>
                    <span className="text-[13px] font-semibold text-[#191c1e] block">
                      Auto Room Assignment
                    </span>
                    <span className="text-[11px] text-[#75859d]">
                      Assign room immediately on reservation creation.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.autoRoomAssignment}
                      onChange={(e) => handleChange('autoRoomAssignment', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f7f9fb] border border-[#eceef0]">
                  <div>
                    <span className="text-[13px] font-semibold text-[#191c1e] block">
                      Day Use / Transit Stay
                    </span>
                    <span className="text-[11px] text-[#75859d]">
                      Allow same-day check-in & check-out slots.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rental.dayUseAllowed}
                      onChange={(e) => handleChange('dayUseAllowed', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c6cd] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
