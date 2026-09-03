import React from 'react';
import { useProperty } from '../context/PropertyContext';

export const DeleteEmailTemplateDialog: React.FC = () => {
  const {
    isDeleteEmailTemplateDialogOpen,
    deleteTargetEmailTemplate,
    closeDeleteEmailTemplateDialog,
    deleteEmailTemplate,
  } = useProperty();

  if (!isDeleteEmailTemplateDialogOpen || !deleteTargetEmailTemplate) return null;

  const handleDelete = () => {
    deleteEmailTemplate(deleteTargetEmailTemplate.id);
    closeDeleteEmailTemplateDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-[#c6c6cd]/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[24px]">
                delete_forever
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">
                Delete Email Template
              </h3>
              <p className="text-xs text-[#76777d]">
                {deleteTargetEmailTemplate.name}
              </p>
            </div>
          </div>

          <div className="mt-4 text-xs text-[#45464d] leading-relaxed">
            <p>
              Are you sure you want to delete the email template{' '}
              <strong className="text-[#191c1e]">{deleteTargetEmailTemplate.name}</strong>?
              Automated trigger emails linked to this template will no longer be dispatched.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#eceef0]/50 px-6 py-4 border-t border-[#c6c6cd]/40 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteEmailTemplateDialog}
            className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-semibold bg-[#ba1a1a] text-white hover:bg-[#93000a] active:scale-[0.98] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete Template
          </button>
        </div>
      </div>
    </div>
  );
};
