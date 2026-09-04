import React from 'react';
import { useProperty } from '@/src/context/PropertyContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProperty();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-6 z-[90] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-[13px] font-medium animate-in slide-in-from-bottom-2 fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-[#131b2e] text-white border-white/10'
              : toast.type === 'error'
              ? 'bg-[#ba1a1a] text-white border-white/10'
              : 'bg-[#000000] text-white border-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success'
              ? 'check_circle'
              : toast.type === 'error'
              ? 'error'
              : 'info'}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
