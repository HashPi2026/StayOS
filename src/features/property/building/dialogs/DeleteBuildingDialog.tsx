import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteBuildingDialog: React.FC = () => {
  const {
    isDeleteDialogOpen,
    deleteTargetBuilding,
    closeDeleteDialog,
  } = useProperty();

  if (!isDeleteDialogOpen || !deleteTargetBuilding) return null;

  return (
    <div
      className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
      id="delete-dialog"
      onClick={closeDeleteDialog}
    >
      <div
        className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#c6c6cd]/50 animate-in zoom-in-95 duration-200"
        id="delete-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[26px]">warning</span>
          </div>

          <h3 className="font-semibold text-title-sm text-[#191c1e] mb-2">
            Cannot Delete Building
          </h3>

          <p className="text-body-md text-[#45464d] leading-relaxed mb-4">
            <strong className="text-[#191c1e]">{deleteTargetBuilding.name}</strong> ({deleteTargetBuilding.code}) cannot be deleted because it contains referenced floors and active inventory rooms. Please remove or reassign all floors before deleting this building.
          </p>

          <div className="w-full bg-[#f2f4f6] rounded-lg p-3 text-left text-body-sm text-[#45464d] border border-[#e0e3e5] space-y-1 mb-2">
            <div className="flex justify-between">
              <span>Total Floors:</span>
              <span className="font-semibold text-[#191c1e]">{deleteTargetBuilding.totalFloors} Floors</span>
            </div>
            <div className="flex justify-between">
              <span>Active Rooms:</span>
              <span className="font-semibold text-[#191c1e]">{deleteTargetBuilding.totalRooms} Rooms</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-[#f2f4f6] border-t border-[#e0e3e5] flex justify-center">
          <button
            className="w-full px-4 py-2.5 bg-[#000000] text-white text-label-uppercase rounded-lg hover:bg-[#333333] transition-all shadow-sm cursor-pointer"
            onClick={closeDeleteDialog}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
