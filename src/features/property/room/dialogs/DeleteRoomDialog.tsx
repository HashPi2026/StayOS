import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteRoomDialog: React.FC = () => {
  const {
    isDeleteRoomDialogOpen,
    deleteTargetRoom,
    closeDeleteRoomDialog,
    deleteRoom,
  } = useProperty();

  if (!isDeleteRoomDialogOpen || !deleteTargetRoom) return null;

  const handleConfirmDelete = () => {
    deleteRoom(deleteTargetRoom.id);
    closeDeleteRoomDialog();
  };

  const isOccupied = deleteTargetRoom.status === 'occupied';

  return (
    <div
      className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in"
      id="delete-room-dialog"
      onClick={closeDeleteRoomDialog}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#c6c6cd]/50 animate-scale-in"
        id="delete-room-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[26px]">
              {isOccupied ? 'warning' : 'delete_forever'}
            </span>
          </div>

          <h3 className="font-bold text-[18px] text-[#191c1e] mb-2">
            {isOccupied ? 'Caution: Room is Occupied' : 'Delete Room'}
          </h3>

          <p className="text-[14px] text-[#45464d] leading-relaxed mb-3">
            Are you sure you want to delete{' '}
            <strong className="text-[#191c1e]">{deleteTargetRoom.name || `Room ${deleteTargetRoom.number}`}</strong> ({deleteTargetRoom.shortName || deleteTargetRoom.number}) from{' '}
            <strong className="text-[#191c1e]">{deleteTargetRoom.buildingName}</strong>?
          </p>

          <div className="w-full bg-[#f2f4f6] rounded-lg p-3 text-left text-[13px] text-[#45464d] border border-[#e0e3e5] space-y-1.5 mb-2">
            <div className="flex justify-between">
              <span>Room Type:</span>
              <span className="text-[#191c1e] font-semibold">{deleteTargetRoom.roomTypeName}</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span className="text-[#191c1e] font-medium">{deleteTargetRoom.buildingName}, Floor {deleteTargetRoom.floor}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="capitalize font-medium text-[#191c1e]">{deleteTargetRoom.status}</span>
            </div>
          </div>

          <p className="text-[12px] text-[#75859d]">
            This action will remove the room from active inventory and update PMS capacity.
          </p>
        </div>

        <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#e0e3e5] flex items-center justify-end gap-3">
          <button
            onClick={closeDeleteRoomDialog}
            className="px-4 py-2 bg-white border border-[#c6c6cd] text-[#191c1e] text-[13px] font-semibold rounded-lg hover:bg-[#e0e3e5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-[#ba1a1a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm cursor-pointer"
          >
            Delete Room
          </button>
        </div>
      </div>
    </div>
  );
};
