import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { EmailTemplateTriggers, EmailTemplateItem } from '@/src/types';

const PREVIEW_VARIABLES = [
  { tag: '{{Guest_Name}}', label: 'Guest Name', sample: 'Alex Doe' },
  { tag: '{{Reservation_ID}}', label: 'Reservation ID', sample: 'RES-8932A' },
  { tag: '{{Check_In_Date}}', label: 'Check-In Date', sample: 'Oct 24, 2023' },
  { tag: '{{Check_Out_Date}}', label: 'Check-Out Date', sample: 'Oct 28, 2023' },
  { tag: '{{Room_Type}}', label: 'Room Type', sample: 'Deluxe Ocean View' },
  { tag: '{{Hotel_Name}}', label: 'Hotel Name', sample: 'Grand Plaza Hotel' },
  { tag: '{{Guest_Email}}', label: 'Guest Email', sample: 'alex.doe@example.com' },
];

export const AddEmailTemplateView: React.FC = () => {
  const {
    editingEmailTemplateId,
    setEditingEmailTemplateId,
    emailTemplates,
    addEmailTemplate,
    updateEmailTemplate,
    navigate,
    addToast,
  } = useProperty();

  const isEditing = Boolean(editingEmailTemplateId);
  const existingTemplate = emailTemplates.find((t) => t.id === editingEmailTemplateId);

  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('Your upcoming stay at Grand Plaza Hotel');
  const [senderEmail] = useState('reservations@grandplaza.com');
  const [body, setBody] = useState(
    `Hello {{Guest_Name}},\n\nWe are thrilled to welcome you to Grand Plaza Hotel!\n\nYour booking for {{Check_In_Date}} is confirmed. Your reference number is {{Reservation_ID}}.\n\nIf you need to make any special requests or arrange airport transfer, please reply directly to this email or access your reservation portal here.\n\nWe look forward to seeing you soon.\n\nWarm regards,\nThe Grand Plaza Team`
  );

  const [triggers, setTriggers] = useState<EmailTemplateTriggers>({
    created: false,
    updated: false,
    cancelled: false,
    dob: false,
    beforeCheckIn: true,
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

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && existingTemplate) {
      setTemplateName(existingTemplate.name);
      setSubject(existingTemplate.subject);
      setBody(
        existingTemplate.body
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<strong>/gi, '')
          .replace(/<\/strong>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim() || existingTemplate.body
      );
      setTriggers({ ...existingTemplate.triggers });
    } else {
      setTemplateName('');
      setSubject('Your upcoming stay at Grand Plaza Hotel');
      setBody(
        `Hello {{Guest_Name}},\n\nWe are thrilled to welcome you to Grand Plaza Hotel!\n\nYour booking for {{Check_In_Date}} is confirmed. Your reference number is {{Reservation_ID}}.\n\nIf you need to make any special requests or arrange airport transfer, please reply directly to this email or access your reservation portal here.\n\nWe look forward to seeing you soon.\n\nWarm regards,\nThe Grand Plaza Team`
      );
      setTriggers({
        created: false,
        updated: false,
        cancelled: false,
        dob: false,
        beforeCheckIn: true,
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
  }, [isEditing, existingTemplate]);

  const insertVariable = (variableTag: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? body.length;
      const end = textarea.selectionEnd ?? body.length;
      const updated = body.slice(0, start) + variableTag + body.slice(end);
      setBody(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
      }, 50);
    } else {
      setBody((prev) => prev + variableTag);
    }
  };

  const wrapSelectedText = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = body.slice(start, end) || 'text';
    const updated = body.slice(0, start) + prefix + selected + suffix + body.slice(end);
    setBody(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    if (!templateName.trim()) {
      newErrors.templateName = 'Template name is required';
    }
    if (!subject.trim()) {
      newErrors.subject = 'Subject line is required';
    }
    if (!body.trim()) {
      newErrors.body = 'Email body content cannot be empty';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please fill out all required fields', 'error');
      return;
    }

    // Format body into HTML paragraphs if raw text
    const formattedBody = body
      .split('\n\n')
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');

    const templateData = {
      name: templateName.trim(),
      subject: subject.trim(),
      senderName: 'Grand Plaza Reservations',
      replyTo: senderEmail,
      status: 'active' as const,
      triggers,
      body: formattedBody,
    };

    if (isEditing && editingEmailTemplateId) {
      const ok = updateEmailTemplate(editingEmailTemplateId, templateData);
      if (ok) {
        setEditingEmailTemplateId(null);
        navigate('email-templates');
      }
    } else {
      const ok = addEmailTemplate(templateData);
      if (ok) {
        navigate('email-templates');
      }
    }
  };

  const handleCancel = () => {
    setEditingEmailTemplateId(null);
    navigate('email-templates');
  };

  // Live preview rendering with highlighted pill tags
  const renderPreviewBody = () => {
    // Break body into tokens or styled tags
    const lines = body.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line) return <div key={lineIdx} className="h-4" />;

      // Match variables like {{Guest_Name}}, {{Reservation_ID}}, etc.
      const parts = line.split(/(\{\{[^}]+\}\})/g);

      return (
        <p key={lineIdx} className={`mb-3 leading-relaxed text-[13px] text-[#191c1e] ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
          {parts.map((part, partIdx) => {
            const match = PREVIEW_VARIABLES.find(
              (v) => v.tag.toLowerCase() === part.toLowerCase() ||
                     v.tag.replace(/_/g, '').toLowerCase() === part.replace(/_/g, '').toLowerCase()
            );

            if (match) {
              return (
                <span
                  key={partIdx}
                  className="bg-[#d8e2ff] text-[#001a42] px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold inline-block mx-0.5"
                >
                  {match.sample}
                </span>
              );
            }

            if (part.startsWith('{{') && part.endsWith('}}')) {
              return (
                <span
                  key={partIdx}
                  className="bg-[#d8e2ff] text-[#001a42] px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold inline-block mx-0.5"
                >
                  {part.replace(/[{}]/g, '')}
                </span>
              );
            }

            // Highlight links
            if (part.includes('here') || part.includes('link') || part.includes('portal')) {
              const subparts = part.split(/(here|reservation portal)/gi);
              return subparts.map((sub, sIdx) => {
                if (sub.toLowerCase() === 'here' || sub.toLowerCase() === 'reservation portal') {
                  return (
                    <span key={sIdx} className="text-[#0058be] underline cursor-pointer font-medium">
                      {sub}
                    </span>
                  );
                }
                return <span key={sIdx}>{sub}</span>;
              });
            }

            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f7f9fb]">
      <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-28">
        {/* Breadcrumb Bar */}
        <div className="px-8 py-3.5 text-xs text-[#76777d] flex items-center gap-1 border-b border-[#e1e2e4] bg-white">
          <button
            type="button"
            onClick={() => navigate('rates-packages')}
            className="hover:text-[#0058be] transition-colors cursor-pointer"
          >
            Configuration
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Communications</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <button
            type="button"
            onClick={() => navigate('email-templates')}
            className="hover:text-[#0058be] transition-colors cursor-pointer"
          >
            E-mail Templates
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#191c1e] font-semibold">
            {isEditing ? 'Edit Template' : 'Add Template'}
          </span>
        </div>

        {/* Page Title */}
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
              {isEditing ? 'Edit E-mail Template' : 'Add New E-mail Template'}
            </h1>
            <p className="text-xs text-[#76777d] mt-1">
              Configure template content, merge placeholders, and automated trigger schedules.
            </p>
          </div>
        </div>

        {/* 12-Column Grid Layout */}
        <div className="px-8 grid grid-cols-12 gap-6">
          {/* Left Column (8 Cols): Forms & Settings */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* 1. Template Information Card */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e0e3e5] flex flex-col gap-4">
              <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0058be]">info</span>
                Template Information
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1.5" htmlFor="templateName">
                  Template Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="templateName"
                  type="text"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    if (errors.templateName) setErrors((prev) => ({ ...prev, templateName: '' }));
                  }}
                  placeholder="e.g., Pre-Arrival Welcome"
                  className={`w-full bg-[#f7f9fb] text-[#191c1e] px-3.5 py-2.5 rounded-lg border ${
                    errors.templateName ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]'
                  } focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-hidden transition-all text-xs`}
                />
                {errors.templateName && (
                  <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.templateName}</p>
                )}
              </div>
            </div>

            {/* 2. Lifecycle Triggers Card */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e0e3e5] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#f0f1f3]">
                <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0058be]">bolt</span>
                  Lifecycle Triggers
                </h2>
                <span className="text-xs text-[#76777d]">Select events to send this template</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2a. Reservation Block */}
                <div className="bg-[#f2f4f6] rounded-xl p-4 border border-[#e0e3e5]/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-3">
                    Reservation
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.created}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, created: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        Reservation Created
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.updated}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, updated: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        Reservation Updated
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.cancelled}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, cancelled: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        Reservation Cancelled
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2b. Check-in Block */}
                <div className="bg-[#f2f4f6] rounded-xl p-4 border border-[#e0e3e5]/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-3">
                    Check-in
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.beforeCheckIn}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, beforeCheckIn: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        Before Check-in
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.atCheckIn}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, atCheckIn: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        At Check-in
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.afterCheckIn}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, afterCheckIn: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        After Check-in
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2c. Check-out Block */}
                <div className="bg-[#f2f4f6] rounded-xl p-4 border border-[#e0e3e5]/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-3">
                    Check-out
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.beforeCheckOut}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, beforeCheckOut: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        Before Check-out
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.atCheckOut}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, atCheckOut: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        At Check-out
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.afterCheckOut}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, afterCheckOut: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        After Check-out
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2d. Other Block */}
                <div className="bg-[#f2f4f6] rounded-xl p-4 border border-[#e0e3e5]/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-3">
                    Other
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={triggers.dob}
                        onChange={(e) =>
                          setTriggers((prev) => ({ ...prev, dob: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#0058be] border-[#c6c6cd] focus:ring-[#0058be] accent-[#0058be] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#0058be] transition-colors">
                        Date of Birth
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Email Content Card */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e0e3e5] flex flex-col gap-4">
              <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0058be]">edit_document</span>
                Email Content
              </h2>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1.5" htmlFor="emailSubject">
                  Subject <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="emailSubject"
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
                  }}
                  placeholder="Your upcoming stay at Grand Plaza Hotel"
                  className={`w-full bg-[#f7f9fb] text-[#191c1e] px-3.5 py-2.5 rounded-lg border ${
                    errors.subject ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c6c6cd]'
                  } focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 outline-hidden transition-all text-xs`}
                />
                {errors.subject && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.subject}</p>}
              </div>

              {/* Rich Editor Container */}
              <div className="flex flex-col border border-[#c6c6cd] rounded-xl overflow-hidden bg-white shadow-2xs">
                {/* Editor Toolbar */}
                <div className="bg-[#eceef0] border-b border-[#c6c6cd] p-2 flex items-center justify-between flex-wrap gap-2">
                  {/* Left Controls: Formatting */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => wrapSelectedText('**', '**')}
                      className="p-1.5 rounded hover:bg-[#e0e3e5] transition-colors text-[#45464d] hover:text-[#191c1e] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">format_bold</span>
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => wrapSelectedText('*', '*')}
                      className="p-1.5 rounded hover:bg-[#e0e3e5] transition-colors text-[#45464d] hover:text-[#191c1e] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">format_italic</span>
                    </button>
                    <button
                      type="button"
                      title="Link"
                      onClick={() => wrapSelectedText('[', '](https://example.com)')}
                      className="p-1.5 rounded hover:bg-[#e0e3e5] transition-colors text-[#45464d] hover:text-[#191c1e] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">link</span>
                    </button>
                    <div className="w-[1px] h-4 bg-[#c6c6cd] mx-1" />
                    <button
                      type="button"
                      title="Align Left"
                      onClick={() => setTextAlign('left')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        textAlign === 'left' ? 'bg-white text-[#0058be] shadow-2xs' : 'text-[#45464d] hover:bg-[#e0e3e5]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                    </button>
                    <button
                      type="button"
                      title="Align Center"
                      onClick={() => setTextAlign('center')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        textAlign === 'center' ? 'bg-white text-[#0058be] shadow-2xs' : 'text-[#45464d] hover:bg-[#e0e3e5]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">format_align_center</span>
                    </button>
                    <button
                      type="button"
                      title="Align Right"
                      onClick={() => setTextAlign('right')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        textAlign === 'right' ? 'bg-white text-[#0058be] shadow-2xs' : 'text-[#45464d] hover:bg-[#e0e3e5]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">format_align_right</span>
                    </button>
                  </div>

                  {/* Right Controls: Variable Tags */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                      Variables:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PREVIEW_VARIABLES.slice(0, 4).map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => insertVariable(v.tag)}
                          title={`Insert ${v.label}`}
                          className="px-2 py-1 bg-[#e0e3e5] hover:bg-[#0058be] hover:text-white rounded text-mono font-mono text-[11px] text-[#45464d] transition-colors cursor-pointer"
                        >
                          {v.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    if (errors.body) setErrors((prev) => ({ ...prev, body: '' }));
                  }}
                  rows={14}
                  placeholder="Compose your email here..."
                  className={`w-full p-4 bg-transparent text-[#191c1e] resize-none outline-hidden text-xs leading-relaxed font-sans ${
                    textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'
                  }`}
                />
              </div>
              {errors.body && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.body}</p>}
            </div>
          </div>

          {/* Right Column (4 Cols): Live Preview (Sticky) */}
          <div className="col-span-12 lg:col-span-4 h-full sticky top-[72px]">
            <div className="bg-white rounded-xl shadow-xs border border-[#e0e3e5] flex flex-col overflow-hidden max-h-[calc(100vh-140px)]">
              {/* Preview Header */}
              <div className="bg-[#f2f4f6] border-b border-[#e0e3e5] px-4 py-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#191c1e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">preview</span>
                  Live Preview
                </h2>

                {/* Desktop / Mobile Switcher */}
                <div className="flex bg-[#e0e3e5] rounded-lg p-0.5 border border-[#c6c6cd]/50">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    title="Desktop Preview"
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      previewMode === 'desktop'
                        ? 'bg-white text-[#191c1e] shadow-2xs'
                        : 'text-[#76777d] hover:text-[#191c1e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    title="Mobile Preview"
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      previewMode === 'mobile'
                        ? 'bg-white text-[#191c1e] shadow-2xs'
                        : 'text-[#76777d] hover:text-[#191c1e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">smartphone</span>
                  </button>
                </div>
              </div>

              {/* Preview Device Viewport Container */}
              <div className="flex-1 bg-[#d8dadc] overflow-y-auto p-4 flex justify-center items-start min-h-[420px]">
                <div
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 border border-[#c6c6cd] w-full ${
                    previewMode === 'mobile'
                      ? 'max-w-[340px] rounded-3xl border-4 border-slate-700 shadow-xl'
                      : 'max-w-[700px]'
                  }`}
                >
                  {/* Mock Email Client Header */}
                  <div className="bg-[#eceef0] border-b border-[#e0e3e5] px-4 py-3 flex flex-col gap-1.5 text-xs text-[#45464d]">
                    <div className="flex items-center">
                      <span className="w-16 font-medium text-[#76777d]">From:</span>
                      <span className="text-[#191c1e] font-medium">{senderEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 font-medium text-[#76777d]">To:</span>
                      <span className="bg-[#d8e2ff] text-[#001a42] font-mono text-[11px] font-semibold px-2 py-0.5 rounded">
                        alex.doe@example.com
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="w-16 font-medium text-[#76777d]">Subject:</span>
                      <span className="text-[#191c1e] font-semibold">
                        {subject || '(No subject specified)'}
                      </span>
                    </div>
                  </div>

                  {/* Rendered Email Body */}
                  <div className="p-5 font-sans text-xs text-[#191c1e] bg-white leading-relaxed">
                    {renderPreviewBody()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#c6c6cd]/60 z-40 flex items-center justify-end px-8 gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 rounded-lg text-xs font-semibold text-[#191c1e] bg-transparent border border-[#76777d]/60 hover:bg-[#e0e3e5] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 rounded-lg text-xs font-semibold bg-[#191c1e] text-white hover:bg-[#2d3133] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Template
        </button>
      </div>
    </div>
  );
};
