import React, { useState, useEffect } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { UserAccountItem, RoleType } from '@/src/types';

export const AddUserView: React.FC = () => {
  const {
    users,
    roles,
    editingUserId,
    setEditingUserId,
    addUser,
    updateUser,
    navigate,
    addToast,
  } = useProperty();

  const isEditing = Boolean(editingUserId);
  const existingUser = users.find((u) => u.id === editingUserId);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    roleId: string;
    roleName: string;
    roleType: RoleType;
    department: string;
    description: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    email: '',
    roleId: '',
    roleName: '',
    roleType: 'FrontOffice',
    department: '',
    description: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    roleId?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when editing or creating
  useEffect(() => {
    if (existingUser) {
      setFormData({
        name: existingUser.name,
        email: existingUser.email,
        roleId: existingUser.roleId,
        roleName: existingUser.roleName,
        roleType: existingUser.roleType,
        department: existingUser.department || '',
        description: existingUser.description || '',
        status: existingUser.status,
      });
    } else {
      // Default to first available role if any
      const defaultRole = roles[0];
      setFormData({
        name: '',
        email: '',
        roleId: defaultRole ? defaultRole.id : '',
        roleName: defaultRole ? defaultRole.name : '',
        roleType: defaultRole ? defaultRole.type : 'FrontOffice',
        department: defaultRole ? defaultRole.type : 'FrontOffice',
        description: '',
        status: 'active',
      });
    }
  }, [existingUser, roles]);

  // Role summaries dictionary
  const roleSummaries: Record<string, string> = {
    'front_desk_manager': 'Full access to reservations, front desk modules, and shift reporting.',
    'receptionist': 'Basic access to check-in/out, folio management, and guest profiles.',
    'night_auditor': 'Access to front desk modules and end-of-day financial reconciliation tools.',
    'housekeeping_supervisor': 'Full access to room status management, maintenance ticketing, and staff assignment.',
    'maintenance': 'View access to room statuses and edit access for assigned maintenance tickets.',
    'security': 'Read-only access to guest logs and incident reporting tools.',
    'superadmin': 'Unrestricted system access, including billing, integrations, and global settings.',
    'system_admin': 'Access to user management, roles, and technical configurations.',
    'general_manager': 'High-level managerial oversight across folios, financial ledger, and operational KPIs.',
    'financial_controller': 'Comprehensive billing audits, ledger accounts, and transaction reconciliations.',
  };

  // Get active summary for selected role
  const getSelectedRoleSummary = () => {
    if (!formData.roleId) return null;
    const matchingRole = roles.find((r) => r.id === formData.roleId);
    if (!matchingRole) return null;

    // Check predefined summaries by normalized name/code
    const normalizedCode = (matchingRole.code || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const normalizedName = matchingRole.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    for (const [key, text] of Object.entries(roleSummaries)) {
      if (
        normalizedName.includes(key) ||
        key.includes(normalizedName) ||
        normalizedCode.includes(key) ||
        key.includes(normalizedCode)
      ) {
        return text;
      }
    }

    if (matchingRole.description) {
      return matchingRole.description;
    }

    switch (matchingRole.type) {
      case 'FrontOffice':
        return 'Standard access to front-desk operations, reservations, room chart, and guest registration.';
      case 'Operations':
        return 'Access to housekeeping status, room readiness, maintenance logs, and facilities.';
      case 'SuperAdmin':
        return 'Unrestricted system access including global settings, security policies, and user accounts.';
      case 'Finance':
        return 'Access to cashiering folios, invoicing, tax configurations, and financial reports.';
      case 'Management':
        return 'Full property oversight with read & reporting privileges across all departments.';
      default:
        return 'Configured with custom role permissions and module access privileges.';
    }
  };

  const handleRoleChange = (selectedRoleId: string) => {
    const selected = roles.find((r) => r.id === selectedRoleId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        roleId: selected.id,
        roleName: selected.name,
        roleType: selected.type,
        department: selected.type,
      }));
      if (errors.roleId) {
        setErrors((prev) => ({ ...prev, roleId: undefined }));
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; roleId?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'User name is required';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role selection is required';
    }

    // If email provided, validate format; if not provided, generate a sensible default
    let finalEmail = formData.email.trim();
    if (finalEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      const cleanName = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      finalEmail = `${cleanName}@grandplazahotel.com`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    const initials = formData.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'US';

    setTimeout(() => {
      if (isEditing && existingUser) {
        updateUser(existingUser.id, {
          name: formData.name.trim(),
          email: finalEmail,
          roleId: formData.roleId,
          roleName: formData.roleName,
          roleType: formData.roleType,
          department: formData.department,
          description: formData.description.trim(),
          status: formData.status,
          initials,
        });
        addToast(`User account "${formData.name}" updated successfully`, 'success');
      } else {
        addUser({
          name: formData.name.trim(),
          email: finalEmail,
          roleId: formData.roleId,
          roleName: formData.roleName,
          roleType: formData.roleType,
          department: formData.department,
          description: formData.description.trim(),
          status: formData.status,
          lastLogin: 'Never',
          initials,
        });
        addToast(`User "${formData.name}" added successfully`, 'success');
      }

      setIsSaving(false);
      setEditingUserId(null);
      navigate('user-management');
    }, 200);
  };

  const handleCancel = () => {
    setEditingUserId(null);
    navigate('user-management');
  };

  const activeRoleSummary = getSelectedRoleSummary();

  // Group roles for dropdown optgroups
  const frontOfficeRoles = roles.filter((r) => r.type === 'FrontOffice');
  const operationsRoles = roles.filter(
    (r) => r.type === 'Operations' || r.type === 'Housekeeping' || r.type === 'Security'
  );
  const adminRoles = roles.filter((r) => r.type === 'SuperAdmin');
  const managementRoles = roles.filter(
    (r) => r.type === 'Management' || r.type === 'Finance' || r.type === 'Sales'
  );
  const otherRoles = roles.filter(
    (r) =>
      !frontOfficeRoles.includes(r) &&
      !operationsRoles.includes(r) &&
      !adminRoles.includes(r) &&
      !managementRoles.includes(r)
  );

  return (
    <div className="flex-1 flex flex-col bg-[#f7f9fb] min-h-screen">
      {/* Top Main Container */}
      <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col">
        {/* Breadcrumb & Header */}
        <div className="mb-8 flex flex-col gap-2">
          <nav className="flex items-center text-[13px] text-[#75859d] gap-1.5 font-medium">
            <span
              onClick={() => navigate('overview')}
              className="hover:text-[#191c1e] cursor-pointer transition-colors"
            >
              Configuration
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">
              chevron_right
            </span>
            <span
              onClick={() => navigate('user-management')}
              className="hover:text-[#191c1e] cursor-pointer transition-colors"
            >
              User Management
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">
              chevron_right
            </span>
            <span className="text-[#191c1e] font-semibold">
              {isEditing ? 'Edit User' : 'Add User'}
            </span>
          </nav>
          <h1 className="text-2xl lg:text-[26px] font-bold text-[#191c1e] tracking-tight">
            {isEditing ? `Edit User: ${existingUser?.name || 'Account'}` : 'Add New User'}
          </h1>
        </div>

        {/* Bento Grid Form Section */}
        <form onSubmit={handleSave} className="grid grid-cols-12 gap-8 items-start flex-1">
          {/* Form Left Section (8 cols) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* Section 1: User Information */}
            <section className="bg-white rounded-xl p-6 lg:p-8 shadow-xs border border-[#e2e8f0] flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[#0058be] text-[24px]">
                  person_add
                </span>
                <h2 className="text-[18px] font-semibold text-[#191c1e]">User Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Name */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label
                    htmlFor="userName"
                    className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase flex gap-1 items-center"
                  >
                    User Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75859d] group-focus-within:text-[#0058be] transition-colors pointer-events-none text-[20px]">
                      badge
                    </span>
                    <input
                      id="userName"
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={`w-full bg-[#f8fafc] pl-10.5 pr-4 py-2.5 rounded-lg text-body-md text-[#191c1e] placeholder:text-[#94a3b8] outline-none border ${
                        errors.name
                          ? 'border-red-500 bg-red-50/20'
                          : 'border-[#c6c6cd]/80 focus:border-[#0058be]'
                      } focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-[12px] text-red-600 mt-0.5">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label
                    htmlFor="userEmail"
                    className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase flex gap-1 items-center"
                  >
                    Work Email Address
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75859d] group-focus-within:text-[#0058be] transition-colors pointer-events-none text-[20px]">
                      mail
                    </span>
                    <input
                      id="userEmail"
                      type="email"
                      placeholder="e.g. staff.member@grandplazahotel.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`w-full bg-[#f8fafc] pl-10.5 pr-4 py-2.5 rounded-lg text-body-md text-[#191c1e] placeholder:text-[#94a3b8] outline-none border ${
                        errors.email
                          ? 'border-red-500 bg-red-50/20'
                          : 'border-[#c6c6cd]/80 focus:border-[#0058be]'
                      } focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[12px] text-red-600 mt-0.5">{errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label
                    htmlFor="userRole"
                    className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase flex gap-1 items-center"
                  >
                    Role <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75859d] group-focus-within:text-[#0058be] transition-colors pointer-events-none text-[20px]">
                      manage_accounts
                    </span>
                    <select
                      id="userRole"
                      required
                      value={formData.roleId}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full bg-[#f8fafc] pl-10.5 pr-10 py-2.5 rounded-lg text-body-md text-[#191c1e] appearance-none outline-none border border-[#c6c6cd]/80 focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 transition-all cursor-pointer"
                    >
                      <option disabled value="">
                        Select a role
                      </option>

                      {frontOfficeRoles.length > 0 && (
                        <optgroup
                          className="font-semibold text-[#45464d] bg-[#f1f5f9]"
                          label="Front Office"
                        >
                          {frontOfficeRoles.map((r) => (
                            <option key={r.id} className="text-[#191c1e] font-normal" value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {operationsRoles.length > 0 && (
                        <optgroup
                          className="font-semibold text-[#45464d] bg-[#f1f5f9]"
                          label="Operations & Housekeeping"
                        >
                          {operationsRoles.map((r) => (
                            <option key={r.id} className="text-[#191c1e] font-normal" value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {adminRoles.length > 0 && (
                        <optgroup
                          className="font-semibold text-[#45464d] bg-[#f1f5f9]"
                          label="Administration"
                        >
                          {adminRoles.map((r) => (
                            <option key={r.id} className="text-[#191c1e] font-normal" value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {managementRoles.length > 0 && (
                        <optgroup
                          className="font-semibold text-[#45464d] bg-[#f1f5f9]"
                          label="Management & Finance"
                        >
                          {managementRoles.map((r) => (
                            <option key={r.id} className="text-[#191c1e] font-normal" value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {otherRoles.length > 0 && (
                        <optgroup
                          className="font-semibold text-[#45464d] bg-[#f1f5f9]"
                          label="Other Roles"
                        >
                          {otherRoles.map((r) => (
                            <option key={r.id} className="text-[#191c1e] font-normal" value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75859d] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>

                  {/* Role Summary Info Box */}
                  {activeRoleSummary && (
                    <div
                      id="roleSummaryContainer"
                      className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      <div className="bg-[#e8f0fe] border border-[#0058be]/20 rounded-lg p-3 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#0058be] text-[18px] mt-[1px] shrink-0">
                          info
                        </span>
                        <p className="text-[13px] text-[#334155] leading-relaxed">
                          {activeRoleSummary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label
                    htmlFor="userDescription"
                    className="text-[12px] font-semibold tracking-wider text-[#45464d] uppercase"
                  >
                    Description
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#75859d] group-focus-within:text-[#0058be] transition-colors pointer-events-none text-[20px]">
                      description
                    </span>
                    <textarea
                      id="userDescription"
                      rows={3}
                      placeholder="Add notes about this user (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-[#f8fafc] pl-10.5 pr-4 py-2.5 rounded-lg text-body-md text-[#191c1e] placeholder:text-[#94a3b8] outline-none border border-[#c6c6cd]/80 focus:border-[#0058be] focus:bg-white focus:ring-2 focus:ring-[#0058be]/20 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Account Status */}
            <section className="bg-white rounded-xl p-6 lg:p-8 shadow-xs border border-[#e2e8f0] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45464d] text-[24px]">
                    security
                  </span>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#191c1e]">Account Status</h2>
                    <p className="text-[13px] text-[#75859d]">
                      Control user access and login authorization to the system
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be] group-hover:shadow-xs transition-shadow" />
                  <span
                    className={`ml-2.5 text-[14px] font-medium transition-colors ${
                      formData.status === 'active'
                        ? 'text-[#0058be] font-semibold'
                        : 'text-[#75859d]'
                    }`}
                  >
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* Contextual Bento Sidebar Column (4 cols) */}
          <div className="hidden lg:flex col-span-12 lg:col-span-4 flex-col gap-6">
            {/* Card 1: Secure Access Info */}
            <div className="bg-[#eceef0] rounded-xl p-6 overflow-hidden relative shadow-xs group border border-[#e2e8f0]">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-11 h-11 bg-[#000000] rounded-xl flex items-center justify-center shadow-md text-white">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#191c1e]">Secure Access Management</h3>
                <p className="text-[13px] text-[#45464d] leading-relaxed">
                  Assign roles carefully. Changes take effect immediately across all StayOS
                  modules. Administrative roles grant access to sensitive financial records and
                  system configurations.
                </p>
                <div className="mt-1 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[#191c1e]">
                    <span className="material-symbols-outlined text-[17px] text-[#0058be]">
                      check_circle
                    </span>
                    Audit logging active
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[#191c1e]">
                    <span className="material-symbols-outlined text-[17px] text-[#0058be]">
                      check_circle
                    </span>
                    2FA required for Admin
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[#191c1e]">
                    <span className="material-symbols-outlined text-[17px] text-[#0058be]">
                      check_circle
                    </span>
                    Instant privilege sync
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Keycard Integration Visual Asset */}
            <div
              className="w-full h-48 bg-cover bg-center rounded-xl shadow-xs relative overflow-hidden border border-[#e2e8f0]"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRGNyXStfHNaChAPcGZiqO-rvgEw0CKpjSQ7BLTFM8x6ISUGTxmAQiBYg2BX0HEI_rT6pEf6XxNdUW4K54WViDJau10f1ufe2ehwA4bMcvdnzGKF2dL7U7cWsUoFfynUaZ9B7acEqeQjA9zzRjrq91W5gWo4U2SxE4MDVZLTMHb3kwVgPvz7uUPhfDwk3qL_3rSSLM7Q-SI4P0H18SAlKs383ci1_TsJ2U9rrSJlJA_Sviywy68v6Q')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                <span className="text-white text-[13px] font-medium tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  Keycard Integration Available
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Footer Actions */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-[#e2e8f0] py-4 px-6 lg:px-8 flex justify-end gap-3 z-30 shadow-xs">
        <button
          id="cancel-user-btn"
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-[13px] font-bold tracking-wider uppercase hover:bg-[#f1f3f5] transition-colors bg-white cursor-pointer"
        >
          Cancel
        </button>
        <button
          id="save-user-btn"
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-[#000000] text-white text-[13px] font-bold tracking-wider uppercase hover:bg-[#222222] active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {isSaving ? 'Saving...' : isEditing ? 'Update User' : 'Save User'}
        </button>
      </div>
    </div>
  );
};
