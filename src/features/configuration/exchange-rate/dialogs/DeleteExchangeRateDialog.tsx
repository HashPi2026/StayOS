import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteExchangeRateDialog: React.FC = () => {
  const {
    isDeleteExchangeRateDialogOpen,
    deleteTargetExchangeRate,
    closeDeleteExchangeRateDialog,
    deleteExchangeRate,
  } = useProperty();

  if (!isDeleteExchangeRateDialogOpen || !deleteTargetExchangeRate) {
    return null;
  }

  const handleDelete = () => {
    deleteExchangeRate(deleteTargetExchangeRate.id);
    closeDeleteExchangeRateDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#ffffff] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c6c6cd]/50 transform transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <h3 className="text-title-sm font-bold text-[#191c1e]">Delete Exchange Rate</h3>
            <p className="text-xs text-[#45464d]">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-body-sm text-[#45464d] mb-6">
          Are you sure you want to delete the exchange rate for{' '}
          <strong className="text-[#191c1e] font-semibold">
            {deleteTargetExchangeRate.country} ({deleteTargetExchangeRate.currency} - {deleteTargetExchangeRate.sign})
          </strong>
          ? Any active calculations or property views relying on this rate will no longer display it.
        </p>

        {deleteTargetExchangeRate.isBaseRate && (
          <div className="mb-6 p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg text-xs text-[#93000a] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>This is currently set as the <strong>Base Currency</strong>. Base rate currencies cannot be deleted. Please designate another base currency first.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeDeleteExchangeRateDialog}
            className="px-4 py-2 text-sm font-medium text-[#45464d] hover:bg-[#eceef0] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleteTargetExchangeRate.isBaseRate}
            onClick={handleDelete}
            className="px-5 py-2 text-sm font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all active:scale-[0.98]"
          >
            Delete Exchange Rate
          </button>
        </div>
      </div>
    </div>
  );
};
