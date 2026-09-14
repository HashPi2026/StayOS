import React, { useState } from 'react';
import { ContactCategory } from './types';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ContactCategory[];
  onSaveCategory: (cat: ContactCategory) => void;
  onDeleteCategory: (catId: string) => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<ContactCategory | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [formCategory, setFormCategory] = useState<ContactCategory>({
    id: '',
    code: '',
    name: '',
    description: '',
    defaultPaymentTerms: 'Net 30 Days',
    defaultCreditLimit: 25000,
    allowDirectBilling: true,
    accountCount: 0,
    isActive: true,
  });

  if (!isOpen) return null;

  const startEdit = (cat: ContactCategory) => {
    setEditingCategory(cat);
    setIsCreatingNew(false);
    setFormCategory(cat);
  };

  const startCreate = () => {
    setEditingCategory(null);
    setIsCreatingNew(true);
    setFormCategory({
      id: `CAT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      code: 'CAT-NEW',
      name: '',
      description: '',
      defaultPaymentTerms: 'Net 30 Days',
      defaultCreditLimit: 15000,
      allowDirectBilling: true,
      accountCount: 0,
      isActive: true,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory.name || !formCategory.code) {
      alert('Category Name and Code are required.');
      return;
    }
    onSaveCategory(formCategory);
    setEditingCategory(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Manage Contact Categories & Credit Policies
              </h2>
              <p className="text-xs text-slate-500">
                Configure commercial account classifications, default payment terms, and direct billing ceilings.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* If Editing or Creating New (Screen 2: Category Edit Form) */}
          {(editingCategory || isCreatingNew) ? (
            <form onSubmit={handleFormSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">edit</span>
                  {isCreatingNew ? 'Create New Category Definition' : `Edit Category: ${editingCategory?.name}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formCategory.name}
                    onChange={(e) => setFormCategory({ ...formCategory, name: e.target.value })}
                    placeholder="e.g. Event & MICE Planners"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Category Code *</label>
                  <input
                    type="text"
                    required
                    value={formCategory.code}
                    onChange={(e) => setFormCategory({ ...formCategory, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CAT-MICE"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Description</label>
                  <input
                    type="text"
                    value={formCategory.description}
                    onChange={(e) => setFormCategory({ ...formCategory, description: e.target.value })}
                    placeholder="Meeting, incentive, conference, and exhibition organizers."
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Default Payment Terms</label>
                  <select
                    value={formCategory.defaultPaymentTerms}
                    onChange={(e) => setFormCategory({ ...formCategory, defaultPaymentTerms: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-700">Default Credit Ceiling ($)</label>
                  <input
                    type="number"
                    value={formCategory.defaultCreditLimit}
                    onChange={(e) => setFormCategory({ ...formCategory, defaultCreditLimit: Number(e.target.value) })}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formCategory.allowDirectBilling}
                      onChange={(e) => setFormCategory({ ...formCategory, allowDirectBilling: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Allow Direct Billing (City Ledger Invoicing) by default</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formCategory.isActive}
                      onChange={(e) => setFormCategory({ ...formCategory, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Category Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Category
                </button>
              </div>
            </form>
          ) : (
            /* Screen 1: Master Categories List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Active Commercial Classifications ({categories.length})
                </span>
                <button
                  type="button"
                  onClick={startCreate}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  + Create Category
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Category & Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Default Terms</th>
                      <th className="py-2.5 px-3">Credit Limit</th>
                      <th className="py-2.5 px-3">Accounts</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {categories.map((cat) => {
                      const codeVal = cat.code || `CAT-${cat.id.replace('cat-', '').toUpperCase()}`;
                      const termsVal = cat.defaultPaymentTerms || cat.defaultCreditTerms || 'Net 30 Days';
                      const creditLimitVal = cat.defaultCreditLimit ?? 25000;
                      const accountsVal = cat.accountCount ?? cat.linkedAccountsCount ?? 0;

                      return (
                        <tr key={cat.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{cat.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{codeVal}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 max-w-[180px] truncate">
                            {cat.description}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            {termsVal}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            ${creditLimitVal.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {accountsVal}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(cat)}
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (accountsVal > 0) {
                                    alert(`Cannot delete ${cat.name}: ${accountsVal} active accounts are bound to this category.`);
                                    return;
                                  }
                                  if (window.confirm(`Delete category ${cat.name}?`)) {
                                    onDeleteCategory(cat.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete category"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
            City Ledger Policies Synchronized
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
