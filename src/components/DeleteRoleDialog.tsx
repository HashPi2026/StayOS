import React from 'react';
import { useProperty } from '../context/PropertyContext';

export const DeleteRoleDialog: React.FC = () => {
  const {
    isDeleteRoleDialogOpen,
    deleteTargetRole,
    closeDeleteRoleDialog,
    deleteRole,
  } = useProperty();

  if (!isDeleteRoleDialogOpen || !deleteTargetRole) return null;

  const handleDelete = () => {
    deleteRole(deleteTargetRole.id);
    closeDeleteRoleDialog();
  };

  const isBlocked = deleteTargetRole.isSystem || deleteTargetRole.usersCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-[#c6c6cd]/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isBlocked ? 'bg-amber-100 text-amber-700' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
              <span className="material-symbols-outlined text-[24px]">
                {isBlocked ? 'warning' : 'delete_forever'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">
                {isBlocked ? 'Cannot Delete Role' : 'Delete Role Confirmation'}
              </h3>
              <p className="text-xs text-[#76777d]">
                {deleteTargetRole.code} • {deleteTargetRole.name}
              </p>
            </div>
          </div>

          <div className="mt-4 text-xs text-[#45464d] leading-relaxed">
            {deleteTargetRole.isSystem ? (
              <p className="p-3 bg-[#ffdad6]/40 rounded-lg text-[#ba1a1a] font-medium border border-[#ffdad6]">
                This is a protected system administrator role and cannot be deleted from the configuration suite.
              </p>
            ) : deleteTargetRole.usersCount > 0 ? (
              <div className="p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200">
                <p className="font-semibold mb-1">
                  Active Users Assigned ({deleteTargetRole.usersCount})
                </p>
                <p>
                  This role is currently assigned to {deleteTargetRole.usersCount} active staff members. You must reassign or remove their roles in User Management before deleting this role.
                </p>
              </div>
            ) : (
              <p>
                Are you sure you want to delete <strong className="text-[#191c1e]">{deleteTargetRole.name}</strong>?
                This action cannot be undone and will permanently remove this role configuration.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f2f4f6]/60 border-t border-[#c6c6cd]/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteRoleDialog}
            className="px-4 py-2 bg-white hover:bg-[#eceef0] text-[#191c1e] rounded-lg text-xs font-semibold border border-[#c6c6cd]/60 transition-colors cursor-pointer"
          >
            {isBlocked ? 'Close' : 'Cancel'}
          </button>
          {!isBlocked && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Delete Role
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
