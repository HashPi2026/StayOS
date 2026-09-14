import React, { useState } from 'react';
import { CommercialContact, ContactCategory } from './types';
import { CommercialContactModal } from './CommercialContactModal';
import { ManageCategoriesModal } from './ManageCategoriesModal';

interface ContactsDirectoryScreenProps {
  contacts: CommercialContact[];
  categories: ContactCategory[];
  onSaveContact: (contact: CommercialContact) => void;
  onDeleteContact: (contactId: string) => void;
  onSaveCategory: (cat: ContactCategory) => void;
  onDeleteCategory: (catId: string) => void;
  onOpenHub: () => void;
}

export const ContactsDirectoryScreen: React.FC<ContactsDirectoryScreenProps> = ({
  contacts,
  categories,
  onSaveContact,
  onDeleteContact,
  onSaveCategory,
  onDeleteCategory,
  onOpenHub,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CommercialContact | null>(null);

  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  const filteredContacts = contacts.filter((item) => {
    const q = searchQuery.toLowerCase();
    const accountName = item.accountName || item.associatedCompany || item.fullName || '';
    const legalName = item.legalEntityName || item.associatedCompany || '';
    const contactPerson = item.contactPerson || item.fullName || item.accountManager || '';
    const phone = item.phone || item.contacts?.[0]?.phone || '';
    const email = item.email || item.contacts?.[0]?.email || '';
    const taxId = item.taxId || item.taxPin || '';

    const matchesSearch =
      !q ||
      accountName.toLowerCase().includes(q) ||
      legalName.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      contactPerson.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      phone.includes(q) ||
      taxId.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedCategoryFilter !== 'all' && item.categoryId !== selectedCategoryFilter) {
      return false;
    }

    return true;
  });

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

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
              <span className="text-slate-800 font-semibold">Contacts (Commercial Directory)</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Contacts — Commercial Directory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                B2B Corporate & Intermediaries
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCategoriesModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">category</span>
            Manage Categories
          </button>

          <button
            onClick={() => {
              setEditingContact(null);
              setContactModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            + Add Commercial Contact
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Commercial Accounts
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {contacts.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            100% Active Ledgers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Direct Billing
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {contacts.filter((c) => c.allowDirectBilling).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">City Ledger Authorized</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Credit Extended
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ${contacts.reduce((acc, c) => acc + (c.creditLimit || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across approved accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Categories
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {categories.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Configured classifications</div>
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
              placeholder="Search by Account Name, Person, Phone, Tax ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategoryFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({contacts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Account & Legal Entity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Primary Representative</th>
                <th className="py-3 px-4">Credit Terms & Billing</th>
                <th className="py-3 px-4">Tax / VAT ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredContacts.map((contact) => {
                const category = getCategory(contact.categoryId);
                const acctName = contact.accountName || contact.associatedCompany || contact.fullName || 'Unnamed Account';
                const legalName = contact.legalEntityName || contact.associatedCompany || acctName;
                const contactRep = contact.contactPerson || contact.fullName || contact.accountManager || 'Representative';
                const phoneNum = contact.phone || contact.contacts?.[0]?.phone || '—';
                const taxVal = contact.taxId || contact.taxPin || '—';
                const credLimit = contact.creditLimit ?? 50000;
                const payTerms = contact.paymentTerms || 'Net 30 Days';

                return (
                  <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                          {acctName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{acctName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {contact.id} • {legalName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {category?.name || contact.categoryName || 'Commercial Account'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{contactRep}</div>
                      <div className="text-[11px] text-slate-500">{contact.designation || 'Corporate Lead'}</div>
                      <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                        {phoneNum}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        ${credLimit.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500">{payTerms}</div>
                      {(contact.allowDirectBilling ?? true) && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          City Ledger Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {taxVal}
                    </td>

                    <td className="py-3 px-4">
                      {contact.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="material-symbols-outlined text-[11px]">check_circle</span>
                          Active
                        </span>
                      ) : contact.status === 'under_review' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                          <span className="material-symbols-outlined text-[11px]">pending</span>
                          Under Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="material-symbols-outlined text-[11px]">block</span>
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingContact(contact);
                            setContactModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete commercial account ${contact.accountName}?`)) {
                              onDeleteContact(contact.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete account"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
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

      {/* Modals */}
      <CommercialContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        contact={editingContact}
        categories={categories}
        onSave={onSaveContact}
      />

      <ManageCategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        categories={categories}
        onSaveCategory={onSaveCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
};
