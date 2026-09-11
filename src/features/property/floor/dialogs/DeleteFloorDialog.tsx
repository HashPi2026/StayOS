import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteFloorDialog: React.FC = () => {
  const {
    isDeleteFloorDialogOpen,
    deleteTargetFloor,
    closeDeleteFloorDialog,
    rooms,
    deleteFloor,
  } = useProperty();

  if (!isDeleteFloorDialogOpen || !deleteTargetFloor) return null;

  // Check if any rooms exist on this floor
  const assignedRooms = rooms.filter(
    (r) =>
      r.buildingId === deleteTargetFloor.buildingId &&
      (r.floor === deleteTargetFloor.floorNumber ||
        deleteTargetFloor.name.toLowerCase().includes(String(r.floor)))
  );

  const hasRooms = assignedRooms.length > 0;

  const handleConfirmDelete = () => {
    deleteFloor(deleteTargetFloor.id);
    closeDeleteFloorDialog();
  };

  return (
    <div
      className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in"
      id="delete-floor-dialog"
      onClick={closeDeleteFloorDialog}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#c6c6cd]/50 animate-scale-in"
        id="delete-floor-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        {hasRooms ? (
          /* Protected Deletion Warning */
          <>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>

              <h3 className="font-bold text-[18px] text-[#191c1e] mb-2">
                Cannot Delete Floor
              </h3>

              <p className="text-[14px] text-[#45464d] leading-relaxed mb-4">
                <strong className="text-[#191c1e]">{deleteTargetFloor.name}</strong> in{' '}
                <strong className="text-[#191c1e]">{deleteTargetFloor.buildingName}</strong> cannot be deleted because it contains {assignedRooms.length} active room{assignedRooms.length > 1 ? 's' : ''}. Please reassign or delete these rooms first.
              </p>

              <div className="w-full bg-[#f2f4f6] rounded-lg p-3 text-left text-[13px] text-[#45464d] border border-[#e0e3e5] space-y-2 mb-2">
                <div className="flex justify-between font-medium">
                  <span>Assigned Rooms:</span>
                  <span className="text-[#191c1e] font-semibold">{assignedRooms.length} Rooms</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#e0e3e5]">
                  {assignedRooms.slice(0, 8).map((rm) => (
                    <span
                      key={rm.id}
                      className="px-2 py-0.5 bg-white border border-[#c6c6cd] text-[#191c1e] text-[12px] font-mono rounded"
                    >
                      Room {rm.number}
                    </span>
                  ))}
                  {assignedRooms.length > 8 && (
                    <span className="text-[11px] text-[#75859d] self-center">
                      +{assignedRooms.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#e0e3e5] flex justify-center">
              <button
                className="w-full px-4 py-2.5 bg-[#000000] text-white text-[13px] font-semibold uppercase tracking-wider rounded-lg hover:bg-[#333333] transition-all shadow-sm cursor-pointer"
                onClick={closeDeleteFloorDialog}
              >
                Acknowledge
              </button>
            </div>
          </>
        ) : (
          /* Confirmation Deletion */
          <>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              </div>

              <h3 className="font-bold text-[18px] text-[#191c1e] mb-2">
                Delete Floor
              </h3>

              <p className="text-[14px] text-[#45464d] leading-relaxed mb-3">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#191c1e]">{deleteTargetFloor.name}</strong> from{' '}
                <strong className="text-[#191c1e]">{deleteTargetFloor.buildingName}</strong>?
              </p>

              <p className="text-[12px] text-[#75859d]">
                This action is irreversible and will remove this level from property routing.
              </p>
            </div>

            <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#e0e3e5] flex items-center justify-end gap-3">
              <button
                onClick={closeDeleteFloorDialog}
                className="px-4 py-2 bg-white border border-[#c6c6cd] text-[#191c1e] text-[13px] font-semibold rounded-lg hover:bg-[#e0e3e5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm"
              >
                Delete Floor
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
