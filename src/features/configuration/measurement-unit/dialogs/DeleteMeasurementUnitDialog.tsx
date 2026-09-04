import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteMeasurementUnitDialog: React.FC = () => {
  const {
    isDeleteMeasurementUnitDialogOpen,
    deleteTargetMeasurementUnit,
    closeDeleteMeasurementUnitDialog,
    deleteMeasurementUnit,
  } = useProperty();

  if (!isDeleteMeasurementUnitDialogOpen || !deleteTargetMeasurementUnit) return null;

  const handleConfirm = () => {
    deleteMeasurementUnit(deleteTargetMeasurementUnit.id);
    closeDeleteMeasurementUnitDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeDeleteMeasurementUnitDialog}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#e0e3e5] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#191c1e]">
              Delete Measurement Unit
            </h3>
            <p className="text-[13px] text-[#45464d] mt-1.5 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-[#191c1e] font-semibold">
                &ldquo;{deleteTargetMeasurementUnit.name}&rdquo; ({deleteTargetMeasurementUnit.shortName})
              </strong>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteMeasurementUnitDialog}
            className="px-4 py-2 rounded-lg border border-[#c6c6cd] text-[#191c1e] text-[13px] font-medium hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-[13px] font-medium hover:bg-[#93000a] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete Unit
          </button>
        </div>
      </div>
    </div>
  );
};
