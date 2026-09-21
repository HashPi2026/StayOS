import React from 'react';
import { ReservationWizardState } from './types';

interface Step1StayRentProps {
  state: ReservationWizardState;
  onChange: (patch: Partial<ReservationWizardState>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export const Step1StayRent: React.FC<Step1StayRentProps> = ({
  state,
  onChange,
  onNext,
  onBack,
}) => {
  // Helper for recalculating nights
  const handleDatesChange = (checkIn: string, checkOut: string) => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    onChange({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: isNaN(nights) ? 4 : nights,
    });
  };

  const rentPerNight = state.roomRatePerNight || 240;
  const totalRent = state.nights * rentPerNight;
  const tax = Number((totalRent * 0.12).toFixed(2));
  const totalRental = totalRent + tax;
  const otherChargesTotal = state.otherCharges.reduce((acc, c) => acc + c.total, 0);
  const totalCharges = totalRental + otherChargesTotal;
  const deposit = rentPerNight; // first night guarantee
  const balance = totalCharges;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Form Area (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* SECTION 1: Stay Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[22px]">date_range</span>
                <h2 className="text-base font-bold text-slate-900">Section 1: Stay Details</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md">
                <span className="material-symbols-outlined text-[#4472C4] text-[16px]">nights_stay</span>
                <span className="font-mono text-xs font-bold text-[#4472C4]">
                  {state.nights} Nights (Auto-calculated)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Check-in Date
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#4472C4] text-[18px]">
                    calendar_today
                  </span>
                  <input
                    type="date"
                    value={state.checkInDate}
                    onChange={(e) => handleDatesChange(e.target.value, state.checkOutDate)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#4472C4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Check-in Time
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-500 text-[18px]">
                    schedule
                  </span>
                  <input
                    type="time"
                    value={state.checkInTime}
                    onChange={(e) => onChange({ checkInTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:border-[#4472C4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Check-out Date
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#4472C4] text-[18px]">
                    calendar_today
                  </span>
                  <input
                    type="date"
                    value={state.checkOutDate}
                    onChange={(e) => handleDatesChange(state.checkInDate, e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#4472C4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Check-out Time
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-500 text-[18px]">
                    schedule
                  </span>
                  <input
                    type="time"
                    value={state.checkOutTime}
                    onChange={(e) => onChange({ checkOutTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:border-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[#4472C4] text-[18px] shrink-0 mt-0.5">info</span>
              <span>Changing dates automatically recalculates nights & dynamic rate pricing in real-time.</span>
            </div>
          </div>

          {/* SECTION 2: Booking Source */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <span className="material-symbols-outlined text-[#4472C4] text-[22px]">travel_explore</span>
              <h2 className="text-base font-bold text-slate-900">Section 2: Booking Source</h2>
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Business Source Category
              </label>
              <div className="relative">
                <select
                  value={state.bookingSource}
                  onChange={(e) => onChange({ bookingSource: e.target.value })}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-[#4472C4]"
                >
                  <option value="Direct Web Booking (Brand Engine)">Direct Web Booking (Brand Engine)</option>
                  <option value="OTA — Expedia / Booking.com">OTA — Expedia / Booking.com</option>
                  <option value="Corporate Negotiated GDS">Corporate Negotiated GDS</option>
                  <option value="Walk-In / Front Desk Direct">Walk-In / Front Desk Direct</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Determines channel commission, distribution tracking, and dynamic rate yielding.
              </span>
            </div>
          </div>

          {/* SECTION 3: Room Selection (Cascading Hierarchy) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[22px]">domain</span>
                <h2 className="text-base font-bold text-slate-900">Section 3: Room Selection</h2>
              </div>
              <span className="text-xs font-semibold text-[#4472C4] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Cascading Hierarchy
              </span>
            </div>

            <div className="mb-4 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2 text-xs text-slate-700">
              <span className="material-symbols-outlined text-[#4472C4] text-[18px] shrink-0 mt-0.5">account_tree</span>
              <div>
                <span className="font-bold text-slate-800">Cascading Selector: Building → Floor → Room Type → Room.</span>
                <span> Selecting Room Type filters available rooms and respects Rate & Availability restrictions for selected dates.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Building */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4]"></span>
                  <span>1. Building</span>
                </label>
                <div className="relative">
                  <select
                    value={state.building}
                    onChange={(e) => onChange({ building: e.target.value })}
                    className="w-full appearance-none pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="Main Tower — Metropole East">Main Tower — Metropole East</option>
                    <option value="Ocean Wing — Metropole West">Ocean Wing — Metropole West</option>
                    <option value="Villas & Penthouse Suites">Villas & Penthouse Suites</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 2. Floor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4]"></span>
                  <span>2. Floor</span>
                </label>
                <div className="relative">
                  <select
                    value={state.floor}
                    onChange={(e) => onChange({ floor: e.target.value })}
                    className="w-full appearance-none pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="Floor 3 — Deluxe & Suites">Floor 3 — Deluxe & Suites</option>
                    <option value="Floor 1 — Garden Level">Floor 1 — Garden Level</option>
                    <option value="Floor 2 — Executive Rooms">Floor 2 — Executive Rooms</option>
                    <option value="Floor 4 — Presidential Suites">Floor 4 — Presidential Suites</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 3. Room Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4]"></span>
                  <span>3. Room Type</span>
                </label>
                <div className="relative">
                  <select
                    value={state.roomType}
                    onChange={(e) => onChange({ roomType: e.target.value })}
                    className="w-full appearance-none pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="Deluxe King Suite (Ocean View)">Deluxe King Suite (Ocean View)</option>
                    <option value="Premier King with Balcony">Premier King with Balcony</option>
                    <option value="Standard Double Queen">Standard Double Queen</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 4. Room */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4]"></span>
                  <span>4. Room</span>
                </label>
                <div className="relative">
                  <select
                    value={state.roomNumber}
                    onChange={(e) => onChange({ roomNumber: e.target.value })}
                    className="w-full appearance-none pl-3 pr-9 py-2 bg-blue-50/40 border border-blue-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="Room 304 (Clean & Inspected — Available)">
                      Room 304 (Clean & Inspected — Available)
                    </option>
                    <option value="Room 308 (Clean & Inspected — Available)">
                      Room 308 (Clean & Inspected — Available)
                    </option>
                    <option value="Room 312 (Inspected — Available)">
                      Room 312 (Inspected — Available)
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Occupancy Stepper Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
              {/* Adults */}
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">No. of Adults</span>
                  <span className="text-[11px] text-slate-500">Ages 18+</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ adults: Math.max(1, state.adults - 1) })}
                    className="w-7 h-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono text-sm font-bold text-slate-900">{state.adults}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ adults: state.adults + 1 })}
                    className="w-7 h-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">No. of Children</span>
                  <span className="text-[11px] text-slate-500">Ages 0–17</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ children: Math.max(0, state.children - 1) })}
                    className="w-7 h-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono text-sm font-bold text-slate-900">{state.children}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ children: state.children + 1 })}
                    className="w-7 h-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Reservation Parameters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <span className="material-symbols-outlined text-[#4472C4] text-[22px]">tune</span>
              <h2 className="text-base font-bold text-slate-900">Section 4: Reservation Parameters</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Reservation Status
                </label>
                <div className="relative">
                  <select
                    value={state.reservationStatus}
                    onChange={(e) => onChange({ reservationStatus: e.target.value })}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="Confirmed / Guaranteed">Confirmed / Guaranteed</option>
                    <option value="Tentative / Provisional">Tentative / Provisional</option>
                    <option value="Waitlisted">Waitlisted</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Rate Type</label>
                <div className="relative">
                  <select
                    value={state.rateType}
                    onChange={(e) => onChange({ rateType: e.target.value })}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="Best Available Rate (BAR - Flexible)">
                      Best Available Rate (BAR - Flexible)
                    </option>
                    <option value="Corporate Fixed Rate">Corporate Fixed Rate</option>
                    <option value="Promotional Non-Refundable">Promotional Non-Refundable</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY FINANCIAL SUMMARY CARD (#D9E1F2 container) */}
        <div className="lg:col-span-5 sticky top-32">
          <div className="bg-[#D9E1F2] border border-[#b8c9e8] text-slate-900 rounded-xl p-5 shadow-2xs flex flex-col gap-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#c2d2ee]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#4472C4] text-white flex items-center justify-center shadow-2xs">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Financial Summary & Ledger Projection
                </h3>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-white/80 border border-blue-200 rounded font-mono text-[10px] text-[#4472C4] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4472C4] animate-pulse"></span>
                LIVE UPDATE
              </span>
            </div>

            {/* Read-only Financial Breakdown */}
            <div className="bg-white/70 rounded-lg p-3.5 border border-white flex flex-col gap-2 shadow-inner text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Rent:</span>
                <span className="font-mono text-slate-900 font-semibold">${rentPerNight.toFixed(2)} / night</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Total Rent:</span>
                <span className="font-mono text-slate-900 font-semibold">${totalRent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Tax (12% State & Lodging Tax):</span>
                <span className="font-mono text-slate-900 font-semibold">${tax.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-300/70">
                <span className="text-slate-900">Total Rental:</span>
                <span className="font-mono text-slate-900">${totalRental.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Other Charges:</span>
                <span className="font-mono text-slate-700">${otherChargesTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Discount:</span>
                <span className="font-mono text-slate-700">$0.00</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-300/70">
                <span className="text-slate-900">Total Charges:</span>
                <span className="font-mono text-slate-900 font-bold">${totalCharges.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Payments:</span>
                <span className="font-mono text-slate-700">$0.00</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>CC Authorized:</span>
                <span className="font-mono text-slate-700">$0.00</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Deposit (First Night Guarantee):</span>
                <span className="font-mono text-slate-900 font-semibold">${deposit.toFixed(2)}</span>
              </div>

              <div className="flex items-baseline justify-between pt-2 mt-1 border-t-2 border-[#4472C4]/40 text-sm">
                <span className="font-bold text-slate-900 uppercase tracking-wide">Balance:</span>
                <span className="font-mono text-xl font-bold text-[#4472C4]">${balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Note */}
            <div className="p-2.5 bg-white/70 rounded-md border border-white text-[11px] text-slate-700 leading-normal flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[#4472C4] text-[16px] shrink-0 mt-0.5">verified</span>
              <span>
                All financial values are read-only and automatically recalculate live upon changing upstream reservation values.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS BAR */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Non-refundable switch */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={state.isNonRefundable}
                onChange={(e) => onChange({ isNonRefundable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4472C4]"></div>
            </div>
            <span className="text-xs font-semibold text-slate-800">Non-Refundable</span>
          </label>

          {/* Prepaid switch */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={state.isPrepaid}
                onChange={(e) => onChange({ isPrepaid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4472C4]"></div>
            </div>
            <span className="text-xs font-semibold text-slate-800">Prepaid</span>
          </label>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold cursor-pointer"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-[#4472C4] hover:bg-[#365cb5] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Next: Guest Details</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 font-mono text-[10px] font-normal tracking-tight text-white">
              Alt + N
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
