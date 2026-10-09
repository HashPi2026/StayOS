import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { CommissionInvoiceItem, InvoicePaymentRecord } from '../types';
import { INITIAL_COMMISSION_INVOICES, UNBILLED_FOLIOS_POOL, WORKING_DATE } from '../mockData';

interface CommissionInvoiceScreenProps {
  onNavigateToTab?: (tabKey: string) => void;
}

export const CommissionInvoiceScreen: React.FC<CommissionInvoiceScreenProps> = ({ onNavigateToTab }) => {
  const { navigate, addToast } = useProperty();
  const [commInvoices, setCommInvoices] = useState<CommissionInvoiceItem[]>(INITIAL_COMMISSION_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusSegment, setStatusSegment] = useState<'all' | 'due' | 'paid' | 'overdue'>('all');

  // Detail Drawer
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedCommId, setSelectedCommId] = useState<string>('com-1');
  const [drawerActiveTab, setDrawerActiveTab] = useState<'folios' | 'remittances'>('folios');

  // Disburse Payment Modal
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [activeCommForDisburse, setActiveCommForDisburse] = useState<CommissionInvoiceItem | null>(null);
  const [disburseAmount, setDisburseAmount] = useState('');
  const [disburseMethod, setDisburseMethod] = useState('Corporate SWIFT Wire Transfer');
  const [disburseRef, setDisburseRef] = useState('');
  const [disburseDate, setDisburseDate] = useState(WORKING_DATE);

  // Generate Commission Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genAgencyName, setGenAgencyName] = useState('Booking.com B.V.');
  const [genIata, setGenIata] = useState('9821045');
  const [genMonth, setGenMonth] = useState('June-2026 Departures');
  const [selectedDepartures, setSelectedDepartures] = useState<string[]>(['unb-1', 'unb-2', 'unb-3']);

  // Active item in detail drawer
  const activeInvoice = useMemo(() => {
    return commInvoices.find((c) => c.id === selectedCommId) || commInvoices[0];
  }, [commInvoices, selectedCommId]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return commInvoices.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.agencyName.toLowerCase().includes(q) ||
        item.iataNumber.toLowerCase().includes(q) ||
        item.taxIdVat.toLowerCase().includes(q);

      const matchesStatus =
        statusSegment === 'all' ||
        (statusSegment === 'due' && (item.status === 'DUE_SOON' || item.status === 'PARTIAL')) ||
        (statusSegment === 'paid' && item.status === 'PAID') ||
        (statusSegment === 'overdue' && item.status === 'OVERDUE');

      return matchesSearch && matchesStatus;
    });
  }, [commInvoices, searchQuery, statusSegment]);

  // Financial KPI totals
  const totalPayable = commInvoices.reduce((sum, c) => sum + c.commissionPayable, 0);
  const totalDisbursed = commInvoices.reduce((sum, c) => sum + c.disbursedAmount, 0);
  const totalPending = commInvoices.reduce((sum, c) => sum + c.balanceDue, 0);
  const totalOverdue = commInvoices
    .filter((c) => c.status === 'OVERDUE')
    .reduce((sum, c) => sum + c.balanceDue, 0);
  const settledPercent = totalPayable > 0 ? ((totalDisbursed / totalPayable) * 100).toFixed(1) : '0';

  const openDetailDrawer = (comm: CommissionInvoiceItem, tab: 'folios' | 'remittances' = 'folios') => {
    setSelectedCommId(comm.id);
    setDrawerActiveTab(tab);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenDisburse = (comm: CommissionInvoiceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCommForDisburse(comm);
    setDisburseAmount(comm.balanceDue.toString());
    setDisburseRef(`SWIFT-${Date.now().toString().slice(-6)}`);
    setIsDisburseOpen(true);
  };

  const handleSaveDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommForDisburse) return;
    const amt = parseFloat(disburseAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast({
        title: 'Invalid Amount',
        message: 'Please enter a valid disbursement amount.',
        type: 'warning',
      });
      return;
    }

    const newPayment: InvoicePaymentRecord = {
      id: `cpay-${Date.now()}`,
      method: disburseMethod,
      paymentDate: disburseDate,
      receiptNumber: `REC-DISB-${Date.now().toString().slice(-5)}`,
      referenceNote: disburseRef,
      amount: amt,
      status: 'Cleared',
    };

    setCommInvoices((prev) =>
      prev.map((c) => {
        if (c.id !== activeCommForDisburse.id) return c;
        const newDisbursed = c.disbursedAmount + amt;
        const newBalance = Math.max(0, c.commissionPayable - newDisbursed);
        const newStatus: CommissionInvoiceItem['status'] = newBalance === 0 ? 'PAID' : 'PARTIAL';
        return {
          ...c,
          disbursedAmount: newDisbursed,
          balanceDue: newBalance,
          status: newStatus,
          payments: [newPayment, ...c.payments],
        };
      })
    );

    addToast({
      title: 'Commission Disbursed',
      message: `Disbursed $${amt.toFixed(2)} to ${activeCommForDisburse.agencyName}.`,
      type: 'success',
    });

    setIsDisburseOpen(false);
    setActiveCommForDisburse(null);
  };

  const handleGenerateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenFolios = UNBILLED_FOLIOS_POOL.filter((f) => selectedDepartures.includes(f.id));
    const commTotal = chosenFolios.reduce((sum, f) => sum + (f.commissionAmount || 0), 0);

    const newInvoice: CommissionInvoiceItem = {
      id: `com-${Date.now()}`,
      invoiceNumber: `COM-2026-04${Math.floor(Math.random() * 80 + 20)}`,
      agencyName: genAgencyName,
      agencyCode: 'OTA Commission Folio',
      iataNumber: genIata,
      partnerRef: `AGY-REF-${Date.now().toString().slice(-4)}`,
      invoiceDate: WORKING_DATE,
      dueDate: '15-Jul-2026',
      stayMonth: genMonth,
      taxIdVat: 'NL-805734958B01',
      vatRegime: 'Reverse Charge VAT Eligible',
      commissionPayable: commTotal || 1850.0,
      disbursedAmount: 0,
      balanceDue: commTotal || 1850.0,
      status: 'DUE_SOON',
      folios: chosenFolios.length > 0 ? chosenFolios : [UNBILLED_FOLIOS_POOL[0]],
      payments: [],
    };

    setCommInvoices((prev) => [newInvoice, ...prev]);
    addToast({
      title: 'Commission Invoice Generated',
      message: `${newInvoice.invoiceNumber} created for ${newInvoice.agencyName}.`,
      type: 'success',
    });
    setIsGenerateModalOpen(false);
  };

  const handlePrintRemittance = (comm: CommissionInvoiceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToast({
      title: 'Remittance Advice Ready',
      message: `Printable agency remittance advice generated for ${comm.invoiceNumber}.`,
      type: 'info',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Agency Name', 'IATA Number', 'Stay Month', 'Commission Payable', 'Disbursed Amount', 'Balance Due', 'Status'];
    const rows = filteredInvoices.map((c) => [
      `"${c.invoiceNumber}"`,
      `"${c.agencyName.replace(/"/g, '""')}"`,
      `"${c.iataNumber}"`,
      `"${c.stayMonth}"`,
      c.commissionPayable,
      c.disbursedAmount,
      c.balanceDue,
      c.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Commission_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      title: 'Audit Exported',
      message: 'Downloaded Commission Audit Remittances as CSV.',
      type: 'info',
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-lg py-md flex flex-col gap-lg max-w-[1720px] mx-auto w-full">
        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-xs font-body-sm text-on-surface-variant">
            <span onClick={() => navigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">
              Front Desk / Financials
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span onClick={() => onNavigateToTab?.('business-source')} className="hover:text-on-surface transition-colors cursor-pointer">
              Business Channels
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-semibold text-[#4472C4]">Commission Invoices</span>
          </div>
          <span className="font-data-mono text-[12px] text-on-surface-variant bg-surface-container-low px-sm py-0.5 rounded border border-outline-variant/30">
            Current PMS Ledger: {WORKING_DATE}
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Commission Invoices & Agency Remittances
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              OTA fee audits, travel agent commissions, IATA reconciliation, and net payout vouchers.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-xs px-md py-base bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase rounded transition-colors shadow-sm cursor-pointer border border-outline-variant/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Export Audit Remittance
            </button>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center gap-xs px-md py-base bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase rounded transition-colors shadow-sm cursor-pointer active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + Audit & Generate Commission
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards (Bento Layer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {/* KPI 1 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">
                Total Commission Invoiced
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">percent</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold">
                ${totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-label-uppercase text-[11px] text-on-surface-variant bg-surface-container px-xs py-0.5 rounded">
                May/June Departures
              </span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Total Disbursed</span>
              <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold text-[#059669]">
                ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-body-sm text-[12px] text-[#059669] font-semibold">
                {settledPercent}% Settled
              </span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">
                Pending Disbursement
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#4472C4]/15 flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold text-[#4472C4]">
                ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-body-sm text-[12px] text-on-surface-variant">3 Agency Invoices Due</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">
                Overdue Agency Payouts
              </span>
              <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">priority_high</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold text-error">
                ${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-label-uppercase text-[11px] text-error font-semibold bg-error-container/60 px-xs py-0.5 rounded">
                Amex GBT 14d Overdue
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-surface-container-lowest p-sm rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-sm border border-outline-variant/30">
          <div className="flex flex-1 items-center gap-sm">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full pl-xl pr-md py-xs bg-surface-container-low focus:bg-surface-container-lowest rounded text-body-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant border border-transparent focus:border-[#4472C4]"
                placeholder="Filter by agency, IATA number, or invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-xs bg-surface-container-low p-xs rounded-lg self-start lg:self-auto border border-outline-variant/30">
            <button
              onClick={() => setStatusSegment('all')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All ({commInvoices.length})
            </button>
            <button
              onClick={() => setStatusSegment('due')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'due'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Due Soon / Partial (2)
            </button>
            <button
              onClick={() => setStatusSegment('paid')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'paid'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Settled (1)
            </button>
            <button
              onClick={() => setStatusSegment('overdue')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'overdue'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Overdue (1)
            </button>
          </div>
        </div>

        {/* Commission Invoices Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <th className="px-md py-sm">Invoice #</th>
                  <th className="px-md py-sm">Agency / OTA Partner</th>
                  <th className="px-md py-sm">Stay Departures</th>
                  <th className="px-md py-sm">Invoice Date</th>
                  <th className="px-md py-sm">Due Date</th>
                  <th className="px-md py-sm">Payable</th>
                  <th className="px-md py-sm">Disbursed</th>
                  <th className="px-md py-sm">Balance Due</th>
                  <th className="px-md py-sm">Status</th>
                  <th className="px-md py-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 font-body-sm">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-md py-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
                        <span className="font-semibold text-body-md">No commission invoices match your filter.</span>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusSegment('all');
                          }}
                          className="text-[12px] text-[#4472C4] font-semibold hover:underline mt-xs"
                        >
                          Reset filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((item) => {
                    const isSelected = isDetailDrawerOpen && selectedCommId === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => openDetailDrawer(item, 'folios')}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#4472C4]/10' : ''
                        }`}
                      >
                        <td className="px-md py-md">
                          <div className="flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[18px] text-[#4472C4]">receipt</span>
                            <span className="font-data-mono font-bold text-on-surface">{item.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="px-md py-md">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">{item.agencyName}</span>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">
                              IATA: {item.iataNumber} • {item.vatRegime}
                            </span>
                          </div>
                        </td>
                        <td className="px-md py-md font-data-mono text-on-surface-variant">{item.stayMonth}</td>
                        <td className="px-md py-md font-data-mono text-on-surface-variant">{item.invoiceDate}</td>
                        <td className="px-md py-md font-data-mono text-on-surface">
                          <div className="flex flex-col">
                            <span>{item.dueDate}</span>
                            {item.overdueDays && (
                              <span className="text-[10px] font-label-uppercase text-error font-semibold">
                                {item.overdueDays}d Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-md py-md font-data-mono font-medium text-on-surface">
                          ${item.commissionPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-md font-data-mono text-[#059669] font-medium">
                          ${item.disbursedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-md font-data-mono font-bold text-on-surface">
                          ${item.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-md">
                          <span
                            className={`inline-flex items-center px-sm py-0.5 rounded text-[11px] font-label-uppercase font-semibold ${
                              item.status === 'PAID'
                                ? 'bg-[#059669]/10 text-[#059669]'
                                : item.status === 'OVERDUE'
                                ? 'bg-error-container text-error'
                                : item.status === 'DUE_SOON'
                                ? 'bg-surface-container-high text-on-surface'
                                : 'bg-[#4472C4]/10 text-[#4472C4]'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-md py-md text-right">
                          <div
                            className="inline-flex items-center gap-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openDetailDrawer(item, 'folios')}
                              className="p-xs text-on-surface-variant hover:text-[#4472C4] hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                              title="Audit Commission Line Items"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">list_alt</span>
                            </button>
                            {item.balanceDue > 0 && (
                              <button
                                onClick={(e) => handleOpenDisburse(item, e)}
                                className="p-xs text-on-surface-variant hover:text-[#059669] hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                                title="Disburse Remittance Payout"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">send_money</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => handlePrintRemittance(item, e)}
                              className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                              title="Print Remittance Advice"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">print</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-surface-container-low px-md py-sm flex flex-col sm:flex-row items-center justify-between gap-sm text-body-sm text-on-surface-variant border-t border-outline-variant/30">
            <span className="font-data-mono text-[12px]">
              Showing {filteredInvoices.length} of {commInvoices.length} Commission Statements
            </span>
            <span className="text-[12px]">
              Outstanding Agency Liabilities:{' '}
              <strong className="font-data-mono text-on-surface">
                ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer: Commission Details with Folios & Remittances Tabs */}
      {isDetailDrawerOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsDetailDrawerOpen(false)}
          />

          <div className="relative w-full max-w-[760px] bg-surface-container-lowest shadow-2xl flex flex-col justify-between z-10 h-full border-l border-outline-variant/40 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-lg py-md bg-surface-container-low flex items-center justify-between border-b border-outline-variant/30">
              <div className="flex flex-col">
                <div className="flex items-center gap-sm">
                  <span className="font-data-mono text-title-sm font-bold text-on-surface">
                    {activeInvoice.invoiceNumber}
                  </span>
                  <span
                    className={`inline-flex items-center px-xs py-0.5 rounded text-[11px] font-label-uppercase font-semibold ${
                      activeInvoice.status === 'PAID'
                        ? 'bg-[#059669]/10 text-[#059669]'
                        : activeInvoice.status === 'OVERDUE'
                        ? 'bg-error-container text-error'
                        : 'bg-[#4472C4]/10 text-[#4472C4]'
                    }`}
                  >
                    {activeInvoice.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                  {activeInvoice.agencyName} • IATA {activeInvoice.iataNumber} • {activeInvoice.stayMonth}
                </span>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Financial Overview Banner */}
            <div className="bg-surface-container-lowest px-lg py-md border-b border-outline-variant/30">
              <div className="grid grid-cols-3 gap-md bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Commission Payable</span>
                  <span className="font-data-mono text-title-sm font-bold text-on-surface">
                    ${activeInvoice.commissionPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Total Disbursed</span>
                  <span className="font-data-mono text-title-sm font-bold text-[#059669]">
                    ${activeInvoice.disbursedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Balance Due</span>
                  <span className="font-data-mono text-title-sm font-bold text-on-surface">
                    ${activeInvoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs: Folios vs Remittances */}
              <div className="flex items-center gap-md border-b border-outline-variant/30 mt-md pt-xs">
                <button
                  onClick={() => setDrawerActiveTab('folios')}
                  className={`pb-xs font-label-uppercase text-label-uppercase flex items-center gap-xs cursor-pointer border-b-2 transition-colors ${
                    drawerActiveTab === 'folios'
                      ? 'border-[#4472C4] text-[#4472C4] font-semibold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                  Audited Guest Bookings ({activeInvoice.folios.length})
                </button>
                <button
                  onClick={() => setDrawerActiveTab('remittances')}
                  className={`pb-xs font-label-uppercase text-label-uppercase flex items-center gap-xs cursor-pointer border-b-2 transition-colors ${
                    drawerActiveTab === 'remittances'
                      ? 'border-[#4472C4] text-[#4472C4] font-semibold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Remittance Payouts ({activeInvoice.payments.length})
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-lg py-md space-y-md">
              {drawerActiveTab === 'folios' && (
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Itemized guest folios audited and matched against contracted commission rates.
                    </span>
                  </div>

                  {activeInvoice.folios.length === 0 ? (
                    <div className="p-lg bg-surface-container-low rounded-xl text-center text-on-surface-variant text-body-sm">
                      Summary statement. Itemized reservation departures are archived in the historical folio ledger.
                    </div>
                  ) : (
                    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-[11px] border-b border-outline-variant/30">
                            <th className="px-md py-xs">Reservation & Guest</th>
                            <th className="px-md py-xs">Stay & Room</th>
                            <th className="px-md py-xs">Gross Revenue</th>
                            <th className="px-md py-xs">Rate %</th>
                            <th className="px-md py-xs text-right">Commission Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container/60 font-body-sm text-[13px]">
                          {activeInvoice.folios.map((folio) => (
                            <tr key={folio.id} className="hover:bg-surface-container-lowest">
                              <td className="px-md py-sm">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-on-surface">{folio.guestName}</span>
                                  <span className="font-data-mono text-[11px] text-[#4472C4]">{folio.reservationId}</span>
                                </div>
                              </td>
                              <td className="px-md py-sm">
                                <div className="flex flex-col">
                                  <span className="font-data-mono text-on-surface">{folio.stayPeriod}</span>
                                  <span className="text-[11px] text-on-surface-variant">
                                    Room {folio.roomNumber} ({folio.roomType})
                                  </span>
                                </div>
                              </td>
                              <td className="px-md py-sm font-data-mono text-on-surface">
                                ${folio.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-md py-sm font-data-mono font-medium text-[#4472C4]">
                                {folio.commissionPercent?.toFixed(1) || '15.0'}%
                              </td>
                              <td className="px-md py-sm text-right font-data-mono font-bold text-on-surface">
                                ${folio.commissionAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {drawerActiveTab === 'remittances' && (
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Executed agency wire payouts, bank transfers, and cleared disbursements.
                    </span>
                    {activeInvoice.balanceDue > 0 && (
                      <button
                        onClick={() => handleOpenDisburse(activeInvoice)}
                        className="inline-flex items-center gap-xs px-sm py-xs bg-[#059669] hover:bg-[#047857] text-white font-label-uppercase text-[11px] rounded transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">send_money</span>
                        Disburse Remittance
                      </button>
                    )}
                  </div>

                  {activeInvoice.payments.length === 0 ? (
                    <div className="p-lg bg-surface-container-low rounded-xl text-center text-on-surface-variant text-body-sm">
                      No disbursements posted yet for this commission statement.
                    </div>
                  ) : (
                    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-[11px] border-b border-outline-variant/30">
                            <th className="px-md py-xs">Payout Method</th>
                            <th className="px-md py-xs">Reference</th>
                            <th className="px-md py-xs">Disbursed Date</th>
                            <th className="px-md py-xs">Status</th>
                            <th className="px-md py-xs text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container/60 font-body-sm text-[13px]">
                          {activeInvoice.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-surface-container-lowest">
                              <td className="px-md py-sm font-semibold text-on-surface">{p.method}</td>
                              <td className="px-md py-sm font-data-mono text-[11px] text-on-surface-variant">
                                {p.referenceNote}
                              </td>
                              <td className="px-md py-sm font-data-mono text-on-surface-variant">{p.paymentDate}</td>
                              <td className="px-md py-sm">
                                <span className="inline-flex items-center px-xs py-0.5 rounded text-[10px] font-label-uppercase bg-[#059669]/10 text-[#059669] font-semibold">
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-md py-sm text-right font-data-mono font-bold text-[#059669]">
                                ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-lg py-md bg-surface-container-low flex items-center justify-between border-t border-outline-variant/30">
              <button
                onClick={(e) => handlePrintRemittance(activeInvoice, e)}
                className="inline-flex items-center gap-xs px-md py-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Remittance Advice
              </button>
              <div className="flex items-center gap-sm">
                {activeInvoice.balanceDue > 0 && (
                  <button
                    onClick={() => handleOpenDisburse(activeInvoice)}
                    className="inline-flex items-center gap-xs px-md py-sm bg-[#059669] hover:bg-[#047857] text-white font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">send_money</span>
                    Disburse Payout
                  </button>
                )}
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="px-md py-sm bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Payment Modal */}
      {isDisburseOpen && activeCommForDisburse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-xs p-md">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-[#059669] font-semibold">Agency Settlement</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Disburse Agency Payment: {activeCommForDisburse.agencyName}
                </h3>
              </div>
              <button
                onClick={() => setIsDisburseOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} className="space-y-md">
              <div className="bg-surface-container-low p-sm rounded-lg flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Outstanding Payable:</span>
                <span className="font-data-mono font-bold text-title-sm text-on-surface">
                  ${activeCommForDisburse.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                  Disbursement Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-surface-container-low px-md py-xs rounded text-body-md font-data-mono font-semibold text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    Payout Rail / Method *
                  </label>
                  <select
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={disburseMethod}
                    onChange={(e) => setDisburseMethod(e.target.value)}
                  >
                    <option value="Corporate SWIFT Wire Transfer">Corporate SWIFT Wire Transfer</option>
                    <option value="Fedwire / Direct ACH">Fedwire / Direct ACH</option>
                    <option value="Virtual Agency Credit Card">Virtual Agency Credit Card</option>
                    <option value="Direct Clearing Bank Draft">Direct Clearing Bank Draft</option>
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    Value Date *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm font-data-mono text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={disburseDate}
                    onChange={(e) => setDisburseDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                  Wire Transfer / SWIFT Reference
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                  value={disburseRef}
                  onChange={(e) => setDisburseRef(e.target.value)}
                  placeholder="e.g. TXN-WIRE-BKG-MAY"
                />
              </div>

              <div className="flex items-center justify-end gap-sm pt-xs border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsDisburseOpen(false)}
                  className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-label-uppercase text-label-uppercase shadow-sm cursor-pointer"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Commission Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-xs p-md">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-[#4472C4] font-semibold">Commission Engine</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Audit & Generate Commission Invoice
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerateCommission} className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    Travel Agency / Channel *
                  </label>
                  <select
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={genAgencyName}
                    onChange={(e) => {
                      setGenAgencyName(e.target.value);
                      if (e.target.value.includes('Expedia')) setGenIata('0023419');
                      else if (e.target.value.includes('Agoda')) setGenIata('7719401');
                      else setGenIata('9821045');
                    }}
                  >
                    <option value="Booking.com B.V.">Booking.com B.V.</option>
                    <option value="Expedia Group Network">Expedia Group Network</option>
                    <option value="Agoda Global Corp">Agoda Global Corp</option>
                    <option value="Sabre Travel Network">Sabre Travel Network</option>
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    IATA / Agency Code
                  </label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm font-data-mono text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={genIata}
                    onChange={(e) => setGenIata(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                  Departure Stay Month
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                />
              </div>

              {/* Unbilled Departures Selector */}
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    Select Audited Departures ({selectedDepartures.length} Bookings)
                  </label>
                  <span className="text-[11px] text-[#4472C4] font-medium">Auto-calculated commission</span>
                </div>
                <div className="space-y-xs max-h-44 overflow-y-auto bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
                  {UNBILLED_FOLIOS_POOL.map((fol) => {
                    const isChecked = selectedDepartures.includes(fol.id);
                    return (
                      <label
                        key={fol.id}
                        className="flex items-center justify-between p-xs bg-surface-container-lowest rounded cursor-pointer hover:bg-surface-container-high transition-colors"
                      >
                        <div className="flex items-center gap-sm">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-[#4472C4]"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDepartures((prev) => [...prev, fol.id]);
                              } else {
                                setSelectedDepartures((prev) => prev.filter((id) => id !== fol.id));
                              }
                            }}
                          />
                          <div className="flex flex-col text-[12px]">
                            <span className="font-semibold text-on-surface">{fol.guestName}</span>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">
                              {fol.reservationId} • Gross: ${fol.grossRevenue.toFixed(2)} (15%)
                            </span>
                          </div>
                        </div>
                        <span className="font-data-mono font-bold text-[12px] text-[#4472C4]">
                          +${fol.commissionAmount?.toFixed(2) || '0.00'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-sm pt-xs border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm rounded-lg bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase shadow-sm cursor-pointer"
                >
                  Audit & Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
