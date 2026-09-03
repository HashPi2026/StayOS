import React, { useState, useMemo } from 'react';
import { useProperty } from '../context/PropertyContext';
import { EmailTemplateItem } from '../types';

export const EmailTemplatesView: React.FC = () => {
  const {
    emailTemplates,
    setEditingEmailTemplateId,
    openDeleteEmailTemplateDialog,
    duplicateEmailTemplate,
    toggleEmailTemplateStatus,
    navigate,
    addToast,
  } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateItem | null>(null);

  // Filter logic
  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter((tmpl) => {
      const matchesSearch =
        tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.replyTo?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (triggerFilter === 'active') return tmpl.status === 'active';
      if (triggerFilter === 'inactive') return tmpl.status === 'inactive';
      if (triggerFilter === 'created') return tmpl.triggers.created;
      if (triggerFilter === 'checkin')
        return tmpl.triggers.beforeCheckIn || tmpl.triggers.atCheckIn || tmpl.triggers.afterCheckIn;
      if (triggerFilter === 'checkout')
        return tmpl.triggers.beforeCheckOut || tmpl.triggers.atCheckOut || tmpl.triggers.afterCheckOut;
      if (triggerFilter === 'dob') return tmpl.triggers.dob;

      return true;
    });
  }, [emailTemplates, searchQuery, triggerFilter]);

  const activeCount = emailTemplates.filter((t) => t.status === 'active').length;
  const triggerAutomatedCount = emailTemplates.filter(
    (t) =>
      t.triggers.created ||
      t.triggers.updated ||
      t.triggers.cancelled ||
      t.triggers.beforeCheckIn ||
      t.triggers.atCheckIn ||
      t.triggers.afterCheckIn ||
      t.triggers.beforeCheckOut ||
      t.triggers.atCheckOut ||
      t.triggers.afterCheckOut ||
      t.triggers.dob
  ).length;

  const renderTriggerCell = (isActive: boolean, detailText?: string | number, label?: string) => {
    if (!isActive) {
      return (
        <div className="flex items-center justify-center">
          <span className="text-gray-300 font-mono text-xs select-none">-</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <div
          title={label || 'Active trigger'}
          className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded-full bg-[#0058be]/10 text-[#0058be] text-[11px] font-bold border border-[#0058be]/20 shadow-2xs group-hover:bg-[#0058be] group-hover:text-white transition-all"
        >
          {detailText !== undefined && detailText !== null && detailText !== '' ? (
            <span>{detailText}</span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">check</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f8f9fb]">
      {/* Header Section */}
      <div className="bg-white border-b border-[#e1e2e4] px-8 py-5">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#76777d] mb-2">
          <button
            type="button"
            onClick={() => navigate('rates-packages')}
            className="hover:text-[#0058be] transition-colors cursor-pointer"
          >
            Configuration
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Communications</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">E-mail Templates</span>
        </div>

        {/* Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#191c1e] tracking-tight">
              E-mail Templates
            </h1>
            <p className="text-xs text-[#76777d] mt-0.5">
              Customize guest transactional email templates, lifecycle trigger events, and dynamic merge variables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingEmailTemplateId(null);
                navigate('add-email-template');
              }}
              className="px-4 py-2 bg-[#0058be] hover:bg-[#00469b] active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Template
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#f0f1f3]">
          <div className="bg-[#f8f9fb] p-3 rounded-lg border border-[#e1e2e4]">
            <span className="text-[11px] font-medium text-[#76777d] uppercase tracking-wider block">
              Total Templates
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-[#191c1e]">{emailTemplates.length}</span>
              <span className="text-[11px] text-[#76777d]">configured</span>
            </div>
          </div>

          <div className="bg-[#f8f9fb] p-3 rounded-lg border border-[#e1e2e4]">
            <span className="text-[11px] font-medium text-[#76777d] uppercase tracking-wider block">
              Active Status
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-emerald-600">{activeCount}</span>
              <span className="text-[11px] text-[#76777d]">of {emailTemplates.length} active</span>
            </div>
          </div>

          <div className="bg-[#f8f9fb] p-3 rounded-lg border border-[#e1e2e4]">
            <span className="text-[11px] font-medium text-[#76777d] uppercase tracking-wider block">
              Automated Triggers
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-[#0058be]">{triggerAutomatedCount}</span>
              <span className="text-[11px] text-[#76777d]">with auto dispatch</span>
            </div>
          </div>

          <div className="bg-[#f8f9fb] p-3 rounded-lg border border-[#e1e2e4]">
            <span className="text-[11px] font-medium text-[#76777d] uppercase tracking-wider block">
              Dynamic Tags
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-[#45464d]">11</span>
              <span className="text-[11px] text-[#76777d]">merge tags supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 space-y-4 max-w-7xl">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#e1e2e4] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76777d]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search template name, subject..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#f8f9fb] rounded-lg border border-[#c6c6cd] focus:outline-hidden focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-[#76777d] mr-1 hidden sm:inline">Filter:</span>
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'active', label: 'Active' },
              { id: 'created', label: 'On Created' },
              { id: 'checkin', label: 'Check-In' },
              { id: 'checkout', label: 'Check-Out' },
              { id: 'dob', label: 'Birthdays' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTriggerFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  triggerFilter === f.id
                    ? 'bg-[#0058be] text-white shadow-2xs'
                    : 'bg-[#f0f1f3] text-[#45464d] hover:bg-[#e0e3e5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Email Templates Data Table */}
        <div className="bg-white rounded-xl border border-[#e1e2e4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#e1e2e4] text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  <th className="py-3 px-4 min-w-[220px]">Template Name</th>
                  <th className="py-3 px-2 text-center w-12" title="Created: Dispatched upon reservation creation">
                    CRT
                  </th>
                  <th className="py-3 px-2 text-center w-12" title="Updated: Dispatched upon reservation update">
                    UPD
                  </th>
                  <th className="py-3 px-2 text-center w-12" title="Cancelled: Dispatched upon cancellation">
                    CAN
                  </th>
                  <th className="py-3 px-2 text-center w-14" title="Before Check-in: Scheduled X days before check-in">
                    B.CI
                  </th>
                  <th className="py-3 px-2 text-center w-12" title="Check-in: Dispatched at check-in time">
                    CI
                  </th>
                  <th className="py-3 px-2 text-center w-14" title="After Check-in: Scheduled X days after check-in">
                    A.CI
                  </th>
                  <th className="py-3 px-2 text-center w-14" title="Before Check-out: Scheduled X days before check-out">
                    B.CO
                  </th>
                  <th className="py-3 px-2 text-center w-12" title="Check-out: Dispatched at check-out time">
                    CO
                  </th>
                  <th className="py-3 px-2 text-center w-14" title="After Check-out: Scheduled X days after check-out">
                    A.CO
                  </th>
                  <th className="py-3 px-2 text-center w-12" title="Date of Birth: Dispatched on guest birthday">
                    DOB
                  </th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f3] text-xs">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-[#f8f9fb] transition-colors group"
                    >
                      {/* Name & Subject */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleEmailTemplateStatus(template.id)}
                            title={`Status: ${template.status}. Click to toggle.`}
                            className={`w-2.5 h-2.5 mt-1 rounded-full cursor-pointer transition-transform hover:scale-125 ${
                              template.status === 'active'
                                ? 'bg-emerald-500 ring-2 ring-emerald-200'
                                : 'bg-slate-300 ring-2 ring-slate-100'
                            }`}
                          />
                          <div>
                            <span
                              onClick={() => {
                                setEditingEmailTemplateId(template.id);
                                navigate('edit-email-template');
                              }}
                              className="font-bold text-[#191c1e] hover:text-[#0058be] cursor-pointer transition-colors block"
                            >
                              {template.name}
                            </span>
                            <span className="text-[11px] text-[#76777d] line-clamp-1 block mt-0.5">
                              {template.subject}
                            </span>
                            {template.senderName && (
                              <span className="text-[10px] text-[#0058be] font-mono mt-0.5 block">
                                From: {template.senderName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Trigger CRT */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(template.triggers.created, undefined, 'Dispatches on booking creation')}
                      </td>

                      {/* Trigger UPD */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(template.triggers.updated, undefined, 'Dispatches on booking update')}
                      </td>

                      {/* Trigger CAN */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(template.triggers.cancelled, undefined, 'Dispatches on booking cancellation')}
                      </td>

                      {/* Trigger B.CI */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(
                          template.triggers.beforeCheckIn,
                          `${template.triggers.beforeCheckInDays ?? 1}d`,
                          `${template.triggers.beforeCheckInDays ?? 1} day(s) before check-in`
                        )}
                      </td>

                      {/* Trigger CI */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(template.triggers.atCheckIn, undefined, 'Dispatches at check-in')}
                      </td>

                      {/* Trigger A.CI */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(
                          template.triggers.afterCheckIn,
                          `${template.triggers.afterCheckInDays ?? 1}d`,
                          `${template.triggers.afterCheckInDays ?? 1} day(s) after check-in`
                        )}
                      </td>

                      {/* Trigger B.CO */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(
                          template.triggers.beforeCheckOut,
                          `${template.triggers.beforeCheckOutDays ?? 1}d`,
                          `${template.triggers.beforeCheckOutDays ?? 1} day(s) before check-out`
                        )}
                      </td>

                      {/* Trigger CO */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(template.triggers.atCheckOut, undefined, 'Dispatches at check-out')}
                      </td>

                      {/* Trigger A.CO */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(
                          template.triggers.afterCheckOut,
                          `${template.triggers.afterCheckOutDays ?? 1}d`,
                          `${template.triggers.afterCheckOutDays ?? 1} day(s) after check-out`
                        )}
                      </td>

                      {/* Trigger DOB */}
                      <td className="py-3 px-2 text-center">
                        {renderTriggerCell(template.triggers.dob, undefined, 'Dispatches on guest birthday')}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(template)}
                            title="Preview Rendered Template"
                            className="p-1.5 text-[#76777d] hover:text-[#0058be] hover:bg-[#0058be]/10 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmailTemplateId(template.id);
                              navigate('edit-email-template');
                            }}
                            title="Edit Template"
                            className="p-1.5 text-[#76777d] hover:text-[#0058be] hover:bg-[#0058be]/10 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateEmailTemplate(template.id)}
                            title="Duplicate Template"
                            className="p-1.5 text-[#76777d] hover:text-[#0058be] hover:bg-[#0058be]/10 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteEmailTemplateDialog(template)}
                            title="Delete Template"
                            className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-[#76777d]">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-full bg-[#f0f1f3] flex items-center justify-center text-[#76777d] mb-3">
                          <span className="material-symbols-outlined text-[24px]">search_off</span>
                        </div>
                        <p className="font-semibold text-sm text-[#191c1e]">No email templates match your filter</p>
                        <p className="text-xs text-[#76777d] mt-1">
                          Try adjusting your search criteria or create a new email template.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setTriggerFilter('all');
                          }}
                          className="mt-4 px-3 py-1.5 bg-[#f0f1f3] hover:bg-[#e0e3e5] text-xs font-semibold rounded-lg text-[#191c1e] transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#f8f9fb] border-t border-[#e1e2e4] flex items-center justify-between text-xs text-[#76777d]">
            <span>
              Showing <strong>{filteredTemplates.length}</strong> of{' '}
              <strong>{emailTemplates.length}</strong> email templates
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Template
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Legend / Helper Info Card */}
        <div className="bg-white rounded-xl p-4 border border-[#e1e2e4] shadow-xs text-xs text-[#45464d] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#191c1e]">
            <span className="material-symbols-outlined text-[16px] text-[#0058be]">info</span>
            Trigger Matrix Legend
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-[#76777d]">
            <div><strong className="text-[#191c1e]">CRT:</strong> Created (On reservation booking)</div>
            <div><strong className="text-[#191c1e]">UPD:</strong> Updated (On booking modification)</div>
            <div><strong className="text-[#191c1e]">CAN:</strong> Cancelled (On cancellation)</div>
            <div><strong className="text-[#191c1e]">B.CI:</strong> Before Check-In (e.g. 1d before)</div>
            <div><strong className="text-[#191c1e]">CI:</strong> At Check-In (Upon guest arrival)</div>
            <div><strong className="text-[#191c1e]">A.CI:</strong> After Check-In (In-house welcome)</div>
            <div><strong className="text-[#191c1e]">B.CO:</strong> Before Check-Out (Pre-departure)</div>
            <div><strong className="text-[#191c1e]">CO:</strong> At Check-Out (Departure)</div>
            <div><strong className="text-[#191c1e]">A.CO:</strong> After Check-Out (Review / Survey)</div>
            <div><strong className="text-[#191c1e]">DOB:</strong> Birthday (On guest birthday)</div>
          </div>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#c6c6cd]/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#f8f9fb] border-b border-[#e1e2e4] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#191c1e]">
                  Template Preview: {previewTemplate.name}
                </h3>
                <p className="text-xs text-[#76777d]">
                  Rendered with sample guest reservation data
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="w-8 h-8 rounded-full text-[#76777d] hover:text-[#191c1e] hover:bg-[#e0e3e5] flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-[#f8f9fb] rounded-lg border border-[#e1e2e4] space-y-1 text-xs">
                <div>
                  <span className="text-[#76777d] font-medium">Subject: </span>
                  <span className="font-bold text-[#191c1e]">
                    {previewTemplate.subject
                      .replace(/{{guest_name}}/g, 'Alexander Wright')
                      .replace(/{{hotel_name}}/g, 'Grand Plaza Hotel')
                      .replace(/{{confirmation_no}}/g, 'GPH-884920')}
                  </span>
                </div>
                <div>
                  <span className="text-[#76777d] font-medium">From: </span>
                  <span className="text-[#191c1e]">
                    {previewTemplate.senderName || 'Grand Plaza Hotel'} &lt;
                    {previewTemplate.replyTo || 'reservations@grandplazatokyo.com'}&gt;
                  </span>
                </div>
              </div>

              <div
                className="prose prose-sm max-w-none text-[#191c1e] text-xs leading-relaxed p-4 border border-[#e1e2e4] rounded-lg"
                dangerouslySetInnerHTML={{
                  __html: previewTemplate.body
                    .replace(/{{guest_name}}/g, 'Alexander Wright')
                    .replace(/{{hotel_name}}/g, 'Grand Plaza Hotel')
                    .replace(/{{confirmation_no}}/g, 'GPH-884920')
                    .replace(/{{check_in_date}}/g, 'Nov 14, 2024')
                    .replace(/{{check_out_date}}/g, 'Nov 18, 2024')
                    .replace(/{{room_type}}/g, 'Deluxe King Ocean View')
                    .replace(/{{guest_count}}/g, '2 Adults, 1 Child')
                    .replace(/{{total_amount}}/g, '$1,240.00')
                    .replace(/{{hotel_phone}}/g, '+81 3-5809-1000')
                    .replace(/{{hotel_email}}/g, 'reservations@grandplazatokyo.com')
                    .replace(/{{survey_link}}/g, 'https://grandplaza.com/survey/GPH-884920'),
                }}
              />
            </div>

            <div className="px-6 py-4 bg-[#f8f9fb] border-t border-[#e1e2e4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  addToast('Simulation test email sent successfully', 'success');
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#0058be] hover:bg-[#0058be]/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Send Test Email
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const t = previewTemplate;
                    setPreviewTemplate(null);
                    setEditingEmailTemplateId(t.id);
                    navigate('edit-email-template');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#0058be] text-white hover:bg-[#00469b] rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Edit Template
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#e0e3e5] rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
