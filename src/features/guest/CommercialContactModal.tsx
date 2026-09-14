import React, { useState, useEffect } from 'react';
import { CommercialContact, ContactCategory } from './types';

interface CommercialContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: CommercialContact | null;
  categories: ContactCategory[];
  onSave: (contact: CommercialContact) => void;
}

export const CommercialContactModal: React.FC<CommercialContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  categories,
  onSave,
}) => {
  const isEditing = Boolean(contact && contact.id);

  const [formData, setFormData] = useState<CommercialContact>({
    id: contact?.id || `ACC-CORP-${Math.floor(1000 + Math.random() * 9000)}`,
    accountName: contact?.accountName || '',
    legalEntityName: contact?.legalEntityName || '',
    categoryId: contact?.categoryId || categories[0]?.id || 'cat-1',
    taxId: contact?.taxId || '',
    accountCode: contact?.accountCode || `CORP-${Math.floor(100 + Math.random() * 900)}`,
    contactPerson: contact?.contactPerson || '',
    designation: contact?.designation || '',
    phone: contact?.phone || '',
    email: contact?.email || '',
    secondaryPhone: contact?.secondaryPhone || '',
    creditLimit: contact?.creditLimit ?? 50000,
    paymentTerms: contact?.paymentTerms || 'Net 30 Days',
    allowDirectBilling: contact?.allowDirectBilling ?? true,
    currency: contact?.currency || 'USD',
    street: contact?.street || '',
    city: contact?.city || '',
    state: contact?.state || '',
    zip: contact?.zip || '',
    country: contact?.country || 'United States',
    corporateRateCode: contact?.corporateRateCode || '',
    contractStartDate: contact?.contractStartDate || '2026-01-01',
    contractEndDate: contact?.contractEndDate || '2026-12-31',
    remarks: contact?.remarks || '',
    status: contact?.status || 'active',
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        id: `ACC-CORP-${Math.floor(1000 + Math.random() * 9000)}`,
        accountName: '',
        legalEntityName: '',
        categoryId: categories[0]?.id || 'cat-1',
        taxId: '',
        accountCode: `CORP-${Math.floor(100 + Math.random() * 900)}`,
        contactPerson: '',
        designation: '',
        phone: '',
        email: '',
        secondaryPhone: '',
        creditLimit: 50000,
        paymentTerms: 'Net 30 Days',
        allowDirectBilling: true,
        currency: 'USD',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        corporateRateCode: '',
        contractStartDate: '2026-01-01',
        contractEndDate: '2026-12-31',
        remarks: '',
        status: 'active',
      });
    }
  }, [contact, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountName.trim() || !formData.contactPerson.trim()) {
      alert('Account Name and Primary Contact Person are required.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {isEditing ? `Edit Commercial Account: ${formData.accountName}` : 'Add New Commercial Contact'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 text-slate-700 rounded">
                  {formData.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Corporate clients, travel management agencies, and wholesale partners.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 01. Legal Entity & Classification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">domain</span>
              01. Legal Entity & Classification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Account Name / Trade Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g. Apex Global Logistics HQ"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Legal Entity Name</label>
                <input
                  type="text"
                  value={formData.legalEntityName}
                  onChange={(e) => setFormData({ ...formData, legalEntityName: e.target.value })}
                  placeholder="Apex Global Logistics Inc."
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Category Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Tax ID / VAT Registration</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="US-948291048"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 02. Primary Representative */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">person</span>
              02. Primary Representative & Communication
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Jonathan Drake"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Designation / Role</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Corporate Travel Director"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Direct Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (212) 555-0199"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jdrake@apexlogistics.com"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 03. Financial & Billing Arrangements */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
              03. Financial & Credit Arrangements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Approved Credit Ceiling ($)</label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Payment Terms</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 45 Days">Net 45 Days</option>
                  <option value="Prepayment Only">Prepayment Only</option>
                  <option value="Credit Card on File">Credit Card on File</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Contract Rate Code</label>
                <input
                  type="text"
                  value={formData.corporateRateCode}
                  onChange={(e) => setFormData({ ...formData, corporateRateCode: e.target.value.toUpperCase() })}
                  placeholder="CORP-APEX"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                />
              </div>

              <div className="col-span-3 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">receipt_long</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Direct Billing to City Ledger
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Authorizes front desk staff to post room and banquet charges directly to this company's accounts receivable.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowDirectBilling}
                    onChange={(e) => setFormData({ ...formData, allowDirectBilling: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 04. Corporate Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">location_on</span>
              04. Corporate Headquarters & Billing Address
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="block text-xs font-medium text-slate-700">Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="One World Trade Center, Suite 4800"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">State / Region</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 05. Account Status & Remarks */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="active">Active (Good Standing)</option>
                  <option value="under_review">Under Credit Review</option>
                  <option value="suspended">Suspended / Credit Hold</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Contract Period</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Operational Billing Instructions</label>
              <textarea
                rows={2}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Special billing instructions, room charge authorization limits, routing rules..."
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Save Commercial Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
