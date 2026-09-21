import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import {
  ReservationWizardState,
  VehicleItem,
  SharedGuestItem,
  OtherChargeItem,
  PaymentTransaction,
  GroupRecord,
} from './types';
import { MiscellaneousDrawer } from './MiscellaneousDrawer';
import { Step1StayRent } from './Step1StayRent';
import { Step2GuestDetails } from './Step2GuestDetails';
import { Step3OtherCharges } from './Step3OtherCharges';
import { Step4Payment } from './Step4Payment';
import { GroupFolioIntake } from './GroupFolioIntake';

const INITIAL_VEHICLES: VehicleItem[] = [
  {
    id: 'veh-1',
    makeModel: '2024 Tesla Model S',
    plate: '7XYZ891',
    state: 'CA',
    color: 'Midnight Silver',
    isPrimary: true,
    parkingType: 'Valet',
    stallOrBay: 'Bay B2-14',
    keyPeg: '#V-89',
  },
  {
    id: 'veh-2',
    makeModel: '2023 Porsche Macan GTS',
    plate: '9ABC452',
    state: 'NY',
    color: 'Chalk White',
    isPrimary: false,
    parkingType: 'Self-Park',
    stallOrBay: 'North Garage (Pass #NP-401)',
  },
];

const INITIAL_SHARED_GUESTS: SharedGuestItem[] = [
  {
    id: 'gst-1',
    name: 'Jonathan Hayes',
    relationship: 'Primary Guest',
    isPrimary: true,
    phone: '+1 (212) 555-0192',
    email: 'j.hayes@apexgroup.com',
    idDocument: 'Passport #A9482910 (Exp: 18-Oct-2029)',
    keycardStatus: 'Keycard #01 Issued',
    vipTier: 'VIP 1',
  },
  {
    id: 'gst-2',
    name: 'Sarah Hayes',
    relationship: 'Spouse / Additional Occupant',
    isPrimary: false,
    phone: '+1 (212) 555-0199',
    email: 's.hayes@apexgroup.com',
    idDocument: "Driver's Lic #NY-881920 (Exp: 12-May-2028)",
    keycardStatus: 'Keycard #02 Authorized',
  },
];

const INITIAL_OTHER_CHARGES: OtherChargeItem[] = [
  {
    id: 'chg-1',
    category: 'TRANSPORTATION',
    chargeName: 'Airport Executive Chauffeur (Sedan)',
    chargeCode: 'SRV-TRN-041',
    date: '29-Jun-2026',
    rate: 75.0,
    quantity: 1,
    taxPercent: 8.5,
    taxAmount: 6.38,
    total: 81.38,
    voucherNumber: 'VCH-88219',
    isRecurring: false,
  },
  {
    id: 'chg-2',
    category: 'F&B / DINING',
    chargeName: 'Daily Buffet Breakfast Package',
    chargeCode: 'SRV-FNB-109',
    date: 'Daily (4 Nights)',
    rate: 32.0,
    quantity: 2,
    taxPercent: 8.5,
    taxAmount: 5.44,
    total: 69.44,
    voucherNumber: 'VCH-09142',
    isRecurring: true,
  },
  {
    id: 'chg-3',
    category: 'WELLNESS / SPA',
    chargeName: 'Deep Tissue Therapy (60m)',
    chargeCode: 'SRV-SPA-202',
    date: '30-Jun-2026',
    rate: 160.0,
    quantity: 1,
    taxPercent: 8.5,
    taxAmount: 13.6,
    total: 173.6,
    isRecurring: false,
  },
];

