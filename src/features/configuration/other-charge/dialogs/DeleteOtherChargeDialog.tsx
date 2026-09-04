import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteOtherChargeDialog: React.FC = () => {
  const {
    isDeleteOtherChargeDialogOpen,
    deleteTargetOtherCharge,
    closeDeleteOtherChargeDialog,
    deleteOtherCharge,
  } = useProperty();

  if (!isDeleteOtherChargeDialogOpen || !deleteTargetOtherCharge) return null;

  const handleDelete = () => {
    deleteOtherCharge(deleteTargetOtherCharge.id);
    closeDeleteOtherChargeDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-[#c6c6cd]/40 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">delete</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#191c1e]">Delete Other Charge</h3>
            <p className="text-xs text-[#45464d]">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-[#f2f4f6] p-3.5 rounded border border-[#c6c6cd]/50 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#45464d]">Charge Name:</span>
            <span className="font-semibold text-[#191c1e]">{deleteTargetOtherCharge.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#45464d]">Code:</span>
            <span className="font-mono font-medium text-[#0058be]">{deleteTargetOtherCharge.shortName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#45464d]">Category:</span>
            <span className="font-medium text-[#191c1e]">{deleteTargetOtherCharge.category}</span>
          </div>
        </div>

        <p className="text-xs text-[#45464d] leading-relaxed">
          Deleting this charge will prevent it from being posted to future guest folios, POS systems, or CRS reservation add-ons. Existing past folios will retain recorded line items.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]/30">
          <button
            type="button"
            onClick={closeDeleteOtherChargeDialog}
            className="px-3.5 py-1.5 rounded text-xs font-medium text-[#191c1e] hover:bg-[#f2f4f6] border border-[#c6c6cd] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-1.5 rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
          >
            Delete Charge
          </button>
        </div>
      </div>
    </div>
  );
};
