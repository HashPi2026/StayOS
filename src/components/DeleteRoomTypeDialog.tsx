import React from 'react';
import { useProperty } from '../context/PropertyContext';

export const DeleteRoomTypeDialog: React.FC = () => {
  const {
    isDeleteRoomTypeDialogOpen,
    deleteTargetRoomType,
    closeDeleteRoomTypeDialog,
    deleteRoomType,
    rooms,
    navigate,
  } = useProperty();

  if (!isDeleteRoomTypeDialogOpen || !deleteTargetRoomType) return null;

  const assignedRooms = rooms.filter((r) => r.roomTypeId === deleteTargetRoomType.id);
  const hasActiveRooms = assignedRooms.length > 0;

  const handleForceDelete = () => {
    deleteRoomType(deleteTargetRoomType.id);
    closeDeleteRoomTypeDialog();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs transition-opacity"
        onClick={closeDeleteRoomTypeDialog}
      />

      {/* Modal Card */}
      <div className="relative bg-[#ffffff] rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-[#c6c6cd]/30">
        <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[26px]">
            {hasActiveRooms ? 'warning' : 'delete'}
          </span>
        </div>

        <h3 className="text-headline-sm font-semibold text-[#191c1e] mb-2">
          {hasActiveRooms ? 'Cannot Delete Room Type' : 'Delete Room Type?'}
        </h3>

        {hasActiveRooms ? (
          <div className="space-y-3 mb-6">
            <p className="text-body-md text-[#45464d]">
              <strong className="text-[#191c1e] font-semibold">{deleteTargetRoomType.name}</strong> ({deleteTargetRoomType.code}) is currently assigned to{' '}
              <strong className="text-[#ba1a1a] font-semibold">{assignedRooms.length} active room(s)</strong> in PMS inventory.
            </p>
            <div className="p-3 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5] text-body-sm text-[#45464d]">
              <span className="font-semibold block text-[#191c1e] mb-1">Assigned Rooms:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {assignedRooms.map((r) => (
                  <span key={r.id} className="px-2 py-0.5 bg-[#ffffff] border border-[#c6c6cd] rounded font-data-mono text-[11px]">
                    Room {r.number} ({r.buildingName})
                  </span>
                ))}
              </div>
            </div>
            <p className="text-body-sm text-[#75859d]">
              Please reassign these physical rooms to another room type in the Rooms management section before deleting this specification.
            </p>
          </div>
        ) : (
          <p className="text-body-md text-[#45464d] mb-6">
            Are you sure you want to delete <strong className="text-[#191c1e]">{deleteTargetRoomType.name}</strong> ({deleteTargetRoomType.code})? This will permanently remove its rate rules and configuration from the property catalog.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={closeDeleteRoomTypeDialog}
            className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-body-md font-medium text-[#45464d] hover:bg-[#eceef0] transition-colors"
          >
            {hasActiveRooms ? 'Close' : 'Cancel'}
          </button>
          {hasActiveRooms ? (
            <button
              onClick={() => {
                closeDeleteRoomTypeDialog();
                navigate('rooms');
              }}
              className="px-4 py-2 bg-[#0058be] text-[#ffffff] rounded-lg text-body-md font-medium hover:bg-[#004ca6] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">meeting_room</span>
              Go to Rooms Management
            </button>
          ) : (
            <button
              onClick={handleForceDelete}
              className="px-4 py-2 bg-[#ba1a1a] text-[#ffffff] rounded-lg text-body-md font-medium hover:bg-[#93000a] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Room Type
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
