import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeletePaymentTypeDialog: React.FC = () => {
  const {
    isDeletePaymentTypeDialogOpen,
    deleteTargetPaymentType,
    closeDeletePaymentTypeDialog,
    deletePaymentType,
  } = useProperty();

  if (!isDeletePaymentTypeDialogOpen || !deleteTargetPaymentType) {
    return null;
  }

  const handleDelete = () => {
    deletePaymentType(deleteTargetPaymentType.id);
    closeDeletePaymentTypeDialog();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeDeletePaymentTypeDialog}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md border border-[#c6c6cd]/50 p-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div className="flex-1">
              <h3 className="text-[18px] font-bold text-[#191c1e]">Delete Payment Type</h3>
              <p className="mt-2 text-[14px] text-[#45464d] leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-[#191c1e] font-semibold font-mono">
                  {deleteTargetPaymentType.shortName}
                </strong>{' '}
                ({deleteTargetPaymentType.name})? This payment method will no longer be available in
                front-desk billing or reports.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeDeletePaymentTypeDialog}
              className="h-10 px-4 rounded-lg bg-transparent border border-[#c6c6cd] text-[#191c1e] text-[13px] font-semibold hover:bg-[#eceef0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-10 px-5 rounded-lg bg-[#ba1a1a] text-white text-[13px] font-semibold hover:bg-[#93000a] shadow-sm transition-colors cursor-pointer"
            >
              Delete Payment Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
