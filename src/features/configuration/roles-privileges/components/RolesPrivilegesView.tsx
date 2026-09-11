import React, { useState, useMemo } from 'react';
import { useProperty } from '@/src/context/PropertyContext';
import { RoleItem, RoleType } from '@/src/types';

interface RolesPrivilegesViewProps {
  hideHeaderNav?: boolean;
}

export const RolesPrivilegesView: React.FC<RolesPrivilegesViewProps> = ({ hideHeaderNav = false }) => {
  const {
    roles,
    openAddRoleDrawer,
    openEditRoleDrawer,
    openDeleteRoleDialog,
    navigate,
  } = useProperty();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState({
    code: true,
    type: true,
    description: true,
    users: true,
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedTypeFilter === 'all' || role.type.toLowerCase() === selectedTypeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [roles, searchTerm, selectedTypeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const getTypeBadgeStyle = (type: RoleType) => {
    switch (type) {
      case 'FrontOffice':
        return 'bg-[#d8e2ff]/60 text-[#004395] border border-[#adc6ff]/40';
      case 'Operations':
      case 'Housekeeping':
        return 'bg-[#eceef0] text-[#38485d] border border-[#c6c6cd]/40';
      case 'SuperAdmin':
        return 'bg-[#ffdad6]/60 text-[#ba1a1a] border border-[#ffb4ab]/40';
      case 'Finance':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200/50';
      case 'Management':
        return 'bg-purple-50 text-purple-800 border border-purple-200/50';
      case 'Sales':
        return 'bg-amber-50 text-amber-800 border border-amber-200/50';
      case 'Security':
        return 'bg-slate-100 text-slate-800 border border-slate-300/60';
      default:
        return 'bg-[#eceef0] text-[#45464d]';
    }
  };

  const getTypeDotColor = (type: RoleType) => {
    switch (type) {
      case 'FrontOffice':
        return 'bg-[#0058be]';
      case 'Operations':
      case 'Housekeeping':
        return 'bg-[#38485d]';
      case 'SuperAdmin':
        return 'bg-[#ba1a1a]';
      case 'Finance':
        return 'bg-emerald-600';
      case 'Management':
        return 'bg-purple-600';
      case 'Sales':
        return 'bg-amber-600';
      case 'Security':
        return 'bg-slate-700';
      default:
        return 'bg-[#76777d]';
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] overflow-hidden relative bg-[#f7f9fb]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
        {/* Header & Breadcrumbs */}
        {!hideHeaderNav && (
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-[#45464d]">
              <span
                onClick={() => navigate('overview')}
                className="hover:text-[#000000] cursor-pointer transition-colors"
              >
                Configuration
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#76777d]">chevron_right</span>
              <span
                onClick={() => navigate('user-management')}
                className="hover:text-[#000000] cursor-pointer transition-colors"
              >
                User Management
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#76777d]">chevron_right</span>
              <span className="font-semibold text-[#191c1e]">Roles &amp; Privileges</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight mb-1">
                  Roles &amp; Privileges
                </h1>
                <p className="text-sm text-[#45464d]">
                  Manage system access levels, functional scopes, and operational permissions.
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  id="openAddRoleDrawer"
                  type="button"
                  onClick={openAddRoleDrawer}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#000000] text-white rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-[#222222] active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Role</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table Container */}
        <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 overflow-hidden">
          {/* Table Toolbar / Filters */}
          <div className="px-4 py-3 border-b border-[#c6c6cd]/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-[#f2f4f6]/50">
            <div className="relative flex items-center w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[18px]">
                search
              </span>
              <input
                id="search-roles"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter roles..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#c6c6cd]/60 rounded-md text-xs outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/30 transition-all text-[#191c1e]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 text-[#76777d] hover:text-[#191c1e]"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  id="btn-filter-role-type"
                  onClick={() => {
                    setShowFilterDropdown(!showFilterDropdown);
                    setShowColumnDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                    selectedTypeFilter !== 'all'
                      ? 'bg-[#d8e2ff]/50 text-[#0058be] border-[#0058be]/40 font-semibold'
                      : 'text-[#45464d] bg-white border-[#c6c6cd]/60 hover:bg-[#eceef0] hover:text-[#191c1e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  <span>
                    {selectedTypeFilter === 'all'
                      ? 'Filter'
                      : `Type: ${selectedTypeFilter}`}
                  </span>
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-[#c6c6cd]/60 rounded-lg shadow-lg py-1.5 z-30 text-xs">
                    <div className="px-3 py-1 font-semibold text-[#76777d] uppercase text-[10px] tracking-wider border-b border-[#eceef0]">
                      Role Type
                    </div>
                    {['all', 'FrontOffice', 'Operations', 'SuperAdmin', 'Finance', 'Management', 'Sales', 'Security'].map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedTypeFilter(type);
                            setShowFilterDropdown(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#f2f4f6] cursor-pointer ${
                            selectedTypeFilter === type ? 'text-[#0058be] font-bold bg-[#d8e2ff]/20' : 'text-[#191c1e]'
                          }`}
                        >
                          <span>{type === 'all' ? 'All Types' : type}</span>
                          {selectedTypeFilter === type && (
                            <span className="material-symbols-outlined text-[16px] text-[#0058be]">check</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Columns Toggle Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  id="btn-columns-toggle"
                  onClick={() => {
                    setShowColumnDropdown(!showColumnDropdown);
                    setShowFilterDropdown(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#45464d] bg-white border border-[#c6c6cd]/60 hover:bg-[#eceef0] hover:text-[#191c1e] transition-colors rounded-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">view_column</span>
                  <span>Columns</span>
                </button>

                {showColumnDropdown && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-[#c6c6cd]/60 rounded-lg shadow-lg p-2 z-30 text-xs space-y-1.5">
                    <div className="font-semibold text-[#76777d] uppercase text-[10px] tracking-wider px-1 pb-1 border-b border-[#eceef0]">
                      Toggle Columns
                    </div>
                    <label className="flex items-center gap-2 px-1 py-1 hover:bg-[#f2f4f6] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.code}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, code: e.target.checked })
                        }
                        className="rounded accent-[#0058be]"
                      />
                      <span>Code</span>
                    </label>
                    <label className="flex items-center gap-2 px-1 py-1 hover:bg-[#f2f4f6] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.type}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, type: e.target.checked })
                        }
                        className="rounded accent-[#0058be]"
                      />
                      <span>Role Type</span>
                    </label>
                    <label className="flex items-center gap-2 px-1 py-1 hover:bg-[#f2f4f6] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.description}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, description: e.target.checked })
                        }
                        className="rounded accent-[#0058be]"
                      />
                      <span>Description</span>
                    </label>
                    <label className="flex items-center gap-2 px-1 py-1 hover:bg-[#f2f4f6] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.users}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, users: e.target.checked })
                        }
                        className="rounded accent-[#0058be]"
                      />
                      <span>Users Count</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Scroll Area */}
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#c6c6cd]/30 text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                  <th className="px-4 py-3 sticky left-0 bg-white z-10 w-1/4">Role Name</th>
                  {visibleColumns.code && <th className="px-4 py-3 w-28">Code</th>}
                  {visibleColumns.type && <th className="px-4 py-3 w-36">Type</th>}
                  {visibleColumns.description && <th className="px-4 py-3 w-1/3">Description</th>}
                  {visibleColumns.users && <th className="px-4 py-3 text-right w-24">Users</th>}
                  <th className="px-4 py-3 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#191c1e] divide-y divide-[#c6c6cd]/20" id="roleTableBody">
                {paginatedRoles.length > 0 ? (
                  paginatedRoles.map((role) => (
                    <tr
                      key={role.id}
                      className="group hover:bg-[#f2f4f6]/60 transition-colors"
                    >
                      {/* Role Name */}
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-[#f2f4f6]/60 transition-colors z-10">
                        <div className="font-semibold text-[#191c1e] flex items-center gap-1.5">
                          <span>{role.name}</span>
                          {(role.isCritical || role.isSystem) && (
                            <span
                              className="material-symbols-outlined text-[15px] text-[#ba1a1a]"
                              title={role.isSystem ? 'System Core Role - Protected' : 'Critical Privileges Assigned'}
                            >
                              warning
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      {visibleColumns.code && (
                        <td className="px-4 py-3 font-mono text-[#45464d] font-medium">
                          {role.code}
                        </td>
                      )}

                      {/* Type Badge */}
                      {visibleColumns.type && (
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase ${getTypeBadgeStyle(
                              role.type
                            )}`}
                          >
                            {role.type}
                          </span>
                        </td>
                      )}

                      {/* Description */}
                      {visibleColumns.description && (
                        <td
                          className="px-4 py-3 text-[#45464d] truncate max-w-[280px]"
                          title={role.description}
                        >
                          {role.description || <span className="text-[#76777d] italic">No description provided</span>}
                        </td>
                      )}

                      {/* Users Count */}
                      {visibleColumns.users && (
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-[#eceef0] px-2 py-0.5 rounded-full font-mono text-xs font-semibold text-[#191c1e]">
                            <span className={`w-2 h-2 rounded-full ${getTypeDotColor(role.type)}`}></span>
                            <span>{role.usersCount}</span>
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEditRoleDrawer(role)}
                            className="p-1 text-[#45464d] hover:text-[#0058be] hover:bg-[#eceef0] rounded transition-colors editRoleBtn cursor-pointer"
                            title="Edit Role & Privileges"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={role.isSystem}
                            onClick={() => {
                              if (!role.isSystem) {
                                openDeleteRoleDialog(role);
                              }
                            }}
                            className={`p-1 rounded transition-colors ${
                              role.isSystem
                                ? 'text-[#c6c6cd] cursor-not-allowed'
                                : 'text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 cursor-pointer'
                            }`}
                            title={role.isSystem ? 'Cannot delete system role' : 'Delete Role'}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[#76777d]"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-[#c6c6cd]">
                          admin_panel_settings
                        </span>
                        <p className="text-sm font-medium text-[#191c1e]">No roles found</p>
                        <p className="text-xs text-[#76777d]">
                          {searchTerm || selectedTypeFilter !== 'all'
                            ? 'Try clearing your search query or type filters.'
                            : 'Click "Add Role" to create your first operational role.'}
                        </p>
                        {(searchTerm || selectedTypeFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedTypeFilter('all');
                            }}
                            className="mt-2 text-xs font-semibold text-[#0058be] hover:underline"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-4 py-3 border-t border-[#c6c6cd]/30 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#45464d]">
            <div>
              Showing {filteredRoles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredRoles.length)} of {filteredRoles.length} entries
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-[#eceef0] transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded flex items-center justify-center font-semibold text-[11px] transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#000000] text-white'
                      : 'hover:bg-[#eceef0] text-[#191c1e]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded hover:bg-[#eceef0] transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
