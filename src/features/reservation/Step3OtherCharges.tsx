import React, { useState } from 'react';
import { ReservationWizardState, OtherChargeItem } from './types';

interface Step3OtherChargesProps {
  state: ReservationWizardState;
  onChange: (patch: Partial<ReservationWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CHARGE_PRESETS = [
  { category: 'parking', name: 'Valet Overnight Parking (PRK-VAL-01)', code: 'PRK-VAL-01', rate: 40.0 },
  { category: 'parking', name: 'Self-Parking Garage (PRK-SLF-02)', code: 'PRK-SLF-02', rate: 25.0 },
  { category: 'fnb', name: 'Continental Breakfast Buffet (FNB-BRK-01)', code: 'FNB-BRK-01', rate: 24.0 },
  { category: 'transportation', name: 'Airport Express Shuttle (TRN-SHT-03)', code: 'TRN-SHT-03', rate: 45.0 },
  { category: 'vip', name: 'In-Room Champagne & Truffles (VIP-CHM-09)', code: 'VIP-CHM-09', rate: 85.0 },
  { category: 'spa', name: 'Deep Tissue Therapy 60m (SRV-SPA-202)', code: 'SRV-SPA-202', rate: 160.0 },
];

export const Step3OtherCharges: React.FC<Step3OtherChargesProps> = ({
  state,
  onChange,
  onNext,
  onBack,
}) => {
  // New charge form inputs
  const [category, setCategory] = useState('parking');
  const [selectedPreset, setSelectedPreset] = useState(CHARGE_PRESETS[0].name);
  const [chargeDate, setChargeDate] = useState(state.checkInDate || '2026-06-29');
  const [rate, setRate] = useState<number>(40.0);
  const [quantity, setQuantity] = useState<number>(1);
  const [voucher, setVoucher] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [remarks, setRemarks] = useState('');

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = CHARGE_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setRate(found.rate);
      setCategory(found.category);
    }
  };

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = rate * quantity;
    const taxAmount = Number((subtotal * 0.085).toFixed(2));
    const total = subtotal + taxAmount;

    const newCharge: OtherChargeItem = {
      id: `chg-${Date.now()}`,
      category: category.toUpperCase(),
      chargeName: selectedPreset.split('(')[0].trim(),
      chargeCode: selectedPreset.split('(')[1]?.replace(')', '') || 'SRV-MISC',
      date: isRecurring ? `Daily (${state.nights} Nights)` : chargeDate,
      rate,
      quantity,
      taxPercent: 8.5,
      taxAmount,
      total,
      voucherNumber: voucher || undefined,
      isRecurring,
    };

    onChange({
      otherCharges: [...state.otherCharges, newCharge],
    });

