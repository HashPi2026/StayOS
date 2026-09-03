import React, { useState, useEffect } from 'react';
import { useProperty } from '../context/PropertyContext';
import { UserAccountItem, PermissionActionSet } from '../types';

export const InviteUserModal: React.FC = () => {
  const {
    isInviteUserModalOpen,
    drawerUser,
    closeInviteUserModal,
    addUser,
    updateUser,
    roles,
  } = useProperty();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    department: string;
    roleId: string;
    status: 'active' | 'inactive';
    sendInviteEmail: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    department: 'Front Desk & Guest Services',
    roleId: '',
    status: 'active',
    sendInviteEmail: true,
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string; roleId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isInviteUserModalOpen) {
      if (drawerUser) {
        setFormData({
          name: drawerUser.name,
          email: drawerUser.email,
          phone: drawerUser.phone || '',
          department: drawerUser.department || 'Front Desk & Guest Services',
          roleId: drawerUser.roleId,
          status: drawerUser.status,
          sendInviteEmail: false,
        });
      } else {
        const defaultRoleId = roles[0]?.id || 'role-1';
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: 'Front Desk & Guest Services',
          roleId: defaultRoleId,
          status: 'active',
          sendInviteEmail: true,
        });
      }
      setErrors({});
    }
  }, [isInviteUserModalOpen, drawerUser, roles]);

  if (!isInviteUserModalOpen) return null;

  const selectedRole = roles.find((r) => r.id === formData.roleId);

  // Calculate permission summary for preview
  const permissionSummary = React.useMemo(() => {
    if (!selectedRole || !selectedRole.permissions) return { full: 0, read: 0, total: 0 };
    const perms = Object.values(selectedRole.permissions) as PermissionActionSet[];
    let full = 0;
    let read = 0;
    perms.forEach((p) => {
      if (p.view && (p.add || p.edit || p.delete)) full++;
      else if (p.view) read++;
    });
    return { full, read, total: perms.length };
  }, [selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; roleId?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const initials = formData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const roleName = selectedRole?.name || 'Staff';
    const roleType = selectedRole?.type || 'FrontOffice';

    if (drawerUser) {
      const success = updateUser(drawerUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        department: formData.department,
        roleId: formData.roleId,
        roleName,
        roleType,
        initials,
        status: formData.status,
      });
      setIsSubmitting(false);
      if (success) {
        closeInviteUserModal();
      }
    } else {
      const success = addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        department: formData.department,
        roleId: formData.roleId,
        roleName,
        roleType,
        initials,
        status: formData.status,
        lastLogin: 'Never logged in',
      });
      setIsSubmitting(false);
      if (success) {
        closeInviteUserModal();
      }
    }
  };

  const getRoleBadgeStyle = (type?: string) => {
    switch (type) {
      case 'SuperAdmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Management':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FrontOffice':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Operations':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Finance':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="invite-user-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={closeInviteUserModal}
    >
      <div
        id="invite-user-modal-card"
        className="bg-white rounded-xl shadow-2xl border border-[#c6c6cd]/60 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
              <span className="material-symbols-outlined text-[24px]">
                {drawerUser ? 'manage_accounts' : 'person_add'}
              </span>
            </div>
            <div>
              <h2 className="text-title-sm font-semibold text-[#191c1e]">
                {drawerUser ? 'Edit User Account' : 'Invite New Team Member'}
              </h2>
              <p className="text-body-xs text-[#75859d]">
                {drawerUser
                  ? 'Update user profile, contact details, and assigned access role.'
                  : 'Send an invitation link and assign a role-based permission profile.'}
              </p>
            </div>
          </div>
          <button
            id="close-invite-user-modal-btn"
            onClick={closeInviteUserModal}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#75859d] hover:bg-[#e2e8f0] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#75859d]">
                  person
                </span>
                <input
                  id="user-fullname-input"
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-body-sm rounded-lg border ${
                    errors.name ? 'border-red-500 bg-red-50/30' : 'border-[#c6c6cd] bg-white'
                  } text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-transparent`}
                />
              </div>
              {errors.name && <p className="text-[12px] text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#75859d]">
                  mail
                </span>
                <input
                  id="user-email-input"
                  type="email"
                  required
                  placeholder="e.g. e.vance@grandplaza.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-body-sm rounded-lg border ${
                    errors.email ? 'border-red-500 bg-red-50/30' : 'border-[#c6c6cd] bg-white'
                  } text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-transparent`}
                />
              </div>
              {errors.email && <p className="text-[12px] text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#75859d]">
                  call
                </span>
                <input
                  id="user-phone-input"
                  type="text"
                  placeholder="+81 3-5809-1000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-body-sm rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-transparent"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                Department
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#75859d]">
                  corporate_fare
                </span>
                <select
                  id="user-department-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-body-sm rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-transparent"
                >
                  <option value="Front Desk & Guest Services">Front Desk & Guest Services</option>
                  <option value="Housekeeping & Facilities">Housekeeping & Facilities</option>
                  <option value="General Hotel Operations">General Hotel Operations</option>
                  <option value="Accounting & Payroll">Accounting & Payroll</option>
                  <option value="Executive Administration">Executive Administration</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Security & IT">Security & IT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#75859d]">
                admin_panel_settings
              </span>
              <select
                id="user-role-select"
                value={formData.roleId}
                onChange={(e) => {
                  setFormData({ ...formData, roleId: e.target.value });
                  if (errors.roleId) setErrors({ ...errors, roleId: undefined });
                }}
                className={`w-full pl-9 pr-3 py-2 text-body-sm rounded-lg border ${
                  errors.roleId ? 'border-red-500 bg-red-50/30' : 'border-[#c6c6cd] bg-white'
                } text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-transparent`}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code}) — {r.type}
                  </option>
                ))}
              </select>
            </div>
            {errors.roleId && <p className="text-[12px] text-red-600 mt-1">{errors.roleId}</p>}
          </div>

          {/* Role Preview Card */}
          {selectedRole && (
            <div className="p-3.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-body-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#191c1e]">{selectedRole.name}</span>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${getRoleBadgeStyle(
                      selectedRole.type
                    )}`}
                  >
                    {selectedRole.code}
                  </span>
                </div>
                <span className="text-[12px] text-[#75859d]">
                  {selectedRole.usersCount} users currently assigned
                </span>
              </div>
              <p className="text-[#45464d] text-[13px]">{selectedRole.description}</p>
              <div className="flex items-center gap-3 pt-1 border-t border-[#e2e8f0] text-[12px] text-[#64748b]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                  {permissionSummary.full} screens full access
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-sky-600">visibility</span>
                  {permissionSummary.read} screens read-only
                </span>
              </div>
            </div>
          )}

          {/* Account Status & Send Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e2e8f0]">
            <div>
              <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                Account Status
              </label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-body-xs text-[#191c1e]">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData({ ...formData, status: 'active' })}
                    className="text-[#0058be] focus:ring-[#0058be]"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-body-xs text-[#191c1e]">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 'inactive'}
                    onChange={() => setFormData({ ...formData, status: 'inactive' })}
                    className="text-[#0058be] focus:ring-[#0058be]"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Inactive
                  </span>
                </label>
              </div>
            </div>

            {!drawerUser && (
              <div className="flex items-center pt-3">
                <label className="flex items-center gap-2 cursor-pointer text-body-xs text-[#191c1e]">
                  <input
                    type="checkbox"
                    checked={formData.sendInviteEmail}
                    onChange={(e) => setFormData({ ...formData, sendInviteEmail: e.target.checked })}
                    className="rounded border-[#c6c6cd] text-[#0058be] focus:ring-[#0058be]"
                  />
                  <span>Send invitation & setup email</span>
                </label>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-3">
          <button
            id="cancel-user-modal-btn"
            type="button"
            onClick={closeInviteUserModal}
            className="px-4 py-2 text-body-sm font-medium text-[#45464d] bg-white border border-[#c6c6cd] rounded-lg hover:bg-[#f1f3f5] transition-colors"
          >
            Cancel
          </button>
          <button
            id="submit-user-modal-btn"
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-body-sm font-medium text-white bg-[#0058be] rounded-lg hover:bg-[#00479e] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {drawerUser ? 'save' : 'send'}
            </span>
            {drawerUser ? 'Save Changes' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};
