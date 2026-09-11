import React, { useState } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { UserAccountItem, RoleType } from '@/src/types';
import { RolesPrivilegesView } from '@/src/features/configuration/roles-privileges';

export const UserManagementView: React.FC = () => {
  const {
    users,
    roles,
    editingUserId,
    setEditingUserId,
    openInviteUserModal,
    deleteUser,
    toggleUserStatus,
    openAddRoleDrawer,
    openEditRoleDrawer,
    navigate,
    addToast,
  } = useProperty();

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'security'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccountItem | null>(null);

  // Security policies state
  const [securityPolicies, setSecurityPolicies] = useState({
    enforce2FA: true,
    sessionTimeoutMins: 30,
    passwordExpirationDays: 90,
    restrictIPRange: false,
    allowedIPs: '192.168.1.0/24, 10.0.0.0/16',
    maxFailedAttempts: 5,
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'ALL' || u.roleId === selectedRoleFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeStyle = (type: RoleType) => {
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

  const getAvatarBg = (initials?: string) => {
    if (!initials) return 'bg-slate-500';
    const charCode = initials.charCodeAt(0) || 0;
    const colors = [
      'bg-indigo-600',
      'bg-blue-600',
      'bg-teal-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-purple-600',
    ];
    return colors[charCode % colors.length];
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['ID,Name,Email,Department,Role,Role Type,Status,Last Login'];
    const rows = filteredUsers.map(
      (u) =>
        `"${u.id}","${u.name}","${u.email}","${u.department || ''}","${u.roleName}","${
          u.roleType
        }","${u.status}","${u.lastLogin}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StayOS_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filteredUsers.length} user records to CSV`, 'info');
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach((id) => deleteUser(id));
    setSelectedUserIds([]);
    addToast(`Removed ${selectedUserIds.length} user accounts`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#e2e8f0] px-8 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#75859d] mb-1">
            <span>Configuration</span>
            <span>/</span>
            <span className="text-[#0058be]">User Management & Permissions</span>
          </div>
          <h1 className="text-title-lg font-bold text-[#191c1e] tracking-tight">
            Users & Permissions
          </h1>
          <p className="text-body-sm text-[#75859d] mt-0.5">
            Manage staff accounts, assign granular role-based permissions, and audit system access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'users' && (
            <div className="flex items-center gap-2">
              <button
                id="invite-user-modal-btn"
                onClick={() => openInviteUserModal()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-[#45464d] border border-[#c6c6cd] hover:bg-[#f1f3f5] text-body-sm font-medium rounded-lg transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                Quick Invite
              </button>
              <button
                id="add-user-header-btn"
                onClick={() => {
                  setEditingUserId(null);
                  navigate('add-user');
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0058be] text-white text-body-sm font-semibold rounded-lg hover:bg-[#00479e] active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                + Add User
              </button>
            </div>
          )}
          {activeTab === 'roles' && (
            <button
              id="add-role-header-btn"
              onClick={openAddRoleDrawer}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0058be] text-white text-body-sm font-medium rounded-lg hover:bg-[#00479e] active:scale-[0.98] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add_moderator</span>
              + Add New Role
            </button>
          )}
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-[#e2e8f0] px-8 flex items-center gap-8">
        <button
          id="tab-users-btn"
          onClick={() => setActiveTab('users')}
          className={`py-4 text-body-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-[#0058be] text-[#0058be]'
              : 'border-transparent text-[#75859d] hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          Users
          <span
            className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === 'users' ? 'bg-[#0058be]/10 text-[#0058be]' : 'bg-[#e2e8f0] text-[#75859d]'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          id="tab-roles-btn"
          onClick={() => setActiveTab('roles')}
          className={`py-4 text-body-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-[#0058be] text-[#0058be]'
              : 'border-transparent text-[#75859d] hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          Roles & Privileges
          <span
            className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === 'roles' ? 'bg-[#0058be]/10 text-[#0058be]' : 'bg-[#e2e8f0] text-[#75859d]'
            }`}
          >
            {roles.length}
          </span>
        </button>

        <button
          id="tab-security-btn"
          onClick={() => setActiveTab('security')}
          className={`py-4 text-body-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-[#0058be] text-[#0058be]'
              : 'border-transparent text-[#75859d] hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">security</span>
          Security Policies
        </button>
      </div>

      {/* Tab 1: Users List View */}
      {activeTab === 'users' && (
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0058be] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">manage_accounts</span>
              </div>
              <div>
                <p className="text-body-xs font-medium text-[#75859d]">Total Accounts</p>
                <p className="text-[22px] font-bold text-[#191c1e]">{users.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">verified_user</span>
              </div>
              <div>
                <p className="text-body-xs font-medium text-[#75859d]">Active Staff</p>
                <p className="text-[22px] font-bold text-emerald-600">
                  {users.filter((u) => u.status === 'active').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">shield_lock</span>
              </div>
              <div>
                <p className="text-body-xs font-medium text-[#75859d]">Configured Roles</p>
                <p className="text-[22px] font-bold text-purple-600">{roles.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">lock_reset</span>
              </div>
              <div>
                <p className="text-body-xs font-medium text-[#75859d]">2FA Enforcement</p>
                <p className="text-[22px] font-bold text-amber-600">100% Enabled</p>
              </div>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[19px] text-[#75859d]">
                  search
                </span>
                <input
                  id="search-users-input"
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9.5 pr-8 py-2 text-body-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#191c1e] placeholder-[#75859d] focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-[#75859d] hover:text-[#191c1e]"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Role filter */}
              <select
                id="filter-role-select"
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 text-body-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              >
                <option value="ALL">All Roles ({roles.length})</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                id="filter-status-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 text-body-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {selectedUserIds.length > 0 && (
                <button
                  id="bulk-delete-users-btn"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete ({selectedUserIds.length})
                </button>
              )}

              <button
                id="export-users-csv-btn"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-[#45464d] bg-white border border-[#c6c6cd] hover:bg-[#f1f3f5] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export CSV
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-body-xs font-semibold text-[#75859d] uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-[#c6c6cd] text-[#0058be] focus:ring-[#0058be]"
                    />
                  </th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-body-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#75859d]">
                      <span className="material-symbols-outlined text-[42px] text-slate-300 mb-2 block">
                        group_off
                      </span>
                      <p className="font-semibold text-[#191c1e]">No users found</p>
                      <p className="text-body-xs mt-1 mb-4">
                        Try adjusting your search query or role/status filters.
                      </p>
                      <button
                        onClick={() => {
                          setEditingUserId(null);
                          navigate('add-user');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0058be] text-white text-body-sm font-medium rounded-lg hover:bg-[#00479e] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Add New User
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const matchingRole = roles.find((r) => r.id === user.roleId);

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#f8fafc] transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 pl-6 pr-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-[#c6c6cd] text-[#0058be] focus:ring-[#0058be]"
                          />
                        </td>

                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-[14px] ${getAvatarBg(
                                  user.initials
                                )}`}
                              >
                                {user.initials || user.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <button
                                onClick={() => openInviteUserModal(user)}
                                className="font-semibold text-[#191c1e] hover:text-[#0058be] text-left transition-colors"
                              >
                                {user.name}
                              </button>
                              <p className="text-body-xs text-[#75859d]">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4 text-[#45464d] text-body-xs">
                          {user.department || 'General Operations'}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 text-[12px] font-semibold rounded-md border ${getRoleBadgeStyle(
                                user.roleType
                              )}`}
                            >
                              {user.roleName}
                            </span>
                            {matchingRole && (
                              <button
                                onClick={() => openEditRoleDrawer(matchingRole)}
                                title="Inspect Role Privileges"
                                className="text-slate-400 hover:text-[#0058be] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  visibility
                                </span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Last Login */}
                        <td className="py-3.5 px-4 text-body-xs text-[#64748b]">
                          {user.lastLogin}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
                              user.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            ></span>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-6 pl-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`edit-user-${user.id}-btn`}
                              onClick={() => {
                                setEditingUserId(user.id);
                                navigate('edit-user');
                              }}
                              title="Edit user details"
                              className="p-1.5 text-[#75859d] hover:text-[#0058be] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[19px]">edit</span>
                            </button>
                            <button
                              id={`delete-user-${user.id}-btn`}
                              onClick={() => setDeleteConfirmUser(user)}
                              title="Remove user account"
                              className="p-1.5 text-[#75859d] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <span className="material-symbols-outlined text-[19px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-body-xs text-[#75859d]">
              <div>
                Showing <span className="font-semibold text-[#191c1e]">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-[#191c1e]">{users.length}</span> team members
              </div>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Privileges Sub-View */}
      {activeTab === 'roles' && (
        <div className="flex-1 flex flex-col">
          <RolesPrivilegesView hideHeaderNav />
        </div>
      )}

      {/* Tab 3: Security Policies View */}
      {activeTab === 'security' && (
        <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-title-sm font-bold text-[#191c1e]">
                Global Authentication & Security Policies
              </h2>
              <p className="text-body-xs text-[#75859d] mt-1">
                Enforce organization-wide credentials, MFA enforcement, and session management
                protocols across all property consoles.
              </p>
            </div>

            <div className="divide-y divide-[#f1f5f9] space-y-5">
              {/* 2FA Enforcement */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-body-sm font-semibold text-[#191c1e]">
                    Mandatory Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-body-xs text-[#75859d] max-w-lg mt-0.5">
                    Require TOTP authenticator app or SMS code verification for all employee and
                    administrator logins.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityPolicies.enforce2FA}
                    onChange={(e) =>
                      setSecurityPolicies({ ...securityPolicies, enforce2FA: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                </label>
              </div>

              {/* Session Timeout */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-body-sm font-semibold text-[#191c1e]">
                    Inactivity Session Timeout
                  </h3>
                  <p className="text-body-xs text-[#75859d] max-w-lg mt-0.5">
                    Automatically sign out dormant front-desk workstations to prevent unauthorized
                    folio access.
                  </p>
                </div>
                <select
                  value={securityPolicies.sessionTimeoutMins}
                  onChange={(e) =>
                    setSecurityPolicies({
                      ...securityPolicies,
                      sessionTimeoutMins: Number(e.target.value),
                    })
                  }
                  className="px-3 py-1.5 text-body-sm bg-white border border-[#c6c6cd] rounded-lg text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours (Full Shift)</option>
                </select>
              </div>

              {/* Password Expiration */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-body-sm font-semibold text-[#191c1e]">
                    Password Rotation Policy
                  </h3>
                  <p className="text-body-xs text-[#75859d] max-w-lg mt-0.5">
                    Force periodic password changes for compliance with hospitality PCI-DSS standards.
                  </p>
                </div>
                <select
                  value={securityPolicies.passwordExpirationDays}
                  onChange={(e) =>
                    setSecurityPolicies({
                      ...securityPolicies,
                      passwordExpirationDays: Number(e.target.value),
                    })
                  }
                  className="px-3 py-1.5 text-body-sm bg-white border border-[#c6c6cd] rounded-lg text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                >
                  <option value={30}>Every 30 days</option>
                  <option value={60}>Every 60 days</option>
                  <option value={90}>Every 90 days</option>
                  <option value={180}>Every 180 days</option>
                  <option value={0}>Never expire</option>
                </select>
              </div>

              {/* IP Whitelisting */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-body-sm font-semibold text-[#191c1e]">
                      Workstation IP Whitelisting
                    </h3>
                    <p className="text-body-xs text-[#75859d] max-w-lg mt-0.5">
                      Restrict cashiering and folio void operations strictly to authorized hotel LAN
                      subnets.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityPolicies.restrictIPRange}
                      onChange={(e) =>
                        setSecurityPolicies({
                          ...securityPolicies,
                          restrictIPRange: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                  </label>
                </div>

                {securityPolicies.restrictIPRange && (
                  <div className="pl-0 mt-2">
                    <input
                      type="text"
                      value={securityPolicies.allowedIPs}
                      onChange={(e) =>
                        setSecurityPolicies({ ...securityPolicies, allowedIPs: e.target.value })
                      }
                      placeholder="e.g. 192.168.1.0/24, 10.0.0.0/16"
                      className="w-full px-3 py-2 text-body-sm border border-[#c6c6cd] rounded-lg text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                    />
                    <p className="text-[11px] text-[#75859d] mt-1">
                      Comma-separated list of CIDR subnets or IPv4 addresses.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#e2e8f0] flex justify-end">
              <button
                onClick={() => addToast('Security policies updated and synced', 'success')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0058be] text-white text-body-sm font-medium rounded-lg hover:bg-[#00479e] active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Save Security Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#c6c6cd]/60 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="text-title-sm font-bold text-[#191c1e]">Remove User Account</h3>
                <p className="text-body-xs text-[#75859d]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-body-sm text-[#45464d]">
              Are you sure you want to remove <span className="font-semibold">{deleteConfirmUser.name}</span> (
              {deleteConfirmUser.email})? Their assigned access privileges will be revoked immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-body-sm font-medium text-[#45464d] bg-white border border-[#c6c6cd] rounded-lg hover:bg-[#f1f3f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteUser(deleteConfirmUser.id);
                  setDeleteConfirmUser(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
