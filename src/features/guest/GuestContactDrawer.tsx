import React, { useState, useEffect } from 'react';
import { GuestContact, GuestRecord } from './types';

interface GuestContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestRecord;
  contact?: GuestContact | null;
  onSave: (contact: GuestContact) => void;
  onDelete?: (contactId: string) => void;
}

export const GuestContactDrawer: React.FC<GuestContactDrawerProps> = ({
  isOpen,
  onClose,
  guest,
  contact,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(contact && contact.id);

  const [formData, setFormData] = useState<GuestContact>({
    id: contact?.id || `CNT-${guest.id.replace('GST-', '')}-${String(guest.contacts.length + 1).padStart(2, '0')}`,
    isPrimary: contact ? contact.isPrimary : guest.contacts.length === 0,
    contactType: contact?.contactType || 'Mobile / Personal',
    phone: contact?.phone || '',
    countryCode: contact?.countryCode || '+1',
    email: contact?.email || '',
    folioDispatch: contact?.folioDispatch ?? true,
    addressType: contact?.addressType || 'Primary Residence',
    street: contact?.street || '',
    city: contact?.city || '',
    state: contact?.state || '',
    zip: contact?.zip || '',
    country: contact?.country || 'United States',
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        id: `CNT-${guest.id.replace('GST-', '')}-${String(guest.contacts.length + 1).padStart(2, '0')}`,
        isPrimary: guest.contacts.length === 0,
        contactType: 'Mobile / Personal',
        phone: '',
        countryCode: '+1',
        email: '',
        folioDispatch: true,
        addressType: 'Primary Residence',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
      });
    }
  }, [contact, guest]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone && !formData.email) {
      alert('Please provide at least a phone number or email address.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">
                  contact_phone
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {isEditing ? 'Edit Contact Channel' : 'Add Contact Channel'}
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-slate-200 text-slate-700">
                  {formData.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                  Scoped Entity: {guest.id}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {guest.title} {guest.firstName} {guest.lastName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Body Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Primary Toggle Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                formData.isPrimary
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      formData.isPrimary
                        ? 'bg-[#4472C4] text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">star</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">
                      Mark as Primary Contact
                    </span>
                    <span className="text-[12px] text-slate-500">
                      Designates this channel as the primary dispatch route for folios and alerts.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => {
                      if (!e.target.checked && isEditing && contact?.isPrimary) {
                        alert('A guest profile must have at least one primary contact channel.');
                        return;
                      }
                      setFormData({ ...formData, isPrimary: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4472C4]"></div>
                </label>
              </div>

              {formData.isPrimary && (
                <div className="mt-3 pt-3 border-t border-blue-100 flex items-start gap-2 text-[11px] text-blue-800 bg-blue-100/50 p-2.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-[#4472C4] shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    <strong>Primary Transfer Logic Active:</strong> Marking this channel as
                    Primary will automatically reassign primary dispatch priority from other channels.
                  </span>
                </div>
              )}
            </div>

            {/* Classification */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Contact Type / Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.contactType}
                onChange={(e) =>
                  setFormData({ ...formData, contactType: e.target.value as any })
                }
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-transparent font-medium text-slate-800"
              >
                <option value="Mobile / Personal">Mobile / Personal</option>
                <option value="Office / Executive Assistant">Office / Executive Assistant</option>
                <option value="Home">Home</option>
                <option value="Holiday / Alternate">Holiday / Alternate</option>
                <option value="Emergency Contact">Emergency Contact</option>
                <option value="Billing / Accounts">Billing / Accounts</option>
              </select>
            </div>

            {/* Communication Channels */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <span className="material-symbols-outlined text-[16px] text-[#4472C4]">call</span>
                Direct Dispatch Channels
              </h3>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-28 h-10 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] text-slate-700 font-mono"
                  >
                    <option value="+1">🇺🇸 +1 (US/CA)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+49">🇩🇪 +49 (DE)</option>
                    <option value="+33">🇫🇷 +33 (FR)</option>
                    <option value="+34">🇪🇸 +34 (ES)</option>
                    <option value="+81">🇯🇵 +81 (JP)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+91">🇮🇳 +91 (IN)</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (415) 890-2194"
                    className="flex-1 h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="elena.rostova@hughes-bio.com"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-800"
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="folioDispatch"
                    checked={formData.folioDispatch}
                    onChange={(e) =>
                      setFormData({ ...formData, folioDispatch: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#4472C4] focus:ring-[#4472C4] border-slate-300"
                  />
                  <label htmlFor="folioDispatch" className="text-xs text-slate-600 select-none">
                    Folio Dispatch Destination (Automated invoices & checkout receipts)
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#4472C4]">
                    home_pin
                  </span>
                  Physical / Billing Address
                </h3>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Address Cleared
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Address Classification
                  </label>
                  <select
                    value={formData.addressType}
                    onChange={(e) =>
                      setFormData({ ...formData, addressType: e.target.value as any })
                    }
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  >
                    <option value="Primary Residence">Primary Residence</option>
                    <option value="Billing Address">Billing Address</option>
                    <option value="Corporate HQ">Corporate HQ</option>
                    <option value="Mailing">Mailing</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="742 Montgomery St, Penthouse B"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">State / Region</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">ZIP / Postal</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="94111"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            {/* Safeguard Notice for Primary */}
            {isEditing && formData.isPrimary && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                  shield
                </span>
                <div>
                  <span className="font-semibold block">Cannot Delete Active Primary Contact</span>
                  <span className="text-[11px] text-amber-700 leading-relaxed">
                    System security requires at least one verified primary contact channel per guest profile. To delete this channel, promote an alternate channel to Primary first.
                  </span>
                </div>
              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {isEditing && onDelete ? (
                <button
                  type="button"
                  disabled={formData.isPrimary}
                  onClick={() => {
                    if (window.confirm(`Delete contact channel ${formData.id}?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    formData.isPrimary
                      ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                      : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                  }`}
                  title={formData.isPrimary ? 'Locked: Cannot delete active primary contact' : 'Delete contact'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {formData.isPrimary ? 'lock' : 'delete'}
                  </span>
                  Delete Channel
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4472C4] hover:bg-[#3b62a8] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Save Contact
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
