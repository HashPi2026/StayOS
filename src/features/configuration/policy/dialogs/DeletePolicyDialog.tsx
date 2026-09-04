import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeletePolicyDialog: React.FC = () => {
  const {
    isDeletePolicyDialogOpen,
    deleteTargetPolicy,
    closeDeletePolicyDialog,
    deletePolicy,
  } = useProperty();

  if (!isDeletePolicyDialogOpen || !deleteTargetPolicy) return null;

  const handleDelete = () => {
    deletePolicy(deleteTargetPolicy.id);
    closeDeletePolicyDialog();
  };

  return (
    <div
      id="delete-policy-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="delete-policy-dialog"
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-[#e5e7eb] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-policy-title"
      >
        {/* Modal Header */}
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>
          <div>
            <h3 id="delete-policy-title" className="text-base font-bold text-[#191c1e]">
              Delete Policy Rule
            </h3>
            <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
              Are you sure you want to delete this policy rule? This rule will immediately stop applying to future reservations and guest folios.
            </p>
          </div>
        </div>

        {/* Policy Summary Box */}
        <div className="mx-6 p-4 bg-[#f8f9fb] rounded-lg border border-[#e5e7eb] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6b7280]">Room Type:</span>
            <span className="text-[#191c1e] font-semibold">{deleteTargetPolicy.roomTypeName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6b7280]">Rate Type:</span>
            <span className="text-[#191c1e] font-semibold">{deleteTargetPolicy.rateTypeName}</span>
          </div>
          <div className="pt-2 text-xs text-[#4b5563] line-clamp-2 italic border-t border-[#e5e7eb] mt-1">
            "{deleteTargetPolicy.content}"
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 flex items-center justify-end gap-3 bg-[#f8f9fb] border-t border-[#e5e7eb] mt-6">
          <button
            id="cancel-delete-policy-btn"
            type="button"
            onClick={closeDeletePolicyDialog}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#191c1e] bg-white border border-[#d8dadc] hover:bg-[#f3f4f6] transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-policy-btn"
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete Policy
          </button>
        </div>
      </div>
    </div>
  );
};
