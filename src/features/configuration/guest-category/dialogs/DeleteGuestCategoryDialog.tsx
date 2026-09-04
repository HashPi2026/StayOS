import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const DeleteGuestCategoryDialog: React.FC = () => {
  const {
    isDeleteGuestCategoryDialogOpen,
    deleteTargetGuestCategory,
    closeDeleteGuestCategoryDialog,
    deleteGuestCategory,
  } = useProperty();

  if (!isDeleteGuestCategoryDialogOpen || !deleteTargetGuestCategory) return null;

  const handleDelete = () => {
    deleteGuestCategory(deleteTargetGuestCategory.id);
    closeDeleteGuestCategoryDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeDeleteGuestCategoryDialog}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 z-10 border border-[#e0e3e5] animate-scaleUp">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#191c1e]" id="delete-guest-category-title">
              Delete Guest Category?
            </h3>
            <p className="text-sm text-[#45464d] mt-1.5 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[#191c1e]">
                "{deleteTargetGuestCategory.name}" ({deleteTargetGuestCategory.shortName})
              </span>
              ? Existing guest profiles and historical reservations associated with this category will retain their text label, but this category tag will no longer be available for new guest assignments.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#e0e3e5]">
          <button
            type="button"
            id="cancel-delete-guest-category-btn"
            onClick={closeDeleteGuestCategoryDialog}
            className="px-4 py-2 border border-[#c6c6cd] text-[#45464d] text-sm font-medium rounded-lg hover:bg-[#e0e3e5] active:scale-[0.98] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-guest-category-btn"
            onClick={handleDelete}
            className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};
