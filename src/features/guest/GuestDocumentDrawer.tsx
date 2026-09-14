import React, { useState, useEffect } from 'react';
import { GuestDocument, GuestRecord } from './types';

interface GuestDocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestRecord;
  document?: GuestDocument | null;
  onSave: (doc: GuestDocument) => void;
  onDelete?: (docId: string) => void;
}

export const GuestDocumentDrawer: React.FC<GuestDocumentDrawerProps> = ({
  isOpen,
  onClose,
  guest,
  document,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(document && document.id);

  const [formData, setFormData] = useState<GuestDocument>({
    id: document?.id || `DOC-${guest.id.replace('GST-', '')}-${String(guest.documents.length + 1).padStart(2, '0')}`,
    isPrimary: document ? document.isPrimary : guest.documents.length === 0,
    documentType: document?.documentType || 'Passport',
    documentNumber: document?.documentNumber || '',
    validTill: document?.validTill || '2030-12-31',
    nameOnDocument:
      document?.nameOnDocument ||
      `${guest.firstName.toUpperCase()} ${guest.middleName ? guest.middleName.toUpperCase() + ' ' : ''}${guest.lastName.toUpperCase()}`,
    issuedBy: document?.issuedBy || 'United States Department of State',
    issuePlace: document?.issuePlace || 'Washington D.C., USA',
    registeredAddress: {
      street: document?.registeredAddress?.street || guest.contacts[0]?.street || '742 Montgomery St, Penthouse B',
      city: document?.registeredAddress?.city || guest.contacts[0]?.city || 'San Francisco',
      state: document?.registeredAddress?.state || guest.contacts[0]?.state || 'CA',
      zip: document?.registeredAddress?.zip || guest.contacts[0]?.zip || '94111',
      country: document?.registeredAddress?.country || guest.contacts[0]?.country || 'United States',
    },
    remarks: document?.remarks || 'Scanned and verified at front desk terminal.',
    isOcrVerified: document?.isOcrVerified ?? true,
    frontScanUrl: document?.frontScanUrl || 'verified_photo_page.png',
    backScanUrl: document?.backScanUrl || 'verified_endorsement_page.png',
  });

  const [showPreviewModal, setShowPreviewModal] = useState<'front' | 'back' | null>(null);

  useEffect(() => {
    if (document) {
      setFormData(document);
    } else {
      setFormData({
        id: `DOC-${guest.id.replace('GST-', '')}-${String(guest.documents.length + 1).padStart(2, '0')}`,
        isPrimary: guest.documents.length === 0,
        documentType: 'Passport',
        documentNumber: '',
        validTill: '2031-08-24',
        nameOnDocument: `${guest.firstName.toUpperCase()} ${guest.middleName ? guest.middleName.toUpperCase() + ' ' : ''}${guest.lastName.toUpperCase()}`,
        issuedBy: 'United States Department of State',
        issuePlace: 'Washington D.C., USA',
        registeredAddress: {
          street: guest.contacts[0]?.street || '',
          city: guest.contacts[0]?.city || '',
          state: guest.contacts[0]?.state || '',
          zip: guest.contacts[0]?.zip || '',
          country: guest.contacts[0]?.country || 'United States',
        },
        remarks: 'Direct passport scanner ingestion.',
        isOcrVerified: true,
        frontScanUrl: 'verified_photo_page.png',
        backScanUrl: 'verified_endorsement_page.png',
      });
    }
  }, [document, guest]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentNumber) {
      alert('Document Number is required.');
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
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#4472C4] text-[20px]">
                  badge
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {isEditing ? 'Edit Guest Document' : 'Add Guest Document'}
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 01. Identity Priority */}
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
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">
                      Mark as Primary Identification
                    </span>
                    <span className="text-[12px] text-slate-500">
                      Primary check-in credential referenced on police reporting and tax audits.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => {
                      if (!e.target.checked && isEditing && document?.isPrimary) {
                        alert('A guest profile must have at least one primary identity document.');
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
                    <strong>Primary Transfer Logic Active:</strong> Designating this document as
                    Primary automatically unsets primary status from existing documents. Exactly one primary document is enforced.
                  </span>
                </div>
              )}
            </div>

            {/* 02. Document Identity & Jurisdiction */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <span className="material-symbols-outlined text-[16px] text-[#4472C4]">
                  assignment_ind
                </span>
                02. Document Identity & Jurisdiction
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Document Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) =>
                      setFormData({ ...formData, documentType: e.target.value as any })
                    }
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-800"
                  >
                    <option value="Passport">Passport</option>
                    <option value="National Identity Card">National Identity Card</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Diplomatic ID">Diplomatic ID</option>
                    <option value="Permanent Resident Card">Permanent Resident Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Document Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                      OCR Match
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, documentNumber: e.target.value })
                    }
                    placeholder="USA-P98421098"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-mono font-semibold text-slate-800 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Valid Till (Expiry) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Name on Document
                  </label>
                  <input
                    type="text"
                    value={formData.nameOnDocument}
                    onChange={(e) =>
                      setFormData({ ...formData, nameOnDocument: e.target.value })
                    }
                    placeholder="ELENA MARIE ROSTOVA-HUGHES"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Issued By</label>
                  <input
                    type="text"
                    value={formData.issuedBy}
                    onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                    placeholder="United States Department of State"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Issue Place / Authority
                  </label>
                  <input
                    type="text"
                    value={formData.issuePlace}
                    onChange={(e) => setFormData({ ...formData, issuePlace: e.target.value })}
                    placeholder="Washington D.C., USA"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            {/* 03. Registered Address on Document */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <span className="material-symbols-outlined text-[16px] text-[#4472C4]">
                  location_city
                </span>
                03. Registered Address on Document
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.registeredAddress.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredAddress: {
                          ...formData.registeredAddress,
                          street: e.target.value,
                        },
                      })
                    }
                    placeholder="742 Montgomery St, Penthouse B"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">City</label>
                  <input
                    type="text"
                    value={formData.registeredAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredAddress: {
                          ...formData.registeredAddress,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="San Francisco"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">State / Region</label>
                  <input
                    type="text"
                    value={formData.registeredAddress.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredAddress: {
                          ...formData.registeredAddress,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="CA"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">ZIP / Postal</label>
                  <input
                    type="text"
                    value={formData.registeredAddress.zip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredAddress: {
                          ...formData.registeredAddress,
                          zip: e.target.value,
                        },
                      })
                    }
                    placeholder="94111"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Country</label>
                  <input
                    type="text"
                    value={formData.registeredAddress.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredAddress: {
                          ...formData.registeredAddress,
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="United States"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
                  />
                </div>
              </div>
            </div>

            {/* 04. Scanned Identification Attachments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#4472C4]">
                    document_scanner
                  </span>
                  04. Scanned Identification Attachments
                </h3>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  OCR Engine 2.4 Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Front Scan Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#4472C4]">
                        person_pin
                      </span>
                      Photo Page (Front)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      AUTHENTICATED
                    </span>
                  </div>

                  {/* Visual ID card representation */}
                  <div className="relative aspect-[16/10] rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-3 text-white overflow-hidden shadow-inner flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#60a5fa] text-[18px]">
                          flag
                        </span>
                        <div>
                          <div className="text-[9px] font-mono text-slate-300 tracking-wider">
                            PASSPORT SPECIMEN
                          </div>
                          <div className="text-[10px] font-bold tracking-tight text-white">
                            {formData.nameOnDocument || 'ROSTOVA-HUGHES, ELENA'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-blue-300 border border-blue-400/40 px-1 py-0.5 rounded">
                        USA
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-12 rounded bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">
                          account_circle
                        </span>
                      </div>
                      <div className="font-mono text-[8px] text-slate-300 space-y-0.5">
                        <div>
                          DOC: <span className="text-white font-bold">{formData.documentNumber || 'USA-P98421098'}</span>
                        </div>
                        <div>DOB: {guest.birthDate || '1984-04-12'}</div>
                        <div>EXP: {formData.validTill}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-1 rounded font-mono text-[6px] tracking-wider text-emerald-400 truncate">
                      P&lt;USAROSTOVA&lt;HUGHES&lt;&lt;ELENA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono text-[10px] truncate max-w-[140px]">
                      passport_front_scan.pdf
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPreviewModal('front')}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-200 font-medium cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Front scan attachment replaced via direct scanner upload.')}
                        className="px-2 py-1 text-[#4472C4] hover:bg-blue-50 rounded border border-blue-200 font-medium cursor-pointer"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back Scan Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#4472C4]">
                        branding_watermark
                      </span>
                      Endorsement / Barcode (Back)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      VERIFIED
                    </span>
                  </div>

                  {/* Visual ID back representation */}
                  <div className="relative aspect-[16/10] rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-3 text-white overflow-hidden shadow-inner flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-300">
                        OFFICIAL ENDORSEMENTS & VISAS
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">
                        qr_code
                      </span>
                    </div>

                    <div className="h-10 border border-dashed border-slate-700 rounded flex items-center justify-center font-mono text-[7px] text-slate-400">
                      ||| |||| || |||||| |||| ||| ||||||| ||||||
                    </div>

                    <div className="text-[8px] font-mono text-slate-400">
                      JURISDICTION: {formData.issuePlace || 'WASHINGTON D.C.'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono text-[10px] truncate max-w-[140px]">
                      passport_back_scan.pdf
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPreviewModal('back')}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-200 font-medium cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Back scan attachment replaced via direct scanner upload.')}
                        className="px-2 py-1 text-[#4472C4] hover:bg-blue-50 rounded border border-blue-200 font-medium cursor-pointer"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 05. Operational Remarks & Audit Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                05. Operational Remarks & Audit Notes
              </label>
              <textarea
                rows={2}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="MRZ and biometric microchip verified by front desk passport scanner..."
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4472C4] font-medium text-slate-800"
              />
            </div>

            {/* Safeguard Notice for Primary */}
            {isEditing && formData.isPrimary && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                  shield
                </span>
                <div>
                  <span className="font-semibold block">Cannot Delete Active Primary Identification</span>
                  <span className="text-[11px] text-amber-700 leading-relaxed">
                    Hospitality compliance rules require at least one verified primary identity document on file. To remove this document, mark an alternate document as Primary first.
                  </span>
                </div>
              </div>
            )}

            {/* Actions & Safeguards Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {isEditing && onDelete ? (
                <button
                  type="button"
                  disabled={formData.isPrimary}
                  onClick={() => {
                    if (window.confirm(`Delete document ${formData.id}?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    formData.isPrimary
                      ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                      : 'text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer'
                  }`}
                  title={formData.isPrimary ? 'Locked: Cannot delete active primary document' : 'Delete document'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {formData.isPrimary ? 'lock' : 'delete'}
                  </span>
                  Delete Document
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
                  Save Document Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#60a5fa]">visibility</span>
                Document Scan Preview: {showPreviewModal === 'front' ? 'Photo Page' : 'Endorsements'}
              </h3>
              <button
                onClick={() => setShowPreviewModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col justify-between font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <div>
                  <div className="text-[10px] text-blue-400">OFFICIAL GOVERNMENT DOCUMENT RECORD</div>
                  <div className="text-base font-bold text-white mt-1">{formData.nameOnDocument}</div>
                  <div className="text-xs text-slate-400">{formData.documentType} • #{formData.documentNumber}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-bold border border-emerald-700/50">
                    AUTHENTICATED
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">EXP: {formData.validTill}</div>
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400">
                Registered Address: {formData.registeredAddress.street}, {formData.registeredAddress.city}, {formData.registeredAddress.state} {formData.registeredAddress.zip}, {formData.registeredAddress.country}
              </div>
              <div className="bg-black/50 p-2 rounded text-[8px] text-emerald-400">
                P&lt;USAROSTOVA&lt;HUGHES&lt;&lt;ELENA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
