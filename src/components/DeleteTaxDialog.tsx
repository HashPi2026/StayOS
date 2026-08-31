import React from 'react';
import { useProperty } from '../context/PropertyContext';

export const DeleteTaxDialog: React.FC = () => {
  const { isDeleteTaxDialogOpen, deleteTargetTax, closeDeleteTaxDialog, deleteTax } = useProperty();

  if (!isDeleteTaxDialogOpen || !deleteTargetTax) return null;

  const handleDelete = () => {
    deleteTax(deleteTargetTax.id);
    closeDeleteTaxDialog();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-[2px] transition-opacity animate-fadeIn"
        onClick={closeDeleteTaxDialog}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md p-6 border border-[#e0e3e5] animate-scaleUp">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-bold text-[#191c1e]">
                Delete Tax Configuration
              </h3>
              <p className="mt-2 text-[13px] text-[#45464d] leading-relaxed">
                Are you sure you want to remove{' '}
                <strong className="text-[#191c1e]">{deleteTargetTax.name}</strong> ({deleteTargetTax.taxType})?
                This tax will no longer be applied to current or future booking reservations.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeDeleteTaxDialog}
              className="px-4 py-2 text-[13px] font-semibold text-[#191c1e] hover:bg-[#eceef0] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-[#ba1a1a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-xs cursor-pointer"
            >
              Delete Tax
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
