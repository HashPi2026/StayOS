import React, { useState, useEffect, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoleItem, RoleType, PermissionActionSet, PermissionModuleDef } from '@/src/types';
import { PERMISSION_MODULES } from '@/src/data/mockData';

export const RoleDrawer: React.FC = () => {
  const {
    isRoleDrawerOpen,
    drawerRole,
    closeRoleDrawer,
    addRole,
    updateRole,
    users,
    isRoleNameUnique,
    isRoleCodeUnique,
    addToast,
  } = useProperty();

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    type: RoleType;
    description: string;
    require2FA: boolean;
    restrictIP: boolean;
    sessionLimit: string;
    permissions: Record<string, PermissionActionSet>;
  }>({
    name: '',
    code: '',
    type: 'FrontOffice',
    description: '',
    require2FA: true,
    restrictIP: false,
    sessionLimit: 'unlimited',
    permissions: {},
  });

  const [searchModuleQuery, setSearchModuleQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize or reset form data when drawer opens or drawerRole changes
  useEffect(() => {
    if (isRoleDrawerOpen) {
      if (drawerRole) {
        setFormData({
          name: drawerRole.name,
          code: drawerRole.code,
          type: drawerRole.type,
          description: drawerRole.description || '',
          require2FA: true,
          restrictIP: false,
          sessionLimit: 'unlimited',
          permissions: JSON.parse(JSON.stringify(drawerRole.permissions || {})),
        });
      } else {
        // Initialize default permissions for new role
        const defaultPerms: Record<string, PermissionActionSet> = {};
        PERMISSION_MODULES.forEach((mod) => {
          defaultPerms[mod.id] = {
            view: false,
            add: false,
            edit: false,
            delete: false,
          };
        });

        // Set sensible defaults for FrontOffice
        if (defaultPerms['booking-list']) defaultPerms['booking-list'] = { view: true, add: true, edit: true, delete: false };
        if (defaultPerms['tape-chart']) defaultPerms['tape-chart'] = { view: true, add: true, edit: true, delete: false };
        if (defaultPerms['guest-folios']) defaultPerms['guest-folios'] = { view: true, add: true, edit: true, delete: false };
        if (defaultPerms['housekeeping-status']) defaultPerms['housekeeping-status'] = { view: true, add: false, edit: true, delete: false };

        setFormData({
          name: '',
          code: '',
          type: 'FrontOffice',
          description: '',
          require2FA: true,
          restrictIP: false,
          sessionLimit: 'unlimited',
          permissions: defaultPerms,
        });
      }
      setErrors({});
      setSearchModuleQuery('');
      setCollapsedGroups({});
    }
  }, [isRoleDrawerOpen, drawerRole]);

  // Group permission modules with filter
  const groupedModules = useMemo<Record<string, PermissionModuleDef[]>>(() => {
    const groups: Record<string, PermissionModuleDef[]> = {
      'Property Configuration': [],
      'Reservations': [],
      'Finance & Billing': [],
      'Operations & Maintenance': [],
      'User Management & Security': [],
    };

    PERMISSION_MODULES.forEach((mod) => {
      let groupKey = 'Property Configuration';
      if (mod.group === 'Reservations') groupKey = 'Reservations';
      else if (mod.group === 'Finance & Routing') groupKey = 'Finance & Billing';
      else if (mod.group === 'Operations') groupKey = 'Operations & Maintenance';
      else if (mod.group === 'User Management & System') groupKey = 'User Management & Security';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      const matchesSearch =
        searchModuleQuery.trim() === '' ||
        mod.name.toLowerCase().includes(searchModuleQuery.toLowerCase()) ||
        groupKey.toLowerCase().includes(searchModuleQuery.toLowerCase());

      if (matchesSearch) {
        groups[groupKey].push(mod);
      }
    });

    return groups;
  }, [searchModuleQuery]);

  // Assigned users for this role
  const assignedUsers = useMemo(() => {
    if (!drawerRole) return [];
    return users.filter((u) => u.roleId === drawerRole.id);
  }, [drawerRole, users]);

  if (!isRoleDrawerOpen) return null;

  const handleTogglePermission = (
    moduleId: string,
    action: keyof PermissionActionSet
  ) => {
    setFormData((prev) => {
      const currentMod = prev.permissions[moduleId] || {
        view: false,
        add: false,
        edit: false,
        delete: false,
      };

      const updatedVal = !currentMod[action];
      const updatedMod = { ...currentMod, [action]: updatedVal };

      // If enabling add, edit, or delete, ensure view is also enabled
      if (updatedVal && action !== 'view') {
        updatedMod.view = true;
      }
      // If disabling view, disable all write operations
      if (!updatedVal && action === 'view') {
        updatedMod.add = false;
        updatedMod.edit = false;
        updatedMod.delete = false;
      }

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: updatedMod,
        },
      };
    });
  };

  const handleSelectAll = (select: boolean) => {
    const updated: Record<string, PermissionActionSet> = {};
    PERMISSION_MODULES.forEach((mod) => {
      updated[mod.id] = {
        view: select && !mod.disabledActions?.view,
        add: select && !mod.disabledActions?.add,
        edit: select && !mod.disabledActions?.edit,
        delete: select && !mod.disabledActions?.delete,
      };
    });
    setFormData((prev) => ({ ...prev, permissions: updated }));
    addToast(select ? 'Granted full access across all modules' : 'Reset all module permissions', 'info');
  };

  const handleApplyPreset = (preset: 'readOnly' | 'fullAccess' | 'reset') => {
    const updated: Record<string, PermissionActionSet> = {};
    PERMISSION_MODULES.forEach((mod) => {
      if (preset === 'readOnly') {
        updated[mod.id] = {
          view: true,
          add: false,
          edit: false,
          delete: false,
        };
      } else if (preset === 'fullAccess') {
        updated[mod.id] = {
          view: true,
          add: !mod.disabledActions?.add,
          edit: !mod.disabledActions?.edit,
          delete: !mod.disabledActions?.delete,
        };
      } else {
        updated[mod.id] = {
          view: false,
          add: false,
          edit: false,
          delete: false,
        };
      }
    });
    setFormData((prev) => ({ ...prev, permissions: updated }));
    addToast(`Applied ${preset === 'readOnly' ? 'Read-Only' : preset === 'fullAccess' ? 'Full Access' : 'Clean Reset'} preset`, 'info');
  };

  const handleToggleGroup = (modules: PermissionModuleDef[]) => {
    const allHaveView = modules.every((m) => formData.permissions[m.id]?.view);
    const targetState = !allHaveView;

    setFormData((prev) => {
      const nextPerms = { ...prev.permissions };
      modules.forEach((mod) => {
        nextPerms[mod.id] = {
          view: targetState,
          add: targetState && !mod.disabledActions?.add,
          edit: targetState && !mod.disabledActions?.edit,
          delete: targetState && !mod.disabledActions?.delete,
        };
      });
      return { ...prev, permissions: nextPerms };
    });
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; code?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (!isRoleNameUnique(formData.name.trim(), drawerRole?.id)) {
      newErrors.name = 'A role with this name already exists';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Role code is required';
    } else if (formData.code.trim().length > 6) {
      newErrors.code = 'Role code cannot exceed 6 characters';
    } else if (!isRoleCodeUnique(formData.code.trim(), drawerRole?.id)) {
      newErrors.code = 'A role with this code already exists';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      let success = false;
      if (drawerRole) {
        success = updateRole(drawerRole.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          type: formData.type,
          description: formData.description.trim(),
          permissions: formData.permissions,
        });
      } else {
        success = addRole({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          type: formData.type,
          description: formData.description.trim(),
          usersCount: 0,
          permissions: formData.permissions,
        });
      }

      setIsSaving(false);
      if (success) {
        closeRoleDrawer();
      }
    }, 150);
  };

  return (
    <div id="role-drawer-container" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        id="role-drawer-backdrop"
        onClick={closeRoleDrawer}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div
        id="role-drawer-panel"
        className="relative w-full max-w-5xl bg-[#f8fafc] shadow-2xl flex flex-col h-full z-10 border-l border-[#c6c6cd]/50 animate-in slide-in-from-right duration-200 overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-8 py-5 bg-white border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={closeRoleDrawer}
              className="w-9 h-9 rounded-lg border border-[#e2e8f0] flex items-center justify-center text-[#75859d] hover:text-[#191c1e] hover:bg-[#f1f5f9] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#75859d]">
                <span>Configuration</span>
                <span>/</span>
                <span>User Management</span>
                <span>/</span>
                <span className="text-[#0058be]">{drawerRole ? 'Edit Role' : 'Add New Role'}</span>
              </div>
              <h2 className="text-title-md font-bold text-[#191c1e]">
                {drawerRole ? `Edit Role: ${drawerRole.name}` : 'Add New Role'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="discard-role-btn"
              type="button"
              onClick={closeRoleDrawer}
              className="px-4 py-2 text-body-sm font-medium text-[#45464d] bg-white border border-[#c6c6cd] rounded-lg hover:bg-[#f1f3f5] transition-colors"
            >
              Discard
            </button>
            <button
              id="save-role-btn"
              type="button"
              disabled={isSaving}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 text-body-sm font-medium text-white bg-[#0058be] rounded-lg hover:bg-[#00479e] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">shield</span>
              {isSaving ? 'Saving...' : 'Save Role & Permissions'}
            </button>
          </div>
        </div>

        {/* Form Body - Two Columns */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 Cols): Role Metadata & Security Policies */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Role Details */}
            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
              <h3 className="text-body-sm font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[20px]">badge</span>
                Role Details
              </h3>

              {/* Role Name */}
              <div>
                <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-role-name"
                  type="text"
                  required
                  placeholder="e.g. Front Desk Associate"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-3 py-2 text-body-sm rounded-lg border ${
                    errors.name ? 'border-red-500 bg-red-50/30' : 'border-[#c6c6cd] bg-white'
                  } text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]`}
                />
                {errors.name && <p className="text-[12px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Role Code & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                    Role Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-role-code"
                    type="text"
                    required
                    placeholder="e.g. FDA"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase().slice(0, 6),
                      });
                      if (errors.code) setErrors({ ...errors, code: undefined });
                    }}
                    className={`w-full px-3 py-2 text-body-sm font-mono uppercase rounded-lg border ${
                      errors.code ? 'border-red-500 bg-red-50/30' : 'border-[#c6c6cd] bg-white'
                    } text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]`}
                  />
                  {errors.code && <p className="text-[12px] text-red-600 mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                    Department
                  </label>
                  <select
                    id="select-role-type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as RoleType })
                    }
                    className="w-full px-3 py-2 text-body-sm rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  >
                    <option value="FrontOffice">Front Office</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance & Ledger</option>
                    <option value="Management">Executive Mgmt</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-body-xs font-medium text-[#191c1e] mb-1">
                  Description
                </label>
                <textarea
                  id="textarea-role-description"
                  rows={3}
                  placeholder="Summarize access privileges and operational duties..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-body-sm rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be] resize-none"
                />
              </div>
            </div>

            {/* Card 2: Security Policies */}
            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
              <h3 className="text-body-sm font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-[20px]">
                  security
                </span>
                Security Policies
              </h3>

              <div className="space-y-3.5 text-body-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#191c1e]">Require Two-Factor (2FA)</p>
                    <p className="text-[#75859d]">Mandate TOTP verification on login</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.require2FA}
                    onChange={(e) => setFormData({ ...formData, require2FA: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                  <div>
                    <p className="font-semibold text-[#191c1e]">Restrict to Property IP</p>
                    <p className="text-[#75859d]">Block external hotel network logins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.restrictIP}
                    onChange={(e) => setFormData({ ...formData, restrictIP: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be]"
                  />
                </div>

                <div className="pt-2 border-t border-[#f1f5f9]">
                  <label className="block font-semibold text-[#191c1e] mb-1">
                    Concurrent Sessions Limit
                  </label>
                  <select
                    value={formData.sessionLimit}
                    onChange={(e) => setFormData({ ...formData, sessionLimit: e.target.value })}
                    className="w-full px-3 py-1.5 text-body-xs rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  >
                    <option value="1">1 Active Session Only</option>
                    <option value="2">2 Simultaneous Sessions</option>
                    <option value="unlimited">Unlimited Sessions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 3: Assigned Users */}
            {drawerRole && (
              <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-sm font-bold text-[#191c1e]">
                    Assigned Users ({assignedUsers.length})
                  </h3>
                  <span className="text-[11px] text-[#75859d]">Active Staff</span>
                </div>
                {assignedUsers.length === 0 ? (
                  <p className="text-body-xs text-[#75859d] italic">
                    No users currently assigned to this role.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {assignedUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc] border border-[#f1f5f9] text-body-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-[10px]">
                            {u.initials || 'U'}
                          </div>
                          <span className="font-semibold text-[#191c1e]">{u.name}</span>
                        </div>
                        <span className="text-[11px] text-[#64748b]">{u.lastLogin}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (8 Cols): Granular Permissions Matrix */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              {/* Matrix Controls Header */}
              <div className="p-4 border-b border-[#e2e8f0] bg-white flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-[#75859d]">
                    search
                  </span>
                  <input
                    id="search-matrix-input"
                    type="text"
                    placeholder="Filter modules & screens..."
                    value={searchModuleQuery}
                    onChange={(e) => setSearchModuleQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-body-xs rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('readOnly')}
                    className="px-2.5 py-1 text-body-xs font-semibold text-[#45464d] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-md transition-colors"
                  >
                    Select All Read
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('fullAccess')}
                    className="px-2.5 py-1 text-body-xs font-semibold text-[#0058be] bg-[#0058be]/10 hover:bg-[#0058be]/20 rounded-md transition-colors"
                  >
                    Select All Full
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('reset')}
                    className="px-2.5 py-1 text-body-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-body-xs">
                  <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-[#e2e8f0] text-[#75859d] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-[40%]">MODULE / SCREEN</th>
                      <th className="py-3 px-2 text-center w-[15%]">VIEW</th>
                      <th className="py-3 px-2 text-center w-[15%]">ADD / CREATE</th>
                      <th className="py-3 px-2 text-center w-[15%]">EDIT / MODIFY</th>
                      <th className="py-3 px-2 text-center w-[15%]">DELETE / VOID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {(Object.entries(groupedModules) as [string, PermissionModuleDef[]][]).map(([groupName, modules]) => {
                      if (modules.length === 0) return null;
                      const isCollapsed = !!collapsedGroups[groupName];
                      const allGroupSelected = modules.every(
                        (m) => formData.permissions[m.id]?.view
                      );

                      return (
                        <React.Fragment key={groupName}>
                          {/* Group Header Row */}
                          <tr className="bg-[#f1f5f9]/80 border-t border-b border-[#e2e8f0]">
                            <td colSpan={5} className="py-2.5 px-4">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => toggleGroupCollapse(groupName)}
                                  className="flex items-center gap-2 font-bold text-[#191c1e] text-[13px] hover:text-[#0058be] transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isCollapsed ? 'chevron_right' : 'expand_more'}
                                  </span>
                                  <span>{groupName}</span>
                                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#e2e8f0] rounded-full text-[#64748b]">
                                    {modules.length} screens
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleGroup(modules)}
                                  className="text-[11px] font-semibold text-[#0058be] hover:underline"
                                >
                                  {allGroupSelected ? 'Revoke Group' : 'Grant Group Access'}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Screen Rows */}
                          {!isCollapsed &&
                            modules.map((mod) => {
                              const perms = formData.permissions[mod.id] || {
                                view: false,
                                add: false,
                                edit: false,
                                delete: false,
                              };

                              return (
                                <tr
                                  key={mod.id}
                                  className="hover:bg-[#f8fafc] transition-colors"
                                >
                                  {/* Screen Name */}
                                  <td className="py-2.5 px-4 pl-8">
                                    <div className="flex items-center gap-2.5">
                                      <span className="material-symbols-outlined text-[18px] text-[#75859d]">
                                        {mod.icon || 'article'}
                                      </span>
                                      <div>
                                        <p className="font-semibold text-[#191c1e]">{mod.name}</p>
                                        {mod.subtext && (
                                          <p className="text-[10px] text-[#75859d]">
                                            {mod.subtext}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* View Checkbox */}
                                  <td className="py-2.5 px-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={perms.view}
                                      onChange={() => handleTogglePermission(mod.id, 'view')}
                                      className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                                    />
                                  </td>

                                  {/* Add Checkbox */}
                                  <td className="py-2.5 px-2 text-center">
                                    {mod.disabledActions?.add ? (
                                      <span className="text-[10px] text-slate-300 font-mono">—</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={perms.add}
                                        onChange={() => handleTogglePermission(mod.id, 'add')}
                                        className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                                      />
                                    )}
                                  </td>

                                  {/* Edit Checkbox */}
                                  <td className="py-2.5 px-2 text-center">
                                    {mod.disabledActions?.edit ? (
                                      <span className="text-[10px] text-slate-300 font-mono">—</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={perms.edit}
                                        onChange={() => handleTogglePermission(mod.id, 'edit')}
                                        className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                                      />
                                    )}
                                  </td>

                                  {/* Delete Checkbox */}
                                  <td className="py-2.5 px-2 text-center">
                                    {mod.disabledActions?.delete ? (
                                      <span className="text-[10px] text-slate-300 font-mono">—</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={perms.delete}
                                        onChange={() => handleTogglePermission(mod.id, 'delete')}
                                        className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
