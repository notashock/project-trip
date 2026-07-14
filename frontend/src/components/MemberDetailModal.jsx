import React from 'react';

const ROLE_NAMES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CONTRIBUTOR: 'Viewer (Contributor)'
};

export const MemberDetailModal = ({ isOpen, onClose, member, pooledByUser, adjustedTarget }) => {
  if (!isOpen || !member) return null;

  const totalContributed = member.totalContributed !== undefined ? member.totalContributed : (pooledByUser[member.userId] || 0);
  const target = adjustedTarget || 0;
  const pending = Math.max(target - totalContributed, 0);
  const percent = Math.min((totalContributed / (target || 1)) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-150 border border-slate-200/50 flex items-center justify-center text-slate-700 font-extrabold text-sm uppercase shadow-sm">
              {member.userName ? member.userName.substring(0, 2) : 'M'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{member.userName}</h3>
              <span className="inline-block text-[8px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">
                {ROLE_NAMES[member.role] || member.role}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1 min-h-0">
          {/* Member Meta */}
          <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold">
            <div>
              <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Email</span>
              <span className="text-slate-800 break-all">{member.email || 'No email provided'}</span>
            </div>
            {member.customTag && (
              <div>
                <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Role Tag / Description</span>
                <span className="text-[#056449] font-extrabold">{member.customTag}</span>
              </div>
            )}
          </div>

          {/* Budget Progress Summary */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Individual Budget Status</h4>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Deposited</span>
                <span className="text-emerald-600 font-extrabold">₹{totalContributed.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Pending</span>
                <span className="text-amber-600 font-extrabold">₹{pending.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Individual Target</span>
                <span className="text-slate-800 font-extrabold">₹{target.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[9px] font-extrabold uppercase tracking-wider">
                <span className="text-slate-400">Target Progress</span>
                <span className="text-[#056449]">{percent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/30">
                <div className="bg-[#056449] h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