const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'tx-1',
    method: 'Visa •••• 1024',
    methodDetail: 'Chip / Terminal #01',
    payerName: 'Jonathan Hayes',
    payerRole: 'Room Guest (304)',
    amount: 1000.0,
    dateTime: '29-Jun-2026 14:15',
    receiptNumber: 'RCP-2026-98124',
    authCode: '#AUTH-84920',
    status: 'Settled',
  },
  {
    id: 'tx-2',
    method: 'Corporate Direct Bill',
    methodDetail: 'Master Billing AR #APX-992',
    payerName: 'Apex Global Holdings',
    payerRole: 'Corporate Master Source',
    amount: 550.2,
    dateTime: '29-Jun-2026 14:18',
    receiptNumber: 'RCP-2026-98125',
    authCode: '#PO-APX-4412',
    status: 'Approved',
  },
];

export const ReservationView: React.FC = () => {
  const { currentPropertyId, addToast } = useProperty();

  // Mode: NEW_FOLIO vs GROUP_FOLIO vs ALL_RESERVATIONS
  const [activeTab, setActiveTab] = useState<'NEW_FOLIO' | 'GROUP_FOLIO' | 'MANIFEST'>('NEW_FOLIO');
  const [isMiscDrawerOpen, setIsMiscDrawerOpen] = useState(false);
  const [confirmedFolio, setConfirmedFolio] = useState<string | null>(null);

  // Existing database reservations for Manifest view
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [manifestFilter, setManifestFilter] = useState('');

  // Primary Wizard State
  const [wizardState, setWizardState] = useState<ReservationWizardState>({
    mode: 'NEW_FOLIO',
    step: 1,
    selectedGroup: null,

    // Step 1: Stay & Rent Details
    checkInDate: '2026-06-29',
    checkInTime: '14:00',
    checkOutDate: '2026-07-03',
    checkOutTime: '11:00',
    nights: 4,
    bookingSource: 'Direct Web Booking (Brand Engine)',
    building: 'Main Tower — Metropole East',
    floor: 'Floor 3 — Deluxe & Suites',
    roomType: 'Deluxe King Suite (Ocean View)',
    roomNumber: 'Room 304 (Clean & Inspected — Available)',
    adults: 2,
    children: 0,
    reservationStatus: 'Confirmed / Guaranteed',
    rateType: 'Best Available Rate (BAR - Flexible)',
    isNonRefundable: false,
    isPrepaid: false,
    roomRatePerNight: 240.0,

    // Step 2: Guest Details
    primaryGuest: {
      title: 'Mr.',
      firstName: 'Jonathan',
      middleName: 'Edward',
      lastName: 'Hayes',
      birthDate: '14-Aug-1982',
      company: 'Apex Global Holdings',
      contactType: 'Mobile',
      phone: '+1 (212) 555-0192',
      email: 'j.hayes@apexgroup.com',
      address: '742 Park Avenue, Penthouse B, New York, NY 10021',
      docType: 'Passport',
      docNumber: 'A9482910',
      docExpiry: '18-Oct-2029',
      vipTier: 'VIP GOLD',
      profileId: 'GH-90142',
      isDnrFlagged: true,
      dnrReason:
        'Guest flagged for prior late payment and unresolved noise incident (Oct-2025, Suite 412). Operational requirement: Duty Manager verification or system override required to proceed with room assignment.',
      dnrOverridden: false,
    },

    // Step 3: Other Charges
    otherCharges: INITIAL_OTHER_CHARGES,

    // Step 4: Payments
    payments: INITIAL_PAYMENTS,
    demoState: 'settled',

    // Miscellaneous
    vehicles: INITIAL_VEHICLES,
    sharedGuests: INITIAL_SHARED_GUESTS,
  });

  // Fetch reservations from DB for manifest tab
  useEffect(() => {
    const loadDbReservations = async () => {
      try {
        const res = await fetch('/api/v1/reservations?limit=100', {
          headers: { 'x-client-id': currentPropertyId },
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            setDbReservations(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not load reservations from API:', err);
      }
    };
    loadDbReservations();
  }, [currentPropertyId]);

  // Handle global Alt + N shortcut to advance steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        if (activeTab === 'NEW_FOLIO' || (activeTab === 'GROUP_FOLIO' && wizardState.step > 0)) {
          if (wizardState.step < 4) {
            setWizardState((prev) => ({ ...prev, step: prev.step + 1 }));
            addToast(`Step ${wizardState.step + 1} activated`, 'info');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, wizardState.step]);

  const updateWizardState = (patch: Partial<ReservationWizardState>) => {
    setWizardState((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectTab = (tab: 'NEW_FOLIO' | 'GROUP_FOLIO' | 'MANIFEST') => {
    setActiveTab(tab);
    setConfirmedFolio(null);

    if (tab === 'NEW_FOLIO') {
      updateWizardState({
        mode: 'NEW_FOLIO',
        step: 1,
        selectedGroup: null,
      });
    } else if (tab === 'GROUP_FOLIO') {
      updateWizardState({
        mode: 'GROUP_FOLIO',
        step: 0,
      });
    }
  };

  const handleFinishReservation = async () => {
    const folioNumber = `MET-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedFolio(folioNumber);
    addToast(`Folio #${folioNumber} confirmed and sealed!`, 'success');

    // Attempt to persist reservation record to backend
    try {
      await fetch('/api/v1/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': currentPropertyId,
        },
        body: JSON.stringify({
          guest_name: `${wizardState.primaryGuest.firstName} ${wizardState.primaryGuest.lastName}`,
          guest_email: wizardState.primaryGuest.email,
          guest_phone: wizardState.primaryGuest.phone,
          check_in_date: wizardState.checkInDate,
          check_out_date: wizardState.checkOutDate,
          adults: wizardState.adults,
          children: wizardState.children,
          total_amount: 1550.2,
          status: 'CONFIRMED',
          special_requests: `Folio #${folioNumber} • Group: ${wizardState.selectedGroup?.name || 'Individual'}`,
        }),
      });
    } catch {
      // Offline fallback
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Sub-Header Tabs & Operational Metrics */}
      <div className="h-12 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
        <nav className="flex items-center gap-6 h-full">
          {/* New Folio Tab */}
          <button
            type="button"
            onClick={() => handleSelectTab('NEW_FOLIO')}
            className={`relative h-full flex items-center px-1 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'NEW_FOLIO'
                ? 'text-[#4472C4] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#4472C4]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">person_add</span>
            New Folio
          </button>

          {/* Group Folio Tab */}
          <button
            type="button"
            onClick={() => handleSelectTab('GROUP_FOLIO')}
            className={`relative h-full flex items-center px-1 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'GROUP_FOLIO'
                ? 'text-[#4472C4] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#4472C4]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">corporate_fare</span>
            Group Folio
          </button>

          {/* Manifest / Folio List Tab */}
          <button
            type="button"
            onClick={() => handleSelectTab('MANIFEST')}
            className={`relative h-full flex items-center px-1 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'MANIFEST'
                ? 'text-[#4472C4] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#4472C4]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">view_list</span>
            Folio Manifest & Tape Chart
          </button>
        </nav>

        {/* Operational Metrics */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Occupancy:</span>
            <span className="font-mono text-xs font-bold text-[#4472C4]">88.4%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>RevPAR:</span>
            <span className="font-mono text-xs font-bold text-[#4472C4]">$248.50</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-5 flex flex-col gap-5">
        {/* Confirmed Folio Success Notification Banner */}
        {confirmedFolio && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-[26px]">task_alt</span>
              <div>
                <h3 className="font-bold text-sm">
                  Folio #{confirmedFolio} Confirmed & Ready for Arrival
                </h3>
                <p className="text-xs text-emerald-800">
                  Room 304 assigned to Jonathan Hayes • Allotment synced • Pre-auth recorded.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmedFolio(null)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Create Another Folio
              </button>
            </div>
          </div>
        )}

        {/* Wizard Stepper Bar (Visible when in New Folio or Group Folio) */}
        {activeTab !== 'MANIFEST' && !(activeTab === 'GROUP_FOLIO' && wizardState.step === 0) && (
          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-2xs px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <nav aria-label="Folio Wizard Steps" className="flex items-center gap-3 overflow-x-auto">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => setWizardState((prev) => ({ ...prev, step: 1 }))}
                className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shadow-2xs ${
                    wizardState.step === 1
                      ? 'bg-[#4472C4] text-white'
                      : wizardState.step > 1
                      ? 'bg-blue-100 text-[#4472C4]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {wizardState.step > 1 ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    '1'
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      wizardState.step === 1 ? 'text-[#4472C4]' : 'text-slate-500'
                    }`}
                  >
                    Step 1
                  </span>
                  <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">Stay & Rent</span>
                </div>
              </button>

              <div className={`w-8 h-0.5 shrink-0 ${wizardState.step > 1 ? 'bg-[#4472C4]' : 'bg-slate-200'}`} />

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => setWizardState((prev) => ({ ...prev, step: 2 }))}
                className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shadow-2xs ${
                    wizardState.step === 2
                      ? 'bg-[#4472C4] text-white'
                      : wizardState.step > 2
                      ? 'bg-blue-100 text-[#4472C4]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {wizardState.step > 2 ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    '2'
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      wizardState.step === 2 ? 'text-[#4472C4]' : 'text-slate-500'
                    }`}
                  >
                    Step 2
                  </span>
                  <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">Guest Details</span>
                </div>
              </button>

              <div className={`w-8 h-0.5 shrink-0 ${wizardState.step > 2 ? 'bg-[#4472C4]' : 'bg-slate-200'}`} />

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => setWizardState((prev) => ({ ...prev, step: 3 }))}
                className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shadow-2xs ${
                    wizardState.step === 3
                      ? 'bg-[#4472C4] text-white'
                      : wizardState.step > 3
                      ? 'bg-blue-100 text-[#4472C4]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {wizardState.step > 3 ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    '3'
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      wizardState.step === 3 ? 'text-[#4472C4]' : 'text-slate-500'
                    }`}
                  >
                    Step 3
                  </span>
                  <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">Other Charges</span>
                </div>
              </button>

              <div className={`w-8 h-0.5 shrink-0 ${wizardState.step > 3 ? 'bg-[#4472C4]' : 'bg-slate-200'}`} />

              {/* Step 4 */}
              <button
                type="button"
                onClick={() => setWizardState((prev) => ({ ...prev, step: 4 }))}
                className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shadow-2xs ${
                    wizardState.step === 4 ? 'bg-[#4472C4] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  4
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      wizardState.step === 4 ? 'text-[#4472C4]' : 'text-slate-500'
                    }`}
                  >
                    Step 4
                  </span>
                  <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">Payment</span>
                </div>
              </button>
            </nav>

            {/* PERSISTENT "MISCELLANEOUS" UTILITY BUTTON */}
            <div className="flex items-center shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
              <button
                type="button"
                onClick={() => setIsMiscDrawerOpen(true)}
                className="group flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all text-slate-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#4472C4] text-[20px] group-hover:rotate-12 transition-transform">
                  tune
                </span>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Miscellaneous</span>
                    <span className="px-1.5 py-0.2 bg-blue-100 text-[#4472C4] rounded text-[10px] font-bold">
                      Open
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Vehicle ({wizardState.vehicles.length}) & Shared Guests ({wizardState.sharedGuests.length})
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px] ml-1">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW ROUTER */}
        {activeTab === 'GROUP_FOLIO' && wizardState.step === 0 ? (
          /* Step 0: Group Folio Intake */
          <GroupFolioIntake
            onContinueToWizard={(group) => {
              updateWizardState({
                selectedGroup: group,
                step: 1,
                roomRatePerNight: group.negotiatedRate,
                checkInDate: group.checkInDate,
                checkOutDate: group.checkOutDate,
              });
              addToast(`Group #${group.code} bound to reservation wizard`, 'success');
            }}
            onCancel={() => handleSelectTab('NEW_FOLIO')}
          />
        ) : activeTab === 'MANIFEST' ? (
          /* Folio Manifest & Tape Chart View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[22px]">view_timeline</span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">In-House Folio Manifest & Bookings</h2>
                  <p className="text-xs text-slate-500">Browse current property reservations, folios, and statuses.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by guest or room..."
                  value={manifestFilter}
                  onChange={(e) => setManifestFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleSelectTab('NEW_FOLIO')}
                  className="px-4 py-1.5 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>+ New Folio</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Booking #</th>
                    <th className="py-2.5 px-4">Guest Name</th>
                    <th className="py-2.5 px-4">Room</th>
                    <th className="py-2.5 px-4">Check-in</th>
                    <th className="py-2.5 px-4">Check-out</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Folio Total</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {dbReservations
                    .filter((r) =>
                      manifestFilter
                        ? r.guest_name?.toLowerCase().includes(manifestFilter.toLowerCase()) ||
                          r.room_number?.includes(manifestFilter)
                        : true
                    )
                    .map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#4472C4]">
                          {r.booking_number || `BK-${1000 + idx}`}
                        </td>
                        <td className="py-2.5 px-4 font-semibold">{r.guest_name}</td>
                        <td className="py-2.5 px-4 font-mono">{r.room_number || '304'}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{r.check_in_date}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{r.check_out_date}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'CHECKED_IN'
                                ? 'bg-blue-100 text-[#4472C4]'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-right font-bold text-slate-900">
                          ${(r.total_amount || 1550.2).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectTab('NEW_FOLIO');
                              updateWizardState({
                                step: 1,
                                primaryGuest: {
                                  ...wizardState.primaryGuest,
                                  firstName: r.guest_name?.split(' ')[0] || 'Guest',
                                  lastName: r.guest_name?.split(' ')[1] || '',
                                  email: r.guest_email || 'guest@example.com',
                                  phone: r.guest_phone || '+1 (212) 555-0192',
                                },
                              });
                            }}
                            className="text-[#4472C4] hover:underline font-bold"
                          >
                            Inspect Folio
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : wizardState.step === 1 ? (
          /* Step 1: Stay & Rent Details */
          <Step1StayRent
            state={wizardState}
            onChange={updateWizardState}
            onNext={() => updateWizardState({ step: 2 })}
          />
        ) : wizardState.step === 2 ? (
          /* Step 2: Guest Details */
          <Step2GuestDetails
            state={wizardState}
            onChange={updateWizardState}
            onNext={() => updateWizardState({ step: 3 })}
            onBack={() => updateWizardState({ step: 1 })}
          />
        ) : wizardState.step === 3 ? (
          /* Step 3: Other Charges */
          <Step3OtherCharges
            state={wizardState}
            onChange={updateWizardState}
            onNext={() => updateWizardState({ step: 4 })}
            onBack={() => updateWizardState({ step: 2 })}
          />
        ) : (
          /* Step 4: Payment */
          <Step4Payment
            state={wizardState}
            onChange={updateWizardState}
            onBack={() => updateWizardState({ step: 3 })}
            onFinish={handleFinishReservation}
          />
        )}
      </div>

      {/* PERSISTENT MISCELLANEOUS UTILITY DRAWER */}
      <MiscellaneousDrawer
        isOpen={isMiscDrawerOpen}
        onClose={() => setIsMiscDrawerOpen(false)}
        vehicles={wizardState.vehicles}
        onUpdateVehicles={(vehicles) => updateWizardState({ vehicles })}
        sharedGuests={wizardState.sharedGuests}
        onUpdateSharedGuests={(sharedGuests) => updateWizardState({ sharedGuests })}
        folioNumber="MET-2026-8841"
      />
    </div>
  );
};
