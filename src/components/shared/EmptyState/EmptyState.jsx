import React from 'react';
export const EmptyState = ({ icon = 'inbox', title, description, action, }) => {
    return (<div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-[#c6c6cd]/30">
      <div className="w-14 h-14 rounded-full bg-[#f2f4f6] flex items-center justify-center mb-4 text-[#75859d]">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-[#191c1e] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#75859d] max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>);
};
