import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import { FolioNumberingItem } from '../../types';

export const FoliosTab: React.FC = () => {
  const { generalSettings, updateGeneralSettingsSection, addNotification } = useProperty();
  const folios = generalSettings.folios;

  // Fallback default numbering series if undefined
  const defaultSeries: FolioNumberingItem[] = [
    {
      id: 'guest-folio',
      documentType: 'Guest Folio',
      type: 'Automatic',
      prefix: 'FOL-',
      startValue: 10000,
      currentValue: 14592,
      icon: 'request_quote',
    },
    {
      id: 'group-folio',
      documentType: 'Group Folio',
      type: 'Automatic',
      prefix: 'GFOL-',
      startValue: 1000,
      currentValue: 1084,
      icon: 'groups',
    },
    {
      id: 'receipts',
      documentType: 'Receipts',
      type: 'Manual',
      prefix: 'RCPT-',
      startValue: 50000,
      currentValue: 54101,
      icon: 'receipt',
    },
    {
      id: 'invoices',
      documentType: 'Invoices',
      type: 'Automatic',
      prefix: 'INV-',
      startValue: 20000,
      currentValue: 21503,
      icon: 'inventory_2',
    },
    {
      id: 'cancellations',
      documentType: 'Cancellations',
      type: 'Automatic',
      prefix: 'CXL-',
      startValue: 100,
      currentValue: 342,
      icon: 'event_busy',
    },
  ];

  const seriesList = folios.numberingSeries && folios.numberingSeries.length > 0
    ? folios.numberingSeries
    : defaultSeries;

  const printOnCheckout = folios.printOnCheckout ?? true;
  const emailOnGeneration = folios.emailOnGeneration ?? true;
  const printReceiptsAutomatically = folios.printReceiptsAutomatically ?? false;
  const ccCorporateOnInvoice = folios.ccCorporateOnInvoice ?? true;

  // Modal state for editing a numbering sequence
  const [editingItem, setEditingItem] = useState<FolioNumberingItem | null>(null);
  const [editFormData, setEditFormData] = useState<{
    type: 'Automatic' | 'Manual';
    prefix: string;
    startValue: number;
    currentValue: number;
  }>({
    type: 'Automatic',
    prefix: '',
    startValue: 0,
    currentValue: 0,
  });

  const handleOpenEditModal = (item: FolioNumberingItem) => {
    setEditingItem(item);
    setEditFormData({
      type: item.type,
      prefix: item.prefix,
      startValue: item.startValue,
      currentValue: item.currentValue,
    });
  };

  const handleCloseEditModal = () => {
    setEditingItem(null);
  };

  const handleSaveSequence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedSeries = seriesList.map((item) => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          type: editFormData.type,
          prefix: editFormData.prefix,
          startValue: editFormData.startValue,
          currentValue: editFormData.currentValue,
        };
      }
      return item;
    });

    updateGeneralSettingsSection('folios', { numberingSeries: updatedSeries });
    addNotification(`Numbering sequence for ${editingItem.documentType} updated`, 'success');
    handleCloseEditModal();
  };

  const handleActionChange = (
    field: 'printOnCheckout' | 'emailOnGeneration' | 'printReceiptsAutomatically' | 'ccCorporateOnInvoice',
    value: boolean
  ) => {
    updateGeneralSettingsSection('folios', { [field]: value });
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-[28px] sm:text-[30px] font-bold text-[#191c1e] tracking-tight">
          Folio Settings
        </h1>
        <p className="text-[14px] text-[#45464d] max-w-2xl">
          Configure numbering sequences and automated actions for financial documents across your property.
        </p>
      </header>

      {/* Section 1: Numbering Series */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0058be] text-[24px]">123</span>
          <h2 className="text-[18px] font-semibold text-[#191c1e]">Numbering Series</h2>
        </div>
        <p className="text-[13px] text-[#45464d] mb-4">
          Define prefixes and sequences for all system-generated documents to maintain compliance and auditability.
        </p>

        <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#f7f9fb] border-b border-[#c6c6cd]/50">
                  <th className="px-6 py-3.5 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-3.5 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                    Prefix
                  </th>
                  <th className="px-6 py-3.5 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-right">
                    Start Value
                  </th>
                  <th className="px-6 py-3.5 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-right">
                    Current Value
                  </th>
                  <th className="px-6 py-3.5 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {seriesList.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-[#ffffff] hover:bg-[#f7f9fb] transition-colors group"
                  >
                    <td className="px-6 py-4 flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#45464d] text-[20px]">
                        {row.icon}
                      </span>
                      <span className="text-[14px] font-semibold text-[#191c1e]">
                        {row.documentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px]">
                      {row.type === 'Automatic' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-[#0058be]/10 text-[#0058be] text-[11px] font-semibold uppercase tracking-wider">
                          Automatic
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-[#eceef0] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider">
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-[13px]">
                      <span className={row.type === 'Manual' ? 'text-[#76777d]' : 'text-[#191c1e]'}>
                        {row.prefix}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[13px] text-right">
                      <span className={row.type === 'Manual' ? 'text-[#76777d]' : 'text-[#191c1e]'}>
                        {row.startValue}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[13px] text-right font-medium">
                      <span className={row.type === 'Manual' ? 'text-[#45464d]' : 'text-[#0058be]'}>
                        {row.currentValue}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(row)}
                        className="p-1.5 rounded-full hover:bg-[#eceef0] text-[#76777d] hover:text-[#0058be] transition-colors inline-flex items-center justify-center"
                        title="Edit Sequence"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 2: Action Settings */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-t border-[#c6c6cd]/50 pt-8">
          <span className="material-symbols-outlined text-[#0058be] text-[24px]">bolt</span>
          <h2 className="text-[18px] font-semibold text-[#191c1e]">Action Settings</h2>
        </div>
        <p className="text-[13px] text-[#45464d] mb-4">
          Define automated workflows triggered by document generation to streamline operational efficiency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Group: Guest Folio */}
          <div className="bg-[#f7f9fb] p-6 rounded-xl border border-[#c6c6cd]/50 flex flex-col gap-4 shadow-xs">
            <h3 className="text-[15px] font-semibold text-[#191c1e] flex items-center gap-2 border-b border-[#c6c6cd]/30 pb-3">
              <span className="material-symbols-outlined text-[18px] text-[#0058be]">request_quote</span>
              Guest Folio
            </h3>

            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={printOnCheckout}
                  onChange={(e) => handleActionChange('printOnCheckout', e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-[#76777d] rounded checked:bg-[#0058be] checked:border-[#0058be] transition-colors cursor-pointer"
                />
                <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                  check
                </span>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                  Print on Checkout
                </div>
                <div className="text-[13px] text-[#45464d] mt-0.5">
                  Automatically open print dialog upon standard checkout.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={emailOnGeneration}
                  onChange={(e) => handleActionChange('emailOnGeneration', e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-[#76777d] rounded checked:bg-[#0058be] checked:border-[#0058be] transition-colors cursor-pointer"
                />
                <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                  check
                </span>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                  Email on Generation
                </div>
                <div className="text-[13px] text-[#45464d] mt-0.5">
                  Send PDF to guest email immediately upon finalizing folio.
                </div>
              </div>
            </label>
          </div>

          {/* Document Group: Invoices & Receipts */}
          <div className="bg-[#f7f9fb] p-6 rounded-xl border border-[#c6c6cd]/50 flex flex-col gap-4 shadow-xs">
            <h3 className="text-[15px] font-semibold text-[#191c1e] flex items-center gap-2 border-b border-[#c6c6cd]/30 pb-3">
              <span className="material-symbols-outlined text-[18px] text-[#0058be]">inventory_2</span>
              Invoices & Receipts
            </h3>

            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={printReceiptsAutomatically}
                  onChange={(e) => handleActionChange('printReceiptsAutomatically', e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-[#76777d] rounded checked:bg-[#0058be] checked:border-[#0058be] transition-colors cursor-pointer"
                />
                <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                  check
                </span>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                  Print Receipts Automatically
                </div>
                <div className="text-[13px] text-[#45464d] mt-0.5">
                  Trigger physical print when manual payments are posted.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={ccCorporateOnInvoice}
                  onChange={(e) => handleActionChange('ccCorporateOnInvoice', e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-[#76777d] rounded checked:bg-[#0058be] checked:border-[#0058be] transition-colors cursor-pointer"
                />
                <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                  check
                </span>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                  CC Corporate on Invoice
                </div>
                <div className="text-[13px] text-[#45464d] mt-0.5">
                  Automatically CC configured company accounts on invoice dispatches.
                </div>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Edit Sequence Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#ffffff] rounded-xl border border-[#c6c6cd] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[22px]">
                  {editingItem.icon}
                </span>
                <h3 className="text-[17px] font-semibold text-[#191c1e]">
                  Edit Sequence: {editingItem.documentType}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="p-1 rounded-lg hover:bg-[#eceef0] text-[#76777d] hover:text-[#191c1e] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSequence} className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                  Generation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFormData((prev) => ({ ...prev, type: 'Automatic' }))}
                    className={`py-2 px-3 rounded-lg text-[13px] font-semibold border transition-all ${
                      editFormData.type === 'Automatic'
                        ? 'bg-[#0058be]/10 border-[#0058be] text-[#0058be]'
                        : 'bg-[#f7f9fb] border-[#c6c6cd] text-[#45464d] hover:bg-[#eceef0]'
                    }`}
                  >
                    Automatic
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData((prev) => ({ ...prev, type: 'Manual' }))}
                    className={`py-2 px-3 rounded-lg text-[13px] font-semibold border transition-all ${
                      editFormData.type === 'Manual'
                        ? 'bg-[#0058be]/10 border-[#0058be] text-[#0058be]'
                        : 'bg-[#f7f9fb] border-[#c6c6cd] text-[#45464d] hover:bg-[#eceef0]'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.prefix}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, prefix: e.target.value }))}
                  placeholder="e.g. FOL-"
                  className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] font-mono outline-none focus:border-[#0058be]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                    Start Value
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editFormData.startValue}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        startValue: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] font-mono outline-none focus:border-[#0058be]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider block mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editFormData.currentValue}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        currentValue: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1e] font-mono outline-none focus:border-[#0058be]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#f2f4f6] rounded-lg border border-[#c6c6cd]/50 text-[12px] text-[#45464d]">
                <span className="font-semibold text-[#191c1e]">Sample Next Document ID: </span>
                <span className="font-mono text-[#0058be] font-bold">
                  {editFormData.prefix}
                  {editFormData.currentValue + 1}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#45464d] hover:bg-[#eceef0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold hover:bg-[#222222] transition-colors shadow-xs"
                >
                  Save Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
