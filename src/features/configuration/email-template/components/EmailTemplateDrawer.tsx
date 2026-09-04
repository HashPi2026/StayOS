import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { EmailTemplateTriggers } from '@/src/types';

const MERGE_TAGS = [
  { tag: '{{guest_name}}', label: 'Guest Name', sample: 'Alexander Wright' },
  { tag: '{{hotel_name}}', label: 'Hotel Name', sample: 'Grand Plaza Hotel' },
  { tag: '{{confirmation_no}}', label: 'Conf #', sample: 'GPH-884920' },
  { tag: '{{check_in_date}}', label: 'Check-In', sample: 'Nov 14, 2024' },
  { tag: '{{check_out_date}}', label: 'Check-Out', sample: 'Nov 18, 2024' },
  { tag: '{{room_type}}', label: 'Room Type', sample: 'Deluxe King Ocean View' },
  { tag: '{{guest_count}}', label: 'Guests', sample: '2 Adults, 1 Child' },
  { tag: '{{total_amount}}', label: 'Total Amount', sample: '$1,240.00' },
  { tag: '{{hotel_phone}}', label: 'Hotel Phone', sample: '+81 3-5809-1000' },
  { tag: '{{hotel_email}}', label: 'Hotel Email', sample: 'reservations@grandplazatokyo.com' },
  { tag: '{{survey_link}}', label: 'Survey Link', sample: 'https://grandplaza.com/survey/GPH-884920' },
];

