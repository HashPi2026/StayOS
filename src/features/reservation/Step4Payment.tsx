import React, { useState } from 'react';
import { ReservationWizardState, PaymentTransaction } from './types';

interface Step4PaymentProps {
  state: ReservationWizardState;
  onChange: (patch: Partial<ReservationWizardState>) => void;
  onBack: () => void;
  onFinish: () => void;
}

export const Step4Payment: React.FC<Step4PaymentProps> = ({
  state,
  onChange,
  onBack,
  onFinish,
}) => {
  const [demoState, setDemoState] = useState<'settled' | 'due'>(state.demoState || 'settled');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cc' | 'cash' | 'direct-bill' | 'wire'>('cc');
  const [payerType, setPayerType] = useState<'guest' | 'corporate'>('guest');
  const [isAuthOnly, setIsAuthOnly] = useState(false);

  // CC fields
  const [cardNumber, setCardNumber] = useState('4092 •••• •••• 1024');
  const [cardHolder, setCardHolder] = useState('Jonathan Hayes');
  const [cardNetwork, setCardNetwork] = useState('visa');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('894');

  // Amount
  const [amount, setAmount] = useState('1550.20');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isSettled = demoState === 'settled';

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const parsedAmount = parseFloat(amount) || 0;

      const newTx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        method: paymentMethod === 'cc' ? 'Visa •••• 1024' : paymentMethod === 'cash' ? 'Cash Deposit' : paymentMethod === 'direct-bill' ? 'Corporate Direct Bill' : 'Wire Transfer',
        methodDetail: paymentMethod === 'cc' ? 'Chip / Terminal #01' : paymentMethod === 'direct-bill' ? 'Master Billing AR #APX-992' : 'Desk Drawer #01',
        payerName: payerType === 'guest' ? 'Jonathan Hayes' : 'Apex Global Holdings',
        payerRole: payerType === 'guest' ? 'Room Guest (304)' : 'Corporate Master Source',
        amount: parsedAmount,
        dateTime: '29-Jun-2026 14:22',
        receiptNumber: `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        authCode: isAuthOnly ? '#HOLD-84920' : `#AUTH-${Math.floor(10000 + Math.random() * 90000)}`,
        status: isAuthOnly ? 'Pending' : 'Settled',
      };

      onChange({
        payments: [newTx, ...state.payments],
        demoState: 'settled',
      });
      setDemoState('settled');
    }, 600);
  };

  const handleFinish = () => {
    setIsFinishing(true);
    setTimeout(() => {
      setIsFinishing(false);
      setIsSuccess(true);
      onFinish();
    }, 900);
  };

  const transactions = showEmptyState ? [] : state.payments;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 1. FINANCIAL BALANCE HERO BANNER */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-500 font-semibold">FOLIO #MET-2026-8841</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold uppercase text-slate-500">CURRENCY: USD ($)</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#4472C4]">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span> CC Guarantee On File
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-xs text-slate-500 font-medium">Ledger Balance:</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                    {isSettled ? '$0.00' : '$1,550.20'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isSettled ? 'bg-slate-200 text-slate-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isSettled ? 'SETTLED' : 'BALANCE DUE'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  {isSettled
                    ? 'Zero balance recorded. Pre-authorizations confirmed. Ready for guest check-in / departure folio seal.'
                    : 'Settlement required. Add room guarantee or process direct bill to complete departure clearance.'}
                </p>
              </div>

              {/* Demo Toggle */}
              <div className="flex flex-col items-start md:items-end gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Simulate Demo Ledger State</span>
                <div className="inline-flex bg-slate-200/80 p-0.5 rounded-md">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoState('settled');
                      onChange({ demoState: 'settled' });
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                      isSettled ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fully Settled ($0)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDemoState('due');
                      onChange({ demoState: 'due' });
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                      !isSettled ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Balance Due ($1,550.20)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Charges</div>
                <div className="font-mono text-sm font-bold text-slate-900">$1,550.20</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Payments</div>
                <div className="font-mono text-sm font-bold text-[#4472C4]">
                  {isSettled ? '$1,550.20' : '$0.00'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Pre-Auth Holds</div>
                <div className="font-mono text-sm font-bold text-slate-900">$200.00</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Departure Gate</div>
                <div
                  className={`font-mono text-xs font-bold ${
                    isSettled ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isSettled ? 'Cleared ✓' : 'Pending Guarantee'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. POSTED PAYMENTS & TRANSACTIONS TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[22px]">payments</span>
                <h2 className="text-sm font-bold text-slate-900">Posted Payments & Transactions</h2>
                <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded text-[10px] font-bold">
                  {transactions.length} Entries
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmptyState(!showEmptyState)}
                className="text-xs text-[#4472C4] hover:underline font-medium cursor-pointer"
              >
                {showEmptyState ? 'Restore Transactions' : 'Toggle Empty State View'}
              </button>
            </div>

            <div className="overflow-x-auto">
              {transactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50">
                  <span className="material-symbols-outlined text-slate-400 text-[36px] mb-2">
                    account_balance_wallet
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">No Payments Recorded Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Add initial guarantee deposit or record full settlement using the form below. Folio remains
                    unpaid until transaction post.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Payment Method</th>
                      <th className="py-2.5 px-4 font-semibold">Payer / Source</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                      <th className="py-2.5 px-4 font-semibold">Receipt / Auth</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-900">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="material-symbols-outlined text-[#4472C4] text-[18px]">
                              {tx.method.includes('Visa') ? 'credit_card' : 'domain_verification'}
                            </span>
                            <span>{tx.method}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{tx.methodDetail}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold">{tx.payerName}</div>
                          <div className="text-[10px] text-slate-500">{tx.payerRole}</div>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          ${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{tx.dateTime}</td>
                        <td className="py-2.5 px-4">
                          <div className="font-mono text-[10px] text-slate-900">{tx.receiptNumber}</div>
                          <div className="font-mono text-[10px] text-slate-500">{tx.authCode}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              tx.status === 'Settled'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-blue-100 text-[#4472C4]'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded"
                              title="Print Slip"
                            >
                              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            </button>
                            <button
                              type="button"
                              className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded"
                              title="Supervisor Void/Refund"
                            >
                              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 3. ADD PAYMENT CARD (INLINE, NO MODAL) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4472C4] text-[22px]">add_card</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Payment to Folio</h3>
                  <span className="text-[11px] text-[#4472C4] font-medium">Real-time Balance Adjustment</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Verifone P400 (Terminal 01): Ready</span>
              </div>
            </div>

            <form onSubmit={handleAddPayment} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Method */}
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#4472C4]"
                  >
                    <option value="cc">Credit Card (Verifone P400 / Integrated)</option>
                    <option value="cash">Cash Deposit (Front Desk Drawer #2)</option>
                    <option value="direct-bill">Corporate Direct Bill (Apex Global)</option>
                    <option value="wire">Bank Wire / SWIFT Electronic Transfer</option>
                  </select>
                </div>

                {/* Payer Type */}
                <div className="md:col-span-6 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase text-slate-700">Payer Type</span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPayerType('guest')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                        payerType === 'guest'
                          ? 'bg-white shadow-2xs text-[#4472C4]'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>Room / Guest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayerType('corporate')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                        payerType === 'corporate'
                          ? 'bg-white shadow-2xs text-[#4472C4]'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                      <span>Business Source</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Corporate Account Notice if corporate selected */}
              {payerType === 'corporate' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#4472C4] text-[20px]">apartment</span>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Apex Global Holdings (Direct Bill #APX-992)</div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Master Billing Cap: $100,000.00 | Available Credit: $64,250.00 | Folio Router: Room & Tax
                      Approved
                    </div>
                  </div>
                </div>
              )}

              {/* INLINE CREDIT CARD PROCESSING SECTION (NO POPUP/MODAL) */}
              {paymentMethod === 'cc' && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-[#4472C4]">contactless</span>
                      Inline Card Capture & Terminal Sync
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-600">
                      <span className="bg-white border px-1.5 py-0.5 rounded">VISA</span>
                      <span className="bg-white border px-1.5 py-0.5 rounded">MC</span>
                      <span className="bg-white border px-1.5 py-0.5 rounded">AMEX</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600">Card Number</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-white border border-slate-300 font-mono text-xs rounded-lg pl-3 pr-9 py-2 focus:outline-none focus:border-[#4472C4]"
                        />
                        <span className="material-symbols-outlined absolute right-2.5 text-[#4472C4] text-[18px]">
                          credit_card
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-6 flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600">Cardholder Full Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#4472C4]"
                      />
                    </div>

                    <div className="md:col-span-4 flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600">Card Network</label>
                      <select
                        value={cardNetwork}
                        onChange={(e) => setCardNetwork(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#4472C4]"
                      >
                        <option value="visa">Visa Signature</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                        <option value="discover">Discover</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600">Valid Till (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#4472C4]"
                      />
                    </div>

                    <div className="md:col-span-4 flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-slate-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#4472C4]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAuthOnly}
                        onChange={(e) => setIsAuthOnly(e.target.checked)}
                        className="w-4 h-4 text-[#4472C4] accent-[#4472C4] rounded"
                      />
                      <span className="text-xs text-slate-700">
                        <span className="font-bold">Authorize Only (Hold)</span> — Pre-authorization hold without
                        instant debit.
                      </span>
                    </label>

                    <button
                      type="button"
                      className="text-xs text-[#4472C4] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">wifi</span>
                      Send to Terminal
                    </button>
                  </div>
                </div>
              )}

              {/* Amount & Quick Fill */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase text-slate-700">Payment Amount (USD)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#4472C4]"
                    />
                  </div>
                </div>

                <div className="md:col-span-6 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAmount('1550.20')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    Pay Full Balance ($1,550.20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('240.00')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    First Night Deposit ($240.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('500.00')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    $500.00
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Exchange Rate: 1.0000 USD (Base Property Currency). Live PMS settlement applied.</span>
                <span className="font-mono">Gateway Auth Latency: 240ms</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAmount('1550.20')}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#4472C4] hover:bg-[#365cb5] text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-75"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>+ Add Payment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 flex flex-col gap-5">
          {/* Room 304 Identity Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">bedroom_parent</span>
                <span className="font-bold text-slate-900 text-sm">Room 304</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                4 Nights
              </span>
            </div>

            <div>
              <div className="font-semibold text-slate-900 text-xs">Deluxe King Suite • Ocean View</div>
              <div className="text-[11px] text-slate-500">Floor 3 • Tower Wing • Non-Smoking</div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">CHECK-IN</span>
                <span className="font-semibold text-slate-900 block">{state.checkInDate}</span>
                <span className="text-[10px] text-slate-500">From 15:00</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">CHECK-OUT</span>
                <span className="font-semibold text-slate-900 block">{state.checkOutDate}</span>
                <span className="text-[10px] text-slate-500">Until 11:00</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#4472C4] flex items-center justify-center font-bold text-[11px] font-mono">
                  JH
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">Jonathan Hayes</span>
                  <span className="text-[10px] text-[#4472C4] font-bold">VIP Tier 1 (Gold)</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">verified</span>
            </div>
          </div>

          {/* Comprehensive Ledger Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Ledger Breakdown</span>
              <span className="font-mono text-[10px] text-slate-500">USD $</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Room Base Rate (4 nights @ $240)</span>
                <span className="font-mono text-slate-900">$960.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Room Occupancy Tax (12%)</span>
                <span className="font-mono text-slate-900">$115.20</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Rental Charges</span>
                <span className="font-mono">$1,075.20</span>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded-md space-y-1 my-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Step 3 Ancillary Charges</span>
                  <span className="font-mono text-slate-900 font-semibold">$435.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Applicable Ancillary Taxes (8.5%)</span>
                  <span className="font-mono text-slate-700">$40.00</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 text-sm">
                <span>Total Folio Gross Charges</span>
                <span className="font-mono">$1,550.20</span>
              </div>

              <div className="flex items-center justify-between text-[#4472C4] font-semibold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">remove_circle_outline</span>
                  <span>Payments & Credits</span>
                </span>
                <span className="font-mono font-bold">{isSettled ? '-$1,550.20' : '$0.00'}</span>
              </div>
            </div>

            {/* Net Balance Due Banner */}
            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">NET BALANCE DUE</span>
                <span className="font-mono text-xl font-bold text-slate-900">
                  {isSettled ? '$0.00' : '$1,550.20'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                  isSettled ? 'bg-slate-200 text-slate-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isSettled ? 'FULLY SETTLED ✓' : 'OUTSTANDING DUE'}
              </span>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 flex items-center gap-3 text-xs">
            <span className="material-symbols-outlined text-[#4472C4] text-[24px] shrink-0">gavel</span>
            <div className="text-slate-600 text-[11px] leading-snug">
              <span className="font-bold text-slate-900 block">Folio Compliance Confirmed</span>
              PCI-DSS Level 1 tokenized ledger. Credit card authorization will unlock mobile door key generation upon check-in.
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM STICKY ACTION BAR */}
      <footer className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>← Back: Other Charges</span>
        </button>

        <button
          type="button"
          className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4"
        >
          Save as Draft Folio
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden xl:block text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Keyboard Shortcut:</span>
            <span className="font-mono text-[10px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
              [Ctrl + Enter]
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            disabled={isFinishing || isSuccess}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#4472C4] hover:bg-[#365cb5] text-white active:scale-[0.98]'
            }`}
          >
            {isFinishing ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Creating Folio...</span>
              </>
            ) : isSuccess ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Folio #MET-8841 Confirmed!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                <span>Finish Reservation ✓</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};
