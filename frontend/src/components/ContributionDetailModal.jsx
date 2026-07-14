import React from 'react';

export const ContributionDetailModal = ({ isOpen, onClose, contribution, members }) => {
  if (!isOpen || !contribution) return null;

  const member = members.find(m => m.userId === contribution.userId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div>
            <span className={`text-[9px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              contribution.status === 'Pending' 
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : 'bg-emerald-50 border-emerald-100 text-[#056449]'
            }`}>
              {contribution.status || 'Verified'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Contribution Record</h3>
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
          {/* Amount Badge */}
          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-center">
            <span className="text-[10px] text-[#056449] font-bold uppercase tracking-wider block mb-1">Deposited Amount</span>
            <span className="text-2xl font-black text-[#056449]">+₹{Number(contribution.amount).toLocaleString()}</span>
          </div>

          {/* Details list */}
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Member</span>
              <span className="text-slate-800">{member?.userName || 'Member'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Payment Method</span>
              <span className="text-slate-800">{contribution.method || 'UPI'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Payment Status</span>
              <span className="text-slate-800">{contribution.status || 'Verified'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Date & Time</span>
              <span className="text-slate-800">
                {contribution.date ? new Date(contribution.date).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Note Section */}
          {contribution.note && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deposit Details / Reference</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                {contribution.note}
              </div>
            </div>
          )}
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
