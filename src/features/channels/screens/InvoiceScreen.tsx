import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { CorporateInvoiceItem, InvoiceFolioItem, InvoicePaymentRecord } from '../types';
import { INITIAL_CORPORATE_INVOICES, INITIAL_BUSINESS_SOURCES, UNBILLED_FOLIOS_POOL, WORKING_DATE } from '../mockData';

interface InvoiceScreenProps {
  initialPartnerFilter?: string;
  onNavigateToTab?: (tabKey: string) => void;
}

export const InvoiceScreen: React.FC<InvoiceScreenProps> = ({ initialPartnerFilter, onNavigateToTab }) => {
  const { navigate, addToast } = useProperty();
  const [invoices, setInvoices] = useState<CorporateInvoiceItem[]>(INITIAL_CORPORATE_INVOICES);
  const [searchQuery, setSearchQuery] = useState(initialPartnerFilter || '');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');
  const [statusSegment, setStatusSegment] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  // Selected Invoice for Drawer Detail (Tabs: Folios & Payments)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('inv-1');
  const [drawerActiveTab, setDrawerActiveTab] = useState<'folios' | 'payments'>('folios');

  // Record Payment Modal
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<CorporateInvoiceItem | null>(null);
  const [payMethod, setPayMethod] = useState('Corporate Wire Clearing');
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState('29-Jun-2026');

  // Generate Master Invoice Modal
  const [isGenerateInvoiceOpen, setIsGenerateInvoiceOpen] = useState(false);
  const [genSourceId, setGenSourceId] = useState('src-5');
  const [genInvoiceType, setGenInvoiceType] = useState<'Corporate Master' | 'OTA Net Comm' | 'OTA Merchant'>('Corporate Master');
  const [genTerms, setGenTerms] = useState('Net-30 Corporate Terms');
  const [selectedUnbilledFolios, setSelectedUnbilledFolios] = useState<string[]>(['unb-1', 'unb-2']);

  // Active Invoice for drawer
  const activeInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];
  }, [invoices, selectedInvoiceId]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.businessSourceName.toLowerCase().includes(q) ||
        inv.taxRegistrationNumber.toLowerCase().includes(q) ||
        inv.businessSourceAcct.toLowerCase().includes(q);

      const matchesType =
        selectedTypeFilter === 'All Types' || inv.invoiceType === selectedTypeFilter;

      const matchesStatus =
        statusSegment === 'all' ||
        (statusSegment === 'pending' && inv.status === 'PARTIAL') ||
        (statusSegment === 'paid' && inv.status === 'PAID') ||
        (statusSegment === 'overdue' && inv.status === 'OVERDUE');

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [invoices, searchQuery, selectedTypeFilter, statusSegment]);

  // Financial Stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.postedAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.receivedAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);
  const recoveryRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : '0';

  const openDetailDrawer = (inv: CorporateInvoiceItem, tab: 'folios' | 'payments' = 'folios') => {
    setSelectedInvoiceId(inv.id);
    setDrawerActiveTab(tab);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenRecordPayment = (inv: CorporateInvoiceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPaymentInvoice(inv);
    setPayAmount(inv.balanceDue.toString());
    setPayRef(`TXN-${Date.now().toString().slice(-6)}`);
    setIsRecordPaymentOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast({
        title: 'Invalid Payment Amount',
        message: 'Enter a valid payment amount greater than zero.',
        type: 'warning',
      });
      return;
    }

    const newPaymentRecord: InvoicePaymentRecord = {
      id: `pay-${Date.now()}`,
      method: payMethod,
      paymentDate: payDate,
      receiptNumber: `REC-${Date.now().toString().slice(-5)}`,
      referenceNote: payRef,
      amount: amt,
      status: 'Cleared',
    };

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentInvoice.id) return inv;
        const newReceived = inv.receivedAmount + amt;
        const newBalance = Math.max(0, inv.postedAmount - newReceived);
        const newStatus: CorporateInvoiceItem['status'] = newBalance === 0 ? 'PAID' : 'PARTIAL';
        return {
          ...inv,
          receivedAmount: newReceived,
          balanceDue: newBalance,
          status: newStatus,
          payments: [newPaymentRecord, ...inv.payments],
        };
      })
    );

    addToast({
      title: 'Payment Recorded',
      message: `Successfully posted $${amt.toFixed(2)} to ${paymentInvoice.invoiceNumber}.`,
      type: 'success',
    });

    setIsRecordPaymentOpen(false);
    setPaymentInvoice(null);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceObj = INITIAL_BUSINESS_SOURCES.find((s) => s.id === genSourceId);
    const chosenFolios = UNBILLED_FOLIOS_POOL.filter((f) => selectedUnbilledFolios.includes(f.id));
    const grossTotal = chosenFolios.reduce((sum, f) => sum + f.grossRevenue, 0);

    const newInvoice: CorporateInvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-08${Math.floor(Math.random() * 80 + 50)}`,
      invoiceType: genInvoiceType,
      businessSourceId: genSourceId,
      businessSourceName: sourceObj?.name || 'Corporate Partner',
      businessSourceAcct: `AR-${sourceObj?.shortName || 'CORP'}-099`,
      sourceInitials: sourceObj?.initials || 'CP',
      sourceBgColor: sourceObj?.badgeBgColor || '#4472C4',
      invoiceDate: WORKING_DATE,
      dueDate: '29-Jul-2026',
      billingCycle: 'Cycle #06 Reconciled',
      taxRegistrationNumber: 'US-EIN-94-2810948',
      terms: genTerms,
      postedAmount: grossTotal || 5200.0,
      receivedAmount: 0,
      balanceDue: grossTotal || 5200.0,
      status: 'PARTIAL',
      folios: chosenFolios.length > 0 ? chosenFolios : [UNBILLED_FOLIOS_POOL[0]],
      payments: [],
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    addToast({
      title: 'Master Invoice Generated',
      message: `${newInvoice.invoiceNumber} created with ${newInvoice.folios.length} folios.`,
      type: 'success',
    });
    setIsGenerateInvoiceOpen(false);
  };

  const handlePrintInvoice = (inv: CorporateInvoiceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToast({
      title: 'Invoice Statement Ready',
      message: `Generated printable PDF voucher for ${inv.invoiceNumber}.`,
      type: 'info',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Business Source', 'Type', 'Invoice Date', 'Due Date', 'Posted Amount', 'Received Amount', 'Balance Due', 'Status'];
    const rows = filteredInvoices.map((inv) => [
      `"${inv.invoiceNumber}"`,
      `"${inv.businessSourceName.replace(/"/g, '""')}"`,
      `"${inv.invoiceType}"`,
      `"${inv.invoiceDate}"`,
      `"${inv.dueDate}"`,
      inv.postedAmount,
      inv.receivedAmount,
      inv.balanceDue,
      inv.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Corporate_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      title: 'Export Generated',
      message: 'Downloaded Invoices data table in CSV format.',
      type: 'info',
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Content Canvas */}
      <div className="px-lg py-md flex flex-col gap-lg max-w-[1720px] mx-auto w-full">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-xs font-body-sm text-on-surface-variant">
            <span onClick={() => navigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">
              Billing & Settlement
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span onClick={() => onNavigateToTab?.('business-source')} className="hover:text-on-surface transition-colors cursor-pointer">
              Business Channels
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-semibold text-[#4472C4]">Corporate Master Invoices</span>
          </div>
          <span className="font-data-mono text-[12px] text-on-surface-variant bg-surface-container-low px-sm py-0.5 rounded border border-outline-variant/30">
            Current PMS Ledger: {WORKING_DATE}
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Channel & Corporate Invoices
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Consolidated city ledger settlement, OTA reconciliation, and master corporate billing folios.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-xs px-md py-base bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase rounded transition-colors shadow-sm cursor-pointer border border-outline-variant/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Export Invoices CSV
            </button>
            <button
              onClick={() => setIsGenerateInvoiceOpen(true)}
              className="inline-flex items-center gap-xs px-md py-base bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase rounded transition-colors shadow-sm cursor-pointer active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              + Generate Master Invoice
            </button>
          </div>
        </div>

        {/* Financial Summary KPI Bento Grid (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {/* Card 1: Total Invoiced */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Total Invoiced</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">request_quote</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold">
                ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-label-uppercase text-[11px] text-on-surface-variant bg-surface-container px-xs py-0.5 rounded">
                {invoices.length} Master Invoices
              </span>
            </div>
          </div>

          {/* Card 2: Total Collected */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Total Collected</span>
              <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold text-[#059669]">
                ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-body-sm text-[12px] text-[#059669] font-semibold">
                {recoveryRate}% Recovery Rate
              </span>
            </div>
          </div>

          {/* Card 3: Outstanding Balance */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Outstanding Balance</span>
              <div className="w-8 h-8 rounded-lg bg-[#4472C4]/15 flex items-center justify-center text-[#4472C4]">
                <span className="material-symbols-outlined text-[20px]">pending</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold text-[#4472C4]">
                ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-body-sm text-[12px] text-on-surface-variant">3 Accounts Pending</span>
            </div>
          </div>

          {/* Card 4: Overdue Invoices */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant font-semibold">Overdue Invoices</span>
              <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>
            <div className="mt-md flex items-baseline justify-between">
              <span className="font-data-mono text-headline-md text-on-surface font-bold text-error">
                ${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-label-uppercase text-[11px] text-error font-semibold bg-error-container/60 px-xs py-0.5 rounded">
                Booking.com 7d Late
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
                placeholder="Search by invoice #, corporate partner, or tax ID..."
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

            <div className="relative">
              <select
                className="appearance-none bg-surface-container-low px-md py-xs pr-xl rounded text-body-sm text-on-surface outline-none cursor-pointer border border-transparent focus:border-[#4472C4]"
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
              >
                <option value="All Types">All Types</option>
                <option value="Corporate Master">Corporate Master</option>
                <option value="OTA Net Comm">OTA Net Comm</option>
                <option value="OTA Merchant">OTA Merchant</option>
                <option value="Group Banquet">Group Banquet</option>
              </select>
              <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
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
              type="button"
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setStatusSegment('pending')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'pending'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Partial / Pending (2)
            </button>
            <button
              onClick={() => setStatusSegment('paid')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'paid'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Paid (2)
            </button>
            <button
              onClick={() => setStatusSegment('overdue')}
              className={`px-md py-xs rounded font-label-uppercase text-label-uppercase transition-colors cursor-pointer ${
                statusSegment === 'overdue'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Overdue (1)
            </button>
          </div>
        </div>

        {/* Master Invoices Data Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <th className="px-md py-sm">Invoice #</th>
                  <th className="px-md py-sm">Business Source</th>
                  <th className="px-md py-sm">Invoice Date</th>
                  <th className="px-md py-sm">Due Date</th>
                  <th className="px-md py-sm">Posted Amount</th>
                  <th className="px-md py-sm">Received</th>
                  <th className="px-md py-sm">Balance Due</th>
                  <th className="px-md py-sm">Status</th>
                  <th className="px-md py-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 font-body-sm">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-md py-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
                        <span className="font-semibold text-body-md">No invoices match your active filters.</span>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedTypeFilter('All Types');
                            setStatusSegment('all');
                          }}
                          className="text-[12px] text-[#4472C4] font-semibold hover:underline mt-xs"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isSelected = isDetailDrawerOpen && selectedInvoiceId === inv.id;

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => openDetailDrawer(inv, 'folios')}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#4472C4]/10' : ''
                        }`}
                      >
                        <td className="px-md py-md">
                          <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-[18px] text-[#4472C4]">receipt</span>
                            <div className="flex flex-col">
                              <span className="font-data-mono font-bold text-on-surface">{inv.invoiceNumber}</span>
                              <span className="text-[11px] text-on-surface-variant">{inv.invoiceType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-md py-md">
                          <div className="flex items-center gap-sm">
                            <div
                              className="w-7 h-7 rounded text-white font-headline-md font-bold text-[11px] flex items-center justify-center shrink-0"
                              style={{ backgroundColor: inv.sourceBgColor || '#4472C4' }}
                            >
                              {inv.sourceInitials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-on-surface">{inv.businessSourceName}</span>
                              <span className="font-data-mono text-[11px] text-on-surface-variant">{inv.businessSourceAcct}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-md py-md font-data-mono text-on-surface-variant">{inv.invoiceDate}</td>
                        <td className="px-md py-md font-data-mono text-on-surface">
                          <div className="flex flex-col">
                            <span>{inv.dueDate}</span>
                            {inv.overdueDays && (
                              <span className="text-[10px] font-label-uppercase text-error font-semibold">
                                {inv.overdueDays}d Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-md py-md font-data-mono font-medium text-on-surface">
                          ${inv.postedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-md font-data-mono text-[#059669] font-medium">
                          ${inv.receivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-md font-data-mono font-bold text-on-surface">
                          ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-md">
                          <span
                            className={`inline-flex items-center px-sm py-0.5 rounded text-[11px] font-label-uppercase font-semibold ${
                              inv.status === 'PAID'
                                ? 'bg-[#059669]/10 text-[#059669]'
                                : inv.status === 'OVERDUE'
                                ? 'bg-error-container text-error'
                                : 'bg-[#4472C4]/10 text-[#4472C4]'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-md py-md text-right">
                          <div
                            className="inline-flex items-center gap-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openDetailDrawer(inv, 'folios')}
                              className="p-xs text-on-surface-variant hover:text-[#4472C4] hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                              title="View Folio Line Items"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">list_alt</span>
                            </button>
                            {inv.balanceDue > 0 && (
                              <button
                                onClick={(e) => handleOpenRecordPayment(inv, e)}
                                className="p-xs text-on-surface-variant hover:text-[#059669] hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                                title="Post Direct Payment"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">add_card</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => handlePrintInvoice(inv, e)}
                              className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors cursor-pointer"
                              title="Print Invoice Statement"
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

          {/* Table Footer Summary */}
          <div className="bg-surface-container-low px-md py-sm flex flex-col sm:flex-row items-center justify-between gap-sm text-body-sm text-on-surface-variant border-t border-outline-variant/30">
            <span className="font-data-mono text-[12px]">
              Showing {filteredInvoices.length} of {invoices.length} Master Accounts
            </span>
            <div className="flex items-center gap-md">
              <span className="text-[12px]">
                Net Outstanding Exposure:{' '}
                <strong className="font-data-mono text-on-surface">
                  ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer: Invoice Details with Folios & Payments Tabs */}
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
                    {activeInvoice.status}
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                  {activeInvoice.businessSourceName} • {activeInvoice.terms}
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
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Posted Revenue</span>
                  <span className="font-data-mono text-title-sm font-bold text-on-surface">
                    ${activeInvoice.postedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Paid / Cleared</span>
                  <span className="font-data-mono text-title-sm font-bold text-[#059669]">
                    ${activeInvoice.receivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-[11px] text-on-surface-variant font-medium">Balance Due</span>
                  <span className="font-data-mono text-title-sm font-bold text-on-surface">
                    ${activeInvoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs: Folios vs Payments */}
              <div className="flex items-center gap-md border-b border-outline-variant/30 mt-md pt-xs">
                <button
                  onClick={() => setDrawerActiveTab('folios')}
                  className={`pb-xs font-label-uppercase text-label-uppercase flex items-center gap-xs cursor-pointer border-b-2 transition-colors ${
                    drawerActiveTab === 'folios'
                      ? 'border-[#4472C4] text-[#4472C4] font-semibold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Consolidated Folios ({activeInvoice.folios.length})
                </button>
                <button
                  onClick={() => setDrawerActiveTab('payments')}
                  className={`pb-xs font-label-uppercase text-label-uppercase flex items-center gap-xs cursor-pointer border-b-2 transition-colors ${
                    drawerActiveTab === 'payments'
                      ? 'border-[#4472C4] text-[#4472C4] font-semibold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Remittance Records ({activeInvoice.payments.length})
                </button>
              </div>
            </div>

            {/* Drawer Body Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-lg py-md space-y-md">
              {drawerActiveTab === 'folios' && (
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Itemized reservation folios billed under this master commercial voucher.
                    </span>
                  </div>

                  {activeInvoice.folios.length === 0 ? (
                    <div className="p-lg bg-surface-container-low rounded-xl text-center text-on-surface-variant text-body-sm">
                      No individual folios mapped directly to this historical ledger.
                    </div>
                  ) : (
                    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-[11px] border-b border-outline-variant/30">
                            <th className="px-md py-xs">Reservation & Guest</th>
                            <th className="px-md py-xs">Stay Dates</th>
                            <th className="px-md py-xs">Room</th>
                            <th className="px-md py-xs">Rate Plan</th>
                            <th className="px-md py-xs text-right">Gross Total</th>
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
                              <td className="px-md py-sm font-data-mono text-on-surface-variant text-[12px]">
                                {folio.stayPeriod} ({folio.nights}n)
                              </td>
                              <td className="px-md py-sm">
                                <span className="font-data-mono font-medium text-on-surface">{folio.roomNumber}</span>{' '}
                                <span className="text-[11px] text-on-surface-variant">({folio.roomType})</span>
                              </td>
                              <td className="px-md py-sm font-data-mono text-[11px] text-on-surface-variant">
                                {folio.rateCode}
                              </td>
                              <td className="px-md py-sm text-right font-data-mono font-bold text-on-surface">
                                ${folio.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {drawerActiveTab === 'payments' && (
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Direct bill receipts, checks, and wire remittances cleared by the accounts desk.
                    </span>
                    {activeInvoice.balanceDue > 0 && (
                      <button
                        onClick={() => handleOpenRecordPayment(activeInvoice)}
                        className="inline-flex items-center gap-xs px-sm py-xs bg-[#059669] hover:bg-[#047857] text-white font-label-uppercase text-[11px] rounded transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_card</span>
                        Record Payment
                      </button>
                    )}
                  </div>

                  {activeInvoice.payments.length === 0 ? (
                    <div className="p-lg bg-surface-container-low rounded-xl text-center text-on-surface-variant text-body-sm">
                      No payments recorded yet for this invoice.
                    </div>
                  ) : (
                    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-[11px] border-b border-outline-variant/30">
                            <th className="px-md py-xs">Payment Method</th>
                            <th className="px-md py-xs">Receipt / Ref #</th>
                            <th className="px-md py-xs">Date</th>
                            <th className="px-md py-xs">Status</th>
                            <th className="px-md py-xs text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container/60 font-body-sm text-[13px]">
                          {activeInvoice.payments.map((pay) => (
                            <tr key={pay.id} className="hover:bg-surface-container-lowest">
                              <td className="px-md py-sm">
                                <span className="font-semibold text-on-surface">{pay.method}</span>
                              </td>
                              <td className="px-md py-sm font-data-mono text-[11px] text-on-surface-variant">
                                {pay.receiptNumber}
                                <div className="text-[10px] text-outline truncate max-w-xs">{pay.referenceNote}</div>
                              </td>
                              <td className="px-md py-sm font-data-mono text-on-surface-variant text-[12px]">
                                {pay.paymentDate}
                              </td>
                              <td className="px-md py-sm">
                                <span className="inline-flex items-center px-xs py-0.5 rounded text-[10px] font-label-uppercase bg-[#059669]/10 text-[#059669] font-semibold">
                                  {pay.status}
                                </span>
                              </td>
                              <td className="px-md py-sm text-right font-data-mono font-bold text-[#059669]">
                                ${pay.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                onClick={(e) => handlePrintInvoice(activeInvoice, e)}
                className="inline-flex items-center gap-xs px-md py-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Master Voucher
              </button>
              <div className="flex items-center gap-sm">
                {activeInvoice.balanceDue > 0 && (
                  <button
                    onClick={() => handleOpenRecordPayment(activeInvoice)}
                    className="inline-flex items-center gap-xs px-md py-sm bg-[#059669] hover:bg-[#047857] text-white font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_card</span>
                    Post Payment
                  </button>
                )}
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="px-md py-sm bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase rounded transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-xs p-md">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-[#059669] font-semibold">Remittance Posting</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Record Payment: {paymentInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-md">
              <div className="bg-surface-container-low p-sm rounded-lg flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Current Balance Due:</span>
                <span className="font-data-mono font-bold text-title-sm text-on-surface">
                  ${paymentInvoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-surface-container-low px-md py-xs rounded text-body-md font-data-mono font-semibold text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Payment Method *</label>
                  <select
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="Corporate Wire Clearing">Corporate Wire Clearing</option>
                    <option value="ACH / Fedwire Direct">ACH / Fedwire Direct</option>
                    <option value="Commercial Card Auth">Commercial Card Auth</option>
                    <option value="Corporate Cashier Check">Corporate Cashier Check</option>
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Posting Date *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm font-data-mono text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Transaction / Bank Reference</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. TXN-WIRE-99201"
                />
              </div>

              <div className="flex items-center justify-end gap-sm pt-xs border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-label-uppercase text-label-uppercase shadow-sm cursor-pointer"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Master Invoice Modal */}
      {isGenerateInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-xs p-md">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-xl shadow-2xl p-lg flex flex-col gap-md border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
              <div className="flex flex-col">
                <span className="font-label-uppercase text-[11px] text-[#4472C4] font-semibold">Ledger Consolidation</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Generate Master Corporate Invoice
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateInvoiceOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Business Source Account *</label>
                  <select
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={genSourceId}
                    onChange={(e) => setGenSourceId(e.target.value)}
                  >
                    {INITIAL_BUSINESS_SOURCES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Invoice Type</label>
                  <select
                    className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                    value={genInvoiceType}
                    onChange={(e) => setGenInvoiceType(e.target.value as any)}
                  >
                    <option value="Corporate Master">Corporate Master</option>
                    <option value="OTA Net Comm">OTA Net Comm</option>
                    <option value="OTA Merchant">OTA Merchant</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">Billing Terms</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low px-md py-xs rounded text-body-sm text-on-surface outline-none border border-outline-variant/40 focus:border-[#4472C4]"
                  value={genTerms}
                  onChange={(e) => setGenTerms(e.target.value)}
                />
              </div>

              {/* Unbilled Folios Selector */}
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-uppercase text-label-uppercase text-on-surface font-semibold">
                    Select Unbilled Guest Folios ({selectedUnbilledFolios.length} Selected)
                  </label>
                  <span className="text-[11px] text-[#4472C4] font-medium">Ready for batch billing</span>
                </div>
                <div className="space-y-xs max-h-48 overflow-y-auto bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
                  {UNBILLED_FOLIOS_POOL.map((fol) => {
                    const isChecked = selectedUnbilledFolios.includes(fol.id);
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
                                setSelectedUnbilledFolios((prev) => [...prev, fol.id]);
                              } else {
                                setSelectedUnbilledFolios((prev) => prev.filter((id) => id !== fol.id));
                              }
                            }}
                          />
                          <div className="flex flex-col text-[12px]">
                            <span className="font-semibold text-on-surface">{fol.guestName}</span>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">
                              {fol.reservationId} • Room {fol.roomNumber} ({fol.stayPeriod})
                            </span>
                          </div>
                        </div>
                        <span className="font-data-mono font-bold text-[12px] text-on-surface">
                          ${fol.grossRevenue.toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-sm pt-xs border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsGenerateInvoiceOpen(false)}
                  className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase text-label-uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm rounded-lg bg-[#4472C4] hover:bg-[#3b63ab] text-white font-label-uppercase text-label-uppercase shadow-sm cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
