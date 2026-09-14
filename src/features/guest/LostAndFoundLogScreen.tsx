import React, { useState } from 'react';
import { LostFoundItem } from './types';

interface LostAndFoundLogScreenProps {
  items: LostFoundItem[];
  onSaveItem: (item: LostFoundItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenHub: () => void;
}

export const LostAndFoundLogScreen: React.FC<LostAndFoundLogScreenProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onOpenHub,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'vault_open' | 'claim_pending' | 'returned' | 'disposed'>('all');

  // Modal / Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);

  // Form state
  const [formItem, setFormItem] = useState<LostFoundItem>({
    id: '',
    tagNumber: '',
    itemName: '',
    category: 'Electronics',
    description: '',
    foundDate: '2026-01-20',
    foundLocation: '',
    foundBy: '',
    department: 'Housekeeping',
    storageLocation: 'Secure Vault Locker A-12',
    status: 'vault_open',
    claimedBy: '',
    claimDate: '',
    disposalMethod: '',
    remarks: '',
  });

  const openNewItemDrawer = () => {
    const randomTag = `LF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setEditingItem(null);
    setFormItem({
      id: randomTag,
      tagNumber: randomTag,
      itemName: '',
      category: 'Electronics',
      description: '',
      foundDate: new Date().toISOString().split('T')[0],
      foundLocation: 'Suite ',
      foundBy: 'Staff Member',
      department: 'Housekeeping',
      storageLocation: 'Secure Vault Locker A-12',
      status: 'vault_open',
      claimedBy: '',
      claimDate: '',
      disposalMethod: '',
      remarks: 'Sealed in tamper-evident security bag.',
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: LostFoundItem) => {
    setEditingItem(item);
    setFormItem(item);
    setDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.itemName.trim() || !formItem.foundLocation.trim()) {
      alert('Item Name and Found Location are required.');
      return;
    }
    onSaveItem(formItem);
    setDrawerOpen(false);
  };

  const isItemStatus = (item: LostFoundItem, filter: string) => {
    if (filter === 'vault_open') return item.status === 'vault_open' || item.dispositionStatus === 'open';
    if (filter === 'claim_pending') return item.status === 'claim_pending';
    if (filter === 'returned') return item.status === 'returned' || item.dispositionStatus === 'returned';
    if (filter === 'disposed') return item.status === 'disposed' || item.dispositionStatus === 'discarded';
    return true;
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const tag = item.tagNumber || item.id || '';
    const name = item.itemName || '';
    const desc = item.description || item.characteristics || '';
    const location = item.foundLocation || item.locationFound || '';
    const finder = item.foundBy || item.reportedBy || '';
    const vault = item.storageLocation || item.storageVault || '';
    const guest = item.claimedBy || item.guestName || '';

    const matchesSearch =
      !q ||
      tag.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      location.toLowerCase().includes(q) ||
      finder.toLowerCase().includes(q) ||
      vault.toLowerCase().includes(q) ||
      guest.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter !== 'all') {
      return isItemStatus(item, activeFilter);
    }

    return true;
  });

  return (
    <div className="w-full flex flex-col space-y-5">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHub}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Return to Guest Hub"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>StayOS PMS</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Guest</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-800 font-semibold">Lost and Found</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Lost and Found Operational Log
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Property Custody Ledger
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Exporting Lost & Found Custody Ledger as CSV...')}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">download</span>
            Export Ledger
          </button>

          <button
            onClick={openNewItemDrawer}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            + Log Recovered Item
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Active Records
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{items.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Property custody chain</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Open in Safe Vault
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {items.filter((i) => isItemStatus(i, 'vault_open')).length} Units
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            Unclaimed in vault storage
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Claim Verification Pending
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {items.filter((i) => isItemStatus(i, 'claim_pending')).length}
          </div>
          <div className="text-[11px] text-blue-700 mt-1">Guest inquiry in review</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Returned to Owners
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {items.filter((i) => isItemStatus(i, 'returned')).length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">check</span>
            Successful restitution
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tag ID, Item, Room, Finder, or Guest..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeFilter === 'all'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('vault_open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeFilter === 'vault_open'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Vault Open ({items.filter((i) => isItemStatus(i, 'vault_open')).length})
            </button>
            <button
              onClick={() => setActiveFilter('claim_pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeFilter === 'claim_pending'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Claim Pending ({items.filter((i) => isItemStatus(i, 'claim_pending')).length})
            </button>
            <button
              onClick={() => setActiveFilter('returned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeFilter === 'returned'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Returned ({items.filter((i) => isItemStatus(i, 'returned')).length})
            </button>
            <button
              onClick={() => setActiveFilter('disposed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeFilter === 'disposed'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Disposed ({items.filter((i) => isItemStatus(i, 'disposed')).length})
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tag # & Category</th>
                <th className="py-3 px-4">Item & Specifications</th>
                <th className="py-3 px-4">Found Location & Room</th>
                <th className="py-3 px-4">Date & Finder</th>
                <th className="py-3 px-4">Vault Storage</th>
                <th className="py-3 px-4">Custody Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredItems.map((item) => {
                const tagVal = item.tagNumber || item.id;
                const descVal = item.description || item.characteristics || '';
                const locVal = item.foundLocation || item.locationFound || 'Hotel Premises';
                const dateVal = item.foundDate || item.dateLogged?.split(' ')[0] || '2026-09-14';
                const finderVal = item.foundBy || item.reportedBy || 'Staff Member';
                const deptVal = item.department || 'Operations';
                const vaultVal = item.storageLocation || item.storageVault || 'Secure Vault';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{tagVal}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.itemName}</div>
                      <div className="text-[11px] text-slate-500 max-w-[220px] truncate">
                        {descVal}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-amber-600">room</span>
                        {locVal}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{dateVal}</div>
                      <div className="text-[11px] text-slate-500">{finderVal} ({deptVal})</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                        {vaultVal}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isItemStatus(item, 'vault_open') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="material-symbols-outlined text-[11px]">inventory_2</span>
                          Vault Open
                        </span>
                      ) : isItemStatus(item, 'claim_pending') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="material-symbols-outlined text-[11px]">hourglass_top</span>
                          Claim Pending
                        </span>
                      ) : isItemStatus(item, 'returned') ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="material-symbols-outlined text-[11px]">check_circle</span>
                            Returned
                          </span>
                          {(item.claimedBy || item.guestName) && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                              To: {item.claimedBy || item.guestName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="material-symbols-outlined text-[11px]">delete_sweep</span>
                          Disposed / Donated
                        </span>
                      )}
                    </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openEditDrawer(item)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                      >
                        Inspect / Update
                      </button>
                      <button
                        onClick={() => alert(`Printing Chain of Custody Tag Barcode for ${item.tagNumber}...`)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Print Custody Tag"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Update Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">
                      inventory_2
                    </span>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {editingItem ? 'Update Custody Record' : 'Log Recovered Item'}
                    </h2>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-slate-200 text-slate-700">
                      {formItem.tagNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Property Safekeeping Chain of Custody
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Drawer Form Body */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Custody & Restitution Status
                  </label>
                  <select
                    value={formItem.status}
                    onChange={(e) => setFormItem({ ...formItem, status: e.target.value as any })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-bold text-slate-900"
                  >
                    <option value="vault_open">Vault Open (In Safekeeping)</option>
                    <option value="claim_pending">Claim Pending (Verification in progress)</option>
                    <option value="returned">Returned to Owner / Guest</option>
                    <option value="disposed">Disposed / Donated (Statutory clearance)</option>
                  </select>
                </div>

                {/* Conditional Claim / Return Details */}
                {formItem.status === 'returned' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <span className="text-xs font-bold text-emerald-950 block">Restitution Details</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-emerald-900">Claimant Name / Guest</label>
                        <input
                          type="text"
                          required
                          value={formItem.claimedBy || ''}
                          onChange={(e) => setFormItem({ ...formItem, claimedBy: e.target.value })}
                          placeholder="Dr. Elena Rostova-Hughes"
                          className="w-full h-8 px-2.5 text-xs bg-white border border-emerald-300 rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-emerald-900">Claim Date</label>
                        <input
                          type="date"
                          value={formItem.claimDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setFormItem({ ...formItem, claimDate: e.target.value })}
                          className="w-full h-8 px-2.5 text-xs bg-white border border-emerald-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Item Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                    Item Identification
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Item Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formItem.itemName}
                        onChange={(e) => setFormItem({ ...formItem, itemName: e.target.value })}
                        placeholder="e.g. Apple MacBook Pro 16&quot; (Space Black)"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Category</label>
                      <select
                        value={formItem.category}
                        onChange={(e) => setFormItem({ ...formItem, category: e.target.value as any })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Jewelry & Watches">Jewelry & Watches</option>
                        <option value="Documents & Wallets">Documents & Wallets</option>
                        <option value="Clothing & Apparel">Clothing & Apparel</option>
                        <option value="Keys & Cards">Keys & Cards</option>
                        <option value="Luggage & Bags">Luggage & Bags</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Vault / Storage Location</label>
                      <input
                        type="text"
                        value={formItem.storageLocation}
                        onChange={(e) => setFormItem({ ...formItem, storageLocation: e.target.value })}
                        placeholder="Secure Vault Locker A-12"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Detailed Description & Identifying Marks
                      </label>
                      <textarea
                        rows={2}
                        value={formItem.description}
                        onChange={(e) => setFormItem({ ...formItem, description: e.target.value })}
                        placeholder="Serial numbers, scratches, unique stickers, bag color, contents..."
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Discovery Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                    Discovery Circumstances
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Found Location / Room <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formItem.foundLocation}
                        onChange={(e) => setFormItem({ ...formItem, foundLocation: e.target.value })}
                        placeholder="Suite 1402 (Master Bedroom)"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Date Recovered</label>
                      <input
                        type="date"
                        value={formItem.foundDate}
                        onChange={(e) => setFormItem({ ...formItem, foundDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Found By (Staff / Guest)</label>
                      <input
                        type="text"
                        value={formItem.foundBy}
                        onChange={(e) => setFormItem({ ...formItem, foundBy: e.target.value })}
                        placeholder="Maria Gonzales"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Department</label>
                      <select
                        value={formItem.department}
                        onChange={(e) => setFormItem({ ...formItem, department: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                      >
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Front Desk">Front Desk</option>
                        <option value="Concierge">Concierge</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Security">Security</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Custody Remarks & Security Bag #</label>
                  <textarea
                    rows={2}
                    value={formItem.remarks}
                    onChange={(e) => setFormItem({ ...formItem, remarks: e.target.value })}
                    placeholder="Sealed bag number, supervisor sign-off, guest call back notes..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {editingItem ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete item record ${formItem.tagNumber}?`)) {
                          onDeleteItem(formItem.id);
                          setDrawerOpen(false);
                        }
                      }}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                    >
                      Delete Entry
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Record
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
