import React from 'react';

export const MembersTab = ({
  members,
  isAdmin,
  totalPooled,
  totalPending,
  adjustedTarget,
  pooledByUser,
  setEditMemberForm,
  setShowEditMemberModal,
  setShowMemberModal,
  fetchMemberPassword,
  handleMemberRemove
}) => {
  return (
    <div className="space-y-8">
      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <h3 className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-2">Total Members</h3>
          <p className="text-3xl font-black text-slate-900">{members.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <h3 className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-2">Total Collected</h3>
          <p className="text-[#056449] text-3xl font-black">₹{totalPooled.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <h3 className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-2">Total Pending</h3>
          <p className="text-amber-600 text-3xl font-black">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isAdmin && (
          <div
            onClick={() => setShowMemberModal(true)}
            className="bg-transparent border-2 border-dashed border-slate-200 hover:border-[#056449]/45 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#056449] flex items-center justify-center border border-emerald-100/50 mb-3 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs mb-1">Invite Member</h4>
            <p className="text-[10px] text-slate-455 font-semibold max-w-[180px] leading-relaxed">
              Add a new participant to SplitWise Travel and pool budgets.
            </p>
          </div>
        )}
        {members.map(m => {
          const userPooled = m.totalContributed !== undefined ? m.totalContributed : (pooledByUser[m.userId] || 0);
          const owes = m.owes !== undefined ? m.owes : 0;
          const owed = m.owed !== undefined ? m.owed : 0;

          const isPaid = owes <= 0;
          const isUnpaid = userPooled === 0;
          const percent = Math.min((userPooled / adjustedTarget) * 100, 100);

          return (
            <div key={m.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] relative group hover:border-[#056449]/15 transition duration-150">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-150 border border-slate-200/50 flex items-center justify-center text-slate-700 font-extrabold text-xs uppercase shadow-sm select-none">
                    {m.userName ? m.userName.substring(0, 2) : 'M'}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-800">{m.userName}</div>
                    {isPaid ? (
                      <span className="inline-block text-[8px] bg-emerald-50 border border-emerald-100 text-[#056449] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
                        Paid
                      </span>
                    ) : isUnpaid ? (
                      <span className="inline-block text-[8px] bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
                        Unpaid
                      </span>
                    ) : (
                      <span className="inline-block text-[8px] bg-amber-50 border border-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
                        Partial
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditMemberForm({ id: m.id, role: m.role, customTag: m.customTag || '' });
                      setShowEditMemberModal(true);
                    }}
                    className="text-slate-400 hover:text-slate-650 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4 text-xs font-semibold text-slate-500">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Contribution</div>
                  <div className="text-slate-800 font-extrabold mt-1">₹{userPooled.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pending</div>
                  <div className="text-amber-600 font-extrabold mt-1">₹{owes.toLocaleString()}</div>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/30">
                <div className="bg-[#056449] h-full rounded-full" style={{ width: `${percent}%` }} />
              </div>

              {isAdmin && (
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4 text-[10px] font-bold">
                  <button onClick={() => fetchMemberPassword(m.id, m.userName)} className="text-[#056449] hover:underline">
                    Show Password
                  </button>
                  <button onClick={() => handleMemberRemove(m.id)} className="text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
