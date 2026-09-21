import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { BatchFolioItem } from '../types';
import { INITIAL_BATCH_FOLIOS, PROPERTY_NAME, PROPERTY_SUBTITLE, WORKING_DATE } from '../mockData';

interface BatchFolioScreenProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const BatchFolioScreen: React.FC<BatchFolioScreenProps> = ({ onNavigateToScreen }) => {
  const { navigate } = useProperty();
  const [items, setItems] = useState<BatchFolioItem[]>(INITIAL_BATCH_FOLIOS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetDevice, setTargetDevice] = useState<string>('laser-02');
  const [previewFolioItem, setPreviewFolioItem] = useState<BatchFolioItem | null>(null);
  const [isEmailingModalOpen, setIsEmailingModalOpen] = useState(false);
  const [emailProgress, setEmailProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      if (filterCategory !== 'all' && i.stayCategory !== filterCategory) return false;
      if (filterStatus !== 'all' && i.dispatchStatus !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          i.guestName.toLowerCase().includes(q) ||
          i.resId.toLowerCase().includes(q) ||
          i.folioId.toLowerCase().includes(q) ||
          i.roomNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, filterCategory, filterStatus, searchQuery]);

  const handleToggleAll = (selectAll: boolean) => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: selectAll })));
    showToast(selectAll ? `All ${items.length} folios selected.` : 'Folio selection cleared.');
  };

  const handleSelectDueOutOnly = () => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        selected: i.stayCategory === 'Due Out',
      }))
    );
    showToast('Selected all Due Out reservations for batch processing.');
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handleStartEmailDispatch = () => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one folio to email.');
      return;
    }
    setIsEmailingModalOpen(true);
    setEmailProgress(10);
    const interval = setInterval(() => {
      setEmailProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsEmailingModalOpen(false);
            setItems((list) =>
              list.map((item) =>
                item.selected ? { ...item, dispatchStatus: 'Emailed', dispatchNote: 'Emailed Just Now' } : item
              )
            );
            showToast(`Batch email complete: ${selectedItems.length} guest statements dispatched!`);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handlePrintBatch = (type: 'reg' | 'folio' | 'detail') => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one reservation to print.');
      return;
    }
    const label =
      type === 'reg' ? 'Registration Cards' : type === 'folio' ? 'Guest Folios' : 'Detailed Tax Folios';
    showToast(`Spooling ${selectedItems.length} ${label} to ${targetDevice === 'laser-02' ? 'Laser #02' : 'Thermal'}...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Header & Breadcrumbs */}
      <div className="px-lg pt-lg pb-base flex flex-col gap-xs bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-xs text-body-sm text-on-surface-variant font-body-sm">
          <span onClick={() => navigate('dashboard')} className="hover:text-primary cursor-pointer transition-colors">Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span onClick={() => onNavigateToScreen ? onNavigateToScreen('search-reservation') : navigate('front-desk')} className="hover:text-primary cursor-pointer transition-colors">Front Desk</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Batch Folio</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mt-xs">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Batch Folio Operations
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Multi-select folios for bulk PDF generation, laser printer spooling, registration forms, and mass guest email dispatch.
            </p>
          </div>

          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container text-body-sm font-data-mono text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>SPOOLER IDLE</span>
            </div>
            <button
              onClick={() => showToast('Batch spool cache synchronized.')}
              className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Sync Spooler</span>
            </button>
          </div>
        </div>

        {/* Safe Operation Mode Callout Banner */}
        <div className="mt-xs p-sm bg-surface-container-low border border-surface-container rounded-lg flex items-center justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
            <span className="text-body-sm text-on-surface">
              Safe Batch Mode active: High-volume output verified against Property Working Date{' '}
              <strong className="font-semibold text-secondary font-data-mono">{WORKING_DATE}</strong>.
            </span>
          </div>
          <span className="text-label-uppercase font-label-uppercase text-[11px] text-on-surface-variant">
            ISO 27001 Certified Print Spool
          </span>
        </div>
      </div>

      {/* Filter Hub */}
      <div className="px-lg py-md flex flex-col gap-md">
        <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col lg:flex-row items-center justify-between gap-md">
          {/* Quick Category & Search Controls */}
          <div className="flex flex-wrap items-center gap-sm flex-1 w-full">
            <div className="relative flex items-center min-w-[260px] flex-1">
              <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full pl-xl pr-md py-xs bg-surface-container-low rounded-lg text-body-sm font-body-sm outline-none text-on-surface focus:bg-surface-container-lowest"
                placeholder="Search guest name, room, reservation ID, or folio #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Stay Category Selector */}
            <select
              className="px-md py-xs bg-surface-container-low rounded-lg text-body-sm text-on-surface outline-none cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Stay Categories</option>
              <option value="Due Out">Due Out Today (18)</option>
              <option value="In-House">In-House Active (58)</option>
              <option value="Due In">Due In Arrivals (14)</option>
            </select>

            {/* Dispatch Status */}
            <select
              className="px-md py-xs bg-surface-container-low rounded-lg text-body-sm text-on-surface outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Dispatch Statuses</option>
              <option value="Folio Generated">Folio Generated</option>
              <option value="Emailed">Emailed to Guest</option>
              <option value="Reg Form Ready">Reg Form Ready</option>
              <option value="Unprinted">Unprinted / Pending</option>
            </select>
          </div>

          {/* Mass Selection Quick Shortcuts */}
          <div className="flex items-center gap-xs shrink-0">
            <button
              onClick={() => handleToggleAll(true)}
              className="px-sm py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-body-sm font-medium transition-colors"
            >
              Select All ({items.length})
            </button>
            <button
              onClick={handleSelectDueOutOnly}
              className="px-sm py-xs bg-secondary-fixed text-on-secondary-fixed rounded text-body-sm font-semibold transition-colors"
            >
              Select Due Out (6)
            </button>
            <button
              onClick={() => handleToggleAll(false)}
              className="px-sm py-xs bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded text-body-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Dense Batch Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-body-sm font-body-sm text-on-surface border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-uppercase text-label-uppercase uppercase tracking-wider text-[11px] select-none">
                  <th className="py-sm px-md w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length && items.length > 0}
                      onChange={(e) => handleToggleAll(e.target.checked)}
                      className="rounded text-secondary focus:ring-secondary cursor-pointer"
                    />
                  </th>
                  <th className="py-sm px-md font-semibold">Res ID & Folio #</th>
                  <th className="py-sm px-md font-semibold">Guest Name & Email</th>
                  <th className="py-sm px-md font-semibold">Room & Category</th>
                  <th className="py-sm px-md font-semibold">Stay Range</th>
                  <th className="py-sm px-md font-semibold">Category</th>
                  <th className="py-sm px-md font-semibold text-right">Invoiced</th>
                  <th className="py-sm px-md font-semibold text-right">Balance Due</th>
                  <th className="py-sm px-md font-semibold">Dispatch Status</th>
                  <th className="py-sm px-md font-semibold text-center">Folio Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                      item.selected ? 'bg-secondary-fixed/20' : ''
                    }`}
                  >
                    <td className="py-sm px-md text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleItem(item.id)}
                        className="rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex flex-col font-data-mono">
                        <span className="font-semibold text-secondary">{item.resId}</span>
                        <span className="text-[11px] text-on-surface-variant">{item.folioId}</span>
                      </div>
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{item.guestName}</span>
                        <span className="text-[11px] text-on-surface-variant font-data-mono">{item.guestEmail}</span>
                      </div>
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex items-center gap-xs">
                        <span className="px-sm py-0.5 rounded bg-surface-container-highest font-data-mono font-bold text-on-surface">
                          {item.roomNumber}
                        </span>
                        <span className="text-body-sm font-semibold">{item.roomCategory}</span>
                      </div>
                    </td>

                    <td className="py-sm px-md font-data-mono text-[12px] text-on-surface">
                      {item.checkInDate} → {item.checkOutDate} ({item.nights}N)
                    </td>

                    <td className="py-sm px-md">
                      <span className="px-xs py-0.5 rounded bg-surface-container-high font-label-uppercase text-[11px] text-on-surface">
                        {item.stayCategory}
                      </span>
                    </td>

                    <td className="py-sm px-md font-data-mono text-right font-medium">
                      ${item.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-sm px-md font-data-mono text-right">
                      <span
                        className={`px-xs py-0.5 rounded text-[11px] font-semibold ${
                          item.balanceDue > 0
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        ${item.balanceDue.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-sm px-md">
                      <div className="flex flex-col">
                        <span
                          className={`px-sm py-0.5 rounded text-[11px] font-semibold inline-block w-fit ${
                            item.dispatchStatus === 'Emailed'
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : item.dispatchStatus === 'Folio Generated'
                              ? 'bg-surface-container-high text-secondary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {item.dispatchStatus}
                        </span>
                        {item.dispatchNote && (
                          <span className="text-[10px] text-on-surface-variant mt-0.5">{item.dispatchNote}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-sm px-md text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPreviewFolioItem(item)}
                        className="px-sm py-1 bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface rounded text-body-sm font-semibold transition-all flex items-center gap-xs mx-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        <span>Preview</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Dock (Pattern G) */}
      <div className="fixed bottom-0 inset-x-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container px-lg py-md z-40 flex flex-col sm:flex-row items-center justify-between gap-md shadow-2xl">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs px-md py-xs bg-secondary text-on-secondary rounded-lg font-semibold text-body-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            <span>{selectedItems.length} Reservations Staged</span>
          </div>

          <div className="flex items-center gap-xs text-body-sm text-on-surface-variant">
            <span className="font-label-uppercase text-[11px]">Target Device:</span>
            <select
              className="px-sm py-xs bg-surface-container rounded text-body-sm text-on-surface font-semibold outline-none cursor-pointer"
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
            >
              <option value="laser-02">Laser #02 (Front Desk Main)</option>
              <option value="thermal">Front Desk Thermal Slip Printer</option>
              <option value="archive">PDF Electronic Archive (No Print)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-sm flex-wrap justify-end">
          <button
            onClick={() => handlePrintBatch('reg')}
            className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-semibold text-body-sm shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Print Reg Forms</span>
          </button>

          <button
            onClick={() => handlePrintBatch('folio')}
            className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-semibold text-body-sm shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Folio</span>
          </button>

          <button
            onClick={() => handlePrintBatch('detail')}
            className="flex items-center gap-xs px-md py-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-semibold text-body-sm shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">receipt</span>
            <span>Print Detail Folio</span>
          </button>

          <button
            onClick={handleStartEmailDispatch}
            className="flex items-center gap-xs px-lg py-xs bg-primary text-on-primary hover:opacity-90 rounded-lg font-semibold text-body-sm shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
            <span>Bulk Email Folios</span>
          </button>
        </div>
      </div>

      {/* Folio PDF Output Preview Slide-Over Drawer */}
      {previewFolioItem && (
        <>
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setPreviewFolioItem(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[620px] bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">description</span>
                <span className="font-title-sm text-title-sm text-on-surface font-bold">
                  Print Preview: {previewFolioItem.folioId}
                </span>
              </div>
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => window.print()}
                  className="px-sm py-1 bg-secondary text-on-secondary rounded text-body-sm font-semibold flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPreviewFolioItem(null)}
                  className="p-xs text-on-surface-variant hover:text-on-surface rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Simulated Paper Folio */}
            <div className="flex-1 overflow-y-auto p-lg bg-surface-container/30 flex justify-center">
              <div className="bg-surface-container-lowest w-full shadow-lg rounded-sm p-xl flex flex-col gap-md text-on-surface border border-outline-variant/30 text-[13px] font-serif">
                {/* Hotel Letterhead */}
                <div className="flex items-start justify-between border-b border-surface-container pb-md font-sans">
                  <div>
                    <h2 className="font-bold text-[18px] text-on-surface tracking-wide">{PROPERTY_NAME}</h2>
                    <p className="text-[12px] text-on-surface-variant">{PROPERTY_SUBTITLE}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      100 Ocean Promenade • Grand Bay, FL 33139 • Tel: (305) 555-0100
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-data-mono">VAT/Tax ID: US-FL-881920491-A</p>
                  </div>
                  <div className="text-right">
                    <span className="px-sm py-1 bg-secondary-fixed text-on-secondary-fixed font-bold text-[12px] rounded uppercase tracking-wider block mb-1">
                      Official Guest Folio
                    </span>
                    <span className="font-data-mono font-bold text-on-surface block">{previewFolioItem.folioId}</span>
                    <span className="text-[11px] text-on-surface-variant font-data-mono">
                      Issued: {WORKING_DATE} 10:45
                    </span>
                  </div>
                </div>

                {/* Guest & Reservation Metadata */}
                <div className="grid grid-cols-2 gap-md font-sans text-body-sm border-b border-surface-container pb-md">
                  <div>
                    <span className="font-label-uppercase text-[10px] text-on-surface-variant uppercase block">
                      Guest Invoiced:
                    </span>
                    <strong className="text-on-surface text-[14px]">{previewFolioItem.guestName}</strong>
                    <p className="text-on-surface-variant text-[12px]">{previewFolioItem.guestEmail}</p>
                    <p className="text-on-surface-variant text-[11px] mt-1">Billing Direct: Individual Personal Card</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div>
                      <span className="text-on-surface-variant text-[11px]">Room Number: </span>
                      <strong className="font-data-mono text-secondary text-[14px]">
                        {previewFolioItem.roomNumber} ({previewFolioItem.roomCategory})
                      </strong>
                    </div>
                    <div>
                      <span className="text-on-surface-variant text-[11px]">Confirmation #: </span>
                      <span className="font-data-mono font-semibold">{previewFolioItem.resId}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant text-[11px]">Stay Window: </span>
                      <span className="font-data-mono text-[11px]">
                        {previewFolioItem.checkInDate} → {previewFolioItem.checkOutDate} ({previewFolioItem.nights} Nights)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Itemized Charge Line Items Table */}
                <div className="font-sans">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-surface-container font-semibold text-on-surface-variant uppercase text-[10px]">
                        <th className="py-1">Date</th>
                        <th className="py-1">Description / Voucher Ref</th>
                        <th className="py-1 text-right">Debit ($)</th>
                        <th className="py-1 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 font-data-mono">
                      <tr>
                        <td className="py-1.5">{previewFolioItem.checkInDate}-2026</td>
                        <td className="py-1.5 font-sans">Room Charge - Standard Contracted BAR</td>
                        <td className="py-1.5 text-right font-medium">
                          ${(previewFolioItem.totalAmount * 0.85).toFixed(2)}
                        </td>
                        <td className="py-1.5 text-right font-medium">$0.00</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">{previewFolioItem.checkInDate}-2026</td>
                        <td className="py-1.5 font-sans">Municipal Lodging Surcharge & State VAT (15%)</td>
                        <td className="py-1.5 text-right font-medium">
                          ${(previewFolioItem.totalAmount * 0.15).toFixed(2)}
                        </td>
                        <td className="py-1.5 text-right font-medium">$0.00</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">{WORKING_DATE}</td>
                        <td className="py-1.5 font-sans text-secondary font-semibold">
                          Pre-Authorized Electronic Visa Settlement (...8104)
                        </td>
                        <td className="py-1.5 text-right font-medium">$0.00</td>
                        <td className="py-1.5 text-right font-semibold text-secondary">
                          ${previewFolioItem.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Accounting Totals */}
                <div className="border-t border-surface-container pt-md font-sans flex justify-end">
                  <div className="w-64 space-y-1 text-right font-data-mono text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-sans">Net Taxable:</span>
                      <span>${(previewFolioItem.totalAmount * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-sans">VAT & Occupancy Tax:</span>
                      <span>${(previewFolioItem.totalAmount * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[14px] pt-1 border-t border-surface-container">
                      <span className="font-sans">Total Folio Invoiced:</span>
                      <span>${previewFolioItem.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-secondary text-[14px]">
                      <span className="font-sans">Total Payments Received:</span>
                      <span>-${previewFolioItem.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[15px] pt-1 border-t-2 border-surface-container text-on-surface">
                      <span className="font-sans uppercase">Balance Due:</span>
                      <span className="text-emerald-700">$0.00 USD</span>
                    </div>
                  </div>
                </div>

                {/* Folio Signoff Terms */}
                <div className="mt-md pt-md border-t border-surface-container font-sans text-[11px] text-on-surface-variant space-y-2">
                  <p>
                    I agree that my liability for this bill is not waived and agree to be held personally liable in the event
                    that the indicated person, company, or association fails to pay for any part of the full amount of these
                    charges.
                  </p>
                  <div className="flex justify-between pt-6 border-b border-surface-container pb-1">
                    <span>Guest Signature: _________________________________________</span>
                    <span>Date: {WORKING_DATE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Emailing Progress Simulation Modal */}
      {isEmailingModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-xl shadow-2xl p-lg flex flex-col items-center text-center gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-secondary text-[28px]">forward_to_inbox</span>
            </div>
            <div>
              <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                Dispatching Bulk Folio Statements
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Generating signed PDF attachments and sending via SendGrid to {selectedItems.length} guests...
              </p>
            </div>
            <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-300"
                style={{ width: `${emailProgress}%` }}
              ></div>
            </div>
            <span className="font-data-mono text-body-sm font-semibold text-secondary">{emailProgress}% Complete</span>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-lg right-lg z-50 bg-primary text-on-primary px-md py-sm rounded-lg shadow-xl flex items-center gap-sm animate-in fade-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          <span className="font-body-sm text-[13px]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