export const EmailTemplateDrawer: React.FC = () => {
  const {
    isEmailTemplateDrawerOpen,
    drawerEmailTemplate,
    closeEmailTemplateDrawer,
    addEmailTemplate,
    updateEmailTemplate,
    addToast,
  } = useProperty();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html'>('editor');
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  const [triggers, setTriggers] = useState<EmailTemplateTriggers>({
    created: false,
    updated: false,
    cancelled: false,
    dob: false,
    beforeCheckIn: false,
    beforeCheckInDays: 1,
    atCheckIn: false,
    afterCheckIn: false,
    afterCheckInDays: 1,
    beforeCheckOut: false,
    beforeCheckOutDays: 1,
    atCheckOut: false,
    afterCheckOut: false,
    afterCheckOutDays: 1,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (drawerEmailTemplate) {
      setName(drawerEmailTemplate.name || '');
      setSubject(drawerEmailTemplate.subject || '');
      setSenderName(drawerEmailTemplate.senderName || '');
      setReplyTo(drawerEmailTemplate.replyTo || '');
      setStatus(drawerEmailTemplate.status || 'active');
      setBody(drawerEmailTemplate.body || '');
      setTriggers({
        created: !!drawerEmailTemplate.triggers?.created,
        updated: !!drawerEmailTemplate.triggers?.updated,
        cancelled: !!drawerEmailTemplate.triggers?.cancelled,
        dob: !!drawerEmailTemplate.triggers?.dob,
        beforeCheckIn: !!drawerEmailTemplate.triggers?.beforeCheckIn,
        beforeCheckInDays: drawerEmailTemplate.triggers?.beforeCheckInDays ?? 1,
        atCheckIn: !!drawerEmailTemplate.triggers?.atCheckIn,
        afterCheckIn: !!drawerEmailTemplate.triggers?.afterCheckIn,
        afterCheckInDays: drawerEmailTemplate.triggers?.afterCheckInDays ?? 1,
        beforeCheckOut: !!drawerEmailTemplate.triggers?.beforeCheckOut,
        beforeCheckOutDays: drawerEmailTemplate.triggers?.beforeCheckOutDays ?? 1,
        atCheckOut: !!drawerEmailTemplate.triggers?.atCheckOut,
        afterCheckOut: !!drawerEmailTemplate.triggers?.afterCheckOut,
        afterCheckOutDays: drawerEmailTemplate.triggers?.afterCheckOutDays ?? 1,
      });
    } else {
      setName('');
      setSubject('Reservation Details - {{hotel_name}}');
      setSenderName('Grand Plaza Hotel Reservations');
      setReplyTo('reservations@grandplazatokyo.com');
      setStatus('active');
      setBody(
        `<p>Dear {{guest_name}},</p>\n<p>Thank you for choosing <strong>{{hotel_name}}</strong>. Your confirmation number is <strong>{{confirmation_no}}</strong>.</p>\n<p>We look forward to welcoming you on <strong>{{check_in_date}}</strong>.</p>\n<p>Best regards,<br/>The Hospitality Team</p>`
      );
      setTriggers({
        created: true,
        updated: false,
        cancelled: false,
        dob: false,
        beforeCheckIn: false,
        beforeCheckInDays: 1,
        atCheckIn: false,
        afterCheckIn: false,
        afterCheckInDays: 1,
        beforeCheckOut: false,
        beforeCheckOutDays: 1,
        atCheckOut: false,
        afterCheckOut: false,
        afterCheckOutDays: 1,
      });
    }
    setErrors({});
    setActiveTab('editor');
  }, [drawerEmailTemplate, isEmailTemplateDrawerOpen]);

  if (!isEmailTemplateDrawerOpen) return null;

  const insertTag = (tag: string) => {
    if (activeField === 'subject') {
      const input = subjectInputRef.current;
      if (input) {
        const start = input.selectionStart || subject.length;
        const end = input.selectionEnd || subject.length;
        const newSubject = subject.slice(0, start) + tag + subject.slice(end);
        setSubject(newSubject);
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
      } else {
        setSubject((prev) => prev + tag);
      }
    } else {
      const textarea = bodyTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart || body.length;
        const end = textarea.selectionEnd || body.length;
        const newBody = body.slice(0, start) + tag + body.slice(end);
        setBody(newBody);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
      } else {
        setBody((prev) => prev + tag);
      }
    }
  };

  const wrapSelectionWithTags = (openTag: string, closeTag: string) => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = body.slice(start, end) || 'Text';
    const replacement = `${openTag}${selectedText}${closeTag}`;
    const newBody = body.slice(0, start) + replacement + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 50);
  };

  const getRenderedPreview = () => {
    let rendered = body;
    let renderedSubject = subject;
    for (const item of MERGE_TAGS) {
      rendered = rendered.split(item.tag).join(item.sample);
      renderedSubject = renderedSubject.split(item.tag).join(item.sample);
    }
    return { renderedSubject, renderedBody: rendered };
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Template name is required';
    }
    if (!subject.trim()) {
      errs.subject = 'Subject line is required';
    }
    if (!body.trim()) {
      errs.body = 'Email body content cannot be empty';
    }
    if (replyTo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo.trim())) {
      errs.replyTo = 'Please enter a valid reply-to email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please complete required fields before saving', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      subject: subject.trim(),
      senderName: senderName.trim() || 'Grand Plaza Hotel',
      replyTo: replyTo.trim() || 'reservations@grandplazatokyo.com',
      status,
      triggers,
      body: body.trim(),
    };

    if (drawerEmailTemplate) {
      const ok = updateEmailTemplate(drawerEmailTemplate.id, payload);
      if (ok) closeEmailTemplateDrawer();
    } else {
      const ok = addEmailTemplate(payload);
      if (ok) closeEmailTemplateDrawer();
    }
  };

  const { renderedSubject, renderedBody } = getRenderedPreview();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={closeEmailTemplateDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#f8f9fb] shadow-2xl border-l border-[#c6c6cd]/50 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-[#e1e2e4] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0058be]/10 text-[#0058be] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  {drawerEmailTemplate ? 'edit_note' : 'add_circle'}
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#191c1e]">
                  {drawerEmailTemplate ? 'Edit E-mail Template' : 'Add E-mail Template'}
                </h2>
                <p className="text-xs text-[#76777d]">
                  {drawerEmailTemplate
                    ? `Update template parameters and automated trigger rules`
                    : `Create a customized automated guest communication template`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEmailTemplateDrawer}
                className="w-8 h-8 rounded-full text-[#76777d] hover:text-[#191c1e] hover:bg-[#e0e3e5] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Section 1: Template Metadata */}
            <div className="bg-white rounded-xl p-5 border border-[#e1e2e4] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#f0f1f3]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0058be]">badge</span>
                  Template General Information
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#76777d]">Status:</span>
                  <button
                    type="button"
                    onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    Template Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g. Booking Confirmation, Pre-Arrival Welcome..."
                    className={`w-full px-3 py-2 text-xs bg-[#f8f9fb] rounded-lg border ${
                      errors.name ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]'
                    } focus:outline-hidden focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors`}
                  />
                  {errors.name && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Grand Plaza Reservations"
                    className="w-full px-3 py-2 text-xs bg-[#f8f9fb] rounded-lg border border-[#c6c6cd] focus:outline-hidden focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    Reply-To Email Address
                  </label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => {
                      setReplyTo(e.target.value);
                      if (errors.replyTo) setErrors((prev) => ({ ...prev, replyTo: '' }));
                    }}
                    placeholder="reservations@grandplazatokyo.com"
                    className={`w-full px-3 py-2 text-xs bg-[#f8f9fb] rounded-lg border ${
                      errors.replyTo ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]'
                    } focus:outline-hidden focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors`}
                  />
                  {errors.replyTo && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.replyTo}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Automated Delivery Triggers (Matching Screenshot exactly) */}
            <div className="bg-white rounded-xl p-5 border border-[#e1e2e4] shadow-xs space-y-4">
              <div className="pb-2 border-b border-[#f0f1f3] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0058be]">bolt</span>
                    Automated Delivery Triggers
                  </h3>
                  <p className="text-[11px] text-[#76777d] mt-0.5">
                    Select when the system should automatically dispatch this email to the guest.
                  </p>
                </div>
              </div>

              {/* Matrix Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* 1. Lifecycle Events */}
                <div className="p-3.5 rounded-lg bg-[#f8f9fb] border border-[#e1e2e4] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider block mb-2">
                    Reservation Lifecycle
                  </span>

                  <label className="flex items-center gap-2 text-xs text-[#191c1e] cursor-pointer select-none hover:text-[#0058be]">
                    <input
                      type="checkbox"
                      checked={triggers.created}
                      onChange={(e) => setTriggers((prev) => ({ ...prev, created: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be]"
                    />
                    <span className="font-medium">Created (CRT)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#191c1e] cursor-pointer select-none hover:text-[#0058be]">
                    <input
                      type="checkbox"
                      checked={triggers.updated}
                      onChange={(e) => setTriggers((prev) => ({ ...prev, updated: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be]"
                    />
                    <span className="font-medium">Updated (UPD)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#191c1e] cursor-pointer select-none hover:text-[#0058be]">
                    <input
                      type="checkbox"
                      checked={triggers.cancelled}
                      onChange={(e) => setTriggers((prev) => ({ ...prev, cancelled: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be]"
                    />
                    <span className="font-medium">Cancelled (CAN)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#191c1e] cursor-pointer select-none hover:text-[#0058be]">
                    <input
                      type="checkbox"
                      checked={triggers.dob}
                      onChange={(e) => setTriggers((prev) => ({ ...prev, dob: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be]"
                    />
                    <span className="font-medium">Date of Birth (DOB)</span>
                  </label>
                </div>

                {/* 2. Check-In Lifecycle */}
                <div className="p-3.5 rounded-lg bg-[#f8f9fb] border border-[#e1e2e4] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider block mb-2">
                    Check-In Schedule
                  </span>

                  {/* Before Check-in */}
                  <div className="flex items-center gap-2 text-xs text-[#191c1e]">
                    <input
                      type="checkbox"
                      id="trig-before-ci"
                      checked={triggers.beforeCheckIn}
                      onChange={(e) =>
                        setTriggers((prev) => ({ ...prev, beforeCheckIn: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                    />
                    <label htmlFor="trig-before-ci" className="cursor-pointer font-medium whitespace-nowrap">
                      Before (B.CI):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      disabled={!triggers.beforeCheckIn}
                      value={triggers.beforeCheckInDays}
                      onChange={(e) =>
                        setTriggers((prev) => ({
                          ...prev,
                          beforeCheckInDays: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className={`w-14 px-1.5 py-1 text-xs text-center rounded border ${
                        triggers.beforeCheckIn
                          ? 'bg-white border-[#c6c6cd] text-[#191c1e]'
                          : 'bg-[#e0e3e5] border-transparent text-[#76777d]'
                      }`}
                    />
                    <span className="text-[11px] text-[#76777d]">days</span>
                  </div>

                  {/* At Check-in */}
                  <label className="flex items-center gap-2 text-xs text-[#191c1e] cursor-pointer select-none hover:text-[#0058be]">
                    <input
                      type="checkbox"
                      checked={triggers.atCheckIn}
                      onChange={(e) => setTriggers((prev) => ({ ...prev, atCheckIn: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be]"
                    />
                    <span className="font-medium">At Check-in (CI)</span>
                  </label>

                  {/* After Check-in */}
                  <div className="flex items-center gap-2 text-xs text-[#191c1e]">
                    <input
                      type="checkbox"
                      id="trig-after-ci"
                      checked={triggers.afterCheckIn}
                      onChange={(e) =>
                        setTriggers((prev) => ({ ...prev, afterCheckIn: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                    />
                    <label htmlFor="trig-after-ci" className="cursor-pointer font-medium whitespace-nowrap">
                      After (A.CI):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      disabled={!triggers.afterCheckIn}
                      value={triggers.afterCheckInDays}
                      onChange={(e) =>
                        setTriggers((prev) => ({
                          ...prev,
                          afterCheckInDays: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className={`w-14 px-1.5 py-1 text-xs text-center rounded border ${
                        triggers.afterCheckIn
                          ? 'bg-white border-[#c6c6cd] text-[#191c1e]'
                          : 'bg-[#e0e3e5] border-transparent text-[#76777d]'
                      }`}
                    />
                    <span className="text-[11px] text-[#76777d]">days</span>
                  </div>
                </div>

                {/* 3. Check-Out Lifecycle */}
                <div className="p-3.5 rounded-lg bg-[#f8f9fb] border border-[#e1e2e4] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider block mb-2">
                    Check-Out Schedule
                  </span>

                  {/* Before Check-out */}
                  <div className="flex items-center gap-2 text-xs text-[#191c1e]">
                    <input
                      type="checkbox"
                      id="trig-before-co"
                      checked={triggers.beforeCheckOut}
                      onChange={(e) =>
                        setTriggers((prev) => ({ ...prev, beforeCheckOut: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                    />
                    <label htmlFor="trig-before-co" className="cursor-pointer font-medium whitespace-nowrap">
                      Before (B.CO):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      disabled={!triggers.beforeCheckOut}
                      value={triggers.beforeCheckOutDays}
                      onChange={(e) =>
                        setTriggers((prev) => ({
                          ...prev,
                          beforeCheckOutDays: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className={`w-14 px-1.5 py-1 text-xs text-center rounded border ${
                        triggers.beforeCheckOut
                          ? 'bg-white border-[#c6c6cd] text-[#191c1e]'
                          : 'bg-[#e0e3e5] border-transparent text-[#76777d]'
                      }`}
                    />
                    <span className="text-[11px] text-[#76777d]">days</span>
                  </div>

                  {/* At Check-out */}
                  <label className="flex items-center gap-2 text-xs text-[#191c1e] cursor-pointer select-none hover:text-[#0058be]">
                    <input
                      type="checkbox"
                      checked={triggers.atCheckOut}
                      onChange={(e) => setTriggers((prev) => ({ ...prev, atCheckOut: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be]"
                    />
                    <span className="font-medium">At Check-out (CO)</span>
                  </label>

                  {/* After Check-out */}
                  <div className="flex items-center gap-2 text-xs text-[#191c1e]">
                    <input
                      type="checkbox"
                      id="trig-after-co"
                      checked={triggers.afterCheckOut}
                      onChange={(e) =>
                        setTriggers((prev) => ({ ...prev, afterCheckOut: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                    />
                    <label htmlFor="trig-after-co" className="cursor-pointer font-medium whitespace-nowrap">
                      After (A.CO):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      disabled={!triggers.afterCheckOut}
                      value={triggers.afterCheckOutDays}
                      onChange={(e) =>
                        setTriggers((prev) => ({
                          ...prev,
                          afterCheckOutDays: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className={`w-14 px-1.5 py-1 text-xs text-center rounded border ${
                        triggers.afterCheckOut
                          ? 'bg-white border-[#c6c6cd] text-[#191c1e]'
                          : 'bg-[#e0e3e5] border-transparent text-[#76777d]'
                      }`}
                    />
                    <span className="text-[11px] text-[#76777d]">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Subject & Merge Tags Palette */}
            <div className="bg-white rounded-xl p-5 border border-[#e1e2e4] shadow-xs space-y-4">
              <div className="pb-2 border-b border-[#f0f1f3] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0058be]">mail</span>
                    Email Content & Merge Tags
                  </h3>
                  <p className="text-[11px] text-[#76777d]">
                    Click any dynamic merge variable pill to insert it into the subject or body.
                  </p>
                </div>

                {/* Tab selector */}
                <div className="flex bg-[#eceef0] p-0.5 rounded-lg border border-[#c6c6cd]/40 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      activeTab === 'editor'
                        ? 'bg-white text-[#0058be] shadow-xs'
                        : 'text-[#76777d] hover:text-[#191c1e]'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'preview'
                        ? 'bg-white text-[#0058be] shadow-xs'
                        : 'text-[#76777d] hover:text-[#191c1e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    Live Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'html'
                        ? 'bg-white text-[#0058be] shadow-xs'
                        : 'text-[#76777d] hover:text-[#191c1e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">code</span>
                    HTML
                  </button>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#191c1e]">
                    Subject Line <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveField('subject')}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                      activeField === 'subject'
                        ? 'bg-[#0058be]/10 text-[#0058be] font-bold'
                        : 'text-[#76777d] hover:text-[#191c1e]'
                    }`}
                  >
                    {activeField === 'subject' ? '● Active Target for Variables' : 'Target for Variables'}
                  </button>
                </div>
                <input
                  ref={subjectInputRef}
                  type="text"
                  value={subject}
                  onFocus={() => setActiveField('subject')}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
                  }}
                  placeholder="e.g. Your Reservation Confirmation - {{hotel_name}}"
                  className={`w-full px-3 py-2 text-xs bg-[#f8f9fb] rounded-lg border ${
                    errors.subject ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]'
                  } focus:outline-hidden focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors`}
                />
                {errors.subject && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.subject}</p>}
              </div>

              {/* Dynamic Variables Palette */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#76777d]">
                    Dynamic Variable Tags (Click to Insert)
                  </span>
                  <span className="text-[11px] text-[#76777d]">
                    Inserting into:{' '}
                    <strong className="text-[#0058be]">
                      {activeField === 'subject' ? 'Subject' : 'Email Body'}
                    </strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#f8f9fb] rounded-lg border border-[#e1e2e4]">
                  {MERGE_TAGS.map((m) => (
                    <button
                      key={m.tag}
                      type="button"
                      onClick={() => insertTag(m.tag)}
                      title={`Sample: ${m.sample}`}
                      className="px-2 py-1 bg-white hover:bg-[#0058be]/10 text-[#0058be] hover:border-[#0058be] border border-[#c6c6cd]/80 rounded-md text-[11px] font-mono font-medium shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">add</span>
                      {m.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Tabs Display */}
              {activeTab === 'editor' && (
                <div>
                  {/* Rich Text Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#f0f1f3] rounded-t-lg border border-b-0 border-[#c6c6cd]">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => wrapSelectionWithTags('<strong>', '</strong>')}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] text-xs font-bold border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => wrapSelectionWithTags('<em>', '</em>')}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] text-xs italic font-serif border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      title="Underline"
                      onClick={() => wrapSelectionWithTags('<u>', '</u>')}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] text-xs underline border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      <u>U</u>
                    </button>
                    <div className="w-[1px] h-4 bg-[#c6c6cd] mx-1" />
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => wrapSelectionWithTags('<h2>', '</h2>')}
                      className="px-1.5 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] text-xs font-bold border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      title="Paragraph"
                      onClick={() => wrapSelectionWithTags('<p>', '</p>')}
                      className="px-1.5 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] text-xs font-bold border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      P
                    </button>
                    <button
                      type="button"
                      title="Unordered List"
                      onClick={() =>
                        wrapSelectionWithTags('<ul>\n  <li>', '</li>\n  <li>Item 2</li>\n</ul>')
                      }
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    </button>
                    <button
                      type="button"
                      title="Horizontal Divider"
                      onClick={() => wrapSelectionWithTags('<hr/>\n', '')}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white text-[#45464d] border border-transparent hover:border-[#c6c6cd] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
                    </button>
                    <div className="w-[1px] h-4 bg-[#c6c6cd] mx-1" />
                    <button
                      type="button"
                      title="Action Button Style"
                      onClick={() =>
                        wrapSelectionWithTags(
                          '<p style="text-align: center; margin: 20px 0;"><a href="{{survey_link}}" style="background-color: #0058be; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">',
                          '</a></p>'
                        )
                      }
                      className="px-2 h-7 flex items-center gap-1 rounded bg-[#0058be]/10 hover:bg-[#0058be]/20 text-[#0058be] text-[11px] font-semibold border border-[#0058be]/30 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">smart_button</span>
                      Insert CTA Button
                    </button>
                  </div>

                  {/* Body Textarea */}
                  <textarea
                    ref={bodyTextareaRef}
                    rows={10}
                    value={body}
                    onFocus={() => setActiveField('body')}
                    onChange={(e) => {
                      setBody(e.target.value);
                      if (errors.body) setErrors((prev) => ({ ...prev, body: '' }));
                    }}
                    placeholder="Write or format your email template HTML here..."
                    className={`w-full px-3 py-2 text-xs font-mono bg-[#fdfdfd] rounded-b-lg border ${
                      errors.body ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]'
                    } focus:outline-hidden focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-colors leading-relaxed`}
                  />
                  {errors.body && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.body}</p>}
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="border border-[#c6c6cd] rounded-lg overflow-hidden bg-white shadow-xs">
                  {/* Email Simulator Window Header */}
                  <div className="bg-[#f0f1f3] px-4 py-2.5 border-b border-[#c6c6cd] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="font-semibold text-[#45464d] ml-2">Guest Email Client Simulation</span>
                    </div>
                    <span className="text-[11px] text-[#76777d]">Rendered with mock reservation data</span>
                  </div>

                  <div className="p-4 border-b border-[#f0f1f3] bg-[#f8f9fb] space-y-1.5 text-xs text-[#45464d]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#76777d] w-14 font-medium">From:</span>
                      <span className="font-semibold text-[#191c1e]">
                        {senderName || 'Grand Plaza Hotel'} &lt;{replyTo || 'reservations@grandplazatokyo.com'}&gt;
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#76777d] w-14 font-medium">To:</span>
                      <span className="text-[#191c1e]">Alexander Wright &lt;a.wright@example.com&gt;</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#76777d] w-14 font-medium">Subject:</span>
                      <span className="font-bold text-[#191c1e]">{renderedSubject}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white min-h-[220px]">
                    <div
                      className="prose prose-sm max-w-none text-[#191c1e] text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderedBody }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'html' && (
                <div>
                  <textarea
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#1e293b] text-emerald-400 rounded-lg border border-slate-700 focus:outline-hidden focus:border-[#0058be] transition-colors leading-relaxed"
                  />
                  <p className="text-[11px] text-[#76777d] mt-1">
                    Directly editing raw HTML email layout. Ensure inline styles are used for maximum email client compatibility.
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="bg-white px-6 py-4 border-t border-[#e1e2e4] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                addToast('Test email dispatched to current logged in staff address', 'info');
              }}
              className="px-3 py-2 text-xs font-medium text-[#0058be] hover:bg-[#0058be]/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Send Test Simulation
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeEmailTemplateDrawer}
                className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold bg-[#0058be] text-white hover:bg-[#00469b] active:scale-[0.98] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {drawerEmailTemplate ? 'Update Template' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
