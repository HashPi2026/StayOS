import React from 'react';
import { useProperty } from '../context/PropertyContext';

export const DeleteRoomStatusDialog: React.FC = () => {
  const {
    isDeleteRoomStatusDialogOpen,
    deleteTargetRoomStatus,
    closeDeleteRoomStatusDialog,
    deleteRoomStatus,
  } = useProperty();

  if (!isDeleteRoomStatusDialogOpen || !deleteTargetRoomStatus) return null;

  const handleDelete = () => {
    deleteRoomStatus(deleteTargetRoomStatus.id);
    closeDeleteRoomStatusDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeDeleteRoomStatusDialog}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-[#e0e3e5] flex flex-col gap-4 font-body-md text-[#191c1e] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#191c1e]">Delete Room Status</h3>
            <p className="text-[13px] text-[#45464d]">This will remove the status catalogue definition.</p>
          </div>
        </div>

        <div className="p-3.5 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5] flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: deleteTargetRoomStatus.bgColor }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[14px] text-[#191c1e] truncate">
              {deleteTargetRoomStatus.name}
            </div>
            <div className="text-[12px] text-[#75859d] font-mono">
              Code: {deleteTargetRoomStatus.code} • Short: {deleteTargetRoomStatus.shortName || '--'}
            </div>
          </div>
        </div>

        {deleteTargetRoomStatus.isSystemDefault && (
          <div className="p-3 bg-[#fff8e1] border border-[#ffe082] rounded-lg text-[12.5px] text-[#795548] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#f57c00] shrink-0">warning</span>
            <span>This is a core system status. Deleting it may impact default automated housekeeping flows.</span>
          </div>
        )}

        <p className="text-[13px] text-[#45464d]">
          Are you sure you want to delete <span className="font-bold text-[#191c1e]">"{deleteTargetRoomStatus.name}"</span>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeDeleteRoomStatusDialog}
            className="px-4 py-2 text-[13px] font-semibold text-[#45464d] hover:text-[#191c1e] hover:bg-[#eceef0] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-[13px] font-semibold bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Delete Status
          </button>
        </div>
      </div>
    </div>
  );
};
