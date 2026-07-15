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
  handleMemberRemove,
  onMemberClick,
  searchQuery
}) => {
  const filteredMembers = members.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const userPooled = m.totalContributed !== undefined ? m.totalContributed : (pooledByUser[m.userId] || 0);
    const owes = m.owes !== undefined ? m.owes : 0;
    return (m.userName || '').toLowerCase().includes(q) ||
           (m.userEmail || '').toLowerCase().includes(q) ||
           (m.role || '').toLowerCase().includes(q) ||
           (m.customTag || '').toLowerCase().includes(q) ||
           String(userPooled).includes(q) ||
           String(owes).includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Metrics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <h3 className="text-slate-455 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 sm:mb-2">Members</h3>
          <p className="text-xl sm:text-3xl font-black text-slate-900">{members.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <h3 className="text-slate-455 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 sm:mb-2">Collected</h3>
          <p className="text-[#056449] text-xl sm:text-3xl font-black">₹{totalPooled.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <h3 className="text-slate-455 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 sm:mb-2">Pending</h3>
          <p className="text-amber-600 text-xl sm:text-3xl font-black">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Member Table Block */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100/50">
          <h3 className="font-extrabold text-slate-900">Members List</h3>
          {isAdmin && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="bg-[#056449] hover:bg-[#04523b] text-white px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              + Invite Member
            </button>
          )}
        </div>

        <div className="overflow-auto max-h-[450px] pb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Contribution</th>
                <th className="px-6 py-3">Pending</th>
                <th className="px-6 py-3">Progress</th>
                {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800">
              {filteredMembers.map(m => {
                const userPooled = m.totalContributed !== undefined ? m.totalContributed : (pooledByUser[m.userId] || 0);
                const owes = m.owes !== undefined ? m.owes : 0;
                const owed = m.owed !== undefined ? m.owed : 0;

                const isPaid = owes <= 0;
                const isUnpaid = userPooled === 0;
                const percent = Math.min((userPooled / adjustedTarget) * 100, 100);
                const clampedHue = Math.max(10, Math.min(90, percent));
                const hue = ((clampedHue - 10) / 80) * 120;
                const barColor = `hsl(${hue}, 85%, 42%)`;
                const initials = m.userName ? m.userName.substring(0, 2).toUpperCase() : 'M';

                return (
                  <tr
                    key={m.id}
                    onClick={() => onMemberClick && onMemberClick(m)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{m.userName}</div>
                          {isPaid ? (
                            <span className="inline-flex text-[9.5px] bg-emerald-50 border border-emerald-100 text-[#056449] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">
                              Paid
                            </span>
                          ) : isUnpaid ? (
                            <span className="inline-flex text-[9.5px] bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">
                              Unpaid
                            </span>
                          ) : (
                            <span className="inline-flex text-[9.5px] bg-amber-50 border border-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">
                              Partial
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-800 font-extrabold">
                      ₹{userPooled.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-amber-600 font-extrabold">
                      ₹{owes.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/30">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${percent}%`, backgroundColor: barColor }} />
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3 text-[11.5px] sm:text-xs font-bold">
                          <button
                            onClick={() => {
                              setEditMemberForm({ id: m.id, role: m.role, customTag: m.customTag || '' });
                              setShowEditMemberModal(true);
                            }}
                            className="text-[#056449] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => fetchMemberPassword(m.id, m.userName)}
                            className="text-slate-500 hover:underline"
                          >
                            Password
                          </button>
                          <button
                            onClick={() => handleMemberRemove(m.id)}
                            className="text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