    setVoucher('');
    setRemarks('');
  };

  const handleDeleteCharge = (id: string) => {
    onChange({
      otherCharges: state.otherCharges.filter((c) => c.id !== id),
    });
  };

  // Financial math
  const rentPerNight = state.roomRatePerNight || 240;
  const totalRent = state.nights * rentPerNight;
  const roomTax = Number((totalRent * 0.12).toFixed(2));
  const totalRental = totalRent + roomTax;

  const baseAncillarySubtotal = state.otherCharges.reduce((acc, c) => acc + c.rate * c.quantity, 0);
  const ancillaryTaxes = state.otherCharges.reduce((acc, c) => acc + c.taxAmount, 0);
  const totalOtherCharges = state.otherCharges.reduce((acc, c) => acc + c.total, 0);
  const totalGrossCharges = totalRental + totalOtherCharges;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 cols */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* A. TABLE OF ADDED CHARGES */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Added Other Charges</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#4472C4] font-bold text-xs">
                    {state.otherCharges.length} Items Added
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Ancillary line items and services attached to Folio{' '}
                  <span className="font-mono text-[#4472C4] font-medium">#MET-2026-8841</span>
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-xs text-slate-700 font-medium">Total Other Charges:</span>
                <span className="font-mono text-sm font-bold text-[#4472C4]">
                  ${totalOtherCharges.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Charge Name & Code</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Tax (8.5%)</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {state.otherCharges.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-slate-400">
                        No other charges added yet. Use the form below to attach amenities or services.
                      </td>
                    </tr>
                  ) : (
                    state.otherCharges.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] uppercase">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">{item.chargeName}</span>
                              {item.isRecurring && (
                                <span className="px-1 py-0.2 rounded bg-blue-100 text-[#4472C4] text-[9px] font-bold">
                                  Recurring
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">{item.chargeCode}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{item.date}</td>
                        <td className="py-2.5 px-3 font-mono text-right">${item.rate.toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-slate-500">
                          ${item.taxAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right font-bold text-[#4472C4]">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{item.voucherNumber || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCharge(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                            title="Remove Charge"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">info</span>
                <span>Ancillary items immediately update folio gross total and ledger projection.</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">StayOS Ledger Engine</span>
            </div>
          </div>

          {/* B. "ADD CHARGE" FORM CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4472C4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900">Add Charge</h3>
                  <span className="text-xs text-slate-500">Attach on-demand or recurring ancillary hospitality charges</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                Ledger Sync Ready
              </span>
            </div>

            <form onSubmit={handleAddCharge} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Category */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">
                    Charge Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="parking">Parking & Valet</option>
                    <option value="fnb">Food & Beverage (F&B)</option>
                    <option value="transportation">Transportation</option>
                    <option value="spa">Spa & Wellness</option>
                    <option value="recreation">Recreation & Activities</option>
                    <option value="laundry">Laundry & Dry Cleaning</option>
                  </select>
                </div>

                {/* 2. Other Charges (Preset) */}
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-700">
                    Other Charges <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  >
                    {CHARGE_PRESETS.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name} — ${p.rate.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Charge Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">
                    Charge Date <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={chargeDate}
                      onChange={(e) => setChargeDate(e.target.value)}
                      className="w-full h-9 pl-8 pr-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:border-[#4472C4]"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                      calendar_today
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Defaulted to stay check-in date</span>
                </div>

                {/* 4. Rate */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">
                    Rate ($) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                      className="w-full h-9 pl-6 pr-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#4472C4]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Standard catalog rate (editable)</span>
                </div>

                {/* 5. Quantity Stepper */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">
                    Quantity <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex items-center h-9 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={quantity}
                      className="w-full text-center bg-transparent font-mono text-xs font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500">Units billed to folio</span>
                </div>

                {/* 6. Voucher Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">Voucher Number</label>
                  <input
                    type="text"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    placeholder="e.g. VCH-10492"
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  />
                  <span className="text-[10px] text-slate-500">Optional voucher code</span>
                </div>

                {/* 7. Reoccur Toggle Switch */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-700">Posting Cadence</label>
                  <div className="flex items-center justify-between h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#4472C4] text-[18px]">event_repeat</span>
                      <span className="text-xs text-slate-800 font-semibold">Reoccur Daily Throughout Stay</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#4472C4]"></div>
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Posts automatically during each active overnight room audit
                  </span>
                </div>
              </div>

              {/* Highlight Banner for Reoccurring Charges */}
              {isRecurring && (
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#4472C4] text-[20px] mt-0.5">update</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      Scheduled for Daily Night Posting ({state.nights} Nights Total)
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      Note: Charges do not post immediately in bulk; each daily charge posts automatically during Night
                      Audit at <strong>04:00 AM</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-slate-700">
                  Charge Remarks & Billing Instructions
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Internal notes or guest billing instructions for Front Desk & Night Audit..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#4472C4] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRate(40);
                    setQuantity(1);
                    setVoucher('');
                    setRemarks('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4472C4] hover:bg-[#365cb5] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>+ Add to Folio</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/20 font-mono text-[9px] ml-1">↵ Enter</span>
                </button>
              </div>
            </form>
          </div>

          {/* C. RUNNING SUMMARY BAR */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-3 gap-4 flex-1 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-slate-500">Base Ancillary Subtotal</span>
                <span className="font-mono font-semibold text-slate-900 text-sm">
                  ${baseAncillarySubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-slate-500">Applicable Taxes (8.5%)</span>
                <span className="font-mono font-semibold text-slate-500 text-sm">
                  ${ancillaryTaxes.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[#4472C4]">Total Other Charges</span>
                <span className="font-mono font-bold text-[#4472C4] text-base">
                  ${totalOtherCharges.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="md:max-w-xs flex items-center gap-2 text-slate-600 text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
              <span className="material-symbols-outlined text-[#4472C4] text-[18px]">sync_alt</span>
              <span>This total (${totalOtherCharges.toFixed(2)}) immediately feeds into the Folio Financial Summary.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="xl:col-span-4 flex flex-col gap-5 sticky top-32">
          {/* Assigned Inventory Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">meeting_room</span>
                <span className="text-sm font-bold text-slate-900">Assigned Inventory & Stay</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                CONFIRMED
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-mono font-bold text-[#4472C4]">
                  {state.roomNumber.split(' ')[0]} {state.roomNumber.split(' ')[1]}
                </span>
                <span className="font-medium text-slate-800">{state.roomType}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-medium">
                Ocean View
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Check-in</span>
                <span className="font-mono font-semibold text-slate-900">{state.checkInDate}</span>
                <span className="text-slate-500 text-[10px]">14:00 Arrival</span>
              </div>
              <div className="flex flex-col bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Check-out</span>
                <span className="font-mono font-semibold text-slate-900">{state.checkOutDate}</span>
                <span className="text-slate-500 text-[10px]">11:00 Departure</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium text-slate-900">
                  {state.nights} Nights • {state.adults} Adults
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rate Plan:</span>
                <span className="font-medium text-slate-900">{state.rateType}</span>
              </div>
              <div className="flex justify-between">
                <span>Primary Guest:</span>
                <span className="font-bold text-slate-900">{state.primaryGuest.firstName} {state.primaryGuest.lastName}</span>
              </div>
            </div>
          </div>

          {/* Sticky Live Financial Summary & Ledger Projection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">account_balance_wallet</span>
                <span className="text-sm font-bold text-slate-900">Live Ledger Projection</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#4472C4] font-mono text-[10px] font-bold">
                LIVE SYNC
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Rent (${rentPerNight.toFixed(2)} × {state.nights})</span>
                <span className="font-mono text-slate-900">${totalRent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Room Tax (12.0%)</span>
                <span className="font-mono text-slate-900">${roomTax.toFixed(2)}</span>
              </div>

              <div className="w-full h-px bg-slate-200 my-0.5"></div>

              <div className="flex items-center justify-between text-slate-900 font-semibold">
                <span>Total Rental Charges</span>
                <span className="font-mono">${totalRental.toFixed(2)}</span>
              </div>

              {/* Highlighted Other Charges */}
              <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 p-2 rounded-lg mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#4472C4]">Other Charges</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#4472C4] text-white text-[9px] font-bold">Step 3</span>
                </div>
                <span className="font-mono font-bold text-[#4472C4]">${totalOtherCharges.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 px-1">
                <span>Ancillary Taxes (8.5%)</span>
                <span className="font-mono text-slate-900">${ancillaryTaxes.toFixed(2)}</span>
              </div>

              <div className="w-full h-px bg-slate-200 my-0.5"></div>

              <div className="flex items-center justify-between text-slate-900 font-bold text-sm">
                <span>Total Gross Charges</span>
                <span className="font-mono">${totalGrossCharges.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Deposit (First Night Guarantee)</span>
                <span className="font-mono text-slate-900">${rentPerNight.toFixed(2)}</span>
              </div>
            </div>

            {/* Hero Balance */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Folio Net Balance</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                  Pending Settlement
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#4472C4] font-mono tracking-tight">
                  ${totalGrossCharges.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-slate-500">USD</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-500">
              All financial values recalculate live across wizard steps.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM WIZARD NAVIGATION BAR */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back: Guest Details</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium"
          >
            Save as Draft Folio
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2 rounded-lg bg-[#4472C4] hover:bg-[#365cb5] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: Payment & Settlement</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px] uppercase">Alt + N</span>
          </button>
        </div>
      </div>
    </div>
  );
};
